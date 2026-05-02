---
title: "EdgeVeda.disposeVision()"
description: "API reference page for the disposeVision() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.disposeVision()`

> Clears Edge Veda vision configuration without affecting text inference.

Use `disposeVision()` when the app no longer needs `EdgeVeda` vision APIs or before reinitializing vision with a different VLM/projector pair.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `disposeVision()` |
| Category | Vision / Resource lifecycle |
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
Future<void> disposeVision();
```

## What it does

`disposeVision()` resets the vision initialization flag and clears the stored `VisionConfig`. It does not dispose the core text runtime, does not affect `generate()`/`generateStream()`, and does not clear image generation state.

## When to use it

Use `disposeVision()` when you need to:

- release EdgeVeda-managed vision configuration after image-description features are done;
- switch to a different VLM or mmproj file;
- avoid accidental reuse of stale vision settings;
- separate vision lifecycle from text and image generation lifecycles.

Do not use this method when:

- you want to dispose the full SDK runtime; use `dispose()`;
- you want to dispose Stable Diffusion image generation; use `disposeImageGeneration()`;
- you need persistent worker cleanup from a manually created `VisionWorker`; call that worker's `dispose()`.

## Prerequisites

Before calling this method, make sure that:

- No prerequisite is required; the method is safe to call as a lifecycle cleanup step.
- If vision inference is currently running through another worker, stop that work at the app layer first.
- If the app will reinitialize vision immediately, have the new model/projector paths ready.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

`Future<void>` — completes after the vision flag and stored configuration are cleared.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The current implementation only clears local state. | Treat unexpected errors as SDK/runtime defects and log them. |

## Minimal example

```dart
await edgeVeda.disposeVision();
```

## Production-style example

```dart
Future<void> switchVisionModel(
  EdgeVeda edgeVeda,
  VisionConfig newConfig,
) async {
  await edgeVeda.disposeVision();
  await edgeVeda.initVision(newConfig);
}
```

## Streaming example

Not applicable. `disposeVision()` is a cleanup call and does not emit a stream.

## Behavior notes

- The method sets vision initialized state to `false`.
- The stored vision configuration is cleared.
- Text inference state and image generation state are not changed.
- The method is useful before calling `initVision()` again with different paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Runtime cost | The method only clears local Dart state. | Safe to call during cleanup flows. |
| Memory release | It clears stored config; native persistent workers must be disposed separately if used directly. | Dispose manually created `VisionWorker` instances at the worker level. |
| Reinitialization | Allows a new `initVision()` call. | Avoid repeated init/dispose loops in hot UI paths. |
| Concurrency | No streaming or inference workload is started. | Coordinate with any active vision request at the app layer. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Applies to vision configuration lifecycle. |
| Text GGUF LLM | No effect | Text runtime is not changed. |
| Stable Diffusion model | No effect | Image generation has separate lifecycle APIs. |
| Embedding model | No effect | Embedding/text runtime not changed. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: no prompts, images, or model contents are processed by this method.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `initVision()` still fails after dispose | New model/projector paths are invalid. | Verify the new `VisionConfig` files. |
| Vision features stop working | Vision config was cleared intentionally. | Call `initVision()` before `describeImage()` again. |
| Memory is still high | A separate persistent `VisionWorker` or OS cache may still be active. | Dispose worker instances and profile memory on device. |
| Text generation still works | Expected behavior. | `disposeVision()` does not affect text runtime. |

## Related APIs

- `EdgeVeda.initVision()` — initializes vision configuration again.
- `EdgeVeda.describeImage()` — requires vision initialization.
- `EdgeVeda.dispose()` — disposes all SDK resources.
- `EdgeVeda.disposeImageGeneration()` — separate cleanup for image generation.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.disposeVision()`
- Related config type: `VisionConfig`

## Documentation review checklist

Before publishing, verify that:

- The method still only clears local vision state.
- Relationship to `VisionWorker.dispose()` is clarified.
- Text/image-generation lifecycle separation is accurate.
- The cleanup example compiles.
