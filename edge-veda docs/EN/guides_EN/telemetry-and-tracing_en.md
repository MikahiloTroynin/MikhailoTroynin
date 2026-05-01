---
    title: "Telemetry and tracing"
    description: "Capture structured runtime telemetry and JSONL traces for Edge Veda debugging and offline analysis."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Telemetry and tracing

    Telemetry and tracing make on-device AI behavior observable. Edge Veda can record runtime policy transitions, memory and thermal telemetry, frame drops, per-stage timing, and other operational signals so developers can debug long sessions and performance regressions without guessing.

    ## What you will build

    This guide shows how to:

    - decide which runtime events to record;
- connect telemetry to scheduler and runtime policy;
- write structured JSONL traces;
- analyze traces offline;
- avoid recording private user data;

    ## Core concept

    Telemetry is for current state. Tracing is for history. `TelemetryService` provides live device signals to runtime policy and scheduler decisions. `PerfTrace` or JSONL tracing records what happened over time so developers can inspect p50, p95, p99, throughput, frame drops, and policy transitions later.

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

    - Write traces as structured events, not free-form logs.
- Use stable event names and field names.
- Record timestamps and workload IDs for every event.
- Keep traces local unless the user opts in to diagnostics upload.
- Create small trace files per session instead of one unlimited file.
- Redact or avoid content fields by default.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Trace files are too large | Events are too frequent or contain payloads. | Sample metrics and remove user content. |
| Trace cannot explain latency | No per-stage timing was recorded. | Add stage timing for encode, prompt eval, decode, search, and synthesis. |
| Policy transitions are confusing | Reason field is missing. | Record transition cause such as thermal, memory, battery, or budget. |
| Telemetry affects performance | Tracing writes too often on the hot path. | Buffer and flush in batches. |

    ## Privacy notes

    Telemetry and tracing must be privacy-first. Operational diagnostics should describe runtime behavior, not user content. If diagnostics upload exists, make it explicit, opt-in, and easy to disable.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`performance-tuning.md`](./performance-tuning.md)
- [`production-readiness.md`](./production-readiness.md)
- [`error-handling.md`](./error-handling.md)
