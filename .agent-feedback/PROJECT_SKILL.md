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

### Feedback Trigger Decision Gate
<!-- feedback-gate:trigger-decision -->

For every project task, make a quick trigger decision before assuming feedback
reflection is irrelevant.

The feedback-ledger flow must fire when the user or a reviewer mentions
feedback, review findings, missed reflection, skill/rule updates, root-cause
analysis, reusable fixes, workflow changes, or Japanese cues such as `指摘`,
`改善`, `反映`, `発火`, `スキル`, `ルール`, `漏れ`, or `なぜ`.

If this decision was not made, treat that as a trigger-condition defect. Do not
only repair the downstream routing or skill text. Record the missed trigger
decision in the ledger and strengthen the relevant trigger rule.

For any task with feedback/reflection cues, report one visible status:

- `trigger_decision=fired`
- `trigger_decision=not-triggered`
- `trigger_decision=missed`

Do not rely on an internal-only trigger check when the user is asking whether
feedback reflection fired, why it did not fire, or whether the workflow is
working.

### Feedback Reflection Migration

The main agent runs the global `agent-feedback-ledger` flow as the single
reflection lane for this project.

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

### Documentation Sync Evidence Gate

When reporting Obsidian synchronization as evidence, distinguish repo-mirror
checks from checks against a real external Obsidian workspace.

The default no-argument command may be used only as repo-mirror evidence:

```bash
python3 tools/sync_obsidian_docs.py --direction check
```

To claim the external Obsidian workspace is synchronized, run the command with
`RETAIL_AI_OPS_OBSIDIAN_DIR` set or pass `--obsidian-dir <local-vault-project>`.
Do not report a repo-mirror-only `obsidian_sync=ok` as proof that the external
vault was updated. If repo docs changed first, run `repo-to-obsidian` with the
same explicit target before final delivery.

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

### Diagram Path Occlusion Gate

For every source-matched SVG connector, check the whole visible path against
foreground node, frame, and label rectangles. Endpoint and marker checks are not
enough.

Required behavior:

- sample each SVG path with `getPointAtLength()` across the full length, not
  only at start and end
- compare sampled points with rendered `getBoundingClientRect()` rectangles
  converted into the SVG/viewBox coordinate system
- fail if any non-anchor portion of the connector enters a foreground service
  card, text block, icon area, or label box
- allow a path to touch a node rectangle only at the documented source or
  destination anchor side, within a small tolerance
- capture a focused crop for each high-risk endpoint; a lower-band crop is not
  enough for an upper or middle endpoint
- after any node move, card resize, frame resize, or route change, re-run this
  intersection check for all edges whose path or nearby node rectangle changed

In this project, `Semantic KPI Model <-> Golden Eval` is a high-risk
relationship because the evaluation/improvement loop approaches the Semantic
card vertically and can look correct by relationship coverage while still
piercing the card body.

### Automated Connector Geometry Lint Gate

Do not rely on AI or human visual review as the first detector for connector
adjacency, endpoint, and body-piercing failures. Add and run an automated
geometry lint whenever the architecture HTML or connector paths change.

Use:

```bash
node tools/check_diagram_connectors.mjs
```

The lint should render the page in Playwright, collect all `.service`,
`.subzone`, `.zone`, `.flow-label`, and connector SVG path rectangles, and
produce machine-readable findings for:

- path endpoints that are not adjacent to the declared source or destination
  anchor
- arrowheads or endpoints that enter a service-card body away from the allowed
  anchor side
- path bodies that cross foreground cards, text, icons, or labels
- paths with missing `data-edge` ids
- source-declared bidirectional edges missing `marker-start` or `marker-end`
- short dangling paths, hidden arrowheads, or path segments clipped by the SVG
  viewport

Treat this lint as a pre-HITL gate. Visual review and sub-agent review should
then focus on semantic source fidelity, label meaning, and intentional
differences that pure geometry cannot decide.

### Automated Text Layout Lint Gate

Do not rely on final screenshot review as the first detector for text clipping
or label-to-label collisions. Run an automated text-layout lint whenever the
architecture HTML changes labels, card text, rail labels, flow labels, boundary
notes, hover-trigger text, node sizes, or nearby connector labels.

Use:

```bash
node tools/check_diagram_text_layout.mjs
```

The lint should render the page in Playwright, collect text-bearing elements
such as `.flow-label`, `.rail-label`, `.boundary-note`, `.zone-label`,
`.subzone-title`, `.service-title`, and `.service-sub`, and produce
machine-readable findings for:

- text elements whose `scrollWidth` or `scrollHeight` exceeds their visible box
- text that escapes its containing service card or subzone frame
- two text-bearing elements whose rendered rectangles overlap enough that one
  label can visually clip or hide the other

Treat `text-overlap`, `text-overflow`, and `text-escapes-parent` as pre-HITL
failures. After moving labels to clear text overlap, rerun the connector
geometry lint too, because a text-safe label can still create a connector-label
crossing or source/destination ambiguity.

For correlation-arrow and arrow-fidelity review, this lint is a required
companion gate rather than a separate optional layout check. A relationship
label hidden by another text label changes the apparent source edge, so
`tools/check_diagram_text_layout.mjs` must pass before an arrow-fidelity
reviewer can mark relationship coverage as PASS.

### Diagram Quality All-Check Gate

For correlation-arrow / arrow-fidelity review, prefer the all-check wrapper
over manually remembering each lint script:

```bash
node tools/check_diagram_quality.mjs
```

The wrapper must call every required diagram lint in this repo, currently:

- `tools/check_diagram_connectors.mjs`
- `tools/check_diagram_text_layout.mjs`

The project CI workflow must run this wrapper after relevant diagram, lint, or
rule changes. Use CI as the post-fix enforcement gate so a local repair cannot
be merged or published without rerunning the same correlation-arrow lint bundle.
Local wrapper evidence remains required before HITL/final review when
screenshots, JSON reports, or quick debugging feedback matter.
Keep the workflow on maintained GitHub Action majors and a current Node runtime
so the CI gate itself does not pass with platform deprecation warnings.

If a new diagram lint becomes part of arrow-fidelity, connector routing, text
layout, or source hierarchy acceptance, add it to `tools/check_diagram_quality.mjs`
before marking the skill update complete. Individual linters may still be run
for debugging, but final arrow-fidelity evidence should include the all-check
wrapper result or explicitly state why a specific check was skipped.

### Diagram Edge Contract Generation Gate

For new 0-to-1 imagegen architecture diagrams, system configuration diagrams,
and workflow diagrams in this visualization repo, and for future
layout-affecting edits to existing diagrams, prefer an edge-contract workflow
before hand-writing SVG path coordinates.

This gate is for diagram reproduction and visualization tooling. It must not be
treated as pipeline implementation work, Snowflake/Cortex runtime work, or proof
that the architecture nodes themselves are implemented.

Required behavior for new diagrams and layout-affecting edits:

- add stable `data-node-id` values to every node or frame that can be an edge
  endpoint
- define each edge with explicit `from.node`, `from.anchor`, `to.node`, and
  `to.anchor` values, such as `from: Semantic KPI Model / anchor: bottom`
- include marker semantics in the contract, including whether the relationship
  is one-way, bidirectional on one path, or two separate opposing paths
- generate SVG `path d` values from rendered node rectangles with
  `getBoundingClientRect()` plus SVG coordinate conversion, not from stale fixed
  coordinates
- keep manual fixed-coordinate routes only for documented exceptions such as
  buses, lanes, label anchors, source-faithful visual quirks, or already-locked
  diagrams
- after node moves, card resizing, frame resizing, or helper/header removal,
  regenerate affected contract-managed paths and then run
  `tools/check_diagram_connectors.mjs`
- do not read "new 0-to-1" as excluding later modification work. When a future
  edit changes node placement, frame geometry, card dimensions, or connector
  routing, either move the affected edge area toward contract generation or
  document why a fixed-coordinate exception is still required.
- keep the current source-faithful architecture HTML on its existing fixed-path
  route unless a separate HITL-approved migration task is opened, because
  automatic migration can change many fine visual positions at once. This
  exception only avoids a mass rewrite of stable current paths; it is not
  permission to keep adding brittle fixed coordinates during future layout
  changes.

Use `tools/generate_diagram_edges_from_contract.mjs` and
`docs/architecture/edge-contract-path-generation.md` as the reference workflow.

### Diagram Bidirectional Marker Gate

For any source relationship that is bidirectional or visually has arrowheads at
both ends, route coverage is not enough. The rendered artifact must prove both
endpoint markers are visible and source-faithful.

Required behavior:

- classify whether the selected-source edge is one-way, two-way on one path, or
  two separate opposing paths before judging the HTML
- when two opposing same-style paths connect the same nearby components and the
  relationship is semantically bidirectional, prefer one path with
  `marker-start` and `marker-end` to reduce route congestion. Keep separate
  paths only when labels, styles, anchors, or timing semantics differ.
- verify `marker-start` and `marker-end`, or equivalent separate paths, against
  the visible screenshot for both endpoint arrowheads
- fail when a selected-source two-way relationship becomes a one-way-looking
  path even if the route geometry and labels are otherwise correct
- compare marker size, fill, stroke, color, dash style, and endpoint alignment
  at both ends, not just the line body
- assign stable `data-edge` ids to every source-matched connector whenever the
  HTML is edited; if a legacy path lacks `data-edge`, the review matrix must
  still include it using a line/path selector and mark id hygiene separately

Common high-risk relationships in this project include:

- `改善適用（バージョン更新）`
- `修正依頼`
- `Semantic KPI Model <-> Golden Eval`
- `Semantic KPI Model <-> Cortex Search Service`
- `Golden Eval <-> Trace Store`
- `CI / CD <-> dbt frame`
- `Trace Store <-> Version Registry`
- `Version Registry <-> Error Taxonomy`
- `RBAC <-> Cost Guardrails`

### Diagram Source Hierarchy Fidelity Gate

Before implementing or reviewing architecture HTML, inventory parent zones,
child nodes, and any nested mini-frames, subcategory boxes, inner stack frames,
or grouped frames inside a parent category.

Project-launch intent is part of the review lens. This repo's architecture
diagram is a delivery-realistic technology-selection learning surface,
not only a current MVP implementation snapshot. When a current shortcut, proxy
dataset, or sample path conflicts with the intended learning architecture,
preserve the intended architecture in the primary node/frame identity and put
the shortcut reality into readiness/status/notes/evidence.

Project-launch intent also includes practicing how AI controls complex
architecture and moves it toward professional delivery quality. When complexity
is added, add or verify the corresponding control surface: feedback ledger
capture, skill/rule updates, source-backed design notes, diagram lint, CI
gates, readiness rubrics, eval evidence, and reviewer loops. Do not treat a
larger architecture as inherently better; the durable learning value is whether
AI-assisted design remains inspectable, testable, and correctable.

Project-launch intent also includes distilling reusable quality-assurance
skills for future professional client-delivery work. When this project creates
or improves a code-review checklist, diagram-review gate, feedback-routing
rule, reviewer-agent contract, lint/CI gate, or evidence standard, separate the
generic pattern from project-specific facts. Keep local artifacts local, but
write durable rules so they can later be promoted into generic skills without
private, employer-specific, or one-off wording.

Layer names must be evidence-honest. Do not call a Snowflake source/source-like
area `data lake`, `STAGE`, `RAW`, `ingestion`, or `lakehouse` merely because
those are common Snowflake architecture concepts. Use those labels only when
the diagram or implementation includes the corresponding object or planned
node, such as external stage, Snowpipe, Iceberg, RAW tables, dynamic tables, or
an explicit ingestion flow. If the current path is
`SNOWFLAKE_SAMPLE_DATA` plus manually inserted KPI rows, label it as a
Snowflake reference / seed layer and put future ingestion/lake intent in
status/notes or a separate planned node.

This repo is a learning-density surface, not a permanently minimal beginner
demo. Do not let beginner-scope diagram polish or reference MVP work consume
the learning window after the core Cortex/dbt/Streamlit/LLMOps relationships
are clear.

Complexity is acceptable when it teaches a realistic architecture decision and
the project can still localize answer-quality degradation to a layer such as
data, dbt/modeling, semantic contract, search, agent routing, prompt/tool
behavior, eval logic, trace, UI, or governance. If the team can no longer tell
where quality breaks, pause expansion and consider simplifying the feature,
splitting the experiment, or moving runtime-heavy work into a separate project.

Minimal scope is useful for stabilizing the baseline, but it is not the default
end state for this learning project. Once a slice is stable enough to localize
failures, proactively propose the next high-learning expansion instead of only
preserving the smallest working path. Good candidates include deeper dbt
staging/marts/tests, semantic coverage, Golden Eval tied to model contracts,
Snowpark execution, Cortex Search citation quality, trace analysis, and human
review loops. Each proposal should name the expected learning value and the
quality-attribution risk.

Actively counter the default assistant/operator tendency to over-prefer minimal
conservative implementations. In this project, minimalism is allowed as a
temporary control mechanism, but it should be questioned once baseline evidence
exists because the user's main objective is high-density architecture learning.

Snowpark and Snowpark Container Services are active intermediate/advanced
options. Do not assume they are used in every workflow, but also do not steer
away from them by default. For the next-stage architecture, intentionally
evaluate Snowpark/SPCS when Snowflake-side Python UDF/SP work, complex
preprocessing, in-Snowflake eval runners, trace enrichment, ML feature/model
workflows, Airflow/Jupyter/MLflow/custom API services, or other containerized
runtime needs appear. Before expanding into that scope, decide whether this
repository should evolve or a separate intermediate-stage project should own
the runtime work.

For dbt design in this project, keep SQL dbt as the primary transformation and
quality-contract layer. Use TPCH_SF1 as the fixed current source unless the user
explicitly reopens data selection. Design `source -> staging -> intermediate ->
mart -> seed/tests` first, then add Snowpark only where Python execution creates
clear learning or quality-control value such as eval/trace enrichment, dbt
Python models, UDF/SP reuse, or Cortex Agents custom tools. Do not use Snowpark
for simple joins, casts, or monthly KPI aggregation merely because Snowpark is a
learning target.

When promoting Snowpark into the current diagram, prefer a small
`Snowpark Python / UDF / SP` node inside the Snowflake Account boundary before
adding SPCS. Connect Snowpark only to responsibilities that are source-backed or
implementation-plausible: dbt Python/UDF/SP execution, Cortex Agents custom
tools, and eval/trace enrichment into Trace Store. Keep SPCS as a visible design
candidate in docs until containerized services or compute-pool concepts are
actually part of the architecture.

When adding a new layer or execution band inside an already crowded parent
zone, rebalance the sibling subcategory frames before accepting the layout. Do
not leave the old upper frame too low or too tall and then squeeze the new frame
against the parent boundary. Align comparable sibling frames to the same top
baseline when that improves readability, reduce unnecessary vertical height in
the older frame, leave visible whitespace between sibling frames, and leave
clear bottom margin between the new frame and the parent zone. After this
rebalancing, reroute all affected connectors and rerun the connector geometry
lint plus screenshot review.

CI/CD edges must distinguish read-only sources from deployable/validatable
seeds. CI/CD should not appear to deploy `SNOWFLAKE_SAMPLE_DATA` or another
read-only external source unless ingestion/provisioning exists. It should
connect to dbt build/test/modeling, semantic validation, evals, and any
version-controlled seed or definition table that the pipeline can apply or
validate.

For UI/facade nodes such as Streamlit, preserve category-level runtime
relationships when individual node-to-node connectors would clutter the diagram
or imply false ownership. A UI node can connect to a runtime frame/boundary to
show that it delegates execution to the runtime category, while tooltips
explain the split between input/display/approval UX and runtime routing,
planning, tools, execution, and trace. If the current MVP bypasses that intended
runtime route, keep the architecture relationship visible and document the
bypass in readiness/status/notes.

When connecting to a category or frame boundary, route the endpoint so the
arrowhead meets the boundary perpendicularly. Avoid endpoints whose final or
initial segment runs parallel along the box edge, especially on category labels
or dashed parent frames, because the reader cannot quickly tell which frame the
relationship targets.

Evaluation connectors must represent operational artifact flow, not only
conceptual affinity. When two nodes are related but operate on different axes,
prefer tooltip notes, documentation, or role-detail wording instead of adding a
connector that overstates coupling.

For the LLMOps lower band in this project:

- `Golden Eval` evaluates answer quality, SQL validity, grounding, and
  regression behavior.
- `Trace Store` stores evaluation results, traces, approvals, and runtime
  evidence for later analysis.
- `Trace Store -> Golden Eval` is valid when failed traces or regression
  candidates are fed back into the eval set.
- `Golden Eval -> Trace Store` is valid when evaluation results are saved as
  trace/evidence records.
- `Error Taxonomy` classifies error causes and improvement routing. Do not draw
  a direct Golden Eval / Error Taxonomy connector unless the workflow explicitly
  transfers classified evaluation failures, uses taxonomy labels as eval
  dimensions, or has another concrete artifact exchange. A thin conceptual
  relationship is a note, not an arrow.

If the selected source shows components such as `dbt staging`, `dbt marts`,
`dbt tests`, `STAGE / RAW`, or `Snowpipe取込` inside a smaller category or
inner frame, preserve that nested structure in HTML. Do not flatten those items
into peer service cards unless the difference is explicitly documented.

Do not replace source/planned component identities with current implementation
shortcuts solely because the reference MVP uses a proxy path. For example,
TPCH/direct SQL readiness can be shown in progress values, status text, notes,
or a small implementation overlay, but it should not by itself rename
`dbt staging` into `SQL結合` or `dbt marts` into `KPI集計ビュー` when the
source/planned architecture is still a dbt transformation flow. If the diagram
is intentionally switched to current-implementation-only mode, document that
mode explicitly in the title/subtitle and ledger.

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

`Feedback reflection: complete` means ledger/rule/skill reflection completed; it
does not by itself prove real sub-agent firing. When no real-subagent E2E is in
scope, state `sub-agent firing: not required/not tested`. When firing is in
scope, include the status tuple and the matching invocation row.

### Reviewer Sub-Agent Launch Gate

Use `.agent-feedback/REVIEWER_SUBAGENT_DESIGN.md` for the reviewer pattern.

The default feedback-reflection owner is the main agent. The reviewer sub-agent
is an independent read-only reviewer unless the user explicitly asks for a
worker. It does not receive reliable full-session context by default, so launch
it with a context pack containing objective, target files, current user signal,
allowed facts, suspected failure modes, output format, and edit permission.

Reviewer sub-agents should not directly own final skill edits. They return
findings and proposed actions; the main agent integrates them into the ledger,
project rules, installed skills, or marks them `non-reusable`.

Reviewer launches are non-blocking unless the user's acceptance criterion
depends on the reviewer verdict, such as sub-agent firing proof, workflow E2E,
or source-fidelity approval. If the reviewer is still running and artifact work
can safely continue, record `pending with handoff` instead of stopping the main
task.

### Feedback Routing Child Pack Gate
<!-- feedback-gate:missing-child-skill-creation -->

The installed diagram feedback skill may use child routing packs to improve
classification accuracy, but the global feedback-ledger lane remains the single
reflection owner when it is active. The diagram parent skill is the routing
parent and update target for diagram-specific lessons, not a duplicate standing
lane.

Child routing packs are references, not extra standing reflection lanes. They
must not spawn duplicate feedback sub-agents, claim final reflection status, or
hold separate persistent ledgers for the same trigger batch.

When feedback spans several areas, load only the relevant child packs, such as
process, layout/visual, connector/arrow, assets/text, and ledger hygiene. Final
reporting should name which packs were used whenever child-pack routing affects
the work, not only when the routing decision itself is the user question.

For every reusable feedback item, decide the target scope before writing the
skill update:

- `child-specific`: one child pack owns the concrete checklist
- `multi-child`: several child packs need concrete checklist updates
- `parent-skill`: the diagram feedback parent needs routing, taxonomy, or
  cross-child acceptance-gate wording
- `project-wide`: this project-wide rule file needs the default workflow,
  evidence policy, or final reporting contract
- `global`: the installed global skill should change because the lesson applies
  across projects and the user has authorized that scope

A trigger can require more than one target. For example, a tooltip text issue
can route to `assets-text` for typography, `layout-visual` for overflow, and
`ledger-hygiene` for routing evidence; a missed routing decision should also
update the parent or project-wide rule. Do not treat adding a bullet to this
file as sufficient when the child-pack structure is relevant.

When the correct durable target is a task-specific child skill under a project
parent skill, but that child skill does not exist yet, create it under the
parent skill when edits are allowed. Do not treat the parent skill or this
project-wide rule file as sufficient just because they can hold a generic
bullet. Record the created child skill path and the parent routing entry before
reporting reflection complete.

Every new reflected ledger row must include a concrete `target_scope=...`
decision. If the target is `child-specific` or `multi-child`, the row must also
include a child-skill path, `created_child_skill=...`,
`proposed_child_skill=...`, `loaded_child_packs=[...]`, or
`child_pack_not_loaded=...`.

Installed child pack paths:

- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-process/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-layout-visual/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-connector-arrow/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-assets-text/SKILL.md`
- `/Users/urayahadays/.codex/skills/imagegen-diagram-feedback-skill-ledger/child-skills/routing-ledger-hygiene/SKILL.md`

When a child pack is loaded, record `loaded_child_packs=[...]` in the final
status or in `.agent-feedback/SUBAGENT_INVOCATIONS.md`, together with
`routing_reason=...`, `target_scope=...`, and `evidence=...`. If no child pack
was loaded for a trigger that spans process, layout, arrow, asset/text, or
ledger hygiene, record the reason instead of silently relying on memory. Missing
child-pack or parent-scope evidence is itself a feedback reflection defect.

### Feedback Reflection Audit Gate
<!-- feedback-gate:reflection-audit -->

After editing feedback ledgers, project rules, repo-local skills, or feedback
workflow docs, run:

```bash
node tools/check_feedback_reflection.mjs
```

This rule-based lint does not replace the natural-language trigger decision.
It catches structural defects that should be mechanically visible after the
decision: duplicate ledger ids, missing referenced child-skill files, child
skills not listed by their parent skill, new reflected ledger rows without
`target_scope`, child-specific ledger rows without child routing evidence, and
project rules that no longer contain the trigger decision or missing-child-skill
gates.

If the lint passes but a feedback turn still did not fire, treat the remaining
problem as a trigger-condition weakness and update the global/project trigger
rules, not only the lint.

### Diagram Progress Overlay Gate

When implementation progress changes, keep the architecture diagram's node
progress overlay current.

Progress means quality-confirmed readiness, not implementation volume. Use
`docs/architecture/progress-readiness-rubric.md` as the scoring source.

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
- a fully implemented but completely untested node should normally be capped at
  30%; local/unit-only proof should normally stay at or below 45%; user-facing
  answer paths without answer-quality eval, UI E2E, role behavior, and
  failure-path coverage should normally stay below 50%
- route/metric-only evaluation should cap Golden Eval around 40% and Agent
  Router around 50%; manual-only proof should cap at 30%; substitute or bypass
  evidence must not raise the target node's readiness
- when a downstream UI or agent can run through a bypass path while upstream
  pipeline nodes remain unimplemented, the tooltip must name the actual read
  path and say which intended components are not used. A chat UI that reads a
  direct mart view or in-memory rows must not imply dbt, STAGE / RAW, Cortex
  Analyst, or Cortex Search readiness.
- reference data sources used by the current MVP must be visible as their own
  honest node, logo, and label. Do not hide the real source, such as
  `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`, inside another dataset's tooltip or under a
  mismatched vendor icon like Kaggle.
- sample datasets must be compared against the diagram/data-contract categories
  before progress is raised. Keep `docs/architecture/sample-data-coverage-matrix.md`
  current, and distinguish true matches from proxies. A discount column does not
  prove promotion-calendar coverage, and supply availability or cost does not
  prove inventory operations coverage.
- when the chosen sample dataset materially differs from the original business
  target, revise the visible diagram labels toward the real sample entities
  rather than keeping business-friendly placeholders. Preserve the business
  target and gaps in supporting docs, not as misleading primary nodes.
- visible node titles, zone labels, and flow labels should be Japanese-first
  even when the underlying sample tables use English identifiers. Keep raw
  identifiers such as `TPCH_SF1`, `orders`, or `lineitem` in hover notes,
  subtext, or supporting matrices when they are needed for traceability.
- do not add icon-plus-text helper headings inside a frame when the parent
  frame label already names that group. If an element uses node-like visual
  styling, it must represent a real component, source-faithful group header, or
  intentionally documented label. Decorative helper headings can be mistaken for
  mystery architecture nodes and should be removed or restyled as plain frame
  labels.
- after adding, removing, or restyling any helper/header element inside a
  category or subcategory frame, re-center the child node stack against the
  nested frame or usable parent-frame content area. Measure the child bounding
  box center against the frame center, not just each individual node, and update
  all attached connector endpoints after node movement. A helper/header removal
  can leave nodes visually pushed to the lower-right even when no overlap is
  detected.
- category-frame spacing is not finished just because the child-stack center is
  aligned. Also check inter-node gaps and visible top/bottom/left/right
  breathing room. If later edits make those margins or gaps drift, remeasure and
  adjust them again. When a frame has three stacked nodes, avoid excessive
  vertical gaps that make the stack look sparse or close to overflowing; reduce
  the gaps and recenter the resulting stack together with connector endpoints.
- sequential pipeline nodes must respect prerequisite readiness; do not score a
  downstream node, such as `dbt marts`, above an unimplemented upstream node,
  such as `dbt staging`, when the flow depends on that upstream layer
- for user-facing nodes such as Streamlit UI and evaluation nodes such as Golden
  Eval, progress means readiness including answer-quality validation, SQL/result
  correctness, source grounding, and E2E coverage. Do not rate them highly only
  because the UI renders, a query executes, or routing tests pass.
- node coordinates, card dimensions, connector endpoints, and source-faithful
  layout must not be changed merely to add progress annotations
- after edits, run a DOM count check that service-node count equals
  progress/status/note metadata count, then visually inspect at least one
  hovered node screenshot
- progress hover tooltips must use structured DOM, not a single generated
  pseudo-element text blob, whenever typography needs partial emphasis. Only the
  progress-rate line such as `進捗率 25%` should be bold and colored; status and
  note labels/text stay normal weight. Strip sentence-ending punctuation from
  displayed hover text, and let long notes wrap inside a tooltip that can grow
  up to a tested maximum width without overflowing the tooltip or diagram edge.
  Do not remove meaningful internal dots in identifiers such as Snowflake object
  names while doing punctuation cleanup. Verify every progress node has exactly
  one tooltip and at least one hovered screenshot after typography changes.
- hover tooltip surfaces must remain open when the pointer moves from the node
  to the tooltip itself. Place the tooltip adjacent to the node or add an
  explicit hover bridge so there is no dead gap, make the visible tooltip
  `pointer-events: auto`, and use `:focus-within` so keyboard users can move
  into nested controls without closing the tooltip. If a tooltip contains
  secondary hover/focus targets, such as role chips, verify the nested panel can
  be opened and inspected without the parent tooltip disappearing.
- all hover CSS surfaces should size from their text content rather than a
  brittle fixed width. Use max-content sizing with tested min/max bounds,
  normal wrapping, and overflow checks for both the parent tooltip and nested
  hover panels. Do not accept a tooltip change until a browser check confirms
  text does not spill outside the visible card.
- design/review involvement percentages may appear in the hover tooltip when
  they help the learning objective. They are not implementation work
  allocation, staffing commitment, or coding ownership. Keep them as compact
  text chips, not progress bars, and make every displayed split sum to 100%
  across the agreed roles. When `PG` appears, treat it as implementation
  feasibility, UI/API/operation impact, and review involvement at the design
  stage. Because the public diagram should not imply an official staffing model,
  label these values as assumed design/review involvement and do not put
  company-internal preparation wording into the public HTML. Role chips may open
  a secondary hover/focus panel when the learning value justifies it; the panel
  should describe the role's concrete design/review responsibility for that
  node, not implementation staffing. After adding or renaming role chips, run a
  browser check for tooltip persistence, nested-panel visibility, tooltip
  overflow, edge overflow, one tooltip per progress node, one role section per
  tooltip, and the expected nested detail count.
- role responsibility wording belongs to the AI architecture learning skill
  lane, not the generic imagegen HTML reproduction lane. When a hover detail
  could imply that AI engineers own business KPI definitions, data contracts,
  RBAC policy, cost policy, or UI implementation by themselves, route to
  `skills/ai-architecture-learning/child-skills/role-responsibility-tooltips/SKILL.md`
  and rewrite the text to name the actual neighboring owner, such as PM/業務,
  DS, DE, PG, security, or platform, plus the AI engineer's LLM/Cortex/agent
  responsibility.
- when the learning goal needs AI architecture ownership but the public diagram
  should not imply a separate official staffing model, keep one combined
  `AIエンジニア / AIアーキテクト` chip and split the nested detail into
  architecture decisions and implementation/verification tasks.

### Repo Responsibility Boundary Gate

This repo's primary responsibility is high-fidelity architecture HTML
reproduction, public preview, diagram assets, progress overlays, and learning
metadata. A small reference MVP may stay here only to ground diagram progress.

When work shifts from explaining or visualizing readiness into creating real
tests, answer-quality evaluation, UI E2E, Snowflake/Cortex runtime behavior,
CI/CD, or workflow improvements, hand the task back to the pipeline
implementation repo. Do not raise this repo's node percentages based on planned
implementation work; raise them only after implementation-repo evidence exists
or after a deliberately scoped reference/smoke proof in this repo.

### Backlog Ticket Japanese-First Gate
<!-- feedback-gate:backlog-ticket-japanese -->

When creating, updating, or reviewing Backlog tickets for this project, load the
Backlog ticketing child skill:

- `skills/ai-architecture-learning/child-skills/backlog-ticketing/SKILL.md`

Backlog ticket titles, summaries, acceptance criteria, and comments should be
Japanese-first. Preserve English for exact product names, issue prefixes, repo
paths, commands, filenames, and stable architecture terms, but do not leave the
main task meaning in English only.

This rule is separate from diagram-label Japanese rules. Backlog tickets are
project-management artifacts, so they need Japanese-readable intent, background,
acceptance criteria, and evidence links rather than only source-faithful node
labels.

### Issue and Task Report Japanese-First Gate

When reporting work through GitHub Issue, Backlog comments, task completion
summaries, or next-task recommendations, write the user-facing report
Japanese-first. These reports often become the raw material for Backlog tickets,
so English-heavy headings or status labels can become ticket wording drift.

Prefer headings such as `作業報告`, `次タスク`, `判断`, `検証`, `未実施`, and
`フィードバック反映`. Avoid routine English-only headings such as `Next steps`,
`Artifact/docs status`, or `Feedback reflection` unless they are required by a
machine-readable contract. When an exact token must appear, pair it with
Japanese wording, for example `フィードバック反映: 完了（Feedback reflection:
complete）`.

Preserve exact product names, issue ids, repo paths, commands, branch names,
and required status tokens when translation would reduce traceability.

### Parallel Session Implementation Gate

Before splitting implementation across parallel Codex sessions, first create or
update the design and Backlog lane that defines the work. Use:

- `docs/project-management/parallel-session-implementation-plan.md`
- `docs/project-management/backlog-workflow.md`
- `docs/project-management/backlog-ticket-bodies.md`

Parallel sessions should start only after the target lane has clear purpose,
acceptance criteria, editable files, files that must not be touched, verification
commands, and reporting expectations. While those are not clear, parallel
sessions may do research, review, or design alternatives, but not independent
implementation.

Keep main-session ownership for shared integration surfaces such as README,
AGENTS, feedback ledger, project skill, Backlog ticket tables, architecture
HTML, and Obsidian mirror unless the main session explicitly grants a narrow
edit scope. A parallel session's output should include proposed shared-file
updates instead of silently editing shared state.

### Parallel Session Acceptance Confirmation Gate

When delegating work through GitHub Issue or another pane-routing bridge, do not
treat "Issue comment posted" or "bridge send succeeded" as proof that the
target session accepted the task.

Report delegation as accepted only after at least one receiving-side evidence
source exists:

- the receiving Codex session transcript contains the delegated task or source
  comment id
- the routing supervisor marks the command resolved with a reply/comment URL
- the target session creates the instructed worktree, branch, file change, or
  other scoped work artifact
- the target session posts an explicit `/githubissue` acknowledgment

Terminal-based pane delivery is especially risky because `Mac visible-send` can
submit text to a busy Codex session while that session continues an unrelated
goal. If the target pane is busy, the command remains pending, or the receiving
transcript does not contain the task, report the delegation as "sent but not
accepted" and avoid treating the task as active implementation work.

### Extensible Validation Slice Gate

Do not default to `最小実装`, `最小構成`, or "smallest working scope" when
recommending the next task for this project. This project is meant to practice
delivery-realistic AI architecture and review, not to finish as a tiny demo.

Use a controlled baseline only to keep evidence and failure attribution clear.
The preferred unit is an extensible validation slice: small enough to review and
debug, but shaped so dbt, Semantic Model, Golden Eval, Cortex, trace, human
review, and Snowpark responsibilities can expand without replacing the design.

When public delivery-realistic evidence points toward Snowflake/dbt, CI/CD,
DevOps, operation, and continuous improvement, treat excessive minimalism as a
quality risk. Complexity that creates reviewable design or implementation
mistakes is acceptable learning material as long as tests, traces, docs,
readiness gates, and feedback reflection can localize the failure.

### dbt Test Readiness Gate

For RAIOPS-4 and dbt quality work, load the dbt readiness gates child skill:

- `skills/ai-architecture-learning/child-skills/dbt-readiness-gates/SKILL.md`

Keep parse/compile evidence separate from live `dbt build/test` proof. Defined
dbt tests and credentials-free compile can show static project health, but they
do not unlock live Semantic/Eval/UI/Cortex readiness. Downstream readiness may
increase only after the relevant dbt gate is proven and the remaining
answer-quality checks are explicit.

If dbt tests fail or live test evidence is unavailable, do not raise diagram
percentages or Backlog completion as if the dbt quality gate passed. Record the
failure or missing evidence and keep the next action visible.

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

### Feedback Reflection Status Semantics

`Feedback reflection` status is about whether a user/reviewer/improvement
signal was reflected into the project feedback ledger, project rules, or
repo-local/global skills. It is not the same as whether the main artifact,
diagram, Backlog ticket, or design document was edited.

When reporting a task that has both artifact work and feedback reflection,
separate the two statuses:

- `Artifact/docs status`: whether the primary requested output was edited,
  reviewed, or left as a proposal
- `Feedback reflection status`: whether ledger/rule/skill reflection is
  `complete`, `proposed-only`, `pending with handoff`, `non-reusable`, or
  `main-context substituted`

Use `proposed-only` only when the reflection update itself is only proposed,
for example read-only review, artifact-only mode, no edit authorization, or a
global-skill change that requires later approval. Do not use `proposed-only`
merely because the main document edits have not yet been applied.

## Do Not Use This File As A Raw Dump

Raw history belongs in `.agent-feedback/FEEDBACK_LEDGER.md`. This skill should
contain only current rules that future agents should follow.
