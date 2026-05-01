---
title: "Android Roadmap"
description: "Planned Android support for Edge Veda, expected architecture, validation gates, and migration notes from iOS."
status: "draft"
section: "platforms"
platform: "Android"
last_reviewed: "2026-04-30"
---

# Android Roadmap

Android support is part of the Edge Veda multi-platform direction, but Android should be treated as a roadmap platform until the project publishes and validates the Android release path.

Use this page to understand what is planned, what developers can prepare now, and what must be validated before production use.

## Current status

| Area | Status | Notes |
| --- | --- | --- |
| Flutter Android package path | Roadmap / awaiting validation | Track the GitHub roadmap and Android issue before relying on production support. |
| Android native SDK | Planned | Kotlin Android distribution is tracked separately from the Flutter package. |
| Android Web / browser | Planned separately | WebAssembly support is not the same as native Android support. |
| API parity with iOS | Goal, not guarantee | Method names may stay similar, but performance and runtime behavior must be validated. |
| Production use | Not recommended until release validation | Use iOS for production examples unless Android support is explicitly released and tested. |

## Roadmap goals

The Android roadmap should bring Edge Veda capabilities to Flutter Android apps while preserving the core project principles:

- on-device inference;
- no required cloud dependency during inference;
- long-lived workers;
- runtime supervision;
- scheduler-aware workloads;
- text generation and streaming;
- embeddings and RAG;
- speech-to-text;
- vision inference;
- image generation where device capability allows it;
- telemetry for debugging and performance analysis.

## Planned architecture

The expected Android implementation will likely need these layers:

```text
Flutter app
  ↓
Dart SDK API
  ↓
Platform channel / FFI boundary
  ↓
Android native binding
  ↓
C/C++ inference core
  ↓
CPU / GPU / device acceleration path
```

The final implementation may differ. Document the real architecture after the Android branch is merged and validated.

## Expected development requirements

When Android support becomes available, developers should expect requirements similar to:

| Requirement | Expected value | Notes |
| --- | --- | --- |
| Flutter SDK | Current stable version | Match package release notes. |
| Android Studio | Current stable version | Required for SDK, emulator, and Gradle tooling. |
| Android Gradle Plugin | Release-dependent | Follow the package example app. |
| Android NDK | Required if native C/C++ binaries are used | Version must match native build requirements. |
| Device architecture | `arm64-v8a` recommended | 64-bit devices are the target for realistic inference. |
| Physical device | Required for meaningful testing | Emulator performance is not representative. |
| RAM | 6 GB+ recommended for useful tests | Larger models may need more. |
| Storage | Several GB free | Model files can be large. |

## Expected permissions

Android permissions will depend on the enabled capability.

| Capability | Likely permission | Notes |
| --- | --- | --- |
| Text generation | None | Requires local model file access. |
| RAG over user files | Storage / document picker | Prefer Android system picker over broad storage permissions. |
| Speech-to-text | `RECORD_AUDIO` | Required for microphone capture. |
| Vision from camera | `CAMERA` | Required for live camera input. |
| Save generated images | Media permissions, depending on Android version | Follow scoped storage rules. |

Example Android manifest entries may include:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
```

Do not add permissions until the feature needs them.

## API parity targets

Android should aim for parity with the documented Dart API where possible.

| Capability | Target parity | Validation needed |
| --- | --- | --- |
| `EdgeVeda.init()` | High | Model path, native library load, memory behavior. |
| `generate()` | High | Token throughput, prompt formatting, cancellation. |
| `generateStream()` | High | Backpressure, UI thread safety, stream cancellation. |
| Chat sessions | Medium / high | Context management and summarization behavior. |
| Function calling | High | JSON validation and tool execution loop. |
| Structured output | High | Grammar support and validation mode behavior. |
| Embeddings | High | Vector shape, normalization, latency. |
| RAG | Medium / high | File access, index persistence, memory use. |
| Speech-to-text | Medium | Audio capture, chunking, model compatibility. |
| Vision inference | Medium | Camera integration and frame backpressure. |
| Image generation | Device-dependent | Memory, thermal, and acceleration path. |

## Key Android risks

Android is more fragmented than iOS. The documentation should explicitly handle:

- different GPU vendors;
- different Android versions;
- OEM-specific memory management;
- aggressive background process killing;
- storage access changes across Android versions;
- emulator vs physical device differences;
- 32-bit vs 64-bit device support;
- ABI packaging size;
- thermal throttling variance;
- permissions and privacy UX.

## Suggested validation gates

Android support should not be documented as production-ready until these gates pass:

| Gate | Required evidence |
| --- | --- |
| Build validation | Example Flutter Android app builds from a clean checkout. |
| Device validation | At least three physical Android devices tested. |
| ABI validation | `arm64-v8a` package works; unsupported ABIs fail clearly. |
| Model load validation | Missing, corrupted, and incompatible model files produce documented errors. |
| Streaming validation | `generateStream()` does not block the UI thread. |
| Memory validation | Long session does not crash under expected model/context size. |
| Thermal validation | Sustained workload degrades gracefully. |
| Permission validation | Microphone/camera flows handle denied permissions. |
| Offline validation | Inference works with network disabled. |
| Telemetry validation | Runtime traces are available for debugging. |

## Preparing an app for future Android support

Even before Android support is fully validated, structure the app so the migration is easier.

### Keep the AI layer behind an interface

```dart
abstract class LocalAiRuntime {
  Future<void> initialize(String modelPath);
  Future<String> generate(String prompt);
  Stream<String> generateStream(String prompt);
  Future<void> dispose();
}
```

### Avoid platform-specific paths in UI code

Keep model lookup in a separate class:

```dart
class ModelLocator {
  Future<String> resolveModelPath(String modelId) async {
    // Implement per platform.
    throw UnimplementedError();
  }
}
```

### Keep permissions feature-scoped

Request microphone permission only when the user starts speech input. Request camera permission only when the user opens a camera-based feature.

### Label unsupported platforms clearly

```dart
if (!Platform.isIOS && !Platform.isMacOS) {
  throw UnsupportedError(
    'This Edge Veda build currently supports Apple platforms only.',
  );
}
```

Update this guard when Android support is released and validated.

## Documentation updates required when Android ships

When Android support is available, update:

- `README.md`;
- `docs/en/platforms/android-roadmap.md`;
- `docs/uk/platforms/android-roadmap.md`;
- `docs/en/platforms/device-requirements.md`;
- `docs/uk/platforms/device-requirements.md`;
- getting-started installation docs;
- model setup docs;
- troubleshooting docs;
- examples using Android file paths and permissions;
- CI/CD setup docs;
- release notes.

At that point, either rename this page to `android.md` or keep this page as historical roadmap and create a new `android.md` platform guide.

## Roadmap checklist

- [ ] Confirm package release includes Android support.
- [ ] Confirm supported ABIs.
- [ ] Document Android SDK, NDK, Gradle, and Kotlin requirements.
- [ ] Add a minimal Android example.
- [ ] Add a streaming generation Android example.
- [ ] Add microphone permission flow for STT.
- [ ] Add camera permission flow for vision.
- [ ] Add model storage guidance for scoped storage.
- [ ] Add Android-specific troubleshooting.
- [ ] Add benchmark labels for Android devices.
- [ ] Add known limitations.
- [ ] Update production-readiness checklist.

## Related docs

- `./ios.md`
- `./macos.md`
- `./device-requirements.md`
- `../guides/runtime-policy.md`
- `../guides/scheduler-and-budgets.md`
- `../guides/memory-management.md`
- `../guides/production-readiness.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
