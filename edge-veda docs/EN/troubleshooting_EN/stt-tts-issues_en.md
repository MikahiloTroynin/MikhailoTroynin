---
title: "STT/TTS issues"
description: "Troubleshoot speech-to-text, text-to-speech, microphone permissions, audio chunks, voice selection, and voice pipeline issues in Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# STT/TTS issues

Use this page when speech-to-text does not capture audio, transcription is inaccurate, STT latency grows, TTS does not speak, voice selection fails, or the voice pipeline `STT → LLM → TTS` becomes unstable.

Edge Veda includes on-device speech features:

- STT through `whisper.cpp`, with Metal acceleration on supported Apple devices.
- Streaming transcription in audio chunks.
- Native iOS TTS through `AVSpeechSynthesizer`.
- Word boundary events for highlighting spoken text where supported.

## Common symptoms

| Symptom | Likely cause | First action |
| --- | --- | --- |
| No microphone input | Missing iOS permission or app did not request access. | Check `Info.plist` and runtime permission request. |
| Transcription is empty | Audio session is not active or input level is too low. | Test with a simple recorder and inspect audio buffers. |
| Transcription is inaccurate | Wrong language, noisy audio, small model, or bad chunking. | Test with a known phrase and quieter environment. |
| STT is slow | Model too large, Metal not active, thermal pressure, or concurrent workers. | Test with a smaller Whisper model and disable other workloads. |
| TTS does not speak | Audio session conflict or unavailable voice. | Use a default system voice and test outside the AI flow. |
| TTS stops early | New speech request interrupts the previous one. | Serialize TTS requests. |
| Word highlighting is wrong | Word boundary timing does not match the displayed text. | Use the exact text passed to TTS for highlighting. |

## iOS permissions

If the app records audio, add a microphone usage description to `ios/Runner/Info.plist`.

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone to transcribe your speech on device.</string>
```

If the app uses speech recognition APIs outside the Edge Veda STT path, it may also need a speech recognition usage description. Keep permission text specific to what the app actually does.

## STT quick checks

Before debugging Edge Veda, confirm that the app can capture audio.

| Check | Expected result |
| --- | --- |
| Permission dialog appears | iOS asks for microphone access on first use. |
| Permission status | The app receives granted microphone permission. |
| Audio level | Input buffer changes when the user speaks. |
| Sample rate | Audio is converted to the expected model input rate. |
| Chunk duration | Chunks are long enough for Whisper to recognize speech. |
| Device | Physical iPhone is used for realistic performance. |

## STT latency grows over time

Possible causes:

- Continuous transcription heats the device.
- Audio chunks are queued faster than they are processed.
- The app keeps old audio buffers in memory.
- STT runs together with LLM generation, TTS, RAG, or image generation.
- The selected Whisper model is too large for the target device.

Fixes:

- Drop stale chunks instead of queueing unbounded audio.
- Release each audio buffer after transcription.
- Add silence detection where product behavior allows it.
- Use scheduler priority for active user speech.
- Pause other heavy workers while STT is active.
- Test `whisper-tiny` or another smaller model before increasing quality.

## Poor transcription quality

| Cause | Fix |
| --- | --- |
| Wrong language configuration | Set or auto-detect the expected language. |
| Noisy environment | Add UI guidance and test with a closer microphone. |
| Chunks are too short | Increase chunk duration enough to capture meaningful speech. |
| Chunks split words | Use overlap or speech boundary detection if available. |
| Model too small | Use a larger Whisper model if device budget allows it. |
| Audio format mismatch | Confirm downsampling and mono conversion. |

## TTS does not speak

Check:

- Device volume is not muted.
- The app audio session allows playback.
- A valid voice exists for the selected language.
- The text is not empty.
- Another TTS request is not immediately calling `stop()`.
- The app is not disposed or backgrounded before playback starts.

Start with a default voice and simple text:

```dart
await tts.speak('Hello. This is an on-device voice test.');
```

Then add language, rate, pitch, and volume configuration.

## Voice selection issues

Voice availability depends on the platform and installed voices.

Troubleshooting tips:

- Query available voices before selecting one.
- Fallback to a default voice for the language.
- Do not hardcode a voice identifier without fallback.
- Test both system and enhanced/neural voices.
- Keep a visible setting for voice choice if the app is user-facing.

## STT → LLM → TTS pipeline issues

The full voice pipeline combines multiple workloads and can fail at any stage.

Recommended state machine:

1. **Listening** — capture microphone input.
2. **Transcribing** — process audio chunk through STT.
3. **Thinking** — send transcript to LLM.
4. **Speaking** — play TTS response.
5. **Idle** — release temporary buffers and wait.

Avoid overlapping these states unless the product explicitly needs barge-in behavior.

## Barge-in and interruption

If the user speaks while TTS is active:

- Decide whether to stop TTS immediately.
- Cancel the current LLM stream if the new speech is a new request.
- Clear stale partial transcripts.
- Keep a single source of truth for conversation state.
- Avoid sending both the old and new transcript to the model.

## Privacy notes

Voice features can process sensitive data. Recommended behavior:

- Keep STT on device where the selected Edge Veda path supports it.
- Do not log raw transcripts unless the user has opted in.
- Do not store audio buffers after transcription unless required.
- Explain microphone usage in user-facing permission text.
- Avoid sending transcripts to remote services unless the product clearly states it.

## Diagnostics to collect

Attach:

- Device model and iOS version.
- Edge Veda package version.
- STT model name and size.
- TTS voice identifier and language.
- Whether microphone permission was granted.
- Audio sample rate, channel count, and chunk duration.
- STT latency per chunk.
- Whether Metal GPU is enabled for STT.
- Whether LLM, RAG, vision, or image generation was active at the same time.
- Minimal reproduction with one known spoken phrase.

## Related docs

- [Thermal throttling](./thermal-throttling.md)
- [Streaming issues](./streaming-issues.md)
- [Memory issues](./memory-issues.md)
- [Speech to text](../guides/speech-to-text.md)
- [Text to speech](../guides/text-to-speech.md)
- [Voice pipeline](../guides/voice-pipeline.md)
- [Permissions](../reference/permissions.md)
