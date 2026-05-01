---
title: "RAG issues"
description: "Troubleshoot embeddings, vector search, document indexing, retrieval quality, context injection, and answer grounding in Edge Veda RAG apps."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# RAG issues

Use this page when an Edge Veda RAG app cannot index documents, retrieves irrelevant chunks, returns hallucinated answers, answers slowly, crashes during embedding, or fails when combining retrieval with generation.

RAG combines several moving parts:

1. Document loading.
2. Chunking.
3. Embedding generation.
4. Vector index storage.
5. Retrieval.
6. Context injection.
7. LLM answer generation.

A failure in any layer can look like a bad final answer.

## Common symptoms

| Symptom | Likely cause | First action |
| --- | --- | --- |
| No documents found | Documents were not indexed or index path is wrong. | Verify index creation and storage path. |
| Irrelevant chunks retrieved | Chunking, embedding model, or query formatting is poor. | Inspect top retrieved chunks before generation. |
| Answer ignores documents | Retrieved context is missing, too long, or badly inserted. | Log the final prompt sent to the generator. |
| Answer hallucinates | Prompt allows unsupported claims or context is weak. | Require citations to retrieved chunks and add refusal behavior. |
| Indexing is slow | Documents are too large or embedding batch size is too high. | Reduce batch size and pre-index offline where possible. |
| App crashes during indexing | Embedding model and generator compete for memory. | Index before loading the generator or use smaller models. |
| RAG works once then fails | Stale or corrupted index state. | Rebuild the index and version the embedding model. |

## Debug the pipeline by layer

Do not start by tuning the final prompt. First isolate the failing layer.

| Layer | Debug question |
| --- | --- |
| Document loading | Did the app read the expected files and text? |
| Chunking | Are chunks meaningful, not too small, not too large? |
| Embedding | Are all chunks embedded with the same embedding model? |
| Index | Is the vector index persisted and loaded from the expected path? |
| Retrieval | Are the top chunks relevant to the user question? |
| Context injection | Are retrieved chunks actually included in the prompt? |
| Generation | Does the model answer only from provided context? |

## Inspect retrieved chunks

Before showing an answer, log the top matches.

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

If the top chunks are wrong, fix retrieval before changing the generator prompt.

## Chunking problems

| Problem | Effect | Fix |
| --- | --- | --- |
| Chunks are too small | Retrieval lacks enough context. | Increase chunk size or add overlap. |
| Chunks are too large | Context window fills with irrelevant text. | Split by section, paragraph, or semantic boundary. |
| No metadata | Answers cannot cite sources. | Store `source`, `page`, `heading`, and chunk id. |
| Duplicated chunks | Retrieval repeats the same content. | De-duplicate during indexing. |
| Tables are flattened poorly | Numeric answers become unreliable. | Convert tables into structured text before embedding. |

Recommended metadata:

```json
{
  "source": "docs/en/guides/rag-pipeline.md",
  "heading": "Index documents",
  "chunkId": "rag-pipeline:index-documents:03",
  "language": "en"
}
```

## Embedding model mismatch

Use the same embedding model for indexing and querying.

Common mistakes:

- Index was created with one embedding model and queried with another.
- Index was created after changing embedding dimensions.
- App updated the embedding model but reused an old index.
- Mixed-language content was indexed without language-aware testing.

Fix:

- Store `embeddingModelId` and `embeddingDimensions` in index metadata.
- Rebuild the index when the embedding model changes.
- Keep separate indexes for materially different languages or domains if retrieval quality drops.

## Retrieval returns irrelevant context

Try these steps:

1. Normalize the user query.
2. Add domain-specific terms from the UI or selected document.
3. Lower or raise `topK` depending on prompt size.
4. Add score thresholding.
5. Re-rank top results if the app has a re-ranker.
6. Show sources in debug mode.
7. Test with known-answer questions.

## Answer is not grounded

A grounded RAG answer should be able to point to the retrieved context.

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

If the model still invents information:

- Reduce retrieved context to only the most relevant chunks.
- Add explicit refusal behavior.
- Use structured output for answer + citations.
- Ask the model to quote or cite chunk ids.
- Test with questions that are intentionally not in the documents.

## RAG is slow

Measure each stage separately:

| Stage | What to log |
| --- | --- |
| Document parsing | File count, text size, parsing time. |
| Chunking | Number of chunks and average length. |
| Embedding | Batch size and embeddings per second. |
| Vector search | Query time and `topK`. |
| Prompt assembly | Final prompt length. |
| Generation | `timeToFirstToken`, tokens per second, total time. |

Common fixes:

- Pre-index documents before chat starts.
- Reduce embedding batch size on lower-memory devices.
- Persist the index to disk.
- Keep the active index compact.
- Limit `topK`.
- Avoid embedding new documents while generation is active.

## Memory pressure

RAG can load both embedder and generator models. This can create memory pressure.

Fixes:

- Index documents first, then dispose the embedder if the runtime allows it.
- Load the generator only after indexing completes.
- Keep document text outside the active prompt unless retrieved.
- Avoid storing full raw documents in UI state.
- Use `getMemoryStats()` before and after indexing.

## Stale or corrupted index

Symptoms:

- Search returns chunks from deleted files.
- Search returns nothing after app update.
- Scores look wrong after embedding model change.
- Source metadata points to old paths.

Fix checklist:

- Add index version metadata.
- Add embedding model metadata.
- Rebuild the index on incompatible changes.
- Delete partial index files after failed indexing.
- Use atomic write for index updates where possible.

## Diagnostics to collect

Attach:

- Edge Veda package version.
- Embedding model name and dimensions.
- Generator model name and `contextLength`.
- Number of documents and chunks.
- Average and maximum chunk size.
- `topK` and score threshold.
- Top retrieved chunks for a known question.
- Final prompt shape with private content removed.
- Memory stats before indexing, after indexing, and during generation.
- Whether rebuilding the index fixes the issue.

## Related docs

- [Model loading issues](./model-loading-issues.md)
- [Memory issues](./memory-issues.md)
- [Streaming issues](./streaming-issues.md)
- [Vector index](../guides/vector-index.md)
- [RAG pipeline](../guides/rag-pipeline.md)
- [Embeddings](../guides/embeddings.md)
- [Privacy and offline inference](../concepts/privacy-and-offline-inference.md)
