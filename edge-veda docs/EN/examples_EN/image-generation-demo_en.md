---
title: "Image generation demo"
description: "Build an on-device text-to-image demo with Edge Veda Stable Diffusion support."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Image generation demo

This example shows how to build a local text-to-image demo. The app loads a Stable Diffusion model with `initImageGeneration()`, generates an image with `generateImage()`, displays progress during diffusion, and saves the PNG result to a gallery.

Use this example when you want to:

- generate images on device;
- show per-step progress;
- create a prompt-to-gallery demo;
- test image model memory behavior;
- integrate image generation with runtime supervision.

## What you build

```text
Prompt input
  ↓
ImageGenerationConfig
  ↓
EdgeVeda.initImageGeneration()
  ↓
EdgeVeda.generateImage()
  ↓
Progress callback
  ↓
PNG bytes
  ↓
Preview + gallery
```

## Prerequisites

Before starting:

- use a device with enough memory for an image model;
- add a compatible Stable Diffusion model;
- check `ModelAdvisor` before download when possible;
- run in release/profile mode for realistic performance;
- show a clear progress state because image generation can take noticeable time.

Recommended first model:

| Model | Purpose |
| --- | --- |
| SD v2.1 Turbo | 512x512 text-to-image demo |
| Smaller/quantized SD model | Lower memory devices |

## Runtime setup

```dart
import 'dart:io';
import 'dart:typed_data';
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: textModelPath,
  contextLength: 2048,
  useGpu: true,
));
```

Text inference and image generation are separate. You may initialize image generation only when the user opens the image screen.

## Initialize image generation

```dart
await edgeVeda.initImageGeneration(
  modelPath: sdModelPath,
  useGpu: true,
);
```

The image model is loaded into a persistent worker isolate. Keep the screen state clear while this happens because the first load can be slow and memory-heavy.

## Generate one image

```dart
final pngBytes = await edgeVeda.generateImage(
  'a small robot reading documentation, soft studio lighting',
  config: const ImageGenerationConfig(
    width: 512,
    height: 512,
    steps: 4,
    cfgScale: 7.0,
    seed: 42,
  ),
  onProgress: (progress) {
    print('Step ${progress.step}/${progress.totalSteps}');
  },
);

await File(outputPath).writeAsBytes(pngBytes);
```

## Display result in Flutter

```dart
Image.memory(
  pngBytes,
  fit: BoxFit.cover,
)
```

Use `Image.memory()` for a simple preview. For a gallery, persist the bytes and store prompt metadata separately.

## Raw image flow

Use `generateImageRaw()` when you need pixels, not PNG bytes.

```dart
final result = await edgeVeda.generateImageRaw(
  'a clean product icon for an offline AI app',
  config: const ImageGenerationConfig(
    width: 512,
    height: 512,
    steps: 4,
  ),
);

print('${result.width}x${result.height}, ${result.channels} channels');
print('Generation time: ${result.generationTimeMs}ms');
```

## Gallery item model

```dart
class GeneratedImageItem {
  const GeneratedImageItem({
    required this.id,
    required this.prompt,
    required this.path,
    required this.createdAt,
    required this.seed,
  });

  final String id;
  final String prompt;
  final String path;
  final DateTime createdAt;
  final int seed;
}
```

Store the prompt and seed with the image. This lets users reproduce or refine a result later.

## UI states

| State | What to show |
| --- | --- |
| Model loading | Model name, memory warning, cancel/back action |
| Ready | Prompt input, settings, generate button |
| Generating | Step progress, elapsed time, disabled generate button |
| Complete | Image preview, save/share/regenerate actions |
| Error | Friendly message and recovery action |
| Idle cleanup | Explain that the model may unload after inactivity |

## Prompt controls

Expose only a few controls in the first version:

| Control | Default |
| --- | --- |
| Prompt | Required |
| Negative prompt | Optional |
| Steps | 4 |
| Seed | Random or fixed |
| Width / height | 512x512 |
| CFG scale | 7.0 |

Avoid exposing every sampler and scheduler in the first UI. Keep advanced controls behind an "Advanced" section.

## Scheduler integration

If your app also runs chat, vision, or STT, register a `Scheduler` so image generation can respect thermal and battery limits.

```dart
final scheduler = Scheduler(telemetry: TelemetryService());
scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
scheduler.start();

edgeVeda.setScheduler(scheduler);
```

The SDK can refuse image generation when runtime policy pauses the image workload under thermal or battery pressure.

## Memory behavior

Image generation can use much more memory than text generation. Design the demo around that:

- initialize image generation only when needed;
- show model loading as a separate state;
- avoid running STT, vision, and image generation at the same time on low-memory devices;
- call `disposeImageGeneration()` when the screen is closed;
- rely on idle auto-disposal when available.

## Cleanup

```dart
await edgeVeda.disposeImageGeneration();
await edgeVeda.dispose();
```

`disposeImageGeneration()` frees image resources without necessarily ending all text inference state. Use `dispose()` when the entire SDK runtime is no longer needed.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Model fails to load | Wrong model path or unsupported format | Check file path and model compatibility. |
| App runs out of memory | Image model is too large | Use a smaller model or unload other workloads. |
| Progress never completes | Worker failed or device is under pressure | Surface the error and allow retry after cooldown. |
| Output is poor | Prompt too vague or steps too low | Improve prompt and raise steps cautiously. |
| Repeated same image | Fixed seed | Randomize seed or expose seed control. |

## Production checklist

Before shipping:

- test on the minimum supported device;
- show memory and thermal warnings;
- persist prompt, seed, model name, and settings;
- provide delete controls for generated images;
- keep generation local unless users explicitly opt into cloud services;
- block unsafe or policy-violating prompts at the app level;
- document expected model size and first-load time.
