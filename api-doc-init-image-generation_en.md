---
title: "EdgeVeda.initImageGeneration()"
description: "API reference page for the initImageGeneration() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.initImageGeneration()`

> Initializes image generation with a Stable Diffusion model in a persistent worker isolate.

Use `initImageGeneration()` before calling `generateImage()` or `generateImageRaw()`. Image generation is independent from text inference, but the combined memory footprint can be high.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `initImageGeneration()` |
| Category | Image generation / Runtime initialization |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No text runtime required; initializes image-generation runtime |
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

`initImageGeneration()` validates that image generation is not already initialized, verifies that `modelPath` is non-empty and points to an existing Stable Diffusion model file, spawns an `ImageWorker`, initializes the model, and marks image generation as ready. If a `Scheduler` is connected, the method registers `WorkloadId.image` with low priority and registers memory eviction cleanup for image generation.

## When to use it

Use `initImageGeneration()` when you need to:

- prepare a Stable Diffusion model for repeated image generation;
- load the model once and reuse it for multiple `generateImage()` calls;
- connect image generation to Scheduler budget enforcement;
- separate text/vision runtime lifecycle from image generation lifecycle.

Do not use this method when:

- you only need text generation, embeddings, or VLM image description;
- the Stable Diffusion model file is missing or not local;
- the target device cannot handle the memory footprint of image generation;
- image generation is already initialized; call `disposeImageGeneration()` first.

## Prerequisites

Before calling this method, make sure that:

- a compatible Stable Diffusion GGUF model exists at `modelPath`;
- the app has permission to read the local model file;
- the target device has enough RAM and GPU/CPU capacity;
- optional Scheduler is configured before initialization if budget integration is required.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `modelPath` | `String` | Yes | — | Path to the local Stable Diffusion model file. | Must not be empty; file must exist. |
| `numThreads` | `int` | No | `0` | CPU thread count for image generation. | `0` lets the native backend choose/default. |
| `useGpu` | `bool` | No | `true` | Whether to use GPU acceleration where supported. | Best validated on Metal-capable Apple devices. |

## Returns

`Future<void>` — completes when the image worker is spawned and the Stable Diffusion model is loaded.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | No return object. Successful completion means image generation is initialized. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `ImageGenerationException` | Image generation is already initialized. | Call `disposeImageGeneration()` before reinitializing. |
| `ImageGenerationException` | `modelPath` is empty or the SD model file does not exist. | Pass a valid local model path and verify the file before calling. |
| `ImageGenerationException` | Worker spawn or native image initialization fails. | Check model compatibility, memory, GPU/CPU path, and device logs. |

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

Not applicable. `initImageGeneration()` initializes a persistent worker and does not emit a stream.

## Behavior notes

- The method rejects duplicate image initialization.
- The model file is validated before worker initialization.
- The model is loaded into a persistent `ImageWorker` isolate.
- On initialization failure, the worker is disposed and the reference is cleared.
- If a Scheduler is connected, `WorkloadId.image` is registered with low priority and a memory eviction callback.
- An idle timer is reset after successful initialization.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model load time | Stable Diffusion model initialization can take tens of seconds. | Show loading UI and initialize only when needed. |
| Memory footprint | Image generation can use multiple GB of RAM and GPU memory. | Avoid running heavy text, vision, and image workloads together unless tested. |
| GPU usage | GPU acceleration can improve speed on supported devices. | Keep `useGpu: true` on validated Metal devices; test fallback paths. |
| Worker lifecycle | Keeping the model loaded improves subsequent generation latency. | Call `disposeImageGeneration()` when idle or under memory pressure. |

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

- Input data processed: local model file path.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file.
- Sensitive data considerations: avoid logging full local paths if they expose user or project information.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Image generation already initialized` | Initialization called twice. | Call `disposeImageGeneration()` before reinitializing. |
| `Model path cannot be empty` | Empty `modelPath`. | Pass a non-empty local file path. |
| `SD model file not found` | File missing or inaccessible. | Verify download/import path and file permissions. |
| Initialization is very slow | Large model, cold start, CPU fallback, or first Metal setup. | Use progress/loading UI and test release builds on physical devices. |

## Related APIs

- `EdgeVeda.generateImage()` — generates PNG-encoded image bytes after initialization.
- `EdgeVeda.generateImageRaw()` — generates raw RGB pixel data after initialization.
- `EdgeVeda.disposeImageGeneration()` — releases image generation resources.
- `ImageWorker.initImage()` — lower-level worker initialization path.
- `Scheduler` — optional budget enforcement for image workloads.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.initImageGeneration()`
- Related worker: `ImageWorker`
- Related enum/workload: `WorkloadId.image`

## Documentation review checklist

Before publishing, verify that:

- The signature matches the current source code.
- Stable Diffusion model format and file requirements are current.
- Scheduler registration and priority behavior are correct.
- Idle timer behavior is reviewed against source.
- Examples compile in a Flutter project.
