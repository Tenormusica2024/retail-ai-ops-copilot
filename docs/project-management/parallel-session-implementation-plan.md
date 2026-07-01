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
- main sessionは原則オーケストレーターに留まる。実装、HTML/page修正、
  テスト追加、follow-up artifact修正は、利用可能なlaneへdispatchする
- 複数sessionが同じファイルを同時編集しないよう、共有ファイルは
  main sessionが統合する
- 実装sessionは、受入基準と実行コマンドが明記されたあとに開始する
- Snowflake/Cortex/Snowparkのlive挙動に関わる作業は、silent fallbackを
  入れない
- 各sessionは最後に、変更ファイル、実行コマンド、失敗/未実施理由、
  次sessionへの引き継ぎを書き残す

main sessionが直接やってよいのは、feedback ledger反映、task brief作成、
accepted確認、成果物レビュー、shared file統合判断、Obsidian同期確認、
public Pagesなどの最終証跡確認である。利用可能なlaneがあるのにartifactを
main sessionで修正した場合は、例外として扱い、`main-context substituted` と
理由を報告する。

この境界は `node tools/check_parallel_session_guardrails.mjs` でも確認する。
HTML、tests、dbt、app code、fixtures、runtime toolsなどartifact系ファイルの
差分がある場合、同じ差分内に delegated lane の
`.agent-feedback/SUBAGENT_INVOCATIONS.md` 証跡、または明示的な
`main-context substituted` 理由が必要である。

feedback ledger更新は、このguardrailの発火条件ではない。feedback ledgerは
指摘・改善・反映先の記録面であり、オーケストレーター制御はdispatch/review
操作、artifact diff、invocation evidenceから判断する。

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

## セッション受理確認ゲート

Issue #5 や pane routing 経由で別sessionへ作業を振る場合、次を分けて扱う。

| 状態 | 意味 | 十分な証跡 |
| --- | --- | --- |
| Issue投稿済み | Issueコメントは作成された | Issue comment URL |
| bridge送信済み | pane routing bridgeが対象paneへ送った | bridge log / pending command |
| 受理済み | 対象sessionが実際に作業として受け取った | 受信側session transcript、resolved receipt、worktree/branch/差分、または明示的な `/githubissue` 返信 |
| 作業中 | 対象sessionがscope内で実装を進めている | 対象worktreeのmtime、実行ログ、途中報告 |

Terminalベースの `Mac visible-send` は、対象Codexが別タスクで動いていても
送信成功になることがある。そのため、`Mac visible-send完了` だけを受理済みと
扱わない。

受理確認では最低限次を確認する。

- 送信先paneが想定どおりか
- CLI paneの場合は、bridge logの `post_submit_verified=true` と
  `post_submit_verification.session_path` / `comment_id` を優先証跡にする
- `post_submit_verified=null` のMac visible-sendログはdispatch証跡であり、
  Codex受理証跡として扱わない
- 送信本文がCodex CLI入力欄に残ったままになった可能性がある場合は、
  追加Enterリカバリの有無、`post_submit_recovery`、再検証後の
  `post_submit_verified` を確認する。追加Enterだけでは受理証跡にしない
- dry-runまたはvisible-sendログで、対象Terminal windowのtitle / tty /
  terminal_window_id / `anchors_inside_window` を確認する。1つのTerminal窓が
  複数pane anchorを含む場合、同じpane anchorを複数Terminal窓が含む場合、
  またはtitle/ttyが意図したlaneと合わない場合は誤配送リスクとして送信を
  止める
- title marker指定で送ると決めたlaneは、frontmostやpost-submit verificationに
  失敗しても、title markerを外す、`--parallel-session-skill-hook never`にする、
  pane/座標だけで送る、という弱いretryへ落とさない。状態は
  `sent but not accepted`または`sent-not-attempted`に留め、同じtitle/ttyを直すか、
  freshなtitle付きsessionを作ってから再送する
- 受信側Codex session transcriptに、委譲したtask本文またはsource comment idがあるか
- supervisor上で該当commandが `resolved` になっているか、`pending` のままか
- 指示したworktree、branch、またはファイル差分が作成されているか
- 対象paneが別プロジェクトのactive goalを継続していないか

bridgeやvisible-send送信コードを修正した後に再トライする場合は、常駐中の
Issue bridgeプロセスが古いコードを読み続ける点に注意する。再送前に
`com.urayahadays.private-issue-bridge-monitor` を再起動し、新しいログで
検証待ちが有効になっていることを確認する。

既存paneが別タスクのactive goalを継続している場合は、そのpaneへ重ねて再送
しない。専用worktreeと新しいCodex sessionを作成し、dry-runでrouting対象が
新sessionのTerminal title / tty / window idになっていることを確認してから
Issue経由で再送する。

これらが確認できない場合は、作業を「送信済みだが未受理」と報告し、
並列実装が始まったものとして扱わない。

## 既存レーン再割当て前の容量確認

既存paneへ新しいタスクを振る前に、main sessionは「過去にreportedだった」
ことだけで空きと判断しない。次の証跡をそろえ、古いタスクを中断してよいか、
または完了済み/待機中として再利用できるかを判定する。

- 現在見えているpaneのtitle、tty、prompt待ち状態
- 受信側session transcriptの末尾
- 対象worktree、branch、dirty files、最新commit
- 直近タスクの状態: `accepted` / `reported` / `reviewed` /
  `integration_ready` / `needs-fix` / `pending`
- lane-local客観レビューの完了有無
- main sessionが統合すべき未反映ファイルやfeedback reflectionの残り
- 新タスクで触るファイルと、既存laneの未統合ファイルが衝突しないこと

判定は次のように扱う。

| 判定 | 意味 | 次アクション |
| --- | --- | --- |
| `reuse_ready` | 現在のpaneがprompt待ちで、旧タスクの成果物が報告済みまたは完了済み、かつ新タスクの編集範囲と衝突しない | 同じpaneへ新task briefを送ってよい |
| `pause_then_reassign` | 旧タスクが軽微な未報告/未統合作業を残すが、明示的な一時停止指示で安全に切れる | 旧タスクの停止理由と未反映物を残してから送る |
| `do_not_interrupt` | 旧タスクが作業中、受理未確認、外部操作中、または未統合差分が大きい | 割り込まない。別laneを使うか待つ |
| `unknown` | transcript、worktree、title/tty、状態語のいずれかが確認できない | 空き扱いしない。確認を先に行う |

ただし、既存履歴があること自体を再利用不可の理由にしない。履歴は避ける材料ではなく、
次タスクの割当て精度を上げる材料として扱う。直近で実装を担当していたlaneには、
worktree衝突と未統合差分がなければ次も実装タスクを優先して振る。直近でレビューを
担当していたlaneには、レビューやQAを優先して振る。直近ロールが曖昧、または別領域へ
切り替える理由があるlaneは、新規/調査/短期検証タスクを振る候補として扱う。

同じドメインに近いlaneが複数ある場合も、両方を固定的に同じ領域へ残さない。
たとえばL1はBacklog/チケット運用QAのレビュー寄り履歴、L5はRAIOPS-15
Backlog Slack通知シミュレーターの実装寄り履歴であり、完全な重複ではない。
ただし、Backlog/Slack周辺で次に必要な作業が1本分しかないなら、片方だけを
ドメイン継続に残し、もう片方は新しい実装/レビュー/調査タスクへ回す。
この場合、L1はQA/レビュー継続、L5はworkflow/tooling実装継続が自然な初期判断である。

全worker laneを意識的に埋めることを目標にしない。空きlaneは遊休ではなく、
急な追加タスク、失敗時の代替、レビュー待ちの詰まり、または将来の並列拡張に
対応するための運用バッファとして扱う。現時点では、必要な実装/レビューだけを
dispatchし、残りのlaneは `reserve` または `idle-buffer` として残してよい。
タスク数が増えた時点で、番号laneを追加稼働させるか、さらに枠を拡張する。

ただし、空きlane維持をreadyな独立タスクの直列化理由にしない。編集範囲が
分離でき、受入基準と検証方法を切れるタスクが複数ある場合は、少なくとも
1本のreserveを残せる範囲で追加laneを稼働させる。reserveはfill-all pressureを
避けるためのバッファであり、実行可能な実装作業を不必要に待機させるための
口実ではない。

`reported` になった成果物は「終わったので空き」だけでなく、次のレビュー、
差し戻し、統合判断へ流す task graph の入力として扱う。実装laneが `reported`
したら、main sessionはそのまま待機させず、独立レビューlaneへ渡すか、
既知findingを同じ実装laneへ corrective prompt として返すかを判断する。
レビューlaneが `reported` したら、main が未レビューの実装成果物を次の
レビュー対象として割り当てられないか確認する。

実装者briefとレビュワーbriefの情報量は意図的に分ける。通常の実装laneには
baseline契約、source-of-truth docs、昇格済みルール、受入基準、検証コマンドを渡す。
既存レビュー観点、AIミスパターン、findings-only HTML、過去レビューfinding、
既知miss一覧は、`implementation_brief_level=full-pattern-aware` を明示した場合を除き
実装者へ読ませない。レビューlaneにはpattern-aware文脈を渡し、レビューが何を捕まえ、
何を見逃し、どのskill/test/lint/briefへ昇格すべきかまで報告させる。

複数Terminal laneへforeground/paste/Enterでdispatchする場合は、laneごとに
逐次送信する。macOSのclipboardとfrontmost windowは共有状態なので、並列AppleScript
送信は同じbriefの重複投入や別laneの未受理を起こしうる。各laneごとに送信、
受信transcript確認、次lane送信の順で進める。

sender側のpost-submit verificationが `target_tty_session_not_found` などで失敗
した場合、その失敗理由は必ず残す。ただし、それだけで最終状態を決めず、
dispatch idまたはtask bodyを直近の受信Codex jsonlで検索する。受信側transcriptに
一致があり、対象session idとtask本文が確認できる場合だけ `accepted` へ進める。
この場合も、報告には sender側verification失敗理由と、受信transcript証跡の両方を
分けて残す。受信側一致がない場合は `sent but not accepted` のまま扱う。

在宅作業でCodex利用量が増える前提では、4分割から8分割への拡張は
設計・実装に入るべき容量拡張トラックとして採用する。main sessionを
オーケストレーターとして除くと、現状の実働laneは3本しかなく、dbt実装、
実装レビュー、Backlog/チケットQA、構成図/progress更新を同時に持つには不足する。

ただし、8分割化は「今すぐ8本すべてへ作業を投げる」という意味ではない。
まず8 lane registry、title/tty、worktree、acceptance verification、
post-submit verification、lane-local review、統合負荷の設計と検証を別タスクとして
進める。既存laneへ安全に振れる短期タスクがあっても、それは8分割化の設計開始を
止める理由にはしない。

また、ここでいう8分割は画面上の理論枠であり、main sessionの表示領域を削って
まで8 worker laneを確保する意味ではない。現在main sessionは`upper_left`にあり、
オーケストレーターとして十分な表示サイズを維持する。したがって、実運用で同時に
使えるworker laneは最大6本を基準に見積もる。容量計算では
`main orchestrator + up to 6 worker lanes + reserve/disabled slots` として扱い、
理論上の8枠をそのまま実働8レーンと呼ばない。

実際のレーン配置は、Terminalを手動で細かく並べるのではなく、Hammerspoonの
Alt+Terminalドラッグによるサイズ・位置調整を使う。レーン設計では、title/tty
だけでなく、画面上で読める幅、高さ、重なり、main sessionの可視性を確認してから
`usable_worker_lane` として登録する。

2026-07-01の実測では、現在の画面は右半分を使った4x2配置として扱うのが妥当。
main sessionは右半分の左上2セル相当を占有したまま固定し、残り6セルをworker
laneとして番号管理する。

| 番号 | 画面位置 | 既存pane対応 | 初期用途 |
| --- | --- | --- | --- |
| `0` | 右半分・左上2セル | main / `upper_left` | オーケストレーター。workerに数えない |
| `1` | 右上ブロック左 | 旧`UR` primary | `RAIOPS-4 L1` |
| `2` | 右上ブロック右 | 旧`UR` secondary | 追加worker |
| `3` | 右下左ブロック左 | 旧`LL` primary | `RAIOPS-4 L3` |
| `4` | 右下左ブロック右 | 旧`LL` secondary | 追加worker |
| `5` | 右下右ブロック左 | 旧`LR` primary | `RAIOPS-4 L5`。直近はRAIOPS-15 Backlog Slack通知シミュレーター実装 |
| `6` | 右下右ブロック右 | 旧`LR` secondary | 追加worker |

Hammerspoon側には番号管理用に次の関数を用意する。

- `_G.parallelLaneFrames()`
- `_G.parallelLaneSlot(n)`
- `_G.parallelLaneMoveTitle(pattern, n)`
- `_G.parallelLanePlaceRAIOPS()`
- `_G.parallelLaneAltDrag(true|false)`

Computer Useは`com.apple.Terminal`を安全制限で扱えないため、Terminal内の操作を
Computer Use前提にしない。画面配置はHammerspoon IPCとスクリーンショットで確認し、
受理確認はtitle/tty/transcript/post-submit verificationで行う。

過去セッションや古いTerminalの削除・終了はユーザー側で行う。main sessionは
勝手に閉じたり削除したりせず、重複している古い候補は`not usable / cleanup pending`
として扱う。ユーザーが削除・整理した後に、`_G.parallelLaneFrames()`、
`_G.ai8gridDebugWindows()`、スクリーンショットで再スキャンし、番号レーンへ
登録し直す。

2026-07-01のライブ配置テストでは、旧`RAIOPS-4 UR`を`RAIOPS-4 L1`へ、
旧`RAIOPS-4 LL`を`RAIOPS-4 L3`へ、旧`RAIOPS-4 LR`を`RAIOPS-4 L5`へ
タイトルロックごと更新した。新規Terminalで
`RAIOPS-4 L2`、`RAIOPS-4 L4`、`RAIOPS-4 L6`を起動した。各新規Terminalでは
`codex --yolo`まで実行済み。ただし、これはセッション起動と配置の証跡であり、
タスク受理ではない。実タスクを振るときは番号laneごとにtask briefを送り、
受信側transcriptまたはpost-submit verificationで`accepted`を確認する。

8分割へ進むときは、状態が曖昧なpaneを増やして配送ミス、title/tty混同、
未統合差分、main sessionの統制負荷を増やさないようにする。各laneに専用title、
専用worktree、allowed files、acceptance verification、post-submit verification、
lane-local objective reviewを持たせる。

## 実装者briefとレビュワーbriefの情報分離

このプロジェクトでは、レビュワー育成も目的なので、実装者とレビュワーへ
常に同じ情報を渡すとは限らない。ただし、これは隠し要件で実装者を失敗
させるためではない。実装者には納品可能性を守るbaseline契約を必ず渡し、
レビュワーには過去のAIミスパターンや証跡境界を厚めに渡して、見逃しを
検出・分類・再発防止へつなげる。

| Brief | 必ず渡す | 原則渡さない | 目的 |
| --- | --- | --- | --- |
| 実装者brief | 目的、scope、編集可能/禁止ファイル、正本docs、受入基準、検証コマンド、証跡レベル、秘密情報境界、silent fallback禁止、promoted済みの高リスクルール | reviewer-onlyの全ミスカタログ、まだ安定していない探索的レビュー観点 | 実装契約を満たす成果物を作る |
| レビュワーbrief | 実装者brief、関連child skill、過去findings、AIミスパターン、証跡境界、state語彙、feedback-ledger反映先候補 | 明示許可のない直接修正権限 | 抜け漏れを発見し、原因分類と再発防止先を提案する |

`implementation_brief_level=baseline` または `hardened` の実装者briefでは、
reviewer-only文脈を「参照」「必読」「確認」「load/read」として渡さない。
code-review AI mistake-pattern skill、findings-only HTML、過去レビューfinding台帳、
known-miss catalog、探索的reviewer trap一覧は、必要なら
「渡さない情報」または「触らない/読ませない情報」として明示する。
これらを実装者に読ませる場合は、例外として
`implementation_brief_level=full-pattern-aware` を選び、理由と
promotion decision ownerをbriefに書く。

レビュワーが見つけた問題は、次のどれかに分類する。

- `baseline-contract miss`: 実装者が明示された契約、受入基準、禁止事項、
  promoted済みルールを破った
- `reviewer-training miss`: 有効な欠陥だが、レビュワー訓練のために
  reviewer-only文脈で検出した
- `upstream-promotion candidate`: 次回以降は実装者brief、Backlog受入基準、
  lint/CI、project ruleへ上流化すべき
- `reviewer-skill gap`: レビュワー自身またはレビューskillが見逃したため、
  レビュー観点や自動チェックを強化する

次の条件に当たる場合は、reviewer-onlyに留めず上流化を検討する。

- 同種問題が再発している
- public page、秘密情報、証跡、状態語彙、受理/統合判定に影響する
- lint、CI、grep、manifest確認、DOM検査などで機械的に検出できる
- 要件として安定しており、探索的判断ではない
- 後段レビューで直すより、briefや受入基準で先に防ぐ方が安い

委譲briefまたはレビュー報告には、次を明記する。

- `implementation_brief_level=baseline`
- `implementation_brief_level=hardened`
- `implementation_brief_level=full-pattern-aware`
- `reviewer_context_level=pattern-aware`
- `promotion_decision=keep_reviewer_only|promote_to_brief|promote_to_lint_or_ci|promote_to_backlog_acceptance|promote_to_project_rule`

main sessionは、レビュワー指摘を受けたあと、実装者の契約違反か、
レビュワー訓練として妥当な検出か、または上流化すべきルール不足かを
判断する。レビュワーを恒久的な手直し係にせず、繰り返し起きる問題は
brief、Backlog、lint、CI、project/child skillへ移す。

レビューsessionの成果物は、単なるOK/NGではなくレビュー能力の改善入力にする。
各findingまたは「findingなし」報告では、どのreview lensが効いたか、どのlensが
弱かったか、次に強化すべき対象がreviewer skill、domain child skill、
deterministic test/lint、future brief、Backlog acceptance、project ruleのどれかを
返す。これにより、実装者に事前ヒントを渡さなくても、レビュー側が育つ状態を
保つ。

この情報分離は、実装者の品質を下げるためではない。実装者にはbaseline契約と
promoted済みルールを明確に渡し、reviewer-onlyに残した探索的観点で発見された
欠陥は `reviewer-training miss` または `upstream-promotion candidate` として扱う。
隠し要件違反として実装者を責めない。

### ルールベースのガードレール

この情報分離は、main sessionの記憶や判断だけに依存させない。並列sessionへ
実装者briefまたはレビュワーbriefを渡す前に、次を実行する。

```bash
node tools/check_parallel_session_guardrails.mjs
```

このlintは、少なくとも次を検査する。

- 実装者briefに `implementation_brief_level`、baseline契約、渡さない
  reviewer-only文脈、promotion decision owner があること
- 実装者briefがbaseline/hardenedなのに、reviewer-only artifactを
  `参照`、`必読`、`確認`、`load/read` 対象にしていないこと
- レビュワーbriefに `reviewer_context_level=pattern-aware`、finding原因分類、
  `promotion_decision`、review lensの捕捉/見逃し、強化先があること
- main sessionが shared file、feedback ledger、project skill、Obsidian mirrorを
  統合する棲み分けが残っていること
- `brief_drafted`、`posted`、`delivered`、`accepted`、`reported`、`reviewed`、
  `integration_ready` の状態語を崩さないこと

lintが落ちる場合、main sessionはdispatchせず、briefを修正してから再実行する。

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

情報モード:
- implementation_brief_level:
- reviewer_context_level:
- reviewer-only context intentionally withheld:
- blocked reviewer-only artifacts:
- full-pattern-aware exception reason:
- promotion decision owner:

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
- reviewer laneの場合:
  - caught review lens:
  - missed/weak review lens:
  - durable improvement target:
  - promotion decision:
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

## RAIOPS-4 dbt品質gate brief

`RAIOPS-4` の設計正本は
`docs/architecture/raiops-4-dbt-test-readiness-gate.md`。

このlaneを並列sessionへ渡す場合、まず次を守る。

- 編集してよい: `dbt/models/**/schema.yml`, `dbt/tests/**`, `dbt/seeds/**`,
  `docs/architecture/raiops-4-dbt-test-readiness-gate.md`
- 触らない: feedback ledger、project skill、Backlog台帳、構成図HTML、
  Obsidian mirror
- live `dbt build/test` を実行できない場合、localやcompile結果で代替成功に
  しない
- 変更後は `dbt parse`, `dbt compile`, 実行可能なら `dbt build/test` を報告する
- Semantic/Eval/readinessを上げる提案はmain sessionへ返す
