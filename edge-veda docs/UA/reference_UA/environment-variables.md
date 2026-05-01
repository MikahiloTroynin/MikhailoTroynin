---
title: "Змінні середовища"
description: "Reference для build-time і app-level environment variables, які використовуються під час build, testing або configuration Edge Veda applications."
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

# Змінні середовища

Ця сторінка описує environment variables і build variables, які можуть використовуватися під час build Edge Veda або apps, що embed Edge Veda.

Edge Veda не потребує API keys для local inference. Environment variables переважно використовуються для native builds, CI, platform toolchains і app-level configuration.

## Категорії variables

| Category | Для чого | Examples |
| --- | --- | --- |
| Build system variables | Native C++ і platform builds. | `BUILD_TYPE`, `NUM_JOBS`, `CMAKE`, `NINJA` |
| iOS variables | iOS XCFramework build settings. | `IOS_DEPLOYMENT_TARGET`, `IOS_PLATFORM` |
| Android variables | Android native build settings. | `ANDROID_NDK_HOME`, `ANDROID_ABI`, `ANDROID_PLATFORM` |
| WebAssembly variables | WASM toolchain settings. | `EMSDK`, `EMSCRIPTEN` |
| Flutter variables | App-level compile-time config. | `--dart-define` values |
| CI variables | Release і benchmark automation. | `GITHUB_TOKEN`, release tags, signing settings |
| App-level variables | Optional host app behavior. | default model ID, log level, tracing flag |

## Core build variables

| Variable | Default | Description |
| --- | --- | --- |
| `BUILD_TYPE` | `Release` | Native build type: `Release`, `Debug`, `RelWithDebInfo`. |
| `NUM_JOBS` | CPU count | Parallel build job count. |
| `CMAKE` | `cmake` | CMake executable. |
| `NINJA` | `ninja` | Ninja build executable. |
| `BUILD_DIR` | `build` | Directory для native build artifacts. |
| `CORE_DIR` | `core` | C++ core source directory. |
| `FLUTTER_DIR` | `flutter` | Flutter plugin directory. |

Приклад:

```bash
BUILD_TYPE=Release NUM_JOBS=8 make build-macos
```

## iOS variables

| Variable | Default | Description |
| --- | --- | --- |
| `IOS_DEPLOYMENT_TARGET` | `13.0` | Minimum iOS version для native build scripts. |
| `IOS_PLATFORM` | `OS64` | Device platform target для iOS builds. |
| `IOS_SIMULATOR_PLATFORM` | `SIMULATORARM64` | Simulator target для Apple Silicon simulator builds. |

Приклад:

```bash
IOS_DEPLOYMENT_TARGET=15.0 make build-ios
```

## Android variables

| Variable | Default | Description |
| --- | --- | --- |
| `ANDROID_NDK_HOME` | required for Android builds | Path to Android NDK. |
| `ANDROID_NDK` | derived from `ANDROID_NDK_HOME` | NDK path used by build. |
| `ANDROID_ABI` | `arm64-v8a` | Android ABI для single target build. |
| `ANDROID_PLATFORM` | `android-24` | Android API level для native build. |
| `ANDROID_STL` | `c++_shared` | STL runtime setting. |

Приклад:

```bash
export ANDROID_NDK_HOME="$HOME/Library/Android/sdk/ndk/26.1.10909125"
make build-android
```

## WebAssembly variables

| Variable | Description |
| --- | --- |
| `EMSDK` | Path to Emscripten SDK. |
| `EMSCRIPTEN` | Path to Emscripten compiler directory. |

Приклад:

```bash
export EMSDK="$HOME/dev/emsdk"
make build-wasm
```

## Flutter app-level variables

Використовуйте `--dart-define` для host app configuration. Це не required SDK variables, а recommended app patterns.

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
| `EDGE_VEDA_DEFAULT_MODEL_ID` | `String` | Default model, яку app selects. |
| `EDGE_VEDA_MODEL_BASE_URL` | `String` | Optional custom model metadata або mirror URL. |
| `EDGE_VEDA_LOG_LEVEL` | `String` | App log level: `debug`, `info`, `warn`, `error`. |
| `EDGE_VEDA_ENABLE_TRACING` | `bool` | Enables `PerfTrace` або app-level tracing. |
| `EDGE_VEDA_DISABLE_MODEL_DOWNLOADS` | `bool` | Forces bundled або already-downloaded models. |
| `EDGE_VEDA_FORCE_CPU` | `bool` | App-level switch для disable GPU paths, де supported. |
| `EDGE_VEDA_BENCHMARK_MODE` | `bool` | Enables benchmark-only UI або deterministic measurement flow. |
| `EDGE_VEDA_RAG_INDEX_DIR` | `String` | Optional path для app-managed RAG indexes. |

## Values that should not be environment variables

Не зберігайте sensitive або user-specific data як build-time variables.

Avoid:

- user prompts;
- imported documents;
- transcriptions;
- generated outputs;
- private file paths;
- medical, legal або financial content;
- model license secrets, якщо не required by distribution.

Для local inference Edge Veda не потребує provider API key.

## CI variables

| Variable | Use |
| --- | --- |
| `GITHUB_TOKEN` | GitHub release automation. |
| `RELEASE_TAG` | Version tag для release artifacts. |
| `BUILD_TYPE` | CI build type. |
| `NUM_JOBS` | CI build parallelism. |
| Apple signing variables | App release signing, якщо needed. |
| Android signing variables | Android release signing, якщо needed. |

Зберігайте signing secrets у CI secret store, а не в repository files.

## Local `.env` files

Flutter не читає `.env` files автоматично. Якщо host app використовує `flutter_dotenv` або similar package, документуйте це як app-level dependency.

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

Документуйте, який level wins, якщо value задано в кількох місцях.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `make build-android` fails with NDK error | `ANDROID_NDK_HOME` missing або invalid | Install Android NDK і export `ANDROID_NDK_HOME`. |
| `make build-wasm` fails | `EMSDK` not set або Emscripten not installed | Install Emscripten і export `EMSDK`. |
| iOS binary does not run on target device | Deployment target mismatch | Check `IOS_DEPLOYMENT_TARGET` і Xcode settings. |
| Build uses too much CPU | `NUM_JOBS` too high | Lower `NUM_JOBS`. |
| App selects wrong model | `EDGE_VEDA_DEFAULT_MODEL_ID` overridden | Check `--dart-define`, `.env` і app settings. |
| Tracing appears in production | `EDGE_VEDA_ENABLE_TRACING=true` | Disable tracing або redact traces. |

## Пов'язані docs

- [Configuration options](./configuration-options.md)
- [Permissions](./permissions.md)
- [Storage and memory](./storage-and-memory.md)
- [iOS platform notes](../platforms/ios.md)
- [macOS platform notes](../platforms/macos.md)
- [Android roadmap](../platforms/android-roadmap.md)
