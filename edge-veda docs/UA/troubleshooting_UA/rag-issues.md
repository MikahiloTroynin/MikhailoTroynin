---
title: "Проблеми RAG"
description: "Як усувати проблеми embeddings, vector search, document indexing, retrieval quality, context injection і answer grounding в Edge Veda RAG apps."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми RAG

Використовуйте цю сторінку, коли RAG-застосунок з Edge Veda не індексує documents, повертає нерелевантні chunks, генерує hallucinated answers, відповідає повільно, падає під час embedding або нестабільно працює при поєднанні retrieval з generation.

RAG складається з кількох шарів:

1. Завантаження документа.
2. Розбиття на чанки.
3. Генерація ембедингів.
4. Збереження векторного індексу.
5. Пошук (retrieval).
6. Вставка контексту.
7. LLM answer generation.

Помилка на будь-якому шарі може виглядати як погана фінальна відповідь.

## Типові симптоми

| Симптом | Ймовірна причина | Перша дія |
| --- | --- | --- |
| Documents не знаходяться | Documents не проіндексовано або index path неправильний. | Перевірте index creation і storage path. |
| Повертаються нерелевантні chunks | Поганий chunking, embedding model або query formatting. | Перегляньте top retrieved chunks до generation. |
| Відповідь ігнорує documents | Retrieved context відсутній, задовгий або погано вставлений. | Залогувати final prompt, який передається generator. |
| Відповідь hallucinated | Prompt дозволяє unsupported claims або context слабкий. | Вимагайте citations до retrieved chunks і refusal behavior. |
| Indexing повільний | Documents завеликі або embedding batch size зависокий. | Зменште batch size і pre-index offline, де можливо. |
| Застосунок падає під час indexing | Embedding model і generator конкурують за memory. | Index до завантаження generator або використайте менші models. |
| RAG працює один раз, потім падає | Stale або corrupted index state. | Перебудуйте index і version embedding model. |

## Debug pipeline по шарах

Не починайте з tuning фінального prompt. Спочатку ізолюйте шар, який ламається.

| Шар | Debug question |
| --- | --- |
| Document loading | Чи застосунок прочитав очікувані files і text? |
| Chunking | Chunks змістовні, не занадто малі й не занадто великі? |
| Embedding | Усі chunks embedded тією самою embedding model? |
| Index | Vector index збережено й завантажено з очікуваного path? |
| Retrieval | Top chunks релевантні user question? |
| Context injection | Retrieved chunks справді додано до prompt? |
| Generation | Модель відповідає лише з provided context? |

## Перегляд retrieved chunks

Перед показом відповіді залогуйте top matches.

```dart
final results = await vectorIndex.search(
  queryEmbedding,
  topK: 5,
);

for (final result in results) {
  print('score=${result.score}');
  print('source=${result.metadata['source']}');
  print(result.text);
}
```

Якщо top chunks неправильні, виправляйте retrieval до зміни generator prompt.

## Проблеми chunking

| Проблема | Наслідок | Рішення |
| --- | --- | --- |
| Chunks занадто малі | Retrieval не має достатнього context. | Збільште chunk size або додайте overlap. |
| Chunks занадто великі | Context window заповнюється зайвим text. | Діліть по section, paragraph або semantic boundary. |
| Немає metadata | Відповіді не можуть цитувати sources. | Зберігайте `source`, `page`, `heading` і chunk id. |
| Duplicated chunks | Retrieval повторює той самий content. | Робіть de-duplicate під час indexing. |
| Tables погано перетворено в text | Numeric answers стають ненадійними. | Перетворюйте tables у structured text до embedding. |

Рекомендована metadata:

```json
{
  "source": "docs/en/guides/rag-pipeline.md",
  "heading": "Index documents",
  "chunkId": "rag-pipeline:index-documents:03",
  "language": "en"
}
```

## Embedding model mismatch

Для indexing і query використовуйте ту саму embedding model.

Типові помилки:

- Index створено однією embedding model, а query виконується іншою.
- Index створено до зміни embedding dimensions.
- Застосунок оновив embedding model, але повторно використав старий index.
- Mixed-language content проіндексовано без language-aware testing.

Рішення:

- Зберігайте `embeddingModelId` і `embeddingDimensions` у index metadata.
- Перебудовуйте index, коли змінюється embedding model.
- Для суттєво різних languages або domains тримайте окремі indexes, якщо retrieval quality падає.

## Retrieval повертає нерелевантний context

Спробуйте:

1. Normalize user query.
2. Додати domain-specific terms з UI або selected document.
3. Змінити `topK` залежно від prompt size.
4. Додати score thresholding.
5. Re-rank top results, якщо застосунок має re-ranker.
6. Показувати sources у debug mode.
7. Тестувати known-answer questions.

## Відповідь не grounded

Grounded RAG answer має посилатись на retrieved context.

Prompt pattern:

```text
Answer using only the provided context.
If the context does not contain the answer, say that the documents do not provide enough information.
Cite the source metadata for each factual claim.

Context:
{{retrieved_chunks}}

Question:
{{user_question}}
```

Якщо модель усе ще вигадує:

- Скоротіть retrieved context до найрелевантніших chunks.
- Додайте explicit refusal behavior.
- Використайте structured output для answer + citations.
- Попросіть модель quote або cite chunk ids.
- Тестуйте questions, на які навмисно немає відповіді в documents.

## RAG повільний

Вимірюйте кожен stage окремо:

| Stage | Що логувати |
| --- | --- |
| Document parsing | File count, text size, parsing time. |
| Chunking | Number of chunks і average length. |
| Embedding | Batch size і embeddings per second. |
| Vector search | Query time і `topK`. |
| Prompt assembly | Final prompt length. |
| Generation | `timeToFirstToken`, tokens per second, total time. |

Типові рішення:

- Pre-index documents до старту chat.
- Зменшити embedding batch size на lower-memory devices.
- Persist index to disk.
- Тримати active index компактним.
- Обмежити `topK`.
- Не запускати embedding нових documents під час active generation.

## Memory pressure

RAG може одночасно завантажувати embedder і generator models. Це створює memory pressure.

Рішення:

- Спочатку index documents, потім dispose embedder, якщо runtime це дозволяє.
- Завантажуйте generator лише після завершення indexing.
- Тримайте document text поза active prompt, якщо він не retrieved.
- Не зберігайте full raw documents в UI state.
- Використовуйте `getMemoryStats()` до і після indexing.

## Stale або corrupted index

Симптоми:

- Search повертає chunks з видалених files.
- Search нічого не повертає після app update.
- Scores виглядають неправильними після зміни embedding model.
- Source metadata вказує на старі paths.

Чекліст рішення:

- Додайте index version metadata.
- Додайте embedding model metadata.
- Перебудовуйте index при incompatible changes.
- Видаляйте partial index files після failed indexing.
- Використовуйте atomic write для index updates, якщо можливо.

## Діагностика

Додайте:

- Версію Edge Veda.
- Embedding model name і dimensions.
- Generator model name і `contextLength`.
- Number of documents і chunks.
- Average і maximum chunk size.
- `topK` і score threshold.
- Top retrieved chunks для known question.
- Final prompt shape без приватного content.
- Memory stats до indexing, після indexing і під час generation.
- Чи допомагає rebuild index.

## Повʼязані документи

- [Проблеми завантаження моделей](./model-loading-issues.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Проблеми streaming](./streaming-issues.md)
- [Vector index](../guides/vector-index.md)
- [RAG pipeline](../guides/rag-pipeline.md)
- [Embeddings](../guides/embeddings.md)
- [Privacy and offline inference](../concepts/privacy-and-offline-inference.md)
