# `flexbox` — Flexbox (the **Div** — default page-builder container)

The default modern container primitive — a self-contained, **arbitrarily nestable** semantic container.
Its palette tab is **"Layout Elements"**, where it renders **four tiles** — all the same shortcode,
differing only by `html_tag`/`display`:

| Tile | `html_tag` | `display` | role |
|---|---|---|---|
| **Section** | `section` | `block` | A full-width page **band**. New sections default to a full-width band (`full_width:yes`) — background edge-to-edge, content contained (Divi/Bricks/Elementor-style). |
| **Block** | `div` | `block` | A plain container that stacks its children — the simplest wrapper (grouping, spacing, a background). |
| **Flexbox** | `div` | `flex` | One-dimensional layout — a row or a stack. |
| **Grid** | `div` | `grid` | Two-dimensional column layout (CSS grid). |

In the **Theme Builder** it exposes the full semantic-tag set (Header/Body/Footer parts). On normal
pages the tag choices are trimmed to **`div` `section` `article` `aside`** — the landmark/chrome tags
(`header` `footer` `nav` `main`) belong to the Theme/Header-Footer Builder and are omitted to avoid
invalid duplicate-landmark markup.

Node: `{ type:'flexbox', _items:[ /* children — elements OR nested Divs */ ], atts:{…} }` — plus the
shared wrapper blocks (`common`, `fx`) documented in `README.md`. This file lists only the
**shortcode-specific** atts.

Children sit **directly** in `_items` (no `row`/`column` wrapper). Widths are set per child via its own
`width` att and render as **`fw-span-{bp}-N`** (12-col) utilities; container layout emits
`fw-flex`/`fw-grid` + `fw-gap{bp}-*`/`fw-justify{bp}-*`/`fw-items{bp}-*` + order/grow/placement classes.
Gap comes from the spacing-scale `gap` option, **not** Bootstrap `--bs-gutter`.

Every layout/placement att is **responsive**: `{ base, md, lg }`, where a blank device inherits the next smaller one.

## Option layout & conditional visibility

The modal groups options (`type:'group'`) and **reveals only what applies to the current kind** (reactive
JS in the page-builder item + live editor; the framework has no declarative `show_if`). Hidden options
keep their values.

- **Layout tab** — `Box` (html_tag, display) · `Grid` (shown when `display:grid`) · `Flex`
  (direction/wrap/reverse — shown when `display:flex`) · `Arrange` (gap + justify/align — shown when
  `display:flex` **or** `grid`) · `Container` (full_width, content_width, responsive_collapse) ·
  `Placement` (shown when `html_tag` ≠ `section`).
- **Styling tab** — `Background` · `Section Style` (pattern + variant — **section-only**) ·
  `Shape Dividers` (**section-only**) · `Box Style` (border/min-height/ratio) · `Text` · `Spacing`.
- Lone options: **Full-Width Band** shows only for `section`; **Responsive Collapse** only for flex/grid.

## atts — Container (how it arranges children)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `html_tag` | select | `div` | pages: `div` `section` `article` `aside`; Theme Builder adds `header` `footer` `nav` `main` | Semantic element. `section` = the Section tile (a full-width band). |
| `display` | select | `flex` | `flex` `grid` `block` | Layout mode (Flexbox / Grid / Block tiles). |
| `grid_columns` | text | `3` | integer 1–12, `>12`, or a raw track template | Column count when `display:grid`. 1–12 use the cacheable `fw-grid-N` class; else an inline `grid-template-columns`. |
| `grid_autofit` | switch | `no` | `yes` \| `no` | Auto-fit grid tracks (responsive card grids) instead of a fixed count. |
| `grid_min` | unit-input | `''` | e.g. `240px` (`px rem em %`) | Min track width when `grid_autofit:yes`. |
| `grid_dense` | switch | `no` | `yes` \| `no` | Dense packing — backfill gaps left by spanned cells (`fw-grid-dense`). |
| `direction` | responsive image-picker | `{base:'row',…}` | `row` `column` | Main axis (flex). Row = side-by-side; Column = stacked. |
| `gap` | responsive short-select | `{base:'',…}` | gap scale slug \| `''` | Spacing between children (site gap presets, not `--bs-gutter`). **Applies to flex AND grid.** |
| `row_gap` / `col_gap` | responsive short-select | `{base:'',…}` | gap scale slug | Per-axis gap overrides. |
| `justify_content` | responsive image-picker | `{base:'',…}` | `''` `start` `center` `end` `between` `around` `evenly` | Distribution on the main axis (flex/grid). |
| `align_items` | responsive image-picker | `{base:'',…}` | `''` `start` `center` `end` `stretch` `baseline` | Cross-axis alignment (flex/grid). |
| `wrap` | responsive switch | `{base:'yes',…}` | `yes` \| `no` | Allow children to wrap (flex rows only). |
| `reverse` | responsive switch | `{base:'no',…}` | `yes` \| `no` | Reverse order (row/column-reverse) without changing markup (flex). |
| `align_content` | responsive image-picker | `{base:'',…}` | `''` `start` `center` `end` `between` `around` | Pack wrapped lines on the cross axis. |
| `full_width` | switch | `no` (new **sections** are created with `yes`) | `yes` \| `no` | **Section-only.** Full-Width Band: background edge-to-edge (`fw-full-bleed`) with content inset to Content Width. `no` = a contained band (`fw-contained`). |
| `content_width` | multi-picker | `{preset:'inherit'}` | `{preset:'inherit'\|<slug>\|'custom', custom?:{custom_width:{value,unit}}}` | Content max-width. Named presets come from the **Container Width** library (Narrow/Medium/Wide/…); `custom` reveals a unit-input (`px rem % vw`); `inherit` = no cap. A **legacy flat `{value,unit}`** still resolves as a custom width. |
| `responsive_collapse` | switch | `yes` | `yes` \| `no` | Auto-stack a multi-column Grid/Flex down on smaller screens (shared collapse classes). Flex/grid only. |

## atts — Placement (how it sits inside a parent Flexbox/Grid)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `width` | responsive popover | `{base:{preset:'none'},…}` | `{preset:'none'\|'1'..'12'\|'1_5'..'4_5'\|'fit'\|'max'\|'min'\|'custom', custom?:{width_custom}}` | This box's own width in a parent Flexbox, or its **grid span** in a Grid parent (fractions `1`=1/12 … `12`=1/1; fifths; content keywords; `custom` → unit-input). |
| `flex_grow` | responsive switch | `{base:'no',…}` | `yes` \| `no` | Grow to absorb free space (flex). |
| `no_shrink` | responsive switch | `{base:'no',…}` | `yes` \| `no` | Prevent shrinking (`flex-shrink:0`). |
| `flex_basis` | responsive unit-input | `{base:{value:'',unit:'px'},…}` | units `px rem % vw` | Starting size before grow/shrink (`flex-basis`). Unlike `width` (a hard fixed size) this composes with `flex_grow` — the `flex: 1 1 300px` card pattern (`flex_basis` 300px + `flex_grow` on + a `min_width`). Scoped rule on the box's `fx-*` class. |
| `min_width` | responsive unit-input | `{base:{value:'',unit:'px'},…}` | units `px rem % vw` | Smallest the box may shrink to (`min-width`). Stops a flexible box collapsing and forces a card grid to wrap. Scoped rule on the box's `fx-*` class. |
| `align_self` | responsive image-picker | `{base:'',…}` | `''` `start` `center` `end` `stretch` `baseline` | Override the parent's cross-axis align for just this box. |
| `order` | responsive short-select | `{base:'',…}` | `''` `first` `0`..`12` `last` | Reorder among siblings (flex). |
| `col_start` | responsive short-select | `{base:'',…}` | `''` (Auto) \| `1`..`12` | **Grid Column Start** — place this box at an exact grid column (`grid-column-start`, via `fw-col-start-{bp}-N`, scoped under `.fw-grid`), so you can position an item without empty spacer cells. Combine with `width` for the span. Inert outside a Grid parent. |

## atts — Styling
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `background` | background-pro | see Notes | background-pro object | Color / gradient / image / video layers (they stack). |
| `background_pattern` | multi-picker | `{pattern:'none'}` | `{pattern:<id>\|'none'}` | **Section-only.** Decorative SVG pattern layer over the background (from the Patterns library) → `.pattern-layer` + `upw-has-pattern`. |
| `variant` | select | `''` | Section-Style preset slug (`''`=Default, `alt`/`light`/`dark`/…) | **Section-only.** Named Section Style that themes background + text together → `section--<slug>`. |
| `divider_top` / `divider_bottom` | multi-picker | `{shape:'none'}` | `{shape:<slug>\|'none', <slug>:{color,height,flip}}` | **Section-only.** Shape divider on the top/bottom edge (Shape Dividers library) → `.sc-shape-divider` SVG + `section--has-divider`. |
| `border_preset` | border-style picker | `''` | preset slug | Reusable box style — border, corners, shadow, optional fill + hover (`boxp-*`). |
| `backdrop_blur` | unit-input | `{value:'',unit:'px'}` | units `px rem` | **Glass.** Frosted-glass blur of what shows through the box (`backdrop-filter:blur()` + `-webkit-`). Needs a translucent `background` to reveal. Empty/0 = off. Scoped rule on the box's `fx-*` class. Site-wide default lives in the theme `--glass-*` token / `.glass-surface` utility. |
| `min_height` | responsive unit-input | `{base:{value:'',unit:'vh'},…}` | units `vh px rem %` | Minimum height. Pair with `align_items:center` for a hero band. |
| `aspect_ratio` | text | `''` | e.g. `16 / 9`, `1` | Lock the box to a width : height ratio (`aspect-ratio`). |
| `text_align` | alignment field | `''` (Inherit) | `''` `left` `center` `right` (+ justify) | Text alignment of inline/text content (`text-*` utility) — applies to **any** tag. |
| `spacing` | spacing block | see `README.md` | margin/padding scale classes | Per-Div margin/padding (spacing-scale utilities). |

## Clean output
An **empty** flexbox (no child content) drops its inert "lay out my children" classes — `fw-flex`,
`fw-grid`/`fw-grid-N`, direction/wrap/justify/align/gap, `fw-collapse` — since they do nothing with no
children. **Item-in-parent classes are kept** (`fw-span-*`, `fw-fifth-*`, `fw-col-start-*`, align-self,
order, grow/shrink, border preset, band, background), so an empty grid **cell still occupies its track /
placement**. Any box with content is emitted unchanged.

## Live-editor placement (section-encapsulation)
In the **live editor** the page root holds only **Sections**. Adding a Block/Flexbox/Grid nests it into
the **last** section, or creates a section to hold it if the page has none — so a bare Div is never
orphaned at the root. (The backend builder keeps Divs root-capable; this is a live-editor-only rule — see
the decision log *"Why the live editor wraps Flexbox/Grid/Block in a Section"*.)

## Ready-to-use example (a Section band with a 3-col grid)
```json
{
  "html_tag": "section",
  "display": "grid",
  "grid_columns": "3",
  "full_width": "yes",
  "content_width": { "preset": "wide" },
  "gap": { "base": "md", "md": "", "lg": "" },
  "variant": "",
  "background": { "type": "none" },
  "text_align": "center",
  "min_height": { "base": { "value": "", "unit": "vh" }, "md": { "value": "", "unit": "vh" }, "lg": { "value": "", "unit": "vh" } }
}
```

## Notes
- **The DEFAULT page-builder container** — the four Layout-Elements tiles are shown in the normal palette,
  not just the Theme Builder.
- Nest Divs freely — **arbitrary depth** (unlike the classic column). A child `width` splits a Flexbox
  row or spans a Grid.
- A **Section** is a full-width band by default (new sections carry `full_width:yes`); existing sections
  saved before this keep their contained rendering (the option default is still `no`, and the flag is
  baked only into freshly-created sections).
- The Shape-Divider / Background-Pattern / Section-Variant / Container-Width sources are the shared
  Theme-Settings preset libraries (Components → Shape Dividers / Background Patterns / Section Styles /
  Container Widths), so user-added entries appear automatically.
- The items-corrector wraps loose top-level content into a flexbox `<section>` (`wrap_into_flexbox`);
  flexbox children pass through untouched. Classic Column drops still force `row > column` for
  back-compat — see [`row.md`](row.md) / [`column.md`](column.md).
- `background` is a **background-pro** object; consult `../option-types/` for its shape.
