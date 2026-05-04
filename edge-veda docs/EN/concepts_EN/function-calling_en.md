---
title: "Function calling"
description: "How Edge Veda lets local models request tools and how apps should validate, execute, and return tool results safely."
status: "draft"
section: "concepts"
locale: "en"
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

Function calling lets a local model request that the app run a specific tool. Instead of only producing text, the model can choose a function, provide arguments, and receive the result back into the conversation.

In Edge Veda, function calling is useful for offline assistants, smart home control, local automation, document workflows, and app actions that need structured intent.

## What function calling solves

A language model can interpret intent, but it should not directly perform side effects. The app should decide which actions are available, validate arguments, run the tool, and return the result.

Function calling separates responsibilities:

| Component | Responsibility |
| --- | --- |
| Model | Interprets the user request and proposes a tool call. |
| Tool definition | Describes the tool name, purpose, and input schema. |
| Tool registry | Lists tools the model is allowed to call. |
| App code | Validates arguments and executes the tool. |
| Runtime | Coordinates multi-round call/result cycles. |

This keeps the model inside a controlled boundary.

## Core concepts

| Concept | Meaning |
| --- | --- |
| `ToolDefinition` | A description of one callable tool. |
| `ToolRegistry` | The set of tools available to the model. |
| `sendWithTools()` | A high-level call that can cycle between model output, tool execution, and model continuation. |
| Schema validation | Verification that tool arguments match the expected shape. |
| Multi-round tool chain | A flow where the model calls more than one tool before answering. |

Names should be verified against the current SDK before publishing code samples.

## Function calling flow

![c-function-calling](mermaid-diagrams/c-function-calling.png)

The model proposes. The app validates and executes.

## Tool definitions

A tool definition should be specific. It should tell the model what the tool does and what arguments are allowed.

A good tool definition includes:

- stable tool name;
- clear description;
- JSON schema or equivalent argument shape;
- required fields;
- allowed enum values;
- constraints;
- whether the tool has side effects;
- examples of valid usage.

Do not expose tools that the user should not be able to trigger.

## Tool registry

`ToolRegistry` acts as an allowlist. Only registered tools should be callable.

A registry should support:

- adding tools;
- removing tools;
- grouping tools by feature;
- disabling tools under policy;
- validating tool names;
- resolving a tool call to executable app code.

For privacy-first apps, tool availability may also depend on permissions, current screen, user role, or offline state.

## Argument validation

Every tool call must be validated before execution.

Validate:

- tool name exists;
- required arguments are present;
- argument types are correct;
- enum values are allowed;
- string lengths are safe;
- file paths are inside allowed directories;
- IDs belong to the current user or workspace;
- the action is allowed in the current app state.

Never treat model-generated arguments as trusted input.

## Side effects

Some tools only read data. Others change state.

| Tool type | Example | Risk |
| --- | --- | --- |
| Read-only | Search notes, get device status. | Privacy leakage if data is exposed incorrectly. |
| Local write | Create note, update setting. | Unwanted changes. |
| External action | Send message, call API, unlock device. | High risk and should require explicit confirmation. |

For destructive or external actions, the app should ask the user for confirmation before execution.

## Offline function calling

Function calling works especially well with offline apps. The model can choose local tools such as:

- search local documents;
- control smart home devices on a local network;
- update an offline checklist;
- query a local database;
- start a local workflow;
- summarize a file already on the device.

If a tool requires the network, document it clearly. Do not label a workflow fully offline if one of its tools depends on a remote service.

## Multi-round tool chains

A multi-round chain allows the model to call a tool, inspect the result, and call another tool.

Example:

1. user asks: “Find the latest report and summarize overdue items”;
2. model calls `searchDocuments`;
3. app returns matching files;
4. model calls `readDocument`;
5. app returns document text;
6. model generates summary.

Multi-round flows need limits:

- maximum number of tool rounds;
- maximum tool result size;
- timeout per tool;
- cancellation behavior;
- logging and observability;
- user confirmation for sensitive actions.

## Error handling

Tools fail. The model should not hide failures.

Common errors:

| Error | Handling |
| --- | --- |
| Unknown tool | Return a structured error to the model and stop or retry. |
| Invalid arguments | Ask the model to repair the call if safe. |
| Permission denied | Show user-facing permission guidance. |
| Tool timeout | Return a timeout result and avoid infinite retry. |
| Unsafe action | Require confirmation or reject. |

## Observability

Function calling should emit structured events:

- selected tool name;
- validation success or failure;
- argument repair attempts;
- execution time;
- tool error;
- final result state;
- round count;
- whether user confirmation was required.

Do not log sensitive argument values unless the app has a safe redaction policy.

## Documentation checklist

When documenting a function calling feature, include:

- available tools;
- tool schemas;
- validation rules;
- side-effect policy;
- confirmation rules;
- max rounds;
- timeout behavior;
- offline or network behavior;
- errors and recovery;
- observability events.

## Summary

Function calling turns local model output into controlled app actions. The model may propose a tool call, but the app owns validation, permissions, execution, side effects, and user confirmation.
