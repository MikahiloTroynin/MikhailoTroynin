---
title: "Available MCP tools"
description: "Довідник Edge Veda MCP tools, inputs, outputs, permissions і troubleshooting behavior."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Available MCP tools

На цій сторінці описано заплановані Edge Veda MCP tools і пояснено, коли використовувати кожен tool.

Точний список може відрізнятися залежно від MCP server version. Завжди запускайте tool discovery у client або CLI перед тим, як покладатися на tool в automation workflow.

```bash
edge-veda-mcp list-tools
```

## Tool naming

Edge Veda MCP tools використовують prefix `edge_veda.`.

Приклади:

- `edge_veda.create_project`
- `edge_veda.inspect_project`
- `edge_veda.validate_models`
- `edge_veda.generate_docs_stub`
- `edge_veda.doctor`

## Tool categories

| Category | Tools |
| --- | --- |
| Project setup | `edge_veda.create_project`, `edge_veda.add_platform`, `edge_veda.add_example` |
| Project inspection | `edge_veda.inspect_project`, `edge_veda.read_config`, `edge_veda.list_capabilities` |
| Model checks | `edge_veda.validate_models`, `edge_veda.estimate_model_requirements` |
| Documentation | `edge_veda.generate_docs_stub`, `edge_veda.check_docs_links`, `edge_veda.generate_api_doc_stub` |
| Troubleshooting | `edge_veda.doctor`, `edge_veda.collect_diagnostics`, `edge_veda.explain_error` |
| Runtime preparation | `edge_veda.generate_runtime_config`, `edge_veda.check_platform_requirements` |

## Permission levels

| Level | Значення | Examples |
| --- | --- | --- |
| Read-only | Читає project files і повертає diagnostics. | `inspect_project`, `doctor`, `validate_models` |
| Write-safe | Створює або оновлює files лише в allowed paths. | `generate_docs_stub`, `generate_runtime_config` |
| Scaffold | Створює project або більший file tree. | `create_project` |
| External command | Запускає Flutter, Dart або platform commands. | `doctor`, `check_platform_requirements` |

Використовуйте `allowWrites: false`, коли потрібен лише audit.

## `edge_veda.create_project`

Створює starter Edge Veda Flutter або Dart project.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `projectName` | `string` | Yes | Project folder і display name. |
| `outputDir` | `string` | Yes | Parent directory для нового project. |
| `template` | `string` | No | Template name. Example: `flutter-chat`, `rag-demo`, `voice-assistant`. |
| `targetPlatforms` | `string[]` | No | Platforms для підготовки. Example: `["ios", "macos"]`. |
| `capabilities` | `string[]` | No | Edge Veda capabilities, які потрібно додати. |
| `packageName` | `string` | No | Dart package name override. |
| `orgName` | `string` | No | Reverse-domain organization name для platform bundles. |
| `allowOverwrite` | `boolean` | No | Дозволяє писати в existing folder, якщо це безпечно. |

### Output

```json
{
  "projectPath": "/workspace/edge_veda_chat",
  "createdFiles": [
    "pubspec.yaml",
    "lib/main.dart",
    "edge_veda.config.json",
    "docs/getting-started.md"
  ],
  "warnings": [],
  "nextActions": [
    "Run flutter pub get",
    "Add a local model file",
    "Run edge_veda.validate_models"
  ]
}
```

## `edge_veda.inspect_project`

Читає поточний workspace і повертає project metadata.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Path до project root. |
| `includeFiles` | `boolean` | No | Додає safe file tree summary. |
| `includeDependencies` | `boolean` | No | Додає parsed `pubspec.yaml` dependencies. |

### Коли використовувати

- MCP client підключено не до тієї folder;
- `create_project` завершився, але app не build-иться;
- documentation tools мають визначити project structure.

## `edge_veda.read_config`

Читає `edge_veda.config.json` або `edge-veda.mcp.json`.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `configFile` | `string` | No | Specific config file для читання. |
| `redactSecrets` | `boolean` | No | Приховує secret-looking values. Типово: `true`. |

## `edge_veda.validate_models`

Перевіряє local model paths, file names, expected formats і platform compatibility.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `modelsRoot` | `string` | No | Model directory. |
| `modelPath` | `string` | No | Один model file для validation. |
| `capability` | `string` | No | Capability: `text`, `embeddings`, `vision`, `stt`, `tts` або `image-generation`. |
| `targetPlatform` | `string` | No | Platform для validation. |

### Checks

Tool має повідомляти про:

- missing model files;
- unsupported extensions;
- files, що занадто великі для target device memory;
- missing tokenizer або companion files;
- platform-specific GPU або Metal constraints;
- warnings для high memory pressure.

## `edge_veda.estimate_model_requirements`

Оцінює memory, storage і runtime requirements для вибраних model files.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `modelPath` | `string` | Yes | Path до model file. |
| `contextLength` | `integer` | No | Запланований context length. |
| `batchSize` | `integer` | No | Запланований batch size. |
| `targetPlatform` | `string` | No | Target platform. |
| `targetDeviceRamGb` | `number` | No | Device memory estimate. |

## `edge_veda.generate_docs_stub`

Створює starter Markdown docs для project або capability.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `docsRoot` | `string` | No | Documentation root. Типово: `docs`. |
| `language` | `string` | No | `en`, `uk` або `both`. |
| `section` | `string` | No | Section name. Example: `getting-started`, `guides`, `troubleshooting`. |
| `capability` | `string` | No | Capability-specific docs для генерації. |

## `edge_veda.generate_api_doc_stub`

Створює API reference page з Dart class, method або symbol name.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `symbol` | `string` | Yes | Dart symbol. Example: `EdgeVeda.generate()`. |
| `sourceFile` | `string` | No | Source file path, якщо відомий. |
| `language` | `string` | No | Documentation language. |
| `template` | `string` | No | Template name. Example: `api-method`. |

## `edge_veda.check_docs_links`

Перевіряє Markdown links у docs tree.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `docsRoot` | `string` | No | Docs root. |
| `includeExternal` | `boolean` | No | Чи перевіряти external URLs. |

## `edge_veda.doctor`

Запускає environment і project diagnostics.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `checks` | `string[]` | No | Optional subset of checks. |
| `verbose` | `boolean` | No | Додає detailed diagnostic data. |

### Example response

```json
{
  "status": "warning",
  "checks": [
    {
      "name": "flutter",
      "status": "ok",
      "message": "Flutter SDK found"
    },
    {
      "name": "models",
      "status": "warning",
      "message": "modelsRoot does not exist"
    }
  ],
  "nextActions": [
    "Create models/ or update modelsRoot in edge-veda.mcp.json"
  ]
}
```

## `edge_veda.collect_diagnostics`

Збирає safe diagnostic information для support або issue reports.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `redactSecrets` | `boolean` | No | Приховує sensitive values. Типово: `true`. |
| `includeLogs` | `boolean` | No | Додає MCP logs, якщо доступні. |
| `includeFileTree` | `boolean` | No | Додає safe file tree summary. |

## `edge_veda.explain_error`

Пояснює Edge Veda error code або exception і пропонує recovery steps.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `errorCode` | `string` | Yes | Error code або exception name. |
| `context` | `object` | No | Optional context: platform, model type або operation. |

## Common tool errors

| Error | Значення | Fix |
| --- | --- | --- |
| `tool_not_found` | Client запросив tool, який server не відкриває. | Запустіть `list-tools` і оновіть client prompt або workflow. |
| `invalid_arguments` | Required input відсутній або має неправильний type. | Перевірте tool input schema. |
| `workspace_not_found` | `workspaceRoot` не існує. | Використайте absolute path. |
| `writes_disabled` | Tool потребує writes, але `allowWrites` вимкнено. | Вмикайте writes лише для trusted sessions. |
| `path_not_allowed` | Tool намагається писати поза allowed paths. | Оновіть `allowedWritePaths` або виберіть safe output path. |
| `command_failed` | Flutter, Dart або platform command завершилась з помилкою. | Прочитайте command output і запустіть `edge_veda.doctor`. |
