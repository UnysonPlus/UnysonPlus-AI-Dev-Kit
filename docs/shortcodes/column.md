# `column` — grid column

Inside a `section` (or nested ONE level). Node: `{ type:'column', width:'1_1', _items:[…], atts:{…} }`
— **`width` is on the node, not in atts.** Carries the shared `common` block (see `README.md`).

## `width` (node property)

`1_1` `1_2` `1_3` `2_3` `1_4` `3_4` `1_5` (⅕, the only fifth — no `2_5`/`3_5`/`4_5`) `1_6` `5_6`
`5_12` `7_12` … Columns flex-wrap by total width (`7_12`+`5_12` → row 1; four `1_4` → row 2). A
`1_5` renders as `fw-col-12 fw-col-sm-15` (20%). Never use `width:'auto'` — the corrector drops the
column wrapper if the width is unrecognized.

## atts (column-specific)

| key | type | default | notes |
|---|---|---|---|
| `content_h` | image-picker (responsive) | `'default'` | horizontal align of contents: `default` (Default) `start` (Left) `center` (Center) `end` (Right) `between` (Space Between) `around` (Space Around) `evenly` (Space Evenly) |
| `content_v` | image-picker (responsive) | `'default'` | content vertical align: `default` (Top / Default) `center` (Middle) `end` (Bottom) `between` (Space Between) |
| `content_direction` | select | `'column'` | `'column'` stacks; `'row'` lays contents INLINE side-by-side |
| `content_gap` | responsive | `{base:'',md:'',lg:''}` | gap between contents (spacing-scale slug) |
| `border_preset` | select | `''` | a Theme-Settings **box preset** class (e.g. a glass/card preset) on the column |
| `inner_class` | string | `''` | **Inner Wrapper Class** — a class on a div wrapping ALL column contents (use for a boxed card that must wrap an `icon_box` + `button`, or a flex-row button group) |
| `bg_color` | compact color | `{predefined:'',custom:''}` | column background |
| `full_height` | select | `'no'` | `yes` = fill row height |
| `align_self` | image-picker (responsive) | `'default'` | column vertical align vs row siblings: `default` (Default / Stretched) `start` (Top) `center` (Middle) `end` (Bottom) |
| `col_width` | responsive | `{base:'default',md:'',lg:''}` | per-device **width override** (blank inherits the base/node width). Replaces the old `w_phone`/`w_tablet`/`w_desktop`. |
| `col_offset` | responsive | `{base:'none',md:'',lg:''}` | per-device left **offset** (push). Replaces the old `offset_phone`/`offset_tablet`/`offset_desktop`. |
| `max_width` | unit-input | `{value:'',unit:'px'}` | cap the column's **max width** (units `px`/`%`/`rem`/…); empty = uncapped. |
| `content_order` | responsive | `{base:'no',md:'',lg:''}` | **reverse** the column order per device (`yes`/`no`) — e.g. image-first on desktop, text-first on mobile. |
| `mobile_order` | string | `''` | reorder on mobile |
| `position` / `z_index` | string | `''` | CSS position / z-index |
| `spacing` | spacing block | see `README.md` | margin/padding (scale classes) — e.g. `margin.bottom:'mb-...'` for vertical gutter |

## Ready-to-use example

```json
{ "type":"column", "width":"1_3", "_items":[ /* leaves */ ], "atts":{
  "full_height":"no", "bg_color":{"predefined":"","custom":""},
  "spacing":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"","top":"","right":"","bottom":"","left":""},"advanced":{"md":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"","top":"","right":"","bottom":"","left":""}},"lg":{"margin":{"all":"","top":"","right":"","bottom":"","left":""},"padding":{"all":"","top":"","right":"","bottom":"","left":""}}}},
  "mobile_order":"", "col_width":{"base":"default","md":"","lg":""},
  "col_offset":{"base":"none","md":"","lg":""}, "max_width":{"value":"","unit":"px"},
  "content_order":{"base":"no","md":"","lg":""}, "align_self":"default",
  "content_v":"default", "content_h":"center", "content_direction":"column", "content_gap":{"base":"","md":"","lg":""},
  "position":"", "z_index":"", "border_preset":"", "inner_class":"",
  "animation":{"enable":"no","yes":{"effect":"","speed_preset":"","advanced_tweaks_heading":"","delay":0,"custom_duration":0,"repeat_count":1,"loop_forever":"no","replay_on_scroll":"no","easing":""}},
  "unique_id":"<32-hex>","css_id":"","css_class":"","custom_css":"","element_position":"","element_overflow":"","responsive_hide":[],"dc_logged":"","dc_roles":[],"dc_start":"","dc_end":"","custom_attrs":[]
}}
```

## Notes / gotchas
- A column is `display:flex; flex-direction:column`, so buttons **stack**. For a side-by-side
  button group, put them in a column with `content_direction:'row'` (or an `inner_class` flex-row).
- **Vertical gutter between wrapped rows** isn't automatic — set `spacing.margin.bottom` (a scale
  class) on the columns that wrap.
- `inner_class` wraps ALL contents in one div — the clean way to box a card whose contents exceed a
  single `icon_box` (icon_box + button together).
