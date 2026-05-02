---
title: "EdgeVeda.dispose()"
description: "Сторінка API reference для методу dispose() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.dispose()`

> Dispose-ить усі Edge Veda resources і resets SDK instance to uninitialized state.

Використовуйте `dispose()`, коли app завершила роботу з `EdgeVeda` instance, shutting down feature або перед rebuilding runtime from scratch. Після цього треба call `init()` again перед text generation або embeddings.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `dispose()` |
| Category | Runtime / Full resource lifecycle |
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
Future<void> dispose();
```

## What it does

`dispose()` виконує full cleanup для `EdgeVeda` instance. Він calls `disposeVision()`, calls `disposeImageGeneration()`, dispose-ить persistent text streaming worker, якщо він exists, clears worker reference, sets streaming/initialization flags to `false` і clears stored `EdgeVedaConfig`.

## When to use it

Використовуйте `dispose()` коли потрібно:

- release all SDK-managed resources before app/feature shutdown;
- reset `EdgeVeda` instance перед initializing different core model;
- clean up text streaming, vision і image generation state in one call;
- avoid stale configuration після user switches model profile.

Не використовуйте цей метод, коли:

- потрібно only free image generation resources; використовуйте `disposeImageGeneration()`;
- потрібно only clear vision configuration; використовуйте `disposeVision()`;
- generation/streaming currently active without app-level cancellation/coordination;
- очікуєте, що instance keeps working immediately afterward without `init()`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- prerequisite не потрібен; method can be used as final cleanup;
- active streams/UI requests should be cancelled або ignored at app layer;
- app should not call `generate()`, `generateStream()` або `embed()` again until `init()` completes.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

`Future<void>` — завершується, коли vision, image generation, text worker, streaming state, initialization state і configuration cleared.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Method is cleanup path. | Treat unexpected failures as lifecycle defects and log them. |
| Worker disposal error | Child worker cleanup fails unexpectedly. | Prevent further use of instance and recreate if needed. |

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

Не застосовується. `dispose()` — full cleanup call і не повертає stream.

## Behavior notes

- Метод disposes vision resources first.
- Метод disposes image generation resources next.
- If persistent streaming worker exists, it disposed and reference cleared.
- `isStreaming` стає `false`.
- `isInitialized` стає `false`.
- Stored `EdgeVedaConfig` set to `null`.
- After disposal, `init()` must be called again before using core SDK.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Cleanup scope | Runs multiple cleanup operations in sequence. | Use for final shutdown або full runtime reset. |
| Model reload cost | Next use requires reinitialization і model loading. | Avoid calling in hot paths unless memory release required. |
| Memory release | Can free text worker, image worker і vision state. | Call when switching profiles або under critical pressure. |
| Concurrency | Disposing during active generation can invalidate pending UI flows. | Coordinate cancellation і ignore late results. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Text runtime worker disposed. |
| GGUF embedding model | Yes | Core runtime configuration cleared. |
| GGUF VLM + mmproj | Yes | Vision configuration cleared through `disposeVision()`. |
| Stable Diffusion GGUF | Yes | Image generation worker disposed through `disposeImageGeneration()`. |
| Whisper/STT worker | No direct EdgeVeda worker effect | Manually created whisper workers/sessions must be disposed separately. |

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
- Sensitive data considerations: cleanup should not log prompts, images, embeddings або full file paths unless needed for diagnostics.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Calls fail after dispose | SDK no longer initialized. | Call `init()` again before text/embedding APIs, and reinitialize image/vision as needed. |
| Streaming UI receives late output | A stream active while disposal happened. | Cancel or ignore late updates at app layer. |
| Image generation fails after dispose | Image worker disposed. | Call `initImageGeneration()` again. |
| Memory still appears high | OS cache або external workers still hold memory. | Dispose manually created workers і use platform profiling. |

## Related APIs

- `EdgeVeda.init()` — reinitializes core SDK after disposal.
- `EdgeVeda.disposeVision()` — called by `dispose()` for vision cleanup.
- `EdgeVeda.disposeImageGeneration()` — called by `dispose()` for image cleanup.
- `StreamingWorker.dispose()` — lower-level worker cleanup for persistent text streaming.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.dispose()`
- Related workers: `StreamingWorker`, `ImageWorker`, vision configuration state
- Related lifecycle methods: `disposeVision()`, `disposeImageGeneration()`

## Documentation review checklist

Перед публікацією перевірте:

- Cleanup order matches current implementation.
- Method still clears `_worker`, `_isStreaming`, `_isInitialized`, `_config`.
- Relationship to image/vision cleanup documented correctly.
- Examples avoid using runtime after disposal without reinitialization.
- External worker cleanup responsibilities clear.
