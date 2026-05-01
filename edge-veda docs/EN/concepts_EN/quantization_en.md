---
title: "Quantization"
description: "A conceptual guide to quantization for on-device models in Edge Veda, including trade-offs, naming, testing, and documentation guidance."
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
  - "model-compatibility.md"
---

# Quantization

Quantization is a model compression technique that stores model weights with lower numerical precision. Instead of keeping larger floating-point values for every weight, a quantized model uses fewer bits per weight.

For on-device AI, quantization is essential because phones and laptops have limited memory, storage, battery, and thermal headroom.

## Why quantization matters

Quantization can reduce model file size, memory required to load the model, memory bandwidth pressure, app storage requirements, download time, and energy use in some scenarios.

It can also affect output quality, reasoning ability, structured output reliability, speed, compatibility with native engines, and long-session stability.

Quantization is a trade-off, not a free optimization.

## Basic idea

A full-precision model stores weights with high precision. A quantized model stores approximate weights using fewer bits.

You may see names such as:

- 8-bit quantization;
- 6-bit quantization;
- 5-bit quantization;
- 4-bit quantization;
- 3-bit or 2-bit quantization;
- engine-specific variants such as `Q4_K_M`, `Q5_K_M`, or similar names.

The exact naming depends on the model format and inference engine. Do not assume that every “4-bit” model behaves the same.

## Quantization in Edge Veda documentation

When documenting a model for Edge Veda, include:

- model family;
- model size;
- file format;
- quantization variant;
- expected memory use;
- tested device;
- expected speed;
- known quality trade-offs;
- recommended use case.

A model recommendation without quantization information is incomplete.

## File formats

For local language models, GGUF-style files are common in llama.cpp-based workflows. GGUF stores model tensors and metadata in a single file and is widely used for quantized local inference.

Other capabilities may use different formats:

| Capability | Format considerations |
| --- | --- |
| Text generation | GGUF or another engine-supported local LLM format. |
| Vision | Model file plus matching projector or multimodal companion files. |
| Speech-to-text | Whisper-compatible model files. |
| Embeddings | Engine-supported embedding model format and stable vector dimension. |
| Image generation | Stable-diffusion-compatible files supported by the native engine. |
| TTS | May use platform voices instead of downloaded model files. |

## Quality and speed trade-offs

Lower-bit quantization usually saves memory, but may reduce quality. Possible impacts include weaker reasoning, more hallucinations, poorer instruction following, less reliable JSON output, worse multilingual quality, more repetition, and less stable tool calling.

Quantization does not always mean faster output. Speed depends on the native engine, CPU/GPU offload, chip generation, context length, batch size, memory bandwidth, thermal state, and kernel support.

## Context length and KV cache

Model weights are only part of memory usage. During generation, the runtime also needs memory for context and key-value cache.

Document model quantization together with context length, expected max tokens, chat summarization behavior, and whether the model stays loaded after the call.

## Choosing a quantization level

A practical approach:

1. start with the smallest model that solves the task;
2. choose a mid-range quantization known to run on the target device;
3. test quality on real prompts;
4. test long-session stability;
5. increase quality only if the device has headroom;
6. document the tested configuration.

Do not choose a model only because it has the best benchmark score. On-device UX is often limited by latency, memory, heat, and repeatability.

## Testing matrix

| Test | What to record |
| --- | --- |
| Load test | Does the model load successfully? How long does it take? |
| First response | First-token latency and total response time. |
| Repeat calls | Whether latency stays stable after multiple calls. |
| Long session | Thermal, memory, and reload behavior over time. |
| Structured output | JSON validity and repair rate. |
| RAG | Retrieval quality and answer grounding. |
| Cancellation | Whether cancellation returns the worker to a safe state. |

## Common mistakes

- choosing the largest model that loads once;
- ignoring the prompt template;
- ignoring embedding dimensions;
- comparing quantizations with different prompts;
- forgetting companion files for vision models.

## Summary

Quantization makes on-device AI practical by reducing model size and memory pressure. It also introduces trade-offs in quality, speed, and reliability. In Edge Veda documentation, always connect quantization to the model, use case, device, context length, and observed runtime behavior.
