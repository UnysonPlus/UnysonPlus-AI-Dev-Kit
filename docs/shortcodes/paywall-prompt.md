<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `paywall_prompt` — Paywall Prompt

The "this is for members" box placed by hand: a lock icon, a title, a message, the plans that unlock the content, a Log in button and a Join (or your own) button. It is the same box Membership shows in place of protected content (`FW_Membership_Denied::prompt()`), so it matches the site's gated pages. Usually given the Membership tab setting "show only to people without a plan". Requires the **`membership`** extension (it lives in `framework/extensions/membership/shortcodes/paywall-prompt/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'paywall_prompt', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `title` | text | `''` | string | The box title. **Empty = automatic:** "This is for members" (logged out) or "Your account does not include this" (logged in). |
| `message` | textarea | `''` | text; basic HTML allowed (`wp_kses_post`, paragraphs added) | **Empty = automatic:** "Log in if you are a member, or join to read the rest." (logged out) or "It is part of a membership plan you do not hold yet." (logged in). |
| `show_plans` | switch | `'yes'` | `'yes'` \| `'no'` | "Included in: *Plan A* *Plan B*" — names the plans that would unlock the content (here: every active plan). |
| `show_login` | switch | `'yes'` | `'yes'` \| `'no'` | A **Log in** button for logged-out visitors; they come back to this page afterwards. Never shown to someone logged in. |
| `button_text` | text | `''` | string, e.g. `'See the plans'` | Your own button's label. |
| `button_link` | text | `''` | URL | Your own button's address. The button shows only when **both** text and link are set. |

## Ready-to-use example (the atts object)
```json
{
  "title": "",
  "message": "",
  "show_plans": "yes",
  "show_login": "yes",
  "button_text": "",
  "button_link": "",
  "mbr_show": "non_members",
  "mbr_plans": {},
  "mbr_denied": "nothing"
}
```
The three `mbr_*` keys are the Membership tab (see Notes) — set here so members never see the prompt.

## Notes
- **It renders for everyone by itself** — including members who already have access. It does not check membership on its own; who sees it is decided by its **Membership** tab. Typical settings: `mbr_show: 'non_members'` (people without any plan), or `mbr_show: 'not_plans'` + `mbr_plans: { "<id>": true }` (everyone except members of the plans that unlock the section). The Membership tab (`mbr_show`, `mbr_plans`, `mbr_denied`) is on every builder element and documented in the extension reference.
- **Your own button text/link win over the automatic Join button.** When both `button_text` and `button_link` are empty, the box adds an automatic button: **Join** (logged out) or **See the plans** (logged in), going to Membership → Settings → **Join page** (the page holding Pricing Plans); with no Join page it goes to the checkout of the plan only when exactly one active plan exists and has a price; otherwise no button. As soon as **either** `button_text` or `button_link` is filled, the automatic button is dropped — and your button needs **both** to appear, so filling only one leaves the box with no Join button at all.
- When your own button shows next to Log in, Log in takes the quieter second button style.
- **Log in** goes to Membership → Settings → **Login page** (the page holding Member Login) with `?redirect_to=` back to this page, or to `wp-login.php` when none is set.
- With `show_plans` on, the list is every **active** plan (this element has no access rule to narrow it). On a site that sells single items (pay per item), those item plans are active too and will be listed.
- The title renders as `<p class="fw-mbr-gate__title">`, not a heading — add a `special_heading` above it if the page outline needs one.
- Alternative without this element: set any element's Membership tab to `mbr_denied: 'prompt'` and people who may not see it get this same box automatically (for `members` / `plans` / `logged_in` content, with the plans narrowed to that element's plans).
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Typed as `[paywall_prompt]` into post content, the Membership tab is not applied, so it would show to everyone. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Full reference: [../extensions/membership.md](../extensions/membership.md) (element visibility, the prompt box). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
