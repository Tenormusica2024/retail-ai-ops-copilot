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

- measure target/source cards with `getBoundingClientRect()` after the page is
  rendered, then convert the DOM rectangle into the SVG/viewBox coordinate
  system, such as with `getScreenCTM().inverse()`, before comparing it with path
  coordinates
- use `offsetLeft`, `offsetTop`, `offsetWidth`, and `offsetHeight` only as a
  fallback for simple unscaled fixed-layout checks; do not use them as the
  primary proof when the page uses transforms, responsive scale, or SVG
  coordinate conversion
- measure SVG path start/end with `getPointAtLength(0)` and
  `getPointAtLength(getTotalLength())`
- fail if a connector intended to attach to a node edge starts away from the
  measured edge, stops short in whitespace, or enters the node body even by a
  small amount
- treat `H`/`V` shorthand paths as requiring rendered endpoint measurement,
  because numeric token parsing can misread the effective final point
- record endpoint proof with selector/path id, source rectangle, target
  rectangle, path start/end, tolerance, and PASS/FAIL before accepting the fix

### Diagram Source Hierarchy Fidelity Gate

Before implementing or reviewing architecture HTML, inventory parent zones,
child nodes, and any nested mini-frames, subcategory boxes, inner stack frames,
or grouped frames inside a parent category.

If the selected source shows components such as `dbt staging`, `dbt marts`,
`dbt tests`, `STAGE / RAW`, or `Snowpipe取込` inside a smaller category or
inner frame, preserve that nested structure in HTML. Do not flatten those items
into peer service cards unless the difference is explicitly documented.

When arrows appear near nested frames, classify the source relationship before
drawing:

- parent category to parent category
- subcategory frame to subcategory frame
- inner frame to node
- node edge to node edge
- shared lane/bus/label anchor to node

Fail the review if flattening makes readers infer unsupported direct
relationships, such as `CI / CD -> dbt tests` or `dbt marts -> Semantic KPI
Model`, when the source relationship is actually attached to the dbt
transformation frame, semantic layer, data lake frame, or another nested
category.

The reviewer output must include a source hierarchy matrix, not only prose. Use
at least these fields:

- `source_parent_frame`
- `source_nested_frame`
- `source_child_node`
- `source_edge_anchor`
- `html_selector_or_path`
- `evidence` such as source crop, rendered screenshot crop, DOM selector, or
  SVG path id
- `status=<matched/FAIL/intentional-difference/要確認>`

Do not mark the hierarchy gate PASS unless each nested source frame and each
nearby arrow anchor has either rendered evidence or a documented intentional
difference.

### Sub-Agent Firing E2E Gate

Separate feedback reflection completion from real sub-agent firing.

When the task objective is to verify that a sub-agent fires, the E2E cannot pass
only because the main context updated the artifact, ledger, or skills.

Also separate sub-agent mode, firing, verdict, main-agent action, and final
artifact status. `real-subagent` proves that a lane fired; it does not prove
that the reviewer passed the artifact, workflow, or source fidelity. Report the
full tuple when the user asks about firing status or when the task is an E2E of
the feedback workflow:

- `last_subagent_mode=<real-subagent/main-context-substituted/unavailable/not-required/pending>`
- `last_subagent_firing=<PASS/FAIL/PARTIAL/not-applicable>`
- `last_subagent_verdict=<PASS/FAIL/proposed-only/stale/not-returned/要確認>`
- `main_agent_action=<remediated/pending/accepted/escalated/not-applicable>`
- `final_artifact_status=<PASS/FAIL/pending/not-reviewed/not-applicable>`

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

### Feedback Routing Child Pack Gate

The installed diagram feedback skill may use child routing packs to improve
classification accuracy, but the parent skill remains the single trigger owner.

Child routing packs are references, not extra standing reflection lanes. They
must not spawn duplicate feedback sub-agents, claim final reflection status, or
hold separate persistent ledgers for the same trigger batch.

When feedback spans several areas, load only the relevant child packs, such as
process, layout/visual, connector/arrow, assets/text, and ledger hygiene. Final
reporting should name which packs were used whenever child-pack routing affects
the work, not only when the routing decision itself is the user question.

Installed child pack paths:

- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-process/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-layout-visual/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-connector-arrow/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-assets-text/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-ledger-hygiene/SKILL.md`

When a child pack is loaded, record `loaded_child_packs=[...]` in the final
status or in `.agent-feedback/SUBAGENT_INVOCATIONS.md`, together with
`routing_reason=...` and `evidence=...`. If no child pack was loaded for a
trigger that spans process, layout, arrow, asset/text, or ledger hygiene, record
the reason instead of silently relying on memory.

### Diagram Progress Overlay Gate

When implementation progress changes, keep the architecture diagram's node
progress overlay current.

Required behavior:

- every `.diagram > .service` node must have `data-progress`, `data-note`,
  `data-status`, and `tabindex="0"`
- progress information should appear on hover and keyboard focus, not as
  always-visible clutter that changes the source-faithful layout
- do not use a progress bar in the diagram tooltip unless the user explicitly
  asks for one; make the percentage itself bold and color-coded instead
- progress notes must distinguish live-verified implementation from conceptual
  design, local explicit test harnesses, and future/deferred work by splitting
  `実装状況` from `備考`
- node coordinates, card dimensions, connector endpoints, and source-faithful
  layout must not be changed merely to add progress annotations
- after edits, run a DOM count check that service-node count equals
  progress/status/note metadata count, then visually inspect at least one
  hovered node screenshot

### No Silent Runtime Fallback Gate

For Snowflake/Cortex implementation work, do not silently switch from a live
Snowflake path to local test data, cached data, or demo mode.

Allowed modes:

- `snowflake`: live Snowflake/Cortex path. Missing credentials, unavailable
  sample data, permission errors, warehouse errors, and SQL failures must be
  visible failures.
- `local_explicit_test`: intentionally selected local test harness for router,
  trace, eval, UI smoke, and cost-free development.

Local test mode must be named as such in UI, logs, docs, and final answers. Do
not describe it as equivalent validation of Snowflake/Cortex behavior. If a
Snowflake live run fails, report the failure and next action rather than
returning `local_explicit_test` results. Avoid naming local test data as a
runtime fallback or treating it as a transparent substitute.

## Do Not Use This File As A Raw Dump

Raw history belongs in `.agent-feedback/FEEDBACK_LEDGER.md`. This skill should
contain only current rules that future agents should follow.
