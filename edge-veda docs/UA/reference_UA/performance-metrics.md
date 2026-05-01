---
title: "Метрики продуктивності"
description: "Reference для вимірювання Edge Veda runtime performance: latency, throughput, memory, thermal state, battery drain, streaming, RAG, speech, vision і image generation."
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

# Метрики продуктивності

Ця сторінка визначає metrics, які потрібно використовувати для documentation, testing і comparison Edge Veda workloads.

Edge Veda створено для тривалих on-device AI sessions, а не лише для коротких benchmark bursts. Тому performance треба вимірювати разом із memory pressure, thermal state, battery drain, concurrent workers і session duration.

## Категорії metrics

| Category | Що вимірює | Main source |
| --- | --- | --- |
| Generation latency | Час одного text generation call. | `GenerateResponse.latencyMs` |
| Token throughput | Generated tokens per second. | `GenerateResponse.tokensPerSecond` |
| Streaming cadence | Delay до першого chunk і між chunks. | app timer навколо `generateStream()` |
| Prompt/completion size | Prompt і generated token counts. | `promptTokens`, `completionTokens`, `totalTokens` |
| Memory usage | Current, peak, model і context memory. | `MemoryStats` |
| Memory pressure | Чи memory на warning, high або critical level. | `MemoryPressureEvent`, `MemoryStats` |
| Thermal state | Thermal condition device під час inference. | `TelemetrySnapshot`, `Scheduler` |
| Battery drain | Battery percentage за time window. | `BatteryDrainTracker`, `EdgeVedaBudget` |
| Download progress | Model download speed і remaining time. | `DownloadProgress` |
| Image generation time | Час для одного image output. | `ImageResult.generationTimeMs`, `ImageProgress` |
| Budget compliance | Чи runtime constraints виконуються. | `Scheduler`, `BudgetViolation` |
| RAG latency | Embedding, retrieval, prompt build і generation. | app trace або `PerfTrace` |
| STT latency | Час transcription audio chunks. | app trace навколо Whisper calls |

## Text generation metrics

`GenerateResponse` повертає основні text generation metrics.

```dart
final response = await edgeVeda.generate(
  prompt,
  options: const GenerateOptions(maxTokens: 256),
);

print(response.latencyMs);
print(response.tokensPerSecond);
```

| Field | Meaning | Для чого |
| --- | --- | --- |
| `promptTokens` | Number of input tokens. | Context pressure. |
| `completionTokens` | Number of generated tokens. | Output length. |
| `totalTokens` | Prompt + completion tokens. | Total inference cost. |
| `latencyMs` | Total generation time. | User-facing wait time. |
| `tokensPerSecond` | Completion throughput. | Model/device speed comparison. |
| `avgConfidence` | Average confidence, якщо enabled. | Handoff або fallback logic. |
| `needsCloudHandoff` | Чи confidence нижче threshold. | Optional hybrid fallback UX. |

## Latency metrics

| Metric | Definition | Recommended use |
| --- | --- | --- |
| `first_token_latency_ms` | Time від request start до first streamed token. | Streaming chat UX. |
| `total_latency_ms` | Time від request start до final result. | Non-streaming generation. |
| `p50_latency_ms` | Median latency. | Typical user experience. |
| `p95_latency_ms` | 95th percentile latency. | Production SLOs і scheduler budgets. |
| `p99_latency_ms` | 99th percentile latency. | Tail latency і stress analysis. |
| `warm_start_latency_ms` | Latency, коли model already loaded. | Real chat sessions. |
| `cold_start_latency_ms` | Model load + first inference. | First interaction. |

Для production decisions використовуйте `p95_latency_ms`. Averages можуть приховати thermal throttling і рідкі довгі stalls.

## Streaming metrics

Для streaming вимірюйте і responsiveness, і total time.

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
| `inter_token_gap_ms` | Delay між chunks. |
| `stream_duration_ms` | Full stream duration. |
| `chunk_count` | Number of emitted `TokenChunk` events. |
| `cancel_latency_ms` | Delay між `CancelToken.cancel()` і stream stop. |

## Memory metrics

Використовуйте `getMemoryStats()` для runtime memory behavior.

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
| `model_bytes` | Memory used by loaded model. |
| `context_bytes` | Memory used by inference context і KV cache. |
| `usage_percent` | `currentBytes / limitBytes`. |
| `is_high_pressure` | `usagePercent > 0.8`. |
| `is_critical` | `usagePercent > 0.9`. |

## Thermal і battery metrics

`Scheduler` використовує telemetry, budgets і workload priorities для enforcing runtime limits.

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
| `qos_level` | Current quality level для workload. |
| `degradation_count` | Number of scheduler degradation decisions. |
| `restoration_count` | Number of scheduler restoration decisions. |

## RAG metrics

Вимірюйте RAG як full pipeline.

| Metric | Meaning |
| --- | --- |
| `embedding_latency_ms` | Time to embed query. |
| `retrieval_latency_ms` | Time to search vector index. |
| `top_k` | Number of requested chunks. |
| `min_score` | Minimum similarity threshold. |
| `retrieved_chunk_count` | Chunks inserted into prompt. |
| `prompt_build_latency_ms` | Time to build final prompt. |
| `generation_latency_ms` | LLM answer generation time. |
| `total_rag_latency_ms` | End-to-end RAG time. |

## Speech metrics

| Metric | Meaning |
| --- | --- |
| `audio_chunk_duration_ms` | Duration одного audio chunk. |
| `stt_chunk_latency_ms` | Time to transcribe one chunk. |
| `partial_transcript_latency_ms` | Time until first partial text. |
| `final_transcript_latency_ms` | Time until final transcription. |
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

1. Використовуйте real device, не simulator.
2. Використовуйте `release` або `profile` mode.
3. Розділяйте cold-start і warm-start numbers.
4. Записуйте device, OS, model, quantization, context length і GPU setting.
5. Використовуйте однаковий prompt і `GenerateOptions`.
6. Виконуйте мінімум 20 samples для `p95_latency_ms`.
7. Звітуйте peak memory, не лише final memory.
8. Додавайте thermal state, battery state і scheduler events.
9. Позначайте, чи були active other workloads.
10. Не порівнюйте numbers з різних model files або quantization levels як equivalent.

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

## Пов'язані docs

- [Configuration options](./configuration-options.md)
- [Storage and memory](./storage-and-memory.md)
- [Supported models](./supported-models.md)
- [Quantization levels](./quantization-levels.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Telemetry and tracing](../guides/telemetry-and-tracing.md)
