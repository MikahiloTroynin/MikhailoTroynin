---
title: "EdgeVeda.generateImageRaw()"
description: "Сторінка API reference для методу generateImageRaw() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generateImageRaw()`

> Генерує image з text prompt і повертає raw RGB pixel data з metadata.

Використовуйте `generateImageRaw()`, коли next step потребує raw pixels, а не PNG file: canvas, custom renderer, image processing pipeline або manual encoder.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generateImageRaw()` |
| Category | Image generation / Raw text-to-image |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — image generation має бути initialized |
| Supports streaming | No; progress callback available |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<ImageResult> generateImageRaw(
  String prompt, {
  ImageGenerationConfig? config,
  void Function(ImageProgress)? onProgress,
});
```

## What it does

`generateImageRaw()` має таку саму validation, Scheduler pause check, worker generation stream, progress callback, latency reporting і idle-timer reset behavior, як `generateImage()`. Замість PNG encoding метод повертає `ImageResult` з raw pixel data, width, height, channel count і generation time.

## When to use it

Використовуйте `generateImageRaw()` коли потрібно:

- створювати images з text prompts через initialized Stable Diffusion model;
- показувати progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse persistent image worker for multiple generations.
- уникнути PNG encoding overhead, коли raw pixels enough;
- передати generated pixels у custom image-processing pipeline.

Не використовуйте цей метод, коли:

- image generation не initialized через `initImageGeneration()`;
- prompt empty;
- Scheduler paused image workload через thermal/battery pressure;
- потрібне image understanding, а не image generation; використовуйте vision APIs.
- потрібен ready-to-save PNG byte array; використовуйте `generateImage()`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.initImageGeneration(modelPath: ...)` успішно завершився;
- prompt text non-empty і suitable для selected SD model;
- image size, steps, CFG scale, sampler і schedule compatible with model/device;
- app handles progress callbacks і generation failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `prompt` | `String` | Yes | — | Text prompt для image generation. | Must not be empty. |
| `config` | `ImageGenerationConfig?` | No | `const ImageGenerationConfig()` | Per-generation settings. | Defaults target SD Turbo: 512×512, 4 steps, CFG 1.0, Euler A sampler. |
| `onProgress` | `void Function(ImageProgress)?` | No | `null` | Callback fires once per denoising step. | Receives `step`, `totalSteps`, `elapsedSeconds` і derived `progress`. |

## Returns

`Future<ImageResult>` — object з raw RGB pixel data і generation metadata.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `pixelData` | `Uint8List` | Raw pixel data, typically RGB bytes. |
| `width` | `int` | Image width у pixels. |
| `height` | `int` | Image height у pixels. |
| `channels` | `int` | Number of color channels; `3` для RGB. |
| `generationTimeMs` | `double` | Total generation time у milliseconds. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `ImageGenerationException` | Image generation not initialized або worker missing. | Call `initImageGeneration()` first and retry. |
| `ImageGenerationException` | Prompt empty. | Trim and validate prompt before calling. |
| `ImageGenerationException` | Scheduler paused image generation due to thermal/battery pressure. | Retry when device conditions improve або adjust Scheduler policy. |
| `ImageGenerationException` | Generation stream completes without final result. | Retry, reduce image size/steps або reinitialize image worker. |
| Worker/native error | Stable Diffusion backend fails during generation. | Check model compatibility, memory і device logs. |

## Minimal example

```dart
final result = await edgeVeda.generateImageRaw(
  'a small robot reading documentation',
);

print('${result.width}x${result.height}, channels=${result.channels}');
print('Generated in ${result.generationTimeMs} ms');
```

## Production-style example

```dart
Future<ImageResult> createRawImageForPipeline(
  EdgeVeda edgeVeda,
  String prompt,
) async {
  final normalized = prompt.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('prompt must not be empty');
  }

  try {
    final result = await edgeVeda.generateImageRaw(
      normalized,
      config: const ImageGenerationConfig(
        width: 512,
        height: 512,
        steps: 4,
        cfgScale: 1.0,
      ),
      onProgress: (progress) {
        debugPrint('Raw image progress: ${progress.step}/${progress.totalSteps}');
      },
    );

    if (result.pixelData.length != result.width * result.height * result.channels) {
      throw StateError('Unexpected pixel buffer size');
    }

    return result;
  } on ImageGenerationException catch (error) {
    throw Exception('Raw image generation failed: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `generateImageRaw()` повертає one `ImageResult`. Використовуйте `onProgress` для per-step progress updates.

## Behavior notes

- Метод потребує `initImageGeneration()` і active `_imageWorker`.
- Empty prompts rejected before work starts.
- If Scheduler connected and QoS knobs pause image generation, method throws instead of starting workload.
- Image idle timer cancelled during generation і reset after completion.
- Progress callbacks emitted for `ImageProgressResponse` messages.
- Generation latency reported to Scheduler for budget enforcement.
- Final response wrapped in `ImageResult` without PNG/JPEG encoding.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory і latency. | Start with 512×512 і validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models для mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions і surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while model loaded, then dispose when done. |
| Raw output | Avoids PNG encoding CPU cost і extra allocation. | Prefer this method для custom renderers і processing pipelines. |

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

- Input data processed: prompt, optional negative prompt, generation configuration.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file; output image persistence controlled by app.
- Sensitive data considerations: generated images і prompts можуть reveal user intent; avoid logging prompts або saving outputs without consent.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Image generation not initialized` | `initImageGeneration()` not called або failed. | Initialize image generation first and verify `isImageInitialized`. |
| `Prompt cannot be empty` | Empty або whitespace-only prompt. | Validate prompt before calling. |
| Generation paused by Scheduler | Thermal/battery pressure activated pause QoS. | Wait, cool device, charge battery або adjust budget policy. |
| No result returned | Worker stream did not emit completion. | Retry with smaller settings або reinitialize worker. |
| Generation is slow | Large model, high resolution, too many steps або CPU fallback. | Use SD Turbo settings і test on device. |
| Pixel buffer size mismatch | Unexpected native result або incorrect channel assumption. | Validate `width * height * channels` before using buffer. |

## Related APIs

- `EdgeVeda.initImageGeneration()` — initializes Stable Diffusion worker first.
- `EdgeVeda.generateImage()` — returns PNG-encoded bytes.
- `ImageResult` — result type для raw pixel data і metadata.
- `ImageGenerationConfig` — controls generation settings.
- `ImageProgress` — progress callback payload.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.generateImageRaw()`
- Related result type: `ImageResult`
- Related config type: `ImageGenerationConfig`
- Related worker: `ImageWorker`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- `ImageResult` fields match current API docs.
- Scheduler pause behavior і latency reporting accurate.
- Pixel data format/channel assumptions verified.
- Examples compile and validate buffer size.
