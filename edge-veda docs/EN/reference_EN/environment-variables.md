---
title: "Environment variables"
description: "Reference for build-time and app-level environment variables used when building, testing, or configuring Edge Veda applications."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "Makefile"
  - "scripts/build-ios.sh"
  - "scripts/build-macos.sh"
  - "flutter/pubspec.yaml"
  - "README.md"
---

# Environment variables

This page describes environment variables and build variables that may be used when building Edge Veda or apps that embed Edge Veda.

Edge Veda does not require API keys for local inference. Environment variables are mainly used for native builds, CI, platform toolchains, and app-level configuration.

## Variable categories

| Category | Used for | Examples |
| --- | --- | --- |
| Build system variables | Native C++ and platform builds. | `BUILD_TYPE`, `NUM_JOBS`, `CMAKE`, `NINJA` |
| iOS variables | iOS XCFramework build settings. | `IOS_DEPLOYMENT_TARGET`, `IOS_PLATFORM` |
| Android variables | Android native build settings. | `ANDROID_NDK_HOME`, `ANDROID_ABI`, `ANDROID_PLATFORM` |
| WebAssembly variables | WASM toolchain settings. | `EMSDK`, `EMSCRIPTEN` |
| Flutter variables | App-level compile-time config. | `--dart-define` values |
| CI variables | Release and benchmark automation. | `GITHUB_TOKEN`, release tags, signing settings |
| App-level variables | Optional host app behavior. | default model ID, log level, tracing flag |

## Core build variables

| Variable | Default | Description |
| --- | --- | --- |
| `BUILD_TYPE` | `Release` | Native build type: `Release`, `Debug`, `RelWithDebInfo`. |
| `NUM_JOBS` | CPU count | Parallel build job count. |
| `CMAKE` | `cmake` | CMake executable. |
| `NINJA` | `ninja` | Ninja build executable. |
| `BUILD_DIR` | `build` | Directory for native build artifacts. |
| `CORE_DIR` | `core` | C++ core source directory. |
| `FLUTTER_DIR` | `flutter` | Flutter plugin directory. |

Example:

```bash
BUILD_TYPE=Release NUM_JOBS=8 make build-macos
```

## iOS variables

| Variable | Default | Description |
| --- | --- | --- |
| `IOS_DEPLOYMENT_TARGET` | `13.0` | Minimum iOS version used by native build scripts. |
| `IOS_PLATFORM` | `OS64` | Device platform target for iOS builds. |
| `IOS_SIMULATOR_PLATFORM` | `SIMULATORARM64` | Simulator target for Apple Silicon simulator builds. |

Example:

```bash
IOS_DEPLOYMENT_TARGET=15.0 make build-ios
```

## Android variables

| Variable | Default | Description |
| --- | --- | --- |
| `ANDROID_NDK_HOME` | required for Android builds | Path to Android NDK. |
| `ANDROID_NDK` | derived from `ANDROID_NDK_HOME` | NDK path used by the build. |
| `ANDROID_ABI` | `arm64-v8a` | Android ABI for a single target build. |
| `ANDROID_PLATFORM` | `android-24` | Android API level for native build. |
| `ANDROID_STL` | `c++_shared` | STL runtime setting. |

Example:

```bash
export ANDROID_NDK_HOME="$HOME/Library/Android/sdk/ndk/26.1.10909125"
make build-android
```

## WebAssembly variables

| Variable | Description |
| --- | --- |
| `EMSDK` | Path to Emscripten SDK. |
| `EMSCRIPTEN` | Path to the Emscripten compiler directory. |

Example:

```bash
export EMSDK="$HOME/dev/emsdk"
make build-wasm
```

## Flutter app-level variables

Use `--dart-define` for host app configuration. These are not required SDK variables; they are recommended app patterns.

```bash
flutter run \
  --dart-define=EDGE_VEDA_DEFAULT_MODEL_ID=llama-3.2-1b \
  --dart-define=EDGE_VEDA_LOG_LEVEL=info \
  --dart-define=EDGE_VEDA_ENABLE_TRACING=false
```

Read them in Dart:

```dart
const defaultModelId = String.fromEnvironment(
  'EDGE_VEDA_DEFAULT_MODEL_ID',
  defaultValue: 'llama-3.2-1b',
);

const enableTracing = bool.fromEnvironment(
  'EDGE_VEDA_ENABLE_TRACING',
  defaultValue: false,
);
```

## Recommended app-level variables

| Variable | Type | Description |
| --- | --- | --- |
| `EDGE_VEDA_DEFAULT_MODEL_ID` | `String` | Default model selected by the app. |
| `EDGE_VEDA_MODEL_BASE_URL` | `String` | Optional custom model metadata or mirror URL. |
| `EDGE_VEDA_LOG_LEVEL` | `String` | App log level: `debug`, `info`, `warn`, `error`. |
| `EDGE_VEDA_ENABLE_TRACING` | `bool` | Enables `PerfTrace` or app-level tracing. |
| `EDGE_VEDA_DISABLE_MODEL_DOWNLOADS` | `bool` | Forces bundled or already-downloaded models. |
| `EDGE_VEDA_FORCE_CPU` | `bool` | App-level switch to disable GPU paths where supported. |
| `EDGE_VEDA_BENCHMARK_MODE` | `bool` | Enables benchmark-only UI or deterministic measurement flow. |
| `EDGE_VEDA_RAG_INDEX_DIR` | `String` | Optional path for app-managed RAG indexes. |

## Values that should not be environment variables

Do not store sensitive or user-specific data as build-time variables.

Avoid:

- user prompts;
- imported documents;
- transcriptions;
- generated outputs;
- private file paths;
- medical, legal, or financial content;
- model license secrets unless required by distribution.

For local inference, Edge Veda does not need a provider API key.

## CI variables

| Variable | Use |
| --- | --- |
| `GITHUB_TOKEN` | GitHub release automation. |
| `RELEASE_TAG` | Version tag for release artifacts. |
| `BUILD_TYPE` | CI build type. |
| `NUM_JOBS` | CI build parallelism. |
| Apple signing variables | App release signing, if needed. |
| Android signing variables | Android release signing, if needed. |

Keep signing secrets in the CI secret store, not in repository files.

## Local `.env` files

Flutter does not automatically read `.env` files. If the host app uses `flutter_dotenv` or a similar package, document that as an app-level dependency.

```env
EDGE_VEDA_DEFAULT_MODEL_ID=llama-3.2-1b
EDGE_VEDA_LOG_LEVEL=debug
EDGE_VEDA_ENABLE_TRACING=true
EDGE_VEDA_DISABLE_MODEL_DOWNLOADS=false
```

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
```

## Environment variable precedence

Recommended precedence:

1. explicit runtime user setting;
2. command-line `--dart-define`;
3. `.env` file in local development;
4. app default;
5. SDK default.

Document which level wins when a value is set in more than one place.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `make build-android` fails with NDK error | `ANDROID_NDK_HOME` missing or invalid | Install Android NDK and export `ANDROID_NDK_HOME`. |
| `make build-wasm` fails | `EMSDK` not set or Emscripten not installed | Install Emscripten and export `EMSDK`. |
| iOS binary does not run on target device | Deployment target mismatch | Check `IOS_DEPLOYMENT_TARGET` and Xcode settings. |
| Build uses too much CPU | `NUM_JOBS` too high | Lower `NUM_JOBS`. |
| App selects the wrong model | `EDGE_VEDA_DEFAULT_MODEL_ID` overridden | Check `--dart-define`, `.env`, and app settings. |
| Tracing appears in production | `EDGE_VEDA_ENABLE_TRACING=true` | Disable tracing or redact traces. |

## Related docs

- [Configuration options](./configuration-options.md)
- [Permissions](./permissions.md)
- [Storage and memory](./storage-and-memory.md)
- [iOS platform notes](../platforms/ios.md)
- [macOS platform notes](../platforms/macos.md)
- [Android roadmap](../platforms/android-roadmap.md)
