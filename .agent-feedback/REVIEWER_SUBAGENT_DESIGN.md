# Reviewer Sub-Agent Launch Design

This project uses sub-agents primarily as independent reviewers, not as the
default owners of feedback-ledger or skill edits.

## Ownership Model

- The main agent owns final artifact edits, ledger updates, and skill prompt
  edits.
- A reviewer sub-agent is read-only by default and produces findings,
  omissions, root-cause analysis, or proposed edits.
- A reviewer sub-agent does not implicitly share the full session context.
  Treat it as an independent reviewer that only knows the prompt, attached
  items, and files it is told to inspect.
- The main agent must integrate, reject, or mark findings `non-reusable`; do not
  paste reviewer output directly into skills as raw notes.
- Use one feedback reflection lane per trigger batch. Reviewer sub-agents are
  adjunct reviewers for that lane, not additional standing ledger owners.

## When To Launch

Launch a reviewer sub-agent when at least one is true:

- the user explicitly asks about sub-agent firing, reviewer behavior, or
  parallel/sub-agent verification
- a feedback-workflow change affects global/project skill behavior
- a previous response may have conflated artifact completion, skill reflection,
  and real sub-agent firing
- the finding is high-risk for repeated future mistakes, such as evidence
  recording, source fidelity, arrow routing, security/fallback semantics, or
  public documentation wording
- the main task can continue while the reviewer audits in parallel

Do not launch a reviewer sub-agent for low-risk typo fixes or tiny metadata
edits unless the user asks, sub-agent firing is itself being tested, or the
change touches durable workflow rules.

## Blocking Policy

- Non-blocking by default: continue artifact work while the reviewer runs.
- Blocking only when the user's acceptance criterion depends on the reviewer
  verdict, such as "did the sub-agent fire?", source-fidelity approval, or
  workflow E2E proof.
- If the reviewer has not returned and artifact work can safely continue,
  record `pending with handoff` rather than blocking the user-visible task.

## Context Pack Contract

Every reviewer launch prompt must include:

- `目的`: the exact question the reviewer must answer
- `対象ファイル`: absolute or repo-relative files to inspect
- `今回のユーザー指摘`: the concrete signal being reviewed
- `前提にしてよい事実`: facts the reviewer may rely on
- `疑ってほしい点`: likely failure modes, not a desired conclusion
- `出力形式`: required verdict fields and evidence format
- `編集可否`: normally `read-only; do not edit files`

Avoid relying on inherited chat history. Even when a tool supports history
forking, provide the context pack so the reviewer can be judged by durable
evidence rather than implicit memory.

## Prompt Template

```text
Read-only reviewer audit.

目的:
- <specific review question>

対象ファイル:
- <file/path>
- <file/path>

今回のユーザー指摘:
- <exact signal>

前提にしてよい事実:
- <known fact with evidence or commit id>

疑ってほしい点:
- <failure mode 1>
- <failure mode 2>

出力形式:
- verdict: PASS/FAIL/PARTIAL/proposed-only
- evidence: file:line references or command outputs
- recommended action: concrete ledger/skill/artifact changes
- blocking: yes/no and why

編集可否:
- read-only; do not edit files
```

## Integration Checklist

After a reviewer returns:

1. Read the verdict and evidence.
2. Decide whether each finding is `reflected`, `non-reusable`,
   `proposed-only`, or `pending with handoff`.
3. Apply durable edits as the main agent when authorized.
4. Record the reviewer invocation when firing evidence matters or when the
   reviewer materially affects the final decision.
5. Report both reflection status and reviewer/sub-agent status separately.

## Status Reporting

Use both lines when relevant:

```text
Feedback reflection: complete
- owner: main-agent
- ledger/rule/skill updates: <paths>
- checks: passed

Reviewer sub-agent:
- agent: <id> (<nickname>) when used
- evidence: .agent-feedback/SUBAGENT_INVOCATIONS.md#<run-id> when real firing matters
- last_subagent_mode: real-subagent / main-context-substituted / unavailable / not-required / pending
- last_subagent_firing: PASS / FAIL / PARTIAL / not-applicable
- last_subagent_verdict: PASS / FAIL / PARTIAL / proposed-only / stale / not-returned / not-applicable
- main_agent_action: remediated / accepted / non-reusable / pending
- final_artifact_status: PASS / FAIL / pending / not-reviewed / not-applicable
```

`Feedback reflection: complete` only means the main feedback reflection outcome
is complete. It is not proof that a reviewer sub-agent fired unless the reviewer
status says so and `.agent-feedback/SUBAGENT_INVOCATIONS.md` contains the
matching row.
