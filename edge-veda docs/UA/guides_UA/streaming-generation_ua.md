---
title: "Streaming generation"
description: "Стримте generated tokens з on-device model через Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Streaming generation

`Streaming generation` дає UI model output у момент generation. Використовуйте `generateStream()`, коли user має одразу бачити progress: chat responses, довгі пояснення, live coding assistant, local copilot або будь-який flow, де очікування повної відповіді виглядає повільним.

Для one-shot generation використовуйте [`text-generation.md`](./text-generation.md). Для multi-turn sessions використовуйте [`chat-sessions.md`](./chat-sessions.md).

## Що ви створите

У цьому guide показано, як:

- ініціалізувати `EdgeVeda`;
- стримити token chunks через `generateStream()`;
- buffer-ити tokens для чистого UI;
- припинити читання, коли user натискає cancel;
- уникнути типових performance issues.

## Basic example

```dart
import 'dart:io';
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Поясни recursion коротко.',
)) {
  stdout.write(chunk.token);
}
```

`chunk.token` містить наступний emitted token або text fragment. Додавайте його у visible response, buffer або message model в application state.

## Flutter UI pattern

Не викликайте `setState()` на кожен token у важкому widget tree. Buffer-іть tokens і оновлюйте UI малими batches.

```dart
class StreamingAnswerController {
  StreamingAnswerController(this.edgeVeda);

  final EdgeVeda edgeVeda;
  final StringBuffer _buffer = StringBuffer();

  String get text => _buffer.toString();

  Future<void> run(
    String prompt,
    void Function(String text) onUpdate,
  ) async {
    var tokenCount = 0;

    await for (final chunk in edgeVeda.generateStream(prompt)) {
      _buffer.write(chunk.token);
      tokenCount++;

      if (tokenCount % 4 == 0) {
        onUpdate(_buffer.toString());
      }
    }

    onUpdate(_buffer.toString());
  }

  void reset() {
    _buffer.clear();
  }
}
```

Цей pattern зменшує UI churn, але response все одно відчувається live.

## Cancellation pattern

Використовуйте local cancellation flag або stream subscription залежно від app architecture.

```dart
var cancelled = false;
final buffer = StringBuffer();

Future<void> generateAnswer() async {
  await for (final chunk in edgeVeda.generateStream(prompt)) {
    if (cancelled) {
      break;
    }

    buffer.write(chunk.token);
  }
}

void cancelGeneration() {
  cancelled = true;
}
```

`break` зупиняє читання наступних chunks. Залишайте partially generated text лише тоді, коли UX підтримує partial answers.

## Коли використовувати streaming

Використовуйте `generateStream()`, коли:

- answer може тривати більше короткого моменту;
- UI має показувати typing effect;
- user може cancel-ити response;
- task є conversational;
- потрібно показувати partial progress.

Використовуйте `generate()`, коли:

- response короткий;
- app потрібне одне final value;
- partial output може заплутати user;
- виконується background summary або classification.

## Chunk handling

Chunk не завжди є complete word або sentence. Обробляйте streamed output як incremental text, а не як semantic unit.

Рекомендований handling:

- додавайте chunks у правильному order;
- рендеріть partial text як provisional;
- запускайте final formatting після завершення stream;
- не парсьте JSON з partial chunks;
- не зберігайте кожен chunk окремим database record.

Для structured JSON не стримте output у JSON parser, якщо ви не контролюєте incremental parsing. Використовуйте `sendStructured()`, коли output має відповідати schema.

## Production-style example

```dart
class ChatComposer {
  ChatComposer(this.edgeVeda);

  final EdgeVeda edgeVeda;

  Future<String> composeAnswer({
    required String userQuestion,
    required void Function(String partialText) onPartialText,
  }) async {
    final buffer = StringBuffer();

    final prompt = '''
Дай зрозумілу відповідь на user question.
Обмеж response до 120 words.

Question:
$userQuestion
''';

    try {
      await for (final chunk in edgeVeda.generateStream(prompt)) {
        buffer.write(chunk.token);
        onPartialText(buffer.toString());
      }

      return buffer.toString().trim();
    } catch (error) {
      final partial = buffer.toString().trim();

      if (partial.isNotEmpty) {
        return partial;
      }

      throw StateError('Streaming generation failed: $error');
    }
  }
}
```

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Token update frequency | UI update на кожен token може спричинити jank. | Batch-іть UI updates через кілька tokens або timer. |
| Long output | Довгі responses збільшують runtime, battery use і thermal load. | У prompt задавайте bounded length. |
| Context length | Larger context підвищує memory pressure. | Тримайте context настільки малим, наскільки дозволяє use case. |
| Device pressure | Thermal або memory pressure може сповільнити generation. | Використовуйте runtime supervision і знижуйте workload priority, якщо потрібно. |
| Concurrent streams | Кілька streams конкурують за той самий model worker. | Серіалізуйте user-facing generation, якщо product не підтримує parallel work. |

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Stream стартує повільно | Model initialization або prompt evaluation ще триває. | Ініціалізуйте runtime до старту user task. |
| UI зависає | Забагато UI updates на token. | Buffer-іть chunks і throttle-іть rendering. |
| Response зупиняється рано | Cancellation, memory pressure або generation limit. | Залишайте partial output лише коли UX це дозволяє. |
| Output повторюється | Prompt не має stop conditions або context занадто довгий. | Додайте constraints і reset-іть context за потреби. |

## Privacy notes

Streaming не потребує cloud transport. Проте partial text — це також user data:

- не log-уйте кожен token у production;
- не передавайте partial content в analytics;
- очищуйте buffers, коли user cancel-ить sensitive generation;
- обробляйте prompts і chunks як один privacy category із complete responses.

## Next steps

- Використовуйте [`chat-sessions.md`](./chat-sessions.md), коли model має памʼятати previous turns.
- Використовуйте [`function-calling.md`](./function-calling.md), коли model потребує tool results.
- Використовуйте [`structured-output.md`](./structured-output.md), коли response має бути valid JSON.
