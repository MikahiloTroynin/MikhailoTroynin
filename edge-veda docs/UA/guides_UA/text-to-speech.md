---
    title: "Text to speech"
    description: "Озвучуйте generated text on device через TtsService і iOS AVSpeechSynthesizer."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Text to speech

    `Text-to-speech` перетворює text у spoken audio. В Edge Veda `TtsService` використовує platform speech system на iOS, тому app може speak model responses без окремого TTS model.

    ## Що ви створите

    У цьому guide показано, як:

    - створити `TtsService`;
- отримати available voices;
- вибрати voice by language;
- speak text із rate control;
- слухати word boundary events;

    ## Коли використовувати

    Використовуйте TTS для voice assistants, accessibility, read-aloud features, hands-free workflows і voice journal summaries. Не speak-іть sensitive text automatically.

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

    | Name | Type | Опис |
    | --- | --- | --- |
    | `availableVoices()` | method | Lists device voices. |
| `voiceId` | `String` | Voice selected for speech. |
| `rate` | `double` | Speech speed. |
| `pitch` | `double` | Voice pitch if exposed by SDK. |
| `TtsEventType.wordBoundary` | event | Used for word highlighting. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

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
