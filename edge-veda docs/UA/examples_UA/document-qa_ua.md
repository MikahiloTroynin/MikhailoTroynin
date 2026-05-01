---
title: "Document Q&A"
description: "Створення offline document question-answering застосунку через Edge Veda RAG."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Document Q&A

Цей приклад показує, як створити offline document question-answering застосунок. User імпортує PDF або text file, app ділить content на chunks, створює embeddings для кожного chunk, зберігає їх у `VectorIndex` і відповідає на questions через `RagPipeline`.

Використовуйте цей приклад, коли потрібно:

- дати users можливість ставити questions до власних files;
- залишати document content повністю на device;
- прив'язувати answers до retrieved source chunks;
- поєднати embeddings, vector search і text generation.

## Що створюється

Ви створите local Q&A flow:

1. вибір document;
2. text extraction;
3. поділ text на chunks;
4. створення embedding для кожного chunk через `EdgeVeda.embed()`;
5. збереження vectors у `VectorIndex`;
6. query до document через `RagPipeline`;
7. показ answer із source attribution.

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

Офіційний example app використовує dual-model architecture: одна model для embeddings і одна model для generation. У production зберігайте це розділення, якщо найкраща embedding model не збігається з найкращою chat model.

## Передумови

Перед початком:

- налаштуйте `edge_veda` у `pubspec.yaml`;
- додайте compatible text generation model;
- додайте compatible embedding model;
- додайте document picker і package для text extraction;
- визначте, де зберігатиметься local index;
- визначте privacy policy для імпортованих user documents.

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

Використовуйте separate instances, якщо app тримає обидві models loaded. Якщо target device має обмежену memory, завантажуйте лише одну model за раз або дозвольте `ModelManager` вирішувати, коли evict-ити idle models.

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

Metadata має бути невеликою, але корисною. Мінімум — `source`, `page` і stable `id`.

## Chunking

Для першої версії достатньо простого chunker.

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

Для PDFs краще page-aware chunking, щоб citations могли вказувати page.

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

Корисний Document Q&A UI має показувати sources біля answer.

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

Показуйте sources як clickable cards:

```text
Answer

Source 1 · report.pdf · page 4
"...matching text from the chunk..."

Source 2 · report.pdf · page 6
"...matching text from the chunk..."
```

## Prompt grounding

Фінальна generation має бути прив'язана до retrieved text.

```text
Answer the question using only the provided context.
If the answer is not present in the context, say that the document does not contain enough information.
Do not invent facts.
Include short source references where useful.
```

Цю instruction потрібно застосувати всередині RAG prompt template або перед показом generated answer.

## UI states

| State | Що показувати |
| --- | --- |
| Importing | File name, progress, cancel action |
| Indexing | Кількість processed chunks |
| Ready | Question input і document summary |
| Answering | Streaming або loading answer state |
| No answer | Пояснення, що document не містить достатньо information |
| Error | Зрозумілий recovery step, не raw stack trace |

## Privacy and storage

Document Q&A apps можуть обробляти sensitive files. Для production:

- тримайте extraction, embeddings і generation на device;
- encrypt-іть local indexes, якщо можливо;
- дайте users видиму delete action;
- не записуйте raw document text у logs;
- зберігайте лише metadata, потрібну для citations;
- явно показуйте, коли feature може вийти за межі device.

## Troubleshooting

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Answers надто generic | Prompt не прив'язаний до retrieved chunks | Посилити RAG prompt і зменшити `topK` noise. |
| Sources нерелевантні | Chunk size або embedding model слабкі | Спробувати менші chunks і кращу embedding model. |
| Indexing повільний | Embedding model завелика | Batch work, показ progress або менша embedding model. |
| App має out-of-memory | Дві models loaded одночасно | Використати `ModelManager` або sequential loading. |
| PDF text зламаний | Text extraction не спрацював | Додати OCR або просити selectable PDFs. |

## Production checklist

Перед release:

- перевірте chunking на реальних PDFs;
- протестуйте small, large і scanned documents;
- показуйте citations для кожної answer;
- явно обробляйте "not enough information";
- використовуйте `ModelManager` для multi-model memory control;
- задокументуйте storage location і deletion behavior;
- додайте privacy notes в UI.
