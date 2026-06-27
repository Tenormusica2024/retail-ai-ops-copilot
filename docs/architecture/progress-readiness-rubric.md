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
- Use `data-progress-tier="high"` only when the node has both implemented
  behavior and repeatable quality evidence.

## Current Evidence Baseline

- `pytest -q`: 8 tests pass for router, planner, trace JSONL, Snowflake
  credential fail-fast, local explicit execution, and Obsidian sync.
- `python -m retail_ai_ops.eval_runner`: 10/10 routing cases pass.
- The current golden eval checks route and metric classification only; it does
  not yet prove answer quality, SQL result correctness, grounding, UI E2E, or
  role-specific behavior.
