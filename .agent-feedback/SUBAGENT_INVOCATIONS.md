# Sub-Agent Invocation Evidence

Use this file to prove whether feedback reflection actually used a sub-agent or
intentionally substituted the main context.

## Modes

- `real-subagent`: a real sub-agent was spawned and returned a verdict
- `main-context-substituted`: no real sub-agent was used; the reason is recorded
- `pending`: the invocation was started but not finished before handoff

## Invocations

| Run ID | Date | Trigger IDs | Mode | Agent ID | Nickname | Prompt Summary | Verdict | Main Agent Action | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-20260628-001 | 2026-06-28 | FB-004 FB-005 IMP-004 | real-subagent | 019f09c0-225f-7620-aadb-3e02e88ee9f9 | Tesla | Review whether the arrow-fix E2E proved real feedback-ledger sub-agent firing. | FAIL: artifact and reflection were complete, but the original E2E lacked real sub-agent evidence or an explicit substitution reason. | Recorded the failure in the project ledger and added a Sub-Agent Firing E2E Gate. | Tesla sub-agent verdict; `.agent-feedback/FEEDBACK_LEDGER.md` FB-004/FB-005/IMP-004 |
| INV-20260628-002 | 2026-06-28 | REQ-005 FB-004 FB-005 IMP-004 | real-subagent | 019f09c3-7ec0-7361-a5ec-e26ea7f20bb0 | Nash | Analyze rule and contract wording that allowed main-context-only completion. | FAIL root cause: `may delegate`, broad `main-context substituted`, and missing real-subagent evidence criteria weakened the contract. | Propagated real-subagent evidence requirements into the global skill suite. | Nash sub-agent findings |
| INV-20260628-003 | 2026-06-28 | REQ-005 FB-004 FB-005 IMP-004 | real-subagent | 019f09c3-b3f2-7812-a51b-9c0f80c31a21 | Dewey | Analyze main-agent runtime decision failures and timing. | FAIL root cause: the E2E stimulus was treated as a normal artifact fix, and single-lane duplicate prevention was misread as firing suppression. | Added project and global gates requiring E2E charter, lane owner, and final owner evidence. | Dewey sub-agent findings |
| INV-20260628-004 | 2026-06-28 | REQ-005 FB-004 FB-005 IMP-004 | real-subagent | 019f09c4-21c3-7880-9829-bc96fb92eddc | Sartre | Analyze missing evidence artifacts and test design for sub-agent firing E2E. | FAIL root cause: there was no durable observation point for agent id, prompt, verdict, or main-agent action. | Added this invocation evidence file and project-level E2E check requirements. | Sartre sub-agent findings |
