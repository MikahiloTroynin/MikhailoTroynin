---
title: "EdgeVeda.describeImage()"
description: "Сторінка API reference для методу describeImage() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.describeImage()`

> Генерує text description для RGB image за допомогою ініціалізованої vision-language model.

`describeImage()` перевіряє, що vision initialized, перевіряє `imageBytes.length == width * height * 3`, ініціалізує native vision context у background isolate, запускає visual-language inference з prompt/options і повертає generated text description. Image має бути RGB888 bytes, а не JPEG, PNG, BGRA або YUV420 напряму.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `describeImage()` |
| Category | Vision / Image understanding |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — vision runtime через `initVision()` |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<String> describeImage(
  Uint8List imageBytes, {
  required int width,
  required int height,
  String prompt = 'Describe this image.',
  GenerateOptions? options,
});
```

## What it does

`describeImage()` перевіряє, що vision initialized, перевіряє `imageBytes.length == width * height * 3`, ініціалізує native vision context у background isolate, запускає visual-language inference з prompt/options і повертає generated text description. Image має бути RGB888 bytes, а не JPEG, PNG, BGRA або YUV420 напряму.

## When to use it

Використовуйте `describeImage()`, коли потрібно:

- описати still image локально;
- поставити visual question до image через custom prompt;
- обробляти converted camera frames без відправки images на server;
- будувати accessibility, inspection, document understanding або camera-assistant features.

Не використовуйте цей метод, коли:

- vision не ініціалізовано через `initVision()`;
- image не у RGB888 format;
- потрібна continuous frame processing з persistent worker; використовуйте `VisionWorker.describeFrame()`;
- потрібна text-only generation; використовуйте `generate()` або `generateStream()`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.initVision(config)` успішно завершився;
- `VisionConfig.modelPath` вказує на VLM GGUF file;
- `VisionConfig.mmprojPath` вказує на matching multimodal projector file;
- `imageBytes.length == width * height * 3`; 
- camera/file permissions оброблені application layer.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `imageBytes` | `Uint8List` | Yes | — | RGB888 image bytes. | Має містити рівно `width * height * 3` bytes. |
| `width` | `int` | Yes | — | Image width in pixels. | Має відповідати `imageBytes`. |
| `height` | `int` | Yes | — | Image height in pixels. | Має відповідати `imageBytes`. |
| `prompt` | `String` | No | `'Describe this image.'` | Text prompt для VLM. | Для кращого output використовуйте task-specific prompts. |
| `options` | `GenerateOptions?` | No | `const GenerateOptions(maxTokens: 256)` | Generation controls: `maxTokens`, `temperature`, `topP`, `topK`, `repeatPenalty`. | Деякі text-only options можуть не впливати на vision output. |

## Returns

`Future<String>` — future, що повертає generated text description.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `String` | Generated text description of the image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `VisionException` | Vision не initialized, image byte count mismatch, native vision init fails або native describe fails. | Викличте `initVision()`, validate image format/dimensions і use compatible VLM files. |
| `ConfigurationException` / `EdgeVedaException` | Invalid generation options або SDK-level failure. | Validate options і handle typed exceptions. |
| `MemoryException` | Vision model/projector або image processing перевищує memory. | Reduce resolution, choose smaller VLM або lower memory settings. |

## Minimal example

```dart
await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  useGpu: true,
));

final description = await edgeVeda.describeImage(
  rgbBytes,
  width: 640,
  height: 480,
  prompt: 'What objects are visible in this image?',
);

print(description);
```

## Production-style example

```dart
Future<String> describeCameraFrame(
  EdgeVeda edgeVeda,
  Uint8List rgbBytes,
  int width,
  int height,
) async {
  final expectedBytes = width * height * 3;
  if (rgbBytes.length != expectedBytes) {
    throw ArgumentError('Expected $expectedBytes RGB bytes, got ${rgbBytes.length}');
  }

  try {
    return await edgeVeda.describeImage(
      rgbBytes,
      width: width,
      height: height,
      prompt: 'Describe the scene and mention safety-relevant objects.',
      options: const GenerateOptions(maxTokens: 120, temperature: 0.2),
    );
  } on VisionException catch (error) {
    throw Exception('Vision inference failed: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `describeImage()` не повертає stream.

## Behavior notes

- `describeImage()` використовує vision configuration, встановлену через `initVision()`.
- Vision context окремий від core text runtime, ініціалізованого через `init()`.
- Метод очікує RGB888 bytes і валідовує byte length before native inference.
- Native vision work виконується в background isolate, щоб не блокувати UI.
- Метод повертає тільки text; timing details доступні через lower-level `VisionWorker.describeFrame()` responses.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image resolution | Larger images збільшують encoding і inference cost. | Починайте з 640px або нижче для mobile vision tasks. |
| VLM size | Larger VLMs збільшують memory і latency. | Використовуйте SmolVLM-class models для mobile-first scenarios. |
| `maxTokens` | Higher values збільшують decode time. | Use task-specific short limits for camera flows. |
| Repeated frames | One-off calls можуть reinitialize context. | Для continuous vision використовуйте `VisionWorker.describeFrame()`. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF vision-language model + mmproj | Yes | Requires matching VLM and multimodal projector files. |
| GGUF chat/instruct LLM | No for image input | Use text generation APIs for text-only prompts. |
| GGUF embedding model | No | Use embeddings APIs for text vectors. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути повільним. |
| macOS | Yes / package surface | Перевірте file access і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не web-oriented. |

## Privacy and security

- Input data processed: RGB image bytes і prompt text.
- Network access during inference: none.
- Local storage used: VLM model і mmproj files.
- Sensitive data considerations: images можуть містити faces, documents, screens, addresses або private content; не логуйте raw images/generated descriptions без потреби.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Vision not initialized` | `initVision()` не викликано або failed. | Initialize vision first and verify both model files exist. |
| Byte count mismatch | Image не RGB888 або dimensions wrong. | Convert camera frames to RGB888 and pass correct width/height. |
| Slow response | Image too large або VLM large. | Reduce resolution або lower `maxTokens`. |
| Poor description | Prompt too vague або VLM not suited to task. | Use targeted prompt and compatible VLM/mmproj pair. |

## Related APIs

- `EdgeVeda.initVision()` — initializes the VLM and mmproj configuration.
- `EdgeVeda.disposeVision()` — releases vision resources.
- `VisionWorker.describeFrame()` — lower-level persistent-worker API with timing metadata.
- `CameraUtils.convertBgraToRgb()` / `convertYuv420ToRgb()` — converts camera data to RGB888.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.describeImage()`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- RGB888 requirement and byte-count validation are correct.
- `GenerateOptions` fields used by vision are current.
- Examples compile with actual VLM and mmproj files.
- Memory/performance notes reviewed on physical devices.
