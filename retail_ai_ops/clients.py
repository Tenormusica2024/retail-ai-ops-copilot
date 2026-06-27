"""KPI execution clients.

Snowflake is optional at import time so tests and UI demos can run without
connector installation or credentials.
"""

from __future__ import annotations

import os
from decimal import Decimal
from typing import Any, Protocol

from .config import Settings
from .models import KpiResult, QuestionPlan


class KpiClient(Protocol):
    def execute(self, plan: QuestionPlan) -> KpiResult:
        ...


class LocalKpiClient:
    """Deterministic in-memory result provider for E2E and UI smoke tests."""

    def execute(self, plan: QuestionPlan) -> KpiResult:
        if plan.route != "structured_kpi_question":
            return KpiResult(rows=[], sql=plan.sql, source="local_explicit_test")

        nation = plan.filters.get("nation_name", "JAPAN")
        region = plan.filters.get("region_name", "ASIA")
        rows = [
            {
                "month_start": "1998-07-01",
                "region_name": region,
                "nation_name": nation,
                "category_name": "PROMO RETAIL",
                "net_sales": 1284300.25,
                "gross_margin": 292100.40,
                "gross_margin_rate": 0.2274,
                "order_count": 1842,
                "avg_discount": 0.052,
            },
            {
                "month_start": "1998-06-01",
                "region_name": region,
                "nation_name": nation,
                "category_name": "STANDARD RETAIL",
                "net_sales": 1198300.10,
                "gross_margin": 301880.92,
                "gross_margin_rate": 0.2519,
                "order_count": 1718,
                "avg_discount": 0.047,
            },
        ]
        return KpiResult(rows=rows, sql=plan.sql, source="local_explicit_test")


class SnowflakeKpiClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    def execute(self, plan: QuestionPlan) -> KpiResult:
        if not plan.sql:
            return KpiResult(rows=[], sql=None, source="snowflake")

        password = os.environ.get("SNOWFLAKE_PASSWORD", "")
        missing = [
            name
            for name, value in {
                "SNOWFLAKE_ACCOUNT": self.settings.snowflake_account,
                "SNOWFLAKE_USER": self.settings.snowflake_user,
                "SNOWFLAKE_PASSWORD": password,
            }.items()
            if not value
        ]
        if missing:
            raise RuntimeError(f"Snowflake live mode requires: {', '.join(missing)}")

        try:
            import snowflake.connector  # type: ignore[import-not-found]
        except ImportError as exc:
            raise RuntimeError("snowflake-connector-python is not installed") from exc

        conn = snowflake.connector.connect(
            account=self.settings.snowflake_account,
            user=self.settings.snowflake_user,
            password=password,
            role=self.settings.snowflake_role,
            warehouse=self.settings.snowflake_warehouse,
            database=self.settings.snowflake_database,
            schema=self.settings.snowflake_schema,
        )
        try:
            with conn.cursor() as cur:
                cur.execute(plan.sql)
                columns = [desc[0].lower() for desc in cur.description or []]
                rows = [dict(zip(columns, map(_json_safe, row))) for row in cur.fetchall()]
        finally:
            conn.close()
        return KpiResult(rows=rows, sql=plan.sql, source="snowflake")


def _json_safe(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value
