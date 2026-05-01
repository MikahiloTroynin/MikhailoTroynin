---
title: "Voice Journal"
description: "Створення offline voice journal з transcription, summarization і semantic search."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Voice Journal

Цей приклад показує, як створити offline voice journal. User записує думку, app transcribe-ить її через Whisper, summarise-ить через chat model, зберігає local entry і index-ить її для semantic search.

Використовуйте цей приклад, коли потрібно:

- записувати короткі voice notes;
- transcribe-ити audio на device;
- автоматично summarise-ити entries;
- шукати journal entries за змістом, а не лише keywords;
- залишати personal content private by default.

## Що створюється

Потік застосунку:

1. запит microphone permission;
2. recording audio;
3. передача audio chunks у `WhisperSession`;
4. збереження transcript;
5. summary transcript через `ChatSession`;
6. embedding summary або transcript;
7. persistence entry і vector index;
8. подальший search across entries.

## Architecture

```text
Microphone
  ↓
WhisperSession
  ↓
Transcript
  ↓
ChatSession summary
  ↓
SQLite entry storage
  ↓
EdgeVeda.embed()
  ↓
VectorIndex persistence
  ↓
Semantic search
```

Офіційний example використовує три model paths: speech-to-text, summarization і embeddings. Тримайте їх independent, щоб кожна model була optimized для свого task.

## Entry model

```dart
class JournalEntry {
  const JournalEntry({
    required this.id,
    required this.createdAt,
    required this.transcript,
    required this.summary,
    required this.tags,
  });

  final String id;
  final DateTime createdAt;
  final String transcript;
  final String summary;
  final List<String> tags;
}
```

## Speech-to-text setup

```dart
import 'package:edge_veda/edge_veda.dart';

final whisperWorker = WhisperWorker();

await whisperWorker.spawn();
await whisperWorker.initWhisper(
  modelPath: whisperModelPath,
  numThreads: 4,
);

final whisperSession = WhisperSession(worker: whisperWorker);
```

## Transcription stream

```dart
final transcriptBuffer = StringBuffer();

final subscription = whisperSession.transcriptionStream.listen((segments) {
  for (final segment in segments) {
    transcriptBuffer.write(segment.text);
    transcriptBuffer.write(' ');
  }
});

// Feed 16kHz mono Float32 audio chunks from your recorder.
whisperSession.addAudioChunk(audioData);
```

Recorder layer залежить від app. Тримайте audio capture окремо від transcription, щоб його було легше test-ити.

## Finish a recording

```dart
Future<String> finishRecording() async {
  await subscription.cancel();
  final transcript = transcriptBuffer.toString().trim();

  if (transcript.isEmpty) {
    throw StateError('No speech was transcribed.');
  }

  return transcript;
}
```

## Summarize the entry

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: summarizerModelPath,
  contextLength: 2048,
  useGpu: true,
));

final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);

final response = await session.send(
  '''
Summarize this journal entry in 3 bullet points.
Do not add facts that are not present.
Also suggest up to 3 short tags.

Transcript:
$transcript
''',
);

final summary = response.text;
session.reset();
```

Якщо ваша SDK version має лише `sendStream()`, зберіть streamed tokens у buffer і використайте final text як summary.

## Embed and save

```dart
final embedding = await edgeVeda.embed('$summary\n\n$transcript');

final index = VectorIndex(dimensions: embedding.embedding.length);

index.add(
  entry.id,
  embedding.embedding,
  metadata: {
    'createdAt': entry.createdAt.toIso8601String(),
    'summary': entry.summary,
  },
);

await index.save(indexPath);
```

У production спочатку load-іть existing index, додавайте new entry і зберігайте його знову.

## Semantic search

```dart
Future<List<JournalEntry>> searchJournal({
  required EdgeVeda embedder,
  required VectorIndex index,
  required String query,
}) async {
  final queryEmbedding = await embedder.embed(query);

  final matches = index.search(
    queryEmbedding.embedding,
    topK: 5,
  );

  return loadEntriesByIds(matches.map((match) => match.id).toList());
}
```

Приклади пошуку:

```text
times I felt motivated
ideas about the new app
things I wanted to discuss with my family
```

## UI structure

Рекомендовані screens:

| Screen | Purpose |
| --- | --- |
| Record | Start, pause, stop і live transcript. |
| Review | Edit transcript перед save. |
| Summary | Generated summary і tags. |
| Timeline | Browse entries by date. |
| Search | Semantic search across entries. |
| Settings | Delete data, export data, choose models. |

## Privacy and data controls

Voice journal містить personal data. Production apps мають включати:

- local-only mode by default;
- пояснення microphone permission;
- encrypted SQLite storage;
- encrypted vector index storage;
- delete entry і delete all data actions;
- export option, контрольований user;
- без raw transcript logging;
- явне disclosure, якщо cloud sync буде додано.

## Error handling

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Empty transcript | Silent recording або wrong audio format | Показати retry action і перевірити 16kHz mono input. |
| Poor transcription | Noisy input або wrong Whisper model | Порадити quiet recording або larger model. |
| Summary додає facts | Prompt занадто відкритий | Додати "do not add facts" і validate проти transcript. |
| Search misses entries | Wrong embedding field | Embed-ити transcript + summary, не лише tags. |
| Memory pressure | STT, LLM і embedding models loaded together | Використати `ModelManager` і unload idle models. |

## Production checklist

Перед release:

- протестуйте microphone permission denial;
- протестуйте short, long, noisy і silent recordings;
- дозвольте users edit transcripts;
- persist-іть vector indexes safely;
- зробіть deletion очевидним;
- reset-іть chat context між entries через `ChatSession.reset()`;
- використовуйте `ModelManager` для multi-model scheduling.
