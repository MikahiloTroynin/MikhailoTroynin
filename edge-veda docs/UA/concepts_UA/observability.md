---
title: "Observability"
description: "Як Edge Veda відкриває runtime, validation, worker і performance signals для debugging локальних AI workloads."
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
  - "runtime-supervision.md"
  - "workers-and-isolates.md"
  - "structured-output.md"
---

# Observability

`Observability` — це можливість зрозуміти, що робить Edge Veda runtime під час виконання local AI workloads. Вона допомагає debug-ити latency, memory pressure, worker lifecycle, validation failures, retrieval quality і long-session behavior.

On-device AI потребує observability, бо багато failure відбуваються локально і не пояснюються server logs.

## Навіщо потрібна observability

Cloud AI app часто може дивитися server metrics. On-device AI app працює всередині device користувача, де умови постійно змінюються.

Без observability developers можуть не знати:

- чому generation сповільнилася;
- чи model reloaded;
- чому worker evicted;
- чому structured output failed validation;
- чи RAG retrieval повернув weak chunks;
- чи thermal pressure спричинив degradation;
- чи request був cancelled або rejected.

Observability перетворює приховану runtime behavior на inspectable events.

## Що треба спостерігати

| Area | Useful signals |
| --- | --- |
| Model lifecycle | load start, load success, load failure, dispose, reload. |
| Generation | first-token latency, tokens per second, total tokens, stop reason. |
| Workers | spawn, ready, running, idle, cancelled, disposed, evicted. |
| Runtime policy | budget selected, pressure state, degradation decision. |
| Scheduler | queued, started, delayed, rejected, priority, round trip time. |
| RAG | query embedding time, top-k chunks, similarity scores, source IDs. |
| Structured output | validation pass, repair attempt, schema mismatch, rejection. |
| Function calling | tool selected, argument validation, execution time, tool error. |
| Privacy | network handoff request, log redaction, local storage writes. |

Хороша event має відповідати: що сталося, коли, чому і до якого request це належить.

## Trace identity

Кожен request має мати ID. Long workflows також мають мати session ID.

Корисні identifiers:

- `session_id`;
- `request_id`;
- `worker_id`;
- `model_id`;
- `pipeline_id`;
- `tool_call_id`;
- `trace_id`.

IDs дозволяють з’єднати events між workers, schedulers, validation callbacks і UI logs.

## Performance metrics

Performance metrics мають фокусуватися на user experience і runtime stability.

Важливі metrics:

- model load time;
- first-token latency;
- total generation time;
- tokens per second;
- embedding time;
- vector search time;
- speech chunk latency;
- image generation step time;
- memory before and after request;
- thermal state;
- battery state;
- queue length;
- dropped frames.

Найважливіша metric — не peak speed, а stable behavior during long session.

## Structured tracing

`Structured tracing` означає, що events є machine-readable, зазвичай JSON або JSONL.

Приклад event shape:

```json
{
  "timestamp": "2026-04-29T12:40:00Z",
  "session_id": "s_123",
  "request_id": "r_456",
  "event": "generation.first_token",
  "model": "llama-3.2-1b",
  "latency_ms": 420,
  "thermal_state": "nominal"
}
```

Structured traces легше filter-ити, compare-ити і додавати до bug reports.

## Validation telemetry

`Structured output` і `function calling` потребують окремої observability.

Корисні validation events:

- schema selected;
- grammar applied;
- output received;
- JSON recovery attempted;
- recovery succeeded;
- validation failed;
- missing field;
- wrong type;
- enum mismatch;
- tool argument rejected;
- final output accepted.

Не логувати лише “failed”. Треба логувати, чому саме failed.

## RAG observability

RAG failures часто виглядають як generation failures, але справжня проблема може бути в retrieval.

RAG telemetry має включати:

- embedding model version;
- chunk count;
- query embedding time;
- top-k result IDs;
- similarity scores;
- selected chunks;
- prompt token budget;
- whether context was insufficient;
- answer source IDs.

Це допомагає відрізнити “model hallucinated” від “right context was never retrieved”.

## Privacy-aware logging

Observability не має ставати privacy leak.

Не логувати:

- full prompts;
- private documents;
- images;
- audio transcripts;
- generated sensitive content;
- raw tool arguments with personal data;
- full vector contents.

Краще логувати metadata і redacted values:

- text length;
- token count;
- source ID;
- model ID;
- error category;
- timing;
- pressure state.

## Debug modes

Production app може мати кілька logging levels.

| Mode | Purpose |
| --- | --- |
| Off | No runtime logs beyond critical errors. |
| Basic | High-level lifecycle and error events. |
| Diagnostic | Performance metrics and policy decisions. |
| Verbose | Detailed traces for local debugging. |
| Redacted export | Shareable bug report without sensitive data. |

Verbose logs не варто вмикати by default у production.

## Checklist документації

Коли документуєте observability, вкажіть:

- available events;
- event fields;
- how to enable tracing;
- where traces are stored;
- how traces are exported;
- privacy redaction rules;
- performance metrics;
- validation telemetry;
- RAG telemetry;
- troubleshooting workflow.

## Підсумок

`Observability` робить Edge Veda debuggable. Вона пояснює, що сталося з models, workers, scheduler decisions, RAG retrieval, structured output validation і runtime pressure, не порушуючи privacy boundaries.
