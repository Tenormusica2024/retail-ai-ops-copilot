# Learning Stage Strategy

This project started as the beginner-stage learning surface for a
Snowflake-native retail KPI copilot. Because the learning window is short, the
project should not optimize for the smallest safe demo. It should establish the
core AI architecture and LLMOps mental model quickly, then deliberately absorb
harder intermediate architecture topics when they increase learning density.

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

## Learning Efficiency Bias

The default bias is learning efficiency over minimalism. It is acceptable for
this project to become more complex than a normal beginner demo when the added
component teaches a realistic architecture decision.

Complexity is acceptable while the project can still answer:

- which layer owns the behavior: data, dbt, semantic model, search, agent
  routing, eval, trace, UI, or governance
- which test or evidence would prove that layer is working
- where answer quality degraded when a result gets worse
- whether the degradation came from implementation, source data, prompt,
  semantic contract, retrieval, routing, or evaluation design

If quality degradation becomes hard to localize, pause the expansion and
consider simplifying the feature, splitting the experiment, or moving the
runtime-heavy part into a separate project. Simplification is a debugging and
learning-control tool, not the default architecture goal.

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

For the current architecture map, the first promotion step is Snowpark
Python/UDF/SP inside the Snowflake Account boundary. Treat it as the execution
surface for dbt Python models, UDF/SP reusable logic, Cortex Agents custom tool
logic, eval runners, and trace enrichment. Keep SPCS as a separate expansion
candidate until the design needs containerized Airflow, JupyterLab, MLflow,
custom APIs, long-running jobs, or compute-pool/service/job-service concepts.

## Project Split Decision

The default next step is to evolve this repository's architecture map toward the
intermediate design so the learning context remains continuous. A separate
project is still valid when runtime cost, implementation weight, or quality
attribution risk makes the current repo a poor control surface.

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
