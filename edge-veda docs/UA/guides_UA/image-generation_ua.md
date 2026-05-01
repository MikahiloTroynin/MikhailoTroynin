---
    title: "Image generation"
    description: "Генеруйте images on device через Edge Veda ImageWorker і stable-diffusion.cpp."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Image generation

    `Image generation` створює images з text prompts on device. Edge Veda використовує persistent `ImageWorker` навколо Stable Diffusion backend, щоб model load once і generate multiple images з урахуванням memory і thermal constraints.

    ## Що ви створите

    У цьому guide показано, як:

    - initialize image generation;
- submit prompt;
- track progress by diffusion step;
- configure sampler, scheduler, size і CFG scale;
- handle memory pressure і idle disposal;

    ## Коли використовувати

    Використовуйте image generation для creative tools, offline prototyping, private visual drafts, style exploration і local-first multimodal apps.

    ## Basic example

    ```dart
final imageWorker = ImageWorker();

await imageWorker.spawn();

await imageWorker.initImageGeneration(
  modelPath: sdModelPath,
  useGpu: true,
);

final result = await imageWorker.generateImage(
  prompt: 'A small robot reading documentation, soft studio light',
  width: 512,
  height: 512,
  steps: 8,
  cfgScale: 7.0,
  sampler: ImageSampler.eulerA,
  onProgress: (progress) {
    print('Step ${progress.step} / ${progress.totalSteps}');
  },
);

await result.save('/path/to/output.png');
```

    ## Recommended practices

    - Do not load the image model on app startup.
- Use progress callbacks because image generation can be slow.
- Start with `512x512` and low steps for previews.
- Use `ModelAdvisor` before enabling large image models.
- Release or allow idle disposal when the feature is not used.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `prompt` | `String` | Text prompt for generation. |
| `negativePrompt` | `String?` | Optional content to avoid, if exposed. |
| `width` / `height` | `int` | Output image dimensions. |
| `steps` | `int` | Diffusion steps. |
| `cfgScale` | `double` | Prompt adherence strength. |
| `sampler` | enum | Sampling algorithm. |
| `onProgress` | callback | Per-step generation progress. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Model size | Image models use significant memory. | Check with `ModelAdvisor`. |
| Steps | More steps improve quality but take longer. | Offer preview and quality modes. |
| Image size | Larger images increase memory and latency. | Start with `512x512`. |
| Cold start | First run includes model load. | Show loading state. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Out of memory | Model too large or other workers loaded. | Unload idle workers and use smaller model. |
| Prompt ignored | Prompt vague or CFG too low. | Make prompt specific and tune `cfgScale`. |
| UI frozen | No progress display. | Use `onProgress` and keep UI responsive. |

    ## Privacy notes

    Prompts and generated images can be sensitive. Keep generation local, avoid automatic uploads, and clearly show when images are saved.

    ## Related guides

    - [`vision-inference.md`](./vision-inference.md)
- [`model-manager.md`](./model-manager.md)
- [`model-advisor.md`](./model-advisor.md)
