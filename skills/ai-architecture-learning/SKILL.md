---
name: ai-architecture-learning
description: >-
  Project-local parent skill for AI architecture learning metadata in this repo:
  node hover text, role responsibility boundaries, readiness labels, and
  learning-oriented architecture explanations, including Backlog/project
  management artifacts when they support the learning workflow.
---

# AI Architecture Learning

Use this project-local parent skill when editing learning metadata around the
architecture diagram, including node hover text, role responsibility splits,
progress/readiness labels, and explanations of why a technology or architecture
boundary exists. Also use it when repo-local project-management artifacts,
Backlog tickets, evidence comments, or ticket synchronization affect how the
architecture learning workflow is planned, explained, or reviewed.

This skill is for the AI architecture learning surface in this repo. It is not
the generic imagegen-to-HTML reproduction skill and should not be used to relax
visual fidelity gates.

## Project Premise

This repo is a delivery-realistic architecture learning and validation
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

Code-review findings are first-class learning artifacts in this project. When a
review finds a real issue, identify whether it is an artifact bug, evidence
overclaim, stale design doc, branch-integration risk, or reviewer-process gap.
Then reflect the reusable mistake pattern into the code-review child skill or a
domain-specific child skill instead of leaving it only in the final review
comment.

Test patterns are also first-class learning artifacts. When a useful test,
lint, fixture check, E2E case, or live-proof boundary appears, classify what it
proves, what it does not prove, and whether it should stay project-local or be
promoted into a reusable professional test-pattern skill.

## Reviewer-First Staged Upstreaming

Use reviewer-first staged upstreaming when splitting implementation and review
work across agents. The goal is to train reviewer agents on real AI failure
patterns without turning the implementation task into a hidden-requirements
trap.

Implementation briefs must always include the baseline delivery contract:

- purpose and user-facing intent
- exact scope, allowed files, forbidden files, and shared-file ownership
- source-of-truth docs and required design decisions
- acceptance criteria, required commands, and evidence level
- public/private boundary, secret policy, and no-silent-fallback rules
- exact state vocabulary such as `posted`, `delivered`, `accepted`,
  `reported`, `reviewed`, and `integration_ready` when parallel work is in
  scope
- any repeated, high-severity, safety-related, public-delivery, or machine-check
  rule that has already been promoted upstream

Implementation briefs should not receive the full reviewer-only mistake
catalog by default. Do not pre-fill every likely AI error, old reviewer finding,
and known weak spot into the implementer prompt when the purpose is to test
whether the reviewer catches natural implementation misses.

Implementation lanes must not be instructed to read reviewer-only artifacts
unless the brief explicitly chooses `implementation_brief_level=full-pattern-aware`.
Reviewer-only artifacts include the code-review AI mistake-pattern child skill,
findings-only HTML pages, prior review finding ledgers, and known-miss lists.
Give implementers the baseline contract, promoted rules, source-of-truth docs,
and executable acceptance criteria; keep exploratory review lenses on the
reviewer side so reviewer quality can be measured and improved.

Reviewer briefs should be pattern-aware. They should load the relevant
reviewer child skill, prior findings, known AI mistake patterns, evidence
boundaries, and reflection-routing rules. Reviewers are expected to classify
findings, propose the right reflection target, and identify whether a finding
should remain reviewer-only or be promoted upstream.

Reviewer sessions are not only defect detectors. They are reviewer-training
surfaces. Each review should identify which review lens caught the issue, which
lens missed it, and whether the miss should update a reviewer skill, a domain
child skill, a lint/test, or future implementer acceptance criteria. If no
findings exist, the reviewer should still report the coverage boundaries and
which reusable review patterns were exercised.

Escalate a reviewer-only pattern into implementation briefs, deterministic
lint/CI, Backlog acceptance criteria, or project-wide rules when any of these
are true:

- the same class of issue recurs after a reviewer has already caught it
- the issue can leak secrets, break a public page, corrupt evidence, or cause a
  wrong delivery-status claim
- the issue is mechanically checkable
- the issue is a stable requirement rather than exploratory review judgment
- missing it would make the implementer fail an unstated acceptance condition
- the cost of late reviewer repair is higher than early prevention

Keep a pattern reviewer-only when it is still exploratory, low-risk, not yet
stable, too context-dependent, or mainly useful for training the reviewer to
notice new shapes of AI error.

Every delegated implementation/review split should name the information mode
in the brief or report:

- `implementation_brief_level=baseline`: baseline delivery contract only
- `implementation_brief_level=hardened`: baseline plus promoted recurring or
  high-risk rules
- `implementation_brief_level=full-pattern-aware`: implementer receives the same
  mistake-pattern context as the reviewer; use this for safety-critical,
  deadline-critical, or repeated-failure repairs
- `reviewer_context_level=pattern-aware`: reviewer receives the relevant
  reviewer skill and prior failure patterns

`Hardened` means distilled promoted rules only. Do not pass raw prior findings,
reviewer-only HTML, mistake catalogs, or reviewer trap lists to a hardened
implementer. Point to the promoted rule, lint, CI check, Backlog acceptance
criterion, or project rule that came out of those findings.

If a task genuinely needs reviewer-only material as source input, classify it
as `implementation_brief_level=full-pattern-aware` and record the exception
reason. Typical examples are reviewer-skill maintenance, reviewer-tooling HTML,
or a repeated-failure repair where maximizing first-pass safety is more
important than measuring reviewer catch quality.

If a reviewer finds a defect, the orchestrator must decide whether the defect
was caused by implementer negligence against the baseline contract, a legitimate
reviewer-only training miss, or a rule that should now be promoted upstream.
Do not let reviewers become a permanent manual repair layer for defects that
should be prevented by better briefs, lints, tests, or CI.

Before dispatching or updating project-local implementation/reviewer briefs, run
`node tools/check_parallel_session_guardrails.mjs`. This guardrail exists because
the orchestrator itself must actively decide how much context to give the
implementer session. If the check fails, fix the brief before sending it to a
parallel session.

In this project, the main session's default role is orchestrator, not artifact
implementer. After a workstream is intended for parallel sessions, do not absorb
implementation, public HTML edits, tests, or follow-up page fixes into the main
session merely because they are small. Dispatch the artifact change to a usable
lane, verify `accepted`, and keep the main session focused on coordination,
review, feedback reflection, integration, and final evidence. Direct
main-context artifact work is allowed only with explicit user takeover
authorization, or when the target lane is formally unavailable and the report
labels the result `main-context substituted`.

The project guardrail lint enforces this boundary by inspecting diffs. If
artifact files changed, the same diff must include delegated-lane evidence in
`.agent-feedback/SUBAGENT_INVOCATIONS.md` or an explicit
`main-context substituted` reason. Run `node tools/check_parallel_session_guardrails.mjs`
before accepting the work as done.

Do not make feedback-ledger updates the activation source for orchestrator-only
controls. The feedback ledger may be read and updated for reflection, but
parallel-session control gates should depend on dispatch/review operations,
artifact diffs, and invocation evidence.

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

Do not frame the next task as `最小実装` or `最小構成` when the user's goal is
to learn delivery-realistic architecture and review complex AI-assisted work.
Use a controlled baseline only as an evidence and attribution tactic. The
preferred implementation unit is an extensible validation slice: reviewable,
testable, and debuggable, while preserving future paths into dbt, Semantic
Model, Golden Eval, Cortex, trace, human review, and Snowpark.

An extensible stable slice is an interim control point, not a default finish
line. When baseline behavior is stable enough to localize failures,
proactively propose the next high-learning expansion instead of only
recommending that the project stay small. Name the expected learning value and
the attribution risk.

Mistakes introduced by useful complexity are acceptable review material in this
project when the control surface can still explain which layer failed. Do not
avoid all complexity merely because it might create later corrections; those
corrections are part of the user's and reviewer agents' learning loop.

Quality attribution means the project can still explain whether an answer or
workflow degraded because of source data, dbt/modeling, semantic contract,
retrieval/search, agent routing, prompt/tool behavior, evaluation logic, trace,
UI, or governance. If degradation can no longer be localized, simplify the
feature, split the experiment, or move runtime-heavy work into a separate
project before adding more components.

Snowpark and Snowpark Container Services are active intermediate or advanced
architecture candidates. Do not assume they are used in every workflow, but do
not steer away from them by default.

For dbt design, keep SQL dbt as the primary transformation, testing, docs, and
lineage layer. Use the current `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` source unless
the user explicitly reopens data selection. Snowpark-aware design means leaving
clear extension points for dbt Python models, UDF/SP execution, eval/trace
enrichment, and Cortex Agents custom tools; it does not mean moving simple
joins, casts, or monthly mart aggregation into Python.

Before dbt implementation, require a mart aggregation contract. A
category-grain mart can expose distinct order counts and rate metrics at that
fixed grain, but future agents must not assume those values are freely rollup
safe. Higher-grain questions need additive numerators/denominators, distinct
order counts at the requested grain, semantic aggregation rules, and Golden Eval
cases that catch double-counted orders or averaged rates.

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

- `child-skills/backlog-ticketing/SKILL.md`
  - Backlog ticket title/body/comment wording
  - Japanese-first issue summaries and acceptance criteria
  - Japanese-first remote Issue reports, task reports, and Backlog comments
  - evidence template and repo-doc synchronization for tickets
  - public-safe learning-realistic ticket language
- `child-skills/dbt-readiness-gates/SKILL.md`
  - RAIOPS-4 dbt test/readiness gate design
  - parse/compile versus live `dbt build/test` proof separation
  - Semantic/Eval/Streamlit/Cortex readiness gating from dbt evidence
  - dbt test failure policy and parallel session brief boundaries
- `child-skills/code-review-ai-mistake-patterns/SKILL.md`
  - reviewer lens for AI/parallel-agent implementation mistakes
  - evidence overclaims, stale docs, branch lag, and report-vs-artifact gaps
  - data-bearing contract checks that static compile/lint cannot prove
  - routing from generic review findings into domain-specific child skills
- `child-skills/test-pattern-reuse/SKILL.md`
  - reusable test-pattern taxonomy separate from review lenses
  - static/lint, fixture-unit, contract, data-bearing, compile-only,
    live-integration, and user-facing E2E evidence levels
  - promotion rules for turning project tests into generic client-delivery
    skills, lint/CI, Backlog acceptance criteria, or templates
  - current known gaps such as pytest environment readiness, live Snowflake
    proof, private simulation boundaries, and answer-quality eval coverage
- `child-skills/role-responsibility-tooltips/SKILL.md`
  - role responsibility wording in hover cards
  - PM/DE/DS/AI engineer/PG boundary clarity
  - AI engineer and AI architect viewpoint split inside one combined role
  - Snowflake/Cortex managed-service responsibility boundaries
  - nested role-detail hover panels
  - tooltip text sizing and browser verification expectations

## Routing Rule

When work concerns Backlog tickets, issue creation, issue updates, issue
reviews, ticket synchronization, ticket templates, ticket wording, evidence
comments, remote GitHub Issue reports, task completion reports, next-task
recommendations, or Japanese/English balance in project-management artifacts,
route to the Backlog ticketing child skill before creating, updating,
reviewing, synchronizing, or reporting ticket text.

When work concerns RAIOPS-4, dbt tests, dbt build/test evidence, parse/compile
versus live proof, or readiness gating for Semantic/Eval/UI/Cortex from dbt
quality evidence, route to the dbt readiness gates child skill before editing
design docs, Backlog text, readiness rubrics, or final reports.

When work concerns code review findings, AI-generated implementation defects,
parallel-session output review, evidence overclaim, stale docs discovered by
review, branch integration risk, or a reviewer-process gap, route to the
code-review AI mistake-pattern child skill. If the finding is domain-specific,
route both to this review lens and the matching domain child skill.

When work concerns test design, test coverage, fixture checks, lint/CI checks,
E2E cases, live-proof boundaries, failed/skipped test interpretation, or whether
a test pattern should become reusable for future client-delivery work, route to
the test pattern reuse child skill. If the test belongs to dbt, Backlog/Slack,
diagram, role tooltip, or another domain, route to both this cross-cutting test
skill and the matching domain child skill.

When feedback concerns who owns a concept, KPI, data definition, AI grounding,
tool routing, eval, trace, or implementation feasibility, route to the role
responsibility child skill before editing hover text.

Keep public wording educational and non-internal. Avoid implying a company
staffing model or official delivery responsibility.
