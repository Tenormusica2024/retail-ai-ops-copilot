# Project Feedback Ledger

This ledger records every user/HITL feedback item, reviewer finding, and
validated improvement method that appears during project work. Capture first,
then classify each item as reflected, proposed-only, non-reusable, pending, or
blocked.

## Reflection Status Vocabulary

- `reflected`: project artifact/rule/skill updated
- `proposed-only`: current mode did not allow edits
- `non-reusable`: captured but intentionally not promoted
- `pending with handoff`: reflection is not complete; handoff exists
- `blocked`: cannot proceed without user or external input

## 要望

| ID | Date | Source | 要望 | Context | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | 2026-06-28 | user | Use this real project, not a throwaway project, to dogfood the global feedback-ledger flow before E2E. | `retail-ai-ops-copilot` already has similar diagram-specific feedback skill behavior. | `.agent-feedback/` scaffold / project rules | reflected |
| REQ-002 | 2026-06-28 | user | Prevent duplicate sub-agent invocation when both global and project/domain-specific feedback ledger skills apply. | Global ledger E2E should be clean before retiring project-specific feedback skill behavior. | project feedback rules / global single-lane rule | reflected |
| REQ-003 | 2026-06-28 | user | If the global skill E2E succeeds, the project-specific feedback ledger skill can become removable or legacy-only. | Migration path from diagram-specific standing ledger to generic global ledger. | pending E2E migration decision | reflected |

## 指摘

| ID | Date | Source | 指摘 | Root Cause | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FB-001 | 2026-06-28 | user | A global feedback ledger plus an existing project/domain-specific feedback ledger can spawn redundant reflection sub-agents. | Both skills claim standing/passive feedback reflection ownership for the same trigger batch. | single reflection lane policy | reflected |
| FB-002 | 2026-06-28 | user | Running E2E in a throwaway project would not test the real duplicate-skill migration risk. | The actual conflict exists in this project because the diagram-specific skill already exists. | dogfood target selection | reflected |

## 改善

| ID | Date | Source | 改善内容 | Evidence | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-001 | 2026-06-28 | implementation | Add a project-local `.agent-feedback/` scaffold and root `AGENTS.md` pointer to make the global ledger discoverable in this project. | Scaffold script created the project ledger, snippet, project skill, and pointer block. | `.agent-feedback/` / `AGENTS.md` | reflected |
| IMP-002 | 2026-06-28 | implementation | Treat the global ledger as the single trigger owner and use domain-specific feedback skills as context or update targets. | Generic skill and installed diagram-specific skill were updated with single-lane bridge wording. | project feedback rules / installed skills | reflected |

## Pending Reflection

| ID | Source | Signal | Target | Owner | Blocker/Timeout | Next Step |
| --- | --- | --- | --- | --- | --- | --- |
