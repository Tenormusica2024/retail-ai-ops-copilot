## Feedback Reflection

This project uses trigger-first feedback reflection.

During project work, if user/HITL feedback, reviewer findings, or a validated
improvement method appears, run the feedback ledger flow before final delivery.
This is a mandatory operating condition. Do not decide reusability first in the
main task. Capture the signal, classify it into `要望`, `指摘`, and/or `改善`,
then update or propose updates for the project ledger, rules, and skills
according to the current mode.

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
