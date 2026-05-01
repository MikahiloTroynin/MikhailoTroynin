---
    title: "Error handling"
    description: "Design recoverable, user-visible, and privacy-safe error handling for Edge Veda apps."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Error handling

    Error handling for on-device AI must cover more than Dart exceptions. A production Edge Veda app should handle unsupported models, missing files, invalid permissions, cancelled workloads, malformed output, memory pressure, thermal policy pauses, budget violations, and low-confidence responses.

    ## What you will build

    This guide shows how to:

    - identify common failure categories;
- map failures to user-facing recovery actions;
- separate retryable and non-retryable errors;
- avoid logging sensitive content;
- test degraded and cancelled states;

    ## Core concept

    A good error path tells the user what happened, what the app did to protect the device or data, and what they can do next. It should not expose low-level FFI details unless the user is in a developer-facing screen.

    ## Basic example

    ```dart
Future<String> safeGenerate(EdgeVeda edgeVeda, String prompt) async {
  try {
    final response = await edgeVeda.generate(prompt);
    return response.text.trim();
  } on ModelLoadException catch (error) {
    throw UserVisibleAiException(
      'The selected model could not be loaded. Try a smaller model.',
      cause: error,
    );
  } on OutOfMemoryException catch (error) {
    throw UserVisibleAiException(
      'The device does not have enough available memory. Close other apps or use a smaller model.',
      cause: error,
    );
  } catch (error) {
    throw UserVisibleAiException(
      'The local AI task could not be completed. Please try again.',
      cause: error,
    );
  }
}
```

    ### Failure categories

| Category | Typical cause | Recovery |
| --- | --- | --- |
| Model load failure | Missing file, unsupported format, incompatible projection file. | Check path, show model repair/download option. |
| Permission denial | Microphone, camera, or file permission denied. | Explain why permission is needed and offer settings path. |
| Memory pressure | Model or context too large for device. | Use smaller model, lower context, evict idle workers. |
| Thermal pause | Runtime policy paused work to protect device. | Show pause state and retry after cooldown. |
| Budget violation | Latency, battery, or thermal budget exceeded. | Degrade workload or pause lower-priority tasks. |
| Malformed output | Structured JSON or tool call did not validate. | Retry with stricter schema or request human review. |
| Cancellation | User interrupted or app state changed. | Stop safely and keep partial output only if UX supports it. |

### User-facing messages

| Situation | Recommended message | Avoid |
| --- | --- | --- |
| Model too large | This model is too large for this device. Try a smaller model. | FFI allocation failed. |
| Thermal pause | The device is too warm. Generation is paused until it cools down. | Unknown runtime error. |
| Permission denied | Microphone access is needed for local transcription. | STT failed. |
| Invalid JSON | The response could not be validated. Please retry or review manually. | Parser exception at token 184. |

    ## Recommended practices

    - Create an error matrix before writing feature code.
- Keep user messages short and actionable.
- Do not retry indefinitely under memory or thermal pressure.
- Treat partial streamed output as provisional.
- Validate structured output and tool arguments before acting on them.
- Map runtime policy and budget events to UI states.
- Log operational metadata, not private content.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | User sees generic error for everything | Errors are caught too broadly. | Map known failure categories to specific messages. |
| App retries until it overheats | Retry loop ignores runtime policy. | Stop retrying when thermal or memory pressure is active. |
| Partial answer is saved as final | Streaming cancellation not handled. | Mark partial output and ask for confirmation. |
| Developer cannot debug issue | No trace or error category logged. | Log privacy-safe category, workload ID, and timing. |

    ## Privacy notes

    Do not include prompts, transcripts, images, embeddings, retrieved chunks, or generated answers in error logs by default. Use explicit user export for support bundles.

    ## Related guides

    - [`production-readiness.md`](./production-readiness.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`runtime-policy.md`](./runtime-policy.md)
- [`structured-output.md`](./structured-output.md)
