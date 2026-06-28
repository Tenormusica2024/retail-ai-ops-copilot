---
name: ai-architecture-learning
description: >-
  Project-local parent skill for AI architecture learning metadata in this repo:
  node hover text, role responsibility boundaries, readiness labels, and
  learning-oriented architecture explanations.
---

# AI Architecture Learning

Use this project-local parent skill when editing learning metadata around the
architecture diagram, including node hover text, role responsibility splits,
progress/readiness labels, and explanations of why a technology or architecture
boundary exists.

This skill is for the AI architecture learning surface in this repo. It is not
the generic imagegen-to-HTML reproduction skill and should not be used to relax
visual fidelity gates.

## Child Skills

- `child-skills/role-responsibility-tooltips/SKILL.md`
  - role responsibility wording in hover cards
  - PM/DE/DS/AI engineer/PG boundary clarity
  - AI engineer and AI architect viewpoint split inside one combined role
  - Snowflake/Cortex managed-service responsibility boundaries
  - nested role-detail hover panels
  - tooltip text sizing and browser verification expectations

## Routing Rule

When feedback concerns who owns a concept, KPI, data definition, AI grounding,
tool routing, eval, trace, or implementation feasibility, route to the role
responsibility child skill before editing hover text.

Keep public wording educational and non-internal. Avoid implying a company
staffing model or official delivery responsibility.
