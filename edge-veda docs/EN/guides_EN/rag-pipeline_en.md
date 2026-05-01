---
    title: "RAG pipeline"
    description: "Use RagPipeline to retrieve local context and generate grounded on-device answers."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # RAG pipeline

    `RagPipeline` combines embeddings, vector search, prompt injection, and text generation into one retrieval-augmented generation flow. Use it when the model should answer from local documents instead of relying only on its training data.

    ## What you will build

    This guide shows how to:

    - prepare a `VectorIndex`;
- configure `RagPipeline`;
- query local documents;
- display answers with source attribution;
- handle insufficient context;

    ## When to use it

    Use RAG for document Q&A, local manuals, personal knowledge bases, help centers, legal notes, and product documentation that must remain private on the device.

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

    | Name | Type | Description |
    | --- | --- | --- |
    | `edgeVeda` | `EdgeVeda` | Runtime used for embedding and/or generation. |
| `index` | `VectorIndex` | Local vector search index. |
| `RagConfig.topK` | `int` | Number of chunks injected into the prompt. |
| `RagConfig.minScore` | `double` | Minimum similarity threshold. |
| `query()` | `Future` | Runs embed → search → inject → generate. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

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
