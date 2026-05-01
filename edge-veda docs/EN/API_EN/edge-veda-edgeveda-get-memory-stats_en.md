---
title: "EdgeVeda.getMemoryStats()"
description: "API reference page for the getMemoryStats() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.getMemoryStats()`

> Reads current native memory statistics for the active Edge Veda runtime context.

Use `getMemoryStats()` to observe memory use after model initialization or generation. The method is designed to avoid loading a second model just to collect stats.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `getMemoryStats()` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — core `init()` must have completed |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<MemoryStats> getMemoryStats();
```

## What it does

`getMemoryStats()` ensures the core runtime is initialized, then routes the query through the active `StreamingWorker` if one is available. If no worker is active, it returns zero-valued usage stats with the configured memory limit instead of loading a new native model context.

## When to use it

Use `getMemoryStats()` when you need to:

- display current and peak memory in a debug or diagnostics panel;
- make runtime decisions when memory use is high;
- feed memory data into app-level quality or unloading logic;
- inspect whether an active streaming worker is consuming memory.

Do not use this method when:

- you need only a boolean pressure check; use `isMemoryPressure()`;
- the core `EdgeVeda` runtime has not been initialized;
- you need OS-wide telemetry beyond Edge Veda context; use `TelemetryService` where appropriate.

## Prerequisites

Before calling this method, make sure that:

- `await edgeVeda.init(config)` has completed successfully;
- the app can handle zero-valued stats when no worker is active;
- developers understand that values represent Edge Veda/native context stats, not full app memory telemetry.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

`Future<MemoryStats>` — current memory breakdown for the active worker, or zero-valued usage stats when no worker is active.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `currentBytes` | `int` | Current total memory usage in bytes. |
| `peakBytes` | `int` | Peak memory usage in bytes. |
| `limitBytes` | `int` | Configured memory limit in bytes. |
| `modelBytes` | `int` | Memory used by the loaded model. |
| `contextBytes` | `int` | Memory used by inference context. |
| `usagePercent` | `double` | Memory usage ratio from 0.0 to 1.0. |
| `isHighPressure` | `bool` | Convenience flag for >80% usage. |
| `isCritical` | `bool` | Convenience flag for >90% usage. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `InitializationException` / `EdgeVedaException` | The core runtime is not initialized or `_ensureInitialized()` fails. | Call `init()` before checking memory stats. |
| Worker/runtime error | Active worker cannot provide stats. | Retry after generation finishes or reinitialize the runtime if needed. |

## Minimal example

```dart
final stats = await edgeVeda.getMemoryStats();

print('Memory usage: ${(stats.usagePercent * 100).toStringAsFixed(1)}%');

if (stats.isHighPressure) {
  print('Consider unloading or reducing context size.');
}
```

## Production-style example

```dart
Future<void> logMemoryDiagnostics(EdgeVeda edgeVeda) async {
  final stats = await edgeVeda.getMemoryStats();

  debugPrint('Edge Veda memory: '
      'current=${stats.currentBytes}, '
      'peak=${stats.peakBytes}, '
      'limit=${stats.limitBytes}, '
      'usage=${(stats.usagePercent * 100).toStringAsFixed(1)}%');

  if (stats.isCritical) {
    debugPrint('Critical memory usage — degrade quality or unload optional models.');
  }
}
```

## Streaming example

Not applicable. `getMemoryStats()` returns one `MemoryStats` object.

## Behavior notes

- The method requires core initialization through `init()`.
- If a `StreamingWorker` is active, stats are queried from that worker.
- If no worker is active, the method returns zero-valued stats and the configured limit.
- The design avoids loading a second model context only to read memory stats.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Active worker path | Uses existing worker context without another model load. | Prefer this method over custom native memory probing. |
| No active worker | Returns zero-valued usage quickly. | Handle zero stats as valid no-worker state. |
| Polling frequency | Frequent polling adds some overhead. | Poll on intervals or diagnostics screens, not every frame. |
| Memory pressure | High usage should trigger quality reduction or cleanup. | Use `isMemoryPressure()` for simple threshold checks. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Stats are most useful when a text streaming worker is active. |
| Embedding model | Partial | Depends on current runtime/worker path. |
| VLM | No direct effect | Vision workers have separate lifecycle/telemetry paths. |
| Stable Diffusion model | No direct effect | Image generation has separate worker/runtime behavior. |

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
- Sensitive data considerations: memory numbers do not contain prompt/model content, but logs may reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Stats are all zero | No active worker is loaded. | This is expected when no model context is active. |
| `usagePercent` seems high | Model/context is near memory limit. | Reduce context size, unload optional models, or use smaller model. |
| Call fails before init | Core runtime was not initialized. | Call `init()` first. |
| Memory does not match OS tools | Stats are Edge Veda/native context oriented. | Use platform telemetry for full app/OS memory. |

## Related APIs

- `EdgeVeda.isMemoryPressure()` — boolean threshold check built on memory stats.
- `MemoryStats` — return type with memory breakdown and convenience flags.
- `Scheduler` — can enforce budget decisions using telemetry and workload data.
- `TelemetryService` — platform-level thermal, battery, and memory telemetry.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.getMemoryStats()`
- Related return type: `MemoryStats`
- Related worker: `StreamingWorker`

## Documentation review checklist

Before publishing, verify that:

- The zero-valued no-worker behavior is still current.
- `MemoryStats` fields and thresholds are current.
- The method still routes through the active worker.
- Examples compile in Flutter context.
