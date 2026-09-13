<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `tabs` — Tabs

A horizontal or vertical tabbed-content widget; each tab has a title and a body panel. A **Media panel** layout turns it into a list-of-tabs + switching-image showcase (each tab has its own image, the content becomes the caption), with **Click / Hover** activation and optional **Auto-rotate**. Leaf node: `{ type:'simple', shortcode:'tabs', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

> **Scroll-driven vs. this.** For the *scroll-pinned* cinematic version (image pins while steps scroll — the Apple/Stripe pattern) use the **Animation Engine → Scrollytelling** module (Media Panel + Steps) on a Section. This shortcode is the **click / hover / auto-rotate** version and needs no engine.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `tabs` | addable-popup | `[]` | array of `{ tab_title, tab_content, tab_image, badge, icon, disabled, is_active }` | The tab entries, rendered in order. |
| `tabs[].tab_title` | text | `''` | string | Label on the clickable tab button. |
| `tabs[].tab_content` | wp-editor | `''` | HTML string | Panel body shown when the tab is selected. In the Media layout it's the caption under the image. |
| `tabs[].tab_image` | upload | `''` | image upload object | Per-tab image shown on the media side in the Media layout (srcset when it's a Media-Library attachment). Ignored in Content layout. |
| `tabs[].badge` | text | `''` | string | Optional small pill beside the title (e.g. "Save 20%"). |
| `tabs[].icon` | icon | `''` | icon-v2 value | Optional icon shown before the tab title. |
| `tabs[].disabled` | switch | `'no'` | `yes` \| `no` | Greys the tab out and blocks selection. |
| `tabs[].is_active` | switch | `'no'` | `yes` \| `no` | Marks the tab open on load. If several are `yes`, the first wins. |
| `design` | image-picker | `'underline'` | `underline` `pills` `segmented` `boxed` `minimal` `buttons` `popover` | Tab visual style (design registry; skin-pack extensible).|
| `activation` | select | `'automatic'` | `automatic` `manual` | WAI-ARIA keyboard: panel changes on arrow-focus (automatic) vs on Enter/Space (manual). |
| `mobile` | select | `'none'` | `none` `accordion` `scroll` | Narrow-screen behaviour: wrap (none), collapse-to-accordion, or horizontal-scroll. |
| `tab_width` | select | `'auto'` | `auto` `fill` `equal` | How tab buttons share the row (Content layout): `auto` = each as wide as its label; `fill` = grow to fill the row proportional to labels; `equal` = every tab the same width. Replaces the old `justified` switch. |
| `alignment` | select | `'start'` | `start` `center` `end` | Horizontal alignment of the tab nav (no visible effect when `tab_width` fills the row). |
| `content_frame` | select | `'framed'` | `framed` `frameless` | The box around the content panel. `framed` = the classic border + radius + padding + white bg; `frameless` = no box (border/radius/bg + SIDE padding dropped, a top gap kept) so the content sits flush — best when it brings its own cards. Decoupled from `design` (any nav style can be frameless). |
| `orientation` | select | `'horizontal'` | `horizontal` `vertical` | Tabs above content, or beside it in a side column (Content layout; ignored in Media). |
| `layout` | select | `'content'` | `content` `media` | `media` = list of tabs on one side, a switching image on the other. |
| `media_side` | select | `'right'` | `right` `left` | Which side the image sits on in the Media layout. |
| `activate_on` | select | `'click'` | `click` `hover` | Switch tabs on click or on pointer hover (any layout). |
| `autoplay` | switch | `'no'` | `yes` \| `no` | Auto-rotate through the tabs; pauses on hover/focus, skipped under reduce-motion. |
| `autoplay_interval` | slider | `5` | `2`–`12` (seconds) | Seconds each tab stays active when `autoplay` is on. |
| `fade` | switch | `'no'` | `yes` \| `no` | Soft cross-fade between panels/images instead of an instant swap. |
| `deep_link` | switch | `'no'` | `yes` \| `no` | Open a tab from the URL `#hash` and update the URL as tabs switch, so a tab is shareable/bookmarkable. Set a CSS ID (Advanced tab) for links that survive a reload. |
| `remember` | switch | `'no'` | `yes` \| `no` | Re-open the tab the visitor last viewed (stored in their browser). Works best with a CSS ID on the element. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `tab_title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Tab nav-button text color. |
| `tab_content_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Tab panel body text color. |

## Ready-to-use example (the atts object)
```json
{
  "tabs": [
    { "tab_title": "Overview", "tab_content": "<p>A quick summary of what this section covers.</p>", "badge": "", "is_active": "yes" },
    { "tab_title": "Details", "tab_content": "<p>Deeper information for readers who want more.</p>", "badge": "", "is_active": "no" },
    { "tab_title": "Pricing", "tab_content": "<p>Plans and what each one includes.</p>", "badge": "New", "is_active": "no" }
  ],
  "design": "underline",
  "tab_width": "auto",
  "alignment": "start",
  "orientation": "horizontal",
  "layout": "content",
  "media_side": "right",
  "activate_on": "click",
  "autoplay": "no",
  "autoplay_interval": 5,
  "fade": "no",
  "deep_link": "no",
  "remember": "no",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "tab_title_color": { "predefined": "", "custom": "" },
  "tab_content_color": { "predefined": "", "custom": "" }
}
```

## Site Converter — automatic design detection

The Site Converter classifies the source tabs widget and sets the closest **`orientation`** + nav **`design`** (`FW_Site_Converter_Stitch::detect_tabs_design()`), instead of always the horizontal underline default:

| source signal | → att |
|---|---|
| tablist is a side COLUMN (`flex-col` / `aria-orientation="vertical"`) | `orientation = vertical` |
| nav items `rounded-full` | `design = pills` |
| 2–3 options in a rounded pill CONTAINER (`bg-gray` + `rounded-full`) | `design = segmented` |
| bordered rounded tabs | `design = boxed` |
| otherwise | `design = underline` (default) |

Conservative — unclear styling stays `underline`; `minimal`/`buttons`/`popover` and the `media` layout are not auto-selected.

It also carries the nav **placement** and, for a filled pill toggle, its **exact skin** — so the converted nav matches the source rather than the design's generic default:

| source signal | → att |
|---|---|
| nav wrapper `flex justify-center` / tablist parent `mx-auto` | `alignment = center` (native Tab Alignment option) |
| `justify-end` | `alignment = end` |
| a FILLED segmented control (opaque track fill, or an opaque/large-radius active pill) | scoped `custom_css` repainting the pill — see below |
| the source content panel (`role="tabpanel"` / `sc-tp*`) has NO border and NO opaque fill | `content_frame = frameless` (else `framed`) |

**Content frame.** Most Tailwind/React tab panels are frameless — the content brings its own cards, so the tabs shortcode's default bordered/padded white box is a box the source never had. `detect_tabs_design()` reads the first tabpanel's `data-sc-cs`: a real `border-top-width` or an opaque `background-color` → `framed`; neither → `frameless`. Only set when a panel is found (else the shortcode's `framed` default stands).

**Segmented-pill translator.** The built-in `segmented` design is a generic light/white pill; a source brand-pill toggle (e.g. jukebox's `bg-muted rounded-full border-2 border-primary` track with a `bg-primary` active pill) needs its real tokens. `detect_tabs_design()` reads them from the captured **`data-sc-cs`** on the tablist (track `background-color` / `border-top-width` / `border-top-color` / `border-radius`) and the active `<button>` (`background-color` / `color` / `border-radius` / `text-transform` / `letter-spacing`), and stashes them under `design.pill`. **These are captured BEFORE the `tab_style` classification's early `return`s** (a confidently-classified track returns immediately), so the block runs right after the active button's `data-sc-cs` is resolved, not at the end of the function. `FW_Site_Converter_Mapper::tabs_pill_css()` then assembles a scoped block:

```
selector .nav{background:#hex;border:2px solid #hex;border-radius:9999px !important}
selector .nav .nav-link{border-radius:9999px;text-transform:uppercase;opacity:1 !important}
selector .nav .nav-link.active{background:#hex !important;color:#hex !important;border-radius:9999px !important}
```

Two constraints baked in: colours are **hex** (`rgb_to_hex()`) because a comma-bearing `rgb()`/`hsl()` silently voids the `selector{…}` custom_css pipeline; and the visual overrides carry **`!important`** to beat the design stylesheet's equal-specificity defaults (e.g. the segmented active's `background:#fff`). The tabs wrapper scopes `selector` to a `.u{hash}` via `sc_build_wrapper_attr`, and when the tabs sit inside a snippet the snippet-CSS injection (snippets `helpers.php`) emits that scoped rule.

## Notes
- `tab_content` is a WYSIWYG (`wp-editor`) field — keep it plain semantic HTML with no classes on `<p>`/`<li>` (see `text-block.md`).
- `is_active` is per-item, not a global setting. Set exactly one entry to `yes`; if none is set the first tab opens by default.
- `orientation: vertical` uses horizontal space for the nav sidebar — place it in a wide enough column.
- `tab_width` (Content layout) replaces the old `justified` switch: `fill`/`equal` both stretch the buttons across the row (so `alignment` stops mattering), while `auto` sizes each to its label.
- `deep_link` / `remember` both work best with a **CSS ID** set on the element (Advanced tab) so the `#hash` link and the stored last-tab survive a reload.
- `segmented` and `underline` styles suit a Monthly / Yearly-style toggle and quiet editorial strips respectively.
- **Media layout** (`layout:"media"`): give each tab a `tab_image`; `tab_content` becomes the caption. `orientation`/`justified` don't apply; `media_side` controls left/right and it stacks (list above image) on mobile.
- `activate_on:"hover"` and `autoplay` work in **both** layouts. Auto-rotate pauses while the visitor hovers or focuses the element and is skipped entirely under `prefers-reduced-motion`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
