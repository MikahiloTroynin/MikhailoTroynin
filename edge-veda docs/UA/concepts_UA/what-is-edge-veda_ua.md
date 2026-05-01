---
title: "Що таке Edge Veda?"
description: "Концептуальний огляд Edge Veda — керованого on-device AI runtime для Flutter-застосунків."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
---

# Що таке Edge Veda?

Edge Veda — це керований on-device AI runtime для Flutter-застосунків. Він допомагає розробникам запускати AI-можливості напряму на підтримуваних пристроях: генерацію тексту, streaming chat, vision, speech-to-text, text-to-speech, image generation, embeddings і retrieval-augmented generation.

Головна ідея Edge Veda проста: AI-фіча має не просто один раз запуститися в демо. Вона має залишатися стабільною в реальному застосунку, де є обмежена пам’ять, нагрів пристрою, батарея, довгі сесії та кілька паралельних навантажень.

Edge Veda працює як runtime-шар між Flutter-застосунком і локальними AI-рушіями. Застосунок викликає Dart SDK. SDK координує persistent workers, native inference libraries, runtime policies, telemetry та model-specific configuration.

## Навіщо існує Edge Veda

Багато on-device AI демо добре працюють для короткого prompt, одного зображення або невеликого тестового файлу. Production-застосунки працюють інакше. Вони можуть тримати модель завантаженою кілька хвилин, обробляти кадри з камери, стрімити токени в UI або поєднувати кілька workload-ів: speech recognition, embeddings і text generation.

У таких умовах з’являються типові проблеми:

- пристрій нагрівається і знижує продуктивність;
- пам’ять різко зростає, і операційна система завершує застосунок;
- перший запит працює, але наступні стають нестабільними;
- розробник не бачить, що відбувається всередині runtime;
- неправильний вибір моделі дає погану latency або crash;
- debugging вимагає одночасного розуміння Flutter, native-коду, model formats і device limits.

Edge Veda існує, щоб зробити такі сценарії більш передбачуваними. Він надає supervised runtime, який керує довгими сесіями, відстежує device pressure і дає розробнику єдиний SDK-інтерфейс для кількох локальних AI-можливостей.

## Чим є Edge Veda

Edge Veda — це:

- **Flutter SDK** для створення AI-фіч у mobile і desktop Flutter apps;
- **supervised runtime**, який утримує local inference workload-и в межах runtime policies;
- **worker-based execution layer**, який може тримати моделі завантаженими між запитами;
- **privacy-first AI stack**, де inference задуманий без cloud calls;
- **міст до native inference engines** через FFI і packaged native frameworks;
- **документаційно зручний API surface**, який надає high-level methods для text generation, embeddings, vision, image generation, memory checks і scheduler configuration.

З точки зору розробника застосунку Edge Veda має виглядати як Flutter package. З точки зору runtime він координує кілька нижчих систем: model files, worker isolates, native C/C++ engines, telemetry, runtime policies і device-specific constraints.

## Чим Edge Veda не є

Edge Veda — це не wrapper для cloud AI API. Його основна цінність не в тому, щоб відправити prompt до віддаленого LLM provider. Його основна цінність — local inference і runtime management.

Edge Veda також не є тонкою обгорткою навколо одного model engine. Проєкт поєднує кілька можливостей за одним runtime-oriented SDK. Text generation, vision, speech, embeddings, RAG, image generation і model selection розглядаються як частини однієї on-device system.

Також Edge Veda не гарантує, що будь-яка модель добре працюватиме на будь-якому телефоні. Model size, quantization, context length, GPU support, memory pressure і thermal state все одно важливі. Edge Veda надає інструменти й policies, щоб зробити ці обмеження видимими та керованими, але розробник усе одно має обирати моделі, які підходять для цільових пристроїв.

## Основні можливості

Edge Veda групує можливості навколо практичних application scenarios.

### Text generation і chat

SDK надає API для генерації тексту, streaming tokens і побудови multi-turn chat flows. Модель може залишатися завантаженою в persistent worker, щоб повторні prompt-и не потребували повного reload.

Типові use cases:

- локальні chat assistants;
- offline help і support flows;
- summarization;
- локальне reasoning по приватних нотатках;
- command interpretation для personal або IoT-style apps.

### Vision

Vision-можливості дають застосунку змогу описувати зображення або camera frames за допомогою локальних vision-language models. Це корисно для camera-based understanding, accessibility, inspection flows або private image analysis.

Типові use cases:

- описати зображення, вибране користувачем;
- аналізувати camera frames continuously;
- будувати private visual assistants;
- поєднувати image understanding із text generation.

### Speech-to-text і text-to-speech

Edge Veda включає локальний voice pipeline: speech recognition, LLM processing і speech output. Speech-to-text може використовувати on-device worker, а text-to-speech — platform capabilities, якщо вони доступні.

Типові use cases:

- voice journals;
- voice assistants;
- dictation;
- hands-free workflows;
- offline voice interfaces.

### Embeddings і RAG

SDK підтримує embeddings і local vector search, щоб застосунок міг знаходити релевантний локальний контент перед generation. Це дає retrieval-augmented generation без відправлення user documents на сервер.

Типові use cases:

- document Q&A;
- semantic search;
- personal knowledge bases;
- offline medical, legal або productivity assistants;
- private search по local notes чи files.

### Image generation

Edge Veda також підтримує on-device text-to-image generation через окремий image generation workflow. Оскільки image generation дуже вимогливий до пам’яті, йому потрібні сильні lifecycle і scheduling behavior.

Типові use cases:

- local creative tools;
- prototype image generation;
- privacy-sensitive visual generation;
- застосунки, де prompts і outputs мають залишатися на пристрої.

### Runtime supervision

Runtime supervision — це концепція, яка відрізняє Edge Veda від простого inference wrapper. Runtime може моніторити device signals і застосовувати policies, коли пристрій під тиском.

Runtime supervision може включати:

- thermal-aware behavior;
- memory-aware worker disposal;
- battery-aware quality-of-service levels;
- backpressure для continuous frame processing;
- tracing і debugging signals;
- scheduler-based arbitration для concurrent workloads.

## Де Edge Veda знаходиться у застосунку

Типовий Flutter-застосунок використовує Edge Veda так:

```text
Flutter UI
  ↓
Application feature code
  ↓
Edge Veda Dart SDK
  ↓
Sessions, pipelines, and workers
  ↓
Native inference engines and device runtime signals
```

Застосунку не потрібно напряму керувати кожною native inference detail. Він обирає модель, ініціалізує runtime, викликає capability і обробляє результат.

Наприклад, простий text generation flow зазвичай має такі кроки:

1. Додати Edge Veda package до Flutter project.
2. Передати path до сумісного model file.
3. Ініціалізувати `EdgeVeda` через `EdgeVedaConfig`.
4. Викликати generation method.
5. Показати response в UI.
6. Dispose або reuse resources відповідно до app lifecycle.

## Private by default

Основна модель Edge Veda — local inference. Prompts, images, audio, embeddings і retrieved documents мають оброблятися на пристрої. Це корисно для private user data, offline workflows, regulated content або personal knowledge bases.

Але local inference не знімає всі security responsibilities. Розробник усе одно має подумати про:

- де зберігаються model files;
- чи логуються prompts, transcripts, traces або generated outputs;
- чи синхронізує застосунок user files з backend;
- чи crash reports не містять sensitive data;
- чи використовується optional cloud handoff для low-confidence cases.

Хороше правило: вважайте on-device AI data sensitive, якщо користувач явно не очікує її поширення.

## Напрям підтримки платформ

Edge Veda орієнтований на Flutter і наразі фокусується на iOS/macOS-style on-device acceleration з Metal GPU. Android support є частиною напряму розвитку проєкту, але platform support завжди потрібно перевіряти за актуальним repository і release notes перед production-обіцянками.

Коли документуєте platform behavior, явно вказуйте:

- яку платформу тестували;
- який device class використовували;
- яку модель використовували;
- чи було ввімкнено GPU acceleration;
- чи результати виміряні, оцінені або заплановані.

## Кому варто використовувати Edge Veda?

Edge Veda добре підходить командам, які створюють:

- offline-first AI features;
- privacy-sensitive assistants;
- long-running on-device AI sessions;
- AI-фічі всередині Flutter apps;
- застосунки, які поєднують text, voice, vision і retrieval;
- prototypes, які мають шлях до production behavior.

Він менш доречний, якщо:

- застосунку потрібні найбільші cloud models;
- уся AI-робота має виконуватися на remote backend;
- цільові пристрої занадто слабкі для вибраної моделі;
- команда не може контролювати model distribution або storage;
- latency requirements виходять за межі реалістичних можливостей local model.

## Ключові терміни

| Термін | Значення |
| --- | --- |
| On-device AI | AI inference, який виконується на пристрої користувача, а не на remote server. |
| Runtime | Шар, який координує model loading, execution, workers, policies і resource handling. |
| Worker | Довгоживуча execution unit, яка може тримати модель завантаженою і обробляти запити без блокування UI. |
| FFI | Foreign Function Interface; механізм виклику native libraries із Dart. |
| RAG | Retrieval-augmented generation; пошук релевантного контенту перед генерацією відповіді. |
| Scheduler | Runtime component, який вирішує, як запускати workloads під memory, thermal і battery constraints. |
| Telemetry | Runtime signals для debugging і розуміння performance behavior. |

## Підсумок

Edge Veda — це Flutter-oriented on-device AI runtime для локальних AI-фіч, яким потрібно більше, ніж одноразове демо. Він поєднує high-level Dart APIs, persistent workers, native inference engines, model-aware configuration і runtime supervision.

Використовуйте Edge Veda, коли хочете, щоб AI-фічі залишалися приватними, працювали локально й були стабільними в умовах реальних device constraints.
