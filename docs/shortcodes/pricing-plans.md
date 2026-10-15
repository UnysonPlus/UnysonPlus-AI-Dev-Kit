<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `pricing_plans` — Pricing Plans

The site's **membership plans** side by side — name, price, trial, description, length — each with a Join button that goes to the checkout, an optional highlighted plan, an automatic Monthly / Yearly switch, and a "Give as a gift" link. Unlike `pricing_table` (hand-typed prices), every figure comes from the real plans under Unyson+ → Membership, so prices are never retyped. Requires the **`membership`** extension (it lives in `framework/extensions/membership/shortcodes/pricing-plans/`, palette tab **Membership**) with its **Payments** module for the buttons to work — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'pricing_plans', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `plans` | checkboxes | `{}` (none ticked) | map `{ "<plan id>": true, … }` — keys are **plan ids** of active, non-item plans | Which plans to show. **None ticked = every active plan.** Shown in plan **priority order, ascending** (highest priority last), whatever order they were ticked in. |
| `featured` | select | `''` | `''` (None) \| a plan id as a string, e.g. `'3'` | The highlighted plan (`.is-featured`). When set, the other plans' buttons switch to the quieter second button style. |
| `featured_text` | text | `'Most popular'` | string | Badge on the highlighted plan. Empty = no badge (the plan is still highlighted). |
| `button_text` | text | `'Join'` | string | The Join button on each plan. |
| `gift_text` | text | `'Give as a gift'` | string | The link under each **paid** plan to buy it for someone else (Gifts module). **Empty hides it.** |
| `current_text` | text | `'Your plan'` | string | Replaces the button (as a disabled button) on a plan the logged-in member already holds. |
| `change_text` | text | `'Change plan'` | string | Button on a plan the member can **switch** to from a plan they hold; it goes to their account page (`#fw-mbr-account`), where they change plan instead of buying a second one. |
| `monthly_text` | text | `'Monthly'` | string | Left label of the Monthly / Yearly switch. |
| `yearly_text` | text | `'Yearly'` | string | Right label of the switch. |

## Ready-to-use example (the atts object)
```json
{
  "plans": {},
  "featured": "2",
  "featured_text": "Most popular",
  "button_text": "Join",
  "gift_text": "Give as a gift",
  "current_text": "Your plan",
  "change_text": "Change plan",
  "monthly_text": "Monthly",
  "yearly_text": "Yearly"
}
```
`"plans": {}` shows every active plan; to pick some, use their ids: `"plans": { "2": true, "3": true }`. Plan ids are site-specific — read them from `GET /wp-json/fw-membership/v1/plans` or `wp membership plans` (both return `id` + `slug`); never guess them.

## Notes
- **What each plan card shows:** the badge (featured only), the name (`<h3>`), the price (`USD 9.00 / month`, `once`, `once, for life`, `every 3 months`, or **Free** for a free / zero-priced one-off plan), "N-day free trial" when the price has one, the plan description, its length, then the button and the gift link.
- **Monthly / Yearly switch** appears automatically when the plans shown have both a monthly and a yearly price; there is no att to force it on or off. Monthly shows first; every price is in the markup and the switch only toggles `hidden` and repoints the Join button. A plan without a price for the chosen period shows its first price. Without the switch each plan shows its first price.
- **Buttons per visitor:** logged-out visitors and people without the plan get **Join** → the checkout with `?plan=<slug>&price=<id>`. A logged-in member gets **Your plan** (disabled) on a plan they hold, **Change plan** on a plan their plan lets them switch to directly, and **Join** on any other plan. When their current plan allows moving to that plan by a new purchase, the Join link carries `&replaces=<membership id>` and the checkout ends the old membership once the new one is paid.
- **Needs the Payments module.** With Payments off, visitors see **nothing at all**; administrators see the plans with a notice ("switch on the Payments module") and inert buttons. With Payments on, **free plans still join** (the checkout makes the account and starts the membership with no payment method needed); paid plans need at least one payment method set up.
- **Needs a checkout page:** the Join links are built from Membership → Payments → **Payment settings → Checkout page** (the page holding `membership_checkout`). With no checkout page set, every Join button renders as `href="#"` with `aria-disabled="true"`.
- **Point Membership → Settings → Join page at the page holding this element.** That is where the automatic **Join** button on Paywall Prompts and on the Membership tab's prompt goes.
- **Gift link** shows only when the Gifts module is on, Payments is on, the plan's (first shown) price is above zero, and `gift_text` is not empty. It opens the checkout with `&gift=1`; a gift is paid once and covers one period of a repeating price.
- **Coupon links:** opening the pricing page as `…/join/?coupon=CODE` carries the code onto every Join link, so the checkout opens with it applied.
- Pay-per-item plans (a plan that sells one post or file) are never listed here and cannot be ticked.
- **Set every att explicitly.** The labels fall back to their defaults only when the att is *missing*; an **empty string is used as-is** (an empty `button_text` gives an empty button). Only `gift_text` and `featured_text` are meant to be emptied.
- Buttons use the Membership button classes (Membership → Settings button classes, defaulting to the site's Theme Settings button presets).
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`) — e.g. `mbr_show: 'non_members'` for a plans block only people without a plan see. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Payments module, Content tools → gifts). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
