---
title: "Glossary"
description: "Glossary of Edge Veda SDK, runtime, model, performance, memory, RAG, vision, speech, and platform terms."
status: "draft"
section: "reference"
last_reviewed: "2026-05-01"
source_files:
  - "README.md"
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/budget.dart"
  - "flutter/lib/src/vector_index.dart"
  - "flutter/lib/src/rag_pipeline.dart"
---

# Glossary

This glossary defines common terms used across Edge Veda documentation.

Use it to keep naming consistent across guides, API reference pages, examples, troubleshooting, and platform notes.

## Core concepts

| Term | Definition |
| --- | --- |
| Edge Veda | A managed on-device AI runtime for Flutter applications. It runs text, vision, speech, embeddings, RAG, and related AI workloads locally under runtime supervision. |
| on-device AI | AI inference that runs on the user's device instead of a remote server. |
| local inference | Another name for on-device inference. In Edge Veda docs, it means the model call does not require a network request. |
| private by default | Design principle that inference runs locally and does not send prompts, images, audio, embeddings, or documents to a server unless the host app adds network behavior. |
| supervised runtime | A runtime that monitors device conditions and applies policy decisions instead of simply running a model until it fails. |
| workload | A unit of AI work managed by the runtime, such as text generation, vision, STT, RAG, or image generation. |
| persistent worker | A background worker that keeps a model loaded across calls to avoid repeated model load cost. |
| isolate | Dart concurrency primitive used to run blocking work away from the UI thread. |
| FFI | Foreign Function Interface. Edge Veda uses Dart FFI to call native C/C++ inference code. |
| native backend | The C/C++ layer that performs inference, such as llama.cpp, whisper.cpp, or stable-diffusion.cpp. |
| main thread | The UI thread. Long-running inference must not run here. |
| runtime policy | Rules that decide how workloads should behave under thermal, memory, battery, or latency constraints. |
| graceful degradation | Reducing workload quality or frequency instead of crashing or freezing the app. |

## SDK objects

| Term | Definition |
| --- | --- |
| `EdgeVeda` | Main SDK entry point for text generation, streaming, embeddings, vision, image generation, memory stats, and disposal operations. |
| `EdgeVedaConfig` | Configuration object used to initialize the core runtime. Includes `modelPath`, `contextLength`, `numThreads`, `useGpu`, `maxMemoryMb`, `flashAttn`, and KV cache settings. |
| `GenerateOptions` | Options for text generation, including `systemPrompt`, `maxTokens`, `temperature`, `topP`, `topK`, `repeatPenalty`, `stopSequences`, `jsonMode`, `grammarStr`, and `confidenceThreshold`. |
| `GenerateResponse` | Result object returned by non-streaming generation. Contains generated text and metrics such as token counts, latency, and tokens per second. |
| `TokenChunk` | A streamed token event emitted by `generateStream()` or chat streaming APIs. |
| `ChatSession` | Higher-level conversation helper that manages multi-turn chat state, templates, tool calling, and context behavior. |
| `CancelToken` | Object used to cancel a long-running or streaming generation request. |
| `VisionConfig` | Configuration object for vision-language model initialization. Includes `modelPath`, `mmprojPath`, `contextSize`, `numThreads`, `useGpu`, and `maxMemoryMb`. |
| `ImageGenerationConfig` | Configuration object for text-to-image generation, including `width`, `height`, `steps`, `cfgScale`, `seed`, `sampler`, and `schedule`. |
| `MemoryStats` | Runtime memory snapshot with current, peak, model, context, limit, and pressure fields. |
| `MemoryPressureEvent` | Event emitted when memory use crosses warning, high, or critical thresholds. |

## Models and formats

| Term | Definition |
| --- | --- |
| model file | Local file that contains model weights and metadata. |
| `modelPath` | File path passed to `EdgeVedaConfig` or related APIs to load a model. |
| `GGUF` | Model file format used by llama.cpp and many local LLM/VLM/embedding models. |
| `GGML` | Model file format family used by whisper.cpp files such as Whisper `.bin` models. |
| LLM | Large Language Model used for text generation, chat, summarization, reasoning, and structured output. |
| VLM | Vision-Language Model used for image understanding and image-to-text tasks. |
| `mmproj` | Multimodal projector file required by many VLMs. It maps visual embeddings into the language model space. |
| embedding model | Model that converts text into numeric vectors for similarity search and RAG. |
| Whisper model | Speech-to-text model used by whisper.cpp. |
| image generation model | Model used by the image generation backend to produce images from prompts. |
| `ModelInfo` | Metadata object that describes a downloadable model: ID, name, size, URL, checksum, format, quantization, family, and capabilities. |
| `ModelRegistry` | Collection of preconfigured model definitions used by examples and model management flows. |
| `ModelManager` | Component that downloads, stores, locates, and validates model files. |
| `DownloadProgress` | Progress event for model downloads. Includes information such as downloaded bytes and total bytes. |
| checksum | Hash used to verify that a downloaded model file is complete and unmodified. |

## Quantization and memory

| Term | Definition |
| --- | --- |
| quantization | Technique that stores model weights or caches with lower precision to reduce file size and memory use. |
| `Q4_K_M` | Common 4-bit quantization level used by mobile-friendly LLMs. |
| `Q8_0` | 8-bit quantization level often used for small models or KV cache settings. |
| `F16` | 16-bit floating-point precision, often used for higher-precision components such as projectors. |
| KV cache | Key/value cache used by transformer models during generation. It grows with context length. |
| `kvCacheTypeK` | Quantization setting for key cache. |
| `kvCacheTypeV` | Quantization setting for value cache. |
| `contextLength` | Maximum number of tokens that fit into the model context. Higher values increase memory use. |
| `maxMemoryMb` | Configured memory budget for the runtime. |
| memory pressure | Situation where current memory use approaches or exceeds the configured or practical limit. |
| `flashAttn` | Flash attention mode. In Edge Veda config, `-1` means automatic, `0` disabled, and `1` enabled. |
| model eviction | Unloading or disposing a model or worker to release memory. |
| steady-state memory | Memory used after the model has loaded and the runtime is operating normally. |
| peak memory | Highest memory use observed during a run. |

## Generation and chat

| Term | Definition |
| --- | --- |
| prompt | Input text sent to the model. |
| system prompt | Instruction that sets model behavior, role, or constraints. |
| completion | Text generated by the model. |
| token | Unit of text processed by the model. A word may contain one or more tokens. |
| streaming generation | Generation mode where tokens are emitted incrementally. |
| blocking generation | Generation mode where the final response is returned only after generation finishes. |
| `temperature` | Sampling setting that controls randomness. Lower values are more deterministic. |
| `topP` | Nucleus sampling threshold. |
| `topK` | Sampling setting that limits token selection to the most likely tokens. |
| `repeatPenalty` | Sampling setting that reduces repetitive output. |
| `stopSequences` | Strings that stop generation when emitted. |
| `jsonMode` | Generation option that requests JSON output. |
| GBNF | Grammar format used for constrained decoding. |
| `grammarStr` | GBNF grammar passed to `GenerateOptions`. |
| `grammarRoot` | Entry rule used by the grammar. |
| structured output | Output constrained to a predictable format such as JSON. |
| confidence tracking | Optional per-token confidence scoring used for fallback or handoff decisions. |
| cloud handoff | Optional app-level fallback when confidence or local capability is insufficient. Edge Veda does not require cloud inference by default. |

## Function calling

| Term | Definition |
| --- | --- |
| function calling | Model capability where the model requests a structured tool call instead of only producing text. |
| tool calling | Another name for function calling. |
| `ToolDefinition` | Description of a callable tool: name, description, and parameter schema. |
| `ToolRegistry` | Collection of tools available to a chat session. |
| `ToolCall` | A model-requested tool invocation. |
| `ToolResult` | Result returned by the app after executing a tool call. |
| tool-capable model | Model tuned or prompted to produce structured tool calls reliably. |
| tool loop | Multi-step process where the model calls a tool, receives a result, and continues generation. |

## Embeddings and RAG

| Term | Definition |
| --- | --- |
| embedding | Numeric vector representation of text. |
| vector | Ordered list of numbers used for similarity search. |
| vector index | Search structure for finding similar embeddings. |
| `VectorIndex` | Edge Veda's Dart vector search component. |
| HNSW | Hierarchical Navigable Small World graph algorithm used for approximate nearest-neighbor search. |
| cosine similarity | Similarity measure often used to compare embeddings. |
| RAG | Retrieval-Augmented Generation. The app retrieves relevant context and injects it into the model prompt before generation. |
| `RagPipeline` | End-to-end pipeline for embedding a query, searching a vector index, injecting context, and generating an answer. |
| `RagConfig` | Configuration for RAG retrieval, such as `topK` and `minScore`. |
| `topK` | Number of retrieved chunks requested. |
| `minScore` | Minimum similarity score required for a retrieved chunk. |
| chunk | Piece of a larger document used for embedding and retrieval. |
| context injection | Adding retrieved chunks to the model prompt. |

## Vision, speech, and image generation

| Term | Definition |
| --- | --- |
| `VisionWorker` | Worker that keeps a vision model and projector loaded for repeated image inference. |
| `describeImage()` | API that produces a text description or answer about an image. |
| `describeFrame()` | Vision worker operation for processing a camera frame or image frame. |
| frame queue | Backpressure component that decides whether to process or drop incoming frames. |
| STT | Speech-to-text. |
| `WhisperSession` | Higher-level speech-to-text session helper. |
| `WhisperWorker` | Worker that runs Whisper transcription in the background. |
| TTS | Text-to-speech. In Edge Veda apps, TTS may use OS speech APIs. |
| `TtsService` | Service wrapper for text-to-speech features. |
| `ImageWorker` | Worker used for image generation workloads. |
| `ImageSampler` | Sampler used during diffusion image generation. |
| `ImageSchedule` | Noise schedule used during diffusion image generation. |
| `cfgScale` | Classifier-free guidance scale for image generation. |
| `steps` | Number of denoising steps in image generation. |
| seed | Value used to make image generation reproducible when supported. |

## Runtime supervision and observability

| Term | Definition |
| --- | --- |
| `Scheduler` | Central runtime component that manages workloads, budgets, priorities, and degradation. |
| `EdgeVedaBudget` | Runtime budget definition for p95 latency, battery drain, thermal level, and memory ceiling. |
| `BudgetProfile` | Predefined adaptive profile such as conservative, balanced, or performance. |
| `WorkloadId` | Identifier for a workload, such as text, vision, STT, or image generation. |
| `WorkloadPriority` | Priority used by the scheduler when deciding what to degrade first. |
| QoS | Quality of Service level applied to a workload. |
| `BudgetViolation` | Event emitted when runtime behavior exceeds a configured budget. |
| `TelemetryService` | Component that polls device telemetry such as thermal state, battery, and memory. |
| `RuntimePolicy` | Policy that maps telemetry and constraints to runtime behavior. |
| hysteresis | Cooldown logic that prevents the system from rapidly switching between quality levels. |
| `PerfTrace` | Structured trace recorder for offline performance analysis. |
| JSONL | Newline-delimited JSON format used for trace logs. |
| p50 | Median value across measurements. |
| p95 | 95th percentile. Useful for production performance budgets. |
| p99 | 99th percentile. Useful for tail-latency analysis. |
| throughput | Amount of work completed per time unit, often tokens per second. |
| soak test | Long-running stability test that checks whether the runtime stays stable over time. |

## Platforms and build terms

| Term | Definition |
| --- | --- |
| iOS device | Physical iPhone or iPad target. Required for realistic performance and microphone/camera behavior. |
| iOS simulator | Simulator target. Useful for development, but not reliable for GPU, microphone, or performance validation. |
| macOS | Desktop Apple platform. Useful for larger models and development workflows. |
| Android | Platform target that may require validation depending on current release status. |
| Metal | Apple GPU acceleration framework. |
| Vulkan | Cross-platform graphics/compute API. Mentioned for future or platform-specific GPU work. |
| XCFramework | Apple package format for distributing native libraries across platforms and architectures. |
| CMake | Native build configuration tool. |
| `BUILD_TYPE` | Build variable that selects `Release`, `Debug`, or related native build type. |
| `ANDROID_NDK_HOME` | Environment variable that points to the Android NDK. |
| `IOS_DEPLOYMENT_TARGET` | Minimum iOS version used by iOS build scripts. |
| `--dart-define` | Flutter mechanism for passing compile-time values to Dart code. |

## Related docs

- [FAQ](./faq.md)
- [Configuration options](./configuration-options.md)
- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Performance metrics](./performance-metrics.md)
- [Storage and memory](./storage-and-memory.md)
- [Permissions](./permissions.md)
- [Environment variables](./environment-variables.md)
