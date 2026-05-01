---
title: "EdgeVeda.embedBatch()"
description: "API reference page for the embedBatch() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.embedBatch()`

> Computes embedding vectors for multiple text strings in one model load/unload cycle.

`embedBatch()` validates that the `EdgeVeda` instance is initialized, then embeds all input texts in one background-isolate operation. The model is loaded once, reused for every text, and freed after the batch completes. Results are returned in the same order as the input list.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `embedBatch()` |
| Category | Embeddings / RAG |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
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

`embedBatch()` validates that the `EdgeVeda` instance is initialized, then embeds all input texts in one background-isolate operation. The model is loaded once, reused for every text, and freed after the batch completes. Results are returned in the same order as the input list.

## When to use it

Use `embedBatch()` when you need to:

- build a local vector index from document chunks;
- embed notes, pages, records, or search candidates in bulk;
- prepare a data set for on-device RAG;
- improve throughput compared with repeated `embed()` calls.

Do not use this method when:

- you only need one query vector; use `embed()`;
- you need generated text; use `generate()` or `generateStream()`;
- the configured model is not an embedding model;
- you need guaranteed per-item progress UI before confirming current callback behavior.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.init(config)` has completed successfully;
- `config.modelPath` points to a GGUF embedding model;
- input strings are pre-trimmed and chunked to fit the model context length;
- the app has enough memory for the model and result list.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `texts` | `List<String>` | Yes | — | Text items to embed. | Empty list returns `[]`. Review empty-string behavior before publishing. |
| `onProgress` | `void Function(int completed, int total)?` | No | `null` | Optional progress callback declared by the API. | Public docs describe per-text progress; confirm actual invocation during source review. |

## Returns

`Future<List<EmbeddingResult>>` — a future that resolves to embedding results in input order.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `embedding` | `List<double>` | L2-normalized vector copied into Dart memory. |
| `tokenCount` | `int` | Number of tokens in the corresponding input text. |
| `dimensions` | `int` | Convenience property returning vector dimensions. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `EmbeddingException` | Native embedding fails for one text. | Validate inputs, split long chunks, and retry the failed batch or item. |
| `ModelLoadException` | The configured model cannot be loaded. | Verify `modelPath`, model type, and memory budget. |
| `InitializationException` / `EdgeVedaException` | Runtime is not initialized or SDK-level failure occurs. | Call `init()` first and handle typed exceptions. |
| `MemoryException` | Batch/model exceeds memory limits. | Reduce batch size or use a smaller embedding model. |

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

Not applicable. `embedBatch()` does not emit a stream.

## Behavior notes

- `embedBatch()` requires the core runtime initialized with `init()`.
- Empty input list returns an empty result list.
- The whole batch runs in one background isolate.
- The native model context is created once and reused for all texts.
- Results preserve input order.
- Review note: confirm `onProgress` callback behavior against current source before documenting UI guarantees.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Batch size | Larger batches reduce load overhead but increase result memory. | Use moderate batches when indexing large corpora. |
| Chunk length | Longer chunks increase embedding latency. | Use consistent chunking with overlap where needed. |
| Model load reuse | One load per batch is faster than one load per text. | Prefer `embedBatch()` for indexing workflows. |
| Vector persistence | Persisting many vectors increases storage use. | Store metadata compactly and protect private content. |

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
| iOS device | Yes | Primary validated target for on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be slower. |
| macOS | Yes / package surface | Validate file access and sandbox behavior. |
| Android | Partial / validation pending | Test on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: list of text strings.
- Network access during inference: none.
- Local storage used: local model file and any app-managed vector index.
- Sensitive data considerations: stored vectors and metadata may reveal semantic information from private documents.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Returns `[]` | Input list is empty. | Check upstream chunking and filtering logic. |
| Batch fails partway | One input may be malformed, too long, or unsupported. | Validate and chunk inputs before embedding. |
| High memory use | Batch is too large or vectors are high-dimensional. | Reduce batch size or choose a smaller embedding model. |
| Progress UI does not update | Callback behavior needs source verification. | Do not depend on progress UI until implementation is confirmed. |

## Related APIs

- `EdgeVeda.embed()` — embeds one text string.
- `VectorIndex.add()` — stores vectors for local search.
- `RagPipeline.query()` — uses embeddings for retrieval-augmented generation.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.embedBatch()`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- Empty list and empty string behavior are documented correctly.
- `onProgress` behavior is confirmed against source.
- Result ordering is confirmed.
- Examples compile with a real embedding model.
