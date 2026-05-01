---
title: "Performance metrics"
description: "Reference for measuring Edge Veda runtime performance: latency, throughput, memory, thermal state, battery drain, streaming, RAG, speech, vision, and image generation."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "README.md"
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/budget.dart"
  - "flutter/lib/src/latency_tracker.dart"
  - "flutter/lib/src/perf_trace.dart"
  - "BENCHMARKS.md"
---

# Performance metrics

This page defines the metrics that should be used when documenting, testing, and comparing Edge Veda workloads.

Edge Veda is designed for sustained on-device AI sessions, not only short benchmark bursts. Measure performance together with memory pressure, thermal state, battery drain, concurrent workers, and session duration.

## Metric categories

| Category | What it measures | Main source |
| --- | --- | --- |
| Generation latency | Time for one text generation call. | `GenerateResponse.latencyMs` |
| Token throughput | Generated tokens per second. | `GenerateResponse.tokensPerSecond` |
| Streaming cadence | Delay before and between streamed chunks. | app timer around `generateStream()` |
| Prompt/completion size | Prompt and generated token counts. | `promptTokens`, `completionTokens`, `totalTokens` |
| Memory usage | Current, peak, model, and context memory. | `MemoryStats` |
| Memory pressure | Whether memory is warning, high, or critical. | `MemoryPressureEvent`, `MemoryStats` |
| Thermal state | Device thermal condition during inference. | `TelemetrySnapshot`, `Scheduler` |
| Battery drain | Battery percentage consumed over time. | `BatteryDrainTracker`, `EdgeVedaBudget` |
| Download progress | Model download speed and remaining time. | `DownloadProgress` |
| Image generation time | Time to produce one image. | `ImageResult.generationTimeMs`, `ImageProgress` |
| Budget compliance | Whether runtime constraints are respected. | `Scheduler`, `BudgetViolation` |
| RAG latency | Embedding, retrieval, prompt build, and generation. | app trace or `PerfTrace` |
| STT latency | Time to transcribe audio chunks. | app trace around Whisper calls |

## Text generation metrics

`GenerateResponse` provides the main text generation metrics.

```dart
final response = await edgeVeda.generate(
  prompt,
  options: const GenerateOptions(maxTokens: 256),
);

print(response.latencyMs);
print(response.tokensPerSecond);
```

| Field | Meaning | Use it for |
| --- | --- | --- |
| `promptTokens` | Number of input tokens. | Context pressure. |
| `completionTokens` | Number of generated tokens. | Output length. |
| `totalTokens` | Prompt + completion tokens. | Total inference cost. |
| `latencyMs` | Total generation time. | User-facing wait time. |
| `tokensPerSecond` | Completion throughput. | Model/device speed comparison. |
| `avgConfidence` | Average confidence if enabled. | Handoff or fallback logic. |
| `needsCloudHandoff` | Whether confidence dropped below threshold. | Optional hybrid fallback UX. |

## Latency metrics

| Metric | Definition | Recommended use |
| --- | --- | --- |
| `first_token_latency_ms` | Time from request start to first streamed token. | Streaming chat UX. |
| `total_latency_ms` | Time from request start to final result. | Non-streaming generation. |
| `p50_latency_ms` | Median latency. | Typical user experience. |
| `p95_latency_ms` | 95th percentile latency. | Production SLOs and scheduler budgets. |
| `p99_latency_ms` | 99th percentile latency. | Tail latency and stress analysis. |
| `warm_start_latency_ms` | Latency when the model is already loaded. | Real chat sessions. |
| `cold_start_latency_ms` | Model load + first inference. | First interaction. |

Use `p95_latency_ms` for production decisions. Averages can hide thermal throttling and rare long stalls.

## Streaming metrics

For streaming, measure both responsiveness and total time.

```dart
final startedAt = DateTime.now();
DateTime? firstTokenAt;
var chunks = 0;

await for (final chunk in edgeVeda.generateStream(prompt)) {
  chunks += 1;
  firstTokenAt ??= DateTime.now();

  if (chunk.isFinal) {
    final totalMs = DateTime.now().difference(startedAt).inMilliseconds;
    final firstTokenMs = firstTokenAt!.difference(startedAt).inMilliseconds;

    print('First token: $firstTokenMs ms');
    print('Total: $totalMs ms');
    print('Chunks: $chunks');
  }
}
```

| Metric | Meaning |
| --- | --- |
| `time_to_first_token_ms` | Delay before UI starts showing output. |
| `inter_token_gap_ms` | Delay between chunks. |
| `stream_duration_ms` | Full stream duration. |
| `chunk_count` | Number of emitted `TokenChunk` events. |
| `cancel_latency_ms` | Delay between `CancelToken.cancel()` and stream stop. |

## Memory metrics

Use `getMemoryStats()` to inspect runtime memory behavior.

```dart
final stats = await edgeVeda.getMemoryStats();

print(stats.currentBytes);
print(stats.peakBytes);
print(stats.modelBytes);
print(stats.contextBytes);
print(stats.usagePercent);
```

| Metric | Definition |
| --- | --- |
| `current_bytes` | Current total memory usage. |
| `peak_bytes` | Highest observed memory usage. |
| `limit_bytes` | Configured memory limit. |
| `model_bytes` | Memory used by the loaded model. |
| `context_bytes` | Memory used by inference context and KV cache. |
| `usage_percent` | `currentBytes / limitBytes`. |
| `is_high_pressure` | `usagePercent > 0.8`. |
| `is_critical` | `usagePercent > 0.9`. |

## Thermal and battery metrics

`Scheduler` uses telemetry, budgets, and workload priorities to enforce runtime limits.

```dart
scheduler.setBudget(
  const EdgeVedaBudget(
    p95LatencyMs: 2000,
    batteryDrainPerTenMinutes: 3.0,
    maxThermalLevel: 2,
    memoryCeilingMb: 1536,
  ),
);

scheduler.registerWorkload(
  WorkloadId.text,
  priority: WorkloadPriority.high,
);

scheduler.start();
```

| Metric | Meaning |
| --- | --- |
| `thermal_state` | OS-reported thermal state. |
| `battery_level` | Current battery level. |
| `battery_drain_per_10_min` | Estimated battery drain rate. |
| `budget_violation_count` | Number of budget violations. |
| `qos_level` | Current quality level for a workload. |
| `degradation_count` | Number of scheduler degradation decisions. |
| `restoration_count` | Number of scheduler restoration decisions. |

## RAG metrics

Measure RAG as a full pipeline.

| Metric | Meaning |
| --- | --- |
| `embedding_latency_ms` | Time to embed the query. |
| `retrieval_latency_ms` | Time to search the vector index. |
| `top_k` | Number of requested chunks. |
| `min_score` | Minimum similarity threshold. |
| `retrieved_chunk_count` | Chunks inserted into the prompt. |
| `prompt_build_latency_ms` | Time to build the final prompt. |
| `generation_latency_ms` | LLM answer generation time. |
| `total_rag_latency_ms` | End-to-end RAG time. |

## Speech metrics

| Metric | Meaning |
| --- | --- |
| `audio_chunk_duration_ms` | Duration of one audio chunk. |
| `stt_chunk_latency_ms` | Time to transcribe one chunk. |
| `partial_transcript_latency_ms` | Time until first partial text appears. |
| `final_transcript_latency_ms` | Time until final transcription is available. |
| `voice_turn_latency_ms` | STT + LLM + TTS total turn time. |
| `tts_start_latency_ms` | Time from text input to audio start. |

## Image generation metrics

```dart
final result = await edgeVeda.generateImage(
  prompt: 'A small robot in a kitchen',
  config: const ImageGenerationConfig(
    width: 512,
    height: 512,
    steps: 4,
  ),
);

print(result.generationTimeMs);
```

| Metric | Meaning |
| --- | --- |
| `image_width` | Output width in pixels. |
| `image_height` | Output height in pixels. |
| `steps` | Diffusion steps. |
| `cfg_scale` | Guidance scale. |
| `sampler` | Diffusion sampler. |
| `schedule` | Noise schedule. |
| `generation_time_ms` | Total image generation time. |
| `progress_step` | Current denoising step. |

## Benchmark protocol

1. Use a real device, not a simulator.
2. Use `release` or `profile` mode.
3. Separate cold-start and warm-start numbers.
4. Record device, OS, model, quantization, context length, and GPU setting.
5. Use the same prompt and `GenerateOptions`.
6. Run at least 20 samples for `p95_latency_ms`.
7. Report peak memory, not only final memory.
8. Include thermal state, battery state, and scheduler events.
9. Note whether other workloads were active.
10. Do not compare numbers from different model files or quantization levels as equivalent.

## Reporting template

```text
Device: iPhone <model>
OS: iOS <version>
Build mode: release
Model: <model name>
Format: GGUF
Quantization: Q4_K_M
Context length: 2048
GPU: Metal enabled
Prompt tokens: <n>
Max tokens: <n>
Samples: 20

p50 latency: <n> ms
p95 latency: <n> ms
Tokens/sec: <n>
Peak RSS: <n> MB
Thermal start/end: <n>/<n>
Battery drain: <n>% / 10 min
Scheduler events: <n>
```

## Related docs

- [Configuration options](./configuration-options.md)
- [Storage and memory](./storage-and-memory.md)
- [Supported models](./supported-models.md)
- [Quantization levels](./quantization-levels.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Telemetry and tracing](../guides/telemetry-and-tracing.md)
