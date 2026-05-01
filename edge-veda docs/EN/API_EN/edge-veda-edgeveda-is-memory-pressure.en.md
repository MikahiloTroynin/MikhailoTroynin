---
title: "EdgeVeda.isMemoryPressure()"
description: "API reference page for the isMemoryPressure() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.isMemoryPressure()`

> Checks whether current Edge Veda memory usage is above a configurable threshold.

Use `isMemoryPressure()` for a quick boolean decision when you do not need the full `MemoryStats` object.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `isMemoryPressure()` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — uses `getMemoryStats()` |
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

`isMemoryPressure()` calls `getMemoryStats()`, checks whether a memory limit is configured, and returns `true` when `stats.usagePercent` is greater than the supplied `threshold`. If the memory limit is zero, the method returns `false`.

## When to use it

Use `isMemoryPressure()` when you need to:

- gate optional workloads when memory pressure is high;
- choose between full/reduced/minimal QoS paths;
- show a simple warning in diagnostics or developer UI;
- avoid reading and interpreting full `MemoryStats` when only a boolean is needed.

Do not use this method when:

- you need detailed memory breakdown; use `getMemoryStats()`;
- you need OS-level thermal/battery policy; use `TelemetryService`/`Scheduler`;
- the runtime has not been initialized; initialize first.

## Prerequisites

Before calling this method, make sure that:

- `getMemoryStats()` can be called successfully;
- the `threshold` is in the expected 0.0–1.0 range;
- the app has a plan for what to do when the method returns `true`.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `threshold` | `double` | No | `0.8` | Memory usage percentage above which pressure is considered active. | Use a 0.0–1.0 ratio; default means 80%. |

## Returns

`Future<bool>` — `true` when memory usage is above the threshold; `false` otherwise or when no memory limit is set.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `bool` | `true` indicates active pressure above threshold; `false` indicates no pressure or no configured limit. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `InitializationException` / `EdgeVedaException` | Propagated from `getMemoryStats()` if runtime is not initialized or stats fail. | Initialize first and handle runtime errors. |
| Invalid threshold behavior | The method does not document clamping behavior. | Validate threshold values in the app UI or wrapper. |

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

Not applicable. `isMemoryPressure()` returns one boolean value.

## Behavior notes

- The method delegates to `getMemoryStats()`.
- If `stats.limitBytes == 0`, the method returns `false`.
- The comparison uses `stats.usagePercent > threshold`, not `>=`.
- Default threshold is `0.8`, equivalent to 80% usage.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Polling cost | Calls memory stats under the hood. | Use interval-based checks, not per-frame checks. |
| Threshold choice | Lower thresholds trigger earlier degradation. | Use 0.7–0.8 for proactive mobile behavior. |
| No active worker | Likely returns `false` via zero stats. | Treat as no active Edge Veda memory pressure. |
| QoS integration | Boolean signal is simple but limited. | Use `Scheduler` for full budget enforcement. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Works through memory stats for active text worker. |
| Embedding model | Partial | Depends on active runtime/worker memory path. |
| VLM | Indirect | Use vision runtime policy for vision-specific QoS. |
| Stable Diffusion model | Indirect | Use scheduler/image-generation lifecycle for image workloads. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: pressure state is operational telemetry only, but logs may reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Always returns `false` | No memory limit configured or no active worker. | Check `getMemoryStats()` for detailed fields. |
| Triggers too early | Threshold too low for workload. | Raise threshold after device testing. |
| Triggers too late | Threshold too high or memory spikes quickly. | Lower threshold and add proactive cleanup. |
| Call fails | Core runtime not initialized. | Call `init()` first. |

## Related APIs

- `EdgeVeda.getMemoryStats()` — detailed memory breakdown.
- `MemoryStats.usagePercent` — ratio compared against threshold.
- `Scheduler` — budget-aware workload enforcement.
- `RuntimePolicy` — QoS policy for thermal, battery, and memory pressure.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.isMemoryPressure()`
- Related return type: `MemoryStats`

## Documentation review checklist

Before publishing, verify that:

- The default threshold is still `0.8`.
- The comparison operator remains `>` and not `>=`.
- No-limit behavior still returns `false`.
- The example compiles and matches intended app behavior.
