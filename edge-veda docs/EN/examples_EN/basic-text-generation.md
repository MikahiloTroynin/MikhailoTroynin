---
title: "Basic text generation"
description: "Generate a complete text response with Edge Veda in a Flutter app."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Basic text generation

This example shows the shortest useful path from a local model to a generated text response.

Use this example when you want to:

- confirm that Edge Veda can load a model on the device;
- run a single prompt and wait for one complete answer;
- build a simple `Generate` button before adding streaming or chat history.

For streaming output, use [Streaming chat](streaming-chat.md).

## What you build

You will build a small flow that:

1. initializes `EdgeVeda`;
2. loads a local text model from `modelPath`;
3. sends one prompt with `generate()`;
4. displays `response.text`;
5. disposes the runtime when the app no longer needs it.

## Prerequisites

Before you start:

- add `edge_veda` to `pubspec.yaml`;
- configure the target platform;
- copy a compatible text model to device storage;
- resolve the local `modelPath`;
- test on a physical device for realistic performance.

## Minimal example

```dart
import 'package:edge_veda/edge_veda.dart';

Future<void> runBasicTextGeneration(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    final response = await edgeVeda.generate(
      'Explain on-device AI in one short paragraph.',
    );

    print(response.text);
  } finally {
    await edgeVeda.dispose();
  }
}
```

## Flutter UI example

The next example wraps the same flow in a simple `StatefulWidget`.

```dart
import 'package:flutter/material.dart';
import 'package:edge_veda/edge_veda.dart';

class BasicTextGenerationPage extends StatefulWidget {
  const BasicTextGenerationPage({
    super.key,
    required this.modelPath,
  });

  final String modelPath;

  @override
  State<BasicTextGenerationPage> createState() =>
      _BasicTextGenerationPageState();
}

class _BasicTextGenerationPageState extends State<BasicTextGenerationPage> {
  final EdgeVeda _edgeVeda = EdgeVeda();
  final TextEditingController _promptController = TextEditingController(
    text: 'Write a friendly welcome message for a Flutter app.',
  );

  bool _isReady = false;
  bool _isGenerating = false;
  String? _result;
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
        contextLength: 2048,
        useGpu: true,
      ));

      if (!mounted) return;
      setState(() {
        _isReady = true;
        _error = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not initialize Edge Veda: $error';
      });
    }
  }

  Future<void> _generate() async {
    final prompt = _promptController.text.trim();

    if (!_isReady || prompt.isEmpty || _isGenerating) {
      return;
    }

    setState(() {
      _isGenerating = true;
      _result = null;
      _error = null;
    });

    try {
      final response = await _edgeVeda.generate(prompt);

      if (!mounted) return;
      setState(() {
        _result = response.text;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Generation failed: $error';
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isGenerating = false;
      });
    }
  }

  @override
  void dispose() {
    _promptController.dispose();
    _edgeVeda.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canGenerate = _isReady && !_isGenerating;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Basic text generation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _promptController,
              minLines: 2,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'Prompt',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: canGenerate ? _generate : null,
              child: Text(_isGenerating ? 'Generating...' : 'Generate'),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            if (_result != null)
              Expanded(
                child: SingleChildScrollView(
                  child: SelectableText(_result!),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

## Expected behavior

When the model loads successfully, the button becomes active. After the user taps **Generate**, the app waits for the model to finish and then renders the complete response.

This example does not stream partial tokens. The UI receives only the final response.

## When to use blocking generation

Use `generate()` when:

- the response is short;
- the user does not need to see partial output;
- you want simple request/response behavior;
- the result will be post-processed before display;
- the UI can show a loading state until completion.

Avoid blocking generation for long chat answers, code output, or any response where perceived latency matters. Use `generateStream()` or `ChatSession.sendStream()` instead.

## Prompt design

Keep the first prompt explicit and bounded:

```text
Explain on-device AI in one short paragraph.
```

Avoid vague prompts in smoke tests:

```text
Tell me everything about AI.
```

A bounded prompt makes it easier to verify that the model returns relevant text, the UI handles the output length, and latency is acceptable.

## Error handling

| Failure | Likely cause | Recommended handling |
| --- | --- | --- |
| Model does not load | `modelPath` is wrong or the file is not accessible | Show setup error and log the path resolution step. |
| Generation is slow | Model is too large for the device | Use a smaller model or lower context size. |
| App becomes unresponsive | Work is tied too closely to UI state | Keep runtime calls async and show progress. |
| Empty output | Prompt is too vague or model stopped early | Retry with a clearer prompt and inspect model compatibility. |
| Out-of-memory pressure | Model/context is too large | Reduce model size, context length, or concurrent workloads. |

## Production notes

For production apps:

- initialize the runtime once per feature area instead of per button click;
- keep `EdgeVeda` behind a service or repository class;
- dispose the runtime when the feature is closed or when the scheduler evicts the worker;
- never log sensitive prompts or generated output by default;
- show user-facing recovery messages for model load and generation errors;
- document the expected model family and file format for your app.

## Next steps

After this example works:

1. replace the prompt with a real product prompt;
2. add a better loading state;
3. add cancellation for long operations;
4. move runtime setup into a shared service;
5. switch to [Streaming chat](streaming-chat.md) when you need token-by-token output.
