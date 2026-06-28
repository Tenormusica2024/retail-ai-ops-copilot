# Edge Contract Path Generation

このメモは、次にシステム構成図を0から作るときの相関矢印生成方式を定義する。現行の
`retail-ai-ops-copilot-architecture.html` は、source画像への見た目再現を優先して
固定座標を手で詰めた状態なので、この方式へ自動移行しない。

## 目的

相関矢印はノード移動やカードサイズ変更のあとに、始点・終点が虚空に残る、ノード内へ
食い込む、双方向矢印が片方向に見える、といった問題が出やすい。次回の新規図では、
`from: Semantic KPI Model / anchor: bottom` のような edge-contract を先に定義し、
SVG path の `d` はノード矩形の実測値から生成する。

## Contract 例

```json
{
  "version": 1,
  "svgSelector": "svg.connectors",
  "nodeSelectorAttribute": "data-node-id",
  "edges": [
    {
      "id": "semantic-to-golden-eval-feedback",
      "from": { "node": "semantic-kpi-model", "anchor": "bottom" },
      "to": { "node": "golden-eval", "anchor": "top" },
      "className": "ops",
      "marker": "url(#arrow-ops)",
      "bidirectional": true,
      "route": {
        "type": "orthogonal",
        "orientation": "vertical-first",
        "midY": 244
      }
    }
  ]
}
```

HTML側のノードには、最初から安定した `data-node-id` を付与する。

```html
<section class="service" data-node-id="semantic-kpi-model">...</section>
```

## 生成コマンド

```bash
node tools/generate_diagram_edges_from_contract.mjs \
  --html tools/fixtures/edge-contract-demo.html \
  --contract tools/fixtures/edge-contract-demo.json \
  --out outputs/edge-contract-demo-generated.json \
  --snippet outputs/edge-contract-demo-generated.svg.txt
```

Codex runtime の Playwright を使う場合:

```bash
NODE_PATH=/Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/urayahadays/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tools/generate_diagram_edges_from_contract.mjs \
  --html tools/fixtures/edge-contract-demo.html \
  --contract tools/fixtures/edge-contract-demo.json \
  --out outputs/edge-contract-demo-generated.json \
  --snippet outputs/edge-contract-demo-generated.svg.txt
```

出力される `svgSnippet` は `<path ...>` の差し込み候補であり、ツールはHTMLを直接変更しない。

## 運用ルール

- 新規図は、ノード配置、`data-node-id`、edge-contract、path生成、geometry lint の順で作る
- ノード移動、カードサイズ変更、フレーム移動のあとに、該当edgeだけでなく全edgeを再生成する
- 手書きの固定座標は、source画像再現のための例外やバス/レーン/ラベルアンカーだけに限定する
- 固定座標例外を使う場合も、理由と anchor 種別を contract またはレビュー記録に残す
- path生成後に `tools/check_diagram_connectors.mjs` を実行し、始点・終点・全経路交差を検査する
- 現行図をこの方式へ移行する場合は、見た目差分が大きく出る可能性があるため、別タスクとしてHITL承認を取る
