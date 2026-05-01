---
title: "RAG document search"
description: "Створення offline semantic document search через Edge Veda embeddings, VectorIndex і RagPipeline."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# RAG document search

Цей приклад показує, як створити offline document search feature через Edge Veda. App імпортує documents, виконує text extraction, створює embeddings, зберігає vectors у `VectorIndex` і повертає найрелевантніші chunks для search query.

Використовуйте цей приклад, коли потрібно:

- шукати local documents за змістом, а не лише exact words;
- залишати private files на device;
- поєднати `embedBatch()`, `VectorIndex` і `RagPipeline`;
- показувати source snippets і pages поруч з answer;
- підготувати foundation для повного Document Q&A app.

## Що створюється

Feature має два flows:

1. **Indexing flow** — import documents, chunk text, embed chunks, save index.
2. **Search flow** — embed query, search index, show matching chunks, optionally generate answer.

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

## Передумови

Перед початком:

- додайте `edge_veda` до `pubspec.yaml`;
- додайте text generation model для answers;
- додайте embedding model для vector search;
- додайте document picker і text extraction layer;
- визначте, де persist-ити `VectorIndex`;
- тестуйте на реальних files, не лише на короткому sample text.

Рекомендований model split:

| Task | Model type |
| --- | --- |
| Embeddings | Small embedding model, наприклад MiniLM-style model |
| Answer generation | Instruct/chat model |
| PDF extraction | App-level package або platform adapter |

## Runtime setup

Використовуйте окремий `EdgeVeda` instance для embeddings. У memory-constrained app завантажуйте embedder лише під час indexing і query embedding.

```dart
import 'package:edge_veda/edge_veda.dart';

final embedder = EdgeVeda();

await embedder.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 1024,
  useGpu: true,
));
```

Окремий generator потрібен лише тоді, коли потрібна natural-language answer.

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

Chunk metadata має бути невеликою. Її має вистачати, щоб показати result card і відстежити answer до file.

## Chunking strategy

Для першої версії достатньо character-based chunks з overlap.

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

Для production PDF search краще page-aware chunks. Page metadata робить source attribution значно кориснішою.

## Build the vector index

Використовуйте `embedBatch()`, коли index-ите багато chunks. Це не змушує model load/unload для кожного chunk.

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

Рекомендований file layout:

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

Тримайте index persistence і document metadata versioned together. Якщо user видаляє document, видаліть і його vectors.

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

Якщо users потрібна answer, а не лише search results, передайте той самий index у `RagPipeline`.

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

Рекомендований UI:

| Area | Purpose |
| --- | --- |
| Search input | User query |
| Filters | Document, date, type, tag |
| Results list | Source title, page, snippet, similarity score |
| Preview pane | Larger chunk preview |
| Answer panel | Optional RAG answer |
| Source cards | Chunks, використані для answer |

Для documentation-style app показуйте search results first, а generated answers second. Це робить feature прозорішою.

## Ranking and thresholds

Почніть із:

```dart
RagConfig(
  topK: 4,
  minScore: 0.45,
)
```

Потім tune-іть на реальних documents:

- збільшуйте `topK`, коли answers пропускають relevant context;
- зменшуйте `topK`, коли answers включають unrelated text;
- піднімайте `minScore`, коли results noisy;
- знижуйте `minScore`, коли model часто каже "not enough information."

## Privacy and storage

Для production:

- залишайте indexing і search на device;
- encrypt-іть indexes, якщо documents sensitive;
- дайте users можливість delete document і його vectors;
- не log-іть raw document text і queries;
- показуйте storage usage для indexed documents;
- робіть cloud sync opt-in, не default.

## Troubleshooting

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Results нерелевантні | Chunks завеликі або замалі | Налаштувати chunk size і overlap. |
| Search повільний | Query embedding model cold | Тримати embedder loaded, поки search screen open. |
| Index file занадто великий | Забагато chunks або duplicate documents | Deduplicate за document hash. |
| Answers invent details | RAG prompt занадто відкритий | Вимагати answers лише з retrieved context. |
| Deleted files still appear | Index metadata stale | Remove vectors by `documentId` during delete. |

## Production checklist

Перед release:

- протестуйте small, large, scanned і multilingual documents;
- persist-іть indexes safely;
- підтримуйте re-indexing після file changes;
- показуйте exact source snippets;
- зробіть deletion visible;
- уникайте silent cloud handoff;
- задокументуйте model requirements і device constraints.
