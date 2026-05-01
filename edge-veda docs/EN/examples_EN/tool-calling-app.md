---
title: "Tool-calling app"
description: "Build a local agent-style Flutter app with Edge Veda tools and validated actions."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Tool-calling app

This example shows how to build a local app where the model can choose structured tools. The model does not execute arbitrary code. It selects from tools that your app defines, and your app validates every call before changing state.

Use this example when you want to:

- map natural language to app actions;
- expose safe local tools to a model;
- validate tool arguments through schemas;
- build an agent-style experience without giving the model unrestricted control.

## What you build

You will build a small local assistant that can:

- create a note;
- search notes;
- return the current time.

The pattern can later be adapted to tasks, reminders, settings, smart-home control, or business workflows.

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

Use a model that follows tool schemas reliably. Qwen-style tool models are usually a good starting point.

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

Use a system prompt that limits tool use.

```text
You are a local app assistant.
Use tools only when the user asks to create, search, or inspect local app data.
Do not invent tool results.
If a tool returns an error, explain the error and ask for corrected input.
Do not perform destructive actions without explicit confirmation.
```

## Validation rules

| Rule | Why it matters |
| --- | --- |
| Validate every argument | The model may output invalid or missing fields. |
| Use allowlisted tool names | Prevents arbitrary function execution. |
| Keep destructive tools separate | Delete, payment, and security actions need confirmation. |
| Return structured errors | The model can recover from clear tool errors. |
| Log tool results safely | Audit actions without storing private prompts by default. |

## UI pattern

Recommended UI elements:

- visible "tool used" chip;
- action log for local state changes;
- confirmation modal for destructive actions;
- retry action when a tool fails;
- developer debug view hidden behind a flag.

Example user-visible event:

```text
Tool used: create_note
Created: Launch ideas
```

## Anti-patterns

Avoid:

- exposing a generic `run_code` tool;
- passing raw SQL generated by the model;
- letting the model choose file paths freely;
- using tool output as proof without adapter confirmation;
- hiding tool calls from the user when they change local state.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Model answers without using tools | Prompt does not require tool use | Add explicit tool-use instruction. |
| Tool arguments are malformed | Model is not tool-capable enough | Use a tool-capable model and stricter schemas. |
| App performs wrong action | Tool handler trusts the model too much | Add validation and confirmation. |
| Multi-step flow loops | Tool result is ambiguous | Return concise structured data. |
| User cannot inspect actions | UI hides tool calls | Add visible action log. |

## Production checklist

Before shipping:

- write tests for each tool handler;
- validate every argument;
- separate read, write, and destructive tools;
- add confirmation for irreversible actions;
- avoid logging private prompts;
- show tool execution in the UI;
- document tool schemas for maintainers.
