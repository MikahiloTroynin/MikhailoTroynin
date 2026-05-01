---
title: "Device Requirements"
description: "Рекомендовані device, memory, storage, GPU і model-fit requirements для Edge Veda apps."
status: "draft"
section: "platforms"
last_reviewed: "2026-04-30"
---

# Device Requirements

Edge Veda запускає AI models на пристрої користувача. Тому device requirements — це частина product design, а не просто installation details. Model size, memory pressure, thermal headroom, storage і battery state напряму впливають на user experience.

Використовуйте цей документ, щоб обрати supported devices, задати model defaults і визначити production readiness criteria.

## Platform summary

| Platform | Recommended status | Нотатки |
| --- | --- | --- |
| iOS | Primary supported path | Використовуйте physical iPhone з Metal GPU для реалістичних результатів. |
| macOS | Development / desktop path | Найкраще на Apple Silicon; перед shipping перевірте current package support. |
| Android | Roadmap | Готуйте architecture, але не вважайте production-ready до release validation. |
| Web | Planned / experimental direction | Browser inference має інші constraints і не покривається цим документом. |

## Recommended minimums

| Requirement | Minimum for experiments | Recommended for production-like tests | Нотатки |
| --- | --- | --- | --- |
| RAM | 4 GB | 6 GB+ | Більше RAM дозволяє larger models і longer context. |
| Storage | 2 GB free | 5–10 GB free | Model files, indexes і traces можуть бути великими. |
| GPU | Metal-capable Apple GPU на Apple platforms | Metal GPU з physical device testing | Simulator не є репрезентативним. |
| CPU | Modern mobile або Apple Silicon CPU | Recent iPhone або Apple Silicon Mac | CPU fallback повільніший і може нагрівати device. |
| Battery | Будь-який | Тестувати на low і normal battery levels | Battery policy може впливати на scheduling і throttling. |
| Thermal state | Cool start | Sustained long-session testing | Thermal throttling може змінити output speed. |
| Network | Не потрібен для inference | Optional тільки для model download | Offline inference має працювати після model setup. |

## iOS device guidance

| Device tier | Example devices | Recommended use |
| --- | --- | --- |
| Low | Older iPhones з limited RAM | UI tests, small text models, short prompts. |
| Medium | iPhone 12 / 13 class devices | Basic chat, embeddings, small STT, small vision tests. |
| High | iPhone 14 / 15 class devices | Streaming chat, RAG, vision, longer sessions. |
| Ultra | Recent Pro devices | Heavier multimodal demos і longer sustained workloads. |

Для першої production-like validation використовуйте physical iPhone з мінімум 4 GB RAM. Для vision, speech або image generation краще брати newer devices.

## macOS device guidance

| Device tier | Recommended use |
| --- | --- |
| Apple Silicon MacBook Air | Development, small models, basic benchmark runs. |
| Apple Silicon MacBook Pro | Longer benchmarks, larger context, RAG indexing, multimodal tests. |
| Apple desktop with Apple Silicon | Internal tools, long-running tests, local model preparation. |
| Intel Mac | Тільки після explicit validation; performance і binary support можуть відрізнятись. |

macOS корисний для development, але не замінює testing на реальному mobile hardware.

## Android device guidance

Android support зараз roadmap-oriented. Коли Android builds стануть доступними, потрібна validation на кількох devices.

| Device tier | Expected recommendation |
| --- | --- |
| Low-end Android | Не рекомендовано для early support. |
| Mid-range Android with 6 GB RAM | Small models і basic demos. |
| High-end Android with 8 GB+ RAM | Кращий target для production-like testing. |
| Emulator | Лише build і UI checks; не репрезентативний для inference. |

Точні supported Android versions, ABIs і chipsets треба документувати тільки після release і testing Android support.

## Model fit guidance

Model size — головний фактор memory, storage і thermal behavior.

| Model type | Typical use | Device guidance |
| --- | --- | --- |
| 0.5B–0.7B text model | Tool calling, simple chat, fast responses | Добрий перший mobile default. |
| 1B text model | General chat і documentation assistance | Рекомендований старт для iPhone tests. |
| 3B text model | Краща quality, вища memory cost | Потрібні stronger devices і careful context limits. |
| Whisper tiny / small | STT demos і voice pipeline | Перевіряйте chunk latency і microphone flow. |
| Small VLM | Vision question answering | Потрібні frame backpressure і thermal testing. |
| Stable Diffusion-class model | Image generation | Heavy workload; critical memory і idle eviction. |
| Embedding model | RAG і semantic search | Перевіряйте vector dimension, index size і persistence. |

## Context length і memory

Longer context покращує conversation continuity, але збільшує memory use. Для mobile apps:

- починайте з conservative context length;
- summarized older chat turns, коли context grows;
- тримайте RAG excerpts короткими й релевантними;
- не inject-те full documents у prompts;
- expose-те model і context choices як configuration, а не hardcoded values;
- міряйте memory після третього або четвертого prompt, а не тільки після initialization.

Приклад configuration:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
);
```

Збільшуйте `contextLength` тільки після validation memory і latency на target device tier.

## Storage requirements

Apps з Edge Veda мають пояснювати local storage usage користувачам.

| Asset | Storage impact | Нотатки |
| --- | --- | --- |
| Text model | Сотні MB або кілька GB | Залежить від parameter count і quantization. |
| STT model | Десятки або сотні MB | Whisper variants суттєво відрізняються. |
| Vision model | Сотні MB або більше | Також потребує memory для image/frame processing. |
| Image generation model | Може бути кілька GB | Не bundlе-те без контрольованого distribution. |
| Vector index | Від малого до великого | Залежить від document count і embedding dimension. |
| Traces / telemetry | Зазвичай малий обсяг | Rotate або disable detailed traces у production. |

Рекомендована app behavior:

- показувати model size перед download;
- перевіряти free space перед download;
- підтримувати cancel і retry;
- перевіряти checksum downloaded model files;
- дозволяти users видаляти local models;
- не зберігати sensitive prompts у traces.

## Thermal і battery requirements

On-device AI — це sustained workload. Model, що працює для одного prompt, може деградувати після кількох хвилин.

Тестуйте:

- cold start;
- 5-minute session;
- 15-minute session;
- 30-minute session для long-running features;
- low-battery state;
- device charging і not charging;
- background/foreground transitions;
- camera + vision workloads;
- voice pipeline workloads;
- image generation idle eviction.

Використовуйте runtime policy і scheduler configuration, щоб degrade gracefully, а не crash.

## Concurrency guidance

Не вмикайте всі modalities одночасно на одному device tier.

| Workload combination | Risk | Recommendation |
| --- | --- | --- |
| Text generation + embeddings | Medium | Зазвичай прийнятно з small models і short RAG context. |
| Text generation + STT | Medium / high | Використовуйте chunking і backpressure. |
| Vision + text generation | High | Drop frames; не queue indefinitely. |
| Image generation + chat | Very high | Краще один heavy workload за раз. |
| RAG indexing + generation | High | Schedule indexing separately або lower priority. |

## Device qualification checklist

Використовуйте цей checklist перед тим, як назвати device supported:

- [ ] App installs from clean build.
- [ ] Model downloads або imports successfully.
- [ ] `EdgeVeda.init()` succeeds.
- [ ] First prompt completes.
- [ ] Streaming works без UI freeze.
- [ ] Long session completes без crash.
- [ ] Memory stays within documented budget.
- [ ] Thermal pressure observed і handled.
- [ ] Low-memory behavior graceful.
- [ ] Offline inference works після model setup.
- [ ] Permission denial не ламає app.
- [ ] User може remove або replace model files.
- [ ] Logs не містять sensitive user input.

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

Використовуйте той самий format для iOS, macOS і майбутніх Android results.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Model не поміщається | Model too large або context too long | Використайте smaller model або lower context length. |
| First prompt повільний | Model loading або prompt evaluation | Показуйте progress і reuse loaded workers. |
| Later prompts slowing down | Thermal throttling | Зменшіть workload, lower priority або pause heavy features. |
| App crashes після кількох хвилин | Memory pressure | Увімкніть idle worker eviction і reduce concurrency. |
| RAG responses slow | Large index або too many retrieved chunks | Обмежте top-k results і shorten injected context. |
| STT lags | Chunk size або model too heavy | Використайте smaller STT model або tune chunking. |
| Vision freezes UI | Frames queued faster than processed | Використайте backpressure і drop frames. |
| Storage fills up | Large models і traces | Додайте model removal UI і trace rotation. |

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
