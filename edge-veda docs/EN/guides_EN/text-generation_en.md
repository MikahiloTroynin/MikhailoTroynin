---
title: "Text generation"
description: "Generate a complete on-device text response with the Edge Veda Dart SDK."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Text generation

Text generation is the simplest way to run an LLM through Edge Veda. Use it when your app needs a complete answer before updating the UI: summarization, short explanations, classification, rewriting, or one-shot assistant responses.

For token-by-token UI updates, use [`streaming-generation.md`](./streaming-generation.md) instead. For stateful conversations, use [`chat-sessions.md`](./chat-sessions.md).

## What you will build

This guide shows how to:

- initialize `EdgeVeda` with a local model;
- call `generate()` with a user prompt;
- read the final `response.text`;
- handle common runtime failures;
- decide when blocking generation is the right pattern.

## Prerequisites

Before using text generation, make sure that:

- the Flutter app includes `edge_veda`;
- the model file exists on the device;
- the model is compatible with the target platform;
- iOS deployment target is configured if you run on iPhone;
- large models are tested on real hardware, not only in the simulator.

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Basic example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in one paragraph.',
);

print(response.text);
```

## How it works

`generate()` sends a prompt to the currently initialized model and returns a complete response object after generation finishes. The model stays loaded in the Edge Veda runtime after the call, so the next request does not need to reload the model unless the runtime is disposed or memory pressure evicts it.

Use this pattern when the app can wait for the final answer. If the user should see output while the model is still generating, prefer `generateStream()`.

## Choosing the prompt

Keep the prompt specific and bounded. On mobile devices, long prompts increase evaluation time and memory pressure.

Good prompt:

```text
Summarize this support ticket in three bullets. Mention the user-visible problem, likely cause, and next action.
```

Risky prompt:

```text
Analyze everything and give me all possible details.
```

The second prompt is too broad. It can produce long output, consume more context, and make latency harder to control.

## Production-style wrapper

```dart
class LocalTextGenerator {
  LocalTextGenerator(this.edgeVeda);

  final EdgeVeda edgeVeda;

  Future<String> summarizeTicket(String ticketText) async {
    final prompt = '''
Summarize this support ticket in three bullets:
- user-visible problem
- likely cause
- recommended next action

Ticket:
$ticketText
''';

    try {
      final response = await edgeVeda.generate(prompt);
      return response.text.trim();
    } catch (error, stackTrace) {
      // Log stackTrace to your internal diagnostics if allowed.
      throw StateError('Text generation failed: $error');
    }
  }
}
```

## Optional confidence check

If the app uses confidence-based fallback, pass `GenerateOptions` with `confidenceThreshold`. When the average confidence drops below the threshold, the response can signal that a cloud handoff or human review may be needed.

```dart
final response = await edgeVeda.generate(
  'Explain quantum computing for a beginner.',
  options: GenerateOptions(confidenceThreshold: 0.3),
);

if (response.needsCloudHandoff) {
  // Route to a cloud model, show a warning, or ask the user to refine the prompt.
  print('Low confidence: ${response.avgConfidence}');
}

print(response.text);
```

Use this pattern only when your product has a defined fallback path. Do not silently send private user data to a cloud API without explicit product-level consent.

## Parameters and related objects

| Name | Type | Description |
| --- | --- | --- |
| `modelPath` | `String` | Path to the local model file. |
| `contextLength` | `int` | Maximum context window configured during runtime initialization. |
| `useGpu` | `bool` | Enables GPU acceleration where supported. |
| `prompt` | `String` | User or system-generated instruction passed to `generate()`. |
| `GenerateOptions` | `Object` | Optional generation controls exposed by the current SDK version. |
| `response.text` | `String` | Final generated text. |
| `response.avgConfidence` | `double?` | Average confidence when confidence tracking is enabled. |
| `response.needsCloudHandoff` | `bool` | Indicates whether confidence is below the configured threshold. |

## When to use `generate()`

Use `generate()` for:

- short answer generation;
- summarization;
- classification;
- extraction tasks that do not require strict JSON;
- background jobs where partial output is not useful;
- tests where a single final response is easier to assert.

Avoid `generate()` for:

- chat UIs that should update token by token;
- long assistant responses;
- tool-calling flows;
- structured JSON extraction that must match a schema;
- workloads where cancellation and backpressure are important.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Larger models improve quality but increase memory and startup time. | Start with a small model and measure on the target device. |
| Context length | Larger context increases memory usage. | Use the smallest context that supports the task. |
| Prompt size | Long prompts increase evaluation latency. | Trim repeated instructions and irrelevant context. |
| GPU usage | GPU can improve throughput on supported devices. | Enable `useGpu` on validated iOS/macOS hardware. |
| Concurrent workloads | Multiple AI tasks compete for memory and thermal budget. | Use the scheduler for apps that combine text, vision, speech, or RAG. |

## Error handling

Handle failures at the app boundary. Typical causes include:

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Model does not load | Wrong `modelPath` or unsupported model format. | Verify the model exists and matches Edge Veda compatibility guidance. |
| App becomes slow | Prompt too long, model too large, or device is under thermal pressure. | Reduce prompt size, context length, or model size. |
| Output is too generic | Prompt lacks constraints or examples. | Add explicit task, format, audience, and length. |
| Output is not valid JSON | `generate()` does not enforce a schema. | Use `sendStructured()` instead. |
| User waits too long | Blocking generation hides progress. | Switch to `generateStream()`. |

## Privacy notes

Text generation runs locally with the loaded on-device model. Treat prompts and generated responses as sensitive application data:

- do not log private prompts in release builds;
- avoid persisting generated output unless the user expects it;
- do not send low-confidence prompts to a cloud fallback without consent;
- redact secrets before passing developer logs or tickets into the prompt.

## Next steps

- Use [`streaming-generation.md`](./streaming-generation.md) for token-by-token UI.
- Use [`chat-sessions.md`](./chat-sessions.md) for multi-turn state.
- Use [`structured-output.md`](./structured-output.md) for schema-constrained JSON.
- Use [`embeddings.md`](./embeddings.md) for similarity search and RAG.
