---
title: "Offline voice assistant"
description: "Створення on-device voice assistant через WhisperSession, ChatSession і TtsService."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Offline voice assistant

Цей приклад показує, як створити повністю local voice assistant. App записує speech, transcribe-ить його через `WhisperSession`, надсилає transcript у `ChatSession` і озвучує answer через `TtsService`.

Використовуйте цей приклад, коли потрібно:

- приймати voice commands без cloud STT service;
- відповідати через on-device language model;
- озвучувати responses через on-device TTS;
- залишати private conversations на device;
- створити foundation для voice-controlled tools.

## Що створюється

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

Приклад використовує три independent runtime surfaces:

| Stage | API |
| --- | --- |
| Speech-to-text | `WhisperSession` |
| Reasoning / response | `ChatSession` |
| Text-to-speech | `TtsService` |

## Передумови

Перед початком:

- request microphone permission;
- додайте compatible Whisper model;
- додайте compatible chat model;
- тестуйте на physical iPhone для реального STT і Metal performance;
- вирішіть, чи assistant має відповідати freely, чи використовувати tools.

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

Microphone stream має передавати audio samples у session, поки user говорить. Тримайте audio capture і transcription state окремо, щоб кожен layer було легко test-ити.

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

Для general assistant замініть `SystemPromptPreset.coder` на preset або prompt, який відповідає product.

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

Для voice використовуйте short answers. Long responses складніше слухати, і вони можуть блокувати user від продовження conversation.

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

У production не використовуйте fixed 5-second delay. Краще push-to-talk button, voice activity detection або clear stop control.

## UI states

| State | Що показувати |
| --- | --- |
| Idle | Microphone button |
| Listening | Waveform, timer, stop button |
| Transcribing | Partial transcript |
| Thinking | Streaming assistant text |
| Speaking | Highlight current word, якщо доступний `TtsEventType.wordBoundary` |
| Error | Recovery action, не raw stack trace |

## Add tool calling

Voice assistant стає кориснішим, коли може call-ити local tools.

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

Для tool-calling voice apps озвучуйте confirmed result, а не лише natural-language response від model.

## Safety and privacy

Для production:

- обробляйте speech на device by default;
- не log-іть raw transcripts без opt-in від user;
- показуйте active microphone indicator;
- зробіть recording state очевидним;
- додайте delete conversation action;
- вимагайте confirmation перед destructive або external actions;
- не запускайте payment, security або door-locking actions з однієї ambiguous voice command.

## Troubleshooting

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Transcript empty | No speech, wrong permission, wrong audio format | Перевірити microphone permission і audio stream. |
| Transcript delayed | Whisper model завелика | Використати меншу Whisper model або менше concurrent workloads. |
| Assistant answers too long | Prompt без voice constraints | Додати "1-3 short sentences" у system prompt. |
| TTS voice wrong | Language filter picked unexpected voice | Дати users choose voice in settings. |
| Device heats up | STT + LLM + TTS run continuously | Використати push-to-talk, budgets і idle disposal. |

## Production checklist

Перед release:

- протестуйте microphone permission denial;
- протестуйте noisy, quiet, short і long speech;
- підтримуйте interruption while speaking;
- підтримуйте reset для `ChatSession`;
- додайте clear privacy copy;
- не допускайте background recording;
- тестуйте з Low Power Mode і thermal pressure.
