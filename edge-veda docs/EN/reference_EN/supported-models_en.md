---
title: "Supported models"
description: "Reference for model families and preconfigured ModelRegistry entries supported by Edge Veda."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/model_advisor.dart"
  - "README.md"
---

# Supported models

This page lists the model families and preconfigured models that Edge Veda supports through the Flutter SDK.

Edge Veda can run local models for text generation, tool calling, embeddings, vision, speech-to-text, text-to-speech, image generation, and RAG. Support depends on model format, quantization level, target device memory, GPU backend availability, and the feature being used.

## Model support summary

| Capability | Supported model type | Runtime component | Notes |
| --- | --- | --- | --- |
| Text generation | GGUF LLM | `EdgeVeda`, `StreamingWorker`, `ChatSession` | Uses llama.cpp backend with persistent worker isolates. |
| Streaming chat | GGUF instruction/chat LLM | `generateStream()`, `ChatSession.sendStream()` | Use the chat template that matches the model family. |
| Function calling | Tool-capable GGUF LLM | `ChatSession.sendWithTools()` | Qwen3 0.6B is the recommended small tool-calling model. |
| Structured output | GGUF LLM + GBNF grammar | `sendStructured()`, `GenerateOptions.grammarStr` | Use schema validation and JSON recovery for production flows. |
| Embeddings | GGUF embedding model | `EdgeVeda.embed()` | Embeddings are returned as normalized vectors. |
| RAG | Embedding model + generator model | `VectorIndex`, `RagPipeline` | Use a small embedder and a generator that fits the device. |
| Vision | VLM GGUF + `mmproj` file | `VisionWorker`, `initVision()` | Vision models require both the main model and projector. |
| Speech-to-text | Whisper GGML model | `WhisperSession`, `WhisperWorker` | Uses whisper.cpp. |
| Text-to-speech | iOS system voices | `TtsService` | Uses `AVSpeechSynthesizer`; no model file required. |
| Image generation | Stable Diffusion-compatible model | `ImageWorker`, image generation APIs | Uses stable-diffusion.cpp with Metal acceleration where available. |

## Recommended starter models

| Use case | Recommended model | Why |
| --- | --- | --- |
| Chat on iPhone | `ModelRegistry.llama32_1b` | Good first model for text generation with manageable size. |
| Tool calling | `ModelRegistry.qwen3_06b` | Compact model with tool-calling capability. |
| Vision on mobile | `ModelRegistry.smolvlm2_500m` + `ModelRegistry.smolvlm2_500m_mmproj` | Mobile-oriented VLM pair for image description. |
| Low-end vision | `ModelRegistry.smolvlm2_256m` + `ModelRegistry.smolvlm2_256m_mmproj` | Smaller vision pair for constrained devices. |
| English STT | `ModelRegistry.whisperTinyEn` | Fast, low-memory speech recognition. |
| Better English STT | `ModelRegistry.whisperBaseEn` | Higher accuracy than tiny with still moderate size. |
| Multilingual STT | `ModelRegistry.whisperSmall` | Good multilingual option for stronger devices. |

## Text models

| Registry entry | Model | Approx. size | Format | Quantization | Capabilities | Best for |
| --- | --- | ---: | --- | --- | --- | --- |
| `llama32_1b` | Llama 3.2 1B Instruct | ~668 MB | `GGUF` | `Q4_K_M` | `chat`, `instruct` | Default mobile chat and general generation. |
| `qwen3_06b` | Qwen3 0.6B | ~397 MB | `GGUF` | `Q4_K_M` | `chat`, `tool-calling` | Tool calling and compact agent-style flows. |
| `tinyLlama` | TinyLlama 1.1B Chat | ~669 MB | `GGUF` | `Q4_K_M` | `chat` | Very lightweight chat demos. |
| `gemma2_2b` | Gemma 2 2B Instruct | ~1.6 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct` | Higher quality when memory allows. |
| `phi35_mini` | Phi 3.5 Mini Instruct | ~2.3 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct`, `reasoning` | Reasoning-heavy tasks on larger devices. |
| `llama31_8b` | Llama 3.1 8B Instruct | ~4.9 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct`, `reasoning`, `tool-calling` | Desktop-class reasoning. |
| `mistral_nemo_12b` | Mistral Nemo 12B Instruct | ~7.1 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct`, `reasoning` | macOS/desktop-class workloads. |

## Vision models

Vision models require two files:

1. the main VLM model;
2. the `mmproj` multimodal projector.

| Registry entry | Model | Approx. size | Format | Quantization | Capabilities | Best for |
| --- | --- | ---: | --- | --- | --- | --- |
| `smolvlm2_256m` | SmolVLM2 256M Video Instruct | ~167 MB | `GGUF` | `Q8_0` | `vision` | Low-memory image description. |
| `smolvlm2_256m_mmproj` | SmolVLM2 256M Multimodal Projector | ~99 MB | `GGUF` | `Q8_0` | `vision-projector` | Required projector for `smolvlm2_256m`. |
| `smolvlm2_500m` | SmolVLM2 500M Video Instruct | ~417 MB | `GGUF` | `Q8_0` | `vision` | Recommended mobile VLM. |
| `smolvlm2_500m_mmproj` | SmolVLM2 500M Multimodal Projector | ~190 MB | `GGUF` | `F16` | `vision-projector` | Required projector for `smolvlm2_500m`. |
| `llava16_mistral_7b` | LLaVA 1.6 Mistral 7B | ~4.8 GB | `GGUF` | `Q4_K_M` | `vision`, `chat` | macOS high-quality image understanding. |
| `llava16_mistral_7b_mmproj` | LLaVA 1.6 Mistral 7B Projector | ~624 MB | `GGUF` | `F16` | `vision-projector` | Required projector for `llava16_mistral_7b`. |
| `qwen2vl_7b` | Qwen2-VL 7B Instruct | ~4.5 GB | `GGUF` | `Q4_K_M` | `vision`, `chat`, `ocr` | OCR and screen reading on macOS-class devices. |
| `qwen2vl_7b_mmproj` | Qwen2-VL 7B Projector | ~892 MB | `GGUF` | `F16` | `vision-projector` | Required projector for `qwen2vl_7b`. |

## Speech-to-text models

| Registry entry | Model | Approx. size | Format | Capabilities | Best for |
| --- | --- | ---: | --- | --- | --- |
| `whisperTinyEn` | Whisper Tiny English | ~77 MB | `GGML` | `stt` | Fast English transcription on mobile. |
| `whisperBaseEn` | Whisper Base English | ~148 MB | `GGML` | `stt` | Better English accuracy with moderate memory. |
| `whisperSmall` | Whisper Small Multilingual | ~244 MB | `GGML` | `stt` | Multilingual transcription on stronger devices. |
| `whisperMedium` | Whisper Medium Multilingual | ~769 MB | `GGML` | `stt` | Production-quality multilingual STT on macOS-class devices. |
| `whisperLargeV3` | Whisper Large v3 Multilingual | ~3.1 GB | `GGML` | `stt` | Highest quality STT for 8 GB+ Mac targets. |

## Text-to-speech models

Edge Veda text-to-speech uses the operating system TTS engine through `TtsService`.

On iOS, this means:

- no additional model file is required;
- available voices depend on the device and installed system voices;
- voice quality and language support are controlled by iOS.

```dart
final tts = TtsService();
final voices = await tts.availableVoices();

await tts.speak(
  'Hello from on-device AI',
  voiceId: voices.first.id,
  rate: 0.5,
);
```

## Image generation models

Edge Veda includes image generation APIs built around stable-diffusion.cpp. A model must be compatible with the native image backend and fit within the target device memory budget.

Use smaller or turbo-oriented models first. Larger diffusion models can require several GB of memory and may be auto-evicted by the scheduler when the app is under memory pressure.

## Model selection rules

Use this order when choosing a model:

1. Select the capability: chat, tools, vision, STT, embeddings, RAG, or image generation.
2. Select the smallest model that can satisfy the task.
3. Check device memory and disk space before download.
4. Use `ModelAdvisor.canRun()` or `ModelAdvisor.recommend()` when available.
5. Match `ChatTemplateFormat` to the model family.
6. Run the app in `release` or `profile` mode for performance validation.
7. Measure real device behavior for at least one long session.

## Device fit guidance

| Target | Recommended direction |
| --- | --- |
| 4 GB iPhone | Prefer `llama32_1b`, `qwen3_06b`, `whisperTinyEn`, smaller VLMs, reduced `contextLength`. |
| 6–8 GB iPhone | Can test 1B–2B text models, mobile VLMs, RAG, and STT with budget monitoring. |
| iPad / high-memory iPhone | Can combine more workloads but should still use `Scheduler`. |
| Apple Silicon Mac | Suitable for larger LLMs, larger VLMs, and stronger Whisper models. |
| Android | Roadmap / validation target. Treat support as not production-validated until confirmed by current release notes. |

## Compatibility checks

Before downloading or loading a model, check:

- model format is supported by the target API;
- file size fits available storage;
- estimated memory fits the device;
- quantization level is appropriate for quality and speed;
- model family has a matching chat template;
- tool-calling flows use a tool-capable model;
- VLM flows include the correct `mmproj` file;
- STT flows use Whisper-compatible `.bin` files;
- license terms of the model allow the intended product use.

## Related docs

- [Configuration options](./configuration-options.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Model advisor](../guides/model-advisor.md)
- [Model manager](../guides/model-manager.md)
