---
title: "Quantization"
description: "Концептуальний гайд з quantization для on-device models в Edge Veda: trade-offs, naming, testing і documentation guidance."
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
  - "model-compatibility.md"
---

# Quantization

Quantization — це model compression technique, яка зберігає model weights із lower numerical precision. Замість larger floating-point values для кожної weight, quantized model використовує fewer bits per weight.

Для on-device AI quantization essential, бо phones and laptops мають limited memory, storage, battery і thermal headroom.

## Чому quantization важлива

Quantization може зменшити model file size, memory required to load model, memory bandwidth pressure, app storage requirements, download time і energy use in some scenarios.

Вона також може впливати на output quality, reasoning ability, structured output reliability, speed, compatibility with native engines і long-session stability.

Quantization — trade-off, не free optimization.

## Basic idea

Full-precision model stores weights with high precision. Quantized model stores approximate weights using fewer bits.

Можна зустріти назви:

- 8-bit quantization;
- 6-bit quantization;
- 5-bit quantization;
- 4-bit quantization;
- 3-bit або 2-bit quantization;
- engine-specific variants: `Q4_K_M`, `Q5_K_M` або similar names.

Exact naming залежить від model format і inference engine. Не припускайте, що кожна “4-bit” model behaves the same.

## Quantization in Edge Veda documentation

Коли документуєте model для Edge Veda, включайте:

- model family;
- model size;
- file format;
- quantization variant;
- expected memory use;
- tested device;
- expected speed;
- known quality trade-offs;
- recommended use case.

Model recommendation без quantization information неповна.

## File formats

Для local language models GGUF-style files common у llama.cpp-based workflows. GGUF stores model tensors and metadata in a single file and is widely used for quantized local inference.

Інші capabilities можуть використовувати інші formats:

| Capability | Format considerations |
| --- | --- |
| Text generation | GGUF або інший engine-supported local LLM format. |
| Vision | Model file plus matching projector або multimodal companion files. |
| Speech-to-text | Whisper-compatible model files. |
| Embeddings | Engine-supported embedding model format and stable vector dimension. |
| Image generation | Stable-diffusion-compatible files supported by native engine. |
| TTS | May use platform voices instead of downloaded model files. |

Не описуйте всі models так, ніби вони мають однаковий format.

## Quality and speed trade-offs

Lower-bit quantization зазвичай saves memory, але може reduce quality.

Possible impacts:

- weaker reasoning;
- more hallucinations;
- poorer instruction following;
- less reliable JSON output;
- worse multilingual quality;
- more repetition;
- less stable tool calling.

Quantization не завжди означає faster output. Speed залежить від native engine, CPU/GPU offload, chip generation, context length, batch size, memory bandwidth, thermal state і kernel support.

## Context length and KV cache

Model weights — лише частина memory usage. During generation runtime також потребує memory for context and key-value cache.

Документуйте разом:

- model quantization;
- context length;
- expected max tokens;
- whether long chat history is summarized;
- whether model stays loaded after call.

4-bit model з unrealistic context length все одно може бути too heavy.

## Choosing a quantization level

Практичний підхід:

1. start with smallest model that solves task;
2. choose mid-range quantization known to run on target device;
3. test quality on real prompts;
4. test long-session stability;
5. increase quality only if device has headroom;
6. document tested configuration.

Не обирайте model лише за benchmark score. On-device UX часто обмежений latency, memory, heat і repeatability.

## Testing matrix

| Test | What to record |
| --- | --- |
| Load test | Does model load successfully? How long does it take? |
| First response | First-token latency and total response time. |
| Repeat calls | Whether latency stays stable after multiple calls. |
| Long session | Thermal, memory, and reload behavior over time. |
| Structured output | JSON validity and repair rate. |
| RAG | Retrieval quality and answer grounding. |
| Cancellation | Whether cancellation returns worker to safe state. |

## Common mistakes

- choosing largest model that loads once;
- ignoring prompt template;
- ignoring embedding dimensions;
- comparing quantizations with different prompts;
- forgetting companion files for vision models.

## Підсумок

Quantization робить on-device AI practical by reducing model size and memory pressure. Вона також додає trade-offs in quality, speed and reliability. В Edge Veda docs завжди пов’язуйте quantization з model, use case, device, context length and observed runtime behavior.
