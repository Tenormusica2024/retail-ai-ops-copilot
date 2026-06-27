"""Orchestrate route, execution, answer formatting, and trace logging."""

from __future__ import annotations

from .clients import KpiClient
from .config import Settings
from .models import ConversationContext, CopilotAnswer
from .planner import route_question
from .trace import TraceLogger


def answer_question(
    question: str,
    client: KpiClient,
    settings: Settings,
    context: ConversationContext | None = None,
    trace_logger: TraceLogger | None = None,
) -> CopilotAnswer:
    plan = route_question(question, context=context, settings=settings)

    if plan.route == "unsupported_question":
        answer = "この質問は、生データまたはLLM-safe境界外の情報を要求しているため回答しません。"
        result = None
        requires_review = True
    elif plan.route == "ambiguous_question":
        answer = "確認したいKPI、地域、期間のいずれかが不足しています。例: 日本の粗利率を月次で見て。"
        result = None
        requires_review = False
    elif plan.route == "business_definition_question":
        answer = "KPI定義の質問です。初期MVPでは定義検索の仮応答へrouteし、Cortex Search接続後に引用付き回答へ置き換えます。"
        result = None
        requires_review = False
    else:
        result = client.execute(plan)
        answer = summarize_result(plan.metric or "KPI", result.rows)
        requires_review = plan.confidence < 0.8 or not result.rows

    copilot_answer = CopilotAnswer(
        plan=plan,
        result=result,
        answer=answer,
        citations=["semantic/retail_kpi_semantic_model.yaml"] if plan.sql else [],
        requires_human_review=requires_review,
    )

    if trace_logger:
        trace_logger.append(copilot_answer)

    return copilot_answer


def summarize_result(metric: str, rows: list[dict[str, object]]) -> str:
    if not rows:
        return "該当するKPI行が見つかりませんでした。フィルタまたはsemantic modelを確認してください。"
    top = rows[0]
    value = top.get(metric)
    month = top.get("month_start")
    region = top.get("region_name")
    nation = top.get("nation_name")
    category = top.get("category_name")
    return (
        f"{month} の {region}/{nation}/{category} では {metric} = {value} です。"
        " SQLと結果はtraceに保存しました。"
    )
