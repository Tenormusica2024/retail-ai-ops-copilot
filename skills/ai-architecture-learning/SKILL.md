---
name: ai-architecture-learning
description: >-
  Project-local parent skill for AI architecture learning metadata in this repo:
  node hover text, role responsibility boundaries, readiness labels, and
  learning-oriented architecture explanations.
---

# AI Architecture Learning

Use this project-local parent skill when editing learning metadata around the
architecture diagram, including node hover text, role responsibility splits,
progress/readiness labels, and explanations of why a technology or architecture
boundary exists.

This skill is for the AI architecture learning surface in this repo. It is not
the generic imagegen-to-HTML reproduction skill and should not be used to relax
visual fidelity gates.

## Project Premise

This repo is a target-company realistic architecture learning and validation
surface. Its purpose is to study practical AI/LLMOps technology choices under
conditions close to real delivery before implementation work advances.

This repo is also a practice surface for controlling complex architecture with
AI and moving toward professional delivery quality. Architecture changes should
include the control mechanisms that make the complexity governable: feedback
ledger capture, skill/rule updates, source-backed design notes, diagram lint,
CI gates, readiness rubrics, eval evidence, and reviewer loops.

Use this project to distill reusable quality-assurance skills for future
professional client-delivery work. When a code review, diagram review, feedback
routing rule, reviewer-agent contract, lint/CI gate, or evidence standard proves
useful, separate the generic lesson from project-specific context so it can be
promoted into a reusable skill later.

Do not let a narrow reference MVP, proxy dataset, or implementation shortcut
erase technologies that belong to the intended realistic architecture. Preserve
architecture identities such as dbt, Cortex, semantic modeling, evaluation,
traceability, and human review when they are part of the learning target. Show
current gaps through progress/readiness values, `data-status`, `data-note`,
docs, or evidence links instead of renaming the primary nodes to shortcuts.

When reviewing diagram metadata, consider the user's project-launch intent:
the diagram is a learning and technology-selection map first, not only a
snapshot of the current MVP.

## Learning Stage Strategy

Treat the current repository as a learning-density surface, not a permanently
minimal beginner demo. The learning window is short, so avoid spending too much
time perfecting beginner scope after the core Cortex/dbt/Streamlit/LLMOps
relationships are understood.

Prefer learning efficiency over minimum scope. This project may absorb
intermediate architecture topics when the added component teaches a realistic
decision and the result still preserves quality attribution.

Actively counter the default assistant tendency to choose the smallest
conservative implementation. In this project, minimum scope is a control tactic,
not the preferred long-term architecture direction.

A minimal stable slice is an interim control point, not a default finish line.
When baseline behavior is stable enough to localize failures, proactively
propose the next high-learning expansion instead of only recommending that the
project stay small. Name the expected learning value and the attribution risk.

Quality attribution means the project can still explain whether an answer or
workflow degraded because of source data, dbt/modeling, semantic contract,
retrieval/search, agent routing, prompt/tool behavior, evaluation logic, trace,
UI, or governance. If degradation can no longer be localized, simplify the
feature, split the experiment, or move runtime-heavy work into a separate
project before adding more components.

Snowpark and Snowpark Container Services are active intermediate or advanced
architecture candidates. Do not assume they are used in every workflow, but do
not steer away from them by default.

Evaluate Snowpark/SPCS early in the next-stage design when a concrete
responsibility may exist, such as:

- complex Python-oriented preprocessing that SQL/dbt cannot express cleanly
- Snowflake-side UDFs, UDTFs, or stored procedures
- in-Snowflake eval runners, trace enrichment, or data-quality jobs
- ML feature engineering, training, inference, or model registry workflows
- containerized Airflow, JupyterLab, MLflow, custom APIs, long-running jobs, or
  GPU/custom runtime needs inside the Snowflake boundary

In the current diagram, place the first Snowpark promotion as a
`Snowpark Python / UDF / SP` execution node inside the Snowflake Account
boundary. Connect it only where it has a concrete responsibility:

- dbt Python model / UDF / SP execution from the dbt modeling area
- Cortex Agents custom tool logic via Stored Procedure or UDF
- in-Snowflake eval runner, trace enrichment, or data-quality job output into
  Trace Store

Do not add SPCS as a mainline node until the design introduces containerized
services such as Airflow, JupyterLab, MLflow, custom APIs, long-running jobs, or
explicit Compute Pool / Service / Job Service concepts. Record SPCS as an
active next-stage candidate rather than a rejected option.

When this Snowpark promotion is shown in a shared diagram rather than a
separate new Snowpark-first diagram, preserve readability by rebalancing nearby
subcategory frames. The Semantic layer should not remain low or oversized if it
forces the Snowpark execution layer to touch the parent boundary. Move and
resize the sibling frames as a small layout stack, then update connector
endpoints and labels as one geometry change.

Before intermediate-stage work starts, review whether to extend this repository
or create a separate project. Keep this repository for diagram learning,
decision rationale, and public Pages review. Prefer a separate project when the
work becomes runtime construction, cost-bearing Snowflake services, live
experiments, CI/CD, deployment, or operational guardrails.

## Layer Naming Honesty

Use architecture layer names that describe the actual evidence in the diagram
and implementation.

- Do not call a Snowflake source area a data lake, STAGE, RAW, ingestion, or
  lakehouse layer unless the diagram or implementation actually includes the
  corresponding objects, such as external stages, Snowpipe, Iceberg, RAW tables,
  dynamic tables, or an explicit ingestion flow.
- When the current evidence is direct reference to
  `SNOWFLAKE_SAMPLE_DATA` plus manually inserted definition rows, label it as a
  Snowflake reference / seed layer rather than a generic data platform or data
  lake layer.
- If a future intended data lake or ingestion layer is important for learning,
  keep it as a planned architecture node with 0% readiness and explicit
  status/notes, instead of making current sample-table references look like
  ingestion readiness.

## CI/CD Source And Seed Boundaries

Represent CI/CD relationships according to what the pipeline can actually
change or validate.

- Do not draw CI/CD as deploying a read-only external/sample source such as
  `SNOWFLAKE_SAMPLE_DATA` unless there is an implemented ingestion or managed
  source provisioning step.
- Do connect CI/CD to dbt transformation/modeling when it owns `dbt build`,
  `dbt test`, model deployment, semantic validation, or eval execution.
- When a visible reference/seed layer contains version-controlled seeds or
  manual definition tables, show that CI/CD can apply or validate those seed
  definitions separately from read-only sample-table references.
- In tooltips, explicitly distinguish read-only source references from
  version-controlled seeds, tests, semantic artifacts, and deployable models.

## UI And Runtime Relationship Clarity

When a UI node represents a user-facing facade for a broader runtime category,
make that category relationship visible.

- Do not draw separate lines from the UI to every internal runtime node when
  that would create route clutter or imply that the UI owns each internal
  execution step.
- Add a category-level connector from the runtime frame or boundary to the UI
  node when the UI delegates execution to the runtime as a whole.
- When an arrow connects to a category/frame boundary, make the arrowhead meet
  the boundary perpendicularly. Avoid placing an arrowhead on a segment that
  runs parallel to the box edge, because it makes the endpoint look ambiguous.
- Use tooltip notes to state the responsibility split: the UI owns input,
  answer display, warning/approval surfaces, and user workflow; the runtime
  owns routing, planning, tool calls, execution, and trace emission.
- If the current MVP bypasses the intended runtime path, keep the intended
  relationship visible but state the bypass in `data-status` or `data-note`.

## Evaluation And Error Classification Semantics

Keep answer-quality evaluation, trace storage, and error-cause classification
separate in the learning diagram.

- `Golden Eval` represents answer, SQL, grounding, and regression-quality
  evaluation. Its connector labels should describe evaluation inputs, results,
  or regression-candidate flow.
- `Trace Store` represents saved runtime/evaluation evidence. It can receive
  Golden Eval results and feed failed traces or regression candidates back into
  Golden Eval.
- `Error Taxonomy` represents error-cause classification and improvement
  routing, such as wrong SQL, KPI interpretation errors, data gaps, access
  denial, ambiguous questions, safe-stop, and human-review handoff.
- Do not draw a direct Golden Eval / Error Taxonomy arrow just because both are
  LLMOps concepts. Add that connector only when the workflow explicitly moves a
  classified evaluation artifact between them or uses taxonomy labels as an eval
  dimension.
- When the relation is useful but weak, explain it in hover notes or supporting
  docs instead of turning it into an architecture connector.

## Child Skills

- `child-skills/role-responsibility-tooltips/SKILL.md`
  - role responsibility wording in hover cards
  - PM/DE/DS/AI engineer/PG boundary clarity
  - AI engineer and AI architect viewpoint split inside one combined role
  - Snowflake/Cortex managed-service responsibility boundaries
  - nested role-detail hover panels
  - tooltip text sizing and browser verification expectations

## Routing Rule

When feedback concerns who owns a concept, KPI, data definition, AI grounding,
tool routing, eval, trace, or implementation feasibility, route to the role
responsibility child skill before editing hover text.

Keep public wording educational and non-internal. Avoid implying a company
staffing model or official delivery responsibility.
