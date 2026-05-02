---
title: "EdgeVeda.generateImage()"
description: "Сторінка API reference для методу generateImage() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generateImage()`

> Генерує PNG-encoded image з text prompt через initialized Stable Diffusion worker.

`generateImage()` — high-level image generation API. Він повертає PNG bytes, які можна save, upload або display через standard Flutter image widgets.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generateImage()` |
| Category | Image generation / Text-to-image |
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

Додаткові imports для examples:

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

`generateImage()` validates initialization і prompt text, applies Scheduler pause checks, запускає image worker generation stream, forwards per-step progress callbacks, requires completion response, reports generation latency to Scheduler, resets idle timer і encodes returned raw pixels into PNG bytes через `image` package.

## When to use it

Використовуйте `generateImage()` коли потрібно:

- створювати images з text prompts через initialized Stable Diffusion model;
- показувати progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse persistent image worker for multiple generations.
- отримати PNG file format directly без manual encoding.

Не використовуйте цей метод, коли:

- image generation не initialized через `initImageGeneration()`;
- prompt empty;
- Scheduler paused image workload через thermal/battery pressure;
- потрібне image understanding, а не image generation; використовуйте vision APIs.
- потрібні raw pixels для canvas або processing pipeline; використовуйте `generateImageRaw()`.

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

`Future<Uint8List>` — PNG-encoded bytes для generated image.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `Uint8List` | Byte array, що містить PNG-encoded image. |

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

Не застосовується. `generateImage()` повертає one PNG byte array. Використовуйте `onProgress` для per-step progress updates.

## Behavior notes

- Метод потребує `initImageGeneration()` і active `_imageWorker`.
- Empty prompts rejected before work starts.
- If Scheduler connected and QoS knobs pause image generation, method throws instead of starting workload.
- Image idle timer cancelled during generation і reset after completion.
- Progress callbacks emitted for `ImageProgressResponse` messages.
- Generation latency reported to Scheduler for budget enforcement.
- Final raw RGB output encoded to PNG before method returns.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory і latency. | Start with 512×512 і validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models для mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions і surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while model loaded, then dispose when done. |
| PNG encoding | PNG encoding adds CPU work after diffusion finishes. | Use `generateImageRaw()`, якщо next pipeline accepts raw pixels. |

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

## Related APIs

- `EdgeVeda.initImageGeneration()` — initializes Stable Diffusion worker first.
- `EdgeVeda.generateImageRaw()` — returns raw RGB data without PNG encoding.
- `EdgeVeda.disposeImageGeneration()` — releases SD model і image worker resources.
- `ImageGenerationConfig` — controls width, height, steps, sampler, schedule, CFG, seed.
- `ImageProgress` — progress callback payload.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.generateImage()`
- Related config type: `ImageGenerationConfig`
- Related progress type: `ImageProgress`
- Related worker: `ImageWorker`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- PNG encoding behavior still implemented with `image` package.
- Scheduler pause behavior і latency reporting accurate.
- `ImageGenerationConfig` defaults current.
- Examples compile and include realistic error handling.
