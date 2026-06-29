select
  n_nationkey::number as nation_key,
  n_name::varchar as nation_name,
  n_regionkey::number as region_key
from {{ source('src_tpch', 'nation') }}
