---
name: ai-architecture-learning-code-review-ai-mistake-patterns
description: >-
  Project-local child skill for code-review lenses that catch AI/parallel-agent
  implementation mistakes in this AI architecture learning repo, including
  証跡の過大主張、文書陳腐化、契約/テスト不一致、データ実行証跡不足。
---

# Code Review AI Mistake Patterns

Use this child skill when reviewing implementation output from the main agent,
parallel sessions, or reviewer-assisted patches in this AI architecture
learning repo.

This skill is a reviewer-context skill. It does not replace domain-specific
test skills. When the finding belongs to a concrete domain, such as dbt,
diagram geometry, Backlog wording, or role-tooltip ownership, load or update
the matching child skill as well.

## Purpose

The project intentionally uses AI agents to build, review, and correct complex
architecture work. Review value comes from identifying the mistakes AI agents
are likely to make, then turning those mistakes into sharper reviewer prompts,
tests, lints, or acceptance gates.

When a code review finds a real defect, do not only patch the defect. Classify
the mistake pattern and decide whether it needs:

- a reviewer-context rule in this skill
- a domain-specific child skill update
- a deterministic test/lint/check
- a design-doc evidence rule
- a feedback-ledger row only, if the issue is one-off

## Information-Asymmetric Review Mode

Use this skill as the pattern-aware reviewer side of an implementation/review
split. The implementer and reviewer do not always need the same context.

The implementer must receive the baseline delivery contract: purpose, scope,
source-of-truth docs, acceptance criteria, required commands, evidence level,
secret/public boundaries, no-silent-fallback rules, and any promoted high-risk
or mechanically checkable rule.

The implementer must not be asked to load this reviewer-context skill, the
findings-only HTML page, prior reviewer findings, or known AI-mistake catalogs
unless the orchestrator explicitly selects `implementation_brief_level=full-pattern-aware`.
Default implementation briefs should point to source-of-truth product/design
docs and promoted deterministic rules, not to the reviewer training corpus.
In `baseline` or `hardened` implementation mode, reviewer-only artifacts may be
named only as withheld or blocked context. Treat a brief that asks the
implementer to read, load, inspect, confirm, or consult those artifacts as a
dispatch-blocking process defect.
For `hardened` mode, require distilled promoted rules only. The brief should
point to a rule, lint, CI check, Backlog acceptance criterion, or project rule,
not the raw reviewer-only finding source.

The reviewer may receive more context than the implementer:

- prior findings and known AI mistake patterns
- category definitions and evidence-boundary examples
- reviewer-only traps such as state-word flattening, local proof overclaiming,
  stale docs, broken Pages links, source/type label omissions, or branch/worktree
  drift
- expected feedback-ledger and child-skill routing targets

Do not mark an implementer as failing a hidden requirement merely because a
reviewer-only heuristic caught it. For every finding in this mode, classify the
cause:

- `baseline-contract miss`: the implementer violated an explicit brief,
  acceptance criterion, promoted project rule, or allowed-file boundary
- `reviewer-training miss`: the defect is valid, but it was intentionally left
  to the pattern-aware reviewer to catch
- `upstream-promotion candidate`: the issue is repeated, high-risk,
  public/safety/status/evidence-related, mechanically checkable, or costly to
  repair late
- `reviewer-skill gap`: the reviewer missed or misclassified a defect that this
  skill, a domain child skill, or a deterministic check should catch next time

Reviewer reports should include:

- `implementation_brief_level=baseline`, `hardened`, or `full-pattern-aware`
- `reviewer_context_level=pattern-aware`
- `promotion_decision=keep_reviewer_only`, `promote_to_brief`,
  `promote_to_lint_or_ci`, `promote_to_backlog_acceptance`, or
  `promote_to_project_rule`
- proposed target files, skills, checks, or ticket surfaces

The orchestrator decides which reviewer-only lessons become upstream rules. If a
finding is promoted, future implementer briefs should include it; otherwise it
remains a reviewer-training lens.

Reviewer lanes must treat review-skill growth as part of the deliverable. A
review report should say which issue was caught by baseline contract checking,
which was caught only by reviewer-only context, which review lens failed or was
missing, and which durable target should improve next: this skill, a domain
child skill, a deterministic test/lint, or a future brief/Backlog acceptance
criterion, or project rule. If the reviewer finds no defects, still report the
review lenses exercised and the residual reviewer-skill or test/lint gaps.

When reviewing a task split or delegated brief, require
`node tools/check_parallel_session_guardrails.mjs` evidence before accepting the
split as dispatch-ready. If the check fails, classify it as `レビュー工程の穴`
or `upstream-promotion candidate` rather than relying on a human to remember the
context-separation rule.

## Human-Readable Visualization

AI mistake-pattern knowledge should not live only as prompt text. When the
pattern list becomes large enough that humans need to compare, teach, or audit
it, create or update a Japanese-first HTML view that makes the reviewer lens
visible.

The visualization should show, at minimum:

- ミスカテゴリ。HTMLやBacklogなど人間が読む表示名は日本語にする
- typical symptom
- evidence that detects the mistake
- review question to ask
- likely reflection target, such as this skill, a domain child skill, a lint,
  a CI gate, or a Backlog/ticketing rule

Keep the HTML as a review aid, not a separate source of truth. The skill remains
the reviewer prompt source. The HTML helps humans notice coverage gaps and
explain why a review agent is checking a given pattern.

Keep broad review lenses separate from actual finding history. When the general
visualization starts to mix state vocabulary, proof-level teaching, reflection
targets, and concrete defects, create or update a narrower findings-only page.
The findings page should include only issues that were actually found by code
review, lane review, integration review, or HITL review, and each item should
name:

- what was found
- why it mattered
- the concrete evidence or ledger id
- the category tag, such as `契約不一致`, `文書陳腐化`,
  `スコープ境界`, `ブランチリスク`, or `証跡境界`. The visible
  category label must be Japanese-first; use an internal English id only when a
  script or CSS selector needs one.
- a fixed category-definition hover for category tags. The hover text explains
  what the category itself means, not the individual finding. The same category
  label must show the same definition everywhere on the page.
- the system-architecture diagram node where the issue belongs; if the finding
  belongs to project operations outside the diagram, label it explicitly as
  `構成図外: ...` instead of forcing a misleading node match
- the concrete file, script, config, Markdown document, or generated artifact
  where the problem occurred
- the comment/text location when the correction concerns reviewer comments,
  Backlog comments, ticket bodies, brief text, issue comments, code comments,
  or report wording. Use a visible tag such as `文面所在` and include the
  exact comment id, ledger id, ticket body, brief section, or review record
  that contained the problematic wording.
- when the findings page has multiple entries, filter controls for at least
  `問題種別` and `構成図ノード`. The filter data should come from explicit
  finding metadata or visible tags, not from fragile prose scraping, so adding
  new findings does not require rewriting the filter logic.
- the actual problematic code, Markdown, config, command, or reviewer record
  excerpt that exposed the issue
- the fixed code, Markdown, config, command, or durable rule excerpt
- high-contrast excerpt rendering for all before/after code or Markdown blocks.
  In the HTML view, use a dark background with light text for excerpt bodies
  and override nested inline `code` styling so the block does not fall back to
  pale inline-code colors.
- a source/type label before every excerpt body, such as `SQL / dbt singular
  test`, `Python / eval runner`, `JavaScript / simulator guard`,
  `CSV / dbt seed`, `Markdown / Backlog ticket body`, `Markdown table /
  Feedback Ledger reviewer finding`, or `Skill Markdown / reviewer rule`. For
  Markdown excerpts, name the exact Markdown surface or file role; do not show
  only a generic `Markdown` label.
- public-page navigation that connects the findings page, the general review
  pattern page, the docs index, and the current architecture diagram. When a
  page is deployed to GitHub Pages, use docs-root relative links for pages under
  `docs/` and full GitHub blob links for repo files outside the Pages root, such
  as `skills/**/SKILL.md`; do not rely on `../../skills/...` style links that
  leave the Pages site root.
- the correction direction, not only the final patch
- the durable prevention target

Do not fill the findings-only page with generic review categories. Link the
general pattern page and the findings-only page to each other so humans can
move between "what to look for" and "what actually failed" without mixing the
two surfaces.

If the finding is process-related and has no source-code file, use the exact
problematic Markdown brief, ticket body, task report, feedback-ledger row, or
reviewer output as the "problem code" surface. Do not invent hypothetical bad
code just to fill the slot.

Do not hide important state distinctions in the visualization. `posted`,
`delivered`, `accepted`, `reported`, `reviewed`, and `integration_ready` must
remain visibly separate, and static/mock/dummy/local evidence must not be
presented as live data-bearing proof.

## Core Review Lens

Review AI-generated or delegated code with suspicion toward these failure
modes:

- static verification is overclaimed as runtime or data-bearing proof
- generated tests compile but cannot pass against the current fixture, seed, or
  sample data
- test expectations are hard-coded from the agent's intended wording rather
  than checked against the actual artifact
- a business or data contract is implied by nearby prose, but the test only
  protects part of the implication and would allow the important warning to be
  removed later
- docs record both pre-change and post-change counts without naming the
  evidence point
- task reports say a tag, route, or contract exists but do not prove it with
  `dbt ls`, manifest, compiled SQL, rendered DOM, or another concrete artifact
- branch status is ignored, especially `ahead` plus `behind` before integration
- a delegated public-docs artifact is integrated by replacing a shared
  navigation surface such as `docs/index.html` instead of preserving existing
  cards or entry points from other active lanes
- a resumed session edits an old cwd/worktree because the prompt did not force
  `pwd`, branch, HEAD, and assigned worktree confirmation before edits
- a reviewer accepts a sub-agent's report without checking the changed files
  and the relevant generated outputs
- a local dummy, `--empty`, mocked, cached, or fallback path is treated as
  equivalent to live execution
- exact product names, commands, file paths, and status tokens are translated,
  shortened, or generalized until verification is no longer reproducible

## Required Review Questions

Before approving a delegated implementation, answer these questions explicitly
when they apply:

1. What exact artifact changed, and did the review inspect the changed file
   rather than only the report?
2. Is the evidence static, mocked, empty, local-only, or live data-bearing?
3. Does every new test expectation match the current fixture/seed/config row it
   claims to protect?
4. Would the test fail for the intended defect, and would it pass for the
   current valid artifact?
5. Do docs and Backlog text distinguish baseline state from post-change state?
6. Is the branch clean, current with the target branch, and safe to integrate?
7. If the issue was found by review, which reusable mistake pattern should be
   reflected into a child skill or deterministic check?

## Delegated Reviewer Lane Rule

When a reviewer session is delegated to inspect another session's implementation,
the reviewer is not only a passive code reader. The reviewer must behave like a
delivery-quality gate for contract or client work.

The reviewer should not directly patch implementation artifacts unless the task
brief explicitly grants edit authority. The default reviewer output is a
findings-first report that the orchestrator can integrate.

Every real finding must be classified into one or more Japanese visible
categories:

- `成果物不具合`: the implementation or test definition is wrong
- `証跡の過大主張`: the report claims more than the evidence proves
- `契約不一致`: seed, fixture, semantic, eval, mart grain, or API contract
  does not match the implementation
- `文書陳腐化`: docs, Backlog text, comments, or readiness metadata no
  longer match the artifact
- `ブランチ・統合リスク`: branch freshness, shared-file edits,
  allowed-file violations, or merge readiness is unsafe
- `レビュー工程の穴`: the existing reviewer skill, task brief, test, or
  lint would likely miss the issue again

For each finding, the reviewer must propose a durable reflection target:

- this code-review skill
- a domain child skill such as `dbt-readiness-gates`
- a Backlog/ticketing skill
- a deterministic test, lint, or CI gate
- ledger only, with a reason if it is one-off

The orchestrator remains responsible for accepting, rejecting, or reflecting
the proposed skill/rule updates. A reviewer report is evidence, not an automatic
patch.

The orchestrator should stay an observer for delegated artifacts. If the target
lane is wrong, stale, or incomplete, classify the finding and ask that lane to
repair it rather than silently implementing the delegated scope in the
orchestrator session. If takeover is unavoidable, label it
`main-context substituted` and explain why the lane could not continue.

For substantial delegated work, the implementation or review lane should run a
lane-local objective reviewer before final reporting when sub-agent tooling is
available. That reviewer should be read-only by default and should return:

- reviewer type and verdict
- blocking findings
- evidence level for the lane's claims
- branch/worktree risks
- reusable AI mistake patterns
- proposed reflection target for each reusable finding

The orchestrator audits the proposed reflection targets instead of redoing all
first-pass criticism from scratch. If the lane-local reviewer misses an obvious
issue, classify that miss as `レビュー工程の穴` and reflect it into this
skill, a domain child skill, or a deterministic check.

Reviewer sessions must not declare `integration_ready`. That state belongs to
the orchestrating main session after independent artifact review, checks,
branch/worktree inspection, and blocking-finding triage. Reviewers should use a
separate verdict such as:

- `no_blocking_findings`
- `fix_before_orchestrator_review`
- `blocked`
- `recommend_integration_ready_after_orchestrator_review`

Treat a reviewer report that says `integration_ready` as a state-vocabulary risk
unless it clearly means only a recommendation.

Before reviewing or dispatching work from a fresh worktree, check whether the
brief depends on uncommitted or untracked docs/skills. If the dispatch base does
not include the brief, reviewer rules, or required design docs, the target
session may be working from stale HEAD. Classify this as `branch/integration
risk` and require either a dispatch base commit/branch or full brief contents in
the delegated prompt.

## Data-Bearing Contract Rule

For tests that depend on seed rows, fixture rows, rendered UI geometry, or
generated artifacts, compile/build success is not enough. A reviewer must check
that the expected values or strings are present in the current artifact, or
record that the check is still pending.

If live execution is intentionally not available, the review should still run a
deterministic local consistency check when possible, such as:

- reading the seed row that the singular test targets
- inspecting compiled SQL for accepted values and refs
- running a small parser or grep that proves expected tokens exist in the
  fixture
- comparing generated report counts against the current manifest

## Routing

Use this skill as the parent review lens for AI-mistake patterns, then route
domain details:

- dbt readiness, seed contracts, `dbt parse`, `dbt compile`, `dbt test`, and
  Semantic/Eval gating -> `../dbt-readiness-gates/SKILL.md`
- Backlog/Issue reports and Japanese-first project-management text ->
  `../backlog-ticketing/SKILL.md`
- role ownership and hover responsibility wording ->
  `../role-responsibility-tooltips/SKILL.md`
- diagram geometry, connector, text, or source-fidelity issues -> the diagram
  skills and project diagram lint gates

## Review Output

When reporting findings, keep findings first and include:

- file and line reference
- why the issue matters for learning or future implementation
- whether the defect is `成果物不具合`, `証跡の過大主張`,
  `契約不一致`, `文書陳腐化`, `ブランチ・統合リスク`,
  `スコープ境界`, `状態語混同`, `証跡境界`, or `レビュー工程の穴`
- the proposed durable reflection target when the pattern is reusable

Do not mark the review complete merely because parse/compile/lint passed. State
the residual live or data-bearing verification gap separately.
