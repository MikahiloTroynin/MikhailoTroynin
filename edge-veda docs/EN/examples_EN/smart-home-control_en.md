---
title: "Smart home control"
description: "Use Edge Veda function calling to map natural language to local smart-home actions."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Smart home control

This example shows how to use Edge Veda as a local smart-home assistant. The model receives a natural-language command and selects a safe local tool instead of directly controlling devices from generated text.

Use this example when you want to:

- map user intent to structured actions;
- keep smart-home commands on device;
- validate actions before execution;
- build an agent-style flow with `ToolDefinition` and `sendWithTools()`.

## What you build

You will build a small assistant that can handle commands such as:

```text
Turn on the living room lamp.
Set the hallway light to 40%.
Is the bedroom lamp on?
```

The model does not directly control hardware. It chooses one of the tools you expose. Your app validates the tool call and then calls the local device adapter.

## Safety model

For home automation, treat model output as a proposal.

Use this rule:

```text
Natural language → model chooses tool → app validates tool call → app executes action
```

Do not use raw generated text as a device command.

For high-risk devices, such as locks, garage doors, heaters, ovens, or security systems, add an explicit user confirmation step before execution.

## Local device model

This example uses an in-memory device registry. Replace it with your real smart-home adapter later.

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

Expose only the actions the model is allowed to request.

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

The handler is where your app validates and executes the selected tool.

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

## Complete example

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

In a UI, keep the flow explicit:

1. user enters a command;
2. app sends the command to `session.sendWithTools()`;
3. `toolHandler` validates and executes the tool;
4. app displays the model response and the actual device state;
5. app logs a safe audit event without storing sensitive text by default.

## Validation rules

Add validation before real hardware calls.

| Rule | Why it matters |
| --- | --- |
| Allowlist `device_id` | Prevents invented device names from reaching adapters. |
| Validate numeric ranges | Keeps brightness, temperature, or volume inside safe limits. |
| Separate read and write tools | Makes permission handling clearer. |
| Require confirmation for risky devices | Avoids accidental physical actions. |
| Log tool result, not raw private text | Keeps audit useful without over-collecting user data. |

## Expected behavior

For:

```text
Turn on the hallway light at 40%.
```

The model should select:

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

The app validates the arguments, updates the device state, and returns the tool result to the session.

## Production notes

For production smart-home apps:

- do not expose every device as a free-form string;
- use permission levels per user and device type;
- require confirmation for sensitive actions;
- support undo where possible;
- keep device state synchronized with the real adapter;
- test failed tool calls and partial state updates;
- do not rely on model text as proof that an action happened;
- display the actual adapter result to the user.

## Next steps

After this example works:

1. replace the in-memory registry with your device adapter;
2. add user confirmation for sensitive devices;
3. add room aliases and device aliases;
4. add read-only mode for guests;
5. connect this flow to a voice pipeline if your app supports speech.
