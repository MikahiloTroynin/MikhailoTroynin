---
title: "Installation issues"
description: "Troubleshoot dependency, CocoaPods, XCFramework, device setup, and first-run installation issues in Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Installation issues

Use this page when Edge Veda does not install cleanly, `flutter pub get` fails, `pod install` cannot complete, the native `XCFramework` is missing, or the first app cannot start on a device.

Installation failures usually come from one of four layers:

1. Flutter dependency setup.
2. iOS toolchain setup.
3. CocoaPods and native binary resolution.
4. Model download, import, or device storage.

## Baseline environment

| Area | Expected setup |
| --- | --- |
| Flutter | Flutter SDK 3.16.0 or later. |
| Package | `edge_veda: ^2.4.2` or the version selected for the project. |
| iOS target | `platform :ios, '13.0'` or higher in `ios/Podfile`. |
| Xcode | Installed and selected by `xcode-select -p`. |
| CocoaPods | `pod --version` returns a version number. |
| Device | Physical iPhone recommended for Metal GPU execution and realistic memory behavior. |
| Developer Mode | Enabled on the test iPhone. |
| Signing | Configured in `ios/Runner.xcworkspace`. |

## First clean check

Run this from the Flutter app root:

```bash
flutter clean
flutter pub get
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
flutter doctor -v
flutter run -d <device_id>
```
## `flutter pub get` fails

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `version solving failed` | Unsupported or conflicting package version. | Check `pubspec.yaml`, then run `flutter pub get` again. |
| `The current Dart SDK version is lower than required` | Flutter/Dart is too old. | Upgrade Flutter to the project-supported version. |
| Package cache errors | Local Flutter cache is stale or corrupted. | Run `flutter pub cache repair`. |
| Dependency is not picked up | Stale `pubspec.lock`. | Delete `pubspec.lock`, then run `flutter pub get`. |

Recommended reset:

```bash
rm -f pubspec.lock
flutter pub cache repair
flutter pub get
```

## `pod install` fails

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `pod: command not found` | CocoaPods is not installed. | Install CocoaPods using the team-approved method. |
| `Unable to find a specification for EdgeVedaCore` | Pod cache or podspec resolution issue. | Run `pod repo update`, then `pod install`. |
| `The platform of the target Runner is lower than iOS 13.0` | Deployment target is too low. | Set `platform :ios, '13.0'` or higher. |
| `Failed to download EdgeVedaCore.xcframework.zip` | Network or release asset access issue. | Retry on a stable network and check proxy/firewall rules. |
| Build keeps using an old native binary | Stale CocoaPods cache. | Clean `Pods`, `Podfile.lock`, and `pod cache`. |

Recommended reset:

```bash
cd ios
rm -rf Pods Podfile.lock
pod repo update
pod install
cd ..
```

If the native binary cache is suspected:

```bash
pod cache clean EdgeVedaCore --all
cd ios && pod install && cd ..
```

## Native `XCFramework` is missing

Check that:

- `pod install` was run from `ios/`.
- The app is opened through `ios/Runner.xcworkspace`, not `Runner.xcodeproj`.
- `EdgeVedaCore.xcframework` exists in the resolved pod artifacts.
- The machine can access GitHub Releases during installation.

Use verbose output when the download fails:

```bash
cd ios
pod install --verbose
cd ..
```

## App installs but does not start

Common causes:

- Code signing is not configured.
- Developer Mode is disabled on the iPhone.
- The device has not trusted the development certificate.
- The model file is missing or unreadable.
- The selected model is too large for the device.
- The app is being tested only in the iOS Simulator, which does not represent Metal GPU performance.

Fix checklist:

1. Open `ios/Runner.xcworkspace`.
2. Select the `Runner` target.
3. Open **Signing & Capabilities**.
4. Select a development team.
5. Enable **Automatically manage signing** for development.
6. Enable Developer Mode on the iPhone.
7. Run on a physical iPhone for Metal GPU testing.

## Model setup blocks first run

If the install succeeds but `EdgeVeda.init()` fails:

- Confirm that `modelPath` points to a readable local file.
- Confirm that the model file was fully downloaded.
- Confirm that the format matches the selected runtime path, for example supported `.gguf` for LLM models.
- Use `ModelAdvisor.canRun()` before loading a large model.
- Use `ModelAdvisor.checkStorageAvailability()` before downloading or importing a model.
- If using `ModelManager.importModel()`, make sure the source file is complete and accessible from the app sandbox.

## Clean reinstall path

Use this when multiple layers may be stale:

```bash
flutter clean
rm -f pubspec.lock
flutter pub get
cd ios
rm -rf Pods Podfile.lock
pod cache clean EdgeVedaCore --all
pod install
cd ..
flutter run
```

Do not delete downloaded model files unless the failure is clearly related to model corruption or unsupported model format.

## Diagnostics to collect

Include this in a bug report:

```bash
flutter --version
flutter doctor -v
pod --version
xcodebuild -version
```

Also include:

- Edge Veda version from `pubspec.lock`.
- iOS deployment target from `ios/Podfile`.
- Device model and iOS version.
- Whether the failure happens on simulator, physical device, or both.
- Full `pod install --verbose` output.
- Full `flutter run -v` output.

## Related docs

- [iOS build issues](./ios-build-issues.md)
- [Model loading issues](./model-loading-issues.md)
- [Memory issues](./memory-issues.md)
- [iOS device setup](../getting-started/ios-device-setup.md)
- [Quickstart troubleshooting](../getting-started/quickstart-troubleshooting.md)
