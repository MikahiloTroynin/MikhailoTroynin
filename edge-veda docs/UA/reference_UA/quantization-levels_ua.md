---
title: "Рівні квантизації"
description: "Reference для quantization levels, які використовуються в Edge Veda models і runtime memory settings."
status: "draft"
section: "reference"
last_reviewed: "2026-04-30"
source_files:
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/types.dart"
  - "README.md"
---

# Рівні квантизації

Quantization зменшує model size і memory use завдяки зберіганню model weights або runtime caches у lower-precision formats.

В Edge Veda quantization трапляється у двох місцях:

1. model files, наприклад `Q4_K_M`, `Q8_0` або `F16`;
2. runtime KV cache settings, наприклад `kvCacheTypeK` і `kvCacheTypeV`.

Мета — розмістити корисні on-device AI workloads у реальних mobile memory budgets і зберегти прийнятну quality.

## Summary quantization

| Level | Typical use | Size impact | Quality impact | Edge Veda examples |
| --- | --- | --- | --- | --- |
| `F16` | Projectors або higher-precision components | Найбільший | Highest precision | Деякі `mmproj` files. |
| `Q8_0` | Vision models, KV cache, quality-sensitive small models | Середній | Невелика quality loss | SmolVLM2 models, default KV cache type. |
| `Q4_K_M` | Mobile-friendly LLMs | Малий | Помірний, зазвичай прийнятний | Llama 3.2 1B, Qwen3 0.6B, Gemma 2 2B. |
| No quantization value | Whisper `.bin` models або format-specific files | Залежить від backend | Залежить від model | Whisper GGML files. |

## `Q4_K_M`

`Q4_K_M` — основний quantization level для багатьох preconfigured text models.

Використовуйте `Q4_K_M`, коли:

- model має поміститися на mobile devices;
- storage size важливий;
- throughput важливіший за максимальну quality;
- use case — chat, command parsing, summarization або RAG answer generation.

Попередньо налаштовані приклади:

- `ModelRegistry.llama32_1b`;
- `ModelRegistry.qwen3_06b`;
- `ModelRegistry.gemma2_2b`;
- `ModelRegistry.phi35_mini`;
- `ModelRegistry.llama31_8b`;
- `ModelRegistry.mistral_nemo_12b`.

## `Q8_0`

`Q8_0` зберігає більше precision, ніж 4-bit formats, і використовується, коли model вже невелика або output quality чутлива до precision.

Попередньо налаштовані приклади:

- `ModelRegistry.smolvlm2_500m`;
- `ModelRegistry.smolvlm2_256m`;
- `ModelRegistry.smolvlm2_256m_mmproj`;
- runtime KV cache defaults через `kvCacheTypeK: 8` і `kvCacheTypeV: 8`.

Використовуйте `Q8_0`, коли:

- model достатньо мала;
- feature чутлива до visual або semantic detail;
- memory increase прийнятний.

## `F16`

`F16` використовується для higher-precision components, особливо multimodal projectors.

Попередньо налаштовані приклади:

- `ModelRegistry.smolvlm2_500m_mmproj`;
- `ModelRegistry.llava16_mistral_7b_mmproj`;
- `ModelRegistry.qwen2vl_7b_mmproj`.

Використовуйте `F16`, коли:

- component required для model family;
- model provider постачає required projector у `F16`;
- заміна на іншу quantization може зламати compatibility.

Не змінюйте projector quantization, якщо model provider явно не надає сумісний file.

## KV cache quantization

`EdgeVedaConfig` має два fields для KV cache quantization:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  kvCacheTypeK: 8,
  kvCacheTypeV: 8,
);
```

| Field | Default | Meaning |
| --- | --- | --- |
| `kvCacheTypeK` | `8` | Quantization type для key cache. |
| `kvCacheTypeV` | `8` | Quantization type для value cache. |

Відомі значення:

| Value | Level | Опис |
| --- | --- | --- |
| `1` | `F16` | Higher precision, більший memory use. |
| `8` | `Q8_0` | Нижчий memory use з мінімальною quality loss для mobile use. |

Default `Q8_0` cache settings обрані для mobile memory optimization.

## Як quantization впливає на memory

Memory use залежить від:

- model parameter count;
- model quantization level;
- `contextLength`;
- KV cache type;
- batch size або concurrent work;
- loaded workers;
- VLM projector size;
- RAG vector index size;
- image generation model і intermediate buffers.

Зменшення model size саме по собі може не прибрати memory pressure, якщо `contextLength` зависокий або кілька workers залишаються loaded.

## Як обирати quantization level

| Constraint | Recommendation |
| --- | --- |
| 4 GB iPhone | Обирайте `Q4_K_M` text models і default `Q8_0` KV cache. |
| Потрібна краща answer quality | Спробуйте larger model перед підвищенням precision. |
| Vision model завелика | Оберіть меншу VLM family перед зміною projector files. |
| Output repeats або degrades | Спершу перевірте chat template і sampling; quantization може бути не причиною. |
| Tool calls malformed | Використайте tool-capable model і structured validation перед зміною quantization. |
| RAG answers weak | Покращіть retrieval і context injection перед зміною quantization. |
| macOS target | Larger `Q4_K_M`, `Q8_0` або `F16` components можуть бути прийнятними. |

## Quantization і model quality

Quantization — не єдиний чинник output quality.

Також перевірте:

- model family;
- instruction tuning;
- chat template;
- prompt quality;
- `GenerateOptions`;
- context quality у RAG;
- чи model підходить для tools або structured output;
- чи task потребує larger model.

Наприклад, менша tool-capable model з правильним template може працювати краще у function calling, ніж larger general chat model.

## Quantization і performance

Quantization може покращити:

- download size;
- disk usage;
- model load time;
- memory footprint;
- stability на constrained devices.

Quantization також може знизити:

- reasoning quality;
- multilingual quality;
- instruction-following reliability;
- long-context quality;
- structured output reliability у деяких models.

Вимірюйте на real target device, а не припускайте, що менший file завжди швидший або якісніший.

## Recommended defaults

| Use case | Suggested starting point |
| --- | --- |
| Mobile chat | `Q4_K_M` text model, `contextLength: 2048`, KV cache `Q8_0`. |
| Low-memory chat | `Q4_K_M` text model, `contextLength: 1024`, KV cache `Q8_0`. |
| Tool calling | `Qwen3 0.6B Q4_K_M` або інша tool-capable model. |
| Vision на mobile | SmolVLM2 `Q8_0` з matching projector. |
| Vision на macOS | Larger VLM `Q4_K_M` з matching `F16` projector, якщо memory дозволяє. |
| STT | Обирайте Whisper size за language і accuracy needs; не робіть висновки тільки з quantization labels. |
| Image generation | Починайте з small або turbo-oriented models і conservative image size. |

## Validation checklist

Перед публікацією model recommendation перевірте:

- exact quantization level видно в `ModelInfo.quantization`;
- file size задокументований;
- target device memory class вказаний;
- `contextLength` і KV cache settings включені;
- expected trade-offs описані;
- model протестована у `release` або `profile` mode;
- model license дозволяє intended use;
- fallback behavior задокументований для memory pressure або low confidence.

## Пов'язані docs

- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Configuration options](./configuration-options.md)
- [Memory management](../guides/memory-management.md)
- [Model advisor](../guides/model-advisor.md)
