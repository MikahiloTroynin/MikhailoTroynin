---
title: "EdgeVeda.init()"
description: "API reference page for the init() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.init()`

> Initializes the Edge Veda runtime configuration and verifies that the selected on-device model can be loaded.

Use `init()` before calling text generation, embeddings, or other APIs that depend on the core `EdgeVeda` runtime.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `init()` |
| Category | Core inference / Runtime initialization |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<void> init(EdgeVedaConfig config);
```

## What it does

`init()` stores the `EdgeVedaConfig` for the SDK instance and validates that the model referenced by `config.modelPath` can be loaded. It does not produce text or embeddings. It performs configuration validation, checks that the model file exists, and runs a background-isolate load test against the native runtime.

The method returns `Future<void>` and completes when the SDK instance is ready for subsequent calls such as `generate()`, `generateStream()`, and `embed()`.

## When to use it

Use `init()` when you need to:

- prepare an `EdgeVeda` instance for text generation or embeddings;
- validate that a downloaded or imported GGUF model file can be loaded;
- apply runtime settings such as context length, thread count, GPU usage, and KV-cache configuration.

Do not use this method when:

- the instance is already initialized; call `dispose()` first if you need to reinitialize with a different model or configuration;
- you only need to download or import a model; use `ModelManager` for model file management;
- you are initializing vision or image generation models, which have separate initialization APIs.

## Prerequisites

Before calling this method, make sure that:

- a compatible model file exists at `config.modelPath`;
- the app has permission to read the model file from its local storage location;
- the selected model fits the target device memory budget;
- the app chooses a realistic `contextLength` for the target device;
- GPU/Metal usage is enabled only on platforms where it is supported and tested;
- the app is prepared to handle model-load and memory-related failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `config` | `EdgeVedaConfig` | Yes | — | Runtime configuration used to initialize the SDK instance. | Must include a valid `modelPath`. Other fields control threads, context length, GPU usage, memory budget, flash attention, and KV-cache quantization. |

### `EdgeVedaConfig` fields

| Field | Type | Default | Description | Notes |
| --- | --- | --- | --- | --- |
| `modelPath` | `String` | Required | Path to the local GGUF model file. | The file must exist before calling `init()`. |
| `numThreads` | `int` | `4` | Number of CPU threads to use for inference. | Tune per device class. |
| `contextLength` | `int` | `2048` | Maximum context length in tokens. | Higher values increase memory usage. |
| `useGpu` | `bool` | `true` | Enables GPU acceleration where supported. | On iOS/macOS this typically means Metal. |
| `maxMemoryMb` | `int` | `1536` | Memory budget in MB. | Use conservative values on 4 GB devices. |
| `verbose` | `bool` | `false` | Enables verbose logging. | Useful during integration and debugging. |
| `flashAttn` | `int` | `-1` | Flash attention mode. | `-1` means auto. |
| `kvCacheTypeK` | `int` | `8` | KV-cache quantization type for keys. | `1 = F16`, `8 = Q8_0`. |
| `kvCacheTypeV` | `int` | `8` | KV-cache quantization type for values. | `1 = F16`, `8 = Q8_0`. |

## Returns

`Future<void>`

The future completes when the SDK has validated the configuration and confirmed that the model can be loaded. The method does not return a runtime handle, generated text, embeddings, or model metadata.

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `InitializationException` | The `EdgeVeda` instance is already initialized, or native initialization fails for an unknown or wrapped reason. | Call `dispose()` before reinitializing; log the details and show a recovery message. |
| `ModelLoadException` | The model file does not exist at `config.modelPath` or cannot be loaded by the native runtime. | Verify the path with `ModelManager`, re-download/import the model, or choose a compatible model. |
| `ConfigurationException` | The configuration is invalid. | Check context length, memory budget, thread count, and GPU settings. |
| `MemoryException` | Model load exceeds the configured or practical memory budget. | Reduce `contextLength`, choose a smaller model, or disable expensive options. |
| `EdgeVedaException` | A typed SDK exception is rethrown from validation or native load testing. | Handle by exception type where possible. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));
```

## Production-style example

```dart
Future<EdgeVeda> createRuntime(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      numThreads: 4,
      useGpu: true,
      maxMemoryMb: 1536,
    ));

    return edgeVeda;
  } on ModelLoadException catch (error) {
    throw Exception('The local model could not be loaded: ${error.message}');
  } on InitializationException catch (error) {
    throw Exception('Edge Veda initialization failed: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Not applicable. `init()` does not emit a stream. Use `generateStream()` after successful initialization.

## Behavior notes

- `init()` is the entry point for the core text/embedding runtime.
- The method validates the model file path before native initialization.
- The source implementation performs a background-isolate load test and frees the test context after validation.
- After `init()` completes, subsequent text generation can reuse a persistent streaming worker.
- Calling `init()` twice on the same instance without `dispose()` is an error.
- Vision and image generation have separate initialization paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Larger models increase load time, RAM usage, and storage requirements. | Start with a small recommended chat model such as a 1B-class GGUF model for first integration. |
| Context length | Higher context lengths increase KV-cache memory. | Use `2048` as a practical default; reduce on lower-memory devices. |
| GPU / Metal usage | GPU acceleration improves throughput on supported Apple devices but must be validated per platform. | Keep `useGpu: true` on validated iOS/macOS targets; test simulator and Android separately. |
| Memory budget | Too high may risk OS termination; too low may block model loading. | Keep `maxMemoryMb` conservative and validate on physical devices. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF LLM models | Yes | Used for text generation and embeddings. Model must be compatible with the native backend. |
| Whisper GGUF models | No for `init()` | Use Whisper-specific worker/session APIs. |
| Stable Diffusion models | No for `init()` | Use image generation initialization APIs. |
| Vision-language models | No for `init()` | Use `initVision()` / vision worker APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Metal GPU path is the primary validated target. |
| iOS simulator | Partial | CPU-only behavior may be slower and not representative. |
| macOS | Yes / package surface | Validate app sandbox and model file paths. |
| Android | Partial / validation pending | Treat as scaffolded until validated on target devices. |
| Web | No | Native runtime and model loading are not web-oriented. |

## Privacy and security

- Input data processed: local model file path and runtime configuration.
- Network access during inference: none.
- Local storage used: model files.
- Sensitive data considerations: avoid logging full local paths if they may expose user-specific directory names or project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `ModelLoadException: Model file not found` | `modelPath` points to a missing, moved, or not-yet-downloaded file. | Resolve the path with `ModelManager` and check the file before calling `init()`. |
| Initialization is slow on first run | The model is being validated by the native runtime. | Show a loading state and test on a physical device in release/profile mode. |
| Out-of-memory or OS termination | Model/context is too large for the device. | Use a smaller model or lower `contextLength` and `maxMemoryMb`. |
| Reinitialization fails | `init()` was called twice on the same instance. | Call `await edgeVeda.dispose()` before reinitializing. |

## Related APIs

- [`EdgeVeda.generate()`](./generate.md) — returns a complete text generation response after initialization.
- [`EdgeVeda.generateStream()`](./generate-stream.md) — streams generated tokens after initialization.
- [`EdgeVeda.dispose()`](./dispose.md) — releases runtime resources before reinitialization.
- [`ModelManager.downloadModel()`](../model-management/download-model.md) — obtains model files before initialization.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Public export file: `flutter/lib/edge_veda.dart`
- Generated Dart API: `EdgeVeda.init()`
- Example usage: `flutter/QUICKSTART.md`
- Related native API / FFI binding: native Edge Veda C bindings used by `evInit`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Before publishing, verify that:

- [ ] The signature matches the current source code.
- [ ] `EdgeVedaConfig` defaults match the current `types.dart`.
- [ ] The production example compiles.
- [ ] The platform notes match the current release.
- [ ] Error names match current typed exceptions.
- [ ] Model compatibility notes are reviewed by a maintainer.
