---
    title: "RAG pipeline"
    description: "Використовуйте RagPipeline, щоб retrieve-ити local context і генерувати grounded on-device answers."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # RAG pipeline

    `RagPipeline` поєднує embeddings, vector search, prompt injection і text generation в один retrieval-augmented generation flow. Використовуйте його, коли model має відповідати на основі local documents, а не лише training data.

    ## Що ви створите

    У цьому guide показано, як:

    - підготувати `VectorIndex`;
- налаштувати `RagPipeline`;
- query-ити local documents;
- показувати answers із source attribution;
- обробляти insufficient context;

    ## Коли використовувати

    Використовуйте RAG для document Q&A, local manuals, personal knowledge bases, help centers, legal notes і product documentation, яка має залишатися private on device.

    ## Basic example

    ```dart
final rag = RagPipeline(
  edgeVeda: edgeVeda,
  index: index,
  config: RagConfig(
    topK: 3,
    minScore: 0.5,
  ),
);

final answer = await rag.query('What is Edge Veda?');

print(answer.text);
```

    ## Recommended practices

    - Build and persist `VectorIndex` before starting RAG.
- Tell the model to answer only from retrieved context.
- Show source documents, sections, or pages in the UI.
- Use the same embedding model for indexing and querying.
- Return a safe fallback when no source is strong enough.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `edgeVeda` | `EdgeVeda` | Runtime used for embedding and/or generation. |
| `index` | `VectorIndex` | Local vector search index. |
| `RagConfig.topK` | `int` | Number of chunks injected into the prompt. |
| `RagConfig.minScore` | `double` | Minimum similarity threshold. |
| `query()` | `Future` | Runs embed → search → inject → generate. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | `topK` | More chunks improve context but slow generation. | Start with `topK: 3`. |
| `minScore` | Higher threshold improves precision. | Tune on real queries. |
| Prompt size | Large context slows generation. | Use focused chunks. |
| Dual models | Embedder and generator both need memory. | Use `ModelManager` and unload idle models. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Answer invents facts | Retrieved context is weak or prompt is vague. | Use strict context-only instruction. |
| No sources | Index empty or threshold too high. | Verify indexing and lower `minScore`. |
| Slow answers | Embedding, search, and generation all run locally. | Use compact models and shorter context. |

    ## Privacy notes

    RAG can run entirely on device. Treat documents, vectors, retrieved chunks, and generated answers as private data.

    ## Related guides

    - [`vector-index.md`](./vector-index.md)
- [`embeddings.md`](./embeddings.md)
- [`model-manager.md`](./model-manager.md)
