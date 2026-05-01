---
    title: "Voice pipeline"
    description: "Створіть on-device voice loop із speech-to-text, LLM generation і text-to-speech."
    status: "draft"
    section: "guides"
    last_reviewed: "2026-04-30"
    ---

    # Voice pipeline

    `Voice pipeline` поєднує speech-to-text, LLM generation і text-to-speech в один local interaction loop. Використовуйте його для local voice assistants, voice journals, hands-free note capture, offline device control і accessibility features.

    ## Що ви створите

    У цьому guide показано, як:

    - transcribe speech через `WhisperSession`;
- надіслати transcript у `ChatSession`;
- speak answer через `TtsService`;
- coordinate cancellation і turn-taking;
- уникнути feedback loops;

    ## Коли використовувати

    Використовуйте voice pipeline, коли users потрібна spoken conversation. Не запускайте listening, generation і speaking як unstructured loop; використовуйте explicit states.

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

    | Name | Type | Опис |
    | --- | --- | --- |
    | `WhisperSession` | class | Captures and transcribes speech. |
| `ChatSession` | class | Generates the assistant response. |
| `TtsService` | class | Speaks the answer. |
| `transcript` | `String` | Final user text after `flush()`. |
| `sendStream()` | method | Streams generated response chunks. |

    ## Production notes

    Тримайте implementation explicit на app boundary: validate paths, check permissions, show loading states, handle cancellation і clean up idle workers або sessions. Якщо code sample у цьому guide використовує method name, який відрізняється у вашій installed SDK version, орієнтуйтесь на generated Dart API reference для цієї version і зберігайте той самий product behavior.

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
