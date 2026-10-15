<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `member_directory` — Member Directory

A searchable, filterable grid of the members who chose to be listed (avatar, name, up to two profile fields), with a profile page for each on the same page (`?member=<name>`). Requires the **`membership`** extension with its **Member directory** module (it lives in `framework/extensions/membership/shortcodes/member-directory/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'member_directory', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `per_page` | short-text | `'24'` | numeric string, `1`–`100` | People per page (clamped to 1–100). Page links appear when there are more. |
| `show_search` | switch | `'yes'` | `'yes'` \| `'no'` | A "Search members" box (matches the display name and the profile fields the visitor may see). Results are sorted by name. |
| `show_filters` | switch | `'yes'` | `'yes'` \| `'no'` | A dropdown filter for each **choice** (select) profile field the visitor may see in the directory. |

## Ready-to-use example (the atts object)
```json
{
  "per_page": "24",
  "show_search": "yes",
  "show_filters": "yes"
}
```

## Notes
- **Who may browse** is set in Membership → Settings → Member directory: **members** (people with a membership; managers too) or **public**. Anyone else sees the members prompt instead — "The member directory is for members / Log in, or join, to see who else is here." with Log in and the automatic Join button.
- **Who is listed:** people holding a membership (optionally only certain plans — same settings panel) who opted in on their account page, or everyone who did not opt out, depending on the listing setting (opt-in is the default).
- **What is shown:** name and avatar for everyone listed; each profile field only when that field's "In the directory" setting allows it (everyone, or members only). The email address is never shown. A card shows up to two visible field values; the profile page (`?member=<user nicename>`, with "← All members") shows them all. A person not listed gets "This member is not in the directory."
- Search and filters are a GET form back to the same page (`?q=`, `?f[<field key>]=`, `?pg=`); results show "N members" and "Nobody matches yet." when empty.
- **Admins only** see a notice when the Member directory module is off; everyone else sees nothing.
- Use **one directory per page** — the search field id, the `?member` / `?q` / `?pg` parameters and the page links are shared by every directory on the page.
- `per_page` must be a number: an empty string becomes **1** per page (clamped up from 0), not 24.
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`); usually left at `everyone`, since the directory applies its own "who may browse" setting. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Groups, directory and cards; Profile fields). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
