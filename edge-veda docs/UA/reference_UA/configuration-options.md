---
title: "Параметри конфігурації"
description: "Reference для configuration objects Edge Veda SDK: runtime options, generation settings, vision settings, image generation settings і budget-related configuration."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/budget.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/rag_pipeline.dart"
---

# Параметри конфігурації

Ця сторінка описує основні configuration objects, які використовуються в Edge Veda Flutter SDK.

Edge Veda створено для supervised on-device AI workloads. Тому конфігурація впливає не лише на якість відповіді моделі, а й на пам'ять, GPU acceleration, context size, thermal behavior, streaming, validation і стабільність runtime.

## Огляд конфігурації

| Configuration object | Де використовується | Призначення |
| --- | --- | --- |
| `EdgeVedaConfig` | `EdgeVeda.init()` | Ініціалізує core text, embedding і generation runtime. |
| `GenerateOptions` | `EdgeVeda.generate()`, `EdgeVeda.generateStream()`, `ChatSession` flows | Керує text generation, sampling, JSON mode, grammar constraints, streaming і confidence tracking. |
| `VisionConfig` | Vision initialization APIs і `VisionWorker` | Налаштовує VLM model loading, `mmprojPath`, context size, GPU use і memory budget. |
| `ImageGenerationConfig` | Image generation APIs і `ImageWorker` | Керує diffusion image size, steps, CFG scale, seed, sampler і scheduler. |
| `RagConfig` | `RagPipeline` | Керує retrieval behavior перед generation. |
| `EdgeVedaBudget` | `Scheduler` | Описує runtime limits для latency, battery, thermal і memory behavior. |

## `EdgeVedaConfig`

`EdgeVedaConfig` — основна конфігурація runtime, яка передається в `EdgeVeda.init()`.

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

### Поля

| Field | Type | Required | Default | Опис | Нотатки |
| --- | --- | --- | --- | --- | --- |
| `modelPath` | `String` | Так | — | Шлях до локального model file. | Зазвичай `.gguf` для LLM і embedding models. |
| `numThreads` | `int` | Ні | `4` | Кількість CPU threads для inference. | Більше значення може покращити throughput, але підвищити нагрів і витрату battery. |
| `contextLength` | `int` | Ні | `2048` | Максимальний context для prompt і generation у tokens. | Більше значення збільшує KV cache memory. |
| `useGpu` | `bool` | Ні | `true` | Вмикає Metal GPU acceleration, якщо platform це підтримує. | Рекомендовано для iOS і macOS builds з Metal. |
| `maxMemoryMb` | `int` | Ні | `1536` | Максимальний memory budget runtime у MB. | Використовується як safety budget на пристроях з обмеженою пам'яттю. |
| `verbose` | `bool` | Ні | `false` | Вмикає додаткові runtime logs. | Використовуйте під час development або troubleshooting. |
| `flashAttn` | `int` | Ні | `-1` | Flash attention mode. | `-1` = auto, `0` = disabled, `1` = enabled. |
| `kvCacheTypeK` | `int` | Ні | `8` | KV cache quantization type для keys. | `1` = `F16`, `8` = `Q8_0`. |
| `kvCacheTypeV` | `int` | Ні | `8` | KV cache quantization type для values. | `1` = `F16`, `8` = `Q8_0`. |

## Рекомендовані `EdgeVedaConfig` profiles

### Balanced mobile profile

Використовуйте як default для більшості iPhone apps.

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

Використовуйте на 4 GB devices, коли app також запускає camera, audio, RAG або image generation workloads.

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

Використовуйте під час перевірки model load issues, неправильного chat template або неочікуваного output.

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
  verbose: true,
);
```

Не залишайте `verbose: true` у production, якщо logs не відфільтровані та можуть містити user data.

## `GenerateOptions`

`GenerateOptions` керує тим, як модель генерує текст.

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

### Поля

| Field | Type | Default | Опис |
| --- | --- | --- | --- |
| `systemPrompt` | `String?` | `null` | Optional instruction, що задає поведінку або role моделі. |
| `maxTokens` | `int` | `512` | Максимальна кількість generated tokens. |
| `temperature` | `double` | `0.7` | Sampling randomness. Менші значення дають більш deterministic output. |
| `topP` | `double` | `0.9` | Nucleus sampling threshold. |
| `topK` | `int` | `40` | Обмежує sampling найбільш імовірними tokens. |
| `repeatPenalty` | `double` | `1.1` | Зменшує повтори в output. |
| `stopSequences` | `List<String>` | `[]` | Зупиняє generation, коли з'являється один із вказаних sequences. |
| `jsonMode` | `bool` | `false` | Просить модель повертати JSON output. |
| `stream` | `bool` | `false` | Позначає streaming behavior для сумісних flows. |
| `grammarStr` | `String?` | `null` | GBNF grammar для constrained decoding. |
| `grammarRoot` | `String?` | `null` | Root rule name для `grammarStr`. |
| `confidenceThreshold` | `double` | `0.0` | Вмикає confidence tracking і cloud handoff signal, якщо більше за `0.0`. |

## Типові generation presets

| Use case | Рекомендовані options |
| --- | --- |
| Deterministic extraction | `temperature: 0.0`, `topP: 1.0`, `jsonMode: true` |
| Chat assistant | `temperature: 0.7`, `topP: 0.9`, `repeatPenalty: 1.1` |
| Short command parsing | `maxTokens: 128`, `temperature: 0.1`, налаштовані `stopSequences` |
| RAG answer generation | `temperature: 0.2–0.4`, `maxTokens: 256–768`, низькі повтори |
| Tool calling | tool-capable model і відповідний `ChatTemplateFormat` |

## `VisionConfig`

Використовуйте `VisionConfig` для ініціалізації vision-language model.

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

| Field | Type | Required | Default | Опис |
| --- | --- | --- | --- | --- |
| `modelPath` | `String` | Так | — | Шлях до VLM model file. |
| `mmprojPath` | `String` | Так | — | Шлях до multimodal projector file. |
| `numThreads` | `int` | Ні | `4` | CPU thread count для vision inference. |
| `contextSize` | `int` | Ні | `0` | Vision context size. `0` означає automatic selection. |
| `useGpu` | `bool` | Ні | `true` | Вмикає GPU acceleration, якщо platform це підтримує. |
| `maxMemoryMb` | `int` | Ні | `1536` | Memory budget для vision context. |

## `ImageGenerationConfig`

`ImageGenerationConfig` керує text-to-image generation.

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

| Field | Type | Default | Опис |
| --- | --- | --- | --- |
| `negativePrompt` | `String?` | `null` | Описує, чого модель має уникати. |
| `width` | `int` | `512` | Width output image у pixels. |
| `height` | `int` | `512` | Height output image у pixels. |
| `steps` | `int` | `4` | Кількість diffusion denoising steps. |
| `cfgScale` | `double` | `1.0` | Classifier-free guidance scale. |
| `seed` | `int` | `-1` | Random seed. `-1` означає random. |
| `sampler` | `ImageSampler` | `ImageSampler.eulerA` | Diffusion sampler. |
| `schedule` | `ImageSchedule` | `ImageSchedule.defaultSchedule` | Noise schedule. |

## `RagConfig`

`RagConfig` керує retrieval перед answer generation.

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

| Field | Typical value | Опис |
| --- | --- | --- |
| `topK` | `3` | Кількість retrieved chunks, які додаються до prompt. |
| `minScore` | `0.5` | Мінімальний similarity score для прийняття retrieved context. |

Зменшуйте `topK`, якщо `contextLength` обмежений. Підвищуйте `minScore`, якщо неправильні або слабко пов'язані fragments гірші, ніж відсутній context.

## Budget profiles

`Scheduler` може застосовувати `EdgeVedaBudget`, щоб тримати workloads у прогнозованих runtime limits.

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

| Profile | Для чого підходить | Поведінка |
| --- | --- | --- |
| `BudgetProfile.conservative` | Background workloads і низька витрата battery | Тримає жорсткіші thermal і battery limits. |
| `BudgetProfile.balanced` | Default mobile apps | Балансує latency, stability і battery. |
| `BudgetProfile.performance` | Latency-sensitive interactive apps | Дозволяє агресивніше resource use. |

## Checklist конфігурації

Перед release перевірте, що:

- `modelPath` вказує на реальний local model file.
- `contextLength` достатньо малий для target device.
- `useGpu` увімкнено лише на platforms, де backend це підтримує.
- `maxMemoryMb` залишає місце для UI, camera, audio, database і vector index workloads.
- `GenerateOptions` налаштовані під конкретний use case, а не скопійовані глобально.
- `jsonMode`, `grammarStr` або `sendStructured()` використовуються для strict structured output.
- `confidenceThreshold` увімкнено лише тоді, коли app має чіткий handoff або fallback behavior.
- vision models мають і `modelPath`, і `mmprojPath`.
- image generation settings перевірені проти memory budget target device.
- performance вимірюється у `release` або `profile` mode.

## Пов'язані docs

- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Memory management](../guides/memory-management.md)
