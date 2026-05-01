---
title: "Встановлення"
description: "Як встановити Edge Veda у Flutter-проєкт і підготувати iOS runtime для локального inference."
sidebar_position: 2
status: "draft"
section: "getting-started"
lang: "uk"
last_reviewed: "2026-04-29"
---

# Встановлення

Цей гайд показує, як додати Edge Veda до Flutter-проєкту й підготувати iOS target для локальної генерації тексту.

Рекомендований шлях встановлення — через `flutter pub add edge_veda`, щоб проєкт отримав актуальну версію пакета з pub.dev.

## Передумови

Перед початком встановіть і перевірте такі інструменти:

| Вимога | Навіщо потрібно | Команда для перевірки |
| --- | --- | --- |
| Flutter SDK | Збірка й запуск Flutter-застосунку. | `flutter --version` |
| Xcode | Збірка iOS-застосунку й native dependencies. | `xcode-select -p` |
| CocoaPods | Встановлення native iOS framework dependency. | `pod --version` |
| Apple Developer account | Потрібен для signing і деплою на фізичний пристрій. | Перевірте в Xcode. |
| Фізичний iPhone | Рекомендовано для реалістичної Metal GPU performance. | `flutter devices` |

Для першого запуску використовуйте фізичний iPhone, якщо це можливо. iOS Simulator можна використовувати для UI-перевірок, але він не показує реальну продуктивність on-device inference.

## 1. Створіть Flutter-проєкт

Створіть новий Flutter-застосунок:

```bash
flutter create edge_veda_quickstart
cd edge_veda_quickstart
```

Перевірте, що starter app запускається до додавання Edge Veda:

```bash
flutter run
```

Якщо starter app не запускається, спочатку виправте Flutter/Xcode setup.

## 2. Додайте пакет Edge Veda

Додайте пакет через Flutter:

```bash
flutter pub add edge_veda
```

Після цього підтягніть dependencies:

```bash
flutter pub get
```

Команда автоматично оновить `pubspec.yaml`.

Якщо ви редагуєте `pubspec.yaml` вручну, перевірте актуальну версію пакета на pub.dev перед публікацією документації.

```yaml
dependencies:
  flutter:
    sdk: flutter
  edge_veda: ^2.5.0
```

## 3. Налаштуйте iOS deployment target

Відкрийте `ios/Podfile` і переконайтеся, що deployment target — не нижче iOS 13:

```ruby
platform :ios, '13.0'
```

Для стандартного setup не потрібна додаткова Podfile-конфігурація. Native framework встановлюється через CocoaPods.

## 4. Встановіть iOS pods

Виконайте:

```bash
cd ios
pod install
cd ..
```

Під час `pod install` native Edge Veda framework завантажується з GitHub Releases. Для стандартного сценарію не потрібно завантажувати framework вручну.

## 5. Налаштуйте code signing

Відкрийте iOS workspace:

```bash
open ios/Runner.xcworkspace
```

У Xcode:

1. Виберіть target **Runner**.
2. Відкрийте **Signing & Capabilities**.
3. Виберіть вашу development team.
4. Переконайтеся, що automatic signing увімкнено.
5. Підключіть фізичний iPhone і увімкніть Developer Mode на пристрої, якщо Xcode попросить це зробити.

## 6. Перевірте, що пакет імпортується

Відкрийте `lib/main.dart` і додайте import SDK:

```dart
import 'package:edge_veda/edge_veda.dart';
```

Запустіть static analysis:

```bash
flutter analyze
```

Import має резолвитись без помилок.

## 7. Запускайте inference-тести в release mode

Для локального inference використовуйте release mode:

```bash
flutter run --release
```

Debug mode підходить для UI-розробки, але може суттєво сповільнювати inference. Для перевірки latency генерації тексту використовуйте release mode.

## Очікуваний стан проєкту

Після встановлення проєкт має містити:

```text
edge_veda_quickstart/
├── ios/
│   ├── Podfile
│   └── Runner.xcworkspace
├── lib/
│   └── main.dart
└── pubspec.yaml
```

У `pubspec.yaml` має бути `edge_veda`, а в `ios/Podfile` має бути вказаний мінімальний iOS deployment target.

## Troubleshooting

| Проблема | Можлива причина | Як виправити |
| --- | --- | --- |
| `pod: command not found` | CocoaPods не встановлено. | Встановіть CocoaPods і повторіть `pod install`. |
| Xcode signing error | Для Runner target не вибрана команда. | Відкрийте `ios/Runner.xcworkspace` і налаштуйте Signing & Capabilities. |
| App встановлюється, але працює повільно | Застосунок запущено в debug mode або на Simulator. | Використайте фізичний пристрій і `flutter run --release`. |
| Package import fails | Dependencies не підтягнуті. | Виконайте `flutter pub get` і перезапустіть IDE. |
| Native framework download fails | Проблема з мережею або доступом до GitHub Releases під час `pod install`. | Повторіть на стабільній мережі й очистіть pods за потреби. |
| Device не відображається | iPhone заблокований, не trusted або Developer Mode вимкнений. | Підтвердьте довіру до Mac і увімкніть Developer Mode. |

## Наступний крок

Перейдіть до [`first-text-generation.md`](./first-text-generation.md), щоб ініціалізувати Edge Veda, завантажити starter model і передати перший згенерований текст потоком.
