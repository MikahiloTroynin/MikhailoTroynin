---
title: "Structured output"
description: "Generate schema-constrained JSON with Edge Veda."
status: "draft"
section: "guides"
last_reviewed: "2026-04-30"
---

# Structured output

Structured output lets the model return JSON that matches a schema. Use `sendStructured()` when your app needs machine-readable data, not free-form prose: extraction, classification, routing, form filling, command generation, or UI configuration.

For natural language answers, use [`text-generation.md`](./text-generation.md) or [`chat-sessions.md`](./chat-sessions.md). For tool execution, use [`function-calling.md`](./function-calling.md).

## What you will build

This guide shows how to:

- create a JSON schema;
- call `sendStructured()`;
- read schema-constrained output;
- design schemas that mobile models can follow;
- handle validation errors and partial output.

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

The model output is constrained to JSON that matches the provided schema.

## When to use structured output

Use structured output when the app must consume the model response programmatically.

Common examples:

- extract fields from a message;
- classify a ticket;
- choose a local workflow;
- generate a settings object;
- transform unstructured text into a form;
- return a list of detected entities.

Avoid structured output when:

- the user expects a conversational answer;
- the output shape is unknown;
- the task requires tool calls;
- the schema is so complex that it should be split into smaller steps.

## Schema design

Keep schemas small and explicit. Mobile models are more reliable when the output shape is simple.

Recommended:

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

Avoid:

```dart
final schema = {
  'type': 'object',
  'properties': {
    'everything': {'type': 'object'},
  },
};
```

The second schema is too vague. It does not tell the model what fields are useful.

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

Check the exact result object fields in the generated API reference for your installed SDK version. Some versions expose the parsed JSON directly; others may expose both raw text and parsed value.

## Validation modes

Edge Veda supports grammar-constrained generation for structured JSON. Depending on the SDK version, validation may run in strict or standard mode.

Recommended product behavior:

| Case | Behavior |
| --- | --- |
| Strict validation succeeds | Use the parsed JSON. |
| Standard validation succeeds | Use the parsed JSON and optionally log a validation warning. |
| JSON recovery was required | Use only if your product accepts recovered output. |
| Validation fails | Ask the user to retry or fall back to manual review. |

Do not silently accept invalid JSON in workflows that trigger actions or write data.

## Prompting structured output

Even with a schema, the prompt still matters. Tell the model what to extract and what not to invent.

Good prompt:

```text
Extract only facts explicitly present in the ticket. If a field is unknown, set needs_human_review to true.
```

Risky prompt:

```text
Fill in the best values.
```

The risky prompt encourages guessing.

## Handling missing data

Prefer explicit uncertainty fields.

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

This makes downstream logic safer than relying on empty strings.

## Error handling

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Validation fails | Schema is too complex or prompt is ambiguous. | Split the task into smaller schemas. |
| Field is missing | Field is not required or model could not infer it. | Add `required` or an uncertainty flag. |
| Model invents values | Prompt allows guessing. | Tell the model to use only explicit input. |
| JSON is too large | Schema asks for too much at once. | Extract a smaller set of fields. |
| Output cannot trigger action safely | Confidence or validation is insufficient. | Require human review. |

## Privacy notes

Structured output is often used for user records, tickets, documents, or local app data. Treat both input and parsed JSON as sensitive. Avoid logging raw inputs and avoid persisting extracted fields unless the product workflow requires it.

## Next steps

- Use [`function-calling.md`](./function-calling.md) for tool-driven workflows.
- Use [`embeddings.md`](./embeddings.md) to retrieve relevant local context before extraction.
- Use [`chat-sessions.md`](./chat-sessions.md) to combine structured output with conversational flows.
