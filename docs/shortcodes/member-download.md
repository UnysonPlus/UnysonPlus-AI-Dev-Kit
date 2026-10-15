<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `member_download` — Member Download

A download button for one **protected file** (uploaded under Membership → Downloads). People who may have it get a working button; people who may not see a disabled button with the reason, a Log in link when logged out, and a "Buy it for …" button when the file is sold on its own. Requires the **`membership`** extension with its **Protected downloads** module (it lives in `framework/extensions/membership/shortcodes/member-download/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'member_download', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `file` | select | `''` | `''` (— Choose a file —) \| a protected file's id as a string, e.g. `'4'` | The file. Ids are site-specific — the choices are the files under Membership → Downloads. |
| `button_text` | text | `''` | string | Button label. Empty = "Download *file title*". |
| `show_details` | switch | `'yes'` | `'yes'` \| `'no'` | Shows the file type and size beside the button, e.g. `PDF · 2 MB`. |

## Ready-to-use example (the atts object)
```json
{
  "file": "4",
  "button_text": "Download the workbook",
  "show_details": "yes"
}
```

## Notes
- **Who may download** is set on the file itself (Membership → Downloads: plans, any member, or any logged-in person; managers always may), with an optional monthly limit per person. A plan counts for the plans it includes.
- **What renders:**
  - allowed → a button to `?fw_mbr_download=<id>` (`rel="nofollow"`). That address checks access again, counts the download and serves the file; the file itself has no public URL;
  - monthly limit reached → a notice ("You can download this N times a month… It opens again next month.") instead of the button;
  - not allowed → the button disabled (`aria-disabled`), then — when the file is **sold on its own** (pay per item, Payments module) — a **Buy it for *price*** button to the checkout, then the reason: "Log in to download this file." + a **Log in** link (logged out; to the Login page, returning here) or "This download is part of a membership plan you do not hold." (logged in).
  - `show_details` adds the type · size line in every state.
- A refused download (the file's own plans, not on sale) shows a **Join** link (**See the plans** when logged in) beside **Log in**, going to Settings → Join page, or to the checkout when exactly one priced plan unlocks it (`FW_Membership_Settings::join_url()`; Membership 1.0.22). A file sold on its own shows **Buy it for …** instead.
- **Admins only** see setup notices: with the Protected downloads module off ("switch on Protected downloads (Membership → Modules)") or with no file / an inactive file chosen. Everyone else sees nothing in those cases.
- A visitor who opens the download address while logged out is sent to the Login page and comes straight back to the file.
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`) — e.g. hide the whole block from people without a plan. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Content tools → protected downloads, pay per item). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
