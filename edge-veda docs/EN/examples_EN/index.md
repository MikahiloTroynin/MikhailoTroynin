---
title: "Examples"
description: "Runnable examples for using Edge Veda in Flutter applications."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Examples

This section contains practical examples that show how to use Edge Veda in real Flutter applications. Start here after you have installed the package, added a local model, and confirmed that the runtime can initialize on your target device.

The examples are intentionally small. Each one focuses on one product scenario and one part of the SDK surface so that you can copy the code, run it, and then expand it inside your app.

## Available examples

| Example | What you build | Main APIs | Best starting point |
| --- | --- | --- | --- |
| [Basic text generation](basic-text-generation.md) | A one-prompt text generation flow that returns a complete response. | `EdgeVeda.init()`, `EdgeVeda.generate()` | First app, smoke test, non-streaming UI |
| [Streaming chat](streaming-chat.md) | A chat UI that receives tokens as they are generated. | `EdgeVeda.generateStream()`, `ChatSession.sendStream()` | Chat assistants, long responses, responsive UI |
| [Smart home control](smart-home-control.md) | A local assistant that maps natural language to controlled device actions. | `ChatSession`, `ToolDefinition`, `sendWithTools()` | Function calling, local automation, agent-style apps |

## What these examples assume

Before running any example, make sure that:

- your Flutter app has the `edge_veda` package installed;
- your target platform is configured;
- a compatible model file is available on the device;
- `modelPath` points to a real local model file;
- the model is appropriate for the use case;
- the UI handles slow generation, cancellation, and runtime errors.

For a first text model, start with a small instruct model. For tool calling, use a model that follows structured instructions reliably.

## Shared setup

Most examples use the same runtime initialization pattern:

```dart
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

Use this setup for iOS and macOS when the model and device support GPU acceleration. On Android, check the current platform notes and model compatibility before enabling production usage.

## Recommended project layout

A small app can keep the example code in one file. A production app should separate runtime setup, UI, and feature logic.

```text
lib/
├── main.dart
├── ai/
│   ├── edge_veda_runtime.dart
│   ├── prompts.dart
│   └── model_paths.dart
├── features/
│   ├── text_generation/
│   ├── chat/
│   └── smart_home/
└── widgets/
    ├── generation_error_view.dart
    └── token_stream_view.dart
```

A shared runtime wrapper helps avoid repeated model loading:

```dart
class EdgeVedaRuntime {
  EdgeVedaRuntime(this.modelPath);

  final String modelPath;
  final EdgeVeda edgeVeda = EdgeVeda();

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    _initialized = true;
  }

  Future<void> dispose() async {
    await edgeVeda.dispose();
    _initialized = false;
  }
}
```

## Choosing the right example

| Your task | Use this example | Why |
| --- | --- | --- |
| Verify that a model runs on device | Basic text generation | It uses the smallest possible generation path. |
| Add a `Generate` button to an app | Basic text generation | The UI waits for one complete response. |
| Build a chat assistant | Streaming chat | It keeps the UI responsive while tokens arrive. |
| Preserve conversation context | Streaming chat | `ChatSession` tracks turns and context usage. |
| Let the model choose actions | Smart home control | `sendWithTools()` maps user intent to tool calls. |
| Keep data local | Any example | Edge Veda is designed for on-device inference. |

## Example quality checklist

Before copying an example into production, verify that:

- the model path is not hard-coded to a developer machine;
- the app shows a loading state during model initialization;
- the app exposes a cancellation path for long generation;
- runtime errors are visible to users or logs;
- generation output is not used for irreversible actions without validation;
- privacy-sensitive input is not logged;
- model and platform limits are documented for your app.

## What to read next

After completing the examples, continue with:

- `guides/text-generation.md` for prompt and response patterns;
- `guides/streaming-generation.md` for token streaming details;
- `guides/chat-sessions.md` for multi-turn conversations;
- `guides/function-calling.md` for tool calling patterns;
- `guides/runtime-policy.md` for runtime supervision and budgets;
- `platforms/device-requirements.md` for model and device constraints.
