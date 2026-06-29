select
  p_partkey::number as part_key,
  coalesce(p_type, p_brand)::varchar as category_name,
  p_brand::varchar as brand_name
from {{ source('src_tpch', 'part') }}
