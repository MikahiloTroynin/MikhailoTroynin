---
title: "EdgeVeda.embedBatch()"
description: "Сторінка API reference для методу embedBatch() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.embedBatch()`

> Обчислює embedding vectors для кількох text strings за один model load/unload cycle.

`embedBatch()` перевіряє, що `EdgeVeda` instance ініціалізований, і embed-ить усі input texts в одній background-isolate operation. Model load-иться один раз, reuse-иться для кожного text і звільняється після завершення batch. Results повертаються в тому самому порядку, що й input list.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `embedBatch()` |
| Category | Embeddings / RAG |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<List<EmbeddingResult>> embedBatch(
  List<String> texts, {
  void Function(int completed, int total)? onProgress,
});
```

## What it does

`embedBatch()` перевіряє, що `EdgeVeda` instance ініціалізований, і embed-ить усі input texts в одній background-isolate operation. Model load-иться один раз, reuse-иться для кожного text і звільняється після завершення batch. Results повертаються в тому самому порядку, що й input list.

## When to use it

Використовуйте `embedBatch()`, коли потрібно:

- побудувати local vector index з document chunks;
- embed-ити notes, pages, records або search candidates bulk-ом;
- підготувати data set для on-device RAG;
- покращити throughput порівняно з repeated `embed()` calls.

Не використовуйте цей метод, коли:

- потрібен лише один query vector; використовуйте `embed()`;
- потрібен generated text; використовуйте `generate()` або `generateStream()`;
- configured model не є embedding model;
- потрібна гарантована per-item progress UI до підтвердження callback behavior.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.init(config)` успішно завершився;
- `config.modelPath` вказує на GGUF embedding model;
- input strings pre-trimmed і chunked до model context length;
- app має достатньо memory для model і result list.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `texts` | `List<String>` | Yes | — | Text items для embedding. | Empty list повертає `[]`. Перед публікацією review empty-string behavior. |
| `onProgress` | `void Function(int completed, int total)?` | No | `null` | Optional progress callback у public API. | Public docs описують per-text progress; підтвердьте actual invocation during source review. |

## Returns

`Future<List<EmbeddingResult>>` — future, що повертає embedding results у input order.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `embedding` | `List<double>` | L2-normalized vector copied into Dart memory. |
| `tokenCount` | `int` | Number of tokens in the corresponding input text. |
| `dimensions` | `int` | Convenience property returning vector dimensions. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `EmbeddingException` | Native embedding fails для одного text. | Validate inputs, split long chunks і retry failed batch/item. |
| `ModelLoadException` | Configured model не може бути loaded. | Перевірте `modelPath`, model type і memory budget. |
| `InitializationException` / `EdgeVedaException` | Runtime не initialized або SDK-level failure. | Спочатку викличте `init()` і обробіть typed exceptions. |
| `MemoryException` | Batch/model перевищує memory limits. | Reduce batch size або use smaller embedding model. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final results = await edgeVeda.embedBatch([
  'Flutter is a UI framework.',
  'Dart is a programming language.',
  'Edge Veda runs AI models on device.',
]);

print('Embedded ${results.length} texts');
```

## Production-style example

```dart
Future<List<EmbeddingResult>> embedChunks(
  EdgeVeda edgeVeda,
  List<String> chunks,
) async {
  final cleanChunks = chunks.map((c) => c.trim()).where((c) => c.isNotEmpty).toList();
  if (cleanChunks.isEmpty) return [];

  try {
    return await edgeVeda.embedBatch(
      cleanChunks,
      onProgress: (completed, total) {
        print('Embedding progress: $completed / $total');
      },
    );
  } on EmbeddingException catch (error) {
    throw Exception('Batch embedding failed: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `embedBatch()` не повертає stream.

## Behavior notes

- `embedBatch()` потребує core runtime, ініціалізований через `init()`.
- Empty input list повертає empty result list.
- Увесь batch виконується в одному background isolate.
- Native model context створюється один раз і reuse-иться для всіх texts.
- Results preserve input order.
- Review note: confirm `onProgress` callback behavior against current source before UI guarantees.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Batch size | Larger batches зменшують load overhead, але збільшують result memory. | Для великих corpora використовуйте moderate batches. |
| Chunk length | Longer chunks збільшують embedding latency. | Use consistent chunking з overlap where needed. |
| Model load reuse | One load per batch швидше, ніж one load per text. | Для indexing workflows використовуйте `embedBatch()`. |
| Vector persistence | Persisting many vectors збільшує storage use. | Store metadata compactly і protect private content. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF embedding model | Yes | Primary supported use case. |
| GGUF chat/instruct LLM | Not recommended | Can produce meaningless embeddings. |
| Vision-language model | No | Use vision APIs for image understanding. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути повільним. |
| macOS | Yes / package surface | Перевірте file access і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не web-oriented. |

## Privacy and security

- Input data processed: list of text strings.
- Network access during inference: none.
- Local storage used: local model file і app-managed vector index.
- Sensitive data considerations: stored vectors і metadata можуть розкривати semantic information з private documents.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Returns `[]` | Input list is empty. | Перевірте upstream chunking/filtering logic. |
| Batch fails partway | Один input може бути malformed, too long або unsupported. | Validate and chunk inputs before embedding. |
| High memory use | Batch too large або vectors high-dimensional. | Reduce batch size або choose smaller embedding model. |
| Progress UI does not update | Callback behavior needs source verification. | Не залежте від progress UI, доки implementation не підтверджено. |

## Related APIs

- `EdgeVeda.embed()` — embeds one text string.
- `VectorIndex.add()` — stores vectors for local search.
- `RagPipeline.query()` — uses embeddings for retrieval-augmented generation.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.embedBatch()`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- Empty list і empty string behavior documented correctly.
- `onProgress` behavior confirmed against source.
- Result ordering confirmed.
- Examples compile with a real embedding model.
