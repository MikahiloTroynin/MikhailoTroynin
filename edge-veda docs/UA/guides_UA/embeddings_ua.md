---
title: "Embeddings"
description: "Створюйте local text embeddings і on-device retrieval через Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Embeddings

`Embeddings` перетворюють text у vectors, які можна порівнювати за meaning. В Edge Veda embeddings використовуються для semantic search, similarity matching, clustering, recommendations і on-device RAG.

Використовуйте embeddings, коли keyword search занадто жорсткий і app має знаходити related text за meaning.

## Що ви створите

У цьому guide показано, як:

- згенерувати embedding через `embed()`;
- перевірити vector dimensions;
- додати vectors у `VectorIndex`;
- зберегти local index;
- query-ити documents через `RagPipeline`.

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

`result.embedding` містить numeric vector. `result.dimensions` показує vector size, який очікує index.

## Embedding model

Використовуйте model, призначений для embeddings. Chat model і embedding model не є interchangeable.

Рекомендовані checks:

- model підтримує embedding output;
- vector dimension відомий;
- dimension відповідає `VectorIndex`;
- model вміщується в memory budget target device;
- однаковий model використовується для indexing і querying.

Якщо index documents створено одним embedding model, а query — іншим, search quality може погіршитись.

## Build local vector index

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

`dimensions` має відповідати embedding size, який повертає ваш model.

## Query with RAG

Використовуйте `RagPipeline`, коли потрібно embed-ити query, search-ити local index, inject-ити retrieved context і згенерувати answer.

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

Answer grounded у documents, які ви додали до local index.

## Chunking documents

Не embed-іть huge documents одним string. Розбивайте documents на chunks, достатньо малі для precise retrieval.

Рекомендована chunk metadata:

```dart
{
  'source': 'user-guide.md',
  'section': 'installation',
  'chunk_index': 3,
}
```

Добрий chunk:

```text
To install Edge Veda, add the package to pubspec.yaml and run flutter pub get.
```

Поганий chunk:

```text
An entire 20-page document.
```

Small chunks покращують retrieval precision і зменшують prompt size під час generation.

## Similarity search pattern

Використовуйте embeddings для direct semantic search, коли generated answers не потрібні.

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

Перевірте generated API reference для exact `VectorIndex.search()` return type у вашій installed SDK version.

## Коли використовувати embeddings

Використовуйте embeddings для:

- semantic search;
- document Q&A;
- local knowledge bases;
- duplicate detection;
- recommendations;
- clustering similar notes;
- routing query до topic або workflow.

Не використовуйте embeddings, коли:

- потрібен exact matching;
- input занадто короткий і ambiguous;
- простий filter або database query достатній;
- data змінюється настільки часто, що re-indexing стає дорогим.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Embedding model size | Larger models можуть покращити quality, але коштують memory і latency. | Починайте з compact embedding model. |
| Vector dimension | Higher dimensions збільшують index size. | Використовуйте native dimension model; не truncate-іть без tests. |
| Chunk count | Більше chunks покращує coverage, але збільшує indexing time. | Chunk-іть by section і прибирайте duplicates. |
| `topK` | Higher `topK` повертає більше context, але збільшує prompt size. | Почніть з `topK: 3`. |
| `minScore` | Higher thresholds зменшують irrelevant context. | Tune-іть на real user queries. |
| Persistence | Save index дозволяє не rebuild-ити його на кожен launch. | Save після indexing і reload під час app startup. |

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Search returns irrelevant results | Chunks занадто large або `minScore` too low. | Re-chunk documents і tune score threshold. |
| Index rejects vectors | Dimension mismatch. | Створіть `VectorIndex` з model `result.dimensions`. |
| RAG answer invents facts | Retrieved context weak або absent. | Показуйте "not enough local context" або знижуйте answer confidence. |
| Indexing slow | Забагато documents або занадто large chunks. | Index-іть у background і persist-іть result. |
| App memory grows | Index і model обидва large. | Використайте smaller embedding model або зменште stored chunks. |

## Privacy notes

`Embeddings` створені з text і можуть усе ще розкривати інформацію про цей text. Вектори й metadata треба обробляти як sensitive, якщо source documents private.

Рекомендовані practices:

- зберігайте indexes в app-private storage;
- не sync-іть vectors без user consent;
- видаляйте chunks, коли source documents deleted;
- не embed-іть secrets, tokens і credentials;
- тримайте retrieval logs local, якщо немає явної потреби.

## Next steps

- Використовуйте [`structured-output.md`](./structured-output.md), щоб extract-ити metadata перед indexing.
- Використовуйте [`function-calling.md`](./function-calling.md), щоб expose-ити local search як tool.
- Використовуйте [`chat-sessions.md`](./chat-sessions.md), щоб створити conversational document assistant.
