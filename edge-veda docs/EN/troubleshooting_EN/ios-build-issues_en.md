---
title: "iOS build issues"
description: "Troubleshoot Xcode, CocoaPods, signing, deployment target, architecture, and native linking issues for Edge Veda on iOS."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# iOS build issues

Use this page when an Edge Veda Flutter app fails during `flutter build ios`, `flutter run`, `pod install`, Xcode archive, native linking, code signing, or deployment to a physical iPhone.

Most iOS build failures are caused by a mismatch between Flutter, Xcode, CocoaPods, the iOS deployment target, or the native binary resolved by CocoaPods.

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
## Open the correct Xcode file

Always open:

```text
ios/Runner.xcworkspace
```

Do not build from:

```text
ios/Runner.xcodeproj
```

`Runner.xcworkspace` includes the CocoaPods workspace and is required for resolving `EdgeVedaCore`.

## Deployment target errors

If Xcode or CocoaPods reports that the deployment target is too low, open `ios/Podfile` and set:

```ruby
platform :ios, '13.0'
```

Then reinstall pods:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

Also check **Build Settings** → **iOS Deployment Target** for the `Runner` target in Xcode.

## `No such module EdgeVedaCore`

| Likely cause | Fix |
| --- | --- |
| Opened `Runner.xcodeproj` instead of `Runner.xcworkspace`. | Reopen the workspace file. |
| Pods were not installed. | Run `cd ios && pod install && cd ..`. |
| Native binary did not download. | Run `pod install --verbose` and check the download step. |
| CocoaPods cache is stale. | Remove `Pods`, `Podfile.lock`, and clean `EdgeVedaCore` cache. |

Reset command:

```bash
flutter clean
cd ios
rm -rf Pods Podfile.lock
pod cache clean EdgeVedaCore --all
pod install
cd ..
```

## `Framework not found EdgeVedaCore`

This means the pod may have resolved, but the linker cannot find the expected framework for the current target.

Check:

- The `EdgeVedaCore.xcframework` artifact exists.
- The current scheme targets the correct app.
- Debug and Release settings do not diverge unexpectedly.
- No old manually copied framework is shadowing the pod-managed one.

Then rebuild:

```bash
flutter build ios --debug -v
```

## Architecture or simulator linking errors

A typical message looks like:

```text
building for iOS Simulator, but linking in object file built for iOS
```

Fix checklist:

- Clear `Pods` and `Podfile.lock`.
- Clear the `EdgeVedaCore` pod cache.
- Reinstall pods.
- Test on a physical iPhone if simulator support is not required for the current task.
- Avoid manually copying old `XCFramework` builds into `ios/Frameworks`.

## Code signing errors

Common messages:

- `Signing for "Runner" requires a development team`
- `No profiles for 'com.example.app' were found`
- `A valid provisioning profile for this executable was not found`

Fix:

1. Open `ios/Runner.xcworkspace`.
2. Select the `Runner` target.
3. Open **Signing & Capabilities**.
4. Select a team.
5. Enable **Automatically manage signing** for development.
6. Use a unique bundle identifier.
7. Build once from Xcode, then return to `flutter run`.

A free Apple ID is usually enough for local development. App Store distribution requires an Apple Developer Program membership.

## Device does not appear

If `flutter devices` does not show the iPhone:

- Unlock the iPhone.
- Connect by USB or trusted wireless development.
- Tap **Trust This Computer**.
- Enable Developer Mode in **Settings** → **Privacy & Security** → **Developer Mode**.
- Restart the device if iOS asks for it.
- Run `flutter doctor -v` and fix reported iOS toolchain issues.

## Build succeeds but launch crashes

| Signal | Likely cause | Fix |
| --- | --- | --- |
| Crash before Dart logs | Native binary not loaded. | Reinstall pods and check `EdgeVedaCore.xcframework`. |
| Error mentions `modelPath` | Model file is missing. | Verify the path and file permissions. |
| Crash after `EdgeVeda.init()` | Model too large or memory pressure. | Use a smaller model and lower `contextLength`. |
| Feature fails when using microphone/camera | Missing iOS permission. | Add required `Info.plist` usage descriptions. |
| Works on simulator but not device | Signing, Developer Mode, or device-specific memory issue. | Test with Xcode attached. |

## Permissions

If the app uses these features, add the relevant user-facing permission text in `ios/Runner/Info.plist`.

| Feature | Permission area |
| --- | --- |
| Speech-to-text | Microphone. |
| Vision inference | Camera or photo library, depending on app behavior. |
| Document Q&A | File picker or local file access, depending on integration. |

## Release or archive failures

Release builds can fail even when Debug works because Release uses different optimization, signing, and stripping settings.

Check:

- `flutter build ios --release -v`
- Xcode archive logs
- Release signing team and provisioning profile
- Whether the native framework is linked according to the pod configuration
- Whether custom build scripts remove required slices or symbols

## Diagnostics to collect

Attach:

- `flutter doctor -v`
- `flutter --version`
- `pod --version`
- `xcodebuild -version`
- `ios/Podfile`
- `ios/Podfile.lock`
- Full `pod install --verbose` output
- Full `flutter run -v` or `flutter build ios -v` output
- Device model, iOS version, and whether the issue occurs on simulator or physical iPhone

## Related docs

- [Installation issues](./installation-issues.md)
- [Model loading issues](./model-loading-issues.md)
- [Memory issues](./memory-issues.md)
- [iOS device setup](../getting-started/ios-device-setup.md)
- [Permissions](../reference/permissions.md)
