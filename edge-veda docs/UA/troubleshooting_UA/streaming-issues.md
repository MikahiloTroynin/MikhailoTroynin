---
title: "Проблеми streaming"
description: "Як усувати відсутні chunks, затримку першого token, дублювання output, cancellation, UI freezes і backpressure в Edge Veda streaming generation."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми streaming

Використовуйте цю сторінку, коли `generateStream()` не віддає chunks, віддає їх занадто повільно, дублює tokens, зависає UI, продовжує працювати після cancel або втрачає final response.

Edge Veda підтримує streaming token generation. Streaming корисний для chat interfaces, бо користувач бачить часткову відповідь до завершення повної генерації. Але streaming потребує уважної роботи з async loops, cancellation, UI updates і backpressure.

## Типові симптоми

| Симптом | Ймовірна причина | Перша дія |
| --- | --- | --- |
| Chunks не приходять | Модель не ініціалізована, prompt порожній або stream не споживається. | Перевірте `EdgeVeda.init()` і `await for`. |
| Перший token приходить пізно | Великий prompt, cold model або великий `contextLength`. | Залогувати `timeToFirstToken` і протестувати короткий prompt. |
| Stream обривається посередині | Cancellation, memory pressure, thermal policy або проблемний prompt. | Зберіть logs і порівняйте з blocking `generate()`. |
| Tokens дублюються | UI додає ту саму partial response більше одного разу. | Перевірте state update logic. |
| UI зависає під час stream | Дорогі rebuilds або synchronous work на UI thread. | Буферизуйте chunks і оновлюйте UI рідше. |
| Stream триває після виходу з екрана | `StreamSubscription` не скасовано. | Скасовуйте `StreamSubscription` у `dispose()`. |
| Final message відсутній | Застосунок збирає chunks, але не зберігає final buffer. | Persist final buffer після завершення stream. |

## Мінімальний приклад streaming

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final buffer = StringBuffer();

await for (final chunk in edgeVeda.generateStream(
  'Explain retrieval-augmented generation in one paragraph.',
)) {
  buffer.write(chunk.token);
  stdout.write(chunk.token);
}

final finalText = buffer.toString();
```

## Рекомендований UI pattern

Не перемальовуйте всю сторінку для кожного token. Буферизуйте дрібні chunks і оновлюйте UI з коротким інтервалом.

```dart
final buffer = StringBuffer();
var lastUiUpdate = DateTime.now();

await for (final chunk in edgeVeda.generateStream(prompt)) {
  buffer.write(chunk.token);

  final now = DateTime.now();
  if (now.difference(lastUiUpdate).inMilliseconds > 80) {
    setState(() {
      visibleAssistantText = buffer.toString();
    });
    lastUiUpdate = now;
  }
}

setState(() {
  visibleAssistantText = buffer.toString();
});
```

## Cancellation

Якщо користувач залишає екран, натискає **Stop** або починає нову conversation, скасовуйте поточний stream.

```dart
StreamSubscription? _subscription;

void startStreaming(String prompt) {
  final buffer = StringBuffer();

  _subscription = edgeVeda.generateStream(prompt).listen(
    (chunk) {
      buffer.write(chunk.token);
      setState(() => visibleAssistantText = buffer.toString());
    },
    onError: (error, stackTrace) {
      setState(() => errorMessage = error.toString());
    },
    onDone: () {
      setState(() => finalAssistantText = buffer.toString());
    },
  );
}

@override
void dispose() {
  _subscription?.cancel();
  super.dispose();
}
```

## Затримка першого token

Затримка першого token зазвичай має одну з причин:

| Причина | Рішення |
| --- | --- |
| Cold model load | Ініціалізуйте модель до першого prompt, якщо це дозволяє UX. |
| Дуже довгий prompt | Обріжте context і узагальніть старі chat turns. |
| Великий `contextLength` | Зменште `contextLength` для chat flows без довгого context. |
| Thermal або memory pressure | Перевірте runtime policy і зменште concurrent workloads. |
| RAG додає занадто багато chunks | Зменште `topK` і скоротіть retrieved context. |

Вимірюйте цей показник окремо від загального часу generation:

```dart
final start = DateTime.now();
var firstTokenSeen = false;

await for (final chunk in edgeVeda.generateStream(prompt)) {
  if (!firstTokenSeen) {
    firstTokenSeen = true;
    print('timeToFirstTokenMs=${DateTime.now().difference(start).inMilliseconds}');
  }
}
```

## Duplicate або corrupted output

Більшість duplicate-output bugs виникає в UI state, а не в моделі.

Перевірте:

- Stream стартує лише один раз на одну user action.
- Попередній stream скасовано перед стартом нового.
- UI додає тільки `chunk.token`, а не повний accumulated text.
- Buffer очищено перед новою відповіддю.
- Final response не додається повторно в `onDone`.
- Chat persistence зберігає або accumulated final message, або chunks, але не обидва варіанти.

## Stream обривається посередині

Можливі причини:

- Користувач скасував stream.
- App lifecycle поставив екран на паузу.
- Runtime policy знизила або зупинила workload.
- Модель вийшла за context.
- Пристрій потрапив у memory або thermal pressure.
- Prompt або grammar призвели до invalid stop condition.

Recovery pattern:

1. Збережіть partial buffer.
2. Покажіть користувачу resumable state.
3. Дайте retry з коротшим context.
4. Логуйте stop reason, якщо він доступний.
5. Використовуйте blocking `generate()` тільки для діагностики, не як постійне рішення.

## Streaming з RAG

RAG може затримувати streaming, бо retrieval виконується до generation.

Розділіть фази в UI:

1. **Searching documents**
2. **Preparing context**
3. **Generating answer**
4. **Streaming answer**

Поради:

- Логуйте retrieval time окремо від generation time.
- Логуйте кількість injected chunks.
- Зменшуйте `topK`, якщо first token постійно повільний.
- Тримайте retrieved text коротким і релевантним.
- Не починайте stream, доки prompt повністю не зібрано.

## Streaming з tool calling або structured output

Tool calling і strict structured output можуть поводитись інакше, ніж plain token streaming.

| Mode | Очікувана поведінка |
| --- | --- |
| Plain `generateStream()` | Tokens можна показувати одразу. |
| Tool calling | Intermediate model output може бути внутрішнім і не завжди має показуватись. |
| Structured JSON | Partial JSON може бути invalid до завершення. |
| Grammar-constrained output | Tokens можуть зʼявлятись повільніше через decoder constraints. |

Для JSON або tool flows краще показувати progress events замість raw partial output.

## Діагностика

Додайте:

- Версію Edge Veda.
- `EdgeVedaConfig`, особливо `contextLength` і `useGpu`.
- Prompt length і приблизний context size.
- Чи ввімкнено RAG, tool calling або structured output.
- `timeToFirstToken`.
- Total generation time.
- Tokens per second.
- Чи було cancellation.
- Чи той самий prompt працює з `generate()`.
- Minimal reproduction з одним prompt і одним stream consumer.

## Повʼязані документи

- [Thermal throttling](./thermal-throttling.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Проблеми RAG](./rag-issues.md)
- [Streaming generation](../guides/streaming-generation.md)
- [Chat sessions](../guides/chat-sessions.md)
- [Structured output](../guides/structured-output.md)
