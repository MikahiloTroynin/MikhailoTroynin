---
title: "EdgeVeda.disposeImageGeneration()"
description: "API reference page for the disposeImageGeneration() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.disposeImageGeneration()`

> Disposes image generation resources and unregisters image workloads from the Scheduler.

Use `disposeImageGeneration()` when image generation is no longer needed, before switching SD models, or when memory pressure requires freeing the Stable Diffusion worker.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `disposeImageGeneration()` |
| Category | Image generation / Resource lifecycle |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
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

`disposeImageGeneration()` unregisters `WorkloadId.image` and its memory eviction callback from the Scheduler, cancels the image idle timer, disposes the `ImageWorker` if one exists, clears the worker reference, and sets image generation initialized state to `false`. It does not affect text inference, vision, or STT.

## When to use it

Use `disposeImageGeneration()` when you need to:

- free Stable Diffusion model memory after image generation;
- switch to a different image model;
- respond to Scheduler memory eviction or app-level memory pressure;
- clean up image generation separately from text and vision runtimes.

Do not use this method when:

- you want to fully dispose the entire `EdgeVeda` instance; use `dispose()`;
- you only want to stop text generation; this method does not affect the text worker;
- you need to clean up a manually created `ImageWorker` outside `EdgeVeda`; dispose that worker directly.

## Prerequisites

Before calling this method, make sure that:

- No prerequisite is required; the method can be used as a defensive cleanup call;
- if generation is currently active, coordinate cancellation/cleanup at the app layer;
- if reinitializing immediately, prepare the new model path before calling `initImageGeneration()` again.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

`Future<void>` — completes after image workload registration, idle timer, and image worker state are cleaned up.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The method is designed as a cleanup path. | Treat unexpected errors as SDK defects and log them. |
| Worker disposal error | Underlying worker disposal could fail unexpectedly. | Log, clear application state, and recreate the `EdgeVeda` instance if needed. |

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

Not applicable. `disposeImageGeneration()` is a cleanup call and does not emit a stream.

## Behavior notes

- Scheduler image workload and memory eviction registration are removed defensively.
- The image idle timer is cancelled and cleared.
- The image worker is disposed if it exists.
- The internal `_imageWorker` reference is set to `null`.
- `isImageInitialized` becomes `false`.
- Text inference, vision, and STT are not affected.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Memory release | Frees large SD model resources held by the image worker. | Call after image-generation workflows or under memory pressure. |
| Scheduler cleanup | Prevents stale workload/eviction callbacks. | Use before switching models or destroying the SDK instance. |
| Idle timer | Cancels pending auto-disposal timer. | Avoid duplicate cleanup logic at app level. |
| Reinitialization | Allows `initImageGeneration()` with the same or different model. | Dispose before switching image models. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family for image generation through stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation such as 4 steps and CFG 1.0. |
| GGUF text LLM | No | Use text generation APIs. |
| GGUF VLM | No | Use vision APIs. |
| GGUF embedding model | No | Use embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only or stub behavior can be much slower than physical devices. |
| macOS | Yes / package surface | Validate sandbox, file access, and available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path is scaffolded; test on target hardware before publishing claims. |
| Web | No | Requires native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: no prompts or images are processed, but cleanup logs should avoid exposing file paths.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Image generation fails after dispose | Image worker was intentionally removed. | Call `initImageGeneration()` again before generating. |
| Memory still appears high | OS cache or another runtime still holds memory. | Profile on device and also dispose other workers if needed. |
| Scheduler still shows image workload | Scheduler state did not update or separate registration exists. | Check app-level Scheduler registrations and logs. |
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

Before publishing, verify that:

- The method still unregisters scheduler workload and memory eviction.
- Idle timer cleanup behavior is current.
- The method does not affect text inference or vision.
- The cleanup example compiles.
- Double-dispose behavior has been reviewed.
