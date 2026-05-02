---
title: "EdgeVeda.generate()"
description: "API reference page for the generate() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.generate()`

> Generates a complete text response from a prompt by collecting tokens from the persistent streaming worker.

Use `generate()` when your app needs a single final text response rather than token-by-token UI updates.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `generate()` |
| Category | Core inference / Text generation |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No; use `generateStream()` for token streaming |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<GenerateResponse> generate(
  String prompt, {
  GenerateOptions? options,
  Duration? timeout,
});
```

## What it does

`generate()` sends a prompt to the local model and returns a complete `GenerateResponse`. Internally, it routes through the same persistent `StreamingWorker` used by `generateStream()`, collects emitted tokens into a buffer, and returns the final text with generation metadata.

The method is asynchronous and performs inference on device. It does not require a network call.

## When to use it

Use `generate()` when you need to:

- produce a complete answer before updating the UI;
- run short assistant, summarization, classification, or transformation tasks;
- apply a timeout to a blocking generation request;
- avoid manual stream handling in simple application flows.

Do not use this method when:

- you need token-by-token rendering in a chat UI; use `generateStream()`;
- another stream is already active on the same `EdgeVeda` instance;
- you need multi-turn conversation state; consider `ChatSession`;
- you need structured tool-calling loops; consider `ChatSession.sendWithTools()`.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.init(config)` has completed successfully;
- the prompt is not empty;
- the selected model is appropriate for the prompt style and expected output;
- `GenerateOptions` values are within supported ranges;
- the app can handle latency for a full response, especially for large `maxTokens`;
- no streaming operation is already active on the same runtime instance.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `prompt` | `String` | Yes | — | Input text passed to the local model. | Must not be empty. Keep prompts within the configured context length. |
| `options` | `GenerateOptions?` | No | `const GenerateOptions()` | Controls sampling, token limit, system prompt, JSON/grammar behavior, and confidence tracking. | Invalid values can throw `ConfigurationException`. |
| `timeout` | `Duration?` | No | `null` | Optional maximum duration for the complete generation call. | If exceeded, the method throws `GenerationException`. |

### Common `GenerateOptions` fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `systemPrompt` | `String?` | `null` | Optional system-level instruction. |
| `maxTokens` | `int` | `512` | Maximum number of tokens to generate. |
| `temperature` | `double` | `0.7` | Sampling randomness. Lower is more deterministic. |
| `topP` | `double` | `0.9` | Nucleus sampling threshold. |
| `topK` | `int` | `40` | Limits sampling to the top K candidate tokens. |
| `repeatPenalty` | `double` | `1.1` | Discourages repeated output. |
| `stopSequences` | `List<String>` | `[]` | Stop sequences for early termination. |
| `jsonMode` | `bool` | `false` | Requests valid JSON output. |
| `grammarStr` | `String?` | `null` | Optional GBNF grammar for constrained decoding. |
| `grammarRoot` | `String?` | `null` | Optional root rule for the grammar. |
| `confidenceThreshold` | `double` | `0.0` | Enables confidence tracking and cloud-handoff signaling when greater than zero. |

## Returns

`Future<GenerateResponse>`

A future that resolves to the complete generated response.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `text` | `String` | Complete generated text content. |
| `promptTokens` | `int` | Number of prompt tokens reported by the response. |
| `completionTokens` | `int` | Number of generated tokens collected from the stream. |
| `latencyMs` | `int?` | Total generation duration in milliseconds. |
| `avgConfidence` | `double?` | Average confidence across generated tokens when confidence tracking is enabled. |
| `needsCloudHandoff` | `bool` | Whether the model signaled that cloud handoff may be needed. |
| `tokensPerSecond` | `double?` | Derived throughput when latency and token counts are available. |
| `totalTokens` | `int` | Prompt and completion tokens combined. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `GenerationException` | Prompt is empty, generation times out, the worker fails, or a streaming conflict occurs. | Validate input, avoid concurrent streams, retry with lower `maxTokens`, or show a user-facing failure state. |
| `ConfigurationException` | One or more `GenerateOptions` values are outside allowed ranges. | Clamp UI controls and validate options before calling the method. |
| `InitializationException` / `EdgeVedaException` | Runtime is not initialized or another SDK-level failure occurs. | Call `init()` first and handle typed exceptions. |
| Stream-propagated errors | Since `generate()` consumes `generateStream()`, stream errors can surface as generation failures. | Log the underlying details and recover at the application level. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in two sentences.',
);

print(response.text);
```

## Production-style example

```dart
Future<String> summarizeNote(EdgeVeda edgeVeda, String note) async {
  if (note.trim().isEmpty) {
    throw ArgumentError('note must not be empty');
  }

  try {
    final response = await edgeVeda.generate(
      'Summarize this note for a product manager:\n\n$note',
      options: const GenerateOptions(
        maxTokens: 180,
        temperature: 0.3,
        topP: 0.9,
      ),
      timeout: const Duration(seconds: 30),
    );

    return response.text.trim();
  } on GenerationException catch (error) {
    throw Exception('Text generation failed: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Not applicable. `generate()` returns a complete response. For streaming, use:

```dart
await for (final chunk in edgeVeda.generateStream('Tell me a short story')) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
```

## Behavior notes

- `generate()` requires a successfully initialized `EdgeVeda` instance.
- The method validates that `prompt` is not empty.
- The method uses `generateStream()` internally and buffers all non-final token chunks.
- The final response includes measured latency and completion token count.
- Because it depends on `generateStream()`, only one active streaming operation should run per `EdgeVeda` instance.
- Confidence and cloud-handoff metadata depend on the selected `GenerateOptions`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| `maxTokens` | Higher values increase latency and battery use. | Set the lowest acceptable value for the task. |
| Model size | Larger models may improve quality but increase memory and latency. | Use Model Advisor or device-specific defaults. |
| Context length | Longer prompts consume context and can increase compute time. | Keep prompts concise and summarize long context. |
| GPU / Metal usage | Improves throughput on supported Apple devices. | Test on physical devices in release/profile mode. |
| Timeout | Prevents long blocking calls. | Use `timeout` for user-facing interactions. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Best suited for natural language responses. |
| GGUF embedding model | No for text generation | Use `embed()` for embeddings. |
| Tool-calling model | Partial | Use `ChatSession.sendWithTools()` for multi-round tool execution. |
| Vision-language model | No for this method | Use vision APIs for image inputs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for sustained on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be much slower. |
| macOS | Yes / package surface | Validate model paths and sandbox access. |
| Android | Partial / validation pending | Validate on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: prompt text and generation options.
- Network access during inference: none.
- Local storage used: local model file and runtime cache/state.
- Sensitive data considerations: avoid logging user prompts or full generated outputs if they may contain private data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `Prompt cannot be empty` | Empty or whitespace-only prompt passed to the method. | Validate the prompt before calling `generate()`. |
| Generation times out | Large prompt, high `maxTokens`, slow device, or thermal pressure. | Reduce `maxTokens`, simplify the prompt, use streaming, or increase timeout. |
| Repeated or low-quality output | Wrong chat template/model or too-high sampling randomness. | Use `ChatSession` with the correct template or lower `temperature`. |
| Worker error | The persistent streaming worker failed to spawn or load the model. | Reinitialize the runtime or restart the app-level session. |
| UI appears frozen | The app waits for full response before updating UI. | Use `generateStream()` for progressive rendering. |

## Related APIs

- [`EdgeVeda.init()`](./init.md) — initializes the runtime before generation.
- [`EdgeVeda.generateStream()`](./generate-stream.md) — streams tokens for progressive UI.
- [`ChatSession.sendStream()`](../chat-session/send-stream.md) — handles multi-turn chat state.
- [`ChatSession.sendWithTools()`](../chat-session/send-with-tools.md) — handles tool-calling workflows.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Public export file: `flutter/lib/edge_veda.dart`
- Generated Dart API: `EdgeVeda.generate()`
- Example usage: `flutter/QUICKSTART.md`
- Related worker: `StreamingWorker`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Before publishing, verify that:

- [ ] The signature matches the current source code.
- [ ] `GenerateOptions` defaults and validation ranges are current.
- [ ] The return fields match `GenerateResponse`.
- [ ] The minimal example compiles.
- [ ] Timeout behavior is confirmed against source and tests.
- [ ] Concurrency limitations are documented correctly.
- [ ] Privacy notes match project policy.
