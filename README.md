# retail-ai-ops-copilot

Public architecture-diagram reproduction and learning surface for a
Snowflake-native retail KPI copilot.

This repository's primary role is to reproduce the system architecture diagram
as high-fidelity HTML, publish it with GitHub Pages, and keep the learning
metadata around each architecture node explicit. It may contain a small
reference MVP so the diagram's progress labels are grounded, but the full
Snowflake/Streamlit/LLMOps pipeline implementation belongs in the implementation
repo.

See `docs/architecture/repo-responsibility-boundary.md` for the repo split.

## Current Direction

- Domain: retail and distribution operations
- Core flow: natural-language KPI question -> semantic KPI layer -> Cortex Analyst -> validated answer -> trace/eval log
- Data source: Snowflake sample/Tasty Bytes first; TPCH_SF1 is the low-cost secondary dataset when Tasty Bytes is not loaded
- Optional slice: Cortex Search for KPI definitions and weekly-report notes
- UI: Streamlit work surface with chat, context, route/tool trace, SQL/result preview, citations, and approval queue
- Learning focus: LLMOps, agent state, tool routing, regression evaluation, observability, and human-reviewable improvement loops
- Repo boundary: diagram/progress visualization stays here; concrete tests,
  workflow changes, and runtime quality improvements move back to the
  implementation repo before this diagram claims higher readiness.

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

## Public Preview

- GitHub Pages: https://tenormusica2024.github.io/retail-ai-ops-copilot/
- Architecture HTML: `docs/architecture/retail-ai-ops-copilot-architecture.html`
- Future edge-contract path generation: `docs/architecture/edge-contract-path-generation.md`
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
node tools/check_diagram_connectors.mjs
```

The lint writes:

- `outputs/diagram-connector-geometry-report.json`
- `outputs/diagram-connector-geometry-check.png`

If Playwright is provided by the Codex runtime instead of repo-local
dependencies, run:

```bash
NODE_PATH=/Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tools/check_diagram_connectors.mjs
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
- dbt documentation: https://docs.getdbt.com/docs/introduction
