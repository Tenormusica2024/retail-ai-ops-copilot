---
cssclasses: [excel-agent-wide-table]
---

# retail-ai-ops-copilot

作成日: 2026-06-27

Snowflake-native Retail Operations KPI Copilot の設計・実装学習プロジェクト。

主目的は、LLMOps / AI アーキテクチャ / AI エージェント強化の範囲を、実装可能な小さい題材で具体化すること。前処理、セキュリティ、コストは無視しないが、本プロジェクトでは DE / DS / セキュリティ / FinOps が所有しうる詳細実装へ深掘りしすぎない。

## ドキュメント

- [[01_学習目的・スコープ|01_学習目的・スコープ]]
- [[02_アーキテクチャ方針|02_アーキテクチャ方針]]
- [[03_LLMOps設計|03_LLMOps設計]]
- [[04_Agent設計|04_Agent設計]]
- [[05_データ契約・KPI境界|05_データ契約・KPI境界]]
- [[06_セキュリティ・コスト境界|06_セキュリティ・コスト境界]]
- [[07_MVP実装計画・受入基準|07_MVP実装計画・受入基準]]
- [[08_公開情報・判断根拠|08_公開情報・判断根拠]]
- [[09_同期運用|09_同期運用]]
- [[10_Snowpark導入設計|10_Snowpark導入設計]]
- [[11_dbt_Snowpark設計|11_dbt_Snowpark設計]]
- [[12_チケット駆動運用|12_チケット駆動運用]]
- [[13_並列セッション計画|13_並列セッション計画]]
- [[14_RAIOPS-4_dbtテストreadiness設計|14_RAIOPS-4_dbtテストreadiness設計]]
- Repo mirror: [Learning Stage Strategy](../architecture/learning-stage-strategy.md)
- Repo mirror: [Snowpark Integration Design](../architecture/snowpark-integration-design.md)
- Repo mirror: [dbt / Snowpark Design](../architecture/dbt-snowpark-design.md)
- Repo mirror: [RAIOPS-4 dbt Test Readiness Gate](../architecture/raiops-4-dbt-test-readiness-gate.md)
- Repo mirror: [Backlog Ticket Workflow](../project-management/backlog-workflow.md)
- Repo mirror: [Parallel Session Implementation Plan](../project-management/parallel-session-implementation-plan.md)
- Repo mirror: [Backlog Initial Ticket Map](../project-management/backlog-initial-ticket-map.md)

## 原本とrepo

- Obsidian: optional external workspace via `RETAIL_AI_OPS_OBSIDIAN_DIR`
- Repo: this repository
- GitHub: `https://github.com/Tenormusica2024/retail-ai-ops-copilot`

## 選定方針

案1「Retail Operations KPI Copilot」を選定する。

Snowflake / dbt / Cortex Analyst を中心に、流通・小売の売上、粗利、在庫、欠品、販促、週報データを扱う。AI エージェントは、構造化KPIへの問い合わせ、必要に応じた定義・週報検索、回答検証、監査ログ、人間承認を担当する。

## 深掘りする領域

- Semantic KPI layer
- Cortex Analyst / Cortex Search / Cortex Agents の使い分け
- Agent state, tool routing, safe-stop
- LLMOps golden eval, trace, version registry
- error taxonomy と human review loop
- Streamlit での可視化とE2E確認

## 深掘りしすぎない領域

- 生データの大規模前処理
- 需要予測モデル自体の精度改善
- エンタープライズIAM / SSO / DLP の本実装
- Snowflake の詳細FinOps自動化
- 大規模RAG基盤
- 本番デプロイ

## 学習ステージ

このプロジェクトは初級編から始まった学習面として扱う。ただし、1ヶ月程度の短い学習期間では、無難な小規模構成にまとめることを目的にしない。Cortex/dbt/Streamlit/LLMOpsの基本関係を早く押さえたら、同じプロジェクト内で中級編以降の難しい構成へ進む方が学習効率が高い。

Snowpark / SPCS は中級編以降の有力候補として積極的に検討する。全工程で使う前提とは断定しないが、複雑なPython前処理、Snowflake内UDF/SP、eval runner、trace enrichment、ML feature、Container Services上のAirflow/Jupyter/MLflow/custom APIなどを扱う段階では、意識的に採用候補へ上げる。

中級編はまずこのrepoの拡張として検討する。別プロジェクトに分けるのは、実行コスト、実装量、または回答品質がどこで崩れているかの切り分けが難しくなった時に検討する。
