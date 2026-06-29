## Feedback Reflection

This project uses trigger-first feedback reflection.

During project work, if user/HITL feedback, reviewer findings, or a validated
improvement method appears, run the feedback ledger flow before final delivery.
This is a mandatory operating condition. Do not decide reusability first in the
main task. Capture the signal, classify it into `要望`, `指摘`, and/or `改善`,
then update or propose updates for the project ledger, rules, and skills
according to the current mode.

Make the trigger decision explicitly when the task mentions feedback, review
findings, missed reflection, skill/rule updates, root-cause analysis, reusable
fixes, workflow changes, or cues such as `指摘`, `改善`, `反映`, `発火`,
`スキル`, `ルール`, `漏れ`, or `なぜ`. If the decision itself was skipped,
record that as a trigger-condition defect.

Use one externally visible value in the final reflection block, ledger row, or
handoff: `trigger_decision=fired`, `trigger_decision=not-triggered`, or
`trigger_decision=missed`.

Mode boundaries:

- normal implementation: capture every trigger, then update project
  ledger/rules/skills or mark `non-reusable`
- read-only review: propose updates only
- artifact-only: do not edit skills unless authorized
- no project ledger/skill: create `.agent-feedback/` scaffold when edits are
  allowed

Final answers for triggered work must include reflection status:
`complete`, `main-context substituted`, `proposed-only`, `pending with handoff`,
`non-reusable`, or `not-triggered: no feedback/reviewer/improvement signal`.

Run one feedback reflection lane per trigger batch. If a domain-specific
feedback skill also applies, use it as context or as the update target for the
single lane instead of spawning duplicate ledger sub-agents.

The main agent owns final artifact, ledger, and skill edits. Use reviewer
sub-agents as read-only independent reviewers with an explicit context pack; do
not assume they share the full session context. See
`.agent-feedback/REVIEWER_SUBAGENT_DESIGN.md`.

When the objective is to verify real sub-agent firing, record agent id,
nickname, prompt summary, lane classification, canonical status tuple, verdict,
main-agent action, final artifact status, invocation row, and substitution
reason when applicable in `.agent-feedback/SUBAGENT_INVOCATIONS.md`.
Main-context-only completion is not a PASS for real-subagent E2E while
sub-agent tooling is available.

After editing feedback ledgers, rules, or repo-local skills, run:

```bash
node tools/check_feedback_reflection.mjs
```

This lint catches structural reflection misses, but it does not replace the
natural-language trigger decision.
