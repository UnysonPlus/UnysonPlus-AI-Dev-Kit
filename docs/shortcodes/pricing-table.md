# `pricing_table` — Pricing Table

Comparable pricing plans as cards in a responsive grid — each with an icon, name, subtitle, price (currency + amount + period), a feature list, an optional "featured" highlight, a ribbon/badge and a CTA button. Leaf node: `{ type:'simple', shortcode:'pricing_table', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `plans` | addable-popup | `[]` | array of plan objects (see below) | The pricing columns. |
| `design` | image-picker | `'classic'` | `classic` `modern` `minimal` `gradient` `dark` `outline` | Card style. |
| `columns` | select | `'3'` | `2` `3` `4` `5` | Plans per row on desktop. |
| `gap` | select | `'4'` | Gap-Scale preset slug | Spacing between plans. |
| `featured_style` | multi-select | `['raise','highlight','glow','badge','accent_button']` | any of `raise` `enlarge` `highlight` `glow` `fill` `badge` `accent_button` `emphasize` | How the featured plan stands out (composable). |
| `button_style` | select | `'solid'` | `solid` `outline` | Plan button style. |
| `align` | alignment | `'center'` | `left` `center` `right` | Plan content alignment. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Box Preset applied to each card. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Featured highlight, price, button bg. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Section background. |
| `card_bg` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Card background. |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Plan name color. |
| `price_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Price color. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Features / body text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

Each **plan** object: `plan_title` (text), `icon` (icon-v2), `subtitle` (text), `currency` (text, `'$'`), `price` (text, e.g. `'29'`), `period` (text, e.g. `'/mo'`), `features` (textarea — one per line; a line starting `-` or `!` = unavailable/crossed out), `featured` (`'yes'`/`'no'`), `ribbon` (text), `button_label` (text — blank hides the button), `button_url` (text), `button_target` (`'_self'`/`'_blank'`).

## Ready-to-use example (the atts object)
```json
{
  "plans": [
    { "plan_title": "Starter", "icon": { "type": "none" }, "subtitle": "For individuals",
      "currency": "$", "price": "0", "period": "/mo",
      "features": "10 Projects\n5 GB Storage\nEmail Support\n- Priority Support",
      "featured": "no", "ribbon": "", "button_label": "Choose Plan", "button_url": "#", "button_target": "_self" },
    { "plan_title": "Pro", "icon": { "type": "none" }, "subtitle": "For teams",
      "currency": "$", "price": "29", "period": "/mo",
      "features": "Unlimited Projects\n100 GB Storage\nEmail Support\nPriority Support",
      "featured": "yes", "ribbon": "Most Popular", "button_label": "Choose Plan", "button_url": "#", "button_target": "_self" },
    { "plan_title": "Business", "icon": { "type": "none" }, "subtitle": "For companies",
      "currency": "$", "price": "79", "period": "/mo",
      "features": "Unlimited Projects\n1 TB Storage\nPhone Support\nSSO / SAML",
      "featured": "no", "ribbon": "", "button_label": "Choose Plan", "button_url": "#", "button_target": "_self" }
  ],
  "design": "classic",
  "columns": "3",
  "gap": "4",
  "featured_style": ["raise", "highlight", "glow", "badge", "accent_button"],
  "button_style": "solid",
  "align": "center",
  "accent_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `featured_style` is a **multi-select array** of composable emphasis treatments — pick any combination; an empty array = no emphasis. A featured plan shows a top badge only when both `featured:'yes'` and the `badge` emphasis are active.
- In `features`, a line beginning with `-` or `!` renders crossed out (unavailable); all other lines render as available.
- `button_target` uses the literal values `'_self'` / `'_blank'` (not `yes`/`no`).
- `icon` uses the **icon-v2** shape (see `icon-box.md`); use `{ "type":"none" }` for no icon.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
