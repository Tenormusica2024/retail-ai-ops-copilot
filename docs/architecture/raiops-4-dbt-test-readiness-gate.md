# RAIOPS-4 dbt Test Readiness Gate

作成日: 2026-06-29

## 目的

`RAIOPS-4` は、dbt testsを単なるデータ品質チェックではなく、
Semantic Model、Golden Eval、Streamlit UI、diagram readinessを上げる
前提ゲートとして扱うための設計である。

AI回答品質は、LLMやAgentだけでなく、source、staging、join、mart grain、
KPI再集計ルール、seed定義の影響を受ける。dbt testsが失敗している状態で
Semantic/Eval/readinessを上げると、回答品質が崩れた原因を後段へ誤って
押し付ける。

## 現在の状態

`RAIOPS-3` でdbt scaffoldは作成済み。

静的検証:

- `dbt parse`: 通過済み
- `dbt compile --no-populate-cache --no-introspect --empty`: 通過済み
- dbt metadata上は9 models、1 seed、97 data tests、7 sourcesが存在する

未実施:

- live `dbt build`
- live `dbt test`
- Snowflake上でのsource/staging/intermediate/mart data test実行
- dbt test結果によるdiagram readiness更新

したがって、現在の証跡は「testが定義され、parse/compileできる」までであり、
「testがSnowflake上で通った」証跡ではない。

## Test Category

| Category | 対象 | 目的 | 後段への意味 |
| --- | --- | --- | --- |
| source contract | `sources/src_tpch` | TPCH_SF1の必須key/date/amountがnullでないこと、主要dimension keyがuniqueであること | sample sourceが期待どおり読める前提 |
| staging contract | `stg_tpch_*` | rename/cast後のkey、date、quantity、price、discount範囲を確認する | LLM-safe column境界が壊れていない前提 |
| line grain contract | `int_order_line_enriched` | `order_key + line_number` が一意で、join後にline grainが膨らんでいないこと | martとsemanticの誤集計原因を前段で止める |
| mart grain contract | `mart_retail_monthly_kpi` | `month_start + region_name + nation_name + category_name` が一意であること | Semantic Modelが読む固定grainの保証 |
| KPI value contract | mart columns | `net_sales`, `gross_sales`, `discount_amount`, `item_quantity`, `avg_discount`, `gross_margin_rate` の範囲を確認する | Golden Evalが見るKPI値の最低限の妥当性 |
| KPI definition seed | `kpi_definitions.csv` | KPI名、説明、対応/非対応範囲をSemantic/Evalと一致させる | answer-quality testとsafe-stopの語彙を固定する |
| reaggregation guard | mart + eval | `order_count` の上位粒度単純合算、率系KPIの平均を防ぐ | SQL/result correctnessと回答品質を守る |

## Gate Level

### Level 0: Design / Parse / Compile

条件:

- `dbt_project.yml`, source、models、tests、seedが存在する
- `dbt parse` が通る
- `dbt compile --no-populate-cache --no-introspect --empty` が通る

扱い:

- dbt scaffoldの静的整合性としては有効
- live Snowflake test成功とは扱わない
- Semantic/Eval/readinessを上げる根拠としては弱い

### Level 1: Live dbt Build / Test

条件:

- Snowflake trialまたは明示されたlive環境で `dbt build` が通る
- source/staging/intermediate/martのdata testsが通る
- 実行target、role、warehouse、database、schemaを証跡に残す
- local fallbackやcached resultを使わない

扱い:

- dbt staging/marts/tests nodeのreadinessを上げる根拠になる
- Semantic Model YAMLをdbt martへ合わせる作業に進める
- ただし、answer-quality成功とはまだ扱わない

### Level 2: Semantic / Eval Contract Link

条件:

- Semantic Modelがdbt mart契約と一致している
- KPI定義seedとGolden Evalのmetric名が一致している
- `order_count` と率系KPIの再集計制約がSemantic/Evalに反映されている
- unsupported/limited caseがGolden Evalに入っている

扱い:

- Semantic/Eval readinessを上げる根拠になる
- Streamlit UIがdbt mart経由の結果を表示する場合の前提になる

### Level 3: Answer Quality / Regression Gate

条件:

- Golden Evalがroute/metricだけでなく、SQL/result correctness、粒度、
  unsupported判断、回答文の注意書きを検証する
- dbt test failure時にSemantic/Eval/readinessを上げない運用が確認されている
- traceにdbt model/test/eval versionが残る

扱い:

- user-facing answer pathのreadinessを上げる根拠になる
- UI E2EやCortex live traceへ進む前提になる

## Readiness Rule

dbt testsは、次の後段nodeの前提ゲートとして扱う。

| Downstream | dbt gateが未通過の時 | dbt gate通過後 |
| --- | --- | --- |
| Semantic KPI Model | YAML draft以上に上げない | mart契約とverified query検証へ進める |
| Golden Eval | route/metric eval以上に上げない | SQL/result correctnessとgrain検証へ拡張できる |
| Streamlit UI | 直接SQL/reference MVPとして明記する | dbt mart経由表示の証跡を評価できる |
| Cortex Analyst | planned/local設計以上に上げない | Semantic登録/verified query/live traceへ進める |
| diagram readiness | dbt tests nodeをlive成功扱いしない | tooltip/readinessにlive test証跡を反映する |

## Failure Policy

dbt testsが失敗した場合は、失敗箇所に応じて後段作業を止める。

| Failure | Blockするもの | 例 |
| --- | --- | --- |
| source contract failure | staging以降、Semantic/Eval更新 | source key/date/amountのnull |
| staging contract failure | intermediate/mart更新 | discountが0-1外、key欠損 |
| line grain failure | mart/Semantic/Eval更新 | join fanoutでline grainが重複 |
| mart grain failure | Semantic/Eval/UI readiness | fixed grain uniqueness破壊 |
| KPI value failure | Golden Eval/readiness | negative sales、rate範囲外 |
| KPI seed mismatch | Semantic/Eval/Search更新 | metric名やunsupported定義のズレ |
| live build unavailable | live readiness更新 | credentials/role/warehouse/schema未準備 |

## Commands

Credentials-free checks:

```bash
SNOWFLAKE_ACCOUNT=dummy \
SNOWFLAKE_USER=dummy \
SNOWFLAKE_PASSWORD=dummy \
/tmp/retail-ai-ops-dbt-venv/bin/dbt parse \
  --project-dir dbt \
  --profiles-dir /tmp/retail-ai-ops-dbt-profiles

SNOWFLAKE_ACCOUNT=dummy \
SNOWFLAKE_USER=dummy \
SNOWFLAKE_PASSWORD=dummy \
/tmp/retail-ai-ops-dbt-venv/bin/dbt compile \
  --project-dir dbt \
  --profiles-dir /tmp/retail-ai-ops-dbt-profiles \
  --no-populate-cache \
  --no-introspect \
  --empty
```

Live checks when Snowflake credentials are intentionally available:

```bash
dbt deps --project-dir dbt
dbt seed --project-dir dbt --profiles-dir dbt --select kpi_definitions
dbt build --project-dir dbt --profiles-dir dbt --select tag:llm_contract+
dbt test --project-dir dbt --profiles-dir dbt --select tag:llm_contract+
```

The live commands must report target name, account identifier, role,
warehouse, database, and schema without exposing secrets.

## RAIOPS-4 Implementation Tasks

1. Add or confirm seed-level tests for `kpi_definitions.csv`.
2. Confirm that every model participating in Semantic/Eval has the right
   `llm_contract`, `semantic_input`, or `eval_input` tags.
3. Add singular tests or eval-side checks for reaggregation hazards that generic
   column tests cannot catch.
4. Define the exact live `dbt build/test` command for Snowflake trial.
5. Update readiness rubric after live test evidence exists.
6. Update diagram tooltip only after live evidence or explicit static-only
   evidence is available.
7. Mirror execution evidence into Backlog comments.

## Parallel Session Brief: dbt品質gate

目的:

`RAIOPS-4` のdbt testsを、後段AI readinessの前提ゲートとして実装・検証する。

対象Backlog:

- `RAIOPS-4`

編集してよいファイル:

- `dbt/models/**/schema.yml`
- `dbt/tests/**`
- `dbt/seeds/**`
- `docs/architecture/raiops-4-dbt-test-readiness-gate.md`

触らないファイル:

- `.agent-feedback/FEEDBACK_LEDGER.md`
- `.agent-feedback/PROJECT_SKILL.md`
- `docs/architecture/retail-ai-ops-copilot-architecture.html`
- `docs/project-management/backlog-ticket-bodies.md`
- `docs/obsidian/**`

受入基準:

- parse/compileが通る
- live `dbt build/test` を実行した場合、target/role/warehouse/database/schemaと結果が残る
- live実行できない場合、理由と未実施範囲が明記される
- Semantic/Eval/readinessを上げてよい条件と、まだ上げてはいけない条件が分かる

## Open Items

- dbt testsをGitHub Actionsでlive実行するか、local/live手動証跡にするか
- Snowflake trialのrole/warehouse/database/schemaをどこまで固定するか
- seed testsを初期RAIOPS-4へ含めるか、RAIOPS-5へ寄せるか
- reaggregation guardをdbt singular testで見るか、Golden Evalで見るか
- `dbt docs generate` をRAIOPS-4証跡に含めるか
