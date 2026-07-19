# megamenu extension

Turns any WordPress nav-menu item into a rich, multi-column dropdown **mega-panel** (columns of links, images, rich content, widget areas or raw HTML) for the theme's header navigation. **Active by default: no** — enable it under Extensions. Version: 1.1.27.

## How it works

A mega-menu is enabled **per WP menu item** at **Appearance → Menus**, not in the page builder and not from a settings page (the extension has neither). The extension swaps in its own admin walker (`FW_Ext_Mega_Menu_Admin_Walker`), which adds two things to each menu item's editor:

1. **Hardcoded checkboxes** (plain post-meta): **"Use as Mega Menu"** on a top-level item, **"Hide"** (title-off) on a column/item title, and **"This column should start a new row"** on a column.
2. A **"Settings" modal button** (label filterable via `fw:ext:megamenu:label:item-options-btn`) that opens the per-item option set for that item's level.

Structure is **rows → columns → items**, derived from menu-item nesting depth (`fw_ext_mega_menu_is_mm_item()` / `fw_ext_mega_menu_item_type()`):

| Level | Type key | Role |
|-------|----------|------|
| 1 | `row` | The top-level trigger item whose sub-tree becomes the dropdown panel. Only a first-level item (parent = 0) can carry the "Use as Mega Menu" flag. |
| 2 | `column` | A direct child = one column of the panel. "Start a new row" breaks the column grid onto a fresh row. |
| 3+ | `item` | A link (or icon/image/subtitle/badge) inside a column. |
| 0 | `default` | An ordinary (non-mega) menu item. |

**Where data is stored** (both on the `nav_menu_item` post):
- **Hardcoded flags** (`enabled`, `title-off`, `new-row`, legacy `icon`) — via `fw_ext_mega_menu_update_meta()` / `_fw_ext_mega_menu_meta`.
- **"Settings" modal values** — via `FW_Db_Options_Model_MegaMenu` under a **theme-scoped** post-meta key `fw:ext:mm:io:<template-basename>` (so switching themes never collides). Shape: `{ type: 'row'|'column'|'item'|'default', <leaf option ids…> }`. Leaf ids are stable, so saved values round-trip with no migration.

**Rendering:** on the front end `FW_Ext_Mega_Menu_Walker` reads those values and emits classes (`menu-item-has-mega-menu`, `mega-menu-col`, `menu-item-has-icon`, `mm-col-1-3`, `mm-col-align-center`, …) plus inline styles; the `walker_nav_menu_start_el` filter injects icons, the item description (`.mega-menu-desc`), and column content payloads. A baseline stylesheet drives everything from a `--mm-*` custom-property contract, so a host theme can restyle every panel site-wide. The parent theme exposes this under **Theme Settings → Header → Menu / Mega Menu** (base font size, full-width vs boxed panel) — see [../theme-settings-reference.md](../theme-settings-reference.md). Rich-content columns run `do_shortcode()`, so any builder shortcode ([../shortcodes/README.md](../shortcodes/README.md)) can appear inside a panel. Option types below are documented in [../option-types/](../option-types/).

## Shared Icon options (every level)

Added to `row` / `column` / `item` / `default` by `fw_ext_mega_menu_icon_options()`:

| key | type | default | value shape / choices | what it does |
|-----|------|---------|-----------------------|--------------|
| `icon` | `icon-v2` | `''` | icon-v2 array (font / emoji / svg / upload) | Optional icon shown with the link. Filter the type via `fw:ext:megamenu:icon-option`. |
| `icon_position` | `image-picker` | `'left'` | `left` \| `right` \| `stacked-left` \| `stacked-right` | Where the icon sits relative to the link text. |

## Row options (`row` — the dropdown panel)

| key | type | default | value shape / choices | what it does |
|-----|------|---------|-----------------------|--------------|
| `dropdown_width` | `select` | `'default'` | `default` \| `full-width` \| `custom` | Panel width: theme default, viewport-wide, or a custom value. |
| `dropdown_custom_width` | `text` | `''` | e.g. `800px`, `90%` | Custom width (shown only when `dropdown_width = custom`). |
| `bg_color` | compact color preset | `{predefined:'',custom:''}` | `{ predefined, custom }` (`bg` kind) | Panel background color. |
| `bg_image` | `upload` | `''` | attachment array / url | Panel background image. |
| `bg_position` | `select` | `'center center'` | 9 CSS positions | Background position. |
| `bg_repeat` | `select` | `'no-repeat'` | `no-repeat` \| `repeat` \| `repeat-x` \| `repeat-y` | Background repeat. |
| `extra_class` | `text` | `''` | class string | Added to the `.mega-menu` panel container. |

## Column options (`column` — depth 1)

| key | type | default | value shape / choices | what it does |
|-----|------|---------|-----------------------|--------------|
| `width` | `image-picker` | `'auto'` | `auto` \| `1/2` \| `1/3` \| `2/3` \| `1/4` \| `3/4` \| `1/5` \| `1/6` | Column width fraction inside its row (`auto` = equal share). Emits `mm-col-<w>`. |
| `align` | `select` | `''` | `''` \| `left` \| `center` \| `right` | Text alignment (emits `mm-col-align-*`). |
| `bg_color` | compact color preset | `{predefined:'',custom:''}` | `{ predefined, custom }` (`bg`) | Column background color. |
| `bg_image` | `upload` | `''` | attachment array / url | Column background image. |
| `bg_position` | `select` | `'center center'` | 9 CSS positions | Background position. |
| `bg_size` | `select` | `'auto'` | `auto` \| `cover` \| `contain` | Background size. |
| `bg_repeat` | `select` | `'no-repeat'` | `no-repeat` \| `repeat` \| `repeat-x` \| `repeat-y` | Background repeat. |
| `content_type` | `select` | `'links'` | `links` \| `image` \| `content` \| `widget` \| `raw` | What the column holds. Non-`links` renders in place of the sub-menu (add the column with no child items). |
| `content_image` | `upload` | `''` | attachment array / url | Image (when `content_type = image`). |
| `content_image_link` | `text` | `''` | URL | Optional link wrapping the image (external → new tab). |
| `content_image_alt` | `text` | `''` | string | Image alt text. |
| `content_html` | `textarea` | `''` | HTML + shortcodes | Rich content (when `content_type = content`); run through `wpautop` + `do_shortcode`. |
| `content_widget_area` | `select` | `''` | registered sidebar id | Widget area to output (when `content_type = widget`). |
| `content_raw` | `textarea` | `''` | raw HTML (shortcodes still run) | Raw HTML (when `content_type = raw`); trusted markup only. |
| `extra_class` | `text` | `''` | class string | Added to this column `<li>`. |

## Item options (`item` — depth 2+)

| key | type | default | value shape / choices | what it does |
|-----|------|---------|-----------------------|--------------|
| `item_image` | `upload` | `''` | attachment array / url | Optional thumbnail beside the link (product/feature-nav style). |
| `item_subtitle` | `text` | `''` | string | Secondary line beneath the link label. |
| `badge_text` | `text` | `''` | string | Small label next to the link (e.g. "New"). Empty = none. |
| `badge_color` | compact color preset | `{predefined:'',custom:''}` | `{ predefined, custom }` (`bg`) | Badge background color. |
| `extra_class` | `text` | `''` | class string | Added to this item. |

## Default options (`default` — ordinary non-mega items)

Only the shared **Icon** group plus `extra_class` (`text`, default `''`).

## Value-shape example

A panel (row) with one row of two columns, first column two link items, second column an image:

```json
{
  "row-item-101": { "type": "row",
    "dropdown_width": "custom", "dropdown_custom_width": "900px",
    "bg_color": { "predefined": "bg-light", "custom": "" } },

  "col-item-201": { "type": "column",
    "width": "1/2", "align": "left",
    "icon": { "type": "icon-font", "icon-class": "fa-solid fa-layer-group" }, "icon_position": "left" },
  "item-301": { "type": "item", "item_subtitle": "Everything in one place", "badge_text": "New",
    "badge_color": { "predefined": "bg-primary", "custom": "" } },
  "item-302": { "type": "item" },

  "col-item-202": { "type": "column",
    "width": "1/2", "content_type": "image",
    "content_image": { "url": "/wp-content/uploads/promo.jpg" },
    "content_image_link": "https://example.com/promo", "content_image_alt": "Promo" }
}
```

(Each object is the per-item meta on that nav-menu item; the `-` separator in `mm-col-1/2 → mm-col-1-2` happens at render time.)

## Notes / gotchas

- **Popup sizes** (`config.php`): every level's Settings modal is **`medium`** (`item-options:popup-size:{row,column,item,default}`) — sized to fit the 4-tile Icon-Position picker on one row plus the column content editors. Options are `small` / `medium` / `large`.
- **Only a first-level item** (parent = 0) can be flagged "Use as Mega Menu"; deeper items ignore a stale flag.
- **Colors** use the compact preset picker (`sc_color_field_compact`, `bg` kind) when the shortcodes extension is active, falling back to a raw `color-picker` otherwise; both resolve through `fw_ext_mega_menu_color_to_css()` (preset → `var(--color-<slug>)`, else custom hex, legacy plain string tolerated).
- **Legacy icons** saved by the retired standalone "Edit Icon" control are still read as a fallback (`fw_ext_mega_menu_item_icon`), so nothing is lost.
- **Content columns** run `do_shortcode()` (rich/raw) or `dynamic_sidebar()` (widget); external image links get `target="_blank" rel="noopener noreferrer"` automatically.
- **Public filters:** `fw:ext:megamenu:frontend-config` (hover vs click), `fw:ext:megamenu:enqueue-frontend-css` / `:enqueue-icon-css` (opt out of baseline CSS), `fw:ext:megamenu:icon-option` (swap the icon type), `fw:ext:megamenu:label:item-options-btn`, `fw:ext:megamenu:items-options:meta-name`, `fw:ext:megamenu:start_el_item_content:disable`.
- The frontend JS detects a host off-canvas drawer and steps aside so it never double-binds the mobile toggle.
