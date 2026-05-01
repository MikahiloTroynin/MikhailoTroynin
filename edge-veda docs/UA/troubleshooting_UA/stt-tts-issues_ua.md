---
title: "Проблеми STT/TTS"
description: "Як усувати проблеми speech-to-text, text-to-speech, microphone permissions, audio chunks, voice selection і voice pipeline в Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми STT/TTS

Використовуйте цю сторінку, коли speech-to-text не захоплює audio, transcription неточний, STT latency зростає, TTS не озвучує текст, voice selection не працює або voice pipeline `STT → LLM → TTS` стає нестабільним.

Edge Veda має on-device speech capabilities:

- STT через `whisper.cpp`, з Metal acceleration на підтримуваних Apple devices.
- Streaming transcription в audio chunks.
- Native iOS TTS через `AVSpeechSynthesizer`.
- Word boundary events для підсвічування spoken text, якщо підтримується.

## Типові симптоми

| Симптом | Ймовірна причина | Перша дія |
| --- | --- | --- |
| Немає microphone input | Відсутній iOS permission або застосунок не запросив доступ. | Перевірте `Info.plist` і runtime permission request. |
| Transcription порожній | Audio session не активна або input level занизький. | Протестуйте простий recorder і перевірте audio buffers. |
| Transcription неточний | Неправильна language, шум, мала модель або поганий chunking. | Протестуйте відому фразу в тихішому середовищі. |
| STT повільний | Модель завелика, Metal не активний, thermal pressure або concurrent workers. | Протестуйте меншу Whisper model і вимкніть інші workloads. |
| TTS не говорить | Audio session conflict або unavailable voice. | Використайте default system voice і протестуйте поза AI flow. |
| TTS зупиняється рано | Новий speech request перериває попередній. | Серіалізуйте TTS requests. |
| Word highlighting неправильний | Word boundary timing не відповідає displayed text. | Для highlighting використовуйте той самий text, який передано в TTS. |

## iOS permissions

Якщо застосунок записує audio, додайте microphone usage description до `ios/Runner/Info.plist`.

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone to transcribe your speech on device.</string>
```

Якщо застосунок використовує speech recognition APIs поза Edge Veda STT path, може знадобитися speech recognition usage description. Текст permission має точно описувати реальну поведінку застосунку.

## Швидкі перевірки STT

Перед діагностикою Edge Veda переконайтесь, що застосунок може захоплювати audio.

| Перевірка | Очікуваний результат |
| --- | --- |
| Permission dialog | iOS запитує microphone access під час першого використання. |
| Permission status | Застосунок отримує granted microphone permission. |
| Audio level | Input buffer змінюється, коли користувач говорить. |
| Sample rate | Audio конвертується до expected model input rate. |
| Chunk duration | Chunks достатньо довгі для Whisper recognition. |
| Пристрій | Для реальної performance використовується фізичний iPhone. |

## STT latency зростає з часом

Можливі причини:

- Continuous transcription нагріває пристрій.
- Audio chunks стають у чергу швидше, ніж обробляються.
- Застосунок тримає старі audio buffers у памʼяті.
- STT працює разом з LLM generation, TTS, RAG або image generation.
- Обрана Whisper model занадто велика для target device.

Рішення:

- Відкидайте stale chunks замість unbounded queue.
- Звільняйте кожен audio buffer після transcription.
- Додайте silence detection, якщо це дозволяє product behavior.
- Використовуйте scheduler priority для active user speech.
- Ставте інші heavy workers на паузу під час STT.
- Протестуйте `whisper-tiny` або іншу меншу модель перед підвищенням якості.

## Низька якість transcription

| Причина | Рішення |
| --- | --- |
| Неправильна language configuration | Задайте або auto-detect очікувану language. |
| Шумне середовище | Додайте UI-підказку і тестуйте з ближчим microphone. |
| Chunks занадто короткі | Збільште chunk duration до змістовної довжини. |
| Chunks розрізають слова | Використайте overlap або speech boundary detection, якщо доступно. |
| Модель занадто мала | Використайте більшу Whisper model, якщо device budget дозволяє. |
| Audio format mismatch | Перевірте downsampling і mono conversion. |

## TTS не говорить

Перевірте:

- Device volume не muted.
- App audio session дозволяє playback.
- Для вибраної language існує valid voice.
- Text не порожній.
- Інший TTS request не викликає `stop()` одразу.
- Застосунок не disposed або backgrounded до старту playback.

Почніть з default voice і простого text:

```dart
await tts.speak('Hello. This is an on-device voice test.');
```

Після цього додавайте language, rate, pitch і volume configuration.

## Проблеми voice selection

Voice availability залежить від platform і installed voices.

Поради:

- Запитуйте available voices перед вибором.
- Робіть fallback до default voice для language.
- Не hardcode voice identifier без fallback.
- Тестуйте system і enhanced/neural voices.
- Для user-facing app залиште видимий setting для voice choice.

## Проблеми pipeline `STT → LLM → TTS`

Повний voice pipeline поєднує кілька workloads і може падати на будь-якому етапі.

Рекомендована state machine:

1. **Listening** — захоплення microphone input.
2. **Transcribing** — обробка audio chunk через STT.
3. **Thinking** — передача transcript до LLM.
4. **Speaking** — TTS playback.
5. **Idle** — звільнення temporary buffers і очікування.

Не накладайте ці стани, якщо продукт явно не потребує barge-in behavior.

## Barge-in і interruption

Якщо користувач говорить під час активного TTS:

- Визначте, чи треба одразу зупиняти TTS.
- Скасуйте поточний LLM stream, якщо нове мовлення є новим request.
- Очистіть stale partial transcripts.
- Тримайте single source of truth для conversation state.
- Не відправляйте одночасно старий і новий transcript у модель.

## Privacy notes

Voice features можуть обробляти чутливі дані. Рекомендації:

- Тримайте STT on device там, де це підтримує вибраний Edge Veda path.
- Не логуйте raw transcripts без opt-in користувача.
- Не зберігайте audio buffers після transcription, якщо це не потрібно.
- Пояснюйте microphone usage у permission text.
- Не відправляйте transcripts у remote services, якщо продукт цього явно не пояснює.

## Діагностика

Додайте:

- Модель пристрою та iOS version.
- Версію Edge Veda.
- STT model name і size.
- TTS voice identifier і language.
- Чи надано microphone permission.
- Audio sample rate, channel count і chunk duration.
- STT latency per chunk.
- Чи ввімкнено Metal GPU для STT.
- Чи були одночасно активні LLM, RAG, vision або image generation.
- Minimal reproduction з однією відомою spoken phrase.

## Повʼязані документи

- [Thermal throttling](./thermal-throttling.md)
- [Проблеми streaming](./streaming-issues.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Speech to text](../guides/speech-to-text.md)
- [Text to speech](../guides/text-to-speech.md)
- [Voice pipeline](../guides/voice-pipeline.md)
- [Permissions](../reference/permissions.md)
