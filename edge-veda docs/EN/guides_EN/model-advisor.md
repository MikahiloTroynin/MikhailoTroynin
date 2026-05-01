---
    title: "Model advisor"
    description: "Use ModelAdvisor to choose models that fit the current device and use case."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Model advisor

    `ModelAdvisor` helps choose a model based on device capability and use case. It scores or checks models against fit, quality, speed, and context needs so the app can avoid loading a model that will crash, run too slowly, or exceed memory limits.

    ## What you will build

    This guide shows how to:

    - check whether a model can run;
- recommend a model for a use case;
- generate an `EdgeVedaConfig`;
- explain model trade-offs to users;
- handle lower-memory devices;

    ## When to use it

    Use `ModelAdvisor` before initializing large chat, vision, speech, embedding, or image models.

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

    | Name | Type | Description |
    | --- | --- | --- |
    | `canRun()` | method | Checks whether a model can fit the device. |
| `recommend()` | method | Ranks models for a use case. |
| `ModelUseCase` | enum | Task category used for scoring. |
| `edgeVedaConfig` | `EdgeVedaConfig` | Recommended runtime configuration. |
| `alternatives` | list | Fallback models when preferred model is unsupported. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

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
