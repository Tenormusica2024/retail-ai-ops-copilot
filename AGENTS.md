# AGENTS.md

## Project Contract

This repository is a learning and implementation workspace for `retail-ai-ops-copilot`, a Snowflake-native retail KPI copilot.

The main objective is to learn and demonstrate a practical AI architecture /
LLMOps engineering scope:

- semantic KPI access for LLMs
- agent state and tool routing
- Cortex Analyst / Cortex Search / Cortex Agents boundaries
- evaluation and regression testing
- traceability and observability
- human review and approval gates
- lightweight governance and cost guardrails

Do not let the project drift into a full data engineering, forecasting, IAM, or FinOps platform.

## Documentation Sync

Obsidian can be used as the working design surface. Repo mirror:

`docs/obsidian/`

Before reporting documentation work as complete, run this against the repo
mirror or set `RETAIL_AI_OPS_OBSIDIAN_DIR` for an external Obsidian workspace:

```bash
python3 tools/sync_obsidian_docs.py --direction check
```

If Obsidian changed, sync to repo:

```bash
python3 tools/sync_obsidian_docs.py --direction obsidian-to-repo
```

If repo docs changed first, sync to Obsidian:

```bash
python3 tools/sync_obsidian_docs.py --direction repo-to-obsidian
```

## Scope Boundaries

Must include:

- data contracts and KPI definitions
- semantic model and verified query strategy
- golden evaluation cases
- trace schema and error taxonomy
- agent state, routing, fallback, and approval behavior
- basic RBAC test paths
- cost-relevant metadata logging

Light touch only:

- raw data cleanup
- enterprise IAM/SSO
- deep row-level security
- Snowflake spend automation
- forecasting model optimization
- full RAG knowledge-base engineering

Defer:

- production deployment
- real autonomous write actions
- multi-model routing
- fine-tuning
- large-scale ingestion

## Safety

- Do not commit secrets, tokens, OAuth URLs, one-time codes, Snowflake credentials, or private customer data.
- Use local `.env` files only with `.gitignore` coverage.
- Treat all external source claims as source-backed or explicitly marked as inference.
- Keep public-facing wording vendor-neutral and avoid private employment,
  customer, or confidential framing.

<!-- agent-feedback-ledger-project:start -->
## Agent Feedback Ledger

This project uses trigger-first feedback reflection. For details, read
`.agent-feedback/AGENTS_SNIPPET.md`.

During project work, user/HITL feedback, reviewer findings, and validated
improvement methods are mandatory triggers. Capture first, then classify as
`要望`, `指摘`, and/or `改善`.

Run one feedback reflection lane per trigger batch. If a domain-specific
feedback skill also applies, use it as context or as the update target for the
single lane instead of spawning duplicate ledger sub-agents.

When the objective is to verify real sub-agent firing, record agent id,
nickname, prompt summary, verdict, and main-agent action in
`.agent-feedback/SUBAGENT_INVOCATIONS.md`. Main-context-only completion is not a
PASS for real-subagent E2E while sub-agent tooling is available.
<!-- agent-feedback-ledger-project:end -->
