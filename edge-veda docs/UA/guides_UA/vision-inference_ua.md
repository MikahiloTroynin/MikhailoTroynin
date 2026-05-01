---
    title: "Vision inference"
    description: "Запускайте continuous on-device image і camera-frame analysis через VisionWorker."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Vision inference

    `Vision inference` дає Edge Veda можливість analyze images або camera frames через on-device vision-language model. Використовуйте це для image descriptions, scene understanding, accessibility, camera assistants, visual inspection і multimodal apps.

    ## Що ви створите

    У цьому guide показано, як:

    - spawn `VisionWorker`;
- initialize vision model через `initVision()`;
- describe camera frames через `describeFrame()`;
- keep model loaded across calls;
- застосувати backpressure для camera processing;

    ## Коли використовувати

    Використовуйте vision inference для uploaded image descriptions, camera-frame analysis, visual question answering і privacy-preserving camera workflows. Не використовуйте його як заміну certified measurement або safety-critical vision.

    ## Basic example

    ```dart
final visionWorker = VisionWorker();

await visionWorker.spawn();

await visionWorker.initVision(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  contextSize: 2048,
  useGpu: true,
);

final result = await visionWorker.describeFrame(
  rgbBytes,
  width,
  height,
  prompt: 'Describe what you see.',
  maxTokens: 100,
);

print(result.description);
```

    ## Recommended practices

    - Keep `VisionWorker` alive while the camera feature is active.
- Process the latest useful frame; do not queue frames forever.
- Use short prompts and low `maxTokens` for continuous scanning.
- Store both `modelPath` and `mmprojPath` for VLMs.
- Reduce resolution under thermal or memory pressure.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `modelPath` | `String` | Path to the main vision-language model. |
| `mmprojPath` | `String` | Path to the multimodal projection file. |
| `rgbBytes` | `Uint8List` | RGB frame bytes. |
| `width` / `height` | `int` | Frame dimensions. |
| `maxTokens` | `int` | Maximum generated description length. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Resolution | Higher resolution increases latency and memory. | Start around 480–640px width. |
| `maxTokens` | More tokens slow analysis. | Keep descriptions short. |
| Queueing | Deep queues return stale results. | Drop frames or keep only latest. |
| Thermal pressure | Camera + VLM can heat device. | Use scheduler QoS. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Vision init fails | Wrong model or `mmprojPath`. | Verify compatible files. |
| Old frames described | Queue too deep. | Process latest frame only. |
| Generic output | Prompt vague or image unclear. | Use a specific question and improve image quality. |

    ## Privacy notes

    Vision can process private surroundings, documents, faces, and objects. Keep frames local, avoid saving images by default, and make camera use visible.

    ## Related guides

    - [`image-generation.md`](./image-generation.md)
- [`model-manager.md`](./model-manager.md)
- [`model-advisor.md`](./model-advisor.md)
