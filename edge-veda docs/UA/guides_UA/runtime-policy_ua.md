---
    title: "Runtime policy"
    description: "Налаштуйте thermal, memory і battery-aware runtime behavior для long-running Edge Veda workloads."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Runtime policy

    `RuntimePolicy` — це decision layer, який тримає on-device AI workloads stable, коли device має thermal, memory або battery pressure. Замість того щоб app працювала до crash або OS termination, runtime може step down quality, зменшити workload intensity, pause unsafe work і recover поступово, коли device cooling down.

    ## Що ви створите

    У цьому guide показано, як:

    - зрозуміти runtime signals, які Edge Veda monitors;
- мапити pressure signals до QoS levels;
- спроєктувати graceful degradation rules;
- уникати quality oscillation через cooldown і hysteresis;
- вирішити, що user бачить, коли runtime pauses work;

    ## Core concept

    Runtime policy — це не один switch. Він поєднує device telemetry, workload priority, memory pressure, thermal state і product-level decisions. Camera assistant, voice assistant і background summarizer не мають degrade-итися однаково.

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

    - Проєктуйте degradation per feature, а не globally.
- Спершу зменшуйте quality, а не fail-іть request.
- Захищайте foreground user actions перед background indexing або tracing.
- Використовуйте cooldown перед restore на higher QoS level.
- Не приховуйте paused state, якщо user чекає output.
- Записуйте policy transitions через tracing для investigation regressions.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | App quality jumps up and down | The policy restores too quickly after pressure clears. | Use cooldown and one-level-at-a-time recovery. |
| Foreground chat becomes slow while indexing | Background work has too high priority. | Register workloads with explicit priorities. |
| Camera output is stale | Frames are queued while policy is reduced. | Drop frames instead of queueing indefinitely. |
| User sees silent failure | Policy pauses work but UI does not know. | Surface paused/degraded states in the feature UI. |

    ## Privacy notes

    Runtime policy сам по собі не має потребувати network access. Telemetry треба обробляти як operational data: не записуйте prompts, images, audio або document content у policy events.

    ## Related guides

    - [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`memory-management.md`](./memory-management.md)
- [`production-readiness.md`](./production-readiness.md)
