"""Small data contracts for routing, planning, and trace logging."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


Route = Literal[
    "structured_kpi_question",
    "business_definition_question",
    "ambiguous_question",
    "unsupported_question",
]


@dataclass(frozen=True)
class ConversationContext:
    metric: str | None = None
    grain: str | None = None
    filters: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class QuestionPlan:
    question: str
    route: Route
    metric: str | None = None
    grain: str = "month"
    filters: dict[str, str] = field(default_factory=dict)
    time_window: str = "latest_6_months"
    sql: str | None = None
    confidence: float = 0.0
    safe_stop_reason: str | None = None


@dataclass(frozen=True)
class KpiResult:
    rows: list[dict[str, Any]]
    sql: str | None
    source: str
    warnings: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class CopilotAnswer:
    plan: QuestionPlan
    result: KpiResult | None
    answer: str
    citations: list[str] = field(default_factory=list)
    requires_human_review: bool = False
