---
title: "Create a project with MCP"
description: "Use the Edge Veda MCP server to scaffold a starter project with local AI capabilities."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Create a project with MCP

Use `edge_veda.create_project` to create a starter Edge Veda project from an MCP-compatible client.

This workflow is useful when you want an AI client to generate a consistent project structure, create starter docs, and prepare configuration files for local model-driven development.

## Before you start

Confirm that:

- the MCP server is installed;
- the MCP client can discover Edge Veda tools;
- `allowWrites` is enabled for the target workspace;
- Flutter and Dart are installed;
- the target output directory is writable;
- you know which capabilities the project needs.

Run:

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/parent-folder
edge-veda-mcp list-tools
```

## Choose a template

| Template | Use case | Included capabilities |
| --- | --- | --- |
| `flutter-chat` | Basic local chat app. | Text generation, streaming chat, model setup. |
| `rag-demo` | Document search or local knowledge assistant. | Embeddings, vector index, RAG pipeline. |
| `voice-assistant` | Offline voice assistant prototype. | STT, TTS, voice pipeline. |
| `vision-demo` | Image description or visual Q&A. | Vision inference, image input. |
| `image-generation-demo` | Local image generation prototype. | Image generation runtime and prompts. |
| `minimal-dart` | Non-Flutter Dart integration. | Core SDK setup and text generation. |

Start with `flutter-chat` if you only need a working baseline.

## Basic tool call

Ask your MCP client:

```text
Create a new Edge Veda project named edge_veda_chat in /Users/me/dev.
Use the flutter-chat template, target iOS and macOS, and include text generation plus streaming chat.
```

The client should call:

```json
{
  "tool": "edge_veda.create_project",
  "arguments": {
    "projectName": "edge_veda_chat",
    "outputDir": "/Users/me/dev",
    "template": "flutter-chat",
    "targetPlatforms": ["ios", "macos"],
    "capabilities": ["text-generation", "streaming-chat"],
    "orgName": "com.example",
    "allowOverwrite": false
  }
}
```

## Expected result

A successful response should include:

```json
{
  "status": "ok",
  "projectPath": "/Users/me/dev/edge_veda_chat",
  "createdFiles": [
    "pubspec.yaml",
    "lib/main.dart",
    "lib/edge_veda_app.dart",
    "edge_veda.config.json",
    "docs/getting-started.md",
    "docs/troubleshooting.md"
  ],
  "warnings": [
    "No model file was copied. Add a local model before running inference."
  ],
  "nextActions": [
    "cd /Users/me/dev/edge_veda_chat",
    "flutter pub get",
    "Add a model file to models/",
    "Update edge_veda.config.json",
    "flutter run -d macos"
  ]
}
```

## Generated project structure

A typical starter project should look like this:

```text
edge_veda_chat/
├── pubspec.yaml
├── edge_veda.config.json
├── edge-veda.mcp.json
├── models/
│   └── .gitkeep
├── lib/
│   ├── main.dart
│   ├── edge_veda_app.dart
│   ├── model_config.dart
│   └── chat_controller.dart
├── test/
│   └── edge_veda_config_test.dart
├── docs/
│   ├── getting-started.md
│   └── troubleshooting.md
└── README.md
```

## Configure local models

The generated project should not commit model files by default. Add models locally and keep them out of Git unless your repository policy explicitly allows them.

Example `edge_veda.config.json`:

```json
{
  "modelsRoot": "models",
  "textGeneration": {
    "modelPath": "models/text-model.gguf",
    "contextLength": 2048,
    "useGpu": true
  },
  "runtime": {
    "memoryPolicy": "balanced",
    "thermalPolicy": "adaptive",
    "telemetryEnabled": false
  }
}
```

Then validate:

```bash
edge-veda-mcp validate-models \
  --workspace-root /Users/me/dev/edge_veda_chat \
  --model-path models/text-model.gguf \
  --capability text
```

## Add docs during project creation

Include the `generateDocs` option if the tool supports it.

```json
{
  "tool": "edge_veda.create_project",
  "arguments": {
    "projectName": "edge_veda_rag",
    "outputDir": "/Users/me/dev",
    "template": "rag-demo",
    "targetPlatforms": ["ios", "macos"],
    "capabilities": ["embeddings", "rag"],
    "generateDocs": true,
    "docsLanguages": ["en", "uk"]
  }
}
```

Expected docs:

```text
docs/
├── en/
│   ├── getting-started/
│   │   └── overview.md
│   └── troubleshooting/
│       └── model-loading-issues.md
└── uk/
    ├── getting-started/
    │   └── overview.md
    └── troubleshooting/
        └── model-loading-issues.md
```

## Review generated files

Before running the app, review:

- `pubspec.yaml`;
- `edge_veda.config.json`;
- generated Dart files;
- platform folders;
- generated docs;
- `.gitignore`;
- model paths;
- privacy and telemetry defaults.

Do not commit:

- large local model files;
- private prompts or user data;
- device-specific build artifacts;
- signing certificates;
- production API keys.

## Run the project

From the generated project:

```bash
cd /Users/me/dev/edge_veda_chat
flutter pub get
flutter run -d macos
```

For iOS:

```bash
open ios/Runner.xcworkspace
```

Then configure signing in Xcode and run on a physical device if the selected model requires Apple Neural Engine, Metal, microphone, or camera access.

## Add another capability

After the project is created, use a follow-up MCP request:

```text
Add RAG support to this Edge Veda project. Create a docs page, update edge_veda.config.json, and add a placeholder vector index folder.
```

Expected tool call:

```json
{
  "tool": "edge_veda.add_example",
  "arguments": {
    "workspaceRoot": "/Users/me/dev/edge_veda_chat",
    "capability": "rag",
    "updateDocs": true,
    "language": "both"
  }
}
```

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `writes_disabled` | `allowWrites` is disabled in MCP config. | Set `allowWrites` to `true` for this session or run the tool in dry-run mode. |
| `target_exists` | The project folder already exists. | Use another `projectName` or set `allowOverwrite` only after reviewing the folder. |
| `flutter_create_failed` | Flutter SDK is missing or misconfigured. | Run `flutter doctor` and fix reported issues. |
| `invalid_package_name` | `projectName` is not a valid Dart package name. | Use lowercase letters, numbers, and underscores. |
| `unsupported_platform` | Template does not support a selected platform. | Remove the platform or choose another template. |
| Model file is missing after creation | Templates do not copy large model files. | Add the model manually and update `edge_veda.config.json`. |
| App builds but inference fails | Model path, format, or runtime config is wrong. | Run `edge_veda.validate_models` and review model compatibility. |

## Definition of done

A generated project is ready for manual development when:

- `flutter pub get` completes successfully;
- `edge_veda.doctor` returns no blocking errors;
- model paths are configured or intentionally left as placeholders;
- generated docs explain setup and first run;
- generated code is reviewed;
- `.gitignore` excludes local model files and build artifacts;
- the project builds on at least one target platform.

## Related documents

- [Overview](./overview.md)
- [Installation](./installation.md)
- [Available tools](./available-tools.md)
