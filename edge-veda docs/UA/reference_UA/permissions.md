---
title: "Дозволи"
description: "Reference для platform permissions в Edge Veda apps: microphone, camera, photos, files, network, local storage і privacy prompts."
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

# Дозволи

Ця сторінка перелічує platform permissions, які можуть знадобитися Edge Veda application.

Edge Veda inference є local by default. Більшість permissions не потрібні core LLM runtime. Вони стають потрібними, коли host app records audio, imports images, reads user documents, downloads models або додає app-specific features навколо Edge Veda.

## Permission summary

| Feature | Permission needed | Required by SDK core? | Notes |
| --- | --- | --- | --- |
| Text generation | None | Ні | Потрібен local model file access всередині app sandbox. |
| Streaming chat | None | Ні | Те саме, що text generation. |
| Embeddings | None | Ні | Text input processed locally. |
| RAG over bundled/local docs | File access може бути app-specific | Ні | Files у app sandbox не потребують user permission. |
| Model download | Network access | App-specific | Потрібно лише коли app downloads models at runtime. |
| Speech-to-text | Microphone | Так для live recording | Whisper inference local, але recording потребує permission. |
| Voice pipeline | Microphone | Так для live voice input | TTS output зазвичай не потребує prompt. |
| Text-to-speech | None | Ні | Використовує OS speech output. |
| Vision from imported image | Photos або file picker access | App-specific | Потрібно, коли user selects images. |
| Vision from camera | Camera | App-specific | Потрібно, якщо app captures images. |
| Image generation | None | Ні | Saving to Photos може потребувати Photos permission. |
| Telemetry and tracing | None by default | Ні | Не зберігайте sensitive prompts або outputs у logs. |

## iOS permissions

### Microphone

Потрібен для live speech-to-text або voice pipeline input.

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone to transcribe your voice on device.</string>
```

Рекомендоване формулювання:

```text
This app uses the microphone to transcribe your voice on device. Audio is processed locally by Edge Veda.
```

### Camera

Потрібен лише якщо app captures images для vision inference.

```xml
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to analyze images on device.</string>
```

### Photos

Потрібен, коли app reads images from Photos або saves generated images to Photos.

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>This app lets you choose images for on-device analysis.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app can save generated images to your photo library.</string>
```

### Files

iOS document picker зазвичай надає scoped access до files, selected by user. Якщо app copies files into sandbox, later access зазвичай не потребує another prompt.

Use clear UI text для importing documents for RAG:

```text
Selected files are processed locally to build a searchable on-device index.
```

## macOS permissions і entitlements

Для sandboxed macOS apps permissions можуть контролюватися entitlements і user prompts.

| Capability | Example entitlement |
| --- | --- |
| Microphone input | `com.apple.security.device.audio-input` |
| Camera input | `com.apple.security.device.camera` |
| User-selected files | `com.apple.security.files.user-selected.read-only` або read/write |
| Network client access | `com.apple.security.network.client` |

## Android permissions

Android support може потребувати additional validation залежно від current release.

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

Для modern Android versions media access permissions залежать від target SDK і того, чи app reads images, video або audio from shared storage.

## Network access

Core local inference не потребує network access під час generation.

Network access може бути потрібен для:

- downloading models;
- fetching remote documents перед RAG index;
- app-specific sync;
- optional cloud handoff;
- crash reporting або analytics, які додає host app.

Не пишіть, що Edge Veda sends prompts to a server, якщо host application явно не додає таку behavior.

## Privacy-friendly permission copy

| Feature | Suggested copy |
| --- | --- |
| Microphone | `Audio is recorded only to transcribe your voice on device.` |
| Camera | `Photos are analyzed locally on this device.` |
| Photos import | `Selected images stay on this device unless you choose to share them.` |
| Document import | `Documents are processed locally to build your private search index.` |
| Generated image save | `Generated images are saved only when you choose to export them.` |

## Permission handling flow

1. Поясніть, навіщо permission потрібен, перед system prompt.
2. Request permission лише коли user starts related feature.
3. Handle denial без crash.
4. Дайте шлях до Settings, якщо required.
5. Тримайте local-processing claims accurate.
6. Не request permissions, які current feature не використовує.

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
| Vision inference from photo library | photos або file picker |
| Vision inference from camera | camera |
| Image generation demo | none для generation; photos permission лише для saving |
| RAG document search | file access для imported docs; no network, якщо docs local |

## Security і logging

Не логувати:

- raw microphone transcripts, якщо user не opt in;
- full documents, які використовуються в RAG;
- prompts with personal data;
- generated health або financial advice;
- image descriptions із sensitive content;
- file paths, які розкривають private user information.

Для production diagnostics використовуйте redacted traces.

## Review checklist

- Permissions requested only when needed.
- `Info.plist` strings specific і accurate.
- Android permissions match actual features.
- macOS entitlements match sandbox model.
- Local inference claims true для full feature.
- Model downloads і optional sync separated from inference.
- Permission denial має user-friendly fallback.
- Logs і traces не зберігають sensitive content by default.

## Пов'язані docs

- [Environment variables](./environment-variables.md)
- [Storage and memory](./storage-and-memory.md)
- [Privacy and offline inference](../concepts/privacy-and-offline-inference.md)
- [Voice pipeline](../guides/voice-pipeline.md)
- [Vision inference](../guides/vision-inference.md)
