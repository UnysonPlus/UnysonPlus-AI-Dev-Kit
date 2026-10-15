<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `membership_checkout` — Membership Checkout

The membership checkout: the chosen plan and price, the totals (setup fee, discount, tax, renewal), a "Have a code?" box for coupons and gift codes, an account form for new buyers, the payment methods, and the thank-you / payment-instructions screen afterwards. It reads the plan from the URL (`?plan=<slug>&price=<id>`) that Pricing Plans, prompts and Buy buttons build. Requires the **`membership`** extension with its **Payments** module (it lives in `framework/extensions/membership/shortcodes/membership-checkout/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'membership_checkout', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `button_text` | text | `'Continue to payment'` | string | The submit button when there is something to pay. |
| `free_text` | text | `'Join for free'` | string | The submit button for a free plan (or when a code took the whole price). |
| `thanks_text` | textarea | `'Thank you! Your membership is active.'` | plain text | Shown after a successful payment (escaped — no HTML). |
| `no_plan_text` | text | `'Choose a plan to get started.'` | string | Shown when the page is opened without a valid plan in the URL. |
| `plans_link` | text | `''` | URL of the plans page | Adds a "See the plans" link after `no_plan_text`. Empty = no link. |

Empty text atts fall back to their defaults.

## Ready-to-use example (the atts object)
```json
{
  "button_text": "Continue to payment",
  "free_text": "Join for free",
  "thanks_text": "Thank you! Your membership is active.",
  "no_plan_text": "Choose a plan to get started.",
  "plans_link": "https://example.com/join/"
}
```

## Notes
- **Put it on one page and set Membership → Payments → Payment settings → Checkout page to that page.** Every checkout link (Pricing Plans' Join, the prompts' automatic Join, "Buy it for …" on downloads and courses, gift redeem links) is built from that setting; with no checkout page they are empty or `#`.
- **Needs the Payments module.** With it off, administrators see a notice and everyone else sees an empty box.
- **URL parameters it reads:** `plan` (slug or id; must be an active plan), `price` (a price id of that plan; missing = its first price; a plan with no prices is treated as free), `coupon`, `gift=1` (buy as a gift), `replaces=<membership id>` (a plan change by purchase), `redeem=<gift code>`, plus `country` / `region` / `vat_number` from the Tax module.
- **What a visitor sees:**
  - no / unknown plan → `no_plan_text` (+ "See the plans" when `plans_link` is set);
  - a logged-in member who already holds the plan → "You already have *Plan*." with a link to their account (not for gifts);
  - otherwise the summary (plan name, length, price, trial), a totals table when there is a setup fee, discount, tax or trial ("Due today", "Then each renewal"), the code box, then the form:
    - **logged out**: "Already have an account? Log in first" (to the Login page, returning here), first / last name, **email** and **password** (min 8) — the account is created at checkout;
    - **logged in**: "Joining as *email*" (or "Switching from *Plan*…" for a plan change);
    - the payment methods ("How would you like to pay?") — only for a paid price;
    - a required terms checkbox when Payment settings has a terms URL;
    - the button: `free_text` for free, else `button_text`.
- **Free plans still join** with no payment method set up (no gateways are asked for). A paid price with no usable payment method shows "Online payment is not available for this plan yet. Please contact us to join."
- **Payment methods** are the enabled, configured gateways that fit the price. **Bank transfer (the offline method) is offered for one-off prices only** (`once` / `lifetime`, and gifts, which are paid once) — never for a repeating day / week / month / year price; the membership waits as pending until an admin marks the payment paid.
- **After paying** the page shows: `thanks_text` + "Go to your account" (or "Download it now" / "Open it now" for a pay-per-item purchase); for bank transfer, "Almost done…", the amount and the payment instructions with the reference; for a gift, "Your gift is on its way to …"; a still-confirming card payment, "We are confirming your payment…". A cancelled payment returns to the form with a notice.
- **"Have a code?"** appears when the Coupons module is on (and the price is not free) or the Gifts module is on. It takes **coupon codes** (applied to the quote; an invalid code shows its error and the price without it) **and gift codes** (a gift code redirects to the gift's redeem screen, where the recipient logs in or makes an account and the plan starts). The Tax module adds country / region / VAT fields to the same box ("Update the price").
- **Gifts:** `?gift=1` adds "Who is the gift for?" (name, email, message); the buyer pays once and nothing renews. `?redeem=CODE` replaces the whole checkout with the redeem screen.
- The wrapper always gets `id="fw-mbr-checkout"`, which **replaces any `css_id`** set in the Advanced tab. Use one checkout per page, and only one checkout page per site.
- The form posts back to this page and is handled before any output (nonce-checked), so keep the element on a normal published page.
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`); leave it at `everyone` — the checkout must be reachable by logged-out buyers. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Payments module, Coupons, Tax, gifts). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
