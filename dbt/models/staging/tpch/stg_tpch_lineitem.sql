select
  l_orderkey::number as order_key,
  l_linenumber::number as line_number,
  l_partkey::number as part_key,
  l_suppkey::number as supplier_key,
  l_quantity::number(18, 2) as quantity,
  l_extendedprice::number(18, 2) as extended_price,
  l_discount::number(18, 6) as discount_rate
from {{ source('src_tpch', 'lineitem') }}
