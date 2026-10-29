<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `author_box` — Author Box

An author / profile box — avatar, name, bio, social links and a "view all posts" link — for the current post author, a chosen user, or fully custom content. Leaf node: `{ type:'simple', shortcode:'author_box', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | select | `'current'` | `current` `user` `custom` | Where the author comes from: current post author, a specific user, or manual overrides. |
| `user_id` | select | `''` | user-ID string | The user, when `source` is `user` (choices are the site's users). |
| `name` | text | `''` | string | Custom name, or overrides the user's name. |
| `role` | text | `''` | string | Role / tagline shown under the name. |
| `bio` | textarea | `''` | string | Custom bio, or overrides the user's biographical info. |
| `avatar` | upload | `''` | WP upload object | Custom avatar, or overrides the user's Gravatar. |
| `profile_role_key` | text | `''` | profile field key | Role from a user profile field (e.g. `title`) when `role` is empty. |
| `profile_bio_key` | text | `'description'` | profile field key | Which profile field holds the bio (`description` = Biographical Info; e.g. `full_bio`). |
| `show_email` | switch | `'no'` | `yes` `no` | Adds a line with the user's email as a `mailto:` link, under the bio. |
| `email_label` | text | `''` | string | Text before the address on the email line (e.g. `Feedback -`). |
| `profile_socials` | switch | `'no'` | `yes` `no` | Adds the user's Website and any profile field named after a catalog network (`twitter`, `linkedin` …) as links, before `socials`. |
| `profile_email_icon` | switch | `'no'` | `yes` `no` | With `profile_socials`: also an email icon for the user's address. |
| `socials` | addable-popup | `[]` | array of `{ network, url }` | Social / profile links. `network` from the catalog, `url` string. |
| `design` | image-picker | `'card'` | `card` `centered` `banner` `minimal` | Layout / visual treatment of the box. |
| `avatar_shape` | select | `'circle'` | `circle` `rounded` `square` | Avatar mask shape. |
| `avatar_size` | slider | `84` | px (48–160, step 4) → `--ab-avatar` | Rendered avatar size. |
| `show_posts` | switch | `'yes'` | `'yes'` \| `'no'` | Show the "View all posts" author-archive link (skipped for custom authors). |
| `accent_color` | compact color | `{predefined:'',custom:''}` | compact color object (`kind: bg`) | Accent for links / socials → `--ab-*`. |
| `card_bg` | compact color | `{predefined:'',custom:''}` | compact color object (`kind: bg`) | Card background color. |
| `name_color` | compact color | `{predefined:'',custom:''}` | compact color object | Name text color. |
| `text_color` | compact color | `{predefined:'',custom:''}` | compact color object | Body / bio text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `spacing` | spacing | `{}` | spacing object | Margin & padding. |

## Ready-to-use example (the atts object)
```json
{
  "source": "custom",
  "user_id": "",
  "name": "Jane Doe",
  "role": "Lead Product Designer",
  "bio": "Jane writes about design systems, accessibility, and building calm interfaces.",
  "avatar": "",
  "socials": [
    { "network": "twitter", "url": "https://example.com/jane" },
    { "network": "website", "url": "https://example.com" }
  ],
  "design": "card",
  "avatar_shape": "circle",
  "avatar_size": 84,
  "show_posts": "no",
  "accent_color": { "predefined": "", "custom": "" },
  "card_bg": { "predefined": "", "custom": "" },
  "name_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "spacing": {}
}
```

## Notes
- `source` drives resolution: `current` uses the post's `post_author` (or a queried author archive), `user` uses `user_id`, `custom` uses the overrides only. Name/bio/avatar fall back to the user's data; overrides win.
- `show_posts` uses `'yes'`/`'no'` strings (not booleans). It is skipped entirely for custom authors (there is no author archive to link to).
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- **From the user's profile** (shortcodes 1.15.80): for a site that keeps author details in its own profile fields, `profile_role_key` / `profile_bio_key` pick the fields, `show_email` + `email_label` add the email line, and `profile_socials` (+ `profile_email_icon`) turns the profile's Website and network-named fields into links. Typed `role` / `bio` still win; a hand-entered link with the same URL is not repeated.
- `socials` is an addable-popup array; each item is `{ network, url }` where `network` is a key from the social catalog (email → `mailto:`).
- `card`/`banner`/`centered` designs are boxed; `minimal` is bare. Responsive stack at ≤576px.
