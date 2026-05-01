---
    title: "Text to speech"
    description: "Speak generated text on device with TtsService and iOS AVSpeechSynthesizer."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Text to speech

    Text-to-speech converts text into spoken audio. In Edge Veda, `TtsService` uses the platform speech system on iOS, so apps can speak model responses without shipping a separate TTS model.

    ## What you will build

    This guide shows how to:

    - create `TtsService`;
- list available voices;
- select a voice by language;
- speak text with rate control;
- listen for word boundary events;

    ## When to use it

    Use TTS for voice assistants, accessibility, read-aloud features, hands-free workflows, and voice journal summaries. Avoid speaking sensitive text automatically.

    ## Basic example

    ```dart
final tts = TtsService();

final voices = await tts.availableVoices();
final voice = voices.firstWhere(
  (v) => v.language.startsWith('en'),
);

tts.events.listen((event) {
  if (event.type == TtsEventType.wordBoundary) {
    print('Speaking: ${event.word}');
  }
});

await tts.speak(
  'Hello from on-device AI',
  voiceId: voice.id,
  rate: 0.5,
);
```

    ## Recommended practices

    - Do not hard-code a single voice; provide fallback voice selection.
- Call `tts.stop()` before speaking a new answer.
- Use word boundary events for UI highlighting, not business logic.
- Keep spoken answers short and natural.
- Expose rate and voice settings when speech is a core feature.

    ## Parameters and related objects

    | Name | Type | Description |
    | --- | --- | --- |
    | `availableVoices()` | method | Lists device voices. |
| `voiceId` | `String` | Voice selected for speech. |
| `rate` | `double` | Speech speed. |
| `pitch` | `double` | Voice pitch if exposed by SDK. |
| `TtsEventType.wordBoundary` | event | Used for word highlighting. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Text length | Long answers create poor voice UX. | Summarize before speaking. |
| Voice quality | Enhanced voices vary by device. | Let user choose. |
| Rate | Too fast hurts comprehension. | Start around `0.5`. |
| Concurrent audio | TTS may conflict with STT. | Coordinate audio state. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | No voice for language | Device lacks requested voice. | Fallback to first available voice. |
| Speech continues after new prompt | Previous utterance not stopped. | Call `tts.stop()` first. |
| Highlighting out of sync | Word boundary events are approximate. | Use highlighting only as visual guidance. |

    ## Privacy notes

    Spoken output can be overheard. Give users control over when text is spoken and never speak sensitive content automatically.

    ## Related guides

    - [`speech-to-text.md`](./speech-to-text.md)
- [`voice-pipeline.md`](./voice-pipeline.md)
- [`chat-sessions.md`](./chat-sessions.md)
