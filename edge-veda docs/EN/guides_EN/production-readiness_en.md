---
    title: "Production readiness"
    description: "Prepare an Edge Veda app for real users, long sessions, device limits, observability, and safe failure modes."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Production readiness

    Production readiness means the app is stable when users leave the happy path: old devices, low memory, low battery, long sessions, unsupported models, missing permissions, interrupted workloads, and malformed model output.

    ## What you will build

    This guide shows how to:

    - create a pre-release checklist;
- validate models, devices, permissions, and storage;
- define runtime policy and scheduler budgets;
- instrument telemetry and traces;
- document fallback and error behavior;

    ## Core concept

    A demo proves that inference can run. Production readiness proves that inference can keep running safely, observably, and predictably while the device is under pressure.

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

    - Test on physical iOS devices and at least one lower-memory device.
- Keep a device and model compatibility matrix.
- Ship with conservative defaults and allow advanced users to opt into heavier models.
- Make degraded, paused, and failed states visible.
- Use traces for regression testing after SDK or model updates.
- Keep privacy review part of release readiness.
- Document what is fully supported, partial, planned, or experimental.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Feature works in demo but crashes later | Long-session and pressure tests were missing. | Add soak tests with tracing. |
| Users install models that do not fit | No preflight or storage check. | Use `ModelAdvisor` and storage checks before download. |
| Support tickets lack useful data | No operational traces. | Add privacy-safe trace export. |
| Permissions fail in production | Permission copy or request timing is wrong. | Test fresh installs and denied-permission flows. |

    ## Privacy notes

    Production diagnostics should be safe by design. Do not collect user prompts, transcripts, documents, or images unless the user explicitly exports them for support.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`error-handling.md`](./error-handling.md)
