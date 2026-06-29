select
  ps_partkey::number as part_key,
  ps_suppkey::number as supplier_key,
  ps_supplycost::number(18, 2) as supply_cost
from {{ source('src_tpch', 'partsupp') }}
