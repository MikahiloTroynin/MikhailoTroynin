---
    title: "Memory management"
    description: "Керуйте model memory, worker lifecycle, KV cache, vector indexes і pressure recovery в Edge Veda."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Memory management

    Memory — найчастіше production constraint для on-device AI. Edge Veda використовує persistent workers, щоб models load once і лишалися available, але persistent models, KV cache, image generation, vision, STT і vector indexes конкурують за limited RAM.

    ## Що ви створите

    У цьому guide показано, як:

    - зрозуміти, що consumes memory;
- використовувати runtime memory checks;
- зменшити model і context footprint;
- обробляти memory pressure до OS termination;
- спроєктувати worker eviction і reload behavior;

    ## Core concept

    На mobile devices memory failure часто abrupt. App може не отримати friendly exception перед OS kill. Найбезпечніший design — predict memory fit, monitor pressure, degrade early і тримати loaded лише models, потрібні active feature.

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

    - Використовуйте `ModelAdvisor.canRun()` перед download або loading large models.
- Зменшуйте `contextLength` на 4 GB devices або older hardware.
- Не тримайте chat, vision, STT, image generation і RAG models loaded без потреби.
- Summarize chat history до того, як context стане too large.
- Persist-іть vector indexes і load-іть їх intentionally.
- Покладайтеся на idle auto-disposal для image generation та інших large workers.
- Сприймайте memory pressure як normal runtime state, а не unexpected crash.

    ## Production notes

    Сприймайте цей guide як product integration pattern. Перевіряйте exact method names за installed Edge Veda SDK version і generated Dart API reference. Важлива production behavior стабільна: monitor device pressure, schedule work explicitly, degrade gracefully і робити degraded states visible для users.

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | App is killed without Dart exception | OS terminated the app under memory pressure. | Reduce model size/context and unload idle workers earlier. |
| Memory grows during long chat | KV cache and conversation context grow. | Summarize old turns or start a new session. |
| Image generation breaks other features | Image model consumes large memory. | Pause other workloads and dispose image worker when idle. |
| RAG consumes too much RAM | Vector index has too many chunks or metadata is too large. | Re-chunk, deduplicate, and compact metadata. |

    ## Privacy notes

    Memory diagnostics не мають dump-ити user data. Уникайте crash reports або logs із prompts, RAG chunks, transcripts, image bytes або generated answers.

    ## Related guides

    - [`runtime-policy.md`](./runtime-policy.md)
- [`scheduler-and-budgets.md`](./scheduler-and-budgets.md)
- [`performance-tuning.md`](./performance-tuning.md)
- [`model-manager.md`](./model-manager.md)
