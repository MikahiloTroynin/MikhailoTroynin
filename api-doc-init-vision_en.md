---
title: "EdgeVeda.initVision()"
description: "API reference page for the initVision() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.initVision()`

> Initializes Edge Veda vision inference with a VLM model and matching multimodal projector.

Use `initVision()` before calling `describeImage()` or other `EdgeVeda` vision APIs. Vision is initialized separately from text generation so the app controls when large VLM resources are loaded.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `initVision()` |
| Category | Vision / Runtime initialization |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No core text runtime required; initializes separate vision runtime |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<void> initVision(VisionConfig config);
```

## What it does

`initVision()` validates the `VisionConfig`, verifies that both the VLM model file and `mmproj` file exist, runs a native vision initialization test in a background isolate, frees the temporary native context, and then stores the vision configuration on the `EdgeVeda` instance. The method completes only after the vision model path and projector path are confirmed usable.

## When to use it

Use `initVision()` when you need to:

- prepare `EdgeVeda.describeImage()` for one-off image description;
- validate a VLM + mmproj pair before image understanding;
- load vision capability only when the app actually needs it;
- keep text generation and vision initialization lifecycles separate.

Do not use this method when:

- you only need text generation; use `init()` instead;
- you need continuous camera-frame inference with a persistent worker; use `VisionWorker` directly;
- either `modelPath` or `mmprojPath` is not available on local storage;
- the target device memory budget cannot support the selected VLM.

## Prerequisites

Before calling this method, make sure that:

- `VisionConfig.modelPath` points to a local VLM GGUF file;
- `VisionConfig.mmprojPath` points to the matching multimodal projector GGUF file;
- the app has permission to read both files;
- the device has enough memory for the selected VLM and projector;
- the app is ready to handle `VisionException` during validation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `config` | `VisionConfig` | Yes | — | Vision runtime configuration. | Must include non-empty `modelPath` and `mmprojPath`; optional fields include `numThreads`, `contextSize`, `useGpu`, and `maxMemoryMb`. |

## Returns

`Future<void>` — completes when the vision configuration has been validated and the native vision initialization test succeeds.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | No return object. Success means the `EdgeVeda` instance is ready for `describeImage()`. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `VisionException` | Vision is already initialized, model path is empty, mmproj path is empty, a file is missing, or native vision initialization fails. | Call `disposeVision()` before reinitializing; verify both files and use a compatible VLM/mmproj pair. |
| `MemoryException` / native failure | The model/projector cannot fit the configured memory budget or device memory. | Use a smaller VLM, reduce context size, or increase validated memory budget. |

## Minimal example

```dart
await edgeVeda.initVision(VisionConfig(
  modelPath: '/path/to/smolvlm2.gguf',
  mmprojPath: '/path/to/mmproj.gguf',
));
```

## Production-style example

```dart
Future<void> prepareVision(
  EdgeVeda edgeVeda,
  String vlmPath,
  String mmprojPath,
) async {
  try {
    await edgeVeda.initVision(VisionConfig(
      modelPath: vlmPath,
      mmprojPath: mmprojPath,
      numThreads: 4,
      contextSize: 2048,
      useGpu: true,
      maxMemoryMb: 1536,
    ));
  } on VisionException catch (error) {
    throw Exception('Vision initialization failed: ${error.message}');
  }
}
```

## Streaming example

Not applicable. `initVision()` performs initialization and does not emit a stream.

## Behavior notes

- Vision state is separate from text/runtime state created by `init()`.
- The method checks `_isVisionInitialized` and rejects duplicate initialization.
- Both model and projector paths are validated before native initialization.
- Native init is tested inside `Isolate.run()` to keep the UI responsive.
- The temporary native vision context is freed after validation; the configuration is stored for later calls.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| VLM size | Vision models and mmproj files can be large and memory-heavy. | Initialize vision only when needed and prefer mobile-sized VLMs. |
| Context size | Higher context increases memory and latency. | Use `0` auto or a conservative explicit value. |
| GPU / Metal | Can improve throughput on supported Apple devices. | Keep `useGpu: true` on validated iOS/macOS targets; test fallback paths. |
| Initialization cost | Native validation has startup latency. | Show a loading state before the first vision request. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Requires matching model and multimodal projector files. |
| Text GGUF LLM | No | Use `init()` for text generation. |
| Embedding model | No | Use embeddings APIs. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: local model file paths only during initialization.
- Network access during inference: none.
- Local storage used: VLM and mmproj files.
- Sensitive data considerations: avoid logging full local paths if they expose user/project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Vision already initialized` | `initVision()` was called twice. | Call `disposeVision()` before reinitializing. |
| `Model path cannot be empty` | `VisionConfig.modelPath` is empty. | Pass a valid local VLM file path. |
| `Mmproj file not found` | Projector file missing or wrong path. | Download/copy the matching mmproj file and update the path. |
| Initialization is slow | Large VLM and projector validation. | Show loading UI and test on physical device. |

## Related APIs

- `EdgeVeda.describeImage()` — describes an RGB image after vision initialization.
- `EdgeVeda.disposeVision()` — clears EdgeVeda vision configuration.
- `VisionWorker.initVision()` — lower-level persistent worker initialization.
- `VisionConfig` — configuration object for VLM and mmproj paths.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.initVision()`
- Related config type: `VisionConfig`
- Related native API / FFI binding: `evVisionInit`

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- `VisionConfig` fields and defaults are current.
- File validation behavior is documented correctly.
- The example uses a matching VLM and mmproj pair.
- Memory guidance is reviewed on target devices.
