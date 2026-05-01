---
title: "Privacy and offline inference"
description: "How Edge Veda keeps inference local by default and what developers must document about data, storage, logs, and optional cloud handoff."
status: "draft"
section: "concepts"
locale: "en"
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

Privacy and offline inference are core Edge Veda concepts. The runtime is designed so text, vision, speech, embeddings, RAG, and image generation can run locally on the user’s device.

Local inference can reduce data exposure, support offline workflows, and give users more control. It does not automatically make an app private. Developers still need to handle storage, logs, crash reports, permissions, model files, and optional cloud fallback carefully.

## What offline inference means

Offline inference means the model runs on the device without requiring a network request during inference.

A local inference path may include:

- local model files;
- local native inference engine;
- local workers;
- local vector index;
- local prompt construction;
- local generation;
- local output rendering.

The app may still need network for model download, app updates, account sync, or optional cloud fallback. These should be documented separately.

## Private by default

Private by default means the default AI path does not send prompts, images, audio, embeddings, or documents to a remote service during inference.

This is important for:

- personal notes;
- medical documents;
- legal documents;
- enterprise files;
- voice recordings;
- photos;
- smart home commands;
- offline work environments.

The user should not need to inspect traffic to know whether their data leaves the device.

## Data types

Document every type of data processed by an AI feature.

| Data type | Privacy concern |
| --- | --- |
| Prompt text | May contain personal or business information. |
| Retrieved documents | May contain sensitive source content. |
| Embeddings | Represent private text and should be treated as sensitive. |
| Vector index | Can reveal document structure and semantic content. |
| Audio | May contain voice identity and private speech. |
| Images | May contain faces, documents, locations, or screens. |
| Tool arguments | May include file paths, IDs, names, or commands. |
| Generated output | May summarize or expose private source data. |

Do not treat embeddings as harmless just because they are vectors.

## Local storage

Local inference often stores data on device.

Potential local storage:

- model files;
- downloaded model cache;
- vector index;
- document chunks;
- generated summaries;
- transcripts;
- traces;
- configuration files;
- temporary image or audio buffers.

Documentation should say what is stored, where it is stored, when it is deleted, and whether the user can clear it.

## Logs and traces

Logs are a common privacy risk.

Do not log:

- full prompts;
- full documents;
- transcripts;
- private images;
- raw embeddings;
- generated sensitive output;
- unredacted tool arguments.

Prefer logging metadata:

- token count;
- text length;
- model ID;
- request ID;
- pressure state;
- error category;
- timing.

If diagnostic export exists, provide a redacted export mode.

## Permissions

Offline AI features may require platform permissions.

Examples:

- microphone for speech-to-text;
- camera for vision;
- file access for document Q&A;
- photo library access for image analysis;
- local network access for smart home tools.

Permissions should be requested only when needed and explained in user-facing language.

## Optional cloud handoff

Some apps may support cloud handoff when the local model is uncertain, unsupported, or too small for a task.

Cloud handoff must be explicit.

Recommended rules:

- never send private data silently;
- ask the user before sending local content;
- explain what will be sent;
- explain which service will process it;
- allow the user to cancel;
- keep local-only mode available;
- record the handoff decision in privacy documentation.

A confidence signal can recommend handoff, but it should not bypass user consent.

## Function calling privacy

Function calling can expose private app state if tools are not scoped correctly.

Protect tool calls by:

- registering only allowed tools;
- validating arguments;
- checking permissions;
- limiting tool result size;
- redacting sensitive results;
- requiring confirmation for side effects;
- separating read-only tools from write or external-action tools.

The model should not receive more private data than it needs.

## RAG privacy

RAG stores and retrieves local document chunks. This makes privacy documentation essential.

Document:

- which files are indexed;
- whether the user chooses files manually;
- where the index is stored;
- whether chunks are stored with vectors;
- how to delete an index;
- whether embeddings are regenerated after model changes;
- whether retrieved context is ever sent outside the device.

## Threat model

A simple privacy threat model helps developers document risk.

Questions:

- What private data enters the AI feature?
- Where is it stored?
- What is logged?
- What can be exported?
- What happens during crash reporting?
- Can another user on the device access it?
- Can a cloud fallback receive it?
- How is data deleted?

## Documentation checklist

For each AI feature, document:

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

## Summary

Edge Veda gives apps a strong privacy foundation by running inference locally and offline by default. Developers still need to document data handling, storage, logs, permissions, and cloud handoff clearly so users understand where their data goes.
