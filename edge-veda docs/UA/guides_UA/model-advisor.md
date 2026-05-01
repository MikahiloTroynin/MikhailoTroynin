---
    title: "Model advisor"
    description: "Використовуйте ModelAdvisor, щоб вибрати models, які fit-яться на current device і use case."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Model advisor

    `ModelAdvisor` допомагає вибрати model з урахуванням device capability і use case. Він score-ить або check-ить models за fit, quality, speed і context needs, щоб app не load-ила model, який crash-иться, працює надто повільно або перевищує memory limits.

    ## Що ви створите

    У цьому guide показано, як:

    - check whether model can run;
- recommend model для use case;
- generate `EdgeVedaConfig`;
- explain model trade-offs to users;
- handle lower-memory devices;

    ## Коли використовувати

    Використовуйте `ModelAdvisor` перед initialization великих chat, vision, speech, embedding або image models.

    ## Basic example

    ```dart
final advisor = ModelAdvisor();

final canRun = await advisor.canRun(modelPath);

if (!canRun) {
  showUnsupportedModelMessage();
  return;
}

final recommendation = await advisor.recommend(
  useCase: ModelUseCase.chat,
  candidates: installedModels,
);

await edgeVeda.init(recommendation.edgeVedaConfig);
```

    ## Recommended practices

    - Run compatibility checks before loading large models.
- Use the correct use case: chat, reasoning, vision, speech, fast, or RAG.
- Prefer the smallest model that meets quality needs.
- Show simple labels such as fastest, balanced, highest quality.
- Re-check recommendations when multiple workers are loaded.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `canRun()` | method | Checks whether a model can fit the device. |
| `recommend()` | method | Ranks models for a use case. |
| `ModelUseCase` | enum | Task category used for scoring. |
| `edgeVedaConfig` | `EdgeVedaConfig` | Recommended runtime configuration. |
| `alternatives` | list | Fallback models when preferred model is unsupported. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Context length | Larger context increases memory. | Let advisor validate config. |
| Model size | Bigger models may be better but slower. | Prefer fit and stability. |
| Device tier | Older devices need smaller models. | Keep fallback models. |
| Concurrent workloads | A model may fit alone but not with STT or vision. | Re-run advisor for multi-model features. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Advisor rejects model | Model too large for device memory. | Pick smaller or more quantized model. |
| Recommended model low quality | Candidate set lacks quality options. | Offer optional download. |
| Still crashes | Workload changed after recommendation. | Reduce loaded workers and re-check. |

    ## Privacy notes

    Model recommendations can be computed locally from device and model metadata. Avoid sending device identifiers, local paths, or installed model lists to remote telemetry without opt-in.

    ## Related guides

    - [`model-manager.md`](./model-manager.md)
- [`chat-sessions.md`](./chat-sessions.md)
- [`vision-inference.md`](./vision-inference.md)
