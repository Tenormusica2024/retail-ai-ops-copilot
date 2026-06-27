---
cssclasses: [excel-agent-wide-table]
---

# 05_データ契約・KPI境界

## 基本方針

このプロジェクトはデータ前処理プラットフォームではない。

DE/DSが整えた curated KPI mart を前提にし、AIアーキテクチャ側では「どのデータをLLM/Agentが安全に使えるか」を契約として定義する。

## 想定データ

Snowflake側の整形済み/公式サンプルを優先する。

候補:

- Tasty Bytes quickstart data: 利用できる場合の第一候補
- `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`: 低コストで即検証できるsecondary dataset
- `SNOWFLAKE_SAMPLE_DATA.TPCDS_*`: 小売モデルとして近いが、初期MVPでは規模が大きすぎるため後回し

初期MVPでは `TPCH_SF1` から小さなcurated mart viewを作り、Snowflake上では以下のmartを想定する。

- `mart_retail_monthly_kpi`
- `mart_inventory_risk`
- `mart_promotion_effect`
- `dim_store`
- `dim_product`
- `dim_calendar`

## KPI

| KPI | 粒度 | 備考 |
|---|---|---|
| `net_sales` | week, store, category | 税・返品などは初期では簡略化 |
| `gross_margin_rate` | week, store, category | AI要因説明の主対象 |
| `stockout_risk` | day/week, store, item | 需要予測そのものは深掘りしない |
| `promotion_lift` | campaign, category, store | 販促有無の比較に限定 |
| `same_store_sales_growth` | week, comparable store | 定義は文書化してAgentに検索させる |

## LLM-safe fields

LLMへ渡してよい情報は、集計済みKPI、店舗名/地域、カテゴリ、期間、業務上必要な要約に限定する。

渡さない情報:

- 顧客個人情報
- 生の購買明細
- 従業員評価
- 認証情報
- サンプルであっても実在個人に見えるデータ

## 最小テスト

初期実装で入れる境界テスト。

- 必須カラムが存在する
- 日付範囲が期待内である
- KPI定義に必要な分母が0でない
- 店舗/カテゴリ/期間の粒度が揃っている
- LLM-safe field 以外が answer context に入らない
- Snowflake live modeで接続失敗した時にlocal_explicit_testへ黙って切り替えない

## 深掘りしないこと

- 欠損補完の高度化
- 商品マスター名寄せ
- 需要予測モデル改善
- full dbt warehouse design
- streaming ingestion
- source system integration
