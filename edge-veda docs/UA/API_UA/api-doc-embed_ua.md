---
title: "EdgeVeda.embed()"
description: "Сторінка API reference для методу embed() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.embed()`

> Обчислює text embedding vector для одного input string за допомогою ініціалізованої локальної embedding model.

`embed()` перевіряє, що `EdgeVeda` instance ініціалізований, валідовує input text, завантажує configured GGUF model у background isolate, викликає native embedding API, копіює L2-normalized embedding vector у Dart memory і повертає `EmbeddingResult`. Використовуйте реальну embedding model; generative model може дати семантично некорисні vectors.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `embed()` |
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
Future<EmbeddingResult> embed(String text);
```

## What it does

`embed()` перевіряє, що `EdgeVeda` instance ініціалізований, валідовує input text, завантажує configured GGUF model у background isolate, викликає native embedding API, копіює L2-normalized embedding vector у Dart memory і повертає `EmbeddingResult`. Використовуйте реальну embedding model; generative model може дати семантично некорисні vectors.

## When to use it

Використовуйте `embed()`, коли потрібно:

- перетворити один query або document chunk на vector;
- шукати в локальному `VectorIndex` за semantic similarity;
- будувати або запитувати on-device RAG pipeline;
- порівнювати два тексти через vector similarity.

Не використовуйте цей метод, коли:

- потрібно embed-ити багато текстів за раз; використовуйте `embedBatch()`;
- current model є chat/generation model, а не embedding model;
- потрібна natural-language generation; використовуйте `generate()` або `generateStream()`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.init(config)` успішно завершився;
- `config.modelPath` вказує на GGUF embedding model;
- `text` не порожній;
- downstream vector index використовує ті самі embedding dimensions.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `text` | `String` | Yes | — | Текст для embedding. | Не має бути empty; тримайте chunks у межах model context length. |

## Returns

`Future<EmbeddingResult>` — future, що повертає один embedding result.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `embedding` | `List<double>` | L2-normalized vector, скопійований у Dart memory. |
| `tokenCount` | `int` | Кількість tokens у input text. |
| `dimensions` | `int` | Convenience property з кількістю vector dimensions. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `EmbeddingException` | `text` empty або native embedding fails. | Валідуйте input і підтвердьте model compatibility. |
| `ModelLoadException` | Configured model не може бути loaded for embedding. | Перевірте `modelPath`, model type і memory budget. |
| `InitializationException` / `EdgeVedaException` | Runtime не initialized або SDK-level failure. | Спочатку викличте `init()` і обробіть typed exceptions. |
| `MemoryException` | Model/context перевищує memory limits. | Use smaller embedding model або lower context/memory settings. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final result = await edgeVeda.embed('The quick brown fox');

print('Dimensions: ${result.dimensions}');
print('Tokens: ${result.tokenCount}');
print('Vector head: ${result.embedding.take(5)}');
```

## Production-style example

```dart
Future<EmbeddingResult> embedQuery(EdgeVeda edgeVeda, String query) async {
  final normalized = query.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('query must not be empty');
  }

  try {
    return await edgeVeda.embed(normalized);
  } on EmbeddingException catch (error) {
    throw Exception('Could not embed query: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `embed()` не повертає stream.

## Behavior notes

- `embed()` потребує core runtime, ініціалізований через `init()`.
- Native work виконується в background isolate, щоб не блокувати UI.
- Native model context створюється для call і звільняється після копіювання embedding.
- Returned embedding — Dart-owned `List<double>`.
- Embedding dimensions залежать від selected model і мають збігатися з target `VectorIndex`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model type | Embedding models зазвичай менші й швидші за chat models. | Для RAG використовуйте dedicated embedding model. |
| Chunk length | Longer text збільшує tokenization і compute time. | Розбивайте documents на consistent semantic chunks. |
| Single-call model load | `embed()` load-ить model для одного input. | Для indexing багатьох chunks використовуйте `embedBatch()`. |
| Vector dimensions | Higher dimensions збільшують index size і search cost. | Не змішуйте різні embedding models в одному index. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF embedding model | Yes | Основний supported use case. |
| GGUF chat/instruct LLM | Not recommended | Може давати meaningless embeddings. |
| Vision-language model | No | Для image understanding використовуйте vision APIs. |
| Stable Diffusion model | No | Для цього є image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути повільним. |
| macOS | Yes / package surface | Перевірте file access і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не web-oriented. |

## Privacy and security

- Input data processed: input text.
- Network access during inference: none.
- Local storage used: local model file і optional app-managed vector index.
- Sensitive data considerations: embeddings можуть кодувати private content; захищайте persisted vectors і metadata.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Text cannot be empty` | Передано empty string. | Trim and validate input. |
| Vector dimensions do not match index | Index створено для іншої embedding model. | Rebuild index з однією consistent model. |
| Poor retrieval quality | Wrong model type або poor chunking. | Use real embedding model і tune chunking. |
| Slow indexing | Repeated `embed()` load-ить model для кожного text. | Використовуйте `embedBatch()`. |

## Related APIs

- `EdgeVeda.embedBatch()` — embeds multiple texts with one model load/unload cycle.
- `VectorIndex.add()` — stores embedding vectors for local similarity search.
- `RagPipeline.query()` — runs retrieval-augmented generation using embeddings.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.embed()`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- Empty-text behavior все ще `EmbeddingException`.
- Result fields відповідають `EmbeddingResult`.
- Example компілюється з real embedding model.
- Model compatibility notes reviewed by maintainer.
