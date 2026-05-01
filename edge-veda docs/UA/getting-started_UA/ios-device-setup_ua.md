---
title: "Налаштування iOS-пристрою"
description: "Як підготувати фізичний iPhone, Xcode, CocoaPods, signing і release mode для тестування Edge Veda."
sidebar_position: 6
status: "draft"
section: "getting-started"
lang: "uk"
last_reviewed: "2026-04-29"
---

# Налаштування iOS-пристрою

Цей гайд допомагає підготувати реальний iPhone для розробки й тестування Edge Veda.

Для performance checks використовуйте фізичний пристрій. iOS Simulator корисний для UI, але не показує реальну Metal GPU inference performance.

## Підтримуваний setup

Поточний quickstart path фокусується на iOS. Використовуйте цей гайд для:

- локальної Flutter-розробки на macOS;
- фізичного iPhone через USB або trusted Wi-Fi debugging;
- Xcode-managed signing;
- CocoaPods-managed native dependencies;
- release або profile builds для inference tests.

## Передумови

| Вимога | Рекомендована перевірка |
| --- | --- |
| macOS | Mac, який підтримує актуальну версію Xcode. |
| Xcode | `xcode-select -p` |
| Flutter SDK | `flutter --version` |
| CocoaPods | `pod --version` |
| Apple ID | Потрібен у Xcode Signing & Capabilities. |
| Фізичний iPhone | `flutter devices` |
| Developer Mode | iPhone Settings → Privacy & Security → Developer Mode. |

## 1. Перевірте Flutter і Xcode

Виконайте:

```bash
flutter doctor
```

Виправте Xcode або iOS toolchain warnings до того, як дебажити Edge Veda issues.

Потім перевірте Xcode command line tools:

```bash
xcode-select -p
```

Якщо команда вказує на неправильну Xcode installation, виберіть правильну:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## 2. Встановіть CocoaPods

Перевірте CocoaPods:

```bash
pod --version
```

Якщо CocoaPods відсутній, встановіть його через ваш Ruby setup. Один із поширених варіантів:

```bash
sudo gem install cocoapods
```

Після встановлення виконайте:

```bash
pod repo update
```

## 3. Створіть або відкрийте Flutter app

Створіть новий app:

```bash
flutter create edge_veda_ios_test
cd edge_veda_ios_test
```

Або відкрийте існуючий Flutter app.

Додайте Edge Veda:

```bash
flutter pub add edge_veda
flutter pub get
```

## 4. Встановіть iOS deployment target

Відкрийте `ios/Podfile` і вкажіть мінімальну iOS version:

```ruby
platform :ios, '13.0'
```

У default setup не потрібно завантажувати XCFramework вручну. Native framework підтягується під час `pod install`.

## 5. Встановіть pods

Виконайте:

```bash
cd ios
pod install
cd ..
```

Якщо pods failed, не відкривайте `.xcodeproj`. Використовуйте workspace, який створив CocoaPods:

```bash
open ios/Runner.xcworkspace
```

## 6. Налаштуйте signing в Xcode

В Xcode:

1. Відкрийте `ios/Runner.xcworkspace`.
2. Виберіть **Runner** target.
3. Відкрийте **Signing & Capabilities**.
4. Увімкніть **Automatically manage signing**.
5. Виберіть вашу Apple developer team або personal team.
6. Переконайтеся, що bundle identifier унікальний.

Free Apple ID достатньо для development builds. Для App Store distribution потрібен paid developer account.

## 7. Підготуйте iPhone

На iPhone:

1. Підключіть пристрій до Mac.
2. Розблокуйте телефон.
3. Натисніть **Trust This Computer**, якщо з’явиться запит.
4. Увімкніть **Developer Mode**:
   - Settings → Privacy & Security → Developer Mode.
5. Перезапустіть пристрій, якщо iOS попросить.
6. Тримайте телефон розблокованим під час першого deploy.

Перевірте, що Flutter бачить пристрій:

```bash
flutter devices
```

## 8. Запустіть app на пристрої

Для UI checks:

```bash
flutter run
```

Для inference performance:

```bash
flutter run --release
```

Для performance з DevTools support:

```bash
flutter run --profile
```

Використовуйте release або profile builds, коли вимірюєте generation speed, first-token latency, model load time або thermal behavior.

## Обмеження Simulator

iOS Simulator може запускати UI, але це не надійна ціль для inference performance.

| Target | Використовуйте для | Не використовуйте для |
| --- | --- | --- |
| iOS Simulator | UI layout, navigation, basic integration checks | Metal GPU performance, realistic token speed, memory pressure |
| Physical iPhone debug build | Development, logs, first setup check | Performance conclusions |
| Physical iPhone release build | Realistic inference behavior | Step-by-step debugging |
| Physical iPhone profile build | Performance testing with some tooling | Final production benchmark |

## Очікування першого запуску

Перший device run може тривати довше, тому що:

- Flutter builds and signs the app;
- iOS installs and trusts the developer profile;
- модель завантажується вперше;
- runtime loads model weights into memory.

Model loading може зайняти десятки секунд при першій ініціалізації. Не оцінюйте runtime speed, доки app не запущено в release або profile mode.

## Корисні команди

Очистити Flutter build output:

```bash
flutter clean
flutter pub get
```

Перевстановити pods:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

Очистити CocoaPods cache:

```bash
pod cache clean --all
```

Відкрити правильний Xcode workspace:

```bash
open ios/Runner.xcworkspace
```

Список devices:

```bash
flutter devices
```

Запуск у release mode:

```bash
flutter run --release
```

## Device checklist перед bug report

Перед тим як повідомляти про Edge Veda issue, зберіть:

- device model;
- iOS version;
- app build mode: debug, profile або release;
- model name and size;
- `contextLength`;
- чи `useGpu` enabled;
- simulator чи physical device;
- full Xcode або Flutter logs;
- steps to reproduce.

## Типові setup problems

| Симптом | Причина | Як виправити |
| --- | --- | --- |
| Device не видно в `flutter devices` | Пристрій заблокований, not trusted або Developer Mode off. | Розблокуйте, trust Mac, enable Developer Mode. |
| Xcode signing error | Development team не вибрана. | Select team у Runner → Signing & Capabilities. |
| Build відкриває `.xcodeproj` замість workspace | CocoaPods dependencies не loaded. | Відкрийте `ios/Runner.xcworkspace`. |
| `No such module 'edge_veda'` | Pods not installed або workspace not used. | Run `pod install` і reopen workspace. |
| Pod version conflict | Stale pod state або cache. | Run `pod deintegrate`, `pod install` або clear pod cache. |
| Inference дуже повільний | Debug mode або simulator. | Use physical iPhone and `flutter run --release`. |

## Наступний крок

Перейдіть до [`quickstart-troubleshooting.md`](./quickstart-troubleshooting.md) для stage-by-stage troubleshooting reference.
