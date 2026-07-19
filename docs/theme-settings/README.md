# Theme Settings — reference index

Everything under **Unyson+ → Theme Settings**, one file per tab. Configure a site's **design from
these options first** (colors, typography, buttons, boxes, spacing, chrome) — reach for CSS only for
what no option covers (and that goes in **Misc → Custom CSS**, see `misc.md`).

> **Every option lists ALL of its choices** — the stored value keys an importer/agent must use. Never
> guess a value; look it up here.

## Preset tabs (define reusable presets that elements CONSUME) — read these first

| Tab | What it defines | Class/var it emits |
|---|---|---|
| [colors.md](colors.md) | Color presets (the palette) | `--color-{slug}`, `.text-{slug}`, `.bg-{slug}` |
| [typography.md](typography.md) | Body/heading fonts, font-size presets | `.font-{slug}`, `--font-size-{slug}` |
| [buttons.md](buttons.md) | Button color presets, sizes, hover animations | `.btn-{id}`, `.btn-{slug}`, `.btnfx-c-{slug}` |
| [boxes.md](boxes.md) | Box / section-style / pattern / table presets | `.boxp-{slug}`, `.section--{slug}`, `.tablep-{slug}` |
| [spacing.md](spacing.md) | Spacing scale + gap scale | `.pt-{n}`…`.mb-{n}`, `--spacer-{n}`, `.g-{n}` |

## Chrome + layout tabs

| Tab | Controls |
|---|---|
| [general.md](general.md) | Site identity/base, container/layout width, sidebar defaults |
| [header.md](header.md) | Header layout/design, identity/logo, menu, top/bottom bars, mega-menu |
| [footer.md](footer.md) | Footer layout, columns, widgets, pre/post rows, copyright |
| [pages.md](pages.md) | Page layout/hero defaults + per-page/per-post meta overrides |
| [blog.md](blog.md) | Blog index/archive/card + single post layout & extras |
| [site-ux.md](site-ux.md) | Dark mode, preloader, scroll progress, scroll-to-top |
| [social.md](social.md) | Social profile links used across the theme |
| [misc.md](misc.md) | Custom CSS, 404, analytics/scripts, performance, media, maintenance, export/import |
| [woocommerce.md](woocommerce.md) | Shop/catalog options (only when WooCommerce is active) |

## How Theme Settings are stored

One `wp_option` per theme, `fw_theme_settings_options:unysonplus`, keyed by each option's **top-level
id**. Read/write with `fw_get_db_settings_option($id)` / `fw_set_db_settings_option($id, $value)`.
Switch options store the **string** `'yes'`/`'no'` (not a boolean). Preset scales (colors, spacing,
buttons…) generate their CSS into a hashed `presets-*.css` the theme enqueues.
