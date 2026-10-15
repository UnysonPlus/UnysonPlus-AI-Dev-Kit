<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `member_login` — Member Login

A login form in the site's own style, with "Remember me", "Forgot your password?" and an optional sign-up link; a visitor who is already logged in sees a short "You are logged in as …" line instead. Requires the **`membership`** extension (it lives in `framework/extensions/membership/shortcodes/member-login/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'member_login', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `title` | text | `'Log in'` | string | Heading above the form (an `<h2 class="fw-mbr-login__title">`). Empty = no heading. Shown to logged-out visitors only. |
| `show_remember` | switch | `'yes'` | `'yes'` \| `'no'` | The "Remember me" checkbox (stay logged in on this device). |
| `show_lost` | switch | `'yes'` | `'yes'` \| `'no'` | The "Forgot your password?" link (WordPress's password reset, returning to this page). |
| `redirect` | select | `'plan'` | `plan` \| `here` \| `url` | **After logging in.** `plan` = where the member's plan says (the plan's login-redirect setting, else the account page); `here` = back to this page; `url` = the address in `redirect_url`. |
| `redirect_url` | text | `''` | absolute URL | Used only when `redirect` is `url`. Empty = behaves like `plan`. |
| `register_text` | text | `'Not a member yet? Join'` | string | Sign-up link text under the form. |
| `register_link` | text | `''` | URL of the sign-up / plans page | Where the sign-up link goes. **Empty hides the link** (both text and link are needed). |

## Ready-to-use example (the atts object)
```json
{
  "title": "Log in",
  "show_remember": "yes",
  "show_lost": "yes",
  "redirect": "plan",
  "redirect_url": "",
  "register_text": "Not a member yet? Join",
  "register_link": "https://example.com/join/"
}
```

## Notes
- **Logged-out visitors** see the optional title, then the form (`wp_login_form()`; it posts to `wp-login.php`, so the Security module's throttling, two-factor and any extra login methods — a login link by email, a passkey — apply), then the "Forgot your password?" · sign-up links. The username field is labelled "Email or username"; the submit button carries the Membership button classes (Membership → Settings button classes / the site's Theme Settings button presets).
- **Logged-in visitors** see only: "You are logged in as *Name*. Your account · Log out" — "Your account" goes to Membership → Settings → **Account page** (or the WordPress profile when none is set). The title is not shown.
- Account notices (e.g. "Your email is confirmed") posted back with `?fw_mbr_notice=…` show at the top for everyone.
- **`redirect: 'plan'` details.** If the page was opened with `?redirect_to=…` (every Membership "Log in" link — on prompts, downloads, course outlines — adds one), the visitor goes back there; otherwise members land on their plan's login page or the Account page. Staff (anyone who can `edit_posts`) keep WordPress's normal behaviour and land in wp-admin.
- **Point Membership → Settings → Login page at the page holding this element.** Every "Log in" button the extension draws (Paywall Prompt, Member Download, Course Outline, the checkout's "Log in first", the Membership tab's prompt) goes there; with no Login page set they go to `wp-login.php`.
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`). Typing `[member_login]` into the content works only on a non-builder page, and then the Membership tab (below) is not applied.
- **Set every att explicitly.** The view treats a *missing* `title` as empty (no heading), not as the option default `'Log in'`; missing switches count as `yes`.
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`) that decides who sees it — e.g. `mbr_show: 'logged_out'` to hide the whole box from people already logged in. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Accounts, Settings). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
