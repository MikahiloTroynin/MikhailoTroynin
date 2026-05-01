---
title: "Runtime supervision"
description: "How Edge Veda supervises on-device AI workloads under memory, thermal, battery, and latency constraints."
status: "draft"
section: "concepts"
locale: "en"
last_reviewed: "2026-04-29"
source_references:
  - "README.md"
  - "flutter/QUICKSTART.md"
  - "flutter/lib/src/"
related:
  - "architecture.md"
  - "workers-and-isolates.md"
  - "model-management.md"
---

# Runtime supervision

Runtime supervision is the part of Edge Veda that keeps local AI workloads predictable over time. It watches device pressure, applies runtime policies, and coordinates how workloads run when memory, thermal state, battery level, or concurrency becomes risky.

Without supervision, on-device AI can work in a short demo and then fail during real usage. A model may load correctly, answer one prompt, and still become unstable after several minutes because the device heats up, memory spikes, or multiple workers compete for the same resources.

## Why supervision matters

On-device AI runs inside a constrained environment. A Flutter app competes for CPU, GPU, RAM, storage, camera, microphone, battery, and UI responsiveness. A cloud service can scale resources. A phone cannot.

Common unmanaged failure patterns:

- thermal throttling collapses throughput;
- memory spikes terminate the app;
- camera frames queue faster than the model can process them;
- image generation consumes memory needed by text or vision workers;
- long sessions become slower after several requests;
- developers cannot explain why latency changed.

Runtime supervision turns these failures into controlled runtime states.

## What the runtime supervises

| Dimension | What it means | Typical runtime response |
| --- | --- | --- |
| Memory | The app is near unsafe memory usage. | Dispose idle workers, reject heavy work, reduce context length. |
| Thermal state | Sustained compute is heating the device. | Lower priority, pause non-critical work, reduce frame rate. |
| Battery | The device should avoid expensive workloads. | Use a lighter QoS profile or defer background work. |
| Latency | Requests no longer fit expected response time. | Adjust queueing, reduce workload, report degradation. |
| Concurrency | Several AI workloads compete at once. | Schedule by priority and budget. |
| Backpressure | Inputs arrive faster than processing finishes. | Drop frames, skip work, avoid unbounded queues. |

The goal is not to make every workload always run. The goal is to keep the app stable and honest about what can run now.

## Compute budgets

A compute budget is a contract between the app and the runtime. It describes the acceptable operating envelope for a workload.

A budget can include:

- target p95 latency;
- maximum battery drain;
- thermal ceiling;
- memory ceiling;
- workload priority;
- whether the workload is interactive or background;
- whether degradation is allowed.

For example, an interactive chat response should have higher priority than background embedding. A camera frame may be dropped if the next frame arrives before analysis completes. Image generation may be paused or evicted if memory pressure rises.

## Scheduler and policy

The Scheduler is the runtime component that arbitrates work. It decides whether to run, delay, reduce, or reject a request based on current device state and workload priority.

Telemetry says what is happening. Policy says what to do about it.

Policy decisions can include:

- dispose idle workers before active workers;
- reduce non-critical work first under thermal pressure;
- drop camera frames instead of queueing forever;
- prefer a smaller model when battery is low;
- keep user-visible requests responsive even if background throughput decreases.

A good policy is predictable. Developers should know what the runtime may do and how the app should communicate it.

## Hysteresis

Hysteresis prevents the runtime from switching states too aggressively. If the device briefly becomes hot, the runtime should not instantly reduce work and then instantly restore it. Otherwise the app oscillates between states and latency becomes unstable.

## Backpressure

Backpressure protects continuous workloads such as camera frames and streaming audio. These inputs can arrive faster than the model can process them.

A supervised design may:

- keep only the latest useful frame;
- drop frames while the model is busy;
- lower camera frame rate;
- reduce input resolution;
- pause processing when the screen is not visible;
- report that the stream is degraded.

Backpressure is better than an infinite queue.

## Worker eviction

Persistent workers improve latency because models stay loaded. They also reserve memory. Runtime supervision decides when an idle worker should be disposed.

A practical eviction order is:

1. dispose idle workers first;
2. keep the worker used by the visible feature;
3. evict large memory-heavy workers before small workers;
4. avoid evicting active interactive work unless necessary;
5. report the eviction so the next request can explain reload delay.

## Observability

Supervision must be observable. Useful signals include:

- model load time;
- first-token latency;
- tokens per second;
- memory pressure events;
- thermal events;
- dropped frame counts;
- worker lifecycle events;
- scheduler decisions;
- eviction events;
- validation events for structured output.

Structured traces should avoid sensitive prompts or user data.

## Summary

Runtime supervision makes Edge Veda a managed runtime rather than a thin inference wrapper. It observes device pressure, schedules work, controls worker lifecycle, applies policies, and exposes telemetry so long-running local AI can remain stable on real devices.
