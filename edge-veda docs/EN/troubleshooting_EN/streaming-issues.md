---
title: "Streaming issues"
description: "Troubleshoot missing chunks, delayed first token, duplicate output, cancellation, UI freezes, and backpressure in Edge Veda streaming generation."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Streaming issues

Use this page when `generateStream()` does not emit chunks, emits chunks too slowly, duplicates tokens, freezes the UI, keeps running after the user cancels, or loses the final response.

Edge Veda supports streaming token generation. Streaming is useful for chat interfaces because the user sees partial output before the full response is complete. However, streaming requires careful handling of async loops, cancellation, UI updates, and backpressure.

## Common symptoms

| Symptom | Likely cause | First action |
| --- | --- | --- |
| No chunks are emitted | Model is not initialized, prompt is empty, or stream is not consumed. | Check `EdgeVeda.init()` and the `await for` loop. |
| First token is very late | Large prompt, cold model, or high `contextLength`. | Log `timeToFirstToken` and test with a short prompt. |
| Stream stops midway | Cancellation, memory pressure, thermal policy, or malformed prompt. | Capture logs and compare with blocking `generate()`. |
| Tokens are duplicated | UI appends the same partial response more than once. | Check state update logic. |
| UI freezes during stream | Heavy rebuilds or synchronous work on the UI thread. | Buffer chunks and update UI less often. |
| Stream continues after leaving screen | Subscription is not cancelled. | Cancel the `StreamSubscription` in `dispose()`. |
| Final message is missing | App stores chunks but never commits the final accumulated response. | Persist the final buffer when the stream completes. |

## Minimal streaming example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final buffer = StringBuffer();

await for (final chunk in edgeVeda.generateStream(
  'Explain retrieval-augmented generation in one paragraph.',
)) {
  buffer.write(chunk.token);
  stdout.write(chunk.token);
}

final finalText = buffer.toString();
```

## Recommended UI pattern

Avoid rebuilding the full page for every token. Buffer small chunks and update the UI on a short interval.

```dart
final buffer = StringBuffer();
var lastUiUpdate = DateTime.now();

await for (final chunk in edgeVeda.generateStream(prompt)) {
  buffer.write(chunk.token);

  final now = DateTime.now();
  if (now.difference(lastUiUpdate).inMilliseconds > 80) {
    setState(() {
      visibleAssistantText = buffer.toString();
    });
    lastUiUpdate = now;
  }
}

setState(() {
  visibleAssistantText = buffer.toString();
});
```

## Cancellation

If the user leaves the screen, taps **Stop**, or starts a new conversation, cancel the current stream.

```dart
StreamSubscription? _subscription;

void startStreaming(String prompt) {
  final buffer = StringBuffer();

  _subscription = edgeVeda.generateStream(prompt).listen(
    (chunk) {
      buffer.write(chunk.token);
      setState(() => visibleAssistantText = buffer.toString());
    },
    onError: (error, stackTrace) {
      setState(() => errorMessage = error.toString());
    },
    onDone: () {
      setState(() => finalAssistantText = buffer.toString());
    },
  );
}

@override
void dispose() {
  _subscription?.cancel();
  super.dispose();
}
```

## Delayed first token

Delayed first token is usually caused by one of these:

| Cause | Fix |
| --- | --- |
| Cold model load | Initialize before the user sends the first prompt when product UX allows it. |
| Very long prompt | Trim context and summarize old chat turns. |
| High `contextLength` | Lower `contextLength` for chat flows that do not need long context. |
| Thermal or memory pressure | Check runtime policy and reduce concurrent workloads. |
| RAG injects too many chunks | Lower `topK` and shorten retrieved context. |

Track this metric separately from total generation time:

```dart
final start = DateTime.now();
var firstTokenSeen = false;

await for (final chunk in edgeVeda.generateStream(prompt)) {
  if (!firstTokenSeen) {
    firstTokenSeen = true;
    print('timeToFirstTokenMs=${DateTime.now().difference(start).inMilliseconds}');
  }
}
```

## Duplicate or corrupted output

Most duplicate-output bugs happen in UI state, not in the model.

Check:

- The stream is started only once per user action.
- A previous stream was cancelled before a new stream started.
- The UI appends only `chunk.token`, not the full accumulated text.
- The buffer is cleared before a new response.
- The final response is not appended again in `onDone`.
- Chat persistence stores either the accumulated final message or chunks, not both.

## Stream stops midway

Possible causes:

- The user cancelled the stream.
- App lifecycle paused the screen.
- Runtime policy degraded or stopped the workload.
- The model ran out of context.
- The device hit memory or thermal pressure.
- The prompt or grammar caused the model to produce an invalid stop condition.

Recovery pattern:

1. Save the partial buffer.
2. Show a resumable state to the user.
3. Allow retry with shorter context.
4. Log the stop reason if available.
5. Fall back to blocking `generate()` only for diagnosis, not as a permanent fix.

## Streaming with RAG

RAG can delay streaming because retrieval happens before generation.

Separate the phases in UI:

1. **Searching documents**
2. **Preparing context**
3. **Generating answer**
4. **Streaming answer**

Troubleshooting tips:

- Log retrieval time separately from generation time.
- Log the number of injected chunks.
- Lower `topK` if first token is consistently slow.
- Keep retrieved text concise and relevant.
- Do not stream until the prompt is fully assembled.

## Streaming with tool calling or structured output

Tool calling and strict structured output may not behave like plain token streaming.

| Mode | Expected behavior |
| --- | --- |
| Plain `generateStream()` | Tokens can be shown as they arrive. |
| Tool calling | Intermediate model output may be internal and should not always be shown. |
| Structured JSON | Streaming partial JSON can be invalid until completion. |
| Grammar-constrained output | Tokens may appear slower because the decoder is constrained. |

For JSON or tool flows, consider showing progress events instead of raw partial output.

## Diagnostics to collect

Attach:

- Edge Veda package version.
- `EdgeVedaConfig`, especially `contextLength` and `useGpu`.
- Prompt length and approximate context size.
- Whether RAG, tool calling, or structured output is enabled.
- `timeToFirstToken`.
- Total generation time.
- Tokens per second.
- Whether cancellation was triggered.
- Whether the same prompt works with `generate()`.
- Minimal reproduction with one prompt and one stream consumer.

## Related docs

- [Thermal throttling](./thermal-throttling.md)
- [Memory issues](./memory-issues.md)
- [RAG issues](./rag-issues.md)
- [Streaming generation](../guides/streaming-generation.md)
- [Chat sessions](../guides/chat-sessions.md)
- [Structured output](../guides/structured-output.md)
