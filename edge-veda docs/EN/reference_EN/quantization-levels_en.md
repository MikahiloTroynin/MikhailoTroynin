---
title: "Quantization levels"
description: "Reference for quantization levels used by Edge Veda models and runtime memory settings."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/types.dart"
  - "README.md"
---

# Quantization levels

Quantization reduces model size and memory use by storing model weights or runtime caches in lower-precision formats.

In Edge Veda, quantization appears in two places:

1. model files, such as `Q4_K_M`, `Q8_0`, or `F16`;
2. runtime KV cache settings, such as `kvCacheTypeK` and `kvCacheTypeV`.

The goal is to fit useful on-device AI workloads into real mobile memory budgets while preserving acceptable quality.

## Quantization summary

| Level | Typical use | Size impact | Quality impact | Edge Veda examples |
| --- | --- | --- | --- | --- |
| `F16` | Projectors or higher-precision components | Largest | Highest precision | Some `mmproj` files. |
| `Q8_0` | Vision models, KV cache, quality-sensitive small models | Medium | Low quality loss | SmolVLM2 models, default KV cache type. |
| `Q4_K_M` | Mobile-friendly LLMs | Small | Moderate but usually acceptable | Llama 3.2 1B, Qwen3 0.6B, Gemma 2 2B. |
| No quantization value | Whisper `.bin` models or format-specific files | Depends on backend | Depends on model | Whisper GGML files. |

## `Q4_K_M`

`Q4_K_M` is the main quantization level used by many preconfigured text models.

Use `Q4_K_M` when:

- the model must fit on mobile devices;
- storage size matters;
- throughput matters more than maximum quality;
- the use case is chat, command parsing, summarization, or RAG answer generation.

Preconfigured examples:

- `ModelRegistry.llama32_1b`;
- `ModelRegistry.qwen3_06b`;
- `ModelRegistry.gemma2_2b`;
- `ModelRegistry.phi35_mini`;
- `ModelRegistry.llama31_8b`;
- `ModelRegistry.mistral_nemo_12b`.

## `Q8_0`

`Q8_0` keeps more precision than 4-bit formats and is used when the model is already small or when output quality is sensitive.

Preconfigured examples:

- `ModelRegistry.smolvlm2_500m`;
- `ModelRegistry.smolvlm2_256m`;
- `ModelRegistry.smolvlm2_256m_mmproj`;
- runtime KV cache defaults through `kvCacheTypeK: 8` and `kvCacheTypeV: 8`.

Use `Q8_0` when:

- the model is small enough to fit;
- the feature is sensitive to visual or semantic detail;
- the memory increase is acceptable.

## `F16`

`F16` is used for higher-precision components, especially multimodal projectors.

Preconfigured examples:

- `ModelRegistry.smolvlm2_500m_mmproj`;
- `ModelRegistry.llava16_mistral_7b_mmproj`;
- `ModelRegistry.qwen2vl_7b_mmproj`.

Use `F16` when:

- the component is required by a model family;
- the model provider ships the required projector in `F16`;
- replacing it with another quantization would break compatibility.

Do not change projector quantization unless the model provider explicitly supplies a compatible file.

## KV cache quantization

`EdgeVedaConfig` exposes two fields for KV cache quantization:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  kvCacheTypeK: 8,
  kvCacheTypeV: 8,
);
```

| Field | Default | Meaning |
| --- | --- | --- |
| `kvCacheTypeK` | `8` | Quantization type for key cache. |
| `kvCacheTypeV` | `8` | Quantization type for value cache. |

Known values:

| Value | Level | Description |
| --- | --- | --- |
| `1` | `F16` | Higher precision, higher memory use. |
| `8` | `Q8_0` | Lower memory use with minimal quality loss for mobile use. |

The default `Q8_0` cache settings are chosen for mobile memory optimization.

## How quantization affects memory

Memory use is affected by:

- model parameter count;
- model quantization level;
- `contextLength`;
- KV cache type;
- batch size or concurrent work;
- loaded workers;
- VLM projector size;
- RAG vector index size;
- image generation model and intermediate buffers.

Reducing model size alone may not solve memory pressure if `contextLength` is still too high or multiple workers stay loaded.

## Choosing a quantization level

| Constraint | Recommendation |
| --- | --- |
| 4 GB iPhone | Prefer `Q4_K_M` text models and default `Q8_0` KV cache. |
| Need better answer quality | Try a larger model before increasing precision. |
| Vision model is too large | Use smaller VLM family before changing projector files. |
| Output repeats or degrades | Check chat template and sampling first; quantization may not be the cause. |
| Tool calls are malformed | Use a tool-capable model and structured validation before changing quantization. |
| RAG answers are weak | Improve retrieval and context injection before switching quantization. |
| macOS target | Larger `Q4_K_M`, `Q8_0`, or `F16` components may be acceptable. |

## Quantization and model quality

Quantization is not the only factor in output quality.

Also check:

- model family;
- instruction tuning;
- chat template;
- prompt quality;
- `GenerateOptions`;
- context quality in RAG;
- whether the model is suitable for tools or structured output;
- whether the task requires a larger model.

For example, a smaller tool-capable model with the correct template can outperform a larger general chat model in function calling.

## Quantization and performance

Quantization can improve:

- download size;
- disk usage;
- model load time;
- memory footprint;
- stability on constrained devices.

Quantization can also reduce:

- reasoning quality;
- multilingual quality;
- instruction-following reliability;
- long-context quality;
- structured output reliability in some models.

Measure on the real target device instead of assuming that a smaller file will always be faster or better.

## Recommended defaults

| Use case | Suggested starting point |
| --- | --- |
| Mobile chat | `Q4_K_M` text model, `contextLength: 2048`, KV cache `Q8_0`. |
| Low-memory chat | `Q4_K_M` text model, `contextLength: 1024`, KV cache `Q8_0`. |
| Tool calling | `Qwen3 0.6B Q4_K_M` or another tool-capable model. |
| Vision on mobile | SmolVLM2 `Q8_0` with matching projector. |
| Vision on macOS | Larger VLM `Q4_K_M` with matching `F16` projector if memory allows. |
| STT | Choose Whisper size by language and accuracy needs; do not infer quality from quantization labels. |
| Image generation | Start with small or turbo-oriented models and conservative image size. |

## Validation checklist

Before publishing a model recommendation, verify:

- the exact quantization level is visible in `ModelInfo.quantization`;
- the file size is documented;
- the target device memory class is stated;
- `contextLength` and KV cache settings are included;
- expected trade-offs are described;
- the model was tested in `release` or `profile` mode;
- the model license allows the intended use;
- fallback behavior is documented for memory pressure or low confidence.

## Related docs

- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Configuration options](./configuration-options.md)
- [Memory management](../guides/memory-management.md)
- [Model advisor](../guides/model-advisor.md)
