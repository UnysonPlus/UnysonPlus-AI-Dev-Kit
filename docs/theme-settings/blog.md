# Theme Settings — Blog

Global blog defaults under **Theme Settings → Blog** (posts listing, single post, archives/search, card design). Read at runtime via `unysonplus_blog_get()` / `unysonplus_single_get()` / `unysonplus_archive_get()` (`inc/includes/blog.php`); every Single Post toggle is overridable per-post via the Post Settings meta box (`post_options`).

## Presets

### Blog Presets — `blog_presets`
- **Type**: preset-loader (`preset_group: blog_index`)
- **Default**: none
- **Choices**: whole-blog presets — Classic List, Grid Cards, Magazine, Minimal, Editorial (or upload exported JSON)
- **Notes**: One-click starting look; fine-tune under Blog Index afterward.

### Card Design — `blog_card_presets`
- **Type**: preset-loader (`preset_group: blog_card`)
- **Default**: none
- **Choices**: Soft, Sharp, Floating, Flat, Framed
- **Notes**: Tunes radius/shadow/padding/hover on top of the Blog Index card style.

## Blog Index — `blog_index` (multi)

Stored as one `multi`; keys below are the inner-option ids.

### Layout — `blog_layout`
- **Type**: radio
- **Default**: `list`
- **Choices**:

| value | label |
|---|---|
| `list` | List (stacked) |
| `grid` | Grid |
| `masonry` | Masonry |

### Columns — `blog_columns`
- **Type**: select
- **Default**: `2`
- **Choices**:

| value | label |
|---|---|
| `1` | 1 |
| `2` | 2 |
| `3` | 3 |
| `4` | 4 |

- **Notes**: For Grid / Masonry only.

### Card Style — `blog_card_style`
- **Type**: select
- **Default**: `plain`
- **Choices**:

| value | label |
|---|---|
| `plain` | Plain (no container) |
| `boxed` | Boxed (background + shadow) |
| `bordered` | Bordered (outline) |
| `overlay` | Overlay (text over image) |

### Featured Image — `blog_featured_image`
- **Type**: switch
- **Default**: `yes`
- **Choices**:

| value | label |
|---|---|
| `yes` | Show |
| `no` | Hide |

### Image Ratio — `blog_image_ratio`
- **Type**: select
- **Default**: `16-9`
- **Choices**:

| value | label |
|---|---|
| `original` | Original |
| `16-9` | 16:9 |
| `4-3` | 4:3 |
| `1-1` | 1:1 (square) |

### Image Hover — `blog_image_hover`
- **Type**: select
- **Default**: `zoom`
- **Choices**:

| value | label |
|---|---|
| `none` | None |
| `zoom` | Zoom in |
| `lift` | Lift (raise card) |

### Category Badge — `blog_category_badge`
- **Type**: switch
- **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| `yes` | Show |
| `no` | Hide |

- **Notes**: Overlays primary category as a pill on the featured image.

### Post Content — `blog_content`
- **Type**: radio
- **Default**: `excerpt`
- **Choices**:

| value | label |
|---|---|
| `excerpt` | Excerpt |
| `full` | Full content |

### Excerpt Length (words) — `blog_excerpt_length`
- **Type**: short-text
- **Default**: `30`

### Post Meta — `blog_meta`
- **Type**: checkboxes
- **Default**: `{ date: true, author: true, category: true, comments: false, reading_time: false }`
- **Choices**:

| value | label |
|---|---|
| `date` | Date |
| `author` | Author |
| `category` | Category |
| `comments` | Comment count |
| `reading_time` | Reading time |

- **Saved value shape**: `{ <key>: true|false, … }` for each choice.

### Meta Position — `blog_meta_position`
- **Type**: radio
- **Default**: `below-title`
- **Choices**:

| value | label |
|---|---|
| `below-title` | Below title |
| `above-title` | Above title |

### Read More Text — `blog_read_more`
- **Type**: text
- **Default**: `Read more`

### Highlight Sticky Posts — `blog_sticky_highlight`
- **Type**: switch
- **Default**: `yes`
- **Choices**:

| value | label |
|---|---|
| `yes` | Yes |
| `no` | No |

### Feature First Post — `blog_first_featured`
- **Type**: switch
- **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| `yes` | Yes |
| `no` | No |

- **Notes**: Makes first post full-width/larger (magazine hero). Grid / Masonry only.

### Posts Per Page — `blog_posts_per_page`
- **Type**: short-text
- **Default**: `` (empty)
- **Notes**: Blank = use Settings → Reading.

### Pagination — `blog_pagination`
- **Type**: radio
- **Default**: `numbers`
- **Choices**:

| value | label |
|---|---|
| `numbers` | Numbered |
| `prev_next` | Older / Newer |
| `load_more` | Load More button |

## Card Design — `blog_card` (multi)

Fine tuning applied on top of the Blog Index Card Style (reads best on Boxed / Bordered). Emitted as `--post-card-*` CSS custom properties.

### Corner Radius — `blog_card_radius`
- **Type**: select
- **Default**: `md`
- **Choices**:

| value | label |
|---|---|
| `none` | Square (0) |
| `sm` | Small |
| `md` | Medium |
| `lg` | Large |
| `xl` | Extra large |

### Shadow Depth — `blog_card_shadow`
- **Type**: select
- **Default**: `sm`
- **Choices**:

| value | label |
|---|---|
| `none` | None |
| `sm` | Subtle |
| `md` | Medium |
| `lg` | Deep |

### Inner Padding — `blog_card_padding`
- **Type**: select
- **Default**: `normal`
- **Choices**:

| value | label |
|---|---|
| `compact` | Compact |
| `normal` | Normal |
| `roomy` | Roomy |

### Accent Border on Hover — `blog_card_hover_accent`
- **Type**: switch
- **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| `yes` | Yes |
| `no` | No |

## Single Post → Header & Hero — `blog_single_hero` (multi)

### Header Style — `single_header_style`
- **Type**: radio
- **Default**: `standard`
- **Choices**:

| value | label |
|---|---|
| `standard` | Standard (title above content) |
| `hero` | Hero (title over featured image) |

### Hero Height — `single_hero_height`
- **Type**: radio
- **Default**: `medium`
- **Choices**:

| value | label |
|---|---|
| `small` | Small (300px) |
| `medium` | Medium (440px) |
| `large` | Large (600px) |
| `fullscreen` | Fullscreen (100vh) |

### Hero Content Position — `single_hero_align`
- **Type**: radio
- **Default**: `bottom`
- **Choices**:

| value | label |
|---|---|
| `top` | Top |
| `center` | Center |
| `bottom` | Bottom |

### Hero Overlay Color — `single_hero_overlay_color`
- **Type**: `predefined-colors-color-picker-compact` (`kind: bg`, `rgba-color-picker`); falls back to `color-picker` if the shortcodes helper is absent
- **Default**: none
- **Saved value shape**: `{ predefined: 'bg-<slug>', custom: '<rgba/hex>' }` (preset wins; tolerates legacy plain string)

### Hero Overlay Opacity — `single_hero_overlay_opacity`
- **Type**: slider (min 0, max 100, step 5)
- **Default**: `45`
- **Notes**: 0 = transparent, 100 = opaque.

### Reading Progress Bar — `single_progress_bar`
- **Type**: switch
- **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| `yes` | Show |
| `no` | Hide |

## Single Post → Content & Meta — `blog_single` (multi)

### Sidebar — `single_sidebar`
- **Type**: select
- **Default**: `inherit`
- **Choices**:

| value | label |
|---|---|
| `inherit` | Inherit (use global) |
| `none` | No sidebar |
| `left` | Left |
| `right` | Right |

### Featured Image — `single_featured_image`
- **Type**: switch
- **Default**: `yes`
- **Choices**:

| value | label |
|---|---|
| `yes` | Show |
| `no` | Hide |

### Featured Image Position — `single_featured_position`
- **Type**: radio
- **Default**: `below-title`
- **Choices**:

| value | label |
|---|---|
| `above-title` | Above title |
| `below-title` | Below title |

### Post Meta — `single_meta`
- **Type**: checkboxes
- **Default**: `{ date: true, author: true, category: true, tags: false, comments: false, reading_time: false }`
- **Choices**:

| value | label |
|---|---|
| `date` | Date |
| `author` | Author |
| `category` | Category |
| `tags` | Tags |
| `comments` | Comment count |
| `reading_time` | Reading time |

- **Saved value shape**: `{ <key>: true|false, … }`.

### Author Box — `single_author_box`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

### Related Posts — `single_related`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

### Related Posts Count — `single_related_count`
- **Type**: select
- **Default**: `3`
- **Choices**:

| value | label |
|---|---|
| `2` | 2 |
| `3` | 3 |
| `4` | 4 |

### Relate By — `single_related_by`
- **Type**: radio
- **Default**: `category`
- **Choices**:

| value | label |
|---|---|
| `category` | Shared category |
| `tag` | Shared tag |

### Related Posts Style — `single_related_style`
- **Type**: select
- **Default**: `grid`
- **Choices**:

| value | label |
|---|---|
| `grid` | Grid (cards) |
| `list` | List (rows) |
| `carousel` | Carousel (scroll) |

### Related Image Ratio — `single_related_ratio`
- **Type**: select
- **Default**: `16-9`
- **Choices**:

| value | label |
|---|---|
| `16-9` | 16:9 |
| `4-3` | 4:3 |
| `1-1` | 1:1 (square) |

### Previous / Next Navigation — `single_post_nav`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

## Single Post → Elements — `blog_single_extras` (multi)

### Breadcrumbs — `single_breadcrumbs`
- **Type**: switch
- **Default**: `no`
- **Choices**: `yes` = Show, `no` = Hide

### Table of Contents — `single_toc`
- **Type**: switch
- **Default**: `no`
- **Choices**: `yes` = Show, `no` = Hide
- **Notes**: Auto-built from post H2 / H3 headings.

### Table of Contents Title — `single_toc_title`
- **Type**: text
- **Default**: `In this article`

### Share Buttons — `single_share`
- **Type**: switch
- **Default**: `no`
- **Choices**: `yes` = Show, `no` = Hide

### Share Buttons Position — `single_share_position`
- **Type**: select
- **Default**: `bottom`
- **Choices**:

| value | label |
|---|---|
| `top` | Above content |
| `bottom` | Below content |
| `both` | Above and below |

### Share Networks — `single_share_networks`
- **Type**: checkboxes
- **Default**: `{ x: true, facebook: true, linkedin: true, copy: true }`
- **Choices**:

| value | label |
|---|---|
| `x` | X (Twitter) |
| `facebook` | Facebook |
| `linkedin` | LinkedIn |
| `whatsapp` | WhatsApp |
| `copy` | Copy link |

- **Saved value shape**: `{ <key>: true|false, … }`.

### Tag Row — `single_tags`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

### Comments — `single_comments`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide
- **Notes**: Still respects WordPress per-post "Allow comments".

## Archives & Search — `blog_archives` (multi)

Defaults for category/tag/author/date archives (`archive.php`) and search (`search.php`). "Inherit" reuses Blog Index.

### Archive Header — `archive_header`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

### Term Description — `archive_show_description`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

### Author Bio (author archives) — `archive_author_bio`
- **Type**: switch
- **Default**: `yes`
- **Choices**: `yes` = Show, `no` = Hide

### Archive Layout — `archive_layout`
- **Type**: select
- **Default**: `inherit`
- **Choices**:

| value | label |
|---|---|
| `inherit` | Inherit (Blog Index) |
| `list` | List |
| `grid` | Grid |
| `masonry` | Masonry |

### Archive Columns — `archive_columns`
- **Type**: select
- **Default**: `` (Inherit)
- **Choices**:

| value | label |
|---|---|
| `` | Inherit |
| `1` | 1 |
| `2` | 2 |
| `3` | 3 |
| `4` | 4 |

### Archive Sidebar — `archive_sidebar`
- **Type**: select
- **Default**: `inherit`
- **Choices**:

| value | label |
|---|---|
| `inherit` | Inherit (use global) |
| `none` | No sidebar |
| `left` | Left |
| `right` | Right |

### Search Results Layout — `search_layout`
- **Type**: select
- **Default**: `inherit`
- **Choices**:

| value | label |
|---|---|
| `inherit` | Inherit (Blog Index) |
| `list` | List |
| `grid` | Grid |

### Search "No Results" Message — `search_empty_message`
- **Type**: text
- **Default**: `` (empty = default message)
