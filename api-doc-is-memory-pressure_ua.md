---
title: "EdgeVeda.isMemoryPressure()"
description: "Сторінка API reference для методу isMemoryPressure() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.isMemoryPressure()`

> Перевіряє, чи current Edge Veda memory usage перевищує configurable threshold.

Використовуйте `isMemoryPressure()` для швидкого boolean decision, коли full `MemoryStats` object не потрібен.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `isMemoryPressure()` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — використовує `getMemoryStats()` |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<bool> isMemoryPressure({double threshold = 0.8});
```

## What it does

`isMemoryPressure()` викликає `getMemoryStats()`, перевіряє, чи memory limit configured, і повертає `true`, коли `stats.usagePercent` більше за `threshold`. Якщо memory limit дорівнює zero, метод повертає `false`.

## When to use it

Використовуйте `isMemoryPressure()` коли потрібно:

- gate optional workloads, коли memory pressure high;
- вибирати між full/reduced/minimal QoS paths;
- показувати simple warning у diagnostics/developer UI;
- не читати full `MemoryStats`, якщо потрібен тільки boolean.

Не використовуйте цей метод, коли:

- потрібен detailed memory breakdown; використовуйте `getMemoryStats()`;
- потрібна OS-level thermal/battery policy; use `TelemetryService`/`Scheduler`;
- runtime not initialized; initialize first.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `getMemoryStats()` can be called successfully;
- `threshold` у expected 0.0–1.0 range;
- app має plan, що робити, коли метод повертає `true`.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `threshold` | `double` | No | `0.8` | Memory usage percentage, вище якого pressure considered active. | Використовуйте 0.0–1.0 ratio; default означає 80%. |

## Returns

`Future<bool>` — `true`, якщо memory usage above threshold; `false` otherwise або коли memory limit не set.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `bool` | `true` означає active pressure above threshold; `false` — no pressure або no configured limit. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `InitializationException` / `EdgeVedaException` | Propagated from `getMemoryStats()`, якщо runtime not initialized або stats fail. | Initialize first and handle runtime errors. |
| Invalid threshold behavior | Method не документує clamping behavior. | Validate threshold values в app UI або wrapper. |

## Minimal example

```dart
if (await edgeVeda.isMemoryPressure()) {
  print('Warning: high Edge Veda memory usage.');
}
```

## Production-style example

```dart
Future<void> maybeReduceQuality(EdgeVeda edgeVeda) async {
  final pressure = await edgeVeda.isMemoryPressure(threshold: 0.75);

  if (pressure) {
    debugPrint('Memory pressure detected. Reducing optional workloads.');
    // Example actions:
    // - reduce maxTokens
    // - pause camera/vision work
    // - unload optional models
  }
}
```

## Streaming example

Не застосовується. `isMemoryPressure()` повертає одне boolean value.

## Behavior notes

- Метод delegates to `getMemoryStats()`.
- Якщо `stats.limitBytes == 0`, метод повертає `false`.
- Comparison uses `stats.usagePercent > threshold`, not `>=`.
- Default threshold `0.8`, тобто 80% usage.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Polling cost | Calls memory stats under the hood. | Use interval-based checks, not per-frame checks. |
| Threshold choice | Lower thresholds trigger earlier degradation. | Use 0.7–0.8 для proactive mobile behavior. |
| No active worker | Likely returns `false` через zero stats. | Treat as no active Edge Veda memory pressure. |
| QoS integration | Boolean signal simple but limited. | Use `Scheduler` для full budget enforcement. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Works through memory stats для active text worker. |
| Embedding model | Partial | Depends on active runtime/worker memory path. |
| VLM | Indirect | Use vision runtime policy для vision-specific QoS. |
| Stable Diffusion model | Indirect | Use scheduler/image-generation lifecycle для image workloads. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: pressure state is operational telemetry, але logs можуть reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Always returns `false` | No memory limit configured або no active worker. | Check `getMemoryStats()` for detailed fields. |
| Triggers too early | Threshold too low для workload. | Raise threshold після device testing. |
| Triggers too late | Threshold too high або memory spikes quickly. | Lower threshold and add proactive cleanup. |
| Call fails | Core runtime not initialized. | Call `init()` first. |

## Related APIs

- `EdgeVeda.getMemoryStats()` — detailed memory breakdown.
- `MemoryStats.usagePercent` — ratio compared against threshold.
- `Scheduler` — budget-aware workload enforcement.
- `RuntimePolicy` — QoS policy для thermal, battery, memory pressure.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.isMemoryPressure()`
- Related return type: `MemoryStats`

## Documentation review checklist

Перед публікацією перевірте:

- Default threshold still `0.8`.
- Comparison operator remains `>` not `>=`.
- No-limit behavior still returns `false`.
- Example compiles and matches intended app behavior.
