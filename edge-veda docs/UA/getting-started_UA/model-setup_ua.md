---
title: "Налаштування моделей"
description: "Як вибрати, завантажити, імпортувати й перевірити локальні моделі для Edge Veda."
sidebar_position: 5
status: "draft"
section: "getting-started"
lang: "uk"
last_reviewed: "2026-04-29"
---

# Налаштування моделей

Цей гайд пояснює, як підготувати локальні моделі для Edge Veda.

Використовуйте цю сторінку, коли потрібно:

- вибрати першу модель для quickstart;
- перевірити, чи модель підходить для пристрою;
- завантажити модель з `ModelRegistry`;
- імпортувати локальну GGUF model;
- показувати download progress;
- уникнути типових проблем з memory і storage.

## Рекомендована перша модель

Для першого chat або text generation тесту почніть із `ModelRegistry.llama32_1b`.

Це безпечний перший вибір: модель достатньо мала для сучасних iPhone, підтримує chat та instruction-following і використовується в офіційному quickstart path.

## Model setup flow

![gs-model-setup](mermaid-diagrams/gs-model-setup.png)

## 1. Визначте профіль пристрою

Використайте `DeviceProfile.detect()` перед вибором моделі.

```dart
final device = DeviceProfile.detect();

print('Device: ${device.deviceName}');
print('RAM: ${device.totalRamGB} GB');
print('Chip: ${device.chipName}');
```

Device profile важливий, тому що вибір моделі залежить від RAM, CPU/GPU capabilities і покоління пристрою.

## 2. Отримайте рекомендацію від `ModelAdvisor`

Використовуйте `ModelAdvisor`, коли хочете, щоб SDK рекомендував модель і конфігурацію для поточного пристрою.

```dart
final rec = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);

if (rec.bestMatch != null) {
  print('Recommended: ${rec.bestMatch!.model.name}');
  print('Score: ${rec.bestMatch!.finalScore}/100');
  print('Fits: ${rec.bestMatch!.fits}');
}
```

Use cases можуть включати chat, fast responses, reasoning, vision, speech або інші підтримувані категорії залежно від версії SDK.

## 3. Перевірте, чи модель можна запустити

Перед завантаженням великої моделі перевірте, чи target device може її запустити.

```dart
final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  print('Choose a smaller model before downloading.');
}
```

Це допомагає не завантажувати файл, який пристрій не зможе стабільно завантажити в runtime.

## 4. Перевірте доступний storage

Великі model files можуть впасти під час download, якщо на пристрої недостатньо місця.

```dart
final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  print(storage.warning);
}
```

Запускайте цю перевірку до download, особливо якщо застосунок пропонує кілька models.

## 5. Завантажте модель з `ModelRegistry`

Використовуйте `ModelManager.downloadModel()`, коли модель відома і є в registry.

```dart
final modelManager = ModelManager();

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

print('Model path: $modelPath');
```

Повернутий `modelPath` передається в `EdgeVedaConfig`.

```dart
await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

## 6. Показуйте download progress

У production app варто показувати progress першого завантаження моделі.

```dart
final subscription = modelManager.downloadProgress.listen((progress) {
  print('${progress.progressPercent}% - '
      '${progress.estimatedSecondsRemaining}s remaining');
});

try {
  final modelPath = await modelManager.downloadModel(
    ModelRegistry.llama32_1b,
  );
  print(modelPath);
} finally {
  await subscription.cancel();
}
```

Не залишайте користувача на порожньому loading screen. Model files можуть важити сотні мегабайт.

## 7. Імпортуйте локальну модель

Використовуйте `importModel()`, коли модель уже є на диску, bundled with app або надана користувачем.

```dart
final modelManager = ModelManager();

final modelPath = await modelManager.importModel(
  ModelRegistry.llama32_1b,
  sourcePath: '/path/to/your/model.gguf',
  onProgress: (bytesCopied, totalBytes) {
    final percent = (bytesCopied / totalBytes * 100).toStringAsFixed(0);
    print('Copying: $percent%');
  },
);
```

Import корисний для:

- offline test devices;
- enterprise apps з pre-approved model files;
- QA environments, де downloads blocked;
- моделей, які поширюються поза default registry.

## Таблиця starter models

| Model | Approx. size | Template | Best for |
| --- | ---: | --- | --- |
| Llama 3.2 1B Instruct | 668 MB | `llama3Instruct` | General chat, first quickstart |
| Qwen3 0.6B | 397 MB | `qwen3` | Function calling, tools, low memory |
| TinyLlama 1.1B Chat | 669 MB | `generic` | Speed-first testing |
| Gemma 2 2B Instruct | 1.6 GB | `generic` | Balanced quality/speed |
| Phi 3.5 Mini Instruct | 2.3 GB | `chatML` | Higher-quality reasoning on stronger devices |
| MiniLM L6 v2 | 46 MB | embedding | RAG, similarity search |
| Whisper Tiny | 77 MB | stt | Fast transcription |
| Whisper Base | 148 MB | stt | Better transcription quality |
| SmolVLM2 500M | 607 MB | vision | Image and camera analysis |

Перед публікацією перевірте актуальні model names і registry identifiers у README проєкту.

## Вибір chat template

Chat models потребують правильного template. Неправильний template може дати repeated, malformed або low-quality output.

```dart
// Llama 3.x models
final llamaSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.llama3Instruct,
);

// Qwen3 models with tool calling
final qwenSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.qwen3,
);

// Phi 3.5 models
final phiSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.chatML,
);

// Unknown or generic chat models
final genericSession = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.generic,
);
```

## Вибір context length

`contextLength` керує тим, скільки тексту модель може враховувати одночасно. Більше значення може покращити довгі розмови, але збільшує memory usage.

Почніть із:

```dart
contextLength: 2048
```

Якщо app crashиться або пристрій має мало memory, зменште значення:

```dart
contextLength: 1024
```

Коротший context доречний для старіших пристроїв, background workloads або застосунків, які запускають кілька AI workers одночасно.

## Рекомендовані production checks

Перед `downloadModel()` або `init()` у production app:

```dart
final device = DeviceProfile.detect();

final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  throw StateError('Selected model does not fit on this device.');
}

if (!storage.hasSufficientSpace) {
  throw StateError(storage.warning);
}
```

## Поведінка model cache

Після успішного download SDK може повторно використовувати cached model path. Перший запуск повільніший, бо модель потрібно завантажити й завантажити у memory. Наступні запуски мають пропускати download і переходити до runtime initialization.

Все одно трактуйте cached model paths як app-controlled storage. Reinstall, storage cleanup або sandbox change можуть зробити старі paths неактуальними.

## Troubleshooting

| Симптом | Ймовірна причина | Як виправити |
| --- | --- | --- |
| Download fails before starting | Недостатньо disk space. | Запустіть `checkStorageAvailability()` і запропонуйте меншу модель. |
| Download stops mid-way | Network interruption. | Повторіть `downloadModel()`. Downloads мають resume там, де можливо. |
| `Model file not found` | Path stale або модель не завантажена. | Використовуйте `ModelManager` для отримання поточного model path. |
| Initialization fails | Модель завелика або wrong format. | Використайте `ModelAdvisor.canRun()` і перевірте GGUF для text models. |
| Output repeated або strange | Неправильний chat template. | Узгодьте модель з `ChatTemplateFormat`. |
| App killed during generation | Memory pressure. | Візьміть меншу модель або зменште `contextLength`. |

## Наступний крок

Перейдіть до [`ios-device-setup.md`](./ios-device-setup.md), щоб підготувати фізичний iPhone для надійного on-device testing.
