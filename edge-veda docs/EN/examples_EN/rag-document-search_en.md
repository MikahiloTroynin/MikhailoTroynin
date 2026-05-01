---
title: "RAG document search"
description: "Build an offline semantic document search flow with Edge Veda embeddings, VectorIndex, and RagPipeline."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# RAG document search

This example shows how to build an offline document search feature with Edge Veda. The app imports documents, extracts text, creates embeddings, stores vectors in `VectorIndex`, and retrieves the most relevant chunks for a search query.

Use this example when you want to:

- search local documents by meaning, not only exact words;
- keep private files on device;
- combine `embedBatch()`, `VectorIndex`, and `RagPipeline`;
- show source snippets and pages beside the answer;
- prepare a foundation for a full Document Q&A app.

## What you build

The feature has two flows:

1. **Indexing flow** — import documents, chunk text, embed chunks, save index.
2. **Search flow** — embed the query, search the index, show matching chunks, optionally generate an answer.

```text
PDF / text file
  ↓
Text extraction
  ↓
Chunking
  ↓
EdgeVeda.embedBatch()
  ↓
VectorIndex.save()
  ↓
User query
  ↓
VectorIndex.search()
  ↓
Results + optional RagPipeline answer
```

## Prerequisites

Before starting:

- add `edge_veda` to `pubspec.yaml`;
- add a text generation model for answers;
- add an embedding model for vector search;
- add a document picker and text extraction layer;
- decide where to persist `VectorIndex`;
- test with real files, not only short sample text.

Recommended model split:

| Task | Model type |
| --- | --- |
| Embeddings | Small embedding model, such as MiniLM-style model |
| Answer generation | Instruct/chat model |
| PDF extraction | App-level package or platform adapter |

## Runtime setup

Use a dedicated `EdgeVeda` instance for embeddings. In a memory-constrained app, load the embedder only during indexing and query embedding.

```dart
import 'package:edge_veda/edge_veda.dart';

final embedder = EdgeVeda();

await embedder.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 1024,
  useGpu: true,
));
```

Use a separate generator only when you need a natural-language answer.

```dart
final generator = EdgeVeda();

await generator.init(EdgeVedaConfig(
  modelPath: generatorModelPath,
  contextLength: 4096,
  useGpu: true,
));
```

## Document chunk model

```dart
class SearchChunk {
  const SearchChunk({
    required this.id,
    required this.documentId,
    required this.sourceTitle,
    required this.text,
    this.page,
  });

  final String id;
  final String documentId;
  final String sourceTitle;
  final String text;
  final int? page;
}
```

Keep chunk metadata small. It should be enough to render a useful result card and trace the answer back to a file.

## Chunking strategy

A practical first version can use character-based chunks with overlap.

```dart
List<SearchChunk> buildChunks({
  required String documentId,
  required String sourceTitle,
  required String text,
  int maxChars = 900,
  int overlap = 120,
}) {
  final chunks = <SearchChunk>[];
  var start = 0;
  var index = 0;

  while (start < text.length) {
    final end = (start + maxChars).clamp(0, text.length);
    final chunkText = text.substring(start, end).trim();

    if (chunkText.isNotEmpty) {
      chunks.add(SearchChunk(
        id: '$documentId-$index',
        documentId: documentId,
        sourceTitle: sourceTitle,
        text: chunkText,
      ));
    }

    index += 1;
    start = (end - overlap).clamp(0, text.length);
    if (end == text.length) break;
  }

  return chunks;
}
```

For production PDF search, prefer page-aware chunks. Page metadata makes source attribution much more useful.

## Build the vector index

Use `embedBatch()` when indexing many chunks. It avoids loading and unloading the model for every chunk.

```dart
Future<VectorIndex> buildSearchIndex({
  required EdgeVeda embedder,
  required List<SearchChunk> chunks,
}) async {
  final embeddings = await embedder.embedBatch(
    chunks.map((chunk) => chunk.text).toList(),
    onProgress: (completed, total) {
      print('Embedded $completed / $total chunks');
    },
  );

  final index = VectorIndex(dimensions: embeddings.first.embedding.length);

  for (var i = 0; i < chunks.length; i++) {
    final chunk = chunks[i];
    final embedding = embeddings[i];

    index.add(
      chunk.id,
      embedding.embedding,
      metadata: {
        'documentId': chunk.documentId,
        'sourceTitle': chunk.sourceTitle,
        'page': chunk.page,
        'text': chunk.text,
      },
    );
  }

  return index;
}
```

## Save and load the index

```dart
await index.save(indexPath);
```

Recommended file layout:

```text
app_data/
├── documents/
│   ├── report-2026.pdf
│   └── onboarding.md
├── indexes/
│   └── document-search-index.json
└── metadata/
    └── document-catalog.json
```

Keep index persistence and document metadata versioned together. If the user deletes a document, remove its vectors too.

## Search the index

```dart
Future<List<SearchResult>> searchDocuments({
  required EdgeVeda embedder,
  required VectorIndex index,
  required String query,
}) async {
  final queryEmbedding = await embedder.embed(query);

  final matches = index.search(
    queryEmbedding.embedding,
    topK: 8,
  );

  return matches.map((match) {
    return SearchResult(
      chunkId: match.id,
      score: match.score,
      sourceTitle: match.metadata['sourceTitle'] as String,
      page: match.metadata['page'] as int?,
      preview: match.metadata['text'] as String,
    );
  }).toList();
}
```

## Search result model

```dart
class SearchResult {
  const SearchResult({
    required this.chunkId,
    required this.score,
    required this.sourceTitle,
    required this.preview,
    this.page,
  });

  final String chunkId;
  final double score;
  final String sourceTitle;
  final String preview;
  final int? page;
}
```

## Optional RAG answer

If users need an answer, not only search results, pass the same index to `RagPipeline`.

```dart
final rag = RagPipeline(
  edgeVeda: generator,
  index: index,
  config: RagConfig(
    topK: 4,
    minScore: 0.45,
  ),
);

final answer = await rag.query(
  'What does the document say about offline inference?',
);

print(answer.text);
```

## UI pattern

Recommended UI:

| Area | Purpose |
| --- | --- |
| Search input | User query |
| Filters | Document, date, type, tag |
| Results list | Source title, page, snippet, similarity score |
| Preview pane | Larger chunk preview |
| Answer panel | Optional RAG answer |
| Source cards | Chunks used to produce the answer |

For a documentation-style app, show search results first and generated answers second. This keeps the feature transparent.

## Ranking and thresholds

Start with:

```dart
RagConfig(
  topK: 4,
  minScore: 0.45,
)
```

Then tune with real documents:

- increase `topK` when answers miss relevant context;
- decrease `topK` when answers include unrelated text;
- raise `minScore` when results are noisy;
- lower `minScore` when the model often says "not enough information."

## Privacy and storage

For production:

- keep indexing and search on device;
- encrypt indexes if documents are sensitive;
- let users delete a document and its vectors;
- avoid logging raw document text and queries;
- show storage usage for indexed documents;
- make cloud sync opt-in, not default.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Results are irrelevant | Chunks are too large or too small | Tune chunk size and overlap. |
| Search is slow | Query embedding model is cold | Keep the embedder loaded while search screen is open. |
| Index file grows too much | Too many chunks or duplicate documents | Deduplicate by document hash. |
| Answers invent details | RAG prompt is too open | Require answers to use only retrieved context. |
| Deleted files still appear | Index metadata is stale | Remove vectors by `documentId` during delete. |

## Production checklist

Before shipping:

- test small, large, scanned, and multilingual documents;
- persist indexes safely;
- support re-indexing after file changes;
- show exact source snippets;
- make deletion visible;
- avoid silent cloud handoff;
- document model requirements and device constraints.
