---
title: "Thermal throttling"
description: "Troubleshoot thermal slowdown, degraded throughput, scheduler policy changes, and long-session instability in Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Thermal throttling

Use this page when an Edge Veda app starts fast but slows down during sustained inference, streaming becomes inconsistent after several minutes, STT latency grows over time, vision throughput drops, or image generation causes the device to heat up quickly.

Thermal throttling is not a normal Dart exception. It is a device-level response to sustained compute load. On-device AI can trigger it because LLM inference, STT, vision, image generation, embeddings, and RAG all compete for CPU, GPU, memory bandwidth, and battery.

## Common symptoms

| Symptom | Likely cause | First action |
| --- | --- | --- |
| Tokens start fast, then slow down | Device thermal state changed under sustained LLM load. | Reduce workload and inspect runtime policy events. |
| STT chunks take longer over time | Continuous audio transcription is heating the device. | Increase pause windows or reduce parallel work. |
| Image generation starts but later fails or stalls | Diffusion workload is too heavy for the current device state. | Generate one image at a time and avoid concurrent workers. |
| Vision FPS drops | The camera/vision loop is not applying backpressure. | Drop frames instead of queueing all frames. |
| App remains alive but throughput degrades | Scheduler is degrading workload instead of crashing. | Check whether runtime policy reduced priority or evicted workers. |
| iOS kills the app | Thermal pressure combined with memory pressure. | Use Xcode device logs and lower model/context size. |

## Quick stabilization checklist

1. Test on a physical iPhone, not only the iOS Simulator.
2. Stop all nonessential workers.
3. Reduce `contextLength`.
4. Use a smaller model or lower memory quantization.
5. Run one heavy modality at a time: text, STT, vision, image generation, or RAG.
6. Add backpressure for streaming and vision loops.
7. Use `Scheduler` or runtime policy instead of starting workloads directly from every UI event.
8. Record device model, iOS version, session duration, and workload mix.

## Identify thermal degradation

Thermal issues are usually time-based. A one-shot test may pass, while a real session fails after several minutes.

Use a test matrix:

| Test | Purpose |
| --- | --- |
| 1 prompt, short input | Confirms basic model load and generation. |
| 10 prompts, short input | Detects accumulation or context growth. |
| 5-minute stream | Detects sustained text generation slowdown. |
| 10-minute STT session | Detects continuous microphone + Whisper load. |
| RAG + generation | Checks two-model pipeline pressure. |
| Image generation alone | Measures worst-case thermal load. |
| Mixed workload | Confirms scheduler behavior under real product usage. |

## Recommended logging

Log enough to see whether the runtime is degrading intentionally.

```dart
final stats = edgeVeda.getMemoryStats();
print('memory: $stats');

final start = DateTime.now();
var tokenCount = 0;

await for (final chunk in edgeVeda.generateStream(prompt)) {
  tokenCount += 1;
  final elapsed = DateTime.now().difference(start).inMilliseconds;
  if (elapsed > 0 && tokenCount % 20 == 0) {
    final tokPerSec = tokenCount / (elapsed / 1000);
    print('tokens=$tokenCount tok/s=${tokPerSec.toStringAsFixed(2)}');
  }
}
```

When available, also log scheduler decisions, worker eviction, and policy state changes.

## Workload-specific fixes

### Text generation

| Cause | Fix |
| --- | --- |
| `contextLength` is too high. | Reduce `contextLength` to the smallest value that supports the task. |
| Chat history keeps growing. | Summarize old turns and keep only recent context active. |
| Multiple generation requests overlap. | Serialize requests or route them through the scheduler. |
| The selected model is too large. | Use `ModelAdvisor.recommend()` and select a smaller model. |

### Streaming

Streaming can hide thermal degradation because the app still receives tokens, only more slowly.

Fixes:

- Track `timeToFirstToken`.
- Track moving average tokens per second.
- Cancel or pause long-running streams when the user leaves the screen.
- Avoid expensive UI rebuilds for every token.
- Buffer small chunks before updating the UI.

### Speech-to-text

STT can run continuously and heat the device even when the UI looks idle.

Fixes:

- Process audio in short chunks.
- Add silence detection where the product allows it.
- Avoid running STT, LLM, TTS, and RAG at full priority at the same time.
- Release audio buffers after each transcription step.
- Test both quiet and noisy environments.

### Image generation

Image generation is one of the heaviest workloads.

Fixes:

- Generate one image at a time.
- Lower resolution or step count if supported by the selected pipeline.
- Dispose the image worker after use or rely on idle auto-disposal.
- Do not run image generation while a large LLM stream is active on lower-memory devices.

### RAG

RAG can combine embedder, vector index, retriever, and generator in one user action.

Fixes:

- Keep the active vector index compact.
- Limit `topK`.
- Avoid embedding large document batches during generation.
- Pre-index documents before starting a chat session.
- Inject only the chunks needed for the current question.

## UX recommendations

Thermal throttling should not look like a broken app.

Use clear states:

- **Preparing model** — model is loading.
- **Running locally** — inference is active on device.
- **Optimizing performance** — runtime policy reduced workload.
- **Cooling down** — the app is temporarily reducing generation speed.
- **Try a smaller model** — current device cannot sustain the selected workload.

Avoid messages such as `Error` or `Failed` when the system is intentionally degrading to keep the session alive.

## What not to do

- Do not start every AI worker during app launch.
- Do not run continuous STT and image generation at the same time by default.
- Do not rebuild a full chat screen on every token.
- Do not keep large image, audio, and document buffers in memory after use.
- Do not treat simulator performance as device performance.
- Do not hide thermal degradation from logs.

## Diagnostics to collect

Attach:

- Device model and iOS version.
- Edge Veda package version.
- Model name, format, quantization, and size.
- `EdgeVedaConfig`, especially `contextLength` and `useGpu`.
- Workload mix: text, STT, TTS, vision, image generation, RAG.
- Session duration before slowdown.
- `timeToFirstToken` and tokens per second over time.
- Memory stats before load, during generation, and after completion.
- Xcode device logs if the app is killed.
- Whether reducing the model size or disabling another worker fixes the issue.

## Related docs

- [Memory issues](./memory-issues.md)
- [Streaming issues](./streaming-issues.md)
- [STT/TTS issues](./stt-tts-issues.md)
- [RAG issues](./rag-issues.md)
- [Runtime policy](../guides/runtime-policy.md)
- [Scheduler and budgets](../guides/scheduler-and-budgets.md)
- [Performance tuning](../guides/performance-tuning.md)
