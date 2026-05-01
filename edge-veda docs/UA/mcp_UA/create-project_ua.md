---
title: "Створення project через MCP"
description: "Використання Edge Veda MCP server для scaffold starter project з local AI capabilities."
status: "draft"
section: "troubleshooting"
category: "mcp"
last_reviewed: "2026-05-01"
---

# Створення project через MCP

Використовуйте `edge_veda.create_project`, щоб створити starter Edge Veda project через MCP-compatible client.

Цей workflow корисний, коли потрібно, щоб AI client згенерував узгоджену project structure, створив starter docs і підготував configuration files для local model-driven development.

## Перед початком

Переконайтесь, що:

- MCP server встановлено;
- MCP client бачить Edge Veda tools;
- `allowWrites` увімкнено для target workspace;
- Flutter і Dart встановлено;
- target output directory доступна для запису;
- ви знаєте, які capabilities потрібні project.

Запустіть:

```bash
edge-veda-mcp doctor --workspace-root /absolute/path/to/parent-folder
edge-veda-mcp list-tools
```

## Оберіть template

| Template | Use case | Included capabilities |
| --- | --- | --- |
| `flutter-chat` | Базовий local chat app. | Text generation, streaming chat, model setup. |
| `rag-demo` | Document search або local knowledge assistant. | Embeddings, vector index, RAG pipeline. |
| `voice-assistant` | Offline voice assistant prototype. | STT, TTS, voice pipeline. |
| `vision-demo` | Image description або visual Q&A. | Vision inference, image input. |
| `image-generation-demo` | Local image generation prototype. | Image generation runtime і prompts. |
| `minimal-dart` | Non-Flutter Dart integration. | Core SDK setup і text generation. |

Почніть з `flutter-chat`, якщо потрібен лише working baseline.

## Базовий tool call

Попросіть MCP client:

```text
Create a new Edge Veda project named edge_veda_chat in /Users/me/dev.
Use the flutter-chat template, target iOS and macOS, and include text generation plus streaming chat.
```

Client має викликати:

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

## Очікуваний результат

Успішна response має містити:

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

Типовий starter project має виглядати так:

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

## Налаштуйте local models

Generated project не має commit-ити model files за замовчуванням. Додавайте models локально і не зберігайте їх у Git, якщо repository policy прямо цього не дозволяє.

Приклад `edge_veda.config.json`:

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

Потім виконайте validation:

```bash
edge-veda-mcp validate-models \
  --workspace-root /Users/me/dev/edge_veda_chat \
  --model-path models/text-model.gguf \
  --capability text
```

## Додайте docs під час project creation

Додайте `generateDocs`, якщо tool це підтримує.

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

Очікувані docs:

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

## Перегляньте generated files

Перед запуском app перегляньте:

- `pubspec.yaml`;
- `edge_veda.config.json`;
- generated Dart files;
- platform folders;
- generated docs;
- `.gitignore`;
- model paths;
- privacy і telemetry defaults.

Не комітьте:

- large local model files;
- private prompts або user data;
- device-specific build artifacts;
- signing certificates;
- production API keys.

## Запустіть project

З generated project:

```bash
cd /Users/me/dev/edge_veda_chat
flutter pub get
flutter run -d macos
```

Для iOS:

```bash
open ios/Runner.xcworkspace
```

Потім налаштуйте signing в Xcode і запустіть на physical device, якщо обрана model потребує Apple Neural Engine, Metal, microphone або camera access.

## Додайте ще одну capability

Після створення project зробіть follow-up MCP request:

```text
Add RAG support to this Edge Veda project. Create a docs page, update edge_veda.config.json, and add a placeholder vector index folder.
```

Очікуваний tool call:

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
| `writes_disabled` | `allowWrites` вимкнено в MCP config. | Встановіть `allowWrites` у `true` для цієї session або запустіть tool у dry-run mode. |
| `target_exists` | Project folder вже існує. | Використайте інший `projectName` або встановіть `allowOverwrite` лише після перегляду folder. |
| `flutter_create_failed` | Flutter SDK відсутній або неправильно налаштований. | Запустіть `flutter doctor` і виправте reported issues. |
| `invalid_package_name` | `projectName` не є valid Dart package name. | Використовуйте lowercase letters, numbers і underscores. |
| `unsupported_platform` | Template не підтримує selected platform. | Приберіть platform або оберіть інший template. |
| Model file відсутній після creation | Templates не копіюють large model files. | Додайте model вручну і оновіть `edge_veda.config.json`. |
| App build-иться, але inference падає | Model path, format або runtime config неправильні. | Запустіть `edge_veda.validate_models` і перегляньте model compatibility. |

## Definition of done

Generated project готовий до manual development, коли:

- `flutter pub get` завершується успішно;
- `edge_veda.doctor` не повертає blocking errors;
- model paths налаштовані або свідомо залишені як placeholders;
- generated docs пояснюють setup і first run;
- generated code переглянуто;
- `.gitignore` виключає local model files і build artifacts;
- project build-иться хоча б на одній target platform.

## Пов'язані документи

- [Overview](./overview.md)
- [Installation](./installation.md)
- [Available tools](./available-tools.md)
