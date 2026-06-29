select
  o_orderkey::number as order_key,
  o_custkey::number as customer_key,
  o_orderdate::date as order_date
from {{ source('src_tpch', 'orders') }}
