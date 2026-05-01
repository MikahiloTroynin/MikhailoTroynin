---
    title: "Performance tuning"
    description: "Налаштовуйте Edge Veda workloads за latency, throughput, memory, thermal stability і user experience."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Performance tuning

    Performance tuning в Edge Veda — це не лише tokens per second. Production app має балансувати first-token latency, sustained throughput, memory, thermal stability, battery drain і те, як user сприймає progress.

    ## Що ви створите

    У цьому guide показано, як:

    - вибрати правильні model size і context length;
- розділити cold-start і steady-state measurements;
- tune-ити streaming, RAG, vision, STT і image generation workloads;
- використовувати scheduler budgets, щоб запобігати overload;
- validate performance on physical devices;

    ## Core concept

    Спочатку measure, потім tune. README містить example metrics, виміряні на physical iPhone, але ваша app має мати власний baseline, бо model choice, prompt length, device tier, thermal state і concurrent workloads змінюють results.

    ## Basic example

    ```dart
final stopwatch = Stopwatch()..start();

var tokenCount = 0;

await for (final chunk in edgeVeda.generateStream(prompt)) {
  tokenCount++;
  onPartialText(chunk.token);
}

stopwatch.stop();

final tokensPerSecond = tokenCount / (stopwatch.elapsedMilliseconds / 1000);

print({
  'tokens': tokenCount,
  'elapsed_ms': stopwatch.elapsedMilliseconds,
  'tokens_per_second': tokensPerSecond,
});
```

    ### Primary tuning levers

| Lever | Improves | Trade-off |
| --- | --- | --- |
| Smaller model | Memory, latency, startup time | May reduce answer quality. |
| Lower `contextLength` | Memory and prompt evaluation time | Less conversation or document context. |
| Streaming UI | Perceived latency | Requires cancellation and partial-output handling. |
| Lower `topK` in RAG | Generation latency and prompt size | May miss relevant context. |
| Lower image steps | Image generation speed | May reduce image quality. |
| Lower camera resolution | Vision latency and memory | May reduce visual detail. |

### Measure separately

| Metric | Why | How |
| --- | --- | --- |
| Cold start | Includes model load time. | Measure first request after app launch. |
| First token latency | User feels this delay first. | Record prompt submit to first chunk. |
| Steady throughput | Shows sustained generation speed. | Track tokens per second after first token. |
| p95 latency | Captures bad cases. | Aggregate session traces. |
| Memory peak | Predicts crashes and evictions. | Sample memory while workload runs. |

    ## Recommended practices

    - Тестуйте на physical devices, не лише simulators.
- Міряйте p50 і p95, а не тільки average latency.
- Тримайте prompts short і прибирайте repeated instructions.
- Використовуйте `generateStream()` для long user-facing answers.
- Використовуйте `ModelAdvisor` перед enabling larger models.
- Використовуйте scheduler budgets для mixed workloads.
- Тримайте benchmark prompts і test data stable між releases.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Slow first token | Large model, long context, or cold start. | Reduce context, warm up runtime, or use smaller model. |
| Good benchmark but bad UX | Only throughput was measured. | Measure first-token latency and progress feedback. |
| RAG is slow | Too many chunks are injected. | Lower `topK` or improve chunking. |
| Vision feels stale | Frames queue faster than inference. | Drop frames or reduce resolution. |
| Image generation blocks other work | Image worker consumes memory and GPU. | Run it in a controlled feature flow and unload when idle. |

    ## Privacy notes

    Performance traces мають використовувати operational data. Міряйте prompt length, token count і latency замість raw prompts або generated text.

    ## Related guides

    - [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`memory-management.md`](./memory-management.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`model-advisor.md`](./model-advisor.md)
