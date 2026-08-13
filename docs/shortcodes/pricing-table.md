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
| `button_preset` | button-style-picker | `''` (none) | a Theme Settings Button preset class | Themed button preset for every plan button; None = the accent `.fw-pt__btn`. (Legacy `button_style` `solid`/`outline` still read as a fallback.) |
| `align` | alignment | `'center'` | `left` `center` `right` | Plan content alignment. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Box Preset applied to each card. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Featured highlight, price, button bg. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Section background. |
| `card_bg` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Card background. |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Plan name color. |
| `price_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Price color. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Features / body text color. |
| `icon_badge_preset` | border-style picker | `''` | `''` \| `iconb-<slug>` | A reusable Icon Badge preset (Theme Settings → Components → Icon Badges) — a shaped tile with its own icon colour/size + hover fx. Stamps `.iconb-<slug>` on the icon wrapper. Applies to every plan's icon. See [../option-types/icon-badge-presets.md](../option-types/icon-badge-presets.md). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `product_schema` | switch | `'no'` | `yes` \| `no` | Emit **Product** / **Offer** JSON-LD for each plan so search engines read the pricing as products. |
| `billing_toggle` | switch | `'no'` | `yes` \| `no` | Show a Monthly / Yearly switch above the plans that swaps each plan's monthly figures for its `price`/`period`/`original_price` **yearly** values. |
| `billing_default` | select | `'monthly'` | `monthly` `yearly` | Which price shows before the visitor toggles. |
| `billing_monthly_label` | text | `'Bill Monthly'` | — | Left toggle label. |
| `billing_yearly_label` | text | `'Bill Yearly'` | — | Right toggle label. |
| `billing_note` | text | `''` | — | Optional savings note beside the toggle, e.g. `'Save 20%'`. |

Each **plan** object: `plan_title` (text), `icon` (icon-v2), `subtitle` (text), `currency` (text, `'$'`); then **`price`, `period` and `original_price` are each `multi-inline`** with value shape `{ monthly, yearly }` — e.g. `price: { monthly: '29', yearly: '290' }`, `period: { monthly: '/mo', yearly: '/yr' }`, `original_price: { monthly: '', yearly: '' }` (optional struck-out "was" prices; render verbatim, include currency/period yourself). The **yearly** side is used only when `billing_toggle` is `'yes'`; a blank yearly value falls back to its monthly counterpart, per field. **Back-compat:** a plan emitted as a plain string (`price: '29'`) is treated as the monthly value. Then `features` (textarea — one per line; a line starting `-` or `!` = unavailable/crossed out), `featured` (`'yes'`/`'no'`), `ribbon` (text), `button_label` (text — blank hides the button), `button_url` (text), `button_target` (`'_self'`/`'_blank'`).

**Billing toggle:** shown whenever `billing_toggle:'yes'` (enabling it always renders the switch). Each price / period / "was" renders in `--monthly` / `--yearly` variants; a dependency-free script flips `is-yearly` on `.fw-pt` (CSS-driven; monthly is the no-JS default). Inert (unchanged output) when off.

## Ready-to-use example (the atts object)
```json
{
  "plans": [
    { "plan_title": "Starter", "icon": { "type": "none" }, "subtitle": "For individuals",
      "currency": "$", "price": { "monthly": "0", "yearly": "" }, "period": { "monthly": "/mo", "yearly": "/yr" }, "original_price": { "monthly": "", "yearly": "" },
      "features": "10 Projects\n5 GB Storage\nEmail Support\n- Priority Support",
      "featured": "no", "ribbon": "", "button_label": "Choose Plan", "button_url": "#", "button_target": "_self" },
    { "plan_title": "Pro", "icon": { "type": "none" }, "subtitle": "For teams",
      "currency": "$", "price": { "monthly": "29", "yearly": "290" }, "period": { "monthly": "/mo", "yearly": "/yr" }, "original_price": { "monthly": "", "yearly": "$390" },
      "features": "Unlimited Projects\n100 GB Storage\nEmail Support\nPriority Support",
      "featured": "yes", "ribbon": "Most Popular", "button_label": "Choose Plan", "button_url": "#", "button_target": "_self" },
    { "plan_title": "Business", "icon": { "type": "none" }, "subtitle": "For companies",
      "currency": "$", "price": { "monthly": "79", "yearly": "790" }, "period": { "monthly": "/mo", "yearly": "/yr" }, "original_price": { "monthly": "", "yearly": "" },
      "features": "Unlimited Projects\n1 TB Storage\nPhone Support\nSSO / SAML",
      "featured": "no", "ribbon": "", "button_label": "Choose Plan", "button_url": "#", "button_target": "_self" }
  ],
  "design": "classic",
  "columns": "3",
  "gap": "4",
  "billing_toggle": "yes",
  "featured_style": ["raise", "highlight", "glow", "badge", "accent_button"],
  "button_preset": "",
  "align": "center",
  "accent_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "icon_badge_preset": ""
}
```

## Notes
- `featured_style` is a **multi-select array** of composable emphasis treatments — pick any combination; an empty array = no emphasis. A featured plan shows a top badge only when both `featured:'yes'` and the `badge` emphasis are active.
- In `features`, a line beginning with `-` or `!` renders crossed out (unavailable); all other lines render as available.
- `button_target` uses the literal values `'_self'` / `'_blank'` (not `yes`/`no`).
- `icon` uses the **icon-v2** shape (see `icon-box.md`); use `{ "type":"none" }` for no icon.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
