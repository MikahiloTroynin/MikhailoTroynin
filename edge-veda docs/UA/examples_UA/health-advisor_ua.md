---
title: "Health Advisor"
description: "Створення confidence-aware health document Q&A застосунку з явними safety boundaries."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Health Advisor

Цей приклад показує, як створити health-document assistant, який відповідає на questions до user-provided documents і явно показує confidence, uncertainty та safety boundaries.

App не є diagnosis tool. Він має пояснювати content, summary-ити documents і допомагати users підготувати questions для qualified healthcare professional.

## Що створюється

Ви створите local assistant, який:

1. імпортує health-related document;
2. будує local RAG index;
3. відповідає на user questions з document;
4. відстежує confidence через `GenerateOptions.confidenceThreshold`;
5. показує handoff banner, коли confidence низький;
6. не дає diagnosis, treatment instructions і unsafe certainty.

## Safety boundary

Використовуйте product rule:

```text
The assistant explains document content.
It does not diagnose, prescribe, or replace a clinician.
Low confidence or high-risk questions trigger a handoff message.
```

Завжди показуйте видимий disclaimer у UI. Disclaimer має бути коротким і постійним.

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

Використовуйте confidence tracking, щоб визначити, коли app має показати warning або перейти на safer flow.

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

`needsCloudHandoff` не означає, що app має відправити data у cloud service. Це означає, що model невпевнена, а product має перейти до безпечнішого path. Для health content зазвичай безпечніший path — показати uncertainty, порадити professional review і не робити definitive claims.

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

Використовуйте прості confidence labels замість технічних numbers.

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

Рекомендований UI:

| Confidence | Badge | UI behavior |
| --- | --- | --- |
| High | Green | Показати answer normally із sources. |
| Medium | Yellow | Показати answer і mild uncertainty note. |
| Low | Red | Показати лише grounded answer і додати handoff banner. |

## Handoff banner

```dart
String handoffMessage(bool needsHandoff) {
  if (!needsHandoff) return '';

  return 'This answer may be incomplete or uncertain. '
      'Please review the original document and consult a qualified healthcare professional.';
}
```

Не робіть banner permanently dismissible. User може закрити його для однієї answer, але low-confidence answers мають показувати його знову.

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

Якщо поточна SDK version повертає confidence на generation responses, але не напряму на RAG responses, виконайте final answer generation з `GenerateOptions.confidenceThreshold` після retrieval.

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

Assistant має уникати прямих answers для:

- requests for diagnosis;
- medication dosage decisions;
- urgent symptoms;
- interpreting emergency risk;
- заміни clinician judgment;
- claims, яких немає в document.

Безпечніша response:

```text
I cannot determine that from the document alone.
Please contact a qualified healthcare professional.
I can help you list the document sections or questions to discuss.
```

## Приклади user questions

Добрі questions:

```text
What does this report say about cholesterol?
Which values are marked outside the reference range?
Summarize the doctor's recommendations in plain language.
What questions should I ask during my appointment?
```

Unsafe або high-risk questions:

```text
Do I have this disease?
Should I stop taking this medicine?
Is this an emergency?
What dosage should I take?
```

## Privacy notes

Health documents є sensitive. Для production:

- залишайте document processing на device за замовчуванням;
- ніколи не пишіть raw document text у logs;
- encrypt-іть local indexes;
- вимагайте explicit consent перед будь-яким external handoff;
- додайте action `delete all health data`;
- задокументуйте, де зберігаються files, embeddings і traces.

## Troubleshooting

| Symptom | Ймовірна причина | Fix |
| --- | --- | --- |
| Model звучить занадто впевнено | Prompt не enforcing uncertainty | Додати safety і confidence instructions. |
| Low-confidence banner з'являється часто | Model замала або context слабкий | Покращити retrieval, зменшити chunk noise або взяти stronger model. |
| Answer не прив'язана до document | RAG prompt занадто відкритий | Вимагати "use only provided context". |
| User просить diagnosis | Product scope unsafe | Refuse diagnosis і порадити professional consultation. |
| Sources missing | Retrieval metadata неповна | Зберігати document name, page і chunk preview. |

## Production checklist

Перед release:

- прогнати safety tests з ambiguous і high-risk questions;
- перевірити, що low-confidence output trigger-ить banner;
- показувати source snippets для answers;
- протестувати offline mode;
- додати deletion controls для imported files і indexes;
- review-нути app з legal, privacy і medical-domain stakeholders, якщо app використовується commercial.
