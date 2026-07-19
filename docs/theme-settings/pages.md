# Theme Settings — Pages

Global page defaults under **Theme Settings → Pages** (layout, hero header, header/footer presets) plus the **per-page** and **per-post** meta-box overrides. Globals are read via `unysonplus_pages_get()` (`inc/includes/layout.php`); the layout cascade is: per-page meta → template → these globals → per-context/site defaults.

## Presets

### Page Presets — `pages_presets`
- **Type**: preset-loader (`preset_group: general_pages`)
- **Default**: none
- **Choices**: Standard, Sidebar, Full-Width Landing, Docs, Boxed Editorial (or upload exported JSON)
- **Notes**: One-click whole-page default; fine-tune under Defaults.

## Layout — `pages_layout` (multi → group `group_pages_layout`)

Site-wide page layout defaults. Both use image-picker diagram tiles; stored value is the plain choice key.

### Default Sidebar — `default_sidebar`
- **Type**: image-picker
- **Default**: `inherit`
- **Choices**:

| value | label |
|---|---|
| `inherit` | Global / Inherit (site default) |
| `none` | No sidebar |
| `left` | Left |
| `right` | Right |

- **Notes**: "Global" falls back to the Default Page Layout / site-wide sidebar.

### Default Content Width — `default_content_width`
- **Type**: image-picker
- **Default**: `default`
- **Choices**:

| value | label |
|---|---|
| `default` | Global (theme container) |
| `narrow` | Narrow |
| `wide` | Wide |
| `full` | Full |

## Page Title / Hero — `pages_hero` (multi → group `group_pages_hero`)

Site-wide default Hero banner. A per-page Hero (Page Settings) overrides these.

### Default Hero Image — `default_page_header_image`
- **Type**: upload
- **Default**: `[]` (none)
- **Saved value shape**: WP attachment array `{ attachment_id, url, … }` (empty `[]` = no hero)

### Default Hero Height — `default_page_header_height`
- **Type**: radio
- **Default**: `auto`
- **Choices**:

| value | label |
|---|---|
| `auto` | Auto |
| `small` | Small (220px) |
| `medium` | Medium (380px) |
| `large` | Large (560px) |
| `fullscreen` | Fullscreen (100vh) |

### Default Title Position — `default_hero_align`
- **Type**: select
- **Default**: `center`
- **Choices**:

| value | label |
|---|---|
| `top` | Top |
| `center` | Center |
| `bottom` | Bottom |

### Default Overlay Color — `default_hero_overlay_color`
- **Type**: `predefined-colors-color-picker-compact` (`kind: bg`, `rgba-color-picker`); falls back to `rgba-color-picker` if the shortcodes helper is absent
- **Default**: none
- **Saved value shape**: `{ predefined: 'bg-<slug>', custom: '<rgba/hex>' }` (preset wins; tolerates legacy string)

### Default Overlay Opacity — `default_hero_overlay_opacity`
- **Type**: slider (min 0, max 100, step 5)
- **Default**: `0`
- **Notes**: 0 = transparent, 100 = opaque. Only used when an Overlay Color is set.

## Defaults (Header / Footer & Elements) — `general_pages` (multi)

Site-wide defaults for every "page". Per-content selections still override these.

### Site-Wide Header Preset — `default_header_preset`
- **Type**: select
- **Default**: `` (Default — Theme Settings header)
- **Choices**:

| value | label |
|---|---|
| `` | Default (Theme Settings header) |
| `<preset-id>` | *(dynamic — each saved Header Preset via `unysonplus_preset_choices('up_header')`)* |

- **Notes**: Choices beyond the empty default are the user's saved Header Presets; enumerate live if you need exact ids.

### Site-Wide Footer Preset — `default_footer_preset`
- **Type**: select
- **Default**: `` (Default — Theme Settings footer)
- **Choices**:

| value | label |
|---|---|
| `` | Default (Theme Settings footer) |
| `<preset-id>` | *(dynamic — each saved Footer Preset via `unysonplus_preset_choices('up_footer')`)* |

### Default Page Layout — `default_page_layout`
- **Type**: select
- **Default**: `default`
- **Choices**:

| value | label |
|---|---|
| `default` | Default (no sidebar) |
| `sidebar-right` | Right Sidebar |
| `sidebar-left` | Left Sidebar |
| `full-width` | Full Width |
| `boxed-narrow` | Boxed Narrow |

- **Notes**: Which named template `page.php` behaves like; per-page Template still wins.

### Show Breadcrumbs on Pages — `pages_show_breadcrumbs`
- **Type**: switch
- **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| `yes` | Yes |
| `no` | No |

### Show Featured Image on Pages — `pages_show_featured_image`
- **Type**: switch
- **Default**: `yes`
- **Choices**:

| value | label |
|---|---|
| `yes` | Yes |
| `no` | No |

## Per-Page overrides — `page_options` (multi, Page Settings meta box)

**Per-page meta, NOT global.** Set on an individual page; overrides the globals above.

### Body Class — `body_class`
- **Type**: text
- **Default**: none
- **Notes**: CSS class added to the `<body>` tag. (This is currently the only active per-page field; hide-title / footer-scripts fields are commented out.)

## Per-Post overrides — `post_options` (multi, Post Settings meta box)

**Per-post meta, NOT global.** Mirrors the Blog → Single Post globals; every control defaults to `default` = "Global" (inherit the matching Blog → Single Post setting). Resolved via `unysonplus_single_enabled()` — per-post wins unless left on Global.

Most controls are a 3-way toggle select with these choices:

| value | label |
|---|---|
| `default` | Global |
| `show` | Show |
| `hide` | Hide |

### Header Style — `post_header_style`
- **Type**: select
- **Default**: `default`
- **Choices**:

| value | label |
|---|---|
| `default` | Global |
| `standard` | Standard (title above content) |
| `hero` | Hero (title over featured image) |

### Reading Progress Bar — `post_progress_bar`
- **Type**: select (3-way toggle)
- **Default**: `default`
- **Choices**: `default` = Global, `show` = Show, `hide` = Hide

### Sidebar — `post_sidebar`
- **Type**: select
- **Default**: `default`
- **Choices**:

| value | label |
|---|---|
| `default` | Global |
| `none` | No sidebar |
| `left` | Left |
| `right` | Right |

### Featured Image — `post_featured_image`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Author Box — `post_author_box`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Breadcrumbs — `post_breadcrumbs`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Table of Contents — `post_toc`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Share Buttons — `post_share`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Tag Row — `post_tags`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Comments — `post_comments`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Related Posts — `post_related`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`

### Previous / Next Navigation — `post_nav`
- **Type**: select (3-way toggle) — `default` / `show` / `hide`
- **Default**: `default`
