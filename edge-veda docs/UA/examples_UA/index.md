---
title: "Приклади"
description: "Практичні приклади використання Edge Veda у Flutter-застосунках."
status: "draft"
section: "examples"
locale: "uk"
last_reviewed: "2026-04-30"
---

# Приклади

Цей розділ містить практичні приклади, які показують, як використовувати Edge Veda у реальних Flutter-застосунках. Починайте звідси після встановлення package, додавання локальної model і перевірки, що runtime ініціалізується на цільовому device.

Приклади навмисно невеликі. Кожен приклад фокусується на одному продуктовому сценарії та одній частині SDK, щоб код можна було скопіювати, запустити й розширити у власному застосунку.

## Доступні приклади

| Приклад | Що створюється | Основні API | Коли починати з нього |
| --- | --- | --- | --- |
| [Basic text generation](basic-text-generation.md) | Flow для одного prompt, який повертає повну відповідь. | `EdgeVeda.init()`, `EdgeVeda.generate()` | Перший застосунок, smoke test, non-streaming UI |
| [Streaming chat](streaming-chat.md) | Chat UI, який отримує tokens під час generation. | `EdgeVeda.generateStream()`, `ChatSession.sendStream()` | Chat assistants, довгі відповіді, responsive UI |
| [Smart home control](smart-home-control.md) | Локальний assistant, який перетворює natural language на контрольовані device actions. | `ChatSession`, `ToolDefinition`, `sendWithTools()` | Function calling, local automation, agent-style apps |

## Що припускають ці приклади

Перед запуском будь-якого прикладу переконайтесь, що:

- у Flutter-застосунок додано package `edge_veda`;
- target platform налаштовано;
- compatible model file доступний на device;
- `modelPath` вказує на реальний локальний model file;
- model підходить для use case;
- UI обробляє повільну generation, cancellation та runtime errors.

Для першої text model варто почати з невеликої instruct model. Для tool calling використовуйте model, яка надійно виконує structured instructions.

## Спільне налаштування

Більшість прикладів використовують однаковий pattern ініціалізації runtime:

```dart
import 'package:edge_veda/edge_veda.dart';

final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));
```

Використовуйте це налаштування для iOS і macOS, коли model і device підтримують GPU acceleration. Для Android перевірте поточні platform notes і model compatibility перед production-використанням.

## Рекомендована структура проєкту

Невеликий застосунок може тримати код прикладу в одному файлі. Production-застосунок краще розділити на runtime setup, UI і feature logic.

```text
lib/
├── main.dart
├── ai/
│   ├── edge_veda_runtime.dart
│   ├── prompts.dart
│   └── model_paths.dart
├── features/
│   ├── text_generation/
│   ├── chat/
│   └── smart_home/
└── widgets/
    ├── generation_error_view.dart
    └── token_stream_view.dart
```

Спільний runtime wrapper допомагає уникнути повторного model loading:

```dart
class EdgeVedaRuntime {
  EdgeVedaRuntime(this.modelPath);

  final String modelPath;
  final EdgeVeda edgeVeda = EdgeVeda();

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    _initialized = true;
  }

  Future<void> dispose() async {
    await edgeVeda.dispose();
    _initialized = false;
  }
}
```

## Як обрати приклад

| Завдання | Приклад | Причина |
| --- | --- | --- |
| Перевірити, що model працює на device | Basic text generation | Найкоротший generation path. |
| Додати кнопку `Generate` | Basic text generation | UI очікує одну повну відповідь. |
| Створити chat assistant | Streaming chat | UI залишається responsive, поки надходять tokens. |
| Зберегти conversation context | Streaming chat | `ChatSession` відстежує turns і context usage. |
| Дати model вибирати actions | Smart home control | `sendWithTools()` перетворює intent на tool calls. |
| Залишити дані локально | Будь-який приклад | Edge Veda призначений для on-device inference. |

## Checklist якості прикладу

Перед копіюванням прикладу в production перевірте, що:

- model path не захардкожено під machine розробника;
- застосунок показує loading state під час model initialization;
- застосунок має cancellation path для довгої generation;
- runtime errors видимі користувачу або в logs;
- generation output не використовується для незворотних actions без validation;
- privacy-sensitive input не записується в logs;
- model і platform limits задокументовані для вашого застосунку.

## Що читати далі

Після прикладів перейдіть до:

- `guides/text-generation.md` для prompt і response patterns;
- `guides/streaming-generation.md` для деталей token streaming;
- `guides/chat-sessions.md` для multi-turn conversations;
- `guides/function-calling.md` для tool calling patterns;
- `guides/runtime-policy.md` для runtime supervision і budgets;
- `platforms/device-requirements.md` для model і device constraints.
