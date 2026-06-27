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
| REQ-004 | 2026-06-28 | user | Investigate and fix the red dashed correction-request correlation arrow that enters nodes, and analyze why it was missed. | Architecture HTML diagram E2E topic from HITL screenshot. | architecture HTML / project rules / diagram skills | reflected |
| REQ-005 | 2026-06-28 | user | Deeply investigate why the sub-agent did not fire when that was the main E2E objective. | Follow-up after the arrow fix revealed the E2E objective was not satisfied. | project feedback rules / global ledger skill | reflected |
| REQ-006 | 2026-06-28 | user | Preserve the source diagram's nested dbt/category structure instead of flattening dbt-related items into ordinary peer cards. | Source shows dbt staging, dbt marts, and dbt tests inside a nested transformation/modeling frame. | architecture HTML / project diagram rule / installed diagram skills | reflected |
| REQ-007 | 2026-06-28 | user | Show a Snowpipe icon for the data lake ingestion area when the source identifies Snowpipe. | Source shows Snowpipe as an ingestion item, but the HTML only had Snowpipe as text inside STAGE/RAW. | architecture HTML / logo asset skill | reflected |
| REQ-008 | 2026-06-28 | user | Allow splitting the feedback-routing skill into child packs/subskills when it improves routing accuracy. | Current installed diagram feedback skill mixes trigger ownership, routing taxonomy, ledger traceability, and invocation evidence. | installed diagram feedback skill / project feedback rules | reflected |
| REQ-009 | 2026-06-28 | user | Actively improve the remaining prompt-quality issues instead of leaving them as review findings. | Prior review found weak child-pack evidence, ambiguous sub-agent status vocabulary, insufficient source-hierarchy evidence, and brittle endpoint measurement wording. | project feedback rules / installed diagram feedback skills | reflected |
| REQ-010 | 2026-06-28 | user | Do not silently fall back when Snowflake is unavailable. | Silent fallback would hide the exact live integration failure the user needs to learn from. | runtime mode / project feedback rules | reflected |

## 指摘

| ID | Date | Source | 指摘 | Root Cause | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FB-001 | 2026-06-28 | user | A global feedback ledger plus an existing project/domain-specific feedback ledger can spawn redundant reflection sub-agents. | Both skills claim standing/passive feedback reflection ownership for the same trigger batch. | single reflection lane policy | reflected |
| FB-002 | 2026-06-28 | user | Running E2E in a throwaway project would not test the real duplicate-skill migration risk. | The actual conflict exists in this project because the diagram-specific skill already exists. | dogfood target selection | reflected |
| FB-003 | 2026-06-28 | user | The red dashed `修正依頼` loop visibly entered the Error Taxonomy and human review node bodies. | The path endpoint used stale `y=864` coordinates while both nodes currently end at `y=876`; review relied on visual/path existence rather than endpoint-vs-node-rectangle measurement. | connector endpoint validation | reflected |
| FB-004 | 2026-06-28 | user / sub-agent review | The arrow-fix E2E did not prove real sub-agent firing. | The main agent conflated "feedback reflection flow ran" with "a real sub-agent fired"; the E2E checklist did not require agent id, prompt, verdict, or an explicit `main-context substituted` reason. Evidence: `INV-20260628-001`. | sub-agent firing E2E gate | reflected |
| FB-005 | 2026-06-28 | sub-agent review | `main-context substituted` was not sufficient for this E2E. | The task objective was specifically to prove sub-agent firing, and sub-agent tooling was available. Evidence: `INV-20260628-001` through `INV-20260628-004`. | project feedback rules / global ledger skill | reflected |
| FB-006 | 2026-06-28 | user / sub-agent review | The HTML flattened the dbt nested frame, making CI/CD -> dbt tests and dbt marts -> Semantic KPI Model look like direct relationships. | The implementation inventoried parent zones and nodes, but not nested mini-frames/subcategory frames and their anchor semantics. Evidence: `INV-20260628-005` and `INV-20260628-006`. | source hierarchy fidelity / arrow anchor classification | reflected |
| FB-007 | 2026-06-28 | user / sub-agent review | The Snowpipe ingestion role was visually under-specified because the Snowpipe icon was missing from the data lake area. | The sprite asset existed, but HTML embedded Snowpipe as text inside STAGE/RAW instead of rendering the source-identified ingestion item. Evidence: `INV-20260628-005` and `INV-20260628-006`. | logo asset fidelity / architecture HTML | reflected |
| FB-008 | 2026-06-28 | sub-agent review | The first dbt subzone fix still missed source details: dbt logo/header, inner stack frame, Snowpipe nesting, and source marker treatment. | The artifact fixed the broad direct-collapse symptom but had not yet rechecked exact source hierarchy after adding subzones. Evidence: `INV-20260628-006`. | layout / arrow fidelity / connector routing | reflected |
| FB-009 | 2026-06-28 | user / sub-agent review | Last sub-agent status can be misreported if "real sub-agent fired" and "sub-agent verdict passed" are collapsed into one PASS/FAIL. | Invocation evidence records mode separately from verdict, but final summaries need to preserve both fields. Evidence: `INV-20260628-007`. | sub-agent firing E2E gate / feedback status wording | reflected |
| FB-010 | 2026-06-28 | sub-agent review | The installed diagram feedback ledger was overloaded, making routing and evidence rules easier to miss. | Trigger ownership, global bridge, routing taxonomy, persistent ledger, and reviewer-output contract were bundled into one prompt body. Evidence: `INV-20260628-007`. | child routing packs / skill structure | reflected |
| FB-011 | 2026-06-28 | user / sub-agent review | Child-pack routing was present but did not require concrete pack paths, `loaded_child_packs`, routing reason, or evidence whenever packs are used. | The previous gate only asked to name packs when routing itself was the user question, so actual future use could remain invisible. Evidence: `INV-20260628-008`. | child-pack evidence / ledger hygiene | reflected |
| FB-012 | 2026-06-28 | user / sub-agent review | Sub-agent reporting still risked mixing mode, firing, reviewer verdict, main-agent action, and final artifact status. | PASS/FAIL vocabulary was too narrow and did not cover unavailable, not-required, stale, not-returned, or not-reviewed states. Evidence: `INV-20260628-008`. | process routing / E2E status tuple | reflected |
| FB-013 | 2026-06-28 | user / sub-agent review | Source hierarchy fidelity rules still leaned on inventory prose without requiring a structured evidence matrix. | A reviewer could say "nested frames checked" without source crop, selector/path evidence, or row-level matched/FAIL status. Evidence: `INV-20260628-008`. | layout routing / source hierarchy matrix | reflected |
| FB-014 | 2026-06-28 | user / sub-agent review | Connector endpoint guidance over-relied on `offsetLeft`/`offsetTop`, which is brittle under transforms, responsive scale, nested containers, or SVG coordinate conversion. | The robust method is rendered DOM measurement with `getBoundingClientRect()` and conversion into SVG coordinates, such as `getScreenCTM().inverse()`. Evidence: `INV-20260628-008`. | connector endpoint measurement | reflected |
| FB-015 | 2026-06-28 | user | The first implementation wording introduced "Snowflake unavailable -> local stub" as a fallback, which could hide live Snowflake/Cortex failures. | The implementation treated local mode as a convenience fallback instead of an explicitly selected test harness. | runtime mode / UI / docs | reflected |

## 改善

| ID | Date | Source | 改善内容 | Evidence | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-001 | 2026-06-28 | implementation | Add a project-local `.agent-feedback/` scaffold and root `AGENTS.md` pointer to make the global ledger discoverable in this project. | Scaffold script created the project ledger, snippet, project skill, and pointer block. | `.agent-feedback/` / `AGENTS.md` | reflected |
| IMP-002 | 2026-06-28 | implementation | Treat the global ledger as the single trigger owner and use domain-specific feedback skills as context or update targets. | Generic skill and installed diagram-specific skill were updated with single-lane bridge wording. | project feedback rules / installed skills | reflected |
| IMP-003 | 2026-06-28 | implementation | Recalculate the `修正依頼` loop endpoint to node bottom `y=876`, add a `data-edge`, and verify with `getPointAtLength()` against measured node rectangles. | Playwright/Chrome measurement confirmed start/end match node centers and bottoms after the fix. | architecture HTML / diagram skills | reflected |
| IMP-004 | 2026-06-28 | sub-agent review remediation | Split "reflection completed" from "sub-agent fired" and require real sub-agent evidence when the E2E objective is sub-agent firing. | Tesla/Nash/Dewey/Sartre all converged on missing real-subagent evidence as the E2E failure; see `INV-20260628-001` through `INV-20260628-004`. | project feedback rules / global ledger skill | reflected |
| IMP-005 | 2026-06-28 | implementation / sub-agent review | Add nested frames for Data Lake/ingestion, dbt transformation/modeling, Semantic layer, and AI access; render Snowpipe with the source-derived sprite; add a dbt header/icon and inner dbt stack frame. | Chrome screenshot `outputs/dbt-subzones-snowpipe-check-v2.png`; CDP endpoint measurement found 0 service overlaps and updated dbt/Semantic endpoints. | architecture HTML | reflected |
| IMP-006 | 2026-06-28 | implementation | Promote a nested mini-frame inventory and subframe-vs-node arrow anchor classification rule so future diagram work does not flatten source hierarchy into misleading direct edges. | Raman proposed the durable rule; Mencius found the first fix still incomplete until dbt header/inner frames and Snowpipe nesting were added. | project skill / installed diagram skills | reflected |
| IMP-007 | 2026-06-28 | implementation / sub-agent review | Add child routing packs under the installed diagram feedback skill while keeping the parent skill as the single trigger owner. | Huygens recommended light child packs and warned against over-splitting; implementation added process, layout/visual, connector/arrow, assets/text, and ledger hygiene packs as reference packs, not separate lanes. | installed diagram feedback skill / project feedback rules | reflected |
| IMP-008 | 2026-06-28 | implementation / sub-agent review | Tighten the feedback-routing prompt contract with concrete child-pack paths and evidence fields, a five-part sub-agent status tuple, source hierarchy matrix requirements, and rendered SVG endpoint coordinate conversion. | Bacon confirmed the four weak spots; project and installed skills were updated in organized sections rather than raw append-only notes. | project feedback rules / installed diagram feedback skills | reflected |
| IMP-009 | 2026-06-28 | implementation | Replace implicit fallback with explicit `snowflake` vs `local_explicit_test` runtime modes, and make Snowflake live failures visible. | Streamlit now defaults to Snowflake mode and errors on missing credentials; local test execution is only available through an explicit UI mode. | runtime mode / README / docs / project skill | reflected |
| IMP-010 | 2026-06-28 | implementation | Rename internal route-blocking metadata from `fallback_reason` to `safe_stop_reason`. | This prevents Snowflake runtime fallback from being conflated with agent-level clarification, refusal, or handoff states. | model / trace / UI / tests / docs | reflected |

## Pending Reflection

| ID | Source | Signal | Target | Owner | Blocker/Timeout | Next Step |
| --- | --- | --- | --- | --- | --- | --- |
