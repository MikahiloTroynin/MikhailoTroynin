---
title: "Function calling"
description: "Let an on-device chat session call local tools with Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Function calling

Function calling lets the model request structured tool execution during a conversation. The tool itself runs in your app code. This keeps private data local while allowing the model to use fresh or app-specific information such as weather, contacts, calendar events, inventory, device state, or local documents.

Use function calling when the answer depends on something the model does not know from its weights or current prompt.

## What you will build

This guide shows how to:

- define a `ToolDefinition`;
- pass tools to `sendWithTools()`;
- execute tool calls in `toolHandler`;
- return a `ToolResult`;
- design safe local tools.

## Basic example

```dart
import 'package:edge_veda/edge_veda.dart';

final tools = [
  ToolDefinition(
    name: 'get_weather',
    description: 'Get current weather for a city',
    parameters: {
      'type': 'object',
      'properties': {
        'city': {'type': 'string', 'description': 'City name'},
      },
      'required': ['city'],
    },
  ),
];

final response = await session.sendWithTools(
  'What is the weather in Tokyo?',
  tools: tools,
  toolHandler: (call) async {
    return ToolResult.success(call.id, {
      'temp': '22°C',
      'condition': 'Sunny',
    });
  },
);

print(response.text);
```

The model decides when to call `get_weather`. Your app receives the tool call, executes trusted local code, and returns the result.

## Tool design

A good tool is narrow, predictable, and easy to validate.

Good tool:

```dart
ToolDefinition(
  name: 'get_order_status',
  description: 'Get the current status of one order by order ID',
  parameters: {
    'type': 'object',
    'properties': {
      'order_id': {
        'type': 'string',
        'description': 'Internal order ID',
      },
    },
    'required': ['order_id'],
  },
);
```

Risky tool:

```dart
ToolDefinition(
  name: 'do_anything',
  description: 'Do any user request',
  parameters: {'type': 'object'},
);
```

The risky tool is too broad. It is difficult to validate and easy to misuse.

## Tool handler pattern

Validate arguments before using them. Never trust model-generated parameters without checks.

```dart
Future<ToolResult> handleToolCall(ToolCall call) async {
  switch (call.name) {
    case 'get_weather':
      final city = call.arguments['city'];

      if (city is! String || city.trim().isEmpty) {
        return ToolResult.error(
          call.id,
          'city must be a non-empty string',
        );
      }

      final weather = await localWeatherProvider.getWeather(city);
      return ToolResult.success(call.id, weather.toJson());

    default:
      return ToolResult.error(
        call.id,
        'Unknown tool: ${call.name}',
      );
  }
}
```

## Multi-round tool chains

Function calling can require more than one round. For example, the model may:

1. ask for the user's saved city;
2. call a weather tool with that city;
3. summarize the result in natural language.

Keep multi-round chains bounded. Configure the maximum number of tool rounds if the current SDK version exposes this option. A product should never allow infinite tool loops.

## Recommended tool result shape

Return compact JSON-like data. Do not return long raw documents unless the model really needs them.

```dart
ToolResult.success(call.id, {
  'order_id': 'ord_123',
  'status': 'shipped',
  'estimated_delivery': '2026-05-02',
});
```

Avoid returning huge payloads:

```dart
ToolResult.success(call.id, {
  'all_orders': veryLargeOrderHistory,
});
```

Large results consume context and can make the next model step slower or less reliable.

## Safety rules

Apply the same security controls you would use for any app API:

- validate all tool arguments;
- restrict tools to the current user and current workspace;
- avoid tools that can delete data unless the user confirms;
- do not expose secrets, tokens, or raw credentials to the model;
- log tool execution metadata without logging sensitive values;
- return errors as structured data instead of throwing unhandled exceptions.

## Local-only example

```dart
final tools = [
  ToolDefinition(
    name: 'search_notes',
    description: 'Search local notes by query',
    parameters: {
      'type': 'object',
      'properties': {
        'query': {'type': 'string'},
        'limit': {'type': 'integer'},
      },
      'required': ['query'],
    },
  ),
];

final answer = await session.sendWithTools(
  'Find my notes about Flutter setup and summarize them.',
  tools: tools,
  toolHandler: (call) async {
    final query = call.arguments['query'] as String;
    final limit = (call.arguments['limit'] as int?) ?? 5;

    final notes = await localNotes.search(query, limit: limit);

    return ToolResult.success(call.id, {
      'matches': notes.map((note) => {
            'title': note.title,
            'snippet': note.snippet,
          }).toList(),
    });
  },
);
```

## When to use function calling

Use function calling for:

- local app data lookup;
- device state queries;
- controlled calculations;
- user-specific answers;
- local RAG orchestration;
- tool chains where the model chooses the next step.

Avoid function calling when:

- the task is simple generation;
- the answer should not access app data;
- tool behavior cannot be validated;
- the model output must be a single strict JSON object with no tool loop.

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| The model calls the wrong tool | Tool names or descriptions are ambiguous. | Use specific tool names and descriptions. |
| Tool arguments are invalid | Schema is too loose or model output is imperfect. | Validate arguments in `toolHandler`. |
| Tool loop continues too long | No round limit or vague user request. | Set a max round limit where available and narrow the prompt. |
| Tool returns too much data | Handler returns raw payloads. | Return compact, task-specific data. |
| Private data appears in answer | Tool result included sensitive fields. | Filter tool results before returning them. |

## Privacy notes

Function calling can remain fully local if tools only read local data and no cloud transport is used. Still, tool results can expose sensitive data to the model context. Only return the minimum data required to answer the user.

## Next steps

- Use [`structured-output.md`](./structured-output.md) when you need schema-constrained JSON.
- Use [`embeddings.md`](./embeddings.md) when tools should search local documents.
- Use [`chat-sessions.md`](./chat-sessions.md) for plain multi-turn chat without tools.
