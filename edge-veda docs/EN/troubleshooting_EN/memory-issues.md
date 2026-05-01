---
title: "Memory issues"
description: "Troubleshoot memory pressure, iOS termination, model eviction, context length, concurrent workloads, and long-session stability in Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Memory issues

Use this page when an Edge Veda app is killed by iOS, crashes during model loading, slows down after a long session, fails under concurrent workloads, or reports memory pressure through runtime diagnostics.

On-device AI workloads are memory-heavy. Edge Veda can supervise workers and degrade gracefully, but app-level choices still matter: model size, context length, worker concurrency, image generation, RAG indexes, and long chat history can all push the device beyond safe limits.

## Common symptoms

| Symptom | Likely cause | First action |
| --- | --- | --- |
| App closes without a Dart exception | iOS killed the process under memory pressure. | Reproduce with Xcode attached and check device logs. |
| `EdgeVeda.init()` crashes | Model does not fit available memory. | Try a smaller model and reduce `contextLength`. |
| First response works, later responses crash | Chat history or KV cache grows too large. | Summarize history and lower context size. |
| Image generation crashes | Diffusion model uses too much memory. | Run image generation alone and dispose idle workers. |
| RAG app crashes after indexing | Vector index or document chunks are too large. | Reduce chunk count, dimensions, or loaded documents. |
| Performance degrades over time | Thermal or memory pressure triggers runtime policy. | Inspect telemetry and reduce concurrent workloads. |

## Quick stabilization steps

1. Test on a physical iPhone, not only the simulator.
2. Start with a small known-good model.
3. Lower `contextLength`.
4. Disable nonessential workers.
5. Avoid running text generation, STT, vision, RAG, and image generation at the same time.
6. Dispose idle workers before loading another large model.
7. Use `ModelAdvisor` to select a model that fits the device tier.
8. Collect `getMemoryStats()` before and after model load.

## Check memory before loading

```dart
final device = DeviceProfile.detect();

final recommendation = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);

final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

print('Device: ${device.deviceName}, ${device.totalRamGB}GB');
print('Recommended: ${recommendation.bestMatch?.model.name}');
print('Can run: $canRun');
```

Initialize with conservative defaults:

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

## Reduce text generation memory

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Larger models consume more RAM. | Start with a 1B-class model before testing larger models. |
| Quantization | Lower-bit quantization usually reduces memory. | Use a supported quantization that balances quality and fit. |
| `contextLength` | Larger context increases KV cache memory. | Use the smallest context that supports the product workflow. |
| Long chat history | History expands prompts and context pressure. | Summarize, trim, or persist older turns outside the active context. |
| Concurrent generation | Multiple workloads compete for memory. | Queue heavy work through the scheduler. |

## Handle long chat sessions

Recommended pattern:

- Keep recent turns in the active prompt.
- Summarize older turns.
- Store older raw turns outside the active inference context if needed.
- Use smaller `contextLength` on lower-memory devices.
- Monitor latency and memory after each turn.

```dart
final stats = edgeVeda.getMemoryStats();
print('Memory stats: $stats');
```

If memory keeps rising, check whether the app holds references to old responses, images, audio chunks, embeddings, or document content.

## Avoid concurrent heavy workers

| Scenario | Safer pattern |
| --- | --- |
| Chat + STT + TTS | Keep chat loaded, stream STT in short chunks, release audio buffers quickly. |
| Vision + chat | Process frames with backpressure; do not queue every frame. |
| RAG + chat | Keep the index compact and inject only top relevant chunks. |
| Image generation + chat | Pause or dispose chat worker before loading the image model on lower-memory devices. |

## Image generation memory pressure

If the app is killed during image generation:

- Generate one image at a time.
- Lower resolution if supported by the selected model path.
- Avoid running image generation alongside STT, vision, or RAG.
- Dispose the image worker after use or rely on idle auto-disposal.
- Test on higher-memory devices before enabling the feature by default.

## RAG and vector index memory pressure

Fix checklist:

- Reduce chunk size and overlap.
- Limit the number of documents loaded into the active session.
- Persist the vector index to disk and load only what the flow needs.
- Inject only the top `k` chunks into the prompt.
- Keep raw documents out of the active prompt.
- Measure memory before indexing, after indexing, and after generation.

## iOS kills the app without an exception

Dart may not receive an exception when iOS terminates the process under memory pressure.

Confirm with:

1. Run the app from Xcode on a physical device.
2. Reproduce the crash.
3. Open device logs.
4. Look for memory pressure, jetsam, or termination messages.

Then change:

- Use a smaller model.
- Lower `contextLength`.
- Disable simultaneous workers.
- Reduce document and embedding batch sizes.
- Release large images, audio buffers, and document strings.
- Avoid multiple `EdgeVeda` runtime instances.

## Prevent duplicate runtime instances

Avoid:

```dart
final edgeVedaA = EdgeVeda();
final edgeVedaB = EdgeVeda();
await edgeVedaA.init(EdgeVedaConfig(modelPath: modelPath));
await edgeVedaB.init(EdgeVedaConfig(modelPath: modelPath));
```

Prefer a single app-level runtime holder:

```dart
class RuntimeProvider {
  RuntimeProvider(this.modelPath);

  final String modelPath;
  EdgeVeda? _edgeVeda;

  Future<EdgeVeda> get runtime async {
    if (_edgeVeda != null) return _edgeVeda!;
    final instance = EdgeVeda();
    await instance.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));
    _edgeVeda = instance;
    return instance;
  }
}
```

## Memory-safe troubleshooting flow

1. Run the smallest supported model.
2. Run one prompt with short input.
3. Run ten prompts with short input.
4. Increase `contextLength` only if required.
5. Add chat history.
6. Add RAG retrieval.
7. Add STT, TTS, or vision.
8. Add image generation last.

If memory fails at a step, the last added feature or setting is the primary suspect.

## Diagnostics to collect

Attach:

- Device model and RAM tier if known.
- iOS version.
- Edge Veda package version.
- Model name, format, quantization level, and file size.
- `EdgeVedaConfig` values, especially `contextLength` and `useGpu`.
- Whether RAG, STT, TTS, vision, or image generation was active.
- Memory stats before load, after load, before generation, and after generation.
- Xcode device logs if iOS terminates the app.
- A minimal reproduction that loads the same model and runs one prompt.

## Related docs

- [Model loading issues](./model-loading-issues.md)
- [Installation issues](./installation-issues.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Memory management](../guides/memory-management.md)
- [Storage and memory](../reference/storage-and-memory.md)
- [Model advisor](../guides/model-advisor.md)
- [Runtime policy](../guides/runtime-policy.md)
