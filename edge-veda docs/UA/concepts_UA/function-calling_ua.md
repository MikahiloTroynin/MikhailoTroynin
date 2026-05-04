---
title: "Function calling"
description: "Як Edge Veda дозволяє локальним моделям запитувати tools і як застосунок має безпечно validate, execute та повертати tool results."
status: "draft"
section: "concepts"
locale: "uk"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
  - "examples/"
related:
  - "structured-output.md"
  - "privacy-and-offline-inference.md"
  - "observability.md"
---

# Function calling

`Function calling` дозволяє локальній моделі попросити застосунок виконати конкретний `tool`. Замість того щоб генерувати лише текст, модель може вибрати `function`, передати `arguments` і отримати `result` назад у conversation.

В Edge Veda `function calling` корисний для offline assistants, smart home control, local automation, document workflows і app actions, де потрібен structured intent.

## Яку проблему вирішує function calling

Language model може зрозуміти intent, але не має напряму виконувати `side effects`. Застосунок має визначати, які actions доступні, перевіряти arguments, запускати `tool` і повертати result.

`Function calling` розділяє відповідальність:

| Component | Відповідальність |
| --- | --- |
| Model | Інтерпретує запит користувача і пропонує tool call. |
| Tool definition | Описує tool name, purpose і input schema. |
| Tool registry | Містить список tools, які model може викликати. |
| App code | Перевіряє arguments і виконує tool. |
| Runtime | Координує multi-round call/result cycles. |

Так model залишається всередині контрольованої межі.

## Core concepts

| Concept | Значення |
| --- | --- |
| `ToolDefinition` | Опис одного callable tool. |
| `ToolRegistry` | Набір tools, доступних для model. |
| `sendWithTools()` | High-level call, який може циклічно виконувати model output, tool execution і model continuation. |
| Schema validation | Перевірка, що tool arguments відповідають expected shape. |
| Multi-round tool chain | Flow, де model викликає більше одного tool перед відповіддю. |

Назви потрібно звірити з поточним SDK перед публікацією code samples.

## Function calling flow

![c-function-calling](mermaid-diagrams/c-function-calling.png)

Model пропонує. App перевіряє і виконує.

## Tool definitions

`Tool definition` має бути конкретним. Він має пояснювати model, що робить tool і які arguments дозволені.

Хороший `tool definition` містить:

- stable tool name;
- clear description;
- JSON schema або equivalent argument shape;
- required fields;
- allowed enum values;
- constraints;
- інформацію про side effects;
- examples of valid usage.

Не відкривайте tools, які користувач не повинен мати змоги trigger-ити.

## Tool registry

`ToolRegistry` працює як allowlist. Model має викликати лише registered tools.

Registry має підтримувати:

- додавання tools;
- видалення tools;
- групування tools за feature;
- відключення tools за policy;
- перевірку tool names;
- прив’язку tool call до executable app code.

Для privacy-first apps доступність tool може залежати від permissions, current screen, user role або offline state.

## Argument validation

Кожен tool call треба перевіряти перед execution.

Перевіряйте:

- tool name існує;
- required arguments присутні;
- типи arguments правильні;
- enum values дозволені;
- довжини strings безпечні;
- file paths лежать у дозволених директоріях;
- IDs належать поточному користувачу або workspace;
- action дозволений у поточному стані застосунку.

Model-generated arguments не можна вважати trusted input.

## Side effects

Деякі tools лише читають дані. Інші змінюють state.

| Tool type | Example | Ризик |
| --- | --- | --- |
| Read-only | Search notes, get device status. | Privacy leakage, якщо дані відкрито неправильно. |
| Local write | Create note, update setting. | Небажані зміни. |
| External action | Send message, call API, unlock device. | High risk; потрібне explicit confirmation. |

Для destructive або external actions застосунок має просити user confirmation перед execution.

## Offline function calling

`Function calling` добре працює в offline apps. Model може обирати local tools:

- search local documents;
- control smart home devices on local network;
- update offline checklist;
- query local database;
- start local workflow;
- summarize file already on device.

Якщо tool потребує network, це треба явно документувати. Не називайте workflow fully offline, якщо хоча б один tool залежить від remote service.

## Multi-round tool chains

`Multi-round chain` дозволяє model викликати tool, прочитати result і викликати інший tool.

Приклад:

1. user просить знайти latest report і summarize overdue items;
2. model викликає `searchDocuments`;
3. app повертає matching files;
4. model викликає `readDocument`;
5. app повертає document text;
6. model генерує summary.

Multi-round flows потребують limits:

- maximum tool rounds;
- maximum tool result size;
- timeout per tool;
- cancellation behavior;
- logging і observability;
- user confirmation для sensitive actions.

## Error handling

Tools можуть fail. Model не має приховувати failure.

| Error | Handling |
| --- | --- |
| Unknown tool | Повернути structured error до model і stop або retry. |
| Invalid arguments | Попросити model repair call, якщо це safe. |
| Permission denied | Показати user-facing permission guidance. |
| Tool timeout | Повернути timeout result і уникати infinite retry. |
| Unsafe action | Вимагати confirmation або reject. |

## Observability

`Function calling` має створювати structured events:

- selected tool name;
- validation success або failure;
- argument repair attempts;
- execution time;
- tool error;
- final result state;
- round count;
- whether user confirmation was required.

Не логувати sensitive argument values без safe redaction policy.

## Checklist документації

Коли документуєте function calling feature, вкажіть:

- available tools;
- tool schemas;
- validation rules;
- side-effect policy;
- confirmation rules;
- max rounds;
- timeout behavior;
- offline або network behavior;
- errors and recovery;
- observability events.

## Підсумок

`Function calling` перетворює local model output на контрольовані app actions. Model може запропонувати tool call, але app відповідає за validation, permissions, execution, side effects і user confirmation.
