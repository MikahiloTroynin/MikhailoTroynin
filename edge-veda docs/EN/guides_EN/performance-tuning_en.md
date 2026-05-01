---
    title: "Performance tuning"
    description: "Tune Edge Veda workloads for latency, throughput, memory, thermal stability, and user experience."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Performance tuning

    Performance tuning in Edge Veda is not just about tokens per second. A production app must balance first-token latency, sustained throughput, memory, thermal stability, battery drain, and the user's perception of progress.

    ## What you will build

    This guide shows how to:

    - choose the right model size and context length;
- separate cold-start and steady-state measurements;
- tune streaming, RAG, vision, STT, and image generation workloads;
- use scheduler budgets to prevent overload;
- validate performance on physical devices;

    ## Core concept

    Measure before tuning. The README includes example metrics measured on a physical iPhone, but your app should produce its own baseline because model choice, prompt length, device tier, thermal state, and concurrent workloads change results.

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

    - Test on physical devices, not only simulators.
- Measure p50 and p95, not only average latency.
- Keep prompts short and remove repeated instructions.
- Use `generateStream()` for long user-facing answers.
- Use `ModelAdvisor` before enabling larger models.
- Use scheduler budgets for mixed workloads.
- Keep benchmark prompts and test data stable between releases.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Slow first token | Large model, long context, or cold start. | Reduce context, warm up runtime, or use smaller model. |
| Good benchmark but bad UX | Only throughput was measured. | Measure first-token latency and progress feedback. |
| RAG is slow | Too many chunks are injected. | Lower `topK` or improve chunking. |
| Vision feels stale | Frames queue faster than inference. | Drop frames or reduce resolution. |
| Image generation blocks other work | Image worker consumes memory and GPU. | Run it in a controlled feature flow and unload when idle. |

    ## Privacy notes

    Performance traces should use operational data. Measure prompt length, token count, and latency instead of storing raw prompts or generated text.

    ## Related guides

    - [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`memory-management.md`](./memory-management.md)
- [`telemetry-and-tracing.md`](./telemetry-and-tracing.md)
- [`model-advisor.md`](./model-advisor.md)
