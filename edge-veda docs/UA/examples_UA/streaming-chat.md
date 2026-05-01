---
title: "Streaming chat"
description: "Створення responsive multi-turn chat через streaming API Edge Veda."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Streaming chat

Цей приклад показує, як створити responsive chat, у якому tokens з'являються під час generation.

Використовуйте цей приклад, коли потрібно:

- показувати довгі answers поступово;
- залишати UI responsive, поки model працює;
- зберігати multi-turn context;
- відстежувати довжину conversation через `turnCount` і `contextUsage`.

Для one-shot generation без partial tokens використовуйте [Basic text generation](basic-text-generation.md).

## Що створюється

Ви створите chat flow, який:

1. ініціалізує `EdgeVeda`;
2. створює `ChatSession`;
3. надсилає user messages через `sendStream()`;
4. додає кожен `chunk.token` до поточного assistant message;
5. відстежує conversation state;
6. дає користувачу reset chat, не вивантажуючи model.

## Один streaming prompt

Для найпростішого streaming-випадку викликайте `generateStream()` напряму на `EdgeVeda`.

```dart
import 'dart:io';
import 'package:edge_veda/edge_veda.dart';

Future<void> streamSinglePrompt(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    await for (final chunk in edgeVeda.generateStream(
      'Explain recursion briefly.',
    )) {
      stdout.write(chunk.token);
    }
  } finally {
    await edgeVeda.dispose();
  }
}
```

Цей pattern підходить для одноразової streaming response. Для пам'яті між turns використовуйте `ChatSession`.

## Multi-turn chat session

`ChatSession` зберігає conversation context і може stream-ити responses.

```dart
import 'dart:io';
import 'package:edge_veda/edge_veda.dart';

Future<void> runStreamingChat(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 4096,
      useGpu: true,
    ));

    final session = ChatSession(
      edgeVeda: edgeVeda,
      preset: SystemPromptPreset.coder,
    );

    await for (final chunk in session.sendStream(
      'Write hello world in Python.',
    )) {
      stdout.write(chunk.token);
    }

    stdout.writeln();

    await for (final chunk in session.sendStream(
      'Now convert it to Rust.',
    )) {
      stdout.write(chunk.token);
    }

    stdout.writeln();
    stdout.writeln('Turns: ${session.turnCount}');
    stdout.writeln('Context: ${(session.contextUsage * 100).toInt()}%');

    session.reset();
  } finally {
    await edgeVeda.dispose();
  }
}
```

## Model для Flutter UI

Мінімальний chat UI може використовувати просту message model.

```dart
class ChatMessage {
  ChatMessage({
    required this.role,
    required this.text,
  });

  final String role;
  final String text;

  ChatMessage copyWith({String? text}) {
    return ChatMessage(
      role: role,
      text: text ?? this.text,
    );
  }
}
```

## Flutter streaming example

```dart
import 'package:flutter/material.dart';
import 'package:edge_veda/edge_veda.dart';

class StreamingChatPage extends StatefulWidget {
  const StreamingChatPage({
    super.key,
    required this.modelPath,
  });

  final String modelPath;

  @override
  State<StreamingChatPage> createState() => _StreamingChatPageState();
}

class _StreamingChatPageState extends State<StreamingChatPage> {
  final EdgeVeda _edgeVeda = EdgeVeda();
  final TextEditingController _controller = TextEditingController();

  ChatSession? _session;
  final List<ChatMessage> _messages = [];

  bool _isReady = false;
  bool _isStreaming = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initRuntime();
  }

  Future<void> _initRuntime() async {
    try {
      await _edgeVeda.init(EdgeVedaConfig(
        modelPath: widget.modelPath,
        contextLength: 4096,
        useGpu: true,
      ));

      _session = ChatSession(
        edgeVeda: _edgeVeda,
        preset: SystemPromptPreset.coder,
      );

      if (!mounted) return;
      setState(() {
        _isReady = true;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not initialize chat: $error';
      });
    }
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    final session = _session;

    if (!_isReady || _isStreaming || text.isEmpty || session == null) {
      return;
    }

    _controller.clear();

    setState(() {
      _isStreaming = true;
      _error = null;
      _messages.add(ChatMessage(role: 'user', text: text));
      _messages.add(ChatMessage(role: 'assistant', text: ''));
    });

    final assistantIndex = _messages.length - 1;
    final buffer = StringBuffer();

    try {
      await for (final chunk in session.sendStream(text)) {
        buffer.write(chunk.token);

        if (!mounted) return;
        setState(() {
          _messages[assistantIndex] = _messages[assistantIndex].copyWith(
            text: buffer.toString(),
          );
        });
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Streaming failed: $error';
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isStreaming = false;
      });
    }
  }

  void _resetChat() {
    _session?.reset();

    setState(() {
      _messages.clear();
      _error = null;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _edgeVeda.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = _session;
    final contextText = session == null
        ? ''
        : 'Turns: ${session.turnCount} · Context: ${(session.contextUsage * 100).toInt()}%';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Streaming chat'),
        actions: [
          TextButton(
            onPressed: _isStreaming ? null : _resetChat,
            child: const Text('Reset'),
          ),
        ],
      ),
      body: Column(
        children: [
          if (contextText.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(contextText),
            ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];

                return Align(
                  alignment: message.role == 'user'
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: SelectableText(message.text),
                    ),
                  ),
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      enabled: _isReady && !_isStreaming,
                      decoration: const InputDecoration(
                        hintText: 'Ask something...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _isReady && !_isStreaming ? _send : null,
                    child: Text(_isStreaming ? '...' : 'Send'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

## Streaming behavior

У streaming UI:

- створюйте assistant message до старту stream;
- додавайте кожен token до того самого message;
- не перебудовуйте дорогі widgets на кожен token без потреби;
- блокуйте повторний send, поки stream активний;
- додайте cancellation path, якщо цього потребує product;
- викликайте `reset()`, коли користувач хоче нову conversation.

## Context management

`ChatSession` відстежує активну conversation. Використовуйте:

- `turnCount`, щоб показувати кількість active user/assistant turns;
- `contextUsage`, щоб бачити, коли context model заповнюється;
- `reset()`, щоб очистити chat, але залишити model loaded.

Production UI має попереджати або summarise-ити conversation, коли context usage високий.

## Error handling

| Failure | Ймовірна причина | Рекомендована дія |
| --- | --- | --- |
| Stream зупинився рано | Model досягла stop condition або runtime pressure | Зберегти partial text і показати retry action. |
| Повторювані tokens | Prompt або chat template не підходить | Спробувати model-specific preset або змінити system prompt. |
| Повільний first token | Model load або cold worker | Ініціалізувати runtime до першого user message. |
| UI jank | Забагато state updates | Буферизувати tokens і оновлювати UI batches. |
| Context overflow | Conversation надто довга | Summarize, reset або створити new session. |

## Production notes

Для production chat:

- зберігайте лише messages, які потрібні product;
- не записуйте sensitive user prompts у logs;
- показуйте model limitations у UI;
- додайте stop button для довгих responses;
- використовуйте окремі presets для coding, support і general chat;
- тестуйте long sessions на real device, а не лише simulator.

## Наступні кроки

Після успішного запуску:

1. додайте markdown rendering для assistant output;
2. додайте stop button;
3. додайте chat persistence, якщо це потрібно product;
4. додайте system-prompt presets для кожної feature;
5. перейдіть до [Smart home control](smart-home-control.md) для tool calling.
