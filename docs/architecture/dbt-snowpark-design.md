# dbt / Snowpark Design

調査・設計日: 2026-06-28

この設計は、`SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` を現在の学習用データ源として固定し、dbtをAI回答品質の土台、SnowparkをPython実行・eval/trace拡張のための発展面として扱う。

## 結論

現在のdbt設計は、TPCH_SF1を前提に進める。Tasty BytesやKaggleへの再検討は、在庫、販促、店舗粒度、週報/メモ検索などを本格的に上げる段階で行う。

dbtは次の責務を持つ。

- Snowflake sample sourceを明示し、AIが直接raw tableを読んでいるように見せない
- stagingで型、命名、粒度、LLM-safe境界を揃える
- intermediateで注文/明細/地域/商品/原価proxyを結合する
- martでSemantic KPI ModelとGolden Evalが読む契約テーブルを作る
- tests/docs/lineageで、回答品質が崩れた時に原因をdbt、semantic、agent、evalへ切り分けられるようにする

Snowparkはdbtを置き換えない。SQLで十分なstaging/mart集計はdbt SQLを主線にする。Snowparkは、Pythonで扱う価値がある処理だけを担当する。

最初のSnowpark候補は `eval / trace enrichment` とする。理由は、今回の主目的であるLLMOps、評価、trace、human reviewに直結し、SQL集計よりPythonの方が表現しやすい拡張が出やすいから。

## 参照した一次情報

- dbt Python models: https://docs.getdbt.com/docs/build/python-models
- dbt Snowflake configs: https://docs.getdbt.com/reference/resource-configs/snowflake-configs
- Snowpark Python Developer Guide: https://docs.snowflake.com/en/developer-guide/snowpark/python/index
- Snowflake Python stored procedures: https://docs.snowflake.com/en/developer-guide/stored-procedure/python/procedure-python-overview
- Snowflake Cortex Agents: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents

公式docs上、dbt Python modelsはdbt DAG、test、docs、lineageに参加でき、実行はローカルではなく対象データプラットフォーム側のPython runtimeで行う。Snowpark PythonはDataFrame処理、UDF、UDTF、Stored Procedure、logging/tracing、ML系タスクに使える。Cortex Agentsはcustom toolsとしてStored Procedure / UDFを使えるため、将来のagent tool実行面とも接続しやすい。

## 設計原則

### 1. dbt SQLを主線にする

TPCH_SF1から月次KPI martを作る処理はSQLで十分に表現できる。ここをSnowparkへ逃がすと、何がdbtモデル品質で、何がPython実行品質なのかが曖昧になる。

dbt SQLで担保するもの:

- source宣言
- staging rename/cast
- intermediate join and derived columns
- mart aggregation
- schema tests
- docs and lineage

### 2. Snowparkは拡張責務を明示して使う

Snowparkを使う理由が明確な処理だけをSnowparkへ置く。

採用候補:

- eval結果やtraceのenrichment
- しきい値、分布、異常候補、失敗分類の補助特徴量
- Cortex Agents custom toolから呼ぶUDF/SP
- 将来のdbt Python model
- Python packageが必要な品質チェックやML feature

非採用:

- 単純なjoin
- 月次集計
- rename/cast
- SQLで十分なKPI計算

### 3. AI品質評価の原因切り分けを優先する

dbtの目的は、ただmartを作ることではない。Cortex AnalystやStreamlitの回答が悪い時に、どの層が原因か分けるための契約を作る。

切り分け軸:

| 層 | 失敗例 | dbt設計での制御 |
| --- | --- | --- |
| source | TPCH proxyが小売KPIに足りない | coverage matrixとsource docsで明示 |
| staging | 型、null、キー、日付が崩れる | not_null、relationships、cast |
| intermediate | join重複や原価proxy誤り | grain tests、row count checks |
| mart | KPI定義や粒度が曖昧 | unique grain、KPI definition seed |
| semantic | metric名やdimension説明が弱い | mart contractとsemantic docsを一致 |
| eval | 正解観点がズレる | Golden Evalをmart contractに紐付け |
| agent | tool選択やsafe-stop失敗 | traceにroute/model/mart_versionを残す |

### 4. Silent fallbackは禁止する

Snowflake、dbt、Snowparkが動かない場合、ローカルPythonや固定データへ黙って切り替えない。`local_explicit_test` は明示的なテストモードに限る。

## 実装前ゲート: mart再集計契約

dbt scaffoldへ進む前に、`mart_retail_monthly_kpi` の集計契約を明示する。

初期方針は、`mart_retail_monthly_kpi` を次の固定粒度で読むLLM契約martとする。

- `month_start`
- `region_name`
- `nation_name`
- `category_name`

この粒度のまま回答する場合は、`order_count`、`net_sales`、`gross_margin_rate`、`avg_discount` を表示してよい。

ただし、利用者がカテゴリを外した上位粒度で質問する場合、カテゴリ別の `order_count` を単純に合算してはいけない。同じ注文が複数カテゴリにまたがる可能性があるため、distinct order countが二重計上される。

率系KPIも、保存済みの `gross_margin_rate` や `avg_discount` を単純平均してはいけない。上位粒度では、martまたは中間modelが持つ加算可能な分子・分母から再計算する。

実装時は次を契約に含める。

- 加算可能な値: `item_quantity`, `net_sales`, `gross_margin`, `supply_cost_amount`, `discount_amount`, `gross_sales`
- 固定粒度限定の値: `order_count`
- 再計算ルール: `gross_margin_rate = gross_margin / net_sales`, `avg_discount = discount_amount / gross_sales`
- 上位粒度の注文数: `int_order_line_enriched` から要求粒度で `count(distinct order_key)` するか、将来 `mart_retail_monthly_order_kpi` を追加する

Semantic KPI Modelは、このmartを自由再集計可能な万能テーブルとして扱わない。Golden Evalには、カテゴリを外した質問で `order_count` を合算しないこと、率を平均しないことを検出するケースを入れる。

## dbt Project構成案

```text
dbt/
  dbt_project.yml
  profiles.example.yml
  models/
    sources/
      snowflake_sample.yml
    staging/
      tpch/
        stg_tpch_orders.sql
        stg_tpch_lineitem.sql
        stg_tpch_customer.sql
        stg_tpch_nation.sql
        stg_tpch_region.sql
        stg_tpch_part.sql
        stg_tpch_partsupp.sql
        schema.yml
    intermediate/
      int_order_line_enriched.sql
      schema.yml
    marts/
      mart_retail_monthly_kpi.sql
      schema.yml
    snowpark/
      py_eval_trace_enrichment.py
      schema.yml
  seeds/
    kpi_definitions.csv
  tests/
    assert_mart_monthly_kpi_grain.sql
```

実装初手では `dbt/` 配下に作る。既存の `sql/00_setup_from_snowflake_sample.sql` はdbt未導入時の手動setup証跡として残し、dbt導入後は「手動SQL版」から「dbt管理版」へ主責務を移す。

## source設計

`SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` はread-only sourceとして扱う。CI/CDやdbt seedがこのsourceをdeployしているようには表現しない。

source候補:

| source | TPCH table | 主な用途 |
| --- | --- | --- |
| `src_tpch.orders` | `orders` | 注文日、注文キー、顧客キー |
| `src_tpch.lineitem` | `lineitem` | 数量、明細金額、割引率、supplier/product key |
| `src_tpch.customer` | `customer` | 顧客キー、国キー |
| `src_tpch.nation` | `nation` | 国名、地域キー |
| `src_tpch.region` | `region` | 地域名 |
| `src_tpch.part` | `part` | 商品type、brand |
| `src_tpch.partsupp` | `partsupp` | 供給原価proxy |

source freshnessはTPCH sampleが静的なので初期では必須にしない。代わりにsource存在確認、主要カラムnot null、relationshipsを重視する。

## staging設計

stagingは薄く保つ。rename、cast、LLM-safe境界に集中する。

| model | 主な出力 | tests |
| --- | --- | --- |
| `stg_tpch_orders` | `order_key`, `customer_key`, `order_date` | `order_key not_null/unique`, `customer_key not_null`, `order_date not_null` |
| `stg_tpch_lineitem` | `order_key`, `part_key`, `supplier_key`, `quantity`, `extended_price`, `discount_rate` | key not_null, `quantity >= 0`, `discount_rate between 0 and 1` |
| `stg_tpch_customer` | `customer_key`, `nation_key` | key not_null/unique |
| `stg_tpch_nation` | `nation_key`, `nation_name`, `region_key` | key not_null/unique |
| `stg_tpch_region` | `region_key`, `region_name` | key not_null/unique |
| `stg_tpch_part` | `part_key`, `category_name`, `brand_name` | key not_null/unique |
| `stg_tpch_partsupp` | `part_key`, `supplier_key`, `supply_cost` | compound key not_null, `supply_cost >= 0` |

## intermediate設計

`int_order_line_enriched` で注文、明細、地域、商品、供給原価を結合する。

推奨カラム:

| column | 意味 |
| --- | --- |
| `order_key` | 注文キー |
| `order_date` | 注文日 |
| `month_start` | 月初日 |
| `region_name` | TPCH地域 |
| `nation_name` | TPCH国 |
| `category_name` | `part.p_type` or brand proxy |
| `quantity` | 明細数量 |
| `net_sales` | `extended_price * (1 - discount_rate)` |
| `supply_cost_amount` | `supply_cost * quantity` |
| `gross_margin` | `net_sales - supply_cost_amount` |
| `discount_rate` | 明細割引率 |

このmodelでは、join重複と粒度破壊を重点的に見る。`partsupp` joinは `part_key + supplier_key` で行い、lineitem粒度を保つ。

## mart設計

### `mart_retail_monthly_kpi`

Semantic KPI Model、Cortex Analyst、Golden Eval、Streamlitが読む主契約。

grain:

- `month_start`
- `region_name`
- `nation_name`
- `category_name`

metrics:

- `order_count`
- `item_quantity`
- `net_sales`
- `gross_margin`
- `gross_margin_rate`
- `avg_discount`

tests:

- grain unique
- all grain columns not null
- `net_sales >= 0`
- `order_count > 0`
- `gross_margin_rate` is finite
- `avg_discount between 0 and 1`

### `dim_kpi_definition`

現在の `KPI_DEFINITIONS` 手動SQLはdbt seedへ移す。

seed columns:

- `kpi_name`
- `business_definition`
- `calculation_note`
- `llm_safe`
- `owner`
- `current_data_fit`
- `known_gap`

このseedはCortex SearchやSemantic docsの入力候補にもなる。最初は小さいCSVでよいが、Golden Evalの期待値と同じKPI名を使う。

## Snowpark-aware設計

### Phase S0: Snowparkを使わないが、拡張点を開ける

初期dbt実装ではSQL modelだけで `mart_retail_monthly_kpi` を作る。Snowpark nodeのreadinessは上げない。

この段階でやること:

- dbt model tagsに `llm_contract`, `semantic_input`, `eval_input` を付ける
- martに `model_version` または `dbt_invocation_id` をtraceへ渡せるようにする設計を残す
- `dbt build` が通らないとSemantic/Evalへ進めないゲートにする

### Phase S1: dbt Python model候補

最初のdbt Python model候補は `py_eval_trace_enrichment`。

入力:

- `mart_retail_monthly_kpi`
- `OPS.COPILOT_TRACE_LOG`
- Golden Eval結果テーブル、または将来のeval snapshot

出力候補:

- `eval_run_id`
- `question_id`
- `metric`
- `route`
- `answer_status`
- `sql_valid`
- `grounding_status`
- `mart_grain`
- `suspected_layer`
- `failure_bucket`
- `requires_human_review`

役割:

- SQL validity、route、metric、row_count、human review flagを整理
- error taxonomyの前段特徴量を作る
- Trace StoreとGolden Evalの比較をしやすくする

dbt Python modelにする理由:

- dbt lineage/test/docsに乗る
- SQLだけより評価・分類ロジックを表現しやすい
- Snowflake側Python runtimeで実行され、ローカルfallbackにならない

### Phase S2: Stored Procedure / UDF候補

Stored Procedure候補:

- `SP_ENRICH_EVAL_TRACE(run_id)`
- eval run単位でtraceを集約し、failure bucketやhuman review候補を保存する

UDF候補:

- `UDF_CLASSIFY_KPI_DELTA(metric, actual, expected, tolerance)`
- KPI差分を単純な分類に変換する

Cortex Agents custom tool候補:

- `GET_KPI_GUARDRAIL_CONTEXT(metric, period, region, category)`
- agentが回答前にKPI定義、許容粒度、known gapsを確認する

この段階ではCortex Agentsから直接呼ぶか、App Runtime Tool Adapterから呼ぶかを必ず決める。二重化しない。

## CI/CD設計

初期CI:

- `dbt parse`
- `dbt compile`
- `dbt build --select tag:llm_contract+` はSnowflake credentialsがある環境だけで実行

必須ゲート:

- dbt source/staging/mart testsが落ちたらSemantic/Evalのreadinessを上げない
- Snowpark Python modelやSP/UDFがある場合、該当model/testを別tagで選択実行する
- credentialsがないCIでlive buildを黙ってskip成功扱いしない。`parse/compile only` と `live build` を明示的に分ける

tag案:

| tag | 対象 |
| --- | --- |
| `llm_contract` | semantic/eval/UIが読む契約model |
| `semantic_input` | Cortex Analyst semantic model入力 |
| `eval_input` | Golden Eval入力 |
| `snowpark_candidate` | 将来Snowpark化する候補 |
| `snowpark_runtime` | 実際にSnowpark/Pythonで動くmodel/SP/UDF |

## Semantic / Eval連携

Semantic KPI Modelは `mart_retail_monthly_kpi` を読む。

KPI定義は `dim_kpi_definition` を正とする。Semantic yaml、Cortex Search、Golden EvalのKPI名はこのseedと一致させる。

Golden Evalは次を必ず検証する。

- `net_sales` が月次/地域/カテゴリで答えられる
- `gross_margin_rate` がproxyであることを回答または注記できる
- `stockout_risk` や `promotion_lift` はTPCH_SF1ではunsupportedまたはlimitedとしてsafe-stopできる
- `same_store_sales_growth` は店舗dimensionがないためunsupportedにできる

## 実装順序

0. mart再集計契約を固定する
1. dbt scaffoldを作る
2. sourceとstagingを作る
3. `int_order_line_enriched` を作る
4. `mart_retail_monthly_kpi` を再集計契約込みで作る
5. `kpi_definitions.csv` seedを作る
6. tests/docsを入れる
7. 既存Streamlit/Plannerの参照先をdbt mart契約に合わせる
8. Golden Evalをmart契約に合わせて増やす
9. Snowpark候補を `py_eval_trace_enrichment` として設計だけ置く
10. baselineが安定したらSnowpark実装へ進む

## 受入基準

設計段階:

- TPCH_SF1前提が明示されている
- martの固定粒度、上位集計時の注文数、率系KPI再計算ルールが明示されている
- source/staging/intermediate/mart/seed/testの責務が分かれている
- Snowparkを使う場所と使わない場所が説明されている
- Semantic/Eval/Traceとの接続契約がある
- dbt testsが後段AI readinessのゲートになっている

実装段階:

- `dbt build` がSnowflake live modeで通る
- `mart_retail_monthly_kpi` が既存SQL版と同等の主要KPIを返す
- 上位粒度の質問でカテゴリ別 `order_count` を合算せず、率系KPIを分子・分母から再計算する
- `dim_kpi_definition` とGolden EvalのKPI名が一致する
- unsupported KPIを無理に回答しない
- Snowpark実装はlocal fallbackせず、失敗時は明示エラーになる

## まだやらないこと

- Tasty Bytesへの切替
- 在庫、販促、店舗、週報の本格source追加
- SPCSのCompute Pool / Service / Job Service設計
- ML training / model registry
- 本番スケジューリング
- dbt Meshやマルチチーム所有境界

これらはbaselineのdbt/Semantic/Evalが安定し、品質劣化の原因切り分けができるようになってから、学習密度を上げる拡張として提案する。
