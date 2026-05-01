---
    title: "Error handling"
    description: "Спроєктуйте recoverable, user-visible і privacy-safe error handling для Edge Veda apps."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Error handling

    Error handling для on-device AI має покривати не лише Dart exceptions. Production Edge Veda app має обробляти unsupported models, missing files, invalid permissions, cancelled workloads, malformed output, memory pressure, thermal policy pauses, budget violations і low-confidence responses.

    ## Що ви створите

    У цьому guide показано, як:

    - визначити common failure categories;
- мапити failures до user-facing recovery actions;
- відокремити retryable і non-retryable errors;
- уникати logging sensitive content;
- тестувати degraded і cancelled states;

    ## Core concept

    Добрий error path пояснює user, що сталося, що app зробила для захисту device або data, і що можна зробити далі. Він не має показувати low-level FFI details, якщо це не developer-facing screen.

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

    - Створіть error matrix до feature code.
- Тримайте user messages short і actionable.
- Не retry-іть indefinitely під memory або thermal pressure.
- Сприймайте partial streamed output як provisional.
- Validate-іть structured output і tool arguments перед actions.
- Map-іть runtime policy і budget events до UI states.
- Log-уйте operational metadata, не private content.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | User sees generic error for everything | Errors are caught too broadly. | Map known failure categories to specific messages. |
| App retries until it overheats | Retry loop ignores runtime policy. | Stop retrying when thermal or memory pressure is active. |
| Partial answer is saved as final | Streaming cancellation not handled. | Mark partial output and ask for confirmation. |
| Developer cannot debug issue | No trace or error category logged. | Log privacy-safe category, workload ID, and timing. |

    ## Privacy notes

    Не додавайте prompts, transcripts, images, embeddings, retrieved chunks або generated answers у error logs by default. Використовуйте explicit user export для support bundles.

    ## Related guides

    - [`production-readiness.md`](./production-readiness.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`runtime-policy.md`](./runtime-policy.md)
- [`structured-output.md`](./structured-output.md)
