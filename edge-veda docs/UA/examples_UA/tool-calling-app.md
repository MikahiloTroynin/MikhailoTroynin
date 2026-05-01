---
title: "Tool-calling app"
description: "Створення local agent-style Flutter app з Edge Veda tools і validated actions."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Tool-calling app

Цей приклад показує, як створити local app, де model може вибирати structured tools. Model не виконує arbitrary code. Вона вибирає tools, які визначає app, а app валідовує кожен call перед зміною state.

Використовуйте цей приклад, коли потрібно:

- перетворювати natural language на app actions;
- відкрити model безпечні local tools;
- валідовувати tool arguments через schemas;
- створити agent-style experience без unrestricted control для model.

## Що створюється

Ви створите невеликий local assistant, який може:

- створити note;
- search notes;
- повернути current time.

Pattern можна адаптувати для tasks, reminders, settings, smart-home control або business workflows.

## Tool-calling flow

```text
User message
  ↓
ChatSession
  ↓
Model selects a ToolDefinition
  ↓
App receives ToolCall
  ↓
App validates arguments
  ↓
App executes local function
  ↓
ToolResult returns to session
  ↓
Assistant responds to user
```

## Runtime setup

```dart
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: qwenToolModelPath,
  contextLength: 4096,
  useGpu: true,
));
```

Використовуйте model, яка надійно виконує tool schemas. Qwen-style tool models зазвичай добрий старт.

## Local data model

```dart
class Note {
  const Note({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
}

final notes = <Note>[];
```

## Define tools

```dart
final tools = ToolRegistry([
  ToolDefinition(
    name: 'create_note',
    description: 'Create a local note with a title and body.',
    parameters: {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
          'description': 'Short note title.',
        },
        'body': {
          'type': 'string',
          'description': 'Full note body.',
        },
      },
      'required': ['title', 'body'],
    },
  ),
  ToolDefinition(
    name: 'search_notes',
    description: 'Search local notes by a query string.',
    parameters: {
      'type': 'object',
      'properties': {
        'query': {
          'type': 'string',
          'description': 'Text to search for in note title or body.',
        },
      },
      'required': ['query'],
    },
  ),
  ToolDefinition(
    name: 'get_time',
    description: 'Get the current local time.',
    parameters: {
      'type': 'object',
      'properties': {},
      'required': [],
    },
  ),
]);
```

## Create a session

```dart
final session = ChatSession(
  edgeVeda: edgeVeda,
  tools: tools,
  templateFormat: ChatTemplateFormat.qwen3,
);
```

## Handle tool calls

```dart
Future<ToolResult> handleToolCall(ToolCall call) async {
  switch (call.name) {
    case 'create_note':
      final title = call.arguments['title'] as String?;
      final body = call.arguments['body'] as String?;

      if (title == null || title.trim().isEmpty) {
        return ToolResult.failure(
          toolCallId: call.id,
          error: 'title is required',
        );
      }

      if (body == null || body.trim().isEmpty) {
        return ToolResult.failure(
          toolCallId: call.id,
          error: 'body is required',
        );
      }

      final note = Note(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        title: title.trim(),
        body: body.trim(),
        createdAt: DateTime.now(),
      );

      notes.add(note);

      return ToolResult.success(
        toolCallId: call.id,
        data: {
          'id': note.id,
          'title': note.title,
          'createdAt': note.createdAt.toIso8601String(),
        },
      );

    case 'search_notes':
      final query = (call.arguments['query'] as String?)?.toLowerCase();

      if (query == null || query.trim().isEmpty) {
        return ToolResult.failure(
          toolCallId: call.id,
          error: 'query is required',
        );
      }

      final matches = notes.where((note) {
        return note.title.toLowerCase().contains(query) ||
            note.body.toLowerCase().contains(query);
      }).take(5).toList();

      return ToolResult.success(
        toolCallId: call.id,
        data: {
          'matches': matches.map((note) => {
            'id': note.id,
            'title': note.title,
            'preview': note.body,
          }).toList(),
        },
      );

    case 'get_time':
      return ToolResult.success(
        toolCallId: call.id,
        data: {
          'time': DateTime.now().toIso8601String(),
        },
      );

    default:
      return ToolResult.failure(
        toolCallId: call.id,
        error: 'Unknown tool: ${call.name}',
      );
  }
}
```

## Send a message

```dart
final response = await session.sendWithTools(
  'Create a note called "Launch ideas" with three bullets about the demo.',
  onToolCall: handleToolCall,
);

print(response.text);
```

## Prompt rules

Використовуйте system prompt, який обмежує tool use.

```text
You are a local app assistant.
Use tools only when the user asks to create, search, or inspect local app data.
Do not invent tool results.
If a tool returns an error, explain the error and ask for corrected input.
Do not perform destructive actions without explicit confirmation.
```

## Validation rules

| Rule | Навіщо |
| --- | --- |
| Validate every argument | Model може повернути invalid або missing fields. |
| Use allowlisted tool names | Запобігає arbitrary function execution. |
| Keep destructive tools separate | Delete, payment і security actions потребують confirmation. |
| Return structured errors | Model може recover-итися з clear tool errors. |
| Log tool results safely | Audit actions без private prompts by default. |

## UI pattern

Рекомендовані UI elements:

- видимий chip `tool used`;
- action log для local state changes;
- confirmation modal для destructive actions;
- retry action, коли tool fails;
- developer debug view за feature flag.

Подія, яку бачить користувач:

```text
Tool used: create_note
Created: Launch ideas
```

## Anti-patterns

Уникайте:

- generic `run_code` tool;
- raw SQL, який generated by model;
- вільного вибору file paths model;
- використання tool output як доказу без adapter confirmation;
- приховування tool calls від user, коли вони змінюють local state.

## Troubleshooting

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Model answers without using tools | Prompt не вимагає tool use | Додати explicit tool-use instruction. |
| Tool arguments malformed | Model недостатньо tool-capable | Використати tool-capable model і strict schemas. |
| App виконує wrong action | Tool handler занадто довіряє model | Додати validation і confirmation. |
| Multi-step flow loops | Tool result ambiguous | Повернути concise structured data. |
| User не бачить actions | UI ховає tool calls | Додати visible action log. |

## Production checklist

Перед release:

- напишіть tests для кожного tool handler;
- validate-іть кожен argument;
- розділіть read, write і destructive tools;
- додайте confirmation для irreversible actions;
- не log-іть private prompts;
- показуйте tool execution у UI;
- задокументуйте tool schemas для maintainers.
