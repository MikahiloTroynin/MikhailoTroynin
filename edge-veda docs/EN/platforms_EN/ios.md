---
title: "iOS"
description: "Platform notes for running Edge Veda in Flutter iOS apps with on-device inference and Metal GPU acceleration."
status: "draft"
section: "platforms"
platform: "iOS"
last_reviewed: "2026-04-30"
---

# iOS

Edge Veda is currently strongest on iOS. Use this platform when you need a Flutter app that runs text generation, streaming chat, vision, speech-to-text, text-to-speech, embeddings, RAG, function calling, and image generation on a physical iPhone.

The main development path is:

1. create a Flutter app;
2. add the `edge_veda` package;
3. configure the iOS deployment target;
4. install CocoaPods dependencies;
5. copy or download model files to the device;
6. initialize `EdgeVeda`;
7. run inference on device.

## Support status

| Area | Status | Notes |
| --- | --- | --- |
| Flutter iOS | Supported | Primary platform for current SDK usage. |
| Physical iPhone | Recommended | Required for realistic Metal GPU performance and thermal behavior. |
| iOS Simulator | Partial | Useful for UI and integration checks, but slower because inference is CPU-bound. |
| Metal GPU | Supported | Recommended for text, vision, speech, and image generation workloads. |
| Offline inference | Supported | Inference does not require a cloud API key or server call. |
| Android parity | Roadmap | Do not assume iOS behavior is already available on Android. |

## Minimum development environment

Before starting, install and verify:

| Requirement | Recommended value | Check |
| --- | --- | --- |
| Flutter SDK | `>= 3.16.0` | `flutter --version` |
| Xcode | Latest stable | `xcode-select -p` |
| CocoaPods | Installed | `pod --version` |
| iOS deployment target | `13.0` or later | `ios/Podfile` |
| Apple Developer account | Free for development, paid for distribution | Xcode signing settings |
| Test device | iPhone 12 or later, 4 GB+ RAM | Physical device settings |
| Developer Mode | Enabled | iOS Settings → Privacy & Security → Developer Mode |

## Create an iOS project

```bash
flutter create my_ai_app
cd my_ai_app
flutter pub add edge_veda
```

Open `ios/Podfile` and set the minimum platform version:

```ruby
platform :ios, '13.0'
```

Install iOS native dependencies:

```bash
cd ios
pod install
cd ..
```

## Configure code signing

Open the generated workspace:

```bash
open ios/Runner.xcworkspace
```

In Xcode:

1. select the `Runner` target;
2. open **Signing & Capabilities**;
3. select your development team;
4. keep automatic signing enabled for local development;
5. connect the iPhone by cable or via wireless debugging;
6. trust the computer on the device;
7. enable Developer Mode if iOS asks for it.

For App Store distribution, use a paid Apple Developer account and validate the final binary with the same model packaging strategy that you will ship to users.

## Add a model file

Edge Veda needs local model files. The app can receive them in several ways:

| Strategy | Best for | Notes |
| --- | --- | --- |
| Bundled asset | Small demos and controlled internal apps | Increases app size. Avoid bundling very large models unless distribution rules allow it. |
| First-run download | Public apps | Download once, store locally, then run fully on device. |
| User-selected file | Developer tools or power-user apps | Requires file picker and local file access handling. |
| MDM / enterprise provisioning | Managed devices | Useful when models are distributed internally. |

Recommended starting points:

| Use case | Suggested model family | Why |
| --- | --- | --- |
| Chat / basic text generation | Llama 3.2 1B or similar small instruct model | Fits better on mobile and is suitable for first tests. |
| Tool calling | Qwen3 0.6B or similar compact model | Lower memory pressure and faster iteration. |
| Vision | SmolVLM2 or a small VLM | Better fit for sustained on-device vision tests. |
| Speech-to-text | Whisper tiny / small variants | Good balance between size and latency. |

Keep model path handling explicit. Do not hardcode a development-only path in production code.

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in one paragraph.',
);

print(response);
```

## Recommended project structure

```text
my_ai_app/
├── lib/
│   ├── main.dart
│   ├── ai/
│   │   ├── edge_veda_runtime.dart
│   │   ├── model_catalog.dart
│   │   └── inference_state.dart
│   └── features/
│       └── chat/
├── ios/
│   ├── Podfile
│   └── Runner.xcworkspace
└── assets/
    └── models/
```

Use a small wrapper around `EdgeVeda` instead of calling the SDK directly from UI widgets. This keeps initialization, model loading, memory handling, and error recovery in one place.

## Runtime behavior on iOS

Edge Veda is designed for long-running on-device AI sessions, not only short benchmark calls. On iOS, the app should expect:

- model loading to be slower than subsequent prompts;
- workers to stay alive after initialization;
- memory use to remain significant while a model is loaded;
- thermal pressure to affect throughput;
- the scheduler to protect the app from unstable workloads;
- background execution to be limited by normal iOS app lifecycle rules.

Do not assume that a model can keep running when the app is suspended. Save user-visible state and restore the session when the app returns to foreground.

## Permissions

The required permissions depend on the capabilities used by your app.

| Capability | Permission / configuration | Notes |
| --- | --- | --- |
| Text generation | None | Works with local text input and local model files. |
| Embeddings / RAG | File access, if documents are imported | Avoid logging sensitive document text. |
| Speech-to-text | Microphone permission | Add `NSMicrophoneUsageDescription`. |
| Text-to-speech | Usually no extra permission | Uses iOS speech APIs. |
| Vision inference | Camera or photo permissions if using live camera/photos | Add the relevant `Info.plist` usage strings. |
| Image generation | File/photo permission if saving to Photos | Ask only when saving or importing images. |

Example `Info.plist` entries:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for on-device speech transcription.</string>
<key>NSCameraUsageDescription</key>
<string>This app uses the camera for on-device vision inference.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app saves generated images to your photo library.</string>
```

## Performance guidance

Start with a small model and then scale up. Mobile performance is limited by RAM, thermal headroom, battery state, and model size.

| Factor | Recommendation |
| --- | --- |
| Model size | Start with 0.6B–1B text models for first iPhone tests. |
| Context length | Keep the initial context conservative, then increase after measuring memory use. |
| Streaming | Prefer streaming output for chat UX. |
| GPU | Use Metal on physical iPhone for realistic performance. |
| Concurrency | Avoid running text generation, STT, vision, and image generation at the same time unless the scheduler budget is configured. |
| Memory | Release idle workers when switching between heavy modalities. |
| Thermal state | Test long sessions, not only the first prompt. |

## Production checklist

Before shipping an iOS app with Edge Veda:

- [ ] The app runs on a physical iPhone, not only in Simulator.
- [ ] `ios/Podfile` has the correct deployment target.
- [ ] Code signing works for development and distribution.
- [ ] Model download, storage, and integrity checks are implemented.
- [ ] The app explains model storage size to users.
- [ ] The app handles missing, corrupted, or incompatible model files.
- [ ] Long sessions were tested under thermal pressure.
- [ ] The app handles low-memory warnings and worker disposal.
- [ ] User data is not logged accidentally.
- [ ] Microphone, camera, and photo permissions are requested only when needed.
- [ ] Offline behavior is tested with network disabled.
- [ ] Errors are mapped to user-readable messages.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `pod install` fails | CocoaPods missing or outdated | Run `sudo gem install cocoapods` or update CocoaPods, then retry. |
| Xcode cannot deploy to iPhone | Signing not configured | Select a development team in Signing & Capabilities. |
| Device asks to enable Developer Mode | iOS security requirement | Enable Developer Mode and restart the device. |
| App runs but inference is very slow | Running on Simulator or CPU path | Test on a physical iPhone with Metal GPU. |
| Model fails to load | Wrong path, unsupported file, missing asset | Validate the file exists before calling `init()`. |
| App is killed during long inference | Memory or thermal pressure | Use smaller model, lower context length, or configure runtime policy. |
| Microphone transcription does not start | Missing permission string or denied permission | Add `NSMicrophoneUsageDescription` and handle denied permission. |
| Generated text quality is poor | Wrong chat template or incompatible model | Match the chat template to the model family. |

## Related docs

- `../getting-started/ios-device-setup.md`
- `../getting-started/model-setup.md`
- `../guides/text-generation.md`
- `../guides/streaming-generation.md`
- `../guides/speech-to-text.md`
- `../guides/vision-inference.md`
- `../guides/image-generation.md`
- `./device-requirements.md`
- `./android-roadmap.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- iOS quickstart: `https://github.com/ramanujammv1988/edge-veda/blob/main/flutter/QUICKSTART.md`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
