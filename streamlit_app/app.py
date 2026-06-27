"""Streamlit UI for the Retail AI Ops Copilot MVP."""

from __future__ import annotations

import os

import streamlit as st

from retail_ai_ops.clients import LocalKpiClient, SnowflakeKpiClient
from retail_ai_ops.config import load_settings
from retail_ai_ops.copilot import answer_question
from retail_ai_ops.models import ConversationContext
from retail_ai_ops.trace import TraceLogger


st.set_page_config(page_title="Retail AI Ops Copilot", layout="wide")
st.title("Retail AI Ops Copilot")

settings = load_settings()
runtime_mode = st.sidebar.selectbox(
    "実行モード",
    ["snowflake", "local_explicit_test"],
    index=0 if settings.runtime_mode == "snowflake" else 1,
)
st.sidebar.caption("Snowflake失敗時の自動代替実行はしません。local_explicit_testは明示選択時のみ使います。")

if runtime_mode == "snowflake":
    missing = [
        name
        for name, value in {
            "SNOWFLAKE_ACCOUNT": settings.snowflake_account,
            "SNOWFLAKE_USER": settings.snowflake_user,
            "SNOWFLAKE_PASSWORD": os.environ.get("SNOWFLAKE_PASSWORD", ""),
        }.items()
        if not value
    ]
    if missing:
        st.error(f"Snowflake live mode requires: {', '.join(missing)}")
        st.stop()
    client = SnowflakeKpiClient(settings)
else:
    st.warning("Local explicit test mode: Snowflake/Cortexの代替ではなく、router/trace/evalの明示検証専用です。")
    client = LocalKpiClient()
trace_logger = TraceLogger(settings.trace_path)

if "context" not in st.session_state:
    st.session_state.context = ConversationContext()

question = st.chat_input("例: 日本の粗利率を月次で見て")
if question:
    try:
        answer = answer_question(
            question,
            client=client,
            settings=settings,
            context=st.session_state.context,
            trace_logger=trace_logger,
        )
    except Exception as exc:  # UI should fail visibly while keeping the app alive.
        st.error(f"実行に失敗しました: {exc}")
        st.stop()

    st.session_state.context = ConversationContext(
        metric=answer.plan.metric,
        grain=answer.plan.grain,
        filters=answer.plan.filters,
    )

    st.chat_message("user").write(question)
    st.chat_message("assistant").write(answer.answer)

    cols = st.columns([1, 1])
    with cols[0]:
        st.subheader("Route / Plan")
        st.json(
            {
                "route": answer.plan.route,
                "metric": answer.plan.metric,
                "filters": answer.plan.filters,
                "confidence": answer.plan.confidence,
                "safe_stop_reason": answer.plan.safe_stop_reason,
                "requires_human_review": answer.requires_human_review,
            }
        )
    with cols[1]:
        st.subheader("Trace")
        st.write(str(settings.trace_path))
        st.write(runtime_mode)

    if answer.plan.sql:
        st.subheader("SQL Preview")
        st.code(answer.plan.sql, language="sql")
    if answer.result:
        st.subheader("Result")
        st.dataframe(answer.result.rows, use_container_width=True)

    if answer.requires_human_review:
        st.warning("Human review candidate")
else:
    st.caption("質問を入力すると、route、SQL、結果、traceが表示されます。")
