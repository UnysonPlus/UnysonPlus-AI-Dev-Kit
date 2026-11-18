<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# payments extension

The shared payments core: every extension that takes money (Shop; Membership, Forms and
Bookings) asks it for a payment and listens for the result. **How you get it:** it is **hidden** (not in
**Unyson+ → Extensions**) and not in the core-only zip. It is installed and activated on demand:

```php
$r = fw_ext_ensure_active( 'payments' );   // core helper; true | WP_Error
```

Call it from the admin action that switches a paid feature on (needs a user who may manage extensions; the
extension loads from the NEXT request). No extension lists `payments` under `requirements`. Guard every call into
it with `class_exists( 'FW_Payments' )`. Public page: https://docs.unysonplus.com/extensions/payments

**Version 1.0.7 takes one-off payments and subscriptions, with coupons, tax by country and numbered invoices,
through nine providers.** Membership uses it through `FW_Membership_Gateway_Bridge` (a new install starts on it;
`engine` = `own` | `payments`), Forms and Bookings through `FW_Forms_Gateway_Bridge` (`payments_engine` = `''`
Automatic | `own` | `payments`). Nothing sold before is moved between systems. **None of the providers has run
against a real merchant account**: the tests answer each provider's API with a stand-in.

## Provides

- **Tables** (`FW_Payments_Installer`): `{prefix}fw_payments_charges` (source, source_id, reference, status,
  gateway, method, gateway_ref, mode test|live, amount, tax, refunded, currency, user_id, email, name, country,
  description, line_items JSON, meta JSON, created_at, updated_at, paid_at) and `{prefix}fw_payments_events`
  (append-only history: charge_id, event, amount, note, created_at).
- **Table `{prefix}fw_payments_subscriptions`** (`FW_Payments_Subscription_Store`): source, source_id, status,
  gateway, method, gateway_ref (the provider's subscription id), mode, amount, currency, bill_unit
  day|week|month|year, bill_count, trial_days, setup_fee, customer columns, description, meta JSON (discount,
  tax, customer, retention), period_end, paused_until, ended_at. Charges carry `subscription_id` and `type`
  payment|renewal|extra.
- **Statuses:** `pending` → `waiting` (told how to pay) → `paid` | `failed` | `cancelled` → `part_refunded` |
  `refunded`. A `failed` or `cancelled` charge can still become `paid` (a bank payment that cleared late, money that arrived after the payment was given up on): money received is always recorded, and the source decides what to do with it (the Shop marks the order paid).
- **Service** (`FW_Payments`, the only place a status changes):
  - `methods( [ currency, country?, amount?, recurring? ] )` → `"gateway:method" => { gateway, method, label,
    description, delayed }` for providers that are on and ready.
  - `charge( [ source, source_id, amount (tax included), tax, currency, description, reference?, line_items?
    [ { label, amount, quantity } ], customer { user_id, email, name, country }, gateway, method, urls
    { success, cancel }, meta? ] )` → `WP_Error` or `{ id, status: pending|waiting|paid, redirect?, instructions? }`.
  - `get( $id )`, `for_source( $source, $source_id )`, `instructions( $charge )`, `returning()` (the charge named
    by the current request's return link, `?fw_pay=&fw_pay_key=`), `return_url( $url, $charge )`.
  - `refund( $id, $amount = null, [ online => true, note ] )` (through the provider when it can),
    `record_refund( $id, $amount, $note )`, `sync_refunded_total( $id, $total, $note )`.
  - For providers: `paid( $id, [ gateway_ref?, amount?, tax?, meta?, note? ] )`, `waiting()`, `failed()`,
    `cancelled()`. Each returns true only when that call made the change.
- **Subscriptions** (`FW_Payments_Subscriptions`, the only place a subscription's status changes; billed by the
  provider, never by WP-Cron). Statuses `pending` → `trialing` | `active` → `past_due` | `paused` | `cancelling`
  (renewals stopped, runs to period_end) → `ended`.
  - `start( [ source, source_id, amount (one period), currency, bill_unit, bill_count?, trial_days?, setup_fee?,
    discount? { type percent|fixed, amount, duration once|repeating|forever, months, code }, tax? { rate,
    inclusive, label, country } | { automatic, vat_ids }, due_now?, tax_now?, description, customer, gateway,
    method, urls ] )` → `WP_Error` or `{ id, charge_id, status: pending, redirect }`. Offer methods with
    `FW_Payments::methods( [ 'recurring' => true ] )`.
  - Site asks: `cancel( $id, $now = false )`, `resume()`, `pause( $id, $until )`, `unpause()`,
    `switch_price( $id, [ amount, bill_unit, bill_count?, description? ], prorate|none )`,
    `discount( $id, $percent, $months )`, `manage_url( $id, $return_url )`. Provider first; applied here only
    when it agreed. PayPal has no switch and no resume.
  - Read: `get()`, `for_source()`, `charges()`.
  - Providers report: `activated()` (BEFORE the first charge's `FW_Payments::paid()`), `trial_ended()`,
    `renewed( $id, [ ref, amount, currency?, period_end, meta? ] )` (once per `ref`), `renewal_failed()`,
    `extra_charge()`, `cancel_scheduled()`, `resumed()`, `paused()`, `unpaused()`, `ended()`, `upcoming()`.
  - Hooks `unysonplus_payments_subscription_{activated|trial_ended|past_due|cancelling|resumed|paused|unpaused|
    ended|changed}` `( $subscription, $ctx )` with `$ctx['by']` site|provider;
    `…_{renewed|renewal_failed|extra_charge}` `( $subscription, $charge )`; `…_upcoming ( $subscription, $data )`.
- **Hooks:** `unysonplus_payments_{created|waiting|paid|failed|cancelled}` `( $charge )`,
  `unysonplus_payments_refunded ( $charge, $amount )`, `unysonplus_payments_changed ( $charge, $old_status )`.
  Fired once per change. Listeners must check `$charge['source']`.
- **Filters:** `unysonplus_payments_gateways` (register providers), `unysonplus_payments_methods`,
  `unysonplus_payments_stripe_session`, `unysonplus_payments_stripe_subscription_session`,
  `unysonplus_payments_paymongo_session`, `unysonplus_payments_paymongo_api_version` (v1|v2),
  `unysonplus_payments_xendit_channels`, `unysonplus_payments_xendit_invoice`, `unysonplus_payments_mollie_payment`,
  `unysonplus_payments_razorpay_link`, `unysonplus_payments_razorpay_currencies`,
  `unysonplus_payments_paystack_transaction`, `unysonplus_payments_mercadopago_preference`,
  `unysonplus_payments_sources`, `unysonplus_payments_capability`.
- **Coupons** (`FW_Payments_Coupons`; tables `fw_payments_coupons`, `fw_payments_coupon_uses`): `check( $code, $ctx )`
  → coupon | `WP_Error` (ctx: `source`, `currency`, `amount?`, `items? [ { type, id, terms?, amount } ]`,
  `customer? { user_id, email }`), `discount( $coupon, $ctx )`, `for_subscription( $coupon )`, `label()`,
  `save( $data, $id )`, `find( $code )`, `get()`, `query()`, `delete()` (archives one that was used), `uses( $id, $customer? )`.
  Fields: `code`, `type` percent|fixed, `amount`, `currency`, `duration` once|repeating|forever, `months`,
  `sources[]`, `items[]` (`plan:5`, `product:12`, `category:3`), `max_uses`, `per_customer`, `min_amount`,
  `first_only`, `starts_at`, `expires_at`, `status` active|archived, `note`. The SELLER checks and does the sum, then
  passes `coupon` + `discount` to `FW_Payments::charge()` / `coupon` to `FW_Payments_Subscriptions::start()`;
  Payments holds a use on `created`, counts it on `paid`, releases it on `failed` / `cancelled`. Filter
  `unysonplus_payments_coupon_check`.
- **Tax** (`FW_Payments_Tax`; option `fw_ext_payments_tax` = `{ enabled, inclusive, country, label, other, rates:
  [ { country, rate, label } ] }`): `calculate( $amount, $country, $currency )` → `{ rate, label, country, inclusive,
  net, tax, gross }`, `rate_for( $country )`, `for_subscription( $country )` (the `tax` arg, or null),
  `report( $from, $to )`, `settings()`, `save_settings()`, `is_on()`. Payments never adds tax by itself. Filter
  `unysonplus_payments_tax_rate`.
- **Invoices** (`FW_Payments_Invoices`; table `fw_payments_invoices`; option `fw_ext_payments_invoices`; OFF by
  default): on `paid` the next invoice number, on `refunded` a credit note; each row's `data` is a snapshot.
  `for_charge( $id )`, `link( $charge_id )`, `url( $doc )` (`?fw_invoice=ID&k=KEY`), `html( $doc )`, `issue()`,
  `credit()`, `query()`, `count()`. Hook `unysonplus_payments_invoice_issued ( $doc, $charge )`; filter
  `unysonplus_payments_invoice_for ( $yes, $charge )` (Membership returns false for its own).
- **Who uses it** (`FW_Payments_Migrate::report()` → `who => { label, system: shared|own, running, waiting,
  settings }`, `advice( $row )`; read-only; filter `unysonplus_payments_users`).
- **Providers** (`FW_Payments_Gateway`; one class per provider, which reports its methods through
  `methods( $ctx )`): `stripe` (Stripe Checkout, hosted page), `paypal` (PayPal Orders), `paymongo` (the
  Philippines, PHP only, one-off only, minimum 20; methods `gcash`, `paymaya`, `qrph`, `card`, `grab_pay`, `dob`,
  `billease`, each switched on or off in its settings as `method_<type>` yes|no; the first four on by default),
  `offline` (bank transfer / cash; `delayed`, marked as received by an admin). A charge for a PayMongo method is
  `gateway => 'paymongo', method => 'gcash'`. Regional, all one-off only, hosted page, online refunds:
  `xendit` (PHP, IDR, MYR, THB, VND; method `any` = Xendit's page with all the account has, on by default;
  named methods `gcash`, `maya`, `qrph`, `qris`, `ovo`, `dana`, `promptpay`, `touchngo`, `otc`, `bank`… off by
  default as `method_<id>`; amounts in the main unit; webhook checked by the `x-callback-token` header),
  `mollie` (methods asked from Mollie's `/v2/methods` per currency and cached an hour, or one method `mollie`
  with setting `choose` = `page`; its webhook posts only an id, the payment is read back), `razorpay` (INR;
  Payment Links; method `razorpay`; `X-Razorpay-Signature`), `paystack` (NGN, GHS, ZAR, KES, XOF, USD; method
  `any` + `card`, `bank_transfer`, `ussd`, `mobile_money`, `eft`, `qr`; needs the payer's email;
  `x-paystack-signature` SHA-512), `mercadopago` (ARS, BRL, CLP, COP, MXN, PEN, UYU; Checkout Pro; method
  `mercadopago`; pending cash vouchers put the charge in `waiting`; its webhook names a payment id, read back).
  Base-class helpers for a new provider: `refund_reported( $charge, $refund_id, $amount )`, `is_local()`,
  `offer_field()` / `offers()`.
- **Settings:** one option `fw_ext_payments` = `{ currency, gateways: { id: { enabled, …fields } } }`
  (`FW_Payments_Gateways::settings() / save_settings() / currency()`). On first run the keys already saved in
  Membership or Forms are copied in; webhook secrets are not (the addresses differ).
- **REST:** `POST /wp-json/fw-payments/v1/webhooks/{provider id}` (public; each provider verifies the request).
- **Admin:** menu **Payments** (`admin.php?page=fw-payments`): the list, one payment with history and the
  mark-as-received / cancel / refund actions, **Subscriptions** (`fw-payments-subscriptions`, shown once one
  exists; stop / keep renewals), **Coupons** (`fw-payments-coupons`), **Tax and invoices** (`fw-payments-tax`;
  tabs Settings, Tax report, Invoices; CSV downloads) and **Settings** (`fw-payments-settings`; a provider that is
  off keeps its fields folded; the top panel lists who takes payments through it). Hooks
  `unysonplus_payments_admin_side ( $charge )`, `unysonplus_payments_admin_settings_top`.
- **Money** (`FW_Payments_Money`): `code()`, `decimals()`, `round()`, `minor_units()`, `from_minor()`,
  `plain()`, `format()`. Amounts are decimals in the main unit; zero-decimal currencies are whole.

## Notes / gotchas

- **Never set `standalone = true`** in its manifest: with `display = false` the Extensions manager would then
  activate it on every site.
- **A provider never writes a status.** It reports to the service, which moves the row only from the expected
  status in one UPDATE; a repeated webhook changes nothing and fires no second hook.
- **Ids given to a provider are tagged**: `FW_Payments_Gateway::tag( $id )` → `fwpay-12`, `untag()` back.
  Never a bare row id (the same notification can reach another extension's older webhook address).
- Things made at a provider once (coupons, tax rates, prices, plans) are remembered per mode in the options
  `fw_ext_payments_stripe_refs` / `fw_ext_payments_paypal_refs`.
- Stripe reports the refunded TOTAL (`sync_refunded_total`); PayPal reports single refunds, de-duplicated by the
  refund ids kept in the charge's `meta.refund_ids`.
- A regional provider's reported refunds go through `refund_reported()` (ids in `meta.refunds_seen`, the sum in
  `meta.refunds_reported`), so a refund counts once whether it started on the site or in the provider's dashboard.
- **Coupon uses are counted only by Payments.** Membership (`FW_Membership_Coupons::get_by_code()`) and Forms
  (`FW_Forms_Coupons::check()`) fall back to the shared list while they are on the shared system, and keep their
  own lists next to it (their own code wins).
- A renewal paid on a retry of the invoice that failed reuses the failed charge (same provider reference).
- The tables are never dropped when selling stops: they are payment records.
- Working rules for editing it: the extension's own `AGENTS.md`.
