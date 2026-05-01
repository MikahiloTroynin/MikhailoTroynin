---
    title: "Speech to text"
    description: "Transcribe microphone audio on device with WhisperSession and Edge Veda."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Speech to text

    Speech-to-text converts microphone audio into text on device. Edge Veda uses Whisper-based local transcription for voice notes, dictation, command capture, meeting snippets, accessibility features, and voice assistants.

    ## What you will build

    This guide shows how to:

    - start a `WhisperSession`;
- listen for transcription segments;
- feed microphone samples;
- flush and stop the session;
- handle permissions and partial transcripts;

    ## When to use it

    Use speech-to-text when the user needs voice input without sending audio to a cloud service. Avoid triggering irreversible actions from partial transcripts.

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

    | Name | Type | Description |
    | --- | --- | --- |
    | `modelPath` | `String` | Path to the local Whisper model. |
| `onSegment` | `Stream` | Emits transcription segments. |
| `microphone()` | `Stream` | Captures microphone samples. |
| `feedAudio()` | method | Feeds audio samples into the session. |
| `flush()` | method | Processes buffered audio before stopping. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

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
