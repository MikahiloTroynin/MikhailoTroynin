---
    title: "Production readiness"
    description: "Підготуйте Edge Veda app до real users, long sessions, device limits, observability і safe failure modes."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Production readiness

    Production readiness означає, що app stable, коли users виходять за happy path: old devices, low memory, low battery, long sessions, unsupported models, missing permissions, interrupted workloads і malformed model output.

    ## Що ви створите

    У цьому guide показано, як:

    - створити pre-release checklist;
- validate models, devices, permissions і storage;
- визначити runtime policy і scheduler budgets;
- instrument telemetry and traces;
- задокументувати fallback і error behavior;

    ## Core concept

    Demo доводить, що inference може run. Production readiness доводить, що inference може keep running safely, observably і predictably, коли device under pressure.

    ## Basic example

    ```dart
Future<void> assertProductionPreflight({
  required String modelPath,
}) async {
  final canRun = ModelAdvisor.canRun(
    model: ModelRegistry.llama32_1b,
  );

  if (!canRun) {
    throw StateError('Selected model is not suitable for this device.');
  }

  final scheduler = Scheduler(telemetry: TelemetryService());
  scheduler.setBudget(
    EdgeVedaBudget.adaptive(BudgetProfile.balanced),
  );
  scheduler.start();

  // Continue with runtime initialization only after preflight passes.
}
```

    ### Readiness checklist

| Area | Must be true before release | Evidence |
| --- | --- | --- |
| Models | Every bundled or downloadable model has capability, size, checksum, and template metadata. | Model registry and install tests. |
| Devices | Supported device tiers are tested on physical hardware. | Device test matrix. |
| Permissions | Microphone, camera, and file access are requested only when needed. | Permission QA checklist. |
| Runtime policy | Thermal, memory, and battery degradation is defined. | Runtime policy tests and traces. |
| Scheduler | Concurrent workloads have priorities and budgets. | Budget violation tests. |
| Errors | User-facing recovery paths exist for common failures. | Error handling matrix. |
| Privacy | No content is logged by default. | Log review and diagnostics policy. |

### Release gates

| Gate | Question | Pass condition |
| --- | --- | --- |
| Cold start | Can the feature start from a clean launch? | Model loads or shows actionable error. |
| Long session | Can it run beyond a short demo? | No crashes, no uncontrolled memory growth. |
| Low-memory scenario | Does it degrade before termination? | Idle workers evicted and UI updated. |
| Offline mode | Does inference avoid network dependency? | Core task works without network. |
| Invalid model | Does the app fail safely? | Clear message and alternate model suggestion. |

    ## Recommended practices

    - Тестуйте на physical iOS devices і хоча б одному lower-memory device.
- Тримайте device і model compatibility matrix.
- Ship-іть conservative defaults і давайте advanced users opt into heavier models.
- Робіть degraded, paused і failed states visible.
- Використовуйте traces для regression testing після SDK або model updates.
- Включіть privacy review у release readiness.
- Документуйте, що fully supported, partial, planned або experimental.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Feature works in demo but crashes later | Long-session and pressure tests were missing. | Add soak tests with tracing. |
| Users install models that do not fit | No preflight or storage check. | Use `ModelAdvisor` and storage checks before download. |
| Support tickets lack useful data | No operational traces. | Add privacy-safe trace export. |
| Permissions fail in production | Permission copy or request timing is wrong. | Test fresh installs and denied-permission flows. |

    ## Privacy notes

    Production diagnostics мають бути safe by design. Не збирайте user prompts, transcripts, documents або images, якщо user явно не export-ить їх для support.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`error-handling.md`](./error-handling.md)
