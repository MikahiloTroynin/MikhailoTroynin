---
title: "Architecture"
description: "A conceptual architecture overview of Edge Veda: Flutter SDK, sessions, workers, runtime supervision, FFI bindings, and native inference engines."
status: "draft"
section: "concepts"
locale: "en"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/lib/src/"
  - "core/"
---

# Architecture

Edge Veda is organized as a layered on-device AI runtime. A Flutter application calls high-level Dart APIs. Those APIs coordinate sessions, pipelines, persistent workers, runtime policies, telemetry, and native inference engines.

The architecture is designed for long-running local AI workloads. Instead of loading a model for every request, Edge Veda can keep workers alive, reuse model state, monitor device pressure, and degrade behavior when the device is under stress.

## High-level view

![c-architecture](mermaid-diagrams/c-architecture.png)

This structure separates product code from low-level runtime concerns. The app owns the user experience. Edge Veda owns the local AI execution layer.

## Main layers

### Flutter application layer

The Flutter app contains the screens, state management, permissions, user flows, and application-specific feature logic.

Examples:

- a chat screen;
- a document picker;
- a voice journal screen;
- a camera screen;
- a settings screen for model selection;
- a local knowledge-base feature.

The app should not need to know how native inference libraries allocate memory or how model workers are implemented. It should call the SDK and handle results, progress, errors, and lifecycle events.

### Dart SDK layer

The Dart SDK exposes the public API surface used by Flutter developers.

This layer includes concepts such as:

- `EdgeVeda` as a main entry point;
- configuration objects such as `EdgeVedaConfig`;
- generation methods;
- streaming generation methods;
- embedding methods;
- image description methods;
- image generation methods;
- memory and scheduler-related APIs;
- higher-level sessions and pipelines.

The SDK layer should provide stable, human-readable documentation because it is the main surface developers integrate with.

### Sessions and pipelines

Sessions and pipelines compose lower-level methods into application-ready workflows.

Examples:

- a chat session that manages history and templates;
- a speech session that streams transcription segments;
- a RAG pipeline that embeds, searches, injects, and generates;
- a tool-calling flow that validates model output against tool schemas;
- a model management flow that selects a compatible model for the current device.

Sessions and pipelines are useful because production features rarely call only one primitive method. They usually need state, validation, cancellation, and lifecycle behavior.

### Worker layer

Workers are long-lived execution units, usually implemented as isolates or background execution contexts. A worker can keep a model loaded across requests so that repeated calls do not pay the full loading cost every time.

Typical worker responsibilities:

- initialize a model;
- keep native handles alive;
- process requests away from the UI thread;
- stream partial results;
- dispose resources when idle or under pressure;
- report progress and errors;
- participate in runtime scheduling.

Worker examples include text streaming workers, vision workers, speech workers, and image generation workers.

### Runtime supervision layer

Runtime supervision is responsible for keeping local AI workloads sustainable on real devices.

This layer may include:

- central scheduling;
- budget profiles;
- quality-of-service levels;
- memory pressure handling;
- thermal-state handling;
- battery-aware policies;
- cross-worker eviction;
- frame backpressure;
- structured performance tracing.

The runtime supervision layer is important because multiple AI workloads may compete for the same device resources. For example, a voice journal may use speech recognition, summarization, and embeddings. A document Q&A app may use embeddings and text generation. A camera assistant may combine vision and text generation.

### FFI binding layer

The Dart SDK uses FFI to call native libraries. FFI is the bridge between Dart code and native C/C++ functions packaged for the target platform.

This layer is responsible for:

- loading the native dynamic library or framework;
- mapping Dart types to native types;
- passing model paths, buffers, and configuration;
- receiving generated text, embeddings, or status codes;
- converting native errors into Dart-level failure states.

Documentation for FFI internals is usually not required for every app developer, but it is important for contributors, maintainers, and advanced troubleshooting.

### Native inference layer

The native layer performs the actual model inference. It may wrap lower-level engines for text, vision, speech, and image generation.

Typical native responsibilities:

- load model files;
- initialize GPU acceleration where available;
- allocate inference buffers;
- run token generation;
- compute embeddings;
- process audio or image inputs;
- return native status information;
- clean up native resources.

Because this layer touches memory-intensive workloads, lifecycle and error handling are critical.

## Core architecture diagram

![c-architecture-2](mermaid-diagrams/c-architecture-2.png)

## Request lifecycle: text generation

A typical text generation request moves through the runtime like this:

![c-architecture-3](mermaid-diagrams/c-architecture-3.png)

For streaming, the app should render chunks as they arrive and allow cancellation.

## Request lifecycle: RAG

A RAG flow combines retrieval and generation.

![c-architecture-4](mermaid-diagrams/c-architecture-4.png)

The important architectural point is that RAG is not only text generation. It depends on embedding quality, chunking strategy, vector search, prompt construction, and answer validation.

## Request lifecycle: continuous vision

Continuous vision is different from one-time generation because it can produce unbounded work. A camera can send frames faster than a model can process them.

A safe vision architecture needs backpressure:

![c-architecture-5](mermaid-diagrams/c-architecture-5.png)

The queue should avoid growing forever. Under pressure, the runtime can drop frames, reduce resolution, lower frequency, or pause processing.

## Resource lifecycle

Model lifecycle is one of the most important parts of Edge Veda architecture.

![c-architecture-6](mermaid-diagrams/c-architecture-6.png)

Developers should understand whether a method:

- loads a model;
- reuses an existing worker;
- keeps memory allocated after the call;
- auto-disposes after inactivity;
- can be evicted under pressure;
- requires explicit cleanup.

## Concurrency model

On-device AI workloads are expensive. Running several at the same time can cause memory pressure, thermal throttling, and unpredictable latency.

Edge Veda’s architecture should be documented around these principles:

- do not block the UI thread;
- use workers for long-running inference;
- avoid unlimited queues;
- schedule competing workloads;
- degrade non-critical work first;
- expose backpressure rather than hiding it;
- keep cancellation and disposal predictable.

## Observability model

On-device AI needs local observability because many failures do not happen on a server.

Useful telemetry includes:

- model load time;
- first-token latency;
- tokens per second;
- memory state;
- thermal state;
- battery level;
- worker lifecycle events;
- dropped frame counts;
- scheduler decisions;
- validation events for structured output.

Documentation should help developers understand which signals are available and how to use them for debugging.

## Privacy boundary

The privacy boundary is the device. In the default architecture, prompts, documents, images, audio, embeddings, and generated output are processed locally.

However, developers must still review:

- app logging;
- crash reporting;
- analytics;
- optional cloud handoff;
- persistent vector indexes;
- local document cache;
- exported performance traces.

Local inference is not the same as automatic privacy compliance. It is a strong privacy foundation that still needs careful product decisions.

## Documentation implications

Because Edge Veda is a runtime, documentation should not describe only method signatures. It should also explain behavior over time.

For each capability, document:

- initialization requirements;
- model compatibility;
- worker lifecycle;
- memory behavior;
- streaming behavior;
- cancellation behavior;
- error states;
- platform support;
- privacy behavior;
- performance notes;
- troubleshooting.

## Summary

Edge Veda’s architecture combines a Flutter-facing SDK, higher-level sessions and pipelines, persistent worker isolates, runtime supervision, FFI bindings, and native inference engines.

The architecture is built for real on-device AI: local inference, long sessions, multiple modalities, privacy-first behavior, and sustained operation under device constraints.
