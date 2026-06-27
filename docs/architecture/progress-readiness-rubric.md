# Progress Readiness Rubric

The architecture diagram progress percentage is not a pure implementation
counter. It represents quality-confirmed readiness: implementation, automated
tests, answer-quality checks, integration proof, and operational confidence.

## General Scale

| Range | Meaning | Typical evidence |
| --- | --- | --- |
| 0% | Not implemented | Diagram-only or future scope |
| 5-10% | Design or placeholder only | Docs, labels, planned component, or schema idea |
| 15-25% | Partial implementation without meaningful tests | SQL/script/config exists, but no automated proof for the node |
| 30% | Implementation appears complete, but is untested | Code path exists, no automated tests; this is the normal cap for untested implementation |
| 35-45% | Narrow automated tests exist | Unit tests, local explicit harness, or limited failure-path tests |
| 50-60% | Bounded integration quality is checked | Meaningful integration tests, trace tests, local end-to-end path, or visible fail-fast behavior |
| 65-75% | Live/cloud path plus regression checks are confirmed | Live Snowflake/Cortex or public delivery plus repeatable tests for the bounded scenario |
| 80-90% | MVP release-quality readiness | Answer-quality eval, SQL/result correctness, UI E2E, role/error paths, and CI gates |
| 95-100% | Production-grade confidence | Monitored production-like runs, regression thresholds, security/cost guardrails, and recovery paths |

## Caps

- If a node is implemented but has no automated tests, cap it at 30%.
- If evidence is manual-only, cap it at 30% even when the component appears to
  work in one local or live run.
- If a node has local/unit tests but no integration or answer-quality checks,
  cap it around 45%.
- If evaluation checks only route and metric classification, cap `Golden Eval`
  around 40% and cap the `Agent Router` around 50%.
- If a user-facing answer path lacks answer-quality evaluation, UI E2E, and
  role/failure-path coverage, keep it below 50%.
- If a data/semantic node lacks SQL/result correctness checks against expected
  outputs, keep it below 50% even when objects or YAML exist.
- If a cloud/vendor component is only represented by a local substitute or
  design decision, keep it below 30% for that vendor node.
- Evidence from a substitute, bypass, proxy dataset, or adjacent workaround
  cannot raise the actual target component's readiness. For example, direct mart
  SQL does not raise `STAGE / RAW`, and pytest routing checks do not raise
  `dbt tests`.
- If a downstream UI or agent can answer through a bypass path while upstream
  pipeline nodes are 0%, name the actual read path in the tooltip. Do not let a
  working chat UI imply that dbt, STAGE / RAW, Cortex Analyst, or Cortex Search
  is being used.
- Before raising any external-data-source or KPI node based on a sample dataset,
  update `docs/architecture/sample-data-coverage-matrix.md` and verify that the
  sample actually contains the needed grain, entities, and labels. Similar
  names are not enough; discount is not a promotion calendar, and supply
  availability is not store inventory.
- For sequential pipeline nodes, do not score a downstream node above an
  upstream prerequisite when the downstream readiness depends on that upstream
  flow. For example, `dbt marts` should not be above `dbt staging` when the dbt
  staging layer itself is not implemented.
- Use `data-progress-tier="high"` only when the node has both implemented
  behavior and repeatable quality evidence.

## Current Evidence Baseline

- `pytest -q`: 8 tests pass for router, planner, trace JSONL, Snowflake
  credential fail-fast, local explicit execution, and Obsidian sync.
- `python -m retail_ai_ops.eval_runner`: 10/10 routing cases pass.
- The current golden eval checks route and metric classification only; it does
  not yet prove answer quality, SQL result correctness, grounding, UI E2E, or
  role-specific behavior.

## Repo Boundary

This rubric lives in the diagram reproduction repo because it controls what the
public architecture diagram displays. However, the tests and workflow
improvements that raise a node's score should normally be implemented in the
pipeline implementation repo, not here.

Use this repo to visualize readiness and document evidence. When a node needs
answer-quality tests, UI E2E, role/failure-path coverage, Snowflake/Cortex
integration tests, or workflow changes, hand that task back to the
implementation repo. After the implementation repo produces evidence, update
this repo's tooltip and score.
