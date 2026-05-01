---
title: "macOS"
description: "Platform notes for running Edge Veda on macOS during development, benchmarking, and desktop Flutter experiments."
status: "draft"
section: "platforms"
platform: "macOS"
last_reviewed: "2026-04-30"
---

# macOS

Use macOS when you need a development workstation, desktop prototype, benchmark runner, or internal tool for Edge Veda. macOS is also useful for model preparation, prompt testing, RAG pipeline experiments, and profiling before you deploy to iPhone.

This page describes the intended macOS workflow and the constraints that differ from iOS.

## Support status

| Area | Status | Notes |
| --- | --- | --- |
| Flutter macOS | Platform path available / verify package release before production | The multi-platform roadmap tracks macOS support separately from the iOS path. |
| Apple Silicon Mac | Recommended | Best fit for Metal GPU acceleration and local development. |
| Intel Mac | Limited / CPU-oriented | Validate before use; performance and native binary compatibility may differ. |
| Metal GPU | Recommended | Use for realistic Apple-platform performance testing. |
| Desktop distribution | Roadmap / project-specific | Package signing, notarization, and model distribution need a separate release plan. |
| Production parity with iOS | Not automatic | Test memory, file paths, permissions, and packaging independently. |

## When to use macOS

Use macOS for:

- building and debugging the Flutter app before deploying to iPhone;
- testing prompts and chat templates with local models;
- running long benchmark sessions with easier observability;
- preparing model catalogs and RAG indexes;
- validating file-based workflows with larger documents;
- creating internal desktop tools for AI-assisted documentation, QA, or support.

Do not use macOS results as a direct substitute for iPhone validation. iPhone has stricter thermal, memory, lifecycle, and storage constraints.

## Development environment

Install and verify:

| Requirement | Recommended value | Check |
| --- | --- | --- |
| macOS | Recent stable release | Apple menu → About This Mac |
| Flutter SDK | `>= 3.16.0` | `flutter --version` |
| Xcode | Latest stable | `xcode-select -p` |
| CocoaPods | Installed if native pods are required | `pod --version` |
| Flutter desktop support | Enabled | `flutter config --enable-macos-desktop` |
| Test hardware | Apple Silicon recommended | `system_profiler SPHardwareDataType` |

Enable macOS desktop support if needed:

```bash
flutter config --enable-macos-desktop
flutter doctor
```

Create or update a project with macOS support:

```bash
flutter create --platforms=macos .
flutter pub add edge_veda
```

## Project structure

A Flutter app with macOS support usually contains:

```text
my_ai_app/
├── lib/
│   ├── main.dart
│   └── ai/
│       ├── edge_veda_runtime.dart
│       ├── model_locator.dart
│       └── benchmark_runner.dart
├── macos/
│   ├── Runner/
│   ├── Runner.xcworkspace
│   └── Podfile
└── models/
```

Keep `model_locator.dart` platform-aware. A model path that works on macOS may not work on iOS because app sandboxing and bundle paths are different.

## Model storage on macOS

macOS gives developers more flexibility than iOS, but production desktop apps still need a clear model storage strategy.

| Storage location | Best for | Notes |
| --- | --- | --- |
| Project-local `models/` directory | Development and demos | Do not rely on this path in packaged apps. |
| Application Support | Production desktop apps | Use a per-app directory and document storage size. |
| User-selected folder | Power users and internal tools | Requires file picker UX and permission handling. |
| Bundled model | Small demos | Large models can make app distribution impractical. |

Recommended path pattern for production:

```text
~/Library/Application Support/<app-name>/models/
```

If the app is sandboxed, use the appropriate macOS APIs to access user-selected files and persist security-scoped bookmarks where required.

## Basic initialization

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Summarize the local document in three bullets.',
);

print(response);
```

## macOS permissions and entitlements

The required permissions depend on your feature set.

| Capability | macOS setting | Notes |
| --- | --- | --- |
| Text generation | No special permission | Requires access to the local model file. |
| RAG over local files | File access / sandbox rules | Use user-selected files or app-owned storage. |
| Speech-to-text | Microphone permission | Add `NSMicrophoneUsageDescription`. |
| Vision from camera | Camera permission | Add `NSCameraUsageDescription`. |
| Vision from files | File picker or sandbox entitlement | Avoid broad file access when possible. |
| Text-to-speech | Usually no extra permission | Uses platform speech APIs. |

Example `Info.plist` entries:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for on-device speech transcription.</string>
<key>NSCameraUsageDescription</key>
<string>This app uses the camera for on-device vision inference.</string>
```

## Benchmarking on macOS

macOS is convenient for repeatable benchmark runs, but benchmark results should be labeled clearly.

Track at minimum:

| Metric | Why it matters |
| --- | --- |
| Time to first token | Measures initial prompt evaluation and model readiness. |
| Tokens per second | Measures sustained generation throughput. |
| Peak memory | Identifies model and context-size fit. |
| Steady-state memory | Shows long-session cost after the first prompt. |
| Thermal state | Reveals performance collapse during long sessions. |
| Worker reload count | Should stay low for stable sessions. |
| Error rate | Captures model load, generation, and cancellation failures. |

Example benchmark label:

```text
Platform: macOS
Device: MacBook Pro, Apple Silicon
Model: Llama 3.2 1B Instruct, quantized
GPU: Metal enabled
Context: 2048
Session length: 30 min
```

## Differences from iOS

| Area | macOS behavior | iOS behavior |
| --- | --- | --- |
| File access | More flexible during development | More constrained by app sandbox and bundle paths. |
| Thermal envelope | Larger, especially on desktops | Smaller; throttling happens sooner. |
| Memory | Usually more available | Mobile RAM is more constrained. |
| Lifecycle | Desktop app can remain active longer | App suspension/background limits apply. |
| Distribution | Signing and notarization | App Store / TestFlight / provisioning profile. |
| User expectations | Desktop storage and setup may be acceptable | Mobile apps need simpler onboarding and storage UX. |

## Production checklist

Before shipping a macOS app with Edge Veda:

- [ ] Confirm that the current package release includes the required macOS native binary path.
- [ ] Test on a clean machine, not only on the development Mac.
- [ ] Define where model files are stored.
- [ ] Validate sandboxed file access.
- [ ] Add microphone and camera usage strings if needed.
- [ ] Test app signing and notarization.
- [ ] Measure memory and thermal behavior during long sessions.
- [ ] Confirm offline behavior with network disabled.
- [ ] Do not log sensitive prompts, documents, transcripts, or generated outputs.
- [ ] Document model size, download time, and storage usage for users.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| macOS target is missing | Desktop support not enabled | Run `flutter config --enable-macos-desktop`, then recreate platform files. |
| Native library is not found | Package release or local binary path mismatch | Verify the current Edge Veda release and native artifact location. |
| Model loads on dev machine but not packaged app | Hardcoded local path | Move models to app-owned storage or user-selected folder. |
| File import fails in sandboxed app | Missing sandbox handling | Use file picker and security-scoped access. |
| Microphone is blocked | Missing usage description | Add `NSMicrophoneUsageDescription`. |
| Performance differs from iPhone | Different thermal and memory profile | Always validate final behavior on physical iPhone. |
| App fails notarization | Native binary or entitlements issue | Review signing, hardened runtime, and notarization logs. |

## Related docs

- `./ios.md`
- `./device-requirements.md`
- `./android-roadmap.md`
- `../guides/performance-tuning.md`
- `../guides/model-manager.md`
- `../guides/telemetry-and-tracing.md`
- `../guides/production-readiness.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
- Releases: `https://github.com/ramanujammv1988/edge-veda/releases`
