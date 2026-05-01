---
    title: "Vision inference"
    description: "Run continuous on-device image and camera-frame analysis with VisionWorker."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Vision inference

    Vision inference lets Edge Veda analyze images or camera frames with an on-device vision-language model. Use it for image descriptions, scene understanding, accessibility, camera assistants, visual inspection, and multimodal apps.

    ## What you will build

    This guide shows how to:

    - spawn a `VisionWorker`;
- initialize a vision model with `initVision()`;
- describe camera frames with `describeFrame()`;
- keep the model loaded across calls;
- apply backpressure to camera processing;

    ## When to use it

    Use vision inference for uploaded image descriptions, camera-frame analysis, visual question answering, and privacy-preserving camera workflows. Do not use it as a substitute for certified measurement or safety-critical vision.

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

    | Name | Type | Description |
    | --- | --- | --- |
    | `modelPath` | `String` | Path to the main vision-language model. |
| `mmprojPath` | `String` | Path to the multimodal projection file. |
| `rgbBytes` | `Uint8List` | RGB frame bytes. |
| `width` / `height` | `int` | Frame dimensions. |
| `maxTokens` | `int` | Maximum generated description length. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

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
