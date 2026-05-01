---
    title: "Scheduler and budgets"
    description: "Declare compute budget contracts and let the Scheduler arbitrate Edge Veda workloads."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Scheduler and budgets

    `Scheduler` coordinates concurrent AI workloads so text generation, vision, speech-to-text, image generation, and RAG do not overload the device at the same time. `EdgeVedaBudget` defines the limits the product is willing to accept: latency, battery drain, thermal level, and memory pressure.

    ## What you will build

    This guide shows how to:

    - create a scheduler with `TelemetryService`;
- choose adaptive or static budgets;
- register workloads with priorities;
- listen for budget violations;
- design fallback behavior when a budget is exceeded;

    ## Core concept

    A budget is a product contract. It says what the app promises users under normal conditions and how the runtime should behave when that promise cannot be kept. Budgets do not remove hardware limits; they make those limits explicit and manageable.

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

    - Register every long-running AI workload with the scheduler.
- Use adaptive budgets first, then introduce static values after measuring real devices.
- Keep budget handling visible to feature code through events.
- Degrade low-priority work before foreground work.
- Do not run image generation, STT, vision, and RAG at full quality at the same time unless measured.
- Log budget violations without logging user content.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Budget violations fire constantly | Budget is too strict or workload is too heavy. | Use a smaller model, lower context, or adjust budget profile. |
| Low-priority work blocks UI | Workload was not registered or has wrong priority. | Register the workload and lower its priority. |
| Performance mode drains battery | Profile is too generous for the feature. | Use balanced or conservative for non-critical flows. |
| Static budget works on one phone only | Different devices have different limits. | Use adaptive budget profiles. |

    ## Privacy notes

    Scheduler events should contain operational fields such as workload ID, constraint, and measured value. Do not include prompts, transcripts, images, embeddings, or retrieved document chunks.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`performance-tuning.md`](./performance-tuning.md)
- [`production-readiness.md`](./production-readiness.md)
