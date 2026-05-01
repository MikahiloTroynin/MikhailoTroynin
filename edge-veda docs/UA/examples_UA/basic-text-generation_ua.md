---
title: "Basic text generation"
description: "Створення повної text response через Edge Veda у Flutter-застосунку."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Basic text generation

Цей приклад показує найкоротший корисний шлях від локальної model до згенерованої text response.

Використовуйте цей приклад, коли потрібно:

- підтвердити, що Edge Veda може завантажити model на device;
- виконати один prompt і дочекатися повної answer;
- створити просту кнопку `Generate` перед streaming або chat history.

Для streaming output використовуйте [Streaming chat](streaming-chat.md).

## Що створюється

Ви створите невеликий flow, який:

1. ініціалізує `EdgeVeda`;
2. завантажує локальну text model з `modelPath`;
3. надсилає один prompt через `generate()`;
4. показує `response.text`;
5. викликає `dispose()`, коли runtime більше не потрібен.

## Передумови

Перед початком:

- додайте `edge_veda` до `pubspec.yaml`;
- налаштуйте target platform;
- скопіюйте compatible text model у storage на device;
- визначте локальний `modelPath`;
- тестуйте на physical device для реалістичної performance.

## Мінімальний приклад

```dart
import 'package:edge_veda/edge_veda.dart';

Future<void> runBasicTextGeneration(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    final response = await edgeVeda.generate(
      'Explain on-device AI in one short paragraph.',
    );

    print(response.text);
  } finally {
    await edgeVeda.dispose();
  }
}
```

## Приклад Flutter UI

Наступний приклад обгортає той самий flow у простий `StatefulWidget`.

```dart
import 'package:flutter/material.dart';
import 'package:edge_veda/edge_veda.dart';

class BasicTextGenerationPage extends StatefulWidget {
  const BasicTextGenerationPage({
    super.key,
    required this.modelPath,
  });

  final String modelPath;

  @override
  State<BasicTextGenerationPage> createState() =>
      _BasicTextGenerationPageState();
}

class _BasicTextGenerationPageState extends State<BasicTextGenerationPage> {
  final EdgeVeda _edgeVeda = EdgeVeda();
  final TextEditingController _promptController = TextEditingController(
    text: 'Write a friendly welcome message for a Flutter app.',
  );

  bool _isReady = false;
  bool _isGenerating = false;
  String? _result;
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
        contextLength: 2048,
        useGpu: true,
      ));

      if (!mounted) return;
      setState(() {
        _isReady = true;
        _error = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not initialize Edge Veda: $error';
      });
    }
  }

  Future<void> _generate() async {
    final prompt = _promptController.text.trim();

    if (!_isReady || prompt.isEmpty || _isGenerating) {
      return;
    }

    setState(() {
      _isGenerating = true;
      _result = null;
      _error = null;
    });

    try {
      final response = await _edgeVeda.generate(prompt);

      if (!mounted) return;
      setState(() {
        _result = response.text;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Generation failed: $error';
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isGenerating = false;
      });
    }
  }

  @override
  void dispose() {
    _promptController.dispose();
    _edgeVeda.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canGenerate = _isReady && !_isGenerating;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Basic text generation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _promptController,
              minLines: 2,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'Prompt',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: canGenerate ? _generate : null,
              child: Text(_isGenerating ? 'Generating...' : 'Generate'),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            if (_result != null)
              Expanded(
                child: SingleChildScrollView(
                  child: SelectableText(_result!),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

## Очікувана поведінка

Коли model успішно завантажено, кнопка стає активною. Після натискання **Generate** застосунок чекає завершення generation і показує повну response.

Цей приклад не передає partial tokens. UI отримує лише фінальний result.

## Коли використовувати blocking generation

Використовуйте `generate()`, коли:

- response коротка;
- користувачу не потрібно бачити partial output;
- потрібна проста request/response поведінка;
- result буде оброблено перед показом;
- UI може показати loading state до завершення.

Не використовуйте blocking generation для довгих chat answers, code output або будь-якої response, де важлива perceived latency. Для цього краще `generateStream()` або `ChatSession.sendStream()`.

## Prompt design

Перший prompt має бути явним і обмеженим:

```text
Explain on-device AI in one short paragraph.
```

Уникайте надто широких prompts у smoke tests:

```text
Tell me everything about AI.
```

Обмежений prompt допомагає перевірити, що model повертає text, response релевантна, UI обробляє output length, а latency прийнятна.

## Error handling

| Failure | Ймовірна причина | Рекомендована дія |
| --- | --- | --- |
| Model не завантажується | Неправильний `modelPath` або file недоступний | Показати setup error і залогувати path resolution step. |
| Generation повільна | Model завелика для device | Взяти меншу model або зменшити context size. |
| App зависає | Робота занадто прив'язана до UI state | Тримати runtime calls async і показувати progress. |
| Empty output | Prompt нечіткий або model зупинилась рано | Повторити з чіткішим prompt і перевірити model compatibility. |
| Out-of-memory pressure | Model/context завеликі | Зменшити model size, context length або concurrent workloads. |

## Production notes

Для production-застосунків:

- ініціалізуйте runtime один раз на feature area, а не на кожен button click;
- тримайте `EdgeVeda` за service або repository class;
- викликайте `dispose()`, коли feature закрита або scheduler вивантажує worker;
- не записуйте sensitive prompts або generated output у logs за замовчуванням;
- показуйте user-facing recovery messages для model load і generation errors;
- задокументуйте очікувану model family і file format для свого app.

## Наступні кроки

Після успішного запуску:

1. замініть prompt на реальний product prompt;
2. додайте кращий loading state;
3. додайте cancellation для довгих operations;
4. винесіть runtime setup у shared service;
5. перейдіть до [Streaming chat](streaming-chat.md), коли потрібен token-by-token output.
