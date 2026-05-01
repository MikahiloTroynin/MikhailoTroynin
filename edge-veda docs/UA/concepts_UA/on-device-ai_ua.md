---
title: "On-device AI"
description: "Концептуальний гайд про on-device AI, різницю з cloud AI та ключові рішення для розробки з Edge Veda."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
---

# On-device AI

On-device AI означає, що model inference виконується на пристрої користувача, а не відправляється на cloud server. Model file зберігається локально або доставляється разом із застосунком, input обробляється локально, і output також створюється локально.

Для Flutter-застосунків on-device AI може дати приватність, offline behavior і низьку latency. Але він також ускладнює розробку, тому що телефони й ноутбуки мають обмеження, які cloud servers приховують від розробника.

Edge Veda побудований навколо цього trade-off. Він дає Flutter-розробникам runtime для local AI і допомагає керувати device constraints: пам’яттю, температурою, батареєю, розміром моделі та довгими сесіями.

## Cloud AI vs on-device AI

Cloud AI і on-device AI вирішують різні задачі.

| Область | Cloud AI | On-device AI |
| --- | --- | --- |
| Розмір моделі | Можна використовувати дуже великі моделі на серверах. | Потрібні моделі, які поміщаються на target device. |
| Privacy | User input відправляється на remote service, якщо не використовуються додаткові safeguards. | Input може залишатися на пристрої під час inference. |
| Offline support | Зазвичай потребує network access. | Може працювати без network access після setup моделі. |
| Latency | Залежить від мережі, server load і region. | Залежить від device performance і model size. |
| Cost | Зазвичай має usage-based server/API cost. | Переносить cost у device storage, CPU/GPU, battery і engineering effort. |
| Updates | Модель можна змінити server-side. | Потрібно керувати model distribution і compatibility у застосунку. |
| Observability | Є server-side logs і metrics. | Потрібна local runtime telemetry і обережна робота з даними. |

Вибір не завжди є “або-або”. Деякі застосунки використовують local inference by default і роблять fallback to cloud лише коли local model uncertain або unsupported. Такий hybrid approach усе одно потребує чіткої privacy model і правильних user expectations.

## Чому розробники обирають on-device AI

Зазвичай розробники обирають on-device AI з однієї або кількох причин.

### Privacy

Prompts, documents, images, transcripts і embeddings можуть містити sensitive information. Local inference зменшує передачу даних до remote services.

Приклади:

- personal journals;
- medical documents;
- legal documents;
- enterprise files;
- private photos;
- local smart home commands.

### Offline behavior

Деякі застосунки мають працювати без стабільного network access. On-device AI може підтримувати offline chat, local document search, voice transcription або image understanding.

Приклади:

- field work apps;
- travel apps;
- offline learning tools;
- device-local assistants;
- industrial або IoT-style workflows.

### Нижча interaction latency

Для достатньо малих моделей local inference може прибрати network round trips. Це особливо корисно для streaming responses, коротких commands, camera loops або voice interactions.

### Cost control

Cloud inference може створювати variable runtime cost. On-device inference може зменшити API spend, але додає інші витрати: model hosting, app size, testing, performance tuning і device compatibility work.

### Product differentiation

Локальна AI-фіча може позиціонуватися як private, offline-first або device-native. Це важливо для consumer apps, regulated workflows і developer tools.

## Складні частини on-device AI

On-device AI додає обмеження, які server-based AI зазвичай приховує.

### Model size

Модель, яка добре працює на одному пристрої, може не працювати на іншому. Model size впливає на:

- download size;
- app storage usage;
- memory footprint;
- cold start time;
- inference speed;
- battery usage.

Розробнику варто обирати найменшу модель, яка дає прийнятну якість для конкретного use case.

### Memory pressure

Mobile operating systems можуть завершити застосунок, якщо він використовує забагато пам’яті. AI models можуть виділяти великі buffers під час loading або inference. Image generation і vision workloads можуть бути особливо memory-heavy.

Production app потребує memory strategy:

- не завантажувати unused models;
- reuse loaded workers, якщо можливо;
- dispose idle workers;
- не запускати забагато workloads одночасно;
- показувати зрозумілі errors замість silent crashes.

### Thermal pressure

Sustained AI workloads нагрівають пристрій. Коли пристрій стає гарячим, операційна система може throttling CPU/GPU performance. Throughput падає, latency стає нестабільною, UX погіршується.

Thermal-aware behavior може включати:

- зменшення output length;
- зниження camera frame rate;
- зменшення image resolution;
- паузу non-critical work;
- прохання до користувача почекати;
- перехід на легшу модель.

### Battery usage

Local inference використовує battery. Фіча, яка виглядає добре в однохвилинному демо, може бути неприйнятною в довгій сесії. Застосунок має уникати зайвого background inference і поважати low-power conditions.

### UI responsiveness

AI inference не має блокувати Flutter UI thread. Long-running work має виконуватися у workers або isolates, щоб застосунок залишався responsive під час generation, transcription або embedding.

### Model compatibility

Різні model families потребують різних templates, tokenization behavior, formats і configuration. Неправильний chat template може давати repeated або malformed output, навіть якщо модель технічно завантажилася.

Документація має пояснювати:

- яка model family очікується;
- який file format використовується;
- який template потрібен;
- який target device class протестовано;
- які configuration values є safe defaults.

## Як Edge Veda підходить до on-device AI

Edge Veda розглядає local AI як runtime problem, а не лише model-loading problem.

Runtime approach має кілька наслідків:

1. **Workers залишаються активними, коли це корисно.** Модель може завантажитися один раз і використовуватися повторно.
2. **Workloads supervised.** Runtime може реагувати на memory, thermal і battery pressure.
3. **Capabilities мають спільний SDK.** Text, vision, speech, embeddings, image generation і RAG доступні через пов’язані concepts.
4. **Observability важлива.** Розробнику потрібні runtime signals, щоб розуміти failures і latency.
5. **Privacy — default posture.** Основний inference path локальний.

Цей підхід особливо корисний для long-running features: chat, camera analysis, speech transcription, voice journaling і document Q&A.

## Типові on-device AI patterns

### Local chat assistant

Chat assistant завантажує text model і тримає session active, поки користувач надсилає messages. Він може stream tokens у UI і summarize old context, коли conversation стає занадто довгою.

Важливі concerns:

- context length;
- chat template;
- model memory;
- streaming UI;
- cancellation;
- session reset;
- graceful degradation under pressure.

### Document Q&A

Document Q&A flow зазвичай поєднує embeddings, vector search і text generation.

Типовий flow:

1. Extract text from a document.
2. Split text into chunks.
3. Generate embeddings for chunks.
4. Store embeddings in a vector index.
5. Embed the user question.
6. Retrieve relevant chunks.
7. Inject retrieved context into the prompt.
8. Generate an answer locally.

Важливі concerns:

- chunk size;
- embedding model compatibility;
- vector index persistence;
- source attribution;
- hallucination control;
- sensitive document handling.

### Voice assistant

Voice assistant може поєднувати speech-to-text, text generation, function calling і text-to-speech.

Важливі concerns:

- microphone permissions;
- audio sampling and chunking;
- transcription latency;
- interruption handling;
- tool execution safety;
- speech output cancellation.

### Continuous vision

Camera-based flow надсилає frames до vision worker. Застосунок має уникати черги з надто багатьох frames, бо backlog руйнує latency і memory behavior.

Важливі concerns:

- frame rate;
- input resolution;
- backpressure;
- thermal pressure;
- user consent;
- privacy of camera data.

## Design principles для on-device AI features

### Починайте з найменшої корисної моделі

Не починайте з найбільшої моделі, яка “можливо поміститься”. Починайте з моделі, яка поміщається комфортно, а якість покращуйте лише за потреби.

### Stream when users wait

Для text generation streaming покращує perceived responsiveness. Користувач бачить прогрес, поки модель продовжує generation.

### Make cancellation explicit

Користувач має мати можливість зупинити long-running generation, transcription або image generation. Cancellation має безпечно прибирати ресурси.

### Відділяйте model setup від feature logic

Model download, storage, compatibility checks і initialization мають бути відокремлені від screen або feature, яка використовує модель.

### Treat every generated answer as untrusted

Local inference не прибирає hallucinations. Локальна модель теж може помилятися. Для high-stakes use cases показуйте uncertainty, цитуйте retrieved sources і додавайте user-facing limitations.

### Observe real devices

Simulator behavior недостатньо. On-device AI треба тестувати на реальних target devices із реалістичною session length.

## Documentation checklist

Коли документуєте on-device AI feature, додайте:

- target platform і device class;
- model family і file format;
- model size;
- initialization steps;
- memory expectations;
- latency expectations;
- lifecycle behavior;
- cancellation behavior;
- permissions;
- privacy behavior;
- troubleshooting для common failure states.

## Підсумок

On-device AI дає Flutter-застосункам privacy, offline behavior і device-native interaction. Але він додає реальні обмеження: memory, heat, battery, model compatibility і lifecycle management.

Edge Veda допомагає тим, що трактує ці constraints як частину runtime. Замість лише model call він дає managed layer для local AI workloads, які мають пережити реальне використання застосунку.
