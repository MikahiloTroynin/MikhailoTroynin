---
title: "Permissions"
description: "Reference for platform permissions used by Edge Veda apps: microphone, camera, photos, files, network, local storage, and privacy prompts."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "README.md"
  - "flutter/lib/src/voice_pipeline.dart"
  - "flutter/lib/src/whisper_worker.dart"
  - "flutter/lib/src/vision_worker.dart"
  - "flutter/lib/src/model_manager.dart"
  - "flutter/ios/EdgeVedaCore.podspec"
---

# Permissions

This page lists platform permissions that an Edge Veda application may need.

Edge Veda inference is local by default. Most permissions are not required by the core LLM runtime itself. They become necessary when the host app records audio, imports images, reads user documents, downloads models, or adds app-specific features around Edge Veda.

## Permission summary

| Feature | Permission needed | Required by SDK core? | Notes |
| --- | --- | --- | --- |
| Text generation | None | No | Requires local model file access inside the app sandbox. |
| Streaming chat | None | No | Same as text generation. |
| Embeddings | None | No | Text input is processed locally. |
| RAG over bundled/local docs | File access may be app-specific | No | Files inside the app sandbox do not need user permission. |
| Model download | Network access | App-specific | Needed only when the app downloads models at runtime. |
| Speech-to-text | Microphone | Yes for live recording | Whisper inference is local, but recording requires permission. |
| Voice pipeline | Microphone | Yes for live voice input | TTS output normally does not require a prompt. |
| Text-to-speech | None | No | Uses OS speech output. |
| Vision from imported image | Photos or file picker access | App-specific | Needed when the user selects images. |
| Vision from camera | Camera | App-specific | Needed if the app captures images. |
| Image generation | None | No | Saving to Photos may require Photos permission. |
| Telemetry and tracing | None by default | No | Avoid storing sensitive prompts or outputs in logs. |

## iOS permissions

### Microphone

Required for live speech-to-text or voice pipeline input.

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone to transcribe your voice on device.</string>
```

Recommended wording:

```text
This app uses the microphone to transcribe your voice on device. Audio is processed locally by Edge Veda.
```

### Camera

Required only if the app captures images for vision inference.

```xml
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to analyze images on device.</string>
```

### Photos

Required when the app reads images from Photos or saves generated images to Photos.

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>This app lets you choose images for on-device analysis.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app can save generated images to your photo library.</string>
```

### Files

The iOS document picker usually grants scoped access to files selected by the user. If the app copies files into its sandbox, later access normally does not require another prompt.

Use clear UI text when importing documents for RAG:

```text
Selected files are processed locally to build a searchable on-device index.
```

## macOS permissions and entitlements

For sandboxed macOS apps, permissions may be controlled by entitlements as well as user prompts.

| Capability | Example entitlement |
| --- | --- |
| Microphone input | `com.apple.security.device.audio-input` |
| Camera input | `com.apple.security.device.camera` |
| User-selected files | `com.apple.security.files.user-selected.read-only` or read/write |
| Network client access | `com.apple.security.network.client` |

## Android permissions

Android support may require additional validation depending on the current release.

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

For modern Android versions, media access permissions depend on target SDK and whether the app reads images, video, or audio from shared storage.

## Network access

Core local inference does not require network access during generation.

Network access may be needed for:

- downloading models;
- fetching remote documents before building a RAG index;
- app-specific sync;
- optional cloud handoff;
- crash reporting or analytics added by the host app.

Do not imply that Edge Veda sends prompts to a server unless the host application explicitly adds that behavior.

## Privacy-friendly permission copy

| Feature | Suggested copy |
| --- | --- |
| Microphone | `Audio is recorded only to transcribe your voice on device.` |
| Camera | `Photos are analyzed locally on this device.` |
| Photos import | `Selected images stay on this device unless you choose to share them.` |
| Document import | `Documents are processed locally to build your private search index.` |
| Generated image save | `Generated images are saved only when you choose to export them.` |

## Permission handling flow

1. Explain why the permission is needed before the system prompt.
2. Request permission only when the user starts the related feature.
3. Handle denial without crashing.
4. Offer a path to Settings if required.
5. Keep local-processing claims accurate.
6. Do not request permissions that the current feature does not use.

```dart
Future<void> startVoiceInput() async {
  final granted = await requestMicrophonePermission();

  if (!granted) {
    showPermissionHelp(
      'Microphone access is required for live transcription.',
    );
    return;
  }

  await voicePipeline.start();
}
```

## Permissions by example

| Example | Required permissions |
| --- | --- |
| Basic text generation | none |
| Streaming chat | none |
| Smart home control with typed commands | none |
| Voice journal | microphone |
| Offline voice assistant | microphone |
| Health advisor with typed input | none |
| Document Q&A over imported files | file picker / user-selected files |
| Vision inference from photo library | photos or file picker |
| Vision inference from camera | camera |
| Image generation demo | none for generation; photos permission only for saving |
| RAG document search | file access for imported docs; no network if docs are local |

## Security and logging

Do not log:

- raw microphone transcripts unless the user opts in;
- full documents used in RAG;
- prompts with personal data;
- generated health or financial advice;
- image descriptions that contain sensitive content;
- file paths that reveal private user information.

Use redacted traces for production diagnostics.

## Review checklist

- Permissions are requested only when needed.
- `Info.plist` strings are specific and accurate.
- Android permissions match actual features.
- macOS entitlements match the sandbox model.
- Local inference claims are true for the full feature.
- Model downloads and optional sync are separated from inference.
- Permission denial has a user-friendly fallback.
- Logs and traces do not store sensitive content by default.

## Related docs

- [Environment variables](./environment-variables.md)
- [Storage and memory](./storage-and-memory.md)
- [Privacy and offline inference](../concepts/privacy-and-offline-inference.md)
- [Voice pipeline](../guides/voice-pipeline.md)
- [Vision inference](../guides/vision-inference.md)
