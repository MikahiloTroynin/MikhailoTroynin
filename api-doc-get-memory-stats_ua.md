---
title: "EdgeVeda.getMemoryStats()"
description: "Сторінка API reference для методу getMemoryStats() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.getMemoryStats()`

> Зчитує current native memory statistics для active Edge Veda runtime context.

Використовуйте `getMemoryStats()`, щоб спостерігати memory use після model initialization або generation. Метод спроєктовано так, щоб не завантажувати другу модель лише для stats.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `getMemoryStats()` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — core `init()` має бути completed |
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

`getMemoryStats()` перевіряє, що core runtime initialized, потім routes query через active `StreamingWorker`, якщо він доступний. Якщо active worker немає, метод повертає zero-valued usage stats із configured memory limit замість завантаження нового native model context.

## When to use it

Використовуйте `getMemoryStats()` коли потрібно:

- показати current/peak memory у debug або diagnostics panel;
- приймати runtime decisions при high memory use;
- передавати memory data в app-level quality/unloading logic;
- перевірити, чи active streaming worker consumes memory.

Не використовуйте цей метод, коли:

- потрібен тільки boolean pressure check; використовуйте `isMemoryPressure()`;
- core `EdgeVeda` runtime не initialized;
- потрібна OS-wide telemetry beyond Edge Veda context; use `TelemetryService`, якщо доречно.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `await edgeVeda.init(config)` успішно завершився;
- app може обробляти zero-valued stats, коли active worker немає;
- developers розуміють, що values represent Edge Veda/native context stats, а не full app memory telemetry.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

`Future<MemoryStats>` — current memory breakdown для active worker або zero-valued usage stats, коли active worker немає.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| `currentBytes` | `int` | Current total memory usage у bytes. |
| `peakBytes` | `int` | Peak memory usage у bytes. |
| `limitBytes` | `int` | Configured memory limit у bytes. |
| `modelBytes` | `int` | Memory used by loaded model. |
| `contextBytes` | `int` | Memory used by inference context. |
| `usagePercent` | `double` | Memory usage ratio від 0.0 до 1.0. |
| `isHighPressure` | `bool` | Convenience flag для >80% usage. |
| `isCritical` | `bool` | Convenience flag для >90% usage. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `InitializationException` / `EdgeVedaException` | Core runtime not initialized або `_ensureInitialized()` fails. | Call `init()` перед memory stats. |
| Worker/runtime error | Active worker не може надати stats. | Retry after generation finishes або reinitialize runtime if needed. |

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

Не застосовується. `getMemoryStats()` повертає один `MemoryStats` object.

## Behavior notes

- Метод потребує core initialization через `init()`.
- Якщо active `StreamingWorker` є, stats queried from that worker.
- Якщо active worker немає, метод повертає zero-valued stats і configured limit.
- Design avoids loading second model context only to read memory stats.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Active worker path | Uses existing worker context без another model load. | Prefer this method over custom native memory probing. |
| No active worker | Returns zero-valued usage quickly. | Handle zero stats як valid no-worker state. |
| Polling frequency | Frequent polling adds some overhead. | Poll on intervals або diagnostics screens, not every frame. |
| Memory pressure | High usage should trigger quality reduction/cleanup. | Use `isMemoryPressure()` для simple threshold checks. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Stats most useful, коли text streaming worker active. |
| Embedding model | Partial | Depends on current runtime/worker path. |
| VLM | No direct effect | Vision workers мають separate lifecycle/telemetry paths. |
| Stable Diffusion model | No direct effect | Image generation має separate worker/runtime behavior. |

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
- Sensitive data considerations: memory numbers не містять prompt/model content, але logs можуть reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Stats are all zero | No active worker loaded. | Expected, коли no model context active. |
| `usagePercent` seems high | Model/context near memory limit. | Reduce context size, unload optional models, або use smaller model. |
| Call fails before init | Core runtime not initialized. | Call `init()` first. |
| Memory does not match OS tools | Stats Edge Veda/native context oriented. | Use platform telemetry для full app/OS memory. |

## Related APIs

- `EdgeVeda.isMemoryPressure()` — boolean threshold check built on memory stats.
- `MemoryStats` — return type з memory breakdown і convenience flags.
- `Scheduler` — can enforce budget decisions using telemetry/workload data.
- `TelemetryService` — platform-level thermal, battery, memory telemetry.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.getMemoryStats()`
- Related return type: `MemoryStats`
- Related worker: `StreamingWorker`

## Documentation review checklist

Перед публікацією перевірте:

- Zero-valued no-worker behavior still current.
- `MemoryStats` fields/thresholds current.
- Method still routes through active worker.
- Examples compile in Flutter context.
