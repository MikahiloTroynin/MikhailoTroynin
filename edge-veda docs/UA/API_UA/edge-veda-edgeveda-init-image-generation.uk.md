---
title: "EdgeVeda.initImageGeneration()"
description: "Сторінка API reference для методу initImageGeneration() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.initImageGeneration()`

> Ініціалізує image generation зі Stable Diffusion model у persistent worker isolate.

Використовуйте `initImageGeneration()` перед `generateImage()` або `generateImageRaw()`. Image generation незалежна від text inference, але combined memory footprint може бути високим.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `initImageGeneration()` |
| Category | Image generation / Runtime initialization |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Text runtime не потрібен; ініціалізує image-generation runtime |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<void> initImageGeneration({
  required String modelPath,
  int numThreads = 0,
  bool useGpu = true,
});
```

## What it does

`initImageGeneration()` перевіряє, що image generation ще не initialized, валідовує non-empty `modelPath` і наявність Stable Diffusion model file, spawn-ить `ImageWorker`, initializes model і позначає image generation ready. Якщо підключено `Scheduler`, метод registers `WorkloadId.image` з low priority і registers memory eviction cleanup для image generation.

## When to use it

Використовуйте `initImageGeneration()` коли потрібно:

- підготувати Stable Diffusion model для repeated image generation;
- завантажити model один раз і reuse для multiple `generateImage()` calls;
- підключити image generation до Scheduler budget enforcement;
- відокремити text/vision runtime lifecycle від image generation lifecycle.

Не використовуйте цей метод, коли:

- потрібні тільки text generation, embeddings або VLM image description;
- Stable Diffusion model file missing або not local;
- target device не може витримати memory footprint image generation;
- image generation already initialized; спочатку викличте `disposeImageGeneration()`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- compatible Stable Diffusion GGUF model існує за `modelPath`;
- app має permission читати local model file;
- target device має достатньо RAM і GPU/CPU capacity;
- optional Scheduler configured before initialization, якщо budget integration required.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `modelPath` | `String` | Yes | — | Path до local Stable Diffusion model file. | Must not be empty; file must exist. |
| `numThreads` | `int` | No | `0` | CPU thread count для image generation. | `0` lets native backend choose/default. |
| `useGpu` | `bool` | No | `true` | Whether to use GPU acceleration where supported. | Best validated на Metal-capable Apple devices. |

## Returns

`Future<void>` — завершується, коли image worker spawned і Stable Diffusion model loaded.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | Return object немає. Successful completion означає, що image generation initialized. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `ImageGenerationException` | Image generation already initialized. | Call `disposeImageGeneration()` before reinitializing. |
| `ImageGenerationException` | `modelPath` empty або SD model file does not exist. | Передайте valid local model path і verify file before calling. |
| `ImageGenerationException` | Worker spawn або native image initialization fails. | Check model compatibility, memory, GPU/CPU path і device logs. |

## Minimal example

```dart
await edgeVeda.initImageGeneration(
  modelPath: '/path/to/sd-v2-1-turbo-q8.gguf',
);
```

## Production-style example

```dart
Future<void> prepareImageGeneration(
  EdgeVeda edgeVeda,
  String modelPath,
) async {
  try {
    await edgeVeda.initImageGeneration(
      modelPath: modelPath,
      numThreads: 0,
      useGpu: true,
    );
  } on ImageGenerationException catch (error) {
    throw Exception('Could not initialize image generation: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `initImageGeneration()` initializes persistent worker і не повертає stream.

## Behavior notes

- Метод rejects duplicate image initialization.
- Model file validated before worker initialization.
- Model loaded into persistent `ImageWorker` isolate.
- On initialization failure, worker disposed і reference cleared.
- If Scheduler connected, `WorkloadId.image` registered with low priority і memory eviction callback.
- Idle timer reset after successful initialization.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model load time | Stable Diffusion model initialization може тривати десятки секунд. | Покажіть loading UI і initialize only when needed. |
| Memory footprint | Image generation може використовувати multiple GB RAM/GPU memory. | Не запускайте heavy text/vision/image workloads together без тестів. |
| GPU usage | GPU acceleration може покращити speed на supported devices. | Keep `useGpu: true` on validated Metal devices; test fallback paths. |
| Worker lifecycle | Keeping model loaded improves subsequent generation latency. | Call `disposeImageGeneration()` when idle або under memory pressure. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family для image generation через stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation, наприклад 4 steps і CFG 1.0. |
| GGUF text LLM | No | Для цього є text generation APIs. |
| GGUF VLM | No | Для цього є vision APIs. |
| GGUF embedding model | No | Для цього є embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only або stub behavior може бути значно повільнішим, ніж physical devices. |
| macOS | Yes / package surface | Перевірте sandbox, file access і available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед claims. |
| Web | No | Потребує native runtime/FFI і local model files. |

## Privacy and security

- Input data processed: local model file path.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file.
- Sensitive data considerations: не логуйте full local paths, якщо вони expose user/project information.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Image generation already initialized` | Initialization called twice. | Call `disposeImageGeneration()` before reinitializing. |
| `Model path cannot be empty` | Empty `modelPath`. | Передайте non-empty local file path. |
| `SD model file not found` | File missing або inaccessible. | Verify download/import path і file permissions. |
| Initialization is very slow | Large model, cold start, CPU fallback або first Metal setup. | Use progress/loading UI і test release builds on physical devices. |

## Related APIs

- `EdgeVeda.generateImage()` — generates PNG-encoded image bytes після initialization.
- `EdgeVeda.generateImageRaw()` — generates raw RGB pixel data після initialization.
- `EdgeVeda.disposeImageGeneration()` — releases image generation resources.
- `ImageWorker.initImage()` — lower-level worker initialization path.
- `Scheduler` — optional budget enforcement для image workloads.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.initImageGeneration()`
- Related worker: `ImageWorker`
- Related enum/workload: `WorkloadId.image`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- Stable Diffusion model format/file requirements current.
- Scheduler registration and priority behavior correct.
- Idle timer behavior reviewed against source.
- Examples compile in Flutter project.
