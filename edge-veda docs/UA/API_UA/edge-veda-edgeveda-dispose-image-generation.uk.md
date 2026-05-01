---
title: "EdgeVeda.disposeImageGeneration()"
description: "Сторінка API reference для методу disposeImageGeneration() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.disposeImageGeneration()`

> Dispose-ить image generation resources і unregisters image workloads from Scheduler.

Використовуйте `disposeImageGeneration()`, коли image generation більше не потрібна, перед switching SD models або коли memory pressure requires freeing Stable Diffusion worker.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `disposeImageGeneration()` |
| Category | Image generation / Resource lifecycle |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<void> disposeImageGeneration();
```

## What it does

`disposeImageGeneration()` unregisters `WorkloadId.image` і memory eviction callback from Scheduler, cancels image idle timer, dispose-ить `ImageWorker`, якщо він існує, clears worker reference і встановлює image generation initialized state у `false`. Метод не впливає на text inference, vision або STT.

## When to use it

Використовуйте `disposeImageGeneration()` коли потрібно:

- звільнити Stable Diffusion model memory після image generation;
- перейти на іншу image model;
- реагувати на Scheduler memory eviction або app-level memory pressure;
- clean up image generation окремо від text і vision runtimes.

Не використовуйте цей метод, коли:

- потрібно fully dispose entire `EdgeVeda` instance; використовуйте `dispose()`;
- потрібно stop text generation; цей метод не affects text worker;
- потрібно clean up manually created `ImageWorker` outside `EdgeVeda`; dispose that worker directly.

## Prerequisites

Перед викликом методу переконайтесь, що:

- Prerequisite не потрібен; method can be used as defensive cleanup call;
- якщо generation currently active, coordinate cancellation/cleanup at app layer;
- if reinitializing immediately, prepare new model path before calling `initImageGeneration()` again.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

`Future<void>` — завершується після cleanup image workload registration, idle timer і image worker state.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Method designed as cleanup path. | Unexpected errors treat as SDK defects and log them. |
| Worker disposal error | Underlying worker disposal could fail unexpectedly. | Log, clear application state і recreate `EdgeVeda` instance if needed. |

## Minimal example

```dart
await edgeVeda.disposeImageGeneration();
```

## Production-style example

```dart
Future<void> closeImageMode(EdgeVeda edgeVeda) async {
  try {
    await edgeVeda.disposeImageGeneration();
  } finally {
    debugPrint('Image generation mode closed');
  }
}
```

## Streaming example

Не застосовується. `disposeImageGeneration()` — cleanup call і не повертає stream.

## Behavior notes

- Scheduler image workload і memory eviction registration removed defensively.
- Image idle timer cancelled і cleared.
- Image worker disposed if exists.
- Internal `_imageWorker` reference set to `null`.
- `isImageInitialized` стає `false`.
- Text inference, vision і STT not affected.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Memory release | Frees large SD model resources held by image worker. | Call after image-generation workflows або under memory pressure. |
| Scheduler cleanup | Prevents stale workload/eviction callbacks. | Use before switching models або destroying SDK instance. |
| Idle timer | Cancels pending auto-disposal timer. | Avoid duplicate cleanup logic at app level. |
| Reinitialization | Allows `initImageGeneration()` with same/different model. | Dispose before switching image models. |

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

- Input data processed: none.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: prompts/images не processed, але cleanup logs should avoid exposing file paths.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Image generation fails after dispose | Image worker intentionally removed. | Call `initImageGeneration()` again before generating. |
| Memory still appears high | OS cache або another runtime still holds memory. | Profile on device and dispose other workers if needed. |
| Scheduler still shows image workload | Scheduler state did not update або separate registration exists. | Check app-level Scheduler registrations/logs. |
| Calling dispose twice | Second call finds no worker. | This should be safe as defensive cleanup. |

## Related APIs

- `EdgeVeda.initImageGeneration()` — initializes image generation again.
- `EdgeVeda.generateImage()` — requires image generation initialization.
- `EdgeVeda.generateImageRaw()` — requires image generation initialization.
- `EdgeVeda.dispose()` — calls this method as part of full cleanup.
- `Scheduler.unregisterWorkload()` — related scheduler cleanup behavior.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.disposeImageGeneration()`
- Related worker: `ImageWorker`
- Related Scheduler workload: `WorkloadId.image`

## Documentation review checklist

Перед публікацією перевірте:

- Method still unregisters scheduler workload and memory eviction.
- Idle timer cleanup behavior current.
- Method does not affect text inference/vision.
- Cleanup example compiles.
- Double-dispose behavior reviewed.
