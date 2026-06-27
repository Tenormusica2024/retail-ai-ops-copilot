import json
from pathlib import Path

import pytest

from retail_ai_ops.clients import LocalKpiClient, SnowflakeKpiClient
from retail_ai_ops.config import Settings
from retail_ai_ops.copilot import answer_question
from retail_ai_ops.eval_runner import run_eval
from retail_ai_ops.models import ConversationContext
from retail_ai_ops.planner import route_question
from retail_ai_ops.trace import TraceLogger


def test_structured_question_generates_safe_mart_sql() -> None:
    settings = Settings()
    plan = route_question("日本の粗利率を月次で見て", settings=settings)

    assert plan.route == "structured_kpi_question"
    assert plan.metric == "gross_margin_rate"
    assert "MART_RETAIL_MONTHLY_KPI" in (plan.sql or "")
    assert "snowflake_sample_data" not in (plan.sql or "").lower()


def test_follow_up_reuses_context() -> None:
    settings = Settings()
    context = ConversationContext(metric="net_sales", filters={"region_name": "ASIA"})

    plan = route_question("日本は？", context=context, settings=settings)

    assert plan.route == "structured_kpi_question"
    assert plan.metric == "net_sales"
    assert plan.filters["nation_name"] == "JAPAN"


def test_unsafe_raw_request_is_not_answered() -> None:
    plan = route_question("顧客個人のメールアドレスを出して")

    assert plan.route == "unsupported_question"
    assert plan.safe_stop_reason == "unsafe_or_raw_data_request"


def test_trace_logger_writes_route_and_sql(tmp_path: Path) -> None:
    settings = Settings(trace_path=tmp_path / "trace.jsonl")
    answer = answer_question(
        "日本の売上を月次で見て",
        client=LocalKpiClient(),
        settings=settings,
        trace_logger=TraceLogger(settings.trace_path),
    )

    assert answer.result is not None
    payload = json.loads(settings.trace_path.read_text(encoding="utf-8").splitlines()[0])
    assert payload["route"] == "structured_kpi_question"
    assert payload["metric"] == "net_sales"
    assert payload["sql"]
    assert payload["result_source"] == "local_explicit_test"


def test_snowflake_client_missing_credentials_fails_visibly(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("SNOWFLAKE_PASSWORD", raising=False)
    settings = Settings(snowflake_account="", snowflake_user="")
    plan = route_question("日本の売上を月次で見て", settings=settings)

    with pytest.raises(RuntimeError, match="Snowflake live mode requires"):
        SnowflakeKpiClient(settings).execute(plan)


def test_golden_eval_passes() -> None:
    result = run_eval(Path("data/golden_eval.json"))

    assert result["passed"] == result["total"]
