<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# headless-wordpress extension (display name "Headless WordPress")

Phase 1 of the Headless roadmap: what a front end outside WordPress (Next.js, plain JavaScript, a mobile
app) needs from a Unyson+ site, beyond what Post Types and Custom Fields already put in the core REST API.
**Not in the core zip; not yet in the Extensions manager list** (version 0.1.2, being tested). Read-only and
public, like the core REST API's public data.

How-to guides for headless sites (with or without this extension): the docs site's `/headless` section.

## What it adds

### Ready-to-use images in `unysonplus_fields`

Custom Fields returns an Image field as `{ attachment_id, url }` (a protocol-relative URL). With this
extension active, every such value (top level, in galleries, in repeater rows) becomes:

```json
{ "attachment_id": 3630, "url": "https://site/…/cover.jpg", "width": 600, "height": 900,
  "alt": "The Quiet Garden cover", "sizes": { "medium": { "url": "…", "width": 200, "height": 300 } } }
```

- A **superset** of the stored shape: `attachment_id` and `url` stay, so existing front ends keep working
  (the `url` is now absolute).
- `?unysonplus_raw=1` on any request returns the stored values instead.
- Setting **Ready-to-use images** (default on) turns it off site-wide.
- Hooks Custom Fields' `fw_ext_custom_fields_rest_values` filter (Custom Fields 0.1.22+).

### `GET /wp-json/unysonplus/v1/menus`

Every registered menu location: `{ location, label, menu: { id, name, slug } | null, href }`.

### `GET /wp-json/unysonplus/v1/menus/<location>`

The menu at that location as a nested tree: `{ location, menu, items: [ { id, title, url, target, classes,
object, object_id, description, parent, children: […] } ] }`. 404 for an unknown location or an empty one.

### `GET /wp-json/unysonplus/v1/settings`

`{ name, description, url, language, logo, icon, theme: { … } }`. `logo` (the theme's custom logo) and
`icon` (the site icon) use the image shape above, or `null`. `theme` holds only the Theme Settings option
ids listed in the extension setting **Theme Settings to expose** (one per line); unknown ids come back
`null`, images inside them are resolved too. Nothing else from Theme Settings is exposed.

## Admin screen: Unyson+ → Headless WordPress

`includes/class-fw-headless-admin.php` (`FW_Headless_Admin`, page slug `fw-headless`, `manage_options`):
the endpoint addresses; every Custom Fields group with Show in REST API, each field marked public or private;
and a **Preview** (`?page=fw-headless&preview=<post id>[&raw=1]`) that runs the post's REST request
internally **as a logged-out visitor** (`wp_set_current_user( 0 )` around `rest_do_request()`) and prints the JSON.

## Related controls in Custom Fields (0.1.23+, work without Headless)

- Per-field `show_in_rest` (checkbox, default on; a missing key = on): off removes that field from
  `unysonplus_fields` and from the schema.
- `unysonplus_fields` has a JSON schema: one property per exposed field, typed from its field type
  (`number`/`slider` → number, `checkbox`/`switch` → boolean, `image`/`file` → object, `gallery` → array of
  objects, relations/list/repeaters → arrays, everything else → string). `readonly`, contexts view + edit.
  Extra keys (Headless's resolved images) are not stripped.

## Settings (`settings-options.php`)

| id | type | default | |
|---|---|---|---|
| `resolve_images` | switch | `true` | Ready-to-use images on/off |
| `public_settings` | textarea | `''` | Theme Settings ids to expose, one per line |

Read with `fw_get_db_ext_settings_option( 'headless-wordpress', $id )`.

## Not yet (rest of Phase 1 and later)

Field groups on terms and users, mega-menu columns in the menu tree, Page Builder content as HTML + CSS or structured JSON (Phase 2), preview / rebuild webhooks / CORS
(Phase 3). The plan: docs site `/extensions/headless-wordpress`.
