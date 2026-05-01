---
title: "EdgeVeda.generate()"
description: "Сторінка API reference для методу generate() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generate()`

> Генерує повну текстову відповідь із prompt, збираючи токени з persistent streaming worker.

Використовуйте `generate()`, коли застосунку потрібна одна фінальна текстова відповідь, а не token-by-token оновлення UI.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generate()` |
| Category | Core inference / Text generation |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No; для token streaming використовуйте `generateStream()` |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<GenerateResponse> generate(
  String prompt, {
  GenerateOptions? options,
  Duration? timeout,
});
```

## What it does

`generate()` передає prompt локальній моделі та повертає повний `GenerateResponse`. Усередині метод іде через той самий persistent `StreamingWorker`, що й `generateStream()`, збирає emitted tokens у buffer і повертає final text з generation metadata.

Метод асинхронний і виконує inference on device. Network call не потрібен.

## When to use it

Використовуйте `generate()`, коли потрібно:

- отримати повну відповідь перед оновленням UI;
- виконати короткі assistant, summarization, classification або transformation tasks;
- застосувати timeout до blocking generation request;
- уникнути ручної обробки stream у простих flows.

Не використовуйте цей метод, коли:

- потрібен token-by-token rendering у chat UI; використовуйте `generateStream()`;
- інший stream уже active на тому самому `EdgeVeda` instance;
- потрібна multi-turn conversation state; розгляньте `ChatSession`;
- потрібні structured tool-calling loops; розгляньте `ChatSession.sendWithTools()`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.init(config)` успішно завершився;
- prompt не порожній;
- вибрана модель підходить для prompt style і expected output;
- `GenerateOptions` values у supported ranges;
- застосунок може обробити latency до повної відповіді, особливо для великого `maxTokens`;
- на цьому runtime instance немає active streaming operation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `prompt` | `String` | Yes | — | Input text для локальної моделі. | Не має бути empty. Тримайте prompt у межах configured context length. |
| `options` | `GenerateOptions?` | No | `const GenerateOptions()` | Керує sampling, token limit, system prompt, JSON/grammar behavior і confidence tracking. | Невалідні значення можуть кинути `ConfigurationException`. |
| `timeout` | `Duration?` | No | `null` | Optional maximum duration для complete generation call. | Якщо перевищено, метод кидає `GenerationException`. |

### Common `GenerateOptions` fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `systemPrompt` | `String?` | `null` | Optional system-level instruction. |
| `maxTokens` | `int` | `512` | Максимальна кількість generated tokens. |
| `temperature` | `double` | `0.7` | Sampling randomness. Нижче значення — більш deterministic output. |
| `topP` | `double` | `0.9` | Nucleus sampling threshold. |
| `topK` | `int` | `40` | Обмежує sampling топ-K кандидатами. |
| `repeatPenalty` | `double` | `1.1` | Зменшує повтори в output. |
| `stopSequences` | `List<String>` | `[]` | Stop sequences для early termination. |
| `jsonMode` | `bool` | `false` | Запитує valid JSON output. |
| `grammarStr` | `String?` | `null` | Optional GBNF grammar для constrained decoding. |
| `grammarRoot` | `String?` | `null` | Optional root rule для grammar. |
| `confidenceThreshold` | `double` | `0.0` | Вмикає confidence tracking і cloud-handoff signaling, якщо більше нуля. |

## Returns

`Future<GenerateResponse>`

Future повертає complete generated response.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `text` | `String` | Повний generated text content. |
| `promptTokens` | `int` | Кількість prompt tokens, reported by response. |
| `completionTokens` | `int` | Кількість generated tokens, collected from stream. |
| `latencyMs` | `int?` | Total generation duration у milliseconds. |
| `avgConfidence` | `double?` | Average confidence across generated tokens, якщо confidence tracking enabled. |
| `needsCloudHandoff` | `bool` | Чи модель сигналізує, що може бути потрібен cloud handoff. |
| `tokensPerSecond` | `double?` | Derived throughput, якщо доступні latency і token counts. |
| `totalTokens` | `int` | Prompt і completion tokens разом. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `GenerationException` | Prompt empty, generation timeout, worker failure або streaming conflict. | Валідуйте input, уникайте concurrent streams, retry with lower `maxTokens`, або покажіть failure state. |
| `ConfigurationException` | Одне або кілька `GenerateOptions` значень за межами allowed ranges. | Обмежте UI controls і валідуйте options перед викликом. |
| `InitializationException` / `EdgeVedaException` | Runtime не ініціалізований або сталася SDK-level failure. | Спочатку викличте `init()` і обробіть typed exceptions. |
| Stream-propagated errors | Оскільки `generate()` споживає `generateStream()`, stream errors можуть проявлятися як generation failures. | Логуйте underlying details і відновлюйтесь на application level. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in two sentences.',
);

print(response.text);
```

## Production-style example

```dart
Future<String> summarizeNote(EdgeVeda edgeVeda, String note) async {
  if (note.trim().isEmpty) {
    throw ArgumentError('note must not be empty');
  }

  try {
    final response = await edgeVeda.generate(
      'Summarize this note for a product manager:\n\n$note',
      options: const GenerateOptions(
        maxTokens: 180,
        temperature: 0.3,
        topP: 0.9,
      ),
      timeout: const Duration(seconds: 30),
    );

    return response.text.trim();
  } on GenerationException catch (error) {
    throw Exception('Text generation failed: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `generate()` повертає complete response. Для streaming використовуйте:

```dart
await for (final chunk in edgeVeda.generateStream('Tell me a short story')) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
```

## Behavior notes

- `generate()` потребує успішно ініціалізований `EdgeVeda` instance.
- Метод перевіряє, що `prompt` не порожній.
- Метод internally використовує `generateStream()` і буферизує всі non-final token chunks.
- Final response включає measured latency і completion token count.
- Оскільки метод залежить від `generateStream()`, на одному `EdgeVeda` instance має бути лише одна active streaming operation.
- Confidence і cloud-handoff metadata залежать від selected `GenerateOptions`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| `maxTokens` | Більші значення збільшують latency і battery use. | Задавайте найменше acceptable value для task. |
| Model size | Більші моделі можуть покращити якість, але збільшують memory і latency. | Використовуйте Model Advisor або device-specific defaults. |
| Context length | Довші prompts витрачають context і можуть збільшити compute time. | Тримайте prompts concise і summarize long context. |
| GPU / Metal usage | Покращує throughput на supported Apple devices. | Тестуйте на physical devices у release/profile mode. |
| Timeout | Запобігає довгим blocking calls. | Використовуйте `timeout` для user-facing interactions. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Основний сценарій — natural language responses. |
| GGUF embedding model | No for text generation | Для embeddings використовуйте `embed()`. |
| Tool-calling model | Partial | Для multi-round tool execution використовуйте `ChatSession.sendWithTools()`. |
| Vision-language model | No for this method | Для image inputs використовуйте vision APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для sustained on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути значно повільнішим. |
| macOS | Yes / package surface | Перевірте model paths і sandbox access. |
| Android | Partial / validation pending | Валідуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не орієнтована на web. |

## Privacy and security

- Input data processed: prompt text і generation options.
- Network access during inference: none.
- Local storage used: local model file і runtime cache/state.
- Sensitive data considerations: не логуйте user prompts або full generated outputs, якщо вони можуть містити private data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Prompt cannot be empty` | Empty або whitespace-only prompt. | Валідуйте prompt перед `generate()`. |
| Generation times out | Large prompt, high `maxTokens`, slow device або thermal pressure. | Зменште `maxTokens`, спростіть prompt, використайте streaming або збільште timeout. |
| Repeated або low-quality output | Неправильний chat template/model або зависока sampling randomness. | Використайте `ChatSession` з correct template або зменште `temperature`. |
| Worker error | Persistent streaming worker не зміг spawn/load model. | Reinitialize runtime або restart app-level session. |
| UI appears frozen | App чекає full response перед UI update. | Використайте `generateStream()` для progressive rendering. |

## Related APIs

- [`EdgeVeda.init()`](./init.md) — ініціалізує runtime перед generation.
- [`EdgeVeda.generateStream()`](./generate-stream.md) — стрімить tokens для progressive UI.
- [`ChatSession.sendStream()`](../chat-session/send-stream.md) — працює з multi-turn chat state.
- [`ChatSession.sendWithTools()`](../chat-session/send-with-tools.md) — працює з tool-calling workflows.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Public export file: `flutter/lib/edge_veda.dart`
- Generated Dart API: `EdgeVeda.generate()`
- Example usage: `flutter/QUICKSTART.md`
- Related worker: `StreamingWorker`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Перед публікацією перевірте:

- [ ] Signature відповідає current source code.
- [ ] `GenerateOptions` defaults і validation ranges актуальні.
- [ ] Return fields відповідають `GenerateResponse`.
- [ ] Minimal example компілюється.
- [ ] Timeout behavior підтверджено по source/tests.
- [ ] Concurrency limitations задокументовано коректно.
- [ ] Privacy notes відповідають project policy.
