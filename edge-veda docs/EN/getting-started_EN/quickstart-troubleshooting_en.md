---
title: "Quickstart troubleshooting"
description: "Fix common Edge Veda quickstart issues across installation, iOS setup, model download, runtime initialization, and streaming."
sidebar_position: 7
status: "draft"
section: "getting-started"
lang: "en"
last_reviewed: "2026-04-29"
---

# Quickstart troubleshooting

Use this guide when the Getting Started flow does not work as expected.

The fastest way to debug Edge Veda quickstart issues is to identify the failing stage first:

1. Flutter and package installation
2. CocoaPods and native framework setup
3. iOS signing and device deployment
4. Model download or import
5. Runtime initialization
6. Text generation or streaming chat
7. Performance, memory, or thermal behavior

## Quick diagnosis table

| Stage | Symptom | Most likely cause | First fix |
| --- | --- | --- | --- |
| Package install | `package:edge_veda` cannot be resolved | Dependencies not fetched | Run `flutter pub get` |
| CocoaPods | `No such module 'edge_veda'` | Pods not installed or wrong Xcode file opened | Run `pod install` and open `.xcworkspace` |
| Signing | `Signing for "Runner" requires a development team` | Xcode signing not configured | Select a team in Signing & Capabilities |
| Device | iPhone is not listed | Device not trusted or Developer Mode disabled | Trust the Mac and enable Developer Mode |
| Model download | Download fails or stalls | Network interruption or low storage | Check Wi-Fi and storage, retry download |
| Model load | `ModelLoadException` | Model path missing or stale | Use `ModelManager` to resolve model path |
| Init | `InitializationException` | Model too large or wrong format | Check `ModelAdvisor.canRun()` |
| Generation | Empty or repeated output | Wrong chat template or prompt issue | Match template to model family |
| Performance | Very slow tokens | Debug mode or simulator | Run on device with `flutter run --release` |
| Stability | App crashes during generation | Memory pressure | Reduce `contextLength` or use a smaller model |

## 1. Package cannot be imported

### Symptom

```text
Target of URI doesn't exist: 'package:edge_veda/edge_veda.dart'
```

### Cause

The package is not in `pubspec.yaml`, or Flutter dependencies were not fetched after editing `pubspec.yaml`.

### Fix

Use the package manager command:

```bash
flutter pub add edge_veda
flutter pub get
```

Then restart the IDE or Dart analysis server.

## 2. CocoaPods cannot find or install the native dependency

### Symptom

```text
CocoaPods could not find compatible versions for pod "EdgeVedaCore"
```

### Cause

The local CocoaPods cache or podspec state is stale.

### Fix

Run:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

If the problem continues, clear the CocoaPods cache:

```bash
pod cache clean --all
cd ios
pod install
cd ..
```

## 3. `No such module 'edge_veda'`

### Symptom

```text
No such module 'edge_veda'
```

### Cause

The iOS workspace was not opened, or `pod install` was not run after adding the package.

### Fix

Always open the workspace, not the project file:

```bash
cd ios
pod install
cd ..
open ios/Runner.xcworkspace
```

Close any open `Runner.xcodeproj` window before rebuilding.

## 4. Xcode signing error

### Symptom

```text
Signing for "Runner" requires a development team
```

### Cause

Xcode does not know which Apple team should sign the app.

### Fix

1. Open `ios/Runner.xcworkspace`.
2. Select **Runner**.
3. Open **Signing & Capabilities**.
4. Enable **Automatically manage signing**.
5. Select your development team.

A free personal team is enough for local development builds.

## 5. iPhone is not detected

### Symptom

```bash
flutter devices
```

does not show the iPhone.

### Cause

The device is locked, not trusted, not connected correctly, or Developer Mode is disabled.

### Fix

- Unlock the phone.
- Reconnect the USB cable.
- Tap **Trust This Computer** on the device.
- Enable Developer Mode:
  - Settings → Privacy & Security → Developer Mode.
- Restart the iPhone if prompted.
- Run:

```bash
flutter devices
```

## 6. Model file not found

### Symptom

```text
ModelLoadException: Model file not found
```

### Cause

The model was not downloaded, the path is stale, or the app sandbox changed after reinstall.

### Fix

Use `ModelManager` instead of hardcoding model paths.

```dart
final modelManager = ModelManager();

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

If the SDK version exposes `isModelDownloaded()` or `getModelPath()`, use those helpers before initializing.

## 7. Runtime initialization fails

### Symptom

```text
InitializationException: Initialization failed
```

### Cause

Common causes:

- model too large for the device;
- wrong model format;
- corrupted or incomplete model file;
- not enough memory at runtime;
- `contextLength` too high.

### Fix

Check model fit before loading:

```dart
final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  print('Choose a smaller model.');
}
```

Reduce context length:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
);
```

Then retry initialization.

## 8. Download fails because of storage

### Symptom

```text
DownloadException: Insufficient disk space
```

### Cause

The device does not have enough free storage for the model file.

### Fix

Check storage before download:

```dart
final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  print(storage.warning);
}
```

Then offer one of these actions:

- free up device storage;
- choose a smaller model;
- postpone model download;
- use Wi-Fi and keep the app open.

## 9. Download stalls or fails mid-way

### Symptom

The download stops before completion.

### Cause

Network interruption, app suspension, or server timeout.

### Fix

Retry the download:

```dart
final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);
```

If the SDK supports resumable downloads, retrying should continue from the previous progress instead of downloading the full file again.

## 10. Output is garbage, repeated, or malformed

### Symptom

The model repeats text, outputs special tokens, or does not follow the chat.

### Cause

The chat template does not match the model family.

### Fix

Use the correct template:

```dart
final session = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.llama3Instruct,
);
```

Common mappings:

| Model family | Template |
| --- | --- |
| Llama 3.x Instruct | `ChatTemplateFormat.llama3Instruct` |
| Qwen3 | `ChatTemplateFormat.qwen3` |
| Phi 3.5 | `ChatTemplateFormat.chatML` |
| Gemma / TinyLlama / unknown | `ChatTemplateFormat.generic` |

## 11. Inference is slow

### Symptom

The model works, but token output is slow.

### Cause

Most often, the app is running in debug mode or on the simulator.

### Fix

Run on a physical iPhone:

```bash
flutter run --release
```

Or use profile mode when you need DevTools:

```bash
flutter run --profile
```

Do not benchmark from debug mode.

## 12. App crashes during generation

### Symptom

The app runs for a while and then is terminated by iOS.

### Cause

Memory pressure, especially on lower-memory devices or with large models and long context.

### Fix

Use a smaller model or lower context length:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
);
```

Also avoid running multiple heavy AI workers at the same time on low-memory devices.

## 13. UI freezes during generation

### Symptom

The UI becomes unresponsive while generation is running.

### Cause

The app may be doing too much work inside the stream loop or rebuilding too frequently.

### Fix

Keep the stream loop small:

```dart
await for (final chunk in session.sendStream(prompt)) {
  if (!chunk.isFinal) {
    setState(() {
      output += chunk.token;
    });
  }
}
```

For production, throttle UI updates if chunks arrive very quickly.

## 14. Button stays disabled after an error

### Symptom

The send or generate button remains disabled.

### Cause

The loading flag is not reset after an exception.

### Fix

Use `finally`:

```dart
try {
  await for (final chunk in edgeVeda.generateStream(prompt)) {
    // update UI
  }
} catch (error) {
  // show error
} finally {
  if (mounted) {
    setState(() => isLoading = false);
  }
}
```

## 15. Checklist before asking for help

Include this information in a bug report or support request:

- Edge Veda package version;
- Flutter version;
- Xcode version;
- iOS version;
- device model;
- simulator or physical device;
- debug, profile, or release mode;
- model name and approximate size;
- `contextLength`;
- `useGpu` value;
- complete error message;
- steps to reproduce;
- whether the issue happens after `flutter clean`.

## Clean rebuild sequence

When the project state is unclear, run a clean rebuild:

```bash
flutter clean
flutter pub get

cd ios
pod deintegrate
pod install
cd ..

flutter run --release
```

## Related pages

- [`installation.md`](./installation.md)
- [`first-text-generation.md`](./first-text-generation.md)
- [`first-streaming-chat.md`](./first-streaming-chat.md)
- [`model-setup.md`](./model-setup.md)
- [`ios-device-setup.md`](./ios-device-setup.md)
