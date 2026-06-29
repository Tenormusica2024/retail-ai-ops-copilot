# Backlog Initial Ticket Map

作成日: 2026-06-28

Backlog project: https://raiops27.backlog.com/projects/RAIOPS

Detailed body source: `docs/project-management/backlog-ticket-bodies.md`

## Initial Tickets

| Key | Prefix | Title | Main Evidence Target |
| --- | --- | --- | --- |
| [RAIOPS-1](https://raiops27.backlog.com/view/RAIOPS-1) | Evidence/Docs | Backlog運用DoDと証跡テンプレートを定義する | `docs/project-management/backlog-workflow.md`, this map, Obsidian sync |
| [RAIOPS-2](https://raiops27.backlog.com/view/RAIOPS-2) | Design/ADR | TPCH_SF1小売KPI mart契約を固定する | `docs/architecture/dbt-snowpark-design.md`, `docs/architecture/raiops-2-12-preimplementation-gate.md` |
| [RAIOPS-3](https://raiops27.backlog.com/view/RAIOPS-3) | Build/dbt | TPCH source-to-mart の dbt scaffold を作る | `dbt/`, `dbt parse`, `dbt compile`, credentialed `dbt build` |
| [RAIOPS-4](https://raiops27.backlog.com/view/RAIOPS-4) | Eval/Test | dbt testsをsemantic/eval readiness gateにする | dbt test report, CI gate, readiness rule |
| [RAIOPS-5](https://raiops27.backlog.com/view/RAIOPS-5) | Build/Semantic | Semantic Model YAMLをdbt mart契約に合わせる | `semantic/retail_kpi_semantic_model.yaml`, KPI definition seed |
| [RAIOPS-6](https://raiops27.backlog.com/view/RAIOPS-6) | Eval/Test | Golden Evalを回答品質テストに拡張する | `data/golden_eval.json`, eval runner output |
| [RAIOPS-7](https://raiops27.backlog.com/view/RAIOPS-7) | Build/Cortex | Snowflake/Cortex live traceを5件残す | Trace records with route, SQL, result, answer, version, error category |
| [RAIOPS-8](https://raiops27.backlog.com/view/RAIOPS-8) | Build/Agent | ルーティング行列をstructured/search/mixed/unsupportedで実装する | planner/router tests, route matrix docs |
| [RAIOPS-9](https://raiops27.backlog.com/view/RAIOPS-9) | Governance/HITL | send/write要求を承認キューに止める | approval-required trace and UI review queue |
| [RAIOPS-10](https://raiops27.backlog.com/view/RAIOPS-10) | Build/Streamlit | Analyst review用のEvidence Workbenchを作る | Streamlit UI with answer, SQL, result, citation, trace, approval queue |
| [RAIOPS-11](https://raiops27.backlog.com/view/RAIOPS-11) | Eval/Test | 初期5シナリオのUI E2Eを追加する | Playwright trace/screenshots or equivalent UI evidence |
| [RAIOPS-12](https://raiops27.backlog.com/view/RAIOPS-12) | Spike/Snowpark | 最初のSnowpark責務をeval/trace enrichmentで決める | `docs/architecture/snowpark-integration-design.md`, `docs/architecture/raiops-2-12-preimplementation-gate.md` |
| [RAIOPS-13](https://raiops27.backlog.com/view/RAIOPS-13) | Governance | RBACとコストガードレールの基本証跡を作る | role denied path, cost metadata, trace visibility |
| [RAIOPS-14](https://raiops27.backlog.com/view/RAIOPS-14) | Evidence/Diagram | 実装証跡をdiagram readinessへ反映する | diagram tooltip/readiness update, `node tools/check_diagram_quality.mjs`, sync check |

## Current Count

- Created: 14 issues
- Verified issue list: https://raiops27.backlog.com/find/RAIOPS

## Next Operating Rule

Start with `RAIOPS-1`, then use `RAIOPS-2` and `RAIOPS-12` to keep the dbt/Snowpark design explicit before implementation. `RAIOPS-3` should not begin as a tiny standalone dbt demo; it should preserve the AI answer-quality contract from `RAIOPS-2`.

When updating real Backlog issue descriptions, copy the matching section from
`docs/project-management/backlog-ticket-bodies.md` and then add execution
evidence as Backlog comments.
