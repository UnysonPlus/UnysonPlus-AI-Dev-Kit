# Theme Settings → Portfolio

Display settings for the Portfolio extension's archive, cards and single-project view. **The tab exists only while the `portfolio` extension is active.** Values are stored in two multis — `portfolio_archive` and `portfolio_single` — and bridged into the extension through the `fw:ext:portfolio:setting` filter (`inc/includes/portfolio.php`): a saved value **overrides the extension's own Settings page**; `inherit` / empty defers to it. Read theme-side with `unysonplus_portfolio_get( $key, $default )` (both multis merged; returns `$default` for unset/empty/`inherit`).

## Presets (sub-tab)

`portfolio_presets` — a `preset-loader` on preset group **`portfolio_archive`**. Four persona presets (applied via AJAX onto the `portfolio_archive` multi, then fine-tuned under Archive & Cards): **Case Study (Designer)** — 2 columns, 32px gap, category + summary; **Gallery (Photographer)** — tight 12px gap, original ratios, no hover, no text, 24/page; **Cards (Developer)** — 16:9 cards with category + summary; **Showcase (Agency)** — overlay-caption hover, category, featured first. Export/upload JSON supported (keys whitelisted to the group).

## Archive & Cards (sub-tab) — multi `portfolio_archive`

| id | type | default | choices | notes |
|---|---|---|---|---|
| `archive_columns` | select | `inherit` | `inherit` `1` `2` `3` `4` | Projects per row on archive/category pages. |
| `archive_per_page` | text | `''` | number ('' = inherit) | Projects per page before pagination. |
| `orderby` | select | `inherit` | `inherit` `date` `menu_order` `title` `rand` | |
| `order` | select | `inherit` | `inherit` `DESC` `ASC` | |
| `featured_first` | select | `inherit` | `inherit` `yes` `no` | Float Featured projects first. |
| `archive_filter_bar` | select | `inherit` | `inherit` `yes` `no` | Category filter links above the grid (real taxonomy URLs — crawlable, pagination-safe). |
| `archive_gap` | select | `24` | `0` `12` `16` `24` `32` `40` | Grid gap (px). |
| `archive_ratio` | select | `4-3` | `1-1` `4-3` `3-2` `16-9` `3-4` `auto` | Card image ratio (`auto` = original proportions). |
| `archive_hover` | select | `zoom` | `zoom` `overlay` `grayscale` `none` | Card hover style (`overlay` slides the caption over the image; touch-safe). |
| `card_show_category` | switch | `no` | `yes`/`no` | Category label above card titles. |
| `card_show_summary` | switch | `yes` | `yes`/`no` | The project's Short Summary line on cards. |

## Single Project (sub-tab) — multi `portfolio_single`

| id | type | default | choices | notes |
|---|---|---|---|---|
| `show_gallery_single` | select | `inherit` | `inherit` `yes` `no` | Project gallery above the content. |
| `single_columns` | select | `inherit` | `inherit` `1`–`6` | Gallery grid columns. |
| `show_meta_single` | select | `inherit` | `inherit` `yes` `no` | Project Details list. |
| `enable_prevnext` | select | `inherit` | `inherit` `yes` `no` | Previous/next navigation. |
| `prevnext_same_category` | select | `inherit` | `inherit` `yes` `no` | Constrain prev/next to the same category. |
| `enable_related` | select | `inherit` | `inherit` `yes` `no` | Related projects row. |
| `related_count` | text | `''` | number ('' = inherit) | |
| `related_heading` | text | `''` | text ('' = inherit) | |

## Notes

- `archive_gap` / `archive_ratio` / `archive_hover` / `card_show_category` / `card_show_summary` have **no extension-side field** — the extension reads them via `get_setting()` code defaults; the theme's values arrive purely through the filter bridge.
- Data-level portfolio options (galleries on/off, project-details fields, tags, permalink slugs) stay on the extension's own Settings page and the WP Permalinks screen — this tab is display only.
