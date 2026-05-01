---
title: "Structured output"
description: "Генеруйте schema-constrained JSON через Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Structured output

`Structured output` дає model можливість повернути JSON, що відповідає schema. Використовуйте `sendStructured()`, коли app потрібні machine-readable data, а не free-form prose: extraction, classification, routing, form filling, command generation або UI configuration.

Для natural language answers використовуйте [`text-generation.md`](./text-generation.md) або [`chat-sessions.md`](./chat-sessions.md). Для tool execution використовуйте [`function-calling.md`](./function-calling.md).

## Що ви створите

У цьому guide показано, як:

- створити JSON schema;
- викликати `sendStructured()`;
- прочитати schema-constrained output;
- проєктувати schemas, які mobile models можуть стабільно виконувати;
- обробляти validation errors і partial output.

## Basic example

```dart
final result = await session.sendStructured(
  'Extract the person name and age from: "John is 30 years old"',
  schema: {
    'type': 'object',
    'properties': {
      'name': {'type': 'string'},
      'age': {'type': 'integer'},
    },
    'required': ['name', 'age'],
  },
);

print(result);
```

Model output constrained до JSON, що відповідає provided schema.

## Коли використовувати structured output

Використовуйте `structured output`, коли app має programmatically consume model response.

Common examples:

- extraction fields з message;
- classification ticket;
- вибір local workflow;
- generation settings object;
- transformation unstructured text у form;
- повернення list detected entities.

Не використовуйте `structured output`, коли:

- user очікує conversational answer;
- output shape невідомий;
- task потребує tool calls;
- schema занадто complex і її краще розділити на smaller steps.

## Schema design

Тримайте schemas малими й явними. Mobile models надійніші, коли output shape простий.

Рекомендовано:

```dart
final schema = {
  'type': 'object',
  'properties': {
    'category': {
      'type': 'string',
      'enum': ['billing', 'technical', 'account', 'other'],
    },
    'priority': {
      'type': 'string',
      'enum': ['low', 'normal', 'high'],
    },
    'summary': {
      'type': 'string',
    },
  },
  'required': ['category', 'priority', 'summary'],
};
```

Уникайте:

```dart
final schema = {
  'type': 'object',
  'properties': {
    'everything': {'type': 'object'},
  },
};
```

Друга schema занадто vague. Вона не пояснює model, які fields корисні.

## Production-style extraction

```dart
class TicketClassifier {
  TicketClassifier(this.session);

  final ChatSession session;

  Future<Map<String, dynamic>> classify(String ticketText) async {
    final result = await session.sendStructured(
      '''
Classify this support ticket.
Use only the categories from the schema.

Ticket:
$ticketText
''',
      schema: {
        'type': 'object',
        'properties': {
          'category': {
            'type': 'string',
            'enum': ['billing', 'technical', 'account', 'other'],
          },
          'priority': {
            'type': 'string',
            'enum': ['low', 'normal', 'high'],
          },
          'needs_human_review': {'type': 'boolean'},
          'summary': {'type': 'string'},
        },
        'required': [
          'category',
          'priority',
          'needs_human_review',
          'summary',
        ],
      },
    );

    return result.json as Map<String, dynamic>;
  }
}
```

Перевірте exact result object fields у generated API reference для вашої installed SDK version. Деякі versions expose-ять parsed JSON напряму; інші можуть expose-ити і raw text, і parsed value.

## Validation modes

Edge Veda підтримує grammar-constrained generation для structured JSON. Залежно від SDK version, validation може працювати у strict або standard mode.

Рекомендована product behavior:

| Case | Behavior |
| --- | --- |
| Strict validation succeeds | Використовуйте parsed JSON. |
| Standard validation succeeds | Використовуйте parsed JSON і, за потреби, log-уйте validation warning. |
| JSON recovery was required | Використовуйте лише якщо product приймає recovered output. |
| Validation fails | Попросіть user retry або переведіть на manual review. |

Не приймайте invalid JSON silently у workflows, які trigger-ять actions або write data.

## Prompting structured output

Навіть зі schema, `prompt` важливий. Скажіть model, що саме extract-ити і що не можна invent-ити.

Добрий `prompt`:

```text
Extract only facts explicitly present in the ticket. If a field is unknown, set needs_human_review to true.
```

Ризиковий `prompt`:

```text
Fill in the best values.
```

Ризиковий `prompt` заохочує guessing.

## Missing data

Краще додавати explicit uncertainty fields.

```dart
final schema = {
  'type': 'object',
  'properties': {
    'invoice_number': {'type': 'string'},
    'has_invoice_number': {'type': 'boolean'},
    'needs_human_review': {'type': 'boolean'},
  },
  'required': [
    'has_invoice_number',
    'needs_human_review',
  ],
};
```

Це робить downstream logic безпечнішою, ніж reliance on empty strings.

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Validation fails | Schema занадто complex або prompt ambiguous. | Розбийте task на smaller schemas. |
| Field missing | Field не required або model не могла infer-ити його. | Додайте `required` або uncertainty flag. |
| Model invents values | Prompt дозволяє guessing. | Скажіть model використовувати лише explicit input. |
| JSON too large | Schema просить забагато за один крок. | Extract-іть smaller set of fields. |
| Output cannot trigger action safely | Confidence або validation insufficient. | Вимагайте human review. |

## Privacy notes

`Structured output` часто використовується для user records, tickets, documents або local app data. Обробляйте input і parsed JSON як sensitive. Не log-уйте raw inputs і не persist-іть extracted fields, якщо product workflow цього не потребує.

## Next steps

- Використовуйте [`function-calling.md`](./function-calling.md) для tool-driven workflows.
- Використовуйте [`embeddings.md`](./embeddings.md), щоб retrieve-ити relevant local context перед extraction.
- Використовуйте [`chat-sessions.md`](./chat-sessions.md), щоб поєднати structured output із conversational flows.
