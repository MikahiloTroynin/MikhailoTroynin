---
title: "EdgeVeda.dispose()"
description: "API reference page for the dispose() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.dispose()`

> Disposes all Edge Veda resources and resets the SDK instance to an uninitialized state.

Use `dispose()` when the app is done with an `EdgeVeda` instance, when shutting down a feature, or before rebuilding the runtime from scratch. After calling it, call `init()` again before using text generation or embeddings.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `dispose()` |
| Category | Runtime / Full resource lifecycle |
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
Future<void> dispose();
```

## What it does

`dispose()` runs full cleanup for the `EdgeVeda` instance. It calls `disposeVision()`, calls `disposeImageGeneration()`, disposes the persistent text streaming worker if one exists, clears the worker reference, sets streaming and initialization flags to `false`, and clears the stored `EdgeVedaConfig`.

## When to use it

Use `dispose()` when you need to:

- release all SDK-managed resources before app/feature shutdown;
- reset an `EdgeVeda` instance before initializing a different core model;
- clean up text streaming, vision, and image generation state in one call;
- avoid stale configuration after a user switches model profile.

Do not use this method when:

- you only want to free image generation resources; use `disposeImageGeneration()`;
- you only want to clear vision configuration; use `disposeVision()`;
- generation or streaming is currently active without app-level cancellation/coordination;
- you expect the instance to keep working immediately afterward without `init()`.

## Prerequisites

Before calling this method, make sure that:

- no prerequisite is required; the method can be used as final cleanup;
- active streams or UI requests should be cancelled or ignored at the app layer;
- the app should not call `generate()`, `generateStream()`, or `embed()` again until `init()` completes.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

`Future<void>` — completes when vision, image generation, text worker, streaming state, initialization state, and configuration have been cleared.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The method is a cleanup path. | Treat unexpected failures as lifecycle defects and log them. |
| Worker disposal error | A child worker cleanup fails unexpectedly. | Prevent further use of the instance and recreate if needed. |

## Minimal example

```dart
await edgeVeda.dispose();
```

## Production-style example

```dart
class EdgeVedaController {
  EdgeVeda? _edgeVeda;

  Future<void> close() async {
    final runtime = _edgeVeda;
    _edgeVeda = null;

    if (runtime != null) {
      await runtime.dispose();
    }
  }
}
```

## Streaming example

Not applicable. `dispose()` is a full cleanup call and does not emit a stream.

## Behavior notes

- The method disposes vision resources first.
- The method disposes image generation resources next.
- If a persistent streaming worker exists, it is disposed and the reference is cleared.
- `isStreaming` becomes `false`.
- `isInitialized` becomes `false`.
- The stored `EdgeVedaConfig` is set to `null`.
- After disposal, `init()` must be called again before using the core SDK.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Cleanup scope | Runs multiple cleanup operations in sequence. | Use for final shutdown or full runtime reset. |
| Model reload cost | Next use requires reinitialization and model loading. | Avoid calling in hot paths unless memory release is required. |
| Memory release | Can free text worker, image worker, and vision state. | Call when switching profiles or under critical pressure. |
| Concurrency | Disposing during active generation can invalidate pending UI flows. | Coordinate cancellation and ignore late results. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Text runtime worker is disposed. |
| GGUF embedding model | Yes | Core runtime configuration is cleared. |
| GGUF VLM + mmproj | Yes | Vision configuration is cleared through `disposeVision()`. |
| Stable Diffusion GGUF | Yes | Image generation worker is disposed through `disposeImageGeneration()`. |
| Whisper/STT worker | No direct EdgeVeda worker effect | Manually created whisper workers/sessions must be disposed separately. |

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
- Sensitive data considerations: cleanup should not log prompts, images, embeddings, or full file paths unless needed for diagnostics.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Calls fail after dispose | SDK is no longer initialized. | Call `init()` again before text/embedding APIs, and reinitialize image/vision as needed. |
| Streaming UI receives late output | A stream was active while disposal happened. | Cancel or ignore late updates at the app layer. |
| Image generation fails after dispose | Image worker was disposed. | Call `initImageGeneration()` again. |
| Memory still appears high | OS cache or external workers still hold memory. | Dispose manually created workers and use platform profiling. |

## Related APIs

- `EdgeVeda.init()` — reinitializes the core SDK after disposal.
- `EdgeVeda.disposeVision()` — called by `dispose()` for vision cleanup.
- `EdgeVeda.disposeImageGeneration()` — called by `dispose()` for image cleanup.
- `StreamingWorker.dispose()` — lower-level worker cleanup for persistent text streaming.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.dispose()`
- Related workers: `StreamingWorker`, `ImageWorker`, vision configuration state
- Related lifecycle methods: `disposeVision()`, `disposeImageGeneration()`

## Documentation review checklist

Before publishing, verify that:

- The cleanup order matches current implementation.
- The method still clears `_worker`, `_isStreaming`, `_isInitialized`, and `_config`.
- Relationship to image/vision cleanup is documented correctly.
- Examples avoid using the runtime after disposal without reinitialization.
- External worker cleanup responsibilities are clear.
