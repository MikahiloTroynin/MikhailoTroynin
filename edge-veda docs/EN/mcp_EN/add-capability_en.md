---
title: "Add a capability with MCP"
description: "Use the Edge Veda MCP server to add text, streaming, RAG, speech, vision, or image generation capabilities to an existing project."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Add a capability with MCP

Use `edge_veda.add_capability` when an existing Edge Veda project needs one more AI capability without recreating the whole project.

This workflow is useful after the initial project scaffold is already in place and you want to add one of the following capabilities:

- `text-generation`;
- `streaming-chat`;
- `embeddings`;
- `rag`;
- `speech-to-text`;
- `text-to-speech`;
- `voice-pipeline`;
- `vision-inference`;
- `image-generation`;
- `model-manager`;
- `runtime-policy`;
- `telemetry-and-tracing`.

## When to use this tool

Use `edge_veda.add_capability` when you need to:

- add a new SDK usage example;
- update `edge_veda.config.json`;
- create placeholder folders for models, indexes, or assets;
- add permissions for microphone, camera, or file access;
- generate starter docs for the capability;
- add tests or smoke checks for the new workflow.

Do not use this tool when:

- the project has not been created yet;
- the target capability requires a custom architecture decision;
- production secrets or signing files must be changed;
- the generated changes cannot be reviewed before commit.

For a new workspace, start with [Create project](./create-project.md).

## Prerequisites

Before adding a capability, confirm that:

- the MCP server is installed and visible to the client;
- `workspaceRoot` points to the existing Edge Veda project;
- `pubspec.yaml` exists in the project root;
- `edge_veda.config.json` exists or can be created;
- `allowWrites` is enabled if the tool needs to modify files;
- the selected capability is supported by the target platform;
- the required local model files are available or planned.

Run diagnostics first:

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

## Basic tool call

Ask your MCP client:

```text
Add RAG capability to this Edge Veda project.
Update configuration, create a vector index placeholder, add a minimal example, and generate docs in English and Ukrainian.
```

The client should call:

```json
{
  "tool": "edge_veda.add_capability",
  "arguments": {
    "workspaceRoot": "/absolute/path/to/edge-veda-app",
    "capability": "rag",
    "targetPlatforms": ["ios", "macos"],
    "updateConfig": true,
    "updateDocs": true,
    "docsLanguages": ["en", "uk"],
    "createExample": true,
    "allowOverwrite": false
  }
}
```

## Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Absolute path to the existing project. |
| `capability` | `string` | Yes | Capability to add. Example: `rag`, `vision-inference`, `speech-to-text`. |
| `targetPlatforms` | `string[]` | No | Platforms to prepare. Example: `["ios", "macos"]`. |
| `updateConfig` | `boolean` | No | Updates `edge_veda.config.json`. |
| `updateDocs` | `boolean` | No | Creates or updates Markdown docs. |
| `docsLanguages` | `string[]` | No | Documentation languages. Example: `["en", "uk"]`. |
| `createExample` | `boolean` | No | Adds a minimal usage example. |
| `createTests` | `boolean` | No | Adds smoke tests where possible. |
| `modelPath` | `string` | No | Optional local model path for this capability. |
| `allowOverwrite` | `boolean` | No | Allows overwriting generated files when safe. |

## Expected output

A successful response should return a summary of changed files.

```json
{
  "status": "ok",
  "capability": "rag",
  "changedFiles": [
    "edge_veda.config.json",
    "lib/rag/rag_controller.dart",
    "lib/rag/vector_index_config.dart",
    "docs/en/guides/rag-pipeline.md",
    "docs/uk/guides/rag-pipeline.md"
  ],
  "createdFolders": [
    "models/embeddings",
    "data/vector-index"
  ],
  "warnings": [
    "No embedding model file was found. Add one before running RAG inference."
  ],
  "nextActions": [
    "Run flutter pub get",
    "Add an embedding model",
    "Run edge_veda.validate_models",
    "Run a local smoke test"
  ]
}
```

## Generated file changes

The exact file list depends on the capability. A typical write-capable run may update:

```text
edge_veda.config.json
lib/<capability>/
test/<capability>/
docs/en/guides/<capability>.md
docs/uk/guides/<capability>.md
docs/en/troubleshooting/<capability>-issues.md
docs/uk/troubleshooting/<capability>-issues.md
```

For capabilities that need local files, the tool may create placeholder folders:

```text
models/
data/
assets/
vector-index/
```

Large model files should not be committed.

## Capability-specific behavior

| Capability | Typical changes | Model requirement |
| --- | --- | --- |
| `text-generation` | Adds prompt runner, config block, basic generation example. | GGUF or another supported local text model. |
| `streaming-chat` | Adds streaming controller and UI-safe stream handling. | Text model with streaming support. |
| `embeddings` | Adds embedding config and vector helpers. | Embedding model. |
| `rag` | Adds embedding config, document loader placeholder, vector index folder. | Embedding model and optional generation model. |
| `speech-to-text` | Adds microphone permission notes and audio input example. | STT model. |
| `text-to-speech` | Adds voice output example and audio playback notes. | TTS model. |
| `voice-pipeline` | Combines STT, LLM, and TTS examples. | STT, text, and TTS models. |
| `vision-inference` | Adds image input example and camera/photo permission notes. | Vision-language model or image model. |
| `image-generation` | Adds prompt-to-image example and output storage notes. | Image generation model. |
| `runtime-policy` | Adds runtime configuration and budget defaults. | No model by itself. |
| `telemetry-and-tracing` | Adds local tracing configuration and privacy notes. | No model by itself. |

## Example: add text generation

```json
{
  "tool": "edge_veda.add_capability",
  "arguments": {
    "workspaceRoot": "/Users/me/dev/edge_veda_app",
    "capability": "text-generation",
    "targetPlatforms": ["ios", "macos"],
    "modelPath": "models/text-model.gguf",
    "updateConfig": true,
    "createExample": true,
    "updateDocs": true
  }
}
```

Expected config fragment:

```json
{
  "textGeneration": {
    "modelPath": "models/text-model.gguf",
    "contextLength": 2048,
    "useGpu": true
  }
}
```

## Example: add RAG

```json
{
  "tool": "edge_veda.add_capability",
  "arguments": {
    "workspaceRoot": "/Users/me/dev/edge_veda_app",
    "capability": "rag",
    "targetPlatforms": ["ios", "macos"],
    "updateConfig": true,
    "createExample": true,
    "updateDocs": true,
    "docsLanguages": ["en", "uk"]
  }
}
```

Expected config fragment:

```json
{
  "embeddings": {
    "modelPath": "models/embeddings/embedding-model.gguf",
    "dimension": 384
  },
  "rag": {
    "documentsRoot": "data/documents",
    "vectorIndexPath": "data/vector-index",
    "topK": 5
  }
}
```

## Example: add speech-to-text

```json
{
  "tool": "edge_veda.add_capability",
  "arguments": {
    "workspaceRoot": "/Users/me/dev/edge_veda_app",
    "capability": "speech-to-text",
    "targetPlatforms": ["ios"],
    "modelPath": "models/stt/whisper-base.bin",
    "updateConfig": true,
    "createExample": true
  }
}
```

For iOS, also review `Info.plist` and microphone permissions.

## Safe write policy

The tool should only write inside configured paths.

Recommended `edge-veda.mcp.json`:

```json
{
  "workspaceRoot": ".",
  "allowWrites": true,
  "allowedWritePaths": [
    "lib",
    "test",
    "docs",
    "examples",
    "models/.gitkeep",
    "data/.gitkeep",
    "edge_veda.config.json"
  ]
}
```

The tool should not write to:

- signing files;
- production secrets;
- external directories;
- generated build folders;
- model files downloaded without license confirmation.

## Validate the new capability

After the tool runs:

```bash
flutter pub get
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
edge-veda-mcp validate-models --workspace-root /absolute/path/to/edge-veda-app
```

Then run the platform target:

```bash
flutter run -d macos
```

For iOS:

```bash
flutter run -d <device-id>
```

## Review checklist

Before committing the generated changes, verify that:

- `edge_veda.config.json` contains valid paths;
- generated Dart examples compile;
- required permissions are documented;
- model files are excluded from Git when needed;
- generated docs link to the correct guide and troubleshooting pages;
- platform-specific limitations are explicit;
- privacy behavior is documented;
- the capability has at least one manual smoke test.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `writes_disabled` | `allowWrites` is disabled. | Enable writes for this session or run in dry-run mode. |
| `capability_not_supported` | The server version does not support the requested capability. | Run `edge-veda-mcp list-tools` and update the MCP server. |
| `unsupported_platform` | The capability is not available on the selected platform. | Remove the platform or choose a different capability. |
| `path_not_allowed` | The tool attempted to write outside `allowedWritePaths`. | Add a safe path or change the generated output location. |
| App builds but inference fails | Model path, format, or runtime config is wrong. | Run `edge_veda.validate_models`. |
| Permission prompt does not appear | Platform permission file was not updated. | Check `Info.plist`, Android manifest, or platform-specific settings. |

## Related documents

- [MCP overview](./overview.md)
- [Available tools](./available-tools.md)
- [Download model](./download-model.md)
- [MCP troubleshooting](./troubleshooting.md)
