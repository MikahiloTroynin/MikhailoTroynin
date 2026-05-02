---
title: "EdgeVeda.init()"
description: "Сторінка API reference для методу init() в Edge Veda Dart SDK."
status: "draft"
api_type: "method"
source_file: "flutter/lib/src/edge_veda_impl.dart"
last_reviewed: "2026-04-28"
reviewer: "AI draft — requires maintainer/SME review"
---

# `EdgeVeda.init()`

> Ініціалізує конфігурацію Edge Veda runtime і перевіряє, що вибрану on-device модель можна завантажити.

Використовуйте `init()` перед викликами text generation, embeddings або інших API, які залежать від core `EdgeVeda` runtime.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | `EdgeVeda` |
| Method | `init()` |
| Category | Core inference / Ініціалізація runtime |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в `edge_veda` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

```dart
import 'package:edge_veda/edge_veda.dart';
```

## Signature

```dart
Future<void> init(EdgeVedaConfig config);
```

## What it does

`init()` зберігає `EdgeVedaConfig` для SDK-інстансу та перевіряє, що модель із `config.modelPath` можна завантажити. Метод не генерує текст і не створює embeddings. Він валідовує конфігурацію, перевіряє наявність model file і запускає background-isolate load test проти native runtime.

Метод повертає `Future<void>` і завершується, коли SDK-інстанс готовий до наступних викликів: `generate()`, `generateStream()` та `embed()`.

## When to use it

Використовуйте `init()`, коли потрібно:

- підготувати `EdgeVeda` instance для text generation або embeddings;
- перевірити, що downloaded/imported GGUF model file може бути завантажений;
- застосувати runtime settings: context length, thread count, GPU usage, KV-cache configuration.

Не використовуйте цей метод, коли:

- інстанс уже ініціалізований; спочатку викличте `dispose()`, якщо треба переініціалізувати з іншою моделлю або конфігурацією;
- потрібно лише завантажити або імпортувати модель; для цього використовуйте `ModelManager`;
- потрібно ініціалізувати vision або image generation models — для них є окремі API.

## Prerequisites

Перед викликом методу переконайтесь, що:

- compatible model file існує за шляхом `config.modelPath`;
- застосунок має право читати model file з локального сховища;
- вибрана модель поміщається в memory budget цільового пристрою;
- застосунок вибирає реалістичний `contextLength` для цільового пристрою;
- GPU/Metal usage увімкнено лише там, де це підтримано й перевірено;
- застосунок обробляє model-load і memory-related failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| `config` | `EdgeVedaConfig` | Yes | — | Runtime configuration для ініціалізації SDK instance. | Має містити валідний `modelPath`. Інші поля керують threads, context length, GPU usage, memory budget, flash attention та KV-cache quantization. |

### `EdgeVedaConfig` fields

| Field | Type | Default | Description | Notes |
| --- | --- | --- | --- | --- |
| `modelPath` | `String` | Required | Шлях до локального GGUF model file. | Файл має існувати до виклику `init()`. |
| `numThreads` | `int` | `4` | Кількість CPU threads для inference. | Налаштовуйте під device class. |
| `contextLength` | `int` | `2048` | Максимальна довжина контексту в токенах. | Більші значення збільшують memory usage. |
| `useGpu` | `bool` | `true` | Увімкнення GPU acceleration там, де підтримано. | На iOS/macOS це зазвичай Metal. |
| `maxMemoryMb` | `int` | `1536` | Memory budget у MB. | На 4 GB devices використовуйте консервативні значення. |
| `verbose` | `bool` | `false` | Увімкнення verbose logging. | Корисно під час integration/debugging. |
| `flashAttn` | `int` | `-1` | Flash attention mode. | `-1` означає auto. |
| `kvCacheTypeK` | `int` | `8` | KV-cache quantization type for keys. | `1 = F16`, `8 = Q8_0`. |
| `kvCacheTypeV` | `int` | `8` | KV-cache quantization type for values. | `1 = F16`, `8 = Q8_0`. |

## Returns

`Future<void>`

Future завершується, коли SDK валідовує конфігурацію і підтверджує, що модель можна завантажити. Метод не повертає runtime handle, generated text, embeddings або model metadata.

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| `InitializationException` | `EdgeVeda` instance уже ініціалізований або native initialization завершується невідомою/обгорнутою помилкою. | Викличте `dispose()` перед reinitialize; залогуйте details і покажіть recovery message. |
| `ModelLoadException` | Model file не існує за `config.modelPath` або native runtime не може її завантажити. | Перевірте шлях через `ModelManager`, re-download/import модель або виберіть compatible model. |
| `ConfigurationException` | Конфігурація невалідна. | Перевірте context length, memory budget, thread count і GPU settings. |
| `MemoryException` | Model load перевищує memory budget. | Зменште `contextLength`, виберіть меншу модель або вимкніть дорогі опції. |
| `EdgeVedaException` | Typed SDK exception повертається з validation або native load testing. | Обробляйте за конкретним exception type, якщо можливо. |

## Minimal example

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));
```

## Production-style example

```dart
Future<EdgeVeda> createRuntime(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      numThreads: 4,
      useGpu: true,
      maxMemoryMb: 1536,
    ));

    return edgeVeda;
  } on ModelLoadException catch (error) {
    throw Exception('The local model could not be loaded: ${error.message}');
  } on InitializationException catch (error) {
    throw Exception('Edge Veda initialization failed: ${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: ${error.message}');
  }
}
```

## Streaming example

Не застосовується. `init()` не повертає stream. Після успішної ініціалізації використовуйте `generateStream()`.

## Behavior notes

- `init()` — entry point для core text/embedding runtime.
- Метод перевіряє model file path перед native initialization.
- Source implementation виконує background-isolate load test і звільняє test context після validation.
- Після завершення `init()` наступні text generation calls можуть використовувати persistent streaming worker.
- Повторний виклик `init()` на тому самому інстансі без `dispose()` — помилка.
- Vision і image generation мають окремі initialization paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Більші моделі збільшують load time, RAM usage і storage requirements. | Починайте з невеликої recommended chat model, наприклад 1B-class GGUF. |
| Context length | Більші context lengths збільшують KV-cache memory. | Використовуйте `2048` як практичний default; зменшуйте для low-memory devices. |
| GPU / Metal usage | GPU acceleration покращує throughput на supported Apple devices. | Залишайте `useGpu: true` на validated iOS/macOS targets; simulator і Android тестуйте окремо. |
| Memory budget | Завелике значення може ризикувати OS termination; замале — блокувати model loading. | Тримайте `maxMemoryMb` консервативним і перевіряйте на physical devices. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF LLM models | Yes | Для text generation та embeddings. Модель має бути compatible з native backend. |
| Whisper GGUF models | No for `init()` | Використовуйте Whisper-specific worker/session APIs. |
| Stable Diffusion models | No for `init()` | Використовуйте image generation initialization APIs. |
| Vision-language models | No for `init()` | Використовуйте `initVision()` / vision worker APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Metal GPU path — основний validated target. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте app sandbox і model file paths. |
| Android | Partial / validation pending | Вважайте scaffolded до перевірки на target devices. |
| Web | No | Native runtime і model loading не орієнтовані на web. |

## Privacy and security

- Input data processed: local model file path і runtime configuration.
- Network access during inference: none.
- Local storage used: model files.
- Sensitive data considerations: не логуйте повні локальні шляхи, якщо вони можуть розкривати user-specific directories або project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| `ModelLoadException: Model file not found` | `modelPath` вказує на missing/moved/not-yet-downloaded file. | Отримайте шлях через `ModelManager` і перевірте файл перед `init()`. |
| Initialization повільна на першому запуску | Модель перевіряється native runtime. | Покажіть loading state і тестуйте на physical device у release/profile mode. |
| Out-of-memory або OS termination | Model/context завеликий для пристрою. | Використайте меншу модель або зменште `contextLength` і `maxMemoryMb`. |
| Reinitialization fails | `init()` викликано двічі на тому самому instance. | Викличте `await edgeVeda.dispose()` перед reinitialize. |

## Related APIs

- [`EdgeVeda.generate()`](./generate.md) — повертає complete text generation response після initialization.
- [`EdgeVeda.generateStream()`](./generate-stream.md) — стрімить generated tokens після initialization.
- [`EdgeVeda.dispose()`](./dispose.md) — звільняє runtime resources перед reinitialization.
- [`ModelManager.downloadModel()`](../model-management/download-model.md) — отримує model files до initialization.

## Source references

- Source file: `flutter/lib/src/edge_veda_impl.dart`
- Public export file: `flutter/lib/edge_veda.dart`
- Generated Dart API: `EdgeVeda.init()`
- Example usage: `flutter/QUICKSTART.md`
- Related native API / FFI binding: native Edge Veda C bindings used by `evInit`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Перед публікацією перевірте:

- [ ] Signature відповідає current source code.
- [ ] `EdgeVedaConfig` defaults відповідають current `types.dart`.
- [ ] Production example компілюється.
- [ ] Platform notes відповідають current release.
- [ ] Error names відповідають typed exceptions.
- [ ] Model compatibility notes reviewed by maintainer.
