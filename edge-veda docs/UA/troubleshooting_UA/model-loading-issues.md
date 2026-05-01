---
title: "Проблеми завантаження моделей"
description: "Як усувати проблеми modelPath, format, storage, checksum, compatibility та initialization failures в Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми завантаження моделей

Використовуйте цю сторінку, коли `EdgeVeda.init()` завершується помилкою, модель не знайдено, `.gguf` не завантажується, завантажений файл неповний або застосунок падає під час model initialization.

Проблеми завантаження моделей зазвичай мають одну з таких причин:

- `modelPath` вказує на файл, якого немає або який неможливо прочитати.
- Файл моделі неповний або пошкоджений.
- Model format не підтримується вибраним API path.
- Модель занадто велика для пристрою.
- На пристрої недостатньо вільного disk space.
- Попередній невдалий download залишив застарілий стан.
- Runtime ініціалізується кілька разів без cleanup.

## Швидкий чекліст

| Перевірка | Що перевірити |
| --- | --- |
| Файл існує | `File(modelPath).exists()` повертає `true`. |
| File size | File size відповідає очікуваному розміру моделі. |
| Format | File format відповідає можливості, наприклад підтримуваний `.gguf` для LLM inference. |
| Storage | На пристрої достатньо вільного місця перед download або import. |
| Memory fit | `ModelAdvisor.canRun()` повертає прийнятний результат для обраної моделі. |
| Path source | `modelPath` походить з `ModelManager`, app documents directory або перевіреного import path. |
| Пристрій | Для реального Metal GPU використовується фізичний iPhone. |

## Мінімальний безпечний процес завантаження

```dart
final modelManager = ModelManager();

final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  throw StateError(storage.warning);
}

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

final edgeVeda = EdgeVeda();
await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  useGpu: true,
));
```

## `Model file not found`

| Причина | Рішення |
| --- | --- |
| Path був hardcoded для development machine. | Використайте app-local path з `ModelManager` або platform file picker. |
| Модель bundled, але не вказана як asset. | Додайте asset у `pubspec.yaml`, потім перезберіть застосунок. |
| Файл поза app sandbox. | Скопіюйте або імпортуйте його в app-accessible directory. |
| Path збережено з попереднього install. | Після reinstall або update визначайте path заново. |

Фрагмент для debug:

```dart
final file = File(modelPath);
print('Model path: $modelPath');
print('Exists: ${await file.exists()}');
print('Size: ${await file.length()} bytes');
```

## Download не завершується

Чекліст рішення:

- За можливості використовуйте `ModelManager.downloadModel()`, а не custom downloader.
- Не переводьте застосунок у фон, доки перший великий model download не завершиться.
- Перевірте free disk space перед download.
- Повторіть на стабільній мережі.
- Видаліть тільки incomplete model file, а не всю app data directory.
- Логуйте `downloadProgress`, щоб перевірити, чи transfer продовжується.

```dart
modelManager.downloadProgress.listen((progress) {
  print('${progress.progressPercent}% - '
      '${progress.estimatedSecondsRemaining}s remaining');
});
```

## Локальний import падає

| Причина | Рішення |
| --- | --- |
| Source file неповний. | Повторно завантажте модель і перевірте file size. |
| Source path недоступний для застосунку. | Використайте file picker або скопіюйте файл в app-accessible directory. |
| Очікувана model metadata не збігається. | Використайте правильний `ModelRegistry` entry або перевірений custom model definition. |
| Import було перервано. | Повторіть import. Atomic copy має запобігти пошкодженню фінального файлу. |

## Непідтримуваний model format

Перевірте:

- Model format, який потрібен конкретній можливості.
- Чи model family підтримується поточною версією Edge Veda.
- Чи quantization level підтримується на target device.
- Чи файл справді має очікуваний format, а не тільки перейменований.
- Чи завантажується known registry model, наприклад `ModelRegistry.llama32_1b`.

## Модель занадто велика

Симптоми:

- Застосунок падає під час `EdgeVeda.init()`.
- iOS завершує застосунок без Dart exception.
- Памʼять різко зростає до початку generation.
- Та сама модель працює на новішому iPhone, але не працює на старішому.

Чекліст рішення:

- Використайте `DeviceProfile.detect()`, щоб визначити device tier.
- Використайте `ModelAdvisor.recommend()` для target use case.
- Зменште model size або використайте меншу quantization.
- Зменште `contextLength`.
- Не завантажуйте text, vision, STT та image generation workers одночасно.
- Звільняйте idle workers перед завантаженням іншої великої моделі.

```dart
final device = DeviceProfile.detect();
final rec = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);
print(rec.bestMatch?.model.name);
```

## Initialization зависає

| Причина | Як діяти |
| --- | --- |
| Велика модель завантажується на повільному пристрої. | Додайте progress UI і протестуйте меншу модель. |
| Main isolate заблоковано app code. | Не виконуйте важку синхронну роботу в UI code. |
| Кілька initialization calls накладаються одна на одну. | Серіалізуйте виклики `EdgeVeda.init()`. |
| Native runtime очікує недоступні resources. | Зберіть native logs з Xcode. |

Захист від duplicate initialization:

```dart
class EdgeVedaRuntimeHolder {
  EdgeVeda? _runtime;
  Future<void>? _initFuture;

  Future<EdgeVeda> getOrInit(String modelPath) async {
    if (_runtime != null) return _runtime!;
    if (_initFuture != null) {
      await _initFuture;
      return _runtime!;
    }

    final runtime = EdgeVeda();
    _initFuture = runtime.init(EdgeVedaConfig(modelPath: modelPath));
    await _initFuture;
    _runtime = runtime;
    return runtime;
  }
}
```

## Generation працює, але output неякісний

Це зазвичай не loading failure. Перевірте:

- Модель instruction-tuned, якщо використовується для chat.
- Для model family вибрано правильний chat template.
- Prompt не перевищує configured context window.
- Застосунок не використовує base model там, де очікується assistant model.
- Sampling settings відповідають задачі.

## Діагностика

Додайте:

- Версію Edge Veda.
- Модель пристрою, версію iOS і доступний storage.
- Model name, format, quantization level і file size.
- Звідки модель: `downloadModel()`, `importModel()`, bundle asset або custom path.
- Форму `modelPath` без приватних user data.
- Вивід debug snippet для перевірки існування файлу і file size.
- Logs з `flutter run -v` і Xcode.
- Чи завантажується менша registry model.

## Повʼязані документи

- [Проблеми встановлення](./installation-issues.md)
- [Проблеми iOS build](./ios-build-issues.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Supported models](../reference/supported-models.md)
- [Model formats](../reference/model-formats.md)
- [Quantization levels](../reference/quantization-levels.md)
- [Model manager](../guides/model-manager.md)
- [Model advisor](../guides/model-advisor.md)
