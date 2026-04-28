---
title: "Edge-Veda Code-to-Docs Case"
summary: "Documentation plan and Getting Started draft for an open-source on-device AI runtime for Flutter — repository review, public API inventory and a PR-ready first guide."
tags: ["Code-to-Docs", "AI SDK", "Flutter", "Docs-as-Code", "Open Source"]
category: "Code-to-Docs"
tools: ["GitHub", "Markdown", "Dart", "ChatGPT", "dart doc"]
input: ["GitHub repository", "README and quickstart", "flutter/lib/ source", "flutter/example/ app", "Documentation issue", "AI-assisted analysis prompts"]
output: ["Documentation gap analysis", "Public API inventory", "Getting Started draft", "Usage example plan", "Validation checklist", "PR description"]
featured: true
order: 5
status: "Draft / Open-source contribution in preparation"
---

## Context

An open-source on-device AI runtime for Flutter had minimal documentation — just a basic README and auto-generated API docs. The maintainers opened a documentation issue asking for help.

## Problem

Developers couldn't figure out how to integrate the runtime without reading source code. The lack of a Getting Started guide was the #1 barrier to adoption.

## Documentation process

1. **Repository review** — Analyzed project structure, dependencies, and build system
2. **API inventory** — Catalogued all public classes and methods in flutter/lib/
3. **Example analysis** — Studied the example app to understand intended usage patterns
4. **AI-assisted drafting** — Used prompts to generate initial Getting Started structure
5. **Validation** — Cross-referenced every code example against actual source

## Deliverables

- Documentation gap analysis
- Public API inventory (all exported classes with descriptions)
- Getting Started draft (install → configure → first inference)
- Usage example plan (5 scenarios mapped to existing example code)
- Validation checklist
- PR description ready for submission

## Result

Draft completed and prepared for open-source contribution. The Getting Started guide reduces time-to-first-inference from "read the source" to under 15 minutes.
