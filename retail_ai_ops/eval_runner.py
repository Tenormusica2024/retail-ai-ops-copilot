"""Golden evaluation runner for the deterministic MVP path."""

from __future__ import annotations

import json
from pathlib import Path

from .clients import LocalKpiClient
from .config import load_settings
from .copilot import answer_question


def run_eval(path: Path) -> dict[str, object]:
    settings = load_settings()
    cases = json.loads(path.read_text(encoding="utf-8"))
    client = LocalKpiClient()
    results = []
    passed = 0
    for case in cases:
        answer = answer_question(case["question"], client=client, settings=settings)
        ok = answer.plan.route == case["expected_route"]
        if case.get("expected_metric"):
            ok = ok and answer.plan.metric == case["expected_metric"]
        passed += int(ok)
        results.append(
            {
                "id": case["id"],
                "ok": ok,
                "route": answer.plan.route,
                "metric": answer.plan.metric,
                "requires_human_review": answer.requires_human_review,
            }
        )
    return {"passed": passed, "total": len(cases), "results": results}


def main() -> int:
    result = run_eval(Path("data/golden_eval.json"))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] == result["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
