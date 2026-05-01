---
    title: "Image generation"
    description: "Generate images on device with Edge Veda ImageWorker and stable-diffusion.cpp."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Image generation

    Image generation creates images from text prompts on device. Edge Veda uses a persistent `ImageWorker` around a Stable Diffusion backend so the model can load once and generate multiple images while respecting memory and thermal constraints.

    ## What you will build

    This guide shows how to:

    - initialize image generation;
- submit a prompt;
- track progress by diffusion step;
- configure sampler, scheduler, size, and CFG scale;
- handle memory pressure and idle disposal;

    ## When to use it

    Use image generation for creative tools, offline prototyping, private visual drafts, style exploration, and local-first multimodal apps.

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

    | Name | Type | Description |
    | --- | --- | --- |
    | `prompt` | `String` | Text prompt for generation. |
| `negativePrompt` | `String?` | Optional content to avoid, if exposed. |
| `width` / `height` | `int` | Output image dimensions. |
| `steps` | `int` | Diffusion steps. |
| `cfgScale` | `double` | Prompt adherence strength. |
| `sampler` | enum | Sampling algorithm. |
| `onProgress` | callback | Per-step generation progress. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

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
