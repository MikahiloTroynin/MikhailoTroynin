---
title: "Глосарій"
description: "Глосарій термінів Edge Veda SDK, runtime, model, performance, memory, RAG, vision, speech і platform terms."
status: "draft"
section: "reference"
last_reviewed: "2026-05-01"
source_files:
  - "README.md"
  - "flutter/lib/src/types.dart"
  - "flutter/lib/src/model_manager.dart"
  - "flutter/lib/src/scheduler.dart"
  - "flutter/lib/src/budget.dart"
  - "flutter/lib/src/vector_index.dart"
  - "flutter/lib/src/rag_pipeline.dart"
---

# Глосарій

Цей глосарій пояснює основні терміни, які використовуються в документації Edge Veda.

Назви класів, методів, параметрів, форматів моделей і загальноприйняті технічні терміни залишено англійською. Опис подано українською, щоб українська версія документації була зручною для читання та підтримки.

## Основні поняття

| Термін | Опис |
| --- | --- |
| Edge Veda | Керований on-device AI runtime для Flutter-додатків. Запускає text, vision, speech, embeddings, RAG та інші AI-навантаження локально на пристрої. |
| on-device AI | Підхід, за якого AI inference виконується на пристрої користувача, а не на віддаленому сервері. |
| local inference | Локальне виконання inference. У документації Edge Veda означає, що виклик моделі не потребує мережевого запиту. |
| private by default | Принцип проєктування, за якого prompts, images, audio, embeddings і documents не надсилаються на сервер, якщо host app явно не додає таку поведінку. |
| supervised runtime | Runtime, який відстежує стан пристрою та застосовує policy decisions замість того, щоб просто запускати модель до помилки або зависання. |
| workload | Окрема одиниця AI-роботи, якою керує runtime: text generation, vision, STT, RAG або image generation. |
| persistent worker | Фоновий worker, який утримує модель завантаженою між викликами, щоб не витрачати час на повторне завантаження. |
| isolate | Механізм паралельного виконання в Dart, який дозволяє винести блокувальну роботу за межі UI thread. |
| FFI | Foreign Function Interface. Механізм, через який Dart-код викликає native C/C++ inference code. |
| native backend | C/C++-шар, який виконує inference, наприклад llama.cpp, whisper.cpp або stable-diffusion.cpp. |
| main thread | Основний UI thread застосунку. Тривалий inference не має виконуватися в цьому потоці. |
| runtime policy | Набір правил, що визначає поведінку workloads за умов thermal, memory, battery або latency constraints. |
| graceful degradation | Контрольоване зниження якості або частоти workload замість crash, freeze або різкого падіння продуктивності. |

## SDK-об'єкти

| Термін | Опис |
| --- | --- |
| `EdgeVeda` | Основна точка входу SDK для text generation, streaming, embeddings, vision, image generation, memory stats і cleanup operations. |
| `EdgeVedaConfig` | Об'єкт конфігурації для запуску core runtime. Містить `modelPath`, `contextLength`, `numThreads`, `useGpu`, `maxMemoryMb`, `flashAttn` і параметри KV cache. |
| `GenerateOptions` | Налаштування для text generation: `systemPrompt`, `maxTokens`, `temperature`, `topP`, `topK`, `repeatPenalty`, `stopSequences`, `jsonMode`, `grammarStr`, `confidenceThreshold`. |
| `GenerateResponse` | Об'єкт результату для non-streaming generation. Містить згенерований текст, token counts, latency і tokens per second. |
| `TokenChunk` | Подія stream із частиною відповіді, яку повертає `generateStream()` або streaming chat APIs. |
| `ChatSession` | Вищорівневий helper для multi-turn chat, chat state, templates, tool calling і роботи з context. |
| `CancelToken` | Об'єкт для скасування тривалого або streaming generation request. |
| `VisionConfig` | Конфігурація для ініціалізації vision-language model. Містить `modelPath`, `mmprojPath`, `contextSize`, `numThreads`, `useGpu`, `maxMemoryMb`. |
| `ImageGenerationConfig` | Конфігурація для text-to-image generation: `width`, `height`, `steps`, `cfgScale`, `seed`, `sampler`, `schedule`. |
| `MemoryStats` | Знімок стану runtime memory: поточне використання, peak, model memory, context memory, limit і pressure fields. |
| `MemoryPressureEvent` | Подія, яка виникає, коли використання пам'яті переходить пороги warning, high або critical. |

## Моделі та формати

| Термін | Опис |
| --- | --- |
| model file | Локальний файл із model weights і metadata, який завантажується runtime. |
| `modelPath` | Шлях до файлу моделі, який передається в `EdgeVedaConfig` або суміжні APIs для завантаження моделі. |
| `GGUF` | Формат файлів моделей, який використовують llama.cpp і багато local LLM, VLM та embedding models. |
| `GGML` | Родина форматів моделей для whisper.cpp files, зокрема Whisper `.bin` models. |
| LLM | Large Language Model для text generation, chat, summarization, reasoning і structured output. |
| VLM | Vision-Language Model для розуміння зображень і image-to-text tasks. |
| `mmproj` | Multimodal projector file, потрібний для багатьох VLM. Він перетворює visual embeddings у простір language model. |
| embedding model | Модель, яка перетворює текст на numeric vectors для similarity search і RAG. |
| Whisper model | Speech-to-text model, яку використовує whisper.cpp. |
| image generation model | Модель, яку image generation backend використовує для створення зображень із prompts. |
| `ModelInfo` | Об'єкт metadata для downloadable model: ID, name, size, URL, checksum, format, quantization, family і capabilities. |
| `ModelRegistry` | Набір попередньо налаштованих model definitions для examples і model management flows. |
| `ModelManager` | Компонент для download, storage, lookup і validation model files. |
| `DownloadProgress` | Подія прогресу для model downloads. |
| checksum | Хеш для перевірки, що downloaded model file повний і не змінений. |

## Quantization і memory

| Термін | Опис |
| --- | --- |
| quantization | Техніка зберігання model weights або caches у lower precision, щоб зменшити file size і memory use. |
| `Q4_K_M` | Поширений 4-bit quantization level для mobile-friendly LLMs. |
| `Q8_0` | 8-bit quantization level, який часто використовують для small models або KV cache settings. |
| `F16` | 16-bit floating-point precision, яку часто використовують для точніших компонентів, наприклад projectors. |
| KV cache | Key/value cache, який transformer models використовують під час generation. Розмір KV cache зростає разом із `contextLength`. |
| `kvCacheTypeK` | Налаштування quantization для key cache. |
| `kvCacheTypeV` | Налаштування quantization для value cache. |
| `contextLength` | Максимальна кількість tokens, які можуть поміститися в context моделі. Більше значення збільшує memory use. |
| `maxMemoryMb` | Memory budget для runtime у мегабайтах. |
| memory pressure | Стан, коли поточне використання пам'яті наближається до configured або practical limit. |
| `flashAttn` | Режим flash attention. У `EdgeVedaConfig` значення `-1` означає automatic, `0` — disabled, `1` — enabled. |
| model eviction | Вивантаження або dispose моделі чи worker, щоб звільнити memory. |
| steady-state memory | Пам'ять після model load, коли runtime працює у стабільному режимі. |
| peak memory | Найбільше зафіксоване використання пам'яті під час запуску або тесту. |

## Generation і chat

| Термін | Опис |
| --- | --- |
| prompt | Вхідний текст, який передається моделі. |
| system prompt | Інструкція, яка задає поведінку моделі, її роль або обмеження. |
| completion | Текст, який згенерувала модель. |
| token | Одиниця тексту, яку обробляє модель. Одне слово може містити один або кілька tokens. |
| streaming generation | Режим generation, у якому tokens повертаються поступово. |
| blocking generation | Режим generation, у якому відповідь повертається лише після завершення всього generation. |
| `temperature` | Sampling setting для керування випадковістю. Нижчі значення роблять результат більш deterministic. |
| `topP` | Nucleus sampling threshold, який обмежує набір можливих наступних tokens. |
| `topK` | Sampling setting, який обмежує вибір наступного token найімовірнішими варіантами. |
| `repeatPenalty` | Налаштування, яке зменшує ймовірність повторюваного output. |
| `stopSequences` | Рядки, які зупиняють generation, коли модель їх повертає. |
| `jsonMode` | Налаштування generation, яке просить модель повернути JSON output. |
| GBNF | Grammar format для constrained decoding. |
| `grammarStr` | GBNF grammar, яка передається в `GenerateOptions`. |
| `grammarRoot` | Entry rule для grammar. |
| structured output | Output, обмежений передбачуваним форматом, наприклад JSON. |
| confidence tracking | Додаткове оцінювання впевненості для tokens, яке можна використати для fallback або handoff decisions. |
| cloud handoff | Необов'язковий app-level fallback, коли confidence або local capability недостатні. Edge Veda не потребує cloud inference за замовчуванням. |

## Function calling

| Термін | Опис |
| --- | --- |
| function calling | Можливість моделі повертати structured tool call замість звичайного тексту. |
| tool calling | Інша назва function calling. |
| `ToolDefinition` | Опис callable tool: name, description і parameter schema. |
| `ToolRegistry` | Набір tools, доступних для `ChatSession`. |
| `ToolCall` | Запит моделі на виклик tool. |
| `ToolResult` | Результат, який застосунок повертає після виконання tool call. |
| tool-capable model | Модель, яка налаштована або навчена стабільно повертати structured tool calls. |
| tool loop | Багатокроковий процес: модель викликає tool, отримує result і продовжує generation. |

## Embeddings і RAG

| Термін | Опис |
| --- | --- |
| embedding | Numeric vector representation of text, тобто числове представлення тексту. |
| vector | Упорядкований список чисел для similarity search. |
| vector index | Структура пошуку для знаходження схожих embeddings. |
| `VectorIndex` | Dart-компонент Edge Veda для vector search. |
| HNSW | Hierarchical Navigable Small World graph algorithm для approximate nearest-neighbor search. |
| cosine similarity | Міра схожості для порівняння embeddings. |
| RAG | Retrieval-Augmented Generation. Застосунок знаходить релевантний context і додає його до prompt перед generation. |
| `RagPipeline` | End-to-end pipeline: embed query, search vector index, inject context, generate answer. |
| `RagConfig` | Конфігурація RAG retrieval, зокрема `topK` і `minScore`. |
| `topK` | Кількість chunks, які потрібно повернути з retrieval. |
| `minScore` | Мінімальний similarity score для retrieved chunk. |
| chunk | Фрагмент великого документа, який використовується для embedding і retrieval. |
| context injection | Додавання retrieved chunks до prompt моделі. |

## Vision, speech і image generation

| Термін | Опис |
| --- | --- |
| `VisionWorker` | Worker, який утримує vision model і projector завантаженими для повторного image inference. |
| `describeImage()` | API, який створює текстовий опис зображення або відповідає на питання про нього. |
| `describeFrame()` | Операція vision worker для обробки camera frame або image frame. |
| frame queue | Backpressure component, який вирішує, обробляти чи пропускати incoming frames. |
| STT | Speech-to-text, тобто перетворення мовлення на текст. |
| `WhisperSession` | Вищорівневий helper для speech-to-text session. |
| `WhisperWorker` | Worker, який виконує Whisper transcription у фоні. |
| TTS | Text-to-speech. В Edge Veda apps TTS може використовувати OS speech APIs. |
| `TtsService` | Service wrapper для text-to-speech features. |
| `ImageWorker` | Worker для image generation workloads. |
| `ImageSampler` | Sampler, який використовується під час diffusion image generation. |
| `ImageSchedule` | Noise schedule, який використовується під час diffusion image generation. |
| `cfgScale` | Classifier-free guidance scale для image generation. |
| `steps` | Кількість denoising steps в image generation. |
| seed | Значення для відтворюваного image generation, якщо це підтримує backend. |

## Runtime supervision і observability

| Термін | Опис |
| --- | --- |
| `Scheduler` | Центральний runtime component для керування workloads, budgets, priorities і degradation. |
| `EdgeVedaBudget` | Визначення runtime budget для p95 latency, battery drain, thermal level і memory ceiling. |
| `BudgetProfile` | Попередньо налаштований adaptive profile: conservative, balanced або performance. |
| `WorkloadId` | Ідентифікатор workload, наприклад text, vision, STT або image generation. |
| `WorkloadPriority` | Пріоритет, який scheduler використовує, коли вирішує, який workload degrade першим. |
| QoS | Quality of Service level, застосований до workload. |
| `BudgetViolation` | Подія, яка виникає, коли runtime behavior перевищує configured budget. |
| `TelemetryService` | Компонент, який опитує device telemetry: thermal state, battery, memory. |
| `RuntimePolicy` | Policy, яка перетворює telemetry і constraints на runtime behavior. |
| hysteresis | Cooldown logic, яка не дає runtime часто перемикатися між quality levels. |
| `PerfTrace` | Structured trace recorder для offline performance analysis. |
| JSONL | Формат newline-delimited JSON для trace logs. |
| p50 | Median value across measurements. |
| p95 | 95th percentile. Корисний для production performance budgets. |
| p99 | 99th percentile. Корисний для tail-latency analysis. |
| throughput | Обсяг роботи за одиницю часу, часто tokens per second. |
| soak test | Тривалий stability test для перевірки runtime stability over time. |

## Platforms і build terms

| Термін | Опис |
| --- | --- |
| iOS device | Фізичний iPhone або iPad. Потрібен для реалістичної перевірки performance, microphone і camera behavior. |
| iOS simulator | Simulator target. Корисний для development, але ненадійний для GPU, microphone або performance validation. |
| macOS | Desktop Apple platform. Корисна для larger models і development workflows. |
| Android | Platform target, який може потребувати додаткової перевірки залежно від поточного стану підтримки. |
| Metal | Apple GPU acceleration framework. |
| Vulkan | Cross-platform graphics/compute API, який може згадуватися для future або platform-specific GPU work. |
| XCFramework | Apple package format для поширення native libraries між platforms і architectures. |
| CMake | Native build configuration tool. |
| `BUILD_TYPE` | Build variable, яка вибирає `Release`, `Debug` або споріднений native build type. |
| `ANDROID_NDK_HOME` | Environment variable, яка вказує шлях до Android NDK. |
| `IOS_DEPLOYMENT_TARGET` | Мінімальна iOS version, яку використовують iOS build scripts. |
| `--dart-define` | Flutter mechanism для передавання compile-time values у Dart-код. |

## Пов'язані docs

- [FAQ](./faq.md)
- [Configuration options](./configuration-options.md)
- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Performance metrics](./performance-metrics.md)
- [Storage and memory](./storage-and-memory.md)
- [Permissions](./permissions.md)
- [Environment variables](./environment-variables.md)
