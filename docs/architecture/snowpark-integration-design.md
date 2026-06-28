# Snowpark Integration Design

調査日: 2026-06-28

このメモは、現在の `Retail AI Ops Copilot` 構成図をベースに、実装へ入る前に Snowpark をどこへ置くか、どのノードと関係を持つかを整理するための設計メモ。

## 結論

今回の構成図では、Snowpark を `Snowpark Python / UDF / SP` として Snowflake Account 内に追加する。

Snowpark は Cortex Analyst / Cortex Search / Cortex Agents の代替ではなく、Snowflake 内で Python 処理、UDF、Stored Procedure、dbt Python model、eval runner、trace enrichment を動かす実行面として扱う。

Snowpark Container Services は今回の主線ノードにはしない。SPCS は Airflow、JupyterLab、MLflow、custom API、長時間ジョブなどを Snowflake 境界内でコンテナ実行したい段階で追加検討する。

## 構成図に出す相関関係

| 関係 | 図での表現 | 意味 | 実装前メモ |
| --- | --- | --- | --- |
| dbt tests / dbt Python -> Snowpark Python | `dbt Python / UDF / SP` | SQL/dbtだけで扱いにくいPython変換やUDF/SPをSnowflake内で実行する候補 | まずはdbt本体が未実装なので readiness は 0% のまま |
| Cortex Agents -> Snowpark Python | custom tool的な短い実行線 | Cortex Agents custom tools は Stored Procedure / UDF を呼べるため、業務ロジックや補助計算の実行先になりうる | App Runtime側Tool Adapterと二重化しないよう、どちらが呼ぶかは実装前に決める |
| Snowpark Python -> Trace Store | `eval / trace 拡張` | Snowflake内eval runner、trace enrichment、data-quality jobの結果をTrace Storeへ保存する候補 | 最初の実装候補は小さいSPでeval/trace集計を返す形がよい |

## 図に直接出さないが考えておく関係

| 関係 | 今回線にしない理由 | 実装前に考えること |
| --- | --- | --- |
| CI/CD -> Snowpark | 図が過密になるため、CI/CD tooltip と設計mdで扱う | UDF/SP、dbt Python model、package参照、権限、テストをCIでどう検証するか |
| Snowpark -> Semantic KPI Model | 現時点ではSemanticはdbt martを読む設計が主線 | Snowparkが特徴量や補助集計を作るなら、dbt martまたはsemantic入力へどう渡すか |
| Tool Adapter -> Snowpark | App Runtimeから直接SP/UDFを呼ぶ設計も可能だが、Cortex Agents custom toolと責務が重なりやすい | MVPでは直接呼び出しを避け、Cortex Agents寄せにするかApp Runtime寄せにするかを明示 |
| Snowpark Container Services | 追加するとAirflow/Jupyter/MLflow/custom APIの別レイヤーが必要になり、今回の図の焦点が散る | 中級編でcontainerized servicesを扱うなら、Compute Pool、Service、Job Service、Image Repositoryを別枠で追加 |

## 実装前に詰めること

1. 最初のSnowpark責務を1つに絞る

   候補は `eval runner / trace enrichment` が最もLLMOps学習に近い。dbt Python modelはdbt実装後、Cortex Agents custom toolはCortex Agents実接続後に評価する。

2. Snowparkを使う理由をSQL/dbtとの差分で説明する

   SQL/dbtで十分な集計はSnowparkへ逃がさない。Pythonパッケージ、UDF/SP再利用、評価処理、ML feature、trace enrichmentなど、Snowparkの責務を明確にする。

3. Silent fallback禁止を維持する

   Snowparkが使えない場合にローカルPythonへ黙って切り替えない。実装時は失敗を明示し、`local_explicit_test` は明示テストモードだけにする。

4. readinessは実装より検証を重く見る

   ノードを追加しても、Snowpark実行、権限、テスト、Trace Store保存、評価結果の品質確認がない限り 0% のままにする。

5. SPCSは発展候補として積極的に残す

   公開SPCSデモ記事ではSPCS上にAirflow/dbt/JupyterLab/MLflowを載せる例があり、実務的な学習価値は高い。ただし今回の図ではまずSnowpark Python/UDF/SPを本線に置き、SPCSは要件が出た段階で別枠化する。

## 参照情報

- Snowflake Quickstart: Data Engineering with Snowpark Python and dbt
  - dbt Python modelはSQLだけで解けない変換に使え、Snowpark PythonはDataFrame API、UDF、UDTF、Stored Procedure、Anaconda連携を含む
- Snowflake Documentation: Cortex Agents
  - Cortex Agents custom tools は Stored Procedure / UDF を使って独自ロジックやbackend system呼び出しを実装できる
- Snowflake Documentation: Writing stored procedures with SQL and Python
  - Snowpark APIを使ったPython stored procedureでSnowflake tableに対する処理を行い、tasksでスケジュールできる
- Snowflake Documentation: Snowpark Container Services compute pools
  - SPCSはCompute Pool上でservices/job servicesを実行する。min/max nodesやinstance familyを持つため、図に入れる場合はコスト/運用境界も必要
- Zenn public article: SPCSをフル活用してSnowflakeで完結するデータ基盤を作ってみた
  - SPCS上でAirflow、dbt、JupyterLab、MLflowを使い、Snowflake内でデータ変換からML実験管理まで行うデモが紹介されている
