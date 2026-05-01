---
title: "Проблеми performance"
description: "Як усувати latency, throughput, timeToFirstToken, streaming speed, worker contention, tracing і long-session performance в Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми performance

Використовуйте цю сторінку, коли застосунок з Edge Veda працює коректно, але здається повільним, має затримку першої відповіді, нерівномірно стримить tokens, добре проходить короткі тести, але сповільнюється в реальних sessions, або показує performance regressions після зміни model, device, runtime settings чи workload mix.

Performance troubleshooting відрізняється від build troubleshooting або model loading troubleshooting. Застосунок може технічно працювати, але user experience буде погіршений.

## Що вимірювати спочатку

Не оптимізуйте до вимірювань. Фіксуйте ті самі metrics для кожного test run.

| Metric | Що означає | Чому важливо |
| --- | --- | --- |
| `timeToFirstToken` | Час від старту request до першого streamed token. | Головна perceived latency для chat. |
| Tokens per second | Середній generation throughput. | Основна throughput metric для text generation. |
| p95 latency | Slow-path latency у багатьох requests. | Корисніше за average для реальних users. |
| Model load time | Час до готовності runtime. | Впливає на first use і cold start. |
| Memory before/after load | Memory pressure від model і cache. | Пояснює crashes і slowdowns. |
| Retrieval time | Час RAG search і prompt assembly. | Пояснює delayed streaming у RAG flows. |
| STT chunk latency | Час transcription одного audio chunk. | Пояснює voice pipeline lag. |
| Image step time | Час одного diffusion step. | Пояснює тривалість image generation. |
| Thermal state over time | Чи змінюється стан пристрою під час sustained work. | Пояснює performance collapse через кілька хвилин. |

## Швидка діагностика

Почніть з контрольованого baseline:

1. Використовуйте фізичний iPhone, а не тільки iOS Simulator.
2. Використовуйте known small model, наприклад 1B-class chat model.
3. Використовуйте короткий prompt.
4. Вимкніть RAG, STT, TTS, vision і image generation.
5. Запустіть один blocking `generate()` call.
6. Запустіть один `generateStream()` call.
7. Повторіть десять разів і порівняйте перший run з наступними.

Якщо baseline повільний, перевіряйте model/device/runtime settings.  
Якщо baseline швидкий, а product flow повільний, перевіряйте prompt size, RAG, UI updates, concurrency або scheduler policy.

## Мінімальний performance logger

```dart
Future<void> measureStream(EdgeVeda edgeVeda, String prompt) async {
  final startedAt = DateTime.now();
  var firstTokenAt: DateTime? = null;
  var tokenCount = 0;
  final buffer = StringBuffer();

  await for (final chunk in edgeVeda.generateStream(prompt)) {
    firstTokenAt ??= DateTime.now();
    tokenCount += 1;
    buffer.write(chunk.token);
  }

  final completedAt = DateTime.now();
  final totalMs = completedAt.difference(startedAt).inMilliseconds;
  final ttftMs = firstTokenAt == null
      ? null
      : firstTokenAt!.difference(startedAt).inMilliseconds;
  final tokensPerSecond = totalMs == 0 ? 0 : tokenCount / (totalMs / 1000);

  print({
    'timeToFirstTokenMs': ttftMs,
    'totalMs': totalMs,
    'tokens': tokenCount,
    'tokensPerSecond': tokensPerSecond.toStringAsFixed(2),
    'outputChars': buffer.length,
  });
}
```

Використовуйте той самий prompt і model, коли порівнюєте devices або configuration changes.

## Типові симптоми

| Симптом | Ймовірна причина | Перша дія |
| --- | --- | --- |
| Перша відповідь повільна | Cold model load, великий prompt, RAG retrieval, високий `contextLength`. | Розділіть load time, retrieval time і generation time. |
| Streaming стартує швидко, але сповільнюється | Thermal throttling, memory pressure або long context. | Вимірюйте tokens/sec у часі й зменшуйте workload. |
| UI зависає під час stream | UI rebuilds занадто часті або heavy work працює на UI thread. | Буферизуйте chunks і рідше оновлюйте UI. |
| RAG answers повільні | Retrieval, embedding або занадто багато injected chunks. | Логуйте кожен RAG stage окремо. |
| STT має затримку | Audio chunks накопичуються в queue або Whisper model занадто важка. | Вимірюйте per-chunk latency і відкидайте stale chunks. |
| TTS стартує пізно | LLM чекає повної відповіді або TTS queue заблокована. | Стримте partial answer або запускайте TTS після sentence boundaries. |
| Image generation триває занадто довго | Model, resolution, sampler або step count занадто важкі. | Зменште resolution/steps або запускайте image generation окремо. |
| Performance падає через кілька хвилин | Thermal, battery або memory policy змінила runtime behavior. | Перевірте scheduler і runtime policy events. |
| Нова model повільніша за очікування | Model size, quantization, context length або chat template змінились. | Порівняйте з known-good baseline model. |

## Відокремлюйте cold start від steady state

Cold start містить setup work, яку не слід рахувати як нормальну generation speed.

Вимірюйте окремо:

```text
app launch
→ model path resolution
→ model load
→ first prompt assembly
→ first token
→ complete response
```

Рекомендована звітність:

| Measurement | Include model load? | Для чого |
| --- | --- | --- |
| Cold start time | Yes | First-use UX і onboarding. |
| Warm `timeToFirstToken` | No | Нормальний chat UX. |
| Warm tokens/sec | No | Runtime throughput comparison. |
| Long-session throughput | No | Sustainability і scheduler tuning. |

## Високий `timeToFirstToken`

Типові причини:

| Причина | Рішення |
| --- | --- |
| Model loads на перший user request. | Preload після явного user intent або покажіть **Preparing model** state. |
| Prompt занадто довгий. | Trim старі chat turns і summarize history. |
| `contextLength` занадто великий. | Використовуйте найменший context window, достатній для product flow. |
| RAG retrieval виконується до generation. | Покажіть **Searching documents** і вимірюйте retrieval окремо. |
| Structured output або grammar constraints активні. | Порівняйте з plain generation, щоб ізолювати constraint overhead. |
| Device вже hot або low battery. | Дайте runtime policy degrade gracefully і зменште parallel work. |

## Низький tokens per second

Перевіряйте в такому порядку:

1. Переконайтесь, що model і quantization підходять для device.
2. Переконайтесь, що `useGpu` увімкнено, коли очікується Metal GPU.
3. Порівняйте з коротким prompt і без RAG.
4. Зменште `contextLength`.
5. Зменште concurrent workloads.
6. Перевірте, чи thermal state змінюється під час test.
7. Порівняйте blocking `generate()` з `generateStream()`, щоб ізолювати UI overhead.
8. Протестуйте на higher-tier device, щоб перевірити, чи device є bottleneck.

## Проблеми UI performance

Модель може бути швидкою, а UI — повільним.

Типові UI anti-patterns:

- Rebuild усього chat page на кожен token.
- Markdown rendering для всієї conversation на кожен chunk.
- Persistent storage update на кожен token.
- Syntax highlighting на partial output.
- Великі images, PDFs, audio buffers або documents у widget state.
- Старт нового stream до cancellation попереднього.

Рекомендований pattern:

```dart
final buffer = StringBuffer();
var lastUiUpdate = DateTime.now();

await for (final chunk in edgeVeda.generateStream(prompt)) {
  buffer.write(chunk.token);

  final now = DateTime.now();
  if (now.difference(lastUiUpdate).inMilliseconds > 80) {
    setState(() => visibleText = buffer.toString());
    lastUiUpdate = now;
  }
}

setState(() => visibleText = buffer.toString());
```

## Scheduler і worker contention

Edge Veda може керувати workloads: text, vision, STT, image generation і RAG. Performance падає, коли забагато heavy workers конкурують одночасно.

| Workload mix | Ризик | Безпечніший pattern |
| --- | --- | --- |
| LLM + RAG indexing | Embedder і generator конкурують за memory/compute. | Спочатку index, потім generate. |
| LLM streaming + STT | Audio queue і token generation конкурують. | Пріоритезуйте active user speech або pause generation. |
| LLM streaming + TTS | TTS може чекати stable sentence boundaries. | Stream text, speak sentence-by-sentence. |
| Vision + chat | Frame queue може зростати без backpressure. | Відкидайте stale frames і тримайте latest useful frame. |
| Image generation + chat | Image worker може домінувати memory і GPU. | На lower-memory devices запускайте image generation окремо. |

## Проблеми RAG performance

RAG latency треба розділяти на stages.

```text
document parsing
→ chunking
→ embedding
→ vector index search
→ context injection
→ generation
→ streaming
```

Рішення:

- Pre-index documents до старту chat.
- Persist `VectorIndex` to disk.
- Тримайте active index компактним.
- Зменште `topK`.
- Скоротіть retrieved chunks.
- Не запускайте embedding нових documents під час active generation.
- Логуйте final prompt length після context injection.
- Rebuild index, якщо змінились embedding model або dimensions.

## Проблеми STT/TTS performance

### STT

STT performance залежить від audio chunking, model size і concurrent workload.

Рішення:

- Використовуйте короткі, але змістовні audio chunks.
- Не створюйте unbounded audio queues.
- Відкидайте stale chunks, коли transcription відстає.
- Звільняйте audio buffers після кожного transcription.
- Використовуйте менші Whisper models на lower-tier devices.
- Ставте RAG indexing або image generation на паузу, поки STT active.

### TTS

TTS може здаватись повільним, якщо чекає повної LLM answer.

Рішення:

- Запускайте TTS після complete sentence boundaries.
- Тримайте один active TTS request.
- Не викликайте `stop()` і `speak()` багато разів для tiny fragments.
- Використовуйте voice fallback, якщо selected voice unavailable.
- Синхронізуйте displayed text і spoken text.

## Проблеми image generation performance

Image generation дорогий і має вимірюватися окремо від chat.

Перевірте:

- Model size.
- Resolution.
- Step count.
- Sampler.
- Scheduler.
- CFG scale.
- Чи active інший worker.
- Чи idle auto-disposal unload/reload model між requests.

Рішення:

- Генеруйте одне image за раз.
- Зменште resolution або steps, якщо product quality дозволяє.
- Тримайте image worker warm лише коли user активно генерує images.
- Dispose або дозволяйте auto-disposal при виході з image workflow.
- Показуйте progress callbacks замість static spinner.

## Long-session performance degradation

Коротких benchmarks недостатньо для Edge Veda apps. Вимірюйте поведінку в часі.

Рекомендований long-session test:

| Phase | Duration | Що записувати |
| --- | --- | --- |
| Warm-up | 1–2 хвилини | Model load, first generation, initial memory. |
| Sustained chat | 10 хвилин | `timeToFirstToken`, tokens/sec, memory, thermal behavior. |
| Mixed workload | 10 хвилин | RAG, STT, TTS або vision contention. |
| Recovery | 2–5 хвилин | Чи повертається throughput після зменшення workload. |

Якщо performance відновлюється після idle time, проблема ймовірно в thermal або scheduler policy.  
Якщо performance не відновлюється, перевірте memory growth, retained buffers або duplicate runtime instances.

## Regression після code або model change

Створіть невеликий benchmark, який запускається в CI або на dedicated device перед release.

Відстежуйте:

- Версію Edge Veda.
- Версію Flutter.
- Device model і iOS version.
- Model name і quantization.
- `EdgeVedaConfig`.
- Prompt length.
- `timeToFirstToken`.
- Tokens/sec.
- Memory before/after.
- Runtime policy events.

Якщо regression зʼявилась, bisect у такому порядку:

1. Model file changed.
2. Quantization changed.
3. `contextLength` changed.
4. Prompt template changed.
5. RAG `topK` або chunk size changed.
6. UI rendering changed.
7. Worker concurrency changed.
8. Edge Veda package version changed.

## Production recommendations

- Define performance budgets per feature.
- Використовуйте p95, а не тільки average latency.
- Записуйте metrics окремо для cold і warm paths.
- Показуйте progress states для long-running work.
- Додайте cancellation для streaming і image generation.
- Тримайте runtime diagnostics доступними в debug builds.
- Не стартуйте всі workers під час app launch.
- Використовуйте `ModelAdvisor` для вибору model/config під device tier.
- Віддавайте перевагу graceful degradation замість hard failure.
- Тримайте known-good benchmark model для comparison.

## Діагностика

Додайте:

- Версію Edge Veda.
- Версії Flutter і Xcode.
- Device model і iOS version.
- Model name, format, quantization і file size.
- `EdgeVedaConfig`, особливо `contextLength`, `useGpu` і memory-related settings.
- Feature path: text, streaming, RAG, STT, TTS, vision, image generation.
- Prompt length і final prompt length після RAG injection.
- `timeToFirstToken`, tokens/sec, total time.
- Memory stats до load, після load, під час generation і після completion.
- Runtime policy і scheduler events, якщо доступні.
- Чи проблема повторюється з small known-good model.
- Minimal reproduction з одним prompt або одним workload path.

## Повʼязані документи

- [Thermal throttling](./thermal-throttling.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Проблеми streaming](./streaming-issues.md)
- [Проблеми STT/TTS](./stt-tts-issues.md)
- [Проблеми RAG](./rag-issues.md)
- [Performance tuning](../guides/performance-tuning.md)
- [Scheduler and budgets](../guides/scheduler-and-budgets.md)
- [Telemetry and tracing](../guides/telemetry-and-tracing.md)
- [Storage and memory](../reference/storage-and-memory.md)
