---
title: "Privacy and offline inference"
description: "Як Edge Veda виконує inference локально by default і що developers мають документувати про data, storage, logs і optional cloud handoff."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
  - "examples/"
related:
  - "embeddings-and-rag.md"
  - "function-calling.md"
  - "observability.md"
---

# Privacy and offline inference

`Privacy` і `offline inference` — core concepts Edge Veda. Runtime спроєктований так, щоб text, vision, speech, embeddings, RAG і image generation могли виконуватися локально на пристрої користувача.

Local inference може зменшити data exposure, підтримати offline workflows і дати користувачу більше control. Але він не робить застосунок приватним автоматично. Developers усе одно мають обережно працювати зі storage, logs, crash reports, permissions, model files і optional cloud fallback.

## Що означає offline inference

`Offline inference` означає, що model працює на device без network request під час inference.

Local inference path може включати:

- local model files;
- local native inference engine;
- local workers;
- local vector index;
- local prompt construction;
- local generation;
- local output rendering.

Застосунок усе ще може потребувати network для model download, app updates, account sync або optional cloud fallback. Це треба документувати окремо.

## Private by default

`Private by default` означає, що default AI path не надсилає prompts, images, audio, embeddings або documents до remote service під час inference.

Це важливо для:

- personal notes;
- medical documents;
- legal documents;
- enterprise files;
- voice recordings;
- photos;
- smart home commands;
- offline work environments.

Користувач не має перевіряти network traffic, щоб зрозуміти, чи його data залишають device.

## Data types

Документуйте кожен тип data, який обробляє AI feature.

| Data type | Privacy concern |
| --- | --- |
| Prompt text | Може містити personal або business information. |
| Retrieved documents | Може містити sensitive source content. |
| Embeddings | Представляють private text і мають вважатися sensitive. |
| Vector index | Може розкривати document structure і semantic content. |
| Audio | Може містити voice identity і private speech. |
| Images | Може містити faces, documents, locations або screens. |
| Tool arguments | Може містити file paths, IDs, names або commands. |
| Generated output | Може summarize або expose private source data. |

Не вважайте embeddings harmless лише тому, що це vectors.

## Local storage

Local inference часто зберігає data on device.

Потенційно локально зберігаються:

- model files;
- downloaded model cache;
- vector index;
- document chunks;
- generated summaries;
- transcripts;
- traces;
- configuration files;
- temporary image або audio buffers.

Documentation має пояснювати, що зберігається, де, коли видаляється і чи user може clear it.

## Logs and traces

Logs — частий privacy risk.

Не логувати:

- full prompts;
- full documents;
- transcripts;
- private images;
- raw embeddings;
- generated sensitive output;
- unredacted tool arguments.

Краще логувати metadata:

- token count;
- text length;
- model ID;
- request ID;
- pressure state;
- error category;
- timing.

Якщо є diagnostic export, потрібен redacted export mode.

## Permissions

Offline AI features можуть потребувати platform permissions.

Приклади:

- microphone для speech-to-text;
- camera для vision;
- file access для document Q&A;
- photo library access для image analysis;
- local network access для smart home tools.

Permissions треба запитувати лише коли вони потрібні, і пояснювати user-facing language.

## Optional cloud handoff

Деякі apps можуть підтримувати cloud handoff, коли local model uncertain, unsupported або too small for task.

Cloud handoff має бути explicit.

Рекомендовані правила:

- never send private data silently;
- ask user before sending local content;
- explain what will be sent;
- explain which service will process it;
- allow user to cancel;
- keep local-only mode available;
- record handoff decision in privacy documentation.

Confidence signal може рекомендувати handoff, але не має обходити user consent.

## Function calling privacy

`Function calling` може expose private app state, якщо tools не scoped correctly.

Захищайте tool calls так:

- register only allowed tools;
- validate arguments;
- check permissions;
- limit tool result size;
- redact sensitive results;
- require confirmation for side effects;
- separate read-only tools from write або external-action tools.

Model не має отримувати більше private data, ніж потрібно.

## RAG privacy

`RAG` зберігає і retrieves local document chunks. Тому privacy documentation критично важлива.

Document:

- які files indexed;
- чи user chooses files manually;
- where index is stored;
- whether chunks are stored with vectors;
- how to delete index;
- whether embeddings regenerated after model changes;
- whether retrieved context is ever sent outside device.

## Threat model

Простий privacy threat model допомагає document risk.

Питання:

- яка private data входить в AI feature?
- де вона stored?
- що logged?
- що can be exported?
- що відбувається during crash reporting?
- чи інший user на device може access it?
- чи cloud fallback може receive it?
- як data deleted?

## Checklist документації

Для кожної AI feature документуйте:

- whether inference runs offline;
- whether network access is required;
- data types processed;
- local storage used;
- deletion behavior;
- permissions required;
- logging policy;
- crash reporting policy;
- cloud handoff behavior;
- user controls;
- known privacy limitations.

## Підсумок

Edge Veda дає strong privacy foundation завдяки local і offline inference by default. Developers усе одно мають чітко документувати data handling, storage, logs, permissions і cloud handoff, щоб user розумів, куди потрапляють його data.
