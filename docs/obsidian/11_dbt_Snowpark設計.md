---
cssclasses: [excel-agent-wide-table]
---

# 11_dbt_Snowpark設計

Repo mirror: [dbt / Snowpark Design](../architecture/dbt-snowpark-design.md)

## 結論

現在のdbt設計は `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` を前提に進める。データ選定は再検討しない。

dbtはAI回答品質の土台として、source、staging、intermediate、mart、seed、tests、docs、lineageを管理する。

Snowparkはdbtの代替ではなく、Pythonが必要なeval/trace enrichment、将来のdbt Python model、Stored Procedure / UDF、Cortex Agents custom tool実行面として扱う。

## 現在の実装状況

`dbt/` scaffoldは作成済み。

2026-06-29時点で、Snowflake実接続を使わない一時profilesとダミー環境変数により、`dbt parse` と `dbt compile --no-populate-cache --no-introspect --empty` は通過済み。

これは構文、依存、モデル展開の事前検証であり、live `dbt build` やSnowflake上のdata test成功証跡ではない。

次は `RAIOPS-4` として、dbt testsをSemantic Model、Golden Eval、diagram readinessの前提ゲートにする。

## 実装前ゲート

dbt scaffoldへ進む前に、`mart_retail_monthly_kpi` の再集計契約を固定する。

初期martは `month_start`、`region_name`、`nation_name`、`category_name` の固定粒度で読む。カテゴリを外した上位粒度では、カテゴリ別 `order_count` を単純合算しない。率系KPIは保存済み率を平均せず、`gross_margin / net_sales` や `discount_amount / gross_sales` のように分子・分母から再計算する。

Golden Evalには、カテゴリを外した質問で注文数二重計上や率平均をしないことを検出するケースを追加する。

## レイヤー

| layer | 役割 |
| --- | --- |
| source | `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` read-only参照 |
| staging | rename/cast/key/date/LLM-safe境界 |
| intermediate | 注文、明細、顧客、地域、商品、原価proxy結合 |
| mart | `mart_retail_monthly_kpi` |
| seed | `dim_kpi_definition` |
| tests | mart粒度、not null、relationships、KPI範囲 |
| Snowpark | eval/trace enrichment、UDF/SP、agent custom tool候補 |

## dbt model案

- `stg_tpch_orders`
- `stg_tpch_lineitem`
- `stg_tpch_customer`
- `stg_tpch_nation`
- `stg_tpch_region`
- `stg_tpch_part`
- `stg_tpch_partsupp`
- `int_order_line_enriched`
- `mart_retail_monthly_kpi`
- `dim_kpi_definition`
- `py_eval_trace_enrichment`（Snowpark候補、baseline後）

## Snowpark方針

SQLで十分な集計はdbt SQLで実装する。

Snowparkを使う候補:

- eval結果とtraceのenrichment
- error taxonomy前段の特徴量
- human review候補抽出
- Cortex Agents custom toolから呼ぶUDF/SP
- 将来のPython packageやML feature処理

Snowparkを使わない候補:

- 単純なjoin
- rename/cast
- 月次KPI集計
- SQLで十分なKPI計算

## 後段連携

- Semantic KPI Modelは `mart_retail_monthly_kpi` を読む
- KPI定義は `dim_kpi_definition` を正とする
- Golden EvalはKPI名、粒度、unsupported範囲をこのmart/seed契約に合わせる
- Trace Storeはdbt model version、route、metric、row_count、human review flagを保存する

## 実装順序

0. mart再集計契約
1. dbt scaffold
2. source/staging
3. intermediate
4. mart
5. seed
6. tests/docs
7. semantic/eval更新
8. Snowpark候補設計
9. baseline安定後にSnowpark実装
