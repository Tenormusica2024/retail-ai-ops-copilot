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
| INV-20260628-005 | 2026-06-28 | REQ-006 REQ-007 FB-006 FB-007 IMP-006 | real-subagent | 019f09d0-0eb7-72b1-bd63-6d1964d4c0c3 | Raman | Non-blocking feedback reflection lane for the HITL dbt subcategory/Snowpipe icon trigger batch. | proposed-only: existing rules partially covered parent-zone and icon fidelity, but nested mini-frame inventory was not explicit enough. | Added ledger rows, project source hierarchy gate, and installed-skill routing updates. | Raman sub-agent verdict |
| INV-20260628-006 | 2026-06-28 | FB-006 FB-007 FB-008 IMP-005 IMP-006 | real-subagent | 019f09d0-2732-7f23-b702-7a8f47539d9e | Mencius | Read-only source-fidelity review of selected-source vs current HTML around dbt/data lake/Snowpipe. | FAIL for exact source fidelity after the first fix: dbt logo/header, inner dbt stack frame, Snowpipe nesting, and arrow marker/endpoint details still needed. | Added dbt header/icon, inner frames, Snowpipe source-derived sprite card, CI/CD dual marker, and dbt-frame-to-Semantic card edge routing. | Mencius sub-agent verdict; screenshot `outputs/dbt-subzones-snowpipe-check-v2.png` |
| INV-20260628-007 | 2026-06-28 | REQ-008 FB-009 FB-010 IMP-007 | real-subagent | 019f09df-31dd-7623-800c-1ffa88f46490 | Huygens | Review prior firing status and whether feedback-routing should split into child packs/subskills. | proposed-only: prior firing was PASS, latest reviewer verdict was FAIL before main remediation; child packs should be added lightly while parent remains single trigger owner. | Added child routing packs, status wording, project ledger rows, and project child-pack gate. | Huygens sub-agent verdict |
