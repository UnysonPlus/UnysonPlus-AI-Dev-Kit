# Theme Settings — Site-wide UX

The **Site-wide UX** tab consolidates global chrome/UX affordances: Dark Mode, Preloader, Scrolling, and the Scroll-to-Top button. Each option is enumerated with all valid values.

Compact color controls (`sc_color_field_compact`) save as `{ predefined: '<text-slug>|<bg-slug>', custom: '#hex' }`; empty = inherit/theme default. Preset slugs come from the live palette (see the Colors doc).

> When the Animation Engine extension is active it registers its own richer Site-wide UX tab (Cursor, Page Transitions, Scroll Progress, Preloader) and only the theme's unique sub-tabs (Scrolling, Scroll to Top) are injected; storage keys are unchanged either way.

---

# Dark Mode — `misc_dark_mode`

Floating light/dark/auto toggle. Stored under the `misc_dark_mode` multi key. Uses Bootstrap 5.3 `data-bs-theme`.

### Enable — `dark_mode_enable`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | (on) |
| no | (off) |

- **Notes**: this is a bare switch (no custom left/right-choice), so the saved value is the string `'yes'` or `'no'`.

### Default mode — `dark_mode_default`
- **Type**: radio · **Default**: `auto`
- **Choices**:

| value | label |
|---|---|
| auto | Auto (follow system preference) |
| light | Light |
| dark | Dark |

### Toggle button position — `dark_mode_position`
- **Type**: radio · **Default**: `bottom-left`
- **Choices**:

| value | label |
|---|---|
| bottom-left | Bottom-left |
| bottom-right | Bottom-right |
| top-left | Top-left |
| top-right | Top-right |

### Show text label — `dark_mode_show_label`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | (on) |
| no | (off) |

- **Notes**: bare switch, saved value is the string `'yes'`/`'no'`. Shows "Light"/"Dark"/"Auto" text beside the icon.

---

# Preloader — `general_preloader`

Full-screen loading splash. Stored under the `general_preloader` multi key (group `group_preloader`).

### Preloader — `layout_preloader_style`
- **Type**: image-picker · **Default**: `none`
- **Choices**:

| value | label (svg) |
|---|---|
| none | None |
| spinner | Spinner |
| logo | Logo |

### Preloader Background — `layout_preloader_bg_color`
- **Type**: compact color (kind bg) · **Default**: empty (fallback `#ffffff` if helper missing) · **Saved shape**: `{ predefined, custom }`
- **Notes**: only applies when Preloader != None.

---

# Scrolling — `general_scroll`

Scroll polish. Stored under the `general_scroll` multi key (group `group_scroll`).

### Smooth Scroll for Anchor Links — `layout_smooth_scroll`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | Yes |
| no | No |

- **Notes**: enables CSS `scroll-behavior: smooth` for in-page anchors.

### Scroll Progress Bar — `layout_scroll_progress`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | Yes |
| no | No |

- **Notes**: thin gradient bar at top of viewport.

### Scroll Progress Bar Color — `layout_scroll_progress_color`
- **Type**: compact color (kind bg) · **Default**: empty (fallback `#0d6efd`) · **Saved shape**: `{ predefined, custom }`
- **Notes**: only applies when the bar is enabled.

---

# Scroll to Top — `misc_scroll_top`

Floating scroll-to-top button. Stored under the `misc_scroll_top` multi key.

### Enable — `scroll_top_enable`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | (on) |
| no | (off) |

- **Notes**: bare switch, saved value string `'yes'`/`'no'`.

### Position — `scroll_top_position`
- **Type**: radio · **Default**: `right`
- **Choices**:

| value | label |
|---|---|
| right | Bottom-right |
| left | Bottom-left |

### Design — `scroll_top_design`
- **Type**: select · **Default**: `rounded`
- **Choices**:

| value | label |
|---|---|
| rounded | Rounded (default) |
| circle | Circle |
| square | Square |
| pill | Pill |
| outline | Outline |
| ring | Progress Ring |

- **Notes**: Circle, Square and Progress Ring are icon-only (label hidden). Progress Ring fills as you scroll.

### Size — `scroll_top_size`
- **Type**: select · **Default**: `medium`
- **Choices**:

| value | label |
|---|---|
| small | Small |
| medium | Medium |
| large | Large |

### Show after scrolling — `scroll_top_offset`
- **Type**: unit-input (units: px, vh) · **Default**: `{ value:'300', unit:'px' }` · min 0
- **Notes**: px = absolute distance; vh = fraction of screen height (100vh = one screen).

### Button label — `scroll_top_text`
- **Type**: text · **Default**: `''`
- **Notes**: optional text beside the arrow; empty = icon-only.

### Background color — `scroll_top_bg_color`
- **Type**: compact color (kind bg) · **Default**: empty · **Saved shape**: `{ predefined, custom }`

### Icon / text color — `scroll_top_text_color`
- **Type**: compact color (kind text) · **Default**: empty (fallback `#ffffff`) · **Saved shape**: `{ predefined, custom }`
