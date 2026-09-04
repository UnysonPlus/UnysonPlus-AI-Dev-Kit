# `flexbox` — Flexbox (the **Div** — default page-builder container)

The default modern container primitive — a self-contained, **arbitrarily nestable** semantic container.
In the element picker its palette tab is **"Structure"**, and it renders three tiles under **"Layout
Elements"**: **Section** (`html_tag:section`, `display:block`), **Flexbox** (`div`, `display:flex`) and
**Grid** (`div`, `display:grid`) — all the same shortcode, differing only by `html_tag`/`display`. In the
**Theme Builder** it exposes the full semantic-tag set (used to build Header / Body / Footer parts).
Node: `{ type:'flexbox', _items:[ /* children — elements OR nested Divs */ ], atts:{…} }` — plus the
shared wrapper blocks (`common`, `fx`) documented in `README.md`. This file lists only the
**shortcode-specific** atts.

Children sit **directly** in `_items` (no `row`/`column` wrapper). Widths are set per child via its own
`width` att and render as **`fw-span-{bp}-N`** (12-col span) house utility classes; container layout
emits `fw-flex`/`fw-grid` + `fw-gap{bp}-*`/`fw-justify{bp}-*`/`fw-items{bp}-*` + order/grow classes.
Gap comes from the spacing-scale `gap` option, **not** Bootstrap `--bs-gutter`.

Every layout/placement att is **responsive**: `{ base, md, lg }`, where a blank device inherits the next smaller one.

## atts — Container (how it arranges children)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `html_tag` | select | `div` | `div` `section` `header` `footer` `main` `article` `aside` `nav` `figure` … | The semantic element this Div renders as. `section` = the Section tile. |
| `display` | select | `flex` | `flex` `grid` `block` | Layout mode — Flexbox / Grid / plain block (the three "Layout Elements" tiles). |
| `grid_columns` | responsive | `''` | integer count (or track template) | Column count when `display:grid` (the Grid tile). |
| `grid_autofit` | switch | `no` | `yes` \| `no` | Auto-fit grid tracks (responsive card grids) instead of a fixed count. |
| `grid_min` | unit-input | `''` | e.g. `240px` | Min track width when `grid_autofit:yes`. |
| `content_width` | select / multi-picker | inherit | contained / full / custom | Cap the Div's content to the site width vs. run edge-to-edge. |
| `direction` | responsive image-picker | `{base:'row',md:'',lg:''}` | `row` `column` | Main axis. Row = side-by-side (give children a Width to split); Column = stacked. |
| `gap` | responsive short-select | `{base:'',md:'',lg:''}` | gap scale slug \| `''` (none) | Spacing between children (site-wide gap presets, NOT `--bs-gutter`). |
| `row_gap` / `col_gap` | responsive short-select | `{base:'',md:'',lg:''}` | gap scale slug | Per-axis gap overrides (separate row vs. column spacing). |
| `justify_content` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `between` `around` `evenly` | Distribution along the main axis. |
| `align_items` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `stretch` `baseline` | Alignment on the cross axis. |
| `wrap` | responsive switch | `{base:'yes',md:'',lg:''}` | `yes` \| `no` | Allow children to wrap to the next line (rows). |
| `reverse` | responsive switch | `{base:'no',md:'',lg:''}` | `yes` \| `no` | Reverse the layout order (row/column-reverse) without changing markup. |
| `align_content` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `between` `around` | How wrapped lines pack on the cross axis (needs wrap + 2+ lines). |

## atts — Placement (how it sits inside a parent Flexbox)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `width` | responsive popover | `{base:{preset:'none'},…}` | `{preset:'none'\|'1'..'12'\|'custom', width_custom?}` | This box's own width in a parent Flexbox row. Fractions (`1`=1/12 … `12`=1/1); `custom` reveals a unit-input (`% px rem vw`). |
| `flex_grow` | responsive switch | `{base:'no',md:'',lg:''}` | `yes` \| `no` | Grow to absorb remaining free space (overrides fixed Width when there's room). |
| `no_shrink` | responsive switch | `{base:'no',md:'',lg:''}` | `yes` \| `no` | Prevent this box from shrinking below its content/Width (`flex-shrink:0`). |
| `align_self` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `stretch` `baseline` | Override the parent's cross-axis align for just this box. |
| `order` | responsive short-select | `{base:'',md:'',lg:''}` | `''` `first` `0`..`12` `last` | Reorder this box among siblings without changing markup. |

## atts — Styling
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `background` | background-pro | see Notes | background-pro object | Color / gradient / image / video background layers (they stack). |
| `border_preset` | border-style picker | `''` | preset slug | Reusable box style — border, corners, shadow, optional fill + hover. |
| `min_height` | responsive unit-input | `{base:{value:'',unit:'vh'},…}` | units `vh px rem %` | Minimum container height. Pair with `align_items: center` for a hero band. |
| `aspect_ratio` | text / select | `''` | e.g. `16/9`, `1/1` | Lock the box to an aspect ratio (media-frame Divs). |
| `spacing` | spacing block | see `README.md` | margin/padding scale classes | Per-Div margin/padding (spacing-scale utilities), same shape as other nodes. |

## Ready-to-use example (the atts object)
```json
{
  "direction": { "base": "row", "md": "", "lg": "" },
  "gap": { "base": "", "md": "", "lg": "" },
  "justify_content": { "base": "center", "md": "", "lg": "" },
  "align_items": { "base": "center", "md": "", "lg": "" },
  "wrap": { "base": "yes", "md": "", "lg": "" },
  "reverse": { "base": "no", "md": "", "lg": "" },
  "align_content": { "base": "", "md": "", "lg": "" },
  "width": { "base": { "preset": "none" }, "md": { "preset": "none" }, "lg": { "preset": "none" } },
  "flex_grow": { "base": "no", "md": "", "lg": "" },
  "align_self": { "base": "", "md": "", "lg": "" },
  "order": { "base": "", "md": "", "lg": "" },
  "background": { "type": "none" },
  "border_preset": "",
  "min_height": { "base": { "value": "", "unit": "vh" }, "md": { "value": "", "unit": "vh" }, "lg": { "value": "", "unit": "vh" } }
}
```

## Notes
- **This is the DEFAULT page-builder container** — it renders user-facing tiles (Section / Flexbox /
  Grid, under "Layout Elements") in the normal builder palette, not just the Theme Builder. (It was
  previously hidden behind an admin-only filter; that is no longer the case.)
- Nest Divs freely to build structural layouts — **arbitrary depth**, no one-level limit (unlike the
  classic column). Children with a `width` span split a Flexbox row.
- The items-corrector wraps loose top-level content into a flexbox `<section>` (`wrap_into_flexbox`);
  flexbox children pass through **untouched** (no forced `row`/`column`). Classic Column drops still
  force `row > column` for back-compat — see [`row.md`](row.md) / [`column.md`](column.md).
- `background` is a **background-pro** object; consult `../option-types/` for its shape.
