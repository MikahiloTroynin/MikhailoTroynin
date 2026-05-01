---
title: "Android Roadmap"
description: "Планована підтримка Android для Edge Veda, очікувана architecture, validation gates і migration notes з iOS."
status: "draft"
section: "platforms"
platform: "Android"
last_reviewed: "2026-04-30"
---

# Android Roadmap

Android support є частиною multi-platform напряму Edge Veda, але Android треба вважати roadmap platform, доки project не опублікує і не провалідовує Android release path.

Використовуйте цей документ, щоб зрозуміти, що заплановано, що developers можуть підготувати вже зараз і що треба перевірити перед production use.

## Current status

| Напрям | Статус | Нотатки |
| --- | --- | --- |
| Flutter Android package path | Roadmap / awaiting validation | Відстежуйте GitHub roadmap і Android issue перед production reliance. |
| Android native SDK | Planned | Kotlin Android distribution відстежується окремо від Flutter package. |
| Android Web / browser | Planned separately | WebAssembly support — це не те саме, що native Android support. |
| API parity з iOS | Goal, not guarantee | Method names можуть залишитись схожими, але performance і runtime behavior треба валідовувати. |
| Production use | Не рекомендовано до release validation | Для production examples використовуйте iOS, доки Android support явно не released і tested. |

## Roadmap goals

Android roadmap має принести Edge Veda capabilities у Flutter Android apps із збереженням основних принципів project:

- on-device inference;
- no required cloud dependency during inference;
- long-lived workers;
- runtime supervision;
- scheduler-aware workloads;
- text generation і streaming;
- embeddings і RAG;
- speech-to-text;
- vision inference;
- image generation там, де device capability дозволяє;
- telemetry для debugging і performance analysis.

## Planned architecture

Очікувана Android implementation, ймовірно, потребуватиме такі layers:

```text
Flutter app
  ↓
Dart SDK API
  ↓
Platform channel / FFI boundary
  ↓
Android native binding
  ↓
C/C++ inference core
  ↓
CPU / GPU / device acceleration path
```

Фінальна implementation може відрізнятись. Задокументуйте реальну architecture після merge і validation Android branch.

## Expected development requirements

Коли Android support стане доступним, developers мають очікувати приблизно такі requirements:

| Requirement | Expected value | Нотатки |
| --- | --- | --- |
| Flutter SDK | Current stable version | Узгодити з package release notes. |
| Android Studio | Current stable version | Потрібен для SDK, emulator і Gradle tooling. |
| Android Gradle Plugin | Release-dependent | Орієнтуватися на package example app. |
| Android NDK | Потрібен, якщо використовуються native C/C++ binaries | Version має відповідати native build requirements. |
| Device architecture | `arm64-v8a` recommended | 64-bit devices — target для реалістичного inference. |
| Physical device | Потрібен для meaningful testing | Emulator performance не є репрезентативною. |
| RAM | 6 GB+ recommended для корисних tests | Larger models можуть потребувати більше. |
| Storage | Кілька GB free | Model files можуть бути великими. |

## Expected permissions

Android permissions залежать від enabled capability.

| Capability | Likely permission | Нотатки |
| --- | --- | --- |
| Text generation | None | Потрібен local model file access. |
| RAG over user files | Storage / document picker | Краще Android system picker, а не broad storage permissions. |
| Speech-to-text | `RECORD_AUDIO` | Потрібно для microphone capture. |
| Vision from camera | `CAMERA` | Потрібно для live camera input. |
| Save generated images | Media permissions, залежно від Android version | Дотримуватись scoped storage rules. |

Приклад Android manifest entries:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
```

Не додавайте permissions, доки feature їх не потребує.

## API parity targets

Android має прагнути parity з documented Dart API там, де це можливо.

| Capability | Target parity | Validation needed |
| --- | --- | --- |
| `EdgeVeda.init()` | High | Model path, native library load, memory behavior. |
| `generate()` | High | Token throughput, prompt formatting, cancellation. |
| `generateStream()` | High | Backpressure, UI thread safety, stream cancellation. |
| Chat sessions | Medium / high | Context management і summarization behavior. |
| Function calling | High | JSON validation і tool execution loop. |
| Structured output | High | Grammar support і validation mode behavior. |
| Embeddings | High | Vector shape, normalization, latency. |
| RAG | Medium / high | File access, index persistence, memory use. |
| Speech-to-text | Medium | Audio capture, chunking, model compatibility. |
| Vision inference | Medium | Camera integration і frame backpressure. |
| Image generation | Device-dependent | Memory, thermal і acceleration path. |

## Key Android risks

Android більш фрагментований, ніж iOS. Documentation має явно покривати:

- різні GPU vendors;
- різні Android versions;
- OEM-specific memory management;
- aggressive background process killing;
- storage access changes між Android versions;
- emulator vs physical device differences;
- 32-bit vs 64-bit device support;
- ABI packaging size;
- thermal throttling variance;
- permissions і privacy UX.

## Suggested validation gates

Android support не варто документувати як production-ready, доки не пройдено ці gates:

| Gate | Required evidence |
| --- | --- |
| Build validation | Example Flutter Android app builds from clean checkout. |
| Device validation | Протестовано мінімум три physical Android devices. |
| ABI validation | `arm64-v8a` package працює; unsupported ABIs fail clearly. |
| Model load validation | Missing, corrupted і incompatible model files дають documented errors. |
| Streaming validation | `generateStream()` не блокує UI thread. |
| Memory validation | Long session не crash-иться за очікуваного model/context size. |
| Thermal validation | Sustained workload degrades gracefully. |
| Permission validation | Microphone/camera flows обробляють denied permissions. |
| Offline validation | Inference працює з disabled network. |
| Telemetry validation | Runtime traces доступні для debugging. |

## Підготовка app до майбутнього Android support

Навіть до повної валідації Android support структуруйте app так, щоб migration був простішим.

### Тримайте AI layer за interface

```dart
abstract class LocalAiRuntime {
  Future<void> initialize(String modelPath);
  Future<String> generate(String prompt);
  Stream<String> generateStream(String prompt);
  Future<void> dispose();
}
```

### Не використовуйте platform-specific paths в UI code

Тримайте model lookup в окремому class:

```dart
class ModelLocator {
  Future<String> resolveModelPath(String modelId) async {
    // Implement per platform.
    throw UnimplementedError();
  }
}
```

### Тримайте permissions feature-scoped

Запитуйте microphone permission тільки тоді, коли user запускає speech input. Запитуйте camera permission тільки тоді, коли user відкриває camera-based feature.

### Чітко маркуйте unsupported platforms

```dart
if (!Platform.isIOS && !Platform.isMacOS) {
  throw UnsupportedError(
    'This Edge Veda build currently supports Apple platforms only.',
  );
}
```

Оновіть цей guard після release і validation Android support.

## Documentation updates required when Android ships

Коли Android support буде доступний, оновіть:

- `README.md`;
- `docs/en/platforms/android-roadmap.md`;
- `docs/uk/platforms/android-roadmap.md`;
- `docs/en/platforms/device-requirements.md`;
- `docs/uk/platforms/device-requirements.md`;
- getting-started installation docs;
- model setup docs;
- troubleshooting docs;
- examples з Android file paths і permissions;
- CI/CD setup docs;
- release notes.

Після цього або перейменуйте цю сторінку на `android.md`, або залиште її як historical roadmap і створіть новий `android.md` platform guide.

## Roadmap checklist

- [ ] Підтвердити, що package release містить Android support.
- [ ] Підтвердити supported ABIs.
- [ ] Задокументувати Android SDK, NDK, Gradle і Kotlin requirements.
- [ ] Додати minimal Android example.
- [ ] Додати streaming generation Android example.
- [ ] Додати microphone permission flow для STT.
- [ ] Додати camera permission flow для vision.
- [ ] Додати model storage guidance для scoped storage.
- [ ] Додати Android-specific troubleshooting.
- [ ] Додати benchmark labels для Android devices.
- [ ] Додати known limitations.
- [ ] Оновити production-readiness checklist.

## Related docs

- `./ios.md`
- `./macos.md`
- `./device-requirements.md`
- `../guides/runtime-policy.md`
- `../guides/scheduler-and-budgets.md`
- `../guides/memory-management.md`
- `../guides/production-readiness.md`

## Source references

- Edge Veda README: `https://github.com/ramanujammv1988/edge-veda`
- Multi-platform roadmap: `https://github.com/ramanujammv1988/edge-veda/issues/23`
