---
title: "Offline voice assistant"
description: "Build an on-device voice assistant with WhisperSession, ChatSession, and TtsService."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Offline voice assistant

This example shows how to build a fully local voice assistant. The app records speech, transcribes it with `WhisperSession`, sends the transcript to `ChatSession`, and reads the answer aloud with `TtsService`.

Use this example when you want to:

- accept voice commands without a cloud STT service;
- answer with an on-device language model;
- speak responses through on-device TTS;
- keep private conversations on the device;
- build a foundation for voice-controlled tools.

## What you build

```text
Microphone
  ↓
WhisperSession
  ↓
Transcript
  ↓
ChatSession / EdgeVeda.generateStream()
  ↓
Assistant answer
  ↓
TtsService.speak()
```

The example uses three independent runtime surfaces:

| Stage | API |
| --- | --- |
| Speech-to-text | `WhisperSession` |
| Reasoning / response | `ChatSession` |
| Text-to-speech | `TtsService` |

## Prerequisites

Before starting:

- request microphone permission;
- add a compatible Whisper model;
- add a compatible chat model;
- test on a physical iPhone for real STT and Metal performance;
- decide whether the assistant should answer freely or use tools.

## Initialize speech-to-text

```dart
import 'package:edge_veda/edge_veda.dart';

final whisper = WhisperSession(modelPath: whisperModelPath);

await whisper.start();

whisper.onSegment.listen((segment) {
  print('[${segment.startMs}ms] ${segment.text}');
});
```

## Capture microphone audio

```dart
final audioSub = WhisperSession.microphone().listen((samples) {
  whisper.feedAudio(samples);
});
```

The microphone stream should feed audio samples into the session while the user is speaking. Keep audio capture and transcription state separate so each layer can be tested independently.

## Stop and read transcript

```dart
Future<String> stopListening() async {
  await audioSub.cancel();
  await whisper.flush();
  await whisper.stop();

  final transcript = whisper.transcript.trim();

  if (transcript.isEmpty) {
    throw StateError('No speech was detected.');
  }

  return transcript;
}
```

## Initialize the assistant model

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: chatModelPath,
  contextLength: 4096,
  useGpu: true,
));

final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);
```

For a general assistant, replace `SystemPromptPreset.coder` with the preset or prompt that matches your product.

## Generate a response

```dart
Future<String> answerTranscript(String transcript) async {
  final buffer = StringBuffer();

  await for (final chunk in session.sendStream(
    '''
You are a concise offline voice assistant.
Answer in 1-3 short sentences.

User said:
$transcript
''',
  )) {
    buffer.write(chunk.token);
  }

  return buffer.toString().trim();
}
```

Use short answers for voice. Long responses are harder to listen to and can block the user from continuing the conversation.

## Speak the answer

```dart
final tts = TtsService();

final voices = await tts.availableVoices();
final voice = voices.firstWhere(
  (voice) => voice.language.startsWith('en'),
);

tts.events.listen((event) {
  if (event.type == TtsEventType.wordBoundary) {
    print('Speaking: ${event.word}');
  }
});

await tts.speak(
  answer,
  voiceId: voice.id,
  rate: 0.5,
);
```

## Complete command flow

```dart
Future<void> runVoiceTurn() async {
  try {
    await whisper.start();

    final audioSub = WhisperSession.microphone().listen((samples) {
      whisper.feedAudio(samples);
    });

    // Stop this subscription from a button, VAD event, or timeout.
    await Future<void>.delayed(const Duration(seconds: 5));

    await audioSub.cancel();
    await whisper.flush();
    await whisper.stop();

    final transcript = whisper.transcript.trim();
    if (transcript.isEmpty) return;

    final answer = await answerTranscript(transcript);

    await tts.speak(
      answer,
      voiceId: voice.id,
      rate: 0.5,
    );
  } catch (error) {
    print('Voice turn failed: $error');
  }
}
```

In production, do not use a fixed 5-second delay. Use a push-to-talk button, voice activity detection, or a clear stop control.

## UI states

| State | What to show |
| --- | --- |
| Idle | Microphone button |
| Listening | Waveform, timer, stop button |
| Transcribing | Partial transcript |
| Thinking | Streaming assistant text |
| Speaking | Highlight current word if `TtsEventType.wordBoundary` is available |
| Error | Recovery action, not a raw stack trace |

## Add tool calling

A voice assistant becomes more useful when it can call local tools.

```dart
final tools = ToolRegistry([
  ToolDefinition(
    name: 'create_note',
    description: 'Create a local note from the user voice command.',
    parameters: {
      'type': 'object',
      'properties': {
        'title': {'type': 'string'},
        'body': {'type': 'string'},
      },
      'required': ['title', 'body'],
    },
  ),
]);
```

For tool-calling voice apps, speak the confirmed result, not only the model's natural-language response.

## Safety and privacy

For production:

- process speech on device by default;
- do not log raw transcripts unless the user opts in;
- show an active microphone indicator;
- make recording state impossible to miss;
- add a delete conversation action;
- require confirmation before destructive or external actions;
- never trigger payment, security, or door-locking actions from one ambiguous voice command.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Transcript is empty | No speech, wrong permission, wrong audio format | Check microphone permission and audio stream. |
| Transcript is delayed | Whisper model is too large | Use a smaller Whisper model or fewer concurrent workloads. |
| Assistant answers too long | Prompt lacks voice constraints | Add "1-3 short sentences" to the system prompt. |
| TTS voice is wrong | Language filter picked an unexpected voice | Let users choose voice in settings. |
| Device heats up | STT + LLM + TTS run continuously | Use push-to-talk, budgets, and idle disposal. |

## Production checklist

Before shipping:

- test microphone permission denial;
- test noisy, quiet, short, and long speech;
- support interruption while speaking;
- support reset of `ChatSession`;
- add clear privacy copy;
- avoid background recording;
- test with Low Power Mode and thermal pressure.
