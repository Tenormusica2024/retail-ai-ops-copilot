# Backlog Ticket Bodies

作成日: 2026-06-29

このファイルは `RAIOPS-1` から `RAIOPS-14` までのBacklog本文粒度をそろえるためのrepo側正本。

Backlog画面では、各課題の説明欄へ該当セクションを貼り、実作業が進んだらコメントで証跡を追記する。
repo docsが正であり、Backlog本文は進行管理と要約のための同期面として扱う。

## 共通方針

- 日本語を主軸にし、製品名、repo path、コマンド、issue keyだけ英語を残す。
- 実装済みのように見える予定表現を避け、証跡がないものは未実装・未検証として書く。
- 実装チケットはテストまたは実行証跡を受入基準に含める。
- 設計チケットは判断根拠、採用/非採用、未決事項を分ける。
- Snowflake / Cortex / Snowpark が使えない時に `local_explicit_test` へ黙って切り替えない。
- diagram readinessへ影響する作業は、構成図tooltip/readiness更新を証跡に含める。

## RAIOPS-1: Backlog運用DoDと証跡テンプレートを定義する

```text
目的:
Backlogを、このAIアーキテクチャ学習プロジェクトの進行管理、証跡リンク、レビュー状態の確認面として使えるようにする

背景:
repo内の設計書とObsidian mirrorが正本であり、Backlogはチケット駆動で作業単位を管理する補助面として使う
初期実装へ進む前に、完了条件、証跡テンプレート、repo docsとの同期ルールを明確にしないと、あとから「何をもって完了か」が曖昧になる

作業内容:
- `docs/project-management/backlog-workflow.md` にBacklog運用方針、DoD、証跡テンプレートを整理する
- `docs/project-management/backlog-initial-ticket-map.md` に初期チケット一覧とEvidence Targetを整理する
- `docs/project-management/backlog-ticket-bodies.md` をBacklog本文粒度の正本として作成・更新する
- `docs/obsidian/12_チケット駆動運用.md` からrepo側Backlog文書へリンクする
- Obsidian mirrorとの同期チェックを行う

受入基準:
- Backlogの役割が「進行管理・要約・証跡リンク」であり、repo docsが正本だと明記されている
- 各チケットの完了条件が、設計/実装/検証/diagram readinessのどれに該当するか追える
- 証跡テンプレートに repo path、command、result、Backlog、screenshot/Pages、readiness影響、未決事項が含まれている
- `python3 tools/sync_obsidian_docs.py --direction check` が通る
- Backlog本文を更新する時に読むべきproject-local child skillが明記されている

証跡:
- repo path: `docs/project-management/backlog-workflow.md`
- repo path: `docs/project-management/backlog-initial-ticket-map.md`
- repo path: `docs/project-management/backlog-ticket-bodies.md`
- repo path: `docs/obsidian/12_チケット駆動運用.md`
- command: `python3 tools/sync_obsidian_docs.py --direction check`
- result: 実行後にBacklogコメントへ記録する

未決事項:
- 実Backlog画面の説明欄へrepo側正本をどのタイミングで同期するか
- Backlog Freeのカテゴリー/マイルストーン設定を使うか、タイトル接頭辞だけで継続するか
```

## RAIOPS-2: TPCH_SF1小売KPI mart契約を固定する

```text
目的:
Snowflake sample data `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` を使った初期KPI mart契約を固定し、dbt、Semantic Model、Golden Eval、Streamlitが同じ前提で進められる状態にする

背景:
現在の学習用データはTPCH_SF1であり、POS、在庫、販促、週報メモを完全に含むわけではない
そのため、主図と実装のズレを避けるには、どのKPIをproxyとして扱い、どの質問はunsupportedまたはlimitedにするかを明示する必要がある
特に `order_count` や率系KPIは上位粒度への再集計で誤りやすいため、mart契約段階で制約を固定する

作業内容:
- `docs/architecture/dbt-snowpark-design.md` にmart固定粒度、加算可能値、率系KPI再計算ルールを明記する
- `docs/architecture/sample-data-coverage-matrix.md` と整合させ、TPCH_SF1がカバーできる範囲とできない範囲を明示する
- `mart_retail_monthly_kpi` のgrainを `month_start`, `region_name`, `nation_name`, `category_name` として固定する
- `order_count` をカテゴリ別martから上位粒度へ単純合算しないルールを書く
- `gross_margin_rate` と `avg_discount` は上位粒度で分子・分母から再計算する方針にする

受入基準:
- TPCH_SF1を初期データ源とする理由と、Tasty Bytes/Kaggleを後回しにする理由が説明されている
- mart固定粒度と主要KPIが明記されている
- 加算可能な値と固定粒度限定の値が分かれている
- Semantic Modelがこのmartを万能再集計テーブルとして扱わないことが明記されている
- Golden Evalに入れるべき誤集計検出観点が書かれている

証跡:
- repo path: `docs/architecture/dbt-snowpark-design.md`
- repo path: `docs/architecture/sample-data-coverage-matrix.md`
- repo path: `docs/architecture/raiops-2-12-preimplementation-gate.md`
- repo path: `sql/00_setup_from_snowflake_sample.sql`
- Backlog: `RAIOPS-2`
- result: 設計レビュー後にBacklogコメントへ記録する

未決事項:
- `mart_retail_monthly_order_kpi` のような上位粒度用martを初期dbt実装に含めるか
- Tasty BytesやTPCDSへ広げるタイミング
```

## RAIOPS-3: TPCH source-to-mart の dbt scaffold を作る

```text
目的:
手動SQLで作っているTPCH_SF1由来のmartを、dbtのsource / staging / intermediate / marts / seeds / tests構成へ移し、AI回答品質の原因切り分けができるデータ契約へ近づける

背景:
現状は `sql/00_setup_from_snowflake_sample.sql` により `MART_RETAIL_MONTHLY_KPI` を作れるが、dbtのlineage、tests、docs、semantic/eval gateにはまだ乗っていない
このままだと、回答品質が悪い時に、source、staging、join、mart、semantic、agent、evalのどこが原因か分けにくい

作業内容:
- `dbt/` ディレクトリを追加する
- `dbt_project.yml` と `profiles.example.yml` を作る
- `models/sources/snowflake_sample.yml` でTPCH_SF1 sourceを宣言する
- staging modelを作る: orders, lineitem, customer, nation, region, part, partsupp
- intermediate model `int_order_line_enriched` を作る
- mart model `mart_retail_monthly_kpi` を作る
- seed `kpi_definitions.csv` を作る
- schema.ymlに主要testsとdocsを入れる
- `dbt parse` と `dbt compile` を通す

受入基準:
- dbt projectが追加され、`dbt parse` が通る
- Snowflake credentialsがない環境でも `dbt compile` 相当の静的検証方針が明記されている
- Snowflake live credentialsがある環境では `dbt build` を実行できる構成になっている
- dbt modelがraw TPCH tableを直接AI/Agentに読ませる構成になっていない
- `mart_retail_monthly_kpi` はRAIOPS-2のmart契約と整合している
- `sql/00_setup_from_snowflake_sample.sql` は手動setup証跡として残し、dbt導入後の主責務移行がREADMEまたは設計書から追える

証跡:
- repo path: `dbt/`
- repo path: `docs/architecture/dbt-snowpark-design.md`
- command: `dbt parse`
- command: `dbt compile`
- command: `dbt build` live credentialsありの場合
- result: 実行結果をBacklogコメントへ記録する

未決事項:
- dbt adapter導入方法とローカルPython環境の固定
- Snowflake trial credentialsを使ったlive `dbt build` をいつ実行するか
```

## RAIOPS-4: dbt testsをsemantic/eval readiness gateにする

```text
目的:
dbt testsを、Semantic Model、Golden Eval、Streamlit UIのreadinessを上げる前提条件として扱う

背景:
AI回答品質は、LLMやAgentだけでなく、dbt martの粒度、join、null、重複、率計算の影響を強く受ける
dbt testsがないままSemantic/Evalの進捗を上げると、後段の品質劣化原因が曖昧になる

作業内容:
- source/staging/intermediate/martごとに最低限のschema testsを定義する
- `mart_retail_monthly_kpi` のgrain unique testを追加する
- `net_sales >= 0`, `order_count > 0`, `avg_discount between 0 and 1` などの品質testを追加する
- 率系KPIとorder_countの再集計注意点をdocs/testsへ反映する
- dbt test結果をdiagram readinessとGolden Eval readinessのゲートとして扱うルールを書く
- CIでcredentialsなしのparse/compileとlive buildを明示的に分ける

受入基準:
- `dbt test` の対象と目的がschema.ymlまたはdocsに明記されている
- mart grain破壊を検出するtestがある
- dbt testsが失敗した時、Semantic/Eval/readinessを上げない運用になっている
- CIでlive credentialsなしの成功をlive build成功と誤認しない
- diagram tooltipまたはreadiness文書にdbt testsの検証状態が反映される

証跡:
- repo path: `dbt/models/**/schema.yml`
- repo path: `tests/`
- repo path: `docs/architecture/progress-readiness-rubric.md`
- command: `dbt test`
- command: `node tools/check_diagram_quality.mjs` diagram更新時
- result: 実行結果をBacklogコメントへ記録する

未決事項:
- dbt testsをGitHub Actionsでlive実行するか、local/live手動証跡にするか
- Snowflake trial環境のrole/warehouse/database/schemaをどこまで固定するか
```

## RAIOPS-5: Semantic Model YAMLをdbt mart契約に合わせる

```text
目的:
Cortex Analystが読むSemantic Model YAMLを、dbt mart契約とKPI定義seedに合わせる

背景:
Semantic Modelは、自然言語質問をSQL/KPI回答へ変換する中心契約になる
dbt martとSemantic YAMLの粒度、KPI名、dimension説明、verified queryがズレると、回答品質の劣化原因がsemantic層に埋もれる

作業内容:
- `semantic/retail_kpi_semantic_model.yaml` をdbt mart名・schema・column定義に合わせる
- dimensions: `month_start`, `region_name`, `nation_name`, `category_name` を明確に説明する
- measures: `net_sales`, `gross_margin`, `gross_margin_rate`, `order_count`, `avg_discount` をmart契約に合わせる
- `gross_margin_rate` と `avg_discount` の再集計注意点をdescriptionへ入れる
- verified queryを少なくとも2件以上、dbt mart契約に合わせて更新する
- KPI定義seedとGolden EvalのKPI名が一致しているか確認する

受入基準:
- Semantic YAMLのbase_tableがdbt martまたは現行mart viewを指している
- 主要dimension/measureの説明が日本語学習者にも理解できる粒度になっている
- verified queryがTPCH_SF1 proxyの範囲内で成立している
- unsupported/limitedな小売KPIをSemantic Modelで過剰に表現していない
- Golden Evalの期待metric名とSemantic YAMLのmeasure名が一致している

証跡:
- repo path: `semantic/retail_kpi_semantic_model.yaml`
- repo path: `dbt/seeds/kpi_definitions.csv` または現行KPI定義
- repo path: `data/golden_eval.json`
- command: Semantic YAML validation手順が決まったら記録する
- result: 検証結果をBacklogコメントへ記録する

未決事項:
- Cortex AnalystへのSemantic Model登録方法と検証コマンド
- verified queryをどの程度日本語質問に寄せるか
```

## RAIOPS-6: Golden Evalを回答品質テストに拡張する

```text
目的:
現在のroute/metric中心のGolden Evalを、SQL/result correctness、safe-stop、根拠、回答文の品質まで見られる評価に拡張する

背景:
現行 `data/golden_eval.json` と `python -m retail_ai_ops.eval_runner` は10件のroute/metric分類を確認できる
ただし、回答品質、SQL結果の正しさ、KPI再集計ルール、unsupported判断、human review要否までは十分に検証していない

作業内容:
- Golden Evalのcase構造を拡張する
- expected_route, expected_metricに加えて、expected_grain, required_filters, time_window, expected_answer_checks, negative_checksを追加する
- `order_count` の誤合算、率系KPIの単純平均、unsupported KPIへの無理回答を検出するcaseを追加する
- `stockout_risk`, `promotion_lift`, `same_store_sales_growth` はTPCH_SF1ではunsupported/limitedとして扱えるか確認する
- eval runnerを拡張し、route/metric以外の評価結果もtraceへ残す

受入基準:
- Golden Evalが20件以上に増えている
- route/metricだけでなく、safe-stop、粒度、フィルタ、回答文チェックが評価できる
- unsupported/limited caseが無理に回答されない
- eval結果がTrace StoreまたはJSONLで追える
- eval pass/failがdiagram readinessの根拠として使える

証跡:
- repo path: `data/golden_eval.json`
- repo path: `retail_ai_ops/eval_runner.py`
- repo path: `docs/obsidian/03_LLMOps設計.md`
- command: `python3 -m retail_ai_ops.eval_runner`
- result: pass/totalと失敗caseをBacklogコメントへ記録する

未決事項:
- answer text品質をrule-basedで見るか、LLM-as-judge補助を使うか
- eval結果の保存先をJSONL、SQLite、Snowflake tableのどれに寄せるか
```

## RAIOPS-7: Snowflake/Cortex live traceを5件残す

```text
目的:
Snowflake/Cortex live pathで少なくとも5件のKPI質問を実行し、route、SQL/request、result、answer、version、error categoryをtraceとして残す

背景:
local_explicit_testはrouter/trace/eval開発には有効だが、Snowflake/Cortex live挙動の代替ではない
live pathの証跡がないと、Cortex AnalystやSnowflake権限、Semantic Model、warehouse、query結果の問題を学習できない

作業内容:
- Snowflake live modeで必要なenvを整理する
- `RETAIL_AI_OPS_RUNTIME=snowflake` でlocal fallbackしないことを確認する
- Snowflake martまたはdbt martを参照して5件以上のKPI質問を実行する
- 各実行でtraceを保存する
- route, SQL/request, result_row_count, final_answer, error_category, semantic/model/dataset versionを残す
- 成功だけでなくunsupported/ambiguous/failure pathも最低1件含める

受入基準:
- live Snowflake/Cortex pathで5件以上のtraceが残っている
- Snowflake credentials不足時にlocal_explicit_testへ黙って切り替わらない
- traceにroute、SQL/request、result、answer、version、error categoryが含まれる
- live実行とlocal_explicit_testの証跡が区別できる
- 実行コストを抑えるためXS warehouse/auto suspend等の前提が確認されている

証跡:
- repo path: `retail_ai_ops/trace.py`
- repo path: `streamlit_app/app.py`
- repo path: `sql/00_setup_from_snowflake_sample.sql` または `dbt/`
- command: `RETAIL_AI_OPS_RUNTIME=snowflake streamlit run streamlit_app/app.py`
- command: live trace確認コマンド
- result: trace件数と代表ケースをBacklogコメントへ記録する

未決事項:
- Cortex Analyst実接続をこのチケットで含めるか、まずSnowflake SQL liveに限定するか
- Trace StoreをSnowflake tableへ寄せるタイミング
```

## RAIOPS-8: ルーティング行列をstructured/search/mixed/unsupportedで実装する

```text
目的:
ユーザー質問を structured KPI、business definition search、mixed、ambiguous、unsafe action、unsupported に分け、適切なtoolまたはsafe-stopへ誘導する

背景:
現行routerは deterministic MVP として structured / business_definition / ambiguous / unsupported の一部を扱える
今後Cortex Analyst、Cortex Search、Cortex Agents、human approvalを扱うには、質問種別ごとの責務と失敗時の振る舞いを明確にする必要がある

作業内容:
- `docs/obsidian/04_Agent設計.md` のTool routing表を実装/テストへ反映する
- route種別を structured_kpi_question, business_definition_question, mixed_question, ambiguous_question, unsafe_action_request, unsupported_question として整理する
- safe-stop reasonを明示する
- follow-up context reuseのテストを維持する
- unsafe/raw/sensitive requestを拒否またはhuman approvalへ送る
- route matrix docsとplanner/router testsを更新する

受入基準:
- 代表質問が想定routeへ分類される
- `mixed_question` と `unsafe_action_request` の扱いが設計または実装で明確になっている
- unsupported caseがSQL生成やCortex実行へ進まない
- ambiguous caseが確認要求へ止まる
- route結果がtraceに残る
- route追加に合わせてGolden Evalが更新されている

証跡:
- repo path: `retail_ai_ops/planner.py`
- repo path: `tests/test_planner_and_trace.py`
- repo path: `docs/obsidian/04_Agent設計.md`
- repo path: `data/golden_eval.json`
- command: `pytest -q`
- command: `python3 -m retail_ai_ops.eval_runner`
- result: 実行結果をBacklogコメントへ記録する

未決事項:
- mixed questionでAnalyst first / Search secondをどこまで実装するか
- Cortex Agents本線に寄せるタイミング
```

## RAIOPS-9: send/write要求を承認キューに止める

```text
目的:
通知、送信、登録、変更などのwrite/action要求を、AIが自律実行せずhuman approval queueへ止める

背景:
このプロジェクトのAgentは、KPIを安全に調べる作業者であり、承認なしに外部送信やデータ更新を行うべきではない
LLMOps学習では、回答品質だけでなく、危険操作を止める設計とtraceが重要になる

作業内容:
- unsafe_action_request routeを定義・実装する
- Streamlit UIにapproval candidate表示または承認キュー表示を追加する
- approval logに question, proposed_action, route, reason, approved/rejected を残す
- 「この結果を店長に送って」のような要求をhuman approval requiredへ止める
- 承認前に外部送信・データ更新が発生しないことをテストする

受入基準:
- send/write/action要求が自律実行されない
- human approval requiredとしてUIまたはtraceに表示される
- approval logに必要情報が残る
- unsafe action caseがGolden EvalまたはUI E2Eに含まれる
- diagram readinessでHITL/承認系ノードの進捗が証跡ベースに更新される

証跡:
- repo path: `retail_ai_ops/planner.py`
- repo path: `streamlit_app/app.py`
- repo path: `retail_ai_ops/trace.py`
- repo path: `data/golden_eval.json`
- command: `pytest -q`
- command: UI E2E追加後の実行コマンド
- result: approval-required traceとUI screenshotをBacklogコメントへ記録する

未決事項:
- approval logをJSONL、SQLite、Snowflake tableのどれに保存するか
- 承認ボタンは初期で模擬に留めるか、実際の外部アクションを将来接続するか
```

## RAIOPS-10: Analyst review用のEvidence Workbenchを作る

```text
目的:
Streamlit UIを、単なるチャット画面ではなく、Analystが回答、SQL、結果、引用、trace、approval queueを確認できるEvidence Workbenchにする

背景:
現行Streamlit UIはchat input、route/plan、SQL preview、result、trace pathを表示できる
ただし、回答品質確認、根拠確認、承認判断、error taxonomy確認のための作業面としてはまだ不足している

作業内容:
- Answer、Route/Plan、SQL/Request、Result、Citation、Trace、Approval Queueを分けて表示する
- local_explicit_testとsnowflake live modeの違いをUI上で明確にする
- Snowflake live失敗時にlocalへ自動切替しないエラー表示を維持する
- human review candidateやapproval requiredを見やすく表示する
- trace eventの保存先と最新eventをUIから追えるようにする

受入基準:
- Analystが回答根拠とSQL/resultを同一画面で確認できる
- live/local modeが混同されない
- human review candidateがUIで分かる
- unsafe action requestがapproval queueへ止まる表示がある
- UI E2Eまたはスクリーンショット証跡がある
- 回答品質テスト未実施の状態でreadinessを過大評価しない

証跡:
- repo path: `streamlit_app/app.py`
- repo path: `retail_ai_ops/trace.py`
- repo path: `outputs/`
- command: `RETAIL_AI_OPS_RUNTIME=local_explicit_test streamlit run streamlit_app/app.py`
- command: `RETAIL_AI_OPS_RUNTIME=snowflake streamlit run streamlit_app/app.py`
- result: screenshot/PagesまたはUI実行結果をBacklogコメントへ記録する

未決事項:
- UI E2EをPlaywrightで固定するか、Streamlit向けの軽量確認にするか
- Cortex Analyst/Searchの実接続表示をどの段階で追加するか
```

## RAIOPS-11: 初期5シナリオのUI E2Eを追加する

```text
目的:
初期5シナリオをUI上で実行し、route、SQL/result、safe-stop、approval required、trace保存が期待通りに動くか確認する

背景:
pytestやGolden Evalは重要だが、ユーザーが触るStreamlit画面での崩れ、表示不足、モード誤認、approval表示漏れまでは捕まえにくい
readinessを上げるには、UIを含むE2E証跡が必要になる

作業内容:
- 初期E2Eシナリオ5件を定義する
- local_explicit_testでUI E2Eを実行する
- Snowflake live modeはcredentials不足時に明示エラーになることを確認する
- answer、route、SQL preview、result、trace、approval表示を検証する
- screenshotまたはtraceを証跡として保存する

受入基準:
- 5シナリオがテストケースとして定義されている
- structured KPI質問でroute/SQL/resultが表示される
- follow-up質問でcontext reuseが働く
- unsupported/ambiguous caseが無理回答されない
- send/write要求がapproval requiredになる
- UI E2E結果がBacklogコメントまたはrepo outputsから追える

証跡:
- repo path: `tests/` または `e2e/`
- repo path: `streamlit_app/app.py`
- repo path: `outputs/`
- command: UI E2E実行コマンド
- result: trace/screenshots/summaryをBacklogコメントへ記録する

未決事項:
- Streamlit UI E2Eの実行方法をPlaywrightにするか、軽量スモークにするか
- CIでUI E2Eを毎回走らせるか、手動/夜間/重要変更時にするか
```

## RAIOPS-12: 最初のSnowpark責務をeval/trace enrichmentで決める

```text
目的:
Snowparkをどこで最初に使うかを、dbt SQLとの差分、LLMOps学習価値、実装複雑度、検証可能性から判断する

背景:
Snowparkはこのプロジェクトの中級以上の学習候補として積極的に扱う
ただし、単純joinや月次集計をSnowparkへ逃がすと、dbt品質とPython実行品質の境界が曖昧になる
最初の候補はeval/trace enrichmentであり、LLMOps、評価、human reviewに近い

作業内容:
- `docs/architecture/snowpark-integration-design.md` と `docs/architecture/dbt-snowpark-design.md` を参照する
- 候補を比較する: dbt Python model、Stored Procedure、UDF、defer
- 最初のSnowpark責務を `eval / trace enrichment` とするか判断する
- Cortex Agents custom toolとの関係を整理する
- App Runtime Tool Adapterから直接呼ぶ設計との二重化リスクを書く
- 採用/非採用/保留の理由をADRとして残す

受入基準:
- Snowparkを使う理由がSQL/dbtとの差分で説明されている
- 最初のSnowpark責務が1つに絞られている
- dbt Python model、SP、UDF、deferの比較がある
- silent fallback禁止が明記されている
- readinessは実装より検証を重く見る方針になっている
- SPCSは将来候補として残しつつ、今回の主線に入れない理由が書かれている

証跡:
- repo path: `docs/architecture/snowpark-integration-design.md`
- repo path: `docs/architecture/dbt-snowpark-design.md`
- repo path: `docs/architecture/learning-stage-strategy.md`
- repo path: `docs/architecture/raiops-2-12-preimplementation-gate.md`
- Backlog: `RAIOPS-12`
- result: ADR判断をBacklogコメントへ記録する

未決事項:
- Snowpark実装をこのプロジェクト内で進めるか、実装repoへ移すか
- Cortex Agents custom toolをいつlive検証するか
```

## RAIOPS-13: RBACとコストガードレールの基本証跡を作る

```text
目的:
本番級のIAM/FinOpsを作り込まず、AIアーキテクトとして破ってはいけないRBAC・コスト境界を小さく証跡化する

背景:
このプロジェクトではセキュリティ/コストを深掘りしすぎないが、role boundary、LLM-safe fields、unsupported/sensitive拒否、XS warehouse、query limit、trace metadataは学習価値が高い
安全境界を省くと、実務寄りAI/LLMOps設計として片手落ちになる

作業内容:
- role想定を整理する: store_manager, regional_manager, analyst, admin
- LLM-safe fieldsと渡してはいけない情報を明記する
- sensitive/raw/personal data要求を拒否するテストを維持・拡張する
- cost-relevant trace fieldsを整理する
- Snowflake warehouseをXS/auto suspend前提にする
- query timeout、max result rows、query tag、resource monitor設計メモを残す

受入基準:
- role boundaryとLLM-safe fieldsが文書化されている
- 顧客個人情報やraw row要求がunsupported/safe-stopになる
- traceに秘密情報を残さない方針がある
- cost-relevant fieldsが定義されている
- Snowflake live pathでコスト暴走を避ける基本前提が書かれている
- 深掘りしない範囲が明確になっている

証跡:
- repo path: `docs/obsidian/06_セキュリティ・コスト境界.md`
- repo path: `retail_ai_ops/planner.py`
- repo path: `tests/test_planner_and_trace.py`
- repo path: `sql/00_setup_from_snowflake_sample.sql`
- command: `pytest -q`
- result: sensitive拒否テストとコスト境界メモをBacklogコメントへ記録する

未決事項:
- Snowflake role/RBACを実際に作るか、初期は文書+router testに留めるか
- resource monitorをtrial環境で作るか、設計メモに留めるか
```

## RAIOPS-14: 実装証跡をdiagram readinessへ反映する

```text
目的:
実装・検証で得た証跡を、構成図HTMLのhover tooltip、readiness percentage、備考、役割分担へ反映する

背景:
このrepoの主役は、imagegen由来のシステム構成図を高忠実にHTML再現し、学習用のreadiness metadataを持たせること
実装が進んでも構成図に反映されなければ、学習・レビュー・HITLで現在地を把握できない
一方で、テストや回答品質確認がない実装だけでreadinessを過大評価してはいけない

作業内容:
- 実装証跡に合わせて構成図のtooltipを更新する
- progress percentageは実装量ではなく、品質確認済みreadinessとして更新する
- 実装状況と備考を分けて書く
- DE/DS/AIアーキテクト/AIエンジニア/PM/PGの設計・レビュー関与割合を必要に応じて更新する
- 矢印、テキスト重なり、はみ出し、ラベル欠落をlintで確認する
- GitHub Pagesで表示確認する

受入基準:
- diagram tooltipが実装証跡と矛盾していない
- progress percentageが `docs/architecture/progress-readiness-rubric.md` の基準に沿っている
- 実装だけでテスト未実施のノードが過大評価されていない
- `node tools/check_diagram_quality.mjs` が通る
- `node tools/check_feedback_reflection.mjs` が通る
- GitHub PagesまたはローカルHTMLで表示確認できる

証跡:
- repo path: `docs/architecture/retail-ai-ops-copilot-architecture.html`
- repo path: `docs/architecture/progress-readiness-rubric.md`
- repo path: `outputs/`
- command: `node tools/check_diagram_quality.mjs`
- command: `node tools/check_feedback_reflection.mjs`
- screenshot/Pages: GitHub Pagesまたはローカル確認画像
- result: lint結果と表示確認結果をBacklogコメントへ記録する

未決事項:
- 実装repo側の証跡をどの形式でこのrepoへ持ち込むか
- readiness更新をBacklog完了条件にどこまで厳密に結びつけるか
```
