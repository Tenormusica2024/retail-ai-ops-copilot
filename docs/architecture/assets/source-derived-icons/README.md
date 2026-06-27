# Source-Derived Icon Sprite

このディレクトリは、選定済み imagegen システム構成図から切り出したアイコンスプライトを保存する。

これは独自アイコンパックではない。HTML再現の source of truth である `selected-source.png` のアイコン表現を、HTML上で使いやすい透明背景スプライトとして移植するための素材。

## Source

- Source image: `docs/architecture/archive/imagegen-candidates/2026-06-27/selected-source.png`
- Source role: selected imagegen architecture diagram
- Sprite type: source-derived transparent PNG sprite
- Cell size: 96 x 96
- Layout: 8 columns x 4 rows
- Normalization: source content boxes are re-centered and scaled inside each
  cell so final HTML icons remain readable after diagram scaling.

## Files

| File | Purpose | Size | SHA-256 |
| --- | --- | --- | --- |
| `source-derived-icon-sprite.png` | HTML実装用の透明背景スプライト | 768 x 384 | `9dbd0db643dbe2d6dabd43a18b40ebde8a9c28fb6274c9017bb64f7c33902366` |
| `source-derived-icon-sprite-preview.png` | レビュー用ラベル付きプレビュー | 768 x 496 | `3cebfa4848f0bd335e93250f7b1f7d0729967664a9b6c97b2f681db055cb4e0d` |
| `source-derived-icon-sprite.json` | source crop座標とsprite cell座標 | n/a | `e7ae39a7cd1ecf536f8d5a326350d11a1c6a90405a55ec59b10d5c97c27d64ec` |

## Rules

- Do not replace this with a cleaner generic icon pack unless the selected source changes.
- If an icon needs improvement, crop or regenerate it to match the selected source image style first.
- If the selected imagegen source changes, create a new dated sprite folder instead of overwriting this provenance.
- Use `source-derived-icon-sprite-preview.png` for human review and `source-derived-icon-sprite.png` for HTML/CSS sprite positioning.
