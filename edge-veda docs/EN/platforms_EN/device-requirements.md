---
title: "Device Requirements"
description: "Recommended device, memory, storage, GPU, and model-fit requirements for Edge Veda apps."
status: "draft"
section: "platforms"
last_reviewed: "2026-04-30"
---

# Device Requirements

Edge Veda runs AI models on the user's device. Device requirements are therefore part of the product design, not just installation details. Model size, memory pressure, thermal headroom, storage, and battery state directly affect the user experience.

Use this page to choose supported devices, set model defaults, and define production readiness criteria.

## Platform summary

| Platform | Recommended status | Notes |
| --- | --- | --- |
| iOS | Primary supported path | Use physical iPhone with Metal GPU for realistic results. |
| macOS | Development / desktop path | Best on Apple Silicon; validate current package support before shipping. |
| Android | Roadmap | Prepare architecture, but do not treat as production-ready until release validation. |
| Web | Planned / experimental direction | Browser inference has different constraints and is outside this page. |

## Recommended minimums

| Requirement | Minimum for experiments | Recommended for production-like tests | Notes |
| --- | --- | --- | --- |
| RAM | 4 GB | 6 GB+ | More RAM allows larger models and longer context. |
| Storage | 2 GB free | 5–10 GB free | Model files, indexes, and traces can be large. |
| GPU | Metal-capable Apple GPU on Apple platforms | Metal GPU with physical device testing | Simulator is not representative. |
| CPU | Modern mobile or Apple Silicon CPU | Recent iPhone or Apple Silicon Mac | CPU fallback is slower and can heat the device. |
| Battery | Any | Test at low and normal battery levels | Battery policy can affect scheduling and throttling. |
| Thermal state | Cool start | Sustained long-session testing | Thermal throttling can change output speed. |
| Network | Not required for inference | Optional for model download only | Offline inference should still work after model setup. |

## iOS device guidance

| Device tier | Example devices | Recommended use |
| --- | --- | --- |
| Low | Older iPhones with limited RAM | UI tests, small text models, short prompts. |
| Medium | iPhone 12 / 13 class devices | Basic chat, embeddings, small STT, small vision tests. |
| High | iPhone 14 / 15 class devices | Streaming chat, RAG, vision, longer sessions. |
| Ultra | Recent Pro devices | Heavier multimodal demos and longer sustained workloads. |

For first production-like validation, use a physical iPhone with at least 4 GB RAM. Prefer newer devices when testing vision, speech, or image generation.

## macOS device guidance

| Device tier | Recommended use |
| --- | --- |
| Apple Silicon MacBook Air | Development, small models, basic benchmark runs. |
| Apple Silicon MacBook Pro | Longer benchmarks, larger context, RAG indexing, multimodal tests. |
| Apple desktop with Apple Silicon | Internal tools, long-running tests, local model preparation. |
| Intel Mac | Only after explicit validation; performance and binary support may differ. |

macOS is useful for development, but it should not replace testing on real mobile hardware.

## Android device guidance

Android support is roadmap-oriented. When Android builds are available, expect to validate across multiple devices.

| Device tier | Expected recommendation |
| --- | --- |
| Low-end Android | Not recommended for early support. |
| Mid-range Android with 6 GB RAM | Small models and basic demos. |
| High-end Android with 8 GB+ RAM | Better target for production-like testing. |
| Emulator | Build and UI checks only; not representative for inference. |

Document exact supported Android versions, ABIs, and chipsets only after Android support is released and tested.

## Model fit guidance

Model size is the main driver of memory, storage, and thermal behavior.

| Model type | Typical use | Device guidance |
| --- | --- | --- |
| 0.5B–0.7B text model | Tool calling, simple chat, fast responses | Good first mobile default. |
| 1B text model | General chat and documentation assistance | Recommended starting point for iPhone tests. |
| 3B text model | Better quality, higher memory cost | Requires stronger devices and careful context limits. |
| Whisper tiny / small | STT demos and voice pipeline | Validate chunk latency and microphone flow. |
| Small VLM | Vision question answering | Requires frame backpressure and thermal testing. |
| Stable Diffusion-class model | Image generation | Heavy workload; memory and idle eviction are critical. |
| Embedding model | RAG and semantic search | Validate vector dimension, index size, and persistence. |

## Context length and memory

Longer context improves conversation continuity but increases memory use. For mobile apps:

- start with a conservative context length;
- summarize older chat turns when context grows;
- keep RAG excerpts short and relevant;
- avoid injecting full documents into prompts;
- expose model and context choices as configuration, not hardcoded values;
- measure memory after the third or fourth prompt, not only after initialization.

Example configuration:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
);
```

Increase `contextLength` only after validating memory and latency on the target device tier.

## Storage requirements

Apps using Edge Veda should explain local storage usage to users.

| Asset | Storage impact | Notes |
| --- | --- | --- |
| Text model | Hundreds of MB to several GB | Depends on parameter count and quantization. |
| STT model | Tens to hundreds of MB | Whisper variants differ significantly. |
| Vision model | Hundreds of MB or more | Also requires memory for image/frame processing. |
| Image generation model | Several GB possible | Avoid bundling unless distribution is controlled. |
| Vector index | Small to large | Depends on document count and embedding dimension. |
| Traces / telemetry | Usually small | Rotate or disable detailed traces in production. |

Recommended app behavior:

- show model size before download;
- verify free space before download;
- support cancel and retry;
- checksum downloaded model files;
- allow users to remove local models;
- avoid storing sensitive prompts in traces.

## Thermal and battery requirements

On-device AI is a sustained workload. A model that works for one prompt may degrade after several minutes.

Test:

- cold start;
- 5-minute session;
- 15-minute session;
- 30-minute session for long-running features;
- low-battery state;
- device charging and not charging;
- background/foreground transitions;
- camera + vision workloads;
- voice pipeline workloads;
- image generation idle eviction.

Use runtime policy and scheduler configuration to degrade gracefully instead of crashing.

## Concurrency guidance

Avoid enabling every modality at once on the same device tier.

| Workload combination | Risk | Recommendation |
| --- | --- | --- |
| Text generation + embeddings | Medium | Usually acceptable with small models and short RAG context. |
| Text generation + STT | Medium / high | Use chunking and backpressure. |
| Vision + text generation | High | Drop frames; do not queue indefinitely. |
| Image generation + chat | Very high | Prefer single heavy workload at a time. |
| RAG indexing + generation | High | Schedule indexing separately or lower its priority. |

## Device qualification checklist

Use this checklist before listing a device as supported:

- [ ] App installs from a clean build.
- [ ] Model downloads or imports successfully.
- [ ] `EdgeVeda.init()` succeeds.
- [ ] First prompt completes.
- [ ] Streaming works without freezing UI.
- [ ] Long session completes without crash.
- [ ] Memory stays within the documented budget.
- [ ] Thermal pressure is observed and handled.
- [ ] Low-memory behavior is graceful.
- [ ] Offline inference works after model setup.
- [ ] Permission denial does not break the app.
- [ ] User can remove or replace model files.
- [ ] Logs do not contain sensitive user input.

## Recommended benchmark report format

```text
Platform:
Device:
OS version:
App version:
Edge Veda version:
Model:
Quantization:
Context length:
GPU enabled:
Workload:
Session length:
Time to first token:
Tokens per second:
Peak memory:
Steady-state memory:
Thermal events:
Battery change:
Crashes:
Notes:
```

Use the same format across iOS, macOS, and future Android results.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Model does not fit | Model too large or context too long | Use a smaller model or lower context length. |
| First prompt is slow | Model loading or prompt evaluation | Show progress and reuse loaded workers. |
| Later prompts slow down | Thermal throttling | Reduce workload, lower priority, or pause heavy features. |
| App crashes after several minutes | Memory pressure | Enable idle worker eviction and reduce concurrency. |
| RAG responses are slow | Large index or too many retrieved chunks | Limit top-k results and shorten injected context. |
| STT lags | Chunk size or model too heavy | Use a smaller STT model or tune chunking. |
| Vision freezes UI | Frames are queued faster than processed | Use backpressure and drop frames. |
| Storage fills up | Large models and traces | Add model removal UI and trace rotation. |

## Related docs

- `./ios.md`
- `./macos.md`
- `./android-roadmap.md`
- `../guides/model-advisor.md`
- `../guides/model-manager.md`
- `../guides/scheduler-and-budgets.md`
- `../guides/memory-management.md`
- `../guides/performance-tuning.md`
- `../guides/production-readiness.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- iOS quickstart: `https://github.com/ramanujammv1988/edge-veda/blob/main/flutter/QUICKSTART.md`
- Releases: `https://github.com/ramanujammv1988/edge-veda/releases`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
