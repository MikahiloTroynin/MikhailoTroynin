---
title: "EdgeVeda.generateStream()"
description: "API reference page for the generateStream() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generateStream()`

> Generates text as a stream of token chunks for progressive, responsive on-device AI experiences.

Use `generateStream()` when your app needs to display model output as it is generated, cancel a request mid-generation, or react to per-token confidence metadata.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generateStream()` |
| Category | Core inference / Streaming text generation |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | Yes |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Stream<TokenChunk> generateStream(
  String prompt, {
  GenerateOptions? options,
  CancelToken? cancelToken,
});
```

## What it does

`generateStream()` sends a prompt to the local model and returns a Dart `Stream<TokenChunk>`. The stream yields token chunks as they are generated. The final chunk has `isFinal == true` and an empty token to signal completion.

The method uses a persistent `StreamingWorker`. If the worker is not active, the method spawns it and loads the configured model. If the worker is already active, it reuses it.

## When to use it

Use `generateStream()` when you need to:

- update a chat or assistant UI token by token;
- allow the user to cancel generation mid-stream;
- process generated output incrementally;
- track per-token confidence or cloud-handoff signals.

Do not use this method when:

- you only need the final text and simpler code; use `generate()`;
- another stream is already active on the same `EdgeVeda` instance;
- the runtime has not been initialized with `init()`;
- you need model-level multi-turn memory; use `ChatSession`.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.init(config)` has completed successfully;
- the prompt is not empty;
- no other `generateStream()` call is active on the same `EdgeVeda` instance;
- `GenerateOptions` values are valid;
- the app is ready to handle stream errors;
- the UI handles final chunks and cancellation correctly.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `prompt` | `String` | Yes | — | Input text passed to the local model. | Must not be empty. |
| `options` | `GenerateOptions?` | No | `const GenerateOptions()` | Controls token limit, sampling, grammar constraints, JSON mode, and confidence tracking. | Values are validated before streaming starts. |
| `cancelToken` | `CancelToken?` | No | `null` | Optional cancellation token for stopping generation mid-stream. | Calling `cancel()` stops token generation as soon as the worker observes cancellation. |

## Returns

`Stream<TokenChunk>`

A stream that emits token chunks until the final chunk is produced, cancellation happens, or an error is thrown.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `token` | `String` | Token text content for this chunk. The final chunk usually has an empty token. |
| `index` | `int` | Token index in the generated sequence. |
| `isFinal` | `bool` | `true` when the stream has completed. |
| `confidence` | `double?` | Per-token confidence score when confidence tracking is enabled. |
| `needsCloudHandoff` | `bool` | Whether cloud handoff is recommended at this point. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `GenerationException` | Prompt is empty, streaming is already active, worker spawn fails, worker init fails, or streaming fails. | Validate input, serialize generation calls, retry after cancellation, or reinitialize the runtime. |
| `ConfigurationException` | Invalid `GenerateOptions` values are passed. | Clamp values in the UI and validate options before starting the stream. |
| Stream errors | Runtime failures are propagated through the stream. | Wrap `await for` in `try/catch` and update the UI state on failure. |
| Cancellation state | User cancels generation through `CancelToken`. | Treat cancellation as a normal user action; preserve partial output if useful. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain what on-device AI means.',
)) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
```

## Production-style example

```dart
Future<String> streamIntoBuffer(EdgeVeda edgeVeda, String prompt) async {
  final cancelToken = CancelToken();
  final buffer = StringBuffer();

  try {
    await for (final chunk in edgeVeda.generateStream(
      prompt,
      options: const GenerateOptions(
        maxTokens: 256,
        temperature: 0.4,
        topP: 0.9,
      ),
      cancelToken: cancelToken,
    )) {
      if (chunk.isFinal) {
        break;
      }

      buffer.write(chunk.token);

      if (chunk.needsCloudHandoff) {
        // Optional: surface low-confidence state to the app.
      }
    }

    return buffer.toString();
  } on GenerationException catch (error) {
    throw Exception('Streaming generation failed: ${error.message}');
  }
}
```

## Streaming example with cancellation

```dart
final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Write a short story about a robot gardener.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (chunk.isFinal) {
    break;
  }

  stdout.write(chunk.token);

  if (shouldStopGeneration()) {
    cancelToken.cancel();
    break;
  }
}
```

## Behavior notes

- `generateStream()` requires a successfully initialized `EdgeVeda` instance.
- Only one streaming operation can be active at a time on the same instance.
- The method lazily creates and initializes a persistent `StreamingWorker` if needed.
- The worker uses the `EdgeVedaConfig` captured during `init()`.
- The method emits `TokenChunk` objects and uses a final chunk with `isFinal == true`.
- Runtime errors are propagated as stream errors.
- Cancellation removes the cancellation listener in the `finally` path.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| First stream after init | May include worker spawn and model load time. | Show a "loading model" or "starting" state. |
| Subsequent streams | Can reuse the active worker. | Keep the runtime alive for multi-request sessions. |
| `maxTokens` | Directly affects duration and energy use. | Set task-specific limits. |
| UI update frequency | Updating UI on every token can be expensive. | Batch UI updates if rendering becomes costly. |
| Concurrent workloads | Streaming is single-active per `EdgeVeda` instance. | Queue user requests or create controlled runtime instances. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Primary use case for streaming text generation. |
| GGUF embedding model | No | Use `embed()` for embeddings. |
| Tool-capable chat model | Partial | For automatic tool loops, prefer `ChatSession.sendWithTools()`. |
| Vision-language model | No for this method | Use vision APIs for image input. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated streaming. |
| iOS simulator | Partial | CPU-only, slower, not representative for performance. |
| macOS | Yes / package surface | Validate model paths and sandbox behavior. |
| Android | Partial / validation pending | Test on target devices before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: prompt text and generation options.
- Network access during inference: none.
- Local storage used: local model file and runtime worker state.
- Sensitive data considerations: do not log live user prompts or token chunks unless explicitly needed and safe.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Streaming already in progress` | Another stream is active on the same `EdgeVeda` instance. | Wait for completion, cancel the active stream, or queue the next request. |
| No tokens appear for a while | First call is spawning the worker and loading the model. | Show progress text and test release/profile builds on device. |
| Stream stops early | `CancelToken` was cancelled or the model hit a stop sequence. | Confirm app cancellation logic and `stopSequences`. |
| Stream throws an error | Worker spawn/init failed or native runtime failed. | Catch stream errors, log details, and reinitialize if needed. |
| UI stutters | Rendering updates for every token is too frequent. | Batch token updates or throttle UI refresh. |

## Related APIs

- [`EdgeVeda.init()`](./init.md) — initializes runtime configuration before streaming.
- [`EdgeVeda.generate()`](./generate.md) — collects stream output and returns a complete response.
- [`CancelToken`](../core/cancel-token.md) — cancels streaming generation.
- [`ChatSession.sendStream()`](../chat-session/send-stream.md) — streams within a multi-turn chat session.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Public export file: `flutter/lib/edge_veda.dart`
- Generated Dart API: `EdgeVeda.generateStream()`
- Example usage: `flutter/QUICKSTART.md`
- Related worker: `StreamingWorker`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Before publishing, verify that:

- [ ] The signature matches the current source code.
- [ ] Cancellation behavior is validated.
- [ ] The single-active-stream limitation is still accurate.
- [ ] `TokenChunk` fields match `types.dart`.
- [ ] The examples compile.
- [ ] Stream errors and UI-state handling are documented clearly.
- [ ] Platform notes are updated for the current release.
