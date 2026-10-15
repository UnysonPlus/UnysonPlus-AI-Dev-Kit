<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `member_account` — Member Account

The member's own account page: their memberships (status, dates, Cancel), their details (name, email, editable profile fields) and password and devices, plus whatever sections the switched-on modules add (receipts, courses, directory listing, …). Logged-out visitors see a login form instead. Requires the **`membership`** extension (it lives in `framework/extensions/membership/shortcodes/member-account/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'member_account', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `show_profile` | switch | `'yes'` | `'yes'` \| `'no'` | **Your details** section: first / last name, email (changing it asks for the current password) and the profile fields members may edit. |
| `show_memberships` | switch | `'yes'` | `'yes'` \| `'no'` | **Your memberships** section: each plan with its status and dates, and **Cancel membership** when Settings allow it. |
| `show_security` | switch | `'yes'` | `'yes'` \| `'no'` | **Password and devices** section: change the password; "Sign out everywhere else". |
| `join_text` | text | `'See the plans'` | string | Link text shown to a logged-in person who has no membership yet. |
| `join_link` | text | `''` | URL of the plans / sign-up page | Where that link goes. **Empty hides the link** (both text and link are needed). |

## Ready-to-use example (the atts object)
```json
{
  "show_profile": "yes",
  "show_memberships": "yes",
  "show_security": "yes",
  "join_text": "See the plans",
  "join_link": "https://example.com/join/"
}
```

## Notes
- **Logged-out visitors** see the heading "Log in to your account" and the login form (it returns them to this page). When the Groups module has a team invitation for them, that step replaces the login form.
- **Logged-in visitors** see "Hello, *first name*" and a Log out link, then, in this fixed order: **Your memberships** (if on) → sections added by modules (Payments: receipts and "Update your payment method"; Courses: "Your courses"; Member directory: the listing opt-in; …) → **Your details** (if on) → **Password and devices** (if on). The section order is not configurable.
- **Your memberships** lists every membership except pending ones. Statuses read Active, Trial, Payment due, Paused, Cancelled, Ended, Refunded. **Cancel** appears only when the Membership → Settings option "Members may cancel a membership from their account page" is on (the default), the membership has an end date, and it is active or in trial — the member keeps access until the end date. With the Retention module on, Cancel opens its short leave flow, which takes over the whole page while it runs. With the Payments module on, each membership also gets **Change plan** where the plan allows switching.
- A logged-in person with no membership sees "You do not have a membership yet." plus the `join_text` link (when `join_link` is set).
- The forms post back to this same page and are handled before any output (nonce-checked, then redirected with a `?fw_mbr_notice=` message shown at the top).
- **Point Membership → Settings → Account page at the page holding this element.** The extension links there from everywhere ("Your account" on Member Login, the checkout's "Go to your account", Pricing Plans' "Change plan", the default login redirect for members). With no Account page set those links fall back to the WordPress profile in wp-admin.
- The wrapper always gets `id="fw-mbr-account"` (the anchor "Change plan" links jump to), which **replaces any `css_id`** set in the Advanced tab. Use one Member Account per page.
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`); leave it at `everyone` here — the element already handles logged-out visitors itself. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Accounts, Payments, Keeping members). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
