---
title: "Model management"
description: "Як думати про model selection, storage, loading, lifecycle і device-aware recommendations в Edge Veda."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
related:
  - "model-compatibility.md"
  - "quantization.md"
  - "runtime-supervision.md"
---

# Model management

Model management — це набір рішень і runtime behavior навколо selecting, storing, validating, loading, reusing і disposing local AI models.

В Edge Veda model — це не лише file path, переданий у `EdgeVedaConfig`. Вона впливає на app size, download flow, startup time, memory use, thermal behavior, battery use, privacy і user experience.

## Lifecycle

Model management охоплює весь lifecycle:

1. choose model for use case;
2. check whether device can run it;
3. confirm storage availability;
4. download або bundle model;
5. verify that file exists and is usable;
6. initialize correct worker або runtime path;
7. reuse model across requests;
8. dispose або evict when appropriate;
9. migrate або replace it during updates.

Кожен крок має бути visible у documentation і code.

## Model selection

Модель треба обирати для конкретної feature, а не тільки за benchmark rank.

| Use case | Selection concern |
| --- | --- |
| Chat | Instruction following, latency, context length. |
| Tool calling | JSON and function-call reliability. |
| Vision | Image understanding and projector compatibility. |
| Speech-to-text | Language support and chunk latency. |
| Embeddings | Vector dimension and retrieval quality. |
| Image generation | Memory use, generation time, sampler support. |

Менша модель, яка comfortably fits, часто дає кращий product experience, ніж більша model, яка barely runs.

## Device-aware recommendation

Edge Veda має концепцію Smart Model Advisor. Advisor recommends models based on device and use case.

Recommendation може враховувати:

- iPhone model;
- RAM або device tier;
- chip generation;
- storage availability;
- use case;
- context length;
- expected speed;
- expected quality;
- GPU acceleration availability.

Result варто трактувати як recommendation для конкретного device і feature, а не як universal model ranking.

## Fit checks

Перед download або loading model app має перевірити, чи вона likely fits.

Fit check відповідає:

- чи model too large for this device class?
- чи there is enough free storage?
- чи quantization matches target device?
- чи format matches capability?
- чи requested context length realistic?
- чи app should suggest smaller model?

Fit checks особливо важливі, коли users can choose models.

## Storage strategy

Models — large files, тому production app потребує storage strategy.

Options:

- bundle small default model with app;
- download models after installation;
- let users choose which models to download;
- cache models locally;
- remove unused models;
- keep separate models for chat, vision, speech, embeddings і image generation.

Documentation має включати expected model size, download source, target directory, failure behavior і storage-full behavior.

## Model paths

Edge Veda APIs потребують local paths до model files. Path має вказувати на file, доступний у app sandbox at runtime.

Common failures:

- file was not downloaded;
- path points to temporary location that was cleared;
- app cannot read file;
- extension або format wrong;
- model moved during update;
- vision model missing projector file.

Покажіть, звідки беруться paths і як validate them before initialization.

## Initialization

Model initialization може бути expensive, бо loads native resources і prepares worker.

Good flow:

1. validate configuration;
2. check file existence;
3. check compatibility;
4. spawn worker if needed;
5. load native model;
6. show loading state або progress;
7. return clear success або failure result.

Не ховайте long initialization за blank screen.

## Reuse, persistence, and eviction

Repeated model loading expensive. Edge Veda uses persistent workers, щоб models stay loaded across requests.

Reuse корисний для chat sessions, repeated summarization, continuous vision, streaming STT, repeated image generation і RAG queries over same index. Trade-off — memory. Idle workers may be evicted under memory pressure.

## Versioning and migration

Model updates можуть змінювати behavior. New version може мати інший tokenizer, template, context length, embedding dimension або output style.

Migration plan має визначати:

- model version naming;
- how installed versions are detected;
- whether old vector indexes remain valid;
- when app should redownload model;
- how rollback works.

Embedding models потребують особливої уваги: changing embedding model may require rebuilding vector index.

## Security and privacy

Local inference improves privacy, але model management still matters.

Consider:

- whether model downloads use trusted channels;
- whether files verified before use;
- whether prompts або traces are logged;
- whether vector indexes contain sensitive documents;
- whether generated content is stored;
- whether model paths reveal personal information.

## Підсумок

Model management з’єднує AI capability з production behavior. Він охоплює model choice, device fit, storage, loading, reuse, eviction, migration і privacy. В Edge Veda це частина feature design, а не hidden setup detail.
