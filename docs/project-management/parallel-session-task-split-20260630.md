# Parallel Session Task Split 2026-06-30

作成日: 2026-06-30

## 目的

Retail AI Ops Copilot の主要タスクへ戻るために、最大3つの別セッションへ
渡す作業を分割する。

この文書は、実装開始前のタスク分割と受入基準の正本である。作成時点では
dispatch証跡ではなかったが、2026-06-30の再実行結果は下の再実行状況に追記する。

状態語は次のように分ける。

| State | この文書での扱い |
| --- | --- |
| `brief_drafted` | この文書で作成済み。まだdispatchではない |
| `posted` | まだ該当なし。Issue/commentなどのdispatch surfaceへ未投稿 |
| `delivered` | まだ該当なし。pane/Issue bridge送信前 |
| `accepted` | まだ該当なし。受信側session transcriptやworktree証跡なし |
| `reported` | まだ該当なし。各sessionからの報告前 |
| `reviewed` | まだ該当なし。成果物レビュー前 |
| `integration_ready` | まだ該当なし。統合判断前 |

`brief_drafted` は `posted` ではない。タスクbriefを書いただけで、別sessionへ
届いた、受理された、作業が始まった、レビュー済みになった、とは扱わない。

## 2026-06-30 再実行状況

ユーザーのサブスク更新後、前回usage limitで停止したLane A/Cを実sub-agentで再実行した。

| Lane | Agent | 状態 | 結果 |
| --- | --- | --- | --- |
| A | Galileo `019f189e-8360-75c0-a4bd-d13f415d1673` | `reported` | `dbb4062` でKPI再集計契約を補強。main sessionが差分と静的dbt検証を再確認 |
| C | Banach `019f189e-cded-78d0-9704-a7163da921da` | `reported` | Backlog本文stale、RAIOPS-15本文化不足、dispatch具体値不足を指摘。main sessionが修正対象化 |

この再実行はmulti-agent tool上の実sub-agentであり、前回の
`main-context substituted` とは区別する。ただし、Lane Cはread-only reportであり、
`reviewed` / `integration_ready` はmain sessionの artifact review と修正後検証まで
上げない。

## 結論

主要タスクへ戻ってよい。

現在の自然な本線は `RAIOPS-4` の dbt 品質gateである。Backlog/Slack通知は
補助laneとして設計済みだが、本線のブロッカーではない。

Backlogチケット管理は、実装者へ作業を渡すための設計面としては移行可能に近い。
ただし、Backlog運用そのものを別sessionへ任せるには、まだ一度
`Backlog/チケット運用QA` laneでレビューさせるのが安全である。

理由:

- `docs/project-management/backlog-workflow.md` にBacklogの役割、Slack境界、
  DoD、並列sessionルールがある
- `docs/project-management/parallel-session-implementation-plan.md` に受理確認、
  shared file boundary、RAIOPS-4/RAIOPS-15 briefがある
- `skills/ai-architecture-learning/child-skills/backlog-ticketing/SKILL.md` に
  日本語first、証跡、公開情報/推定境界がある
- ただし、実Backlog説明欄との差分監査、チケット本文の現物同期確認、
  session別のBacklog更新権限、Backlogコメントの品質レビューは未検証

したがって、Backlogチケット管理は `delegation-ready for review` であり、
`fully migrated/autonomous` ではない。

## 2026-06-30 Terminal Dispatch Set

LLがLane Bレビューを完了報告した後の再dispatchでは、空きTerminalを次の
3タスクセットとして使う。

| Terminal | 今回の役割 | 目的 | 状態の扱い |
| --- | --- | --- | --- |
| LL | AIミスパターンHTML可視化 実装者 | `code-review-ai-mistake-patterns` を人間が眺めて改善できるHTMLへする | 新規dispatch対象。前回Lane Bの`reported`とは別タスク |
| UR | Backlog/チケット運用QA | Lane Cとして、Backlogチケット管理とSlack通知設計の委譲可能性をレビューする | review-first。編集は原則しない |
| LR | RAIOPS-15 Slack通知シミュレーター 実装者 | `private_simulation` のBacklog更新通知生成を実装する | 実装可。外部送信は禁止 |

この3タスクはセットで扱う。理由は、実装タスクだけを先に進めるのではなく、
並列作業の品質、チケット運用、AIレビュー観点の可視化を同時に育てるためである。
ただし `accepted` / `reported` / `reviewed` / `integration_ready` はTerminalごとに
別々に判定する。1つのTerminalが報告しても、他のTerminalの受理や完了の証拠には
しない。

main sessionは観測者・統制者であり、委譲laneの作業を黙って巻き取らない。
うまく進んでいないことが確認できた場合は、まず状態を分けて同じ該当sessionへ
修正指示を再送する。mainが代替実装する場合は、ユーザー許可またはlane利用不能を
明示し、`main-context substituted` として扱う。

今後のTerminal dispatchでは、各laneの完了報告前にlane内客観レビューを通す。
sub-agent toolingが使える場合はread-onlyの客観視サブエージェントを起動し、
使えない場合は `reviewer type=unavailable` または
`main-context self-review` として明記する。

lane内客観レビューで出た指摘は、artifact bug、evidence overclaim、stale docs、
branch/integration risk、reviewer-process gap などに分類し、反映先案も添えて
mainへ返す。main sessionはその指摘の妥当性と、該当スキル・台帳・ルールへの
反映漏れがないかだけを重点監査する。これにより、mainが全レビューを抱え込んで
並列作業が詰まる状態を避ける。

### Terminal Dispatch Set Review Status

| Terminal | 状態 | main sessionの確認 | 統合判断 |
| --- | --- | --- | --- |
| LL | `reported` | `209b09d` で `docs/project-management/code-review-ai-mistake-patterns.html` と `docs/index.html` を作成。HTML parse、リンク実在、`git diff --check` をmain側で確認 | `reviewed`。GitHub Pages入口の挙動変更は統合前に意図として明記する |
| UR | `reported` | Backlog/チケット運用QAは `needs-fix`。実Backlog説明欄diff監査、実同期確認、更新権限、Backlogコメント品質チェックが未完 | `rejected` ではないが `integration_ready` ではない。次は同laneへQA不足の補強指示を返す |
| LR | `reported` | `9c5e748` で `private_simulation` 通知シミュレーターを実装。main側で `node --test`、二重通知抑止、`sent_external=false`、`git diff --check` を再確認 | `reviewed`。外部Slack/Backlogの確認は別laneまたはbrowser-capable sessionで扱う |

LLはresume直後に古いworktreeへ入っていたため、今後のbriefではabsolute
worktree path、`pwd`、branch、HEAD、statusの報告を必須にする。

### 実装差分と構成図ノード対応

この時点の過去差分を振り返るときは、レビュー可視化HTMLやテストパターン一覧と、
先に並列/代替実装されたソースコード差分を混同せず、どの構成図ノードの
readiness証跡になったのかを明示する。

この節は、将来の作業順を「実装、コードレビュー、可視化HTML」に固定する
ものではない。あくまで、過去に進んだ実装差分のノード対応を確認するための
整理である。

| 差分 | 実装種別 | 主に対応する構成図ノード | 進捗更新の注意 |
| --- | --- | --- | --- |
| `dc10d33` | `main-context substituted`。Lane Aがusage limitで返らなかったためmainがRAIOPS-4 seed定義の検証を実装 | `KPI定義マスタ`, `KPI定義マスタ整合性テスト` | seed schema testsとsingular testsの証跡。構成図の単一 `dbt tests` ノードがstaging/marts後段の総合テストを表すなら、この差分だけでそのノードを進捗更新しない |
| `dbb4062` | real sub-agent Lane Aレビュー後の補強実装 | `KPI定義マスタ`, `KPI定義マスタ整合性テスト` | KPI定義seedと再集計契約を補強。`dbt staging` / `dbt marts` / `Semantic KPI Model` / `Golden Eval` を直接進めた証跡ではない |
| `9c5e748` | real delegated LR実装 | 構成図外の運用補助面、または将来追加する `Backlog/Slack通知` 系ノード | `private_simulation` の通知生成コード。現行システム構成図のAI回答パイプライン進捗を上げる証跡ではない |
| `209b09d` | real delegated LL実装 | 構成図外のレビュー可視化面 | コードレビューの可視化HTML。レビューskill/学習面の成果であり、アプリ本体ノードの実装進捗ではない |

したがって、直近で構成図の進捗率更新候補になる中心は
`KPI定義マスタ` である。`dbt tests` ノードを更新する場合は、そのノードが
「KPI定義マスタ整合性テスト」を含む小さな検証ノードとして表現されている場合に
限る。現在のように `dbt staging` / `dbt marts` の後段に置かれた単一ノードなら、
seed向けテストだけでは `dbt tests` 全体を進めたとは扱わない。

### 2026-07-01 次候補: テストパターンHTML可視化

ユーザーは、このプロジェクトで使うべきテストパターンを把握するための
GitHub Pages HTMLページを希望している。ただし、このタスクは現時点では
`brief_drafted` 相当であり、まだ別paneへ `posted` / `delivered` / `accepted`
された扱いにしない。

候補タスク:

| 項目 | 内容 |
| --- | --- |
| 目的 | テストパターン、証跡レベル、現状の不足、今後使うべき理由を日本語firstで可視化する |
| 想定HTML | `docs/project-management/test-patterns.html` |
| 想定リンク | `docs/index.html` と既存レビュー/構成図ページから相互リンク |
| 必ず読むskill | `skills/ai-architecture-learning/child-skills/test-pattern-reuse/SKILL.md` |
| 触ってよい候補 | `docs/project-management/test-patterns.html`, `docs/index.html`, 必要なら小さな静的検査スクリプト |
| 触らない候補 | `.agent-feedback/**`, `skills/**`, `AGENTS.md`, `docs/obsidian/**`, 実装コード本体 |
| 証跡要件 | HTML parse、リンク実在、`git diff --check`、必要ならローカル/Pages表示確認 |

既存の LL/UR/LR pane を再利用する前に、
`docs/project-management/parallel-session-implementation-plan.md` の
「既存レーン再割当て前の容量確認」を通す。過去の `reported` だけでは
空き扱いにしない。直近transcript、prompt待ち、worktree/branch/status、
旧タスクの未統合物、lane-localレビュー状況を確認してから `reuse_ready`
または `pause_then_reassign` と判定する。

一方で、履歴があるlaneを機械的に避け続けるとworker容量が枯渇する。再利用判断では
直近ロールの継続性を優先する。実装履歴があるlaneは次の実装候補、レビュー履歴がある
laneは次のレビュー候補、ロールが曖昧なlaneは新規/調査/短期検証候補として扱う。
旧LRの `RAIOPS-4 L5` は、直近ではRAIOPS-15 Backlog Slack通知シミュレーターの
`private_simulation` 実装laneであり、レビュー専用laneではない。

L1とL5はどちらもBacklog/Slack周辺に近いが、L1はBacklog/チケット運用QAの
review-first履歴、L5はRAIOPS-15通知シミュレーターの実装履歴である。
Backlog/Slack周辺作業を2本同時に進める必要がない場合は、片方だけを継続し、
もう片方には新しい主要タスクを振る。初期判断では、QAや運用設計レビューを続けるなら
L1、通知生成やworkflow/tooling実装を続けるならL5を残す。

今の段階では、全部のworker laneを意識的に埋める必要はない。空きlaneは、
タスク増加時、失敗時の代替、レビュー待ち吸収、急な調査依頼に対応するための
バッファとして残す。新しいタスクを1本進めるためにL5などを使うのはよいが、
L2/L4/L6まで同時に埋めることは目的化しない。

ただし、空きlane維持をreadyな独立タスクの待機理由にしない。Semantic、Golden Eval、
routing matrixのように編集範囲を分離できる場合は、reserveを最低1本残しながら
追加laneへdispatchする。並列化しない理由が「空きを残す」だけなら再検討する。

`reported` 成果物は次の task graph の入力である。実装laneが報告したら、
mainは独立レビューlaneへの引き渡し、または既知findingの corrective prompt
差し戻しを検討する。レビューlaneが報告したら、他の未レビュー実装成果物へ
そのレビューlaneを再割当てできないか確認する。`reported` を「待つだけ」の
状態に固定しない。

実装者laneには既存レビュー観点やAIミスパターンを読ませない。通常briefでは
baseline契約、source-of-truth docs、昇格済みルール、検証コマンドだけを渡し、
code-review child skill、findings-only HTML、過去レビューfinding、既知miss一覧は
レビューlane側のpattern-aware文脈に寄せる。レビューlaneは指摘だけでなく、
どのレビュー観点を強化すべきか、どのskill/test/lint/briefへ昇格すべきかを報告する。

Terminalへの貼り付けdispatchはlaneごとに逐次実行する。複数AppleScript送信を
同時に走らせると、clipboard/frontmost window競合により同じbriefが片方へ重複投入され、
別laneが未受理になる。送信、受信transcript確認、次lane送信の順で進める。

在宅作業でCodex利用量が増える前提では、8分割化は設計・実装に入るべき
容量拡張トラックとして扱う。main sessionをオーケストレーターとして除くと、
現状の実働laneは3本しかなく、dbt実装、実装レビュー、Backlog/チケットQA、
構成図/progress更新を同時に持つには不足する。

ただし、このテストパターンHTMLのような短期タスクを既存レーンへ渡せる場合でも、
それは8分割化の設計開始を止める理由にはしない。8分割化は別途、
title/tty、worktree、acceptance verification、lane-local review、統合負荷を
設計・検証してから稼働させる。

ただし、画面配置上はmain sessionの`upper_left`表示領域を小さくしない。
8分割という呼び名は理論上の配置枠であり、実働worker laneは最大6本を基準に
設計する。新しいlaneを登録する前に、HammerspoonのAlt+Terminalドラッグで
Terminalの位置とサイズを調整し、読み取り可能な幅、高さ、重なりなし、main session
の可視性維持を確認する。

既存の古いTerminal/Codexセッション削除はユーザー側の作業とする。main sessionは
古いセッションを勝手に閉じず、重複候補は`cleanup pending`として扱う。削除後に
再スキャンして、番号レーンとtitle/ttyを登録し直す。

2026-07-01の追加セットアップでは、旧`UR`/`LL`/`LR`をそれぞれ
`RAIOPS-4 L1`/`RAIOPS-4 L3`/`RAIOPS-4 L5`へタイトルロックごと更新し、
新規Terminalとして`RAIOPS-4 L2`/`RAIOPS-4 L4`/`RAIOPS-4 L6`をlane 2/4/6へ
作成した。新規Terminalでは`codex --yolo`を実行済み。これは起動・配置済み
状態であり、まだ個別タスクの`accepted`ではない。

2026-07-01時点では、LLが既存HTML可視化レーンとして近い役割を持つため、
`RAIOPS-4 LL` / `lower_left` へ `TESTPATTERN_HTML_LL_20260701` を配送した。
この行は配送記録であり、LLからの完了報告までは `reported` ではない。

## 推奨3レーン

| Lane | 役割 | 目的 | 状態 |
| --- | --- | --- | --- |
| A | dbt実装者 | `RAIOPS-4` のdbt品質gateを実装・検証する | brief作成済み。dispatch前 |
| B | 受託品質レビュワー | Lane Aの成果を、請負/受託開発品質としてレビューし、見逃しパターンを分類する | brief作成済み。dispatch前 |
| C | Backlog/チケット運用QA | Backlogチケット管理の品質と別session移行可否をレビュー・改善提案する | brief作成済み。dispatch前 |

main sessionはオーケストレーターとして、dispatch、accepted確認、成果物レビュー、
shared file統合、feedback ledger/skill反映、最終判断を担当する。

## Dispatch Base / Worktree Policy

実装またはレビューを別sessionへ渡す前に、main sessionは次を満たす。

- dispatch対象の正本docs/skillsが、対象sessionから読める状態にある
  - 推奨: dispatch base commitまたは専用branchに含める
  - 未コミットのまま渡す場合: brief本文に必要な正本内容を省略せず含める
- 各laneは専用worktreeを使う
- main checkoutで直接作業しない
- branch名、worktree path、base_ref、commit可否、push可否をbriefに書く
- 初回方針は `commit可 / push禁止`
- completion reportには worktree path、branch、base_ref、commit hash
  または未commit理由、changed files、実行コマンドを必ず含める
- shared file、feedback ledger、project skill、Obsidian mirrorはmain sessionが統合する

dispatch baseが曖昧な場合は、`posted` へ進めず `brief_drafted` のまま止める。

## Lane A: dbt実装者

### 目的

`RAIOPS-4` のdbt testsを、Semantic Model、Golden Eval、Streamlit UI、
Cortex readinessの前提ゲートとして実装・検証する。

これは `最小実装` ではなく、拡張可能な dbt validation slice である。

### 必ず読むもの

- `AGENTS.md`
- `docs/architecture/raiops-4-dbt-test-readiness-gate.md`
- `docs/architecture/dbt-snowpark-design.md`
- `docs/architecture/snowpark-integration-design.md`
- `docs/project-management/parallel-session-implementation-plan.md`
- `docs/project-management/backlog-ticket-bodies.md` の `RAIOPS-4`
- `skills/ai-architecture-learning/child-skills/dbt-readiness-gates/SKILL.md`

### 情報モード

- `implementation_brief_level=baseline`
- reviewer-only context intentionally withheld:
  レビュワー専用の全ミスカタログは渡さない
- 渡す情報:
  目的、scope、編集可能/禁止ファイル、正本docs、受入基準、検証コマンド、
  証跡レベル、live/static境界、shared file境界、Snowpark非実装境界
- 渡さない情報:
  code-review-ai-mistake-patterns全体、過去レビューfindingsの全一覧、
  findings-only HTML、known-miss catalog、reviewer-only trap一覧
- 禁止:
  baseline実装者にreviewer-only artifactを `参照`、`必読`、`確認`、
  `load/read` させない。必要になった場合はmainが
  `implementation_brief_level=full-pattern-aware` へ切り替え、理由を明示する
- promotion decision owner=main session

### 編集してよいファイル

- `dbt/models/**/schema.yml`
- `dbt/tests/**`
- `dbt/seeds/**`
- `docs/architecture/raiops-4-dbt-test-readiness-gate.md` の
  `Implementation Notes` 相当の実装メモだけ

### 触らないファイル

- `.agent-feedback/FEEDBACK_LEDGER.md`
- `.agent-feedback/PROJECT_SKILL.md`
- `skills/**`
- `AGENTS.md`
- `README.md`
- `docs/project-management/backlog-ticket-bodies.md`
- `docs/project-management/backlog-workflow.md`
- `docs/project-management/parallel-session-implementation-plan.md`
- `docs/architecture/progress-readiness-rubric.md`
- `docs/architecture/retail-ai-ops-copilot-architecture.html`
- `docs/obsidian/**`

### 決定済み境界

- KPI定義seed testsは `RAIOPS-4` に含める
- dbt singular testは、seed-row contractとmart再集計危険の静的guardまでを担当する
- `order_count`、`gross_margin_rate`、`avg_discount` の再集計危険は、
  dbt側で検知できる契約違反をまず守る
- Golden Eval追加、Semantic readiness更新、diagram tooltip/readiness更新、
  Backlog本文更新、Obsidian同期は main session への提案だけ返す
- `RAIOPS-4` ではSnowpark実装をしない
- Snowpark-aware観点では、`llm_contract`、`semantic_input`、`eval_input`、
  将来のtrace接続を壊さないことだけ確認する

### 実装範囲

- source/staging/intermediate/mart/seedの既存testsを確認する
- `kpi_definitions.csv` のseed contractを強化する
- mart固定粒度、KPI値範囲、再集計危険のtest配置を明確化する
- `order_count`、`gross_margin_rate`、`avg_discount` の再集計危険を
  dbt singular testで見る範囲と後段Golden Evalへ提案する範囲に分ける
- 現在のseed行とsingular test期待値が一致しているか確認する

### 受入基準

- 専用worktree、branch、base_ref、commit/push方針が報告されている
- `dbt --version` と `/tmp/retail-ai-ops-dbt-venv` /
  `/tmp/retail-ai-ops-dbt-profiles` の有無を確認している
- `dbt parse` が通る
- credentials-free `dbt compile --no-populate-cache --no-introspect --empty`
  が通る、または失敗理由が明確である
- `dbt ls --select tag:semantic_input --resource-type model --resource-type seed --resource-type test`
  の結果を報告している
- live `dbt build/test` を実行した場合、target、role、warehouse、
  database、schema、結果を残す
- live実行できない場合、parse/compileをlive成功として扱わない
- seed rowとsingular test期待値の整合を確認している
- 変更が許可ファイル内に収まっている
- 報告は日本語firstで、コマンド結果と未実施範囲を分ける

### 検証コマンド

```bash
/tmp/retail-ai-ops-dbt-venv/bin/dbt --version
test -x /tmp/retail-ai-ops-dbt-venv/bin/dbt
test -d /tmp/retail-ai-ops-dbt-profiles

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

SNOWFLAKE_ACCOUNT=dummy \
SNOWFLAKE_USER=dummy \
SNOWFLAKE_PASSWORD=dummy \
/tmp/retail-ai-ops-dbt-venv/bin/dbt ls \
  --project-dir dbt \
  --profiles-dir /tmp/retail-ai-ops-dbt-profiles \
  --select tag:semantic_input \
  --resource-type model \
  --resource-type seed \
  --resource-type test
```

live credentialsが明示的に使える場合のみ:

```bash
dbt deps --project-dir dbt
dbt seed --project-dir dbt --profiles-dir dbt --select kpi_definitions
dbt build --project-dir dbt --profiles-dir dbt --select tag:llm_contract+
dbt test --project-dir dbt --profiles-dir dbt --select tag:llm_contract+
```

seed row確認は、少なくとも `dbt/seeds/kpi_definitions.csv` の該当KPI行を読み、
singular testが要求する語彙、status、計算制約が現在のseed rowに存在するかを
報告する。

### 報告形式

```text
作業結果:
- worktree:
- branch:
- base_ref:
- commit:
- push:

変更ファイル:
- ...

静的検証:
- dbt --version:
- dbt parse:
- dbt compile --empty:
- dbt ls tag:semantic_input:

live検証:
- 実施/未実施:
- 未実施理由:
- 実施した場合のtarget/role/warehouse/database/schema:

seed row整合:
- 確認したKPI:
- singular test期待値との一致:

main sessionへの反映提案:
- readiness rubric:
- Backlog:
- Obsidian:
- diagram tooltip/readiness:
```

## Lane B: 受託品質レビュワー

### 目的

Lane Aの成果物を、AIアーキテクチャ学習用の単なる動作確認ではなく、
請負/受託開発でレビューに耐える品質として検査する。

レビュワーの主目的は、実装者の抜け漏れを見つけることだけではない。
見つかった問題をカテゴリ分類し、次回以降のレビューskill、domain skill、
lint/test、受入基準へ反映できる形で返す。

### 必ず読むもの

- `AGENTS.md`
- `docs/project-management/parallel-session-implementation-plan.md`
- `docs/project-management/parallel-session-task-split-20260630.md`
- `docs/architecture/raiops-4-dbt-test-readiness-gate.md`
- `skills/ai-architecture-learning/child-skills/code-review-ai-mistake-patterns/SKILL.md`
- `skills/ai-architecture-learning/child-skills/dbt-readiness-gates/SKILL.md`

### 情報モード

- `reviewer_context_level=pattern-aware`
- 対象実装brief: `implementation_brief_level=baseline`
- `promotion_decision` をfindingごとに返す
- レビュワーには、code-review-ai-mistake-patterns、dbt-readiness-gates、
  過去findings、証跡境界、state語彙、feedback-ledger反映先候補を渡す
- finding原因分類:
  `baseline-contract miss` / `reviewer-training miss` /
  `upstream-promotion candidate` / `reviewer-skill gap`
- レビュー育成:
  各findingで「どのreview lensが捕捉したか」「どのlensが弱かったか」
  「次に強化すべき対象がreviewer skill、domain child skill、lint/test、
  future brief、Backlog acceptance、project ruleのどれか」を返す

### 編集権限

原則read-only。

Lane Bはコード修正しない。必要ならレビュー報告だけを返す。
main sessionが、受け入れる指摘を実装者へ戻すか、skill/ledgerへ反映する。

### レビュー観点

必ず次を分類する。

| Category | 見ること |
| --- | --- |
| artifact bug | 実装やtest定義そのものの不具合 |
| evidence overclaim | parse/compile/local結果をlive成功や品質保証として過大主張していないか |
| contract mismatch | seed、fixture、semantic、eval、mart grainとtest期待値がズレていないか |
| stale docs | 設計書、Backlog本文、実装状態、コマンド結果が古くないか |
| branch/integration risk | 許可外ファイル、shared file編集、未同期、未検証差分がないか |
| reviewer-process gap | 今回のレビューskillや受入基準が足りず、次回も見逃しそうな点 |

### 報告形式

```text
レビュワー結論:
- reviewer_verdict: no_blocking_findings / fix_before_orchestrator_review / blocked のどれか

注意:
- `integration_ready` はmain sessionだけが発行する
- reviewerは `integration_ready` を宣言せず、必要なら
  `recommend_integration_ready_after_orchestrator_review` と書く

重大な指摘:
- file:line:
- category:
- 内容:
- なぜ受託品質上問題か:
- 修正または再レビュー提案:
- skill反映候補:

確認できたこと:
- ...

未確認:
- live実行など

次回以降のレビュースキル反映候補:
- code-review-ai-mistake-patterns:
- dbt-readiness-gates:
- Backlog ticketing:
- deterministic test/lint:
```

## Lane C: Backlog/チケット運用QA

### 目的

Backlogチケット管理を別sessionへ移行できる品質かレビューし、必要な改善案を出す。

このLaneは、repo docsを設計・受入基準の正本にしたまま、Backlogを
task surfaceとして運用するシミュレーションと、別sessionへの委譲可能性を
検査する。
ここでのBacklogは、設計正本ではなく、チケット状態、作業単位、証跡リンクの
durable task surfaceである。

### 必ず読むもの

- `AGENTS.md`
- `docs/project-management/backlog-workflow.md`
- `docs/project-management/backlog-ticket-bodies.md`
- `docs/project-management/backlog-initial-ticket-map.md`
- `docs/project-management/parallel-session-implementation-plan.md`
- `docs/project-management/backlog-slack-notification-design.md`
- `skills/ai-architecture-learning/child-skills/backlog-ticketing/SKILL.md`
- `skills/ai-architecture-learning/child-skills/backlog-slack-notification/SKILL.md`
- `skills/ai-architecture-learning/child-skills/code-review-ai-mistake-patterns/SKILL.md`

### 情報モード

- `reviewer_context_level=pattern-aware`
- 対象運用brief: `implementation_brief_level=baseline`
- `promotion_decision` をfindingごとに返す
- 実Backlog/実Slack操作は委譲しない
- Backlog/Slack/Issue配送の受理証跡、private simulation境界、日本語first、
  公開情報/推定/未確認の区別を厚めに渡す
- レビュー育成:
  findingsがなくても、どの運用QA lensを確認したか、どの証跡境界や
  ticket品質観点が弱いまま残るか、次に強化すべき対象を返す

### 編集権限

初回はreview-first。

直接編集してよいのは、main sessionが明示した小さな提案ファイルだけにする。
原則として、Backlog台帳、feedback ledger、project skill、Obsidian mirrorは
main sessionが統合する。

Lane Cは `RAIOPS-15` を実装しない。`tools/`、`fixtures/`、`outputs/`、
`tests/`、実Backlog設定、実Slack設定、Issue投稿は触らない。RAIOPS-15に関する
指摘は提案として返す。

### レビュー観点

- `RAIOPS-1` から `RAIOPS-14` の本文粒度が、実装者に渡せる具体性か
- `RAIOPS-4` のタスクbriefが、実装者とレビュワーで衝突しないか
- `RAIOPS-15` 候補が、補助laneとして本線を邪魔しない切り方になっているか
- 日本語firstが保たれているか
- Slack通知やIssue配送を、受理/完了証跡と誤認しない記述になっているか
- Backlogチケット管理を別sessionへ移す場合の権限、同期、報告、レビュー責任が
  足りているか
- 公開情報、推定、未確認の区別が保たれているか

### 報告形式

```text
移行可否:
- delegation-ready / needs-fix / blocked

判断:
- ...

不足:
- ticket body:
- workflow:
- session handoff:
- evidence:
- Japanese wording:

Backlog移行監査:
- 実Backlog同期監査: done / not_done
- 更新権限: review_only / update_proposed / unclear
- コメント品質: pass / fail / not_checked
- 現物差分: unknown / none / found

各finding:
- category:
- durable_reflection_target:
- target_scope:
- trigger_decision:

改善提案:
- main sessionが統合すべき変更:
- backlog-ticketing skillへの反映候補:
- backlog-slack-notification skillへの反映候補:
- code-review-ai-mistake-patterns skillへの反映候補:
```

## LL追加タスク: AIミスパターンHTML可視化

### 目的

`skills/ai-architecture-learning/child-skills/code-review-ai-mistake-patterns/SKILL.md`
のレビュー観点を、人間が一覧しやすいHTMLに変換する。

このHTMLは単なる装飾ページではない。AIがどの種類のミスをしやすいか、
どの証跡で検知するか、どの子スキルやlintへ反映するかを、人間とAIレビュー
エージェントが同じ目線で確認できる補助面にする。

### 編集してよいファイル

- `docs/project-management/code-review-ai-mistake-patterns.html`
- `docs/index.html` のリンク追加
- 必要なら `tools/check_feedback_reflection.mjs` 以外の既存テストに影響しない
  静的HTML確認用の小さなローカルスクリプト

### 情報モード

- `implementation_brief_level=full-pattern-aware`
- reviewer-tooling implementation exception:
  このタスクは通常の成果物実装ではなく、reviewer-context skillを人間向けHTMLへ
  変換するレビューtooling整備である。素材として
  `code-review-ai-mistake-patterns/SKILL.md` を読む必要があるため、baseline実装者
  ではなく full-pattern-aware 例外として扱う
- 渡す情報:
  表示要件、日本語first、状態語彙、証跡境界、編集可能/禁止ファイル、
  docs/index到達性、対象reviewer skill、共有skill/ledgerはmain提案に留めること
- 渡さない情報:
  過去findingの採否判断、findings-only HTML、レビュワー内部分類の全背景、
  skill反映の最終判断権、known-miss catalog
- 禁止:
  この例外を通常のbaseline実装者briefへ一般化しない。通常実装laneでは
  reviewer-only artifactを `参照`、`必読`、`確認`、`load/read` させない
- promotion decision owner=main session

### 触らないファイル

- `.agent-feedback/FEEDBACK_LEDGER.md`
- `.agent-feedback/PROJECT_SKILL.md`
- `skills/**`
- `AGENTS.md`
- `docs/architecture/retail-ai-ops-copilot-architecture.html`
- `docs/obsidian/**`

### 受入基準

- HTMLは日本語firstである
- AIミスパターンのカテゴリ、典型症状、検知証跡、レビュー質問、反映先が
  見える
- `integration_ready` などの状態語を誤用しない
- 静的証跡、mock、dummy、live実行の違いを可視化できる
- `docs/index.html` から到達できる
- 共有skillやfeedback ledgerの更新はmain sessionへの提案にとどめる

### 報告形式

```text
作業結果:
- worktree:
- branch:
- commit:
- push:

変更ファイル:
- ...

確認したこと:
- HTML表示:
- docs/index.htmlリンク:
- 状態語/証跡境界:

main sessionへの反映提案:
- code-review-ai-mistake-patterns:
- feedback ledger:
- Backlog/チケット:
```

## オーケストレーターの役割

main sessionは実装者にもレビュワーにも寄りすぎない。
artifactの実作業も原則として吸収しない。小さいHTML修正、テスト追加、
follow-up修正であっても、利用可能なlaneがある場合は対象sessionへ
dispatchし、main sessionはaccepted確認、レビュー、統合、feedback reflectionを
担当する。

担当:

- 3レーンのbriefを最終化する
- Issue/paneへdispatchする場合、`posted` / `delivered` / `accepted` を分ける
- `accepted` は受信側transcript、post-submit verification、worktree、明示報告で確認する
- Lane Aの成果はLane Bレビュー後に統合判断する
- Lane CのBacklog改善提案はmain sessionが採否を決める
- feedback ledger、project skill、Obsidian mirror、構成図HTMLなどshared fileは
  main sessionが統合する
- レビューで見つかった再利用可能な問題は、必ずfeedback ledgerと該当skillへ反映する
- main sessionがartifact実作業を巻き取る場合は、ユーザーの明示許可または
  lane unavailableを条件にし、`main-context substituted` として報告する

## 次の推奨順

1. Lane A `dbt実装者` をdispatchする
2. `accepted` を確認する
3. Lane B `受託品質レビュワー` へ、Lane Aのbranch/worktree/reportを対象に
   read-only reviewをdispatchする
4. Lane C `Backlog/チケット運用QA` を並列にdispatchする
5. main sessionがLane B/Cの提案を統合し、必要に応じてLane Aへ修正依頼する

この順番なら、実装が先に進みつつ、レビューskill強化とBacklog運用品質レビューも
本線を止めずに進められる。
