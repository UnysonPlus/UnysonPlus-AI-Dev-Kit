# `nav_menu` — Navigation Menu

Renders a WordPress menu (by theme location or a specific menu) inside a `<nav>` — built for the Header/Footer builder but usable in any content. Leaf node: `{ type:'simple', shortcode:'nav_menu', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `menu_source` | multi-picker | `{type:'location',location:{menu_location:''}}` | `type`: `location` \| `menu` | Which menu to render. `location` reveals `menu_location`; `menu` reveals `menu_id`. |
| `menu_location` | select | `''` | registered theme locations | A menu assigned to this theme location (Appearance → Menus). Used when `type` = `location`. |
| `menu_id` | select | `''` | menu term IDs | A specific menu regardless of location. Used when `type` = `menu`. |
| `orientation` | select | `'horizontal'` | `horizontal` `vertical` | Layout axis → class `primary-menu--{orientation}`. |
| `submenu_style` | select | `'dropdown'` | `dropdown` `mega` `accordion` | How sub-menus open. Dropdown/Mega suit horizontal; Accordion suits vertical/off-canvas. |
| `depth` | select | `'0'` | `0` (all) `1` `2` `3` | Maximum menu depth. |
| `alignment` | select | `''` | `''` `start` `center` `end` `justified` | Menu item alignment → `nav-align-{x}`. |

## Ready-to-use example (the atts object)
```json
{
  "menu_source": { "type": "location", "location": { "menu_location": "primary" }, "menu": { "menu_id": "" } },
  "orientation": "horizontal",
  "submenu_style": "dropdown",
  "depth": "0",
  "alignment": "end"
}
```

## Notes
- `menu_source` is a **multi-picker**: the saved shape carries the picker key (`type`) plus a sub-object per choice (`location` → `{menu_location}`, `menu` → `{menu_id}`). Include both sub-objects; only the one matching `type` is read.
- `menu_location` choices come from the active theme's registered nav locations; `menu_id` choices are existing menus (term IDs as strings). Leave the unused one `''`.
- Reuses the theme's `.primary-menu` / `.menu-item-has-children` contract, so the theme's `navigation.js` drives dropdowns / accordion / off-canvas with no extra JS.
- Renders nothing when the chosen location/menu is empty or missing (`fallback_cb=false`).
- `mega` / `accordion` add class hooks (`submenu-mega`, `has-mega`, `submenu-accordion`); full styling ships with the header types.
