---
title: "Streaming chat"
description: "Build a responsive multi-turn chat with Edge Veda streaming APIs."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Streaming chat

This example shows how to build a responsive chat experience where tokens appear as the model generates them.

Use this example when you want to:

- display long answers progressively;
- keep the UI responsive while the model is working;
- preserve multi-turn context;
- monitor conversation length with `turnCount` and `contextUsage`.

For one-shot generation without partial tokens, use [Basic text generation](basic-text-generation.md).

## What you build

You will build a chat flow that:

1. initializes `EdgeVeda`;
2. creates a `ChatSession`;
3. sends user messages with `sendStream()`;
4. appends each streamed `chunk.token` to the current assistant message;
5. tracks conversation state;
6. lets the user reset the chat while keeping the model loaded.

## Single streaming prompt

For the simplest streaming case, call `generateStream()` directly on `EdgeVeda`.

```dart
import 'dart:io';
import 'package:edge_veda/edge_veda.dart';

Future<void> streamSinglePrompt(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    await for (final chunk in edgeVeda.generateStream(
      'Explain recursion briefly.',
    )) {
      stdout.write(chunk.token);
    }
  } finally {
    await edgeVeda.dispose();
  }
}
```

Use this pattern for a one-off streaming response. Use `ChatSession` when you need memory across turns.

## Multi-turn chat session

`ChatSession` keeps conversation context and can stream responses.

```dart
import 'dart:io';
import 'package:edge_veda/edge_veda.dart';

Future<void> runStreamingChat(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 4096,
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

    stdout.writeln();

    await for (final chunk in session.sendStream(
      'Now convert it to Rust.',
    )) {
      stdout.write(chunk.token);
    }

    stdout.writeln();
    stdout.writeln('Turns: ${session.turnCount}');
    stdout.writeln('Context: ${(session.contextUsage * 100).toInt()}%');

    session.reset();
  } finally {
    await edgeVeda.dispose();
  }
}
```

## Flutter UI model

A minimal chat UI can use a simple message model.

```dart
class ChatMessage {
  ChatMessage({
    required this.role,
    required this.text,
  });

  final String role;
  final String text;

  ChatMessage copyWith({String? text}) {
    return ChatMessage(
      role: role,
      text: text ?? this.text,
    );
  }
}
```

## Flutter streaming example

```dart
import 'package:flutter/material.dart';
import 'package:edge_veda/edge_veda.dart';

class StreamingChatPage extends StatefulWidget {
  const StreamingChatPage({
    super.key,
    required this.modelPath,
  });

  final String modelPath;

  @override
  State<StreamingChatPage> createState() => _StreamingChatPageState();
}

class _StreamingChatPageState extends State<StreamingChatPage> {
  final EdgeVeda _edgeVeda = EdgeVeda();
  final TextEditingController _controller = TextEditingController();

  ChatSession? _session;
  final List<ChatMessage> _messages = [];

  bool _isReady = false;
  bool _isStreaming = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initRuntime();
  }

  Future<void> _initRuntime() async {
    try {
      await _edgeVeda.init(EdgeVedaConfig(
        modelPath: widget.modelPath,
        contextLength: 4096,
        useGpu: true,
      ));

      _session = ChatSession(
        edgeVeda: _edgeVeda,
        preset: SystemPromptPreset.coder,
      );

      if (!mounted) return;
      setState(() {
        _isReady = true;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not initialize chat: $error';
      });
    }
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    final session = _session;

    if (!_isReady || _isStreaming || text.isEmpty || session == null) {
      return;
    }

    _controller.clear();

    setState(() {
      _isStreaming = true;
      _error = null;
      _messages.add(ChatMessage(role: 'user', text: text));
      _messages.add(ChatMessage(role: 'assistant', text: ''));
    });

    final assistantIndex = _messages.length - 1;
    final buffer = StringBuffer();

    try {
      await for (final chunk in session.sendStream(text)) {
        buffer.write(chunk.token);

        if (!mounted) return;
        setState(() {
          _messages[assistantIndex] = _messages[assistantIndex].copyWith(
            text: buffer.toString(),
          );
        });
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Streaming failed: $error';
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isStreaming = false;
      });
    }
  }

  void _resetChat() {
    _session?.reset();

    setState(() {
      _messages.clear();
      _error = null;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _edgeVeda.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = _session;
    final contextText = session == null
        ? ''
        : 'Turns: ${session.turnCount} · Context: ${(session.contextUsage * 100).toInt()}%';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Streaming chat'),
        actions: [
          TextButton(
            onPressed: _isStreaming ? null : _resetChat,
            child: const Text('Reset'),
          ),
        ],
      ),
      body: Column(
        children: [
          if (contextText.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(contextText),
            ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];

                return Align(
                  alignment: message.role == 'user'
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: SelectableText(message.text),
                    ),
                  ),
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      enabled: _isReady && !_isStreaming,
                      decoration: const InputDecoration(
                        hintText: 'Ask something...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _isReady && !_isStreaming ? _send : null,
                    child: Text(_isStreaming ? '...' : 'Send'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

## Streaming behavior

In a streaming UI:

- create the assistant message before the stream starts;
- append each token to the same message;
- avoid rebuilding expensive widgets on every token;
- disable duplicate sends while a stream is active;
- expose a cancellation path if your product needs it;
- reset the session when the user wants a fresh conversation.

## Context management

`ChatSession` tracks the active conversation. Use:

- `turnCount` to show how many user/assistant turns are active;
- `contextUsage` to detect when the model context is filling up;
- `reset()` to clear the chat while keeping the model loaded.

A production UI should warn or summarize when context usage is high.

## Error handling

| Failure | Likely cause | Recommended handling |
| --- | --- | --- |
| Stream stops early | Model hit stop condition or runtime pressure | Keep partial text and show a retry action. |
| Repeated tokens | Prompt or chat template mismatch | Try a model-specific preset or adjust the system prompt. |
| Slow first token | Model load or cold worker | Initialize before the user sends the first message. |
| UI jank | Too many state updates | Buffer tokens and update the UI in batches if needed. |
| Context overflow | Conversation too long | Summarize, reset, or start a new session. |

## Production notes

For production chat:

- store only the messages your product needs;
- avoid logging sensitive user prompts;
- make model limitations visible in the UI;
- add a stop button for long responses;
- consider separate presets for coding, support, and general chat;
- test long sessions on a real device, not only on a simulator.

## Next steps

After this example works:

1. add markdown rendering for assistant output;
2. add a stop button;
3. add chat persistence if your product needs it;
4. add system-prompt presets per feature;
5. try [Smart home control](smart-home-control.md) for tool calling.
