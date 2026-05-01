---
title: "FAQ"
description: "Frequently asked questions about Edge Veda setup, models, local inference, performance, memory, permissions, RAG, speech, vision, image generation, and production usage."
status: "draft"
section: "reference"
last_reviewed: "2026-05-01"
source_files:
  - "README.md"
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/model_advisor.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/rag_pipeline.dart"
---

# FAQ

This FAQ answers common questions about using Edge Veda in Flutter applications.

For terminology, see [Glossary](./glossary.md).

## General

### What is Edge Veda?

Edge Veda is a managed on-device AI runtime for Flutter. It provides APIs for local text generation, streaming chat, embeddings, RAG, vision, speech-to-text, image generation, runtime supervision, and observability.

### What problem does Edge Veda solve?

Many on-device AI demos work for short examples but become unstable in real sessions. Edge Veda focuses on long-lived workers, memory limits, thermal behavior, battery drain, scheduler policies, and traceability.

### Is Edge Veda only a wrapper around a model?

No. The SDK includes high-level Dart APIs, persistent workers, model management, RAG utilities, runtime supervision, telemetry, scheduler budgets, and native inference bindings.

### Does Edge Veda require a cloud API key?

No. Local inference does not require a provider API key. A host application may still add network features for model download, sync, analytics, or optional cloud fallback.

### Does Edge Veda send prompts to a server?

Not by default. Inference is local unless the host app explicitly adds network behavior. If an app implements `cloud handoff`, document when and what data may leave the device.

## Platforms

### Which platforms are supported?

The validated primary platform is iOS device with Metal acceleration. macOS is useful for development and larger workloads. iOS simulator can be used for development but is not a reliable performance target. Android support may require validation depending on the current release status.

### Can I test performance on a simulator?

Use simulators for UI and integration work only. Performance, GPU behavior, microphone behavior, camera behavior, and memory pressure should be validated on a physical device.

### Why does the documentation say “real device” so often?

On-device AI behavior depends on physical constraints: thermal state, battery, memory pressure, camera input, microphone input, and GPU availability. Simulators do not represent those constraints accurately.

## Installation and setup

### How do I install Edge Veda?

Add the package to `pubspec.yaml`, then initialize the runtime with `EdgeVedaConfig`.

```yaml
dependencies:
  edge_veda: ^2.1.0
```

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

### What is `modelPath`?

`modelPath` is the local file path to the model that should be loaded by the runtime. The file must already exist on the device.

### Where should model files be stored?

Use `ModelManager` for downloaded models when possible. If the app manages its own files, store them in an app-controlled directory and keep a cleanup path for users.

### Can I bundle a model with the app?

Yes, but check app size limits, license terms, and whether the model file is appropriate for distribution. For large models, runtime download is often more practical.

## Models

### What model format should I use for text generation?

Use a llama.cpp-compatible `GGUF` model.

### Can I load any `GGUF` model?

Any compatible `GGUF` model can be loaded by file path, but practical support depends on memory, quantization, context length, chat template, and device class. Always test on target hardware.

### Which model should I start with?

For mobile text generation, start with a compact model such as a 0.6B–1B model. For tool calling, choose a tool-capable model. For vision, start with a small VLM and its matching `mmproj` file.

### What is `ModelRegistry`?

`ModelRegistry` is a collection of preconfigured model metadata used by examples and model download flows.

### What is `ModelManager`?

`ModelManager` downloads, stores, locates, and validates model files.

### How do I choose the best model for a device?

Use the smallest model that can satisfy the task, check storage and memory, use `ModelAdvisor` where available, and validate with realistic prompts on the real device.

### Why does a VLM need an `mmproj` file?

Many vision-language models require a multimodal projector. The projector maps image features into the language model space. The main VLM file and `mmproj` file must match.

### Can I use a different `mmproj` from another model?

No. Do not mix projectors from another model family or model size unless the model provider explicitly says they are compatible.

## Configuration

### What is the minimal configuration?

```dart
await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
));
```

The defaults are suitable for a first test, but production apps should configure `contextLength`, `useGpu`, `numThreads`, and `maxMemoryMb` intentionally.

### What does `contextLength` control?

`contextLength` controls how many tokens can fit into the model context. Larger values allow longer conversations or prompts, but increase memory use.

### What should I use for `maxMemoryMb`?

Start with a conservative value for the target device. For 4 GB mobile devices, keep the budget low enough to leave room for UI, camera, audio, vector indexes, and other app components.

### Should `useGpu` be enabled?

Enable `useGpu` on validated Apple devices where Metal acceleration is available. Disable it only when debugging or when the target backend does not support GPU execution.

### What do `kvCacheTypeK` and `kvCacheTypeV` do?

They control KV cache quantization. The default `Q8_0` values reduce memory use and are a good mobile default.

## Text generation and chat

### Should I use `generate()` or `generateStream()`?

Use `generate()` when you need the complete final text. Use `generateStream()` when user experience benefits from incremental output.

### What is the difference between `GenerateOptions.stream` and `generateStream()`?

`generateStream()` is the streaming API. `GenerateOptions.stream` is an option used by compatible flows to indicate streaming behavior. Prefer the explicit streaming API for token-by-token UI.

### How do I make output more deterministic?

Lower `temperature`, reduce sampling randomness, and use `jsonMode` or `grammarStr` for structured output.

### How do I stop generation?

Use `stopSequences` to stop on specific text, or use `CancelToken` where the API supports cancellation.

### Why does the model repeat itself?

Check `repeatPenalty`, prompt quality, chat template, context length, and whether the model is appropriate for the task.

## Structured output and function calling

### How do I get valid JSON?

Use `jsonMode` for simple JSON output. For stricter control, use `grammarStr` with GBNF grammar or a higher-level structured output helper.

### What is GBNF?

GBNF is a grammar format used for constrained decoding. It limits the model output to a defined structure.

### Does function calling work with every model?

No. Use a tool-capable model and the correct chat template. General chat models may produce unreliable tool calls.

### What is `ToolRegistry`?

`ToolRegistry` is the set of tools available to a `ChatSession`.

### Should tools call external services?

They can, but that is host app behavior. If a tool uses the network, document that clearly because it changes the privacy model of the feature.

## Embeddings and RAG

### What is RAG?

RAG means Retrieval-Augmented Generation. The app retrieves relevant document chunks and injects them into the prompt before generation.

### What do I need to build a RAG feature?

You need an embedding model, source documents, chunking logic, a vector index, retrieval configuration, and a generation model.

### What is `VectorIndex`?

`VectorIndex` is a Dart vector search component used to store and search embeddings.

### What does `topK` mean?

`topK` is the number of chunks requested from retrieval.

### What does `minScore` mean?

`minScore` is the minimum similarity score required for a retrieved chunk to be used.

### Why are RAG answers weak?

Common causes include poor chunking, weak embeddings, too low `minScore`, too high or too low `topK`, missing source content, or a generation model that is too small for the question.

## Vision, speech, and image generation

### How do I use vision?

Initialize a vision model with both `modelPath` and `mmprojPath`, then call the vision API or worker method for images or frames.

### Why should vision use a persistent worker?

Vision models and projectors can be large. Keeping them loaded avoids repeated load time during camera or repeated image workflows.

### Does speech-to-text run locally?

Yes, STT uses local Whisper-compatible models through the native backend.

### Do I need microphone permission?

Only for live recording or voice input. Transcribing an existing file may require file access depending on how the app obtains the file.

### Does text-to-speech require a model file?

If the app uses OS speech APIs, no additional model file is required. Available voices depend on the operating system.

### Why is image generation memory-heavy?

Diffusion workloads allocate model memory and intermediate buffers. Memory grows with image size, steps, model size, sampler, and concurrent workloads.

## Performance and memory

### How should I measure performance?

Measure on a physical device in `release` or `profile` mode. Report model, quantization, device, OS, context length, prompt size, p50/p95 latency, tokens per second, peak memory, thermal state, and battery behavior.

### What is the most important latency metric?

Use `p95_latency_ms` for production decisions because it shows how slow the experience gets for the slowest common cases.

### How do I reduce memory use?

Use a smaller model, lower `contextLength`, keep KV cache at `Q8_0`, dispose idle workers, avoid concurrent heavy workloads, and reduce image/vision settings.

### What should I do when `MemoryStats.isHighPressure` is true?

Stop optional workloads, avoid loading another model, reduce context or generation length, and dispose idle workers if possible.

### Why does memory stay high after a call finishes?

Persistent workers keep models loaded for faster subsequent calls. Dispose the relevant worker or runtime when the feature is no longer needed.

### What is the `Scheduler` for?

The `Scheduler` coordinates workloads under budgets for latency, thermal state, battery drain, and memory ceilings. It can degrade lower-priority workloads before higher-priority workloads.

## Permissions and privacy

### Which permissions are required for basic text generation?

None beyond app sandbox file access to the model file.

### Which features need microphone permission?

Live speech-to-text and voice assistant flows.

### Which features need camera permission?

Only features that capture images directly from the camera for vision inference.

### Does model download require network permission?

Yes, the app needs network access when downloading model files at runtime.

### Should traces contain prompts and outputs?

Not by default. Avoid storing sensitive prompts, documents, transcripts, image descriptions, or generated outputs in production traces.

## Troubleshooting

### Model load fails. What should I check?

Check that the file exists, the format is supported, the file is complete, the checksum matches, the model fits memory, and the path is accessible.

### Generation is slow. What should I check?

Check build mode, model size, quantization, context length, GPU setting, thermal state, battery level, and whether other workloads are active.

### The UI freezes. What is wrong?

A blocking inference call may be running on the UI thread. Long-running native inference should run through Edge Veda workers or isolates.

### Vision fails even though the model loads.

Check that `mmprojPath` points to the matching projector and that image dimensions and format match the API expectations.

### STT is slow or delayed.

Check audio chunk size, sample rate conversion, model size, device thermal state, and whether the app is using the simulator.

### The app crashes under memory pressure.

Use a smaller model, lower `contextLength`, dispose idle workers, reduce image size, avoid simultaneous heavy workloads, and configure scheduler budgets.

## Production readiness

### What should I verify before release?

Verify real-device performance, permissions, model licenses, storage cleanup, memory behavior, privacy claims, logging, fallback behavior, and error handling.

### Should I document model licenses?

Yes. Document the license for each bundled or downloadable model and verify that it allows your product use.

### Should I expose model deletion to users?

Yes. Users should be able to remove downloaded models and clear generated artifacts where applicable.

### Can Edge Veda be used in regulated or offline-first apps?

It can support offline-first and privacy-sensitive designs, but the full app must be reviewed. Inference is local by default, but logs, tools, sync, downloads, analytics, and cloud fallback can change the privacy and compliance model.

## Documentation

### Where should I add new docs?

Add conceptual docs under `concepts`, task-based docs under `guides`, API and parameter references under `reference`, platform-specific notes under `platforms`, and runnable scenarios under `examples`.

### How should API pages be reviewed?

Check the public Dart signature, parameters, return fields, errors, examples, platform constraints, performance notes, privacy notes, and source references.

### How often should docs be updated?

Update docs whenever public APIs, model registry entries, build requirements, supported platforms, default configuration values, or production behavior changes.

## Related docs

- [Glossary](./glossary.md)
- [Configuration options](./configuration-options.md)
- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Performance metrics](./performance-metrics.md)
- [Storage and memory](./storage-and-memory.md)
- [Permissions](./permissions.md)
- [Environment variables](./environment-variables.md)
