# RAIOPS-2 / RAIOPS-12 Pre-Implementation Gate

Date: 2026-06-29

## Decision

`RAIOPS-2` and `RAIOPS-12` are sufficiently fixed to begin `RAIOPS-3`
dbt scaffold work, with constraints.

The next implementation must not be a small standalone dbt demo. It must carry
the AI answer-quality contract from the design docs into the first dbt project:
source boundaries, mart grain, reaggregation limits, tests, lineage, and future
Snowpark extension points.

## RAIOPS-2: TPCH_SF1 KPI Mart Contract

The current implementation data source remains
`SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`.

Tasty Bytes, Kaggle, TPCDS, or richer retail datasets stay as later expansion
candidates. They should be reconsidered when inventory, promotion, store-level
workflow, or memo/search coverage becomes the active learning target.

The first dbt mart is `mart_retail_monthly_kpi`.

Fixed grain:

- `month_start`
- `region_name`
- `nation_name`
- `category_name`

Values that can be aggregated upward:

- `item_quantity`
- `net_sales`
- `gross_margin`
- `supply_cost_amount`
- `discount_amount`
- `gross_sales`

Values that are fixed-grain only:

- `order_count`

Rules for higher-grain questions:

- Do not sum category-level `order_count` after dropping `category_name`.
- Compute higher-grain order counts from `int_order_line_enriched` with
  `count(distinct order_key)` at the requested grain, or add a dedicated
  higher-grain mart later.
- Do not average stored `gross_margin_rate` or `avg_discount`.
- Recompute `gross_margin_rate = gross_margin / net_sales`.
- Recompute `avg_discount = discount_amount / gross_sales`.

The Semantic Model must not treat `mart_retail_monthly_kpi` as a freely
rollup-safe universal table.

Golden Eval must include regression cases that catch:

- double-counted orders when category is removed
- averaged rates instead of numerator/denominator recomputation
- unsupported answers for inventory, promotion lift, same-store growth, or
  store-level questions that TPCH_SF1 cannot support

## RAIOPS-12: First Snowpark Responsibility

The first Snowpark responsibility is `eval / trace enrichment`.

This is a design decision, not immediate Snowpark coding. In `RAIOPS-3`, create
SQL dbt models first and leave Snowpark as an explicit extension point.

Accepted direction:

- SQL dbt owns source declaration, staging, intermediate joins, marts, tests,
  docs, and lineage.
- Snowpark does not replace SQL dbt for joins, casts, monthly aggregation, or
  simple KPI math.
- Snowpark can later own Python-oriented evaluation and trace enrichment, such
  as failure buckets, anomaly flags, human-review candidates, and error
  taxonomy inputs.
- A future implementation can compare dbt Python model, Stored Procedure, UDF,
  and defer/no-Snowpark options before coding.

Rejected for the first dbt scaffold:

- moving simple TPCH joins or monthly KPI aggregation into Snowpark
- adding SPCS as a mainline runtime node
- treating local Python as a silent fallback when Snowflake/Snowpark is not
  available

SPCS remains an active later-stage candidate for containerized services such as
Airflow, JupyterLab, MLflow, custom APIs, long-running jobs, or explicit
Compute Pool / Service / Job Service work.

## RAIOPS-3 Entry Conditions

`RAIOPS-3` may start when the scaffold preserves all of these:

- `dbt/` contains `dbt_project.yml` and `profiles.example.yml`.
- TPCH source tables are declared in dbt as read-only sample sources.
- staging models keep casts, naming, and LLM-safe field boundaries explicit.
- `int_order_line_enriched` keeps lineitem grain and prevents join fanout.
- `mart_retail_monthly_kpi` implements the fixed grain above.
- model docs explain fixed-grain and reaggregation limits.
- dbt tests include source/staging keys, mart grain uniqueness, non-negative
  sales, positive order count, and discount/rate validity checks.
- credentials-free validation uses parse/compile only and is not described as
  live Snowflake proof.
- live `dbt build` is reported separately when Snowflake credentials are
  available.
- diagram readiness for dbt stays evidence-based; scaffold creation alone does
  not raise readiness unless parse/compile/tests or live build proof exists.

## Evidence

Primary docs:

- `docs/architecture/dbt-snowpark-design.md`
- `docs/architecture/snowpark-integration-design.md`
- `docs/architecture/sample-data-coverage-matrix.md`
- `docs/project-management/backlog-ticket-bodies.md`

Current verification before this gate:

- `node tools/check_feedback_reflection.mjs --global-ledger-skill "$HOME/.codex/skills/agent-feedback-ledger/SKILL.md" --global-review-skill "$HOME/.codex/skills/agent-feedback-ledger-review/SKILL.md"`: PASS
- `python3 tools/sync_obsidian_docs.py --direction check`: `obsidian_sync=ok`
- `NODE_PATH=... node tools/check_diagram_quality.mjs --no-screenshot`: PASS
- `.venv/bin/python -m pytest -q`: 8 passed
- `python3 -m retail_ai_ops.eval_runner`: 10/10 passed

## RAIOPS-3 Verification Update

`RAIOPS-3` scaffold has now been created under `dbt/`.

Credentials-free validation was run on 2026-06-29 with a temporary profiles
directory and dummy Snowflake environment variables. This is parse/compile
evidence only, not live Snowflake proof.

Verified:

- `dbt/` contains `dbt_project.yml` and `profiles.example.yml`.
- TPCH source, staging, intermediate, mart, seed, docs, and data tests are
  represented in the scaffold.
- `dbt parse --project-dir dbt --profiles-dir /tmp/retail-ai-ops-dbt-profiles`
  passed with `dbt=1.11.11` and `dbt-snowflake=1.11.6`.
- `dbt compile --project-dir dbt --profiles-dir /tmp/retail-ai-ops-dbt-profiles --no-populate-cache --no-introspect --empty`
  passed with 9 models, 1 seed, 97 data tests, 7 sources, and 542 macros.

This verification is enough to treat the scaffold as syntactically ready for
the next `RAIOPS-4` test/readiness gate, but it must not be reported as a
successful `dbt build`.

## Remaining Open Items

- Actual Backlog description/comment synchronization has not been verified.
- live `dbt build` has not been run.
- Snowflake live data tests have not been run.
- Snowflake/Cortex live trace evidence has not been collected in this gate.
