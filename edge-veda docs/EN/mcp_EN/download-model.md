---
title: "Download a model with MCP"
description: "Use Edge Veda MCP tools to plan, download, place, register, and validate local model files."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Download a model with MCP

Use MCP-assisted model download when you want to prepare a local model for an Edge Veda capability and keep the project configuration consistent.

The MCP server can help with:

- selecting the expected model type for a capability;
- creating a download plan;
- validating file extension and expected size;
- placing model files in the configured `modelsRoot`;
- updating `edge_veda.config.json`;
- checking checksums when available;
- warning about licensing, disk usage, memory pressure, or platform compatibility.

The MCP server should not silently bypass license terms or download models into a repository without user review.

## Before you download

Confirm the target capability first.

| Capability | Typical model type | Typical folder |
| --- | --- | --- |
| `text-generation` | Local LLM model, often `GGUF` | `models/text/` |
| `embeddings` | Embedding model | `models/embeddings/` |
| `rag` | Embedding model and optional text model | `models/embeddings/`, `models/text/` |
| `speech-to-text` | STT model | `models/stt/` |
| `text-to-speech` | TTS model | `models/tts/` |
| `vision-inference` | Vision-language or image understanding model | `models/vision/` |
| `image-generation` | Image generation model | `models/image-generation/` |

Also confirm:

- target platform;
- target device RAM;
- available storage;
- expected quantization;
- license acceptance;
- whether the model can be distributed with the app;
- whether the model should be downloaded at build time, first run, or manually by the developer.

## Recommended workflow

1. Ask MCP to create a model download plan.
2. Review model source, license, size, checksum, and required files.
3. Download the model into `modelsRoot` or a local cache.
4. Validate the file.
5. Update `edge_veda.config.json`.
6. Run an inference smoke test.
7. Keep large model files out of Git unless the repository policy explicitly allows them.

## Create a download plan

Ask your MCP client:

```text
Create a model download plan for text generation on iOS and macOS.
Use a local model under models/text and update edge_veda.config.json after validation.
```

Expected tool call:

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

Expected response:

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

## Download the model

After review, the MCP client may call:

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

Expected response:

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

## Update config manually

If the download was done outside MCP, update `edge_veda.config.json` manually.

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

Then run validation:

```bash
edge-veda-mcp validate-models \
  --workspace-root /absolute/path/to/edge-veda-app \
  --model-path models/text/model.gguf \
  --capability text-generation \
  --target-platform ios
```

## Recommended `.gitignore`

Model files are usually large and should stay out of normal Git history.

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

Keep placeholder files if the folder must exist:

```text
models/.gitkeep
models/text/.gitkeep
models/embeddings/.gitkeep
```

## Validate storage and memory

Use model validation before running the app on a device.

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

The tool should warn about:

- missing model file;
- unsupported extension;
- missing tokenizer or companion files;
- size too large for target storage;
- estimated RAM pressure;
- incompatible quantization;
- missing platform acceleration;
- license or redistribution notes if configured.

## Model download modes

| Mode | Description | When to use |
| --- | --- | --- |
| Manual download | Developer downloads the file and places it in `modelsRoot`. | Best for private models or license-sensitive files. |
| MCP download | MCP downloads the file after user review. | Good for repeatable local setup. |
| Build-time download | CI or build script fetches the model. | Use only when license, cache, and secrets are handled correctly. |
| First-run download | App downloads the model when first opened. | Use for production apps that cannot bundle large models. |
| Bundled model | Model ships with the app. | Use only when file size and license allow it. |

## Security and privacy notes

The MCP server should:

- show the source URL before download;
- require explicit user approval for remote downloads;
- validate destination paths against `allowedWritePaths`;
- avoid logging signed URLs or private tokens;
- redact credentials in diagnostics;
- verify checksums when available;
- avoid committing downloaded models automatically.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `download_denied` | Remote download requires approval or is disabled. | Enable download tools only for trusted sessions. |
| `license_required` | The model requires license review. | Confirm license before download. |
| `checksum_mismatch` | The downloaded file does not match `expectedSha256`. | Delete the file and download again from a trusted source. |
| `disk_full` | Not enough local storage. | Free disk space or choose a smaller model. |
| `unsupported_format` | The file extension is not supported by the selected capability. | Choose a supported model format. |
| `model_too_large` | Estimated memory is too high for the device. | Use a smaller model or lower quantization. |
| `config_not_updated` | MCP could not write to `edge_veda.config.json`. | Check `allowWrites` and `allowedWritePaths`. |
| App cannot find the model | Path in config does not match file location. | Use a path relative to `workspaceRoot` and rerun validation. |

## Review checklist

Before using the model in development or production, verify that:

- the model source is trusted;
- license terms allow your intended use;
- checksum is verified when available;
- model file is placed under the configured `modelsRoot`;
- `edge_veda.config.json` points to the correct path;
- `.gitignore` excludes large model files;
- target devices have enough storage and RAM;
- privacy behavior is documented;
- there is a smoke test for the capability.

## Related documents

- [MCP overview](./overview.md)
- [Available tools](./available-tools.md)
- [Add capability](./add-capability.md)
- [MCP troubleshooting](./troubleshooting.md)
