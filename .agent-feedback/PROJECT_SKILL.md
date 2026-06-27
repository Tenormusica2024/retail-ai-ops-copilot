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

## Do Not Use This File As A Raw Dump

Raw history belongs in `.agent-feedback/FEEDBACK_LEDGER.md`. This skill should
contain only current rules that future agents should follow.
