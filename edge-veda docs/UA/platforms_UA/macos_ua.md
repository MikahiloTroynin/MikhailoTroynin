---
title: "macOS"
description: "Платформні нотатки для запуску Edge Veda на macOS під час development, benchmarking і desktop Flutter experiments."
status: "draft"
section: "platforms"
platform: "macOS"
last_reviewed: "2026-04-30"
---

# macOS

Використовуйте macOS, коли потрібні development workstation, desktop prototype, benchmark runner або internal tool для Edge Veda. macOS також корисний для model preparation, prompt testing, RAG pipeline experiments і profiling перед deployment на iPhone.

Цей документ описує цільовий macOS workflow і обмеження, що відрізняються від iOS.

## Статус підтримки

| Напрям | Статус | Нотатки |
| --- | --- | --- |
| Flutter macOS | Platform path available / перевірити package release перед production | Multi-platform roadmap відстежує macOS окремо від iOS path. |
| Apple Silicon Mac | Рекомендовано | Найкращий варіант для Metal GPU acceleration і local development. |
| Intel Mac | Limited / CPU-oriented | Потрібна окрема валідація; performance і native binary compatibility можуть відрізнятись. |
| Metal GPU | Рекомендовано | Використовуйте для реалістичного Apple-platform performance testing. |
| Desktop distribution | Roadmap / project-specific | Package signing, notarization і model distribution потребують окремого release plan. |
| Production parity з iOS | Не автоматична | Memory, file paths, permissions і packaging треба тестувати окремо. |

## Коли використовувати macOS

macOS підходить для:

- build і debug Flutter app перед deployment на iPhone;
- тестування prompts і chat templates з local models;
- запуску long benchmark sessions із кращою observability;
- підготовки model catalogs і RAG indexes;
- валідації file-based workflows із більшими documents;
- створення internal desktop tools для AI-assisted documentation, QA або support.

Не використовуйте macOS results як пряму заміну iPhone validation. iPhone має жорсткіші thermal, memory, lifecycle і storage constraints.

## Development environment

Встановіть і перевірте:

| Вимога | Рекомендоване значення | Перевірка |
| --- | --- | --- |
| macOS | Recent stable release | Apple menu → About This Mac |
| Flutter SDK | `>= 3.16.0` | `flutter --version` |
| Xcode | Latest stable | `xcode-select -p` |
| CocoaPods | Встановлено, якщо потрібні native pods | `pod --version` |
| Flutter desktop support | Увімкнено | `flutter config --enable-macos-desktop` |
| Test hardware | Apple Silicon recommended | `system_profiler SPHardwareDataType` |

Якщо потрібно, увімкніть macOS desktop support:

```bash
flutter config --enable-macos-desktop
flutter doctor
```

Створіть або оновіть project із підтримкою macOS:

```bash
flutter create --platforms=macos .
flutter pub add edge_veda
```

## Project structure

Flutter app з macOS support зазвичай має:

```text
my_ai_app/
├── lib/
│   ├── main.dart
│   └── ai/
│       ├── edge_veda_runtime.dart
│       ├── model_locator.dart
│       └── benchmark_runner.dart
├── macos/
│   ├── Runner/
│   ├── Runner.xcworkspace
│   └── Podfile
└── models/
```

Зробіть `model_locator.dart` platform-aware. Model path, що працює на macOS, може не працювати на iOS через app sandboxing і bundle paths.

## Model storage на macOS

macOS дає більше гнучкості, ніж iOS, але production desktop apps все одно потребують чіткої model storage strategy.

| Storage location | Для чого підходить | Нотатки |
| --- | --- | --- |
| Project-local `models/` directory | Development і demos | Не покладатися на цей path у packaged apps. |
| Application Support | Production desktop apps | Використовуйте per-app directory і документуйте storage size. |
| User-selected folder | Power users і internal tools | Потрібні file picker UX і permission handling. |
| Bundled model | Малі demos | Large models можуть зробити app distribution непрактичним. |

Рекомендований production pattern:

```text
~/Library/Application Support/<app-name>/models/
```

Якщо app sandboxed, використовуйте відповідні macOS APIs для доступу до user-selected files і зберігайте security-scoped bookmarks, де це потрібно.

## Basic initialization

```dart
final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Summarize the local document in three bullets.',
);

print(response);
```

## macOS permissions і entitlements

Потрібні permissions залежать від feature set.

| Capability | macOS setting | Нотатки |
| --- | --- | --- |
| Text generation | No special permission | Потрібен доступ до local model file. |
| RAG over local files | File access / sandbox rules | Використовуйте user-selected files або app-owned storage. |
| Speech-to-text | Microphone permission | Додати `NSMicrophoneUsageDescription`. |
| Vision from camera | Camera permission | Додати `NSCameraUsageDescription`. |
| Vision from files | File picker або sandbox entitlement | Уникайте broad file access, якщо можливо. |
| Text-to-speech | Зазвичай no extra permission | Використовує platform speech APIs. |

Приклад `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for on-device speech transcription.</string>
<key>NSCameraUsageDescription</key>
<string>This app uses the camera for on-device vision inference.</string>
```

## Benchmarking на macOS

macOS зручний для repeatable benchmark runs, але benchmark results треба чітко маркувати.

Відстежуйте мінімум:

| Metric | Чому важливо |
| --- | --- |
| Time to first token | Вимірює initial prompt evaluation і model readiness. |
| Tokens per second | Вимірює sustained generation throughput. |
| Peak memory | Показує fit для model і context size. |
| Steady-state memory | Показує long-session cost після first prompt. |
| Thermal state | Виявляє performance collapse під час long sessions. |
| Worker reload count | Має бути низьким для stable sessions. |
| Error rate | Фіксує model load, generation і cancellation failures. |

Приклад benchmark label:

```text
Platform: macOS
Device: MacBook Pro, Apple Silicon
Model: Llama 3.2 1B Instruct, quantized
GPU: Metal enabled
Context: 2048
Session length: 30 min
```

## Відмінності від iOS

| Area | macOS behavior | iOS behavior |
| --- | --- | --- |
| File access | Гнучкіший під час development | Більш обмежений через app sandbox і bundle paths. |
| Thermal envelope | Більший, особливо на desktops | Менший; throttling починається раніше. |
| Memory | Зазвичай доступно більше | Mobile RAM суттєво обмеженіша. |
| Lifecycle | Desktop app може довше залишатися active | App suspension/background limits застосовуються. |
| Distribution | Signing і notarization | App Store / TestFlight / provisioning profile. |
| User expectations | Desktop storage і setup можуть бути прийнятними | Mobile apps потребують простішого onboarding і storage UX. |

## Production checklist

Перед shipping macOS app з Edge Veda:

- [ ] Перевірено, що current package release має потрібний macOS native binary path.
- [ ] App протестовано на clean machine, а не лише на development Mac.
- [ ] Визначено, де зберігаються model files.
- [ ] Перевірено sandboxed file access.
- [ ] Додано microphone і camera usage strings, якщо потрібно.
- [ ] Протестовано app signing і notarization.
- [ ] Виміряно memory і thermal behavior під час long sessions.
- [ ] Offline behavior перевірено з вимкненою мережею.
- [ ] Sensitive prompts, documents, transcripts або generated outputs не логуються.
- [ ] Задокументовано model size, download time і storage usage для users.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| macOS target відсутній | Desktop support не увімкнено | Виконайте `flutter config --enable-macos-desktop`, потім recreated platform files. |
| Native library не знайдено | Package release або local binary path mismatch | Перевірте current Edge Veda release і native artifact location. |
| Model loads на dev machine, але не в packaged app | Hardcoded local path | Перенесіть models в app-owned storage або user-selected folder. |
| File import падає в sandboxed app | Немає sandbox handling | Використайте file picker і security-scoped access. |
| Microphone заблоковано | Missing usage description | Додайте `NSMicrophoneUsageDescription`. |
| Performance відрізняється від iPhone | Інший thermal і memory profile | Завжди валідовуйте final behavior на physical iPhone. |
| App не проходить notarization | Native binary або entitlements issue | Перевірте signing, hardened runtime і notarization logs. |

## Related docs

- `./ios.md`
- `./device-requirements.md`
- `./android-roadmap.md`
- `../guides/performance-tuning.md`
- `../guides/model-manager.md`
- `../guides/telemetry-and-tracing.md`
- `../guides/production-readiness.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
- Releases: `https://github.com/ramanujammv1988/edge-veda/releases`
