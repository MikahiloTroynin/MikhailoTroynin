---
title: "Сховище і пам'ять"
description: "Reference для Edge Veda model storage, runtime memory, model cache, vector indexes, memory pressure і cleanup strategies."
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

# Сховище і пам'ять

Ця сторінка пояснює, як Edge Veda використовує local storage і runtime memory.

On-device AI apps часто обмежені memory раніше, ніж raw compute. Model files можуть займати сотні MB або кілька GB, а loaded models додатково потребують memory для context, KV cache, multimodal projectors, image tensors, audio buffers і vector indexes.

## Storage areas

| Storage area | Що містить | Managed by |
| --- | --- | --- |
| Model cache | Downloaded LLM, VLM, Whisper і projector files. | `ModelManager` |
| App bundle | Prepackaged demo models або assets. | app developer |
| App support directory | Persistent model files і generated indexes. | Flutter app / `ModelManager` |
| Temporary directory | Partial downloads і intermediate files. | app developer |
| Vector index storage | Chunk metadata і embeddings для RAG. | `VectorIndex` / app developer |
| Trace/log storage | `PerfTrace`, debug logs, benchmark outputs. | app developer |
| User content storage | Uploaded documents, images, audio, generated outputs. | app developer |

## Model cache

`ModelManager` downloads і locates models.

```dart
final modelManager = ModelManager();
final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

await edgeVeda.init(
  EdgeVedaConfig(modelPath: modelPath),
);
```

Model cache треба трактувати як persistent app data. Він може переживати restarts, але app має дозволяти users delete downloaded models.

## Stored file extensions

| Model type | Typical extension | Notes |
| --- | --- | --- |
| LLM | `.gguf` | Використовується llama.cpp backend. |
| Embedding model | `.gguf` | Для `embed()` і RAG. |
| Vision-language model | `.gguf` | Main VLM file. |
| Vision projector | `.gguf` | Matching `mmproj` file. |
| Whisper STT model | `.bin` | whisper.cpp-compatible file. |
| Image generation model | backend-specific | Має відповідати image backend build. |

## Storage sizing

| Workload | Typical storage impact |
| --- | --- |
| Compact text model | ~400–700 MB |
| 2B text model | ~1.5–2.5 GB |
| 7B–8B text model | ~4.5–5.5 GB |
| 12B text model | ~7 GB+ |
| Small VLM pair | Main model + `mmproj`, зазвичай кілька сотень MB |
| Large VLM pair | Кілька GB для main model + projector |
| Whisper tiny/base | ~80–150 MB |
| Whisper medium/large | Сотні MB або кілька GB |
| Vector index | Залежить від document count, chunk size, embedding dimension і metadata |

## Memory configuration

`EdgeVedaConfig` керує core runtime memory behavior.

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
| `modelPath` | Визначає, яка model завантажується. |
| `contextLength` | Larger context збільшує KV cache memory. |
| `maxMemoryMb` | Задає memory safety budget. |
| `flashAttn` | Може покращити attention memory access patterns. |
| `kvCacheTypeK` | Керує key cache quantization. |
| `kvCacheTypeV` | Керує value cache quantization. |

## KV cache memory

KV cache memory зростає разом із context length. Для mobile devices тримайте `contextLength` conservative і використовуйте default `Q8_0` KV cache settings, якщо measurements не показують потреби змінити їх.

| Value | Meaning |
| --- | --- |
| `1` | `F16` KV cache |
| `8` | `Q8_0` KV cache |

Типово:

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
| `modelBytes` | Memory used by loaded model. |
| `contextBytes` | Memory used by inference context. |
| `usagePercent` | Fraction of memory budget used. |
| `isHighPressure` | `usagePercent > 0.8`. |
| `isCritical` | `usagePercent > 0.9`. |

## Worker lifecycle

Persistent workers покращують performance, бо models не reload для кожного call. Водночас вони тримають allocated memory.

| Worker | Memory behavior | Cleanup |
| --- | --- | --- |
| `StreamingWorker` | Keeps text model loaded. | Dispose text runtime when finished. |
| `VisionWorker` | Loads VLM і `mmproj`; може бути large. | Call `disposeVision()`. |
| `WhisperWorker` | Keeps Whisper model loaded. | Stop або dispose voice session. |
| `ImageWorker` | Image models і buffers можуть бути large. | Call `disposeImageGeneration()`. |
| RAG index | Keeps embeddings і metadata accessible. | Persist або unload when inactive. |

## Memory і scheduler

`Scheduler` може enforce budgets і реагувати на memory ceiling violations.

```dart
scheduler.setBudget(
  const EdgeVedaBudget(
    memoryCeilingMb: 1536,
  ),
);
```

Memory ceiling є observe-only для QoS changes, бо reducing tokens або resolution не unload model memory. Щоб звільнити memory, register memory eviction callbacks або явно dispose relevant worker.

```dart
scheduler.registerMemoryEviction(
  WorkloadId.vision,
  () async {
    await edgeVeda.disposeVision();
  },
);
```

## RAG storage і memory

RAG додає storage і memory pressure через source documents, chunk metadata, embedding vectors, vector index structures і retrieved context, який inserted into prompts.

| Setting | Effect |
| --- | --- |
| Chunk size | Smaller chunks зменшують prompt bloat, але збільшують index size. |
| Embedding dimension | Higher dimensions збільшують vector memory. |
| Document count | More documents збільшують storage і retrieval cost. |
| `topK` | More retrieved chunks збільшують prompt tokens. |
| `minScore` | Higher threshold зменшує weak context. |

## Image generation memory

Memory grows with image width, image height, denoising steps, model size, sampler, schedule і concurrent workloads.

Починайте conservative:

```dart
const config = ImageGenerationConfig(
  width: 512,
  height: 512,
  steps: 4,
  cfgScale: 1.0,
);
```

Не запускайте image generation одночасно з large VLM або long-context chat session на low-memory devices.

## Cleanup policy

Apps мають мати user-facing cleanup options:

- list downloaded models;
- show model size;
- delete individual models;
- clear all downloaded models;
- delete temporary files;
- reset RAG indexes;
- export або delete generated outputs;
- пояснити, що inference remains local.

## Production checklist

- Detect available disk space перед model download.
- Clean up failed downloads.
- Validate checksums, якщо available.
- Дати users можливість delete downloaded models.
- Store VLM projectors з matching model.
- Тримати `contextLength` safe для target devices.
- Set `maxMemoryMb` нижче practical device limit.
- Dispose idle workers.
- Apply retention до RAG indexes.
- Не зберігати sensitive prompts або outputs у traces by default.

## Пов'язані docs

- [Performance metrics](./performance-metrics.md)
- [Configuration options](./configuration-options.md)
- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Memory management](../guides/memory-management.md)
