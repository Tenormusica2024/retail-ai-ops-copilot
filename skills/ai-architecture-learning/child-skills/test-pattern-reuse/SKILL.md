---
name: ai-architecture-learning-test-pattern-reuse
description: >-
  Project-local child skill for turning useful test patterns from this AI
  architecture learning repo into reusable, client-delivery-oriented test
  design rules, including static/lint checks, contract tests, data-bearing
  checks, E2E tests, live proof boundaries, and promotion into generic skills.
---

# Test Pattern Reuse

Use this child skill when designing, reviewing, reporting, or generalizing test
patterns from this project. This is separate from the code-review mistake-pattern
skill: review lenses describe what humans/reviewer agents should notice, while
test patterns describe how a defect is prevented or detected automatically.

## Current Project Status

The project already has useful test patterns, but they are distributed across
several surfaces rather than fully generalized:

- dbt schema/generic tests for column, range, uniqueness, and grain contracts
- dbt singular tests for KPI seed rows, unsupported KPI gaps, and reaggregation
  hazards
- local Node tests for Backlog/Slack private notification simulation
- Python tests for planner/trace and Obsidian sync, when a pytest-capable Python
  environment is available
- deterministic diagram lints for connector geometry, text overflow, and
  diagram quality
- feedback-reflection and parallel-session guardrail lints for workflow rules

Treat this as a strong project-local foundation, not yet a fully reusable
professional test-pattern library.

## GitHub Pages Test Pattern View

When the user needs to understand what test patterns exist or which tests this
project should use, create or update a GitHub Pages HTML view instead of leaving
the knowledge only in reports or scattered docs.

The page must be Japanese-first and human-readable. It should show, at minimum:

- test pattern name
- category and evidence level
- current project status
- should-use judgment for this project
- command or artifact that provides evidence
- what the pattern proves
- what the pattern does not prove
- reusable target: project-local, project-family, generic client-delivery skill,
  lint/CI, Backlog acceptance criterion, or documentation template
- related architecture node, lane, or workflow
- next action or blocker

Keep this page separate from code-review mistake-pattern pages. Code-review
pages explain what reviewers should notice; test-pattern pages explain how
defects are detected or prevented by checks.

When adding or updating the test-pattern HTML, wire it into the public review
surface graph, not only the docs index. At minimum, cross-link it from the
architecture diagram page and the concrete findings page, and link back to those
pages from the test-pattern page. If the general AI mistake-pattern page exists,
link it to the test-pattern page as well so humans can move among architecture,
actual findings, reviewer lenses, and executable/testable patterns.

When reporting that the page is on GitHub Pages, local file checks and local
HTTP previews are not enough. Verify the public Pages URL returns HTTP 200 and
that the relevant source pages contain `test-patterns.html` or the visible
`テストパターン一覧` label after the Pages deployment completes. If the page is
only committed locally or pushed to a non-Pages branch, report it as not yet
published.

Before delegating the page to a parallel session, the orchestrator must confirm
lane capacity from the current receiving session state, not only from old
`reported` rows. If the receiving lane cannot be proven idle or safely
pauseable, create a new lane or wait rather than silently interrupting an
unknown active task.

## Evidence Levels

Classify every test or check by evidence level before claiming readiness:

- `static-lint`: parses files, docs, HTML, ledger rows, or graph structure
- `fixture-unit`: runs deterministic code against local fixtures or mocked input
  and should be visibly explained as `単体テスト` or `ユニットテスト`
  when shown to Japanese readers
- `contract-test`: verifies a data, API, semantic, routing, or workflow contract
- `data-bearing-local`: checks current local seed/fixture/output values
- `compile-only`: proves a tool can parse or generate artifacts, but not that
  live data passed
- `live-integration`: runs against the intended live service with target,
  role/schema/environment, and success/failure evidence; label it as
  `結合テスト` where useful
- `user-facing-e2e`: verifies the visible workflow, not only internal functions
  and should be visibly explained as `E2Eテスト`

Do not collapse these into a generic "tests passed" statement.

## Reusable Test Pattern Taxonomy

When a useful test appears in this repo, classify it into one or more reusable
patterns:

- contract surface: dbt model, seed, semantic YAML, API, UI, notification,
  trace, eval case, diagram, or workflow state
- invariant: what must never drift
- fixture/source: local fixture, seed row, manifest, DOM, SVG path, generated
  output, live service, or human review record
- failure mode: what defect the test should catch
- evidence level: static, fixture, contract, local data-bearing, compile-only,
  live integration, or E2E
- portability: project-specific only, project-family reusable, or generic
  client-delivery reusable
- promotion target: domain child skill, generic skill, lint/CI, Backlog
  acceptance criterion, or documentation template

## Promotion Rules

Promote a test pattern into a reusable skill, lint, CI gate, or Backlog
acceptance criterion when any of these are true:

- a reviewer or HITL found the same class of defect more than once
- the test prevents evidence overclaim, status-word confusion, public-page
  breakage, secret leakage, or wrong integration readiness
- the check is deterministic and cheap enough to run before handoff
- the pattern applies outside this repo with only surface names changed
- a human review comment can be converted into a reliable machine check
- the test makes client-delivery proof clearer, not merely more numerous

Keep a test pattern project-local when it depends on one-off fixture names,
temporary learning data, or experimental architecture that is not stable yet.

## Reporting Requirements

When reporting test status, include:

- command
- environment/runtime used
- passed/failed/skipped
- exact reason for skipped or not run
- evidence level
- what the test proves
- what the test explicitly does not prove
- whether the pattern should stay project-local or be generalized

Example:

```text
test_pattern_status:
- command:
- result:
- evidence_level:
- proves:
- does_not_prove:
- reusable_target:
```

## Current Known Gaps

Do not overstate current coverage:

- Python pytest files exist, but the current default Python/runtime may not have
  pytest installed. Treat this as environment-not-ready unless a pytest-capable
  environment is explicitly used.
- credentials-free dbt `parse` and `compile --empty` are Level 0 evidence. They
  do not prove live Snowflake `dbt build/test`.
- diagram lint proves geometry and text rules, not source-image artistic
  fidelity or business correctness.
- Backlog/Slack simulator tests prove local `private_simulation`, not real
  Backlog API delivery or Slack posting.
- Golden Eval and user-facing answer-quality coverage are still future work
  unless a concrete eval run and result set are attached.

## Routing

Route domain-specific details to the relevant child skill:

- dbt tests and readiness gates -> `../dbt-readiness-gates/SKILL.md`
- code review findings and AI mistake classification ->
  `../code-review-ai-mistake-patterns/SKILL.md`
- Backlog ticket/test wording -> `../backlog-ticketing/SKILL.md`
- Backlog/Slack notification fixture tests ->
  `../backlog-slack-notification/SKILL.md`
- role tooltip or diagram-readiness evidence ->
  `../role-responsibility-tooltips/SKILL.md`

This child skill owns the cross-cutting pattern language and reuse decision.
