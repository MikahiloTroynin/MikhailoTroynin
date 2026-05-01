---
title: "Embeddings"
description: "Create local text embeddings and build on-device retrieval with Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Embeddings

Embeddings convert text into vectors that can be compared by meaning. In Edge Veda, embeddings are used for semantic search, similarity matching, clustering, recommendations, and on-device RAG.

Use embeddings when keyword search is too rigid and the app needs to find related text by meaning.

## What you will build

This guide shows how to:

- generate an embedding with `embed()`;
- inspect vector dimensions;
- add vectors to `VectorIndex`;
- save a local index;
- query documents through `RagPipeline`.

## Basic example

```dart
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final result = await edgeVeda.embed('The quick brown fox');

print('Dimensions: ${result.dimensions}');
print('Vector preview: ${result.embedding.take(5)}');
```

`result.embedding` contains the numeric vector. `result.dimensions` tells you the vector size expected by your index.

## Choosing an embedding model

Use a model intended for embeddings. A chat model and an embedding model are not interchangeable.

Recommended checks:

- the model supports embedding output;
- the vector dimension is known;
- the dimension matches the `VectorIndex`;
- the model fits the target device memory budget;
- the same model is used for indexing and querying.

If you index documents with one embedding model and query with another, search quality can degrade.

## Build a local vector index

```dart
final index = VectorIndex(dimensions: 768);

final docs = [
  'Flutter is a UI framework.',
  'Dart is a programming language.',
  'Edge Veda runs AI models on device.',
];

for (final doc in docs) {
  final emb = await edgeVeda.embed(doc);

  index.add(
    doc,
    emb.embedding,
    metadata: {
      'source': 'docs',
    },
  );
}

await index.save(indexPath);
```

The `dimensions` value must match the embedding size returned by your model.

## Query with RAG

Use `RagPipeline` when you want to embed a query, search the local index, inject retrieved context, and generate an answer.

```dart
final rag = RagPipeline(
  edgeVeda: edgeVeda,
  index: index,
  config: RagConfig(
    topK: 3,
    minScore: 0.5,
  ),
);

final answer = await rag.query('What is Flutter?');

print(answer.text);
```

The answer is grounded in the documents you added to the local index.

## Chunking documents

Do not embed huge documents as a single string. Split documents into chunks that are small enough to retrieve precisely.

Recommended chunk metadata:

```dart
{
  'source': 'user-guide.md',
  'section': 'installation',
  'chunk_index': 3,
}
```

Good chunk:

```text
To install Edge Veda, add the package to pubspec.yaml and run flutter pub get.
```

Bad chunk:

```text
An entire 20-page document.
```

Small chunks improve retrieval precision and reduce prompt size during generation.

## Similarity search pattern

Use embeddings for direct semantic search when you do not need generated answers.

```dart
final queryEmbedding = await edgeVeda.embed('How do I install the SDK?');

final matches = index.search(
  queryEmbedding.embedding,
  topK: 5,
  minScore: 0.45,
);

for (final match in matches) {
  print(match.text);
  print(match.score);
}
```

Check the generated API reference for the exact `VectorIndex.search()` return type in your installed SDK version.

## When to use embeddings

Use embeddings for:

- semantic search;
- document Q&A;
- local knowledge bases;
- duplicate detection;
- recommendations;
- clustering similar notes;
- routing a query to a topic or workflow.

Avoid embeddings when:

- exact matching is required;
- the input is too short and ambiguous;
- a simple filter or database query is enough;
- the data changes so often that re-indexing becomes too expensive.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Embedding model size | Larger models may improve quality but cost memory and latency. | Start with a compact embedding model. |
| Vector dimension | Higher dimensions increase index size. | Use the model's native dimension; do not truncate unless tested. |
| Chunk count | More chunks improve coverage but increase indexing time. | Chunk by section and remove duplicates. |
| `topK` | Higher `topK` returns more context but increases prompt size. | Start with `topK: 3`. |
| `minScore` | Higher thresholds reduce irrelevant context. | Tune on real user queries. |
| Persistence | Saving the index avoids rebuilding on every launch. | Save after indexing and reload on app startup. |

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Search returns irrelevant results | Chunks are too large or `minScore` is too low. | Re-chunk documents and tune score threshold. |
| Index rejects vectors | Dimension mismatch. | Create `VectorIndex` with the model's `result.dimensions`. |
| RAG answer invents facts | Retrieved context is weak or absent. | Show "not enough local context" or lower answer confidence. |
| Indexing is slow | Too many documents or too large chunks. | Index in the background and persist the result. |
| App memory grows | Index and model are both large. | Use smaller embedding model or reduce stored chunks. |

## Privacy notes

Embeddings are derived from text and can still reveal information about that text. Treat vectors and metadata as sensitive when source documents are private.

Recommended practices:

- store indexes in app-private storage;
- avoid syncing vectors without user consent;
- remove chunks when source documents are deleted;
- avoid embedding secrets, tokens, and credentials;
- keep retrieval logs local unless explicitly needed.

## Next steps

- Use [`structured-output.md`](./structured-output.md) to extract metadata before indexing.
- Use [`function-calling.md`](./function-calling.md) to expose local search as a tool.
- Use [`chat-sessions.md`](./chat-sessions.md) to build a conversational document assistant.
