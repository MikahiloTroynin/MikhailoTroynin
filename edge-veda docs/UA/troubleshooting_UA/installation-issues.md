---
title: "Проблеми встановлення"
description: "Як усувати проблеми з dependency, CocoaPods, XCFramework, налаштуванням пристрою та першим запуском Edge Veda."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми встановлення

Використовуйте цю сторінку, коли Edge Veda не встановлюється, `flutter pub get` завершується помилкою, `pod install` не проходить, native `XCFramework` відсутній або перший застосунок не запускається на пристрої.

Проблеми встановлення зазвичай виникають на одному з чотирьох рівнів:

1. Налаштування Flutter dependency.
2. Налаштування iOS toolchain.
3. Робота CocoaPods і завантаження native binary.
4. Завантаження, імпорт або зберігання моделі на пристрої.

## Базове середовище

| Область | Очікуване налаштування |
| --- | --- |
| Flutter | Flutter SDK 3.16.0 або новіший. |
| Package | `edge_veda: ^2.4.2` або версія, яку обрала команда. |
| iOS target | `platform :ios, '13.0'` або вище в `ios/Podfile`. |
| Xcode | Встановлено і вибрано через `xcode-select -p`. |
| CocoaPods | `pod --version` повертає номер версії. |
| Пристрій | Фізичний iPhone бажаний для Metal GPU і реальної поведінки памʼяті. |
| Developer Mode | Увімкнено на тестовому iPhone. |
| Signing | Налаштовано в `ios/Runner.xcworkspace`. |

## Перший clean check

Запустіть з кореня Flutter-застосунку:

```bash
flutter clean
flutter pub get
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
flutter doctor -v
flutter run -d <device_id>
```
## Не проходить `flutter pub get`

| Симптом | Ймовірна причина | Рішення |
| --- | --- | --- |
| `version solving failed` | Непідтримувана або конфліктна package version. | Перевірте `pubspec.yaml`, потім знову запустіть `flutter pub get`. |
| `The current Dart SDK version is lower than required` | Flutter/Dart застарілий. | Оновіть Flutter до версії, яку підтримує проєкт. |
| Package cache errors | Локальний Flutter cache застарів або пошкоджений. | Запустіть `flutter pub cache repair`. |
| Dependency не підтягується | Застарілий `pubspec.lock`. | Видаліть `pubspec.lock`, потім запустіть `flutter pub get`. |

Рекомендований reset:

```bash
rm -f pubspec.lock
flutter pub cache repair
flutter pub get
```

## Не проходить `pod install`

| Симптом | Ймовірна причина | Рішення |
| --- | --- | --- |
| `pod: command not found` | CocoaPods не встановлено. | Встановіть CocoaPods способом, який затвердила команда. |
| `Unable to find a specification for EdgeVedaCore` | Проблема з pod cache або podspec resolution. | Запустіть `pod repo update`, потім `pod install`. |
| `The platform of the target Runner is lower than iOS 13.0` | Deployment target занадто низький. | Встановіть `platform :ios, '13.0'` або вище. |
| `Failed to download EdgeVedaCore.xcframework.zip` | Проблема з мережею або доступом до release asset. | Повторіть на стабільній мережі й перевірте proxy/firewall. |
| Build використовує старий native binary | Застарілий CocoaPods cache. | Очистіть `Pods`, `Podfile.lock` і `pod cache`. |

Рекомендований reset:

```bash
cd ios
rm -rf Pods Podfile.lock
pod repo update
pod install
cd ..
```

Якщо підозрюєте native binary cache:

```bash
pod cache clean EdgeVedaCore --all
cd ios && pod install && cd ..
```

## Відсутній native `XCFramework`

Перевірте, що:

- `pod install` запущено з `ios/`.
- Застосунок відкрито через `ios/Runner.xcworkspace`, а не `Runner.xcodeproj`.
- `EdgeVedaCore.xcframework` є серед resolved pod artifacts.
- Машина має доступ до GitHub Releases під час встановлення.

Для детальної діагностики використайте verbose output:

```bash
cd ios
pod install --verbose
cd ..
```

## Застосунок встановлюється, але не стартує

Типові причини:

- Code signing не налаштовано.
- Developer Mode вимкнено на iPhone.
- Пристрій не довіряє development certificate.
- Файл моделі відсутній або недоступний для читання.
- Вибрана модель занадто велика для пристрою.
- Застосунок тестується тільки в iOS Simulator, який не показує реальну Metal GPU performance.

Чекліст рішення:

1. Відкрийте `ios/Runner.xcworkspace`.
2. Виберіть target `Runner`.
3. Відкрийте **Signing & Capabilities**.
4. Виберіть development team.
5. Увімкніть **Automatically manage signing** для development.
6. Увімкніть Developer Mode на iPhone.
7. Для Metal GPU тестуйте на фізичному iPhone.

## Налаштування моделі блокує перший запуск

Якщо install пройшов, але `EdgeVeda.init()` падає:

- Переконайтесь, що `modelPath` вказує на локальний файл, який можна прочитати.
- Переконайтесь, що файл моделі завантажено повністю.
- Переконайтесь, що format відповідає вибраному runtime path, наприклад підтримуваний `.gguf` для LLM-моделей.
- Використовуйте `ModelAdvisor.canRun()` перед завантаженням великої моделі.
- Використовуйте `ModelAdvisor.checkStorageAvailability()` перед download або import.
- Якщо використовуєте `ModelManager.importModel()`, переконайтесь, що source file повний і доступний з app sandbox.

## Шлях чистого перевстановлення

Використовуйте, коли кілька рівнів можуть бути застарілими:

```bash
flutter clean
rm -f pubspec.lock
flutter pub get
cd ios
rm -rf Pods Podfile.lock
pod cache clean EdgeVedaCore --all
pod install
cd ..
flutter run
```

Не видаляйте завантажені файли моделей, якщо проблема явно не повʼязана з model corruption або unsupported model format.

## Діагностика для bug report

Додайте:

```bash
flutter --version
flutter doctor -v
pod --version
xcodebuild -version
```

Також додайте:

- Версію Edge Veda з `pubspec.lock`.
- iOS deployment target з `ios/Podfile`.
- Модель пристрою та версію iOS.
- Де виникає помилка: simulator, фізичний пристрій або обидва варіанти.
- Повний вивід `pod install --verbose`.
- Повний вивід `flutter run -v`.

## Повʼязані документи

- [Проблеми iOS build](./ios-build-issues.md)
- [Проблеми завантаження моделей](./model-loading-issues.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Налаштування iOS-пристрою](../getting-started/ios-device-setup.md)
- [Quickstart troubleshooting](../getting-started/quickstart-troubleshooting.md)
