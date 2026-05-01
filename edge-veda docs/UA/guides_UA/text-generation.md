---
title: "Text generation"
description: "Згенеруйте повну on-device відповідь через Edge Veda Dart SDK."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Text generation

`Text generation` — найпростіший спосіб запустити LLM через Edge Veda. Використовуйте цей підхід, коли застосунку потрібна готова відповідь перед оновленням UI: коротке пояснення, summary, classification, rewriting або one-shot відповідь assistant.

Для token-by-token UI використовуйте [`streaming-generation.md`](./streaming-generation.md). Для діалогу зі станом використовуйте [`chat-sessions.md`](./chat-sessions.md).

## Що ви створите

У цьому guide показано, як:

- ініціалізувати `EdgeVeda` з локальним model;
- викликати `generate()` з user prompt;
- прочитати фінальний `response.text`;
- обробити типові runtime failures;
- зрозуміти, коли blocking generation є правильним pattern.

## Prerequisites

Перед використанням `text generation` перевірте, що:

- Flutter app містить `edge_veda`;
- model file існує на device;
- model сумісний із target platform;
- iOS deployment target налаштовано для iPhone;
- великі models перевірені на real hardware, а не лише в simulator.

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Basic example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Поясни on-device AI одним абзацом.',
);

print(response.text);
```

## Як це працює

`generate()` передає `prompt` у поточний ініціалізований model і повертає response object після завершення generation. Model залишається завантаженим у Edge Veda runtime після виклику, тому наступний request не потребує повторного завантаження model, якщо runtime не disposed або не відбулося memory pressure eviction.

Використовуйте цей pattern, коли app може чекати на фінальну відповідь. Якщо user має бачити output під час generation, використовуйте `generateStream()`.

## Prompt design

Тримайте `prompt` конкретним і обмеженим. На mobile devices довгі prompts збільшують evaluation time і memory pressure.

Добрий `prompt`:

```text
Підсумуй цей support ticket у трьох bullets. Вкажи user-visible problem, likely cause і next action.
```

Ризиковий `prompt`:

```text
Проаналізуй усе і дай всі можливі деталі.
```

Другий `prompt` занадто широкий. Він може створити довгий output, витратити більше context і зробити latency менш контрольованою.

## Production-style wrapper

```dart
class LocalTextGenerator {
  LocalTextGenerator(this.edgeVeda);

  final EdgeVeda edgeVeda;

  Future<String> summarizeTicket(String ticketText) async {
    final prompt = '''
Підсумуй цей support ticket у трьох bullets:
- user-visible problem
- likely cause
- recommended next action

Ticket:
$ticketText
''';

    try {
      final response = await edgeVeda.generate(prompt);
      return response.text.trim();
    } catch (error, stackTrace) {
      // stackTrace можна передати у внутрішню diagnostics систему, якщо це дозволено.
      throw StateError('Text generation failed: $error');
    }
  }
}
```

## Optional confidence check

Якщо app використовує confidence-based fallback, передайте `GenerateOptions` з `confidenceThreshold`. Коли average confidence нижче threshold, response може позначити, що потрібен cloud handoff або human review.

```dart
final response = await edgeVeda.generate(
  'Поясни quantum computing для beginner.',
  options: GenerateOptions(confidenceThreshold: 0.3),
);

if (response.needsCloudHandoff) {
  // Перенаправте запит у cloud model, покажіть warning або попросіть user уточнити prompt.
  print('Low confidence: ${response.avgConfidence}');
}

print(response.text);
```

Використовуйте цей pattern лише тоді, коли product має визначений fallback path. Не надсилайте private user data у cloud API без явної product-level згоди.

## Parameters and related objects

| Name | Type | Опис |
| --- | --- | --- |
| `modelPath` | `String` | Шлях до local model file. |
| `contextLength` | `int` | Максимальне context window під час runtime initialization. |
| `useGpu` | `bool` | Вмикає GPU acceleration там, де це підтримується. |
| `prompt` | `String` | User або system-generated instruction для `generate()`. |
| `GenerateOptions` | `Object` | Optional generation controls, доступні у поточній SDK version. |
| `response.text` | `String` | Фінальний generated text. |
| `response.avgConfidence` | `double?` | Average confidence, якщо увімкнено confidence tracking. |
| `response.needsCloudHandoff` | `bool` | Показує, чи confidence нижче налаштованого threshold. |

## Коли використовувати `generate()`

Використовуйте `generate()` для:

- коротких answers;
- summary;
- classification;
- extraction tasks без strict JSON;
- background jobs, де partial output не потрібний;
- tests, де простіше перевірити один final response.

Не використовуйте `generate()` для:

- chat UI, який має оновлюватися token by token;
- довгих assistant responses;
- tool-calling flows;
- structured JSON extraction, що має відповідати schema;
- workloads, де важливі cancellation і backpressure.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Larger models підвищують quality, але збільшують memory і startup time. | Починайте з small model і вимірюйте на target device. |
| Context length | Larger context збільшує memory usage. | Використовуйте найменший context, достатній для task. |
| Prompt size | Long prompts збільшують evaluation latency. | Приберіть repeated instructions і irrelevant context. |
| GPU usage | GPU може покращити throughput на supported devices. | Вмикайте `useGpu` на validated iOS/macOS hardware. |
| Concurrent workloads | Кілька AI tasks конкурують за memory і thermal budget. | Використовуйте scheduler для app, що поєднує text, vision, speech або RAG. |

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Model не завантажується | Неправильний `modelPath` або unsupported model format. | Перевірте, що model існує і відповідає compatibility guidance. |
| App працює повільно | Prompt занадто довгий, model занадто великий або device має thermal pressure. | Зменште prompt size, context length або model size. |
| Output занадто загальний | Prompt не має constraints або examples. | Додайте task, format, audience і length. |
| Output не є valid JSON | `generate()` не enforce-ить schema. | Використовуйте `sendStructured()`. |
| User чекає занадто довго | Blocking generation не показує progress. | Перейдіть на `generateStream()`. |

## Privacy notes

`Text generation` виконується локально з loaded on-device model. Prompt і generated response — sensitive application data:

- не log-уйте private prompts у release builds;
- не persist-іть generated output без очікування user;
- не надсилайте low-confidence prompts у cloud fallback без consent;
- redact-іть secrets перед передаванням developer logs або tickets у prompt.

## Next steps

- Використовуйте [`streaming-generation.md`](./streaming-generation.md) для token-by-token UI.
- Використовуйте [`chat-sessions.md`](./chat-sessions.md) для multi-turn state.
- Використовуйте [`structured-output.md`](./structured-output.md) для schema-constrained JSON.
- Використовуйте [`embeddings.md`](./embeddings.md) для similarity search і RAG.
