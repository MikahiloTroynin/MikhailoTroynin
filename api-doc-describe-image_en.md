---
title: "EdgeVeda.describeImage()"
description: "API reference page for the describeImage() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.describeImage()`

> Generates a text description of an RGB image using the initialized vision-language model.

`describeImage()` validates that vision has been initialized, checks that `imageBytes.length == width * height * 3`, initializes a native vision context in a background isolate, runs visual-language inference with the supplied prompt and generation options, and returns the generated text description. The image must be RGB888 bytes, not JPEG, PNG, BGRA, or YUV420 directly.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `describeImage()` |
| Category | Vision / Image understanding |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — vision runtime via `initVision()` |
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

`describeImage()` validates that vision has been initialized, checks that `imageBytes.length == width * height * 3`, initializes a native vision context in a background isolate, runs visual-language inference with the supplied prompt and generation options, and returns the generated text description. The image must be RGB888 bytes, not JPEG, PNG, BGRA, or YUV420 directly.

## When to use it

Use `describeImage()` when you need to:

- describe a still image locally;
- ask a visual question about an image using a custom prompt;
- process converted camera frames without sending images to a server;
- build accessibility, inspection, document understanding, or camera-assistant features.

Do not use this method when:

- vision has not been initialized with `initVision()`;
- the image is not RGB888;
- you need continuous frame processing with a persistent worker; use `VisionWorker.describeFrame()`;
- you need text-only generation; use `generate()` or `generateStream()`.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.initVision(config)` has completed successfully;
- `VisionConfig.modelPath` points to a VLM GGUF file;
- `VisionConfig.mmprojPath` points to the matching multimodal projector file;
- `imageBytes.length == width * height * 3`;
- camera or file permissions are handled by the app.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `imageBytes` | `Uint8List` | Yes | — | RGB888 image bytes. | Must contain exactly `width * height * 3` bytes. |
| `width` | `int` | Yes | — | Image width in pixels. | Must match `imageBytes`. |
| `height` | `int` | Yes | — | Image height in pixels. | Must match `imageBytes`. |
| `prompt` | `String` | No | `'Describe this image.'` | Text prompt for the VLM. | Use task-specific prompts for better output. |
| `options` | `GenerateOptions?` | No | `const GenerateOptions(maxTokens: 256)` | Generation controls such as `maxTokens`, `temperature`, `topP`, `topK`, and `repeatPenalty`. | Some text-only options may not affect vision output. |

## Returns

`Future<String>` — a future that resolves to the generated text description.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `String` | Generated text description of the image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `VisionException` | Vision is not initialized, image byte count mismatches RGB size, native vision init fails, or native describe fails. | Call `initVision()`, validate image format/dimensions, and use compatible VLM files. |
| `ConfigurationException` / `EdgeVedaException` | Invalid generation options or SDK-level failure. | Validate options and handle typed exceptions. |
| `MemoryException` | Vision model/projector or image processing exceeds memory. | Reduce resolution, choose a smaller VLM, or lower memory settings. |

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

Not applicable. `describeImage()` does not emit a stream.

## Behavior notes

- `describeImage()` uses the vision configuration set by `initVision()`.
- Vision context is separate from the core text runtime initialized by `init()`.
- The method expects RGB888 bytes and validates byte length before native inference.
- Native vision work runs in a background isolate to avoid blocking the UI.
- The method returns text only; timing details are available from lower-level `VisionWorker.describeFrame()` responses.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image resolution | Larger images increase encoding and inference cost. | Start with 640px or lower for mobile vision tasks. |
| VLM size | Larger VLMs increase memory and latency. | Use SmolVLM-class models for mobile-first scenarios. |
| `maxTokens` | Higher values increase decode time. | Use task-specific short limits for camera flows. |
| Repeated frames | One-off calls may reinitialize context. | Use `VisionWorker.describeFrame()` for continuous vision. |

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
| iOS device | Yes | Primary validated target for on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be slower. |
| macOS | Yes / package surface | Validate file access and sandbox behavior. |
| Android | Partial / validation pending | Test on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: RGB image bytes and prompt text.
- Network access during inference: none.
- Local storage used: VLM model and mmproj files.
- Sensitive data considerations: images may contain faces, documents, screens, addresses, or other private content; avoid logging raw images or generated descriptions unless needed.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Vision not initialized` | `initVision()` was not called or failed. | Initialize vision first and verify both model files exist. |
| Byte count mismatch | Image is not RGB888 or dimensions are wrong. | Convert camera frames to RGB888 and pass correct width/height. |
| Slow response | Image is too large or VLM is large. | Reduce resolution or lower `maxTokens`. |
| Poor description | Prompt is too vague or VLM is not suited to the task. | Use a targeted prompt and compatible VLM/mmproj pair. |

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

Before publishing, verify that:

- The signature matches current source code.
- RGB888 requirement and byte-count validation are correct.
- `GenerateOptions` fields used by vision are current.
- Examples compile with actual VLM and mmproj files.
- Memory/performance notes are reviewed on physical devices.
