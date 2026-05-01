---
    title: "Vector index"
    description: "Створюйте, шукайте, зберігайте й підтримуйте local VectorIndex для semantic search в Edge Veda."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Vector index

    `VectorIndex` зберігає text chunks і embedding vectors, щоб app могла шукати за meaning, а не лише за exact keywords. Використовуйте його для local knowledge bases, document search, duplicate detection, semantic notes, voice journals і RAG.

    ## Що ви створите

    У цьому guide показано, як:

    - створити `VectorIndex` з правильними vector dimensions;
- додати chunks із metadata;
- виконати similarity search;
- persist-ити index як JSON;
- уникнути dimension mismatch і weak retrieval;

    ## Коли використовувати

    Використовуйте `VectorIndex`, коли app уже має embeddings і потребує швидкого local semantic search. Не використовуйте його для exact identifiers: invoice numbers, usernames або primary keys; для цього краще database filter.

    ## Basic example

    ```dart
final result = await edgeVeda.embed('Edge Veda runs models on device.');

final index = VectorIndex(dimensions: result.embedding.length);

index.add(
  'doc-1',
  result.embedding,
  metadata: {
    'source': 'overview.md',
    'section': 'introduction',
  },
);

final query = await edgeVeda.embed('How does Edge Veda protect privacy?');

final matches = index.search(
  query.embedding,
  topK: 5,
  minScore: 0.45,
);

await index.save('/path/to/index.json');
```

    ## Recommended practices

    - Create the index from `result.embedding.length`; never guess dimensions.
- Use the same embedding model for indexing and querying.
- Store `source`, `section`, `chunk_index`, and timestamps in metadata.
- Chunk documents by concept, not by arbitrary file size.
- Persist the index after batch indexing and load it on startup.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `dimensions` | `int` | Required vector length for all entries. |
| `id` | `String` | Stable chunk identifier. |
| `embedding` | `List<double>` | Vector returned by `embed()` or `embedBatch()`. |
| `metadata` | `Map<String, dynamic>` | Source, section, page, timestamp, or UI metadata. |
| `topK` | `int` | Maximum number of matches. |
| `minScore` | `double` | Similarity threshold for weak matches. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Chunk count | More vectors increase memory and search cost. | Remove duplicate or low-value chunks. |
| Vector dimension | Higher dimensions increase index size. | Use the model's native dimension. |
| Metadata size | Large metadata increases persisted file size. | Store compact source data. |
| Save frequency | Frequent saves can affect UI responsiveness. | Debounce saves after batch indexing. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Unrelated results | Chunks are too broad or `minScore` is too low. | Re-chunk and raise `minScore`. |
| Vector rejected | Dimension mismatch. | Create index from `result.embedding.length`. |
| Results changed after model switch | Index and query use different embedding models. | Rebuild index with the same model. |

    ## Privacy notes

    Vectors can still reveal information about source text. Store the index in app-private storage, delete vectors when source documents are deleted, and do not sync private vectors without user consent.

    ## Related guides

    - [`embeddings.md`](./embeddings.md)
- [`rag-pipeline.md`](./rag-pipeline.md)
- [`model-manager.md`](./model-manager.md)
