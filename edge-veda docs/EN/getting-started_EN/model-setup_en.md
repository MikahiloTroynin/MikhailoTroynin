---
title: "Model setup"
description: "Choose, download, import, and validate local models for Edge Veda."
sidebar_position: 5
status: "draft"
section: "getting-started"
lang: "en"
last_reviewed: "2026-04-29"
---

# Model setup

This guide explains how to prepare local models for Edge Veda.

Use this page when you need to:

- choose the first model for a quickstart;
- check whether a model fits on a device;
- download a model from `ModelRegistry`;
- import a local GGUF model;
- monitor download progress;
- avoid common memory and storage issues.

## Recommended first model

Start with `ModelRegistry.llama32_1b` for the first chat or text generation test.

It is the safest first choice because it is small enough for modern iPhones, supports chat and instruction-following, and is used by the official quickstart path.

## Model setup flow

![gs-model-setup](mermaid-diagrams/gs-model-setup.png)

## 1. Detect the device

Use `DeviceProfile.detect()` before selecting a model.

```dart
final device = DeviceProfile.detect();

print('Device: ${device.deviceName}');
print('RAM: ${device.totalRamGB} GB');
print('Chip: ${device.chipName}');
```

The device profile is useful because model choice depends on available RAM, CPU/GPU capability, and device generation.

## 2. Ask `ModelAdvisor` for a recommendation

Use `ModelAdvisor` when you want the SDK to recommend a model and configuration for the current device.

```dart
final rec = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);

if (rec.bestMatch != null) {
  print('Recommended: ${rec.bestMatch!.model.name}');
  print('Score: ${rec.bestMatch!.finalScore}/100');
  print('Fits: ${rec.bestMatch!.fits}');
}
```

Use cases can include chat, fast responses, reasoning, vision, speech, or other supported categories depending on the SDK version.

## 3. Check whether a model can run

Before downloading a large model, check whether the target device can run it.

```dart
final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  print('Choose a smaller model before downloading.');
}
```

This avoids downloading a file that the device cannot load reliably.

## 4. Check available storage

Large model files can fail during download if the device does not have enough free storage.

```dart
final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  print(storage.warning);
}
```

Run this check before the download, especially when the app offers multiple model choices.

## 5. Download a model from `ModelRegistry`

Use `ModelManager.downloadModel()` when the model is known and listed in the registry.

```dart
final modelManager = ModelManager();

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

print('Model path: $modelPath');
```

The returned `modelPath` is the value you pass to `EdgeVedaConfig`.

```dart
await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

## 6. Monitor download progress

For a production app, show progress during the first model download.

```dart
final subscription = modelManager.downloadProgress.listen((progress) {
  print('${progress.progressPercent}% - '
      '${progress.estimatedSecondsRemaining}s remaining');
});

try {
  final modelPath = await modelManager.downloadModel(
    ModelRegistry.llama32_1b,
  );
  print(modelPath);
} finally {
  await subscription.cancel();
}
```

Do not leave the user on an empty loading screen. Model files can be hundreds of megabytes.

## 7. Import a local model

Use `importModel()` when the model is already available on disk, bundled with the app, or provided by the user.

```dart
final modelManager = ModelManager();

final modelPath = await modelManager.importModel(
  ModelRegistry.llama32_1b,
  sourcePath: '/path/to/your/model.gguf',
  onProgress: (bytesCopied, totalBytes) {
    final percent = (bytesCopied / totalBytes * 100).toStringAsFixed(0);
    print('Copying: $percent%');
  },
);
```

Importing is useful for:

- offline test devices;
- enterprise apps with pre-approved model files;
- QA environments where downloads are blocked;
- models distributed outside the default registry.

## Starter model table

| Model | Approx. size | Template | Best for |
| --- | ---: | --- | --- |
| Llama 3.2 1B Instruct | 668 MB | `llama3Instruct` | General chat, first quickstart |
| Qwen3 0.6B | 397 MB | `qwen3` | Function calling, tools, low memory |
| TinyLlama 1.1B Chat | 669 MB | `generic` | Speed-first testing |
| Gemma 2 2B Instruct | 1.6 GB | `generic` | Balanced quality/speed |
| Phi 3.5 Mini Instruct | 2.3 GB | `chatML` | Higher-quality reasoning on stronger devices |
| MiniLM L6 v2 | 46 MB | embedding | RAG, similarity search |
| Whisper Tiny | 77 MB | stt | Fast transcription |
| Whisper Base | 148 MB | stt | Better transcription quality |
| SmolVLM2 500M | 607 MB | vision | Image and camera analysis |

Check the project README for the latest supported model names and registry identifiers before publishing.

## Chat template selection

Chat models require the right template. The wrong template can produce repeated, malformed, or low-quality output.

```dart
// Llama 3.x models
final llamaSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.llama3Instruct,
);

// Qwen3 models with tool calling
final qwenSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.qwen3,
);

// Phi 3.5 models
final phiSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.chatML,
);

// Unknown or generic chat models
final genericSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.generic,
);
```

## Choosing context length

`contextLength` controls how much text the model can consider at once. Larger values can improve long conversations, but they increase memory usage.

Start with:

```dart
contextLength: 2048
```

If the app crashes or the device is low on memory, reduce it:

```dart
contextLength: 1024
```

Use shorter context for older devices, background workloads, or apps that run multiple AI workers at once.

## Recommended production checks

Before calling `downloadModel()` or `init()` in a production app:

```dart
final device = DeviceProfile.detect();

final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  throw StateError('Selected model does not fit on this device.');
}

if (!storage.hasSufficientSpace) {
  throw StateError(storage.warning);
}
```

## Model cache behavior

After a successful download, the SDK can reuse the cached model path. The first run is slower because the model must be downloaded and loaded. Later runs should skip the download and go directly to runtime initialization.

Still, treat cached model paths as app-controlled storage. A reinstall, storage cleanup, or sandbox change can invalidate previous paths.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Download fails before starting | Not enough disk space. | Run `checkStorageAvailability()` and offer a smaller model. |
| Download stops mid-way | Network interruption. | Retry `downloadModel()`. Downloads should resume where possible. |
| `Model file not found` | Path is stale or model was not downloaded. | Use `ModelManager` to get the current model path. |
| Initialization fails | Model is too large or wrong format. | Use `ModelAdvisor.canRun()` and confirm the file is GGUF for text models. |
| Output is repeated or strange | Wrong chat template. | Match the model to `ChatTemplateFormat`. |
| App is killed during generation | Memory pressure. | Use a smaller model or reduce `contextLength`. |

## Next step

Continue with [`ios-device-setup.md`](./ios-device-setup.md) to prepare a physical iPhone for reliable on-device testing.
