---
name: ai-architecture-learning-dbt-readiness-gates
description: >-
  Project-local child skill for dbt test/readiness gate design in this AI
  architecture learning repo, including RAIOPS-4, dbt tests, live build/test
  evidence, Semantic/Eval readiness gating, and parse/compile versus live proof
  separation.
---

# dbt Readiness Gates

Use this child skill when designing, updating, reviewing, or reporting dbt
tests as readiness gates for Semantic Model, Golden Eval, Streamlit UI, Cortex,
or diagram progress.

## Core Rule

Do not treat dbt test definitions, `dbt parse`, or credentials-free `dbt compile`
as proof that live dbt tests passed on Snowflake.

Use these evidence levels:

- Level 0: design, `dbt parse`, credentials-free `dbt compile`
- Level 1: live `dbt build/test` on Snowflake with target/role/warehouse/schema evidence
- Level 2: Semantic/Eval contract linked to the dbt mart and KPI seed
- Level 3: answer-quality/regression checks after dbt quality is proven

## Readiness Routing

When dbt test evidence is weak or missing:

- keep Semantic Model readiness at draft/static level
- keep Golden Eval readiness at route/metric or design level
- keep Streamlit UI notes honest about direct SQL/reference paths
- do not raise Cortex Analyst readiness from dbt parse/compile evidence
- do not update architecture tooltip percentages as if live dbt quality passed

When live `dbt build/test` passes:

- record target name, role, warehouse, database, and schema without secrets
- document source/staging/intermediate/mart/seed test scope
- allow downstream Semantic/Eval work to proceed against the dbt mart contract
- still require answer-quality tests before raising user-facing answer readiness

## RAIOPS-4 Checklist

Before marking RAIOPS-4 design or implementation complete, check:

- source/staging/intermediate/mart test categories are documented
- mart fixed grain uniqueness is covered
- KPI value ranges are covered
- KPI seed testing is assigned to RAIOPS-4 or RAIOPS-5 explicitly
- `order_count` rollup and rate averaging risks are assigned to dbt singular tests
  or Golden Eval
- credentials-free checks and live build/test evidence are separated
- diagram/readiness changes are gated by evidence, not planned work
- parallel session briefs list editable files and blocked shared files

## Canonical Docs

- `docs/architecture/raiops-4-dbt-test-readiness-gate.md`
- `docs/architecture/progress-readiness-rubric.md`
- `docs/project-management/backlog-ticket-bodies.md`
- `docs/project-management/parallel-session-implementation-plan.md`
