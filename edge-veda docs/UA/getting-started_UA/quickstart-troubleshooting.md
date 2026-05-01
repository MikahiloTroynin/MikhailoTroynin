---
title: "Troubleshooting для Quickstart"
description: "Як виправити типові проблеми Edge Veda під час installation, iOS setup, model download, runtime initialization і streaming."
sidebar_position: 7
status: "draft"
section: "getting-started"
lang: "uk"
last_reviewed: "2026-04-29"
---

# Troubleshooting для Quickstart

Використовуйте цей гайд, коли Getting Started flow не працює очікувано.

Найшвидший спосіб дебажити Edge Veda quickstart issues — спочатку визначити етап, на якому виникла проблема:

1. Встановлення Flutter і пакета
2. Налаштування CocoaPods і native-фреймворку
3. Підпис iOS і розгортання на пристрої
4. Завантаження або імпорт моделі
5. Ініціалізація runtime
6. Text generation or streaming chat
7. Performance, memory, or thermal behavior

## Quick diagnosis table

| Етап | Симптом | Найімовірніша причина | Перша дія |
| --- | --- | --- | --- |
| Package install | `package:edge_veda` не резолвиться | Dependencies не підтягнуті | Run `flutter pub get` |
| CocoaPods | `No such module 'edge_veda'` | Pods not installed або opened wrong Xcode file | Run `pod install` і open `.xcworkspace` |
| Signing | `Signing for "Runner" requires a development team` | Xcode signing not configured | Select team in Signing & Capabilities |
| Device | iPhone не видно | Device not trusted або Developer Mode disabled | Trust Mac and enable Developer Mode |
| Model download | Download fails or stalls | Network interruption або low storage | Check Wi-Fi and storage, retry download |
| Model load | `ModelLoadException` | Model path missing or stale | Use `ModelManager` to resolve model path |
| Init | `InitializationException` | Model too large або wrong format | Check `ModelAdvisor.canRun()` |
| Generation | Empty or repeated output | Wrong chat template або prompt issue | Match template to model family |
| Performance | Very slow tokens | Debug mode або simulator | Run on device with `flutter run --release` |
| Stability | App crashes during generation | Memory pressure | Reduce `contextLength` або use smaller model |

## 1. Package cannot be imported

### Симптом

```text
Target of URI doesn't exist: 'package:edge_veda/edge_veda.dart'
```

### Причина

Пакета немає в `pubspec.yaml`, або Flutter dependencies не підтягнуті після редагування `pubspec.yaml`.

### Як виправити

Використайте package manager command:

```bash
flutter pub add edge_veda
flutter pub get
```

Після цього перезапустіть IDE або Dart analysis server.

## 2. CocoaPods cannot find or install the native dependency

### Симптом

```text
CocoaPods could not find compatible versions for pod "EdgeVedaCore"
```

### Причина

Локальний CocoaPods cache або podspec state застарів.

### Як виправити

Виконайте:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

Якщо проблема не зникла, очистіть CocoaPods cache:

```bash
pod cache clean --all
cd ios
pod install
cd ..
```

## 3. `No such module 'edge_veda'`

### Симптом

```text
No such module 'edge_veda'
```

### Причина

iOS workspace не відкрито, або `pod install` не виконано після додавання package.

### Як виправити

Завжди відкривайте workspace, а не project file:

```bash
cd ios
pod install
cd ..
open ios/Runner.xcworkspace
```

Закрийте будь-яке відкрите вікно `Runner.xcodeproj` перед rebuild.

## 4. Xcode signing error

### Симптом

```text
Signing for "Runner" requires a development team
```

### Причина

Xcode не знає, яка Apple team має підписувати app.

### Як виправити

1. Open `ios/Runner.xcworkspace`.
2. Select **Runner**.
3. Open **Signing & Capabilities**.
4. Enable **Automatically manage signing**.
5. Select your development team.

Free personal team достатньо для local development builds.

## 5. iPhone is not detected

### Симптом

```bash
flutter devices
```

не показує iPhone.

### Причина

Device locked, not trusted, wrong connection або Developer Mode disabled.

### Як виправити

- Unlock the phone.
- Reconnect USB cable.
- Tap **Trust This Computer** on the device.
- Enable Developer Mode:
  - Settings → Privacy & Security → Developer Mode.
- Restart iPhone if prompted.
- Run:

```bash
flutter devices
```

## 6. Model file not found

### Симптом

```text
ModelLoadException: Model file not found
```

### Причина

Модель не завантажена, path stale або app sandbox змінився після reinstall.

### Як виправити

Використовуйте `ModelManager`, а не hardcoded model paths.

```dart
final modelManager = ModelManager();

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

Якщо ваша версія SDK має `isModelDownloaded()` або `getModelPath()`, використовуйте ці helpers перед initialization.

## 7. Ініціалізація runtime fails

### Симптом

```text
InitializationException: Initialization failed
```

### Причина

Типові причини:

- model too large for the device;
- wrong model format;
- corrupted or incomplete model file;
- not enough memory at runtime;
- `contextLength` too high.

### Як виправити

Перевірте model fit before loading:

```dart
final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  print('Choose a smaller model.');
}
```

Зменште context length:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
);
```

Після цього повторіть initialization.

## 8. Download fails because of storage

### Симптом

```text
DownloadException: Insufficient disk space
```

### Причина

На device недостатньо free storage для model file.

### Як виправити

Перевірте storage before download:

```dart
final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  print(storage.warning);
}
```

Після цього запропонуйте одну з дій:

- free up device storage;
- choose a smaller model;
- postpone model download;
- use Wi-Fi and keep the app open.

## 9. Download stalls or fails mid-way

### Симптом

Download stops before completion.

### Причина

Network interruption, app suspension або server timeout.

### Як виправити

Повторіть download:

```dart
final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);
```

Якщо SDK підтримує resumable downloads, retry має продовжити з попереднього progress, а не завантажувати все заново.

## 10. Output is garbage, repeated, or malformed

### Симптом

Модель повторює текст, виводить special tokens або не дотримується chat flow.

### Причина

Chat template не відповідає model family.

### Як виправити

Використайте правильний template:

```dart
final session = ChatSession(
  edgeVeda: edgeVeda,
  templateFormat: ChatTemplateFormat.llama3Instruct,
);
```

Common mappings:

| Model family | Template |
| --- | --- |
| Llama 3.x Instruct | `ChatTemplateFormat.llama3Instruct` |
| Qwen3 | `ChatTemplateFormat.qwen3` |
| Phi 3.5 | `ChatTemplateFormat.chatML` |
| Gemma / TinyLlama / unknown | `ChatTemplateFormat.generic` |

## 11. Inference is slow

### Симптом

Модель працює, але token output повільний.

### Причина

Найчастіше app запущено в debug mode або на simulator.

### Як виправити

Запустіть на фізичному iPhone:

```bash
flutter run --release
```

Або використайте profile mode, якщо потрібен DevTools:

```bash
flutter run --profile
```

Не benchmark-те з debug mode.

## 12. App crashes during generation

### Симптом

App працює певний час, а потім iOS його завершує.

### Причина

Memory pressure, особливо на low-memory devices або з великими models і long context.

### Як виправити

Використайте smaller model або lower context length:

```dart
final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
);
```

Також не запускайте кілька heavy AI workers одночасно на low-memory devices.

## 13. UI freezes during generation

### Симптом

UI стає unresponsive під час generation.

### Причина

App може робити забагато роботи всередині stream loop або занадто часто rebuild-ити UI.

### Як виправити

Тримайте stream loop маленьким:

```dart
await for (final chunk in session.sendStream(prompt)) {
  if (!chunk.isFinal) {
    setState(() {
      output += chunk.token;
    });
  }
}
```

Для production можна throttle UI updates, якщо chunks приходять дуже швидко.

## 14. Button stays disabled after an error

### Симптом

Send або Generate button залишається disabled.

### Причина

Loading flag не скидається після exception.

### Як виправити

Використовуйте `finally`:

```dart
try {
  await for (final chunk in edgeVeda.generateStream(prompt)) {
    // update UI
  }
} catch (error) {
  // show error
} finally {
  if (mounted) {
    setState(() => isLoading = false);
  }
}
```

## 15. Checklist before asking for help

Додайте цю інформацію в bug report або support request:

- Edge Veda package version;
- Flutter version;
- Xcode version;
- iOS version;
- device model;
- simulator or physical device;
- debug, profile, or release mode;
- model name and approximate size;
- `contextLength`;
- `useGpu` value;
- complete error message;
- steps to reproduce;
- чи issue повторюється після `flutter clean`.

## Clean rebuild sequence

Коли стан проєкту незрозумілий, виконайте clean rebuild:

```bash
flutter clean
flutter pub get

cd ios
pod deintegrate
pod install
cd ..

flutter run --release
```

## Пов’язані сторінки

- [`installation.md`](./installation.md)
- [`first-text-generation.md`](./first-text-generation.md)
- [`first-streaming-chat.md`](./first-streaming-chat.md)
- [`model-setup.md`](./model-setup.md)
- [`ios-device-setup.md`](./ios-device-setup.md)
