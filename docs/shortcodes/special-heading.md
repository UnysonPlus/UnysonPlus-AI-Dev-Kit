# `special_heading` — Special Heading

An overline + title + subtitle heading block with per-element alignment, color and typography controls. Leaf node: `{ type:'simple', shortcode:'special_heading', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `overline` | text | `''` | plain string | Small eyebrow label above the title. Empty = hidden. |
| `title` | text | `''` | string (inline HTML allowed) | The heading text. |
| `icon` | icon-v2 | none | icon-v2 object (see Notes) | Optional icon before the title. |
| `subtitle` | text | `''` | string (inline HTML allowed) | Supporting line under the title. |
| `heading` | select | `'h2'` | `h1` `h2` `h3` `h4` `h5` `h6` | Semantic/SEO tag for the title (not visual size). |
| `alignment` | alignment | `''` (inherit) | `''` `left` `center` `right` | Master alignment for all three lines. |
| `overline_align` | alignment | `''` | same as `alignment` | Override alignment for the overline only. |
| `title_align` | alignment | `''` | same as `alignment` | Override alignment for the title only. |
| `subtitle_align` | alignment | `''` | same as `alignment` | Override alignment for the subtitle only. |
| `overline_uppercase` | switch | `'no'` | `yes` \| `no` | Render overline as a letter-spaced uppercase kicker. |
| `overline_marker` | select | `''` | `''` `rule` `dot` `lines` `bar` | Decorative mark with the overline. |
| `overline_marker_position` | select | `'before'` | `before` \| `after` | Marker before or after the overline text. |
| `overline_container` | select | `''` | `''` `pill` `pill-outline` `underline` | Optional shape around the overline. |
| `element_spacing` | select | `''` | `''` (normal) `tight` `relaxed` | Vertical spacing between the three lines. |
| `block_max_width` | unit-input | `{value:'',unit:'px'}` | `{value,unit}` units `px % rem em ch vw` | Constrain the whole heading block width. |
| `display_size` | select | `''` | `''` (Default / from tag) `display-1` (largest) `display-2` `display-3` `display-4` `display-5` `display-6` | Enlarge title visually, keeping its tag. |
| `title_max_width` | unit-input | `{value:'',unit:'px'}` | `{value,unit}` units `px % rem em ch vw` | Constrain the title line length only. |
| `subtitle_size` | font-size preset | `''` | preset slug (see `README.md` font sizes) | Named size for the subtitle. |
| `subtitle_max_width` | unit-input | `{value:'',unit:'rem'}` | `{value,unit}` units `px rem em ch % vw` | Constrain the subtitle line length. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object (see `README.md`) | Block background color. |
| `overline_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Overline color. |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Title color. |
| `subtitle_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Subtitle color. |
| `overline_class` | text | `''` | space-separated class(es) | Extra CSS class on the overline (Advanced tab). |
| `title_class` | text | `''` | space-separated class(es) | Extra CSS class on the title. |
| `subtitle_class` | text | `''` | space-separated class(es) | Extra CSS class on the subtitle. |

## Ready-to-use example (the atts object)
```json
{
  "overline": "Our process",
  "title": "Built for teams that <br><span class=\"accent\">grow with clarity</span>",
  "subtitle": "",
  "heading": "h2",
  "alignment": "center",
  "overline_align": "", "title_align": "", "subtitle_align": "",
  "overline_uppercase": "yes",
  "overline_marker": "", "overline_marker_position": "before", "overline_container": "",
  "element_spacing": "",
  "block_max_width": { "value": "", "unit": "px" },
  "display_size": "display-5",
  "title_max_width": { "value": "", "unit": "px" },
  "subtitle_size": "",
  "subtitle_max_width": { "value": "", "unit": "rem" },
  "bg_color": { "predefined": "", "custom": "" },
  "overline_color": { "predefined": "", "custom": "" },
  "title_color": { "predefined": "", "custom": "" },
  "subtitle_color": { "predefined": "", "custom": "" },
  "overline_class": "", "title_class": "", "subtitle_class": ""
}
```

## Notes
- `title` and `subtitle` accept **inline HTML** — use `<br>` for a controlled line break and `<span class="…"><em>…</em></span>` to emphasize / color a word. Keep it inline only; don't nest block elements.
- `icon` is a full **icon-v2** object. For "no icon" use `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`; for a library SVG use `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string (`predefined` wins when both set). See `README.md`.
- `heading` sets the SEO tag only; use `display_size` to change visual size while keeping the tag. Use one `h1` per page.
- Alignment fields default to `''` = **inherit** the parent/theme; the per-element `*_align` fields override the master `alignment`.
