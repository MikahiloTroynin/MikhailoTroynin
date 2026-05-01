---
title: "Model compatibility"
description: "How to evaluate whether a model is compatible with Edge Veda, the target capability, and the target device."
status: "draft"
section: "concepts"
locale: "en"
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

Model compatibility means that a model can be loaded, configured, and used correctly for a specific Edge Veda capability on a specific device.

Compatibility is not only “the file opens.” A model may load and still be unsuitable because it is too slow, too large, uses the wrong template, requires a missing companion file, or does not fit the device memory budget.

## Compatibility dimensions

| Dimension | Question |
| --- | --- |
| Capability | Is this model for text, vision, speech, embeddings, or image generation? |
| File format | Does the runtime support this format? |
| Quantization | Is the quantization suitable for the device and quality target? |
| Device fit | Does it fit memory and storage constraints? |
| Template | Does it need a specific chat or instruction template? |
| Context | Is the context length realistic? |
| Companion files | Does it require tokenizer, projector, vocabulary, or other files? |
| Platform | Is the native engine available on this platform? |
| Runtime behavior | Can it run under scheduler and policy constraints? |

## Text generation compatibility

Text models are used for prompts, chat, summarization, reasoning, and local assistants.

They usually need:

- supported local model format;
- compatible tokenizer;
- prompt or chat template;
- realistic context length;
- generation settings such as max tokens and temperature.

A wrong chat template can cause repetition, ignored system messages, malformed JSON, or poor instruction following.

## Vision compatibility

Vision models may require both a language model and a multimodal projector file. The model, projector, and configuration must match.

Common failures:

- missing projector file;
- projector does not match the model;
- unsupported image input format;
- image resolution is too high;
- context size is too small for image tokens and prompt.

Vision docs should list every required file.

## Speech-to-text compatibility

Speech-to-text models depend on audio format, sample rate, language, model size, and native engine support.

A model that works for offline transcription may be too slow for streaming transcription. Document chunk size, tested latency, and target language.

## Text-to-speech compatibility

Text-to-speech may use platform-provided voices instead of downloaded model files. Compatibility depends on platform voice availability, language, voice quality, and supported controls such as speak, stop, pause, resume, rate, pitch, and volume.

## Embedding compatibility

Embedding models produce vectors. Compatibility includes vector dimension, normalization behavior, and persistence format.

Changing the embedding model can invalidate an existing vector index. If the vector dimension or embedding distribution changes, documents may need to be re-embedded.

## Image generation compatibility

Image generation models are memory-heavy. Compatibility includes model format, sampler support, scheduler support, image size, step count, and target device memory.

A model can be technically supported but impractical on lower-tier devices.

## Structured output compatibility

A model that chats well may still fail structured output. For tool calling and grammar-constrained generation, evaluate JSON validity, function call formatting, recovery from truncated output, validation event behavior, repair rate, and repeated-prompt behavior.

## Platform compatibility

Document platform status clearly:

| Platform | What to document |
| --- | --- |
| iOS | Tested device, Metal usage, model size, permissions. |
| macOS | Whether the same native framework works and where models are stored. |
| Android | Current status or roadmap limitations. |
| Web | Whether unsupported or experimental. |

Avoid implying that a model is supported everywhere if it was tested only on one platform.

## Compatibility table template

| Model | Capability | Format | Recommended quantization | Required files | Tested device | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Llama 3.2 1B Instruct | Chat | GGUF | Device-tested Q4-class variant | `.gguf` | iPhone with Metal | Good default for local chat. |
| Qwen3 0.6B | Tool calling | GGUF | Device-tested Q4-class variant | `.gguf` | iPhone with Metal | Prefer for structured/tool flows. |
| SmolVLM2 | Vision | VLM-compatible | Device-tested variant | model + projector | iPhone with Metal | Requires matching projector. |
| Whisper Tiny EN | STT | Whisper-compatible | Native model file | model file | iPhone with Metal | Better for low-latency English transcription. |

Replace examples with exact tested files before publishing.

## Validation workflow

Before marking a model compatible, confirm file format, companion files, path loading, minimal request behavior, realistic request behavior, cancellation, repeated calls, long-session behavior, memory, thermal behavior, device, and configuration.

## Summary

Model compatibility is a combination of file format, capability, device fit, template behavior, companion files, platform support, and runtime stability. Document what was tested, on which device, with which configuration, and under which workload.
