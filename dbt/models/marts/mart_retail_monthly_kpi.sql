select
  month_start,
  region_name,
  nation_name,
  category_name,
  count(distinct order_key) as order_count,
  sum(quantity) as item_quantity,
  sum(gross_sales) as gross_sales,
  sum(discount_amount) as discount_amount,
  sum(net_sales) as net_sales,
  sum(supply_cost_amount) as supply_cost_amount,
  sum(gross_margin) as gross_margin,
  case
    when sum(net_sales) = 0 then null
    else sum(gross_margin) / sum(net_sales)
  end as gross_margin_rate,
  case
    when sum(gross_sales) = 0 then null
    else sum(discount_amount) / sum(gross_sales)
  end as avg_discount
from {{ ref('int_order_line_enriched') }}
group by 1, 2, 3, 4
