---
    title: "Speech to text"
    description: "Транскрибуйте microphone audio on device через WhisperSession і Edge Veda."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Speech to text

    `Speech-to-text` перетворює microphone audio на text on device. Edge Veda використовує Whisper-based local transcription для voice notes, dictation, command capture, meeting snippets, accessibility features і voice assistants.

    ## Що ви створите

    У цьому guide показано, як:

    - start `WhisperSession`;
- слухати transcription segments;
- feed microphone samples;
- flush і stop session;
- обробляти permissions і partial transcripts;

    ## Коли використовувати

    Використовуйте speech-to-text, коли user потребує voice input без надсилання audio у cloud service. Не запускайте irreversible actions з partial transcripts.

    ## Basic example

    ```dart
final session = WhisperSession(modelPath: whisperModelPath);

await session.start();

session.onSegment.listen((segment) {
  print('[${segment.startMs}ms] ${segment.text}');
});

final audioSub = WhisperSession.microphone().listen((samples) {
  session.feedAudio(samples);
});

// Later:
await session.flush();
await session.stop();
await audioSub.cancel();

print(session.transcript);
```

    ## Recommended practices

    - Add microphone permission copy to the iOS app.
- Show partial transcript while recording and final transcript after `flush()`.
- Cancel the microphone stream before stopping the session.
- Use a smaller Whisper model for responsive voice notes.
- Do not log raw audio or private transcripts in production.

    ## Parameters and related objects

    | Name | Type | Опис |
    | --- | --- | --- |
    | `modelPath` | `String` | Path to the local Whisper model. |
| `onSegment` | `Stream` | Emits transcription segments. |
| `microphone()` | `Stream` | Captures microphone samples. |
| `feedAudio()` | method | Feeds audio samples into the session. |
| `flush()` | method | Processes buffered audio before stopping. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Model size | Larger Whisper models improve quality but increase latency. | Start with `Whisper Tiny`. |
| Chunking | Small chunks feel real-time but add overhead. | Use SDK defaults first. |
| Concurrent workloads | STT competes with LLM and vision. | Use scheduler priorities. |
| UI updates | Frequent updates can cause jank. | Update on segment events. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | No audio captured | Microphone permission missing or denied. | Add permission copy and request access. |
| Empty transcript | Audio too quiet or wrong input route. | Show input level and test real device. |
| Repeated text | Partial segments appended without deduplication. | Track timestamps and finalization state. |

    ## Privacy notes

    Audio samples and transcripts can contain sensitive data. Keep transcription local, avoid raw audio logging, and delete temporary buffers after recording.

    ## Related guides

    - [`text-to-speech.md`](./text-to-speech.md)
- [`voice-pipeline.md`](./voice-pipeline.md)
- [`model-manager.md`](./model-manager.md)
