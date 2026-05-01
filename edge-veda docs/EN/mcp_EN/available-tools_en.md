---
title: "Available MCP tools"
description: "Reference for Edge Veda MCP tools, inputs, outputs, permissions, and troubleshooting behavior."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Available MCP tools

This page lists the planned Edge Veda MCP tools and explains when to use each tool.

The exact list can vary by MCP server version. Always run tool discovery in your client or CLI before relying on a tool in an automation workflow.

```bash
edge-veda-mcp list-tools
```

## Tool naming

Edge Veda MCP tools use the `edge_veda.` prefix.

Examples:

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

| Level | Meaning | Examples |
| --- | --- | --- |
| Read-only | Reads project files and returns diagnostics. | `inspect_project`, `doctor`, `validate_models` |
| Write-safe | Creates or updates files only in allowed paths. | `generate_docs_stub`, `generate_runtime_config` |
| Scaffold | Creates a project or larger file tree. | `create_project` |
| External command | Runs Flutter, Dart, or platform commands. | `doctor`, `check_platform_requirements` |

Use `allowWrites: false` when you want audit-only behavior.

## `edge_veda.create_project`

Creates a starter Edge Veda Flutter or Dart project.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `projectName` | `string` | Yes | Project folder and display name. |
| `outputDir` | `string` | Yes | Parent directory for the new project. |
| `template` | `string` | No | Template name. Example: `flutter-chat`, `rag-demo`, `voice-assistant`. |
| `targetPlatforms` | `string[]` | No | Platforms to prepare. Example: `["ios", "macos"]`. |
| `capabilities` | `string[]` | No | Edge Veda capabilities to include. |
| `packageName` | `string` | No | Dart package name override. |
| `orgName` | `string` | No | Reverse-domain organization name for platform bundles. |
| `allowOverwrite` | `boolean` | No | Allows writing into an existing folder when safe. |

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

Reads the current workspace and returns project metadata.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Path to the project root. |
| `includeFiles` | `boolean` | No | Includes a safe file tree summary. |
| `includeDependencies` | `boolean` | No | Includes parsed `pubspec.yaml` dependencies. |

### Use when

- the MCP client is connected to the wrong folder;
- `create_project` completed but the app does not build;
- documentation tools need to know the project structure.

## `edge_veda.read_config`

Reads `edge_veda.config.json` or `edge-veda.mcp.json`.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `configFile` | `string` | No | Specific config file to read. |
| `redactSecrets` | `boolean` | No | Redacts secret-looking values. Default: `true`. |

## `edge_veda.validate_models`

Checks local model paths, file names, expected formats, and platform compatibility.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `modelsRoot` | `string` | No | Model directory. |
| `modelPath` | `string` | No | Single model file to validate. |
| `capability` | `string` | No | Capability such as `text`, `embeddings`, `vision`, `stt`, `tts`, or `image-generation`. |
| `targetPlatform` | `string` | No | Platform to validate against. |

### Checks

The tool should report:

- missing model files;
- unsupported extensions;
- files too large for target device memory;
- missing tokenizer or companion files;
- platform-specific GPU or Metal constraints;
- warnings for high memory pressure.

## `edge_veda.estimate_model_requirements`

Estimates memory, storage, and runtime requirements for selected model files.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `modelPath` | `string` | Yes | Path to the model file. |
| `contextLength` | `integer` | No | Intended context length. |
| `batchSize` | `integer` | No | Intended batch size. |
| `targetPlatform` | `string` | No | Target platform. |
| `targetDeviceRamGb` | `number` | No | Device memory estimate. |

## `edge_veda.generate_docs_stub`

Creates starter Markdown docs for a project or capability.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `docsRoot` | `string` | No | Documentation root. Default: `docs`. |
| `language` | `string` | No | `en`, `uk`, or `both`. |
| `section` | `string` | No | Section name. Example: `getting-started`, `guides`, `troubleshooting`. |
| `capability` | `string` | No | Capability-specific docs to generate. |

## `edge_veda.generate_api_doc_stub`

Creates an API reference page from a Dart class, method, or symbol name.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `symbol` | `string` | Yes | Dart symbol. Example: `EdgeVeda.generate()`. |
| `sourceFile` | `string` | No | Source file path if known. |
| `language` | `string` | No | Documentation language. |
| `template` | `string` | No | Template name. Example: `api-method`. |

## `edge_veda.check_docs_links`

Checks Markdown links inside the docs tree.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `docsRoot` | `string` | No | Docs root. |
| `includeExternal` | `boolean` | No | Whether to check external URLs. |

## `edge_veda.doctor`

Runs environment and project diagnostics.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `checks` | `string[]` | No | Optional subset of checks. |
| `verbose` | `boolean` | No | Includes detailed diagnostic data. |

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

Collects safe diagnostic information for support or issue reports.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `workspaceRoot` | `string` | Yes | Project root. |
| `redactSecrets` | `boolean` | No | Redacts sensitive values. Default: `true`. |
| `includeLogs` | `boolean` | No | Includes MCP logs if available. |
| `includeFileTree` | `boolean` | No | Includes a safe file tree summary. |

## `edge_veda.explain_error`

Explains an Edge Veda error code or exception and suggests recovery steps.

### Inputs

| Input | Type | Required | Description |
| --- | --- | --- | --- |
| `errorCode` | `string` | Yes | Error code or exception name. |
| `context` | `object` | No | Optional context such as platform, model type, or operation. |

## Common tool errors

| Error | Meaning | Fix |
| --- | --- | --- |
| `tool_not_found` | The client requested a tool the server does not expose. | Run `list-tools` and update the client prompt or workflow. |
| `invalid_arguments` | Required input is missing or has the wrong type. | Check the tool input schema. |
| `workspace_not_found` | `workspaceRoot` does not exist. | Use an absolute path. |
| `writes_disabled` | The tool requires writes but `allowWrites` is disabled. | Enable writes only for trusted sessions. |
| `path_not_allowed` | The tool tried to write outside allowed paths. | Update `allowedWritePaths` or choose a safe output path. |
| `command_failed` | A Flutter, Dart, or platform command failed. | Read the command output and run `edge_veda.doctor`. |

## Related documents

- [Overview](./overview.md)
- [Installation](./installation.md)
- [Create project](./create-project.md)
