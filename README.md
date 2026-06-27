# retail-ai-ops-copilot

Snowflake-native retail KPI copilot for learning and demonstrating LLMOps and
AI architecture patterns.

The project focuses on a governed KPI copilot, not on a full data engineering platform. It assumes curated retail KPI marts from DE/DS-owned pipelines and implements the AI architecture layer around semantic metrics, tool routing, traces, evaluations, fallback states, human review, and small executable boundary tests.

## Current Direction

- Domain: retail and distribution operations
- Core flow: natural-language KPI question -> semantic KPI layer -> Cortex Analyst -> validated answer -> trace/eval log
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

## Public Preview

- GitHub Pages: https://tenormusica2024.github.io/retail-ai-ops-copilot/
- Architecture HTML: `docs/architecture/retail-ai-ops-copilot-architecture.html`

## Primary References

- Snowflake Cortex Analyst docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst
- Snowflake Cortex Agents docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents
- Snowflake Cortex Search docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-overview
- dbt documentation: https://docs.getdbt.com/docs/introduction
