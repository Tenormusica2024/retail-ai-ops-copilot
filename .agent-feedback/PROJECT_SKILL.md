---
name: project-feedback-rules
description: >-
  Project-local rules created by agent-feedback-ledger. Use when user/HITL
  feedback, reviewer findings, or validated improvement methods appear during
  project work; classify durability after this workflow is invoked.
---

# Project Feedback Rules

This project uses trigger-first feedback reflection.

When user/HITL feedback, reviewer findings, or validated improvement methods
appear during project work:

1. Run the feedback ledger flow before final delivery.
2. Classify signals into `要望`, `指摘`, and `改善`.
3. Capture every trigger in the project ledger, then update the relevant
   rule/skill section or mark it `non-reusable` when edits are authorized.
4. In read-only or artifact-only mode, produce proposed updates only.
5. Report reflection status in the final answer.

## Project-Specific Durable Rules

### Feedback Reflection Migration

The global `agent-feedback-ledger` owns trigger capture and final reflection
status for this project.

If an existing diagram-specific feedback skill also applies, use it as context
or as the update target for the single reflection lane. Do not spawn a generic
ledger sub-agent and a diagram-specific ledger sub-agent for the same
user/reviewer/improvement signal.

Before removing or deprecating the project/domain-specific feedback skill,
complete an E2E pass in this project proving that:

- global trigger capture works from the root `AGENTS.md` pointer
- `.agent-feedback/FEEDBACK_LEDGER.md` receives 要望/指摘/改善 rows
- domain-specific lessons can still route to the diagram skill or a replacement
  project-local rule
- final answers include exactly one reflection status
- real-subagent E2E evidence is recorded in
  `.agent-feedback/SUBAGENT_INVOCATIONS.md` when sub-agent firing is the thing
  being tested

### Diagram Connector Endpoint Gate

For architecture diagram edits, verify node-anchored connectors against rendered
node rectangles before accepting HITL or final review.

Use rendered geometry for SVG endpoints:

- measure target/source cards with `offsetLeft`, `offsetTop`, `offsetWidth`,
  and `offsetHeight`
- measure SVG path start/end with `getPointAtLength(0)` and
  `getPointAtLength(getTotalLength())`
- fail if a connector intended to attach to a node edge enters the node body,
  even by a small amount
- treat `H`/`V` shorthand paths as requiring rendered endpoint measurement,
  because numeric token parsing can misread the effective final point

### Sub-Agent Firing E2E Gate

Separate feedback reflection completion from real sub-agent firing.

When the task objective is to verify that a sub-agent fires, the E2E cannot pass
only because the main context updated the artifact, ledger, or skills.

For `real sub-agent mode`, record:

- agent id and nickname
- delegated prompt or prompt summary
- blocking vs non-blocking lane classification
- final verdict from the sub-agent
- how the main agent acted on the verdict
- the matching run id from `.agent-feedback/SUBAGENT_INVOCATIONS.md`

`main-context substituted` is acceptable only when sub-agent tooling is
unavailable, explicitly forbidden by the user, or documented as a deliberate
mode for a non-sub-agent E2E. If sub-agent tooling is available and firing is
the thing being tested, missing agent evidence is a FAIL even when the artifact
fix and feedback reflection are otherwise complete.

## Do Not Use This File As A Raw Dump

Raw history belongs in `.agent-feedback/FEEDBACK_LEDGER.md`. This skill should
contain only current rules that future agents should follow.
