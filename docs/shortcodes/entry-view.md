<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `entry_view` — Entry View

Shows a form's entries on the site: a table, cards, a list, a map or a month calendar, with a search box, a filter, pages and a page per entry. Requires the **`forms`** extension (Contact Forms sub-extension). Leaf node: `{ type:'simple', shortcode:'entry_view', _items:[], atts:{…} }` plus the shared Advanced block (`css_id`, `css_class`, …). It shows nothing unless the chosen form allows it: the form's **Settings → On the site → Entries can be shown on the site** (`views_allowed`). When that form approves first (`views_approval`, on by default), only approved entries are shown.

## atts

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `form_id` | select | `''` | a form id that has entries (a contact form's `id`, or `lib-<post id>` for a saved form) | Whose entries to show. |
| `fields` | text | `''` | field names, comma-separated (`select_kind,text_where`) | The only fields shown, and the only ones search and filter look at. Uploaded files are never shown. |
| `title_field` | text | `''` | a field name | The entry's title (first column / card heading / calendar label). |
| `layout` | select | `'table'` | `table` \| `grid` \| `list` \| `map` \| `calendar` | How the entries are shown. |
| `map_field` · `map_height` | text · text | `''` · `420` | a field holding `latitude, longitude`; px | **Map**: one marker per entry (Leaflet + OpenStreetMap), plus a text list. |
| `calendar_field` | text | `''` | a date field; empty = the day it was sent | **Calendar**: entries on their day, month by month. |
| `search` | switch | `'yes'` | | A search box (over the shown fields). |
| `filter_field` | text | `''` | a field name (a dropdown or choice) | A dropdown of that field's values. |
| `detail` | switch | `'yes'` | | Each entry links to its own view (`?fwv<n>_e=<id>`). |
| `only_mine` | switch | `'no'` | | A logged-in person sees only what they sent (also pending ones, marked), with Edit links when the form has `edit_own` on. Logged out: a "Log in" prompt. |
| `per_page` · `order` | text · select | `12` · `'newest'` | `newest` \| `oldest` | Paging (table, cards, list). |
| `empty_text` | text | `''` | | Shown when nothing matches (default "Nothing to show yet."). |

## Notes

- Request parameters carry the element's number (`fwv1_q`, `fwv1_f`, `fwv1_p`, `fwv1_e`, `fwv1_m`), so two views on one page stay independent.
- Spam, unfinished and archived entries are never shown.
