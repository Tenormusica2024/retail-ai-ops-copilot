---
cssclasses: [excel-agent-wide-table]
---

# 07_MVP実装計画・受入基準

## Phase 0: 設計と同期

- Obsidian project directory を作成する
- repo mirror を作成する
- GitHub repository を作成する
- 設計書を同期できるようにする

完了条件:

- `python3 tools/sync_obsidian_docs.py --direction check` が通る
- repoに設計書がpushされている

## Phase 1: ローカルMVP骨格

Snowflake接続前またはCortex課金を抑えたい時に、明示的な `local_explicit_test` でAgent設計を検証する。これはSnowflake失敗時の代替実行ではなくテストハーネス。

- Snowflake sample martと同じ契約を前提にしたlocal explicit test data
- semantic model YAML draft
- router
- planner output
- trace schema
- golden eval file
- Streamlit minimal UI

完了条件:

- 10件以上のgolden evalがある
- structured / ambiguous / unsupported のrouteが分かれる
- traceがJSONLまたはSQLiteに残る
- follow-upで前回contextを再利用できる
- Snowflake live modeではlocal_explicit_testへ自動切替しない

## Phase 2: Snowflake / Cortex接続

- Snowflake trial account を使う
- small warehouse
- `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1` からdbtでsource/staging/intermediate/mart/seed/testsを作成
- Tasty Bytesが利用できる場合は同じmart契約に差し替える
- Snowparkは初期mart集計の代替ではなく、baseline安定後のeval/trace enrichment、dbt Python model、UDF/SP候補として扱う
- Cortex Analyst semantic model
- verified query候補
- StreamlitからCortex Analystを呼ぶ

完了条件:

- 少なくとも5件のKPI質問がSnowflake経由で回答できる
- SQL/result/answerがtraceに残る
- unsupported caseが無理に回答されない

## Phase 3: LLMOps loop

- eval run command
- regression diff
- error taxonomy集計
- human review sheet
- prompt/semantic model version registry

完了条件:

- semantic model変更前後でeval結果を比較できる
- 失敗ケースに error category が付く
- human review candidate が出力される

## Phase 4: Cortex Search small slice

- KPI定義、週報メモ、販促メモを少量登録
- Cortex Search または明示的なlocal_explicit_test検索で検証
- mixed question の route を試す

完了条件:

- KPI定義質問に引用付きで回答できる
- structured KPI と docs search のtool traceが分かれている

## 初期E2Eシナリオ

1. 「先週、東京エリアの粗利率が落ちた理由を見て」
2. 「大阪は？」
3. 「欠品リスクが高いカテゴリは？」
4. 「same-store sales の定義は？」
5. 「この結果を店長に送って」 -> approval required

## 受入対象外

- UIだけ成功表示する
- SQLが動いただけでanswer correctnessを見ない
- LLMが推測した要因を根拠として扱う
- raw rowsを大量にプロンプトへ入れる
- approvalなしに通知/書き込みを実行する
