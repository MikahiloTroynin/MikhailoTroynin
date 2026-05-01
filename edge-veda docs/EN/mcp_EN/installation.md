---
title: "MCP installation"
description: "Install and configure the Edge Veda MCP server for local troubleshooting and project automation."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# MCP installation

This guide explains how to install and configure the Edge Veda MCP server.

Use it when an MCP-compatible client cannot discover Edge Veda tools, tool calls fail during startup, or the MCP server cannot access the expected workspace.

## Prerequisites

Before installing the MCP server, confirm that your environment has the required tools.

| Requirement | Recommended value | Why it is needed |
| --- | --- | --- |
| Dart SDK | Latest stable | Runs the MCP server if it is distributed as a Dart CLI. |
| Flutter SDK | Latest stable | Required for Flutter project creation and validation. |
| Git | Latest stable | Required for source installation and project scaffolding. |
| Xcode | Required for iOS and macOS | Required for Apple platform builds. |
| Android Studio | Required for Android | Required when Android support is enabled. |
| Local model files | Project-specific | Required for validation and runtime smoke checks. |
| MCP-compatible client | Client-specific | Required to call MCP tools. |

Check the basic versions:

```bash
dart --version
flutter --version
git --version
```

For iOS or macOS development, also run:

```bash
xcodebuild -version
```

## Installation options

The MCP server can be installed in two common ways:

1. from a published package;
2. from the Edge Veda repository source.

Use the source installation path while the MCP package is still in draft or internal preview.

## Option 1: install from package

Use this option if `edge_veda_mcp` is published for your environment.

```bash
dart pub global activate edge_veda_mcp
```

Confirm that the executable is available:

```bash
edge-veda-mcp --version
edge-veda-mcp --help
```

If the shell cannot find the command, add the Dart global package cache to `PATH`.

macOS or Linux:

```bash
export PATH="$PATH:$HOME/.pub-cache/bin"
```

Windows PowerShell:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Pub\Cache\bin"
```

## Option 2: install from source

Use this option when the MCP server lives inside the repository.

```bash
git clone https://github.com/<owner>/edge-veda.git
cd edge-veda
dart pub get
```

Run the server directly from the package folder.

```bash
dart run edge_veda_mcp --help
```

If the MCP server is stored in a subpackage, move into that package first:

```bash
cd tools/edge_veda_mcp
dart pub get
dart run bin/edge_veda_mcp.dart --help
```

> Replace `tools/edge_veda_mcp` with the actual package path used in the repository.

## Create a workspace config

Create `edge-veda.mcp.json` in the root of the project you want to manage.

```json
{
  "workspaceRoot": ".",
  "projectType": "flutter",
  "docsRoot": "docs",
  "modelsRoot": "models",
  "allowWrites": true,
  "allowedWritePaths": [
    "lib",
    "test",
    "docs",
    "examples",
    "edge_veda.config.json"
  ],
  "defaultPlatforms": ["ios", "macos"]
}
```

Use `allowWrites: false` when you only want diagnostics.

```json
{
  "workspaceRoot": ".",
  "projectType": "flutter",
  "allowWrites": false
}
```

## Register the server in an MCP client

Add the Edge Veda MCP server to the MCP client configuration.

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

If you run from source, use `dart` as the command.

```json
{
  "mcpServers": {
    "edge-veda": {
      "command": "dart",
      "args": [
        "run",
        "bin/edge_veda_mcp.dart",
        "--workspace-root",
        "/absolute/path/to/edge-veda-app"
      ],
      "cwd": "/absolute/path/to/edge-veda/tools/edge_veda_mcp"
    }
  }
}
```

## Validate the installation

Run a local diagnostics command before connecting from the client.

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

Expected result:

```text
✓ Dart SDK found
✓ Flutter SDK found
✓ workspaceRoot exists
✓ pubspec.yaml found
✓ docsRoot is writable
✓ modelsRoot exists or can be created
```

Then check tool discovery:

```bash
edge-veda-mcp list-tools
```

The output should include tools such as:

```text
edge_veda.create_project
edge_veda.inspect_project
edge_veda.validate_models
edge_veda.generate_docs_stub
edge_veda.doctor
```

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `EDGE_VEDA_MCP_LOG_LEVEL` | `info` | Controls server logs. Use `debug` only during troubleshooting. |
| `EDGE_VEDA_MCP_CONFIG` | — | Optional path to `edge-veda.mcp.json`. |
| `EDGE_VEDA_MCP_WORKSPACE_ROOT` | Current directory | Default workspace root if not passed in `args`. |
| `EDGE_VEDA_MCP_ALLOW_WRITES` | `false` | Enables write-capable tools when set to `true`. |
| `EDGE_VEDA_MCP_TIMEOUT_MS` | `30000` | Maximum time for one tool call. |

## Troubleshooting startup issues

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `command not found: edge-veda-mcp` | Dart global bin directory is not in `PATH`. | Add `$HOME/.pub-cache/bin` to `PATH` or run from source with `dart run`. |
| MCP client shows no tools | Client configuration is invalid or the server exits during startup. | Run `edge-veda-mcp list-tools` manually and check client logs. |
| `workspace_not_found` | `workspaceRoot` points to the wrong directory. | Use an absolute path and confirm `pubspec.yaml` exists there. |
| `permission_denied` | The MCP server cannot write to the target folder. | Fix file permissions or set `allowWrites` to `false` for diagnostics only. |
| Tool call times out | Model scan, project indexing, or Flutter command is slow. | Increase `EDGE_VEDA_MCP_TIMEOUT_MS` and retry with `EDGE_VEDA_MCP_LOG_LEVEL=debug`. |
| Client hangs after startup | The server prints non-protocol output to stdout. | Send logs to stderr or a log file; keep stdout reserved for MCP messages. |

## Safe uninstall

If installed globally:

```bash
dart pub global deactivate edge_veda_mcp
```

Remove the MCP client configuration entry:

```json
{
  "mcpServers": {
    "edge-veda": {}
  }
}
```

Then delete local config only if it is no longer needed:

```bash
rm edge-veda.mcp.json
```

## Next steps

- Review [Available tools](./available-tools.md).
- Create a starter workspace with [Create project](./create-project.md).
- Run `edge_veda.doctor` after changing Flutter, Dart, model, or platform configuration.
