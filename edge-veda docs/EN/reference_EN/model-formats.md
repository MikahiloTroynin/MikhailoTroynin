---
title: "Model formats"
description: "Reference for model file formats used by Edge Veda: GGUF, GGML Whisper files, multimodal projectors, and Stable Diffusion model files."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/types.dart"
  - "README.md"
---

# Model formats

Edge Veda supports several local model file formats because each AI capability uses a different native backend.

This page explains which file formats are used by each capability, how the SDK stores downloaded models, and what developers should validate before loading a model.

## Format summary

| Format | Used for | Typical extension | Backend | Notes |
| --- | --- | --- | --- | --- |
| `GGUF` | LLMs, embedding models, VLMs, multimodal projectors | `.gguf` | llama.cpp / libmtmd / related ggml stack | Main format for text, embeddings, and vision. |
| `GGML` Whisper files | Speech-to-text | `.bin` | whisper.cpp | Used for Whisper models such as `ggml-tiny.en.bin`. |
| Stable Diffusion model files | Image generation | usually `.gguf`, `.safetensors`, or backend-specific files | stable-diffusion.cpp | Must be compatible with the compiled image backend. |
| iOS system voices | Text-to-speech | no local model file | `AVSpeechSynthesizer` | Managed by the OS, not by `ModelManager`. |

## `GGUF`

`GGUF` is the primary model format for Edge Veda text and vision workflows.

Use `GGUF` for:

- text generation models;
- instruction/chat models;
- tool-calling models;
- embedding models;
- vision-language models;
- multimodal projector files.

Example:

```dart
final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
));
```

## Whisper `GGML` files

Speech-to-text uses Whisper models compiled for whisper.cpp.

These files typically use a `.bin` extension and names such as:

- `ggml-tiny.en.bin`;
- `ggml-base.en.bin`;
- `ggml-small.bin`;
- `ggml-medium.bin`;
- `ggml-large-v3.bin`.

Example:

```dart
final whisperPath = await modelManager.downloadModel(
  ModelRegistry.whisperTinyEn,
);

final whisperWorker = WhisperWorker();
await whisperWorker.spawn();
await whisperWorker.initWhisper(
  modelPath: whisperPath,
  numThreads: 4,
);
```

## Vision model files

Vision workflows require two model files:

| File | Purpose |
| --- | --- |
| Main VLM `.gguf` | Performs image/text reasoning. |
| `mmproj` `.gguf` | Projects visual embeddings into the language model space. |

Example:

```dart
await visionWorker.initVision(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  contextSize: 2048,
  useGpu: true,
);
```

The main VLM and its `mmproj` file must match. Do not mix projectors from another model family or model size.

## Image generation model files

Image generation uses stable-diffusion.cpp through Edge Veda image APIs.

The exact model file format depends on the image backend build and the model variant. For documentation and examples, describe the tested file type explicitly rather than saying that all Stable Diffusion models are supported.

A production image generation page should state:

- exact model file name;
- file format;
- quantization if applicable;
- tested device;
- memory requirement;
- recommended `ImageGenerationConfig`;
- whether the model is turbo-oriented or standard diffusion;
- expected generation time.

## Model cache behavior

`ModelManager` stores downloaded models in the app support directory.

The model directory is intended to persist across app sessions and process restarts. Models are removed when the app is uninstalled or when the app deletes them through `ModelManager`.

File extensions are selected by model ID:

| Model ID pattern | Stored extension |
| --- | --- |
| IDs starting with `whisper-` | `.bin` |
| Other model IDs | `.gguf` |

This convention means custom model metadata should use stable, clear model IDs.

## Model metadata

`ModelInfo` describes a downloadable model.

| Field | Description |
| --- | --- |
| `id` | Stable model identifier used by `ModelManager`. |
| `name` | Human-readable model name. |
| `sizeBytes` | Expected model file size. |
| `description` | Optional model description. |
| `downloadUrl` | Source URL for model download. |
| `checksum` | Optional SHA-256 checksum. |
| `format` | Model format, such as `GGUF` or `GGML`. |
| `quantization` | Quantization level, such as `Q4_K_M` or `Q8_0`. |
| `parametersB` | Approximate parameter count in billions. |
| `maxContextLength` | Maximum supported context length in tokens. |
| `capabilities` | Capability tags such as `chat`, `vision`, `stt`, or `tool-calling`. |
| `family` | Model family identifier such as `llama3`, `qwen3`, `whisper`, or `smolvlm`. |

## Custom model checklist

When adding a custom model, verify:

- the file format matches the API that will load it;
- the model was exported for llama.cpp, whisper.cpp, or stable-diffusion.cpp as appropriate;
- the model fits the target device memory and storage limits;
- the quantization level is documented;
- the model family has a compatible chat template;
- VLM models include a matching `mmproj` file;
- STT models use Whisper-compatible `.bin` files;
- the license allows redistribution or use in the target product;
- the file is validated by checksum if downloaded by the app.

## Format compatibility matrix

| Capability | `GGUF` | Whisper `.bin` | Image model file | OS voice |
| --- | --- | --- | --- | --- |
| Text generation | Yes | No | No | No |
| Streaming chat | Yes | No | No | No |
| Function calling | Yes, model-dependent | No | No | No |
| Structured output | Yes | No | No | No |
| Embeddings | Yes | No | No | No |
| RAG generation | Yes | No | No | No |
| Vision | Yes, with matching `mmproj` | No | No | No |
| Speech-to-text | No | Yes | No | No |
| Text-to-speech | No | No | No | Yes |
| Image generation | No | No | Yes | No |

## Common format errors

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Model fails to load | Wrong format for the API | Use the format expected by the target runtime component. |
| Vision inference fails | Missing or mismatched `mmproj` | Download the projector that belongs to the same VLM. |
| Whisper initialization fails | Wrong file extension or non-Whisper model | Use a whisper.cpp-compatible `.bin` file. |
| Garbage or repeated output | Wrong chat template for the model family | Match `ChatTemplateFormat` to the model. |
| Out of memory | Model file is too large or context is too high | Use a smaller model, lower `contextLength`, or use `ModelAdvisor`. |
| Checksum failure | Corrupt or incomplete file | Delete the file and download again. |

## Related docs

- [Supported models](./supported-models.md)
- [Quantization levels](./quantization-levels.md)
- [Configuration options](./configuration-options.md)
- [Model manager](../guides/model-manager.md)
