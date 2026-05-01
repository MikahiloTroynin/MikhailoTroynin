---
title: "Observability"
description: "How Edge Veda exposes runtime, validation, worker, and performance signals for debugging local AI workloads."
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
  - "runtime-supervision.md"
  - "workers-and-isolates.md"
  - "structured-output.md"
---

# Observability

Observability is the ability to understand what the Edge Veda runtime is doing while local AI workloads run. It helps developers debug latency, memory pressure, worker lifecycle, validation failures, retrieval quality, and long-session behavior.

On-device AI needs observability because many failures happen locally and cannot be explained by server logs.

## Why observability matters

A cloud AI app can often inspect server metrics. An on-device AI app runs inside the user’s device, where conditions change continuously.

Without observability, developers may not know:

- why generation slowed down;
- whether the model reloaded;
- why a worker was evicted;
- why structured output failed validation;
- whether RAG retrieval returned weak chunks;
- whether thermal pressure caused degradation;
- whether a request was cancelled or rejected.

Observability turns hidden runtime behavior into inspectable events.

## What to observe

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

A good event should answer: what happened, when, why, and what request it belongs to.

## Trace identity

Every request should have an ID. Long workflows should also have a session ID.

Useful identifiers:

- `session_id`;
- `request_id`;
- `worker_id`;
- `model_id`;
- `pipeline_id`;
- `tool_call_id`;
- `trace_id`.

IDs let developers connect events across workers, schedulers, validation callbacks, and UI logs.

## Performance metrics

Performance metrics should focus on user experience and runtime stability.

Important metrics:

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

The most important metric is not peak speed. It is stable behavior during a long session.

## Structured tracing

Structured tracing means that events are machine-readable, usually JSON or JSONL.

Example event shape:

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

Structured traces are easier to filter, compare, and attach to bug reports.

## Validation telemetry

Structured output and function calling need their own observability.

Useful validation events:

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

Do not only log “failed.” Log why it failed.

## RAG observability

RAG failures often look like generation failures, but the real problem may be retrieval.

RAG telemetry should include:

- embedding model version;
- chunk count;
- query embedding time;
- top-k result IDs;
- similarity scores;
- selected chunks;
- prompt token budget;
- whether context was insufficient;
- answer source IDs.

This helps distinguish “the model hallucinated” from “the right context was never retrieved.”

## Privacy-aware logging

Observability must not become a privacy leak.

Avoid logging:

- full prompts;
- private documents;
- images;
- audio transcripts;
- generated sensitive content;
- raw tool arguments with personal data;
- full vector contents.

Prefer logging metadata and redacted values:

- text length;
- token count;
- source ID;
- model ID;
- error category;
- timing;
- pressure state.

## Debug modes

A production app may need several logging levels.

| Mode | Purpose |
| --- | --- |
| Off | No runtime logs beyond critical errors. |
| Basic | High-level lifecycle and error events. |
| Diagnostic | Performance metrics and policy decisions. |
| Verbose | Detailed traces for local debugging. |
| Redacted export | Shareable bug report without sensitive data. |

Verbose logs should not be enabled by default in production.

## Documentation checklist

When documenting observability, include:

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

## Summary

Observability makes Edge Veda debuggable. It explains what happened across models, workers, scheduler decisions, RAG retrieval, structured output validation, and runtime pressure, while respecting privacy boundaries.
