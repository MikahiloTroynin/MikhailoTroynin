---
title: "Підтримувані моделі"
description: "Reference для model families і preconfigured ModelRegistry entries, які підтримує Edge Veda."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/model_advisor.dart"
  - "README.md"
---

# Підтримувані моделі

Ця сторінка перелічує model families і preconfigured models, які Edge Veda підтримує через Flutter SDK.

Edge Veda може запускати локальні моделі для text generation, tool calling, embeddings, vision, speech-to-text, text-to-speech, image generation і RAG. Підтримка залежить від model format, quantization level, пам'яті target device, доступності GPU backend і конкретної capability.

## Summary підтримки моделей

| Capability | Supported model type | Runtime component | Нотатки |
| --- | --- | --- | --- |
| Text generation | GGUF LLM | `EdgeVeda`, `StreamingWorker`, `ChatSession` | Використовує llama.cpp backend з persistent worker isolates. |
| Streaming chat | GGUF instruction/chat LLM | `generateStream()`, `ChatSession.sendStream()` | Використовуйте chat template, що відповідає model family. |
| Function calling | Tool-capable GGUF LLM | `ChatSession.sendWithTools()` | Qwen3 0.6B — рекомендована мала model для tool calling. |
| Structured output | GGUF LLM + GBNF grammar | `sendStructured()`, `GenerateOptions.grammarStr` | Для production flows використовуйте schema validation і JSON recovery. |
| Embeddings | GGUF embedding model | `EdgeVeda.embed()` | Embeddings повертаються як normalized vectors. |
| RAG | Embedding model + generator model | `VectorIndex`, `RagPipeline` | Використовуйте малий embedder і generator, який підходить device. |
| Vision | VLM GGUF + `mmproj` file | `VisionWorker`, `initVision()` | Vision models потребують main model і projector. |
| Speech-to-text | Whisper GGML model | `WhisperSession`, `WhisperWorker` | Використовує whisper.cpp. |
| Text-to-speech | iOS system voices | `TtsService` | Використовує `AVSpeechSynthesizer`; model file не потрібен. |
| Image generation | Stable Diffusion-compatible model | `ImageWorker`, image generation APIs | Використовує stable-diffusion.cpp з Metal acceleration, якщо доступно. |

## Рекомендовані starter models

| Use case | Recommended model | Чому |
| --- | --- | --- |
| Chat на iPhone | `ModelRegistry.llama32_1b` | Хороша перша model для text generation з помірним size. |
| Tool calling | `ModelRegistry.qwen3_06b` | Компактна model з tool-calling capability. |
| Vision на mobile | `ModelRegistry.smolvlm2_500m` + `ModelRegistry.smolvlm2_500m_mmproj` | Mobile-oriented VLM pair для image description. |
| Low-end vision | `ModelRegistry.smolvlm2_256m` + `ModelRegistry.smolvlm2_256m_mmproj` | Менша vision pair для constrained devices. |
| English STT | `ModelRegistry.whisperTinyEn` | Швидкий low-memory speech recognition. |
| Кращий English STT | `ModelRegistry.whisperBaseEn` | Вища accuracy, ніж tiny, з помірним size. |
| Multilingual STT | `ModelRegistry.whisperSmall` | Хороший multilingual варіант для сильніших devices. |

## Text models

| Registry entry | Model | Approx. size | Format | Quantization | Capabilities | Для чого |
| --- | --- | ---: | --- | --- | --- | --- |
| `llama32_1b` | Llama 3.2 1B Instruct | ~668 MB | `GGUF` | `Q4_K_M` | `chat`, `instruct` | Default mobile chat і general generation. |
| `qwen3_06b` | Qwen3 0.6B | ~397 MB | `GGUF` | `Q4_K_M` | `chat`, `tool-calling` | Tool calling і compact agent-style flows. |
| `tinyLlama` | TinyLlama 1.1B Chat | ~669 MB | `GGUF` | `Q4_K_M` | `chat` | Дуже легкі chat demos. |
| `gemma2_2b` | Gemma 2 2B Instruct | ~1.6 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct` | Вища quality, якщо memory дозволяє. |
| `phi35_mini` | Phi 3.5 Mini Instruct | ~2.3 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct`, `reasoning` | Reasoning-heavy tasks на більших devices. |
| `llama31_8b` | Llama 3.1 8B Instruct | ~4.9 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct`, `reasoning`, `tool-calling` | Desktop-class reasoning. |
| `mistral_nemo_12b` | Mistral Nemo 12B Instruct | ~7.1 GB | `GGUF` | `Q4_K_M` | `chat`, `instruct`, `reasoning` | macOS/desktop-class workloads. |

## Vision models

Vision models потребують два files:

1. main VLM model;
2. `mmproj` multimodal projector.

| Registry entry | Model | Approx. size | Format | Quantization | Capabilities | Для чого |
| --- | --- | ---: | --- | --- | --- | --- |
| `smolvlm2_256m` | SmolVLM2 256M Video Instruct | ~167 MB | `GGUF` | `Q8_0` | `vision` | Low-memory image description. |
| `smolvlm2_256m_mmproj` | SmolVLM2 256M Multimodal Projector | ~99 MB | `GGUF` | `Q8_0` | `vision-projector` | Required projector для `smolvlm2_256m`. |
| `smolvlm2_500m` | SmolVLM2 500M Video Instruct | ~417 MB | `GGUF` | `Q8_0` | `vision` | Recommended mobile VLM. |
| `smolvlm2_500m_mmproj` | SmolVLM2 500M Multimodal Projector | ~190 MB | `GGUF` | `F16` | `vision-projector` | Required projector для `smolvlm2_500m`. |
| `llava16_mistral_7b` | LLaVA 1.6 Mistral 7B | ~4.8 GB | `GGUF` | `Q4_K_M` | `vision`, `chat` | macOS high-quality image understanding. |
| `llava16_mistral_7b_mmproj` | LLaVA 1.6 Mistral 7B Projector | ~624 MB | `GGUF` | `F16` | `vision-projector` | Required projector для `llava16_mistral_7b`. |
| `qwen2vl_7b` | Qwen2-VL 7B Instruct | ~4.5 GB | `GGUF` | `Q4_K_M` | `vision`, `chat`, `ocr` | OCR і screen reading на macOS-class devices. |
| `qwen2vl_7b_mmproj` | Qwen2-VL 7B Projector | ~892 MB | `GGUF` | `F16` | `vision-projector` | Required projector для `qwen2vl_7b`. |

## Speech-to-text models

| Registry entry | Model | Approx. size | Format | Capabilities | Для чого |
| --- | --- | ---: | --- | --- | --- |
| `whisperTinyEn` | Whisper Tiny English | ~77 MB | `GGML` | `stt` | Швидка English transcription на mobile. |
| `whisperBaseEn` | Whisper Base English | ~148 MB | `GGML` | `stt` | Краща English accuracy з помірним memory use. |
| `whisperSmall` | Whisper Small Multilingual | ~244 MB | `GGML` | `stt` | Multilingual transcription на сильніших devices. |
| `whisperMedium` | Whisper Medium Multilingual | ~769 MB | `GGML` | `stt` | Production-quality multilingual STT на macOS-class devices. |
| `whisperLargeV3` | Whisper Large v3 Multilingual | ~3.1 GB | `GGML` | `stt` | Найвища STT quality для 8 GB+ Mac targets. |

## Text-to-speech models

Edge Veda text-to-speech використовує operating system TTS engine через `TtsService`.

На iOS це означає:

- додатковий model file не потрібен;
- available voices залежать від device і встановлених system voices;
- voice quality і language support контролюються iOS.

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

Edge Veda має image generation APIs на базі stable-diffusion.cpp. Модель має бути сумісною з native image backend і вкладатися в memory budget target device.

Починайте з менших або turbo-oriented models. Більші diffusion models можуть потребувати кілька GB memory і можуть бути auto-evicted через scheduler, якщо app має memory pressure.

## Правила вибору моделі

Обирайте model у такому порядку:

1. Визначте capability: chat, tools, vision, STT, embeddings, RAG або image generation.
2. Виберіть найменшу model, яка може виконати task.
3. Перевірте device memory і disk space перед download.
4. Використовуйте `ModelAdvisor.canRun()` або `ModelAdvisor.recommend()`, якщо доступно.
5. Узгодьте `ChatTemplateFormat` із model family.
6. Запускайте app у `release` або `profile` mode для performance validation.
7. Перевіряйте real device behavior хоча б протягом однієї long session.

## Device fit guidance

| Target | Рекомендований напрям |
| --- | --- |
| 4 GB iPhone | Обирайте `llama32_1b`, `qwen3_06b`, `whisperTinyEn`, smaller VLMs, зменшений `contextLength`. |
| 6–8 GB iPhone | Можна тестувати 1B–2B text models, mobile VLMs, RAG і STT з budget monitoring. |
| iPad / high-memory iPhone | Можна комбінувати більше workloads, але все одно використовуйте `Scheduler`. |
| Apple Silicon Mac | Підходить для larger LLMs, larger VLMs і stronger Whisper models. |
| Android | Roadmap / validation target. Не вважайте production-validated, доки це не підтверджено release notes. |

## Compatibility checks

Перед download або model load перевірте:

- model format підтримується target API;
- file size вкладається в available storage;
- estimated memory підходить device;
- quantization level відповідає потрібній quality і speed;
- model family має відповідний chat template;
- tool-calling flows використовують tool-capable model;
- VLM flows мають правильний `mmproj` file;
- STT flows використовують Whisper-compatible `.bin` files;
- license terms моделі дозволяють потрібне product use.

## Пов'язані docs

- [Configuration options](./configuration-options.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Model advisor](../guides/model-advisor.md)
- [Model manager](../guides/model-manager.md)
