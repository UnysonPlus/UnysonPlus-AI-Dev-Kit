<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# membership extension (Membership)

Members-only content for WordPress: plans, membership records, one access engine that every gate asks
(pages, archives, REST, elements, menus, files, lessons), a member area designed in the page builder, and
switchable modules (payments, coupons, tax, CRM, drip, metered paywall, downloads, retention, gifts,
groups, directory, cards, WooCommerce, reports, account security, importers, courses). **Active by
default:** no — download + activate it under Unyson+ → Extensions. Design, research and the auto-tracked
roadmap: docs.unysonplus.com/membership (+ `/crm`, `/roadmap`, `/research`).

**Built (1.0.16, every roadmap phase):** phases 1 and 2 — the app, plans, memberships, access rules + engine, element /
block / menu / shortcode visibility, the editor box, Paywall Prompt, "View as", sign-up through Forms (Register
member action, Username / Password fields), email confirmation and approval, Member Login and Member Account,
per-plan login / logout pages, member emails, Settings, profile fields, privacy, REST and AI abilities; and from
phase 3 the **Payments module** (gateway layer, Stripe, bank transfer, Pricing Plans + Membership Checkout
elements, Membership → Payments, member plan changes with proration, PayPal, invoices) and the **Coupons** and
**Tax** modules — phase 3 complete; the **CRM module** (phase 4); and **Drip**, **Metered paywall**, **Protected downloads** and pay per item
(phase 5); **Retention** and **Gift memberships** (phase 6); **Groups and teams**, **Member directory** and **Membership
cards** (phase 7); the **WooCommerce** module (phase 8); **Reports** (phase 9); **Account security**, **Importers**, the scheduler card and WP-CLI (phase 10); **Courses** with progress,
quizzes and certificates (phase 11).

## Provides

- **Admin screen:** Unyson+ → **Membership** (slug `fw-membership`) — an app frame built to work exactly
  like the CRM app (`FW_Membership_App`, `includes/admin/class-fw-membership-app.php`, a deliberate copy of
  `FW_CRM_App` with `fw-crm-` → `fw-mbr-`): its own sidebar (Home `home`, Members `members`, Plans `plans`,
  Access rules / Payments / Coupons / Reports / Emails / Settings marked **Soon**, Modules `modules`), a top
  bar (member search → `tab=members&q=`, "/" focuses it; **New** menu: member, plan), the WP menu folded on
  its screens (body classes `fw-mbr-screen folded`), per-user focus mode (user meta `fw_mbr_focus`,
  admin-ajax `fw_mbr_focus`) hiding `#adminmenumain`, and **Open the CRM** in the sidebar foot while the CRM
  is active and the person may open it (`FW_Membership_App::can_open_crm( $contact_id = 0 )`: the CRM's own
  capability `FW_CRM_Service::capability()`, and for a contact link `FW_CRM_Capabilities::can_edit_contact()`
  so a sales rep is never sent to someone else's contact). Nav items may carry a `cap`: hidden without it,
  and the screen shows a "For membership managers" locked state (`FW_Membership_App::can_view()`). Someone
  holding Membership's capability but not `manage_options` gets Membership as a top-level menu (position 4),
  because the Unyson+ parent menu is admin-only. Add a view with the `unysonplus_membership_nav` filter, render it on
  `unysonplus_membership_render_view`, and handle its POST/GET actions on the
  `unysonplus_membership_admin_action` filter (return redirect query args). Views:
  - **Home** (`FW_Membership_Dashboard`) — status line, counts (members with access, active, cancelled with
    access, ended), members by plan, recent changes, memberships ending in 14 days; a 3-step first-run guide.
  - **Members** (`FW_Membership_Admin_Members`) — list with status views, plan filter and search;
    `&new=1` adds a member by email (finds the WP user, or creates one with the default role and optionally
    sends the set-password email); `&member=<user_id>` is the member page (each membership with Extend /
    Change plan / Cancel at end date / End now / Reactivate, an Add-a-plan form, the history, links to the
    WP profile and, with the CRM on, the contact).
  - **Plans** (`FW_Membership_Admin_Plans`) — list (prices, length, includes, member count; Archive /
    Restore / Delete) and the edit screen (name, slug, description, prices editor, length: until cancelled /
    a set time / until a date, "also includes" plan, priority, member limit, status).
  - **Modules** — every module with its phase; switches stored in option `fw_ext_membership_modules`.
- **Tables** (`$wpdb->prefix . 'fw_mbr_'`, schema `FW_Membership_Installer::DB_VERSION`, option
  `fw_ext_membership_db_version`): `plans`, `prices`, `memberships`, `membership_events` (append-only
  history), `rules` + `rule_targets` (access rules; targets are indexed `type/sub_type/object_id` rows for a
  context lookup), `payments`. No ENUMs, NULL for unset dates, no foreign keys. Never dropped on deactivate.
- **Cron:** `fw_membership_expire_due` (hourly) ends memberships whose `ends_at` has passed.

## PHP API

| Call | Does |
|---|---|
| `FW_Membership_Plans::all( $status = '' )` / `get( $id )` / `get_by_slug( $slug )` | Plans as arrays, each with `prices` (active only), request-cached |
| `FW_Membership_Plans::save( $data, $prices, $id = 0 )` | Insert/update a plan; returns id or `WP_Error` (empty name, duplicate slug, inheritance loop). A changed price becomes a new row and the old one is archived; an unchanged one keeps its id |
| `FW_Membership_Plans::lineage( $id )` | The plan plus every plan it includes (`parent_id` chain) |
| `FW_Membership_Plans::delete( $id )` / `archive( $id )` | Delete refuses (`WP_Error`) while the plan has memberships |
| `FW_Membership_Service::grant( $user_id, $plan_id, $args )` | Start a membership. `$args`: `source`, `source_ref`, `price_id`, `status` (`active`/`trialing`/`pending`), `starts`, `ends` (`''` = the plan's own length, a date, or `'never'`), `note`. Refuses a plan the user already holds |
| `FW_Membership_Service::extend( $id, $until = '' )` | `''` = by the plan's length, `'+1 month'`, a date, or `'never'`; reactivates an ended one |
| `FW_Membership_Service::cancel( $id, $now = false )` | Cancel at period end (status `cancelled`, access until `ends_at`); immediate when `$now` or no end date |
| `FW_Membership_Service::expire( $id )` / `reactivate( $id )` / `change_plan( $id, $plan_id )` | End now / make active again / move to another plan keeping dates |
| `FW_Membership_Service::user_plans( $user_id )` | Plan ids the user holds now (with inherited plans), highest priority first |
| `FW_Membership_Memberships::query( $args )` / `count()` / `get()` / `history()` | Read records; `status` accepts a list or `'access'` (trialing, active, past_due, cancelled) |
| `FW_Membership_Modules::is_on( $slug )` / `set( $slug, $on )` | Module switches; a module's code is `modules/<slug>/<slug>.php`, loaded only when on |

| `FW_Membership_Rules::all()` / `get()` / `save( $data, $targets, $id )` / `delete()` / `set_status()` | Access rules. `$data`: `name`, `status`, `priority`, `who` { `plans` int[], `roles` string[], `logged_in` bool }, `denied` { `action` prompt\|login\|redirect\|not_found, `message`, `redirect`, `teaser_words`, `hide` }. Targets: { `mode` include\|exclude, `type` site\|post_type\|post\|children\|term\|archive\|url, `sub_type`, `object_id`, `pattern` } |
| `FW_Membership_Rules::matching( $ctx )` | Active rules matching a context (`post_id`, `post_type`, `ancestors`, `terms`, `archive`, `path`) in one query on the indexed `rule_targets` rows; "except" lines remove a rule |
| `FW_Membership_Access::can( $post, $user_id = null )` | May this person see it? `null` = the current person (honours "View as"). Every applicable rule must pass; managers and the item's editors always pass |
| `FW_Membership_Access::denied_for_post( $post, $path = null )` / `denied_for_context( $ctx )` | The most specific failing `{ rule, specificity }`, or null |
| `FW_Membership_Access::visible_to_current( $show, $plans )` | The element / menu choice (`everyone`, `members`, `non_members`, `plans`, `not_plans`, `logged_in`, `logged_out`) |
| `FW_Membership_Denied::prompt( $rule = null, $args )` / `render_for_post()` / `teaser_text()` | The prompt box (`.fw-mbr-gate*`, `static/css/front.css`), shared with the Paywall Prompt element |

**Element visibility — the Membership tab.** `FW_Membership_Elements` adds `tab_membership` (before `tab_advanced`)
through `fw_shortcode_get_options` to every shortcode whose options carry the shared Advanced tab (detected by its
`dc_logged` field). Atts: `mbr_show` (`FW_Membership_Access::visibility_choices()`), `mbr_plans` (checkboxes: map or
list), `mbr_denied` (`nothing` | `prompt`; a prompt is only shown for members / plans / logged_in content). Gate:
`do_shortcode_tag` priority 11 (cheap raw check on `mbr_show`, decodes only for plans / not_plans). 1.0.2 had the same
ids inside the Advanced tab, so values saved then keep working.

**Blocks.** `FW_Membership_Blocks`: attributes `fwMbrShow`, `fwMbrPlans` (number[]), `fwMbrDenied` added to every
block type except `unysonplus/*` (server: `register_block_type_args`; editor: `blocks.registerBlockType` in
`static/js/blocks.js`, a plain wp.* script), a "Membership" InspectorControls panel, a dashed outline on restricted
blocks in the canvas (`block_editor_settings_all` styles), applied on `render_block`.

**Shortcode.** `[member_content show="" plans="gold,silver" prompt="yes" else="…"]…[/member_content]`
(`FW_Membership_Shortcode`; registered only if the name is free, always also as `[upw_member_content]`). `show`
defaults to `plans` when plans are given, else `members`; plans accept slugs or ids.

Per-item override (post meta): `_fw_mbr_access` (`''` follow the rules, `protect`, `open`), `_fw_mbr_plans`
(int[], empty = any plan), `_fw_mbr_hide` (`'1'`). Menu items: `_fw_mbr_show`, `_fw_mbr_plans`. Plan `settings`: `role` (a safe role), `caps` (string[]).

Statuses: `pending`, `trialing`, `active`, `past_due`, `paused`, `cancelled`, `expired`, `refunded`.
Sources: `manual`, `payment`, `woocommerce`, `group_seat`, `gift`, `import`, `crm_automation`, `registration`.

## Accounts (phase 2)

- **Register member** = a Forms action (`FW_Membership_Forms_Action_Register`, id `member_register`, registered on
  `fw_ext_forms_actions`). Options (contact-form atts): `action_member_register` (on/off),
  `action_member_register_plan` (plan id or ''), `_confirm` (default yes), `_approval`, `_login` (default yes).
  `validate()` refuses before the submission is accepted (no Email field, email already registered, logged in as
  someone else, plan closed or full). `run()` creates the user (`member-username` / `member-password` field values
  read from the raw payload via `FW_Membership_Form_Fields::value_of_type()`; otherwise a username from the email
  and `wp_new_user_notification()`), names from fields labelled first / last / name, grants the plan with source
  `registration` (status `pending` while held), then `FW_Membership_Verification::hold()` or logs them in. Fires
  `unysonplus_membership_registered( $user_id, $plan_id, $ctx )`. A logged-in person submitting with their own email
  just gets the plan.
- **Form fields** `member-username`, `member-password` (`includes/forms/items/`), declared on
  `fw_option_type_form_builder_init` (they extend Forms' simple-item base; URIs and view overridden).
  `member-password` is added to Forms' `fw_ext_forms_secret_field_types`; it is never echoed back, asks twice by
  default, minimum length 8.
- **Verification** (`FW_Membership_Verification`): user meta `_fw_mbr_state` (`verify` | `approval`), token
  `_fw_mbr_verify` = { hash (HMAC-SHA256 with `wp_salt('auth')`), expires }. Link `/?fw_mbr_verify=<raw>&u=<id>`;
  GET shows a confirm button (wp_die page), POST confirms → `mark_verified()` → approval or
  `FW_Membership_Service::activate_pending()` + login + redirect (Settings `after_verify`, else account page,
  `?fw_mbr_notice=verified`). `wp_authenticate_user` (30) refuses held accounts with a reason. `approve()`,
  `send()` (resend; old link dies). Event `pending` (no email) then `joined` on activation.
- **Accounts** (`FW_Membership_Accounts`): `login_redirect` / `logout_redirect` for non-staff (plan settings
  `login_redirect` / `logout_redirect`, else the account page; an explicit destination wins). Account forms post
  `fw_mbr_account_action` = profile | password | sessions | cancel with nonce `fw_mbr_account`, handled on
  `template_redirect` (1), PRG with `?fw_mbr_notice=<code>`. Login posts to wp-login.php (`wp_login_form`), so
  Security's throttling / 2FA apply; the element's "plan" redirect sends `admin_url()` so the filter decides.
- **Elements**: `member_login` (title, remember, lost, redirect plan | here | url, register link),
  `member_account` (show_profile / show_memberships / show_security, join link). Buttons use
  `FW_Membership_Settings::button_class()` (the theme's `.btn` classes from Settings; left at the defaults `btn btn-primary` / `btn btn-outline` and the site has no preset of that name, it picks a Theme Settings button preset — filled for the main button, outlined for the second — via `button_presets()`; `fw-mbr-btn` fallback styling
  only applies without `.btn`). Badges and pills use `currentColor`, never the accent, so they read on any section.
- **Emails** (`FW_Membership_Emails`, option `fw_ext_membership_emails`): verify, welcome (on `joined` when
  `$context['notify']`), awaiting, admin_awaiting, approved, cancelled, expired (only from an access status). Plain
  text bodies → `wpautop( esc_html() )` + `make_clickable()` in a simple HTML frame; filter `unysonplus_membership_email`
  (return false to stop). `FW_Membership_Service::grant()` takes `notify` (default: true unless source is manual).
- **Settings** (`FW_Membership_Settings`, option `fw_ext_membership_settings`): account_page, login_page,
  join_page, after_verify, verify_days, notify_admin, admin_email, member_cancel, button_class, button_class_2;
  `account_url()`, `login_url( $redirect )`, `join_url( $plan_ids )` (join_page, else the checkout when exactly
  one priced plan unlocks it, else ''). A prompt with no button of its own shows **Join** (logged out) / **See
  the plans** (logged in) to `join_url()`; not on login-only rules.
- **Privacy** (`FW_Membership_Privacy`): exporter + eraser `unysonplus-membership` (memberships + history deleted,
  payments anonymised in place), privacy-policy text.
- **Note for testing on converted sites**: pages there render only page-builder content, so put Member Login /
  Member Account in the builder, not in post_content.

## Profile fields, REST and AI (1.0.5)

- **Profile fields** (`FW_Membership_Profile`, option `fw_ext_membership_profile_fields`): definitions
  { key, label, type: text | textarea | select | checkbox | date | number | tel | url, choices, required,
  plans int[] (empty = every member), member_edit }. Values are user meta `fw_mbr_<key>`. `fields_for_user()`,
  `get()`, `save_values( $uid, $fields, $values, $partial )` (validates per type; returns WP_Error),
  `fill_from_form()` (sign-up rows matched by label or key, partial), `inputs()` (named `fw_mbr_profile[key]`),
  `erase()`. Action `unysonplus_membership_profile_saved( $user_id, $values )`. The account page saves the
  member-editable fields for the member's plans before the name / email (nothing saved if one is invalid; the
  message travels in a transient, notice code `fields`).
- **REST** (`FW_Membership_REST`, namespace `fw-membership/v1`): public `GET /plans`, `GET /plans/{id}`,
  `GET /access?post=` (`protected`, `can_view`, `denied { action, plans, login_needed }`); logged-in `GET /me`;
  managers (`FW_Membership_Service::capability()`): `GET /members` (plan id or slug, status or `access`, search;
  `X-WP-Total`), `GET /members/{user_id}`, `POST /memberships` (user_id or email, plan id or slug, ends, note,
  notify → 201, 409 when already held), `GET /memberships/{id}`, `POST /memberships/{id}/{extend|cancel|expire|
  reactivate|activate|change-plan}`, `GET /rules`. `FW_Membership_REST::plan_out()` / `membership_out()` are the
  shared shapes.
- **AI abilities** (15, on `fw_ai_assistant_register_abilities`; MCP tool = name without `unysonplus/`, `-` → `_`).
  The task guide (order, patterns, traps) is [`membership-building.md`](membership-building.md).
  `includes/ai-abilities.php` (set up): `membership-describe` (readonly; counts only), `membership-save-plan`
  (by slug; prices kept when omitted; `includes` by slug; `options` { switch_to slugs, login_redirect,
  logout_redirect, role (safe roles only), team_seats, max_sessions, woo_discount, woo_discount_cats,
  woo_free_shipping } laid over the plan's settings and run through `unysonplus_membership_plan_settings`, so
  options not given keep their values), `membership-save-rule` (by name; `protects` resolves post / page by
  id, slug or title, terms by slug, id or name, plans by slug; `drip_days`, `drip_date`; `denied.metered`; an
  update keeps priority / drip not given), `membership-settings` (account / login / join page; snapshotted).
  `includes/ai-abilities-manage.php` (run): `membership-setup-pages` (Join / Log in / My account / Checkout
  pages with the element in builder JSON + settings / `checkout_page`; keeps pages already set),
  `membership-modules` (on / off; payments first; `requires` honoured; snapshot `fw_ext_membership_modules`),
  `membership-find-members` (readonly; search / plan / status / limit ≤ 50 → membership ids, name, email),
  `membership-manage-member` (grant by email with optional `create_account` + `notify` / extend / change_plan /
  cancel / end (= `expire`) / reactivate, via `FW_Membership_Service`), `membership-payment-settings` (no input =
  read with secrets masked; password-type gateway fields are refused and kept; snapshot
  `fw_ext_membership_payments`), `membership-save-coupon` (by code; other fields kept), `membership-save-course`
  (by title / slug; lessons by title inside the course, in order; metas `_fw_module`, `_fw_drip_days`,
  `_fw_quiz`, `_fw_quiz_pass`, `_fw_quiz_gate`; `price` via `FW_Membership_Single_Purchase::sell`; then
  `sync_rule`), `membership-emails` (list, or change one key; other emails kept as stored; snapshot),
  `membership-profile-fields` (list, add / change / remove by key; snapshot), `membership-sell-item`,
  `membership-report` (readonly; totals only: MRR total + by plan, paying members, LTV, trials, months).
  A module an ability needs being off returns an error naming it. Tested through `wp_get_ability()->execute()`
  (schema + permission).

## Payments module (phase 3, 1.0.6)

Switched on in Modules (`FW_Membership_Modules::set( 'payments', true )` — takes effect on the next request).
Loader `modules/payments/payments.php`; nothing in it loads while the module is off. The **Pricing Plans**
(`pricing_plans`: `plans` multi-select, `featured` plan id, `featured_text`, `button_text`, `gift_text` (empty hides
the gift link), `current_text`, `change_text`, `monthly_text`, `yearly_text`; full atts in `../shortcodes/pricing-plans.md`) and **Membership Checkout** (`membership_checkout`: `button_text`, `free_text`,
`thanks_text`, `no_plan_text`, `plans_link`) elements live in the extension's `shortcodes/` and tell admins
when the module is off.

- **Layers:** `FW_Membership_Gateways` (registry + settings, option `fw_ext_membership_payments`: currency,
  checkout_page, terms_url, gateways[id] { enabled, …fields }; a blank password field keeps the stored secret;
  `available_for( $price )` = enabled + `is_ready()` + recurring support; `checkout_url( [plan, price] )`) →
  `FW_Membership_Payments` (repository, table `payments`: status pending | paid | failed | refunded |
  cancelled, type payment | renewal | refund, `gateway_ref` = the service's id, `meta` JSON incl. the per-payment
  return `key`) → `FW_Membership_Payments_Flow` (the ONLY place money turns into membership changes; every
  method idempotent) → `FW_Membership_Service`.
- **Flow:** `start( $uid, $plan, $price, $gateway, [success, cancel] )` → free price = `grant()` now; else a
  `pending` membership (source `payment`; an abandoned one for the same plan is reused) + pending payment, then
  `$gateway->start()` returns `redirect` (hosted page) or `done`. `paid( $pid, [gateway_ref, subscription_id,
  status active|trialing, period_end, trial_end, meta] )` → `Service::activate()`; with a period end, access
  runs to period end + `grace_days()` (filter `unysonplus_membership_renewal_grace_days`, 3). `renewed()`,
  `renewal_failed()` (→ past_due), `cancel_scheduled()`, `ended()`, `refunded( $pid, $end_access )`.
  Cancels / expiries made in the site are sent to the gateway (`cancel( $m, $now )`); ones that came FROM the
  gateway are not sent back.
- **Pending paid memberships never start on email confirmation:** `Service::activate_pending()` skips source
  `payment`.
- **Gateway contract** (`abstract FW_Membership_Gateway`): `id`, `title`, `checkout_label`,
  `checkout_description`, `settings_fields` (text | password | textarea | select | checkbox), `is_ready`,
  `supports_recurring`, `start`, `confirm_return`, `webhook( WP_REST_Request )`, `cancel`, `refund`,
  `manage_url`, `setting()`, `refunds_online()` (true when the gateway overrides `refund()`: the Payments list
  then offers **Refund**; otherwise **Mark refunded**, action `refund_payment` with `only_mark=1`). Register
  more on `unysonplus_membership_gateways`. Webhook route:
  `POST /wp-json/fw-membership/v1/webhooks/{gateway}`.
- **Stripe** (`wp_remote_request`, no SDK, pinned `Stripe-Version: 2024-06-20`): one customer per user per mode
  (user meta `_fw_mbr_stripe_customer_{test|live}`); Checkout Session in `subscription` mode for recurring prices
  (trial → `subscription_data.trial_period_days`, setup fee = a second one-off line) or `payment` mode;
  idempotency key `fw-mbr-checkout-{pid}`; metadata `fw_mbr_payment`. Webhooks verified with the signing
  secret (5-minute tolerance): `checkout.session.completed` / `async_payment_succeeded`, `invoice.paid`
  (only `subscription_cycle` / `subscription_update` are renewals), `invoice.payment_failed`,
  `customer.subscription.updated` (cancel_at_period_end), `.deleted`, `charge.refunded` (matched by
  payment_intent). The buyer's return also confirms (`confirm_return`) in case the webhook is late. Filter
  `unysonplus_membership_stripe_session( $params, $payment, $membership, $price )`. Billing portal =
  `manage_url()`.
- **Bank transfer** (`offline`): one-off prices only; reference `M` + 6-digit payment id; `{reference}` in the
  instructions; admin **Mark paid** → `paid()`.
- **Checkout** (`FW_Membership_Checkout`, `template_redirect` priority 2): POST `fw_mbr_checkout` (nonce
  `fw_mbr_checkout`; plan, price, gateway, email, first_name, last_name, password, terms) creates + logs in a new
  account (never attaches to an existing email); return `?fw_mbr_payment=&k=` sets `::$outcome` (paid |
  instructions | processing | cancelled | error) for the element.
- **Plan changes** (`FW_Membership_Plan_Change`, 1.0.7): plan setting `switch_to` (int[]; "Members can
  switch to") lists the allowed moves. `options( $m )` → { plan, price, kind upgrade|downgrade (by
  `daily()` cost), when now|renewal|checkout, due_now (estimate) }: a subscription moves only to a recurring
  price in the same currency or to a free plan; dearer = `now` (`$gateway->switch_price( $m, $price,
  'prorate'|'none' )` per Payment settings `proration`; Stripe `always_invoice` + `error_if_incomplete`, so a
  declined card changes nothing), cheaper / free = `renewal` (stored in membership `meta.scheduled_change` {
  plan_id, price_id, at }; recurring → Stripe `proration_behavior=none`, free → cancel_at_period_end).
  `apply_due()` runs from `Flow::renewed()`; `cancel_scheduled()` ignores a stop caused by a scheduled free
  move and `ended()` turns it into `to_free_now()` (membership continues, free, no gateway). `keep()` undoes.
  No subscription: free = `now`, paid = `checkout` with `replaces=<membership id>` (validated by
  `FW_Membership_Checkout::replacing()`); `Flow::start( …, [ 'replaces' => id ] )` → `paid()` expires the old
  one with context `replaced` (no "ended" email). Only plans held DIRECTLY count as held (Supporter inside
  Gold is still a valid downgrade). Stripe Prices are created on demand and kept in the price's
  `gateway_refs.stripe_price_{test|live}` (`FW_Membership_Plans::get_price()` / `set_price_ref()`). An
  upgrade's `invoice.paid` (`subscription_update`) is `Flow::extra_charge()` (type payment, meta reason
  plan_change), not a renewal. Reactivating in the site calls `$gateway->resume()`; a resume in Stripe calls
  `Flow::resumed()`.
- **Quote** (1.0.8): `FW_Membership_Payments_Flow::quote( $plan, $price, $args )` is the one price calculation
  — { currency, amount, setup_fee, trial_days, recurring, due (now, before discount: setup only during a trial),
  discount, coupon, discount_recurring, tax, tax_rate, tax_label, tax_inclusive, subtotal, total, renewal_total,
  errors }. Modules adjust it on `unysonplus_membership_quote( $q, $plan, $price, $args )` (coupons at 10, tax at
  20); `errors` refuse it. `start()` charges `total`, stores `tax`, `coupon` and `meta.quote` / `meta.tax_info`;
  a one-off quote of 0 starts the membership with no gateway. `$args`: coupon, country, region, vat_number,
  user_id, checkout_submit (tax then requires a country). Action `unysonplus_membership_checkout_completed( $q,
  $user_id, $membership_id, $payment_id )` (free start or first payment paid) is where a coupon use counts.
  Checkout: `FW_Membership_Checkout::buyer_args()`; a GET "price" form (action
  `unysonplus_membership_checkout_price_fields`) sets coupon / country before the payment form, which carries
  them as hidden fields. Stripe: `apply_session()` records Stripe's `amount_total` / `amount_tax`.
- **Coupons module** (`modules/coupons/`, needs Payments): table `fw_mbr_coupons` via
  `FW_Membership_Installer::module_tables()` (code unique upper-case, type percent|fixed, amount, currency,
  duration once|repeating|forever, months, plans json, max_uses, per_user, uses, starts_at, expires_at, status,
  batch, gateway_refs). `validate()`, `discount()`, `label()`, `generate( $terms, $count, $prefix )`. Per-person
  uses are user meta `_fw_mbr_coupon_used`. Stripe: made on demand (`gateway_refs.stripe_{mode}`) and passed as
  `discounts`; a failure stops the checkout (`$params['_fw_error']`) rather than charging full price.
- **Tax module** (`modules/tax/`, needs Payments): settings in `fw_ext_membership_payments.tax` { mode
  rates|stripe, inclusive, shop_country, rates [ { country ISO or *, region, rate, label } ], eu_vat }. Best match:
  country+region > country > *. `vat_valid()` uses VIES (GR → EL; cached a day; filter
  `unysonplus_membership_vat_check` short-circuits) — reverse charge only for a valid number from another EU
  country; VIES down = VAT charged with a note. Stripe: a Stripe tax rate per (rate, inclusive, label, country),
  cached in option `fw_ext_membership_stripe_tax_rates`, on each line; mode `stripe` = `automatic_tax`.
  `FW_Membership_Countries` (WooCommerce's list when active). Buyer country remembered in `_fw_mbr_country`.
- **Invoices** (`FW_Membership_Invoices`): number given on `unysonplus_membership_payment_paid` (priority 1) to a
  paid payment with an amount: prefix + 5-digit sequence from option `fw_ext_membership_invoice_seq`, taken
  atomically (`LAST_INSERT_ID`). `?fw_mbr_invoice=<payment id>` renders a standalone printable page for the owner
  or a manager. Settings `invoice` { prefix, business, address, tax_id, footer }. Receipt placeholder
  `{invoice_url}`; `{payment_ref}` is the invoice number.
- **PayPal** (`FW_Membership_Gateway_PayPal`, REST, no SDK): settings mode sandbox|live, client_id,
  client_secret, webhook_id; token cached in a transient. One-off → Orders v2 (custom_id = payment id; capture on
  return or `CHECKOUT.ORDER.APPROVED`; `meta.capture_id`). Recurring → a PayPal product per plan and plan per
  (price, trial, setup fee, tax, coupon) in the price's `gateway_refs`; a once / repeating coupon is a discounted
  TRIAL cycle. Webhooks verified with `verify-webhook-signature`: ACTIVATED → paid; the first
  PAYMENT.SALE.COMPLETED attaches to a charged opening payment (`meta.sale_id`), later ones → `renewed()`;
  PAYMENT.FAILED → past due; CANCELLED → cancelled to the paid end; EXPIRED / SUSPENDED → ended; refunds by
  capture / sale id. `supports_switch()` false (PayPal needs the buyer to approve a revision).
- **Settings filters:** `unysonplus_membership_save_payment_settings( $out, $values, $old )`, action
  `unysonplus_membership_payment_settings_panels( $settings )`. Module tables:
  `FW_Membership_Installer::module_tables( $slug, $version, $schema_cb, $tables )` (dropped by Remove all data, which also deletes every `fw_ext_membership_*` option, the modules' included).
- **Emails** `receipt` and `payment_failed` join the catalogue (`unysonplus_membership_email_catalogue`);
  placeholders `{amount}`, `{payment_date}`, `{payment_ref}`. Account page: payment list + "Update your payment
  method" (via `unysonplus_membership_account_sections`). A deleted user's pending payments become `cancelled`;
  paid ones stay on record.

## Hooks

- **Events** (only `FW_Membership_Service` fires them; catalogue in `FW_Membership_Events::catalogue()`):
  `unysonplus_membership_{event}( array $membership, array $context )` then
  `unysonplus_membership_changed( string $event, array $membership, array $context )`. Events: `joined`,
  `trial_started`, `renewed`, `payment_failed`, `payment_recovered`, `plan_changed`, `paused`, `resumed`,
  `cancelled`, `reactivated`, `expired`, `refunded`. `$context`: `from`, `to`, `plan`, `actor_id`, `note`
  (+ `previous_plan_id` on `plan_changed`).
- **Access filters:** `unysonplus_membership_rule_passes( false, $rule, $persona )` (a module passes a rule on its
  own conditions — the CRM module's tags / segments go here), `unysonplus_membership_denied_html( $html, $post, $failing )`.
- **Filters:** `unysonplus_membership_capability` (default `manage_options`), `unysonplus_membership_nav`,
  `unysonplus_membership_modules` (add-on modules), `unysonplus_membership_default_currency` (default: the
  WooCommerce currency option, else `USD`), `unysonplus_membership_admin_action`.
- **Actions:** `unysonplus_membership_render_view`, `unysonplus_membership_account_sections( $user )`,
  `unysonplus_membership_payment_paid( $payment )` (first payments and renewals).
- **Account hooks (1.0.7):** filter `unysonplus_membership_account_action( 'failed', $action, $user )` (a module's
  own account POST action, nonce checked; return a notice code), `unysonplus_membership_account_notices`, action
  `unysonplus_membership_account_membership( $membership, $user )` (under each membership on the account page).
  An error notice shows the detail stored in transient `fw_mbr_notice_{user_id}`.
- **Payments filters:** `unysonplus_membership_gateways`, `unysonplus_membership_stripe_session`,
  `unysonplus_membership_renewal_grace_days`, `unysonplus_membership_email_catalogue`.

## Courses (phase 11, 1.0.16)

- **Module** `modules/courses/` (registry slug `courses`; nav item links to `edit.php?post_type=fw_course`).
  Post types `fw_course` (public, rewrite `courses`) and `fw_lesson` (rewrite `lessons`, shown under Courses); a
  lesson's course is its `post_parent`, its order `menu_order`, its module name meta `_fw_module`.
- **`FW_Membership_Courses`**: `lessons( $course )`, `outline( $course )` (`[ { title, lessons[] } ]` grouped by
  module), `access( $course )` (meta `_fw_course_access` { who plans | logged_in | open, plans[] }),
  `can_take( $course, $user )`, `sync_rule( $course )` — one managed rule per course (meta `_fw_course_rule`,
  title "Course: X", target `children` of the course, so the course page itself stays open; includes the
  course's pay-per-item plan `item-post-<id>` whenever it exists, even after the course comes off sale, so buyers
  keep the lessons). Lessons drop the theme's `unysonplus_post_nav` (Membership prints its own course-order
  previous / next). Runs on `save_post` priority **30** (after the item price saves);
  deleting the course deletes the rule.
- **`FW_Membership_Progress`** (tables `fw_mbr_course_enrollments` { user_id, course_id, enrolled_at,
  completed_at, last_lesson_id, certificate } and `fw_mbr_course_progress` { user_id, lesson_id, course_id, completed_at }, via
  `module_tables`): `enroll()`, `enrollment()`, `complete( $user, $lesson )` (true | WP_Error), `completed()`,
  `percent()`, `why_locked( $user, $lesson )` (null or the reason: lesson meta `_fw_drip_days` after enrolment,
  or an earlier gating quiz not passed), `neighbours()`, `resume_lesson()`, `bar()`, `outline_html( $course )`.
  Lesson / course pages get the outline, progress and the complete button through `the_content` (priority 9990);
  POST `fw_mbr_complete`; the account page gets a "Your courses" section. Actions
  `unysonplus_membership_course_enrolled( $user, $course )`, `_lesson_completed( $user, $lesson, $course )`,
  `_course_completed( $user, $course )`.
- **`FW_Membership_Quizzes`**: lesson meta `_fw_quiz` (text: `Q:` question, `*` right, `-` wrong, several `*` =
  multiple, True/False answers = truefalse, `=` typed answers, case and space blind), `_fw_quiz_pass` (default 70),
  `_fw_quiz_gate`. `parse()`, `questions()`, `grade( $qs, $answers )` → { score, right[] } (multiple needs all and
  only the right ones), `passed()`, `gates()`. Table `fw_mbr_quiz_attempts`; POST `fw_mbr_quiz`; action
  `unysonplus_membership_quiz_taken( $user, $lesson, $score, $passed )`. A lesson with a quiz completes only once
  it is passed.
- **`FW_Membership_Certificates`**: course meta `_fw_certificate` (on) and `_fw_certificate_page` (a designed
  page; 0 = built-in). Issued once on `course_completed` (code `C` + 11 chars, stored on the enrolment), emailed
  (email `certificate`, var `{certificate_url}`). `?fw_mbr_cert=<code>` renders it (404 for an unknown code,
  noindex); a designed page gets `{name} {course} {date} {code} {verify_url}` filled (escaped) plus a
  "Verified" bar; print CSS hides the theme chrome. `find( $code )`, `url( $code )`.
- **Element** `course_outline` (`shortcodes/course-outline/`, att `course`, `show_title`).

## Security and operations (phase 10, 1.0.15)

- **Core:** action `unysonplus_membership_access_denied( $denied, $post_id )` (Protect::act), member page hooks
  `unysonplus_membership_member_panels( $user_id )` / `_member_side_panels`, login form filter
  `unysonplus_membership_login_form_after( '', $redirect )`, `unysonplus_membership_login_method` (log label).
  `FW_Membership_Health` (admin): `jobs()` (core hourly + drip / retention daily while on: ok | late | never | off),
  `cron_line()`, Home card (replaced "Coming next"), Site Health test `fw_membership_jobs`. Last runs: option
  `fw_ext_membership_cron_last` (recorded by the service for every hook in `unysonplus_membership_cron_hooks`).
  `includes/class-fw-membership-cli.php`: `wp membership list|plans|grant|extend|expire|reconcile` (reconcile =
  expire_due + each Stripe / PayPal subscription's remote status → ended / past_due / cancelled / reactivated).
- **Security module** (`modules/security/`): `FW_Membership_Log` (table `fw_mbr_log`: user_id, type login |
  login_link | login_passkey | login_failed | denied | plan_changed | session_ended, object_id, detail, ip_hash
  HMAC, agent "Browser · OS"; 90-day prune from the hourly job; `places()` = distinct IP hashes in 30 days).
  `FW_Membership_Sessions`: plan setting `max_sessions` (largest set limit wins; managers exempt);
  `set_logged_in_cookie` → `enforce()` ends the least recently created sessions, keeping the new token.
  `FW_Membership_Magic_Links`: user meta `_fw_mbr_magic` { hash (wp_hash_password), expires (15 min), redirect };
  `?fw_mbr_magic=<uid>.<token>` on the account URL shows a POST "Log me in" (nonce `fw_mbr_magic`), single use;
  rate limit 1/min/address; same reply for unknown addresses. `FW_Membership_Passkeys`: REST
  `passkeys/register/options|register|login/options|login`; CBOR reader, COSE EC2 P-256 (ES256) and RSA
  (RS256) → PEM; checks challenge (transient, one use, 5 min), origin, rpIdHash, UP flag, `openssl_verify`, sign
  counter; user meta `_fw_mbr_passkeys` (list; `all()` ignores the '' an empty meta returns),
  `_fw_mbr_passkey_handle`; JS `static/js/passkeys.js`; the login button on Membership forms and wp-login.php;
  the redirect goes through `login_redirect` like a password login. Tested with Chromium's virtual authenticator.
- **Export (core, 1.0.20):** `includes/class-fw-membership-export.php` — `FW_Membership_Export::columns()`
  (the importer's `COLUMNS` first, then membership_id, user_id, display_name, plan_name, source, trial_ends_at,
  cancelled_at, created_at), `row( $m )`, `write( $fh, $query_args )` (BOM, pages of 500, cells starting
  = + - @ prefixed with '). Admin action `export_members` (Members list button, keeps status / plan_id / q);
  `wp membership export [file] [--plan] [--status]`. Filters `unysonplus_membership_export_columns`,
  `unysonplus_membership_export_row( $row, $m )`. A re-import on the same site skips every row.
- **Importers module** (`modules/importers/`): `read_csv()` (comma or semicolon, BOM), `import_rows( $rows, {
  dry_run, create_users, notify, default_plan (used when the plan cell is empty) } )` (columns email, first_name, last_name, plan, status,
  started_at, ends_at, renews_at, gateway, subscription_id, customer_id; source `import`; skips what is already
  there), `import_from_users( role|meta, $map, $meta_key, $dry )`. View `import` (upload → match → dry run → run).

## Reports (phase 9, 1.0.14)

`modules/analytics/` (module slug `analytics`; un-"Soon"s the Reports nav item). `FW_Membership_Reports`:
`monthly( $price )` (day ×30.4375, week ×30.4375/7, month ×1, year ÷12, ÷ interval_count; one-off 0);
`active_at( $at, $paying_only )` = started_at ≤ at < ends_at (or no end), not pending / refunded (paying: not in
a trial, has a price); `mrr( $at )` { total: currency → amount, plans, members }; `monthly_table( $n )` per Y-m {
start_members, new (joined / trial_started events), upgrades / downgrades (plan_changed, by plan value), lost
(expired / refunded from an access status, not `replaced`), churn %, failed, recovered, revenue, mrr }; `ltv()`;
`trials( $days )`; `money_list()`. `FW_Membership_Cohorts`: table `fw_mbr_content_views` (post_id, period Y-m,
views) counted at `template_redirect` 50 for a member with plans opening a protected item they may see (not
previews, not editors); `by_month( $n )` retention grid (people by first start; seats excluded), `by_source()`,
`top_content()`. View `reports`; action `reports_csv`. Chart: `fw_mbr_bar_chart( $values, $title )` inline SVG.

## WooCommerce (phase 8, 1.0.13)

`modules/woocommerce/` (loads only with WooCommerce). **Grants:** product meta `_fw_mbr_grant_plan` (a variation
uses its parent's); `woocommerce_order_status_processing` / `_completed` → `grant_for_order()` once per item
(order item meta `_fw_mbr_membership_id`; a held plan is extended; guests: `wc_create_new_customer()` from the
billing email, or the existing account with that email); `_refunded` / `_cancelled` / `_failed` → expire what
that order granted (source_ref `order:<order>:<item>`). Subscriptions add-on: `woocommerce_subscription_status_updated`
→ active (grant / reactivate / renew_until next payment), on-hold (payment_failed), pending-cancel (cancel to the
paid end), cancelled / expired (expire); source_ref `wcs:<id>`. **Perks** (`FW_Membership_Woo_Perks`): plan
settings `woo_discount` (%), `woo_discount_cats` (product_cat ids), `woo_free_shipping`; `perks()` = best discount
of the persona's plans; price filters on `woocommerce_product(_variation)_get_price / _sale_price` and variation
prices (+ `woocommerce_get_variation_prices_hash`); never dearer than a running sale; badge "Member price"
(`woocommerce_sale_flash`). Free shipping zeroes `woocommerce_package_rates`. Product meta `_fw_mbr_only` (plan
ids) → `woocommerce_is_purchasable` false for others + a "For members of …" notice. Product data tab
"Membership" (nonce `fw_mbr_product`). Plan fields via `unysonplus_membership_plan_option_fields`.

## Groups, directory and cards (phase 7, 1.0.12)

- **Core:** plan form hooks `unysonplus_membership_plan_option_fields( $plan )` and filter
  `unysonplus_membership_plan_settings( $settings, $posted, $existing )`; account filter
  `unysonplus_membership_account_guest_takeover( '' )` (logged-out branch); `FW_Membership_Service::flush_cache()`;
  profile field definitions gained `directory` hidden|members|public (editor shows it while the Directory module
  is on).
- **Groups** (`modules/groups/`): plan setting `team_seats`. Tables `fw_mbr_groups` (owner_id, membership_id
  UNIQUE, plan_id, name, seats, join_code, domain, status active|ended) and `fw_mbr_group_members` (group_id,
  user_id, email, status invited|active|removed, token, membership_id). A team is made on joined /
  trial_started / plan_changed of a non-seat membership on a team plan; `sync()` on every owner event keeps
  seats (source `group_seat`, source_ref = group id, same plan, owner's ends_at) in step: pause / resume /
  cancel / reactivate / expire. `seat( $g, $uid, $invite_row )`, `unseat()`, `invite( $g, $emails )` (invites
  hold seats; email `team_invite` with `account_url?fw_mbr_team=<token>`), join link
  `?fw_mbr_team_code=<code>`, domain join on `wp_login` (public mail domains refused). Join page via the account
  takeovers (logged in or guest, with sign-up), POST `fw_mbr_team_join` (nonce `fw_mbr_team`). Account actions
  team_invite / team_remove / team_domain / leave_team (seat members get "Leave the team" instead of cancel).
  View `groups`.
- **Directory** (`modules/directory/`): option `fw_ext_membership_directory` { view members|public, listing
  opt_in|opt_out, plans }; user meta `_fw_mbr_directory` '1' / '0'. `query( { search, fields, page, per_page } )`
  searches the name and only fields `visible_fields()` allows; field filters ignore fields the viewer cannot
  see. `card( $user )` = name, avatar, slug, visible fields (never the email). Element `member_directory`
  (per_page, show_search, show_filters; `?member=<nicename>` profile, `?q=`, `?f[key]=`, `?pg=`).
- **Cards** (`modules/cards/`): option `fw_ext_membership_cards` { prefix, color }; number = prefix + 6-digit
  user id. QR (bundled MIT generator `static/js/vendor/qrcode.min.js`, drawn in the browser) encodes
  `?fw_mbr_check=<membership id>.<HMAC 20>`; the check page shows valid / not valid to anyone, and the person +
  a Check in button (nonce `fw_mbr_checkin`, history event `check_in`, action
  `unysonplus_membership_checked_in`) to `unysonplus_membership_checkin_capability` (default the Membership
  capability). Full-screen card `?fw_mbr_card=1`.

## Keeping members (phase 6, 1.0.11)

- **Core:** `FW_Membership_Service::pause( $id, $until, $note )` (status paused, meta paused_from / paused_until /
  paused_was; event paused) and `resume( $id )` (no subscription: ends_at + paused time; event resumed). Gateway
  methods `pause( $m, $until_unix )`, `unpause( $m )`, `discount( $m, $percent, $months )` (base: WP_Error /
  true); Stripe: `pause_collection` void + resumes_at, a cached retention coupon (option
  `fw_ext_membership_stripe_retention_coupons`) in `discounts`; PayPal: suspend / activate (a suspension while
  paused is not an end). Stripe webhook: `customer.subscription.updated` with no pause_collection on a paused
  membership → `Flow::unpaused()`; `invoice.upcoming` → action `unysonplus_membership_renewal_upcoming( $m, {
  date, amount, currency, card_exp_month, card_exp_year, card_last4 } )`. Filters
  `unysonplus_membership_email_vars( $vars, $key, $user )`, `unysonplus_membership_account_takeover( '', $user
  )`, `unysonplus_membership_account_cancel_html( $html, $m )`, `unysonplus_membership_cron_hooks`
  (uninstall).
- **Retention module** (`modules/retention/`): option `fw_ext_membership_retention` (grace_days, dunning_days
  "3,7", card_expiring, pause, pause_max, cancel_flow, reasons, offer coupon|pause|downgrade|none,
  offer_percent, offer_months, remind_renewal / remind_trial / remind_expiring days, winback, winback_days,
  winback_percent); daily cron `fw_mbr_retention_daily` (resume_due, follow_ups, reminders). Once-only sends
  are tracked in membership `meta.sent` (`FW_Membership_Retention::once()`). Dunning: grace via
  `unysonplus_membership_renewal_grace_days`; `{update_card_url}` = HMAC link `?fw_mbr_card=<uid>&e=&s=`
  (14 days; requires being logged in as that user, then `manage_url()`); emails payment_reminder,
  card_expiring. Pause: account actions pause / unpause; `can()` needs a gateway that implements `pause()`.
  Cancel flow: `?fw_mbr_leave=<id>[&step=offer]` takes over the account page; actions leave_reason (logs
  `cancel_reason` {reason}), leave_accept (`cancel_saved` {offer}), leave_confirm (`cancel_confirmed` +
  cancel); `offer()` falls back to a pause. Reminders: renewal_reminder, trial_ending, expiring_soon
  ({renew_url}), win_back (a `BACK-…` single-use coupon, batch win-back, 30 days). View `retention`.
- **Gifts module** (`modules/gifts/`, needs Payments): table `fw_mbr_gifts` (code GIFT-…, plan, price,
  payment_id, buyer_id, recipient_email / name, message, status pending|sent|redeemed|cancelled, redeemed_by,
  redeemed_at, membership_id). `?gift=1` on the checkout: quote filter (priority 5) makes it one-off;
  `unysonplus_membership_checkout_start` runs the gift checkout (payment with membership_id 0, meta gift);
  `paid()` on a payment with no membership fires `unysonplus_membership_payment_paid_other` → gift sent, emails
  gift_received (to the recipient, via the `$to` override) and gift_sent. Redeem: `?redeem=CODE` through
  `unysonplus_membership_checkout_takeover`; POST `fw_mbr_redeem` (nonce `fw_mbr_redeem`) makes / logs in the
  account and grants one period (or extends a held plan), source gift. View `gifts` (send again, cancel).
  A gift code typed into the checkout's `coupon` box redirects to its redeem page (`_code_box`, template_redirect
  priority 2); the box shows whenever Gifts is on. A gift goes to Stripe at its final price, so the Coupons
  Stripe-session filter skips payments with `meta.gift` (no double discount). Pricing Plans att `gift_text`
  (empty hides the link); the gift checkout summary reads "X for N months" / "A gift: one payment, nothing renews".

## Content tools (phase 5, 1.0.10)

- **Core hooks:** `unysonplus_membership_rule_opens_at( 0, $rule, $persona )` (local unix time; a passed rule
  that opens later counts as failing, and `failing()` returns `opens_at`), `unysonplus_membership_main_denied(
  $denied, $post )` (the one verdict for the viewed page, cached in `FW_Membership_Protect`),
  `unysonplus_membership_prompt_args( $args, $failing, $post )` (title, message, show_plans, show_login,
  button_text, button_link), `unysonplus_membership_item_unlocked( false, $post, $persona )` (checked in
  `denied_for_post()` and `can()` before the rules), rule form hooks `unysonplus_membership_rule_option_fields`,
  settings hooks `unysonplus_membership_settings_panels` / `_save_settings`. Rules gained `drip_days`,
  `drip_date` and `denied.metered`. `FW_Membership_Rules::flush()` also flushes the access cache.
- **Drip** (`modules/drip/`): `opens_at()` = max( drip_date, joined + days ); joined = earliest started_at of an
  access membership whose lineage meets the rule's plans (any plan when none), else the account's registration;
  a preview persona = today. Prompt "opens in N days"; account section "Coming up for you" (post targets);
  daily cron `fw_mbr_drip_daily` emails `drip_opened` ({items}) for what opened since option
  `fw_ext_membership_drip_last_run`.
- **Metered** (`modules/paywall/`): option `fw_ext_membership_paywall` { visitor_limit, account_limit, period
  day|week|month }. Only on `main_denied` for GET, non-preview, people with no plan, rules with `denied.metered`.
  Reads = { p: period key, ids } in HMAC-signed cookie `fw_mbr_reads` (visitors) or user meta `_fw_mbr_reads`.
  `use_read()`; `$read` drives the "N left" note (the_content 10000), `$out` the used-up prompt.
- **Files** (`modules/files/`): tables `fw_mbr_files` (title, stored, original, mime, size, who json { plans,
  any_member, logged_in }, monthly_limit, downloads, status) and `fw_mbr_downloads` (file_id, user_id, ip_hash
  HMAC, created_at). Folder `uploads/unysonplus/membership-files-<random>` (option
  `fw_ext_membership_files_dir`) with .htaccess / web.config deny + index.php; random stored names;
  `wp_check_filetype_and_ext()` on add. Served at `init` 99 via `?fw_mbr_download=<id>` after `refuse()`
  (access, then monthly limit); filter `unysonplus_membership_file_send` for X-Sendfile; action
  `unysonplus_membership_file_downloaded`. Admin view `files` ("Downloads" in the main nav). Element
  `member_download` (file, button_text, show_details).
- **Pay per item** (`modules/payments/class-fw-membership-single-purchase.php`): `sell( post|file, $id, $title,
  $amount, $days )` keeps a hidden plan `item-<type>-<id>` (settings item_type, item_id; priority -100; one
  `once` price; 0 = archived, buyers keep it). `FW_Membership_Plans::is_item()` hides them from the pricing
  element, REST `/plans` and plan switching. Posts: editor box "Sell on its own"; `item_unlocked` when the
  persona holds the plan; prompt button "Buy this for …". Files: the item plan joins the file's who.plans;
  the download element offers "Buy it for …". Checkout thanks page links straight to the item.

## The CRM connection (phase 4, built in 1.0.9)

`modules/crm/` (auto-on while the CRM is active; returns early if `FW_CRM_Contacts` is missing). Settings option
`fw_ext_membership_crm` { contacts, tags, tag_prefix (member-), status_tags, timeline, fields, failed_task } as a
panel in Membership → Settings (hooks `unysonplus_membership_settings_panels` / `_save_settings`) with a
`crm_sync_all` button.

- **Identity** — `FW_Membership_CRM_Identity::contact_id( $uid, $create )`: `id_for_user`, else `Contacts::create`
  (upserts by email, source membership) + `link_user`; a link error (contact owned by another user) → 0, left
  alone. `profile_update` pushes email / first / last name to the contact (user → contact only).
- **Sync** — `FW_Membership_CRM_Sync::sync_user( $uid )` on `unysonplus_membership_changed` (priority 20) and
  `unysonplus_crm_contacts_merged`: wanted = plan tags of memberships with access (+ `member` / `former-member`),
  each claimed with `Lists::get_or_create( …, [ 'managed_by' => 'membership' ] )`, added with `Tags::add( …,
  'membership' )`; managed slugs not wanted are removed with `Tags::remove()`. Never `set_lists`.
- **Conditions** — rule `who.extra.crm` { tags, lists, segments } (rule form hook
  `unysonplus_membership_rule_who_fields`, save filter `unysonplus_membership_rule_who_extra`); answered on
  `unysonplus_membership_rule_passes` with `user_has()` / `Segments::contact_matches()`. A preview persona
  always fails. A rule whose only conditions are module ones is no longer treated as "any member".
- **Timeline** — activity types `membership` / `membership_payment`; contact panel `membership`; CRM nav item
  `membership` (url + cap); optional follow-up task on `payment_failed` via `FW_CRM_Tasks::create`.
- **Automations** — the agreed contract (crm.md → "Automation registration"): triggers `membership.{joined,
  trial_started, renewed, payment_failed, cancelled, expired, plan_changed}` with a lazy plan_id select;
  actions `membership.{grant_plan, extend, cancel}` as `callback( $contact_id, $settings, $context )` (no
  current user); `do_action( 'unysonplus_crm_automation_event', $slug, $contact_id, $context )` with plain
  context (plan_id, plan_name, membership_id, user_id, status, expires_at, renews_at, previous_plan_id, dedupe).
- **Summary** — managed contact fields `membership_status`, `membership_plans`, `membership_since`,
  `membership_renews_at`, `membership_ends_at`, `membership_total_paid` (defined once, option
  `fw_ext_membership_crm_fields_v1`); dates feed the CRM's "date reached" trigger instead of "N days before"
  triggers. CRM Home card `membership`.

### The CRM API it uses (background)

Membership never requires the CRM and never touches `fw_crm_*` tables or `crm/` files. The CRM provides
the extension API it will use (CRM 1.0.43–1.0.44): `FW_CRM_Contacts::find_by_user / id_for_user / link_user
/ unlink_user`, `FW_CRM_Subscribers::has_lists / add_to_list / remove_from_list` (never `set_lists` — it
replaces the whole tag set), `FW_CRM_Lists::get_or_create( $slug, 'tag', [ 'managed_by' => 'membership' ] )`,
managed custom fields via `FW_CRM_Fields`, `FW_CRM_Segments::contact_matches`, `FW_CRM_Activity::log`, and the
`unysonplus_crm_contact_panels`, `_activity_types`, `_dashboard_cards`, `_nav` filters. See `crm.md` →
"Extension integration API". Email sync is user → contact only.

CRM conditions in rules will be answered on `unysonplus_membership_rule_passes`. **Preview edge (from the CRM
owner):** `FW_CRM_Contacts::user_has( 0, $slugs, 'none' )` — and `has_lists` for contact 0 with `none`, or `all`
on an empty list — returns **true** (a visitor holds no tags, so "has none of" is literally true). That is right
for a real logged-out visitor, but a "View as" preview persona also has `user_id` 0, so a "has none of tag X"
condition would pass in a preview. Short-circuit on `$persona['preview']` before calling the CRM so previews
fail closed. `contact_matches()` already returns false for contact 0. Use `FW_CRM_Tags::add / remove(…,
'membership')` for the tag mirror (create the tag first with `get_or_create(…, [ 'managed_by' => 'membership' ])`),
and ignore your own echoes on `unysonplus_crm_tag_added / _removed` by checking `$source`.

## Notes / gotchas

- **Content leaks through the head, not only the body.** The SEO extension builds the meta description,
  social tags and structured data from the post text on `wp` (before `template_redirect`); Membership hands it
  the teaser through `fw_seo_post_text` (empty for not_found / redirect / login denials). A "not found" denial
  also empties `$wp_query->posts` / `queried_object` and the global `$post`, or a 404 template running a loop
  would print the content. The requested item is remembered by id after it is judged, because once the query
  is cleared `is_singular()` no longer recognises it.
- **The shared display-conditions gate returns early** when an element sets none of its own conditions, so
  `fw_sc_display_conditions` never fires for a "members only" element: Membership runs its own
  `do_shortcode_tag` gate (priority 11) that checks `mbr_show` first and decodes atts only when needed.
- **Every rule is a lock** (all applicable rules must pass); the most specific failing one (item 60, post 50,
  children 40, term 30, archive 25, post type 20, url 15, site 10; then priority) decides what is shown.
- **Plan roles never include unsafe caps** (`FW_Membership_Access::UNSAFE_CAPS`: manage_options, user and
  plugin/theme management, unfiltered_html…). Editor is therefore not offered (it holds unfiltered_html).
- Caches are per request and reset on change: plan list (`FW_Membership_Plans::$generation`), a user's plans
  (cleared in `FW_Membership_Service::record()`), granted caps, applicable rules.

- **Keep the app shell in step with the CRM's.** `class-fw-membership-app.php`, `static/css/app.css` and
  `static/js/app.js` mirror the CRM's; port shell changes across. Membership-only CSS goes below the divider
  at the end of `app.css`.
- **Admin-skin specificity:** the skin uppercases `body.upa table.widefat thead th`; to override inside the
  app, use at least `.fw-mbr-app .fw-mbr-body table.<class> thead th`.
- Dates are local site time (`current_time( 'mysql' )`); `ends_at` NULL = never ends.
- Working rules for editing the extension: `framework/extensions/membership/AGENTS.md`.
