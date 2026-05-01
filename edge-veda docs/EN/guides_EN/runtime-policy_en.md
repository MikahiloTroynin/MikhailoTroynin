---
    title: "Runtime policy"
    description: "Configure thermal, memory, and battery-aware runtime behavior for long-running Edge Veda workloads."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Runtime policy

    `RuntimePolicy` is the decision layer that keeps on-device AI workloads stable when the device is under thermal, memory, or battery pressure. Instead of letting the app run until iOS or Android terminates it, the runtime can step down quality, reduce workload intensity, pause unsafe work, and recover gradually when the device cools down.

    ## What you will build

    This guide shows how to:

    - understand the runtime signals Edge Veda monitors;
- map pressure signals to QoS levels;
- design graceful degradation rules;
- avoid quality oscillation with cooldown and hysteresis;
- decide what the user should see when the runtime pauses work;

    ## Core concept

    Runtime policy is not a single switch. It combines device telemetry, workload priority, memory pressure, thermal state, and product-level decisions. A camera assistant, a voice assistant, and a background summarizer should not degrade in exactly the same way.

    ## Basic example

    ```dart
final scheduler = Scheduler(
  telemetry: TelemetryService(),
);

scheduler.setBudget(
  EdgeVedaBudget.adaptive(BudgetProfile.balanced),
);

scheduler.registerWorkload(
  WorkloadId.vision,
  priority: WorkloadPriority.high,
);

scheduler.registerWorkload(
  WorkloadId.text,
  priority: WorkloadPriority.low,
);

scheduler.start();

scheduler.onBudgetViolation.listen((violation) {
  print('${violation.constraint}: '
      '${violation.currentValue} > ${violation.budgetValue}');
});
```

    ### Runtime signals

| Signal | Why it matters | Typical response |
| --- | --- | --- |
| Thermal state | Sustained inference can heat the device and trigger OS throttling. | Reduce tokens, FPS, resolution, or pause unsafe workloads. |
| Available memory | Large models, KV cache, image generation, and vector indexes compete for RAM. | Evict idle workers and reduce context length or workload count. |
| Battery level | Low battery and Low Power Mode change the product trade-off. | Switch to reduced or minimal quality. |
| Workload priority | Not every AI task is equally important to the current user flow. | Protect foreground work and degrade background work first. |

### QoS levels

| Level | Behavior | Product guidance |
| --- | --- | --- |
| `full` | Normal quality and normal generation limits. | Use when the device has no relevant pressure. |
| `reduced` | Lower FPS, lower resolution, fewer tokens, or slower cadence. | Tell the user quality is reduced only if visible quality changes. |
| `minimal` | Keep only essential work running. | Prefer short answers, fewer frames, and smaller batches. |
| `paused` | Stop unsafe workloads until the device recovers. | Show a clear recovery message and avoid retry loops. |

    ## Recommended practices

    - Design degradation per feature, not globally.
- Prefer reducing quality before failing the request.
- Protect foreground user actions before background indexing or tracing.
- Use cooldown before restoring a higher QoS level.
- Never hide a paused state if the user is waiting for output.
- Record policy transitions through tracing so regressions can be investigated.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | App quality jumps up and down | The policy restores too quickly after pressure clears. | Use cooldown and one-level-at-a-time recovery. |
| Foreground chat becomes slow while indexing | Background work has too high priority. | Register workloads with explicit priorities. |
| Camera output is stale | Frames are queued while policy is reduced. | Drop frames instead of queueing indefinitely. |
| User sees silent failure | Policy pauses work but UI does not know. | Surface paused/degraded states in the feature UI. |

    ## Privacy notes

    Runtime policy itself should not require network access. Telemetry should be treated as operational data: avoid recording prompts, images, audio, or document content inside policy events.

    ## Related guides

    - [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`memory-management.md`](./memory-management.md)
- [`production-readiness.md`](./production-readiness.md)
