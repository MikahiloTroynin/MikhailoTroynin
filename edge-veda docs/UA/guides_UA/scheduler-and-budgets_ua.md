---
    title: "Scheduler and budgets"
    description: "Описуйте compute budget contracts і дайте Scheduler керувати Edge Veda workloads."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Scheduler and budgets

    `Scheduler` координує concurrent AI workloads, щоб text generation, vision, speech-to-text, image generation і RAG не перевантажували device одночасно. `EdgeVedaBudget` визначає limits, які product готовий прийняти: latency, battery drain, thermal level і memory pressure.

    ## Що ви створите

    У цьому guide показано, як:

    - створити scheduler з `TelemetryService`;
- вибрати adaptive або static budgets;
- зареєструвати workloads із priorities;
- слухати budget violations;
- спроєктувати fallback behavior, коли budget exceeded;

    ## Core concept

    Budget — це product contract. Він описує, що app обіцяє users у normal conditions і як runtime має поводитися, коли цю обіцянку неможливо виконати. Budgets не прибирають hardware limits; вони роблять ці limits explicit і manageable.

    ## Basic example

    ```dart
final scheduler = Scheduler(
  telemetry: TelemetryService(),
);

// Adaptive budget: calibrated to this device.
scheduler.setBudget(
  EdgeVedaBudget.adaptive(BudgetProfile.balanced),
);

// Static budget: explicit product limits.
scheduler.setBudget(const EdgeVedaBudget(
  p95LatencyMs: 3000,
  batteryDrainPerTenMinutes: 5.0,
  maxThermalLevel: 2,
));

scheduler.registerWorkload(
  WorkloadId.vision,
  priority: WorkloadPriority.high,
);

scheduler.registerWorkload(
  WorkloadId.text,
  priority: WorkloadPriority.low,
);

scheduler.registerWorkload(
  WorkloadId.stt,
  priority: WorkloadPriority.low,
);

scheduler.start();

scheduler.onBudgetViolation.listen((violation) {
  print('${violation.constraint}: '
      '${violation.currentValue} > ${violation.budgetValue}');
});
```

    ### Budget profiles

| Profile | Best for | Behavior |
| --- | --- | --- |
| `conservative` | Background work and battery-sensitive apps. | Strict thermal and battery limits; more aggressive degradation. |
| `balanced` | Default product experience. | Balances latency, quality, memory, and battery usage. |
| `performance` | Latency-sensitive foreground actions. | Allows more resource usage, but should still degrade under serious pressure. |

### Workload priorities

| Priority | Use for | Examples |
| --- | --- | --- |
| `high` | The user is actively waiting for the result. | Camera frame description, active chat answer, current voice turn. |
| `normal` | Useful foreground work that can tolerate delay. | RAG query, short summarization, embedding a small note. |
| `low` | Background or maintenance work. | Batch indexing, trace export, precomputing embeddings. |

    ## Recommended practices

    - Реєструйте кожен long-running AI workload у scheduler.
- Починайте з adaptive budgets, а static values вводьте після measurements на real devices.
- Передавайте budget handling у feature code через events.
- Degrade low-priority work перед foreground work.
- Не запускайте image generation, STT, vision і RAG у full quality одночасно без measurements.
- Log-уйте budget violations без user content.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Budget violations fire constantly | Budget is too strict or workload is too heavy. | Use a smaller model, lower context, or adjust budget profile. |
| Low-priority work blocks UI | Workload was not registered or has wrong priority. | Register the workload and lower its priority. |
| Performance mode drains battery | Profile is too generous for the feature. | Use balanced or conservative for non-critical flows. |
| Static budget works on one phone only | Different devices have different limits. | Use adaptive budget profiles. |

    ## Privacy notes

    Scheduler events мають містити operational fields: workload ID, constraint і measured value. Не додавайте prompts, transcripts, images, embeddings або retrieved document chunks.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`performance-tuning.md`](./performance-tuning.md)
- [`production-readiness.md`](./production-readiness.md)
