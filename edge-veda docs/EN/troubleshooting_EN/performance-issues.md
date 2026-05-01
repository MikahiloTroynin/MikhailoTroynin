---
title: "Performance issues"
description: "Troubleshoot latency, throughput, time-to-first-token, streaming speed, worker contention, tracing, and long-session performance in Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Performance issues

Use this page when an Edge Veda app runs correctly but feels slow, has delayed first responses, streams tokens unevenly, performs well in short tests but slows down in real sessions, or shows performance regressions after changing model, device, runtime settings, or workload mix.

Performance troubleshooting is different from build or model loading troubleshooting. The app may be technically working, but the user experience is degraded.

## What to measure first

Do not optimize before measuring. Capture the same metrics for every test run.

| Metric | What it means | Why it matters |
| --- | --- | --- |
| `timeToFirstToken` | Time from request start to first streamed token. | Main perceived latency for chat. |
| Tokens per second | Average generation throughput. | Main throughput metric for text generation. |
| p95 latency | Slow-path latency across many requests. | More useful than average for real users. |
| Model load time | Time spent before the runtime is ready. | Affects first use and cold start. |
| Memory before/after load | Memory pressure created by model and cache. | Explains crashes and slowdowns. |
| Retrieval time | RAG search and prompt assembly time. | Explains delayed streaming in RAG flows. |
| STT chunk latency | Time to transcribe one audio chunk. | Explains voice pipeline lag. |
| Image step time | Time per diffusion step. | Explains image generation duration. |
| Thermal state over time | Whether device state changes during sustained work. | Explains performance collapse after minutes. |

## Quick diagnosis

Start with a controlled baseline:

1. Use a physical iPhone, not only the iOS Simulator.
2. Use a known small model, for example a 1B-class chat model.
3. Use a short prompt.
4. Disable RAG, STT, TTS, vision, and image generation.
5. Run one blocking `generate()` call.
6. Run one `generateStream()` call.
7. Repeat ten times and compare first run vs later runs.

If the baseline is slow, focus on model/device/runtime settings.  
If the baseline is fast but the product flow is slow, focus on prompt size, RAG, UI updates, concurrency, or scheduler policy.

## Minimal performance logger

```dart
Future<void> measureStream(EdgeVeda edgeVeda, String prompt) async {
  final startedAt = DateTime.now();
  var firstTokenAt: DateTime? = null;
  var tokenCount = 0;
  final buffer = StringBuffer();

  await for (final chunk in edgeVeda.generateStream(prompt)) {
    firstTokenAt ??= DateTime.now();
    tokenCount += 1;
    buffer.write(chunk.token);
  }

  final completedAt = DateTime.now();
  final totalMs = completedAt.difference(startedAt).inMilliseconds;
  final ttftMs = firstTokenAt == null
      ? null
      : firstTokenAt!.difference(startedAt).inMilliseconds;
  final tokensPerSecond = totalMs == 0 ? 0 : tokenCount / (totalMs / 1000);

  print({
    'timeToFirstTokenMs': ttftMs,
    'totalMs': totalMs,
    'tokens': tokenCount,
    'tokensPerSecond': tokensPerSecond.toStringAsFixed(2),
    'outputChars': buffer.length,
  });
}
```

Use the same prompt and model when comparing devices or configuration changes.

## Common symptoms

| Symptom | Likely cause | First action |
| --- | --- | --- |
| First response is slow | Cold model load, large prompt, RAG retrieval, high `contextLength`. | Separate load time, retrieval time, and generation time. |
| Streaming starts fast but slows down | Thermal throttling, memory pressure, or long context. | Track tokens/sec over time and reduce workload. |
| UI freezes while tokens stream | UI rebuilds too often or heavy work runs on UI thread. | Buffer chunks and update UI less often. |
| RAG answers are slow | Retrieval, embedding, or too many injected chunks. | Log each RAG stage separately. |
| STT feels delayed | Audio chunks queue up or Whisper model is too heavy. | Measure per-chunk latency and drop stale chunks. |
| TTS starts late | LLM waits for full response or TTS queue is blocked. | Stream partial answer or start TTS after sentence boundaries. |
| Image generation takes too long | Model, resolution, sampler, or step count is too heavy. | Lower resolution/steps or run image generation alone. |
| Performance degrades after several minutes | Thermal, battery, or memory policy changed runtime behavior. | Check scheduler and runtime policy events. |
| New model is slower than expected | Model size, quantization, context length, or chat template changed. | Compare with a known-good baseline model. |

## Separate cold start from steady state

Cold start includes setup work that should not be counted as normal generation speed.

Measure separately:

```text
app launch
→ model path resolution
→ model load
→ first prompt assembly
→ first token
→ complete response
```

Recommended reporting:

| Measurement | Include model load? | Use for |
| --- | --- | --- |
| Cold start time | Yes | First-use UX and onboarding. |
| Warm `timeToFirstToken` | No | Normal chat UX. |
| Warm tokens/sec | No | Runtime throughput comparison. |
| Long-session throughput | No | Sustainability and scheduler tuning. |

## `timeToFirstToken` is high

Common causes:

| Cause | Fix |
| --- | --- |
| Model loads on first user request. | Preload after user intent is clear, or show a clear **Preparing model** state. |
| Prompt is too long. | Trim old chat turns and summarize history. |
| `contextLength` is too high. | Use the smallest context window that supports the product flow. |
| RAG retrieval runs before generation. | Show **Searching documents** and measure retrieval separately. |
| Structured output or grammar constraints are active. | Compare against plain generation to isolate constraint overhead. |
| Device is already hot or low on battery. | Let runtime policy degrade gracefully and reduce parallel work. |

## Tokens per second is low

Check in this order:

1. Confirm the model and quantization are appropriate for the device.
2. Confirm `useGpu` is enabled when Metal GPU is expected.
3. Compare with a short prompt and no RAG.
4. Reduce `contextLength`.
5. Reduce concurrent workloads.
6. Check whether thermal state changes during the test.
7. Compare blocking `generate()` with `generateStream()` to isolate UI overhead.
8. Test on a higher-tier device to confirm whether the device is the bottleneck.

## UI performance issues

The model can be fast while the UI feels slow.

Common UI anti-patterns:

- Rebuilding the full chat page on every token.
- Running markdown rendering for the whole conversation on every chunk.
- Updating persistent storage for every token.
- Running syntax highlighting on partial output.
- Keeping large images, PDFs, audio buffers, or documents in widget state.
- Starting a new stream before the previous one is cancelled.

Recommended pattern:

```dart
final buffer = StringBuffer();
var lastUiUpdate = DateTime.now();

await for (final chunk in edgeVeda.generateStream(prompt)) {
  buffer.write(chunk.token);

  final now = DateTime.now();
  if (now.difference(lastUiUpdate).inMilliseconds > 80) {
    setState(() => visibleText = buffer.toString());
    lastUiUpdate = now;
  }
}

setState(() => visibleText = buffer.toString());
```

## Scheduler and worker contention

Edge Veda can arbitrate workloads such as text, vision, STT, image generation, and RAG. Performance drops when too many heavy workers compete at the same time.

| Workload mix | Risk | Safer pattern |
| --- | --- | --- |
| LLM + RAG indexing | Embedder and generator compete for memory/compute. | Index first, then generate. |
| LLM streaming + STT | Audio queue and token generation compete. | Prioritize active user speech or pause generation. |
| LLM streaming + TTS | TTS may wait for stable sentence boundaries. | Stream text, speak sentence-by-sentence. |
| Vision + chat | Frame queue can grow without backpressure. | Drop stale frames and keep only latest useful frame. |
| Image generation + chat | Image worker can dominate memory and GPU. | Run image generation alone on lower-memory devices. |

## RAG performance issues

RAG latency should be split into stages.

```text
document parsing
→ chunking
→ embedding
→ vector index search
→ context injection
→ generation
→ streaming
```

Fixes:

- Pre-index documents before the chat begins.
- Persist `VectorIndex` to disk.
- Keep the active index compact.
- Lower `topK`.
- Shorten retrieved chunks.
- Avoid embedding new documents while generation is active.
- Log final prompt length after context injection.
- Rebuild the index if embedding model or dimensions changed.

## STT/TTS performance issues

### STT

STT performance depends on audio chunking, model size, and concurrent workload.

Fixes:

- Use short but meaningful audio chunks.
- Avoid unbounded audio queues.
- Drop stale chunks when transcription falls behind.
- Release audio buffers after each transcription.
- Use smaller Whisper models on lower-tier devices.
- Pause RAG indexing or image generation while STT is active.

### TTS

TTS may feel slow if it waits for the full LLM answer.

Fixes:

- Start TTS after complete sentence boundaries.
- Keep one active TTS request at a time.
- Avoid repeatedly calling `stop()` and `speak()` for tiny fragments.
- Use voice fallback when the selected voice is unavailable.
- Keep displayed text and spoken text synchronized.

## Image generation performance issues

Image generation is expensive and should be measured separately from chat.

Check:

- Model size.
- Resolution.
- Step count.
- Sampler.
- Scheduler.
- CFG scale.
- Whether another worker is active.
- Whether idle auto-disposal is unloading and reloading the model between requests.

Fixes:

- Generate one image at a time.
- Lower resolution or steps if product quality allows it.
- Keep the image worker warm only when the user is actively generating images.
- Dispose or allow auto-disposal when leaving the image workflow.
- Show progress callbacks instead of a static spinner.

## Long-session performance degradation

Short benchmarks are not enough for Edge Veda apps. Measure behavior over time.

Recommended long-session test:

| Phase | Duration | What to record |
| --- | --- | --- |
| Warm-up | 1–2 minutes | Model load, first generation, initial memory. |
| Sustained chat | 10 minutes | `timeToFirstToken`, tokens/sec, memory, thermal behavior. |
| Mixed workload | 10 minutes | RAG, STT, TTS, or vision contention. |
| Recovery | 2–5 minutes | Whether throughput returns after workload decreases. |

If performance recovers after idle time, the issue is likely thermal or scheduler policy.  
If performance does not recover, check memory growth, retained buffers, or duplicate runtime instances.

## Regression after a code or model change

Create a small benchmark that runs in CI or on a dedicated device before release.

Track:

- Edge Veda version.
- Flutter version.
- Device model and iOS version.
- Model name and quantization.
- `EdgeVedaConfig`.
- Prompt length.
- `timeToFirstToken`.
- Tokens/sec.
- Memory before/after.
- Runtime policy events.

If a regression appears, bisect in this order:

1. Model file changed.
2. Quantization changed.
3. `contextLength` changed.
4. Prompt template changed.
5. RAG `topK` or chunk size changed.
6. UI rendering changed.
7. Worker concurrency changed.
8. Edge Veda package version changed.

## Production recommendations

- Define performance budgets per feature.
- Use p95, not only average latency.
- Record metrics separately for cold and warm paths.
- Show progress states for long-running work.
- Add cancellation for streaming and image generation.
- Keep runtime diagnostics available in debug builds.
- Avoid starting all workers at app launch.
- Use `ModelAdvisor` to select model/config per device tier.
- Prefer graceful degradation over hard failure.
- Keep a known-good benchmark model for comparison.

## Diagnostics to collect

Attach:

- Edge Veda package version.
- Flutter and Xcode versions.
- Device model and iOS version.
- Model name, format, quantization, and file size.
- `EdgeVedaConfig`, especially `contextLength`, `useGpu`, and memory-related settings.
- Feature path: text, streaming, RAG, STT, TTS, vision, image generation.
- Prompt length and final prompt length after RAG injection.
- `timeToFirstToken`, tokens/sec, total time.
- Memory stats before load, after load, during generation, and after completion.
- Runtime policy and scheduler events if available.
- Whether the issue reproduces with a small known-good model.
- Minimal reproduction with one prompt or one workload path.

## Related docs

- [Thermal throttling](./thermal-throttling.md)
- [Memory issues](./memory-issues.md)
- [Streaming issues](./streaming-issues.md)
- [STT/TTS issues](./stt-tts-issues.md)
- [RAG issues](./rag-issues.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Scheduler and budgets](../guides/scheduler-and-budgets.md)
- [Telemetry and tracing](../guides/telemetry-and-tracing.md)
- [Storage and memory](../reference/storage-and-memory.md)
