---
name: ai-architecture-learning-backlog-ticketing
description: >-
  Project-local child skill for Backlog ticket creation and update wording in
  this AI architecture learning repo, including Japanese-first issue titles,
  ticket bodies, evidence links, and learning-oriented acceptance criteria.
---

# Backlog Ticketing

Use this child skill when creating, updating, reviewing, or synchronizing
Backlog tickets for this project.

This skill governs ticket wording and structure. It does not replace the repo
docs as the source of truth.

## Purpose

Backlog tickets are the project-management surface for the learning workflow.
They should be understandable in Japanese while preserving exact technical
identifiers where they are useful for real implementation practice.

## Japanese-First Ticket Rule

Backlog ticket titles, summaries, acceptance criteria, and comments should be
Japanese-first.

Keep English only when it is one of these:

- a product or service name: `Snowflake`, `Cortex`, `dbt`, `Streamlit`,
  `Backlog`, `GitHub Pages`
- a repo path, command, file name, branch name, issue key, or log excerpt
- a stable architecture term that is clearer if left as-is, paired with a
  Japanese explanation when needed: `Golden Eval`, `Trace Store`,
  `Semantic Model`, `readiness`, `safe-stop`
- a Backlog title prefix already used for sorting, such as `[Design/ADR]` or
  `[Eval/Test]`

Do not leave the main meaning of a ticket in English only. If a title prefix is
English, the title body should still explain the work in Japanese.

## Japanese-First Report Rule

Remote task reports, GitHub Issue replies, Backlog comments, and completion
summaries are also project-management artifacts. Write them Japanese-first so
English-heavy report habits do not leak into ticket bodies later.

Prefer Japanese headings such as:

- `作業報告`
- `次タスク`
- `判断`
- `検証`
- `未実施`
- `フィードバック反映`

Avoid routine English-only headings such as `Next steps`, `Artifact/docs
status`, or `Feedback reflection` in user-facing reports. If an exact
machine-readable status or skill contract must be shown, pair it with Japanese:
for example, `フィードバック反映: 完了（Feedback reflection: complete）`.

Keep exact product names, issue ids, repo paths, commands, branch names, and
required status tokens unchanged when changing them would reduce traceability.

## Ticket Body Shape

Prefer this structure for new or materially updated tickets:

```text
目的:

背景:

作業内容:
- ...

受入基準:
- ...

証跡:
- repo path:
- command:
- result:
- screenshot/Pages:

未決事項:
```

When the ticket is a design or learning ticket, include the decision being
learned or validated, not only the task mechanics.

## Learning-Realistic Wording

Ticket text should reflect this repo's purpose: delivery-realistic
AI/LLMOps architecture learning with evidence, not a tiny demo checklist.

- State why the task matters for architecture learning, quality attribution,
  or implementation readiness.
- Do not call the next work `最小実装` merely because it should be reviewable.
  Prefer `拡張可能な検証スライス` or similar wording when the task should leave
  room for dbt, Semantic Model, Golden Eval, Cortex, trace, human review, or
  Snowpark expansion.
- Avoid wording that implies a company-internal mandate, official staffing
  model, or private onboarding purpose in public-facing ticket text.
- If a shortcut is used, name it as current evidence or a reference path, and
  keep the intended architecture boundary visible.
- Do not make progress/readiness claims from planned work. Tie claims to docs,
  commands, screenshots, Pages output, lint results, or live Snowflake/Cortex
  evidence.

## Japanese Review Checklist

Before creating, updating, reviewing, or synchronizing Backlog tickets, check:

- Does the title communicate the main work in Japanese?
- Are acceptance criteria written in Japanese and testable?
- Are English product names or repo paths preserved only where they add
  precision?
- Could a Japanese reader understand the task without already knowing the
  English architecture terms?
- Are evidence links and command results separated from intent and decisions?
- If the ticket mirrors repo docs, does it point to the repo path instead of
  duplicating a stale long explanation?

## Sync Expectations

Repo docs remain the source of truth. When a Backlog ticket changes a design
decision, update the corresponding repo doc first, then mirror the Backlog
summary or link.

If a Backlog wording correction comes from HITL feedback, route it through the
feedback ledger and this child skill before reporting reflection complete.
