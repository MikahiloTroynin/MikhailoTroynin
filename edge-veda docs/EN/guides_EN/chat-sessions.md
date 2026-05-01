---
title: "Chat sessions"
description: "Build multi-turn on-device conversations with ChatSession."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Chat sessions

Use `ChatSession` when the model should remember previous messages in a conversation. A session keeps conversational state, applies a chat template, tracks context usage, and can reset the conversation without unloading the model.

Use a session for assistant UIs, coding helpers, support bots, local tutoring apps, and any feature where the next prompt depends on earlier turns.

## What you will build

This guide shows how to:

- create a `ChatSession`;
- send a streamed user message;
- inspect `turnCount` and `contextUsage`;
- reset a conversation;
- choose a `ChatTemplateFormat`;
- avoid context overflow problems.

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
  'Write hello world in Python.',
)) {
  stdout.write(chunk.token);
}

await for (final chunk in session.sendStream(
  'Now convert it to Rust.',
)) {
  stdout.write(chunk.token);
}

print('Turns: ${session.turnCount}');
print('Context: ${(session.contextUsage * 100).toInt()}%');

session.reset();
```

The second message can refer to the first because both messages belong to the same session.

## Session lifecycle

A typical lifecycle looks like this:

1. Initialize `EdgeVeda`.
2. Create a `ChatSession`.
3. Send one or more user messages.
4. Monitor context usage.
5. Reset the session when the conversation should start fresh.
6. Dispose the underlying runtime when the feature is no longer needed.

`session.reset()` clears the conversation state. It does not unload the model.

## Choosing a system prompt

A system prompt gives the session a role and behavior. Presets are useful for common cases, but product-specific prompts should be explicit.

```dart
final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);
```

Use a narrow prompt:

```text
You are an on-device support assistant. Answer with concise steps. If information is missing, ask one clarifying question.
```

Avoid a vague prompt:

```text
You are helpful and smart.
```

The narrow prompt gives the model a stable format and reduces unpredictable output.

## Choosing the chat template

The chat template must match the model family. A wrong template can produce low-quality output or malformed conversations.

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

Recommended mapping:

| Model family | `ChatTemplateFormat` | Best use |
| --- | --- | --- |
| Llama 3.x Instruct | `llama3Instruct` | General chat and reasoning. |
| Qwen3 | `qwen3` | Tool calling and compact reasoning. |
| Phi 3.5 | `chatML` | Higher-quality reasoning. |
| Gemma, TinyLlama, unknown models | `generic` | Basic chat when no exact template is available. |

## Context management

A chat session accumulates messages. As the conversation grows, the context window fills up.

Use `contextUsage` to observe pressure:

```dart
if (session.contextUsage > 0.8) {
  // Ask the app to summarize, reset, or start a new session.
  print('Context is almost full');
}
```

Recommended options when context is high:

- summarize older turns;
- ask the user to start a new topic;
- reset the session after saving the current answer;
- use a larger context only if the target device can handle it;
- reduce repeated system instructions.

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
      // Product decision: summarize, reset, or warn the user.
    }

    return buffer.toString().trim();
  }

  void startNewConversation() {
    session.reset();
  }
}
```

## When to create a new session

Create a new `ChatSession` when:

- the user starts a different conversation;
- the app changes system behavior;
- the app changes template format;
- the app switches to a different model;
- previous context may leak into a new task.

Use `session.reset()` when the same model and behavior remain valid but the conversation history should be cleared.

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| The model ignores previous messages | You are using `generate()` instead of `ChatSession`. | Use `session.sendStream()` for multi-turn flows. |
| Output has strange role markers | Wrong `ChatTemplateFormat`. | Match the template to the model family. |
| The answer gets slower over time | Context is growing. | Monitor `contextUsage` and summarize or reset. |
| The model repeats itself | Long context or vague system prompt. | Reset session and narrow the system prompt. |
| Tool calls do not work | Plain chat session does not execute tools automatically. | Use `sendWithTools()` from the function calling guide. |

## Privacy notes

Conversation history stays in the local runtime context. Still, the app should treat it as sensitive data:

- do not store full chat logs unless the user expects it;
- clear sessions when users leave private workflows;
- avoid mixing different users or profiles in one session;
- do not pass confidential chat history to analytics.

## Next steps

- Use [`function-calling.md`](./function-calling.md) to connect a session to tools.
- Use [`structured-output.md`](./structured-output.md) to return schema-constrained JSON.
- Use [`embeddings.md`](./embeddings.md) to add retrieval context before chat generation.
