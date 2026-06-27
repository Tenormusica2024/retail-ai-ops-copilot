# サンプルデータカバレッジ比較表

このメモは、現在使っているSnowflake学習用データが、構成図の
「外部データソース」カテゴリやデータ契約上の想定とどこまで一致しているかを整理する。

## 現在のデータ

現在の実装で使っているデータ:

- `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`
- `RETAIL_AI_OPS.MART.MART_RETAIL_MONTHLY_KPI` としてcurated mart化
- 作成SQLは `sql/00_setup_from_snowflake_sample.sql`

現在のmartが使っているTPCHテーブル:

| TPCH table | 現在の役割 | 使用している項目 / 派生項目 |
| --- | --- | --- |
| `orders` | 注文ヘッダーproxy | 注文日、注文キー、顧客キー |
| `lineitem` | 売上明細proxy | 数量、明細金額、割引率 |
| `customer` | 顧客/地域join | 顧客キー、国キー |
| `nation` | 国proxy | 国名 |
| `region` | 地域proxy | 地域名 |
| `part` | 商品/カテゴリproxy | 商品タイプ、ブランド |
| `partsupp` | 原価proxy | 供給原価 |

現在のmart出力:

| Mart field | 意味 |
| --- | --- |
| `month_start` | 注文日から作る月次粒度 |
| `region_name` | TPCHの地域 |
| `nation_name` | TPCHの国 |
| `category_name` | `part` 由来の商品カテゴリproxy |
| `order_count` | 注文件数 |
| `item_quantity` | 明細数量合計 |
| `net_sales` | 割引後売上 |
| `gross_margin` | 売上 - 供給原価proxy |
| `gross_margin_rate` | 粗利 / 売上 |
| `avg_discount` | 明細割引率の平均 |

## 構成図カテゴリとの比較

| 構成図のデータカテゴリ | 現在のTPCH_SF1での対応 | 一致度 | メモ |
| --- | --- | --- | --- |
| Snowflakeサンプル | あり | 直接一致 | 現在の学習用データ源は `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`。 |
| POS売上 | 一部proxy | 部分一致 | `orders` + `lineitem` で売上、注文数、数量、割引、粗利proxyは作れる。ただし実POSではない。店舗、レジ、レシート、チャネル、返品、税、実SKUマスターはない。 |
| 在庫 | 弱いproxyのみ | ほぼ未一致 | TPCH全体には `partsupp` の供給可能数量があるが、現在のmartでは原価だけ使用している。時点別在庫、入荷、出荷、欠品、店舗在庫、発注フローはない。 |
| 販促カレンダー | 割引率proxyのみ | ほぼ未一致 | `lineitem.l_discount` で平均割引は作れるが、キャンペーンID、販促期間、クーポン、予算、媒体、販促リフトの正解データはない。 |
| 週報・業務メモ | サンプル由来なし | 未一致 | setup SQLで小さな `KPI_DEFINITIONS` は手作りしているが、週報、会議メモ、検索対象ドキュメントはSnowflake sampleから来ていない。 |
| 商品/カテゴリマスター | 一部proxy | 部分一致 | `part.p_type` / `part.p_brand` はカテゴリ風に使えるが、小売の商品階層、SKU体系、商品ライフサイクルではない。 |
| 地域/店舗マスター | 地域のみ | 部分一致 | TPCHにはregion/nationがあるが、店舗、エリアマネージャー担当範囲、店舗種別、既存店フラグ、国より下の地理階層はない。 |

## データ契約との比較

データ契約で想定しているmart/dimensionに対して、現在のTPCH_SF1の対応はかなり狭い。

| 想定object | TPCH_SF1での現在状態 | ギャップ |
| --- | --- | --- |
| `mart_retail_monthly_kpi` | `MART_RETAIL_MONTHLY_KPI` として部分実装 | 月次売上と粗利proxyはあるが、store粒度や小売固有の意味は不足 |
| `mart_inventory_risk` | 未実装 | 在庫推移、欠品、リスク正解データがない |
| `mart_promotion_effect` | 未実装 | 割引率はあるが、campaign entityやlift計算に必要な情報がない |
| `dim_store` | 未実装 | TPCHのregion/nationは店舗dimensionではない |
| `dim_product` | proxyのみ | TPCH partは小売の商品dimensionとしては不足 |
| `dim_calendar` | 未実装 | order dateから月を直接作っているだけ |

## KPIとの比較

| 想定KPI | 現在のTPCH_SF1での対応 | 一致度 |
| --- | --- | --- |
| `net_sales` | 明細金額 x 割引後で作成可能 | 良いproxy |
| `gross_margin_rate` | 供給原価proxyを使って作成可能 | 使えるproxy |
| `stockout_risk` | 対応不可 | 未一致 |
| `promotion_lift` | 対応不可 | 未一致 |
| `same_store_sales_growth` | 対応不可 | 未一致 |

## 実務上の解釈

TPCH_SF1は、最初のLLMOps学習sliceとして次を試すには十分:

- 自然言語ルーティング
- SQL planning
- Snowflake live実行
- trace logging
- KPI回答整形
- 売上/粗利質問に対する評価・改善フローの足場

一方で、TPCH_SF1を次の進捗証跡として扱ってはいけない:

- 在庫運用
- 販促カレンダー分析
- 週報/業務メモ検索
- 店舗レベルの小売workflow
- full dbt staging/marts/tests readiness
- Cortex Analyst/Search readiness

Tasty BytesやKaggle等の別サンプルデータを追加する場合は、在庫、販促、週報、
店舗粒度のノード進捗を上げる前に、この比較表を更新する。
