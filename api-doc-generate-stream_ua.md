---
title: "EdgeVeda.generateStream()"
description: "Сторінка API reference для методу generateStream() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generateStream()`

> Генерує текст як stream token chunks для responsive on-device AI experiences.

Використовуйте `generateStream()`, коли застосунку потрібно показувати model output під час генерації, скасовувати request mid-generation або реагувати на per-token confidence metadata.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generateStream()` |
| Category | Core inference / Streaming text generation |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | Yes |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Stream<TokenChunk> generateStream(
  String prompt, {
  GenerateOptions? options,
  CancelToken? cancelToken,
});
```

## What it does

`generateStream()` передає prompt локальній моделі та повертає Dart `Stream<TokenChunk>`. Stream видає token chunks у процесі генерації. Final chunk має `isFinal == true` і порожній token, що сигналізує completion.

Метод використовує persistent `StreamingWorker`. Якщо worker не активний, метод spawn-ить його і завантажує configured model. Якщо worker already active, він reuse-иться.

## When to use it

Використовуйте `generateStream()`, коли потрібно:

- оновлювати chat або assistant UI token by token;
- дозволити користувачу cancel generation mid-stream;
- обробляти generated output incrementally;
- відстежувати per-token confidence або cloud-handoff signals.

Не використовуйте цей метод, коли:

- потрібен лише final text і простіший код; використовуйте `generate()`;
- інший stream уже active на тому самому `EdgeVeda` instance;
- runtime не ініціалізовано через `init()`;
- потрібна model-level multi-turn memory; використовуйте `ChatSession`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.init(config)` успішно завершився;
- prompt не порожній;
- на тому самому `EdgeVeda` instance немає іншого active `generateStream()` call;
- `GenerateOptions` values валідні;
- app готовий обробляти stream errors;
- UI коректно обробляє final chunks і cancellation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `prompt` | `String` | Yes | — | Input text для локальної моделі. | Не має бути empty. |
| `options` | `GenerateOptions?` | No | `const GenerateOptions()` | Керує token limit, sampling, grammar constraints, JSON mode і confidence tracking. | Значення валідовуються перед start streaming. |
| `cancelToken` | `CancelToken?` | No | `null` | Optional cancellation token для stop generation mid-stream. | `cancel()` зупиняє token generation, коли worker observe-ить cancellation. |

## Returns

`Stream<TokenChunk>`

Stream emits token chunks, доки не буде final chunk, cancellation або error.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `token` | `String` | Token text content для цього chunk. Final chunk зазвичай має empty token. |
| `index` | `int` | Token index у generated sequence. |
| `isFinal` | `bool` | `true`, коли stream завершився. |
| `confidence` | `double?` | Per-token confidence score, якщо confidence tracking enabled. |
| `needsCloudHandoff` | `bool` | Чи recommended cloud handoff на цьому етапі. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `GenerationException` | Prompt empty, streaming already active, worker spawn fails, worker init fails або streaming fails. | Валідуйте input, serialize generation calls, retry after cancellation або reinitialize runtime. |
| `ConfigurationException` | Invalid `GenerateOptions` values. | Обмежте значення в UI і валідуйте options before stream. |
| Stream errors | Runtime failures передаються через stream. | Обгорніть `await for` у `try/catch` і оновіть UI state on failure. |
| Cancellation state | User cancels generation through `CancelToken`. | Трактуйте cancellation як нормальну user action; partial output можна зберегти. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain what on-device AI means.',
)) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
```

## Production-style example

```dart
Future<String> streamIntoBuffer(EdgeVeda edgeVeda, String prompt) async {
  final cancelToken = CancelToken();
  final buffer = StringBuffer();

  try {
    await for (final chunk in edgeVeda.generateStream(
      prompt,
      options: const GenerateOptions(
        maxTokens: 256,
        temperature: 0.4,
        topP: 0.9,
      ),
      cancelToken: cancelToken,
    )) {
      if (chunk.isFinal) {
        break;
      }

      buffer.write(chunk.token);

      if (chunk.needsCloudHandoff) {
        // Optional: surface low-confidence state to the app.
      }
    }

    return buffer.toString();
  } on GenerationException catch (error) {
    throw Exception('Streaming generation failed: ${error.message}');
  }
}
```

## Streaming example with cancellation

```dart
final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Write a short story about a robot gardener.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (chunk.isFinal) {
    break;
  }

  stdout.write(chunk.token);

  if (shouldStopGeneration()) {
    cancelToken.cancel();
    break;
  }
}
```

## Behavior notes

- `generateStream()` потребує успішно ініціалізований `EdgeVeda` instance.
- На одному instance одночасно може бути тільки один active streaming operation.
- Метод lazy створює й ініціалізує persistent `StreamingWorker`, якщо потрібно.
- Worker використовує `EdgeVedaConfig`, збережений під час `init()`.
- Метод emits `TokenChunk` objects і використовує final chunk з `isFinal == true`.
- Runtime errors передаються як stream errors.
- Cancellation listener видаляється у `finally` path.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| First stream after init | Може включати worker spawn і model load time. | Покажіть "loading model" або "starting" state. |
| Subsequent streams | Можуть reuse active worker. | Тримайте runtime alive для multi-request sessions. |
| `maxTokens` | Прямо впливає на duration і energy use. | Задавайте task-specific limits. |
| UI update frequency | UI update на кожен token може бути дорогим. | Batch UI updates, якщо rendering стає costly. |
| Concurrent workloads | Streaming single-active per `EdgeVeda` instance. | Queue user requests або створюйте controlled runtime instances. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Основний сценарій для streaming text generation. |
| GGUF embedding model | No | Для embeddings використовуйте `embed()`. |
| Tool-capable chat model | Partial | Для automatic tool loops краще `ChatSession.sendWithTools()`. |
| Vision-language model | No for this method | Для image input використовуйте vision APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated streaming. |
| iOS simulator | Partial | CPU-only, повільніший, не репрезентативний для performance. |
| macOS | Yes / package surface | Перевірте model paths і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target devices перед performance claims. |
| Web | No | Native runtime dependency не орієнтована на web. |

## Privacy and security

- Input data processed: prompt text і generation options.
- Network access during inference: none.
- Local storage used: local model file і runtime worker state.
- Sensitive data considerations: не логуйте live user prompts або token chunks, якщо це не потрібно й небезпечно.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Streaming already in progress` | Інший stream active на тому самому `EdgeVeda` instance. | Дочекайтесь completion, cancel active stream або queue next request. |
| No tokens appear for a while | First call spawn-ить worker і load-ить model. | Покажіть progress text і тестуйте release/profile builds на device. |
| Stream stops early | `CancelToken` was cancelled або model hit stop sequence. | Перевірте app cancellation logic і `stopSequences`. |
| Stream throws an error | Worker spawn/init failed або native runtime failed. | Catch stream errors, log details і reinitialize if needed. |
| UI stutters | Rendering updates на кожен token занадто часті. | Batch token updates або throttle UI refresh. |

## Related APIs

- [`EdgeVeda.init()`](./init.md) — ініціалізує runtime configuration перед streaming.
- [`EdgeVeda.generate()`](./generate.md) — збирає stream output і повертає complete response.
- [`CancelToken`](../core/cancel-token.md) — скасовує streaming generation.
- [`ChatSession.sendStream()`](../chat-session/send-stream.md) — стрімить у multi-turn chat session.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Public export file: `flutter/lib/edge_veda.dart`
- Generated Dart API: `EdgeVeda.generateStream()`
- Example usage: `flutter/QUICKSTART.md`
- Related worker: `StreamingWorker`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Перед публікацією перевірте:

- [ ] Signature відповідає current source code.
- [ ] Cancellation behavior validated.
- [ ] Single-active-stream limitation still accurate.
- [ ] `TokenChunk` fields відповідають `types.dart`.
- [ ] Examples compile.
- [ ] Stream errors і UI-state handling described clearly.
- [ ] Platform notes updated for current release.
