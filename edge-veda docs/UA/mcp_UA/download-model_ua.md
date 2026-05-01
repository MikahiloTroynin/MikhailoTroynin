---
title: "Завантаження model через MCP"
description: "Використання Edge Veda MCP tools для планування, завантаження, розміщення, реєстрації й validation local model files."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Завантаження model через MCP

Використовуйте MCP-assisted model download, коли потрібно підготувати local model для Edge Veda capability і зберегти узгодженість project configuration.

MCP server може допомогти з такими діями:

- вибрати очікуваний model type для capability;
- створити download plan;
- перевірити file extension і expected size;
- розмістити model files у configured `modelsRoot`;
- оновити `edge_veda.config.json`;
- перевірити checksums, якщо вони доступні;
- попередити про licensing, disk usage, memory pressure або platform compatibility.

MCP server не має непомітно обходити license terms або завантажувати models у repository без review користувача.

## Перед download

Спочатку підтвердьте target capability.

| Capability | Typical model type | Typical folder |
| --- | --- | --- |
| `text-generation` | Local LLM model, часто `GGUF` | `models/text/` |
| `embeddings` | Embedding model | `models/embeddings/` |
| `rag` | Embedding model і optional text model | `models/embeddings/`, `models/text/` |
| `speech-to-text` | STT model | `models/stt/` |
| `text-to-speech` | TTS model | `models/tts/` |
| `vision-inference` | Vision-language або image understanding model | `models/vision/` |
| `image-generation` | Image generation model | `models/image-generation/` |

Також підтвердьте:

- target platform;
- target device RAM;
- available storage;
- expected quantization;
- license acceptance;
- чи можна розповсюджувати model разом з app;
- як саме model має завантажуватись: build time, first run або вручну developer.

## Рекомендований workflow

1. Попросіть MCP створити model download plan.
2. Перегляньте model source, license, size, checksum і required files.
3. Завантажте model у `modelsRoot` або local cache.
4. Перевірте file.
5. Оновіть `edge_veda.config.json`.
6. Запустіть inference smoke test.
7. Не додавайте large model files у Git, якщо repository policy прямо цього не дозволяє.

## Створіть download plan

Попросіть MCP client:

```text
Create a model download plan for text generation on iOS and macOS.
Use a local model under models/text and update edge_veda.config.json after validation.
```

Очікуваний tool call:

```json
{
  "tool": "edge_veda.plan_model_download",
  "arguments": {
    "workspaceRoot": "/absolute/path/to/edge-veda-app",
    "capability": "text-generation",
    "targetPlatforms": ["ios", "macos"],
    "modelsRoot": "models",
    "targetDeviceRamGb": 8,
    "preferredQuantization": "Q4",
    "updateConfig": true
  }
}
```

Очікувана response:

```json
{
  "status": "review_required",
  "capability": "text-generation",
  "recommendedFolder": "models/text",
  "expectedFormats": ["gguf"],
  "estimatedStorageGb": 4.2,
  "estimatedRamGb": 5.5,
  "warnings": [
    "Confirm the model license before download.",
    "Do not commit model files unless allowed by repository policy."
  ],
  "nextActions": [
    "Select a model source",
    "Confirm license",
    "Run edge_veda.download_model"
  ]
}
```

## Завантажте model

Після review MCP client може викликати:

```json
{
  "tool": "edge_veda.download_model",
  "arguments": {
    "workspaceRoot": "/absolute/path/to/edge-veda-app",
    "sourceUrl": "https://example.com/path/to/model.gguf",
    "destinationPath": "models/text/model.gguf",
    "expectedSha256": "<optional-checksum>",
    "updateConfig": true,
    "capability": "text-generation"
  }
}
```

Очікувана response:

```json
{
  "status": "ok",
  "destinationPath": "models/text/model.gguf",
  "bytesWritten": 4512345678,
  "checksumStatus": "verified",
  "updatedFiles": [
    "edge_veda.config.json"
  ],
  "nextActions": [
    "Run edge_veda.validate_models",
    "Run a text generation smoke test"
  ]
}
```

## Оновіть config вручну

Якщо download виконано поза MCP, оновіть `edge_veda.config.json` вручну.

```json
{
  "modelsRoot": "models",
  "textGeneration": {
    "modelPath": "models/text/model.gguf",
    "contextLength": 2048,
    "useGpu": true
  }
}
```

Потім запустіть validation:

```bash
edge-veda-mcp validate-models \
  --workspace-root /absolute/path/to/edge-veda-app \
  --model-path models/text/model.gguf \
  --capability text-generation \
  --target-platform ios
```

## Рекомендований `.gitignore`

Model files зазвичай великі й мають залишатися поза звичайною Git history.

```gitignore
# Local Edge Veda models
models/**/*.gguf
models/**/*.bin
models/**/*.safetensors
models/**/*.onnx
models/**/*.tflite
models/**/*.mlmodel
models/**/*.mlpackage

# Local vector indexes and generated caches
data/vector-index/
.edge-veda-cache/
```

Залиште placeholder files, якщо folder має існувати:

```text
models/.gitkeep
models/text/.gitkeep
models/embeddings/.gitkeep
```

## Перевірте storage і memory

Використовуйте model validation перед запуском app на device.

```json
{
  "tool": "edge_veda.validate_models",
  "arguments": {
    "workspaceRoot": "/absolute/path/to/edge-veda-app",
    "modelPath": "models/text/model.gguf",
    "capability": "text-generation",
    "targetPlatform": "ios",
    "targetDeviceRamGb": 8
  }
}
```

Tool має попередити про:

- missing model file;
- unsupported extension;
- missing tokenizer або companion files;
- занадто великий size для target storage;
- estimated RAM pressure;
- incompatible quantization;
- missing platform acceleration;
- license або redistribution notes, якщо це налаштовано.

## Model download modes

| Mode | Description | Коли використовувати |
| --- | --- | --- |
| Manual download | Developer завантажує file і кладе його в `modelsRoot`. | Найкраще для private models або license-sensitive files. |
| MCP download | MCP завантажує file після user review. | Добре для repeatable local setup. |
| Build-time download | CI або build script завантажує model. | Лише коли license, cache і secrets оброблено правильно. |
| First-run download | App завантажує model під час першого запуску. | Для production apps, які не можуть bundle large models. |
| Bundled model | Model постачається разом з app. | Лише коли file size і license це дозволяють. |

## Security і privacy notes

MCP server має:

- показувати source URL перед download;
- вимагати explicit user approval для remote downloads;
- перевіряти destination paths через `allowedWritePaths`;
- не логувати signed URLs або private tokens;
- приховувати credentials у diagnostics;
- перевіряти checksums, якщо вони доступні;
- не commit-ити downloaded models автоматично.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `download_denied` | Remote download потребує approval або вимкнений. | Вмикайте download tools лише для trusted sessions. |
| `license_required` | Model потребує license review. | Підтвердьте license перед download. |
| `checksum_mismatch` | Downloaded file не збігається з `expectedSha256`. | Видаліть file і завантажте знову з trusted source. |
| `disk_full` | Недостатньо local storage. | Звільніть disk space або виберіть smaller model. |
| `unsupported_format` | File extension не підтримується selected capability. | Оберіть supported model format. |
| `model_too_large` | Estimated memory зависока для device. | Використайте smaller model або lower quantization. |
| `config_not_updated` | MCP не може писати в `edge_veda.config.json`. | Перевірте `allowWrites` і `allowedWritePaths`. |
| App не знаходить model | Path у config не збігається з file location. | Використайте path відносно `workspaceRoot` і повторіть validation. |

## Review checklist

Перед використанням model у development або production перевірте, що:

- model source trusted;
- license terms дозволяють заплановане використання;
- checksum перевірено, якщо він доступний;
- model file розміщено під configured `modelsRoot`;
- `edge_veda.config.json` вказує на правильний path;
- `.gitignore` виключає large model files;
- target devices мають достатньо storage і RAM;
- privacy behavior задокументована;
- є smoke test для capability.
