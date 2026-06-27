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
