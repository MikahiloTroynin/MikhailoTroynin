---
title: "Model management"
description: "How to think about model selection, storage, loading, lifecycle, and device-aware model recommendations in Edge Veda."
status: "draft"
section: "concepts"
locale: "en"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
related:
  - "model-compatibility.md"
  - "quantization.md"
  - "runtime-supervision.md"
---

# Model management

Model management is the set of decisions and runtime behaviors around selecting, storing, validating, loading, reusing, and disposing local AI models.

In Edge Veda, a model is not only a file path passed to `EdgeVedaConfig`. It affects app size, download flow, startup time, memory use, thermal behavior, battery use, privacy, and user experience.

## Lifecycle

Model management covers the full lifecycle:

1. choose a model for a use case;
2. check whether the device can run it;
3. confirm storage availability;
4. download or bundle the model;
5. verify that the file exists and is usable;
6. initialize the correct worker or runtime path;
7. reuse the model across requests;
8. dispose or evict it when appropriate;
9. migrate or replace it during updates.

Each step should be visible in documentation and code.

## Model selection

A model should be selected for a feature, not only for benchmark rank.

| Use case | Selection concern |
| --- | --- |
| Chat | Instruction following, latency, context length. |
| Tool calling | JSON and function-call reliability. |
| Vision | Image understanding and projector compatibility. |
| Speech-to-text | Language support and chunk latency. |
| Embeddings | Vector dimension and retrieval quality. |
| Image generation | Memory use, generation time, sampler support. |

A smaller model that fits comfortably often creates a better product experience than a larger model that barely runs.

## Device-aware recommendation

Edge Veda includes the concept of a Smart Model Advisor. The advisor recommends models based on device and use case.

A recommendation may consider:

- iPhone model;
- RAM or device tier;
- chip generation;
- storage availability;
- use case;
- context length;
- expected speed;
- expected quality;
- GPU acceleration availability.

Treat the result as a recommendation for a specific device and feature, not as a universal model ranking.

## Fit checks

Before downloading or loading a model, the app should check whether it is likely to fit.

A fit check can answer:

- is the model too large for this device class?
- is there enough free storage?
- does the quantization match the target device?
- does the format match the capability?
- is the requested context length realistic?
- should the app suggest a smaller model?

Fit checks are especially important when users can choose models themselves.

## Storage strategy

Models are large files, so a production app needs a storage strategy.

Options include:

- bundle a small default model with the app;
- download models after installation;
- let users choose which models to download;
- cache models locally;
- remove unused models;
- keep separate models for chat, vision, speech, embeddings, and image generation.

Documentation should include expected model size, download source, target directory, failure behavior, and storage-full behavior.

## Model paths

Edge Veda APIs need local paths to model files. The path must point to a file available inside the app sandbox at runtime.

Common failures:

- the file was not downloaded;
- the path points to a temporary location that was cleared;
- the app cannot read the file;
- the extension or format is wrong;
- a model moved during an app update;
- a vision model is missing a projector file.

Show where paths come from and how developers can validate them before initialization.

## Initialization

Model initialization can be expensive because it loads native resources and prepares a worker.

A good flow:

1. validate configuration;
2. check file existence;
3. check compatibility;
4. spawn the worker if needed;
5. load the native model;
6. show loading state or progress;
7. return a clear success or failure result.

Do not hide long initialization behind a blank screen.

## Reuse, persistence, and eviction

Repeated model loading is expensive. Edge Veda uses persistent workers so models can stay loaded across requests.

Reuse is useful for chat sessions, repeated summarization, continuous vision, streaming speech transcription, repeated image generation, and RAG queries over the same index. The trade-off is memory. Idle workers may be evicted under memory pressure.

## Versioning and migration

Model updates can change behavior. A new version may have a different tokenizer, template, context length, embedding dimension, or output style.

A migration plan should define:

- model version naming;
- how installed versions are detected;
- whether old vector indexes remain valid;
- when the app should redownload a model;
- how rollback works.

Embedding models need special care: changing the embedding model may require rebuilding the vector index.

## Security and privacy

Local inference improves privacy, but model management still matters.

Consider whether model downloads use trusted channels, whether files are verified before use, whether prompts or traces are logged, whether vector indexes contain sensitive documents, and whether generated content is stored.

## Summary

Model management connects AI capability to production behavior. It covers model choice, device fit, storage, loading, reuse, eviction, migration, and privacy. In Edge Veda, treat model management as part of feature design, not as a hidden setup detail.
