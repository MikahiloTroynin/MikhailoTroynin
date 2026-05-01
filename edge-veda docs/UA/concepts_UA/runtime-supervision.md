---
title: "Runtime supervision"
description: "Як Edge Veda контролює on-device AI workloads під обмеженнями пам’яті, температури, батареї та latency."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
related:
  - "architecture.md"
  - "workers-and-isolates.md"
  - "model-management.md"
---

# Runtime supervision

Runtime supervision — це частина Edge Veda, яка робить локальні AI-навантаження передбачуваними під час реального використання. Вона відстежує стан пристрою, застосовує runtime policies і координує, як виконуються workloads, коли пам’ять, температура, батарея або concurrency стають ризиковими.

Без supervision on-device AI може добре працювати в короткому демо, але ламатися у довгій сесії. Модель може завантажитися, відповісти на перший prompt, а потім стати нестабільною через нагрів пристрою, memory spikes або конкуренцію кількох workers за ті самі ресурси.

## Навіщо потрібен supervision

On-device AI працює в обмеженому середовищі. Один Flutter-застосунок конкурує за CPU, GPU, RAM, storage, camera, microphone, battery і UI responsiveness. Cloud server може масштабувати ресурси. Телефон — ні.

Типові unmanaged failure patterns:

- thermal throttling різко знижує throughput;
- memory spikes завершують застосунок;
- camera frames накопичуються швидше, ніж модель їх обробляє;
- image generation забирає пам’ять, потрібну text або vision workers;
- long session стає повільнішою після кількох запитів;
- розробник не бачить, чому змінилася latency.

Runtime supervision перетворює ці проблеми на контрольовані runtime states.

## Що контролює runtime

| Вимір | Що означає | Типова реакція runtime |
| --- | --- | --- |
| Memory | Застосунок наближається до небезпечного memory usage. | Dispose idle workers, reject heavy work, reduce context length. |
| Thermal state | Sustained compute нагріває пристрій. | Lower priority, pause non-critical work, reduce frame rate. |
| Battery | Пристрій має уникати expensive workloads. | Use lighter QoS profile або defer background work. |
| Latency | Requests не вкладаються в очікуваний response time. | Adjust queueing, reduce workload, report degradation. |
| Concurrency | Кілька AI workloads конкурують одночасно. | Schedule by priority and budget. |
| Backpressure | Inputs приходять швидше, ніж завершується processing. | Drop frames, skip work, avoid unbounded queues. |

Мета не в тому, щоб будь-який workload завжди запускався. Мета — стабільність застосунку і чесна поведінка щодо того, що може виконуватися зараз.

## Compute budgets

Compute budget — це контракт між застосунком і runtime. Він описує допустимий operating envelope для workload.

Budget може включати:

- target p95 latency;
- maximum battery drain;
- thermal ceiling;
- memory ceiling;
- workload priority;
- interactive або background mode;
- дозвіл на degradation.

Наприклад, interactive chat response має бути пріоритетнішим за background embedding. Camera frame можна drop-нути, якщо наступний кадр прийшов до завершення аналізу. Image generation можна pause або evict, якщо зростає memory pressure.

## Scheduler і policy

Scheduler — це runtime component, який арбітрує роботу. Він вирішує, чи запускати, відкласти, зменшити або відхилити request залежно від поточного стану device і priority workload.

Telemetry каже, що відбувається. Policy каже, що з цим робити.

Policy decisions можуть включати:

- dispose idle workers before active workers;
- reduce non-critical work first under thermal pressure;
- drop camera frames instead of queueing forever;
- prefer smaller model when battery is low;
- keep user-visible requests responsive even if background throughput decreases.

Хороша policy має бути predictable. Developers мають знати, що runtime може зробити і як застосунок має це пояснити користувачу.

## Hysteresis

Hysteresis не дає runtime перемикати стани занадто агресивно. Якщо device коротко став hot, runtime не має миттєво зменшити work і так само миттєво відновити його. Інакше застосунок oscillate-ить між станами, а latency стає нестабільною.

## Backpressure

Backpressure захищає continuous workloads: camera frames і streaming audio. Такі inputs можуть приходити швидше, ніж model їх обробляє.

Supervised design може:

- тримати лише latest useful frame;
- drop frames while model is busy;
- lower camera frame rate;
- reduce input resolution;
- pause processing when screen is not visible;
- report degraded stream.

Backpressure краще, ніж infinite queue.

## Worker eviction

Persistent workers покращують latency, бо models stay loaded. Але вони reserve memory. Runtime supervision вирішує, коли idle worker треба dispose.

Практичний eviction order:

1. dispose idle workers first;
2. keep worker for visible feature;
3. evict large memory-heavy workers before small workers;
4. avoid evicting active interactive work unless necessary;
5. report eviction, щоб наступний request міг пояснити reload delay.

## Observability

Supervision має бути observable. Корисні signals:

- model load time;
- first-token latency;
- tokens per second;
- memory pressure events;
- thermal events;
- dropped frame counts;
- worker lifecycle events;
- scheduler decisions;
- eviction events;
- validation events for structured output.

Structured traces не мають містити sensitive prompts або user data.

## Підсумок

Runtime supervision робить Edge Veda managed runtime, а не тонкою обгорткою над inference. Він відстежує device pressure, schedule-ить work, керує worker lifecycle, застосовує policies і відкриває telemetry, щоб long-running local AI стабільно працював на реальних пристроях.
