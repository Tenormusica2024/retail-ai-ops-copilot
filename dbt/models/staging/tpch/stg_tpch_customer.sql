select
  c_custkey::number as customer_key,
  c_nationkey::number as nation_key
from {{ source('src_tpch', 'customer') }}
