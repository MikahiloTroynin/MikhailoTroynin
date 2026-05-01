---
title: "EdgeVeda.generateImage()"
description: "API reference page for the generateImage() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generateImage()`

> Generates a PNG-encoded image from a text prompt using the initialized Stable Diffusion worker.

`generateImage()` is the high-level image generation API. It returns PNG bytes that can be saved, uploaded, or displayed with standard Flutter image widgets.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generateImage()` |
| Category | Image generation / Text-to-image |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — image generation must be initialized |
| Supports streaming | No; progress callback available |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

Additional imports for examples:

```dart
import 'dart:io';
import 'dart:typed_data';
```

## Signature

```dart
Future<Uint8List> generateImage(
  String prompt, {
  ImageGenerationConfig? config,
  void Function(ImageProgress)? onProgress,
});
```

## What it does

`generateImage()` validates initialization and prompt text, applies Scheduler pause checks, runs the image worker generation stream, forwards per-step progress callbacks, requires a completion response, reports generation latency to the Scheduler, resets the idle timer, and encodes returned raw pixels into PNG bytes using the `image` package.

## When to use it

Use `generateImage()` when you need to:

- create images from text prompts using an initialized Stable Diffusion model;
- provide progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse the persistent image worker for multiple generations.
- return a PNG file format directly without manual encoding.

Do not use this method when:

- image generation has not been initialized with `initImageGeneration()`;
- the prompt is empty;
- the Scheduler has paused the image workload because of thermal or battery pressure;
- you need image understanding rather than image generation; use vision APIs.
- you need raw pixels for canvas or a processing pipeline; use `generateImageRaw()`.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.initImageGeneration(modelPath: ...)` has completed successfully;
- prompt text is non-empty and suitable for the selected SD model;
- image size, steps, CFG scale, sampler, and schedule are compatible with the model and device;
- the app handles progress callbacks and generation failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `prompt` | `String` | Yes | — | Text prompt for image generation. | Must not be empty. |
| `config` | `ImageGenerationConfig?` | No | `const ImageGenerationConfig()` | Per-generation settings. | Defaults target SD Turbo: 512×512, 4 steps, CFG 1.0, Euler A sampler. |
| `onProgress` | `void Function(ImageProgress)?` | No | `null` | Callback fired once per denoising step. | Receives `step`, `totalSteps`, `elapsedSeconds`, and derived `progress`. |

## Returns

`Future<Uint8List>` — PNG-encoded bytes for the generated image.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `Uint8List` | A byte array containing a PNG-encoded image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `ImageGenerationException` | Image generation is not initialized or worker is missing. | Call `initImageGeneration()` first and retry. |
| `ImageGenerationException` | Prompt is empty. | Trim and validate prompt before calling. |
| `ImageGenerationException` | Scheduler has paused image generation due to thermal or battery pressure. | Retry when device conditions improve or adjust Scheduler policy. |
| `ImageGenerationException` | Generation stream completes without a final result. | Retry, reduce image size/steps, or reinitialize the image worker. |
| Worker/native error | Stable Diffusion backend fails during generation. | Check model compatibility, memory, and device logs. |

## Minimal example

```dart
final pngBytes = await edgeVeda.generateImage(
  'a sunset over mountains, oil painting style',
);

await File('output.png').writeAsBytes(pngBytes);
```

## Production-style example

```dart
Future<Uint8List> createPreviewImage(
  EdgeVeda edgeVeda,
  String prompt,
) async {
  final normalized = prompt.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('prompt must not be empty');
  }

  try {
    return await edgeVeda.generateImage(
      normalized,
      config: const ImageGenerationConfig(
        width: 512,
        height: 512,
        steps: 4,
        cfgScale: 1.0,
        seed: 42,
      ),
      onProgress: (progress) {
        debugPrint(
          'Image step ${progress.step}/${progress.totalSteps} '
          '(${(progress.progress * 100).toStringAsFixed(0)}%)',
        );
      },
    );
  } on ImageGenerationException catch (error) {
    throw Exception('Image generation failed: ${error.message}');
  }
}
```

## Streaming example

Not applicable. `generateImage()` returns one PNG byte array. Use `onProgress` for per-step progress updates.

## Behavior notes

- The method requires `initImageGeneration()` and an active `_imageWorker`.
- Empty prompts are rejected before work starts.
- If a Scheduler is connected and QoS knobs pause image generation, the method throws instead of starting a workload.
- The image idle timer is cancelled during generation and reset after completion.
- Progress callbacks are emitted for `ImageProgressResponse` messages.
- Generation latency is reported to the Scheduler for budget enforcement.
- The final raw RGB output is encoded to PNG before the method returns.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory and latency. | Start with 512×512 and validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models for mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions and surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while the model is loaded, then dispose when done. |
| PNG encoding | PNG encoding adds CPU work after diffusion finishes. | Use `generateImageRaw()` when the next pipeline accepts raw pixels. |

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

- Input data processed: prompt, optional negative prompt, generation configuration.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file; output image persistence is app-controlled.
- Sensitive data considerations: generated images and prompts can reveal user intent; avoid logging prompts or saving outputs without consent.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Image generation not initialized` | `initImageGeneration()` was not called or failed. | Initialize image generation first and verify `isImageInitialized`. |
| `Prompt cannot be empty` | Empty or whitespace-only prompt. | Validate the prompt before calling. |
| Generation paused by Scheduler | Thermal or battery pressure activated pause QoS. | Wait, cool the device, charge battery, or adjust budget policy. |
| No result returned | Worker stream did not emit completion. | Retry with smaller settings or reinitialize worker. |
| Generation is slow | Large model, high resolution, too many steps, or CPU fallback. | Use SD Turbo settings and test on device. |

## Related APIs

- `EdgeVeda.initImageGeneration()` — initializes the Stable Diffusion worker first.
- `EdgeVeda.generateImageRaw()` — returns raw RGB data without PNG encoding.
- `EdgeVeda.disposeImageGeneration()` — releases SD model and image worker resources.
- `ImageGenerationConfig` — controls width, height, steps, sampler, schedule, CFG, and seed.
- `ImageProgress` — progress callback payload.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.generateImage()`
- Related config type: `ImageGenerationConfig`
- Related progress type: `ImageProgress`
- Related worker: `ImageWorker`

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- PNG encoding behavior is still implemented with the `image` package.
- Scheduler pause behavior and latency reporting are accurate.
- `ImageGenerationConfig` defaults are current.
- Examples compile and include realistic error handling.
