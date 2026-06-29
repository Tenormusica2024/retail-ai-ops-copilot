# retail-ai-ops-copilot

Public architecture-diagram reproduction and learning surface for a
Snowflake-native retail KPI copilot.

This repository's primary role is to reproduce the system architecture diagram
as high-fidelity HTML, publish it with GitHub Pages, and keep the learning
metadata around each architecture node explicit. It may contain a small
reference MVP so the diagram's progress labels are grounded, but the full
Snowflake/Streamlit/LLMOps pipeline implementation belongs in the implementation
repo.

This repository is also a practice ground for controlling complex architecture
work with AI. The goal is not only to learn Snowflake, dbt, Cortex, or LLMOps in
isolation, but to learn how AI agents, feedback ledgers, diagram linting, CI
gates, readiness rubrics, and source-backed documentation can keep a complex
design inspectable, steerable, and closer to professional delivery quality.
Architecture expansion should therefore include control mechanisms, evidence,
and review loops, not just more components.

Review workflows and skills created here should also be designed for future
reuse in professional client-delivery work. Keep project-specific context
separate from reusable quality-assurance patterns such as code review checklists,
feedback routing, evidence requirements, CI/lint gates, and reviewer-agent
contracts. When a pattern proves useful here, shape it so it can later become a
generic skill without private, employer-specific, or one-off project wording.

The project premise is delivery-realistic architecture learning: use this
repo to study and validate practical AI/LLMOps technology choices under
conditions close to real delivery before moving implementation work forward.
Reference MVP shortcuts must not erase intended architecture identities such as
dbt, Cortex, semantic modeling, evaluation, traceability, or human review.
Represent gaps as readiness/status/notes instead.

This repo started as the beginner-stage learning surface, but the learning
window is short, so do not optimize for the smallest safe demo. Prefer learning
density: once the core Cortex/dbt/Streamlit/LLMOps relationships are clear, it
is acceptable to evolve this same project toward intermediate architecture.
In this project, the assistant should actively counter the usual engineering
habit of defaulting to the smallest conservative implementation. Use minimum
scope to gain control and evidence, then look for the next realistic learning
step.
When a minimal slice becomes stable enough to localize failures, the expected
next move is to propose a concrete expansion path rather than remain at the
smallest working scope. Candidate expansions include deeper dbt modeling/tests,
semantic/eval hardening, Snowpark execution, trace analysis, or richer human
review loops.
Snowpark and Snowpark Container Services are active intermediate/advanced
learning candidates. Do not assume they are used in every workflow, but also do
not treat them as distant or low-priority topics; intentionally evaluate them
next when Snowflake-side Python, ML, eval-runner, custom service, or container
responsibility appears.

See `docs/architecture/repo-responsibility-boundary.md` for the repo split.
See `docs/architecture/learning-stage-strategy.md` for beginner/intermediate
scope decisions.

## Current Direction

- Domain: retail and distribution operations
- Core flow: natural-language KPI question -> semantic KPI layer -> Cortex Analyst -> validated answer -> trace/eval log
- Current implementation source: `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`; Tasty Bytes, Kaggle, or richer retail samples are later expansion candidates when inventory, promotion, store-level, or memo/search coverage becomes the active learning target
- Optional slice: Cortex Search for KPI definitions and weekly-report notes
- UI: Streamlit work surface with chat, context, route/tool trace, SQL/result preview, citations, and approval queue
- Learning focus: LLMOps, agent state, tool routing, regression evaluation, observability, and human-reviewable improvement loops
- Quality-control focus: use AI agents, feedback routing, lint/CI gates,
  readiness evidence, and review loops to manage complex architecture without
  losing traceability or professional-quality discipline.
- Repo boundary: diagram/progress visualization stays here; concrete tests,
  workflow changes, and runtime quality improvements move back to the
  implementation repo before this diagram claims higher readiness.
- Learning stage: beginner scope should finish quickly; intermediate work may
  add Snowpark/SPCS as an active learning target in this same project when it
  improves learning density. After a baseline is stable, proactively propose
  the next high-learning expansion instead of leaving the project at minimum
  scope. Split out only when runtime cost, implementation weight, or
  answer-quality attribution becomes hard to control.

## Documentation

Obsidian can be used as the working design surface. The repo mirror is:

`docs/obsidian/`

Keep the two in sync by setting `RETAIL_AI_OPS_OBSIDIAN_DIR` or passing
`--obsidian-dir`:

```bash
python3 tools/sync_obsidian_docs.py --direction check
python3 tools/sync_obsidian_docs.py --direction obsidian-to-repo
python3 tools/sync_obsidian_docs.py --direction repo-to-obsidian
```

## Implementation Repo Evidence Target

The first useful proof for the implementation repo is:

> Can we safely change the semantic model, prompt, or agent routing and know whether KPI answers got better or worse?

Concrete tests, runtime workflow changes, and quality improvements for that
proof belong in the implementation repo. This repo visualizes the target
architecture and reflects evidence after it exists.

That means the implementation repo should prioritize:

- golden KPI evaluation cases
- trace capture
- prompt/model/semantic-model version registry
- error taxonomy
- role-aware result boundaries
- small cost guardrails
- human review loop for failed or low-confidence answers

## Runtime Modes

The app must not silently switch to local execution when Snowflake is unavailable.

- `RETAIL_AI_OPS_RUNTIME=snowflake`: live Snowflake mode. Missing credentials or failed queries surface as errors.
- `RETAIL_AI_OPS_RUNTIME=local_explicit_test`: explicit local test mode for router, trace, and eval development only.

Local mode is not a substitute for Snowflake/Cortex validation; it is a bounded
test harness so the LLMOps loop can be developed before each paid/live run.

## Run The Reference MVP

This repo contains a small reference MVP and smoke-test harness so architecture
progress labels are not purely theoretical. Treat these commands as reference
evidence for the diagram, not as the main pipeline implementation lane.

Install runtime dependencies when you want to inspect the reference
Streamlit/Snowflake path:

```bash
python3 -m pip install -r requirements.txt
```

Create the mart in Snowflake by running:

```sql
-- Snowsight worksheet
sql/00_setup_from_snowflake_sample.sql
```

Run local explicit test mode:

```bash
RETAIL_AI_OPS_RUNTIME=local_explicit_test streamlit run streamlit_app/app.py
```

Run Snowflake live mode:

```bash
export SNOWFLAKE_ACCOUNT="<account_identifier>"
export SNOWFLAKE_USER="<username>"
export SNOWFLAKE_PASSWORD="<password>"
export SNOWFLAKE_ROLE="ACCOUNTADMIN"
export SNOWFLAKE_WAREHOUSE="RETAIL_AI_OPS_XS"
export SNOWFLAKE_DATABASE="RETAIL_AI_OPS"
export SNOWFLAKE_SCHEMA="MART"
RETAIL_AI_OPS_RUNTIME=snowflake streamlit run streamlit_app/app.py
```

Run deterministic golden eval:

```bash
python3 -m retail_ai_ops.eval_runner
```

## Run dbt Scaffold Checks

The dbt scaffold is the `RAIOPS-3` source-to-mart contract. Install dbt
dependencies separately from the lightweight reference MVP. Use Python 3.12 for
local dbt checks until the dbt dependency stack is verified on Python 3.14:

```bash
python3.12 -m venv /tmp/retail-ai-ops-dbt-venv
/tmp/retail-ai-ops-dbt-venv/bin/python -m pip install -r requirements-dbt.txt
```

Create a local uncommitted profile from the example, or point dbt at a temporary
profiles directory:

```bash
cp dbt/profiles.example.yml dbt/profiles.yml
```

Credentials-free checks should be reported as parse/compile evidence only:

```bash
/tmp/retail-ai-ops-dbt-venv/bin/dbt parse \
  --project-dir dbt \
  --profiles-dir dbt \
  --warn-error
/tmp/retail-ai-ops-dbt-venv/bin/dbt compile \
  --project-dir dbt \
  --profiles-dir dbt \
  --no-populate-cache \
  --no-introspect \
  --empty
```

Run live build only when Snowflake credentials are intentionally available:

```bash
dbt build --project-dir dbt --profiles-dir dbt --select tag:llm_contract+
```

## Public Preview

- GitHub Pages: https://tenormusica2024.github.io/retail-ai-ops-copilot/
- Architecture HTML: `docs/architecture/retail-ai-ops-copilot-architecture.html`
- Future edge-contract path generation: `docs/architecture/edge-contract-path-generation.md`
- Learning stage strategy: `docs/architecture/learning-stage-strategy.md`
- Snowpark integration design: `docs/architecture/snowpark-integration-design.md`
- dbt / Snowpark design: `docs/architecture/dbt-snowpark-design.md`
- RAIOPS-4 dbt test readiness gate: `docs/architecture/raiops-4-dbt-test-readiness-gate.md`
- Progress readiness rubric: `docs/architecture/progress-readiness-rubric.md`
- Sample data coverage matrix: `docs/architecture/sample-data-coverage-matrix.md`
- Repo responsibility boundary: `docs/architecture/repo-responsibility-boundary.md`

## Diagram Quality Checks

Run the connector geometry lint before asking for visual review after editing
the architecture HTML. It renders the diagram, checks both start and end
endpoints for every SVG connector, and samples the full path to detect service
card body intersections, missing `data-edge` ids, and missing bidirectional
arrow markers.

```bash
node tools/check_diagram_quality.mjs
```

The all-check wrapper runs the required diagram linters for correlation-arrow
review:

- `tools/check_diagram_connectors.mjs`
- `tools/check_diagram_text_layout.mjs`

GitHub Actions also runs the same wrapper with `--no-screenshot` on pushes and
pull requests that touch the architecture diagram, diagram lint scripts,
workflow file, README, AGENTS, or feedback rules. Treat CI as a required
backstop after fixes; local runs are still required when you need screenshots,
reports, or fast iteration before HITL review.

Run individual checks when you need their specific report paths or thresholds:

```bash
node tools/check_diagram_connectors.mjs
node tools/check_diagram_text_layout.mjs
```

The connector lint writes:

- `outputs/diagram-connector-geometry-report.json`
- `outputs/diagram-connector-geometry-check.png`

The text-layout lint renders the same diagram and fails on text overflow,
text escaping a parent card/frame, or text-bearing labels overlapping each
other. It writes:

- `outputs/diagram-text-layout-report.json`
- `outputs/diagram-text-layout-check.png`

## Feedback Reflection Checks

Run the feedback reflection lint after editing `.agent-feedback/`, project
rules, or repo-local skills:

```bash
node tools/check_feedback_reflection.mjs
```

This is the repo-local CI-safe check. It verifies the project ledger, local
rules, and repo-local skills. GitHub Actions cannot inspect installed user
skills under `/Users/.../.codex`, so installed global skill checks are a local
verification step:

```bash
node tools/check_feedback_reflection.mjs \
  --global-ledger-skill "$HOME/.codex/skills/agent-feedback-ledger/SKILL.md" \
  --global-review-skill "$HOME/.codex/skills/agent-feedback-ledger-review/SKILL.md"
```

The lint cannot decide the semantic question of whether a user sentence is
reusable feedback. That trigger decision is still owned by the feedback-ledger
workflow. The lint does catch structural defects after the decision: duplicate
ledger ids, malformed ledger rows, new reflected rows without `target_scope` or
`trigger_decision`, missing referenced skill files, child skills not listed by
their parent, child-specific improvements without routing evidence, and missing
project gates for trigger decisions or child-skill creation.

If this command passes but a feedback item still did not trigger reflection,
the remaining issue is a weak trigger condition. Strengthen the global/project
feedback-ledger trigger rules instead of only adding more routing checks.

For Backlog ticket creation, updates, reviews, or repo synchronization, load the
project-local child skill before writing ticket text:
`skills/ai-architecture-learning/child-skills/backlog-ticketing/SKILL.md`.

Before splitting implementation across parallel Codex sessions, use
`docs/project-management/parallel-session-implementation-plan.md`. Parallel
work should start from design-fixed Backlog lanes with explicit acceptance
criteria, allowed files, blocked shared files, and verification commands.

For diagram checks, if Playwright is provided by the Codex runtime instead of
repo-local dependencies, run:

```bash
NODE_PATH=/Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tools/check_diagram_quality.mjs
NODE_PATH=/Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tools/check_diagram_connectors.mjs
NODE_PATH=/Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tools/check_diagram_text_layout.mjs
```

## Future Edge Contract Generation

For new 0-to-1 imagegen architecture/system-diagram reproductions, and for
future layout-affecting diagram changes such as node moves, frame moves, card
resizing, or connector rerouting, prefer an edge-contract workflow instead of
hand-writing fixed SVG path coordinates first. This belongs to this
visualization repository's diagram tooling; it does not change the
implementation pipeline or automatically migrate the current source-faithful
architecture HTML.

The intended workflow is:

- add stable `data-node-id` values to diagram nodes when the HTML is first built
- define edges with `from.node`, `from.anchor`, `to.node`, and `to.anchor`
- generate SVG `path d` values from rendered node rectangles
- after layout changes, regenerate affected contract-managed paths or document
  why a fixed-coordinate exception is still required
- run the connector geometry lint after generation, layout changes, or fixed
  coordinate exceptions

Demo:

```bash
node tools/generate_diagram_edges_from_contract.mjs \
  --html tools/fixtures/edge-contract-demo.html \
  --contract tools/fixtures/edge-contract-demo.json \
  --out outputs/edge-contract-demo-generated.json \
  --snippet outputs/edge-contract-demo-generated.svg.txt
```

Codex runtime Playwright:

```bash
NODE_PATH=/Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tools/generate_diagram_edges_from_contract.mjs \
  --html tools/fixtures/edge-contract-demo.html \
  --contract tools/fixtures/edge-contract-demo.json \
  --out outputs/edge-contract-demo-generated.json \
  --snippet outputs/edge-contract-demo-generated.svg.txt
```

The generator writes a report and SVG snippet only. It does not mutate the HTML.

## Primary References

- Snowflake Cortex Analyst docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst
- Snowflake Cortex Agents docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents
- Snowflake Cortex Search docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-overview
- Snowflake Snowpark Python + dbt quickstart: https://www.snowflake.com/en/developers/guides/data-engineering-with-snowpark-python-and-dbt/
- Snowflake Python stored procedures docs: https://docs.snowflake.com/en/developer-guide/stored-procedure/python/procedure-python-overview
- Snowflake Snowpark Container Services docs: https://docs.snowflake.com/en/developer-guide/snowpark-container-services/working-with-compute-pool
- dbt documentation: https://docs.getdbt.com/docs/introduction
