---
    title: "Telemetry and tracing"
    description: "Збирайте structured runtime telemetry і JSONL traces для Edge Veda debugging та offline analysis."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Telemetry and tracing

    Telemetry і tracing роблять on-device AI behavior observable. Edge Veda може записувати runtime policy transitions, memory and thermal telemetry, frame drops, per-stage timing та інші operational signals, щоб developers могли debug-ити long sessions і performance regressions без guessing.

    ## Що ви створите

    У цьому guide показано, як:

    - вирішити, які runtime events записувати;
- підключити telemetry до scheduler і runtime policy;
- писати structured JSONL traces;
- аналізувати traces offline;
- уникати запису private user data;

    ## Core concept

    Telemetry потрібна для current state. Tracing потрібен для history. `TelemetryService` дає live device signals для runtime policy і scheduler decisions. `PerfTrace` або JSONL tracing записує, що відбувалося over time, щоб developers могли аналізувати p50, p95, p99, throughput, frame drops і policy transitions.

    ## Basic example

    ```dart
final telemetry = TelemetryService();

final scheduler = Scheduler(
  telemetry: telemetry,
);

scheduler.onBudgetViolation.listen((event) {
  // Keep this operational. Do not attach prompts or user content.
  print({
    'type': 'budget_violation',
    'constraint': event.constraint,
    'current': event.currentValue,
    'budget': event.budgetValue,
  });
});

// If your SDK version exposes a tracing API, write JSONL events
// and analyze them offline with the repository tooling.
```

    ### Recommended trace events

| Event | Fields | Purpose |
| --- | --- | --- |
| `runtime_policy_changed` | old level, new level, reason, timestamp | Explain quality changes and pauses. |
| `budget_violation` | constraint, current value, budget value, workload ID | Find workloads that exceed product guarantees. |
| `stage_timing` | stage name, duration, workload ID | Find slow encode, prompt eval, decode, search, or synthesis stages. |
| `frame_drop` | queue policy, dropped count, workload ID | Debug camera backpressure and stale frames. |
| `memory_sample` | available memory, pressure flag, loaded workers | Correlate crashes or evictions with memory pressure. |

### What not to trace

| Data | Reason | Safer alternative |
| --- | --- | --- |
| Prompt text | May contain private user content. | Trace prompt length and task type. |
| Raw audio or transcript | May contain sensitive speech. | Trace duration, model, and status only. |
| Images or frames | May reveal private surroundings. | Trace dimensions and processing time. |
| Retrieved RAG chunks | May contain private documents. | Trace source count and score range. |
| Generated answers | May contain personal data. | Trace token count and latency. |

    ## Recommended practices

    - Пишіть traces як structured events, не free-form logs.
- Використовуйте stable event names і field names.
- Додавайте timestamps і workload IDs до кожного event.
- Тримайте traces local, якщо user не opt-in-ив diagnostics upload.
- Створюйте small trace files per session, не один unlimited file.
- Redact-іть або не записуйте content fields by default.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Trace files are too large | Events are too frequent or contain payloads. | Sample metrics and remove user content. |
| Trace cannot explain latency | No per-stage timing was recorded. | Add stage timing for encode, prompt eval, decode, search, and synthesis. |
| Policy transitions are confusing | Reason field is missing. | Record transition cause such as thermal, memory, battery, or budget. |
| Telemetry affects performance | Tracing writes too often on the hot path. | Buffer and flush in batches. |

    ## Privacy notes

    Telemetry і tracing мають бути privacy-first. Operational diagnostics мають описувати runtime behavior, а не user content. Якщо diagnostics upload існує, зробіть його explicit, opt-in і easy to disable.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`performance-tuning.md`](./performance-tuning.md)
- [`production-readiness.md`](./production-readiness.md)
- [`error-handling.md`](./error-handling.md)
