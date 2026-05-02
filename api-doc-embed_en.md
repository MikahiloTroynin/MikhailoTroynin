---
title: "EdgeVeda.embed()"
description: "API reference page for the embed() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.embed()`

> Computes a text embedding vector for one input string using the initialized local embedding model.

`embed()` validates that the `EdgeVeda` instance is initialized, validates the input text, loads the configured GGUF model in a background isolate, calls the native embedding API, copies the L2-normalized embedding vector into Dart memory, and returns an `EmbeddingResult`. Use a real embedding model; using a generative model can produce meaningless embeddings.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `embed()` |
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
Future<EmbeddingResult> embed(String text);
```

## What it does

`embed()` validates that the `EdgeVeda` instance is initialized, validates the input text, loads the configured GGUF model in a background isolate, calls the native embedding API, copies the L2-normalized embedding vector into Dart memory, and returns an `EmbeddingResult`. Use a real embedding model; using a generative model can produce meaningless embeddings.

## When to use it

Use `embed()` when you need to:

- convert a single query or document chunk into a vector;
- search a local `VectorIndex` by semantic similarity;
- build or query an on-device RAG pipeline;
- compare two pieces of text by vector similarity.

Do not use this method when:

- you need to embed many texts at once; use `embedBatch()`;
- the current model is a chat/generation model rather than an embedding model;
- you need natural-language generation; use `generate()` or `generateStream()`.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.init(config)` has completed successfully;
- `config.modelPath` points to a GGUF embedding model;
- `text` is not empty;
- the downstream vector index uses the same embedding dimensions as the model.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `text` | `String` | Yes | — | Text to embed. | Must not be empty; keep chunks within model context length. |

## Returns

`Future<EmbeddingResult>` — a future that resolves to one embedding result.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `embedding` | `List<double>` | L2-normalized vector copied into Dart memory. |
| `tokenCount` | `int` | Number of tokens in the input text. |
| `dimensions` | `int` | Convenience property returning vector dimension count. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `EmbeddingException` | `text` is empty or native embedding fails. | Validate input and confirm model compatibility. |
| `ModelLoadException` | The configured model cannot be loaded for embedding. | Verify `modelPath`, model type, and memory budget. |
| `InitializationException` / `EdgeVedaException` | Runtime is not initialized or another SDK-level failure occurs. | Call `init()` first and handle typed exceptions. |
| `MemoryException` | Model or context exceeds memory limits. | Use a smaller embedding model or lower context/memory settings. |

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

Not applicable. `embed()` does not emit a stream.

## Behavior notes

- `embed()` requires the core runtime to be initialized with `init()`.
- Native work runs in a background isolate to avoid blocking the UI.
- The native model context is created for the call and freed after the embedding is copied.
- The returned embedding is a Dart-owned `List<double>`.
- Embedding dimensions depend on the selected model and must match the target `VectorIndex`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model type | Embedding models are usually smaller and faster than chat models. | Use a dedicated embedding model for RAG. |
| Chunk length | Longer text increases tokenization and compute time. | Split documents into consistent semantic chunks. |
| Single-call model load | `embed()` loads for a single input. | Use `embedBatch()` for indexing many chunks. |
| Vector dimensions | Higher dimensions increase index size and search cost. | Do not mix different embedding models in one index. |

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

- Input data processed: input text.
- Network access during inference: none.
- Local storage used: local model file and optional app-managed vector index.
- Sensitive data considerations: embeddings can encode private content; protect persisted vectors and metadata.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Text cannot be empty` | Empty string passed to `embed()`. | Trim and validate input. |
| Vector dimensions do not match index | Index was created for a different embedding model. | Rebuild the index with one consistent model. |
| Poor retrieval quality | Wrong model type or poor chunking. | Use a real embedding model and tune chunking. |
| Slow indexing | Calling `embed()` repeatedly loads the model for each text. | Use `embedBatch()`. |

## Related APIs

- `EdgeVeda.embedBatch()` — embeds multiple texts with one model load/unload cycle.
- `VectorIndex.add()` — stores embedding vectors for local similarity search.
- `RagPipeline.query()` — runs retrieval-augmented generation using embeddings.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.embed()`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- Empty-text behavior is still `EmbeddingException`.
- Result fields match `EmbeddingResult`.
- The example compiles with a real embedding model.
- Model compatibility notes are reviewed by a maintainer.
