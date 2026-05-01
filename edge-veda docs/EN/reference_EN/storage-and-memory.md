---
title: "Storage and memory"
description: "Reference for Edge Veda model storage, runtime memory, model cache, vector indexes, memory pressure, and cleanup strategies."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/budget.dart"
  - "flutter/lib/src/vector_index.dart"
---

# Storage and memory

This page explains how Edge Veda uses local storage and runtime memory.

On-device AI apps are often limited by memory before they are limited by raw compute. Model files can be hundreds of megabytes or several gigabytes, and loaded models also need memory for context, KV cache, multimodal projectors, image tensors, audio buffers, and vector indexes.

## Storage areas

| Storage area | What it contains | Managed by |
| --- | --- | --- |
| Model cache | Downloaded LLM, VLM, Whisper, and projector files. | `ModelManager` |
| App bundle | Prepackaged demo models or assets. | app developer |
| App support directory | Persistent model files and generated indexes. | Flutter app / `ModelManager` |
| Temporary directory | Partial downloads and intermediate files. | app developer |
| Vector index storage | Chunk metadata and embeddings for RAG. | `VectorIndex` / app developer |
| Trace/log storage | `PerfTrace`, debug logs, benchmark outputs. | app developer |
| User content storage | Uploaded documents, images, audio, generated outputs. | app developer |

## Model cache

`ModelManager` downloads and locates models.

```dart
final modelManager = ModelManager();
final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

await edgeVeda.init(
  EdgeVedaConfig(modelPath: modelPath),
);
```

Treat the model cache as persistent app data. It can survive restarts, but the app should let users delete downloaded models.

## Stored file extensions

| Model type | Typical extension | Notes |
| --- | --- | --- |
| LLM | `.gguf` | Used by llama.cpp backend. |
| Embedding model | `.gguf` | Used by `embed()` and RAG. |
| Vision-language model | `.gguf` | Main VLM file. |
| Vision projector | `.gguf` | Matching `mmproj` file. |
| Whisper STT model | `.bin` | whisper.cpp-compatible file. |
| Image generation model | backend-specific | Must match the image backend build. |

## Storage sizing

| Workload | Typical storage impact |
| --- | --- |
| Compact text model | ~400–700 MB |
| 2B text model | ~1.5–2.5 GB |
| 7B–8B text model | ~4.5–5.5 GB |
| 12B text model | ~7 GB+ |
| Small VLM pair | Main model + `mmproj`, usually several hundred MB |
| Large VLM pair | Several GB for main model + projector |
| Whisper tiny/base | ~80–150 MB |
| Whisper medium/large | Hundreds of MB to several GB |
| Vector index | Depends on document count, chunk size, embedding dimension, and metadata |

## Memory configuration

`EdgeVedaConfig` controls core runtime memory behavior.

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  maxMemoryMb: 1536,
  flashAttn: -1,
  kvCacheTypeK: 8,
  kvCacheTypeV: 8,
);
```

| Field | Memory impact |
| --- | --- |
| `modelPath` | Determines which model is loaded. |
| `contextLength` | Larger context increases KV cache memory. |
| `maxMemoryMb` | Sets a memory safety budget. |
| `flashAttn` | Can improve attention memory access patterns. |
| `kvCacheTypeK` | Controls key cache quantization. |
| `kvCacheTypeV` | Controls value cache quantization. |

## KV cache memory

KV cache memory grows with context length. For mobile devices, keep `contextLength` conservative and use the default `Q8_0` KV cache settings unless measurements show a reason to change them.

| Value | Meaning |
| --- | --- |
| `1` | `F16` KV cache |
| `8` | `Q8_0` KV cache |

Default:

```dart
kvCacheTypeK: 8,
kvCacheTypeV: 8,
```

## Runtime memory statistics

```dart
final stats = await edgeVeda.getMemoryStats();

if (stats.isHighPressure) {
  // Reduce context, stop another workload, or dispose an idle worker.
}
```

| Field | Description |
| --- | --- |
| `currentBytes` | Current total memory usage. |
| `peakBytes` | Peak memory usage. |
| `limitBytes` | Memory limit in bytes. |
| `modelBytes` | Memory used by the loaded model. |
| `contextBytes` | Memory used by inference context. |
| `usagePercent` | Fraction of memory budget used. |
| `isHighPressure` | `usagePercent > 0.8`. |
| `isCritical` | `usagePercent > 0.9`. |

## Worker lifecycle

Persistent workers improve performance because models do not reload for every call. They also keep memory allocated.

| Worker | Memory behavior | Cleanup |
| --- | --- | --- |
| `StreamingWorker` | Keeps text model loaded. | Dispose text runtime when finished. |
| `VisionWorker` | Loads VLM and `mmproj`; can be large. | Call `disposeVision()`. |
| `WhisperWorker` | Keeps Whisper model loaded. | Stop or dispose voice session. |
| `ImageWorker` | Image models and buffers can be large. | Call `disposeImageGeneration()`. |
| RAG index | Keeps embeddings and metadata accessible. | Persist or unload when inactive. |

## Memory and scheduler

`Scheduler` can enforce budgets and react to memory ceiling violations.

```dart
scheduler.setBudget(
  const EdgeVedaBudget(
    memoryCeilingMb: 1536,
  ),
);
```

Memory ceiling is observe-only for QoS changes because reducing tokens or resolution does not unload model memory. To free memory, register memory eviction callbacks or explicitly dispose the relevant worker.

```dart
scheduler.registerMemoryEviction(
  WorkloadId.vision,
  () async {
    await edgeVeda.disposeVision();
  },
);
```

## RAG storage and memory

RAG adds storage and memory pressure through source documents, chunk metadata, embedding vectors, vector index structures, and retrieved context inserted into prompts.

| Setting | Effect |
| --- | --- |
| Chunk size | Smaller chunks reduce prompt bloat but increase index size. |
| Embedding dimension | Higher dimensions increase vector memory. |
| Document count | More documents increase storage and retrieval cost. |
| `topK` | More retrieved chunks increase prompt tokens. |
| `minScore` | Higher threshold reduces weak context. |

## Image generation memory

Memory grows with image width, image height, denoising steps, model size, sampler, schedule, and concurrent workloads.

Start conservatively:

```dart
const config = ImageGenerationConfig(
  width: 512,
  height: 512,
  steps: 4,
  cfgScale: 1.0,
);
```

Avoid running image generation at the same time as a large VLM or long-context chat session on low-memory devices.

## Cleanup policy

Apps should provide user-facing cleanup options:

- list downloaded models;
- show model size;
- delete individual models;
- clear all downloaded models;
- delete temporary files;
- reset RAG indexes;
- export or delete generated outputs;
- explain that inference remains local.

## Production checklist

- Detect available disk space before model download.
- Clean up failed downloads.
- Validate checksums when available.
- Let users delete downloaded models.
- Store VLM projectors with their matching model.
- Keep `contextLength` safe for target devices.
- Set `maxMemoryMb` below the practical device limit.
- Dispose idle workers.
- Apply retention to RAG indexes.
- Avoid storing sensitive prompts or outputs in traces by default.

## Related docs

- [Performance metrics](./performance-metrics.md)
- [Configuration options](./configuration-options.md)
- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Memory management](../guides/memory-management.md)
