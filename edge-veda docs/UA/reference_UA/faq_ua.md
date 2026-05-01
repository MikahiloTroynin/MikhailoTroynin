---
title: "FAQ"
description: "Поширені питання про Edge Veda setup, models, local inference, performance, memory, permissions, RAG, speech, vision, image generation і production usage."
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

Цей FAQ відповідає на поширені питання про використання Edge Veda у Flutter-додатках.

Назви SDK-об'єктів, параметрів, форматів моделей і загальноприйняті технічні терміни залишено англійською. Пояснення подано українською.

Для термінів дивіться [Глосарій](./glossary.md).

## Загальні питання

### Що таке Edge Veda?

Edge Veda — це керований on-device AI runtime для Flutter. Він надає APIs для local text generation, streaming chat, embeddings, RAG, vision, speech-to-text, image generation, runtime supervision і observability.

### Яку проблему вирішує Edge Veda?

Багато on-device AI demos добре працюють у коротких прикладах, але стають нестабільними в реальних тривалих сесіях. Edge Veda фокусується на long-lived workers, memory limits, thermal behavior, battery drain, scheduler policies і traceability.

### Edge Veda — це лише wrapper навколо моделі?

Ні. SDK включає high-level Dart APIs, persistent workers, model management, RAG utilities, runtime supervision, telemetry, scheduler budgets і native inference bindings.

### Чи потрібен Edge Veda cloud API key?

Ні. Local inference не потребує provider API key. Host application може додати network features для model download, sync, analytics або optional cloud fallback, але це вже поведінка застосунку.

### Чи надсилає Edge Veda prompts на сервер?

За замовчуванням — ні. Inference виконується локально, якщо host app явно не додає network behavior. Якщо застосунок реалізує `cloud handoff`, потрібно окремо описати, коли і які data можуть залишати пристрій.

## Platforms

### Які platforms підтримуються?

Основна validated platform — iOS device з Metal acceleration. macOS корисна для development і larger workloads. iOS simulator підходить для development, але не є надійною ціллю для performance tests. Android support може потребувати додаткової перевірки залежно від поточного стану релізу.

### Чи можна тестувати performance на simulator?

Simulator варто використовувати лише для UI та integration work. Performance, GPU behavior, microphone behavior, camera behavior і memory pressure потрібно перевіряти на physical device.

### Чому документація часто наголошує на real device?

On-device AI behavior залежить від реальних фізичних обмежень: thermal state, battery, memory pressure, camera input, microphone input і GPU availability. Simulators не відображають ці умови достатньо точно.

## Installation і setup

### Як встановити Edge Veda?

Додайте package до `pubspec.yaml`, а потім ініціалізуйте runtime через `EdgeVedaConfig`.

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

### Що таке `modelPath`?

`modelPath` — це local file path до model, яку runtime має завантажити. Файл має вже існувати на пристрої.

### Де зберігати model files?

За можливості використовуйте `ModelManager` для downloaded models. Якщо застосунок сам керує файлами, зберігайте їх у app-controlled directory і надайте користувачу спосіб cleanup.

### Чи можна покласти model у bundle застосунку?

Так, але потрібно перевірити app size limits, license terms і придатність model file для distribution. Для large models часто практичнішим є runtime download.

## Models

### Який model format використовувати для text generation?

Для text generation використовуйте llama.cpp-compatible `GGUF` model.

### Чи можна завантажити будь-яку `GGUF` model?

Compatible `GGUF` model можна завантажити через file path, але практична підтримка залежить від memory, quantization, context length, chat template і device class. Завжди тестуйте на target hardware.

### З якої model краще почати?

Для mobile text generation починайте з compact model, наприклад 0.6B–1B. Для tool calling обирайте tool-capable model. Для vision починайте з small VLM і matching `mmproj` file.

### Що таке `ModelRegistry`?

`ModelRegistry` — це набір попередньо налаштованої model metadata для examples і model download flows.

### Що таке `ModelManager`?

`ModelManager` завантажує, зберігає, знаходить і перевіряє model files.

### Як вибрати model для конкретного device?

Використовуйте найменшу model, яка покриває задачу. Перевіряйте storage, memory, quantization і `contextLength`. Якщо доступний `ModelAdvisor`, використовуйте його, але фінально перевіряйте результат на real device з realistic prompts.

### Навіщо VLM потрібен `mmproj` file?

Багато vision-language models потребують multimodal projector. Projector перетворює image features у простір language model. Main VLM file і `mmproj` file мають відповідати одне одному.

### Чи можна використати `mmproj` від іншої model?

Ні. Не змішуйте projectors з іншої model family або model size, якщо model provider явно не підтвердив compatibility.

## Configuration

### Яка мінімальна configuration?

```dart
await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
));
```

Defaults підходять для першого тесту, але production apps мають свідомо налаштовувати `contextLength`, `useGpu`, `numThreads` і `maxMemoryMb`.

### Що контролює `contextLength`?

`contextLength` визначає, скільки tokens може поміститися в model context. Більше значення дозволяє довші conversations або prompts, але збільшує memory use.

### Яке значення використовувати для `maxMemoryMb`?

Починайте з conservative value для target device. Для mobile devices з 4 GB memory залишайте достатній запас для UI, camera, audio, vector indexes та інших компонентів застосунку.

### Чи треба вмикати `useGpu`?

Увімкніть `useGpu` на перевірених Apple devices, де доступний Metal acceleration. Вимикайте лише для debugging або коли target backend не підтримує GPU execution.

### Для чого потрібні `kvCacheTypeK` і `kvCacheTypeV`?

Ці параметри керують KV cache quantization. Default `Q8_0` values зменшують memory use і є хорошим mobile default.

## Text generation і chat

### Коли використовувати `generate()`, а коли `generateStream()`?

Використовуйте `generate()`, коли потрібен завершений final text. Використовуйте `generateStream()`, коли UX виграє від поступового incremental output.

### У чому різниця між `GenerateOptions.stream` і `generateStream()`?

`generateStream()` — це explicit streaming API. `GenerateOptions.stream` — option для compatible flows. Для token-by-token UI краще використовувати explicit streaming API.

### Як зробити output більш deterministic?

Зменште `temperature`, обмежте sampling randomness і використовуйте `jsonMode` або `grammarStr` для structured output.

### Як зупинити generation?

Використовуйте `stopSequences`, щоб зупиняти generation на конкретному text, або `CancelToken`, якщо API підтримує cancellation.

### Чому model повторюється?

Перевірте `repeatPenalty`, якість prompt, chat template, `contextLength` і те, чи model підходить для задачі.

## Structured output і function calling

### Як отримати валідний JSON?

Використовуйте `jsonMode` для простого JSON output. Для жорсткішого контролю використовуйте `grammarStr` з GBNF grammar або higher-level structured output helper.

### Що таке GBNF?

GBNF — це grammar format для constrained decoding. Він обмежує output моделі наперед визначеною структурою.

### Чи function calling працює з кожною model?

Ні. Потрібна tool-capable model і correct chat template. General chat models можуть повертати unreliable tool calls.

### Що таке `ToolRegistry`?

`ToolRegistry` — це набір tools, доступних для `ChatSession`.

### Чи можуть tools викликати external services?

Можуть, але це host app behavior. Якщо tool використовує network, це потрібно чітко задокументувати, бо така поведінка змінює privacy model feature.

## Embeddings і RAG

### Що таке RAG?

RAG означає Retrieval-Augmented Generation. Застосунок знаходить релевантні document chunks і додає їх до prompt перед generation.

### Що потрібно для RAG feature?

Потрібні embedding model, source documents, chunking logic, vector index, retrieval configuration і generation model.

### Що таке `VectorIndex`?

`VectorIndex` — це Dart vector search component для storing і searching embeddings.

### Що означає `topK`?

`topK` — це кількість chunks, які retrieval має повернути.

### Що означає `minScore`?

`minScore` — це мінімальний similarity score, який потрібен, щоб chunk вважався релевантним.

### Чому RAG answers слабкі?

Типові причини: поганий chunking, слабкі embeddings, занадто низький `minScore`, невдалий `topK`, відсутність потрібного source content або занадто мала generation model для питання.

## Vision, speech і image generation

### Як використовувати vision?

Ініціалізуйте vision model через `modelPath` і `mmprojPath`, а потім викликайте vision API або worker method для images чи frames.

### Чому для vision бажано використовувати persistent worker?

Vision models і projectors можуть бути великими. Якщо тримати їх завантаженими, повторні camera або image workflows не витрачають час на повторний model load.

### Чи speech-to-text працює локально?

Так. STT використовує local Whisper-compatible models через native backend.

### Чи потрібен microphone permission?

Лише для live recording або voice input. Transcribing existing file може потребувати file access залежно від того, як застосунок отримує файл.

### Чи text-to-speech потребує model file?

Якщо застосунок використовує OS speech APIs, додатковий model file не потрібен. Available voices залежать від operating system.

### Чому image generation використовує багато memory?

Diffusion workloads виділяють model memory і intermediate buffers. Memory зростає разом із image size, `steps`, model size, `sampler` і concurrent workloads.

## Performance і memory

### Як вимірювати performance?

Вимірюйте на physical device у `release` або `profile` mode. У звіті вказуйте model, quantization, device, OS, `contextLength`, prompt size, p50/p95 latency, tokens per second, peak memory, thermal state і battery behavior.

### Яка latency metric найважливіша?

Для production decisions використовуйте `p95_latency_ms`, бо вона краще показує, наскільки повільним буде experience у повільніших, але реалістичних сценаріях.

### Як зменшити memory use?

Використовуйте smaller model, нижчий `contextLength`, залишайте KV cache на `Q8_0`, dispose idle workers, уникайте concurrent heavy workloads і зменшуйте image/vision settings.

### Що робити, коли `MemoryStats.isHighPressure` дорівнює `true`?

Зупиніть optional workloads, не завантажуйте ще одну model, зменште context або generation length і dispose idle workers, де це можливо.

### Чому memory залишається високою після завершення call?

Persistent workers тримають models завантаженими для швидших наступних calls. Виконайте dispose відповідного worker або runtime, коли feature більше не потрібна.

### Для чого потрібен `Scheduler`?

`Scheduler` координує workloads у межах budgets для latency, thermal state, battery drain і memory ceilings. Він може degrade lower-priority workloads перед higher-priority workloads.

## Permissions і privacy

### Які permissions потрібні для basic text generation?

Жодних, окрім app sandbox file access до model file.

### Які features потребують microphone permission?

Live speech-to-text і voice assistant flows.

### Які features потребують camera permission?

Лише features, які напряму захоплюють images from camera для vision inference.

### Чи model download потребує network permission?

Так. Застосунку потрібен network access, якщо він завантажує model files at runtime.

### Чи мають traces містити prompts і outputs?

За замовчуванням — ні. Не зберігайте sensitive prompts, documents, transcripts, image descriptions або generated outputs у production traces.

## Troubleshooting

### Model load fails. Що перевірити?

Перевірте, що file exists, format supported, file complete, checksum matches, model fits memory і path accessible.

### Generation is slow. Що перевірити?

Перевірте build mode, model size, quantization, `contextLength`, GPU setting, thermal state, battery level і whether other workloads active.

### UI freezes. У чому проблема?

Blocking inference call може виконуватися на UI thread. Тривалий native inference має запускатися через Edge Veda workers або isolates.

### Vision fails, хоча model load проходить успішно. Що перевірити?

Перевірте, що `mmprojPath` вказує на matching projector і що image dimensions/format відповідають API expectations.

### STT is slow або delayed. Що перевірити?

Перевірте audio chunk size, sample rate conversion, model size, device thermal state і чи застосунок не використовує simulator.

### App crashes under memory pressure. Що робити?

Використайте smaller model, зменште `contextLength`, dispose idle workers, зменште image size, уникайте simultaneous heavy workloads і налаштуйте scheduler budgets.

## Production readiness

### Що перевірити перед release?

Перевірте real-device performance, permissions, model licenses, storage cleanup, memory behavior, privacy claims, logging, fallback behavior і error handling.

### Чи потрібно документувати model licenses?

Так. Document license для кожної bundled або downloadable model і перевірте, що license дозволяє ваш product use.

### Чи потрібно давати users можливість видалити model?

Так. Users мають мати можливість remove downloaded models і clear generated artifacts where applicable.

### Чи можна використовувати Edge Veda в regulated або offline-first apps?

Edge Veda може підтримувати offline-first і privacy-sensitive designs, але full app має пройти окремий review. Inference є local by default, але logs, tools, sync, downloads, analytics і cloud fallback можуть змінити privacy/compliance model.

## Documentation

### Куди додавати нові docs?

Conceptual docs додавайте в `concepts`, task-based docs — у `guides`, API і parameter references — у `reference`, platform-specific notes — у `platforms`, runnable scenarios — у `examples`.

### Як review API pages?

Перевіряйте public Dart signature, parameters, return fields, errors, examples, platform constraints, performance notes, privacy notes і source references.

### Як часто оновлювати docs?

Оновлюйте docs щоразу, коли змінюються public APIs, model registry entries, build requirements, supported platforms, default configuration values або production behavior.

## Пов'язані docs

- [Глосарій](./glossary.md)
- [Configuration options](./configuration-options.md)
- [Supported models](./supported-models.md)
- [Model formats](./model-formats.md)
- [Quantization levels](./quantization-levels.md)
- [Performance metrics](./performance-metrics.md)
- [Storage and memory](./storage-and-memory.md)
- [Permissions](./permissions.md)
- [Environment variables](./environment-variables.md)
