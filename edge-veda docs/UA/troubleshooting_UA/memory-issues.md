---
title: "Проблеми памʼяті"
description: "Як усувати memory pressure, iOS termination, model eviction, context length, concurrent workloads і long-session stability в Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми памʼяті

Використовуйте цю сторінку, коли застосунок з Edge Veda завершується iOS, падає під час model loading, сповільнюється після довгої session, не витримує concurrent workloads або показує memory pressure у runtime diagnostics.

On-device AI workloads активно використовують памʼять. Edge Veda може supervise workers і degrade gracefully, але app-level рішення все одно важливі: model size, context length, worker concurrency, image generation, RAG indexes і довга chat history можуть вивести пристрій за безпечні межі.

## Типові симптоми

| Симптом | Ймовірна причина | Перша дія |
| --- | --- | --- |
| Застосунок закривається без Dart exception | iOS завершила процес через memory pressure. | Відтворіть з підключеним Xcode і перевірте device logs. |
| `EdgeVeda.init()` падає | Модель не вміщається в доступну памʼять. | Спробуйте меншу модель і зменште `contextLength`. |
| Перша відповідь працює, наступні падають | Chat history або KV cache занадто зростає. | Узагальніть history і зменште context size. |
| Image generation падає | Diffusion model використовує забагато памʼяті. | Запускайте image generation окремо і звільняйте idle workers. |
| RAG-застосунок падає після indexing | Vector index або document chunks занадто великі. | Зменште chunk count, dimensions або loaded documents. |
| Performance погіршується з часом | Thermal або memory pressure активує runtime policy. | Перегляньте telemetry і зменште concurrent workloads. |

## Швидка стабілізація

1. Тестуйте на фізичному iPhone, а не тільки в simulator.
2. Почніть з малої known-good model.
3. Зменште `contextLength`.
4. Вимкніть необовʼязкові workers.
5. Не запускайте text generation, STT, vision, RAG та image generation одночасно.
6. Звільняйте idle workers перед завантаженням іншої великої моделі.
7. Використовуйте `ModelAdvisor`, щоб підібрати модель під device tier.
8. Зберіть `getMemoryStats()` до і після model load.

## Перевірка памʼяті перед loading

```dart
final device = DeviceProfile.detect();

final recommendation = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);

final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

print('Device: ${device.deviceName}, ${device.totalRamGB}GB');
print('Recommended: ${recommendation.bestMatch?.model.name}');
print('Can run: $canRun');
```

Ініціалізуйте з обережними defaults:

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

## Зменшення памʼяті для text generation

| Фактор | Вплив | Рекомендація |
| --- | --- | --- |
| Model size | Більші моделі використовують більше RAM. | Почніть з 1B-class model перед тестуванням більших моделей. |
| Quantization | Lower-bit quantization зазвичай зменшує памʼять. | Використовуйте підтримувану quantization, яка балансує quality і fit. |
| `contextLength` | Більший context збільшує KV cache memory. | Використовуйте найменший context, достатній для product workflow. |
| Довга chat history | History збільшує prompt і context pressure. | Summarize, trim або persist старі turns поза active context. |
| Concurrent generation | Кілька workloads конкурують за памʼять. | Пропускайте важку роботу через scheduler. |

## Довгі chat sessions

Рекомендований pattern:

- Тримайте recent turns в active prompt.
- Узагальнюйте older turns.
- За потреби зберігайте старі raw turns поза active inference context.
- На пристроях з меншою памʼяттю використовуйте менший `contextLength`.
- Моніторте latency і memory після кожного turn.

```dart
final stats = edgeVeda.getMemoryStats();
print('Memory stats: $stats');
```

Якщо памʼять продовжує зростати, перевірте, чи застосунок не утримує references на старі responses, images, audio chunks, embeddings або document content.

## Уникайте concurrent heavy workers

| Сценарій | Безпечніший pattern |
| --- | --- |
| Chat + STT + TTS | Тримайте chat loaded, стримте STT короткими chunks, швидко звільняйте audio buffers. |
| Vision + chat | Обробляйте frames з backpressure; не ставте кожен frame у чергу. |
| RAG + chat | Тримайте index компактним і inject тільки top relevant chunks. |
| Image generation + chat | На lower-memory devices pause або dispose chat worker перед loading image model. |

## Memory pressure під час image generation

Якщо застосунок завершується під час image generation:

- Генеруйте одне зображення за раз.
- Зменште resolution, якщо це підтримує вибраний model path.
- Не запускайте image generation паралельно з STT, vision або RAG.
- Звільняйте image worker після використання або покладайтесь на idle auto-disposal.
- Тестуйте на пристроях з більшою памʼяттю перед увімкненням feature за замовчуванням.

## Memory pressure у RAG та vector index

Чекліст рішення:

- Зменште chunk size і overlap.
- Обмежте кількість документів, завантажених в active session.
- Persist vector index на диск і завантажуйте тільки потрібне для flow.
- Inject тільки top `k` chunks у prompt.
- Не тримайте raw documents в active prompt.
- Вимірюйте memory до indexing, після indexing і після generation.

## iOS завершує застосунок без exception

Dart може не отримати exception, коли iOS завершує process через memory pressure.

Підтвердження:

1. Запустіть застосунок з Xcode на фізичному пристрої.
2. Відтворіть crash.
3. Відкрийте device logs.
4. Шукайте memory pressure, jetsam або termination messages.

Потім змініть:

- Використайте меншу модель.
- Зменште `contextLength`.
- Вимкніть simultaneous workers.
- Зменште document і embedding batch sizes.
- Звільняйте великі images, audio buffers і document strings.
- Не тримайте кілька `EdgeVeda` runtime instances.

## Захист від duplicate runtime instances

Не робіть так:

```dart
final edgeVedaA = EdgeVeda();
final edgeVedaB = EdgeVeda();
await edgeVedaA.init(EdgeVedaConfig(modelPath: modelPath));
await edgeVedaB.init(EdgeVedaConfig(modelPath: modelPath));
```

Краще мати один app-level runtime holder:

```dart
class RuntimeProvider {
  RuntimeProvider(this.modelPath);

  final String modelPath;
  EdgeVeda? _edgeVeda;

  Future<EdgeVeda> get runtime async {
    if (_edgeVeda != null) return _edgeVeda!;
    final instance = EdgeVeda();
    await instance.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));
    _edgeVeda = instance;
    return instance;
  }
}
```

## Безпечний для памʼяті troubleshooting flow

1. Запустіть найменшу підтримувану модель.
2. Виконайте один prompt з коротким input.
3. Виконайте десять prompts з коротким input.
4. Збільшуйте `contextLength` лише якщо це потрібно.
5. Додайте chat history.
6. Додайте RAG retrieval.
7. Додайте STT, TTS або vision.
8. Додайте image generation останнім.

Якщо памʼять падає на певному кроці, остання додана feature або setting є головним підозрюваним.

## Діагностика

Додайте:

- Модель пристрою і RAM tier, якщо відомо.
- Версію iOS.
- Версію Edge Veda.
- Model name, format, quantization level і file size.
- Значення `EdgeVedaConfig`, особливо `contextLength` і `useGpu`.
- Чи були активні RAG, STT, TTS, vision або image generation.
- Memory stats до load, після load, перед generation і після generation.
- Xcode device logs, якщо iOS завершує застосунок.
- Minimal reproduction, який завантажує ту саму модель і виконує один prompt.

## Повʼязані документи

- [Проблеми завантаження моделей](./model-loading-issues.md)
- [Проблеми встановлення](./installation-issues.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Memory management](../guides/memory-management.md)
- [Storage and memory](../reference/storage-and-memory.md)
- [Model advisor](../guides/model-advisor.md)
- [Runtime policy](../guides/runtime-policy.md)
