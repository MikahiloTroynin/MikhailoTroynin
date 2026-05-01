---
title: "Image generation demo"
description: "Створення on-device text-to-image demo через Edge Veda Stable Diffusion support."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Image generation demo

Цей приклад показує, як створити local text-to-image demo. App завантажує Stable Diffusion model через `initImageGeneration()`, генерує image через `generateImage()`, показує progress під час diffusion і зберігає PNG result у gallery.

Використовуйте цей приклад, коли потрібно:

- генерувати images на device;
- показувати per-step progress;
- створити prompt-to-gallery demo;
- протестувати image model memory behavior;
- інтегрувати image generation з runtime supervision.

## Що створюється

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

## Передумови

Перед початком:

- використовуйте device з достатньою memory для image model;
- додайте compatible Stable Diffusion model;
- перевірте `ModelAdvisor` перед download, якщо можливо;
- запускайте у release/profile mode для реалістичної performance;
- показуйте clear progress state, бо image generation може тривати помітний час.

Рекомендована перша model:

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

Text inference і image generation — separate. Можна initialize image generation лише тоді, коли user відкриває image screen.

## Initialize image generation

```dart
await edgeVeda.initImageGeneration(
  modelPath: sdModelPath,
  useGpu: true,
);
```

Image model завантажується у persistent worker isolate. Показуйте screen state чітко, бо first load може бути slow і memory-heavy.

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

Використовуйте `Image.memory()` для simple preview. Для gallery persist-іть bytes і зберігайте prompt metadata окремо.

## Raw image flow

Використовуйте `generateImageRaw()`, коли потрібні pixels, а не PNG bytes.

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

Зберігайте prompt і seed разом з image. Це дозволяє users відтворити або refine-ити result пізніше.

## UI states

| State | Що показувати |
| --- | --- |
| Model loading | Model name, memory warning, cancel/back action |
| Ready | Prompt input, settings, generate button |
| Generating | Step progress, elapsed time, disabled generate button |
| Complete | Image preview, save/share/regenerate actions |
| Error | Friendly message і recovery action |
| Idle cleanup | Пояснення, що model може unload after inactivity |

## Prompt controls

У першій версії відкривайте лише кілька controls:

| Control | Default |
| --- | --- |
| Prompt | Required |
| Negative prompt | Optional |
| Steps | 4 |
| Seed | Random або fixed |
| Width / height | 512x512 |
| CFG scale | 7.0 |

Не показуйте всі sampler і scheduler controls у першому UI. Advanced controls краще винести в section `Advanced`.

## Scheduler integration

Якщо app також запускає chat, vision або STT, підключіть `Scheduler`, щоб image generation враховувала thermal і battery limits.

```dart
final scheduler = Scheduler(telemetry: TelemetryService());
scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
scheduler.start();

edgeVeda.setScheduler(scheduler);
```

SDK може відмовити image generation, якщо runtime policy paused image workload через thermal або battery pressure.

## Memory behavior

Image generation може використовувати значно більше memory, ніж text generation. Проєктуйте demo з урахуванням цього:

- initialize image generation only when needed;
- показуйте model loading як separate state;
- не запускайте STT, vision і image generation одночасно на low-memory devices;
- викликайте `disposeImageGeneration()`, коли screen закрито;
- використовуйте idle auto-disposal, якщо доступно.

## Cleanup

```dart
await edgeVeda.disposeImageGeneration();
await edgeVeda.dispose();
```

`disposeImageGeneration()` звільняє image resources без обов'язкового завершення всього text inference state. `dispose()` використовуйте, коли весь SDK runtime більше не потрібен.

## Troubleshooting

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Model fails to load | Wrong model path або unsupported format | Перевірити file path і model compatibility. |
| App runs out of memory | Image model завелика | Взяти smaller model або unload other workloads. |
| Progress never completes | Worker failed або device under pressure | Показати error і дозволити retry after cooldown. |
| Output poor | Prompt vague або steps too low | Покращити prompt і обережно підняти steps. |
| Repeated same image | Fixed seed | Randomize seed або expose seed control. |

## Production checklist

Перед release:

- протестуйте на minimum supported device;
- показуйте memory і thermal warnings;
- persist-іть prompt, seed, model name і settings;
- додайте delete controls для generated images;
- залишайте generation local, якщо users не ввімкнули cloud services явно;
- блокуйте unsafe або policy-violating prompts на app level;
- задокументуйте expected model size і first-load time.
