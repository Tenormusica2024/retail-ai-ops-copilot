# Repository Responsibility Boundary

This repository is the public learning surface for architecture-diagram
reproduction and review, not the long-term owner of the full Snowflake/Streamlit
pipeline implementation.

## Repo 1: Diagram Reproduction And Learning Surface

This repo owns:

- high-fidelity HTML reproduction of the selected system architecture diagram
- GitHub Pages preview for reviewing the diagram at any time
- diagram assets, labels, layout fidelity, tooltips, and progress overlays
- progress-readiness scoring rules that explain what each node's percentage
  means
- feedback-ledger, reviewer sub-agent, and diagram-quality skills used to keep
  the diagram reproduction workflow improving

It is acceptable for this repo to contain a small reference MVP or smoke-test
code when that code is needed to make the diagram, progress labels, and learning
status concrete.

## Repo 2: Pipeline Implementation Owner

The full pipeline implementation should be owned by the implementation repo.
When work moves from diagram explanation into actual product behavior, return to
the implementation repo.

Repo 2 should own:

- Snowflake/Cortex/Streamlit feature development
- answer-quality evaluation, SQL/result correctness tests, UI E2E, and
  role/failure-path tests
- workflow improvements that change runtime behavior
- CI/CD, deployment, runtime observability, and operational guardrails
- production-like data contracts and integration evidence

## Handoff Rule

Use this repo to show what is implemented, unimplemented, or unvalidated. Do not
inflate a node's progress because the diagram repo contains a small reference
implementation.

When a progress tooltip reveals that a node needs real tests or workflow
improvements, the next implementation task belongs in repo 2. After repo 2
produces evidence, update this repo's diagram and progress-readiness score with
that evidence.
