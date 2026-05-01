---
title: "Thermal throttling"
description: "Як усувати перегрів, падіння throughput, зміни scheduler policy та нестабільність довгих session в Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Thermal throttling

Використовуйте цю сторінку, коли застосунок з Edge Veda спочатку працює швидко, але сповільнюється під час тривалого inference, streaming стає нерівномірним через кілька хвилин, latency для STT зростає, vision throughput падає або image generation швидко нагріває пристрій.

Thermal throttling — це не звичайний Dart exception. Це реакція пристрою на тривале обчислювальне навантаження. On-device AI може викликати її, бо LLM inference, STT, vision, image generation, embeddings і RAG одночасно навантажують CPU, GPU, памʼять і батарею.

## Типові симптоми

| Симптом | Ймовірна причина | Перша дія |
| --- | --- | --- |
| Tokens спочатку йдуть швидко, потім повільно | Thermal state пристрою змінився під тривалим LLM-навантаженням. | Зменште workload і перевірте runtime policy events. |
| STT chunks обробляються довше | Постійна transcribe-обробка нагріває пристрій. | Додайте паузи або зменште паралельну роботу. |
| Image generation стартує, але потім зависає | Diffusion workload занадто важкий для поточного стану пристрою. | Генеруйте одне зображення за раз. |
| Vision FPS падає | Camera/vision loop не має backpressure. | Відкидайте зайві frames, не ставте всі в чергу. |
| Застосунок живий, але throughput нижчий | Scheduler знижує навантаження замість crash. | Перевірте, чи runtime policy знизила priority або evicted workers. |
| iOS завершує застосунок | Thermal pressure поєднався з memory pressure. | Перевірте Xcode device logs і зменште model/context size. |

## Швидка стабілізація

1. Тестуйте на фізичному iPhone, а не тільки в iOS Simulator.
2. Зупиніть усі необовʼязкові workers.
3. Зменште `contextLength`.
4. Використайте меншу модель або легшу quantization.
5. Запускайте один важкий напрям за раз: text, STT, vision, image generation або RAG.
6. Додайте backpressure для streaming і vision loops.
7. Використовуйте `Scheduler` або runtime policy замість запуску workload з кожної UI-події.
8. Запишіть модель пристрою, iOS version, session duration і workload mix.

## Як виявити thermal degradation

Thermal issues зазвичай залежать від часу. Одноразовий тест може пройти, а реальна session впаде через кілька хвилин.

Тестова матриця:

| Тест | Призначення |
| --- | --- |
| 1 prompt, короткий input | Перевіряє базове model load і generation. |
| 10 prompts, короткий input | Виявляє accumulation або context growth. |
| 5-minute stream | Виявляє slowdown у тривалому text generation. |
| 10-minute STT session | Виявляє навантаження microphone + Whisper. |
| RAG + generation | Перевіряє two-model pipeline. |
| Image generation alone | Міряє найважчий thermal load. |
| Mixed workload | Перевіряє scheduler behavior у реальному сценарії. |

## Рекомендоване логування

Логуйте достатньо, щоб побачити, чи runtime навмисно знижує навантаження.

```dart
final stats = edgeVeda.getMemoryStats();
print('memory: $stats');

final start = DateTime.now();
var tokenCount = 0;

await for (final chunk in edgeVeda.generateStream(prompt)) {
  tokenCount += 1;
  final elapsed = DateTime.now().difference(start).inMilliseconds;
  if (elapsed > 0 && tokenCount % 20 == 0) {
    final tokPerSec = tokenCount / (elapsed / 1000);
    print('tokens=$tokenCount tok/s=${tokPerSec.toStringAsFixed(2)}');
  }
}
```

Якщо доступно, додатково логуйте scheduler decisions, worker eviction і policy state changes.

## Рішення для різних workload

### Text generation

| Причина | Рішення |
| --- | --- |
| `contextLength` занадто великий | Зменште `contextLength` до мінімуму, достатнього для задачі. |
| Chat history постійно зростає | Узагальнюйте старі turns і тримайте активним лише recent context. |
| Кілька generation requests накладаються | Серіалізуйте requests або пропускайте їх через scheduler. |
| Модель занадто велика | Використайте `ModelAdvisor.recommend()` і виберіть меншу модель. |

### Streaming

Streaming може приховувати thermal degradation, бо tokens усе ще приходять, просто повільніше.

Рішення:

- Вимірюйте `timeToFirstToken`.
- Вимірюйте moving average tokens per second.
- Скасовуйте або ставте на паузу довгі streams, коли користувач залишає екран.
- Не робіть дорогий UI rebuild на кожен token.
- Буферизуйте дрібні chunks перед оновленням UI.

### Speech-to-text

STT може працювати постійно і нагрівати пристрій навіть тоді, коли UI виглядає неактивним.

Рішення:

- Обробляйте audio короткими chunks.
- Додайте silence detection, якщо це дозволяє product behavior.
- Не запускайте STT, LLM, TTS і RAG одночасно з повним priority.
- Звільняйте audio buffers після кожного transcription step.
- Тестуйте і в тихому, і в шумному середовищі.

### Image generation

Image generation — один із найважчих workload.

Рішення:

- Генеруйте одне зображення за раз.
- Зменште resolution або step count, якщо це підтримує pipeline.
- Звільняйте image worker після використання або покладайтесь на idle auto-disposal.
- Не запускайте image generation, коли активний великий LLM stream на lower-memory devices.

### RAG

RAG може поєднувати embedder, vector index, retriever і generator в одній дії користувача.

Рішення:

- Тримайте active vector index компактним.
- Обмежуйте `topK`.
- Не запускайте embedding великих document batches під час generation.
- Pre-index documents перед початком chat session.
- Inject лише chunks, потрібні для поточного question.

## UX-рекомендації

Thermal throttling не має виглядати як поламаний застосунок.

Використовуйте зрозумілі стани:

- **Preparing model** — модель завантажується.
- **Running locally** — inference активний на пристрої.
- **Optimizing performance** — runtime policy зменшила workload.
- **Cooling down** — застосунок тимчасово знижує generation speed.
- **Try a smaller model** — пристрій не може стабільно тягнути поточний workload.

Не показуйте `Error` або `Failed`, якщо система навмисно знижує навантаження, щоб зберегти session.

## Чого не робити

- Не стартуйте всі AI workers під час app launch.
- Не запускайте continuous STT і image generation одночасно за замовчуванням.
- Не перемальовуйте повний chat screen на кожен token.
- Не тримайте великі image, audio і document buffers у памʼяті після використання.
- Не сприймайте simulator performance як device performance.
- Не приховуйте thermal degradation з logs.

## Діагностика

Додайте:

- Модель пристрою та iOS version.
- Версію Edge Veda.
- Model name, format, quantization і size.
- `EdgeVedaConfig`, особливо `contextLength` і `useGpu`.
- Workload mix: text, STT, TTS, vision, image generation, RAG.
- Session duration до slowdown.
- `timeToFirstToken` і tokens per second у часі.
- Memory stats до load, під час generation і після завершення.
- Xcode device logs, якщо застосунок завершується.
- Чи допомагає менша модель або вимкнення іншого worker.

## Повʼязані документи

- [Проблеми памʼяті](./memory-issues.md)
- [Проблеми streaming](./streaming-issues.md)
- [Проблеми STT/TTS](./stt-tts-issues.md)
- [Проблеми RAG](./rag-issues.md)
- [Runtime policy](../guides/runtime-policy.md)
- [Scheduler and budgets](../guides/scheduler-and-budgets.md)
- [Performance tuning](../guides/performance-tuning.md)
