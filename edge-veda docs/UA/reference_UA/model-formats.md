---
title: "Формати моделей"
description: "Reference для model file formats, які використовує Edge Veda: GGUF, GGML Whisper files, multimodal projectors і Stable Diffusion model files."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/types.dart"
  - "README.md"
---

# Формати моделей

Edge Veda підтримує кілька local model file formats, тому що різні AI capabilities використовують різні native backends.

Ця сторінка пояснює, які file formats потрібні для кожної capability, як SDK зберігає downloaded models і що потрібно перевірити перед model load.

## Summary форматів

| Format | Де використовується | Typical extension | Backend | Нотатки |
| --- | --- | --- | --- | --- |
| `GGUF` | LLMs, embedding models, VLMs, multimodal projectors | `.gguf` | llama.cpp / libmtmd / related ggml stack | Основний format для text, embeddings і vision. |
| `GGML` Whisper files | Speech-to-text | `.bin` | whisper.cpp | Використовується для Whisper models, наприклад `ggml-tiny.en.bin`. |
| Stable Diffusion model files | Image generation | зазвичай `.gguf`, `.safetensors` або backend-specific files | stable-diffusion.cpp | Має бути сумісним зі скомпільованим image backend. |
| iOS system voices | Text-to-speech | local model file не потрібен | `AVSpeechSynthesizer` | Керується OS, а не `ModelManager`. |

## `GGUF`

`GGUF` — основний model format для Edge Veda text і vision workflows.

Використовуйте `GGUF` для:

- text generation models;
- instruction/chat models;
- tool-calling models;
- embedding models;
- vision-language models;
- multimodal projector files.

Приклад:

```dart
final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
));
```

## Whisper `GGML` files

Speech-to-text використовує Whisper models, підготовлені для whisper.cpp.

Такі files зазвичай мають `.bin` extension і names на кшталт:

- `ggml-tiny.en.bin`;
- `ggml-base.en.bin`;
- `ggml-small.bin`;
- `ggml-medium.bin`;
- `ggml-large-v3.bin`.

Приклад:

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

Vision workflows потребують два model files:

| File | Призначення |
| --- | --- |
| Main VLM `.gguf` | Виконує image/text reasoning. |
| `mmproj` `.gguf` | Проєктує visual embeddings у language model space. |

Приклад:

```dart
await visionWorker.initVision(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  contextSize: 2048,
  useGpu: true,
);
```

Main VLM і `mmproj` file мають відповідати одне одному. Не змішуйте projectors з іншої model family або іншого model size.

## Image generation model files

Image generation використовує stable-diffusion.cpp через Edge Veda image APIs.

Точний model file format залежить від image backend build і model variant. У documentation і examples вказуйте конкретний tested file type, а не пишіть, що підтримуються всі Stable Diffusion models.

Production page для image generation має вказувати:

- exact model file name;
- file format;
- quantization, якщо застосовується;
- tested device;
- memory requirement;
- recommended `ImageGenerationConfig`;
- чи model turbo-oriented або standard diffusion;
- expected generation time.

## Model cache behavior

`ModelManager` зберігає downloaded models в app support directory.

Model directory має зберігатися між app sessions і process restarts. Models видаляються після uninstall app або коли app видаляє їх через `ModelManager`.

File extensions обираються за model ID:

| Model ID pattern | Stored extension |
| --- | --- |
| IDs, що починаються з `whisper-` | `.bin` |
| Інші model IDs | `.gguf` |

Через цю convention custom model metadata має використовувати stable і зрозумілі model IDs.

## Model metadata

`ModelInfo` описує downloadable model.

| Field | Опис |
| --- | --- |
| `id` | Stable model identifier, який використовує `ModelManager`. |
| `name` | Human-readable model name. |
| `sizeBytes` | Очікуваний model file size. |
| `description` | Optional model description. |
| `downloadUrl` | Source URL для model download. |
| `checksum` | Optional SHA-256 checksum. |
| `format` | Model format, наприклад `GGUF` або `GGML`. |
| `quantization` | Quantization level, наприклад `Q4_K_M` або `Q8_0`. |
| `parametersB` | Приблизний parameter count у billions. |
| `maxContextLength` | Максимальний supported context length у tokens. |
| `capabilities` | Capability tags, наприклад `chat`, `vision`, `stt` або `tool-calling`. |
| `family` | Model family identifier, наприклад `llama3`, `qwen3`, `whisper` або `smolvlm`. |

## Checklist для custom model

Коли додаєте custom model, перевірте:

- file format відповідає API, яке буде її завантажувати;
- model export підходить для llama.cpp, whisper.cpp або stable-diffusion.cpp;
- model вкладається в memory і storage limits target device;
- quantization level задокументований;
- model family має compatible chat template;
- VLM models мають matching `mmproj` file;
- STT models використовують Whisper-compatible `.bin` files;
- license дозволяє redistribution або use у target product;
- file перевіряється checksum, якщо його завантажує app.

## Format compatibility matrix

| Capability | `GGUF` | Whisper `.bin` | Image model file | OS voice |
| --- | --- | --- | --- | --- |
| Text generation | Так | Ні | Ні | Ні |
| Streaming chat | Так | Ні | Ні | Ні |
| Function calling | Так, model-dependent | Ні | Ні | Ні |
| Structured output | Так | Ні | Ні | Ні |
| Embeddings | Так | Ні | Ні | Ні |
| RAG generation | Так | Ні | Ні | Ні |
| Vision | Так, з matching `mmproj` | Ні | Ні | Ні |
| Speech-to-text | Ні | Так | Ні | Ні |
| Text-to-speech | Ні | Ні | Ні | Так |
| Image generation | Ні | Ні | Так | Ні |

## Типові format errors

| Symptom | Імовірна причина | Fix |
| --- | --- | --- |
| Model fails to load | Wrong format для API | Використайте format, який очікує target runtime component. |
| Vision inference fails | Missing або mismatched `mmproj` | Завантажте projector, що належить до тієї самої VLM. |
| Whisper initialization fails | Wrong file extension або non-Whisper model | Використайте whisper.cpp-compatible `.bin` file. |
| Garbage або repeated output | Wrong chat template для model family | Узгодьте `ChatTemplateFormat` із model. |
| Out of memory | Model file завеликий або context зависокий | Використайте меншу model, нижчий `contextLength` або `ModelAdvisor`. |
| Checksum failure | Corrupt або incomplete file | Видаліть file і завантажте знову. |

## Пов'язані docs

- [Supported models](./supported-models.md)
- [Quantization levels](./quantization-levels.md)
- [Configuration options](./configuration-options.md)
- [Model manager](../guides/model-manager.md)
