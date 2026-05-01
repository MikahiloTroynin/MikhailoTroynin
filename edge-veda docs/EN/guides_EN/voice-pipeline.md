---
    title: "Voice pipeline"
    description: "Build an on-device voice loop with speech-to-text, LLM generation, and text-to-speech."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Voice pipeline

    A voice pipeline connects speech-to-text, LLM generation, and text-to-speech into a single local interaction loop. Use it for local voice assistants, voice journals, hands-free note capture, offline device control, and accessibility features.

    ## What you will build

    This guide shows how to:

    - transcribe speech with `WhisperSession`;
- send the transcript to `ChatSession`;
- speak the answer with `TtsService`;
- coordinate cancellation and turn-taking;
- avoid feedback loops;

    ## When to use it

    Use a voice pipeline when users need a spoken conversation. Do not run listening, generation, and speaking as an unstructured loop; use explicit states.

    ## Basic example

    ```dart
final stt = WhisperSession(modelPath: whisperModelPath);
final tts = TtsService();

final chat = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.llama3Instruct,
);

await stt.start();
// feed microphone samples here

await stt.flush();
final userText = stt.transcript.trim();

final buffer = StringBuffer();

await for (final chunk in chat.sendStream(userText)) {
  buffer.write(chunk.token);
}

await tts.speak(buffer.toString(), rate: 0.5);
await stt.stop();
```

    ## Recommended practices

    - Use states: `idle → listening → transcribing → generating → speaking`.
- Pause microphone capture while TTS is speaking.
- Call `tts.stop()` when the user interrupts.
- Ask the model for speech-friendly short answers.
- Use `ModelManager` when STT and LLM models are both loaded.

    ## Parameters and related objects

    | Name | Type | Description |
    | --- | --- | --- |
    | `WhisperSession` | class | Captures and transcribes speech. |
| `ChatSession` | class | Generates the assistant response. |
| `TtsService` | class | Speaks the answer. |
| `transcript` | `String` | Final user text after `flush()`. |
| `sendStream()` | method | Streams generated response chunks. |

    ## Production notes

    Keep the implementation explicit at the app boundary: validate paths, check permissions, show loading states, handle cancellation, and clean up idle workers or sessions. If a code sample in this guide uses a method name that differs from your installed SDK version, follow the generated Dart API reference for that version and keep the same product behavior.

    ## Performance notes

    | Factor | Impact | Recommendation |
    | --- | --- | --- |
    | Three active stages | STT, LLM, and TTS compete for resources. | Use scheduler and explicit states. |
| Long recordings | Increase transcription and summary time. | Segment long input. |
| Long answers | Create slow speech. | Prompt for concise spoken output. |
| Audio feedback | TTS can be transcribed by STT. | Stop mic capture while speaking. |

    ## Troubleshooting

    | Symptom | Possible cause | Fix |
    | --- | --- | --- |
    | Assistant answers itself | TTS audio is being transcribed. | Pause STT while TTS is active. |
| User interruption ignored | No cancellation path. | Stop TTS and reset state. |
| Device heats up | Multiple workloads run continuously. | Use QoS, idle timeouts, and smaller models. |

    ## Privacy notes

    Voice pipelines process audio, transcripts, prompts, and generated responses. Keep them local by default, ask before saving voice history, and make deletion easy.

    ## Related guides

    - [`speech-to-text.md`](./speech-to-text.md)
- [`text-to-speech.md`](./text-to-speech.md)
- [`vector-index.md`](./vector-index.md)
