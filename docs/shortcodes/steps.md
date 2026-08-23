# `steps` — Steps / Process

A numbered steps / process flow in five designs (horizontal, vertical, alternating, cards, circles), each step with a marker, title and description. Leaf node: `{ type:'simple', shortcode:'steps', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `steps` | addable-popup | `[]` | array of step objects (see below) | The steps in order. |
| `design` | image-picker | `'horizontal'` | `horizontal` `vertical` `alternating` `cards` `circles` | Overall layout. |
| `marker` | select | `'number'` | `number` `icon` `none` | What each marker shows. |
| `marker_shape` | select | `'circle'` | `circle` `rounded` `square` | Marker shape. |
| `connector` | select | `'solid'` | `solid` `dashed` `none` | Line between markers (Horizontal / Vertical / Alternating). |
| `title_tag` | select | `'h3'` | `h2` `h3` `h4` `h5` `div` | Step title HTML tag. |
| `card_rows` | card-rows (addable-popup) | `[[title],[content]]` | array of rows `{ slots:[…], direction, justify, align, reverse }` | **Card tab.** The step BODY layout via the shared Card Rows slot designer (same as posts / testimonials). Slots: `icon` `number` `title` `content`. Each row is inline or stacked with distribute + align; a slot shows only when it's in a row and has content. The marker chip + connector **spine** stay owned by `design`/`marker`, so the flow layouts are untouched. Body renders through `sc_card_rows_render()` under the `steps-card` CSS prefix; no saved rows ⇒ classic Title-then-Description. |
| `box_style` | border-style picker | `''` | `''` \| `boxp-<slug>` | **Card tab.** A reusable Box Preset (Theme Settings → Components → Box Presets) stamped as `.boxp-<slug>` on every `.fw-steps__item` — card fill / border / corners / shadow + hover. Most visible on the Cards design. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Marker / connector color. |
| `marker_text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Marker number/icon color. |
| `icon_badge_preset` | border-style picker | `''` | `''` \| `iconb-<slug>` | A reusable Icon Badge preset (Theme Settings → Components → Icon Badges) — a shaped tile with its own icon colour/size + hover fx. Stamps `.iconb-<slug>` on the icon wrapper. Applies to every item's icon (Marker = Icon). See [../option-types/icon-badge-presets.md](../option-types/icon-badge-presets.md). |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Title color. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Description color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

Each **step** object: `title` (text), `content` (textarea — accepts HTML and shortcodes), `icon` (icon-v2 — used when `marker=icon`), `number` (text — label override, defaults to the step position).

## Ready-to-use example (the atts object)
```json
{
  "steps": [
    { "title": "Plan",    "content": "Define scope and goals.",       "icon": { "type": "none" }, "number": "" },
    { "title": "Design",  "content": "Wireframe and prototype.",      "icon": { "type": "none" }, "number": "" },
    { "title": "Build",   "content": "Develop and test the product.", "icon": { "type": "none" }, "number": "" },
    { "title": "Launch",  "content": "Ship and iterate.",             "icon": { "type": "none" }, "number": "" }
  ],
  "design": "horizontal",
  "marker": "number",
  "marker_shape": "circle",
  "connector": "solid",
  "title_tag": "h3",
  "accent_color": { "predefined": "", "custom": "" },
  "marker_text_color": { "predefined": "", "custom": "" },
  "icon_badge_preset": "",
  "title_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Site Converter — automatic design detection

The Site Converter sets the closest steps **`design`** (`detect_steps_design()`): steps STACKED (`flex-col` / `grid-cols-1`) → `vertical`; each step a bordered/elevated BOX → `cards`; otherwise the `horizontal` default. `alternating`/`circles` are not auto-selected. Boxed detection reads the step cards' **measured computed styles** (border / shadow / radius / fill), not just Tailwind classes.

The converter also matches, from the source: each step's **icon** glyph (`step_icon()` → lucide library id / inline svg / img) with `marker` set to `icon` when steps carry glyphs; the **`marker_shape`** (from the number/icon chip's radius) and **`accent_color`** (from its fill); and, on the Cards design, a **`box_style`** Box Preset — the step-card skin is clustered into the Box Presets library and assigned like icon-box cards. `card_rows` is left at its default (Title → Description); the captured design lives in `design`/`marker`/`box_style`.

## Notes
- Leave a step's `number` empty to auto-number by position; set it to override the marker label. `icon` (icon-v2, see `icon-box.md`) is only used when `marker=icon`.
- `connector` only affects Horizontal / Vertical / Alternating — Cards and Circles have no line.
- For the color pickers, the applied color is the **custom** hex (`--st-accent` / `--st-marker-text` / `--st-title` / `--st-text`); set `custom` for an exact color.
- Layout is pure CSS with no JS; the flow collapses to a single vertical column on narrow screens.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
