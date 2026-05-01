---
title: "Model loading issues"
description: "Troubleshoot model path, format, storage, checksum, compatibility, and initialization failures in Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Model loading issues

Use this page when `EdgeVeda.init()` fails, a model cannot be found, a `.gguf` file cannot be loaded, a downloaded model is incomplete, or the app crashes during model initialization.

Model loading issues usually come from one of these causes:

- `modelPath` points to a file that does not exist or is not readable.
- The model file is incomplete or corrupted.
- The model format is not supported by the selected API path.
- The model is too large for the device.
- The app does not have enough free disk space.
- A previous failed download left stale state.
- The runtime is initialized more than once without cleanup.

## Quick checklist

| Check | What to verify |
| --- | --- |
| File exists | `File(modelPath).exists()` returns `true`. |
| File size | The file size matches the expected model size. |
| Format | The file format matches the feature, for example supported `.gguf` for LLM inference. |
| Storage | The device has enough free space before download or import. |
| Memory fit | `ModelAdvisor.canRun()` returns an acceptable result for the selected model. |
| Path source | `modelPath` comes from `ModelManager`, app documents directory, or a verified import path. |
| Device | A physical iPhone is used for realistic Metal GPU execution. |

## Minimal safe loading flow

```dart
final modelManager = ModelManager();

final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  throw StateError(storage.warning);
}

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

final edgeVeda = EdgeVeda();
await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  useGpu: true,
));
```

## `Model file not found`

| Cause | Fix |
| --- | --- |
| Path was hardcoded for a development machine. | Use an app-local path returned by `ModelManager` or a platform file picker. |
| Model was bundled but not listed as an asset. | Add the asset to `pubspec.yaml`, then rebuild. |
| File is outside the app sandbox. | Copy or import it into an app-accessible directory. |
| Path was saved from a previous install. | Re-resolve the path after reinstall or update. |

Debug snippet:

```dart
final file = File(modelPath);
print('Model path: $modelPath');
print('Exists: ${await file.exists()}');
print('Size: ${await file.length()} bytes');
```

## Download does not complete

Fix checklist:

- Use `ModelManager.downloadModel()` instead of a custom downloader when possible.
- Keep the app active until the first large model download is complete.
- Check free disk space before download.
- Retry on a stable network.
- Delete only the incomplete model file, not the entire app data directory.
- Log `downloadProgress` to confirm whether the transfer resumes.

```dart
modelManager.downloadProgress.listen((progress) {
  print('${progress.progressPercent}% - '
      '${progress.estimatedSecondsRemaining}s remaining');
});
```

## Local import fails

| Cause | Fix |
| --- | --- |
| Source file is incomplete. | Re-download the model and verify file size. |
| Source path is not accessible from the app. | Use a file picker or copy into an app-accessible directory. |
| Expected model metadata does not match. | Use the correct `ModelRegistry` entry or a validated custom model definition. |
| Import was interrupted. | Retry the import. Atomic copy should prevent a corrupt final file. |

## Unsupported model format

Check:

- The model format required by the feature.
- Whether the model family is supported by the current Edge Veda version.
- Whether the quantization level is supported on the target device.
- Whether the file is genuinely in the expected format and not only renamed.
- Whether a known registry model, such as `ModelRegistry.llama32_1b`, loads successfully.

## Model is too large

Symptoms:

- App crashes during `EdgeVeda.init()`.
- iOS kills the app without a Dart exception.
- Memory rises sharply before generation begins.
- The same model works on a newer iPhone but not on an older one.

Fix checklist:

- Use `DeviceProfile.detect()` to identify the device tier.
- Use `ModelAdvisor.recommend()` for the target use case.
- Reduce model size or use a smaller quantization.
- Reduce `contextLength`.
- Avoid loading text, vision, STT, and image generation workers at the same time.
- Dispose idle workers before loading another large model.

```dart
final device = DeviceProfile.detect();
final rec = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);
print(rec.bestMatch?.model.name);
```

## Initialization hangs

| Cause | How to handle |
| --- | --- |
| Large model loading on a slow device. | Add progress UI and test with a smaller model. |
| Main isolate is blocked by app code. | Avoid synchronous heavy work in UI code. |
| Multiple initialization calls overlap. | Serialize calls to `EdgeVeda.init()`. |
| Native runtime waits for unavailable resources. | Capture native logs from Xcode. |

Guard against duplicate initialization:

```dart
class EdgeVedaRuntimeHolder {
  EdgeVeda? _runtime;
  Future<void>? _initFuture;

  Future<EdgeVeda> getOrInit(String modelPath) async {
    if (_runtime != null) return _runtime!;
    if (_initFuture != null) {
      await _initFuture;
      return _runtime!;
    }

    final runtime = EdgeVeda();
    _initFuture = runtime.init(EdgeVedaConfig(modelPath: modelPath));
    await _initFuture;
    _runtime = runtime;
    return runtime;
  }
}
```

## Generation works but output is poor

This is usually not a loading failure. Check:

- The model is instruction-tuned if used for chat.
- The correct chat template is selected for the model family.
- The prompt is not exceeding the configured context window.
- The app is not using a base model where an assistant model is expected.
- Sampling settings match the task.

## Diagnostics to collect

Include:

- Edge Veda package version.
- Device model, iOS version, and available storage.
- Model name, format, quantization level, and file size.
- Whether the model came from `downloadModel()`, `importModel()`, bundle asset, or custom path.
- `modelPath` shape without exposing private user data.
- Output from the file existence and file size debug snippet.
- Logs from `flutter run -v` and Xcode.
- Whether a smaller registry model loads successfully.

## Related docs

- [Installation issues](./installation-issues.md)
- [iOS build issues](./ios-build-issues.md)
- [Memory issues](./memory-issues.md)
- [Supported models](../reference/supported-models.md)
- [Model formats](../reference/model-formats.md)
- [Quantization levels](../reference/quantization-levels.md)
- [Model manager](../guides/model-manager.md)
- [Model advisor](../guides/model-advisor.md)
