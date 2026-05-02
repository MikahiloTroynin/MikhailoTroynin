// Auto-generated API docs content
window.API_DOCS = {
  methods: [
    { slug: "init", method: "EdgeVeda.init()", hasUa: true, hasEn: true },
    { slug: "generate", method: "EdgeVeda.generate()", hasUa: true, hasEn: true },
    { slug: "generate-stream", method: "EdgeVeda.generateStream()", hasUa: true, hasEn: true },
    { slug: "embed", method: "EdgeVeda.embed()", hasUa: true, hasEn: true },
    { slug: "embed-batch", method: "EdgeVeda.embedBatch()", hasUa: true, hasEn: true },
    { slug: "describe-image", method: "EdgeVeda.describeImage()", hasUa: true, hasEn: true },
    { slug: "generate-image", method: "EdgeVeda.generateImage()", hasUa: true, hasEn: true },
    { slug: "generate-image-raw", method: "EdgeVeda.generateImageRaw()", hasUa: true, hasEn: true },
    { slug: "init-vision", method: "EdgeVeda.initVision()", hasUa: true, hasEn: true },
    { slug: "init-image-generation", method: "EdgeVeda.initImageGeneration()", hasUa: false, hasEn: true },
    { slug: "dispose", method: "EdgeVeda.dispose()", hasUa: true, hasEn: true },
    { slug: "dispose-vision", method: "EdgeVeda.disposeVision()", hasUa: true, hasEn: true },
    { slug: "dispose-image-generation", method: "EdgeVeda.disposeImageGeneration()", hasUa: true, hasEn: true },
    { slug: "get-memory-stats", method: "EdgeVeda.getMemoryStats()", hasUa: true, hasEn: true },
    { slug: "is-memory-pressure", method: "EdgeVeda.isMemoryPressure()", hasUa: true, hasEn: true },
    { slug: "set-scheduler", method: "EdgeVeda.setScheduler()", hasUa: true, hasEn: true },
  ],
  content: {}
};

window.API_DOCS.content["init_en"] = `# \`EdgeVeda.init()\`

> Initializes the Edge Veda runtime configuration and verifies that the selected on-device model can be loaded.

Use \`init()\` before calling text generation, embeddings, or other APIs that depend on the core \`EdgeVeda\` runtime.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`init()\` |
| Category | Core inference / Runtime initialization |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> init(EdgeVedaConfig config);
\`\`\`

## What it does

\`init()\` stores the \`EdgeVedaConfig\` for the SDK instance and validates that the model referenced by \`config.modelPath\` can be loaded. It does not produce text or embeddings. It performs configuration validation, checks that the model file exists, and runs a background-isolate load test against the native runtime.

The method returns \`Future<void>\` and completes when the SDK instance is ready for subsequent calls such as \`generate()\`, \`generateStream()\`, and \`embed()\`.

## When to use it

Use \`init()\` when you need to:

- prepare an \`EdgeVeda\` instance for text generation or embeddings;
- validate that a downloaded or imported GGUF model file can be loaded;
- apply runtime settings such as context length, thread count, GPU usage, and KV-cache configuration.

Do not use this method when:

- the instance is already initialized; call \`dispose()\` first if you need to reinitialize with a different model or configuration;
- you only need to download or import a model; use \`ModelManager\` for model file management;
- you are initializing vision or image generation models, which have separate initialization APIs.

## Prerequisites

Before calling this method, make sure that:

- a compatible model file exists at \`config.modelPath\`;
- the app has permission to read the model file from its local storage location;
- the selected model fits the target device memory budget;
- the app chooses a realistic \`contextLength\` for the target device;
- GPU/Metal usage is enabled only on platforms where it is supported and tested;
- the app is prepared to handle model-load and memory-related failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`config\` | \`EdgeVedaConfig\` | Yes | — | Runtime configuration used to initialize the SDK instance. | Must include a valid \`modelPath\`. Other fields control threads, context length, GPU usage, memory budget, flash attention, and KV-cache quantization. |

### \`EdgeVedaConfig\` fields

| Field | Type | Default | Description | Notes |
| --- | --- | --- | --- | --- |
| \`modelPath\` | \`String\` | Required | Path to the local GGUF model file. | The file must exist before calling \`init()\`. |
| \`numThreads\` | \`int\` | \`4\` | Number of CPU threads to use for inference. | Tune per device class. |
| \`contextLength\` | \`int\` | \`2048\` | Maximum context length in tokens. | Higher values increase memory usage. |
| \`useGpu\` | \`bool\` | \`true\` | Enables GPU acceleration where supported. | On iOS/macOS this typically means Metal. |
| \`maxMemoryMb\` | \`int\` | \`1536\` | Memory budget in MB. | Use conservative values on 4 GB devices. |
| \`verbose\` | \`bool\` | \`false\` | Enables verbose logging. | Useful during integration and debugging. |
| \`flashAttn\` | \`int\` | \`-1\` | Flash attention mode. | \`-1\` means auto. |
| \`kvCacheTypeK\` | \`int\` | \`8\` | KV-cache quantization type for keys. | \`1 = F16\`, \`8 = Q8_0\`. |
| \`kvCacheTypeV\` | \`int\` | \`8\` | KV-cache quantization type for values. | \`1 = F16\`, \`8 = Q8_0\`. |

## Returns

\`Future<void>\`

The future completes when the SDK has validated the configuration and confirmed that the model can be loaded. The method does not return a runtime handle, generated text, embeddings, or model metadata.

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`InitializationException\` | The \`EdgeVeda\` instance is already initialized, or native initialization fails for an unknown or wrapped reason. | Call \`dispose()\` before reinitializing; log the details and show a recovery message. |
| \`ModelLoadException\` | The model file does not exist at \`config.modelPath\` or cannot be loaded by the native runtime. | Verify the path with \`ModelManager\`, re-download/import the model, or choose a compatible model. |
| \`ConfigurationException\` | The configuration is invalid. | Check context length, memory budget, thread count, and GPU settings. |
| \`MemoryException\` | Model load exceeds the configured or practical memory budget. | Reduce \`contextLength\`, choose a smaller model, or disable expensive options. |
| \`EdgeVedaException\` | A typed SDK exception is rethrown from validation or native load testing. | Handle by exception type where possible. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));
\`\`\`

## Production-style example

\`\`\`dart
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
    throw Exception('The local model could not be loaded: \${error.message}');
  } on InitializationException catch (error) {
    throw Exception('Edge Veda initialization failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`init()\` does not emit a stream. Use \`generateStream()\` after successful initialization.

## Behavior notes

- \`init()\` is the entry point for the core text/embedding runtime.
- The method validates the model file path before native initialization.
- The source implementation performs a background-isolate load test and frees the test context after validation.
- After \`init()\` completes, subsequent text generation can reuse a persistent streaming worker.
- Calling \`init()\` twice on the same instance without \`dispose()\` is an error.
- Vision and image generation have separate initialization paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Larger models increase load time, RAM usage, and storage requirements. | Start with a small recommended chat model such as a 1B-class GGUF model for first integration. |
| Context length | Higher context lengths increase KV-cache memory. | Use \`2048\` as a practical default; reduce on lower-memory devices. |
| GPU / Metal usage | GPU acceleration improves throughput on supported Apple devices but must be validated per platform. | Keep \`useGpu: true\` on validated iOS/macOS targets; test simulator and Android separately. |
| Memory budget | Too high may risk OS termination; too low may block model loading. | Keep \`maxMemoryMb\` conservative and validate on physical devices. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF LLM models | Yes | Used for text generation and embeddings. Model must be compatible with the native backend. |
| Whisper GGUF models | No for \`init()\` | Use Whisper-specific worker/session APIs. |
| Stable Diffusion models | No for \`init()\` | Use image generation initialization APIs. |
| Vision-language models | No for \`init()\` | Use \`initVision()\` / vision worker APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Metal GPU path is the primary validated target. |
| iOS simulator | Partial | CPU-only behavior may be slower and not representative. |
| macOS | Yes / package surface | Validate app sandbox and model file paths. |
| Android | Partial / validation pending | Treat as scaffolded until validated on target devices. |
| Web | No | Native runtime and model loading are not web-oriented. |

## Privacy and security

- Input data processed: local model file path and runtime configuration.
- Network access during inference: none.
- Local storage used: model files.
- Sensitive data considerations: avoid logging full local paths if they may expose user-specific directory names or project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`ModelLoadException: Model file not found\` | \`modelPath\` points to a missing, moved, or not-yet-downloaded file. | Resolve the path with \`ModelManager\` and check the file before calling \`init()\`. |
| Initialization is slow on first run | The model is being validated by the native runtime. | Show a loading state and test on a physical device in release/profile mode. |
| Out-of-memory or OS termination | Model/context is too large for the device. | Use a smaller model or lower \`contextLength\` and \`maxMemoryMb\`. |
| Reinitialization fails | \`init()\` was called twice on the same instance. | Call \`await edgeVeda.dispose()\` before reinitializing. |

## Related APIs

- [\`EdgeVeda.generate()\`](./generate.md) — returns a complete text generation response after initialization.
- [\`EdgeVeda.generateStream()\`](./generate-stream.md) — streams generated tokens after initialization.
- [\`EdgeVeda.dispose()\`](./dispose.md) — releases runtime resources before reinitialization.
- [\`ModelManager.downloadModel()\`](../model-management/download-model.md) — obtains model files before initialization.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Public export file: \`flutter/lib/edge_veda.dart\`
- Generated Dart API: \`EdgeVeda.init()\`
- Example usage: \`flutter/QUICKSTART.md\`
- Related native API / FFI binding: native Edge Veda C bindings used by \`evInit\`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Before publishing, verify that:

- [ ] The signature matches the current source code.
- [ ] \`EdgeVedaConfig\` defaults match the current \`types.dart\`.
- [ ] The production example compiles.
- [ ] The platform notes match the current release.
- [ ] Error names match current typed exceptions.
- [ ] Model compatibility notes are reviewed by a maintainer.
`;

window.API_DOCS.content["init_ua"] = `# \`EdgeVeda.init()\`

> Ініціалізує конфігурацію Edge Veda runtime і перевіряє, що вибрану on-device модель можна завантажити.

Використовуйте \`init()\` перед викликами text generation, embeddings або інших API, які залежать від core \`EdgeVeda\` runtime.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`init()\` |
| Category | Core inference / Ініціалізація runtime |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> init(EdgeVedaConfig config);
\`\`\`

## What it does

\`init()\` зберігає \`EdgeVedaConfig\` для SDK-інстансу та перевіряє, що модель із \`config.modelPath\` можна завантажити. Метод не генерує текст і не створює embeddings. Він валідовує конфігурацію, перевіряє наявність model file і запускає background-isolate load test проти native runtime.

Метод повертає \`Future<void>\` і завершується, коли SDK-інстанс готовий до наступних викликів: \`generate()\`, \`generateStream()\` та \`embed()\`.

## When to use it

Використовуйте \`init()\`, коли потрібно:

- підготувати \`EdgeVeda\` instance для text generation або embeddings;
- перевірити, що downloaded/imported GGUF model file може бути завантажений;
- застосувати runtime settings: context length, thread count, GPU usage, KV-cache configuration.

Не використовуйте цей метод, коли:

- інстанс уже ініціалізований; спочатку викличте \`dispose()\`, якщо треба переініціалізувати з іншою моделлю або конфігурацією;
- потрібно лише завантажити або імпортувати модель; для цього використовуйте \`ModelManager\`;
- потрібно ініціалізувати vision або image generation models — для них є окремі API.

## Prerequisites

Перед викликом методу переконайтесь, що:

- compatible model file існує за шляхом \`config.modelPath\`;
- застосунок має право читати model file з локального сховища;
- вибрана модель поміщається в memory budget цільового пристрою;
- застосунок вибирає реалістичний \`contextLength\` для цільового пристрою;
- GPU/Metal usage увімкнено лише там, де це підтримано й перевірено;
- застосунок обробляє model-load і memory-related failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`config\` | \`EdgeVedaConfig\` | Yes | — | Runtime configuration для ініціалізації SDK instance. | Має містити валідний \`modelPath\`. Інші поля керують threads, context length, GPU usage, memory budget, flash attention та KV-cache quantization. |

### \`EdgeVedaConfig\` fields

| Field | Type | Default | Description | Notes |
| --- | --- | --- | --- | --- |
| \`modelPath\` | \`String\` | Required | Шлях до локального GGUF model file. | Файл має існувати до виклику \`init()\`. |
| \`numThreads\` | \`int\` | \`4\` | Кількість CPU threads для inference. | Налаштовуйте під device class. |
| \`contextLength\` | \`int\` | \`2048\` | Максимальна довжина контексту в токенах. | Більші значення збільшують memory usage. |
| \`useGpu\` | \`bool\` | \`true\` | Увімкнення GPU acceleration там, де підтримано. | На iOS/macOS це зазвичай Metal. |
| \`maxMemoryMb\` | \`int\` | \`1536\` | Memory budget у MB. | На 4 GB devices використовуйте консервативні значення. |
| \`verbose\` | \`bool\` | \`false\` | Увімкнення verbose logging. | Корисно під час integration/debugging. |
| \`flashAttn\` | \`int\` | \`-1\` | Flash attention mode. | \`-1\` означає auto. |
| \`kvCacheTypeK\` | \`int\` | \`8\` | KV-cache quantization type for keys. | \`1 = F16\`, \`8 = Q8_0\`. |
| \`kvCacheTypeV\` | \`int\` | \`8\` | KV-cache quantization type for values. | \`1 = F16\`, \`8 = Q8_0\`. |

## Returns

\`Future<void>\`

Future завершується, коли SDK валідовує конфігурацію і підтверджує, що модель можна завантажити. Метод не повертає runtime handle, generated text, embeddings або model metadata.

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`InitializationException\` | \`EdgeVeda\` instance уже ініціалізований або native initialization завершується невідомою/обгорнутою помилкою. | Викличте \`dispose()\` перед reinitialize; залогуйте details і покажіть recovery message. |
| \`ModelLoadException\` | Model file не існує за \`config.modelPath\` або native runtime не може її завантажити. | Перевірте шлях через \`ModelManager\`, re-download/import модель або виберіть compatible model. |
| \`ConfigurationException\` | Конфігурація невалідна. | Перевірте context length, memory budget, thread count і GPU settings. |
| \`MemoryException\` | Model load перевищує memory budget. | Зменште \`contextLength\`, виберіть меншу модель або вимкніть дорогі опції. |
| \`EdgeVedaException\` | Typed SDK exception повертається з validation або native load testing. | Обробляйте за конкретним exception type, якщо можливо. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));
\`\`\`

## Production-style example

\`\`\`dart
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
    throw Exception('The local model could not be loaded: \${error.message}');
  } on InitializationException catch (error) {
    throw Exception('Edge Veda initialization failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`init()\` не повертає stream. Після успішної ініціалізації використовуйте \`generateStream()\`.

## Behavior notes

- \`init()\` — entry point для core text/embedding runtime.
- Метод перевіряє model file path перед native initialization.
- Source implementation виконує background-isolate load test і звільняє test context після validation.
- Після завершення \`init()\` наступні text generation calls можуть використовувати persistent streaming worker.
- Повторний виклик \`init()\` на тому самому інстансі без \`dispose()\` — помилка.
- Vision і image generation мають окремі initialization paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model size | Більші моделі збільшують load time, RAM usage і storage requirements. | Починайте з невеликої recommended chat model, наприклад 1B-class GGUF. |
| Context length | Більші context lengths збільшують KV-cache memory. | Використовуйте \`2048\` як практичний default; зменшуйте для low-memory devices. |
| GPU / Metal usage | GPU acceleration покращує throughput на supported Apple devices. | Залишайте \`useGpu: true\` на validated iOS/macOS targets; simulator і Android тестуйте окремо. |
| Memory budget | Завелике значення може ризикувати OS termination; замале — блокувати model loading. | Тримайте \`maxMemoryMb\` консервативним і перевіряйте на physical devices. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF LLM models | Yes | Для text generation та embeddings. Модель має бути compatible з native backend. |
| Whisper GGUF models | No for \`init()\` | Використовуйте Whisper-specific worker/session APIs. |
| Stable Diffusion models | No for \`init()\` | Використовуйте image generation initialization APIs. |
| Vision-language models | No for \`init()\` | Використовуйте \`initVision()\` / vision worker APIs. |

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
| \`ModelLoadException: Model file not found\` | \`modelPath\` вказує на missing/moved/not-yet-downloaded file. | Отримайте шлях через \`ModelManager\` і перевірте файл перед \`init()\`. |
| Initialization повільна на першому запуску | Модель перевіряється native runtime. | Покажіть loading state і тестуйте на physical device у release/profile mode. |
| Out-of-memory або OS termination | Model/context завеликий для пристрою. | Використайте меншу модель або зменште \`contextLength\` і \`maxMemoryMb\`. |
| Reinitialization fails | \`init()\` викликано двічі на тому самому instance. | Викличте \`await edgeVeda.dispose()\` перед reinitialize. |

## Related APIs

- [\`EdgeVeda.generate()\`](./generate.md) — повертає complete text generation response після initialization.
- [\`EdgeVeda.generateStream()\`](./generate-stream.md) — стрімить generated tokens після initialization.
- [\`EdgeVeda.dispose()\`](./dispose.md) — звільняє runtime resources перед reinitialization.
- [\`ModelManager.downloadModel()\`](../model-management/download-model.md) — отримує model files до initialization.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Public export file: \`flutter/lib/edge_veda.dart\`
- Generated Dart API: \`EdgeVeda.init()\`
- Example usage: \`flutter/QUICKSTART.md\`
- Related native API / FFI binding: native Edge Veda C bindings used by \`evInit\`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Перед публікацією перевірте:

- [ ] Signature відповідає current source code.
- [ ] \`EdgeVedaConfig\` defaults відповідають current \`types.dart\`.
- [ ] Production example компілюється.
- [ ] Platform notes відповідають current release.
- [ ] Error names відповідають typed exceptions.
- [ ] Model compatibility notes reviewed by maintainer.
`;

window.API_DOCS.content["generate_en"] = `# \`EdgeVeda.generate()\`

> Generates a complete text response from a prompt by collecting tokens from the persistent streaming worker.

Use \`generate()\` when your app needs a single final text response rather than token-by-token UI updates.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generate()\` |
| Category | Core inference / Text generation |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No; use \`generateStream()\` for token streaming |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<GenerateResponse> generate(
  String prompt, {
  GenerateOptions? options,
  Duration? timeout,
});
\`\`\`

## What it does

\`generate()\` sends a prompt to the local model and returns a complete \`GenerateResponse\`. Internally, it routes through the same persistent \`StreamingWorker\` used by \`generateStream()\`, collects emitted tokens into a buffer, and returns the final text with generation metadata.

The method is asynchronous and performs inference on device. It does not require a network call.

## When to use it

Use \`generate()\` when you need to:

- produce a complete answer before updating the UI;
- run short assistant, summarization, classification, or transformation tasks;
- apply a timeout to a blocking generation request;
- avoid manual stream handling in simple application flows.

Do not use this method when:

- you need token-by-token rendering in a chat UI; use \`generateStream()\`;
- another stream is already active on the same \`EdgeVeda\` instance;
- you need multi-turn conversation state; consider \`ChatSession\`;
- you need structured tool-calling loops; consider \`ChatSession.sendWithTools()\`.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.init(config)\` has completed successfully;
- the prompt is not empty;
- the selected model is appropriate for the prompt style and expected output;
- \`GenerateOptions\` values are within supported ranges;
- the app can handle latency for a full response, especially for large \`maxTokens\`;
- no streaming operation is already active on the same runtime instance.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Input text passed to the local model. | Must not be empty. Keep prompts within the configured context length. |
| \`options\` | \`GenerateOptions?\` | No | \`const GenerateOptions()\` | Controls sampling, token limit, system prompt, JSON/grammar behavior, and confidence tracking. | Invalid values can throw \`ConfigurationException\`. |
| \`timeout\` | \`Duration?\` | No | \`null\` | Optional maximum duration for the complete generation call. | If exceeded, the method throws \`GenerationException\`. |

### Common \`GenerateOptions\` fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| \`systemPrompt\` | \`String?\` | \`null\` | Optional system-level instruction. |
| \`maxTokens\` | \`int\` | \`512\` | Maximum number of tokens to generate. |
| \`temperature\` | \`double\` | \`0.7\` | Sampling randomness. Lower is more deterministic. |
| \`topP\` | \`double\` | \`0.9\` | Nucleus sampling threshold. |
| \`topK\` | \`int\` | \`40\` | Limits sampling to the top K candidate tokens. |
| \`repeatPenalty\` | \`double\` | \`1.1\` | Discourages repeated output. |
| \`stopSequences\` | \`List<String>\` | \`[]\` | Stop sequences for early termination. |
| \`jsonMode\` | \`bool\` | \`false\` | Requests valid JSON output. |
| \`grammarStr\` | \`String?\` | \`null\` | Optional GBNF grammar for constrained decoding. |
| \`grammarRoot\` | \`String?\` | \`null\` | Optional root rule for the grammar. |
| \`confidenceThreshold\` | \`double\` | \`0.0\` | Enables confidence tracking and cloud-handoff signaling when greater than zero. |

## Returns

\`Future<GenerateResponse>\`

A future that resolves to the complete generated response.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`text\` | \`String\` | Complete generated text content. |
| \`promptTokens\` | \`int\` | Number of prompt tokens reported by the response. |
| \`completionTokens\` | \`int\` | Number of generated tokens collected from the stream. |
| \`latencyMs\` | \`int?\` | Total generation duration in milliseconds. |
| \`avgConfidence\` | \`double?\` | Average confidence across generated tokens when confidence tracking is enabled. |
| \`needsCloudHandoff\` | \`bool\` | Whether the model signaled that cloud handoff may be needed. |
| \`tokensPerSecond\` | \`double?\` | Derived throughput when latency and token counts are available. |
| \`totalTokens\` | \`int\` | Prompt and completion tokens combined. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`GenerationException\` | Prompt is empty, generation times out, the worker fails, or a streaming conflict occurs. | Validate input, avoid concurrent streams, retry with lower \`maxTokens\`, or show a user-facing failure state. |
| \`ConfigurationException\` | One or more \`GenerateOptions\` values are outside allowed ranges. | Clamp UI controls and validate options before calling the method. |
| \`InitializationException\` / \`EdgeVedaException\` | Runtime is not initialized or another SDK-level failure occurs. | Call \`init()\` first and handle typed exceptions. |
| Stream-propagated errors | Since \`generate()\` consumes \`generateStream()\`, stream errors can surface as generation failures. | Log the underlying details and recover at the application level. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in two sentences.',
);

print(response.text);
\`\`\`

## Production-style example

\`\`\`dart
Future<String> summarizeNote(EdgeVeda edgeVeda, String note) async {
  if (note.trim().isEmpty) {
    throw ArgumentError('note must not be empty');
  }

  try {
    final response = await edgeVeda.generate(
      'Summarize this note for a product manager:\\n\\n$note',
      options: const GenerateOptions(
        maxTokens: 180,
        temperature: 0.3,
        topP: 0.9,
      ),
      timeout: const Duration(seconds: 30),
    );

    return response.text.trim();
  } on GenerationException catch (error) {
    throw Exception('Text generation failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`generate()\` returns a complete response. For streaming, use:

\`\`\`dart
await for (final chunk in edgeVeda.generateStream('Tell me a short story')) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
\`\`\`

## Behavior notes

- \`generate()\` requires a successfully initialized \`EdgeVeda\` instance.
- The method validates that \`prompt\` is not empty.
- The method uses \`generateStream()\` internally and buffers all non-final token chunks.
- The final response includes measured latency and completion token count.
- Because it depends on \`generateStream()\`, only one active streaming operation should run per \`EdgeVeda\` instance.
- Confidence and cloud-handoff metadata depend on the selected \`GenerateOptions\`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| \`maxTokens\` | Higher values increase latency and battery use. | Set the lowest acceptable value for the task. |
| Model size | Larger models may improve quality but increase memory and latency. | Use Model Advisor or device-specific defaults. |
| Context length | Longer prompts consume context and can increase compute time. | Keep prompts concise and summarize long context. |
| GPU / Metal usage | Improves throughput on supported Apple devices. | Test on physical devices in release/profile mode. |
| Timeout | Prevents long blocking calls. | Use \`timeout\` for user-facing interactions. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Best suited for natural language responses. |
| GGUF embedding model | No for text generation | Use \`embed()\` for embeddings. |
| Tool-calling model | Partial | Use \`ChatSession.sendWithTools()\` for multi-round tool execution. |
| Vision-language model | No for this method | Use vision APIs for image inputs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for sustained on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be much slower. |
| macOS | Yes / package surface | Validate model paths and sandbox access. |
| Android | Partial / validation pending | Validate on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: prompt text and generation options.
- Network access during inference: none.
- Local storage used: local model file and runtime cache/state.
- Sensitive data considerations: avoid logging user prompts or full generated outputs if they may contain private data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Prompt cannot be empty\` | Empty or whitespace-only prompt passed to the method. | Validate the prompt before calling \`generate()\`. |
| Generation times out | Large prompt, high \`maxTokens\`, slow device, or thermal pressure. | Reduce \`maxTokens\`, simplify the prompt, use streaming, or increase timeout. |
| Repeated or low-quality output | Wrong chat template/model or too-high sampling randomness. | Use \`ChatSession\` with the correct template or lower \`temperature\`. |
| Worker error | The persistent streaming worker failed to spawn or load the model. | Reinitialize the runtime or restart the app-level session. |
| UI appears frozen | The app waits for full response before updating UI. | Use \`generateStream()\` for progressive rendering. |

## Related APIs

- [\`EdgeVeda.init()\`](./init.md) — initializes the runtime before generation.
- [\`EdgeVeda.generateStream()\`](./generate-stream.md) — streams tokens for progressive UI.
- [\`ChatSession.sendStream()\`](../chat-session/send-stream.md) — handles multi-turn chat state.
- [\`ChatSession.sendWithTools()\`](../chat-session/send-with-tools.md) — handles tool-calling workflows.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Public export file: \`flutter/lib/edge_veda.dart\`
- Generated Dart API: \`EdgeVeda.generate()\`
- Example usage: \`flutter/QUICKSTART.md\`
- Related worker: \`StreamingWorker\`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Before publishing, verify that:

- [ ] The signature matches the current source code.
- [ ] \`GenerateOptions\` defaults and validation ranges are current.
- [ ] The return fields match \`GenerateResponse\`.
- [ ] The minimal example compiles.
- [ ] Timeout behavior is confirmed against source and tests.
- [ ] Concurrency limitations are documented correctly.
- [ ] Privacy notes match project policy.
`;

window.API_DOCS.content["generate_ua"] = `# \`EdgeVeda.generate()\`

> Генерує повну текстову відповідь із prompt, збираючи токени з persistent streaming worker.

Використовуйте \`generate()\`, коли застосунку потрібна одна фінальна текстова відповідь, а не token-by-token оновлення UI.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generate()\` |
| Category | Core inference / Text generation |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No; для token streaming використовуйте \`generateStream()\` |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<GenerateResponse> generate(
  String prompt, {
  GenerateOptions? options,
  Duration? timeout,
});
\`\`\`

## What it does

\`generate()\` передає prompt локальній моделі та повертає повний \`GenerateResponse\`. Усередині метод іде через той самий persistent \`StreamingWorker\`, що й \`generateStream()\`, збирає emitted tokens у buffer і повертає final text з generation metadata.

Метод асинхронний і виконує inference on device. Network call не потрібен.

## When to use it

Використовуйте \`generate()\`, коли потрібно:

- отримати повну відповідь перед оновленням UI;
- виконати короткі assistant, summarization, classification або transformation tasks;
- застосувати timeout до blocking generation request;
- уникнути ручної обробки stream у простих flows.

Не використовуйте цей метод, коли:

- потрібен token-by-token rendering у chat UI; використовуйте \`generateStream()\`;
- інший stream уже active на тому самому \`EdgeVeda\` instance;
- потрібна multi-turn conversation state; розгляньте \`ChatSession\`;
- потрібні structured tool-calling loops; розгляньте \`ChatSession.sendWithTools()\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.init(config)\` успішно завершився;
- prompt не порожній;
- вибрана модель підходить для prompt style і expected output;
- \`GenerateOptions\` values у supported ranges;
- застосунок може обробити latency до повної відповіді, особливо для великого \`maxTokens\`;
- на цьому runtime instance немає active streaming operation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Input text для локальної моделі. | Не має бути empty. Тримайте prompt у межах configured context length. |
| \`options\` | \`GenerateOptions?\` | No | \`const GenerateOptions()\` | Керує sampling, token limit, system prompt, JSON/grammar behavior і confidence tracking. | Невалідні значення можуть кинути \`ConfigurationException\`. |
| \`timeout\` | \`Duration?\` | No | \`null\` | Optional maximum duration для complete generation call. | Якщо перевищено, метод кидає \`GenerationException\`. |

### Common \`GenerateOptions\` fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| \`systemPrompt\` | \`String?\` | \`null\` | Optional system-level instruction. |
| \`maxTokens\` | \`int\` | \`512\` | Максимальна кількість generated tokens. |
| \`temperature\` | \`double\` | \`0.7\` | Sampling randomness. Нижче значення — більш deterministic output. |
| \`topP\` | \`double\` | \`0.9\` | Nucleus sampling threshold. |
| \`topK\` | \`int\` | \`40\` | Обмежує sampling топ-K кандидатами. |
| \`repeatPenalty\` | \`double\` | \`1.1\` | Зменшує повтори в output. |
| \`stopSequences\` | \`List<String>\` | \`[]\` | Stop sequences для early termination. |
| \`jsonMode\` | \`bool\` | \`false\` | Запитує valid JSON output. |
| \`grammarStr\` | \`String?\` | \`null\` | Optional GBNF grammar для constrained decoding. |
| \`grammarRoot\` | \`String?\` | \`null\` | Optional root rule для grammar. |
| \`confidenceThreshold\` | \`double\` | \`0.0\` | Вмикає confidence tracking і cloud-handoff signaling, якщо більше нуля. |

## Returns

\`Future<GenerateResponse>\`

Future повертає complete generated response.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`text\` | \`String\` | Повний generated text content. |
| \`promptTokens\` | \`int\` | Кількість prompt tokens, reported by response. |
| \`completionTokens\` | \`int\` | Кількість generated tokens, collected from stream. |
| \`latencyMs\` | \`int?\` | Total generation duration у milliseconds. |
| \`avgConfidence\` | \`double?\` | Average confidence across generated tokens, якщо confidence tracking enabled. |
| \`needsCloudHandoff\` | \`bool\` | Чи модель сигналізує, що може бути потрібен cloud handoff. |
| \`tokensPerSecond\` | \`double?\` | Derived throughput, якщо доступні latency і token counts. |
| \`totalTokens\` | \`int\` | Prompt і completion tokens разом. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`GenerationException\` | Prompt empty, generation timeout, worker failure або streaming conflict. | Валідуйте input, уникайте concurrent streams, retry with lower \`maxTokens\`, або покажіть failure state. |
| \`ConfigurationException\` | Одне або кілька \`GenerateOptions\` значень за межами allowed ranges. | Обмежте UI controls і валідуйте options перед викликом. |
| \`InitializationException\` / \`EdgeVedaException\` | Runtime не ініціалізований або сталася SDK-level failure. | Спочатку викличте \`init()\` і обробіть typed exceptions. |
| Stream-propagated errors | Оскільки \`generate()\` споживає \`generateStream()\`, stream errors можуть проявлятися як generation failures. | Логуйте underlying details і відновлюйтесь на application level. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in two sentences.',
);

print(response.text);
\`\`\`

## Production-style example

\`\`\`dart
Future<String> summarizeNote(EdgeVeda edgeVeda, String note) async {
  if (note.trim().isEmpty) {
    throw ArgumentError('note must not be empty');
  }

  try {
    final response = await edgeVeda.generate(
      'Summarize this note for a product manager:\\n\\n$note',
      options: const GenerateOptions(
        maxTokens: 180,
        temperature: 0.3,
        topP: 0.9,
      ),
      timeout: const Duration(seconds: 30),
    );

    return response.text.trim();
  } on GenerationException catch (error) {
    throw Exception('Text generation failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`generate()\` повертає complete response. Для streaming використовуйте:

\`\`\`dart
await for (final chunk in edgeVeda.generateStream('Tell me a short story')) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
\`\`\`

## Behavior notes

- \`generate()\` потребує успішно ініціалізований \`EdgeVeda\` instance.
- Метод перевіряє, що \`prompt\` не порожній.
- Метод internally використовує \`generateStream()\` і буферизує всі non-final token chunks.
- Final response включає measured latency і completion token count.
- Оскільки метод залежить від \`generateStream()\`, на одному \`EdgeVeda\` instance має бути лише одна active streaming operation.
- Confidence і cloud-handoff metadata залежать від selected \`GenerateOptions\`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| \`maxTokens\` | Більші значення збільшують latency і battery use. | Задавайте найменше acceptable value для task. |
| Model size | Більші моделі можуть покращити якість, але збільшують memory і latency. | Використовуйте Model Advisor або device-specific defaults. |
| Context length | Довші prompts витрачають context і можуть збільшити compute time. | Тримайте prompts concise і summarize long context. |
| GPU / Metal usage | Покращує throughput на supported Apple devices. | Тестуйте на physical devices у release/profile mode. |
| Timeout | Запобігає довгим blocking calls. | Використовуйте \`timeout\` для user-facing interactions. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Основний сценарій — natural language responses. |
| GGUF embedding model | No for text generation | Для embeddings використовуйте \`embed()\`. |
| Tool-calling model | Partial | Для multi-round tool execution використовуйте \`ChatSession.sendWithTools()\`. |
| Vision-language model | No for this method | Для image inputs використовуйте vision APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для sustained on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути значно повільнішим. |
| macOS | Yes / package surface | Перевірте model paths і sandbox access. |
| Android | Partial / validation pending | Валідуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не орієнтована на web. |

## Privacy and security

- Input data processed: prompt text і generation options.
- Network access during inference: none.
- Local storage used: local model file і runtime cache/state.
- Sensitive data considerations: не логуйте user prompts або full generated outputs, якщо вони можуть містити private data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Prompt cannot be empty\` | Empty або whitespace-only prompt. | Валідуйте prompt перед \`generate()\`. |
| Generation times out | Large prompt, high \`maxTokens\`, slow device або thermal pressure. | Зменште \`maxTokens\`, спростіть prompt, використайте streaming або збільште timeout. |
| Repeated або low-quality output | Неправильний chat template/model або зависока sampling randomness. | Використайте \`ChatSession\` з correct template або зменште \`temperature\`. |
| Worker error | Persistent streaming worker не зміг spawn/load model. | Reinitialize runtime або restart app-level session. |
| UI appears frozen | App чекає full response перед UI update. | Використайте \`generateStream()\` для progressive rendering. |

## Related APIs

- [\`EdgeVeda.init()\`](./init.md) — ініціалізує runtime перед generation.
- [\`EdgeVeda.generateStream()\`](./generate-stream.md) — стрімить tokens для progressive UI.
- [\`ChatSession.sendStream()\`](../chat-session/send-stream.md) — працює з multi-turn chat state.
- [\`ChatSession.sendWithTools()\`](../chat-session/send-with-tools.md) — працює з tool-calling workflows.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Public export file: \`flutter/lib/edge_veda.dart\`
- Generated Dart API: \`EdgeVeda.generate()\`
- Example usage: \`flutter/QUICKSTART.md\`
- Related worker: \`StreamingWorker\`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Перед публікацією перевірте:

- [ ] Signature відповідає current source code.
- [ ] \`GenerateOptions\` defaults і validation ranges актуальні.
- [ ] Return fields відповідають \`GenerateResponse\`.
- [ ] Minimal example компілюється.
- [ ] Timeout behavior підтверджено по source/tests.
- [ ] Concurrency limitations задокументовано коректно.
- [ ] Privacy notes відповідають project policy.
`;

window.API_DOCS.content["generate-stream_en"] = `# \`EdgeVeda.generateStream()\`

> Generates text as a stream of token chunks for progressive, responsive on-device AI experiences.

Use \`generateStream()\` when your app needs to display model output as it is generated, cancel a request mid-generation, or react to per-token confidence metadata.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generateStream()\` |
| Category | Core inference / Streaming text generation |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | Yes |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Stream<TokenChunk> generateStream(
  String prompt, {
  GenerateOptions? options,
  CancelToken? cancelToken,
});
\`\`\`

## What it does

\`generateStream()\` sends a prompt to the local model and returns a Dart \`Stream<TokenChunk>\`. The stream yields token chunks as they are generated. The final chunk has \`isFinal == true\` and an empty token to signal completion.

The method uses a persistent \`StreamingWorker\`. If the worker is not active, the method spawns it and loads the configured model. If the worker is already active, it reuses it.

## When to use it

Use \`generateStream()\` when you need to:

- update a chat or assistant UI token by token;
- allow the user to cancel generation mid-stream;
- process generated output incrementally;
- track per-token confidence or cloud-handoff signals.

Do not use this method when:

- you only need the final text and simpler code; use \`generate()\`;
- another stream is already active on the same \`EdgeVeda\` instance;
- the runtime has not been initialized with \`init()\`;
- you need model-level multi-turn memory; use \`ChatSession\`.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.init(config)\` has completed successfully;
- the prompt is not empty;
- no other \`generateStream()\` call is active on the same \`EdgeVeda\` instance;
- \`GenerateOptions\` values are valid;
- the app is ready to handle stream errors;
- the UI handles final chunks and cancellation correctly.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Input text passed to the local model. | Must not be empty. |
| \`options\` | \`GenerateOptions?\` | No | \`const GenerateOptions()\` | Controls token limit, sampling, grammar constraints, JSON mode, and confidence tracking. | Values are validated before streaming starts. |
| \`cancelToken\` | \`CancelToken?\` | No | \`null\` | Optional cancellation token for stopping generation mid-stream. | Calling \`cancel()\` stops token generation as soon as the worker observes cancellation. |

## Returns

\`Stream<TokenChunk>\`

A stream that emits token chunks until the final chunk is produced, cancellation happens, or an error is thrown.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`token\` | \`String\` | Token text content for this chunk. The final chunk usually has an empty token. |
| \`index\` | \`int\` | Token index in the generated sequence. |
| \`isFinal\` | \`bool\` | \`true\` when the stream has completed. |
| \`confidence\` | \`double?\` | Per-token confidence score when confidence tracking is enabled. |
| \`needsCloudHandoff\` | \`bool\` | Whether cloud handoff is recommended at this point. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`GenerationException\` | Prompt is empty, streaming is already active, worker spawn fails, worker init fails, or streaming fails. | Validate input, serialize generation calls, retry after cancellation, or reinitialize the runtime. |
| \`ConfigurationException\` | Invalid \`GenerateOptions\` values are passed. | Clamp values in the UI and validate options before starting the stream. |
| Stream errors | Runtime failures are propagated through the stream. | Wrap \`await for\` in \`try/catch\` and update the UI state on failure. |
| Cancellation state | User cancels generation through \`CancelToken\`. | Treat cancellation as a normal user action; preserve partial output if useful. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain what on-device AI means.',
)) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
\`\`\`

## Production-style example

\`\`\`dart
Future<String> streamIntoBuffer(EdgeVeda edgeVeda, String prompt) async {
  final cancelToken = CancelToken();
  final buffer = StringBuffer();

  try {
    await for (final chunk in edgeVeda.generateStream(
      prompt,
      options: const GenerateOptions(
        maxTokens: 256,
        temperature: 0.4,
        topP: 0.9,
      ),
      cancelToken: cancelToken,
    )) {
      if (chunk.isFinal) {
        break;
      }

      buffer.write(chunk.token);

      if (chunk.needsCloudHandoff) {
        // Optional: surface low-confidence state to the app.
      }
    }

    return buffer.toString();
  } on GenerationException catch (error) {
    throw Exception('Streaming generation failed: \${error.message}');
  }
}
\`\`\`

## Streaming example with cancellation

\`\`\`dart
final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Write a short story about a robot gardener.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (chunk.isFinal) {
    break;
  }

  stdout.write(chunk.token);

  if (shouldStopGeneration()) {
    cancelToken.cancel();
    break;
  }
}
\`\`\`

## Behavior notes

- \`generateStream()\` requires a successfully initialized \`EdgeVeda\` instance.
- Only one streaming operation can be active at a time on the same instance.
- The method lazily creates and initializes a persistent \`StreamingWorker\` if needed.
- The worker uses the \`EdgeVedaConfig\` captured during \`init()\`.
- The method emits \`TokenChunk\` objects and uses a final chunk with \`isFinal == true\`.
- Runtime errors are propagated as stream errors.
- Cancellation removes the cancellation listener in the \`finally\` path.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| First stream after init | May include worker spawn and model load time. | Show a "loading model" or "starting" state. |
| Subsequent streams | Can reuse the active worker. | Keep the runtime alive for multi-request sessions. |
| \`maxTokens\` | Directly affects duration and energy use. | Set task-specific limits. |
| UI update frequency | Updating UI on every token can be expensive. | Batch UI updates if rendering becomes costly. |
| Concurrent workloads | Streaming is single-active per \`EdgeVeda\` instance. | Queue user requests or create controlled runtime instances. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Primary use case for streaming text generation. |
| GGUF embedding model | No | Use \`embed()\` for embeddings. |
| Tool-capable chat model | Partial | For automatic tool loops, prefer \`ChatSession.sendWithTools()\`. |
| Vision-language model | No for this method | Use vision APIs for image input. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated streaming. |
| iOS simulator | Partial | CPU-only, slower, not representative for performance. |
| macOS | Yes / package surface | Validate model paths and sandbox behavior. |
| Android | Partial / validation pending | Test on target devices before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: prompt text and generation options.
- Network access during inference: none.
- Local storage used: local model file and runtime worker state.
- Sensitive data considerations: do not log live user prompts or token chunks unless explicitly needed and safe.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Streaming already in progress\` | Another stream is active on the same \`EdgeVeda\` instance. | Wait for completion, cancel the active stream, or queue the next request. |
| No tokens appear for a while | First call is spawning the worker and loading the model. | Show progress text and test release/profile builds on device. |
| Stream stops early | \`CancelToken\` was cancelled or the model hit a stop sequence. | Confirm app cancellation logic and \`stopSequences\`. |
| Stream throws an error | Worker spawn/init failed or native runtime failed. | Catch stream errors, log details, and reinitialize if needed. |
| UI stutters | Rendering updates for every token is too frequent. | Batch token updates or throttle UI refresh. |

## Related APIs

- [\`EdgeVeda.init()\`](./init.md) — initializes runtime configuration before streaming.
- [\`EdgeVeda.generate()\`](./generate.md) — collects stream output and returns a complete response.
- [\`CancelToken\`](../core/cancel-token.md) — cancels streaming generation.
- [\`ChatSession.sendStream()\`](../chat-session/send-stream.md) — streams within a multi-turn chat session.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Public export file: \`flutter/lib/edge_veda.dart\`
- Generated Dart API: \`EdgeVeda.generateStream()\`
- Example usage: \`flutter/QUICKSTART.md\`
- Related worker: \`StreamingWorker\`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Before publishing, verify that:

- [ ] The signature matches the current source code.
- [ ] Cancellation behavior is validated.
- [ ] The single-active-stream limitation is still accurate.
- [ ] \`TokenChunk\` fields match \`types.dart\`.
- [ ] The examples compile.
- [ ] Stream errors and UI-state handling are documented clearly.
- [ ] Platform notes are updated for the current release.
`;

window.API_DOCS.content["generate-stream_ua"] = `# \`EdgeVeda.generateStream()\`

> Генерує текст як stream token chunks для responsive on-device AI experiences.

Використовуйте \`generateStream()\`, коли застосунку потрібно показувати model output під час генерації, скасовувати request mid-generation або реагувати на per-token confidence metadata.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generateStream()\` |
| Category | Core inference / Streaming text generation |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | Yes |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Stream<TokenChunk> generateStream(
  String prompt, {
  GenerateOptions? options,
  CancelToken? cancelToken,
});
\`\`\`

## What it does

\`generateStream()\` передає prompt локальній моделі та повертає Dart \`Stream<TokenChunk>\`. Stream видає token chunks у процесі генерації. Final chunk має \`isFinal == true\` і порожній token, що сигналізує completion.

Метод використовує persistent \`StreamingWorker\`. Якщо worker не активний, метод spawn-ить його і завантажує configured model. Якщо worker already active, він reuse-иться.

## When to use it

Використовуйте \`generateStream()\`, коли потрібно:

- оновлювати chat або assistant UI token by token;
- дозволити користувачу cancel generation mid-stream;
- обробляти generated output incrementally;
- відстежувати per-token confidence або cloud-handoff signals.

Не використовуйте цей метод, коли:

- потрібен лише final text і простіший код; використовуйте \`generate()\`;
- інший stream уже active на тому самому \`EdgeVeda\` instance;
- runtime не ініціалізовано через \`init()\`;
- потрібна model-level multi-turn memory; використовуйте \`ChatSession\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.init(config)\` успішно завершився;
- prompt не порожній;
- на тому самому \`EdgeVeda\` instance немає іншого active \`generateStream()\` call;
- \`GenerateOptions\` values валідні;
- app готовий обробляти stream errors;
- UI коректно обробляє final chunks і cancellation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Input text для локальної моделі. | Не має бути empty. |
| \`options\` | \`GenerateOptions?\` | No | \`const GenerateOptions()\` | Керує token limit, sampling, grammar constraints, JSON mode і confidence tracking. | Значення валідовуються перед start streaming. |
| \`cancelToken\` | \`CancelToken?\` | No | \`null\` | Optional cancellation token для stop generation mid-stream. | \`cancel()\` зупиняє token generation, коли worker observe-ить cancellation. |

## Returns

\`Stream<TokenChunk>\`

Stream emits token chunks, доки не буде final chunk, cancellation або error.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`token\` | \`String\` | Token text content для цього chunk. Final chunk зазвичай має empty token. |
| \`index\` | \`int\` | Token index у generated sequence. |
| \`isFinal\` | \`bool\` | \`true\`, коли stream завершився. |
| \`confidence\` | \`double?\` | Per-token confidence score, якщо confidence tracking enabled. |
| \`needsCloudHandoff\` | \`bool\` | Чи recommended cloud handoff на цьому етапі. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`GenerationException\` | Prompt empty, streaming already active, worker spawn fails, worker init fails або streaming fails. | Валідуйте input, serialize generation calls, retry after cancellation або reinitialize runtime. |
| \`ConfigurationException\` | Invalid \`GenerateOptions\` values. | Обмежте значення в UI і валідуйте options before stream. |
| Stream errors | Runtime failures передаються через stream. | Обгорніть \`await for\` у \`try/catch\` і оновіть UI state on failure. |
| Cancellation state | User cancels generation through \`CancelToken\`. | Трактуйте cancellation як нормальну user action; partial output можна зберегти. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain what on-device AI means.',
)) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}
\`\`\`

## Production-style example

\`\`\`dart
Future<String> streamIntoBuffer(EdgeVeda edgeVeda, String prompt) async {
  final cancelToken = CancelToken();
  final buffer = StringBuffer();

  try {
    await for (final chunk in edgeVeda.generateStream(
      prompt,
      options: const GenerateOptions(
        maxTokens: 256,
        temperature: 0.4,
        topP: 0.9,
      ),
      cancelToken: cancelToken,
    )) {
      if (chunk.isFinal) {
        break;
      }

      buffer.write(chunk.token);

      if (chunk.needsCloudHandoff) {
        // Optional: surface low-confidence state to the app.
      }
    }

    return buffer.toString();
  } on GenerationException catch (error) {
    throw Exception('Streaming generation failed: \${error.message}');
  }
}
\`\`\`

## Streaming example with cancellation

\`\`\`dart
final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Write a short story about a robot gardener.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (chunk.isFinal) {
    break;
  }

  stdout.write(chunk.token);

  if (shouldStopGeneration()) {
    cancelToken.cancel();
    break;
  }
}
\`\`\`

## Behavior notes

- \`generateStream()\` потребує успішно ініціалізований \`EdgeVeda\` instance.
- На одному instance одночасно може бути тільки один active streaming operation.
- Метод lazy створює й ініціалізує persistent \`StreamingWorker\`, якщо потрібно.
- Worker використовує \`EdgeVedaConfig\`, збережений під час \`init()\`.
- Метод emits \`TokenChunk\` objects і використовує final chunk з \`isFinal == true\`.
- Runtime errors передаються як stream errors.
- Cancellation listener видаляється у \`finally\` path.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| First stream after init | Може включати worker spawn і model load time. | Покажіть "loading model" або "starting" state. |
| Subsequent streams | Можуть reuse active worker. | Тримайте runtime alive для multi-request sessions. |
| \`maxTokens\` | Прямо впливає на duration і energy use. | Задавайте task-specific limits. |
| UI update frequency | UI update на кожен token може бути дорогим. | Batch UI updates, якщо rendering стає costly. |
| Concurrent workloads | Streaming single-active per \`EdgeVeda\` instance. | Queue user requests або створюйте controlled runtime instances. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF chat/instruct LLM | Yes | Основний сценарій для streaming text generation. |
| GGUF embedding model | No | Для embeddings використовуйте \`embed()\`. |
| Tool-capable chat model | Partial | Для automatic tool loops краще \`ChatSession.sendWithTools()\`. |
| Vision-language model | No for this method | Для image input використовуйте vision APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated streaming. |
| iOS simulator | Partial | CPU-only, повільніший, не репрезентативний для performance. |
| macOS | Yes / package surface | Перевірте model paths і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target devices перед performance claims. |
| Web | No | Native runtime dependency не орієнтована на web. |

## Privacy and security

- Input data processed: prompt text і generation options.
- Network access during inference: none.
- Local storage used: local model file і runtime worker state.
- Sensitive data considerations: не логуйте live user prompts або token chunks, якщо це не потрібно й небезпечно.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Streaming already in progress\` | Інший stream active на тому самому \`EdgeVeda\` instance. | Дочекайтесь completion, cancel active stream або queue next request. |
| No tokens appear for a while | First call spawn-ить worker і load-ить model. | Покажіть progress text і тестуйте release/profile builds на device. |
| Stream stops early | \`CancelToken\` was cancelled або model hit stop sequence. | Перевірте app cancellation logic і \`stopSequences\`. |
| Stream throws an error | Worker spawn/init failed або native runtime failed. | Catch stream errors, log details і reinitialize if needed. |
| UI stutters | Rendering updates на кожен token занадто часті. | Batch token updates або throttle UI refresh. |

## Related APIs

- [\`EdgeVeda.init()\`](./init.md) — ініціалізує runtime configuration перед streaming.
- [\`EdgeVeda.generate()\`](./generate.md) — збирає stream output і повертає complete response.
- [\`CancelToken\`](../core/cancel-token.md) — скасовує streaming generation.
- [\`ChatSession.sendStream()\`](../chat-session/send-stream.md) — стрімить у multi-turn chat session.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Public export file: \`flutter/lib/edge_veda.dart\`
- Generated Dart API: \`EdgeVeda.generateStream()\`
- Example usage: \`flutter/QUICKSTART.md\`
- Related worker: \`StreamingWorker\`
- Related issue / PR: documentation plan task for public Dart API coverage

## Documentation review checklist

Перед публікацією перевірте:

- [ ] Signature відповідає current source code.
- [ ] Cancellation behavior validated.
- [ ] Single-active-stream limitation still accurate.
- [ ] \`TokenChunk\` fields відповідають \`types.dart\`.
- [ ] Examples compile.
- [ ] Stream errors і UI-state handling described clearly.
- [ ] Platform notes updated for current release.
`;

window.API_DOCS.content["embed_en"] = `# \`EdgeVeda.embed()\`

> Computes a text embedding vector for one input string using the initialized local embedding model.

\`embed()\` validates that the \`EdgeVeda\` instance is initialized, validates the input text, loads the configured GGUF model in a background isolate, calls the native embedding API, copies the L2-normalized embedding vector into Dart memory, and returns an \`EmbeddingResult\`. Use a real embedding model; using a generative model can produce meaningless embeddings.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`embed()\` |
| Category | Embeddings / RAG |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<EmbeddingResult> embed(String text);
\`\`\`

## What it does

\`embed()\` validates that the \`EdgeVeda\` instance is initialized, validates the input text, loads the configured GGUF model in a background isolate, calls the native embedding API, copies the L2-normalized embedding vector into Dart memory, and returns an \`EmbeddingResult\`. Use a real embedding model; using a generative model can produce meaningless embeddings.

## When to use it

Use \`embed()\` when you need to:

- convert a single query or document chunk into a vector;
- search a local \`VectorIndex\` by semantic similarity;
- build or query an on-device RAG pipeline;
- compare two pieces of text by vector similarity.

Do not use this method when:

- you need to embed many texts at once; use \`embedBatch()\`;
- the current model is a chat/generation model rather than an embedding model;
- you need natural-language generation; use \`generate()\` or \`generateStream()\`.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.init(config)\` has completed successfully;
- \`config.modelPath\` points to a GGUF embedding model;
- \`text\` is not empty;
- the downstream vector index uses the same embedding dimensions as the model.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`text\` | \`String\` | Yes | — | Text to embed. | Must not be empty; keep chunks within model context length. |

## Returns

\`Future<EmbeddingResult>\` — a future that resolves to one embedding result.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`embedding\` | \`List<double>\` | L2-normalized vector copied into Dart memory. |
| \`tokenCount\` | \`int\` | Number of tokens in the input text. |
| \`dimensions\` | \`int\` | Convenience property returning vector dimension count. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`EmbeddingException\` | \`text\` is empty or native embedding fails. | Validate input and confirm model compatibility. |
| \`ModelLoadException\` | The configured model cannot be loaded for embedding. | Verify \`modelPath\`, model type, and memory budget. |
| \`InitializationException\` / \`EdgeVedaException\` | Runtime is not initialized or another SDK-level failure occurs. | Call \`init()\` first and handle typed exceptions. |
| \`MemoryException\` | Model or context exceeds memory limits. | Use a smaller embedding model or lower context/memory settings. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final result = await edgeVeda.embed('The quick brown fox');

print('Dimensions: \${result.dimensions}');
print('Tokens: \${result.tokenCount}');
print('Vector head: \${result.embedding.take(5)}');
\`\`\`

## Production-style example

\`\`\`dart
Future<EmbeddingResult> embedQuery(EdgeVeda edgeVeda, String query) async {
  final normalized = query.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('query must not be empty');
  }

  try {
    return await edgeVeda.embed(normalized);
  } on EmbeddingException catch (error) {
    throw Exception('Could not embed query: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`embed()\` does not emit a stream.

## Behavior notes

- \`embed()\` requires the core runtime to be initialized with \`init()\`.
- Native work runs in a background isolate to avoid blocking the UI.
- The native model context is created for the call and freed after the embedding is copied.
- The returned embedding is a Dart-owned \`List<double>\`.
- Embedding dimensions depend on the selected model and must match the target \`VectorIndex\`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model type | Embedding models are usually smaller and faster than chat models. | Use a dedicated embedding model for RAG. |
| Chunk length | Longer text increases tokenization and compute time. | Split documents into consistent semantic chunks. |
| Single-call model load | \`embed()\` loads for a single input. | Use \`embedBatch()\` for indexing many chunks. |
| Vector dimensions | Higher dimensions increase index size and search cost. | Do not mix different embedding models in one index. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF embedding model | Yes | Primary supported use case. |
| GGUF chat/instruct LLM | Not recommended | Can produce meaningless embeddings. |
| Vision-language model | No | Use vision APIs for image understanding. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be slower. |
| macOS | Yes / package surface | Validate file access and sandbox behavior. |
| Android | Partial / validation pending | Test on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: input text.
- Network access during inference: none.
- Local storage used: local model file and optional app-managed vector index.
- Sensitive data considerations: embeddings can encode private content; protect persisted vectors and metadata.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Text cannot be empty\` | Empty string passed to \`embed()\`. | Trim and validate input. |
| Vector dimensions do not match index | Index was created for a different embedding model. | Rebuild the index with one consistent model. |
| Poor retrieval quality | Wrong model type or poor chunking. | Use a real embedding model and tune chunking. |
| Slow indexing | Calling \`embed()\` repeatedly loads the model for each text. | Use \`embedBatch()\`. |

## Related APIs

- \`EdgeVeda.embedBatch()\` — embeds multiple texts with one model load/unload cycle.
- \`VectorIndex.add()\` — stores embedding vectors for local similarity search.
- \`RagPipeline.query()\` — runs retrieval-augmented generation using embeddings.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.embed()\`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- Empty-text behavior is still \`EmbeddingException\`.
- Result fields match \`EmbeddingResult\`.
- The example compiles with a real embedding model.
- Model compatibility notes are reviewed by a maintainer.
`;

window.API_DOCS.content["embed_ua"] = `# \`EdgeVeda.embed()\`

> Обчислює text embedding vector для одного input string за допомогою ініціалізованої локальної embedding model.

\`embed()\` перевіряє, що \`EdgeVeda\` instance ініціалізований, валідовує input text, завантажує configured GGUF model у background isolate, викликає native embedding API, копіює L2-normalized embedding vector у Dart memory і повертає \`EmbeddingResult\`. Використовуйте реальну embedding model; generative model може дати семантично некорисні vectors.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`embed()\` |
| Category | Embeddings / RAG |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<EmbeddingResult> embed(String text);
\`\`\`

## What it does

\`embed()\` перевіряє, що \`EdgeVeda\` instance ініціалізований, валідовує input text, завантажує configured GGUF model у background isolate, викликає native embedding API, копіює L2-normalized embedding vector у Dart memory і повертає \`EmbeddingResult\`. Використовуйте реальну embedding model; generative model може дати семантично некорисні vectors.

## When to use it

Використовуйте \`embed()\`, коли потрібно:

- перетворити один query або document chunk на vector;
- шукати в локальному \`VectorIndex\` за semantic similarity;
- будувати або запитувати on-device RAG pipeline;
- порівнювати два тексти через vector similarity.

Не використовуйте цей метод, коли:

- потрібно embed-ити багато текстів за раз; використовуйте \`embedBatch()\`;
- current model є chat/generation model, а не embedding model;
- потрібна natural-language generation; використовуйте \`generate()\` або \`generateStream()\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.init(config)\` успішно завершився;
- \`config.modelPath\` вказує на GGUF embedding model;
- \`text\` не порожній;
- downstream vector index використовує ті самі embedding dimensions.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`text\` | \`String\` | Yes | — | Текст для embedding. | Не має бути empty; тримайте chunks у межах model context length. |

## Returns

\`Future<EmbeddingResult>\` — future, що повертає один embedding result.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`embedding\` | \`List<double>\` | L2-normalized vector, скопійований у Dart memory. |
| \`tokenCount\` | \`int\` | Кількість tokens у input text. |
| \`dimensions\` | \`int\` | Convenience property з кількістю vector dimensions. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`EmbeddingException\` | \`text\` empty або native embedding fails. | Валідуйте input і підтвердьте model compatibility. |
| \`ModelLoadException\` | Configured model не може бути loaded for embedding. | Перевірте \`modelPath\`, model type і memory budget. |
| \`InitializationException\` / \`EdgeVedaException\` | Runtime не initialized або SDK-level failure. | Спочатку викличте \`init()\` і обробіть typed exceptions. |
| \`MemoryException\` | Model/context перевищує memory limits. | Use smaller embedding model або lower context/memory settings. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final result = await edgeVeda.embed('The quick brown fox');

print('Dimensions: \${result.dimensions}');
print('Tokens: \${result.tokenCount}');
print('Vector head: \${result.embedding.take(5)}');
\`\`\`

## Production-style example

\`\`\`dart
Future<EmbeddingResult> embedQuery(EdgeVeda edgeVeda, String query) async {
  final normalized = query.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('query must not be empty');
  }

  try {
    return await edgeVeda.embed(normalized);
  } on EmbeddingException catch (error) {
    throw Exception('Could not embed query: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`embed()\` не повертає stream.

## Behavior notes

- \`embed()\` потребує core runtime, ініціалізований через \`init()\`.
- Native work виконується в background isolate, щоб не блокувати UI.
- Native model context створюється для call і звільняється після копіювання embedding.
- Returned embedding — Dart-owned \`List<double>\`.
- Embedding dimensions залежать від selected model і мають збігатися з target \`VectorIndex\`.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model type | Embedding models зазвичай менші й швидші за chat models. | Для RAG використовуйте dedicated embedding model. |
| Chunk length | Longer text збільшує tokenization і compute time. | Розбивайте documents на consistent semantic chunks. |
| Single-call model load | \`embed()\` load-ить model для одного input. | Для indexing багатьох chunks використовуйте \`embedBatch()\`. |
| Vector dimensions | Higher dimensions збільшують index size і search cost. | Не змішуйте різні embedding models в одному index. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF embedding model | Yes | Основний supported use case. |
| GGUF chat/instruct LLM | Not recommended | Може давати meaningless embeddings. |
| Vision-language model | No | Для image understanding використовуйте vision APIs. |
| Stable Diffusion model | No | Для цього є image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути повільним. |
| macOS | Yes / package surface | Перевірте file access і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не web-oriented. |

## Privacy and security

- Input data processed: input text.
- Network access during inference: none.
- Local storage used: local model file і optional app-managed vector index.
- Sensitive data considerations: embeddings можуть кодувати private content; захищайте persisted vectors і metadata.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Text cannot be empty\` | Передано empty string. | Trim and validate input. |
| Vector dimensions do not match index | Index створено для іншої embedding model. | Rebuild index з однією consistent model. |
| Poor retrieval quality | Wrong model type або poor chunking. | Use real embedding model і tune chunking. |
| Slow indexing | Repeated \`embed()\` load-ить model для кожного text. | Використовуйте \`embedBatch()\`. |

## Related APIs

- \`EdgeVeda.embedBatch()\` — embeds multiple texts with one model load/unload cycle.
- \`VectorIndex.add()\` — stores embedding vectors for local similarity search.
- \`RagPipeline.query()\` — runs retrieval-augmented generation using embeddings.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.embed()\`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- Empty-text behavior все ще \`EmbeddingException\`.
- Result fields відповідають \`EmbeddingResult\`.
- Example компілюється з real embedding model.
- Model compatibility notes reviewed by maintainer.
`;

window.API_DOCS.content["embed-batch_en"] = `# \`EdgeVeda.embedBatch()\`

> Computes embedding vectors for multiple text strings in one model load/unload cycle.

\`embedBatch()\` validates that the \`EdgeVeda\` instance is initialized, then embeds all input texts in one background-isolate operation. The model is loaded once, reused for every text, and freed after the batch completes. Results are returned in the same order as the input list.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`embedBatch()\` |
| Category | Embeddings / RAG |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<List<EmbeddingResult>> embedBatch(
  List<String> texts, {
  void Function(int completed, int total)? onProgress,
});
\`\`\`

## What it does

\`embedBatch()\` validates that the \`EdgeVeda\` instance is initialized, then embeds all input texts in one background-isolate operation. The model is loaded once, reused for every text, and freed after the batch completes. Results are returned in the same order as the input list.

## When to use it

Use \`embedBatch()\` when you need to:

- build a local vector index from document chunks;
- embed notes, pages, records, or search candidates in bulk;
- prepare a data set for on-device RAG;
- improve throughput compared with repeated \`embed()\` calls.

Do not use this method when:

- you only need one query vector; use \`embed()\`;
- you need generated text; use \`generate()\` or \`generateStream()\`;
- the configured model is not an embedding model;
- you need guaranteed per-item progress UI before confirming current callback behavior.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.init(config)\` has completed successfully;
- \`config.modelPath\` points to a GGUF embedding model;
- input strings are pre-trimmed and chunked to fit the model context length;
- the app has enough memory for the model and result list.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`texts\` | \`List<String>\` | Yes | — | Text items to embed. | Empty list returns \`[]\`. Review empty-string behavior before publishing. |
| \`onProgress\` | \`void Function(int completed, int total)?\` | No | \`null\` | Optional progress callback declared by the API. | Public docs describe per-text progress; confirm actual invocation during source review. |

## Returns

\`Future<List<EmbeddingResult>>\` — a future that resolves to embedding results in input order.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`embedding\` | \`List<double>\` | L2-normalized vector copied into Dart memory. |
| \`tokenCount\` | \`int\` | Number of tokens in the corresponding input text. |
| \`dimensions\` | \`int\` | Convenience property returning vector dimensions. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`EmbeddingException\` | Native embedding fails for one text. | Validate inputs, split long chunks, and retry the failed batch or item. |
| \`ModelLoadException\` | The configured model cannot be loaded. | Verify \`modelPath\`, model type, and memory budget. |
| \`InitializationException\` / \`EdgeVedaException\` | Runtime is not initialized or SDK-level failure occurs. | Call \`init()\` first and handle typed exceptions. |
| \`MemoryException\` | Batch/model exceeds memory limits. | Reduce batch size or use a smaller embedding model. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final results = await edgeVeda.embedBatch([
  'Flutter is a UI framework.',
  'Dart is a programming language.',
  'Edge Veda runs AI models on device.',
]);

print('Embedded \${results.length} texts');
\`\`\`

## Production-style example

\`\`\`dart
Future<List<EmbeddingResult>> embedChunks(
  EdgeVeda edgeVeda,
  List<String> chunks,
) async {
  final cleanChunks = chunks.map((c) => c.trim()).where((c) => c.isNotEmpty).toList();
  if (cleanChunks.isEmpty) return [];

  try {
    return await edgeVeda.embedBatch(
      cleanChunks,
      onProgress: (completed, total) {
        print('Embedding progress: $completed / $total');
      },
    );
  } on EmbeddingException catch (error) {
    throw Exception('Batch embedding failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`embedBatch()\` does not emit a stream.

## Behavior notes

- \`embedBatch()\` requires the core runtime initialized with \`init()\`.
- Empty input list returns an empty result list.
- The whole batch runs in one background isolate.
- The native model context is created once and reused for all texts.
- Results preserve input order.
- Review note: confirm \`onProgress\` callback behavior against current source before documenting UI guarantees.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Batch size | Larger batches reduce load overhead but increase result memory. | Use moderate batches when indexing large corpora. |
| Chunk length | Longer chunks increase embedding latency. | Use consistent chunking with overlap where needed. |
| Model load reuse | One load per batch is faster than one load per text. | Prefer \`embedBatch()\` for indexing workflows. |
| Vector persistence | Persisting many vectors increases storage use. | Store metadata compactly and protect private content. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF embedding model | Yes | Primary supported use case. |
| GGUF chat/instruct LLM | Not recommended | Can produce meaningless embeddings. |
| Vision-language model | No | Use vision APIs for image understanding. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be slower. |
| macOS | Yes / package surface | Validate file access and sandbox behavior. |
| Android | Partial / validation pending | Test on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: list of text strings.
- Network access during inference: none.
- Local storage used: local model file and any app-managed vector index.
- Sensitive data considerations: stored vectors and metadata may reveal semantic information from private documents.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Returns \`[]\` | Input list is empty. | Check upstream chunking and filtering logic. |
| Batch fails partway | One input may be malformed, too long, or unsupported. | Validate and chunk inputs before embedding. |
| High memory use | Batch is too large or vectors are high-dimensional. | Reduce batch size or choose a smaller embedding model. |
| Progress UI does not update | Callback behavior needs source verification. | Do not depend on progress UI until implementation is confirmed. |

## Related APIs

- \`EdgeVeda.embed()\` — embeds one text string.
- \`VectorIndex.add()\` — stores vectors for local search.
- \`RagPipeline.query()\` — uses embeddings for retrieval-augmented generation.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.embedBatch()\`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- Empty list and empty string behavior are documented correctly.
- \`onProgress\` behavior is confirmed against source.
- Result ordering is confirmed.
- Examples compile with a real embedding model.
`;

window.API_DOCS.content["embed-batch_ua"] = `# \`EdgeVeda.embedBatch()\`

> Обчислює embedding vectors для кількох text strings за один model load/unload cycle.

\`embedBatch()\` перевіряє, що \`EdgeVeda\` instance ініціалізований, і embed-ить усі input texts в одній background-isolate operation. Model load-иться один раз, reuse-иться для кожного text і звільняється після завершення batch. Results повертаються в тому самому порядку, що й input list.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`embedBatch()\` |
| Category | Embeddings / RAG |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<List<EmbeddingResult>> embedBatch(
  List<String> texts, {
  void Function(int completed, int total)? onProgress,
});
\`\`\`

## What it does

\`embedBatch()\` перевіряє, що \`EdgeVeda\` instance ініціалізований, і embed-ить усі input texts в одній background-isolate operation. Model load-иться один раз, reuse-иться для кожного text і звільняється після завершення batch. Results повертаються в тому самому порядку, що й input list.

## When to use it

Використовуйте \`embedBatch()\`, коли потрібно:

- побудувати local vector index з document chunks;
- embed-ити notes, pages, records або search candidates bulk-ом;
- підготувати data set для on-device RAG;
- покращити throughput порівняно з repeated \`embed()\` calls.

Не використовуйте цей метод, коли:

- потрібен лише один query vector; використовуйте \`embed()\`;
- потрібен generated text; використовуйте \`generate()\` або \`generateStream()\`;
- configured model не є embedding model;
- потрібна гарантована per-item progress UI до підтвердження callback behavior.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.init(config)\` успішно завершився;
- \`config.modelPath\` вказує на GGUF embedding model;
- input strings pre-trimmed і chunked до model context length;
- app має достатньо memory для model і result list.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`texts\` | \`List<String>\` | Yes | — | Text items для embedding. | Empty list повертає \`[]\`. Перед публікацією review empty-string behavior. |
| \`onProgress\` | \`void Function(int completed, int total)?\` | No | \`null\` | Optional progress callback у public API. | Public docs описують per-text progress; підтвердьте actual invocation during source review. |

## Returns

\`Future<List<EmbeddingResult>>\` — future, що повертає embedding results у input order.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`embedding\` | \`List<double>\` | L2-normalized vector copied into Dart memory. |
| \`tokenCount\` | \`int\` | Number of tokens in the corresponding input text. |
| \`dimensions\` | \`int\` | Convenience property returning vector dimensions. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`EmbeddingException\` | Native embedding fails для одного text. | Validate inputs, split long chunks і retry failed batch/item. |
| \`ModelLoadException\` | Configured model не може бути loaded. | Перевірте \`modelPath\`, model type і memory budget. |
| \`InitializationException\` / \`EdgeVedaException\` | Runtime не initialized або SDK-level failure. | Спочатку викличте \`init()\` і обробіть typed exceptions. |
| \`MemoryException\` | Batch/model перевищує memory limits. | Reduce batch size або use smaller embedding model. |

## Minimal example

\`\`\`dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final results = await edgeVeda.embedBatch([
  'Flutter is a UI framework.',
  'Dart is a programming language.',
  'Edge Veda runs AI models on device.',
]);

print('Embedded \${results.length} texts');
\`\`\`

## Production-style example

\`\`\`dart
Future<List<EmbeddingResult>> embedChunks(
  EdgeVeda edgeVeda,
  List<String> chunks,
) async {
  final cleanChunks = chunks.map((c) => c.trim()).where((c) => c.isNotEmpty).toList();
  if (cleanChunks.isEmpty) return [];

  try {
    return await edgeVeda.embedBatch(
      cleanChunks,
      onProgress: (completed, total) {
        print('Embedding progress: $completed / $total');
      },
    );
  } on EmbeddingException catch (error) {
    throw Exception('Batch embedding failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`embedBatch()\` не повертає stream.

## Behavior notes

- \`embedBatch()\` потребує core runtime, ініціалізований через \`init()\`.
- Empty input list повертає empty result list.
- Увесь batch виконується в одному background isolate.
- Native model context створюється один раз і reuse-иться для всіх texts.
- Results preserve input order.
- Review note: confirm \`onProgress\` callback behavior against current source before UI guarantees.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Batch size | Larger batches зменшують load overhead, але збільшують result memory. | Для великих corpora використовуйте moderate batches. |
| Chunk length | Longer chunks збільшують embedding latency. | Use consistent chunking з overlap where needed. |
| Model load reuse | One load per batch швидше, ніж one load per text. | Для indexing workflows використовуйте \`embedBatch()\`. |
| Vector persistence | Persisting many vectors збільшує storage use. | Store metadata compactly і protect private content. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF embedding model | Yes | Primary supported use case. |
| GGUF chat/instruct LLM | Not recommended | Can produce meaningless embeddings. |
| Vision-language model | No | Use vision APIs for image understanding. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути повільним. |
| macOS | Yes / package surface | Перевірте file access і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не web-oriented. |

## Privacy and security

- Input data processed: list of text strings.
- Network access during inference: none.
- Local storage used: local model file і app-managed vector index.
- Sensitive data considerations: stored vectors і metadata можуть розкривати semantic information з private documents.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Returns \`[]\` | Input list is empty. | Перевірте upstream chunking/filtering logic. |
| Batch fails partway | Один input може бути malformed, too long або unsupported. | Validate and chunk inputs before embedding. |
| High memory use | Batch too large або vectors high-dimensional. | Reduce batch size або choose smaller embedding model. |
| Progress UI does not update | Callback behavior needs source verification. | Не залежте від progress UI, доки implementation не підтверджено. |

## Related APIs

- \`EdgeVeda.embed()\` — embeds one text string.
- \`VectorIndex.add()\` — stores vectors for local search.
- \`RagPipeline.query()\` — uses embeddings for retrieval-augmented generation.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.embedBatch()\`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- Empty list і empty string behavior documented correctly.
- \`onProgress\` behavior confirmed against source.
- Result ordering confirmed.
- Examples compile with a real embedding model.
`;

window.API_DOCS.content["describe-image_en"] = `# \`EdgeVeda.describeImage()\`

> Generates a text description of an RGB image using the initialized vision-language model.

\`describeImage()\` validates that vision has been initialized, checks that \`imageBytes.length == width * height * 3\`, initializes a native vision context in a background isolate, runs visual-language inference with the supplied prompt and generation options, and returns the generated text description. The image must be RGB888 bytes, not JPEG, PNG, BGRA, or YUV420 directly.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`describeImage()\` |
| Category | Vision / Image understanding |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — vision runtime via \`initVision()\` |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<String> describeImage(
  Uint8List imageBytes, {
  required int width,
  required int height,
  String prompt = 'Describe this image.',
  GenerateOptions? options,
});
\`\`\`

## What it does

\`describeImage()\` validates that vision has been initialized, checks that \`imageBytes.length == width * height * 3\`, initializes a native vision context in a background isolate, runs visual-language inference with the supplied prompt and generation options, and returns the generated text description. The image must be RGB888 bytes, not JPEG, PNG, BGRA, or YUV420 directly.

## When to use it

Use \`describeImage()\` when you need to:

- describe a still image locally;
- ask a visual question about an image using a custom prompt;
- process converted camera frames without sending images to a server;
- build accessibility, inspection, document understanding, or camera-assistant features.

Do not use this method when:

- vision has not been initialized with \`initVision()\`;
- the image is not RGB888;
- you need continuous frame processing with a persistent worker; use \`VisionWorker.describeFrame()\`;
- you need text-only generation; use \`generate()\` or \`generateStream()\`.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.initVision(config)\` has completed successfully;
- \`VisionConfig.modelPath\` points to a VLM GGUF file;
- \`VisionConfig.mmprojPath\` points to the matching multimodal projector file;
- \`imageBytes.length == width * height * 3\`;
- camera or file permissions are handled by the app.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`imageBytes\` | \`Uint8List\` | Yes | — | RGB888 image bytes. | Must contain exactly \`width * height * 3\` bytes. |
| \`width\` | \`int\` | Yes | — | Image width in pixels. | Must match \`imageBytes\`. |
| \`height\` | \`int\` | Yes | — | Image height in pixels. | Must match \`imageBytes\`. |
| \`prompt\` | \`String\` | No | \`'Describe this image.'\` | Text prompt for the VLM. | Use task-specific prompts for better output. |
| \`options\` | \`GenerateOptions?\` | No | \`const GenerateOptions(maxTokens: 256)\` | Generation controls such as \`maxTokens\`, \`temperature\`, \`topP\`, \`topK\`, and \`repeatPenalty\`. | Some text-only options may not affect vision output. |

## Returns

\`Future<String>\` — a future that resolves to the generated text description.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`String\` | Generated text description of the image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`VisionException\` | Vision is not initialized, image byte count mismatches RGB size, native vision init fails, or native describe fails. | Call \`initVision()\`, validate image format/dimensions, and use compatible VLM files. |
| \`ConfigurationException\` / \`EdgeVedaException\` | Invalid generation options or SDK-level failure. | Validate options and handle typed exceptions. |
| \`MemoryException\` | Vision model/projector or image processing exceeds memory. | Reduce resolution, choose a smaller VLM, or lower memory settings. |

## Minimal example

\`\`\`dart
await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  useGpu: true,
));

final description = await edgeVeda.describeImage(
  rgbBytes,
  width: 640,
  height: 480,
  prompt: 'What objects are visible in this image?',
);

print(description);
\`\`\`

## Production-style example

\`\`\`dart
Future<String> describeCameraFrame(
  EdgeVeda edgeVeda,
  Uint8List rgbBytes,
  int width,
  int height,
) async {
  final expectedBytes = width * height * 3;
  if (rgbBytes.length != expectedBytes) {
    throw ArgumentError('Expected $expectedBytes RGB bytes, got \${rgbBytes.length}');
  }

  try {
    return await edgeVeda.describeImage(
      rgbBytes,
      width: width,
      height: height,
      prompt: 'Describe the scene and mention safety-relevant objects.',
      options: const GenerateOptions(maxTokens: 120, temperature: 0.2),
    );
  } on VisionException catch (error) {
    throw Exception('Vision inference failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`describeImage()\` does not emit a stream.

## Behavior notes

- \`describeImage()\` uses the vision configuration set by \`initVision()\`.
- Vision context is separate from the core text runtime initialized by \`init()\`.
- The method expects RGB888 bytes and validates byte length before native inference.
- Native vision work runs in a background isolate to avoid blocking the UI.
- The method returns text only; timing details are available from lower-level \`VisionWorker.describeFrame()\` responses.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image resolution | Larger images increase encoding and inference cost. | Start with 640px or lower for mobile vision tasks. |
| VLM size | Larger VLMs increase memory and latency. | Use SmolVLM-class models for mobile-first scenarios. |
| \`maxTokens\` | Higher values increase decode time. | Use task-specific short limits for camera flows. |
| Repeated frames | One-off calls may reinitialize context. | Use \`VisionWorker.describeFrame()\` for continuous vision. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF vision-language model + mmproj | Yes | Requires matching VLM and multimodal projector files. |
| GGUF chat/instruct LLM | No for image input | Use text generation APIs for text-only prompts. |
| GGUF embedding model | No | Use embeddings APIs for text vectors. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference. |
| iOS simulator | Partial | CPU-only behavior may be slower. |
| macOS | Yes / package surface | Validate file access and sandbox behavior. |
| Android | Partial / validation pending | Test on target hardware before publishing performance claims. |
| Web | No | Native runtime dependency is not web-oriented. |

## Privacy and security

- Input data processed: RGB image bytes and prompt text.
- Network access during inference: none.
- Local storage used: VLM model and mmproj files.
- Sensitive data considerations: images may contain faces, documents, screens, addresses, or other private content; avoid logging raw images or generated descriptions unless needed.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Vision not initialized\` | \`initVision()\` was not called or failed. | Initialize vision first and verify both model files exist. |
| Byte count mismatch | Image is not RGB888 or dimensions are wrong. | Convert camera frames to RGB888 and pass correct width/height. |
| Slow response | Image is too large or VLM is large. | Reduce resolution or lower \`maxTokens\`. |
| Poor description | Prompt is too vague or VLM is not suited to the task. | Use a targeted prompt and compatible VLM/mmproj pair. |

## Related APIs

- \`EdgeVeda.initVision()\` — initializes the VLM and mmproj configuration.
- \`EdgeVeda.disposeVision()\` — releases vision resources.
- \`VisionWorker.describeFrame()\` — lower-level persistent-worker API with timing metadata.
- \`CameraUtils.convertBgraToRgb()\` / \`convertYuv420ToRgb()\` — converts camera data to RGB888.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.describeImage()\`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- RGB888 requirement and byte-count validation are correct.
- \`GenerateOptions\` fields used by vision are current.
- Examples compile with actual VLM and mmproj files.
- Memory/performance notes are reviewed on physical devices.
`;

window.API_DOCS.content["describe-image_ua"] = `# \`EdgeVeda.describeImage()\`

> Генерує text description для RGB image за допомогою ініціалізованої vision-language model.

\`describeImage()\` перевіряє, що vision initialized, перевіряє \`imageBytes.length == width * height * 3\`, ініціалізує native vision context у background isolate, запускає visual-language inference з prompt/options і повертає generated text description. Image має бути RGB888 bytes, а не JPEG, PNG, BGRA або YUV420 напряму.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`describeImage()\` |
| Category | Vision / Image understanding |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — vision runtime через \`initVision()\` |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<String> describeImage(
  Uint8List imageBytes, {
  required int width,
  required int height,
  String prompt = 'Describe this image.',
  GenerateOptions? options,
});
\`\`\`

## What it does

\`describeImage()\` перевіряє, що vision initialized, перевіряє \`imageBytes.length == width * height * 3\`, ініціалізує native vision context у background isolate, запускає visual-language inference з prompt/options і повертає generated text description. Image має бути RGB888 bytes, а не JPEG, PNG, BGRA або YUV420 напряму.

## When to use it

Використовуйте \`describeImage()\`, коли потрібно:

- описати still image локально;
- поставити visual question до image через custom prompt;
- обробляти converted camera frames без відправки images на server;
- будувати accessibility, inspection, document understanding або camera-assistant features.

Не використовуйте цей метод, коли:

- vision не ініціалізовано через \`initVision()\`;
- image не у RGB888 format;
- потрібна continuous frame processing з persistent worker; використовуйте \`VisionWorker.describeFrame()\`;
- потрібна text-only generation; використовуйте \`generate()\` або \`generateStream()\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.initVision(config)\` успішно завершився;
- \`VisionConfig.modelPath\` вказує на VLM GGUF file;
- \`VisionConfig.mmprojPath\` вказує на matching multimodal projector file;
- \`imageBytes.length == width * height * 3\`; 
- camera/file permissions оброблені application layer.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`imageBytes\` | \`Uint8List\` | Yes | — | RGB888 image bytes. | Має містити рівно \`width * height * 3\` bytes. |
| \`width\` | \`int\` | Yes | — | Image width in pixels. | Має відповідати \`imageBytes\`. |
| \`height\` | \`int\` | Yes | — | Image height in pixels. | Має відповідати \`imageBytes\`. |
| \`prompt\` | \`String\` | No | \`'Describe this image.'\` | Text prompt для VLM. | Для кращого output використовуйте task-specific prompts. |
| \`options\` | \`GenerateOptions?\` | No | \`const GenerateOptions(maxTokens: 256)\` | Generation controls: \`maxTokens\`, \`temperature\`, \`topP\`, \`topK\`, \`repeatPenalty\`. | Деякі text-only options можуть не впливати на vision output. |

## Returns

\`Future<String>\` — future, що повертає generated text description.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`String\` | Generated text description of the image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`VisionException\` | Vision не initialized, image byte count mismatch, native vision init fails або native describe fails. | Викличте \`initVision()\`, validate image format/dimensions і use compatible VLM files. |
| \`ConfigurationException\` / \`EdgeVedaException\` | Invalid generation options або SDK-level failure. | Validate options і handle typed exceptions. |
| \`MemoryException\` | Vision model/projector або image processing перевищує memory. | Reduce resolution, choose smaller VLM або lower memory settings. |

## Minimal example

\`\`\`dart
await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  useGpu: true,
));

final description = await edgeVeda.describeImage(
  rgbBytes,
  width: 640,
  height: 480,
  prompt: 'What objects are visible in this image?',
);

print(description);
\`\`\`

## Production-style example

\`\`\`dart
Future<String> describeCameraFrame(
  EdgeVeda edgeVeda,
  Uint8List rgbBytes,
  int width,
  int height,
) async {
  final expectedBytes = width * height * 3;
  if (rgbBytes.length != expectedBytes) {
    throw ArgumentError('Expected $expectedBytes RGB bytes, got \${rgbBytes.length}');
  }

  try {
    return await edgeVeda.describeImage(
      rgbBytes,
      width: width,
      height: height,
      prompt: 'Describe the scene and mention safety-relevant objects.',
      options: const GenerateOptions(maxTokens: 120, temperature: 0.2),
    );
  } on VisionException catch (error) {
    throw Exception('Vision inference failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`describeImage()\` не повертає stream.

## Behavior notes

- \`describeImage()\` використовує vision configuration, встановлену через \`initVision()\`.
- Vision context окремий від core text runtime, ініціалізованого через \`init()\`.
- Метод очікує RGB888 bytes і валідовує byte length before native inference.
- Native vision work виконується в background isolate, щоб не блокувати UI.
- Метод повертає тільки text; timing details доступні через lower-level \`VisionWorker.describeFrame()\` responses.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image resolution | Larger images збільшують encoding і inference cost. | Починайте з 640px або нижче для mobile vision tasks. |
| VLM size | Larger VLMs збільшують memory і latency. | Використовуйте SmolVLM-class models для mobile-first scenarios. |
| \`maxTokens\` | Higher values збільшують decode time. | Use task-specific short limits for camera flows. |
| Repeated frames | One-off calls можуть reinitialize context. | Для continuous vision використовуйте \`VisionWorker.describeFrame()\`. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF vision-language model + mmproj | Yes | Requires matching VLM and multimodal projector files. |
| GGUF chat/instruct LLM | No for image input | Use text generation APIs for text-only prompts. |
| GGUF embedding model | No | Use embeddings APIs for text vectors. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference. |
| iOS simulator | Partial | CPU-only behavior може бути повільним. |
| macOS | Yes / package surface | Перевірте file access і sandbox behavior. |
| Android | Partial / validation pending | Тестуйте на target hardware перед performance claims. |
| Web | No | Native runtime dependency не web-oriented. |

## Privacy and security

- Input data processed: RGB image bytes і prompt text.
- Network access during inference: none.
- Local storage used: VLM model і mmproj files.
- Sensitive data considerations: images можуть містити faces, documents, screens, addresses або private content; не логуйте raw images/generated descriptions без потреби.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Vision not initialized\` | \`initVision()\` не викликано або failed. | Initialize vision first and verify both model files exist. |
| Byte count mismatch | Image не RGB888 або dimensions wrong. | Convert camera frames to RGB888 and pass correct width/height. |
| Slow response | Image too large або VLM large. | Reduce resolution або lower \`maxTokens\`. |
| Poor description | Prompt too vague або VLM not suited to task. | Use targeted prompt and compatible VLM/mmproj pair. |

## Related APIs

- \`EdgeVeda.initVision()\` — initializes the VLM and mmproj configuration.
- \`EdgeVeda.disposeVision()\` — releases vision resources.
- \`VisionWorker.describeFrame()\` — lower-level persistent-worker API with timing metadata.
- \`CameraUtils.convertBgraToRgb()\` / \`convertYuv420ToRgb()\` — converts camera data to RGB888.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.describeImage()\`
- Related documentation scope: public Dart API coverage and usage examples

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- RGB888 requirement and byte-count validation are correct.
- \`GenerateOptions\` fields used by vision are current.
- Examples compile with actual VLM and mmproj files.
- Memory/performance notes reviewed on physical devices.
`;

window.API_DOCS.content["generate-image_en"] = `# \`EdgeVeda.generateImage()\`

> Generates a PNG-encoded image from a text prompt using the initialized Stable Diffusion worker.

\`generateImage()\` is the high-level image generation API. It returns PNG bytes that can be saved, uploaded, or displayed with standard Flutter image widgets.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generateImage()\` |
| Category | Image generation / Text-to-image |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — image generation must be initialized |
| Supports streaming | No; progress callback available |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

Additional imports for examples:

\`\`\`dart
import 'dart:io';
import 'dart:typed_data';
\`\`\`

## Signature

\`\`\`dart
Future<Uint8List> generateImage(
  String prompt, {
  ImageGenerationConfig? config,
  void Function(ImageProgress)? onProgress,
});
\`\`\`

## What it does

\`generateImage()\` validates initialization and prompt text, applies Scheduler pause checks, runs the image worker generation stream, forwards per-step progress callbacks, requires a completion response, reports generation latency to the Scheduler, resets the idle timer, and encodes returned raw pixels into PNG bytes using the \`image\` package.

## When to use it

Use \`generateImage()\` when you need to:

- create images from text prompts using an initialized Stable Diffusion model;
- provide progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse the persistent image worker for multiple generations.
- return a PNG file format directly without manual encoding.

Do not use this method when:

- image generation has not been initialized with \`initImageGeneration()\`;
- the prompt is empty;
- the Scheduler has paused the image workload because of thermal or battery pressure;
- you need image understanding rather than image generation; use vision APIs.
- you need raw pixels for canvas or a processing pipeline; use \`generateImageRaw()\`.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.initImageGeneration(modelPath: ...)\` has completed successfully;
- prompt text is non-empty and suitable for the selected SD model;
- image size, steps, CFG scale, sampler, and schedule are compatible with the model and device;
- the app handles progress callbacks and generation failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Text prompt for image generation. | Must not be empty. |
| \`config\` | \`ImageGenerationConfig?\` | No | \`const ImageGenerationConfig()\` | Per-generation settings. | Defaults target SD Turbo: 512×512, 4 steps, CFG 1.0, Euler A sampler. |
| \`onProgress\` | \`void Function(ImageProgress)?\` | No | \`null\` | Callback fired once per denoising step. | Receives \`step\`, \`totalSteps\`, \`elapsedSeconds\`, and derived \`progress\`. |

## Returns

\`Future<Uint8List>\` — PNG-encoded bytes for the generated image.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`Uint8List\` | A byte array containing a PNG-encoded image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`ImageGenerationException\` | Image generation is not initialized or worker is missing. | Call \`initImageGeneration()\` first and retry. |
| \`ImageGenerationException\` | Prompt is empty. | Trim and validate prompt before calling. |
| \`ImageGenerationException\` | Scheduler has paused image generation due to thermal or battery pressure. | Retry when device conditions improve or adjust Scheduler policy. |
| \`ImageGenerationException\` | Generation stream completes without a final result. | Retry, reduce image size/steps, or reinitialize the image worker. |
| Worker/native error | Stable Diffusion backend fails during generation. | Check model compatibility, memory, and device logs. |

## Minimal example

\`\`\`dart
final pngBytes = await edgeVeda.generateImage(
  'a sunset over mountains, oil painting style',
);

await File('output.png').writeAsBytes(pngBytes);
\`\`\`

## Production-style example

\`\`\`dart
Future<Uint8List> createPreviewImage(
  EdgeVeda edgeVeda,
  String prompt,
) async {
  final normalized = prompt.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('prompt must not be empty');
  }

  try {
    return await edgeVeda.generateImage(
      normalized,
      config: const ImageGenerationConfig(
        width: 512,
        height: 512,
        steps: 4,
        cfgScale: 1.0,
        seed: 42,
      ),
      onProgress: (progress) {
        debugPrint(
          'Image step \${progress.step}/\${progress.totalSteps} '
          '(\${(progress.progress * 100).toStringAsFixed(0)}%)',
        );
      },
    );
  } on ImageGenerationException catch (error) {
    throw Exception('Image generation failed: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`generateImage()\` returns one PNG byte array. Use \`onProgress\` for per-step progress updates.

## Behavior notes

- The method requires \`initImageGeneration()\` and an active \`_imageWorker\`.
- Empty prompts are rejected before work starts.
- If a Scheduler is connected and QoS knobs pause image generation, the method throws instead of starting a workload.
- The image idle timer is cancelled during generation and reset after completion.
- Progress callbacks are emitted for \`ImageProgressResponse\` messages.
- Generation latency is reported to the Scheduler for budget enforcement.
- The final raw RGB output is encoded to PNG before the method returns.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory and latency. | Start with 512×512 and validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models for mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions and surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while the model is loaded, then dispose when done. |
| PNG encoding | PNG encoding adds CPU work after diffusion finishes. | Use \`generateImageRaw()\` when the next pipeline accepts raw pixels. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family for image generation through stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation such as 4 steps and CFG 1.0. |
| GGUF text LLM | No | Use text generation APIs. |
| GGUF VLM | No | Use vision APIs. |
| GGUF embedding model | No | Use embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only or stub behavior can be much slower than physical devices. |
| macOS | Yes / package surface | Validate sandbox, file access, and available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path is scaffolded; test on target hardware before publishing claims. |
| Web | No | Requires native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: prompt, optional negative prompt, generation configuration.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file; output image persistence is app-controlled.
- Sensitive data considerations: generated images and prompts can reveal user intent; avoid logging prompts or saving outputs without consent.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Image generation not initialized\` | \`initImageGeneration()\` was not called or failed. | Initialize image generation first and verify \`isImageInitialized\`. |
| \`Prompt cannot be empty\` | Empty or whitespace-only prompt. | Validate the prompt before calling. |
| Generation paused by Scheduler | Thermal or battery pressure activated pause QoS. | Wait, cool the device, charge battery, or adjust budget policy. |
| No result returned | Worker stream did not emit completion. | Retry with smaller settings or reinitialize worker. |
| Generation is slow | Large model, high resolution, too many steps, or CPU fallback. | Use SD Turbo settings and test on device. |

## Related APIs

- \`EdgeVeda.initImageGeneration()\` — initializes the Stable Diffusion worker first.
- \`EdgeVeda.generateImageRaw()\` — returns raw RGB data without PNG encoding.
- \`EdgeVeda.disposeImageGeneration()\` — releases SD model and image worker resources.
- \`ImageGenerationConfig\` — controls width, height, steps, sampler, schedule, CFG, and seed.
- \`ImageProgress\` — progress callback payload.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.generateImage()\`
- Related config type: \`ImageGenerationConfig\`
- Related progress type: \`ImageProgress\`
- Related worker: \`ImageWorker\`

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- PNG encoding behavior is still implemented with the \`image\` package.
- Scheduler pause behavior and latency reporting are accurate.
- \`ImageGenerationConfig\` defaults are current.
- Examples compile and include realistic error handling.
`;

window.API_DOCS.content["generate-image_ua"] = `# \`EdgeVeda.generateImage()\`

> Генерує PNG-encoded image з text prompt через initialized Stable Diffusion worker.

\`generateImage()\` — high-level image generation API. Він повертає PNG bytes, які можна save, upload або display через standard Flutter image widgets.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generateImage()\` |
| Category | Image generation / Text-to-image |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — image generation має бути initialized |
| Supports streaming | No; progress callback available |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

Додаткові imports для examples:

\`\`\`dart
import 'dart:io';
import 'dart:typed_data';
\`\`\`

## Signature

\`\`\`dart
Future<Uint8List> generateImage(
  String prompt, {
  ImageGenerationConfig? config,
  void Function(ImageProgress)? onProgress,
});
\`\`\`

## What it does

\`generateImage()\` validates initialization і prompt text, applies Scheduler pause checks, запускає image worker generation stream, forwards per-step progress callbacks, requires completion response, reports generation latency to Scheduler, resets idle timer і encodes returned raw pixels into PNG bytes через \`image\` package.

## When to use it

Використовуйте \`generateImage()\` коли потрібно:

- створювати images з text prompts через initialized Stable Diffusion model;
- показувати progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse persistent image worker for multiple generations.
- отримати PNG file format directly без manual encoding.

Не використовуйте цей метод, коли:

- image generation не initialized через \`initImageGeneration()\`;
- prompt empty;
- Scheduler paused image workload через thermal/battery pressure;
- потрібне image understanding, а не image generation; використовуйте vision APIs.
- потрібні raw pixels для canvas або processing pipeline; використовуйте \`generateImageRaw()\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.initImageGeneration(modelPath: ...)\` успішно завершився;
- prompt text non-empty і suitable для selected SD model;
- image size, steps, CFG scale, sampler і schedule compatible with model/device;
- app handles progress callbacks і generation failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Text prompt для image generation. | Must not be empty. |
| \`config\` | \`ImageGenerationConfig?\` | No | \`const ImageGenerationConfig()\` | Per-generation settings. | Defaults target SD Turbo: 512×512, 4 steps, CFG 1.0, Euler A sampler. |
| \`onProgress\` | \`void Function(ImageProgress)?\` | No | \`null\` | Callback fires once per denoising step. | Receives \`step\`, \`totalSteps\`, \`elapsedSeconds\` і derived \`progress\`. |

## Returns

\`Future<Uint8List>\` — PNG-encoded bytes для generated image.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`Uint8List\` | Byte array, що містить PNG-encoded image. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`ImageGenerationException\` | Image generation not initialized або worker missing. | Call \`initImageGeneration()\` first and retry. |
| \`ImageGenerationException\` | Prompt empty. | Trim and validate prompt before calling. |
| \`ImageGenerationException\` | Scheduler paused image generation due to thermal/battery pressure. | Retry when device conditions improve або adjust Scheduler policy. |
| \`ImageGenerationException\` | Generation stream completes without final result. | Retry, reduce image size/steps або reinitialize image worker. |
| Worker/native error | Stable Diffusion backend fails during generation. | Check model compatibility, memory і device logs. |

## Minimal example

\`\`\`dart
final pngBytes = await edgeVeda.generateImage(
  'a sunset over mountains, oil painting style',
);

await File('output.png').writeAsBytes(pngBytes);
\`\`\`

## Production-style example

\`\`\`dart
Future<Uint8List> createPreviewImage(
  EdgeVeda edgeVeda,
  String prompt,
) async {
  final normalized = prompt.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('prompt must not be empty');
  }

  try {
    return await edgeVeda.generateImage(
      normalized,
      config: const ImageGenerationConfig(
        width: 512,
        height: 512,
        steps: 4,
        cfgScale: 1.0,
        seed: 42,
      ),
      onProgress: (progress) {
        debugPrint(
          'Image step \${progress.step}/\${progress.totalSteps} '
          '(\${(progress.progress * 100).toStringAsFixed(0)}%)',
        );
      },
    );
  } on ImageGenerationException catch (error) {
    throw Exception('Image generation failed: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`generateImage()\` повертає one PNG byte array. Використовуйте \`onProgress\` для per-step progress updates.

## Behavior notes

- Метод потребує \`initImageGeneration()\` і active \`_imageWorker\`.
- Empty prompts rejected before work starts.
- If Scheduler connected and QoS knobs pause image generation, method throws instead of starting workload.
- Image idle timer cancelled during generation і reset after completion.
- Progress callbacks emitted for \`ImageProgressResponse\` messages.
- Generation latency reported to Scheduler for budget enforcement.
- Final raw RGB output encoded to PNG before method returns.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory і latency. | Start with 512×512 і validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models для mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions і surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while model loaded, then dispose when done. |
| PNG encoding | PNG encoding adds CPU work after diffusion finishes. | Use \`generateImageRaw()\`, якщо next pipeline accepts raw pixels. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family для image generation через stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation, наприклад 4 steps і CFG 1.0. |
| GGUF text LLM | No | Для цього є text generation APIs. |
| GGUF VLM | No | Для цього є vision APIs. |
| GGUF embedding model | No | Для цього є embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only або stub behavior може бути значно повільнішим, ніж physical devices. |
| macOS | Yes / package surface | Перевірте sandbox, file access і available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед claims. |
| Web | No | Потребує native runtime/FFI і local model files. |

## Privacy and security

- Input data processed: prompt, optional negative prompt, generation configuration.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file; output image persistence controlled by app.
- Sensitive data considerations: generated images і prompts можуть reveal user intent; avoid logging prompts або saving outputs without consent.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Image generation not initialized\` | \`initImageGeneration()\` not called або failed. | Initialize image generation first and verify \`isImageInitialized\`. |
| \`Prompt cannot be empty\` | Empty або whitespace-only prompt. | Validate prompt before calling. |
| Generation paused by Scheduler | Thermal/battery pressure activated pause QoS. | Wait, cool device, charge battery або adjust budget policy. |
| No result returned | Worker stream did not emit completion. | Retry with smaller settings або reinitialize worker. |
| Generation is slow | Large model, high resolution, too many steps або CPU fallback. | Use SD Turbo settings і test on device. |

## Related APIs

- \`EdgeVeda.initImageGeneration()\` — initializes Stable Diffusion worker first.
- \`EdgeVeda.generateImageRaw()\` — returns raw RGB data without PNG encoding.
- \`EdgeVeda.disposeImageGeneration()\` — releases SD model і image worker resources.
- \`ImageGenerationConfig\` — controls width, height, steps, sampler, schedule, CFG, seed.
- \`ImageProgress\` — progress callback payload.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.generateImage()\`
- Related config type: \`ImageGenerationConfig\`
- Related progress type: \`ImageProgress\`
- Related worker: \`ImageWorker\`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- PNG encoding behavior still implemented with \`image\` package.
- Scheduler pause behavior і latency reporting accurate.
- \`ImageGenerationConfig\` defaults current.
- Examples compile and include realistic error handling.
`;

window.API_DOCS.content["generate-image-raw_en"] = `# \`EdgeVeda.generateImageRaw()\`

> Generates an image from a text prompt and returns raw RGB pixel data with metadata.

Use \`generateImageRaw()\` when the next step needs raw pixels rather than a PNG file, such as a canvas, custom renderer, image processing pipeline, or manual encoder.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generateImageRaw()\` |
| Category | Image generation / Raw text-to-image |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — image generation must be initialized |
| Supports streaming | No; progress callback available |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<ImageResult> generateImageRaw(
  String prompt, {
  ImageGenerationConfig? config,
  void Function(ImageProgress)? onProgress,
});
\`\`\`

## What it does

\`generateImageRaw()\` follows the same validation, Scheduler pause check, worker generation stream, progress callback, latency reporting, and idle-timer reset behavior as \`generateImage()\`. Instead of encoding PNG bytes, it returns an \`ImageResult\` with raw pixel data, width, height, channel count, and generation time.

## When to use it

Use \`generateImageRaw()\` when you need to:

- create images from text prompts using an initialized Stable Diffusion model;
- provide progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse the persistent image worker for multiple generations.
- avoid PNG encoding overhead when raw pixels are enough;
- pass generated pixels to a custom image-processing pipeline.

Do not use this method when:

- image generation has not been initialized with \`initImageGeneration()\`;
- the prompt is empty;
- the Scheduler has paused the image workload because of thermal or battery pressure;
- you need image understanding rather than image generation; use vision APIs.
- you need a ready-to-save PNG byte array; use \`generateImage()\`.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.initImageGeneration(modelPath: ...)\` has completed successfully;
- prompt text is non-empty and suitable for the selected SD model;
- image size, steps, CFG scale, sampler, and schedule are compatible with the model and device;
- the app handles progress callbacks and generation failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Text prompt for image generation. | Must not be empty. |
| \`config\` | \`ImageGenerationConfig?\` | No | \`const ImageGenerationConfig()\` | Per-generation settings. | Defaults target SD Turbo: 512×512, 4 steps, CFG 1.0, Euler A sampler. |
| \`onProgress\` | \`void Function(ImageProgress)?\` | No | \`null\` | Callback fired once per denoising step. | Receives \`step\`, \`totalSteps\`, \`elapsedSeconds\`, and derived \`progress\`. |

## Returns

\`Future<ImageResult>\` — an object containing raw RGB pixel data and generation metadata.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`pixelData\` | \`Uint8List\` | Raw pixel data, typically RGB bytes. |
| \`width\` | \`int\` | Image width in pixels. |
| \`height\` | \`int\` | Image height in pixels. |
| \`channels\` | \`int\` | Number of color channels; \`3\` for RGB. |
| \`generationTimeMs\` | \`double\` | Total generation time in milliseconds. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`ImageGenerationException\` | Image generation is not initialized or worker is missing. | Call \`initImageGeneration()\` first and retry. |
| \`ImageGenerationException\` | Prompt is empty. | Trim and validate prompt before calling. |
| \`ImageGenerationException\` | Scheduler has paused image generation due to thermal or battery pressure. | Retry when device conditions improve or adjust Scheduler policy. |
| \`ImageGenerationException\` | Generation stream completes without a final result. | Retry, reduce image size/steps, or reinitialize the image worker. |
| Worker/native error | Stable Diffusion backend fails during generation. | Check model compatibility, memory, and device logs. |

## Minimal example

\`\`\`dart
final result = await edgeVeda.generateImageRaw(
  'a small robot reading documentation',
);

print('\${result.width}x\${result.height}, channels=\${result.channels}');
print('Generated in \${result.generationTimeMs} ms');
\`\`\`

## Production-style example

\`\`\`dart
Future<ImageResult> createRawImageForPipeline(
  EdgeVeda edgeVeda,
  String prompt,
) async {
  final normalized = prompt.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('prompt must not be empty');
  }

  try {
    final result = await edgeVeda.generateImageRaw(
      normalized,
      config: const ImageGenerationConfig(
        width: 512,
        height: 512,
        steps: 4,
        cfgScale: 1.0,
      ),
      onProgress: (progress) {
        debugPrint('Raw image progress: \${progress.step}/\${progress.totalSteps}');
      },
    );

    if (result.pixelData.length != result.width * result.height * result.channels) {
      throw StateError('Unexpected pixel buffer size');
    }

    return result;
  } on ImageGenerationException catch (error) {
    throw Exception('Raw image generation failed: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`generateImageRaw()\` returns one \`ImageResult\`. Use \`onProgress\` for per-step progress updates.

## Behavior notes

- The method requires \`initImageGeneration()\` and an active \`_imageWorker\`.
- Empty prompts are rejected before work starts.
- If a Scheduler is connected and QoS knobs pause image generation, the method throws instead of starting a workload.
- The image idle timer is cancelled during generation and reset after completion.
- Progress callbacks are emitted for \`ImageProgressResponse\` messages.
- Generation latency is reported to the Scheduler for budget enforcement.
- The final response is wrapped in \`ImageResult\` without PNG/JPEG encoding.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory and latency. | Start with 512×512 and validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models for mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions and surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while the model is loaded, then dispose when done. |
| Raw output | Avoids PNG encoding CPU cost and extra allocation. | Prefer this method for custom renderers and processing pipelines. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family for image generation through stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation such as 4 steps and CFG 1.0. |
| GGUF text LLM | No | Use text generation APIs. |
| GGUF VLM | No | Use vision APIs. |
| GGUF embedding model | No | Use embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only or stub behavior can be much slower than physical devices. |
| macOS | Yes / package surface | Validate sandbox, file access, and available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path is scaffolded; test on target hardware before publishing claims. |
| Web | No | Requires native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: prompt, optional negative prompt, generation configuration.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file; output image persistence is app-controlled.
- Sensitive data considerations: generated images and prompts can reveal user intent; avoid logging prompts or saving outputs without consent.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Image generation not initialized\` | \`initImageGeneration()\` was not called or failed. | Initialize image generation first and verify \`isImageInitialized\`. |
| \`Prompt cannot be empty\` | Empty or whitespace-only prompt. | Validate the prompt before calling. |
| Generation paused by Scheduler | Thermal or battery pressure activated pause QoS. | Wait, cool the device, charge battery, or adjust budget policy. |
| No result returned | Worker stream did not emit completion. | Retry with smaller settings or reinitialize worker. |
| Generation is slow | Large model, high resolution, too many steps, or CPU fallback. | Use SD Turbo settings and test on device. |
| Pixel buffer size mismatch | Unexpected native result or incorrect channel assumption. | Validate \`width * height * channels\` before using the buffer. |

## Related APIs

- \`EdgeVeda.initImageGeneration()\` — initializes the Stable Diffusion worker first.
- \`EdgeVeda.generateImage()\` — returns PNG-encoded bytes.
- \`ImageResult\` — result type for raw pixel data and metadata.
- \`ImageGenerationConfig\` — controls generation settings.
- \`ImageProgress\` — progress callback payload.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.generateImageRaw()\`
- Related result type: \`ImageResult\`
- Related config type: \`ImageGenerationConfig\`
- Related worker: \`ImageWorker\`

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- \`ImageResult\` fields match current API docs.
- Scheduler pause behavior and latency reporting are accurate.
- Pixel data format and channel assumptions are verified.
- Examples compile and validate buffer size.
`;

window.API_DOCS.content["generate-image-raw_ua"] = `# \`EdgeVeda.generateImageRaw()\`

> Генерує image з text prompt і повертає raw RGB pixel data з metadata.

Використовуйте \`generateImageRaw()\`, коли next step потребує raw pixels, а не PNG file: canvas, custom renderer, image processing pipeline або manual encoder.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`generateImageRaw()\` |
| Category | Image generation / Raw text-to-image |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — image generation має бути initialized |
| Supports streaming | No; progress callback available |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<ImageResult> generateImageRaw(
  String prompt, {
  ImageGenerationConfig? config,
  void Function(ImageProgress)? onProgress,
});
\`\`\`

## What it does

\`generateImageRaw()\` має таку саму validation, Scheduler pause check, worker generation stream, progress callback, latency reporting і idle-timer reset behavior, як \`generateImage()\`. Замість PNG encoding метод повертає \`ImageResult\` з raw pixel data, width, height, channel count і generation time.

## When to use it

Використовуйте \`generateImageRaw()\` коли потрібно:

- створювати images з text prompts через initialized Stable Diffusion model;
- показувати progress updates during denoising steps;
- respect Scheduler pause/degradation decisions when configured;
- reuse persistent image worker for multiple generations.
- уникнути PNG encoding overhead, коли raw pixels enough;
- передати generated pixels у custom image-processing pipeline.

Не використовуйте цей метод, коли:

- image generation не initialized через \`initImageGeneration()\`;
- prompt empty;
- Scheduler paused image workload через thermal/battery pressure;
- потрібне image understanding, а не image generation; використовуйте vision APIs.
- потрібен ready-to-save PNG byte array; використовуйте \`generateImage()\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.initImageGeneration(modelPath: ...)\` успішно завершився;
- prompt text non-empty і suitable для selected SD model;
- image size, steps, CFG scale, sampler і schedule compatible with model/device;
- app handles progress callbacks і generation failures.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`prompt\` | \`String\` | Yes | — | Text prompt для image generation. | Must not be empty. |
| \`config\` | \`ImageGenerationConfig?\` | No | \`const ImageGenerationConfig()\` | Per-generation settings. | Defaults target SD Turbo: 512×512, 4 steps, CFG 1.0, Euler A sampler. |
| \`onProgress\` | \`void Function(ImageProgress)?\` | No | \`null\` | Callback fires once per denoising step. | Receives \`step\`, \`totalSteps\`, \`elapsedSeconds\` і derived \`progress\`. |

## Returns

\`Future<ImageResult>\` — object з raw RGB pixel data і generation metadata.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`pixelData\` | \`Uint8List\` | Raw pixel data, typically RGB bytes. |
| \`width\` | \`int\` | Image width у pixels. |
| \`height\` | \`int\` | Image height у pixels. |
| \`channels\` | \`int\` | Number of color channels; \`3\` для RGB. |
| \`generationTimeMs\` | \`double\` | Total generation time у milliseconds. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`ImageGenerationException\` | Image generation not initialized або worker missing. | Call \`initImageGeneration()\` first and retry. |
| \`ImageGenerationException\` | Prompt empty. | Trim and validate prompt before calling. |
| \`ImageGenerationException\` | Scheduler paused image generation due to thermal/battery pressure. | Retry when device conditions improve або adjust Scheduler policy. |
| \`ImageGenerationException\` | Generation stream completes without final result. | Retry, reduce image size/steps або reinitialize image worker. |
| Worker/native error | Stable Diffusion backend fails during generation. | Check model compatibility, memory і device logs. |

## Minimal example

\`\`\`dart
final result = await edgeVeda.generateImageRaw(
  'a small robot reading documentation',
);

print('\${result.width}x\${result.height}, channels=\${result.channels}');
print('Generated in \${result.generationTimeMs} ms');
\`\`\`

## Production-style example

\`\`\`dart
Future<ImageResult> createRawImageForPipeline(
  EdgeVeda edgeVeda,
  String prompt,
) async {
  final normalized = prompt.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('prompt must not be empty');
  }

  try {
    final result = await edgeVeda.generateImageRaw(
      normalized,
      config: const ImageGenerationConfig(
        width: 512,
        height: 512,
        steps: 4,
        cfgScale: 1.0,
      ),
      onProgress: (progress) {
        debugPrint('Raw image progress: \${progress.step}/\${progress.totalSteps}');
      },
    );

    if (result.pixelData.length != result.width * result.height * result.channels) {
      throw StateError('Unexpected pixel buffer size');
    }

    return result;
  } on ImageGenerationException catch (error) {
    throw Exception('Raw image generation failed: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`generateImageRaw()\` повертає one \`ImageResult\`. Використовуйте \`onProgress\` для per-step progress updates.

## Behavior notes

- Метод потребує \`initImageGeneration()\` і active \`_imageWorker\`.
- Empty prompts rejected before work starts.
- If Scheduler connected and QoS knobs pause image generation, method throws instead of starting workload.
- Image idle timer cancelled during generation і reset after completion.
- Progress callbacks emitted for \`ImageProgressResponse\` messages.
- Generation latency reported to Scheduler for budget enforcement.
- Final response wrapped in \`ImageResult\` without PNG/JPEG encoding.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Image size | Larger width/height increases memory і latency. | Start with 512×512 і validate larger sizes on physical devices. |
| Steps | More denoising steps improve quality but increase latency. | Use low-step turbo models для mobile-first UX. |
| CFG scale | Higher guidance can improve prompt adherence but may create artifacts. | Use model-recommended CFG values. |
| Scheduler | Scheduler may pause image generation under pressure. | Handle pause exceptions і surface retry UI. |
| Worker reuse | Persistent worker avoids repeated model loading. | Batch multiple generations while model loaded, then dispose when done. |
| Raw output | Avoids PNG encoding CPU cost і extra allocation. | Prefer this method для custom renderers і processing pipelines. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family для image generation через stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation, наприклад 4 steps і CFG 1.0. |
| GGUF text LLM | No | Для цього є text generation APIs. |
| GGUF VLM | No | Для цього є vision APIs. |
| GGUF embedding model | No | Для цього є embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only або stub behavior може бути значно повільнішим, ніж physical devices. |
| macOS | Yes / package surface | Перевірте sandbox, file access і available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед claims. |
| Web | No | Потребує native runtime/FFI і local model files. |

## Privacy and security

- Input data processed: prompt, optional negative prompt, generation configuration.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file; output image persistence controlled by app.
- Sensitive data considerations: generated images і prompts можуть reveal user intent; avoid logging prompts або saving outputs without consent.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Image generation not initialized\` | \`initImageGeneration()\` not called або failed. | Initialize image generation first and verify \`isImageInitialized\`. |
| \`Prompt cannot be empty\` | Empty або whitespace-only prompt. | Validate prompt before calling. |
| Generation paused by Scheduler | Thermal/battery pressure activated pause QoS. | Wait, cool device, charge battery або adjust budget policy. |
| No result returned | Worker stream did not emit completion. | Retry with smaller settings або reinitialize worker. |
| Generation is slow | Large model, high resolution, too many steps або CPU fallback. | Use SD Turbo settings і test on device. |
| Pixel buffer size mismatch | Unexpected native result або incorrect channel assumption. | Validate \`width * height * channels\` before using buffer. |

## Related APIs

- \`EdgeVeda.initImageGeneration()\` — initializes Stable Diffusion worker first.
- \`EdgeVeda.generateImage()\` — returns PNG-encoded bytes.
- \`ImageResult\` — result type для raw pixel data і metadata.
- \`ImageGenerationConfig\` — controls generation settings.
- \`ImageProgress\` — progress callback payload.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.generateImageRaw()\`
- Related result type: \`ImageResult\`
- Related config type: \`ImageGenerationConfig\`
- Related worker: \`ImageWorker\`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- \`ImageResult\` fields match current API docs.
- Scheduler pause behavior і latency reporting accurate.
- Pixel data format/channel assumptions verified.
- Examples compile and validate buffer size.
`;

window.API_DOCS.content["init-vision_en"] = `# \`EdgeVeda.initVision()\`

> Initializes Edge Veda vision inference with a VLM model and matching multimodal projector.

Use \`initVision()\` before calling \`describeImage()\` or other \`EdgeVeda\` vision APIs. Vision is initialized separately from text generation so the app controls when large VLM resources are loaded.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`initVision()\` |
| Category | Vision / Runtime initialization |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No core text runtime required; initializes separate vision runtime |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> initVision(VisionConfig config);
\`\`\`

## What it does

\`initVision()\` validates the \`VisionConfig\`, verifies that both the VLM model file and \`mmproj\` file exist, runs a native vision initialization test in a background isolate, frees the temporary native context, and then stores the vision configuration on the \`EdgeVeda\` instance. The method completes only after the vision model path and projector path are confirmed usable.

## When to use it

Use \`initVision()\` when you need to:

- prepare \`EdgeVeda.describeImage()\` for one-off image description;
- validate a VLM + mmproj pair before image understanding;
- load vision capability only when the app actually needs it;
- keep text generation and vision initialization lifecycles separate.

Do not use this method when:

- you only need text generation; use \`init()\` instead;
- you need continuous camera-frame inference with a persistent worker; use \`VisionWorker\` directly;
- either \`modelPath\` or \`mmprojPath\` is not available on local storage;
- the target device memory budget cannot support the selected VLM.

## Prerequisites

Before calling this method, make sure that:

- \`VisionConfig.modelPath\` points to a local VLM GGUF file;
- \`VisionConfig.mmprojPath\` points to the matching multimodal projector GGUF file;
- the app has permission to read both files;
- the device has enough memory for the selected VLM and projector;
- the app is ready to handle \`VisionException\` during validation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`config\` | \`VisionConfig\` | Yes | — | Vision runtime configuration. | Must include non-empty \`modelPath\` and \`mmprojPath\`; optional fields include \`numThreads\`, \`contextSize\`, \`useGpu\`, and \`maxMemoryMb\`. |

## Returns

\`Future<void>\` — completes when the vision configuration has been validated and the native vision initialization test succeeds.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | No return object. Success means the \`EdgeVeda\` instance is ready for \`describeImage()\`. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`VisionException\` | Vision is already initialized, model path is empty, mmproj path is empty, a file is missing, or native vision initialization fails. | Call \`disposeVision()\` before reinitializing; verify both files and use a compatible VLM/mmproj pair. |
| \`MemoryException\` / native failure | The model/projector cannot fit the configured memory budget or device memory. | Use a smaller VLM, reduce context size, or increase validated memory budget. |

## Minimal example

\`\`\`dart
await edgeVeda.initVision(VisionConfig(
  modelPath: '/path/to/smolvlm2.gguf',
  mmprojPath: '/path/to/mmproj.gguf',
));
\`\`\`

## Production-style example

\`\`\`dart
Future<void> prepareVision(
  EdgeVeda edgeVeda,
  String vlmPath,
  String mmprojPath,
) async {
  try {
    await edgeVeda.initVision(VisionConfig(
      modelPath: vlmPath,
      mmprojPath: mmprojPath,
      numThreads: 4,
      contextSize: 2048,
      useGpu: true,
      maxMemoryMb: 1536,
    ));
  } on VisionException catch (error) {
    throw Exception('Vision initialization failed: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`initVision()\` performs initialization and does not emit a stream.

## Behavior notes

- Vision state is separate from text/runtime state created by \`init()\`.
- The method checks \`_isVisionInitialized\` and rejects duplicate initialization.
- Both model and projector paths are validated before native initialization.
- Native init is tested inside \`Isolate.run()\` to keep the UI responsive.
- The temporary native vision context is freed after validation; the configuration is stored for later calls.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| VLM size | Vision models and mmproj files can be large and memory-heavy. | Initialize vision only when needed and prefer mobile-sized VLMs. |
| Context size | Higher context increases memory and latency. | Use \`0\` auto or a conservative explicit value. |
| GPU / Metal | Can improve throughput on supported Apple devices. | Keep \`useGpu: true\` on validated iOS/macOS targets; test fallback paths. |
| Initialization cost | Native validation has startup latency. | Show a loading state before the first vision request. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Requires matching model and multimodal projector files. |
| Text GGUF LLM | No | Use \`init()\` for text generation. |
| Embedding model | No | Use embeddings APIs. |
| Stable Diffusion model | No | Use image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: local model file paths only during initialization.
- Network access during inference: none.
- Local storage used: VLM and mmproj files.
- Sensitive data considerations: avoid logging full local paths if they expose user/project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Vision already initialized\` | \`initVision()\` was called twice. | Call \`disposeVision()\` before reinitializing. |
| \`Model path cannot be empty\` | \`VisionConfig.modelPath\` is empty. | Pass a valid local VLM file path. |
| \`Mmproj file not found\` | Projector file missing or wrong path. | Download/copy the matching mmproj file and update the path. |
| Initialization is slow | Large VLM and projector validation. | Show loading UI and test on physical device. |

## Related APIs

- \`EdgeVeda.describeImage()\` — describes an RGB image after vision initialization.
- \`EdgeVeda.disposeVision()\` — clears EdgeVeda vision configuration.
- \`VisionWorker.initVision()\` — lower-level persistent worker initialization.
- \`VisionConfig\` — configuration object for VLM and mmproj paths.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.initVision()\`
- Related config type: \`VisionConfig\`
- Related native API / FFI binding: \`evVisionInit\`

## Documentation review checklist

Before publishing, verify that:

- The signature matches current source code.
- \`VisionConfig\` fields and defaults are current.
- File validation behavior is documented correctly.
- The example uses a matching VLM and mmproj pair.
- Memory guidance is reviewed on target devices.
`;

window.API_DOCS.content["init-vision_ua"] = `# \`EdgeVeda.initVision()\`

> Ініціалізує vision inference в Edge Veda за допомогою VLM model і matching multimodal projector.

Використовуйте \`initVision()\` перед \`describeImage()\` або іншими vision API в \`EdgeVeda\`. Vision ініціалізується окремо від text generation, щоб застосунок контролював, коли завантажуються великі VLM resources.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`initVision()\` |
| Category | Vision / Ініціалізація runtime |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Core text runtime не потрібен; ініціалізує окремий vision runtime |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> initVision(VisionConfig config);
\`\`\`

## What it does

\`initVision()\` валідовує \`VisionConfig\`, перевіряє наявність VLM model file і \`mmproj\` file, виконує native vision initialization test у background isolate, звільняє temporary native context і зберігає vision configuration в \`EdgeVeda\` instance. Метод завершується тільки після підтвердження, що model path і projector path можна використати.

## When to use it

Використовуйте \`initVision()\` коли потрібно:

- підготувати \`EdgeVeda.describeImage()\` для one-off image description;
- перевірити VLM + mmproj pair перед image understanding;
- завантажувати vision capability тільки тоді, коли app її справді потребує;
- тримати lifecycle text generation і vision initialization окремими.

Не використовуйте цей метод, коли:

- потрібна тільки text generation; використовуйте \`init()\`;
- потрібна continuous camera-frame inference з persistent worker; використовуйте \`VisionWorker\` напряму;
- \`modelPath\` або \`mmprojPath\` недоступні в local storage;
- memory budget цільового пристрою не підтримує selected VLM.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`VisionConfig.modelPath\` вказує на local VLM GGUF file;
- \`VisionConfig.mmprojPath\` вказує на matching multimodal projector GGUF file;
- застосунок має permission читати обидва files;
- пристрій має достатньо memory для selected VLM і projector;
- app готовий обробляти \`VisionException\` під час validation.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`config\` | \`VisionConfig\` | Yes | — | Vision runtime configuration. | Має містити non-empty \`modelPath\` і \`mmprojPath\`; optional fields: \`numThreads\`, \`contextSize\`, \`useGpu\`, \`maxMemoryMb\`. |

## Returns

\`Future<void>\` — завершується, коли vision configuration validated і native vision initialization test успішний.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | Return object немає. Success означає, що \`EdgeVeda\` instance готовий до \`describeImage()\`. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`VisionException\` | Vision уже initialized, model path empty, mmproj path empty, file missing або native vision initialization fails. | Викличте \`disposeVision()\` перед reinitialize; перевірте обидва files і compatible VLM/mmproj pair. |
| \`MemoryException\` / native failure | Model/projector не вміщується в configured memory budget або device memory. | Use smaller VLM, reduce context size або increase validated memory budget. |

## Minimal example

\`\`\`dart
await edgeVeda.initVision(VisionConfig(
  modelPath: '/path/to/smolvlm2.gguf',
  mmprojPath: '/path/to/mmproj.gguf',
));
\`\`\`

## Production-style example

\`\`\`dart
Future<void> prepareVision(
  EdgeVeda edgeVeda,
  String vlmPath,
  String mmprojPath,
) async {
  try {
    await edgeVeda.initVision(VisionConfig(
      modelPath: vlmPath,
      mmprojPath: mmprojPath,
      numThreads: 4,
      contextSize: 2048,
      useGpu: true,
      maxMemoryMb: 1536,
    ));
  } on VisionException catch (error) {
    throw Exception('Vision initialization failed: \${error.message}');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`initVision()\` виконує initialization і не повертає stream.

## Behavior notes

- Vision state окремий від text/runtime state, створеного через \`init()\`.
- Метод перевіряє \`_isVisionInitialized\` і відхиляє duplicate initialization.
- Model і projector paths валідовуються до native initialization.
- Native init тестується всередині \`Isolate.run()\`, щоб не блокувати UI.
- Temporary native vision context звільняється після validation; configuration зберігається для наступних calls.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| VLM size | Vision models і mmproj files можуть бути великими й memory-heavy. | Initialize vision тільки коли потрібно; prefer mobile-sized VLMs. |
| Context size | Higher context збільшує memory і latency. | Use \`0\` auto або conservative explicit value. |
| GPU / Metal | Може покращити throughput на supported Apple devices. | Keep \`useGpu: true\` на validated iOS/macOS targets; test fallback paths. |
| Initialization cost | Native validation має startup latency. | Покажіть loading state перед першим vision request. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Потрібні matching model і multimodal projector files. |
| Text GGUF LLM | No | Для text generation використовуйте \`init()\`. |
| Embedding model | No | Для цього є embeddings APIs. |
| Stable Diffusion model | No | Для цього є image generation APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: local model file paths під час initialization.
- Network access during inference: none.
- Local storage used: VLM і mmproj files.
- Sensitive data considerations: не логуйте full local paths, якщо вони розкривають user/project data.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Vision already initialized\` | \`initVision()\` викликано двічі. | Call \`disposeVision()\` before reinitializing. |
| \`Model path cannot be empty\` | \`VisionConfig.modelPath\` empty. | Передайте valid local VLM file path. |
| \`Mmproj file not found\` | Projector file missing або wrong path. | Download/copy matching mmproj file і update path. |
| Initialization is slow | Large VLM/projector validation. | Покажіть loading UI і тестуйте на physical device. |

## Related APIs

- \`EdgeVeda.describeImage()\` — describes RGB image після vision initialization.
- \`EdgeVeda.disposeVision()\` — clears EdgeVeda vision configuration.
- \`VisionWorker.initVision()\` — lower-level persistent worker initialization.
- \`VisionConfig\` — configuration object для VLM і mmproj paths.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.initVision()\`
- Related config type: \`VisionConfig\`
- Related native API / FFI binding: \`evVisionInit\`

## Documentation review checklist

Перед публікацією перевірте:

- Signature відповідає current source code.
- \`VisionConfig\` fields/defaults актуальні.
- File validation behavior documented correctly.
- Example використовує matching VLM/mmproj pair.
- Memory guidance reviewed on target devices.
`;

window.API_DOCS.content["init-image-generation_en"] = `# \`EdgeVeda.initImageGeneration()\`

> Initializes image generation with a Stable Diffusion model in a persistent worker isolate.

Use \`initImageGeneration()\` before calling \`generateImage()\` or \`generateImageRaw()\`. Image generation is independent from text inference, but the combined memory footprint can be high.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`initImageGeneration()\` |
| Category | Image generation / Runtime initialization |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No text runtime required; initializes image-generation runtime |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> initImageGeneration({
  required String modelPath,
  int numThreads = 0,
  bool useGpu = true,
});
\`\`\`

## What it does

\`initImageGeneration()\` validates that image generation is not already initialized, verifies that \`modelPath\` is non-empty and points to an existing Stable Diffusion model file, spawns an \`ImageWorker\`, initializes the model, and marks image generation as ready. If a \`Scheduler\` is connected, the method registers \`WorkloadId.image\` with low priority and registers memory eviction cleanup for image generation.

## When to use it

Use \`initImageGeneration()\` when you need to:

- prepare a Stable Diffusion model for repeated image generation;
- load the model once and reuse it for multiple \`generateImage()\` calls;
- connect image generation to Scheduler budget enforcement;
- separate text/vision runtime lifecycle from image generation lifecycle.

Do not use this method when:

- you only need text generation, embeddings, or VLM image description;
- the Stable Diffusion model file is missing or not local;
- the target device cannot handle the memory footprint of image generation;
- image generation is already initialized; call \`disposeImageGeneration()\` first.

## Prerequisites

Before calling this method, make sure that:

- a compatible Stable Diffusion GGUF model exists at \`modelPath\`;
- the app has permission to read the local model file;
- the target device has enough RAM and GPU/CPU capacity;
- optional Scheduler is configured before initialization if budget integration is required.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`modelPath\` | \`String\` | Yes | — | Path to the local Stable Diffusion model file. | Must not be empty; file must exist. |
| \`numThreads\` | \`int\` | No | \`0\` | CPU thread count for image generation. | \`0\` lets the native backend choose/default. |
| \`useGpu\` | \`bool\` | No | \`true\` | Whether to use GPU acceleration where supported. | Best validated on Metal-capable Apple devices. |

## Returns

\`Future<void>\` — completes when the image worker is spawned and the Stable Diffusion model is loaded.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | No return object. Successful completion means image generation is initialized. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`ImageGenerationException\` | Image generation is already initialized. | Call \`disposeImageGeneration()\` before reinitializing. |
| \`ImageGenerationException\` | \`modelPath\` is empty or the SD model file does not exist. | Pass a valid local model path and verify the file before calling. |
| \`ImageGenerationException\` | Worker spawn or native image initialization fails. | Check model compatibility, memory, GPU/CPU path, and device logs. |

## Minimal example

\`\`\`dart
await edgeVeda.initImageGeneration(
  modelPath: '/path/to/sd-v2-1-turbo-q8.gguf',
);
\`\`\`

## Production-style example

\`\`\`dart
Future<void> prepareImageGeneration(
  EdgeVeda edgeVeda,
  String modelPath,
) async {
  try {
    await edgeVeda.initImageGeneration(
      modelPath: modelPath,
      numThreads: 0,
      useGpu: true,
    );
  } on ImageGenerationException catch (error) {
    throw Exception('Could not initialize image generation: \${error.message}');
  }
}
\`\`\`

## Streaming example

Not applicable. \`initImageGeneration()\` initializes a persistent worker and does not emit a stream.

## Behavior notes

- The method rejects duplicate image initialization.
- The model file is validated before worker initialization.
- The model is loaded into a persistent \`ImageWorker\` isolate.
- On initialization failure, the worker is disposed and the reference is cleared.
- If a Scheduler is connected, \`WorkloadId.image\` is registered with low priority and a memory eviction callback.
- An idle timer is reset after successful initialization.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Model load time | Stable Diffusion model initialization can take tens of seconds. | Show loading UI and initialize only when needed. |
| Memory footprint | Image generation can use multiple GB of RAM and GPU memory. | Avoid running heavy text, vision, and image workloads together unless tested. |
| GPU usage | GPU acceleration can improve speed on supported devices. | Keep \`useGpu: true\` on validated Metal devices; test fallback paths. |
| Worker lifecycle | Keeping the model loaded improves subsequent generation latency. | Call \`disposeImageGeneration()\` when idle or under memory pressure. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family for image generation through stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation such as 4 steps and CFG 1.0. |
| GGUF text LLM | No | Use text generation APIs. |
| GGUF VLM | No | Use vision APIs. |
| GGUF embedding model | No | Use embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only or stub behavior can be much slower than physical devices. |
| macOS | Yes / package surface | Validate sandbox, file access, and available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path is scaffolded; test on target hardware before publishing claims. |
| Web | No | Requires native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: local model file path.
- Network access during inference: none.
- Local storage used: Stable Diffusion model file.
- Sensitive data considerations: avoid logging full local paths if they expose user or project information.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`Image generation already initialized\` | Initialization called twice. | Call \`disposeImageGeneration()\` before reinitializing. |
| \`Model path cannot be empty\` | Empty \`modelPath\`. | Pass a non-empty local file path. |
| \`SD model file not found\` | File missing or inaccessible. | Verify download/import path and file permissions. |
| Initialization is very slow | Large model, cold start, CPU fallback, or first Metal setup. | Use progress/loading UI and test release builds on physical devices. |

## Related APIs

- \`EdgeVeda.generateImage()\` — generates PNG-encoded image bytes after initialization.
- \`EdgeVeda.generateImageRaw()\` — generates raw RGB pixel data after initialization.
- \`EdgeVeda.disposeImageGeneration()\` — releases image generation resources.
- \`ImageWorker.initImage()\` — lower-level worker initialization path.
- \`Scheduler\` — optional budget enforcement for image workloads.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.initImageGeneration()\`
- Related worker: \`ImageWorker\`
- Related enum/workload: \`WorkloadId.image\`

## Documentation review checklist

Before publishing, verify that:

- The signature matches the current source code.
- Stable Diffusion model format and file requirements are current.
- Scheduler registration and priority behavior are correct.
- Idle timer behavior is reviewed against source.
- Examples compile in a Flutter project.
`;

window.API_DOCS.content["dispose_en"] = `# \`EdgeVeda.dispose()\`

> Disposes all Edge Veda resources and resets the SDK instance to an uninitialized state.

Use \`dispose()\` when the app is done with an \`EdgeVeda\` instance, when shutting down a feature, or before rebuilding the runtime from scratch. After calling it, call \`init()\` again before using text generation or embeddings.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`dispose()\` |
| Category | Runtime / Full resource lifecycle |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> dispose();
\`\`\`

## What it does

\`dispose()\` runs full cleanup for the \`EdgeVeda\` instance. It calls \`disposeVision()\`, calls \`disposeImageGeneration()\`, disposes the persistent text streaming worker if one exists, clears the worker reference, sets streaming and initialization flags to \`false\`, and clears the stored \`EdgeVedaConfig\`.

## When to use it

Use \`dispose()\` when you need to:

- release all SDK-managed resources before app/feature shutdown;
- reset an \`EdgeVeda\` instance before initializing a different core model;
- clean up text streaming, vision, and image generation state in one call;
- avoid stale configuration after a user switches model profile.

Do not use this method when:

- you only want to free image generation resources; use \`disposeImageGeneration()\`;
- you only want to clear vision configuration; use \`disposeVision()\`;
- generation or streaming is currently active without app-level cancellation/coordination;
- you expect the instance to keep working immediately afterward without \`init()\`.

## Prerequisites

Before calling this method, make sure that:

- no prerequisite is required; the method can be used as final cleanup;
- active streams or UI requests should be cancelled or ignored at the app layer;
- the app should not call \`generate()\`, \`generateStream()\`, or \`embed()\` again until \`init()\` completes.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

\`Future<void>\` — completes when vision, image generation, text worker, streaming state, initialization state, and configuration have been cleared.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The method is a cleanup path. | Treat unexpected failures as lifecycle defects and log them. |
| Worker disposal error | A child worker cleanup fails unexpectedly. | Prevent further use of the instance and recreate if needed. |

## Minimal example

\`\`\`dart
await edgeVeda.dispose();
\`\`\`

## Production-style example

\`\`\`dart
class EdgeVedaController {
  EdgeVeda? _edgeVeda;

  Future<void> close() async {
    final runtime = _edgeVeda;
    _edgeVeda = null;

    if (runtime != null) {
      await runtime.dispose();
    }
  }
}
\`\`\`

## Streaming example

Not applicable. \`dispose()\` is a full cleanup call and does not emit a stream.

## Behavior notes

- The method disposes vision resources first.
- The method disposes image generation resources next.
- If a persistent streaming worker exists, it is disposed and the reference is cleared.
- \`isStreaming\` becomes \`false\`.
- \`isInitialized\` becomes \`false\`.
- The stored \`EdgeVedaConfig\` is set to \`null\`.
- After disposal, \`init()\` must be called again before using the core SDK.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Cleanup scope | Runs multiple cleanup operations in sequence. | Use for final shutdown or full runtime reset. |
| Model reload cost | Next use requires reinitialization and model loading. | Avoid calling in hot paths unless memory release is required. |
| Memory release | Can free text worker, image worker, and vision state. | Call when switching profiles or under critical pressure. |
| Concurrency | Disposing during active generation can invalidate pending UI flows. | Coordinate cancellation and ignore late results. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Text runtime worker is disposed. |
| GGUF embedding model | Yes | Core runtime configuration is cleared. |
| GGUF VLM + mmproj | Yes | Vision configuration is cleared through \`disposeVision()\`. |
| Stable Diffusion GGUF | Yes | Image generation worker is disposed through \`disposeImageGeneration()\`. |
| Whisper/STT worker | No direct EdgeVeda worker effect | Manually created whisper workers/sessions must be disposed separately. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only or stub behavior can be much slower than physical devices. |
| macOS | Yes / package surface | Validate sandbox, file access, and available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path is scaffolded; test on target hardware before publishing claims. |
| Web | No | Requires native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: cleanup should not log prompts, images, embeddings, or full file paths unless needed for diagnostics.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Calls fail after dispose | SDK is no longer initialized. | Call \`init()\` again before text/embedding APIs, and reinitialize image/vision as needed. |
| Streaming UI receives late output | A stream was active while disposal happened. | Cancel or ignore late updates at the app layer. |
| Image generation fails after dispose | Image worker was disposed. | Call \`initImageGeneration()\` again. |
| Memory still appears high | OS cache or external workers still hold memory. | Dispose manually created workers and use platform profiling. |

## Related APIs

- \`EdgeVeda.init()\` — reinitializes the core SDK after disposal.
- \`EdgeVeda.disposeVision()\` — called by \`dispose()\` for vision cleanup.
- \`EdgeVeda.disposeImageGeneration()\` — called by \`dispose()\` for image cleanup.
- \`StreamingWorker.dispose()\` — lower-level worker cleanup for persistent text streaming.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.dispose()\`
- Related workers: \`StreamingWorker\`, \`ImageWorker\`, vision configuration state
- Related lifecycle methods: \`disposeVision()\`, \`disposeImageGeneration()\`

## Documentation review checklist

Before publishing, verify that:

- The cleanup order matches current implementation.
- The method still clears \`_worker\`, \`_isStreaming\`, \`_isInitialized\`, and \`_config\`.
- Relationship to image/vision cleanup is documented correctly.
- Examples avoid using the runtime after disposal without reinitialization.
- External worker cleanup responsibilities are clear.
`;

window.API_DOCS.content["dispose_ua"] = `# \`EdgeVeda.dispose()\`

> Dispose-ить усі Edge Veda resources і resets SDK instance to uninitialized state.

Використовуйте \`dispose()\`, коли app завершила роботу з \`EdgeVeda\` instance, shutting down feature або перед rebuilding runtime from scratch. Після цього треба call \`init()\` again перед text generation або embeddings.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`dispose()\` |
| Category | Runtime / Full resource lifecycle |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> dispose();
\`\`\`

## What it does

\`dispose()\` виконує full cleanup для \`EdgeVeda\` instance. Він calls \`disposeVision()\`, calls \`disposeImageGeneration()\`, dispose-ить persistent text streaming worker, якщо він exists, clears worker reference, sets streaming/initialization flags to \`false\` і clears stored \`EdgeVedaConfig\`.

## When to use it

Використовуйте \`dispose()\` коли потрібно:

- release all SDK-managed resources before app/feature shutdown;
- reset \`EdgeVeda\` instance перед initializing different core model;
- clean up text streaming, vision і image generation state in one call;
- avoid stale configuration після user switches model profile.

Не використовуйте цей метод, коли:

- потрібно only free image generation resources; використовуйте \`disposeImageGeneration()\`;
- потрібно only clear vision configuration; використовуйте \`disposeVision()\`;
- generation/streaming currently active without app-level cancellation/coordination;
- очікуєте, що instance keeps working immediately afterward without \`init()\`.

## Prerequisites

Перед викликом методу переконайтесь, що:

- prerequisite не потрібен; method can be used as final cleanup;
- active streams/UI requests should be cancelled або ignored at app layer;
- app should not call \`generate()\`, \`generateStream()\` або \`embed()\` again until \`init()\` completes.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

\`Future<void>\` — завершується, коли vision, image generation, text worker, streaming state, initialization state і configuration cleared.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Method is cleanup path. | Treat unexpected failures as lifecycle defects and log them. |
| Worker disposal error | Child worker cleanup fails unexpectedly. | Prevent further use of instance and recreate if needed. |

## Minimal example

\`\`\`dart
await edgeVeda.dispose();
\`\`\`

## Production-style example

\`\`\`dart
class EdgeVedaController {
  EdgeVeda? _edgeVeda;

  Future<void> close() async {
    final runtime = _edgeVeda;
    _edgeVeda = null;

    if (runtime != null) {
      await runtime.dispose();
    }
  }
}
\`\`\`

## Streaming example

Не застосовується. \`dispose()\` — full cleanup call і не повертає stream.

## Behavior notes

- Метод disposes vision resources first.
- Метод disposes image generation resources next.
- If persistent streaming worker exists, it disposed and reference cleared.
- \`isStreaming\` стає \`false\`.
- \`isInitialized\` стає \`false\`.
- Stored \`EdgeVedaConfig\` set to \`null\`.
- After disposal, \`init()\` must be called again before using core SDK.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Cleanup scope | Runs multiple cleanup operations in sequence. | Use for final shutdown або full runtime reset. |
| Model reload cost | Next use requires reinitialization і model loading. | Avoid calling in hot paths unless memory release required. |
| Memory release | Can free text worker, image worker і vision state. | Call when switching profiles або under critical pressure. |
| Concurrency | Disposing during active generation can invalidate pending UI flows. | Coordinate cancellation і ignore late results. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Text runtime worker disposed. |
| GGUF embedding model | Yes | Core runtime configuration cleared. |
| GGUF VLM + mmproj | Yes | Vision configuration cleared through \`disposeVision()\`. |
| Stable Diffusion GGUF | Yes | Image generation worker disposed through \`disposeImageGeneration()\`. |
| Whisper/STT worker | No direct EdgeVeda worker effect | Manually created whisper workers/sessions must be disposed separately. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only або stub behavior може бути значно повільнішим, ніж physical devices. |
| macOS | Yes / package surface | Перевірте sandbox, file access і available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед claims. |
| Web | No | Потребує native runtime/FFI і local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: cleanup should not log prompts, images, embeddings або full file paths unless needed for diagnostics.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Calls fail after dispose | SDK no longer initialized. | Call \`init()\` again before text/embedding APIs, and reinitialize image/vision as needed. |
| Streaming UI receives late output | A stream active while disposal happened. | Cancel or ignore late updates at app layer. |
| Image generation fails after dispose | Image worker disposed. | Call \`initImageGeneration()\` again. |
| Memory still appears high | OS cache або external workers still hold memory. | Dispose manually created workers і use platform profiling. |

## Related APIs

- \`EdgeVeda.init()\` — reinitializes core SDK after disposal.
- \`EdgeVeda.disposeVision()\` — called by \`dispose()\` for vision cleanup.
- \`EdgeVeda.disposeImageGeneration()\` — called by \`dispose()\` for image cleanup.
- \`StreamingWorker.dispose()\` — lower-level worker cleanup for persistent text streaming.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.dispose()\`
- Related workers: \`StreamingWorker\`, \`ImageWorker\`, vision configuration state
- Related lifecycle methods: \`disposeVision()\`, \`disposeImageGeneration()\`

## Documentation review checklist

Перед публікацією перевірте:

- Cleanup order matches current implementation.
- Method still clears \`_worker\`, \`_isStreaming\`, \`_isInitialized\`, \`_config\`.
- Relationship to image/vision cleanup documented correctly.
- Examples avoid using runtime after disposal without reinitialization.
- External worker cleanup responsibilities clear.
`;

window.API_DOCS.content["dispose-vision_en"] = `# \`EdgeVeda.disposeVision()\`

> Clears Edge Veda vision configuration without affecting text inference.

Use \`disposeVision()\` when the app no longer needs \`EdgeVeda\` vision APIs or before reinitializing vision with a different VLM/projector pair.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`disposeVision()\` |
| Category | Vision / Resource lifecycle |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> disposeVision();
\`\`\`

## What it does

\`disposeVision()\` resets the vision initialization flag and clears the stored \`VisionConfig\`. It does not dispose the core text runtime, does not affect \`generate()\`/\`generateStream()\`, and does not clear image generation state.

## When to use it

Use \`disposeVision()\` when you need to:

- release EdgeVeda-managed vision configuration after image-description features are done;
- switch to a different VLM or mmproj file;
- avoid accidental reuse of stale vision settings;
- separate vision lifecycle from text and image generation lifecycles.

Do not use this method when:

- you want to dispose the full SDK runtime; use \`dispose()\`;
- you want to dispose Stable Diffusion image generation; use \`disposeImageGeneration()\`;
- you need persistent worker cleanup from a manually created \`VisionWorker\`; call that worker's \`dispose()\`.

## Prerequisites

Before calling this method, make sure that:

- No prerequisite is required; the method is safe to call as a lifecycle cleanup step.
- If vision inference is currently running through another worker, stop that work at the app layer first.
- If the app will reinitialize vision immediately, have the new model/projector paths ready.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

\`Future<void>\` — completes after the vision flag and stored configuration are cleared.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The current implementation only clears local state. | Treat unexpected errors as SDK/runtime defects and log them. |

## Minimal example

\`\`\`dart
await edgeVeda.disposeVision();
\`\`\`

## Production-style example

\`\`\`dart
Future<void> switchVisionModel(
  EdgeVeda edgeVeda,
  VisionConfig newConfig,
) async {
  await edgeVeda.disposeVision();
  await edgeVeda.initVision(newConfig);
}
\`\`\`

## Streaming example

Not applicable. \`disposeVision()\` is a cleanup call and does not emit a stream.

## Behavior notes

- The method sets vision initialized state to \`false\`.
- The stored vision configuration is cleared.
- Text inference state and image generation state are not changed.
- The method is useful before calling \`initVision()\` again with different paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Runtime cost | The method only clears local Dart state. | Safe to call during cleanup flows. |
| Memory release | It clears stored config; native persistent workers must be disposed separately if used directly. | Dispose manually created \`VisionWorker\` instances at the worker level. |
| Reinitialization | Allows a new \`initVision()\` call. | Avoid repeated init/dispose loops in hot UI paths. |
| Concurrency | No streaming or inference workload is started. | Coordinate with any active vision request at the app layer. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Applies to vision configuration lifecycle. |
| Text GGUF LLM | No effect | Text runtime is not changed. |
| Stable Diffusion model | No effect | Image generation has separate lifecycle APIs. |
| Embedding model | No effect | Embedding/text runtime not changed. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: no prompts, images, or model contents are processed by this method.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`initVision()\` still fails after dispose | New model/projector paths are invalid. | Verify the new \`VisionConfig\` files. |
| Vision features stop working | Vision config was cleared intentionally. | Call \`initVision()\` before \`describeImage()\` again. |
| Memory is still high | A separate persistent \`VisionWorker\` or OS cache may still be active. | Dispose worker instances and profile memory on device. |
| Text generation still works | Expected behavior. | \`disposeVision()\` does not affect text runtime. |

## Related APIs

- \`EdgeVeda.initVision()\` — initializes vision configuration again.
- \`EdgeVeda.describeImage()\` — requires vision initialization.
- \`EdgeVeda.dispose()\` — disposes all SDK resources.
- \`EdgeVeda.disposeImageGeneration()\` — separate cleanup for image generation.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.disposeVision()\`
- Related config type: \`VisionConfig\`

## Documentation review checklist

Before publishing, verify that:

- The method still only clears local vision state.
- Relationship to \`VisionWorker.dispose()\` is clarified.
- Text/image-generation lifecycle separation is accurate.
- The cleanup example compiles.
`;

window.API_DOCS.content["dispose-vision_ua"] = `# \`EdgeVeda.disposeVision()\`

> Очищає vision configuration в Edge Veda, не впливаючи на text inference.

Використовуйте \`disposeVision()\`, коли app більше не потребує \`EdgeVeda\` vision APIs або перед reinitialize vision з іншою VLM/projector pair.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`disposeVision()\` |
| Category | Vision / Resource lifecycle |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> disposeVision();
\`\`\`

## What it does

\`disposeVision()\` скидає vision initialization flag і очищає stored \`VisionConfig\`. Метод не dispose-ить core text runtime, не впливає на \`generate()\`/\`generateStream()\` і не очищає image generation state.

## When to use it

Використовуйте \`disposeVision()\` коли потрібно:

- звільнити EdgeVeda-managed vision configuration після image-description features;
- перейти на іншу VLM або mmproj file;
- уникнути accidental reuse of stale vision settings;
- відокремити vision lifecycle від text/image generation lifecycles.

Не використовуйте цей метод, коли:

- потрібно dispose full SDK runtime; використовуйте \`dispose()\`;
- потрібно dispose Stable Diffusion image generation; використовуйте \`disposeImageGeneration()\`;
- потрібно cleanup manually created \`VisionWorker\`; викликайте \`dispose()\` у worker.

## Prerequisites

Перед викликом методу переконайтесь, що:

- Prerequisite не потрібен; метод safe як lifecycle cleanup step.
- Якщо vision inference currently running через інший worker, stop that work at app layer first.
- Якщо app одразу reinitialize vision, підготуйте new model/projector paths.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

\`Future<void>\` — завершується після очищення vision flag і stored configuration.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Current implementation лише clears local state. | Unexpected errors трактуйте як SDK/runtime defects і логуйте. |

## Minimal example

\`\`\`dart
await edgeVeda.disposeVision();
\`\`\`

## Production-style example

\`\`\`dart
Future<void> switchVisionModel(
  EdgeVeda edgeVeda,
  VisionConfig newConfig,
) async {
  await edgeVeda.disposeVision();
  await edgeVeda.initVision(newConfig);
}
\`\`\`

## Streaming example

Не застосовується. \`disposeVision()\` — cleanup call і не повертає stream.

## Behavior notes

- Метод встановлює vision initialized state у \`false\`.
- Stored vision configuration очищається.
- Text inference state і image generation state не змінюються.
- Метод корисний перед повторним \`initVision()\` з іншими paths.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Runtime cost | Метод лише clears local Dart state. | Safe для cleanup flows. |
| Memory release | Clears stored config; native persistent workers треба dispose-ити separately, якщо used directly. | Dispose manually created \`VisionWorker\` instances на worker level. |
| Reinitialization | Дозволяє новий \`initVision()\` call. | Avoid repeated init/dispose loops у hot UI paths. |
| Concurrency | No streaming/inference workload started. | Coordinate with active vision request на app layer. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| GGUF VLM + mmproj | Yes | Стосується vision configuration lifecycle. |
| Text GGUF LLM | No effect | Text runtime не змінюється. |
| Stable Diffusion model | No effect | Image generation має окремі lifecycle APIs. |
| Embedding model | No effect | Embedding/text runtime не змінюється. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: метод не обробляє prompts, images або model contents.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| \`initVision()\` still fails after dispose | New model/projector paths invalid. | Verify new \`VisionConfig\` files. |
| Vision features stop working | Vision config intentionally cleared. | Call \`initVision()\` перед \`describeImage()\` again. |
| Memory is still high | Separate persistent \`VisionWorker\` або OS cache may still be active. | Dispose worker instances і profile memory on device. |
| Text generation still works | Expected behavior. | \`disposeVision()\` не впливає на text runtime. |

## Related APIs

- \`EdgeVeda.initVision()\` — initializes vision configuration again.
- \`EdgeVeda.describeImage()\` — requires vision initialization.
- \`EdgeVeda.dispose()\` — disposes all SDK resources.
- \`EdgeVeda.disposeImageGeneration()\` — separate cleanup for image generation.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.disposeVision()\`
- Related config type: \`VisionConfig\`

## Documentation review checklist

Перед публікацією перевірте:

- Метод досі only clears local vision state.
- Relationship to \`VisionWorker.dispose()\` clarified.
- Text/image-generation lifecycle separation accurate.
- Cleanup example compiles.
`;

window.API_DOCS.content["dispose-image-generation_en"] = `# \`EdgeVeda.disposeImageGeneration()\`

> Disposes image generation resources and unregisters image workloads from the Scheduler.

Use \`disposeImageGeneration()\` when image generation is no longer needed, before switching SD models, or when memory pressure requires freeing the Stable Diffusion worker.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`disposeImageGeneration()\` |
| Category | Image generation / Resource lifecycle |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> disposeImageGeneration();
\`\`\`

## What it does

\`disposeImageGeneration()\` unregisters \`WorkloadId.image\` and its memory eviction callback from the Scheduler, cancels the image idle timer, disposes the \`ImageWorker\` if one exists, clears the worker reference, and sets image generation initialized state to \`false\`. It does not affect text inference, vision, or STT.

## When to use it

Use \`disposeImageGeneration()\` when you need to:

- free Stable Diffusion model memory after image generation;
- switch to a different image model;
- respond to Scheduler memory eviction or app-level memory pressure;
- clean up image generation separately from text and vision runtimes.

Do not use this method when:

- you want to fully dispose the entire \`EdgeVeda\` instance; use \`dispose()\`;
- you only want to stop text generation; this method does not affect the text worker;
- you need to clean up a manually created \`ImageWorker\` outside \`EdgeVeda\`; dispose that worker directly.

## Prerequisites

Before calling this method, make sure that:

- No prerequisite is required; the method can be used as a defensive cleanup call;
- if generation is currently active, coordinate cancellation/cleanup at the app layer;
- if reinitializing immediately, prepare the new model path before calling \`initImageGeneration()\` again.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

\`Future<void>\` — completes after image workload registration, idle timer, and image worker state are cleaned up.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The method is designed as a cleanup path. | Treat unexpected errors as SDK defects and log them. |
| Worker disposal error | Underlying worker disposal could fail unexpectedly. | Log, clear application state, and recreate the \`EdgeVeda\` instance if needed. |

## Minimal example

\`\`\`dart
await edgeVeda.disposeImageGeneration();
\`\`\`

## Production-style example

\`\`\`dart
Future<void> closeImageMode(EdgeVeda edgeVeda) async {
  try {
    await edgeVeda.disposeImageGeneration();
  } finally {
    debugPrint('Image generation mode closed');
  }
}
\`\`\`

## Streaming example

Not applicable. \`disposeImageGeneration()\` is a cleanup call and does not emit a stream.

## Behavior notes

- Scheduler image workload and memory eviction registration are removed defensively.
- The image idle timer is cancelled and cleared.
- The image worker is disposed if it exists.
- The internal \`_imageWorker\` reference is set to \`null\`.
- \`isImageInitialized\` becomes \`false\`.
- Text inference, vision, and STT are not affected.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Memory release | Frees large SD model resources held by the image worker. | Call after image-generation workflows or under memory pressure. |
| Scheduler cleanup | Prevents stale workload/eviction callbacks. | Use before switching models or destroying the SDK instance. |
| Idle timer | Cancels pending auto-disposal timer. | Avoid duplicate cleanup logic at app level. |
| Reinitialization | Allows \`initImageGeneration()\` with the same or different model. | Dispose before switching image models. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family for image generation through stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation such as 4 steps and CFG 1.0. |
| GGUF text LLM | No | Use text generation APIs. |
| GGUF VLM | No | Use vision APIs. |
| GGUF embedding model | No | Use embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only or stub behavior can be much slower than physical devices. |
| macOS | Yes / package surface | Validate sandbox, file access, and available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path is scaffolded; test on target hardware before publishing claims. |
| Web | No | Requires native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: no prompts or images are processed, but cleanup logs should avoid exposing file paths.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Image generation fails after dispose | Image worker was intentionally removed. | Call \`initImageGeneration()\` again before generating. |
| Memory still appears high | OS cache or another runtime still holds memory. | Profile on device and also dispose other workers if needed. |
| Scheduler still shows image workload | Scheduler state did not update or separate registration exists. | Check app-level Scheduler registrations and logs. |
| Calling dispose twice | Second call finds no worker. | This should be safe as defensive cleanup. |

## Related APIs

- \`EdgeVeda.initImageGeneration()\` — initializes image generation again.
- \`EdgeVeda.generateImage()\` — requires image generation initialization.
- \`EdgeVeda.generateImageRaw()\` — requires image generation initialization.
- \`EdgeVeda.dispose()\` — calls this method as part of full cleanup.
- \`Scheduler.unregisterWorkload()\` — related scheduler cleanup behavior.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.disposeImageGeneration()\`
- Related worker: \`ImageWorker\`
- Related Scheduler workload: \`WorkloadId.image\`

## Documentation review checklist

Before publishing, verify that:

- The method still unregisters scheduler workload and memory eviction.
- Idle timer cleanup behavior is current.
- The method does not affect text inference or vision.
- The cleanup example compiles.
- Double-dispose behavior has been reviewed.
`;

window.API_DOCS.content["dispose-image-generation_ua"] = `# \`EdgeVeda.disposeImageGeneration()\`

> Dispose-ить image generation resources і unregisters image workloads from Scheduler.

Використовуйте \`disposeImageGeneration()\`, коли image generation більше не потрібна, перед switching SD models або коли memory pressure requires freeing Stable Diffusion worker.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`disposeImageGeneration()\` |
| Category | Image generation / Resource lifecycle |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<void> disposeImageGeneration();
\`\`\`

## What it does

\`disposeImageGeneration()\` unregisters \`WorkloadId.image\` і memory eviction callback from Scheduler, cancels image idle timer, dispose-ить \`ImageWorker\`, якщо він існує, clears worker reference і встановлює image generation initialized state у \`false\`. Метод не впливає на text inference, vision або STT.

## When to use it

Використовуйте \`disposeImageGeneration()\` коли потрібно:

- звільнити Stable Diffusion model memory після image generation;
- перейти на іншу image model;
- реагувати на Scheduler memory eviction або app-level memory pressure;
- clean up image generation окремо від text і vision runtimes.

Не використовуйте цей метод, коли:

- потрібно fully dispose entire \`EdgeVeda\` instance; використовуйте \`dispose()\`;
- потрібно stop text generation; цей метод не affects text worker;
- потрібно clean up manually created \`ImageWorker\` outside \`EdgeVeda\`; dispose that worker directly.

## Prerequisites

Перед викликом методу переконайтесь, що:

- Prerequisite не потрібен; method can be used as defensive cleanup call;
- якщо generation currently active, coordinate cancellation/cleanup at app layer;
- if reinitializing immediately, prepare new model path before calling \`initImageGeneration()\` again.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

\`Future<void>\` — завершується після cleanup image workload registration, idle timer і image worker state.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Method designed as cleanup path. | Unexpected errors treat as SDK defects and log them. |
| Worker disposal error | Underlying worker disposal could fail unexpectedly. | Log, clear application state і recreate \`EdgeVeda\` instance if needed. |

## Minimal example

\`\`\`dart
await edgeVeda.disposeImageGeneration();
\`\`\`

## Production-style example

\`\`\`dart
Future<void> closeImageMode(EdgeVeda edgeVeda) async {
  try {
    await edgeVeda.disposeImageGeneration();
  } finally {
    debugPrint('Image generation mode closed');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`disposeImageGeneration()\` — cleanup call і не повертає stream.

## Behavior notes

- Scheduler image workload і memory eviction registration removed defensively.
- Image idle timer cancelled і cleared.
- Image worker disposed if exists.
- Internal \`_imageWorker\` reference set to \`null\`.
- \`isImageInitialized\` стає \`false\`.
- Text inference, vision і STT not affected.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Memory release | Frees large SD model resources held by image worker. | Call after image-generation workflows або under memory pressure. |
| Scheduler cleanup | Prevents stale workload/eviction callbacks. | Use before switching models або destroying SDK instance. |
| Idle timer | Cancels pending auto-disposal timer. | Avoid duplicate cleanup logic at app level. |
| Reinitialization | Allows \`initImageGeneration()\` with same/different model. | Dispose before switching image models. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion GGUF | Yes | Primary supported model family для image generation через stable-diffusion.cpp. |
| SD Turbo / SD 2.1 Turbo GGUF | Yes | Designed for low-step generation, наприклад 4 steps і CFG 1.0. |
| GGUF text LLM | No | Для цього є text generation APIs. |
| GGUF VLM | No | Для цього є vision APIs. |
| GGUF embedding model | No | Для цього є embedding APIs. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для Metal-accelerated on-device inference. |
| iOS simulator | Partial | CPU-only або stub behavior може бути значно повільнішим, ніж physical devices. |
| macOS | Yes / package surface | Перевірте sandbox, file access і available GPU/CPU resources. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед claims. |
| Web | No | Потребує native runtime/FFI і local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: prompts/images не processed, але cleanup logs should avoid exposing file paths.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Image generation fails after dispose | Image worker intentionally removed. | Call \`initImageGeneration()\` again before generating. |
| Memory still appears high | OS cache або another runtime still holds memory. | Profile on device and dispose other workers if needed. |
| Scheduler still shows image workload | Scheduler state did not update або separate registration exists. | Check app-level Scheduler registrations/logs. |
| Calling dispose twice | Second call finds no worker. | This should be safe as defensive cleanup. |

## Related APIs

- \`EdgeVeda.initImageGeneration()\` — initializes image generation again.
- \`EdgeVeda.generateImage()\` — requires image generation initialization.
- \`EdgeVeda.generateImageRaw()\` — requires image generation initialization.
- \`EdgeVeda.dispose()\` — calls this method as part of full cleanup.
- \`Scheduler.unregisterWorkload()\` — related scheduler cleanup behavior.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.disposeImageGeneration()\`
- Related worker: \`ImageWorker\`
- Related Scheduler workload: \`WorkloadId.image\`

## Documentation review checklist

Перед публікацією перевірте:

- Method still unregisters scheduler workload and memory eviction.
- Idle timer cleanup behavior current.
- Method does not affect text inference/vision.
- Cleanup example compiles.
- Double-dispose behavior reviewed.
`;

window.API_DOCS.content["get-memory-stats_en"] = `# \`EdgeVeda.getMemoryStats()\`

> Reads current native memory statistics for the active Edge Veda runtime context.

Use \`getMemoryStats()\` to observe memory use after model initialization or generation. The method is designed to avoid loading a second model just to collect stats.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`getMemoryStats()\` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — core \`init()\` must have completed |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<MemoryStats> getMemoryStats();
\`\`\`

## What it does

\`getMemoryStats()\` ensures the core runtime is initialized, then routes the query through the active \`StreamingWorker\` if one is available. If no worker is active, it returns zero-valued usage stats with the configured memory limit instead of loading a new native model context.

## When to use it

Use \`getMemoryStats()\` when you need to:

- display current and peak memory in a debug or diagnostics panel;
- make runtime decisions when memory use is high;
- feed memory data into app-level quality or unloading logic;
- inspect whether an active streaming worker is consuming memory.

Do not use this method when:

- you need only a boolean pressure check; use \`isMemoryPressure()\`;
- the core \`EdgeVeda\` runtime has not been initialized;
- you need OS-wide telemetry beyond Edge Veda context; use \`TelemetryService\` where appropriate.

## Prerequisites

Before calling this method, make sure that:

- \`await edgeVeda.init(config)\` has completed successfully;
- the app can handle zero-valued stats when no worker is active;
- developers understand that values represent Edge Veda/native context stats, not full app memory telemetry.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | This method has no parameters. | — |

## Returns

\`Future<MemoryStats>\` — current memory breakdown for the active worker, or zero-valued usage stats when no worker is active.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`currentBytes\` | \`int\` | Current total memory usage in bytes. |
| \`peakBytes\` | \`int\` | Peak memory usage in bytes. |
| \`limitBytes\` | \`int\` | Configured memory limit in bytes. |
| \`modelBytes\` | \`int\` | Memory used by the loaded model. |
| \`contextBytes\` | \`int\` | Memory used by inference context. |
| \`usagePercent\` | \`double\` | Memory usage ratio from 0.0 to 1.0. |
| \`isHighPressure\` | \`bool\` | Convenience flag for >80% usage. |
| \`isCritical\` | \`bool\` | Convenience flag for >90% usage. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`InitializationException\` / \`EdgeVedaException\` | The core runtime is not initialized or \`_ensureInitialized()\` fails. | Call \`init()\` before checking memory stats. |
| Worker/runtime error | Active worker cannot provide stats. | Retry after generation finishes or reinitialize the runtime if needed. |

## Minimal example

\`\`\`dart
final stats = await edgeVeda.getMemoryStats();

print('Memory usage: \${(stats.usagePercent * 100).toStringAsFixed(1)}%');

if (stats.isHighPressure) {
  print('Consider unloading or reducing context size.');
}
\`\`\`

## Production-style example

\`\`\`dart
Future<void> logMemoryDiagnostics(EdgeVeda edgeVeda) async {
  final stats = await edgeVeda.getMemoryStats();

  debugPrint('Edge Veda memory: '
      'current=\${stats.currentBytes}, '
      'peak=\${stats.peakBytes}, '
      'limit=\${stats.limitBytes}, '
      'usage=\${(stats.usagePercent * 100).toStringAsFixed(1)}%');

  if (stats.isCritical) {
    debugPrint('Critical memory usage — degrade quality or unload optional models.');
  }
}
\`\`\`

## Streaming example

Not applicable. \`getMemoryStats()\` returns one \`MemoryStats\` object.

## Behavior notes

- The method requires core initialization through \`init()\`.
- If a \`StreamingWorker\` is active, stats are queried from that worker.
- If no worker is active, the method returns zero-valued stats and the configured limit.
- The design avoids loading a second model context only to read memory stats.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Active worker path | Uses existing worker context without another model load. | Prefer this method over custom native memory probing. |
| No active worker | Returns zero-valued usage quickly. | Handle zero stats as valid no-worker state. |
| Polling frequency | Frequent polling adds some overhead. | Poll on intervals or diagnostics screens, not every frame. |
| Memory pressure | High usage should trigger quality reduction or cleanup. | Use \`isMemoryPressure()\` for simple threshold checks. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Stats are most useful when a text streaming worker is active. |
| Embedding model | Partial | Depends on current runtime/worker path. |
| VLM | No direct effect | Vision workers have separate lifecycle/telemetry paths. |
| Stable Diffusion model | No direct effect | Image generation has separate worker/runtime behavior. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: memory numbers do not contain prompt/model content, but logs may reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Stats are all zero | No active worker is loaded. | This is expected when no model context is active. |
| \`usagePercent\` seems high | Model/context is near memory limit. | Reduce context size, unload optional models, or use smaller model. |
| Call fails before init | Core runtime was not initialized. | Call \`init()\` first. |
| Memory does not match OS tools | Stats are Edge Veda/native context oriented. | Use platform telemetry for full app/OS memory. |

## Related APIs

- \`EdgeVeda.isMemoryPressure()\` — boolean threshold check built on memory stats.
- \`MemoryStats\` — return type with memory breakdown and convenience flags.
- \`Scheduler\` — can enforce budget decisions using telemetry and workload data.
- \`TelemetryService\` — platform-level thermal, battery, and memory telemetry.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.getMemoryStats()\`
- Related return type: \`MemoryStats\`
- Related worker: \`StreamingWorker\`

## Documentation review checklist

Before publishing, verify that:

- The zero-valued no-worker behavior is still current.
- \`MemoryStats\` fields and thresholds are current.
- The method still routes through the active worker.
- Examples compile in Flutter context.
`;

window.API_DOCS.content["get-memory-stats_ua"] = `# \`EdgeVeda.getMemoryStats()\`

> Зчитує current native memory statistics для active Edge Veda runtime context.

Використовуйте \`getMemoryStats()\`, щоб спостерігати memory use після model initialization або generation. Метод спроєктовано так, щоб не завантажувати другу модель лише для stats.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`getMemoryStats()\` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — core \`init()\` має бути completed |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<MemoryStats> getMemoryStats();
\`\`\`

## What it does

\`getMemoryStats()\` перевіряє, що core runtime initialized, потім routes query через active \`StreamingWorker\`, якщо він доступний. Якщо active worker немає, метод повертає zero-valued usage stats із configured memory limit замість завантаження нового native model context.

## When to use it

Використовуйте \`getMemoryStats()\` коли потрібно:

- показати current/peak memory у debug або diagnostics panel;
- приймати runtime decisions при high memory use;
- передавати memory data в app-level quality/unloading logic;
- перевірити, чи active streaming worker consumes memory.

Не використовуйте цей метод, коли:

- потрібен тільки boolean pressure check; використовуйте \`isMemoryPressure()\`;
- core \`EdgeVeda\` runtime не initialized;
- потрібна OS-wide telemetry beyond Edge Veda context; use \`TelemetryService\`, якщо доречно.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`await edgeVeda.init(config)\` успішно завершився;
- app може обробляти zero-valued stats, коли active worker немає;
- developers розуміють, що values represent Edge Veda/native context stats, а не full app memory telemetry.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| — | — | No | — | Метод не має параметрів. | — |

## Returns

\`Future<MemoryStats>\` — current memory breakdown для active worker або zero-valued usage stats, коли active worker немає.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| \`currentBytes\` | \`int\` | Current total memory usage у bytes. |
| \`peakBytes\` | \`int\` | Peak memory usage у bytes. |
| \`limitBytes\` | \`int\` | Configured memory limit у bytes. |
| \`modelBytes\` | \`int\` | Memory used by loaded model. |
| \`contextBytes\` | \`int\` | Memory used by inference context. |
| \`usagePercent\` | \`double\` | Memory usage ratio від 0.0 до 1.0. |
| \`isHighPressure\` | \`bool\` | Convenience flag для >80% usage. |
| \`isCritical\` | \`bool\` | Convenience flag для >90% usage. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`InitializationException\` / \`EdgeVedaException\` | Core runtime not initialized або \`_ensureInitialized()\` fails. | Call \`init()\` перед memory stats. |
| Worker/runtime error | Active worker не може надати stats. | Retry after generation finishes або reinitialize runtime if needed. |

## Minimal example

\`\`\`dart
final stats = await edgeVeda.getMemoryStats();

print('Memory usage: \${(stats.usagePercent * 100).toStringAsFixed(1)}%');

if (stats.isHighPressure) {
  print('Consider unloading or reducing context size.');
}
\`\`\`

## Production-style example

\`\`\`dart
Future<void> logMemoryDiagnostics(EdgeVeda edgeVeda) async {
  final stats = await edgeVeda.getMemoryStats();

  debugPrint('Edge Veda memory: '
      'current=\${stats.currentBytes}, '
      'peak=\${stats.peakBytes}, '
      'limit=\${stats.limitBytes}, '
      'usage=\${(stats.usagePercent * 100).toStringAsFixed(1)}%');

  if (stats.isCritical) {
    debugPrint('Critical memory usage — degrade quality or unload optional models.');
  }
}
\`\`\`

## Streaming example

Не застосовується. \`getMemoryStats()\` повертає один \`MemoryStats\` object.

## Behavior notes

- Метод потребує core initialization через \`init()\`.
- Якщо active \`StreamingWorker\` є, stats queried from that worker.
- Якщо active worker немає, метод повертає zero-valued stats і configured limit.
- Design avoids loading second model context only to read memory stats.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Active worker path | Uses existing worker context без another model load. | Prefer this method over custom native memory probing. |
| No active worker | Returns zero-valued usage quickly. | Handle zero stats як valid no-worker state. |
| Polling frequency | Frequent polling adds some overhead. | Poll on intervals або diagnostics screens, not every frame. |
| Memory pressure | High usage should trigger quality reduction/cleanup. | Use \`isMemoryPressure()\` для simple threshold checks. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Stats most useful, коли text streaming worker active. |
| Embedding model | Partial | Depends on current runtime/worker path. |
| VLM | No direct effect | Vision workers мають separate lifecycle/telemetry paths. |
| Stable Diffusion model | No direct effect | Image generation має separate worker/runtime behavior. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: memory numbers не містять prompt/model content, але logs можуть reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Stats are all zero | No active worker loaded. | Expected, коли no model context active. |
| \`usagePercent\` seems high | Model/context near memory limit. | Reduce context size, unload optional models, або use smaller model. |
| Call fails before init | Core runtime not initialized. | Call \`init()\` first. |
| Memory does not match OS tools | Stats Edge Veda/native context oriented. | Use platform telemetry для full app/OS memory. |

## Related APIs

- \`EdgeVeda.isMemoryPressure()\` — boolean threshold check built on memory stats.
- \`MemoryStats\` — return type з memory breakdown і convenience flags.
- \`Scheduler\` — can enforce budget decisions using telemetry/workload data.
- \`TelemetryService\` — platform-level thermal, battery, memory telemetry.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.getMemoryStats()\`
- Related return type: \`MemoryStats\`
- Related worker: \`StreamingWorker\`

## Documentation review checklist

Перед публікацією перевірте:

- Zero-valued no-worker behavior still current.
- \`MemoryStats\` fields/thresholds current.
- Method still routes through active worker.
- Examples compile in Flutter context.
`;

window.API_DOCS.content["is-memory-pressure_en"] = `# \`EdgeVeda.isMemoryPressure()\`

> Checks whether current Edge Veda memory usage is above a configurable threshold.

Use \`isMemoryPressure()\` for a quick boolean decision when you do not need the full \`MemoryStats\` object.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`isMemoryPressure()\` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | Yes — uses \`getMemoryStats()\` |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<bool> isMemoryPressure({double threshold = 0.8});
\`\`\`

## What it does

\`isMemoryPressure()\` calls \`getMemoryStats()\`, checks whether a memory limit is configured, and returns \`true\` when \`stats.usagePercent\` is greater than the supplied \`threshold\`. If the memory limit is zero, the method returns \`false\`.

## When to use it

Use \`isMemoryPressure()\` when you need to:

- gate optional workloads when memory pressure is high;
- choose between full/reduced/minimal QoS paths;
- show a simple warning in diagnostics or developer UI;
- avoid reading and interpreting full \`MemoryStats\` when only a boolean is needed.

Do not use this method when:

- you need detailed memory breakdown; use \`getMemoryStats()\`;
- you need OS-level thermal/battery policy; use \`TelemetryService\`/\`Scheduler\`;
- the runtime has not been initialized; initialize first.

## Prerequisites

Before calling this method, make sure that:

- \`getMemoryStats()\` can be called successfully;
- the \`threshold\` is in the expected 0.0–1.0 range;
- the app has a plan for what to do when the method returns \`true\`.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`threshold\` | \`double\` | No | \`0.8\` | Memory usage percentage above which pressure is considered active. | Use a 0.0–1.0 ratio; default means 80%. |

## Returns

\`Future<bool>\` — \`true\` when memory usage is above the threshold; \`false\` otherwise or when no memory limit is set.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`bool\` | \`true\` indicates active pressure above threshold; \`false\` indicates no pressure or no configured limit. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`InitializationException\` / \`EdgeVedaException\` | Propagated from \`getMemoryStats()\` if runtime is not initialized or stats fail. | Initialize first and handle runtime errors. |
| Invalid threshold behavior | The method does not document clamping behavior. | Validate threshold values in the app UI or wrapper. |

## Minimal example

\`\`\`dart
if (await edgeVeda.isMemoryPressure()) {
  print('Warning: high Edge Veda memory usage.');
}
\`\`\`

## Production-style example

\`\`\`dart
Future<void> maybeReduceQuality(EdgeVeda edgeVeda) async {
  final pressure = await edgeVeda.isMemoryPressure(threshold: 0.75);

  if (pressure) {
    debugPrint('Memory pressure detected. Reducing optional workloads.');
    // Example actions:
    // - reduce maxTokens
    // - pause camera/vision work
    // - unload optional models
  }
}
\`\`\`

## Streaming example

Not applicable. \`isMemoryPressure()\` returns one boolean value.

## Behavior notes

- The method delegates to \`getMemoryStats()\`.
- If \`stats.limitBytes == 0\`, the method returns \`false\`.
- The comparison uses \`stats.usagePercent > threshold\`, not \`>=\`.
- Default threshold is \`0.8\`, equivalent to 80% usage.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Polling cost | Calls memory stats under the hood. | Use interval-based checks, not per-frame checks. |
| Threshold choice | Lower thresholds trigger earlier degradation. | Use 0.7–0.8 for proactive mobile behavior. |
| No active worker | Likely returns \`false\` via zero stats. | Treat as no active Edge Veda memory pressure. |
| QoS integration | Boolean signal is simple but limited. | Use \`Scheduler\` for full budget enforcement. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Works through memory stats for active text worker. |
| Embedding model | Partial | Depends on active runtime/worker memory path. |
| VLM | Indirect | Use vision runtime policy for vision-specific QoS. |
| Stable Diffusion model | Indirect | Use scheduler/image-generation lifecycle for image workloads. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: pressure state is operational telemetry only, but logs may reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Always returns \`false\` | No memory limit configured or no active worker. | Check \`getMemoryStats()\` for detailed fields. |
| Triggers too early | Threshold too low for workload. | Raise threshold after device testing. |
| Triggers too late | Threshold too high or memory spikes quickly. | Lower threshold and add proactive cleanup. |
| Call fails | Core runtime not initialized. | Call \`init()\` first. |

## Related APIs

- \`EdgeVeda.getMemoryStats()\` — detailed memory breakdown.
- \`MemoryStats.usagePercent\` — ratio compared against threshold.
- \`Scheduler\` — budget-aware workload enforcement.
- \`RuntimePolicy\` — QoS policy for thermal, battery, and memory pressure.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.isMemoryPressure()\`
- Related return type: \`MemoryStats\`

## Documentation review checklist

Before publishing, verify that:

- The default threshold is still \`0.8\`.
- The comparison operator remains \`>\` and not \`>=\`.
- No-limit behavior still returns \`false\`.
- The example compiles and matches intended app behavior.
`;

window.API_DOCS.content["is-memory-pressure_ua"] = `# \`EdgeVeda.isMemoryPressure()\`

> Перевіряє, чи current Edge Veda memory usage перевищує configurable threshold.

Використовуйте \`isMemoryPressure()\` для швидкого boolean decision, коли full \`MemoryStats\` object не потрібен.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`isMemoryPressure()\` |
| Category | Runtime / Memory monitoring |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | Yes — використовує \`getMemoryStats()\` |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
Future<bool> isMemoryPressure({double threshold = 0.8});
\`\`\`

## What it does

\`isMemoryPressure()\` викликає \`getMemoryStats()\`, перевіряє, чи memory limit configured, і повертає \`true\`, коли \`stats.usagePercent\` більше за \`threshold\`. Якщо memory limit дорівнює zero, метод повертає \`false\`.

## When to use it

Використовуйте \`isMemoryPressure()\` коли потрібно:

- gate optional workloads, коли memory pressure high;
- вибирати між full/reduced/minimal QoS paths;
- показувати simple warning у diagnostics/developer UI;
- не читати full \`MemoryStats\`, якщо потрібен тільки boolean.

Не використовуйте цей метод, коли:

- потрібен detailed memory breakdown; використовуйте \`getMemoryStats()\`;
- потрібна OS-level thermal/battery policy; use \`TelemetryService\`/\`Scheduler\`;
- runtime not initialized; initialize first.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`getMemoryStats()\` can be called successfully;
- \`threshold\` у expected 0.0–1.0 range;
- app має plan, що робити, коли метод повертає \`true\`.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`threshold\` | \`double\` | No | \`0.8\` | Memory usage percentage, вище якого pressure considered active. | Використовуйте 0.0–1.0 ratio; default означає 80%. |

## Returns

\`Future<bool>\` — \`true\`, якщо memory usage above threshold; \`false\` otherwise або коли memory limit не set.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`bool\` | \`true\` означає active pressure above threshold; \`false\` — no pressure або no configured limit. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| \`InitializationException\` / \`EdgeVedaException\` | Propagated from \`getMemoryStats()\`, якщо runtime not initialized або stats fail. | Initialize first and handle runtime errors. |
| Invalid threshold behavior | Method не документує clamping behavior. | Validate threshold values в app UI або wrapper. |

## Minimal example

\`\`\`dart
if (await edgeVeda.isMemoryPressure()) {
  print('Warning: high Edge Veda memory usage.');
}
\`\`\`

## Production-style example

\`\`\`dart
Future<void> maybeReduceQuality(EdgeVeda edgeVeda) async {
  final pressure = await edgeVeda.isMemoryPressure(threshold: 0.75);

  if (pressure) {
    debugPrint('Memory pressure detected. Reducing optional workloads.');
    // Example actions:
    // - reduce maxTokens
    // - pause camera/vision work
    // - unload optional models
  }
}
\`\`\`

## Streaming example

Не застосовується. \`isMemoryPressure()\` повертає одне boolean value.

## Behavior notes

- Метод delegates to \`getMemoryStats()\`.
- Якщо \`stats.limitBytes == 0\`, метод повертає \`false\`.
- Comparison uses \`stats.usagePercent > threshold\`, not \`>=\`.
- Default threshold \`0.8\`, тобто 80% usage.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Polling cost | Calls memory stats under the hood. | Use interval-based checks, not per-frame checks. |
| Threshold choice | Lower thresholds trigger earlier degradation. | Use 0.7–0.8 для proactive mobile behavior. |
| No active worker | Likely returns \`false\` через zero stats. | Treat as no active Edge Veda memory pressure. |
| QoS integration | Boolean signal simple but limited. | Use \`Scheduler\` для full budget enforcement. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Text GGUF LLM | Yes | Works through memory stats для active text worker. |
| Embedding model | Partial | Depends on active runtime/worker memory path. |
| VLM | Indirect | Use vision runtime policy для vision-specific QoS. |
| Stable Diffusion model | Indirect | Use scheduler/image-generation lifecycle для image workloads. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: none.
- Network access: none.
- Local storage used: none.
- Sensitive data considerations: pressure state is operational telemetry, але logs можуть reveal device capacity.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| Always returns \`false\` | No memory limit configured або no active worker. | Check \`getMemoryStats()\` for detailed fields. |
| Triggers too early | Threshold too low для workload. | Raise threshold після device testing. |
| Triggers too late | Threshold too high або memory spikes quickly. | Lower threshold and add proactive cleanup. |
| Call fails | Core runtime not initialized. | Call \`init()\` first. |

## Related APIs

- \`EdgeVeda.getMemoryStats()\` — detailed memory breakdown.
- \`MemoryStats.usagePercent\` — ratio compared against threshold.
- \`Scheduler\` — budget-aware workload enforcement.
- \`RuntimePolicy\` — QoS policy для thermal, battery, memory pressure.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.isMemoryPressure()\`
- Related return type: \`MemoryStats\`

## Documentation review checklist

Перед публікацією перевірте:

- Default threshold still \`0.8\`.
- Comparison operator remains \`>\` not \`>=\`.
- No-limit behavior still returns \`false\`.
- Example compiles and matches intended app behavior.
`;

window.API_DOCS.content["set-scheduler_en"] = `# \`EdgeVeda.setScheduler()\`

> Connects a Scheduler so image generation can participate in budget-aware runtime policy.

Use \`setScheduler()\` after creating both \`EdgeVeda\` and \`Scheduler\` instances when your app wants image generation workloads to be tracked, gated, and reported to the scheduler.

## API summary

| Field | Value |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`setScheduler()\` |
| Category | Runtime / Scheduler integration |
| Stability | Stable API surface; source review required before publishing |
| Since | Documented in \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface with validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
void setScheduler(Scheduler scheduler);
\`\`\`

## What it does

\`setScheduler()\` stores a \`Scheduler\` reference inside the \`EdgeVeda\` instance. When a scheduler is connected, image generation can register as a workload, follow QoS policy, and report latency samples to the scheduler.

## When to use it

Use \`setScheduler()\` when you need to:

- enable budget-aware image generation;
- coordinate image generation with other on-device AI workloads;
- enforce p95 latency, battery, thermal, and memory constraints through Scheduler;
- collect workload latency and budget violation telemetry.

Do not use this method when:

- you do not use image generation workloads;
- you only need simple text generation or embeddings;
- the scheduler is not configured with telemetry and budget;
- you expect this method to start the scheduler automatically — call \`scheduler.start()\` separately.

## Prerequisites

Before calling this method, make sure that:

- A \`Scheduler\` instance exists and is configured with \`TelemetryService\`;
- the scheduler has an active budget via \`setBudget()\` if enforcement is needed;
- workloads are registered where appropriate;
- the app owns scheduler lifecycle and calls \`dispose()\` when done.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`scheduler\` | \`Scheduler\` | Yes | — | Scheduler instance to connect to \`EdgeVeda\`. | The scheduler should be configured, started, and disposed by the app. |

## Returns

\`void\` — the method stores the scheduler reference and returns immediately.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | No return object. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | The current implementation stores the reference only. | Validate scheduler setup before calling and test budget behavior in integration tests. |

## Minimal example

\`\`\`dart
final scheduler = Scheduler(telemetry: TelemetryService());

scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
scheduler.start();

edgeVeda.setScheduler(scheduler);
\`\`\`

## Production-style example

\`\`\`dart
Future<Scheduler> connectScheduler(EdgeVeda edgeVeda) async {
  final scheduler = Scheduler(
    telemetry: TelemetryService(),
    restorationCooldown: const Duration(seconds: 30),
  );

  scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
  scheduler.registerWorkload(
    WorkloadId.image,
    priority: WorkloadPriority.high,
  );

  scheduler.onBudgetViolation.listen((violation) {
    debugPrint('Budget violation: \${violation.constraint}');
  });

  scheduler.start();
  edgeVeda.setScheduler(scheduler);

  return scheduler;
}
\`\`\`

## Streaming example

Not applicable. \`setScheduler()\` connects a dependency and does not emit a stream.

## Behavior notes

- The method stores the scheduler in the \`EdgeVeda\` instance.
- It does not create, start, stop, or dispose the scheduler.
- When connected, image generation can gate on QoS policy and report latency.
- Budget enforcement depends on the scheduler being configured and running.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Scheduler overhead | Telemetry polling and QoS decisions add small runtime overhead. | Use Scheduler for long-running or concurrent workloads. |
| Budget profile | Conservative/balanced/performance profiles affect degradation behavior. | Start with balanced and tune on physical devices. |
| Latency reporting | Image generation can report workload latency. | Use reports to adjust model/settings. |
| Lifecycle | Dangling scheduler references can confuse cleanup. | Own scheduler lifecycle in app-level service. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion model | Yes | Primary consumer through image generation workloads. |
| Text GGUF LLM | Indirect | Scheduler coordinates multiple on-device workloads but this method targets image generation integration. |
| VLM | Indirect | Use Scheduler/RuntimePolicy where workloads are registered. |
| Embedding model | Indirect | Can be coordinated at app level if registered as workload. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target for on-device inference and Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior can be slower and not representative. |
| macOS | Yes / package surface | Validate sandbox and model file access. |
| Android | Partial / validation pending | CPU path is scaffolded; validate on target hardware before publishing performance claims. |
| Web | No | The SDK depends on native runtime/FFI and local model files. |

## Privacy and security

- Input data processed: scheduler reference only.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: telemetry and traces may reveal device performance; avoid logging user prompts or generated content in scheduler callbacks.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| No budget effect | Scheduler was not started or no budget was set. | Call \`scheduler.setBudget()\` and \`scheduler.start()\`. |
| No violation events | Workload not registered or constraints not exceeded. | Register workloads and test under pressure. |
| Image generation still runs under pressure | QoS policy not wired for this path or scheduler not connected early enough. | Call \`setScheduler()\` before image generation and review workload IDs. |
| Resource leak | Scheduler not disposed by app. | Call \`scheduler.dispose()\` during app/service cleanup. |

## Related APIs

- \`Scheduler\` — central budget coordinator.
- \`Scheduler.setBudget()\` — sets active budget.
- \`Scheduler.start()\` — starts periodic enforcement loop.
- \`EdgeVeda.generateImage()\` — image generation path that can use scheduler policy.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.setScheduler()\`
- Related class: \`Scheduler\`
- Related image generation APIs: \`generateImage()\` and \`generateImageRaw()\`

## Documentation review checklist

Before publishing, verify that:

- The method still stores the scheduler reference only.
- Image generation scheduler integration is verified in source.
- Example uses current workload enum names.
- Scheduler lifecycle responsibilities are documented clearly.
`;

window.API_DOCS.content["set-scheduler_ua"] = `# \`EdgeVeda.setScheduler()\`

> Підключає Scheduler, щоб image generation могла брати участь у budget-aware runtime policy.

Використовуйте \`setScheduler()\` після створення \`EdgeVeda\` і \`Scheduler\` instances, коли app хоче, щоб image generation workloads були tracked, gated і reported to scheduler.

## API summary

| Поле | Значення |
| --- | --- |
| API surface | Public Dart SDK |
| Class / extension | \`EdgeVeda\` |
| Method | \`setScheduler()\` |
| Category | Runtime / Scheduler integration |
| Stability | Stable API surface; перед публікацією потрібен source review |
| Since | Задокументовано в \`edge_veda\` 2.5.0 API reference |
| Platforms | iOS/macOS package surface; Android package surface з validation caveats |
| Requires initialized runtime | No |
| Supports streaming | No |
| Runs on device | Yes |

## Import

\`\`\`dart
import 'package:edge_veda/edge_veda.dart';
\`\`\`

## Signature

\`\`\`dart
void setScheduler(Scheduler scheduler);
\`\`\`

## What it does

\`setScheduler()\` зберігає \`Scheduler\` reference всередині \`EdgeVeda\` instance. Коли scheduler connected, image generation може register as workload, follow QoS policy і report latency samples to scheduler.

## When to use it

Використовуйте \`setScheduler()\` коли потрібно:

- увімкнути budget-aware image generation;
- координувати image generation з іншими on-device AI workloads;
- enforce p95 latency, battery, thermal, memory constraints через Scheduler;
- збирати workload latency і budget violation telemetry.

Не використовуйте цей метод, коли:

- ви не використовуєте image generation workloads;
- потрібна лише text generation або embeddings;
- scheduler не configured with telemetry and budget;
- очікуєте, що method automatically starts scheduler — call \`scheduler.start()\` separately.

## Prerequisites

Перед викликом методу переконайтесь, що:

- \`Scheduler\` instance exists і configured with \`TelemetryService\`;
- scheduler має active budget via \`setBudget()\`, якщо enforcement needed;
- workloads registered where appropriate;
- app owns scheduler lifecycle і calls \`dispose()\` when done.

## Parameters

| Parameter | Type | Required | Default | Description | Constraints / notes |
| --- | --- | --- | --- | --- | --- |
| \`scheduler\` | \`Scheduler\` | Yes | — | Scheduler instance для підключення до \`EdgeVeda\`. | Scheduler має бути configured, started і disposed by app. |

## Returns

\`void\` — метод зберігає scheduler reference і returns immediately.

### Return object fields

| Field | Type | Description |
| --- | --- | --- |
| — | \`void\` | Return object немає. |

## Errors and exceptions

| Error / exception | When it happens | How to handle it |
| --- | --- | --- |
| No expected typed exception | Current implementation only stores reference. | Validate scheduler setup before call і test budget behavior in integration tests. |

## Minimal example

\`\`\`dart
final scheduler = Scheduler(telemetry: TelemetryService());

scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
scheduler.start();

edgeVeda.setScheduler(scheduler);
\`\`\`

## Production-style example

\`\`\`dart
Future<Scheduler> connectScheduler(EdgeVeda edgeVeda) async {
  final scheduler = Scheduler(
    telemetry: TelemetryService(),
    restorationCooldown: const Duration(seconds: 30),
  );

  scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));
  scheduler.registerWorkload(
    WorkloadId.image,
    priority: WorkloadPriority.high,
  );

  scheduler.onBudgetViolation.listen((violation) {
    debugPrint('Budget violation: \${violation.constraint}');
  });

  scheduler.start();
  edgeVeda.setScheduler(scheduler);

  return scheduler;
}
\`\`\`

## Streaming example

Не застосовується. \`setScheduler()\` connects dependency і не повертає stream.

## Behavior notes

- Метод stores scheduler в \`EdgeVeda\` instance.
- Він не create/start/stop/dispose scheduler.
- When connected, image generation can gate on QoS policy і report latency.
- Budget enforcement depends on scheduler being configured and running.

## Performance notes

| Factor | Impact | Recommendation |
| --- | --- | --- |
| Scheduler overhead | Telemetry polling і QoS decisions add small runtime overhead. | Use Scheduler для long-running/concurrent workloads. |
| Budget profile | Conservative/balanced/performance profiles affect degradation behavior. | Start with balanced і tune on physical devices. |
| Latency reporting | Image generation can report workload latency. | Use reports to adjust model/settings. |
| Lifecycle | Dangling scheduler references can confuse cleanup. | Own scheduler lifecycle in app-level service. |

## Model compatibility

| Model family / format | Supported | Notes |
| --- | --- | --- |
| Stable Diffusion model | Yes | Primary consumer через image generation workloads. |
| Text GGUF LLM | Indirect | Scheduler coordinates multiple on-device workloads, але method targets image generation integration. |
| VLM | Indirect | Use Scheduler/RuntimePolicy where workloads registered. |
| Embedding model | Indirect | Can be coordinated at app level if registered as workload. |

## Platform compatibility

| Platform | Supported | Notes |
| --- | --- | --- |
| iOS device | Yes | Primary validated target для on-device inference та Metal acceleration. |
| iOS simulator | Partial | CPU-only behavior може бути повільним і нерепрезентативним. |
| macOS | Yes / package surface | Перевірте sandbox і model file access. |
| Android | Partial / validation pending | CPU path scaffolded; тестуйте на target hardware перед performance claims. |
| Web | No | SDK залежить від native runtime/FFI та local model files. |

## Privacy and security

- Input data processed: scheduler reference only.
- Network access: none.
- Local storage used: none by this method.
- Sensitive data considerations: telemetry/traces можуть reveal device performance; avoid logging user prompts/generated content in callbacks.

## Troubleshooting

| Symptom | Possible cause | Fix |
| --- | --- | --- |
| No budget effect | Scheduler not started або no budget set. | Call \`scheduler.setBudget()\` і \`scheduler.start()\`. |
| No violation events | Workload not registered або constraints not exceeded. | Register workloads і test under pressure. |
| Image generation still runs under pressure | QoS policy not wired або scheduler connected too late. | Call \`setScheduler()\` before image generation і review workload IDs. |
| Resource leak | Scheduler not disposed by app. | Call \`scheduler.dispose()\` during cleanup. |

## Related APIs

- \`Scheduler\` — central budget coordinator.
- \`Scheduler.setBudget()\` — sets active budget.
- \`Scheduler.start()\` — starts periodic enforcement loop.
- \`EdgeVeda.generateImage()\` — image generation path that can use scheduler policy.

## Source references

- Source file: \`flutter/lib/src/edge_veda_impl.dart\`
- Generated Dart API: \`EdgeVeda.setScheduler()\`
- Related class: \`Scheduler\`
- Related image generation APIs: \`generateImage()\` and \`generateImageRaw()\`

## Documentation review checklist

Перед публікацією перевірте:

- Method still stores scheduler reference only.
- Image generation scheduler integration verified in source.
- Example uses current workload enum names.
- Scheduler lifecycle responsibilities documented clearly.
`;

