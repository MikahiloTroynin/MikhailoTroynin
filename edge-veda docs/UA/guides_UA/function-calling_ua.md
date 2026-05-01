---
title: "Function calling"
description: "Дайте on-device chat session можливість викликати local tools через Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Function calling

`Function calling` дає model можливість запросити structured tool execution під час conversation. Сам tool виконується у вашому app code. Це залишає private data локально і дозволяє model використовувати fresh або app-specific information: weather, contacts, calendar events, inventory, device state або local documents.

Використовуйте `function calling`, коли answer залежить від інформації, якої model не має у weights або current prompt.

## Що ви створите

У цьому guide показано, як:

- визначити `ToolDefinition`;
- передати tools у `sendWithTools()`;
- виконати tool calls у `toolHandler`;
- повернути `ToolResult`;
- спроєктувати safe local tools.

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

Model вирішує, коли викликати `get_weather`. App отримує tool call, виконує trusted local code і повертає result.

## Tool design

Добрий tool має бути вузьким, передбачуваним і зручним для validation.

Добрий tool:

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

Ризиковий tool:

```dart
ToolDefinition(
  name: 'do_anything',
  description: 'Do any user request',
  parameters: {'type': 'object'},
);
```

Ризиковий tool занадто широкий. Його важко validate-ити і легко використати неправильно.

## Tool handler pattern

Validate-іть arguments перед використанням. Не довіряйте model-generated parameters без checks.

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

`Function calling` може потребувати більше одного round. Наприклад, model може:

1. попросити saved city user;
2. викликати weather tool з цим city;
3. підсумувати result у natural language.

Тримайте multi-round chains bounded. Налаштуйте maximum tool rounds, якщо поточна SDK version expose-ить таку option. Product не має дозволяти infinite tool loops.

## Recommended tool result shape

Повертаєте compact JSON-like data. Не повертайте довгі raw documents, якщо model вони справді не потрібні.

```dart
ToolResult.success(call.id, {
  'order_id': 'ord_123',
  'status': 'shipped',
  'estimated_delivery': '2026-05-02',
});
```

Не повертайте huge payloads:

```dart
ToolResult.success(call.id, {
  'all_orders': veryLargeOrderHistory,
});
```

Large results споживають context і можуть зробити наступний model step повільнішим або менш надійним.

## Safety rules

Застосовуйте ті самі security controls, що й для будь-якого app API:

- validate-іть усі tool arguments;
- обмежуйте tools current user і current workspace;
- уникайте tools, які delete-ять data, без user confirmation;
- не передавайте secrets, tokens або raw credentials у model;
- log-уйте tool execution metadata без sensitive values;
- повертайте errors як structured data, а не unhandled exceptions.

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

## Коли використовувати function calling

Використовуйте `function calling` для:

- local app data lookup;
- device state queries;
- controlled calculations;
- user-specific answers;
- local RAG orchestration;
- tool chains, де model обирає next step.

Не використовуйте `function calling`, коли:

- task — простий generation;
- answer не має access-ити app data;
- tool behavior не можна validate-ити;
- model output має бути одним strict JSON object без tool loop.

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Model викликає не той tool | Tool names або descriptions неоднозначні. | Використовуйте specific tool names і descriptions. |
| Tool arguments invalid | Schema занадто loose або model output imperfect. | Validate-іть arguments у `toolHandler`. |
| Tool loop триває занадто довго | Нема round limit або user request vague. | Налаштуйте max round limit, де доступно, і звузьте prompt. |
| Tool повертає забагато data | Handler повертає raw payloads. | Поверніть compact, task-specific data. |
| Private data зʼявляється в answer | Tool result містив sensitive fields. | Filter-іть tool results перед поверненням. |

## Privacy notes

`Function calling` може залишатися повністю local, якщо tools читають лише local data і cloud transport не використовується. Проте tool results можуть потрапити в model context. Повертаєте лише мінімальні data, потрібні для answer.

## Next steps

- Використовуйте [`structured-output.md`](./structured-output.md), коли потрібен schema-constrained JSON.
- Використовуйте [`embeddings.md`](./embeddings.md), коли tools мають шукати local documents.
- Використовуйте [`chat-sessions.md`](./chat-sessions.md) для plain multi-turn chat без tools.
