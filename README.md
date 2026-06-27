# retail-ai-ops-copilot

Snowflake-native retail KPI copilot for learning and demonstrating LLMOps and
AI architecture patterns.

The project focuses on a governed KPI copilot, not on a full data engineering platform. It assumes curated retail KPI marts from DE/DS-owned pipelines and implements the AI architecture layer around semantic metrics, tool routing, traces, evaluations, safe-stop states, human review, and small executable boundary tests.

## Current Direction

- Domain: retail and distribution operations
- Core flow: natural-language KPI question -> semantic KPI layer -> Cortex Analyst -> validated answer -> trace/eval log
- Data source: Snowflake sample/Tasty Bytes first; TPCH_SF1 is the low-cost secondary dataset when Tasty Bytes is not loaded
- Optional slice: Cortex Search for KPI definitions and weekly-report notes
- UI: Streamlit work surface with chat, context, route/tool trace, SQL/result preview, citations, and approval queue
- Learning focus: LLMOps, agent state, tool routing, regression evaluation, observability, and human-reviewable improvement loops

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

## First Implementation Target

The first useful proof is:

> Can we safely change the semantic model, prompt, or agent routing and know whether KPI answers got better or worse?

That means the first build should prioritize:

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

## Run The MVP

Install runtime dependencies when you want the Streamlit/Snowflake path:

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
- Progress readiness rubric: `docs/architecture/progress-readiness-rubric.md`

## Primary References

- Snowflake Cortex Analyst docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst
- Snowflake Cortex Agents docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents
- Snowflake Cortex Search docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-overview
- dbt documentation: https://docs.getdbt.com/docs/introduction
