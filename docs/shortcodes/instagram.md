<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `instagram` — Instagram Feed

An Instagram profile header (picture, name, @handle, Follow button) above the profile's posts, as a
**grid** or a **paged slider** with arrows. Leaf node: `{ type:'simple', shortcode:'instagram', _items:[], atts:{…} }`.
Builder tab: **Media Elements**. **Shortcodes Library element, not bundled in core** (v2.0.0, source
`UnysonPlus-Library/shortcodes/instagram/`): installed from Unyson+ → Shortcodes → Shortcodes Library →
*Install* (into the active theme's `framework-customizations/extensions/shortcodes/shortcodes/instagram/`), or
the `instagram.zip` via *Upload a .zip*. A site without it rejects `instagram` items. **v1 pages keep
working:** with no `source` and a flat `access_token`/`username`, the view maps the v1 atts (`count`,
`columns`, `gap` as a Gap Scale slug, `aspect.ratio`, `rounding`, `max_width`, `align`, `hover_zoom`,
`link_to_post`, `new_tab`) onto v2 (account source, grid, no frame).

Two sources (`source/mode`):

- **`account`** — the latest posts of a connected Instagram **Business or Creator** account, from the
  Instagram API (Instagram Login) with a long-lived access token. Personal accounts cannot share posts
  with any API. The site stores the profile, the post list and a resized copy of every image, refreshes
  them in the background, keeps the last good copy if Instagram fails, and refreshes the token itself.
- **`manual`** — images picked from the Media Library, each with a link and a post-type icon. No
  connection needed. Use it when the account is personal, or no token is available yet.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | multi-picker | `{mode:'account'}` | `source/mode`: `account` \| `manual` | Where the posts come from. |
| `source/account/access_token` | password | `''` | string | Long-lived Instagram User token (Business/Creator). Never printed on the page. |
| `source/account/cache_hours` | select | `'6'` | `1` `3` `6` `12` `24` | How long a fetched copy stays fresh before a background refresh. |
| `source/manual/posts` | addable-popup | `[]` | `[{ image:{attachment_id,url}, link, kind:'image'\|'video'\|'album', alt }]` | Chosen tiles, in order. Empty `link` → profile link. |
| `show_header` | switch | `'yes'` | `yes` \| `no` | Profile header. |
| `profile_handle` | text | `''` | `handle` or `@handle` | Builds `https://www.instagram.com/<handle>/` for header + Follow. Account mode fills it when empty. |
| `profile_name` | text | `''` | string | Display name. Empty → account name, else the handle. |
| `profile_avatar` | upload | `''` | `{attachment_id,url}` | Picture. Empty → the account's own (account mode). |
| `follow_label` | text | `'Follow'` | string | Button text; empty hides the button. |
| `button_preset` | button-style-picker | `''` | `''` \| `btn-<slug> [btn-<size>]` | None = Instagram-blue button; a preset = the site's `.btn` classes. |
| `layout` | select | `'slider'` | `grid` \| `slider` | All posts at once, or horizontal pages with arrows. |
| `count` | select | `'16'` | `4` `6` `8` `9` `12` `16` `20` `24` | Posts shown. |
| `rows` | select | `'2'` | `1` `2` `3` | Slider: rows per page. |
| `columns` / `columns_tablet` / `columns_mobile` | select | `'4'` / `'3'` / `'2'` | `1`–`6` | Columns per breakpoint (tablet ≤ 991px, phone ≤ 599px). |
| `ratio` | select | `'1-1'` | `1-1` \| `4-5` \| `9-16` | Tile shape. |
| `gap` | select | `'0'` | `0` `2` `6` `12` `20` | Pixels between tiles (v1 Gap Scale slugs still resolve). |
| `rounding` | select | `'none'` | `none` `small` `medium` `large` | Tile corners. |
| `max_width` / `align` | unit-input / select | empty / `'center'` | `{value,unit}` / `left` `center` `right` | Optional maximum width and its alignment. |
| `show_type_icon` | switch | `'yes'` | `yes` \| `no` | Reel / album icon in the tile corner. |
| `hover` | select | `'zoom'` | `zoom` \| `darken` \| `none` | Tile hover. |
| `new_tab` | switch | `'yes'` | `yes` \| `no` | Open Instagram links in a new tab. |
| `frame` | switch | `'yes'` | `yes` \| `no` | White panel behind the header. |
| + Animations / Advanced | — | — | `sc_get_animation_fields()` / `sc_get_advanced_tab()` | Standard tabs. |

## Ready-to-use example (the atts object)
```json
{
  "source": { "mode": "manual", "manual": { "posts": [
    { "image": { "attachment_id": "13", "url": "https://example.com/sunset.jpg" }, "link": "https://www.instagram.com/p/XXXX/", "kind": "video", "alt": "Sunset from the pool deck" },
    { "image": { "attachment_id": "9", "url": "https://example.com/bedroom.jpg" }, "link": "", "kind": "image", "alt": "" }
  ] } },
  "profile_handle": "yourvilla", "profile_name": "Your Villa", "follow_label": "Follow", "button_preset": "",
  "show_header": "yes", "layout": "slider", "count": "16", "rows": "2",
  "columns": "4", "columns_tablet": "3", "columns_mobile": "2",
  "ratio": "1-1", "gap": "0", "show_type_icon": "yes", "hover": "zoom", "new_tab": "yes", "frame": "yes"
}
```
Account source instead: `"source": { "mode": "account", "account": { "access_token": "<token>", "cache_hours": "6" } }`.

## Rendering
`div.igf.igf--{grid|slider}.igf--hover-{…}[.igf--frame]` (CSS vars `--igf-cols/-t/-m`, `--igf-rows`,
`--igf-gap`, `--igf-ratio`) → `.igf__head` (`a.igf__who` with `.igf__avatar`, `.igf__name`, `.igf__handle`;
`a.igf__follow`) → `.igf__viewport` → `ul.igf__track > li.igf__item > a.igf__tile` (`img.igf__img`,
`.igf__type`, `.igf__overlay`) → slider arrows `.igf__arrow--prev/--next`. All server-rendered; the slider
is a CSS scroll-snap grid and the small script only reveals/pages the arrows. No posts → visitors see
nothing, logged-in editors see a note saying why.

## Notes
- **Personal accounts cannot be connected.** Switch to Business or Creator (free, Instagram settings),
  then generate the token: Meta developer dashboard → an app with the **Instagram** product → **API setup
  with Instagram login** → add the account → **Generate token**.
- Stored data: option `fw_igf_data_<hash>`, option `fw_igf_tokens` (`hash → {token, refreshed, count,
  hours}`), transients `fw_igf_fresh_<hash>` / `fw_igf_lock_<hash>`; images in
  `uploads/unysonplus/instagram/`. Background refresh: one-off cron event `fw_igf_refresh` (arg: hash).
- First render without a stored copy fetches inline (one-time, ~1s); later renders read the copy (~ms).
  A failed fetch keeps the old copy and pauses 30 minutes. Token refreshed when older than 7 days.
- Filter `fw_instagram_feed_api_base` (default `https://graph.instagram.com`) pins an API version or a
  test mock (a local mock also needs `http_request_host_is_external` → true).
- Changing the token makes a new hash; the old copy stays until deleted.
