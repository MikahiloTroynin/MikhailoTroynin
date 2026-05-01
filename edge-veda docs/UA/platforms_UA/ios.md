---
title: "iOS"
description: "Платформні нотатки для запуску Edge Veda у Flutter iOS apps з on-device inference і Metal GPU acceleration."
status: "draft"
section: "platforms"
platform: "iOS"
last_reviewed: "2026-04-30"
---

# iOS

Edge Veda зараз найкраще підходить саме для iOS. Використовуйте цю платформу, коли потрібно створити Flutter app, що запускає text generation, streaming chat, vision, speech-to-text, text-to-speech, embeddings, RAG, function calling та image generation на фізичному iPhone.

Основний шлях розробки:

1. створити Flutter app;
2. додати package `edge_veda`;
3. налаштувати iOS deployment target;
4. встановити CocoaPods dependencies;
5. скопіювати або завантажити model files на пристрій;
6. ініціалізувати `EdgeVeda`;
7. виконати inference на пристрої.

## Статус підтримки

| Напрям | Статус | Нотатки |
| --- | --- | --- |
| Flutter iOS | Підтримується | Основна платформа для поточного використання SDK. |
| Physical iPhone | Рекомендовано | Потрібен для реалістичної Metal GPU performance і thermal behavior. |
| iOS Simulator | Частково | Підходить для UI та integration checks, але повільніший, бо inference йде через CPU. |
| Metal GPU | Підтримується | Рекомендовано для text, vision, speech та image generation workloads. |
| Offline inference | Підтримується | Inference не потребує cloud API key або server call. |
| Android parity | Roadmap | Не припускайте, що поведінка iOS вже доступна на Android. |

## Мінімальне середовище розробки

Перед стартом встановіть і перевірте:

| Вимога | Рекомендоване значення | Перевірка |
| --- | --- | --- |
| Flutter SDK | `>= 3.16.0` | `flutter --version` |
| Xcode | Остання stable version | `xcode-select -p` |
| CocoaPods | Встановлено | `pod --version` |
| iOS deployment target | `13.0` або вище | `ios/Podfile` |
| Apple Developer account | Free для development, paid для distribution | Xcode signing settings |
| Test device | iPhone 12 або новіший, 4 GB+ RAM | Налаштування фізичного пристрою |
| Developer Mode | Увімкнено | iOS Settings → Privacy & Security → Developer Mode |

## Створення iOS project

```bash
flutter create my_ai_app
cd my_ai_app
flutter pub add edge_veda
```

Відкрийте `ios/Podfile` і задайте мінімальну версію платформи:

```ruby
platform :ios, '13.0'
```

Встановіть native dependencies для iOS:

```bash
cd ios
pod install
cd ..
```

## Налаштування code signing

Відкрийте згенерований workspace:

```bash
open ios/Runner.xcworkspace
```

У Xcode:

1. виберіть target `Runner`;
2. відкрийте **Signing & Capabilities**;
3. виберіть development team;
4. залиште automatic signing для локальної розробки;
5. підключіть iPhone кабелем або через wireless debugging;
6. довірте комп'ютеру на пристрої;
7. увімкніть Developer Mode, якщо iOS попросить.

Для App Store distribution використовуйте paid Apple Developer account і перевіряйте фінальний binary з тим самим model packaging strategy, який піде користувачам.

## Додавання model file

Edge Veda потребує локальні model files. App може отримати їх кількома способами:

| Стратегія | Для чого підходить | Нотатки |
| --- | --- | --- |
| Bundled asset | Малі demos і контрольовані internal apps | Збільшує app size. Не пакуйте дуже великі models без перевірки правил distribution. |
| First-run download | Public apps | Завантажується один раз, зберігається локально, далі працює on device. |
| User-selected file | Developer tools або power-user apps | Потрібні file picker і обробка local file access. |
| MDM / enterprise provisioning | Managed devices | Корисно, коли models розповсюджуються всередині компанії. |

Рекомендовані стартові варіанти:

| Use case | Рекомендована model family | Чому |
| --- | --- | --- |
| Chat / basic text generation | Llama 3.2 1B або подібна мала instruct model | Краще підходить для mobile і першого тесту. |
| Tool calling | Qwen3 0.6B або подібна compact model | Нижче memory pressure і швидша ітерація. |
| Vision | SmolVLM2 або мала VLM | Краще підходить для sustained on-device vision tests. |
| Speech-to-text | Whisper tiny / small variants | Баланс між size і latency. |

Тримайте model path явним. Не hardcode-те development-only path у production code.

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in one paragraph.',
);

print(response);
```

## Рекомендована структура project

```text
my_ai_app/
├── lib/
│   ├── main.dart
│   ├── ai/
│   │   ├── edge_veda_runtime.dart
│   │   ├── model_catalog.dart
│   │   └── inference_state.dart
│   └── features/
│       └── chat/
├── ios/
│   ├── Podfile
│   └── Runner.xcworkspace
└── assets/
    └── models/
```

Використовуйте невеликий wrapper навколо `EdgeVeda`, а не викликайте SDK напряму з UI widgets. Так initialization, model loading, memory handling і error recovery залишаються в одному місці.

## Runtime behavior на iOS

Edge Veda створений для довгих on-device AI sessions, а не лише для коротких benchmark calls. На iOS app має враховувати:

- перше model loading повільніше, ніж наступні prompts;
- workers можуть залишатися активними після initialization;
- memory use залишається суттєвим, поки model loaded;
- thermal pressure впливає на throughput;
- scheduler має захищати app від нестабільних workloads;
- background execution обмежується стандартним iOS app lifecycle.

Не припускайте, що model може продовжувати роботу, коли app suspended. Зберігайте user-visible state і відновлюйте session після повернення app у foreground.

## Permissions

Потрібні permissions залежать від capabilities вашої app.

| Capability | Permission / configuration | Нотатки |
| --- | --- | --- |
| Text generation | Не потрібно | Працює з local text input і local model files. |
| Embeddings / RAG | File access, якщо імпортуються documents | Не логувати sensitive document text. |
| Speech-to-text | Microphone permission | Додати `NSMicrophoneUsageDescription`. |
| Text-to-speech | Зазвичай без extra permission | Використовує iOS speech APIs. |
| Vision inference | Camera або photo permissions, якщо є live camera/photos | Додати відповідні `Info.plist` usage strings. |
| Image generation | File/photo permission, якщо збереження в Photos | Запитувати тільки під час save або import images. |

Приклад `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for on-device speech transcription.</string>
<key>NSCameraUsageDescription</key>
<string>This app uses the camera for on-device vision inference.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app saves generated images to your photo library.</string>
```

## Performance guidance

Починайте з малої model і масштабуйте після вимірювань. Mobile performance обмежується RAM, thermal headroom, battery state і model size.

| Factor | Recommendation |
| --- | --- |
| Model size | Починайте з 0.6B–1B text models для перших iPhone tests. |
| Context length | Спочатку тримайте context conservative, потім збільшуйте після вимірювання memory use. |
| Streaming | Для chat UX краще використовувати streaming output. |
| GPU | Використовуйте Metal на physical iPhone для реалістичної performance. |
| Concurrency | Не запускайте text generation, STT, vision та image generation одночасно без scheduler budget. |
| Memory | Звільняйте idle workers при переході між heavy modalities. |
| Thermal state | Тестуйте long sessions, а не тільки first prompt. |

## Production checklist

Перед release iOS app з Edge Veda:

- [ ] App працює на physical iPhone, а не лише у Simulator.
- [ ] `ios/Podfile` має правильний deployment target.
- [ ] Code signing працює для development і distribution.
- [ ] Реалізовано model download, storage та integrity checks.
- [ ] App пояснює користувачу model storage size.
- [ ] App обробляє missing, corrupted або incompatible model files.
- [ ] Long sessions протестовано під thermal pressure.
- [ ] App обробляє low-memory warnings і worker disposal.
- [ ] User data не логуються випадково.
- [ ] Microphone, camera і photo permissions запитуються лише за потреби.
- [ ] Offline behavior протестовано з вимкненою мережею.
- [ ] Errors перетворено на user-readable messages.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `pod install` падає | CocoaPods missing або outdated | Виконайте `sudo gem install cocoapods` або оновіть CocoaPods, потім повторіть. |
| Xcode не deploy-ить на iPhone | Signing не налаштовано | Виберіть development team у Signing & Capabilities. |
| Device просить увімкнути Developer Mode | iOS security requirement | Увімкніть Developer Mode і перезапустіть device. |
| App працює, але inference дуже повільний | Запуск у Simulator або CPU path | Тестуйте на physical iPhone з Metal GPU. |
| Model не завантажується | Wrong path, unsupported file, missing asset | Перевірте, що file існує до виклику `init()`. |
| App завершується під час long inference | Memory або thermal pressure | Використайте меншу model, нижчий context length або налаштуйте runtime policy. |
| Microphone transcription не стартує | Немає permission string або permission denied | Додайте `NSMicrophoneUsageDescription` і обробіть denied permission. |
| Якість generated text погана | Wrong chat template або incompatible model | Узгодьте chat template з model family. |

## Related docs

- `../getting-started/ios-device-setup.md`
- `../getting-started/model-setup.md`
- `../guides/text-generation.md`
- `../guides/streaming-generation.md`
- `../guides/speech-to-text.md`
- `../guides/vision-inference.md`
- `../guides/image-generation.md`
- `./device-requirements.md`
- `./android-roadmap.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- iOS quickstart: `https://github.com/ramanujammv1988/edge-veda/blob/main/flutter/QUICKSTART.md`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
