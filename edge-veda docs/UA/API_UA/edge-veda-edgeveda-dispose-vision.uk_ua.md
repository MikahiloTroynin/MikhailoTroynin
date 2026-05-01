---
title: "EdgeVeda.disposeVision()"
description: "Сторінка API reference для методу disposeVision() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.disposeVision()`

> Очищає vision configuration в Edge Veda, не впливаючи на text inference.

Використовуйте `disposeVision()`, коли app більше не потребує `EdgeVeda` vision APIs або перед reinitialize vision з іншою VLM/projector pair.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `disposeVision()` |
| Category | Vision / Resource lifecycle |
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
Future<void> disposeVision();
```

## What it does

`disposeVision()` скидає vision initialization flag і очищає stored `VisionConfig`. Метод не dispose-ить core text runtime, не впливає на `generate()`/`generateStream()` і не очищає image generation state.

## When to use it

Використовуйте `disposeVision()` коли потрібно:

- звільнити EdgeVeda-managed vision configuration після image-description features;
- перейти на іншу VLM або mmproj file;
- уникнути accidental reuse of stale vision settings;
- відокремити vision lifecycle від text/image generation lifecycles.

Не використовуйте цей метод, коли:

- потрібно dispose full SDK runtime; використовуйте `dispose()`;
- потрібно dispose Stable Diffusion image generation; використовуйте `disposeImageGeneration()`;
- потрібно cleanup manually created `VisionWorker`; викликайте `dispose()` у worker.

## Prerequisites

Перед викликом методу переконайтесь, що:

- Prerequisite не потрібен; метод safe як lifecycle cleanup step.
- Якщо vision inference currently running через інший worker, stop that work at app layer first.
- Якщо app одразу reinitialize vision, підготуйте new model/projector paths.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

`Future<void>` — завершується після очищення vision flag і stored configuration.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Current implementation лише clears local state. | Unexpected errors трактуйте як SDK/runtime defects і логуйте. |

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

Не застосовується. `disposeVision()` — cleanup call і не повертає stream.

## Behavior notes

- Метод встановлює vision initialized state у `false`.
- Stored vision configuration очищається.
- Text inference state і image generation state не змінюються.
- Метод корисний перед повторним `initVision()` з іншими paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Runtime cost | Метод лише clears local Dart state. | Safe для cleanup flows. |
| Memory release | Clears stored config; native persistent workers треба dispose-ити separately, якщо used directly. | Dispose manually created `VisionWorker` instances на worker level. |
| Reinitialization | Дозволяє новий `initVision()` call. | Avoid repeated init/dispose loops у hot UI paths. |
| Concurrency | No streaming/inference workload started. | Coordinate with active vision request на app layer. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Стосується vision configuration lifecycle. |
| Text GGUF LLM | No effect | Text runtime не змінюється. |
| Stable Diffusion model | No effect | Image generation має окремі lifecycle APIs. |
| Embedding model | No effect | Embedding/text runtime не змінюється. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: метод не обробляє prompts, images або model contents.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `initVision()` still fails after dispose | New model/projector paths invalid. | Verify new `VisionConfig` files. |
| Vision features stop working | Vision config intentionally cleared. | Call `initVision()` перед `describeImage()` again. |
| Memory is still high | Separate persistent `VisionWorker` або OS cache may still be active. | Dispose worker instances і profile memory on device. |
| Text generation still works | Expected behavior. | `disposeVision()` не впливає на text runtime. |

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

Перед публікацією перевірте:

- Метод досі only clears local vision state.
- Relationship to `VisionWorker.dispose()` clarified.
- Text/image-generation lifecycle separation accurate.
- Cleanup example compiles.
