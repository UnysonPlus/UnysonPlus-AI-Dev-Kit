# cursor — Custom Cursor (Animation Engine)

Replaces the pointer with a custom cursor **site-wide**. It is **not** an `fx`-block slot — it is a Theme Settings control (Site-wide UX → **Cursor** sub-tab), saved under the `animation_cursor` option. Requires the `animation-engine` extension ACTIVE (ships inactive). Auto-disabled on touch screens.

## Effects / styles
An enable switch + a `style` `multi-picker` (picker id **`shape`**, default `dot_ring`) whose tiles are grouped Dot&Ring / Targeting / Shapes / Trails / Fluid&Lens / Interactive / Custom. Most styles reveal one or more extra params; the rest use only the shared modifiers.

Shapes: `dot` · `ring` · `dot_ring` · `dual_ring` · `dashed` · `elastic` · `bullseye` · `crosshair` · `brackets` · `plus` · `reticle` · `radar` · `arrow` · `square` · `diamond` · `star` · `glow` · `gradient` · `comet` · `particles` · `confetti` · `streak` · `firefly` · `bubble` · `echo` · `word_trail` · `blob` · `spotlight` · `lens` · `magnify` · `metaball` · `ink` · `fluid` · `distort` · `reveal` · `invert` · `spring` · `rope` · `sticky` · `label` · `custom` · `glyph`

## Value shape
```json
"animation_cursor": {
  "enable": "no",
  "style": { "shape": "dot_ring", "dot_ring": { "trail": 0.18 } },
  "color": { "predefined": "", "custom": "#2f74e6" },
  "size": 8, "hover_grow": "yes", "magnetic": "no", "blend": "no",
  "click_ripple": "no", "click_burst": "no", "hide_default": "yes" }
```

## Params
Shared modifiers (always present):
| key | type | default | notes |
|---|---|---|---|
| `enable` | switch | `no` | master on/off (off = native pointer) |
| `color` | compact color | `{custom:'#2f74e6'}` | cursor / pill fill (kind `bg`) |
| `size` | slider | `8` | px (4–28) |
| `hover_grow` | switch | `yes` | expand over links/buttons |
| `magnetic` | switch | `no` | ease toward hovered target center |
| `blend` | switch | `no` | difference blend (invert against bg) |
| `click_ripple` | switch | `no` | expanding ring on click |
| `click_burst` | switch | `no` | particle burst on click |
| `hide_default` | switch | `yes` | hide OS pointer |

Per-shape reveals (key = default): `dot_ring`/`comet`/`metaball` `trail` 0.18 · `particles`/`echo`/`firefly`/`bubble` `count` (8/8/10/8) · `confetti` `count` 14 + `multicolor` yes · `elastic` `elastic` 0.5 · `lens` `lens_radius` 70 + `lens_blur` 4 · `radar` `radar_speed` 1.6 · `label` `default_label` "View" + `label_font` (typography, size 12) · `word_trail` `word` "scroll" + `word_font` (size 13) · `reveal` `reveal_image` (upload) + `reveal_radius` 80 · `magnify` `magnify_scope` images/media/all + `zoom` 2 · `ink` `ink_width` 6 + `follow_scroll` yes · `fluid`/`distort` `follow_scroll` yes · `glyph` `glyph_char` "→" · `custom` `custom_image` (upload) · `spotlight` `spot_radius` 160 + `spot_dim` 0.6.

## Notes
- `color`/typography size feed the runtime as pixel numbers.
- `magnify` `all` mode clones the whole page (heavy — roughly doubles DOM in memory, snapshot-based).
