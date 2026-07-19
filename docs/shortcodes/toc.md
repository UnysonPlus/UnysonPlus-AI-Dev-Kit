# `toc` — Table of Contents

An auto-generated, clickable outline of the page's headings, built client-side. Leaf node: `{ type:'simple', shortcode:'toc', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `title` | text | `'Table of Contents'` | string | Heading above the list. Empty = no title. |
| `levels` | checkboxes | `{h2,h3}` | map of `h1` `h2` `h3` `h4` `h5` `h6` → `true` (e.g. `{ "h2": true, "h3": true }`) | Which heading tags to list. |
| `hierarchical` | switch | `'yes'` | `yes` \| `no` | Indent sub-headings (nested) vs one flat list. |
| `min_headings` | text | `'2'` | integer string | Hide the whole box if fewer matching headings exist. |
| `numeration` | select | `'decimal_nested'` | `none` `decimal_nested` `decimal` `roman` `upper_alpha` `bullets` | How each item is marked. |
| `numeration_suffix` | select | `'.'` | `''` `.` `)` | Symbol after the number (ignored for bullets / none). |
| `collapsible` | switch | `'no'` | `yes` \| `no` | Add a Show / Hide toggle beside the title. |
| `collapsed_default` | switch | `'no'` | `yes` \| `no` | Start collapsed (needs `collapsible`). |
| `label_show` / `label_hide` | text | `'show'` / `'hide'` | string | Toggle labels. |
| `scope` | select | `'content'` | `content` `page` `custom` | Where to scan for headings. |
| `scope_selector` | text | `''` | CSS selector | Container to scan when `scope` is `custom`. |
| `skip_text` | textarea | `''` | one phrase per line | Case-insensitive "contains" exclusion by heading text. |
| `smooth_scroll` | switch | `'yes'` | `yes` \| `no` | Animate the jump to a heading. |
| `scroll_offset` | unit-input | `{value:'0',unit:'px'}` | units `px` | Clearance above the target (set to sticky-header height). |
| `scrollspy` | switch | `'yes'` | `yes` \| `no` | Highlight the in-view heading's link. |
| `nofollow` | switch | `'no'` | `yes` \| `no` | Add `rel="nofollow"` to links. |
| `noindex` | switch | `'no'` | `yes` \| `no` | Wrap output in `<!--noindex-->`. |
| `width` | select | `'full'` | `full` `auto` `custom` | Box width in its column. |
| `custom_width` | unit-input | `{value:'',unit:'px'}` | units `px % rem em vw` | Used only when `width` is `custom`. |
| `float` | select | `''` | `''` `left` `right` | Let article text wrap around the box. |
| `sticky` | switch | `'no'` | `yes` \| `no` | Pin the box on scroll (`position: sticky`). |
| `sticky_offset` | unit-input | `{value:'20',unit:'px'}` | units `px rem em` | Gap above the box when pinned. |
| `title_size` / `items_size` | font-size preset | `''` | preset slug | Named size for the title / list links. |
| `bg_color` / `border_color` / `title_color` / `link_color` / `link_hover_color` / `link_active_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Box + link colors (resolved to CSS vars). |

## Ready-to-use example (the atts object)
```json
{
  "title": "On this page",
  "levels": { "h2": true, "h3": true },
  "hierarchical": "yes",
  "min_headings": "2",
  "numeration": "decimal_nested",
  "numeration_suffix": ".",
  "collapsible": "no",
  "collapsed_default": "no",
  "label_show": "show",
  "label_hide": "hide",
  "scope": "content",
  "scope_selector": "",
  "skip_text": "",
  "smooth_scroll": "yes",
  "scroll_offset": { "value": "0", "unit": "px" },
  "scrollspy": "yes",
  "nofollow": "no",
  "noindex": "no",
  "width": "full",
  "custom_width": { "value": "", "unit": "px" },
  "float": "",
  "sticky": "no",
  "sticky_offset": { "value": "20", "unit": "px" },
  "title_size": "",
  "items_size": "",
  "bg_color": { "predefined": "", "custom": "" },
  "border_color": { "predefined": "", "custom": "" },
  "title_color": { "predefined": "", "custom": "" },
  "link_color": { "predefined": "", "custom": "" },
  "link_hover_color": { "predefined": "", "custom": "" },
  "link_active_color": { "predefined": "", "custom": "" }
}
```

## Notes
- The list is built **client-side**: `view.php` emits only a `<nav data-…>` shell and an empty `<ul>`; the frontend script scans the resolved scope, assigns slug ids to matching headings, and builds the links. Crawlers that don't run JS see an empty `<nav>` — `nofollow` / `noindex` exist for SEO control.
- `scope: content` auto-detects the main article wrapper (`.entry-content`, `main`, `article`, …). Use `custom` + `scope_selector` when a theme's markup doesn't match. Headings inside the TOC box, `header`, `footer`, or `[data-toc-skip]` are always excluded.
- Set `scroll_offset` (and `sticky_offset`) to your sticky header's height so clicked headings aren't hidden underneath it.
- Colors resolve to inline CSS variables on the wrapper. They use the **compact color-preset** shape `{ predefined, custom }`. See `README.md`.
