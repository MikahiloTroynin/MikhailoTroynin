---
title: "Voice Journal"
description: "Build an offline voice journal with transcription, summarization, and semantic search."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Voice Journal

This example shows how to build an offline voice journal. The user records a thought, the app transcribes it with Whisper, summarizes it with a chat model, stores it locally, and indexes it for semantic search.

Use this example when you want to:

- record short voice notes;
- transcribe audio on device;
- summarize entries automatically;
- search journal entries by meaning, not only keywords;
- keep personal content private by default.

## What you build

The app flow:

1. request microphone permission;
2. record audio;
3. feed audio chunks to `WhisperSession`;
4. save the transcript;
5. summarize the transcript with `ChatSession`;
6. embed the summary or transcript;
7. persist the entry and vector index;
8. search across entries later.

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

The official example uses three model paths: speech-to-text, summarization, and embeddings. Keep them independent so each model can be optimized for its task.

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

Your recorder layer is app-specific. Keep audio capture separate from transcription so it is easier to test.

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

If your SDK version only exposes `sendStream()`, collect streamed tokens into a buffer and use the final text as the summary.

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

In production, load the existing index first, add the new entry, and save it again.

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

Search examples:

```text
times I felt motivated
ideas about the new app
things I wanted to discuss with my family
```

## UI structure

Recommended screens:

| Screen | Purpose |
| --- | --- |
| Record | Start, pause, stop, and show live transcript. |
| Review | Edit transcript before saving. |
| Summary | Show generated summary and tags. |
| Timeline | Browse entries by date. |
| Search | Semantic search across entries. |
| Settings | Delete data, export data, choose models. |

## Privacy and data controls

A voice journal contains personal data. Production apps should include:

- local-only mode by default;
- microphone permission explanation;
- encrypted SQLite storage;
- encrypted vector index storage;
- delete entry and delete all data actions;
- export option controlled by the user;
- no raw transcript logging;
- clear disclosure if cloud sync is ever added.

## Error handling

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Empty transcript | Silent recording or wrong audio format | Show a retry action and verify 16kHz mono input. |
| Poor transcription | Noisy input or wrong Whisper model | Suggest quieter recording or a larger model. |
| Summary adds facts | Prompt is too open | Add "do not add facts" and validate against transcript. |
| Search misses entries | Wrong embedding field | Embed transcript + summary, not only tags. |
| Memory pressure | STT, LLM, and embedding models loaded together | Use `ModelManager` and unload idle models. |

## Production checklist

Before shipping:

- test microphone permission denial;
- test short, long, noisy, and silent recordings;
- allow users to edit transcripts;
- persist vector indexes safely;
- make deletion obvious;
- reset chat context between entries with `ChatSession.reset()`;
- use `ModelManager` for multi-model scheduling.
