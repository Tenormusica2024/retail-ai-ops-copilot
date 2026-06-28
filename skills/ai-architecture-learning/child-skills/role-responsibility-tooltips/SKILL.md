---
name: ai-architecture-learning-role-responsibility-tooltips
description: >-
  Child skill for editing AI architecture learning hover cards and role
  responsibility text. Use when PM, DE, DS, AI engineer, or PG ownership
  boundaries could be ambiguous.
---

# Role Responsibility Tooltips

Use this child skill when editing hover-card text, role chips, nested role
details, or any diagram learning copy that explains who owns which part of the
architecture.

## Ownership Boundary

Do not describe role responsibility as if one role owns the whole concept.
Separate domain definition, data definition, AI behavior, implementation
feasibility, and governance.

- PM / business owns business intent, KPI priority, decision context, user
  workflow, and approval policy.
- DS owns metric meaning, statistical/analytical validity, expected answer
  behavior, and eval-case business correctness with PM.
- DE owns source data, schemas, transformations, data quality, lineage, marts,
  ingestion, and data access surfaces.
- AI engineer owns LLM/Cortex/agent behavior: grounding, retrieval design,
  semantic-model usage, prompt/tool routing, eval hooks, trace design, error
  taxonomy, safe-stop behavior, and human-review handoff.
- PG owns implementation feasibility at design time: UI/API constraints,
  runtime ergonomics, integration shape, CI practicality, and operational
  impact. Do not present PG percentages as coding allocation.
- Security, platform, and FinOps ownership should be named in the detail text
  when RBAC, service privileges, budget limits, alerts, CI infrastructure, or
  runtime guardrails are involved. Do not squeeze these policy owners into AI
  engineer responsibility.

## KPI And Search Wording

For KPI-related nodes, never write that the AI engineer owns KPI definition by
itself.

Preferred shape:

> PM/業務とDSがKPIの意味・計算式を主定義し、AIエンジニアはそれを検索・引用・grounding・評価に使える形へ接続する

For Cortex Search:

- PM/business and DS own the content of KPI definitions, weekly reports, and
  business notes.
- AI engineer owns search readiness: corpus boundaries, chunking, metadata,
  `search_column`, attributes/filters, service privileges, retrieval query
  shape, citation granularity, grounding controls, fallback or safe-stop
  behavior, and what context may be mixed into an answer.

For Cortex Analyst / Semantic Model:

- PM/business and DS own KPI meaning, expected answer behavior, and business
  validity.
- DE owns source tables, joins, grain, dimensions, and data correctness.
- AI engineer connects the agreed definitions into semantic view/model or YAML
  representation, verified query coverage, synonym/forbidden-interpretation
  handling, warnings/suggestions handling, safe-stop behavior, and regression
  evals.

For Cortex Agents:

- Treat Snowflake Cortex Agents as a managed platform. Do not imply that the AI
  engineer builds the whole orchestration runtime, state engine, or sandbox.
- AI engineer owns tool definitions, orchestration/response instructions,
  budget constraints, approval branches, stop conditions, evaluation coverage,
  and trace requirements.
- If the repo also has a custom Router or Planner, describe it as an MVP or
  app-side complement, not as the same responsibility as operating Cortex
  Agents internals.

## Tooltip Detail Rules

- Prefer explicit responsibility boundaries over short but ambiguous labels.
- A role-detail panel may be longer than the parent tooltip when it materially
  improves learning value.
- Every AI engineer detail should name at least one concrete artifact,
  configuration, or verification output, such as semantic view/YAML, verified
  query, eval case, trace field, safe-stop rule, handoff state, warning
  condition, or CI gate input. Do not end at generic "設計レビュー" wording
  unless the object being reviewed is explicit.
- When role details become longer, the tooltip must expand or wrap to contain
  the text. Do not let detail text overflow outside the card just to preserve a
  compact tooltip.
- Text should say "AIエンジニアは..." only for AI behavior, grounding, eval,
  trace, routing, or handoff responsibilities.
- When mentioning KPI, data, RBAC, cost, or UI, name the neighboring owner when
  helpful: PM/業務, DS, DE, PG, security, or platform.
- Avoid private employment-prep wording or company-internal assumptions in
  public HTML.

## Layout Guardrails

- The role-chip grid should use shrinkable columns or an equivalent responsive
  layout so longer Japanese role text does not force the tooltip past the page
  edge.
- Detail panels should size to the available tooltip width, not to unconstrained
  max-content text width.
- For nodes near the bottom edge, open the tooltip upward or otherwise keep the
  full card inside the diagram page.
- Hover bridge elements that keep node-to-card movement stable must not create
  false overflow in browser geometry checks. If a top-opening tooltip uses a
  bridge pseudo-element, disable or reposition it so measured tooltip bounds
  still fit the page.

## Verification

After editing tooltip text:

- verify every progress node still has one tooltip, one role section, one
  AI-engineer trigger, and one AI detail panel
- verify every progress node has explicit `roleSplits` and
  `aiEngineerDetails`; generic fallback text should fail review or be visibly
  marked as missing metadata
- move the pointer from node to tooltip and confirm the tooltip remains open
- hover/focus the AI engineer chip and confirm the nested detail opens
- check parent tooltip and nested detail overflow
- check tooltip edge overflow for bottom and side nodes after opening the nested
  detail
- inspect at least one rendered screenshot of a longer detail panel
