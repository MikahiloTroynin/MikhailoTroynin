---
title: "Health Advisor"
description: "Build a confidence-aware health document Q&A app with explicit safety boundaries."
status: "draft"
section: "examples"
locale: "en"
last_reviewed: "2026-04-30"
---

# Health Advisor

This example shows how to build a health-document assistant that answers questions about user-provided documents while exposing confidence, uncertainty, and safety boundaries.

The app is not a diagnosis tool. It should explain content, summarize documents, and help users prepare questions for a qualified healthcare professional.

## What you build

You will build a local assistant that:

1. imports a health-related document;
2. builds a local RAG index;
3. answers user questions from the document;
4. tracks confidence with `GenerateOptions.confidenceThreshold`;
5. shows a handoff banner when confidence is low;
6. avoids diagnosis, treatment instructions, and unsafe certainty.

## Safety boundary

Use this product rule:

```text
The assistant explains document content.
It does not diagnose, prescribe, or replace a clinician.
Low confidence or high-risk questions trigger a handoff message.
```

Always show a visible disclaimer in the UI. The disclaimer should be short and persistent.

## Architecture

```text
Health document
  ↓
Text extraction
  ↓
VectorIndex
  ↓
RagPipeline
  ↓
Answer generation with confidence tracking
  ↓
Confidence badge + handoff banner
```

## Runtime setup

```dart
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 4096,
  useGpu: true,
));
```

## Confidence-aware generation

Use confidence tracking to decide when the app should show a warning or route to another flow.

```dart
final response = await edgeVeda.generate(
  'Summarize this document section in plain language: $context',
  options: GenerateOptions(
    confidenceThreshold: 0.3,
  ),
);

final averageConfidence = response.avgConfidence;
final shouldHandoff = response.needsCloudHandoff;
```

`needsCloudHandoff` does not mean the app must send data to a cloud service. It means the model is uncertain and the product should switch to a safer path. For health content, the safer path is usually: show uncertainty, suggest professional review, and avoid definitive claims.

## Health answer prompt

```text
You are a health document explanation assistant.

Use only the provided document context.
Do not diagnose.
Do not prescribe medication or treatment.
Do not claim certainty when the document is unclear.
If the answer is not present in the document, say so.
If the question may require medical judgment, tell the user to consult a qualified healthcare professional.

User question:
{question}

Document context:
{retrieved_context}
```

## Confidence UI

Use simple confidence labels instead of technical numbers.

```dart
enum ConfidenceLevel {
  high,
  medium,
  low,
}

ConfidenceLevel confidenceLevel(double value) {
  if (value >= 0.70) return ConfidenceLevel.high;
  if (value >= 0.45) return ConfidenceLevel.medium;
  return ConfidenceLevel.low;
}
```

Recommended UI:

| Confidence | Badge | UI behavior |
| --- | --- | --- |
| High | Green | Show answer normally with sources. |
| Medium | Yellow | Show answer and a mild uncertainty note. |
| Low | Red | Show answer only if grounded, add handoff banner. |

## Handoff banner

```dart
String handoffMessage(bool needsHandoff) {
  if (!needsHandoff) return '';

  return 'This answer may be incomplete or uncertain. '
      'Please review the original document and consult a qualified healthcare professional.';
}
```

Do not make the banner dismiss permanently. Users should be able to close it for one answer, but low-confidence answers should show it again.

## RAG query flow

```dart
Future<HealthAnswer> answerHealthQuestion({
  required RagPipeline rag,
  required String question,
}) async {
  final result = await rag.query(question);

  return HealthAnswer(
    text: result.text,
    sources: result.sources,
    avgConfidence: result.avgConfidence,
    needsHandoff: result.needsCloudHandoff,
  );
}
```

If the current SDK version returns confidence on generation responses but not directly on RAG responses, run the final answer generation with `GenerateOptions.confidenceThreshold` after retrieval.

## Answer model

```dart
class HealthAnswer {
  const HealthAnswer({
    required this.text,
    required this.sources,
    required this.avgConfidence,
    required this.needsHandoff,
  });

  final String text;
  final List<Object> sources;
  final double avgConfidence;
  final bool needsHandoff;
}
```

## Refusal and redirection cases

The assistant should avoid direct answers for:

- requests for a diagnosis;
- medication dosage decisions;
- urgent symptoms;
- interpreting emergency risk;
- replacing a clinician's judgment;
- making claims not present in the document.

Safer response:

```text
I cannot determine that from the document alone.
Please contact a qualified healthcare professional.
I can help you list the document sections or questions to discuss.
```

## Example user questions

Good questions:

```text
What does this report say about cholesterol?
Which values are marked outside the reference range?
Summarize the doctor's recommendations in plain language.
What questions should I ask during my appointment?
```

Unsafe or high-risk questions:

```text
Do I have this disease?
Should I stop taking this medicine?
Is this an emergency?
What dosage should I take?
```

## Privacy notes

Health documents are sensitive. For production:

- keep document processing on device by default;
- never log raw document text;
- encrypt local indexes;
- require explicit consent before any external handoff;
- provide a "delete all health data" action;
- document where files, embeddings, and traces are stored.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Model sounds too certain | Prompt does not enforce uncertainty | Add explicit safety and confidence instructions. |
| Low-confidence banner appears often | Model is too small or context is weak | Improve retrieval, reduce chunk noise, or use a stronger model. |
| Answer is not tied to the document | RAG prompt is too open | Require "use only provided context". |
| User asks for diagnosis | Product scope is unsafe | Refuse diagnosis and suggest professional consultation. |
| Sources are missing | Retrieval metadata is incomplete | Store document name, page, and chunk preview. |

## Production checklist

Before shipping:

- run safety tests with ambiguous and high-risk questions;
- verify that low-confidence output triggers a banner;
- show source snippets for answers;
- test offline mode;
- add deletion controls for imported files and indexes;
- review the app with legal, privacy, and medical-domain stakeholders if used commercially.
