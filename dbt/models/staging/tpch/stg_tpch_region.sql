select
  r_regionkey::number as region_key,
  r_name::varchar as region_name
from {{ source('src_tpch', 'region') }}
