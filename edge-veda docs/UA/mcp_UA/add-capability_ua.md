---
title: "Додавання capability через MCP"
description: "Використання Edge Veda MCP server для додавання text, streaming, RAG, speech, vision або image generation capabilities в існуючий project."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Додавання capability через MCP

Використовуйте `edge_veda.add_capability`, коли в існуючий Edge Veda project потрібно додати ще одну AI capability без повторного створення всього project.

Цей workflow корисний після того, як initial project scaffold уже створено, а вам потрібно додати одну з таких capabilities:

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

## Коли використовувати цей tool

Використовуйте `edge_veda.add_capability`, коли потрібно:

- додати новий SDK usage example;
- оновити `edge_veda.config.json`;
- створити placeholder folders для models, indexes або assets;
- додати permissions для microphone, camera або file access;
- згенерувати starter docs для capability;
- додати tests або smoke checks для нового workflow.

Не використовуйте цей tool, коли:

- project ще не створено;
- target capability потребує окремого architecture decision;
- потрібно змінювати production secrets або signing files;
- generated changes неможливо переглянути перед commit.

Для нового workspace почніть з [Create project](./create-project.md).

## Prerequisites

Перед додаванням capability перевірте, що:

- MCP server встановлено і client його бачить;
- `workspaceRoot` вказує на існуючий Edge Veda project;
- `pubspec.yaml` є в project root;
- `edge_veda.config.json` існує або може бути створений;
- `allowWrites` увімкнено, якщо tool має змінювати files;
- вибрана capability підтримується target platform;
- потрібні local model files доступні або заплановані.

Спочатку запустіть diagnostics:

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

## Базовий tool call

Попросіть MCP client:

```text
Add RAG capability to this Edge Veda project.
Update configuration, create a vector index placeholder, add a minimal example, and generate docs in English and Ukrainian.
```

Client має викликати:

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
| `workspaceRoot` | `string` | Yes | Absolute path до existing project. |
| `capability` | `string` | Yes | Capability для додавання. Example: `rag`, `vision-inference`, `speech-to-text`. |
| `targetPlatforms` | `string[]` | No | Platforms для підготовки. Example: `["ios", "macos"]`. |
| `updateConfig` | `boolean` | No | Оновлює `edge_veda.config.json`. |
| `updateDocs` | `boolean` | No | Створює або оновлює Markdown docs. |
| `docsLanguages` | `string[]` | No | Documentation languages. Example: `["en", "uk"]`. |
| `createExample` | `boolean` | No | Додає minimal usage example. |
| `createTests` | `boolean` | No | Додає smoke tests, де це можливо. |
| `modelPath` | `string` | No | Optional local model path для цієї capability. |
| `allowOverwrite` | `boolean` | No | Дозволяє overwrite generated files, якщо це безпечно. |

## Очікуваний output

Успішна response має повернути summary змінених files.

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

Точний перелік files залежить від capability. Типовий write-capable run може оновити:

```text
edge_veda.config.json
lib/<capability>/
test/<capability>/
docs/en/guides/<capability>.md
docs/uk/guides/<capability>.md
docs/en/troubleshooting/<capability>-issues.md
docs/uk/troubleshooting/<capability>-issues.md
```

Для capabilities, яким потрібні local files, tool може створити placeholder folders:

```text
models/
data/
assets/
vector-index/
```

Large model files не варто commit-ити.

## Capability-specific behavior

| Capability | Typical changes | Model requirement |
| --- | --- | --- |
| `text-generation` | Додає prompt runner, config block, basic generation example. | GGUF або інша supported local text model. |
| `streaming-chat` | Додає streaming controller і UI-safe stream handling. | Text model зі streaming support. |
| `embeddings` | Додає embedding config і vector helpers. | Embedding model. |
| `rag` | Додає embedding config, document loader placeholder, vector index folder. | Embedding model і optional generation model. |
| `speech-to-text` | Додає microphone permission notes і audio input example. | STT model. |
| `text-to-speech` | Додає voice output example і audio playback notes. | TTS model. |
| `voice-pipeline` | Поєднує STT, LLM і TTS examples. | STT, text і TTS models. |
| `vision-inference` | Додає image input example і camera/photo permission notes. | Vision-language model або image model. |
| `image-generation` | Додає prompt-to-image example і output storage notes. | Image generation model. |
| `runtime-policy` | Додає runtime configuration і budget defaults. | Model не потрібна сама по собі. |
| `telemetry-and-tracing` | Додає local tracing configuration і privacy notes. | Model не потрібна сама по собі. |

## Приклад: додати text generation

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

Очікуваний config fragment:

```json
{
  "textGeneration": {
    "modelPath": "models/text-model.gguf",
    "contextLength": 2048,
    "useGpu": true
  }
}
```

## Приклад: додати RAG

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

Очікуваний config fragment:

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

## Приклад: додати speech-to-text

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

Для iOS також перегляньте `Info.plist` і microphone permissions.

## Safe write policy

Tool має писати лише в configured paths.

Рекомендований `edge-veda.mcp.json`:

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

Tool не має писати в:

- signing files;
- production secrets;
- external directories;
- generated build folders;
- model files, завантажені без license confirmation.

## Перевірте нову capability

Після виконання tool:

```bash
flutter pub get
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
edge-veda-mcp validate-models --workspace-root /absolute/path/to/edge-veda-app
```

Потім запустіть platform target:

```bash
flutter run -d macos
```

Для iOS:

```bash
flutter run -d <device-id>
```

## Review checklist

Перед commit generated changes перевірте, що:

- `edge_veda.config.json` містить valid paths;
- generated Dart examples compile;
- required permissions задокументовані;
- model files виключені з Git, якщо потрібно;
- generated docs ведуть на правильні guide і troubleshooting pages;
- platform-specific limitations описані явно;
- privacy behavior задокументована;
- capability має хоча б один manual smoke test.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `writes_disabled` | `allowWrites` вимкнено. | Увімкніть writes для цієї session або запустіть dry-run mode. |
| `capability_not_supported` | Server version не підтримує requested capability. | Запустіть `edge-veda-mcp list-tools` і оновіть MCP server. |
| `unsupported_platform` | Capability недоступна на selected platform. | Приберіть platform або оберіть іншу capability. |
| `path_not_allowed` | Tool спробував писати поза `allowedWritePaths`. | Додайте safe path або змініть generated output location. |
| App build-иться, але inference падає | Model path, format або runtime config неправильні. | Запустіть `edge_veda.validate_models`. |
| Permission prompt не з'являється | Platform permission file не оновлено. | Перевірте `Info.plist`, Android manifest або platform-specific settings. |
