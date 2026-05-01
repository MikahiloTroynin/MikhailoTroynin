---
    title: "Memory management"
    description: "Control model memory, worker lifecycle, KV cache, vector indexes, and pressure recovery in Edge Veda."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Memory management

    Memory is the most common production constraint for on-device AI. Edge Veda uses persistent workers so models load once and stay available, but persistent models, KV cache, image generation, vision, STT, and vector indexes all compete for limited RAM.

    ## What you will build

    This guide shows how to:

    - understand what consumes memory;
- use runtime memory checks;
- reduce model and context footprint;
- handle memory pressure before the OS terminates the app;
- design worker eviction and reload behavior;

    ## Core concept

    On mobile devices, memory failure is often abrupt. The app may not receive a friendly exception before being killed. The safest design is to predict memory fit, monitor pressure, degrade early, and keep only the models required for the active feature.

    ## Basic example

    ```dart
final stats = await edgeVeda.getMemoryStats();

print('RSS: ${stats.rssBytes}');
print('Available: ${stats.availableBytes}');

if (await edgeVeda.isMemoryPressure()) {
  // Product decision:
  // - reduce context length on next session,
  // - pause background indexing,
  // - unload idle workers,
  // - or show a reduced-quality state.
}
```

    ### Common memory consumers

| Item | Why it matters | Mitigation |
| --- | --- | --- |
| LLM weights | Base memory cost of text generation. | Use smaller or more quantized models. |
| KV cache | Grows with context length and conversation size. | Reduce `contextLength` and summarize old turns. |
| Vision model and projection | VLMs keep large contexts in memory. | Keep `VisionWorker` only while the feature is active. |
| Image generation model | Can require gigabytes for model and generation state. | Initialize only on demand and rely on idle disposal. |
| Vector index | Large indexes store many vectors and metadata. | Persist to disk and chunk only useful text. |
| Audio buffers | STT sessions hold active samples and transcript state. | Flush and stop idle sessions. |

### Memory pressure responses

| Pressure | Response | User impact |
| --- | --- | --- |
| Low | No visible change; continue monitoring. | None. |
| Moderate | Pause background work and reduce batch sizes. | Minor delay. |
| High | Evict idle workers and reduce context or resolution. | Visible quality or speed reduction. |
| Critical | Pause unsafe workloads and show recovery state. | User sees a clear pause or retry option. |

    ## Recommended practices

    - Use `ModelAdvisor.canRun()` before downloading or loading large models.
- Reduce `contextLength` on 4 GB devices or older hardware.
- Do not keep chat, vision, STT, image generation, and RAG models loaded unless needed.
- Summarize chat history before context grows too large.
- Persist vector indexes and load them intentionally.
- Prefer idle auto-disposal for image generation and other large workers.
- Treat memory pressure as a normal runtime state, not an unexpected crash.

    ## Production notes

    Treat this guide as a product integration pattern. Verify exact method names against the installed Edge Veda SDK version and generated Dart API reference. The important production behavior is stable: monitor device pressure, schedule work explicitly, degrade gracefully, and make degraded states visible to users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | App is killed without Dart exception | OS terminated the app under memory pressure. | Reduce model size/context and unload idle workers earlier. |
| Memory grows during long chat | KV cache and conversation context grow. | Summarize old turns or start a new session. |
| Image generation breaks other features | Image model consumes large memory. | Pause other workloads and dispose image worker when idle. |
| RAG consumes too much RAM | Vector index has too many chunks or metadata is too large. | Re-chunk, deduplicate, and compact metadata. |

    ## Privacy notes

    Memory diagnostics should not dump user data. Avoid crash reports or logs that include prompts, RAG chunks, transcripts, image bytes, or generated answers.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`performance-tuning.md`](./performance-tuning.md)
- [`model-manager.md`](./model-manager.md)
