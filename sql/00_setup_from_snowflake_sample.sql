-- Retail AI Ops Copilot Snowflake setup.
--
-- First implementation target:
--   SNOWFLAKE_SAMPLE_DATA.TPCH_SF1 -> RETAIL_AI_OPS.MART.MART_RETAIL_MONTHLY_KPI
--
-- TPCH_SF1 is the current fixed learning dataset because it is bundled as
-- Snowflake sample data and keeps the first LLMOps slice cheap and reproducible.
-- Tasty Bytes or richer retail samples are later expansion candidates, not a
-- silent fallback for this setup script.

use role accountadmin;

create warehouse if not exists RETAIL_AI_OPS_XS
  warehouse_size = xsmall
  auto_suspend = 60
  auto_resume = true
  initially_suspended = true;

create database if not exists RETAIL_AI_OPS;
create schema if not exists RETAIL_AI_OPS.STAGING;
create schema if not exists RETAIL_AI_OPS.INTERMEDIATE;
create schema if not exists RETAIL_AI_OPS.MART;
create schema if not exists RETAIL_AI_OPS.OPS;

use warehouse RETAIL_AI_OPS_XS;
use database RETAIL_AI_OPS;
use schema MART;

create or replace view MART_RETAIL_MONTHLY_KPI as
select
  date_trunc('month', o.o_orderdate)::date as month_start,
  r.r_name::varchar as region_name,
  n.n_name::varchar as nation_name,
  coalesce(p.p_type, p.p_brand)::varchar as category_name,
  count(distinct o.o_orderkey) as order_count,
  sum(l.l_quantity) as item_quantity,
  sum(l.l_extendedprice) as gross_sales,
  sum(l.l_extendedprice * l.l_discount) as discount_amount,
  sum(l.l_extendedprice * (1 - l.l_discount)) as net_sales,
  sum(ps.ps_supplycost * l.l_quantity) as supply_cost_amount,
  sum((l.l_extendedprice * (1 - l.l_discount)) - (ps.ps_supplycost * l.l_quantity)) as gross_margin,
  div0(
    sum((l.l_extendedprice * (1 - l.l_discount)) - (ps.ps_supplycost * l.l_quantity)),
    nullif(sum(l.l_extendedprice * (1 - l.l_discount)), 0)
  ) as gross_margin_rate,
  div0(
    sum(l.l_extendedprice * l.l_discount),
    nullif(sum(l.l_extendedprice), 0)
  ) as avg_discount
from snowflake_sample_data.tpch_sf1.orders o
join snowflake_sample_data.tpch_sf1.lineitem l
  on o.o_orderkey = l.l_orderkey
join snowflake_sample_data.tpch_sf1.customer c
  on o.o_custkey = c.c_custkey
join snowflake_sample_data.tpch_sf1.nation n
  on c.c_nationkey = n.n_nationkey
join snowflake_sample_data.tpch_sf1.region r
  on n.n_regionkey = r.r_regionkey
join snowflake_sample_data.tpch_sf1.part p
  on l.l_partkey = p.p_partkey
join snowflake_sample_data.tpch_sf1.partsupp ps
  on l.l_partkey = ps.ps_partkey
 and l.l_suppkey = ps.ps_suppkey
group by 1, 2, 3, 4;

create or replace table RETAIL_AI_OPS.MART.KPI_DEFINITIONS (
  kpi_name varchar,
  business_definition varchar,
  llm_safe boolean,
  owner varchar
) as
select
  column1::varchar as kpi_name,
  column2::varchar as business_definition,
  column3::boolean as llm_safe,
  column4::varchar as owner
from values
  ('net_sales', 'Discount-adjusted sales amount from line items.', true, 'AI architecture MVP'),
  ('gross_margin_rate', 'Gross margin divided by net sales. In the current TPCH sample this is a proxy using supply cost.', true, 'AI architecture MVP'),
  ('order_count', 'Distinct order count at the mart grain.', true, 'AI architecture MVP'),
  ('avg_discount', 'Discount amount divided by gross sales.', true, 'AI architecture MVP');

create or replace table RETAIL_AI_OPS.OPS.COPILOT_TRACE_LOG (
  created_at timestamp_ntz default current_timestamp(),
  route varchar,
  metric varchar,
  question varchar,
  generated_sql varchar,
  result_source varchar,
  row_count number,
  requires_human_review boolean,
  payload variant
);

select
  month_start,
  region_name,
  nation_name,
  category_name,
  net_sales,
  gross_margin_rate
from RETAIL_AI_OPS.MART.MART_RETAIL_MONTHLY_KPI
where nation_name = 'JAPAN'
order by month_start desc, net_sales desc
limit 10;
