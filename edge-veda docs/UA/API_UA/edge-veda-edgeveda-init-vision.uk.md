---
title: "EdgeVeda.initVision()"
description: "Сторінка API reference для методу initVision() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.initVision()`

> Ініціалізує vision inference в Edge Veda за допомогою VLM model і matching multimodal projector.

Використовуйте `initVision()` перед `describeImage()` або іншими vision API в `EdgeVeda`. Vision ініціалізується окремо від text generation, щоб застосунок контролював, коли завантажуються великі VLM resources.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `initVision()` |
| Category | Vision / Runtime initialization |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Core text runtime не потрібен; ініціалізує окремий vision runtime |
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

`initVision()` валідовує `VisionConfig`, перевіряє наявність VLM model file і `mmproj` file, виконує native vision initialization test у background isolate, звільняє temporary native context і зберігає vision configuration в `EdgeVeda` instance. Метод завершується тільки після підтвердження, що model path і projector path можна використати.

## When to use it

Використовуйте `initVision()` коли потрібно:

- підготувати `EdgeVeda.describeImage()` для one-off image description;
- перевірити VLM + mmproj pair перед image understanding;
- завантажувати vision capability тільки тоді, коли app її справді потребує;
- тримати lifecycle text generation і vision initialization окремими.

Не використовуйте цей метод, коли:

- потрібна тільки text generation; використовуйте `init()`;
- потрібна continuous camera-frame inference з persistent worker; використовуйте `VisionWorker` напряму;
- `modelPath` або `mmprojPath` недоступні в local storage;
- memory budget цільового пристрою не підтримує selected VLM.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `VisionConfig.modelPath` вказує на local VLM GGUF file;
- `VisionConfig.mmprojPath` вказує на matching multimodal projector GGUF file;
- застосунок має permission читати обидва files;
- пристрій має достатньо memory для selected VLM і projector;
- app готовий обробляти `VisionException` під час validation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `config` | `VisionConfig` | Yes | — | Vision runtime configuration. | Має містити non-empty `modelPath` і `mmprojPath`; optional fields: `numThreads`, `contextSize`, `useGpu`, `maxMemoryMb`. |

## Returns

`Future<void>` — завершується, коли vision configuration validated і native vision initialization test успішний.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | Return object немає. Success означає, що `EdgeVeda` instance готовий до `describeImage()`. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `VisionException` | Vision уже initialized, model path empty, mmproj path empty, file missing або native vision initialization fails. | Викличте `disposeVision()` перед reinitialize; перевірте обидва files і compatible VLM/mmproj pair. |
| `MemoryException` / native failure | Model/projector не вміщується в configured memory budget або device memory. | Use smaller VLM, reduce context size або increase validated memory budget. |

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

Не застосовується. `initVision()` виконує initialization і не повертає stream.

## Behavior notes

- Vision state окремий від text/runtime state, створеного через `init()`.
- Метод перевіряє `_isVisionInitialized` і відхиляє duplicate initialization.
- Model і projector paths валідовуються до native initialization.
- Native init тестується всередині `Isolate.run()`, щоб не блокувати UI.
- Temporary native vision context звільняється після validation; configuration зберігається для наступних calls.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| VLM size | Vision models і mmproj files можуть бути великими й memory-heavy. | Initialize vision тільки коли потрібно; prefer mobile-sized VLMs. |
| Context size | Higher context збільшує memory і latency. | Use `0` auto або conservative explicit value. |
| GPU / Metal | Може покращити throughput на supported Apple devices. | Keep `useGpu: true` на validated iOS/macOS targets; test fallback paths. |
| Initialization cost | Native validation має startup latency. | Покажіть loading state перед першим vision request. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Потрібні matching model і multimodal projector files. |
| Text GGUF LLM | No | Для text generation використовуйте `init()`. |
| Embedding model | No | Для цього є embeddings APIs. |
| Stable Diffusion model | No | Для цього є image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: local model file paths під час initialization.
- Network access during inference: none.
- Local storage used: VLM і mmproj files.
- Sensitive data considerations: не логуйте full local paths, якщо вони розкривають user/project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Vision already initialized` | `initVision()` викликано двічі. | Call `disposeVision()` before reinitializing. |
| `Model path cannot be empty` | `VisionConfig.modelPath` empty. | Передайте valid local VLM file path. |
| `Mmproj file not found` | Projector file missing або wrong path. | Download/copy matching mmproj file і update path. |
| Initialization is slow | Large VLM/projector validation. | Покажіть loading UI і тестуйте на physical device. |

## Related APIs

- `EdgeVeda.describeImage()` — describes RGB image після vision initialization.
- `EdgeVeda.disposeVision()` — clears EdgeVeda vision configuration.
- `VisionWorker.initVision()` — lower-level persistent worker initialization.
- `VisionConfig` — configuration object для VLM і mmproj paths.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.initVision()`
- Related config type: `VisionConfig`
- Related native API / FFI binding: `evVisionInit`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- `VisionConfig` fields/defaults актуальні.
- File validation behavior documented correctly.
- Example використовує matching VLM/mmproj pair.
- Memory guidance reviewed on target devices.
