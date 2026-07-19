# Theme Settings — Components (Boxes, Section Styles, Patterns, Tables)

Reusable, palette-linked presets defined in Theme Settings → Components; each emits a CSS class that page-builder elements consume by slug.

## Box presets

### Box Presets — `border_presets`

- **Type**: `border-presets` (custom option type; an addable list of card/border preset rows).
- **Default**: the four seeded presets from `unysonplus_default_border_presets()` (below).
- **Choices**: not a fixed choice list — a repeatable list of preset rows. Each row's sub-fields:

| sub-field | type | choices / values | default |
| --- | --- | --- | --- |
| `id` | unique | auto (e.g. `b000000001`) | auto |
| `preset_name` | text | free text → slug | `''` |
| `border_sides` | select | `all`, `top`, `right`, `bottom`, `left` (and combinations per the option type) | `all` |
| `border_radius` | unit-input | units `px` / `em` / `rem` / `%` | `{value:'',unit:'px'}` |
| `padding` | spacing (mode `padding`) | Spacing-scale class in `padding.all` (e.g. `p-4`) | empty |
| `transition` | ms | e.g. `200`, `250` | — |
| `hover_fx` | multi | `lift`, `glow` | — |
| `custom_css` | textarea | free CSS | `''` |
| `states.default` | map | `border_style`, `border_width` (unit), `border_color` (compact-picker `{predefined,custom}`), `box_shadow` `{x,y,blur,spread,color,inset}` | per preset |
| `states.hover` | map | same leaves as `default` (empty leaves inherit default) | per preset |

- `border_style` values: `''` (none), `solid`, `dashed`, `dotted`.
- `border_color` / any color leaf: compact-preset shape `{predefined:'<color-preset-slug>', custom:'#hex'}`.
- `box_shadow` shape: `{x:0, y:<int>, blur:<int>, spread:0, color:'rgba(0,0,0,<a>)', inset:false}`.
- **Saved value shape** (each seeded row verbatim):

```json
[
  {"id":"b000000001","preset_name":"Card","border_sides":"all",
   "border_radius":{"value":"8","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"p-4","top":"","right":"","bottom":"","left":""}},
   "transition":"200","hover_fx":["lift"],"custom_css":"",
   "states":{"default":{"border_style":"solid","border_width":{"value":"1","unit":"px"},"border_color":{"predefined":"light-gray","custom":""},"box_shadow":{"x":0,"y":1,"blur":3,"spread":0,"color":"rgba(0,0,0,0.08)","inset":false}},
             "hover":{"box_shadow":{"x":0,"y":8,"blur":20,"spread":0,"color":"rgba(0,0,0,0.12)","inset":false}}}},
  {"id":"b000000002","preset_name":"Outline","border_sides":"all",
   "border_radius":{"value":"6","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"p-4","top":"","right":"","bottom":"","left":""}},
   "transition":"200","custom_css":"",
   "states":{"default":{"border_style":"solid","border_width":{"value":"2","unit":"px"},"border_color":{"predefined":"primary","custom":""}},
             "hover":{"border_color":{"predefined":"indigo","custom":""}}}},
  {"id":"b000000003","preset_name":"Soft Shadow","border_sides":"all",
   "border_radius":{"value":"12","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"p-4","top":"","right":"","bottom":"","left":""}},
   "transition":"250","custom_css":"",
   "states":{"default":{"border_style":"","border_color":{"predefined":"","custom":""},"box_shadow":{"x":0,"y":4,"blur":14,"spread":0,"color":"rgba(0,0,0,0.08)","inset":false}},
             "hover":{"box_shadow":{"x":0,"y":12,"blur":30,"spread":0,"color":"rgba(0,0,0,0.16)","inset":false}}}},
  {"id":"b000000004","preset_name":"Hover Lift","border_sides":"all",
   "border_radius":{"value":"8","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"p-4","top":"","right":"","bottom":"","left":""}},
   "transition":"200","hover_fx":["lift","glow"],"custom_css":"",
   "states":{"default":{"border_style":"solid","border_width":{"value":"1","unit":"px"},"border_color":{"predefined":"light-gray","custom":""}},
             "hover":{"border_color":{"predefined":"primary","custom":""},"box_shadow":{"x":0,"y":10,"blur":24,"spread":0,"color":"rgba(0,0,0,0.14)","inset":false}}}}
]
```

Seeded presets → slugs: `Card` → `.boxp-card`, `Outline` → `.boxp-outline`, `Soft Shadow` → `.boxp-soft-shadow`, `Hover Lift` → `.boxp-hover-lift`.

- **Notes**: each preset emits a `.boxp-{slug}` class (slug from `preset_name`; collisions get `-2`/`-3`; empty name falls back to the id). Consumed on a **Column** (Styling → Box Preset / `border_preset`), a **Table** (Table Options → Frame), or a **Countdown**. Set per Default / Hover state.

## Section Styles

### Section Styles — `section_style_presets`

- **Type**: `addable-box` (sortable; `add-button-text` = "Add Section Style").
- **Default**: the three seeded skins from `unysonplus_default_section_style_presets()` (Alt / Light / Dark).
- **Choices**: repeatable list of section-skin rows. Each row's sub-fields:

| sub-field | type | choices / values | default |
| --- | --- | --- | --- |
| `id` | unique | auto (e.g. `s000000001`) | auto |
| `style_name` | text | free text → `.section--{slug}` and dropdown label | `''` |
| `background` | background-pro | color / gradient / image layers | — |
| `text_color` | compact color-preset | `{predefined,custom}` | empty |
| `heading_color` | compact color-preset | `{predefined,custom}` | empty |
| `link_color` | compact color-preset | `{predefined,custom}` | empty |
| `border` | multi-inline `{width,style,color}` | see below | width empty / style `''` / color empty |
| `border_sides` | image-picker (multiple) | `top`, `right`, `bottom`, `left` | `["top","right","bottom","left"]` |
| `border_extent` | multi-picker (inline) | `mode`: `full`, `container`, `custom` | `{mode:"full"}` |
| `border_extent_width` | unit-input (shown when `mode`=`custom`) | units `px`/`rem`/`em`/`%` | `{value:'',unit:'px'}` |
| `border_radius` | unit-input | units `px`/`em`/`rem`/`%` | `{value:'',unit:'px'}` |
| `padding` | spacing (mode `padding`) | Spacing scale | empty |

- `border.width`: unit-input, units `px` / `em` / `rem`.
- `border.style` select choices: `''` = None, `solid` = Solid, `dashed` = Dashed, `dotted` = Dotted.
- `border.color`: `predefined-colors-color-picker-compact` `{predefined,custom}`.
- `border_extent.mode` choices: `full` = Full Width, `container` = Container Width, `custom` = Custom Width.
- **Saved value shape** (each seeded row verbatim):

```json
[
  {"id":"s000000001","style_name":"Alt",
   "background":{"color":{"value":{"predefined":"","custom":"#f7f7f7"}}},
   "text_color":{"predefined":"","custom":""},"heading_color":{"predefined":"","custom":""},"link_color":{"predefined":"","custom":""},
   "border":{"width":{"value":"","unit":"px"},"style":"","color":{"predefined":"","custom":""}},
   "border_sides":["top","right","bottom","left"],"border_extent":{"mode":"full"},
   "border_radius":{"value":"","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"","top":"","right":"","bottom":"","left":""}}},
  {"id":"s000000002","style_name":"Light",
   "background":{"color":{"value":{"predefined":"","custom":"#ffffff"}}},
   "text_color":{"predefined":"","custom":"#1a1a1a"},"heading_color":{"predefined":"","custom":""},"link_color":{"predefined":"","custom":""},
   "border":{"width":{"value":"","unit":"px"},"style":"","color":{"predefined":"","custom":""}},
   "border_sides":["top","right","bottom","left"],"border_extent":{"mode":"full"},
   "border_radius":{"value":"","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"","top":"","right":"","bottom":"","left":""}}},
  {"id":"s000000003","style_name":"Dark",
   "background":{"color":{"value":{"predefined":"","custom":"#1a1a1a"}}},
   "text_color":{"predefined":"","custom":"#ffffff"},"heading_color":{"predefined":"","custom":"#ffffff"},"link_color":{"predefined":"","custom":"#93c5fd"},
   "border":{"width":{"value":"","unit":"px"},"style":"","color":{"predefined":"","custom":""}},
   "border_sides":["top","right","bottom","left"],"border_extent":{"mode":"full"},
   "border_radius":{"value":"","unit":"px"},
   "padding":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"","top":"","right":"","bottom":"","left":""}}}
]
```

Seeded presets → slugs: `Alt` → `.section--alt`, `Light` → `.section--light`, `Dark` → `.section--dark`.

- **Notes**: each preset emits a `.section--{slug}` class (slug from `style_name`; collisions get `-2`/`-3`; empty name → the id). Consumed on a **Section** via the "Section Variant" dropdown (stored scalar `variant` = the slug; `''` = Default). The three defaults reproduce the built-in Alt/Light/Dark variants exactly. A section's own one-off Background / Spacing overrides the skin.

## Patterns

### Site Background Pattern — `site_background_pattern`

- **Type**: `multi-picker` (popover), `picker.pattern` = `image-picker`. **Only present on non-`unysonplus-theme` themes** (on the UnysonPlus theme this picker lives in General → Layout instead; same stored key).
- **Default**: `{ "pattern": "none" }`.
- **Choices**: from `unysonplus_pattern_imagepicker_choices()` — a sentinel `none` (label "None") plus one tile per defined pattern preset, keyed by preset **id**. The 12 seeded ids: `dots`, `grid`, `diagonal-stripes`, `vertical-stripes`, `horizontal-stripes`, `checkerboard`, `crosshatch`, `triangles`, `chevron`, `circles`, `scales`, `confetti`.
- **Saved value shape**: `{ "pattern": "<preset-id>" | "none" }`.
- **Notes**: draws the chosen pattern as a fixed full-page background (`unysonplus_render_site_background_pattern`, `wp_footer`). `none` = no pattern.

### Background Patterns — `background_patterns`

- **Type**: `addable-box` (sortable, `box-duplicate`, `add-button-text` = "Add Pattern").
- **Default**: the 12 seeded CSS patterns from `unysonplus_default_pattern_presets()`.
- **Choices**: repeatable list of pattern rows. Each row's sub-fields:

| sub-field | type | notes | default |
| --- | --- | --- | --- |
| `id` | unique | auto | auto |
| `pattern_name` | text | → `.pattern-{slug}` | `''` |
| `root_class` | text | outermost class of pasted HTML (auto-detected if blank) | `''` |
| `html` | code-editor (mode `htmlmixed`, height 150) | pattern markup | `''` |
| `css` | code-editor (mode `css`, height 220) | pattern CSS (scoped per preset) | `''` |

- **Saved value shape** (each seeded row; all use the helper `{id, pattern_name, root_class, html:'<div class="{cls}"></div>', css:'.{cls}{width:100%;height:100%;<decls>}'}`):

| id | pattern_name | root_class | css declarations (inside `.{root_class}{width:100%;height:100%; … }`) |
| --- | --- | --- | --- |
| `dots` | Dots | `pat-dots` | `background-image:radial-gradient(rgba(0,0,0,.18) 1.6px,transparent 1.7px);background-size:22px 22px` |
| `grid` | Grid | `pat-grid` | `background-image:linear-gradient(rgba(0,0,0,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.12) 1px,transparent 1px);background-size:26px 26px` |
| `diagonal-stripes` | Diagonal Stripes | `pat-diagonal` | `background:repeating-linear-gradient(45deg,rgba(0,0,0,.07) 0 10px,transparent 10px 20px)` |
| `vertical-stripes` | Vertical Stripes | `pat-vertical` | `background:repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 10px,transparent 10px 20px)` |
| `horizontal-stripes` | Horizontal Stripes | `pat-horizontal` | `background:repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 10px,transparent 10px 20px)` |
| `checkerboard` | Checkerboard | `pat-checker` | `background-image:linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.1) 75%),linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.1) 75%);background-size:28px 28px;background-position:0 0,14px 14px` |
| `crosshatch` | Crosshatch | `pat-crosshatch` | `background-image:repeating-linear-gradient(45deg,rgba(0,0,0,.08) 0 1px,transparent 1px 12px),repeating-linear-gradient(-45deg,rgba(0,0,0,.08) 0 1px,transparent 1px 12px)` |
| `triangles` | Triangles | `pat-triangles` | `background-image:linear-gradient(45deg,rgba(0,0,0,.09) 25%,transparent 25%),linear-gradient(-45deg,rgba(0,0,0,.09) 25%,transparent 25%);background-size:20px 20px` |
| `chevron` | Chevron | `pat-chevron` | `background:linear-gradient(135deg,rgba(0,0,0,.08) 25%,transparent 25%) -12px 0/24px 24px,linear-gradient(225deg,rgba(0,0,0,.08) 25%,transparent 25%) -12px 0/24px 24px,linear-gradient(315deg,rgba(0,0,0,.08) 25%,transparent 25%) 0 0/24px 24px,linear-gradient(45deg,rgba(0,0,0,.08) 25%,transparent 25%) 0 0/24px 24px` |
| `circles` | Circles | `pat-circles` | `background-image:radial-gradient(circle at 50% 50%,transparent 5px,rgba(0,0,0,.09) 6px,transparent 7px);background-size:24px 24px` |
| `scales` | Scales | `pat-scales` | `background-image:radial-gradient(circle at 50% 100%,transparent 9px,rgba(0,0,0,.08) 10px,transparent 11px);background-size:24px 12px` |
| `confetti` | Confetti | `pat-confetti` | `background-image:radial-gradient(rgba(0,0,0,.15) 1.6px,transparent 1.7px),radial-gradient(rgba(0,0,0,.1) 1.6px,transparent 1.7px);background-size:30px 30px,30px 30px;background-position:0 0,15px 15px` |

Seeded presets → slugs: pattern named "Dots" → `.pattern-dots`, etc. (slug from `pattern_name`; collisions get `-2`/`-3`; empty name → the id).

- **Notes**: each preset emits a scoped `.pattern-{slug}` class (distinct from the internal `.pat-{id}` root class in the CSS). Applied to a Section / Container / the site background as an `aria-hidden` decorative layer. CSS + HTML only — JavaScript patterns are not supported (use the Animation Engine). `<script>` is stripped at render.

## Tables

### Table Presets — `table_presets`

- **Type**: `table-presets` (custom option type; palette-linked repeatable list).
- **Default**: the five seeded presets from `unysonplus_default_table_presets()` (Clean Lines / Bordered Grid / Minimal / Striped / Dark Header).
- **Choices**: repeatable list of table-preset rows. Each row's top-level sub-fields:

| sub-field | type | choices / values | default (per preset) |
| --- | --- | --- | --- |
| `id` | unique | auto (e.g. `t000000001`) | auto |
| `preset_name` | text | → `.tbl-{slug}` | — |
| `cell_padding_y` | unit-input | `px` | per preset |
| `cell_padding_x` | unit-input | `px` | per preset |
| `grid_lines` | select | `none`, `horizontal`, `vertical`, `both` | per preset |
| `grid_style` | select | `''`, `solid`, `dashed`, `dotted` | per preset |
| `grid_width` | unit-input | `px` | per preset |
| `grid_color` | compact color-preset | `{predefined,custom}` | per preset |
| `outer_border_style` | select | `''`, `solid`, `dashed`, `dotted` | per preset |
| `outer_border_width` | unit-input | `px` | per preset |
| `outer_border_color` | compact color-preset | `{predefined,custom}` | per preset |
| `border_radius` | unit-input | `px` | per preset |
| `outer_shadow` | box-shadow | `{x,y,blur,spread,color,inset}` | `{x:0,y:0,blur:0,spread:0,color:'',inset:false}` (all defaults) |
| `cell_font_size` | unit-input | `px` | `{value:'',unit:'px'}` (all defaults) |
| `transition` | ms | e.g. `150` | `150` (all) |
| `custom_css` | textarea | free CSS | `''` (all) |
| `sections` | map | `header` / `body` / `striped` / `hover` / `footer` / `caption` | per preset |

Section sub-field maps:
- `header`: `bg_color`, `text_color`, `font_weight` (e.g. `600`), `text_transform` (`''` / `uppercase`), `border_style` (`''`/`solid`/`dashed`/`dotted`), `border_width` (unit), `border_color`.
- `body`: `bg_color`, `text_color`.
- `striped`: `enabled` (`yes` / `no`), `bg_color`.
- `hover`: `bg_color`, `text_color`.
- `footer`: `bg_color`, `text_color`, `font_weight`, `border_style`, `border_width`, `border_color`.
- `caption`: `color`, `font_size` (unit), `font_style` (e.g. `italic`).

All color leaves are compact-preset shape `{predefined:'', custom:'#hex'}` (built-ins use hex in `custom`).

- **Saved value shape** (seeded rows — key values; every color is `{predefined:'',custom:<hex>}`, units `px`):

**`t000000001` Clean Lines** — `cell_padding_y:10, cell_padding_x:14, grid_lines:"horizontal", grid_style:"solid", grid_width:1, grid_color:#ededed, outer_border_style:"", outer_border_width:0, outer_border_color:empty, border_radius:0, transition:"150"`. Sections:
```json
{"header":{"bg_color":{"predefined":"","custom":""},"text_color":{"predefined":"","custom":"#1d2327"},"font_weight":"600","text_transform":"uppercase","border_style":"solid","border_width":{"value":"2","unit":"px"},"border_color":{"predefined":"","custom":"#1d2327"}},
 "body":{"bg_color":{"predefined":"","custom":""},"text_color":{"predefined":"","custom":"#50575e"}},
 "striped":{"enabled":"no","bg_color":{"predefined":"","custom":"#f6f8fb"}},
 "hover":{"bg_color":{"predefined":"","custom":"#f6f7f8"},"text_color":{"predefined":"","custom":""}},
 "footer":{"bg_color":{"predefined":"","custom":""},"text_color":{"predefined":"","custom":"#1d2327"},"font_weight":"600","border_style":"solid","border_width":{"value":"2","unit":"px"},"border_color":{"predefined":"","custom":"#d8dbde"}},
 "caption":{"color":{"predefined":"","custom":"#787c82"},"font_size":{"value":"13","unit":"px"},"font_style":"italic"}}
```

**`t000000002` Bordered Grid** — `cell_padding_y:9, cell_padding_x:12, grid_lines:"both", grid_style:"solid", grid_width:1, grid_color:#e2e4e7, outer_border_style:"solid", outer_border_width:1, outer_border_color:#d8dbde, border_radius:6`. Sections: header `bg:#f1f4f9 text:#1d2327 fw:600 text_transform:"" border:solid 1 #c9ced3`; body `bg:#ffffff text:#3c434a`; striped `no #f8f9fa`; hover `bg:#eef3fb`; footer `bg:#f6f7f8 text:#1d2327 fw:600 border:solid 2 #c9ced3`; caption `#787c82 / 13 / italic`.

**`t000000003` Minimal** — `cell_padding_y:14, cell_padding_x:18, grid_lines:"none", grid_style:"", grid_width:0, grid_color:empty, outer_border_style:"", outer_border_width:0, border_radius:0`. Sections: header `bg:empty text:#1d2327 fw:600 text_transform:"" border:"" 0 empty`; body `text:#50575e`; striped `no #fafbfc`; hover `bg:#fafbfc`; footer `text:#1d2327 fw:600 border:"" 0`; caption `#a7aaad / 13 / italic`.

**`t000000004` Striped** — `cell_padding_y:10, cell_padding_x:14, grid_lines:"none", grid_width:0, outer_border_style:"solid", outer_border_width:1, outer_border_color:#e2e4e7, border_radius:6`. Sections: header `bg:#2271b1 text:#ffffff fw:600 border:"" 0`; body `bg:#ffffff text:#3c434a`; striped `yes #f6f8fb`; hover `bg:#eef3fb`; footer `bg:#f1f4f9 text:#1d2327 fw:600 border:"" 0`; caption `#787c82 / 13 / italic`.

**`t000000005` Dark Header** — `cell_padding_y:11, cell_padding_x:14, grid_lines:"horizontal", grid_style:"solid", grid_width:1, grid_color:#ededed, outer_border_style:"solid", outer_border_width:1, outer_border_color:#e2e4e7, border_radius:8`. Sections: header `bg:#1d2327 text:#ffffff fw:600 text_transform:uppercase border:"" 0`; body `bg:#ffffff text:#3c434a`; striped `yes #f7f8f9`; hover `bg:#eef0f2`; footer `bg:#f6f7f8 text:#1d2327 fw:600 border:solid 1 #e2e4e7`; caption `#787c82 / 13 / italic`.

Seeded presets → slugs: `Clean Lines` → `.tablep-clean-lines`, `Bordered Grid` → `.tablep-bordered-grid`, `Minimal` → `.tablep-minimal`, `Striped` → `.tablep-striped`, `Dark Header` → `.tablep-dark-header`.

- **Notes**: each preset emits a `.tablep-{slug}` class (also referenced as `.tbl-{slug}` in the source getters — the wrapper class from `preset_name`; collisions get `-2`/`-3`; empty name → the id). Consumed on a **Table** via Table Options → Table Preset. `outer_shadow` = `{x,y,blur,spread,color,inset}`; every built-in leaves it at zero.
