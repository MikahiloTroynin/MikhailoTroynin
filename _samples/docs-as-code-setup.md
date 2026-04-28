---
title: "Docs-as-Code Setup"
summary: "Repository structure, branch policy, lint rules, preview builds and PR review process for a new docs repo."
tags: ["Code-to-Docs", "Internal Docs"]
category: "Code-to-Docs"
tools: ["GitHub Actions", "Vale", "Markdownlint", "Jekyll"]
input: ["Existing scattered docs", "Style guide", "CI requirements"]
output: ["Monorepo docs structure", "CI workflow", "PR template", "Style linting"]
featured: false
order: 7
status: "Complete"
---

## Context

A growing startup had documentation in 4 different places: README files, a Confluence space, a Google Drive folder, and inline code comments. No single source of truth existed.

## Problem

Engineers couldn't find docs, didn't know which version was current, and avoided writing docs because there was no clear "where" or "how."

## Documentation process

1. **Inventory** — Catalogued all existing documentation across systems
2. **Architecture** — Designed a monorepo structure with clear ownership
3. **Tooling** — Set up Vale for style linting, Markdownlint for format, Jekyll for preview builds
4. **CI/CD** — GitHub Actions for lint checks, preview deploys on PRs
5. **Process** — PR template, review checklist, branch naming conventions

## Deliverables

- Monorepo docs structure (organized by product area)
- CI workflow (lint → build → preview deploy on every PR)
- PR template (with required checklist)
- Style linting (Vale config matching the company style guide)
- Contribution guide (how to add, update, or review docs)

## Result

Documentation contributions increased 4× in the first quarter. Engineers reported that the clear process removed the "where do I put this?" friction.
