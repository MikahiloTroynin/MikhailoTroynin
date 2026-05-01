---
title: "Document Q&A"
description: "Build an offline document question-answering app with Edge Veda RAG."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Document Q&A

This example shows how to build an offline document question-answering app. The user imports a PDF or text file, the app chunks the content, embeds each chunk, stores it in a `VectorIndex`, and answers questions through `RagPipeline`.

Use this example when you want to:

- let users ask questions about their own files;
- keep document content fully on device;
- ground answers in retrieved source chunks;
- combine embeddings, vector search, and text generation.

## What you build

You will build a local Q&A flow:

1. pick a document;
2. extract text;
3. split the text into chunks;
4. embed each chunk with `EdgeVeda.embed()`;
5. store vectors in `VectorIndex`;
6. query the document with `RagPipeline`;
7. display the answer with source attribution.

## Architecture

```text
Document picker
  ↓
Text extraction
  ↓
Chunker
  ↓
Embedding model via EdgeVeda.embed()
  ↓
VectorIndex
  ↓
RagPipeline
  ↓
Answer + sources
```

The official example app uses a dual-model architecture: one model for embeddings and one model for generation. Keep this separation in production when the best embedding model is not the same as the best chat model.

## Prerequisites

Before starting:

- configure `edge_veda` in `pubspec.yaml`;
- add a compatible text generation model;
- add a compatible embedding model;
- add a document picker and text extraction package;
- decide where the local index will be saved;
- define a privacy policy for imported user documents.

## Runtime setup

```dart
import 'package:edge_veda/edge_veda.dart';

final generator = EdgeVeda();
final embedder = EdgeVeda();

await generator.init(EdgeVedaConfig(
  modelPath: generatorModelPath,
  contextLength: 4096,
  useGpu: true,
));

await embedder.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 1024,
  useGpu: true,
));
```

Use separate instances if your app keeps both models loaded. If the target device has limited memory, load only one model at a time or let `ModelManager` decide when to evict idle models.

## Document model

```dart
class DocumentChunk {
  const DocumentChunk({
    required this.id,
    required this.text,
    required this.source,
    required this.page,
  });

  final String id;
  final String text;
  final String source;
  final int? page;
}
```

Keep metadata small but useful. At minimum, store `source`, `page`, and a stable `id`.

## Chunking

A simple chunker is enough for a first version.

```dart
List<DocumentChunk> chunkText({
  required String documentId,
  required String source,
  required String text,
  int maxChars = 900,
  int overlap = 120,
}) {
  final chunks = <DocumentChunk>[];
  var start = 0;
  var index = 0;

  while (start < text.length) {
    final end = (start + maxChars).clamp(0, text.length);
    final chunkText = text.substring(start, end).trim();

    if (chunkText.isNotEmpty) {
      chunks.add(DocumentChunk(
        id: '$documentId-$index',
        text: chunkText,
        source: source,
        page: null,
      ));
    }

    index += 1;
    start = (end - overlap).clamp(0, text.length);
    if (end == text.length) break;
  }

  return chunks;
}
```

For PDFs, prefer page-aware chunking so citations can point to a page.

## Build the index

```dart
Future<VectorIndex> buildDocumentIndex({
  required EdgeVeda embedder,
  required List<DocumentChunk> chunks,
}) async {
  final first = await embedder.embed(chunks.first.text);
  final index = VectorIndex(dimensions: first.embedding.length);

  index.add(
    chunks.first.id,
    first.embedding,
    metadata: {
      'source': chunks.first.source,
      'page': chunks.first.page,
      'text': chunks.first.text,
    },
  );

  for (final chunk in chunks.skip(1)) {
    final result = await embedder.embed(chunk.text);

    index.add(
      chunk.id,
      result.embedding,
      metadata: {
        'source': chunk.source,
        'page': chunk.page,
        'text': chunk.text,
      },
    );
  }

  return index;
}
```

## Query the document

```dart
Future<String> answerQuestion({
  required EdgeVeda generator,
  required VectorIndex index,
  required String question,
}) async {
  final rag = RagPipeline(
    edgeVeda: generator,
    index: index,
    config: RagConfig(
      topK: 4,
      minScore: 0.45,
    ),
  );

  final answer = await rag.query(question);
  return answer.text;
}
```

## Source attribution

A useful Document Q&A UI should show sources beside the answer.

```dart
class AnswerSource {
  const AnswerSource({
    required this.source,
    required this.preview,
    this.page,
    this.score,
  });

  final String source;
  final String preview;
  final int? page;
  final double? score;
}
```

Show sources as clickable cards:

```text
Answer

Source 1 · report.pdf · page 4
"...matching text from the chunk..."

Source 2 · report.pdf · page 6
"...matching text from the chunk..."
```

## Prompt grounding

Keep the final generation grounded in retrieved text.

```text
Answer the question using only the provided context.
If the answer is not present in the context, say that the document does not contain enough information.
Do not invent facts.
Include short source references where useful.
```

This instruction should be applied inside the RAG prompt template or before the generated answer is shown.

## UI states

| State | What to show |
| --- | --- |
| Importing | File name, progress, cancel action |
| Indexing | Number of chunks processed |
| Ready | Question input and document summary |
| Answering | Streaming or loading answer state |
| No answer | Explain that the document did not contain enough information |
| Error | Clear recovery step, not a raw stack trace |

## Privacy and storage

Document Q&A apps can process sensitive files. For production:

- keep extraction, embeddings, and generation on device;
- encrypt local indexes when possible;
- give users a visible delete action;
- avoid logging raw document text;
- store only metadata needed for citations;
- make it clear when a feature would leave the device.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Answers are generic | Prompt is not grounded in retrieved chunks | Strengthen the RAG prompt and lower `topK` noise. |
| Sources look irrelevant | Chunk size or embedding model is poor | Try smaller chunks and a better embedding model. |
| Indexing is slow | Embedding model is large | Batch work, show progress, or use a smaller embedding model. |
| App runs out of memory | Two models are loaded at once | Use `ModelManager` or load embedder and generator sequentially. |
| PDF text is broken | Text extraction failed | Add OCR or ask users to import selectable PDFs. |

## Production checklist

Before shipping:

- validate chunking on real PDFs;
- test small, large, and scanned documents;
- show citations for every answer;
- handle "not enough information" explicitly;
- use `ModelManager` for multi-model memory control;
- document storage location and deletion behavior;
- include privacy notes in the UI.
