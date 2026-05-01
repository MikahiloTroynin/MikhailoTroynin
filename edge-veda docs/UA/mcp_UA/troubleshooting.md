---
title: "Troubleshooting MCP"
description: "Діагностика і виправлення типових проблем Edge Veda MCP server, client, workspace, model і tool-call."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Troubleshooting MCP

Використовуйте цю сторінку, коли Edge Veda MCP server не стартує, MCP client не бачить tools, tool call падає або generated project changes неповні.

Почніть із мінімальної локальної перевірки, перш ніж debug-ити client.

```bash
edge-veda-mcp --version
edge-veda-mcp list-tools
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

## Швидка таблиця діагностики

| Symptom | Найімовірніша причина | Перша перевірка |
| --- | --- | --- |
| MCP client не показує Edge Veda tools | Server command падає під час startup. | Запустіть `edge-veda-mcp list-tools` вручну. |
| `command not found` | Executable не додано в `PATH`. | Перевірте Dart global bin або source install path. |
| `workspace_not_found` | Неправильний `workspaceRoot`. | Використайте absolute path. |
| `invalid_arguments` | Tool input не відповідає schema. | Порівняйте з `list-tools` output. |
| `writes_disabled` | Write tools заблоковані. | Перевірте `allowWrites`. |
| `path_not_allowed` | Tool спробував писати поза allowed paths. | Перевірте `allowedWritePaths`. |
| Tool call зависає | Long-running scan або protocol output issue. | Перевірте logs і timeout settings. |
| Generated config неповний | Відсутні capability або model inputs. | Передайте `capability`, `modelPath` і `targetPlatforms`. |

## 1. Server не стартує

### Symptoms

- MCP client не показує `edge_veda.*` tools.
- Client logs показують process exit під час startup.
- CLI повертає `command not found`.

### Checks

Запустіть:

```bash
which edge-veda-mcp
edge-veda-mcp --version
edge-veda-mcp --help
```

У Windows PowerShell:

```powershell
Get-Command edge-veda-mcp
edge-veda-mcp --version
```

Якщо встановлено через Dart, перевірте, що global bin folder доступний.

macOS або Linux:

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

Додайте Dart global bin у `PATH` або запускайте from source:

```bash
dart run bin/edge_veda_mcp.dart --help
```

## 2. MCP client не бачить tools

### Symptoms

- Client стартує, але Edge Veda tools не з'являються.
- Доступні лише generic tools.
- Server завершується одразу.

### Common causes

| Cause | Fix |
| --- | --- |
| Неправильний `command` у client config | Використайте `edge-veda-mcp` або `dart` з правильними `args`. |
| Неправильний `cwd` для source install | Встановіть `cwd` на MCP package folder. |
| Server друкує logs у stdout | Надсилайте logs у stderr або log file. |
| Невалідний JSON у client config | Перевірте MCP client configuration. |
| Відсутні environment variables | Додайте потрібні `env` values. |

### Приклад client config

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

## 3. Неправильний workspace

### Symptoms

- Tool call повертає `workspace_not_found`.
- Tool call повертає `pubspec_not_found`.
- Generated files з'являються не в тій folder.
- MCP каже, що project не є Edge Veda project.

### Checks

Запустіть:

```bash
pwd
ls
ls pubspec.yaml
```

Потім запустіть:

```bash
edge-veda-mcp doctor --workspace-root "$(pwd)"
```

### Fix

Використовуйте absolute `workspaceRoot` і переконайтесь, що folder містить project files.

```json
{
  "workspaceRoot": "/Users/me/dev/edge_veda_app"
}
```

Уникайте relative paths у client configuration, якщо client не пояснює, як визначається `cwd`.

## 4. Tool arguments невалідні

### Symptoms

- `invalid_arguments`
- `missing_required_argument`
- `unknown_argument`
- tool call відхилено до execution

### Fix

Перегляньте tool schema:

```bash
edge-veda-mcp describe-tool edge_veda.add_capability
```

Потім викличте tool з required arguments.

```json
{
  "workspaceRoot": "/absolute/path/to/edge-veda-app",
  "capability": "rag",
  "targetPlatforms": ["ios", "macos"]
}
```

## 5. Writes вимкнені

### Symptoms

- `writes_disabled`
- Tool повідомляє only dry-run.
- Generated file list порожній.

### Cause

Server працює в read-only mode.

### Fix

Вмикайте writes лише для trusted sessions.

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

Запускайте write-capable tools лише після review tool purpose.

## 6. Path не дозволений

### Symptoms

- `path_not_allowed`
- Tool відмовляється писати generated file.
- Target path знаходиться поза `workspaceRoot`.

### Cause

Output path не входить до `allowedWritePaths`.

### Fix

Використайте safe path всередині project.

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

Не додавайте надто широкі paths: `/`, `..` або весь home directory.

## 7. Tool call завершується за timeout

### Symptoms

- MCP client показує timeout.
- Long-running commands зупиняються до завершення.
- Model validation або project indexing не завершується.

### Possible causes

- model folder містить very large files;
- `flutter pub get` працює повільно;
- platform tooling чекає user input;
- timeout занадто низький;
- antivirus або file indexing сповільнює scan.

### Fix

Збільшіть timeout для troubleshooting:

```bash
export EDGE_VEDA_MCP_TIMEOUT_MS=120000
```

Або встановіть у client config:

```json
{
  "env": {
    "EDGE_VEDA_MCP_TIMEOUT_MS": "120000",
    "EDGE_VEDA_MCP_LOG_LEVEL": "debug"
  }
}
```

Потім спочатку повторіть менший tool call:

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/edge-veda-app
```

## 8. Model validation падає

### Symptoms

- `model_not_found`
- `unsupported_format`
- `model_too_large`
- `tokenizer_missing`
- app build-иться, але inference падає

### Checks

Перевірте file path:

```bash
ls -lh models
find models -maxdepth 3 -type f
```

Потім запустіть:

```bash
edge-veda-mcp validate-models \
  --workspace-root /absolute/path/to/edge-veda-app \
  --model-path models/text/model.gguf \
  --capability text-generation
```

### Fix

- тримайте `modelPath` відносним до `workspaceRoot`;
- підтвердьте model format для selected capability;
- додайте required companion files;
- використайте smaller model або lower quantization;
- оновіть `edge_veda.config.json`;
- перевірте platform limitations.

## 9. Generated docs неповні

### Symptoms

- generated page містить placeholders;
- language version відсутня;
- links ведуть на files, яких немає;
- український file містить забагато англійських non-technical phrases.

### Fix

Запустіть docs tool з explicit inputs:

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

Потім перевірте links:

```bash
edge-veda-mcp check-docs-links --workspace-root /absolute/path/to/edge-veda-app
```

Перед publication перегляньте localized docs вручну.

## 10. Platform permissions відсутні

### Symptoms

- microphone не працює;
- camera не працює;
- file picker падає;
- iOS app падає під час permission request.

### Cause

Capability додано, але platform permission files не оновлено або не переглянуто.

### Fix

Перегляньте platform-specific files:

```text
ios/Runner/Info.plist
macos/Runner/DebugProfile.entitlements
macos/Runner/Release.entitlements
android/app/src/main/AndroidManifest.xml
```

Для speech і vision capabilities переконайтесь, що permission messages зрозумілі й відповідають feature.

## 11. Logs занадто шумні або містять sensitive data

### Symptoms

- debug logs містять model paths, local file names, prompts або private config values;
- client output складно читати;
- logs ламають MCP protocol output.

### Fix

Для звичайної роботи використовуйте `info` logs:

```bash
export EDGE_VEDA_MCP_LOG_LEVEL=info
```

Використовуйте `debug` лише під час troubleshooting. Перед передаванням diagnostics приховуйте secrets.

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

| Error | Значення | Recovery |
| --- | --- | --- |
| `server_start_failed` | MCP server впав до tool discovery. | Запустіть command вручну і перевірте stderr. |
| `tool_not_found` | Tool не існує в цій server version. | Оновіть server або використайте available tool. |
| `invalid_arguments` | Input schema validation failed. | Перевірте required arguments і types. |
| `workspace_not_found` | Project path не існує. | Використайте absolute `workspaceRoot`. |
| `pubspec_not_found` | Folder не є Flutter або Dart project. | Вкажіть project root. |
| `writes_disabled` | Write tools не дозволені. | Увімкніть `allowWrites` для trusted sessions. |
| `path_not_allowed` | Target path поза allowed write paths. | Використайте safe paths усередині `workspaceRoot`. |
| `command_failed` | Dart, Flutter або platform command впала. | Прочитайте command output і запустіть command вручну. |
| `model_not_found` | Config вказує на missing model. | Виправте `modelPath` або завантажте model. |
| `unsupported_format` | Model format не відповідає capability. | Використайте supported model. |
| `permission_missing` | Platform permission відсутній. | Оновіть platform permission files. |

## Support bundle checklist

Коли повідомляєте про MCP issue, додайте:

- MCP server version;
- OS і shell;
- Dart і Flutter versions;
- MCP client name і version;
- sanitized MCP client config;
- `edge-veda.mcp.json` без secrets;
- command, який упав;
- exact error message;
- чи відтворюється issue з CLI або лише з MCP client;
- `edge_veda.collect_diagnostics` output з `redactSecrets: true`.

Не додавайте:

- private prompts;
- user documents;
- production secrets;
- signing certificates;
- private model download URLs;
- large model files.

## Пов'язані документи

- [MCP overview](./overview.md)
- [MCP installation](./installation.md)
- [Available tools](./available-tools.md)
- [Add capability](./add-capability.md)
- [Download model](./download-model.md)
