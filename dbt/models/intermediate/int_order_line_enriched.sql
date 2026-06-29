with order_lines as (
  select
    lineitem.order_key,
    lineitem.line_number,
    orders.order_date,
    date_trunc('month', orders.order_date)::date as month_start,
    region.region_name,
    nation.nation_name,
    part.category_name,
    lineitem.quantity,
    lineitem.extended_price,
    lineitem.discount_rate,
    lineitem.extended_price as gross_sales,
    lineitem.extended_price * lineitem.discount_rate as discount_amount,
    lineitem.extended_price * (1 - lineitem.discount_rate) as net_sales,
    partsupp.supply_cost * lineitem.quantity as supply_cost_amount
  from {{ ref('stg_tpch_lineitem') }} as lineitem
  join {{ ref('stg_tpch_orders') }} as orders
    on lineitem.order_key = orders.order_key
  join {{ ref('stg_tpch_customer') }} as customer
    on orders.customer_key = customer.customer_key
  join {{ ref('stg_tpch_nation') }} as nation
    on customer.nation_key = nation.nation_key
  join {{ ref('stg_tpch_region') }} as region
    on nation.region_key = region.region_key
  join {{ ref('stg_tpch_part') }} as part
    on lineitem.part_key = part.part_key
  join {{ ref('stg_tpch_partsupp') }} as partsupp
    on lineitem.part_key = partsupp.part_key
   and lineitem.supplier_key = partsupp.supplier_key
)

select
  order_key,
  line_number,
  order_date,
  month_start,
  region_name,
  nation_name,
  category_name,
  quantity,
  gross_sales,
  discount_amount,
  net_sales,
  supply_cost_amount,
  net_sales - supply_cost_amount as gross_margin
from order_lines
