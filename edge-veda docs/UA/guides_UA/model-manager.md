---
    title: "Model manager"
    description: "Організуйте local model files, registries і multi-model workflows через ModelManager."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Model manager

    `ModelManager` допомагає app організувати local model files і перемикатися між capabilities: chat, embeddings, RAG, vision, STT та image generation. Використовуйте його, коли product потребує більше одного model або дозволяє users download optional models.

    ## Що ви створите

    У цьому guide показано, як:

    - спланувати model storage;
- register model metadata;
- check required files;
- coordinate multiple model types;
- avoid loading too many models at once;

    ## Коли використовувати

    Використовуйте `ModelManager`, коли model paths, downloads, capabilities і user preferences потребують одного source of truth.

    ## Basic example

    ```dart
final manager = ModelManager();

final chatModel = await manager.getModel('llama-3.2-1b');
final embeddingModel = await manager.getModel('minilm-l6-v2');

if (!await chatModel.exists()) {
  throw StateError('Chat model is not installed.');
}

final runtime = EdgeVeda();
await runtime.init(EdgeVedaConfig(
  modelPath: chatModel.path,
  contextLength: 2048,
  useGpu: true,
));
```

    ## Recommended practices

    - Store model metadata separately from model files.
- Track capability, family, quantization, size, template, and checksum.
- Validate paths before calling `EdgeVeda.init()`.
- Use `ModelAdvisor` before loading large models.
- Unload idle runtimes under memory pressure.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `id` | `String` | Stable model identifier. |
| `path` | `String` | Local model file path. |
| `capability` | `String` | Chat, embedding, vision, STT, image, or other capability. |
| `templateFormat` | `ChatTemplateFormat?` | Required chat template for LLMs. |
| `mmprojPath` | `String?` | Projection file for VLMs. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Loaded models | More loaded models increase memory pressure. | Load on demand. |
| Cold start | First model load can be slow. | Show loading state. |
| RAG | May need embedder and generator. | Use compact embedder and unload idle models. |
| Image generation | Very memory-heavy. | Initialize only inside the feature. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Path not found | File moved or download failed. | Validate paths before initialization. |
| Poor output | Wrong chat template. | Store `ChatTemplateFormat` in metadata. |
| Crash under pressure | Too many models loaded. | Dispose idle runtimes and use scheduler. |

    ## Privacy notes

    Model files usually do not contain user data, but indexes, transcripts, and generated artifacts do. Keep model metadata separate from private user content.

    ## Related guides

    - [`model-advisor.md`](./model-advisor.md)
- [`rag-pipeline.md`](./rag-pipeline.md)
- [`image-generation.md`](./image-generation.md)
