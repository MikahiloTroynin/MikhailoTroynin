---
title: "Workers and isolates"
description: "Як Edge Veda використовує persistent workers і Dart isolates, щоб AI workloads не блокували UI thread і повторно використовувалися між запитами."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
related:
  - "architecture.md"
  - "runtime-supervision.md"
---

# Workers and isolates

Workers — це довгоживучі execution units, які Edge Veda використовує для запуску дорогих AI workloads поза Flutter UI thread. У Dart це зазвичай isolates або isolate-like background execution contexts.

Worker model дозволяє моделі завантажитися один раз, залишатися доступною між requests, stream-ити results назад у app і бути supervised by runtime.

## Навіщо потрібні workers

AI workloads дорогі. Loading local model, generating tokens, transcribing audio, processing images або running diffusion можуть блокувати UI, якщо виконувати їх напряму в application code.

Workers вирішують кілька проблем:

- прибирають inference з UI thread;
- тримають model loaded між кількома requests;
- створюють lifecycle boundary для native resources;
- дозволяють progress і streaming events;
- дають Scheduler одиницю, яку можна supervise;
- роблять cancellation і disposal explicit.

Без workers застосунки часто repeated reload models і змішують UI logic із native runtime cleanup.

## Що таке isolate

Dart isolate — це independent execution context зі своєю memory. Він комунікує через messages, а не через direct shared mutable state.

Це важливо, бо AI worker може:

- receive initialization message;
- load model from local path;
- hold native handles;
- receive generation або transcription requests;
- stream partial results;
- report progress;
- receive cancellation commands;
- release native resources.

Worker краще сприймати як background actor зі state і lifecycle, а не як звичайний synchronous object.

## Persistent workers

Persistent worker залишається alive після завершення одного request. Це корисно, бо local model loading expensive.

Приклади:

- text worker loads language model once і обслуговує багато `generate()` або `generateStream()` calls;
- vision worker loads vision-language model once і process-ить багато camera frames;
- speech worker keeps transcription state across audio chunks;
- image worker loads diffusion model і generates кілька images before idle disposal.

Persistent workers покращують repeated request latency, але keep memory allocated. Runtime supervision вирішує, коли цей trade-off уже небезпечний.

## Worker lifecycle

![c-workers-and-isolates](mermaid-diagrams/c-workers-and-isolates.png)

Documentation має пояснювати, які SDK methods spawn worker, reuse його або dispose.

## Message types

| Message type | Direction | Purpose |
| --- | --- | --- |
| Init | Main → worker | Load model and configure native engine. |
| Request | Main → worker | Start generation, embedding, transcription або vision analysis. |
| Progress | Worker → main | Report tokens, audio chunks, diffusion steps або other progress. |
| Result | Worker → main | Return final output. |
| Error | Worker → main | Report failure. |
| Cancel | Main → worker | Stop active request. |
| Dispose | Main → worker | Release model resources and stop worker. |

Large payloads, наприклад image buffers або audio chunks, треба обробляти обережно, бо repeated copying може бути дорогим.

## Типи workers

### Text generation worker

Text worker loads language model і handles blocking або streaming generation.

Responsibilities:

- initialize model;
- apply prompt або chat templates;
- manage context settings;
- stream tokens;
- report generation metrics;
- clean up native resources.

### Vision worker

Vision worker process-ить images або camera frames. Він може потребувати model file і matching projector file.

### Speech worker

Speech worker handles speech-to-text workloads, accepts audio chunks, processes them і streams partial transcripts.

### Image generation worker

Image worker handles diffusion-based generation. Це memory-heavy workload, який може тривати багато секунд. Він має report progress, support cancellation і participate in runtime memory policies.

## Cancellation

Cancellation — частина worker contract. User може stop streaming response, leave screen, cancel image generation або interrupt transcription.

Safe cancellation flow:

1. app sends cancel message;
2. worker stops accepting more chunks for that request;
3. native inference interrupted if possible;
4. partial output returned або discarded according to feature logic;
5. worker returns to `Ready` або disposed;
6. app updates UI.

Cancellation не має залишати native handles у невідомому state.

## Error boundaries

Worker має convert native або runtime failures into documented errors.

Examples:

- model file missing;
- unsupported model format;
- initialization failed;
- out-of-memory pressure;
- permission denied;
- image buffer has wrong size;
- generation cancelled;
- native engine returned error code.

Errors мають допомагати developers, але не логувати sensitive prompts, images, audio або documents.

## Підсумок

Workers and isolates роблять Edge Veda practical for real Flutter apps. Вони прибирають inference з UI thread, дозволяють models stay loaded, підтримують streaming/progress events і дають runtime supervision конкретні units для schedule, cancel, evict і dispose.
