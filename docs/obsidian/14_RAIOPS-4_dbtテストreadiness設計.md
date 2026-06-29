---
cssclasses: [excel-agent-wide-table]
---

# 14_RAIOPS-4_dbtテストreadiness設計

Repo mirror: [RAIOPS-4 dbt Test Readiness Gate](../architecture/raiops-4-dbt-test-readiness-gate.md)

## 結論

RAIOPS-4では、dbt testsをSemantic Model、Golden Eval、Streamlit UI、
diagram readinessを上げる前提ゲートとして扱う。

現在はdbt scaffold、97 data tests定義、`dbt parse`、credentials-free
`dbt compile` までは通過済み。ただし、live `dbt build/test` は未実施なので、
Snowflake上でdbt testsが通った証跡としては扱わない。

## 実装方針

RAIOPS-4の次作業は「最小実装」ではなく、拡張可能なdbt品質ゲートの
検証スライスとして扱う。

seed-level testsだけを足して閉じるのではなく、source、staging、
intermediate、mart、KPI seed、Semantic/Eval連携、reaggregation guard、
live実行証跡の境界を保ったまま、まずレビュー可能な単位で実装・検証する。

DATUM STUDIOの実務想定に寄せるなら、小さく動くことよりも、Snowflake/dbt、
CI/CD、DevOps、設計から構築・運用・継続改善までへ広げられる構造を残す
ことが重要になる。

参考公開情報:

- DATUM STUDIO ヤオコー事例:
  https://datumstudio.jp/casestudy/snowflake-yaoko01/
- Snowflake ヤオコー事例:
  https://www.snowflake.com/ja/customers/all-customers/case-study/yaoko/
- DATUM STUDIO プロジェクトマネージャ（データ基盤構築）求人:
  https://hrmos.co/pages/datumstudio/jobs/2138921283063963675

## Gate

| Level | 内容 | 後段への扱い |
| --- | --- | --- |
| Level 0 | parse/compile | scaffold静的検証。live readinessは上げない |
| Level 1 | live dbt build/test | dbt staging/marts/tests readinessの根拠 |
| Level 2 | Semantic/Eval contract link | Semantic/Evalをdbt mart契約へ接続 |
| Level 3 | Answer quality/regression | user-facing answer pathのreadiness根拠 |

## Test category

- source contract
- staging contract
- line grain contract
- mart grain contract
- KPI value contract
- KPI definition seed
- reaggregation guard

## 次の一手

`RAIOPS-4` の実装sessionでは、seed-level tests、reaggregation guard、
live `dbt build/test` コマンド、readiness反映条件を固める。

live実行できない場合は、理由と未実施範囲を明示し、parse/compileをlive
test成功として扱わない。
