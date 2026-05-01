---
title: "EdgeVeda.setScheduler()"
description: "API reference page for the setScheduler() method in the Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.setScheduler()`

> Connects a Scheduler so image generation can participate in budget-aware runtime policy.

Use `setScheduler()` after creating both `EdgeVeda` and `Scheduler` instances when your app wants image generation workloads to be tracked, gated, and reported to the scheduler.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `setScheduler()` |
| Category | Runtime / Scheduler integration |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
void setScheduler(Scheduler scheduler);
```

## What it does

`setScheduler()` stores a `Scheduler` reference inside the `EdgeVeda` instance. When a scheduler is connected, image generation can register as a workload, follow QoS policy, and report latency samples to the scheduler.

## When to use it

Use `setScheduler()` when you need to:

- enable budget-aware image generation;
- coordinate image generation with other on-device AI workloads;
- enforce p95 latency, battery, thermal, and memory constraints through Scheduler;
- collect workload latency and budget violation telemetry.

Do not use this method when:

- you do not use image generation workloads;
- you only need simple text generation or embeddings;
- the scheduler is not configured with telemetry and budget;
- you expect this method to start the scheduler automatically — call `scheduler.start()` separately.

## Prerequisites

Before calling this method, make sure that:

- A `Scheduler` instance exists and is configured with `TelemetryService`;
- the scheduler has an active budget via `setBudget()` if enforcement is needed;
- workloads are registered where appropriate;
- the app owns scheduler lifecycle and calls `dispose()` when done.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `scheduler` | `Scheduler` | Yes | — | Scheduler instance to connect to `EdgeVeda`. | The scheduler should be configured, started, and disposed by the app. |

## Returns

`void` — the method stores the scheduler reference and returns immediately.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The current implementation stores the reference only. | Validate scheduler setup before calling and test budget behavior in integration tests. |

## Minimal example

```dart
final scheduler = Scheduler(telemetry: TelemetryService());

scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
scheduler.start();

edgeVeda.setScheduler(scheduler);
```

## Production-style example

```dart
Future<Scheduler> connectScheduler(EdgeVeda edgeVeda) async {
  final scheduler = Scheduler(
    telemetry: TelemetryService(),
    restorationCooldown: const Duration(seconds: 30),
  );

  scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
  scheduler.registerWorkload(
    WorkloadId.image,
    priority: WorkloadPriority.high,
  );

  scheduler.onBudgetViolation.listen((violation) {
    debugPrint('Budget violation: ${violation.constraint}');
  });

  scheduler.start();
  edgeVeda.setScheduler(scheduler);

  return scheduler;
}
```

## Streaming example

Not applicable. `setScheduler()` connects a dependency and does not emit a stream.

## Behavior notes

- The method stores the scheduler in the `EdgeVeda` instance.
- It does not create, start, stop, or dispose the scheduler.
- When connected, image generation can gate on QoS policy and report latency.
- Budget enforcement depends on the scheduler being configured and running.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Scheduler overhead | Telemetry polling and QoS decisions add small runtime overhead. | Use Scheduler for long-running or concurrent workloads. |
| Budget profile | Conservative/balanced/performance profiles affect degradation behavior. | Start with balanced and tune on physical devices. |
| Latency reporting | Image generation can report workload latency. | Use reports to adjust model/settings. |
| Lifecycle | Dangling scheduler references can confuse cleanup. | Own scheduler lifecycle in app-level service. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion model | Yes | Primary consumer through image generation workloads. |
| Text GGUF LLM | Indirect | Scheduler coordinates multiple on-device workloads but this method targets image generation integration. |
| VLM | Indirect | Use Scheduler/RuntimePolicy where workloads are registered. |
| Embedding model | Indirect | Can be coordinated at app level if registered as workload. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: scheduler reference only.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: telemetry and traces may reveal device performance; avoid logging user prompts or generated content in scheduler callbacks.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| No budget effect | Scheduler was not started or no budget was set. | Call `scheduler.setBudget()` and `scheduler.start()`. |
| No violation events | Workload not registered or constraints not exceeded. | Register workloads and test under pressure. |
| Image generation still runs under pressure | QoS policy not wired for this path or scheduler not connected early enough. | Call `setScheduler()` before image generation and review workload IDs. |
| Resource leak | Scheduler not disposed by app. | Call `scheduler.dispose()` during app/service cleanup. |

## Related APIs

- `Scheduler` — central budget coordinator.
- `Scheduler.setBudget()` — sets active budget.
- `Scheduler.start()` — starts periodic enforcement loop.
- `EdgeVeda.generateImage()` — image generation path that can use scheduler policy.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Generated Dart API: `EdgeVeda.setScheduler()`
- Related class: `Scheduler`
- Related image generation APIs: `generateImage()` and `generateImageRaw()`

## Documentation review checklist

Before publishing, verify that:

- The method still stores the scheduler reference only.
- Image generation scheduler integration is verified in source.
- Example uses current workload enum names.
- Scheduler lifecycle responsibilities are documented clearly.
