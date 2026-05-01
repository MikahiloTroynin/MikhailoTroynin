---
title: "Chat sessions"
description: "Створюйте multi-turn on-device conversations через ChatSession."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Chat sessions

Використовуйте `ChatSession`, коли model має памʼятати previous messages у conversation. Session зберігає conversational state, застосовує chat template, відстежує context usage і може reset-ити conversation без unload model.

Session підходить для assistant UI, coding helpers, support bots, local tutoring apps і будь-якої feature, де наступний prompt залежить від earlier turns.

## Що ви створите

У цьому guide показано, як:

- створити `ChatSession`;
- надіслати streamed user message;
- перевірити `turnCount` і `contextUsage`;
- reset-ити conversation;
- вибрати `ChatTemplateFormat`;
- уникнути context overflow problems.

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

final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);

await for (final chunk in session.sendStream(
  'Напиши hello world на Python.',
)) {
  stdout.write(chunk.token);
}

await for (final chunk in session.sendStream(
  'Тепер конвертуй це у Rust.',
)) {
  stdout.write(chunk.token);
}

print('Turns: ${session.turnCount}');
print('Context: ${(session.contextUsage * 100).toInt()}%');

session.reset();
```

Друге message може посилатися на перше, бо обидва messages належать до однієї session.

## Session lifecycle

Типовий lifecycle:

1. Ініціалізуйте `EdgeVeda`.
2. Створіть `ChatSession`.
3. Надішліть один або кілька user messages.
4. Відстежуйте context usage.
5. Reset-іть session, коли conversation має початися заново.
6. Dispose-іть underlying runtime, коли feature більше не потрібна.

`session.reset()` очищує conversation state. Він не unload-ить model.

## System prompt

`System prompt` задає session role і behavior. Presets зручні для common cases, але product-specific prompts мають бути явними.

```dart
final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);
```

Вузький `prompt`:

```text
You are an on-device support assistant. Answer with concise steps. If information is missing, ask one clarifying question.
```

Розмитий `prompt`:

```text
You are helpful and smart.
```

Вузький `prompt` дає model стабільний format і знижує unpredictable output.

## Chat template

`Chat template` має відповідати model family. Неправильний template може створити low-quality output або malformed conversations.

```dart
final llamaSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.llama3Instruct,
);

final qwenSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.qwen3,
);

final phiSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.chatML,
);

final genericSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.generic,
);
```

Рекомендоване mapping:

| Model family | `ChatTemplateFormat` | Best use |
| --- | --- | --- |
| Llama 3.x Instruct | `llama3Instruct` | General chat і reasoning. |
| Qwen3 | `qwen3` | Tool calling і compact reasoning. |
| Phi 3.5 | `chatML` | Higher-quality reasoning. |
| Gemma, TinyLlama, unknown models | `generic` | Basic chat, якщо exact template недоступний. |

## Context management

`ChatSession` накопичує messages. Коли conversation росте, context window заповнюється.

Використовуйте `contextUsage` для контролю pressure:

```dart
if (session.contextUsage > 0.8) {
  // App може зробити summary, reset або створити new session.
  print('Context is almost full');
}
```

Рекомендовані options, коли context високий:

- зробити summary старих turns;
- попросити user почати new topic;
- reset-ити session після збереження current answer;
- використовувати larger context лише тоді, коли target device це витримує;
- зменшити repeated system instructions.

## Production-style session wrapper

```dart
class LocalChatService {
  LocalChatService(EdgeVeda edgeVeda)
      : session = ChatSession(
          edgeVeda: edgeVeda,
          templateFormat: ChatTemplateFormat.llama3Instruct,
        );

  final ChatSession session;

  Future<String> send(
    String userMessage,
    void Function(String partial) onPartial,
  ) async {
    final buffer = StringBuffer();

    await for (final chunk in session.sendStream(userMessage)) {
      buffer.write(chunk.token);
      onPartial(buffer.toString());
    }

    if (session.contextUsage > 0.85) {
      // Product decision: summarize, reset або warn user.
    }

    return buffer.toString().trim();
  }

  void startNewConversation() {
    session.reset();
  }
}
```

## Коли створювати new session

Створюйте new `ChatSession`, коли:

- user починає іншу conversation;
- app змінює system behavior;
- app змінює template format;
- app перемикається на інший model;
- previous context може leak-нути у new task.

Використовуйте `session.reset()`, коли той самий model і behavior залишаються valid, але conversation history треба очистити.

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Model ігнорує previous messages | Використовується `generate()`, а не `ChatSession`. | Використовуйте `session.sendStream()` для multi-turn flows. |
| Output має дивні role markers | Неправильний `ChatTemplateFormat`. | Match-іть template до model family. |
| Answer стає повільнішим | Context росте. | Відстежуйте `contextUsage` і робіть summary або reset. |
| Model повторюється | Long context або vague system prompt. | Reset-іть session і звузьте system prompt. |
| Tool calls не працюють | Plain chat session не виконує tools автоматично. | Використовуйте `sendWithTools()` із function calling guide. |

## Privacy notes

Conversation history залишається в local runtime context. App все одно має обробляти її як sensitive data:

- не зберігайте повні chat logs без очікування user;
- очищуйте sessions, коли user залишає private workflows;
- не змішуйте different users або profiles в одній session;
- не передавайте confidential chat history в analytics.

## Next steps

- Використовуйте [`function-calling.md`](./function-calling.md), щоб підключити session до tools.
- Використовуйте [`structured-output.md`](./structured-output.md), щоб повертати schema-constrained JSON.
- Використовуйте [`embeddings.md`](./embeddings.md), щоб додати retrieval context перед chat generation.
