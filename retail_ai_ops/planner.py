"""Rule-based MVP router and SQL planner.

The production architecture should route structured KPI questions to Cortex
Analyst. This MVP keeps the planner deterministic so that trace/eval behavior
can be tested before spending Cortex credits.
"""

from __future__ import annotations

from .config import Settings, qualified_mart
from .models import ConversationContext, QuestionPlan


METRIC_KEYWORDS: dict[str, tuple[str, ...]] = {
    "net_sales": ("売上", "sales", "revenue", "販売額"),
    "gross_margin_rate": ("粗利率", "粗利", "margin", "利益率"),
    "order_count": ("注文", "orders", "件数"),
    "avg_discount": ("割引", "discount"),
}

DEFINITION_KEYWORDS = ("定義", "意味", "計算式", "definition", "kpi")
UNSUPPORTED_KEYWORDS = ("顧客個人", "メールアドレス", "個票", "raw row", "個人情報")
FOLLOW_UP_KEYWORDS = ("大阪", "東京", "日本", "asia", "europe", "america", "それ", "同じ")

AREA_FILTERS: dict[str, tuple[str, str]] = {
    "日本": ("nation_name", "JAPAN"),
    "東京": ("nation_name", "JAPAN"),
    "大阪": ("nation_name", "JAPAN"),
    "asia": ("region_name", "ASIA"),
    "アジア": ("region_name", "ASIA"),
    "europe": ("region_name", "EUROPE"),
    "ヨーロッパ": ("region_name", "EUROPE"),
    "america": ("region_name", "AMERICA"),
}

CATEGORY_FILTERS: dict[str, str] = {
    "カテゴリ": "all",
    "category": "all",
    "brand": "all",
}


def detect_metric(question: str) -> str | None:
    q = question.lower()
    for metric, keywords in METRIC_KEYWORDS.items():
        if any(keyword.lower() in q for keyword in keywords):
            return metric
    return None


def detect_filters(question: str) -> dict[str, str]:
    q = question.lower()
    filters: dict[str, str] = {}
    for keyword, (field, value) in AREA_FILTERS.items():
        if keyword.lower() in q:
            filters[field] = value
    return filters


def route_question(
    question: str, context: ConversationContext | None = None, settings: Settings | None = None
) -> QuestionPlan:
    settings = settings or Settings()
    q = question.lower()

    if any(keyword.lower() in q for keyword in UNSUPPORTED_KEYWORDS):
        return QuestionPlan(
            question=question,
            route="unsupported_question",
            confidence=0.98,
            safe_stop_reason="unsafe_or_raw_data_request",
        )

    if any(keyword.lower() in q for keyword in DEFINITION_KEYWORDS) and not detect_metric(question):
        return QuestionPlan(
            question=question,
            route="business_definition_question",
            confidence=0.82,
            safe_stop_reason="definition_lookup",
        )

    metric = detect_metric(question)
    filters = detect_filters(question)

    if metric is None and context and context.metric and any(k.lower() in q for k in FOLLOW_UP_KEYWORDS):
        metric = context.metric
        filters = {**context.filters, **filters}

    if metric is None:
        return QuestionPlan(
            question=question,
            route="ambiguous_question",
            confidence=0.35,
            safe_stop_reason="missing_metric",
        )

    sql = build_sql(metric, filters, settings)
    return QuestionPlan(
        question=question,
        route="structured_kpi_question",
        metric=metric,
        grain="month",
        filters=filters,
        sql=sql,
        confidence=0.86 if filters else 0.74,
    )


def build_sql(metric: str, filters: dict[str, str], settings: Settings) -> str:
    table = qualified_mart(settings)
    where_parts = []
    for field, value in filters.items():
        where_parts.append(f"{field} = '{value}'")
    where_clause = "where " + " and ".join(where_parts) if where_parts else ""
    order_metric = metric if metric != "gross_margin_rate" else "net_sales"
    return f"""
select
  month_start,
  region_name,
  nation_name,
  category_name,
  net_sales,
  gross_margin,
  gross_margin_rate,
  order_count,
  avg_discount
from {table}
{where_clause}
qualify row_number() over (
  partition by region_name, nation_name, category_name
  order by month_start desc
) <= 6
order by month_start desc, {order_metric} desc
limit 50
""".strip()
