"""Runtime configuration for the local/Snowflake MVP."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    snowflake_account: str = ""
    snowflake_user: str = ""
    snowflake_role: str = "ACCOUNTADMIN"
    snowflake_warehouse: str = "RETAIL_AI_OPS_XS"
    snowflake_database: str = "RETAIL_AI_OPS"
    snowflake_schema: str = "MART"
    trace_path: Path = Path(".local-private/traces/events.jsonl")
    runtime_mode: str = "snowflake"


def load_settings() -> Settings:
    return Settings(
        snowflake_account=os.environ.get("SNOWFLAKE_ACCOUNT", ""),
        snowflake_user=os.environ.get("SNOWFLAKE_USER", ""),
        snowflake_role=os.environ.get("SNOWFLAKE_ROLE", "ACCOUNTADMIN"),
        snowflake_warehouse=os.environ.get("SNOWFLAKE_WAREHOUSE", "RETAIL_AI_OPS_XS"),
        snowflake_database=os.environ.get("SNOWFLAKE_DATABASE", "RETAIL_AI_OPS"),
        snowflake_schema=os.environ.get("SNOWFLAKE_SCHEMA", "MART"),
        trace_path=Path(
            os.environ.get("RETAIL_AI_OPS_TRACE_PATH", ".local-private/traces/events.jsonl")
        ),
        runtime_mode=os.environ.get("RETAIL_AI_OPS_RUNTIME", "snowflake"),
    )


def qualified_mart(settings: Settings, table: str = "MART_RETAIL_MONTHLY_KPI") -> str:
    return f"{settings.snowflake_database}.{settings.snowflake_schema}.{table}"
