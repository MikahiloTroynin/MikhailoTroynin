---
title: "Встановлення MCP"
description: "Встановлення й налаштування Edge Veda MCP server для локального troubleshooting і project automation."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Встановлення MCP

Цей гайд пояснює, як встановити й налаштувати Edge Veda MCP server.

Використовуйте його, коли MCP-compatible client не бачить Edge Veda tools, tool calls падають під час startup або MCP server не може отримати доступ до потрібного workspace.

## Prerequisites

Перед встановленням MCP server перевірте, що в середовищі є потрібні tools.

| Requirement | Рекомендоване значення | Навіщо потрібно |
| --- | --- | --- |
| Dart SDK | Latest stable | Запускає MCP server, якщо він поширюється як Dart CLI. |
| Flutter SDK | Latest stable | Потрібен для Flutter project creation і validation. |
| Git | Latest stable | Потрібен для source installation і project scaffolding. |
| Xcode | Required for iOS and macOS | Потрібен для Apple platform builds. |
| Android Studio | Required for Android | Потрібен, якщо ввімкнено Android support. |
| Local model files | Project-specific | Потрібні для validation і runtime smoke checks. |
| MCP-compatible client | Client-specific | Потрібен для виклику MCP tools. |

Перевірте базові versions:

```bash
dart --version
flutter --version
git --version
```

Для iOS або macOS development також запустіть:

```bash
xcodebuild -version
```

## Варіанти installation

MCP server можна встановити двома типовими способами:

1. з published package;
2. з Edge Veda repository source.

Використовуйте source installation, якщо MCP package ще має status `draft` або `internal preview`.

## Варіант 1: install from package

Використовуйте цей варіант, якщо `edge_veda_mcp` опублікований для вашого середовища.

```bash
dart pub global activate edge_veda_mcp
```

Переконайтесь, що executable доступний:

```bash
edge-veda-mcp --version
edge-veda-mcp --help
```

Якщо shell не знаходить command, додайте Dart global package cache у `PATH`.

macOS або Linux:

```bash
export PATH="$PATH:$HOME/.pub-cache/bin"
```

Windows PowerShell:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Pub\Cache\bin"
```

## Варіант 2: install from source

Використовуйте цей варіант, якщо MCP server знаходиться всередині repository.

```bash
git clone https://github.com/<owner>/edge-veda.git
cd edge-veda
dart pub get
```

Запустіть server напряму з package folder.

```bash
dart run edge_veda_mcp --help
```

Якщо MCP server зберігається у subpackage, спочатку перейдіть у цей package:

```bash
cd tools/edge_veda_mcp
dart pub get
dart run bin/edge_veda_mcp.dart --help
```

> Замініть `tools/edge_veda_mcp` на фактичний package path у repository.

## Створіть workspace config

Створіть `edge-veda.mcp.json` у root project, яким потрібно керувати.

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

Використовуйте `allowWrites: false`, коли потрібна лише diagnostics.

```json
{
  "workspaceRoot": ".",
  "projectType": "flutter",
  "allowWrites": false
}
```

## Зареєструйте server в MCP client

Додайте Edge Veda MCP server у MCP client configuration.

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

Якщо запускаєте from source, використовуйте `dart` як command.

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

## Перевірте installation

Запустіть local diagnostics command перед підключенням через client.

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

Очікуваний результат:

```text
✓ Dart SDK found
✓ Flutter SDK found
✓ workspaceRoot exists
✓ pubspec.yaml found
✓ docsRoot is writable
✓ modelsRoot exists or can be created
```

Потім перевірте tool discovery:

```bash
edge-veda-mcp list-tools
```

У output мають бути tools на кшталт:

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
| `EDGE_VEDA_MCP_LOG_LEVEL` | `info` | Керує server logs. Використовуйте `debug` лише під час troubleshooting. |
| `EDGE_VEDA_MCP_CONFIG` | — | Optional path до `edge-veda.mcp.json`. |
| `EDGE_VEDA_MCP_WORKSPACE_ROOT` | Current directory | Default workspace root, якщо не передано в `args`. |
| `EDGE_VEDA_MCP_ALLOW_WRITES` | `false` | Вмикає write-capable tools, якщо значення `true`. |
| `EDGE_VEDA_MCP_TIMEOUT_MS` | `30000` | Maximum time для одного tool call. |

## Troubleshooting startup issues

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `command not found: edge-veda-mcp` | Dart global bin directory не додано в `PATH`. | Додайте `$HOME/.pub-cache/bin` у `PATH` або запускайте from source через `dart run`. |
| MCP client не показує tools | Client configuration неправильна або server завершується під час startup. | Запустіть `edge-veda-mcp list-tools` вручну і перевірте client logs. |
| `workspace_not_found` | `workspaceRoot` вказує на неправильну директорію. | Використайте absolute path і перевірте, що там є `pubspec.yaml`. |
| `permission_denied` | MCP server не може писати в target folder. | Виправте file permissions або встановіть `allowWrites` у `false` для diagnostics. |
| Tool call times out | Model scan, project indexing або Flutter command працює повільно. | Збільшіть `EDGE_VEDA_MCP_TIMEOUT_MS` і повторіть з `EDGE_VEDA_MCP_LOG_LEVEL=debug`. |
| Client hangs after startup | Server друкує non-protocol output у stdout. | Надсилайте logs у stderr або log file; stdout залиште для MCP messages. |

## Safe uninstall

Якщо встановлено globally:

```bash
dart pub global deactivate edge_veda_mcp
```

Видаліть MCP client configuration entry:

```json
{
  "mcpServers": {
    "edge-veda": {}
  }
}
```

Потім видаліть local config лише якщо він більше не потрібен:

```bash
rm edge-veda.mcp.json
```

## Наступні кроки

- Перегляньте [Available tools](./available-tools.md).
- Створіть starter workspace через [Create project](./create-project.md).
- Запускайте `edge_veda.doctor` після зміни Flutter, Dart, model або platform configuration.
