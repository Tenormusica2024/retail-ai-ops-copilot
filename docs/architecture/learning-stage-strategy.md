# Learning Stage Strategy

This project is the beginner-stage learning surface for a Snowflake-native
retail KPI copilot. It should establish the core AI architecture and LLMOps
mental model quickly, then move on rather than spending too much of the
one-month learning window on beginner-scope polish.

## Beginner Stage

The current project should stay focused on:

- high-fidelity architecture diagram reproduction
- semantic KPI access with Cortex Analyst
- small Cortex Search and Cortex Agents boundaries
- dbt transformation and testing intent
- Streamlit work surface
- trace, golden eval, error taxonomy, version registry, and human review
- progress/readiness metadata that says what is implemented, unimplemented, or
  unvalidated

Snowpark and Snowpark Container Services do not need to block beginner-stage
completion, but they should be carried forward as active next-stage learning
candidates. Omitting them from the beginner mainline must not be interpreted as
avoiding or de-prioritizing them.

## Intermediate And Later Stages

Snowpark / SPCS should be actively evaluated in intermediate or advanced
architecture work, especially when the learning target includes:

- complex Python-oriented preprocessing that is awkward in SQL/dbt alone
- reusable Python UDFs, UDTFs, or stored procedures inside Snowflake
- in-Snowflake eval runners, trace enrichment, or data-quality jobs
- ML feature engineering, training, inference, or model registry workflows
- containerized services such as Airflow, JupyterLab, MLflow, custom APIs, or
  long-running jobs inside the Snowflake boundary
- GPU or custom runtime needs that exceed Cortex/dbt/Streamlit alone

The default stance is: do not assume Snowpark/SPCS is used in every workflow,
but intentionally look for the next architecture exercise where it can carry a
real responsibility. Promote it into the diagram when it clarifies the design,
for example around Snowflake-side Python, ML, eval automation, trace enrichment,
or containerized services.

## Project Split Decision

Whether intermediate work should evolve this repository or become a separate
project is intentionally unresolved.

Use this repository when the work is still about:

- diagram reproduction and architecture learning metadata
- comparing target architecture options
- documenting readiness, evidence, and decision rationale
- keeping a public Pages surface for review

Prefer a separate implementation or intermediate-stage project when the work
becomes:

- Snowpark/SPCS runtime construction
- non-trivial Snowflake account objects, services, jobs, compute pools, or
  cost-bearing infrastructure
- answer-quality experiments that need repeated live execution
- pipeline behavior, UI E2E, CI/CD, deployment, or operational guardrails

Before starting intermediate work, run a design review on whether to expand the
current diagram repo or create a new repo with this one as the public learning
map.
