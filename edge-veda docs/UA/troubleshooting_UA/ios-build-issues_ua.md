---
title: "Проблеми iOS build"
description: "Як усувати проблеми Xcode, CocoaPods, signing, deployment target, architecture і native linking для Edge Veda на iOS."
status: "draft"
section: "troubleshooting"
last_reviewed: "2026-05-01"
---

# Проблеми iOS build

Використовуйте цю сторінку, коли Flutter-застосунок з Edge Veda падає під час `flutter build ios`, `flutter run`, `pod install`, Xcode archive, native linking, code signing або deployment на фізичний iPhone.

Більшість iOS build failures спричинені невідповідністю між Flutter, Xcode, CocoaPods, iOS deployment target або native binary, який підтягує CocoaPods.

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
## Відкривайте правильний Xcode file

Завжди відкривайте:

```text
ios/Runner.xcworkspace
```

Не збирайте з:

```text
ios/Runner.xcodeproj
```

`Runner.xcworkspace` містить CocoaPods workspace і потрібен для підключення `EdgeVedaCore`.

## Помилки deployment target

Якщо Xcode або CocoaPods повідомляє, що deployment target занадто низький, відкрийте `ios/Podfile` і задайте:

```ruby
platform :ios, '13.0'
```

Потім перевстановіть pods:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

Також перевірте **Build Settings** → **iOS Deployment Target** для target `Runner` в Xcode.

## `No such module EdgeVedaCore`

| Ймовірна причина | Рішення |
| --- | --- |
| Відкрито `Runner.xcodeproj` замість `Runner.xcworkspace`. | Відкрийте workspace file. |
| Pods не встановлено. | Запустіть `cd ios && pod install && cd ..`. |
| Native binary не завантажився. | Запустіть `pod install --verbose` і перевірте download step. |
| CocoaPods cache застарів. | Видаліть `Pods`, `Podfile.lock` і очистіть `EdgeVedaCore` cache. |

Команда reset:

```bash
flutter clean
cd ios
rm -rf Pods Podfile.lock
pod cache clean EdgeVedaCore --all
pod install
cd ..
```

## `Framework not found EdgeVedaCore`

Це означає, що pod міг бути знайдений, але linker не бачить потрібний framework для поточної target.

Перевірте:

- `EdgeVedaCore.xcframework` існує.
- Поточна scheme спрямована на правильний застосунок.
- Debug і Release settings не розходяться неочікувано.
- Старий вручну скопійований framework не перекриває pod-managed artifact.

Потім зберіть знову:

```bash
flutter build ios --debug -v
```

## Помилки architecture або simulator linking

Типове повідомлення:

```text
building for iOS Simulator, but linking in object file built for iOS
```

Чекліст рішення:

- Очистіть `Pods` і `Podfile.lock`.
- Очистіть `EdgeVedaCore` pod cache.
- Перевстановіть pods.
- Якщо simulator support не потрібен для поточного завдання, тестуйте на фізичному iPhone.
- Не копіюйте старі `XCFramework` builds вручну в `ios/Frameworks`.

## Помилки code signing

Типові повідомлення:

- `Signing for "Runner" requires a development team`
- `No profiles for 'com.example.app' were found`
- `A valid provisioning profile for this executable was not found`

Рішення:

1. Відкрийте `ios/Runner.xcworkspace`.
2. Виберіть target `Runner`.
3. Відкрийте **Signing & Capabilities**.
4. Виберіть team.
5. Увімкніть **Automatically manage signing** для development.
6. Задайте унікальний bundle identifier.
7. Один раз зберіть з Xcode, потім поверніться до `flutter run`.

Безкоштовного Apple ID зазвичай достатньо для local development. Для App Store distribution потрібна Apple Developer Program membership.

## Пристрій не зʼявляється

Якщо `flutter devices` не показує iPhone:

- Розблокуйте iPhone.
- Підключіть через USB або trusted wireless development.
- Натисніть **Trust This Computer**.
- Увімкніть Developer Mode: **Settings** → **Privacy & Security** → **Developer Mode**.
- Перезапустіть пристрій, якщо iOS цього вимагає.
- Запустіть `flutter doctor -v` і виправте iOS toolchain issues.

## Build проходить, але launch падає

| Ознака | Ймовірна причина | Рішення |
| --- | --- | --- |
| Crash до Dart logs | Native binary не завантажився. | Перевстановіть pods і перевірте `EdgeVedaCore.xcframework`. |
| Error згадує `modelPath` | Файл моделі відсутній. | Перевірте path і file permissions. |
| Crash після `EdgeVeda.init()` | Модель занадто велика або memory pressure. | Використайте меншу модель і зменште `contextLength`. |
| Feature падає при microphone/camera | Відсутній iOS permission. | Додайте потрібні usage descriptions в `Info.plist`. |
| Працює в simulator, але не на device | Signing, Developer Mode або device-specific memory issue. | Тестуйте з підключеним Xcode. |

## Permissions

Якщо застосунок використовує ці можливості, додайте відповідний user-facing permission text в `ios/Runner/Info.plist`.

| Можливість | Зона permission |
| --- | --- |
| Speech-to-text | Microphone. |
| Vision inference | Camera або photo library, залежно від поведінки застосунку. |
| Document Q&A | File picker або local file access, залежно від інтеграції. |

## Проблеми Release або archive

Release builds можуть падати навіть тоді, коли Debug працює, бо Release використовує інші optimization, signing і stripping settings.

Перевірте:

- `flutter build ios --release -v`
- Xcode archive logs
- Release signing team і provisioning profile
- Чи native framework linked відповідно до pod configuration
- Чи custom build scripts не видаляють потрібні slices або symbols

## Діагностика

Додайте:

- `flutter doctor -v`
- `flutter --version`
- `pod --version`
- `xcodebuild -version`
- `ios/Podfile`
- `ios/Podfile.lock`
- Повний вивід `pod install --verbose`
- Повний вивід `flutter run -v` або `flutter build ios -v`
- Модель пристрою, версію iOS і де виникає проблема: simulator чи фізичний iPhone

## Повʼязані документи

- [Проблеми встановлення](./installation-issues.md)
- [Проблеми завантаження моделей](./model-loading-issues.md)
- [Проблеми памʼяті](./memory-issues.md)
- [Налаштування iOS-пристрою](../getting-started/ios-device-setup.md)
- [Permissions](../reference/permissions.md)
