---
cssclasses: [excel-agent-wide-table]
---

# 03_LLMOps設計

## 第一原則

MVPのLLMOps目的は、KPI Copilot の変更を安全に継続できること。

つまり、以下の変更で品質が上がったか下がったかを検出できるようにする。

- semantic model の変更
- dbt mart / KPI定義の変更
- prompt / instruction の変更
- router / fallback の変更
- Cortex Analyst / Cortex Search 設定の変更

## Must-have

### Golden eval set

30から50件の代表KPI質問を用意する。

各ケースは以下を持つ。

- question
- expected_route
- expected_metric
- expected_grain
- required_filters
- time_window
- acceptable_sql_pattern
- expected_answer_checks
- negative_checks

### Trace capture

各実行で以下を保存する。

- question
- session_id
- user_role
- route_decision
- planner_output
- semantic_model_version
- prompt_version
- dataset_version
- tool_name
- generated_sql_or_request
- result_row_count
- result_summary
- final_answer
- latency_ms
- token_estimate_or_message_count
- error_category
- human_review_required

### Version registry

最初はYAMLでよい。

```yaml
semantic_model_version: retail_semantic_v0.1
prompt_version: kpi_agent_prompt_v0.1
dataset_version: kaggle_retail_sample_v0.1
cortex_config_version: cortex_trial_v0.1
router_version: router_v0.1
```

### Error taxonomy

| code | 意味 |
|---|---|
| `metric_mismatch` | 指標を取り違えた |
| `grain_mismatch` | 日次/週次/店舗/商品などの粒度を誤った |
| `filter_miss` | 地域、店舗、カテゴリなど必須条件を落とした |
| `time_window_error` | 期間解釈を誤った |
| `sql_invalid` | SQLが実行不能 |
| `sql_valid_but_wrong` | SQLは動くが意図と違う |
| `ambiguous_question` | 質問が曖昧で確認が必要 |
| `unsupported_question` | semantic model 外の質問 |
| `answer_wording_risk` | 数値は合うが説明が過剰・危険 |

## Light touch

- LLM-as-judge は説明品質の補助に留める
- UI上の観測指標は eval pass rate、invalid SQL rate、fallback率、p50/p95 latency 程度
- 本番フィードバックは thumbs up/down と correction text 程度
- release note は改善/悪化した eval case を短く残す

## Defer

- 大規模prompt experiment platform
- multi-model routing
- fine-tuning
- sophisticated model monitoring
- full RAG benchmark
- real-time production alerting

## 初期受入基準

- golden eval を20件以上定義している
- 少なくとも10件を自動実行できる
- route、plan、SQL、answer、error を保存できる
- 失敗ケースに人手レビュー用の出力がある
- semantic model または prompt 変更後に regression diff を確認できる
