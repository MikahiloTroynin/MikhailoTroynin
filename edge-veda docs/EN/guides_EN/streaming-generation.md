---
title: "Streaming generation"
description: "Stream generated tokens from an on-device model with Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Streaming generation

Streaming generation lets the UI receive model output as it is produced. Use `generateStream()` when users should see progress immediately: chat responses, long explanations, live coding assistants, local copilots, and any flow where waiting for a complete response would feel slow.

For one-shot generation, use [`text-generation.md`](./text-generation.md). For multi-turn sessions, use [`chat-sessions.md`](./chat-sessions.md).

## What you will build

This guide shows how to:

- initialize `EdgeVeda`;
- stream token chunks from `generateStream()`;
- buffer tokens for a clean UI;
- stop reading when the user cancels;
- avoid common performance issues.

## Basic example

```dart
import 'dart:io';
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain recursion briefly.',
)) {
  stdout.write(chunk.token);
}
```

`chunk.token` contains the next emitted token or text fragment. Append it to your visible response, a buffer, or a message model in application state.

## Flutter UI pattern

Do not call `setState()` for every token in a heavy widget tree. Buffer tokens and update the UI in small batches.

```dart
class StreamingAnswerController {
  StreamingAnswerController(this.edgeVeda);

  final EdgeVeda edgeVeda;
  final StringBuffer _buffer = StringBuffer();

  String get text => _buffer.toString();

  Future<void> run(
    String prompt,
    void Function(String text) onUpdate,
  ) async {
    var tokenCount = 0;

    await for (final chunk in edgeVeda.generateStream(prompt)) {
      _buffer.write(chunk.token);
      tokenCount++;

      if (tokenCount % 4 == 0) {
        onUpdate(_buffer.toString());
      }
    }

    onUpdate(_buffer.toString());
  }

  void reset() {
    _buffer.clear();
  }
}
```

This pattern reduces UI churn while still making the response feel live.

## Cancellation pattern

Use a local cancellation flag or a higher-level stream subscription depending on your app architecture.

```dart
var cancelled = false;
final buffer = StringBuffer();

Future<void> generateAnswer() async {
  await for (final chunk in edgeVeda.generateStream(prompt)) {
    if (cancelled) {
      break;
    }

    buffer.write(chunk.token);
  }
}

void cancelGeneration() {
  cancelled = true;
}
```

Breaking out of the loop stops reading further chunks. Keep the partially generated text only if your UX supports partial answers.

## When to use streaming

Use `generateStream()` when:

- the answer may take more than a short moment;
- the UI should show a typing effect;
- users may cancel the response;
- the task is conversational;
- you need to display partial progress.

Use `generate()` when:

- the response is short;
- the app needs one final value;
- partial output could confuse users;
- you are running background summarization or classification.

## Chunk handling

A chunk is not always a complete word or sentence. Treat streamed output as incremental text, not as a semantic unit.

Recommended handling:

- append chunks in order;
- render partial text as provisional;
- run final formatting after the stream completes;
- avoid parsing JSON from partial chunks;
- avoid saving each chunk as a separate database record.

For structured JSON, do not stream into a JSON parser unless you control incremental parsing. Use `sendStructured()` when the output must match a schema.

## Production-style example

```dart
class ChatComposer {
  ChatComposer(this.edgeVeda);

  final EdgeVeda edgeVeda;

  Future<String> composeAnswer({
    required String userQuestion,
    required void Function(String partialText) onPartialText,
  }) async {
    final buffer = StringBuffer();

    final prompt = '''
Answer the user question clearly.
Keep the response under 120 words.

Question:
$userQuestion
''';

    try {
      await for (final chunk in edgeVeda.generateStream(prompt)) {
        buffer.write(chunk.token);
        onPartialText(buffer.toString());
      }

      return buffer.toString().trim();
    } catch (error) {
      final partial = buffer.toString().trim();

      if (partial.isNotEmpty) {
        return partial;
      }

      throw StateError('Streaming generation failed: $error');
    }
  }
}
```

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Token update frequency | Updating the UI for every token can cause jank. | Batch UI updates every few tokens or on a timer. |
| Long output | Long responses increase runtime, battery use, and thermal load. | Ask for a bounded length in the prompt. |
| Context length | Larger context increases memory pressure. | Keep context only as large as the use case needs. |
| Device pressure | Thermal or memory pressure can slow generation. | Use runtime supervision and reduce workload priority if needed. |
| Concurrent streams | Multiple streams can compete for the same model worker. | Serialize user-facing generation unless the product explicitly supports parallel work. |

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Stream starts slowly | Model initialization or prompt evaluation is still running. | Initialize the runtime before the user starts the task. |
| UI freezes | Too many UI updates per token. | Buffer chunks and throttle rendering. |
| Response stops early | Cancellation, memory pressure, or generation limit. | Keep partial output only when the UX allows it. |
| Output repeats | Prompt lacks stop conditions or context is too long. | Add constraints and reset context when needed. |

## Privacy notes

Streaming does not require cloud transport. However, partial text is still user data:

- do not log every token in production;
- avoid exposing partial content to analytics;
- clear buffers when the user cancels sensitive generation;
- treat prompts and chunks as the same privacy category as complete responses.

## Next steps

- Use [`chat-sessions.md`](./chat-sessions.md) when the model must remember previous turns.
- Use [`function-calling.md`](./function-calling.md) when the model needs tool results.
- Use [`structured-output.md`](./structured-output.md) when the response must be valid JSON.
