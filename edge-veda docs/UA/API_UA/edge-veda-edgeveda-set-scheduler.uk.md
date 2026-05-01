---
title: "EdgeVeda.setScheduler()"
description: "Сторінка API reference для методу setScheduler() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-29"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.setScheduler()`

> Підключає Scheduler, щоб image generation могла брати участь у budget-aware runtime policy.

Використовуйте `setScheduler()` після створення `EdgeVeda` і `Scheduler` instances, коли app хоче, щоб image generation workloads були tracked, gated і reported to scheduler.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `setScheduler()` |
| Category | Runtime / Scheduler integration |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
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

`setScheduler()` зберігає `Scheduler` reference всередині `EdgeVeda` instance. Коли scheduler connected, image generation може register as workload, follow QoS policy і report latency samples to scheduler.

## When to use it

Використовуйте `setScheduler()` коли потрібно:

- увімкнути budget-aware image generation;
- координувати image generation з іншими on-device AI workloads;
- enforce p95 latency, battery, thermal, memory constraints через Scheduler;
- збирати workload latency і budget violation telemetry.

Не використовуйте цей метод, коли:

- ви не використовуєте image generation workloads;
- потрібна лише text generation або embeddings;
- scheduler не configured with telemetry and budget;
- очікуєте, що method automatically starts scheduler — call `scheduler.start()` separately.

## Prerequisites

Перед викликом методу переконайтесь, що:

- `Scheduler` instance exists і configured with `TelemetryService`;
- scheduler має active budget via `setBudget()`, якщо enforcement needed;
- workloads registered where appropriate;
- app owns scheduler lifecycle і calls `dispose()` when done.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `scheduler` | `Scheduler` | Yes | — | Scheduler instance для підключення до `EdgeVeda`. | Scheduler має бути configured, started і disposed by app. |

## Returns

`void` — метод зберігає scheduler reference і returns immediately.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | `void` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Current implementation only stores reference. | Validate scheduler setup before call і test budget behavior in integration tests. |

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

Не застосовується. `setScheduler()` connects dependency і не повертає stream.

## Behavior notes

- Метод stores scheduler в `EdgeVeda` instance.
- Він не create/start/stop/dispose scheduler.
- When connected, image generation can gate on QoS policy і report latency.
- Budget enforcement depends on scheduler being configured and running.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Scheduler overhead | Telemetry polling і QoS decisions add small runtime overhead. | Use Scheduler для long-running/concurrent workloads. |
| Budget profile | Conservative/balanced/performance profiles affect degradation behavior. | Start with balanced і tune on physical devices. |
| Latency reporting | Image generation can report workload latency. | Use reports to adjust model/settings. |
| Lifecycle | Dangling scheduler references can confuse cleanup. | Own scheduler lifecycle in app-level service. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion model | Yes | Primary consumer через image generation workloads. |
| Text GGUF LLM | Indirect | Scheduler coordinates multiple on-device workloads, але method targets image generation integration. |
| VLM | Indirect | Use Scheduler/RuntimePolicy where workloads registered. |
| Embedding model | Indirect | Can be coordinated at app level if registered as workload. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: scheduler reference only.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: telemetry/traces можуть reveal device performance; avoid logging user prompts/generated content in callbacks.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| No budget effect | Scheduler not started або no budget set. | Call `scheduler.setBudget()` і `scheduler.start()`. |
| No violation events | Workload not registered або constraints not exceeded. | Register workloads і test under pressure. |
| Image generation still runs under pressure | QoS policy not wired або scheduler connected too late. | Call `setScheduler()` before image generation і review workload IDs. |
| Resource leak | Scheduler not disposed by app. | Call `scheduler.dispose()` during cleanup. |

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

Перед публікацією перевірте:

- Method still stores scheduler reference only.
- Image generation scheduler integration verified in source.
- Example uses current workload enum names.
- Scheduler lifecycle responsibilities documented clearly.
