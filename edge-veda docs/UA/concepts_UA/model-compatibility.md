---
title: "Model compatibility"
description: "Як оцінити, чи модель сумісна з Edge Veda, цільовою capability і target device."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
related:
  - "model-management.md"
  - "quantization.md"
---

# Model compatibility

Model compatibility означає, що model можна load, configure і use correctly для конкретної Edge Veda capability на конкретному device.

Compatibility — це не тільки “file opens”. Model може load-итися, але бути unsuitable: too slow, too large, uses wrong template, requires missing companion file або не fit-иться в device memory budget.

## Compatibility dimensions

| Dimension | Question |
| --- | --- |
| Capability | Це model для text, vision, speech, embeddings чи image generation? |
| File format | Чи runtime supports this format? |
| Quantization | Чи quantization suitable для device і quality target? |
| Device fit | Чи fit-иться в memory and storage constraints? |
| Template | Чи потрібен specific chat або instruction template? |
| Context | Чи context length realistic? |
| Companion files | Чи потрібні tokenizer, projector, vocabulary або інші files? |
| Platform | Чи native engine available on this platform? |
| Runtime behavior | Чи може run under scheduler and policy constraints? |

## Text generation compatibility

Text models використовують для prompts, chat, summarization, reasoning і local assistants.

Їм зазвичай потрібні:

- supported local model format;
- compatible tokenizer;
- prompt або chat template;
- realistic context length;
- generation settings: max tokens, temperature.

Wrong chat template може спричинити repetition, ignored system messages, malformed JSON або poor instruction following.

## Vision compatibility

Vision models можуть потребувати language model і multimodal projector file. Model, projector і configuration мають match.

Common failures:

- missing projector file;
- projector does not match model;
- unsupported image input format;
- image resolution too high;
- context size too small for image tokens and prompt.

Vision docs мають list every required file.

## Speech-to-text compatibility

Speech-to-text models залежать від audio format, sample rate, language, model size і native engine support.

Model, яка працює для offline transcription, може бути too slow for streaming transcription. Document chunk size, tested latency і target language.

## Text-to-speech compatibility

Text-to-speech може використовувати platform-provided voices instead of downloaded model files. Compatibility залежить від platform voice availability, language, voice quality і supported controls: speak, stop, pause, resume, rate, pitch, volume.

Не документуйте TTS як GGUF model, якщо implementation працює інакше.

## Embedding compatibility

Embedding models produce vectors. Compatibility включає vector dimension, normalization behavior і persistence format.

Changing embedding model can invalidate existing vector index. Якщо vector dimension або embedding distribution changes, documents may need to be re-embedded.

## Image generation compatibility

Image generation models memory-heavy. Compatibility включає model format, sampler support, scheduler support, image size, step count і target device memory.

Model може бути technically supported, але impractical on lower-tier devices.

## Structured output compatibility

Model, яка добре chats, може fail structured output. Для tool calling і grammar-constrained generation оцінюйте JSON validity, function call formatting, recovery from truncated output, validation event behavior, repair rate і behavior across repeated prompts.

## Platform compatibility

Document platform status clearly:

| Platform | What to document |
| --- | --- |
| iOS | Tested device, Metal usage, model size, permissions. |
| macOS | Whether same native framework works and where models are stored. |
| Android | Current status or roadmap limitations. |
| Web | Whether unsupported or experimental. |

Не натякайте, що model supported everywhere, якщо її tested only on one platform.

## Compatibility table template

| Model | Capability | Format | Recommended quantization | Required files | Tested device | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Llama 3.2 1B Instruct | Chat | GGUF | Device-tested Q4-class variant | `.gguf` | iPhone with Metal | Good default for local chat. |
| Qwen3 0.6B | Tool calling | GGUF | Device-tested Q4-class variant | `.gguf` | iPhone with Metal | Prefer for structured/tool flows. |
| SmolVLM2 | Vision | VLM-compatible | Device-tested variant | model + projector | iPhone with Metal | Requires matching projector. |
| Whisper Tiny EN | STT | Whisper-compatible | Native model file | model file | iPhone with Metal | Better for low-latency English transcription. |

Replace examples with exact tested files before publishing.

## Validation workflow

Before marking model compatible, confirm file format, companion files, path loading, minimal request behavior, realistic request behavior, cancellation, repeated calls, long-session behavior, memory, thermal behavior, device і configuration.

## Підсумок

Model compatibility — це поєднання file format, capability, device fit, template behavior, companion files, platform support і runtime stability. Документуйте, що саме tested, on which device, with which configuration and workload.
