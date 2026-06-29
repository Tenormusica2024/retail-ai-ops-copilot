# Parallel Session Implementation Plan

作成日: 2026-06-29

## 目的

この文書は、設計部分が固まった後に、実装タスクを複数のCodex
sessionへ安全に分割するための作業設計である。

現時点では、すぐに複数セッションで実装を開始しない。まず設計書、
Backlogチケット、受入基準、検証コマンド、共有ファイルの編集責任を
そろえてから、並列化する。

## 基本方針

- repo docsを正本にする
- Backlogは作業単位、進行状態、証跡コメントの面として使う
- 1 sessionは原則1 laneまたは1 Backlog ticketだけを担当する
- 複数sessionが同じファイルを同時編集しないよう、共有ファイルは
  main sessionが統合する
- 実装sessionは、受入基準と実行コマンドが明記されたあとに開始する
- Snowflake/Cortex/Snowparkのlive挙動に関わる作業は、silent fallbackを
  入れない
- 各sessionは最後に、変更ファイル、実行コマンド、失敗/未実施理由、
  次sessionへの引き継ぎを書き残す

## 並列開始前ゲート

並列実装へ進む前に、main sessionで次を確認する。

| Gate | 内容 | 証跡 |
| --- | --- | --- |
| 設計正本 | 該当scopeのrepo docsが更新済み | `docs/architecture/**`, `docs/project-management/**` |
| チケット粒度 | Backlog ticket単位で目的、作業内容、受入基準、証跡が分かる | `docs/project-management/backlog-ticket-bodies.md` |
| 依存関係 | 先行/後続ticketと共有ファイルが分かる | この文書のlane表 |
| 検証方法 | sessionごとの最小検証コマンドが明記されている | ticket本文またはsession brief |
| 統合責任 | main sessionが統合する共有ファイルが決まっている | session brief |
| 秘密情報境界 | credentialsやprivate intentをrepoに入れない | public-safety scan |

このゲートが未完了の間は、並列sessionはレビュー、調査、設計案作成までに
留める。

## 並列化しやすい実装lane

| Lane | 主なBacklog | 担当scope | 編集しやすいファイル | 先行条件 |
| --- | --- | --- | --- | --- |
| dbt品質gate | `RAIOPS-4` | dbt tests、data tests、readiness gate | `dbt/models/**/schema.yml`, `docs/architecture/progress-readiness-rubric.md` | `RAIOPS-3` parse/compile証跡 |
| Semantic契約 | `RAIOPS-5` | Semantic Model YAML、verified query、KPI定義seed整合 | `semantic/**`, `dbt/seeds/**`, `docs/architecture/dbt-snowpark-design.md` | mart契約とdbt model名が固定済み |
| Golden Eval拡張 | `RAIOPS-6` | answer-quality eval、unsupported/limited case、trace出力 | `data/golden_eval.json`, `retail_ai_ops/eval_runner.py`, `docs/obsidian/03_LLMOps設計.md` | KPI名、grain、unsupported範囲が固定済み |
| Cortex live trace | `RAIOPS-7` | Snowflake/Cortex live質問、trace 5件、失敗分類 | `docs/architecture/**`, `outputs/**` またはtrace出力先 | Semantic契約とlive credentials準備 |
| Agent runtime | `RAIOPS-8`, `RAIOPS-9` | route matrix、safe-stop、承認キュー | `retail_ai_ops/**`, `tests/**` | eval caseとtrace schemaの期待値 |
| Evidence Workbench / UI | `RAIOPS-10`, `RAIOPS-11` | Streamlit表示、UI E2E、証跡ワークベンチ | `streamlit_app/**`, `tests/**`, `outputs/**` | runtime API/trace fieldsが固定済み |
| Diagram readiness | `RAIOPS-14` | 構成図tooltip、readiness、Pages確認 | `docs/architecture/retail-ai-ops-copilot-architecture.html` | 各laneの検証証跡 |

## main session専有または統合推奨ファイル

次のファイルは、衝突と意味のズレが起きやすいので、複数sessionが直接
同時編集しない。各laneは提案または小差分を出し、main sessionが統合する。

- `README.md`
- `AGENTS.md`
- `.agent-feedback/FEEDBACK_LEDGER.md`
- `.agent-feedback/PROJECT_SKILL.md`
- `docs/project-management/backlog-ticket-bodies.md`
- `docs/project-management/backlog-initial-ticket-map.md`
- `docs/architecture/retail-ai-ops-copilot-architecture.html`
- `docs/obsidian/**`

例外として、main sessionが明示的に担当分割し、編集範囲と検証コマンドを
指定した場合だけ、単独sessionが直接編集してよい。

## Session Brief Template

並列sessionへ渡す指示は、最低限次の形にする。

```text
目的:

対象Backlog:

編集してよいファイル:
- 

触らないファイル:
- 

前提設計:
- repo path:
- 決定済み事項:
- 未決事項:

受入基準:
- 

検証コマンド:
- 

報告してほしいこと:
- 変更概要
- 実行したコマンドと結果
- 失敗/未実施の理由
- 共有ファイルへ反映すべき提案
- 次sessionへのブロッカー
```

## 初期の分割順

設計が固まったあと、最初に並列化するなら次の順が扱いやすい。

1. main session: `RAIOPS-4` のdbt test/readiness設計を最終化する
2. session A: dbt testsとdata quality gateを実装・検証する
3. session B: Semantic Model YAMLとKPI定義seedの整合案を作る
4. session C: Golden Eval拡張案とeval runner変更案を作る
5. main session: A/B/Cの成果を統合し、diagram readinessとBacklog証跡を更新する

`RAIOPS-7` のCortex live traceは、Semantic契約とdbt test gateが最低限
固まってから始める。live traceを急ぐと、失敗時にdbt、semantic、Cortex、
agentのどこが原因か切り分けにくくなる。

## 分割しない方がよい作業

- 技術選定や責務境界が未決のまま進める実装
- 同じHTML構成図を複数sessionで同時編集する作業
- live credentialsを扱う作業を複数sessionへ同時に渡すこと
- feedback ledgerやproject skillを複数sessionが同時更新すること
- 受入基準のない「とりあえず実装」

## 次の判断

現時点の自然な次工程は、`RAIOPS-4` のdbt tests/readiness gate設計を
固めること。

その設計ができたら、`dbt品質gate`、`Semantic契約`、`Golden Eval拡張`を
最初の並列候補として具体化する。
