---
title: "MCP troubleshooting"
description: "Diagnose and fix common Edge Veda MCP server, client, workspace, model, and tool-call issues."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# MCP troubleshooting

Use this page when the Edge Veda MCP server does not start, the MCP client cannot discover tools, a tool call fails, or generated project changes are incomplete.

Start with a minimal local check before debugging the client.

```bash
edge-veda-mcp --version
edge-veda-mcp list-tools
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

## Quick diagnosis table

| Symptom | Most likely cause | First check |
| --- | --- | --- |
| MCP client shows no Edge Veda tools | Server command fails during startup. | Run `edge-veda-mcp list-tools` manually. |
| `command not found` | Executable is not in `PATH`. | Check Dart global bin or source install path. |
| `workspace_not_found` | Wrong `workspaceRoot`. | Use an absolute path. |
| `invalid_arguments` | Tool input does not match schema. | Compare with `list-tools` output. |
| `writes_disabled` | Write tools are blocked. | Check `allowWrites`. |
| `path_not_allowed` | Tool tried to write outside allowed paths. | Check `allowedWritePaths`. |
| Tool call hangs | Long-running scan or protocol output issue. | Check logs and timeout settings. |
| Generated config is incomplete | Capability or model inputs were missing. | Provide `capability`, `modelPath`, and `targetPlatforms`. |

## 1. Server does not start

### Symptoms

- MCP client does not show `edge_veda.*` tools.
- Client logs show process exit during startup.
- CLI returns `command not found`.

### Checks

Run:

```bash
which edge-veda-mcp
edge-veda-mcp --version
edge-veda-mcp --help
```

On Windows PowerShell:

```powershell
Get-Command edge-veda-mcp
edge-veda-mcp --version
```

If installed through Dart, confirm that the global bin folder is available.

macOS or Linux:

```bash
echo $PATH
ls "$HOME/.pub-cache/bin"
```

Windows PowerShell:

```powershell
$env:Path
dir "$env:LOCALAPPDATA\Pub\Cache\bin"
```

### Fix

Add Dart global bin to `PATH` or run from source:

```bash
dart run bin/edge_veda_mcp.dart --help
```

## 2. MCP client cannot discover tools

### Symptoms

- The client starts but no Edge Veda tools appear.
- Only generic tools are available.
- The server exits immediately.

### Common causes

| Cause | Fix |
| --- | --- |
| Wrong `command` in client config | Use `edge-veda-mcp` or `dart` with correct `args`. |
| Wrong `cwd` for source install | Set `cwd` to the MCP package folder. |
| Server prints logs to stdout | Send logs to stderr or a log file. |
| Invalid JSON in client config | Validate the MCP client configuration. |
| Missing environment variables | Add required `env` values. |

### Example client config

```json
{
  "mcpServers": {
    "edge-veda": {
      "command": "edge-veda-mcp",
      "args": [
        "--workspace-root",
        "/absolute/path/to/edge-veda-app",
        "--config",
        "/absolute/path/to/edge-veda-app/edge-veda.mcp.json"
      ],
      "env": {
        "EDGE_VEDA_MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

## 3. Wrong workspace

### Symptoms

- Tool call returns `workspace_not_found`.
- Tool call returns `pubspec_not_found`.
- Generated files appear in the wrong folder.
- MCP says the project is not an Edge Veda project.

### Checks

Run:

```bash
pwd
ls
ls pubspec.yaml
```

Then run:

```bash
edge-veda-mcp doctor --workspace-root "$(pwd)"
```

### Fix

Use an absolute `workspaceRoot` and confirm that the folder contains the project files.

```json
{
  "workspaceRoot": "/Users/me/dev/edge_veda_app"
}
```

Avoid relative paths inside client configuration unless the client documents how `cwd` is resolved.

## 4. Tool arguments are invalid

### Symptoms

- `invalid_arguments`
- `missing_required_argument`
- `unknown_argument`
- tool call rejected before execution

### Fix

Discover the tool schema:

```bash
edge-veda-mcp describe-tool edge_veda.add_capability
```

Then call the tool with the required arguments.

```json
{
  "workspaceRoot": "/absolute/path/to/edge-veda-app",
  "capability": "rag",
  "targetPlatforms": ["ios", "macos"]
}
```

## 5. Writes are disabled

### Symptoms

- `writes_disabled`
- Tool reports dry-run only.
- Generated file list is empty.

### Cause

The server is running in read-only mode.

### Fix

Enable writes only for trusted sessions.

```json
{
  "allowWrites": true,
  "allowedWritePaths": [
    "lib",
    "test",
    "docs",
    "examples",
    "edge_veda.config.json"
  ]
}
```

Run write-capable tools only after reviewing the tool purpose.

## 6. Path is not allowed

### Symptoms

- `path_not_allowed`
- The tool refuses to write a generated file.
- The target path is outside `workspaceRoot`.

### Cause

The output path is not covered by `allowedWritePaths`.

### Fix

Use a safe path inside the project.

```json
{
  "allowedWritePaths": [
    "lib",
    "test",
    "docs",
    "examples",
    "data",
    "models/.gitkeep",
    "edge_veda.config.json"
  ]
}
```

Do not add broad paths such as `/`, `..`, or the whole home directory.

## 7. Tool call times out

### Symptoms

- MCP client shows timeout.
- Long-running commands stop before completion.
- Model validation or project indexing does not finish.

### Possible causes

- model folder contains very large files;
- `flutter pub get` is slow;
- platform tooling is waiting for user input;
- timeout is too low;
- antivirus or file indexing slows the scan.

### Fix

Increase timeout for troubleshooting:

```bash
export EDGE_VEDA_MCP_TIMEOUT_MS=120000
```

Or set it in the client config:

```json
{
  "env": {
    "EDGE_VEDA_MCP_TIMEOUT_MS": "120000",
    "EDGE_VEDA_MCP_LOG_LEVEL": "debug"
  }
}
```

Then retry a smaller tool call first:

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

## 8. Model validation fails

### Symptoms

- `model_not_found`
- `unsupported_format`
- `model_too_large`
- `tokenizer_missing`
- app builds but inference fails

### Checks

Confirm the file path:

```bash
ls -lh models
find models -maxdepth 3 -type f
```

Then run:

```bash
edge-veda-mcp validate-models \
  --workspace-root /absolute/path/to/edge-veda-app \
  --model-path models/text/model.gguf \
  --capability text-generation
```

### Fix

- keep `modelPath` relative to `workspaceRoot`;
- confirm model format for the selected capability;
- add required companion files;
- use a smaller model or lower quantization;
- update `edge_veda.config.json`;
- check platform limitations.

## 9. Generated docs are incomplete

### Symptoms

- generated page has placeholders;
- language version is missing;
- links point to files that do not exist;
- Ukrainian file contains too many English non-technical phrases.

### Fix

Run the docs tool with explicit inputs:

```json
{
  "tool": "edge_veda.generate_docs_stub",
  "arguments": {
    "workspaceRoot": "/absolute/path/to/edge-veda-app",
    "section": "troubleshooting",
    "capability": "mcp",
    "language": "both",
    "docsRoot": "docs"
  }
}
```

Then run link checks:

```bash
edge-veda-mcp check-docs-links --workspace-root /absolute/path/to/edge-veda-app
```

Review localized docs manually before publishing.

## 10. Platform permissions are missing

### Symptoms

- microphone does not work;
- camera does not work;
- file picker fails;
- iOS app crashes on permission request.

### Cause

The capability was added, but platform permission files were not updated or not reviewed.

### Fix

Review the platform-specific files:

```text
ios/Runner/Info.plist
macos/Runner/DebugProfile.entitlements
macos/Runner/Release.entitlements
android/app/src/main/AndroidManifest.xml
```

For speech and vision capabilities, confirm that permission messages are human-readable and match the feature.

## 11. Logs are too noisy or leak sensitive data

### Symptoms

- debug logs contain model paths, local file names, prompts, or private config values;
- client output is hard to read;
- logs break MCP protocol output.

### Fix

Use `info` logs for normal work:

```bash
export EDGE_VEDA_MCP_LOG_LEVEL=info
```

Use `debug` only during troubleshooting. Redact secrets before sharing diagnostics.

```json
{
  "tool": "edge_veda.collect_diagnostics",
  "arguments": {
    "workspaceRoot": "/absolute/path/to/edge-veda-app",
    "redactSecrets": true,
    "includeLogs": true
  }
}
```

## Error reference

| Error | Meaning | Recovery |
| --- | --- | --- |
| `server_start_failed` | MCP server failed before tool discovery. | Run the command manually and inspect stderr. |
| `tool_not_found` | Tool does not exist in this server version. | Update server or use an available tool. |
| `invalid_arguments` | Input schema validation failed. | Check required arguments and types. |
| `workspace_not_found` | Project path does not exist. | Use absolute `workspaceRoot`. |
| `pubspec_not_found` | The folder is not a Flutter or Dart project. | Point to the project root. |
| `writes_disabled` | Write tools are not allowed. | Enable `allowWrites` for trusted sessions. |
| `path_not_allowed` | Target path is outside allowed write paths. | Use safe paths inside `workspaceRoot`. |
| `command_failed` | A Dart, Flutter, or platform command failed. | Read command output and run the command manually. |
| `model_not_found` | Config points to a missing model. | Fix `modelPath` or download the model. |
| `unsupported_format` | Model format does not match capability. | Use a supported model. |
| `permission_missing` | Platform permission is missing. | Update platform permission files. |

## Support bundle checklist

When reporting an MCP issue, include:

- MCP server version;
- OS and shell;
- Dart and Flutter versions;
- MCP client name and version;
- sanitized MCP client config;
- `edge-veda.mcp.json` with secrets removed;
- command that failed;
- exact error message;
- whether the issue happens from CLI or only from the MCP client;
- `edge_veda.collect_diagnostics` output with `redactSecrets: true`.

Do not include:

- private prompts;
- user documents;
- production secrets;
- signing certificates;
- private model download URLs;
- large model files.

## Related documents

- [MCP overview](./overview.md)
- [MCP installation](./installation.md)
- [Available tools](./available-tools.md)
- [Add capability](./add-capability.md)
- [Download model](./download-model.md)
