---
title: "Configuration options"
description: "Reference for Edge Veda SDK configuration objects, runtime options, generation settings, vision settings, image generation settings, and budget-related configuration."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/budget.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/rag_pipeline.dart"
---

# Configuration options

This page is a reference for the most commonly used configuration objects in the Edge Veda Flutter SDK.

Edge Veda is designed for supervised on-device AI workloads. Configuration is therefore not only about model output quality. It also controls memory use, GPU acceleration, context size, thermal behavior, streaming, validation, and runtime stability.

## Configuration overview

| Configuration object | Used by | Purpose |
| --- | --- | --- |
| `EdgeVedaConfig` | `EdgeVeda.init()` | Initializes the core text, embedding, and generation runtime. |
| `GenerateOptions` | `EdgeVeda.generate()`, `EdgeVeda.generateStream()`, `ChatSession` flows | Controls text generation, sampling, JSON mode, grammar constraints, streaming, and confidence tracking. |
| `VisionConfig` | Vision initialization APIs and `VisionWorker` | Configures VLM model loading, `mmprojPath`, context size, GPU use, and memory budget. |
| `ImageGenerationConfig` | Image generation APIs and `ImageWorker` | Controls diffusion image size, steps, CFG scale, seed, sampler, and scheduler. |
| `RagConfig` | `RagPipeline` | Controls retrieval behavior before generation. |
| `EdgeVedaBudget` | `Scheduler` | Declares runtime limits for latency, battery, thermal, and memory behavior. |

## `EdgeVedaConfig`

`EdgeVedaConfig` is the main runtime configuration passed to `EdgeVeda.init()`.

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
  maxMemoryMb: 1536,
));
```

### Fields

| Field | Type | Required | Default | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| `modelPath` | `String` | Yes | — | Path to the local model file. | Usually a `.gguf` file for LLM and embedding models. |
| `numThreads` | `int` | No | `4` | Number of CPU threads used for inference. | Higher values can improve throughput, but may increase heat and battery use. |
| `contextLength` | `int` | No | `2048` | Maximum prompt and generation context in tokens. | Larger values increase KV cache memory. |
| `useGpu` | `bool` | No | `true` | Enables Metal GPU acceleration where supported. | Recommended for iOS and macOS builds that use Metal. |
| `maxMemoryMb` | `int` | No | `1536` | Maximum runtime memory budget in MB. | Used as a safety budget on memory-constrained devices. |
| `verbose` | `bool` | No | `false` | Enables additional runtime logging. | Use during development or troubleshooting. |
| `flashAttn` | `int` | No | `-1` | Flash attention mode. | `-1` = auto, `0` = disabled, `1` = enabled. |
| `kvCacheTypeK` | `int` | No | `8` | KV cache quantization type for keys. | `1` = `F16`, `8` = `Q8_0`. |
| `kvCacheTypeV` | `int` | No | `8` | KV cache quantization type for values. | `1` = `F16`, `8` = `Q8_0`. |

## Recommended `EdgeVedaConfig` profiles

### Balanced mobile profile

Use this as the default for most iPhone apps.

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
  maxMemoryMb: 1536,
  kvCacheTypeK: 8,
  kvCacheTypeV: 8,
);
```

### Low-memory profile

Use this profile on 4 GB devices, when the app also runs camera, audio, RAG, or image generation workloads.

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  numThreads: 4,
  useGpu: true,
  maxMemoryMb: 1024,
  kvCacheTypeK: 8,
  kvCacheTypeV: 8,
);
```

### Debug profile

Use this profile while validating model load issues, wrong chat templates, or unexpected output.

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
  verbose: true,
);
```

Do not leave `verbose: true` enabled in production unless the logs are filtered and safe for user data.

## `GenerateOptions`

`GenerateOptions` controls how text is generated.

```dart
final response = await edgeVeda.generate(
  'Summarize this text.',
  options: GenerateOptions(
    maxTokens: 256,
    temperature: 0.4,
    topP: 0.9,
    repeatPenalty: 1.1,
  ),
);
```

### Fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `systemPrompt` | `String?` | `null` | Optional instruction that sets model behavior or role. |
| `maxTokens` | `int` | `512` | Maximum number of generated tokens. |
| `temperature` | `double` | `0.7` | Sampling randomness. Lower values are more deterministic. |
| `topP` | `double` | `0.9` | Nucleus sampling threshold. |
| `topK` | `int` | `40` | Limits sampling to the most likely tokens. |
| `repeatPenalty` | `double` | `1.1` | Penalizes repeated output. |
| `stopSequences` | `List<String>` | `[]` | Stops generation when any listed sequence is emitted. |
| `jsonMode` | `bool` | `false` | Requests JSON output mode. |
| `stream` | `bool` | `false` | Indicates streaming behavior for compatible flows. |
| `grammarStr` | `String?` | `null` | GBNF grammar for constrained decoding. |
| `grammarRoot` | `String?` | `null` | Root rule name for `grammarStr`; defaults to the grammar root when omitted. |
| `confidenceThreshold` | `double` | `0.0` | Enables confidence tracking and cloud handoff signaling when greater than `0.0`. |

## Common generation presets

| Use case | Recommended options |
| --- | --- |
| Deterministic extraction | `temperature: 0.0`, `topP: 1.0`, `jsonMode: true` |
| Chat assistant | `temperature: 0.7`, `topP: 0.9`, `repeatPenalty: 1.1` |
| Short command parsing | `maxTokens: 128`, `temperature: 0.1`, `stopSequences` configured |
| RAG answer generation | `temperature: 0.2–0.4`, `maxTokens: 256–768`, low repetition |
| Tool calling | use a tool-capable model and the model's expected `ChatTemplateFormat` |

## `VisionConfig`

Use `VisionConfig` when initializing a vision-language model.

```dart
final config = VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  contextSize: 2048,
  useGpu: true,
  maxMemoryMb: 1536,
);
```

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `modelPath` | `String` | Yes | — | Path to the VLM model file. |
| `mmprojPath` | `String` | Yes | — | Path to the multimodal projector file. |
| `numThreads` | `int` | No | `4` | CPU thread count for vision inference. |
| `contextSize` | `int` | No | `0` | Vision context size. `0` means automatic selection. |
| `useGpu` | `bool` | No | `true` | Enables GPU acceleration where supported. |
| `maxMemoryMb` | `int` | No | `1536` | Memory budget for the vision context. |

## `ImageGenerationConfig`

`ImageGenerationConfig` controls text-to-image generation.

```dart
final config = ImageGenerationConfig(
  width: 512,
  height: 512,
  steps: 4,
  cfgScale: 1.0,
  seed: -1,
  sampler: ImageSampler.eulerA,
  schedule: ImageSchedule.defaultSchedule,
);
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `negativePrompt` | `String?` | `null` | Describes what the model should avoid. |
| `width` | `int` | `512` | Output image width in pixels. |
| `height` | `int` | `512` | Output image height in pixels. |
| `steps` | `int` | `4` | Number of diffusion denoising steps. |
| `cfgScale` | `double` | `1.0` | Classifier-free guidance scale. |
| `seed` | `int` | `-1` | Random seed. `-1` means random. |
| `sampler` | `ImageSampler` | `ImageSampler.eulerA` | Diffusion sampler. |
| `schedule` | `ImageSchedule` | `ImageSchedule.defaultSchedule` | Noise schedule. |

## `RagConfig`

`RagConfig` controls retrieval before answer generation.

```dart
final rag = RagPipeline(
  edgeVeda: edgeVeda,
  index: index,
  config: RagConfig(
    topK: 3,
    minScore: 0.5,
  ),
);
```

| Field | Typical value | Description |
| --- | --- | --- |
| `topK` | `3` | Number of retrieved chunks injected into the prompt. |
| `minScore` | `0.5` | Minimum similarity score for accepting retrieved context. |

Use a smaller `topK` when context length is limited. Use a higher `minScore` when wrong or loosely related passages are more harmful than missing context.

## Budget profiles

The `Scheduler` can apply an `EdgeVedaBudget` to keep workloads inside a predictable operating envelope.

```dart
final scheduler = Scheduler(telemetry: TelemetryService());

scheduler.setBudget(
  EdgeVedaBudget.adaptive(BudgetProfile.balanced),
);

scheduler.registerWorkload(
  WorkloadId.vision,
  priority: WorkloadPriority.high,
);

scheduler.start();
```

| Profile | Best for | Behavior |
| --- | --- | --- |
| `BudgetProfile.conservative` | Background workloads and low battery use | Keeps tighter thermal and battery limits. |
| `BudgetProfile.balanced` | Default mobile apps | Balances latency, stability, and battery. |
| `BudgetProfile.performance` | Latency-sensitive interactive apps | Allows more aggressive resource use. |

## Configuration checklist

Before shipping, verify that:

- `modelPath` points to a real local model file.
- `contextLength` is small enough for the target device.
- `useGpu` is enabled only on platforms where the backend supports it.
- `maxMemoryMb` leaves room for UI, camera, audio, database, and vector index workloads.
- `GenerateOptions` are tuned per use case, not copied globally.
- `jsonMode`, `grammarStr`, or `sendStructured()` are used for strict structured output.
- `confidenceThreshold` is enabled only when the app has a clear handoff or fallback behavior.
- vision models include both `modelPath` and `mmprojPath`.
- image generation settings are validated against the target device memory budget.
- production builds run in `release` or `profile` mode when measuring performance.

## Related docs

- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Memory management](../guides/memory-management.md)
