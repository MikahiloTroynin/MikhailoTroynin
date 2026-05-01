---
title: "Smart home control"
description: "Використання Edge Veda function calling для перетворення natural language на локальні smart-home actions."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Smart home control

Цей приклад показує, як використовувати Edge Veda як локальний smart-home assistant. Model отримує natural-language command і вибирає безпечний local tool замість прямого керування devices через generated text.

Використовуйте цей приклад, коли потрібно:

- перетворювати user intent на structured actions;
- залишати smart-home commands на device;
- валідовувати actions перед execution;
- створити agent-style flow з `ToolDefinition` і `sendWithTools()`.

## Що створюється

Ви створите невеликий assistant, який може обробляти commands:

```text
Turn on the living room lamp.
Set the hallway light to 40%.
Is the bedroom lamp on?
```

Model не керує hardware напряму. Вона вибирає один із tools, які ви відкрили. App валідовує tool call і лише тоді викликає local device adapter.

## Safety model

Для home automation розглядайте model output як пропозицію.

Правило:

```text
Natural language → model chooses tool → app validates tool call → app executes action
```

Не використовуйте raw generated text як device command.

Для high-risk devices, наприклад locks, garage doors, heaters, ovens або security systems, додайте явний user confirmation step перед execution.

## Local device model

Цей приклад використовує in-memory device registry. Пізніше замініть його на реальний smart-home adapter.

```dart
class SmartDevice {
  SmartDevice({
    required this.id,
    required this.label,
    required this.type,
    required this.room,
    this.isOn = false,
    this.brightness = 100,
  });

  final String id;
  final String label;
  final String type;
  final String room;
  bool isOn;
  int brightness;
}

final devices = <String, SmartDevice>{
  'living_room_lamp': SmartDevice(
    id: 'living_room_lamp',
    label: 'Living room lamp',
    type: 'light',
    room: 'living room',
  ),
  'hallway_light': SmartDevice(
    id: 'hallway_light',
    label: 'Hallway light',
    type: 'light',
    room: 'hallway',
  ),
  'bedroom_lamp': SmartDevice(
    id: 'bedroom_lamp',
    label: 'Bedroom lamp',
    type: 'light',
    room: 'bedroom',
  ),
};
```

## Tool definitions

Відкривайте лише ті actions, які model дозволено request-ити.

```dart
import 'package:edge_veda/edge_veda.dart';

final smartHomeTools = [
  ToolDefinition(
    name: 'set_light_state',
    description: 'Turn a known light on or off and optionally set brightness.',
    parameters: {
      'type': 'object',
      'properties': {
        'device_id': {
          'type': 'string',
          'description': 'One of: living_room_lamp, hallway_light, bedroom_lamp',
        },
        'is_on': {
          'type': 'boolean',
          'description': 'Whether the light should be on.',
        },
        'brightness': {
          'type': 'integer',
          'description': 'Brightness from 1 to 100. Optional.',
        },
      },
      'required': ['device_id', 'is_on'],
    },
  ),
  ToolDefinition(
    name: 'get_light_state',
    description: 'Read the current state of a known light.',
    parameters: {
      'type': 'object',
      'properties': {
        'device_id': {
          'type': 'string',
          'description': 'One of: living_room_lamp, hallway_light, bedroom_lamp',
        },
      },
      'required': ['device_id'],
    },
  ),
];
```

## Tool handler

`toolHandler` — це місце, де app валідовує й виконує обраний tool.

```dart
Future<ToolResult> handleSmartHomeTool(ToolCall call) async {
  switch (call.name) {
    case 'set_light_state':
      final deviceId = call.arguments['device_id'] as String?;
      final isOn = call.arguments['is_on'] as bool?;
      final brightness = call.arguments['brightness'] as int?;

      if (deviceId == null || isOn == null) {
        return ToolResult.error(
          call.id,
          'Missing required device_id or is_on.',
        );
      }

      final device = devices[deviceId];
      if (device == null) {
        return ToolResult.error(
          call.id,
          'Unknown device_id: $deviceId.',
        );
      }

      if (brightness != null && (brightness < 1 || brightness > 100)) {
        return ToolResult.error(
          call.id,
          'Brightness must be between 1 and 100.',
        );
      }

      device.isOn = isOn;
      if (brightness != null) {
        device.brightness = brightness;
      }

      return ToolResult.success(call.id, {
        'device_id': device.id,
        'label': device.label,
        'is_on': device.isOn,
        'brightness': device.brightness,
      });

    case 'get_light_state':
      final deviceId = call.arguments['device_id'] as String?;
      if (deviceId == null) {
        return ToolResult.error(call.id, 'Missing required device_id.');
      }

      final device = devices[deviceId];
      if (device == null) {
        return ToolResult.error(call.id, 'Unknown device_id: $deviceId.');
      }

      return ToolResult.success(call.id, {
        'device_id': device.id,
        'label': device.label,
        'is_on': device.isOn,
        'brightness': device.brightness,
      });

    default:
      return ToolResult.error(call.id, 'Unsupported tool: ${call.name}.');
  }
}
```

## Повний приклад

```dart
import 'package:edge_veda/edge_veda.dart';

Future<void> runSmartHomeControl(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 4096,
      useGpu: true,
    ));

    final session = ChatSession(
      edgeVeda: edgeVeda,
      preset: SystemPromptPreset.coder,
    );

    final response = await session.sendWithTools(
      '''
You are a local smart-home assistant.

Use tools for device control.
Do not invent device IDs.
If the requested device is not listed, ask the user to choose a known device.

Known devices:
- living_room_lamp
- hallway_light
- bedroom_lamp

User request: Turn on the hallway light at 40%.
''',
      tools: smartHomeTools,
      toolHandler: handleSmartHomeTool,
    );

    print(response.text);
  } finally {
    await edgeVeda.dispose();
  }
}
```

## Flutter command flow

У UI тримайте flow явним:

1. user вводить command;
2. app надсилає command у `session.sendWithTools()`;
3. `toolHandler` валідовує й виконує tool;
4. app показує model response і actual device state;
5. app записує safe audit event без збереження sensitive text за замовчуванням.

## Validation rules

Додавайте validation перед real hardware calls.

| Rule | Навіщо |
| --- | --- |
| Allowlist `device_id` | Не дає invented device names потрапити в adapters. |
| Validate numeric ranges | Утримує brightness, temperature або volume у safe limits. |
| Separate read and write tools | Спрощує permission handling. |
| Require confirmation for risky devices | Запобігає випадковим physical actions. |
| Log tool result, not raw private text | Audit залишається корисним без зайвого збору user data. |

## Очікувана поведінка

Для:

```text
Turn on the hallway light at 40%.
```

Model має вибрати:

```json
{
  "name": "set_light_state",
  "arguments": {
    "device_id": "hallway_light",
    "is_on": true,
    "brightness": 40
  }
}
```

App валідовує arguments, оновлює device state і повертає tool result у session.

## Production notes

Для production smart-home apps:

- не відкривайте всі devices як free-form string;
- використовуйте permission levels для user і device type;
- вимагайте confirmation для sensitive actions;
- підтримуйте undo, де можливо;
- синхронізуйте device state з реальним adapter;
- тестуйте failed tool calls і partial state updates;
- не покладайтеся на model text як доказ, що action виконано;
- показуйте actual adapter result користувачу.

## Наступні кроки

Після успішного запуску:

1. замініть in-memory registry на свій device adapter;
2. додайте user confirmation для sensitive devices;
3. додайте room aliases і device aliases;
4. додайте read-only mode для guests;
5. підключіть цей flow до voice pipeline, якщо app підтримує speech.
