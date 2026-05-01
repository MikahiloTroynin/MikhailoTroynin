---
title: "What is Edge Veda?"
description: "A conceptual overview of Edge Veda, a managed on-device AI runtime for Flutter applications."
status: "draft"
section: "concepts"
locale: "en"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
---

# What is Edge Veda?

Edge Veda is a managed on-device AI runtime for Flutter applications. It helps developers run AI capabilities such as text generation, streaming chat, vision, speech-to-text, text-to-speech, image generation, embeddings, and retrieval-augmented generation directly on supported devices.

The main idea behind Edge Veda is simple: an AI feature should not only run once in a demo. It should remain stable during real app usage, where the device has limited memory, changing thermal conditions, battery constraints, and long-running sessions.

Edge Veda is designed as a runtime layer between a Flutter app and local AI engines. The app calls a Dart SDK. The SDK coordinates persistent workers, native inference libraries, runtime policies, telemetry, and model-specific configuration.

## Why Edge Veda exists

Many on-device AI demos work well for a short prompt, a single image, or a small test file. Production applications are different. They may keep a model loaded for minutes, process camera frames repeatedly, stream tokens while the user is interacting with the UI, or combine multiple workloads such as speech recognition, embeddings, and text generation.

In these conditions, common problems appear:

- the device becomes hot and slows down;
- memory usage spikes and the operating system kills the app;
- the first request works, but the second or third request becomes unstable;
- developers cannot see what happened inside the runtime;
- unsupported model choices create poor latency or crashes;
- debugging requires knowledge of Flutter, native code, model formats, and device limits at the same time.

Edge Veda exists to make these scenarios more predictable. It provides a supervised runtime that manages long sessions, watches device pressure, and gives developers a single SDK surface for multiple local AI capabilities.

## What Edge Veda is

Edge Veda is:

- **a Flutter SDK** for building AI features in mobile and desktop Flutter apps;
- **a supervised runtime** that keeps local inference workloads under runtime policies;
- **a worker-based execution layer** that keeps models loaded across requests when possible;
- **a privacy-first AI stack** where inference is intended to run without cloud calls;
- **a bridge to native inference engines** through FFI and packaged native frameworks;
- **a documentation-friendly API surface** that exposes high-level methods such as text generation, embeddings, vision, image generation, memory checks, and scheduler configuration.

From an application developer’s perspective, Edge Veda should feel like a Flutter package. From a runtime perspective, it coordinates multiple lower-level systems: model files, worker isolates, native C/C++ engines, telemetry, runtime policies, and device-specific constraints.

## What Edge Veda is not

Edge Veda is not a cloud AI API wrapper. It is not primarily designed to send prompts to a remote LLM provider. Its core value is local inference and runtime management.

Edge Veda is also not only a thin binding around one model engine. The project combines several capabilities behind one runtime-oriented SDK. Text generation, vision, speech, embeddings, RAG, image generation, and model selection are treated as parts of the same on-device system.

Finally, Edge Veda is not a guarantee that every model will run well on every phone. Model size, quantization, context length, GPU support, memory pressure, and thermal state still matter. Edge Veda provides tools and policies to make these constraints visible and manageable, but developers still need to choose models that fit the target devices.

## Core capabilities

Edge Veda groups its capabilities around practical application scenarios.

### Text generation and chat

The SDK exposes APIs for generating text, streaming tokens, and building multi-turn chat flows. A model can stay loaded in a persistent worker so that repeated prompts do not require full reloads.

Typical use cases:

- local chat assistants;
- offline help and support flows;
- summarization;
- local reasoning over private notes;
- command interpretation for personal or IoT-style apps.

### Vision

Vision capabilities allow applications to describe images or camera frames using local vision-language models. This is useful for camera-based understanding, accessibility, inspection flows, or private image analysis.

Typical use cases:

- describe an image selected by the user;
- analyze camera frames continuously;
- build private visual assistants;
- combine image understanding with text generation.

### Speech-to-text and text-to-speech

Edge Veda includes a local voice pipeline: speech recognition, LLM processing, and speech output. Speech-to-text can use an on-device worker, while text-to-speech can use platform capabilities where available.

Typical use cases:

- voice journals;
- voice assistants;
- dictation;
- hands-free workflows;
- offline voice interfaces.

### Embeddings and RAG

The SDK supports embeddings and local vector search so an app can retrieve relevant local content before generation. This enables retrieval-augmented generation without sending user documents to a server.

Typical use cases:

- document Q&A;
- semantic search;
- personal knowledge bases;
- offline medical, legal, or productivity assistants;
- private search over local notes or files.

### Image generation

Edge Veda also includes on-device text-to-image generation through a dedicated image generation workflow. Because image generation is memory-intensive, it needs strong lifecycle and scheduling behavior.

Typical use cases:

- local creative tools;
- prototype image generation;
- privacy-sensitive visual generation;
- apps where prompts and outputs should stay on the device.

### Runtime supervision

Runtime supervision is the concept that makes Edge Veda different from a simple inference wrapper. The runtime can monitor device signals and apply policies when the device is under pressure.

Runtime supervision may include:

- thermal-aware behavior;
- memory-aware worker disposal;
- battery-aware quality-of-service levels;
- backpressure for continuous frame processing;
- tracing and debugging signals;
- scheduler-based arbitration of concurrent workloads.

## Where Edge Veda fits in an app

A typical Flutter application uses Edge Veda like this:

```text
Flutter UI
  ↓
Application feature code
  ↓
Edge Veda Dart SDK
  ↓
Sessions, pipelines, and workers
  ↓
Native inference engines and device runtime signals
```

The app does not need to directly control every native inference detail. Instead, it chooses a model, initializes the runtime, calls a capability, and handles the result.

For example, a simple text generation flow usually has these steps:

1. Add the Edge Veda package to the Flutter project.
2. Provide a compatible model file path.
3. Initialize `EdgeVeda` with an `EdgeVedaConfig`.
4. Call a generation method.
5. Render the response in the UI.
6. Dispose or reuse resources according to the app lifecycle.

## Private by default

The core Edge Veda model is local inference. Prompts, images, audio, embeddings, and retrieved documents are intended to be processed on the device. This helps when an app handles private user data, offline workflows, regulated content, or personal knowledge bases.

However, local inference does not remove all security responsibilities. Developers still need to think about:

- where model files are stored;
- whether prompts, transcripts, traces, or generated outputs are logged;
- whether the app syncs user files to another backend;
- whether crash reports include sensitive data;
- whether optional cloud handoff is used for low-confidence cases.

A good rule: treat on-device AI data as sensitive unless the user explicitly expects it to be shared.

## Supported platform direction

Edge Veda is primarily positioned around Flutter and currently focuses on iOS/macOS-style on-device acceleration with Metal GPU. Android support is part of the project direction, but platform support should always be checked against the current repository and release notes before promising production readiness.

When documenting platform behavior, be explicit:

- which platform was tested;
- which device class was used;
- which model was used;
- whether GPU acceleration was enabled;
- whether results are measured, estimated, or planned.

## Who should use Edge Veda?

Edge Veda is a strong fit for teams building:

- offline-first AI features;
- privacy-sensitive assistants;
- long-running on-device AI sessions;
- AI features inside Flutter apps;
- apps that combine text, voice, vision, and retrieval;
- prototypes that need a path toward production behavior.

It is less suitable when:

- the app requires the largest possible cloud models;
- all AI work must happen on a remote backend;
- the target devices are too weak for the selected model;
- the team cannot control model distribution or storage;
- latency requirements exceed what a local model can realistically provide.

## Key terms

| Term | Meaning |
| --- | --- |
| On-device AI | AI inference that runs on the user’s device instead of a remote server. |
| Runtime | The layer that coordinates model loading, execution, workers, policies, and resource handling. |
| Worker | A long-lived execution unit that can keep a model loaded and process requests without blocking the UI. |
| FFI | Foreign Function Interface; the mechanism used to call native libraries from Dart. |
| RAG | Retrieval-augmented generation; retrieving relevant content before asking the model to answer. |
| Scheduler | A runtime component that decides how workloads should run under memory, thermal, and battery constraints. |
| Telemetry | Runtime signals used for debugging and understanding performance behavior. |

## Summary

Edge Veda is a Flutter-oriented, on-device AI runtime for building local AI features that need more than a one-off demo. It combines high-level Dart APIs, persistent workers, native inference engines, model-aware configuration, and runtime supervision.

Use Edge Veda when you want AI features to stay private, run locally, and remain stable under real device constraints.
