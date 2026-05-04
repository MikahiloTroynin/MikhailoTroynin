---
title: "Embeddings and RAG"
description: "How Edge Veda uses embeddings, local vector search, and RAG to answer questions over private documents on device."
status: "draft"
section: "concepts"
locale: "en"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
  - "examples/"
related:
  - "model-management.md"
  - "model-compatibility.md"
  - "privacy-and-offline-inference.md"
  - "observability.md"
---

# Embeddings and RAG

Embeddings and RAG let an Edge Veda app answer questions using local documents instead of relying only on the model’s internal memory.

An embedding converts text into a vector. Similar pieces of text produce vectors that are close to each other. RAG, or retrieval-augmented generation, uses embeddings to find relevant local content and inject it into the prompt before generation.

In Edge Veda, this pattern is designed for private, on-device document Q&A. The documents, embeddings, vector index, retrieved context, and generated answer can stay on the user’s device.

## Why embeddings are needed

A local language model has limited context. It cannot automatically know every document stored by the user. It also cannot reliably answer from private files unless relevant content is provided in the prompt.

Embeddings solve the retrieval part of the problem:

1. split documents into chunks;
2. generate an embedding for each chunk;
3. store embeddings in a local index;
4. embed the user question;
5. search for similar chunks;
6. pass the retrieved chunks to the generator.

This makes answers more grounded and reduces the need to paste large documents into every prompt.

## RAG flow

![c-embeddings-and-rag](mermaid-diagrams/c-embeddings-and-rag.png)

The important idea is that generation is not the first step. Retrieval happens before generation.

## Edge Veda building blocks

Edge Veda exposes several concepts that belong to this flow.

| Concept | Role |
| --- | --- |
| `embed()` | Creates an embedding for one text input. |
| `embedBatch()` | Creates embeddings for several text inputs. |
| `VectorIndex` | Stores vectors and searches by cosine similarity. |
| `RagPipeline` | Runs the full embed, search, inject, generate flow. |
| Confidence scoring | Helps detect weak model certainty. |
| Cloud handoff signal | Indicates when a local answer may need external fallback, if the app supports it. |

The exact public API should be verified against the current SDK before publishing code examples.

## Chunking strategy

Chunking defines how a document is split before embedding. Poor chunking creates poor retrieval.

A good chunk should be:

- small enough to fit into context with other chunks;
- large enough to preserve meaning;
- tied to metadata such as file name, heading, page, or paragraph;
- stable across app updates;
- easy to cite in the final answer.

Common chunking approaches:

| Approach | When to use |
| --- | --- |
| Paragraph chunks | Good for prose documents and notes. |
| Heading-based chunks | Good for Markdown, manuals, and specifications. |
| Sliding window chunks | Good when context crosses paragraph boundaries. |
| Semantic chunks | Good when the app can detect topic changes. |

Avoid giant chunks. They waste context and make source attribution vague.

## Metadata

A vector alone is not enough. Each embedded chunk should keep metadata.

Useful metadata includes:

- document ID;
- source path;
- title;
- heading;
- page number;
- paragraph number;
- created or updated time;
- chunk text;
- embedding model version.

Metadata helps the app show where an answer came from and decide when to rebuild an index.

## VectorIndex

`VectorIndex` is the local search layer. It stores vectors and returns the closest chunks for a query vector.

A useful index should support:

- cosine similarity search;
- persistent storage;
- metadata lookup;
- delete or update operations;
- index versioning;
- rebuild when the embedding model changes.

Because Edge Veda is designed for local inference, the index should be treated as sensitive local data. It may contain representations of private documents.

## RagPipeline

`RagPipeline` represents the end-to-end workflow.

A typical pipeline:

1. receives the user question;
2. embeds the question;
3. searches `VectorIndex`;
4. selects top chunks;
5. builds a grounded prompt;
6. calls local generation;
7. returns the answer and source references.

The pipeline should not blindly inject every retrieved chunk. It should control token budget and reject weak retrieval when results are not relevant enough.

## Prompt construction

A RAG prompt should clearly separate:

- the user question;
- retrieved context;
- answer instructions;
- citation or source rules;
- behavior when context is insufficient.

Recommended instruction:

```text
Answer using only the provided context.
If the context is not enough, say that the answer is not available in the local documents.
Do not invent missing facts.
```

This helps reduce hallucination, but it does not remove the need for validation.

## Confidence and fallback

Edge Veda includes confidence-related concepts. A low confidence signal can be used to show uncertainty, ask the user to refine the question, retrieve more documents, or trigger an explicit cloud handoff if the app supports hybrid behavior.

A privacy-first app should never send local document content to a cloud service silently. If cloud fallback exists, it should be opt-in and visible to the user.

## Common failure modes

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Relevant document is not found | Poor chunking, weak embedding model, missing index entry. | Rebuild chunks and index; test retrieval queries. |
| Answer cites wrong source | Metadata mismatch. | Store stable source IDs and verify chunk references. |
| Answer hallucinates | Prompt does not constrain the model or retrieval is weak. | Add stricter prompt rules and confidence checks. |
| Index breaks after update | Embedding model changed. | Rebuild vectors and update index version. |
| Search is slow | Index too large or unoptimized. | Limit corpus size, persist index, tune nearest-neighbor search. |

## Documentation checklist

When documenting an embeddings or RAG feature, include:

- embedding model and vector dimension;
- chunking strategy;
- metadata fields;
- index persistence format;
- update and delete behavior;
- retrieval thresholds;
- prompt construction rules;
- privacy behavior;
- confidence and fallback behavior;
- troubleshooting for weak retrieval.

## Summary

Embeddings and RAG turn local documents into retrievable context for local generation. In Edge Veda, this enables private document Q&A, semantic search, and grounded responses while keeping user data on the device.
