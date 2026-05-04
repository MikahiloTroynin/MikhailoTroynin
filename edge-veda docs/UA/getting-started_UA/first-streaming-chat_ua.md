---
title: "Перший streaming chat"
description: "Як створити мінімальний multi-turn streaming chat з ChatSession та Edge Veda."
sidebar_position: 4
status: "draft"
section: "getting-started"
lang: "uk"
last_reviewed: "2026-04-29"
---

# Перший streaming chat

Цей гайд показує, як створити мінімальний multi-turn chat screen з Edge Veda.

Використовуйте цю сторінку після того, як завершили:

1. [`overview.md`](./overview.md)
2. [`installation.md`](./installation.md)
3. [`first-text-generation.md`](./first-text-generation.md)

Попередній гайд використовує `EdgeVeda.generateStream()` напряму. Цей гайд додає `ChatSession`, який зберігає стан розмови між повідомленнями та форматує повідомлення через chat template.

## Що ви створите

Ви створите Flutter-екран, який:

- завантажує або повторно використовує локальну chat model;
- ініціалізує `EdgeVeda`;
- створює `ChatSession`;
- надсилає повідомлення користувача через `sendStream()`;
- потоково показує assistant tokens в UI;
- зберігає conversation context між повідомленнями;
- скидає чат без перевантаження моделі.

## Коли використовувати `ChatSession`

Використовуйте `ChatSession`, коли модель має пам’ятати попередні повідомлення в межах однієї розмови.

Використовуйте прямий `EdgeVeda.generateStream()`, коли потрібно:

- один prompt;
- stateless completion;
- маленький utility request;
- нижчий рівень streaming primitive.

Використовуйте `ChatSession.sendStream()`, коли потрібно:

- multi-turn chat;
- system prompts;
- model-specific chat formatting;
- context usage tracking;
- conversation reset.

## Базовий chat flow

![gs-first-streaming-chat](mermaid-diagrams/gs-first-streaming-chat.png)

## Мінімальний console example

Цей приклад передбачає, що `edgeVeda` вже ініціалізований.

```dart
final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);

await for (final chunk in session.sendStream('Write hello world in Python')) {
  stdout.write(chunk.token);
}

await for (final chunk in session.sendStream('Now convert it to Rust')) {
  stdout.write(chunk.token);
}

print('Turns: ${session.turnCount}');
print('Context: ${(session.contextUsage * 100).toInt()}%');
```

Друге повідомлення може посилатися на першу відповідь, тому що session зберігає conversation context.

## Замініть `lib/main.dart`

Нижче — простий chat UI. Приклад навмисно компактний, щоб його можна було використати як quickstart sample.

```dart
import 'package:edge_veda/edge_veda.dart';
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class ChatMessage {
  const ChatMessage({required this.role, required this.text});

  final String role;
  final String text;
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Edge Veda Streaming Chat',
      home: StreamingChatScreen(),
    );
  }
}

class StreamingChatScreen extends StatefulWidget {
  const StreamingChatScreen({super.key});

  @override
  State<StreamingChatScreen> createState() => _StreamingChatScreenState();
}

class _StreamingChatScreenState extends State<StreamingChatScreen> {
  final _edgeVeda = EdgeVeda();
  final _modelManager = ModelManager();
  final _controller = TextEditingController();

  ChatSession? _session;
  final List<ChatMessage> _messages = [];

  bool _isReady = false;
  bool _isGenerating = false;
  String _status = 'Initializing...';

  @override
  void initState() {
    super.initState();
    _setup();
  }

  Future<void> _setup() async {
    try {
      setState(() => _status = 'Downloading model...');

      final modelPath = await _modelManager.downloadModel(
        ModelRegistry.llama32_1b,
      );

      final device = DeviceProfile.detect();
      final scored = ModelAdvisor.score(
        model: ModelRegistry.llama32_1b,
        device: device,
        useCase: UseCase.chat,
      );

      setState(() => _status = 'Loading model...');

      await _edgeVeda.init(EdgeVedaConfig(
        modelPath: modelPath,
        contextLength: scored.recommendedConfig.contextLength,
        numThreads: scored.recommendedConfig.numThreads,
        useGpu: true,
      ));

      _session = ChatSession(
        edgeVeda: _edgeVeda,
        preset: SystemPromptPreset.coder,
      );

      if (!mounted) return;
      setState(() {
        _status = 'Ready';
        _isReady = true;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _status = 'Initialization error: $error';
        _isReady = false;
      });
    }
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    final session = _session;

    if (text.isEmpty || session == null || _isGenerating) return;

    _controller.clear();

    setState(() {
      _messages.add(ChatMessage(role: 'user', text: text));
      _messages.add(const ChatMessage(role: 'assistant', text: ''));
      _isGenerating = true;
      _status = 'Generating...';
    });

    final assistantIndex = _messages.length - 1;

    try {
      await for (final chunk in session.sendStream(text)) {
        if (!mounted) return;

        if (!chunk.isFinal) {
          setState(() {
            final current = _messages[assistantIndex];
            _messages[assistantIndex] = ChatMessage(
              role: current.role,
              text: current.text + chunk.token,
            );
          });
        }
      }

      if (!mounted) return;
      setState(() {
        _status =
            'Ready · turns: ${session.turnCount} · context: ${(session.contextUsage * 100).toInt()}%';
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _messages[assistantIndex] = ChatMessage(
          role: 'assistant',
          text: 'Generation error: $error',
        );
        _status = 'Generation error';
      });
    } finally {
      if (mounted) {
        setState(() => _isGenerating = false);
      }
    }
  }

  void _resetChat() {
    _session?.reset();

    setState(() {
      _messages.clear();
      _status = 'Ready · chat reset';
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _edgeVeda.dispose();
    _modelManager.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Streaming chat'),
        actions: [
          TextButton(
            onPressed: _isReady && !_isGenerating ? _resetChat : null,
            child: const Text('Reset'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Text(_status),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final message = _messages[index];
                  final isUser = message.role == 'user';

                  return Align(
                    alignment:
                        isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      padding: const EdgeInsets.all(12),
                      constraints: const BoxConstraints(maxWidth: 320),
                      decoration: BoxDecoration(
                        color: isUser
                            ? Colors.blue.shade100
                            : Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(message.text.isEmpty
                          ? '...'
                          : message.text),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    enabled: _isReady && !_isGenerating,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      hintText: 'Ask something...',
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isReady && !_isGenerating ? _send : null,
                  child: Text(_isGenerating ? '...' : 'Send'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

## Запустіть чат

Запустіть на фізичному iPhone у release mode:

```bash
flutter run --release
```

Перший запуск може тривати довше через download і model loading. Наступні запуски мають повторно використовувати cached model.

## Як streaming оновлює UI

Ключова частина — цей loop:

```dart
await for (final chunk in session.sendStream(text)) {
  if (!chunk.isFinal) {
    setState(() {
      assistantText += chunk.token;
    });
  }
}
```

Кожен chunk містить частковий token або token fragment. Додавайте його до assistant message й оновлюйте UI.

## Скидання розмови

Використовуйте `session.reset()`, коли користувач хоче почати нову розмову.

```dart
session.reset();
```

Reset очищає conversation history. Він не розвантажує модель із runtime, тому наступна відповідь не має вимагати повного model reload.

## Моніторинг context usage

Показуйте `contextUsage` у development builds, щоб бачити, коли чат стає довгим:

```dart
final percent = (session.contextUsage * 100).toInt();
print('Context used: $percent%');
```

Якщо context usage стає надто високим, скиньте session або використовуйте вбудовану context management поведінку SDK, якщо вона доступна у вашій версії.

## Типові помилки

| Помилка | Чому це проблема | Як виправити |
| --- | --- | --- |
| Створювати новий `ChatSession` для кожного повідомлення | Модель не зберігає context розмови. | Створюйте одну session на одну розмову. |
| Викликати `sendStream()` двічі одночасно | Concurrent writes можуть зламати UI state або дати неочікуваний output. | Вимикайте кнопку Send під час generation. |
| Оновлювати UI після dispose | Flutter може кинути lifecycle error. | Перевіряйте `mounted` в async code. |
| Використовувати неправильний chat template | Output може повторюватися або ламатися. | Узгодьте model family з template format. |
| Тестувати швидкість у debug mode | Debug mode не показує реальну inference speed. | Використовуйте `flutter run --release` або `flutter run --profile`. |

## Наступний крок

Перейдіть до [`model-setup.md`](./model-setup.md), щоб вибрати, завантажити, імпортувати й перевірити локальні моделі.
