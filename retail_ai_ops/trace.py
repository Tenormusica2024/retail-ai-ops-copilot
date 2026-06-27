"""Trace writer for LLMOps/eval observability."""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .models import CopilotAnswer


class TraceLogger:
    def __init__(self, path: Path):
        self.path = path

    def append(self, answer: CopilotAnswer) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        event = {
            "ts": datetime.now(UTC).isoformat(),
            "route": answer.plan.route,
            "metric": answer.plan.metric,
            "confidence": answer.plan.confidence,
            "safe_stop_reason": answer.plan.safe_stop_reason,
            "requires_human_review": answer.requires_human_review,
            "question": answer.plan.question,
            "sql": answer.plan.sql,
            "result_source": answer.result.source if answer.result else None,
            "row_count": len(answer.result.rows) if answer.result else 0,
            "answer": answer.answer,
            "citations": answer.citations,
        }
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(_safe(event), ensure_ascii=False) + "\n")


def _safe(value: Any) -> Any:
    if hasattr(value, "__dataclass_fields__"):
        return asdict(value)
    if isinstance(value, dict):
        return {k: _safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_safe(v) for v in value]
    return value
