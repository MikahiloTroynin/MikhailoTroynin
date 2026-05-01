---
title: "Installation"
description: "Install Edge Veda in a Flutter project and prepare the iOS runtime for local inference."
sidebar_position: 2
status: "draft"
section: "getting-started"
lang: "en"
last_reviewed: "2026-04-29"
---

# Installation

This guide shows how to add Edge Veda to a Flutter project and prepare the iOS target for local text generation.

The recommended installation path uses `flutter pub add edge_veda` so the project receives the current package version from pub.dev.

## Prerequisites

Before you start, install and verify the following tools:

| Requirement | Why it is needed | Check command |
| --- | --- | --- |
| Flutter SDK | Builds and runs the Flutter app. | `flutter --version` |
| Xcode | Builds the iOS app and native dependencies. | `xcode-select -p` |
| CocoaPods | Installs the native iOS framework dependency. | `pod --version` |
| Apple Developer account | Required for signing and deploying to a physical device. | Check in Xcode. |
| Physical iPhone | Recommended for realistic Metal GPU performance. | `flutter devices` |

For the first run, use a physical iPhone whenever possible. The iOS Simulator can be useful for UI checks, but it does not represent real on-device inference performance.

## 1. Create a Flutter project

Create a new Flutter app:

```bash
flutter create edge_veda_quickstart
cd edge_veda_quickstart
```

Verify that the starter app runs before adding Edge Veda:

```bash
flutter run
```

If the starter app does not run, fix the Flutter/Xcode setup first.

## 2. Add the Edge Veda package

Add the package through Flutter:

```bash
flutter pub add edge_veda
```

Then fetch dependencies:

```bash
flutter pub get
```

This updates `pubspec.yaml` automatically.

If you edit `pubspec.yaml` manually, check the latest package version on pub.dev before publishing documentation.

```yaml
dependencies:
  flutter:
    sdk: flutter
  edge_veda: ^2.5.0
```

## 3. Configure the iOS deployment target

Open `ios/Podfile` and ensure the deployment target is at least iOS 13:

```ruby
platform :ios, '13.0'
```

No additional Podfile configuration is required for the default setup. The native framework is installed through CocoaPods.

## 4. Install iOS pods

Run:

```bash
cd ios
pod install
cd ..
```

During pod installation, the native Edge Veda framework is downloaded from GitHub Releases. No manual framework download is required for the standard path.

## 5. Configure code signing

Open the iOS workspace:

```bash
open ios/Runner.xcworkspace
```

In Xcode:

1. Select the **Runner** target.
2. Open **Signing & Capabilities**.
3. Select your development team.
4. Make sure automatic signing is enabled.
5. Connect a physical iPhone and enable Developer Mode on the device if prompted.

## 6. Verify that the package imports

Open `lib/main.dart` and add the SDK import:

```dart
import 'package:edge_veda/edge_veda.dart';
```

Run static analysis:

```bash
flutter analyze
```

The import should resolve without errors.

## 7. Run in release mode for inference testing

For local inference, prefer release mode:

```bash
flutter run --release
```

Debug mode is useful for UI development, but it can make inference much slower. Use release mode when checking text generation latency.

## Expected project state

After installation, the project should have:

```text
edge_veda_quickstart/
├── ios/
│   ├── Podfile
│   └── Runner.xcworkspace
├── lib/
│   └── main.dart
└── pubspec.yaml
```

`pubspec.yaml` should include `edge_veda`, and `ios/Podfile` should set the minimum iOS deployment target.

## Troubleshooting

| Problem | Possible cause | Fix |
| --- | --- | --- |
| `pod: command not found` | CocoaPods is not installed. | Install CocoaPods, then rerun `pod install`. |
| Xcode signing error | No team selected for the Runner target. | Open `ios/Runner.xcworkspace` and configure Signing & Capabilities. |
| App installs but runs slowly | App is running in debug mode or on Simulator. | Use a physical device and run `flutter run --release`. |
| Package import fails | Dependencies were not fetched. | Run `flutter pub get` and restart the IDE. |
| Native framework download fails | Network or GitHub Releases access problem during `pod install`. | Retry on a stable network and clean pods if needed. |
| Device is not visible | iPhone is locked, not trusted, or Developer Mode is disabled. | Trust the Mac on the device and enable Developer Mode. |

## Next step

Continue with [`first-text-generation.md`](./first-text-generation.md) to initialize Edge Veda, download a starter model, and stream your first generated text.
