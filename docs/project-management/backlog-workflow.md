# Backlog Ticket Workflow

作成日: 2026-06-28

## 目的

Backlog は、このプロジェクトのチケット駆動シミュレーション面として使う。repo内の設計書を正とし、Backlog は進行管理、作業単位、レビュー観点、証跡リンクを扱う。

この運用は、実務想定のAIアーキテクチャ/LLMOps学習を、受託開発に近い粒度で進めるためのもの。小さいMVPへ閉じるのではなく、dbt、Snowflake/Cortex、LLMOps、Snowpark候補を、証跡で制御できる単位へ分解する。

Backlogチケットを作成・更新・レビュー・同期する前に、repo-local child skill
`skills/ai-architecture-learning/child-skills/backlog-ticketing/SKILL.md` を読む。
チケット本文は日本語を主軸にし、製品名、コマンド、repo path、issue keyなど精度に必要な英語だけを残す。

## Backlog project

- Space: `raiops27`
- Project name: `Retail AI Ops Copilot`
- Project key: `RAIOPS`
- Project URL: https://raiops27.backlog.com/projects/RAIOPS
- Issue list: https://raiops27.backlog.com/find/RAIOPS

## Source Of Truth

| Surface | Role |
| --- | --- |
| repo `docs/` | 設計・判断根拠・受入基準の正本 |
| repo `docs/obsidian/` | Obsidian作業面のrepo mirror |
| Backlog | チケット進行管理、作業単位、証跡リンク |
| GitHub Pages | 構成図・readiness表示の確認面 |

Backlogの説明とrepo docsが矛盾した場合は、repo docsを更新した上でBacklog側のチケット説明またはコメントへ反映する。

## Milestone Flow

初期マイルストーンはBacklogの正式マイルストーンではなく、タイトル接頭辞と台帳で運用する。

1. `Control Baseline`
   - Backlog DoD、証跡テンプレート、設計書同期、repo境界を固める
2. `dbt/Semantic Contract`
   - TPCH_SF1からdbt mart契約、semantic model、KPI定義、dbt testsを固める
3. `Cortex Live Loop`
   - Snowflake/Cortexのlive実行、trace、verified query、unsupported判定を確認する
4. `LLMOps/HITL Loop`
   - Golden Eval、error taxonomy、human review、approval pathを回す
5. `Snowpark Expansion`
   - eval/trace enrichmentなど、SQL/dbtとの差分が明確なSnowpark責務を試す

## Issue Prefixes

Backlog Freeの初期運用では、標準の課題種別 `タスク` を使い、タイトル接頭辞で作業種別を表す。

| Prefix | Use |
| --- | --- |
| `[Design/ADR]` | 技術選定、責務分界、採用/非採用判断 |
| `[Build/*]` | 実装またはreference harness作業 |
| `[Eval/Test]` | Golden Eval、dbt tests、UI E2E、trace検証 |
| `[Governance/*]` | HITL、RBAC、safe-stop、cost guardrail |
| `[Evidence/*]` | docs、diagram readiness、同期、証跡反映 |
| `[Spike/*]` | Snowpark/SPCS/Cortexなどの限定調査・試作 |

必要になったらBacklogのカテゴリーで `dbt`, `Semantic`, `Cortex`, `Agent`, `Trace`, `Golden Eval`, `Streamlit`, `Snowpark`, `Governance`, `Diagram` を追加する。初期はチケット本文とタイトルで管理し、設定作業が本筋を遅らせないようにする。

## Definition Of Done

チケットを完了にするには、最低限次を満たす。

- 何を変更したかがBacklog本文またはコメントから追える
- 関連repo docsまたはコードパスが明記されている
- 実装チケットはテストまたは実行証跡がある
- 設計チケットは判断根拠と未決事項が分かれている
- diagram readinessに影響する場合は進捗率と備考が更新されている
- Obsidian mirrorに関わる場合は同期チェックを通す
- Snowflake/Cortex/Snowpark live挙動に関わる場合はsilent fallbackしていないことを確認する

## Parallel Session Rule

複数のCodex sessionで実装を進める場合も、最初に分割するのは実装作業ではなく
設計済みのBacklog laneである。

並列sessionへ渡す前に、対象ticketの目的、受入基準、編集してよいファイル、
触らない共有ファイル、検証コマンド、報告形式をrepo docsで明確にする。
詳細は `docs/project-management/parallel-session-implementation-plan.md` を正本にする。

設計が未完了の間、並列sessionは調査、レビュー、設計案作成までに留める。
`README.md`、`AGENTS.md`、feedback ledger、project skill、Backlog台帳、
構成図HTML、Obsidian mirrorはmain sessionが統合する。

## Evidence Template

Backlogコメントまたは完了報告には、必要に応じて次を残す。

```text
変更概要:

証跡:
- repo path:
- command:
- result:
- Backlog:
- screenshot/Pages:

readiness影響:

未決事項:
```

## Sync Rule

設計書を変更したら次を実行する。

```bash
python3 tools/sync_obsidian_docs.py --direction check
```

Backlogチケットを追加・変更した場合、必要に応じて `docs/project-management/backlog-initial-ticket-map.md` も更新する。

各初期チケットの本文粒度を変更した場合は
`docs/project-management/backlog-ticket-bodies.md` を先に更新し、必要に応じて
実Backlog側の説明欄へ同期する。
