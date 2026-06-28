# AGENTS.md

## Project Contract

This repository is primarily the architecture-diagram reproduction and public
learning surface for `retail-ai-ops-copilot`, a Snowflake-native retail KPI
copilot.

The project premise is target-company realistic architecture learning. Preserve
the intended architecture and technology-selection surface even when the
reference MVP uses a narrower shortcut. For example, do not replace a planned
dbt transformation flow with direct SQL labels just because the current sample
path has not implemented dbt yet. Put that implementation gap in readiness,
status, notes, or evidence docs.

The main objective is to learn and demonstrate a practical AI architecture /
LLMOps engineering scope:

- semantic KPI access for LLMs
- agent state and tool routing
- Cortex Analyst / Cortex Search / Cortex Agents boundaries
- evaluation and regression testing
- traceability and observability
- human review and approval gates
- lightweight governance and cost guardrails

Do not let this repo drift into the full pipeline implementation. It may contain
small reference MVP code and smoke tests to ground diagram progress, but
concrete answer-quality tests, UI E2E, workflow improvements, Snowflake/Cortex
runtime behavior, CI/CD, and production-like integration work belong in the
implementation repo. After that repo produces evidence, update this repo's
diagram and progress-readiness labels.

See `docs/architecture/repo-responsibility-boundary.md`.

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

Must include in this repo as diagram, docs, rubric, or evidence references:

- high-fidelity architecture HTML reproduction
- diagram assets, progress overlays, readiness rubric, and public Pages preview
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

- full pipeline implementation beyond reference MVP/smoke evidence
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

The main agent owns final artifact, ledger, and skill edits. Use reviewer
sub-agents as read-only independent reviewers with an explicit context pack; do
not assume they share the full session context. See
`.agent-feedback/REVIEWER_SUBAGENT_DESIGN.md`.

When the objective is to verify real sub-agent firing, record agent id,
nickname, prompt summary, lane classification, canonical status tuple, verdict,
main-agent action, final artifact status, invocation row, and substitution
reason when applicable in `.agent-feedback/SUBAGENT_INVOCATIONS.md`.
Main-context-only completion is not a PASS for real-subagent E2E while
sub-agent tooling is available.
<!-- agent-feedback-ledger-project:end -->
