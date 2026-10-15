<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Building a membership site with Unyson+ — the agent's guide

How to set up and run a **members-only site** with the Membership extension: in what order, with which
calls, and the traps that waste a session. Read this before touching Membership on a site. The internals
(classes, tables, hooks) are in [`membership.md`](membership.md); each page-builder element has its own
atts reference in [`../shortcodes/`](../shortcodes/) (`member-login.md`, `member-account.md`,
`pricing-plans.md`, `membership-checkout.md`, `paywall-prompt.md`, `member-download.md`,
`member-directory.md`, `course-outline.md`). The beginner manual for people is at
docs.unysonplus.com/membership.

## Two ways to work — pick by where you run

| You are… | Use | Why |
|---|---|---|
| An agent talking to the site over **MCP** or the AI Assistant panel | The **`membership_*` tools** (abilities, below) | Validated input, the owner's permissions, undo where it can be offered, no file access needed |
| An agent with **disk + PHP** on the site (WP-CLI, `wp eval-file`) | The same abilities through `wp_get_ability( 'unysonplus/membership-…' )->execute( $input )`, or the PHP API in [`membership.md`](membership.md) | The abilities are still the safest path; drop to the PHP API only for what no ability covers (seeding history for a demo, bulk work) |

Over MCP a tool is the ability name with `unysonplus/` dropped and `-` → `_`: `unysonplus/membership-save-plan`
is the tool `membership_save_plan`. Every ability needs the Membership capability (administrators have it);
a visitor or a low role gets a permission error.

## The abilities (15)

| Tool (MCP name) | What it does | Undo |
|---|---|---|
| `membership_describe` | Plans (prices, length, member **counts**), rules, modules, settings, the element list. **Call first.** | read-only |
| `membership_modules` | Switch modules on / off (`on: [...]`, `off: [...]`); payments first, then coupons / tax / gifts | undoable |
| `membership_save_plan` | Create / update a plan by slug: prices, length, includes, `options` (switch_to, redirects, role, team_seats, max_sessions, store perks) | not undoable |
| `membership_save_rule` | Create / update an access rule by name: `protects`, `who`, `denied` | not undoable |
| `membership_settings` | Account / Login / Join pages, confirmation, approval, cancel, button classes | undoable |
| `membership_setup_pages` | Make the Join / Log in / My account / Checkout pages with their elements placed in the builder, and point Settings (and Payments) at them; keeps pages already set | delete the pages |
| `membership_payment_settings` | No input = read (secrets masked). Currency, checkout page, upgrades (`proration`), invoices, which ways to pay, bank-transfer text. **Never secret keys** | undoable |
| `membership_save_coupon` | Coupon by code (percent / fixed, once / repeating / forever, plans, limits, dates) | not undoable |
| `membership_save_course` | A course + its lessons (module, content, drip days, quiz text, pass mark, gate), who may take it, certificate, price | not undoable |
| `membership_sell_item` | Sell one post / page / course on its own (`price: 0` takes it off sale; buyers keep access) | not undoable |
| `membership_emails` | No key = list every email + placeholders; with `key` change one (on/off, subject, body) | undoable |
| `membership_profile_fields` | No key = list; with `key` add / change / `remove` a field | undoable |
| `membership_find_members` | Look people up (search, plan, status incl. `access`, limit ≤ 50) — returns membership ids | read-only |
| `membership_manage_member` | `grant` (by email; `create_account` for a new one) · `extend` · `change_plan` · `cancel` · `end` · `reactivate` | not undoable |
| `membership_report` | Totals only: MRR (and by plan), paying members, lifetime value, trials, month by month | read-only |

"Not undoable" means the change lives in Membership's own tables, which `undo_change` cannot restore:
the reply says what changed and where to edit it. Tell the owner the same.

## The order to set up a site (fresh)

1. **Look.** `membership_describe`. Is the extension active (Unyson+ → Extensions → Membership)? Which
   modules are on? Plans and rules that already exist are updated by slug / name, never duplicated — but
   check before you invent names.
2. **Modules.** `membership_modules { on: [...] }` for what the brief needs, e.g. `payments` (selling),
   `coupons`, `drip`, `courses`, `groups` (team plans), `analytics` (Reports). Changes apply from the
   **next request** — an ability that needs a module you just switched on works in your next call, not in
   the same PHP request.
3. **Plans.** `membership_save_plan` per plan. Free plan = no prices. A higher plan that should also get
   everything of a lower one: `includes: "member"`. Let members move between plans themselves:
   `options.switch_to`.
4. **Pages.** `membership_setup_pages` (all four, or `pages: [...]`). It places the elements in the page
   builder and points **Settings → Account page / Login page / Join page** and **Payments → Checkout
   page** at them. Add the pages to a menu if the brief wants them there.
5. **Payments** (if selling). `membership_payment_settings { currency, gateways: { offline: { enabled:
   true, label, instructions } } }` for bank transfer; card (Stripe) and PayPal need **keys the owner
   pastes** on Membership → Payments → Payment settings. Say so; never ask for or store them yourself.
6. **Protect content.** `membership_save_rule` per area: a category, a page and its children, a URL
   pattern, a post type, the whole site. `who.plans` = the plans that may see it.
7. **Extras.** Coupons, a course (`membership_save_course`), emails' wording, profile fields, items sold on
   their own.
8. **Check** (below). Then tell the owner what was made, what needs their hand (keys, menu placement),
   and what cannot be undone automatically.

## Patterns that work

- **Members-only articles**: put them in a category, then
  `membership_save_rule { name: "Members-only articles", protects: [ { type: "term", taxonomy: "category",
  term: "members-only" } ], who: { plans: ["member"] } }`. Visitors see a teaser and a prompt with
  **Join** (to the Join page) and **Log in**.
- **A members area**: one parent page with child pages →
  `protects: [ { type: "children", post: "Members area" }, { type: "post", post: "Members area" } ]`.
- **Everything except a sample**: two lines, the second with `except: true`.
- **Free registration wall**: a free plan + a rule with `who.plans: ["free"]` (any higher plan that
  includes it also passes).
- **Drip**: `drip_days` on a rule (the rule screen's "Opens after (days)"), or `opens_after_days` per
  lesson in a course. A dripped page shows "This opens for you in N days" to members who have the plan.
- **Free reads** (metered paywall): `denied: { metered: true }` on the rule + the Metered paywall module;
  the allowance is set on Settings → Metered paywall.
- **Hide part of a page** instead of the whole page: the **Membership** tab every builder element has
  (`mbr_show`, `mbr_plans`, `mbr_denied`; see `membership.md`), or `[member_content plans="slug"]…[/member_content]`.
- **A course**: `membership_save_course { title, who: "plans", plans: ["pro"], certificate: true,
  lessons: [ { title, module, content, quiz: "Q: …\n* right\n- wrong", quiz_gates: true }, … ] }`. Lessons
  are matched by title, so calling again with one lesson changes that lesson only.

## Traps (each has cost a session)

- **Administrators see everything.** Checking a protected page while logged in as admin proves nothing.
  Check logged out (a private window / `curl`), or with **View as** in the admin bar (pick a plan).
- **Bank transfer only takes one-off prices.** A monthly / yearly plan with only bank transfer on shows
  "Online payment is not available for this plan yet". Repeating prices need card (Stripe) or PayPal.
- **Pages render from the builder data**, not from `post_content`. A shortcode typed into the content of
  a builder page does not show. Use `membership_setup_pages`, or place the element in the builder (see
  [`../building-pages.md`](../building-pages.md)).
- **Modules switch on the next request.** Switch, then call the ability that needs the module in a new
  request.
- **Free sign-ups vs paid**: a free plan can be joined through a contact form with the **Register a
  member** action (Forms) or through Pricing Plans; paid plans go through Pricing Plans → Membership
  Checkout (Payments module).
- **Only one plan unlocks it → the Join button goes to that plan's checkout** when no Join page is set.
  Set the Join page (step 4) so prompts send people to the full plan choice.
- **Cancel vs end**: `cancel` stops renewing and keeps access to the end date; `end` stops access now.
  Both are passed on to the payment service for card / PayPal memberships. `change_plan` is not — paid
  members change plans themselves (account page → Change plan, from `options.switch_to`).
- **Test data with a real email** sends real emails (welcome, receipts). Use `@example.com` addresses.
- **Prices are versioned**: changing a price makes a new price row; existing members keep the price
  they agreed to. Don't "fix" an old member's price by editing the plan.

## Checking it worked

1. `membership_describe` again — plans, rules and settings as intended.
2. Fetch each member page logged out: the Join page shows the plan cards (`.fw-mbr-pricing`), the Log in
   page a form (`.fw-mbr-login`), a protected page a prompt (`.fw-mbr-gate`) with **Join** and **Log in**.
3. With disk access, a quick look at the gate:
   `wp eval 'echo FW_Membership_Access::can( <post_id>, <user_id> ) ? "open" : "locked";'`.
4. Paid plans: open the checkout for a plan (`/checkout/?plan=<slug>`) logged out — a payment choice
   should show (or the bank-transfer note for one-off prices).
5. Tell the owner the URLs, and that **View as** in the admin bar shows the site as each plan sees it.

## Running the site later

- "Give Jane a free month of Pro" → `membership_find_members { search: "jane" }`, then
  `membership_manage_member { action: "grant", email, plan: "pro", ends: "<date a month out>" }`.
- "Why can't Tom see X?" → find his memberships (status, plan, end date), `membership_describe` for the
  rules covering X, and check whether a drip delay or a different plan explains it.
- "How are we doing?" → `membership_report { months: 6 }`; quote totals, never people.
- "Make a 20% spring code" → `membership_save_coupon { code: "SPRING20", type: "percent", amount: 20,
  duration: "once", expires: "YYYY-MM-DD" }` (Coupons module on).
