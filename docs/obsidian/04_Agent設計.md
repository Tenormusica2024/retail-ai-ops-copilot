---
cssclasses: [excel-agent-wide-table]
---

# 04_Agent設計

## 目的

AIエージェントを「何でも答えるチャット」ではなく、業務KPIを安全に調べる作業者として設計する。

## Agent responsibility

- ユーザー質問の意図を分類する
- metric、grain、filter、time window を抽出する
- Cortex Analyst / Cortex Search / clarification / approval にrouteする
- tool結果を検証する
- 回答と根拠を作る
- trace と audit を残す
- 失敗や曖昧さを明示する

## State

保持する会話状態は限定する。

- selected_period
- selected_region
- selected_store
- selected_product_category
- last_metric
- last_grain
- last_result_id
- last_generated_sql
- confidence_state
- unresolved_clarification

長期的な個人記憶や嗜好学習はMVPでは扱わない。

## Tool routing

| route | 条件 | tool |
|---|---|---|
| `structured_kpi_question` | KPI、売上、粗利、在庫、欠品など | Cortex Analyst |
| `business_definition_question` | 指標定義、業務ルール、週報メモ | Cortex Search |
| `mixed_question` | 数値と文書根拠の両方が必要 | Analyst first, Search second |
| `ambiguous_question` | 期間、店舗、指標が曖昧 | clarification |
| `unsafe_action_request` | 通知、送信、変更、登録 | human approval |
| `unsupported_question` | semantic model / docs 外 | refusal or handoff |

## Safe-stop states

- `clarify_needed`
- `no_data`
- `low_confidence`
- `semantic_model_missing`
- `doc_source_missing`
- `tool_error`
- `human_review_required`

safe-stop は代替実行ではなく、業務上の確認・保留・拒否状態として扱う。

## Human approval

MVPで承認が必要な操作。

- レポート送信
- アラート作成
- dbt/semantic model変更
- データ更新
- 外部SaaS連携

初期実装では Streamlit の承認ボタンと approval log で模擬する。

## Snowflake-native vs LangGraph

メインアーキテクチャは Snowflake-native。

ただし学習メモとして、以下の比較を残す。

| 観点 | Cortex Agents | LangGraph / OpenAI Agents SDK |
|---|---|---|
| データ境界 | Snowflake governance 内に寄せやすい | アプリ側で認証・認可・データ境界を実装 |
| 状態管理 | thread/context をSnowflake側で扱える | explicit state を細かく制御しやすい |
| tool連携 | Cortex Analyst/Search/custom tools が自然 | 任意API・ローカルツールに広げやすい |
| 学習価値 | 実務Snowflake文脈に近い | agent内部設計を理解しやすい |
| MVPでの扱い | 本線 | appendix / comparison |

## Avoid

- free-form SQL生成を主役にする
- multi-agent roleplay を入れる
- raw rows をプロンプトへ大量投入する
- 自律書き込みを承認なしで実行する
- forecasting model改善を主目的にする
