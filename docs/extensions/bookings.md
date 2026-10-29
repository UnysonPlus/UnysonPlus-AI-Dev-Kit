<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# bookings extension

Reservations for rooms, rentals, tables and appointments. **How you get it:** not in the core-only plugin zip —
download + activate it from **Unyson+ → Extensions**. Works best with **forms** (the booking field and action);
without Forms the bookables, admin and REST availability still work.

## Provides

- **Post type `fw_bookable`** (Bookings → Bookables): one per room / rental / table / service. Settings (meta
  `_fw_bookable`, `FW_Bookings_Bookables::settings( $id )`):
  `mode` nights|slots · `units` (how many at once) · `max_guests` · `confirm` manual|auto · `hold_pending` yes|no ·
  `notify_email` · `horizon_days` · nights: `base_rate`, `seasons` (lines `Name | MM-DD | MM-DD | rate`),
  `min_nights`, `max_nights`, `cleaning`, `deposit`, `checkin_time`, `checkout_time` · slots: `hours` (lines
  `Mon-Fri | 09:00-12:00, 13:00-17:00`), `slot_minutes`, `buffer_minutes`, `lead_hours`, `slot_price`, `per_person`.
- **Table `{prefix}fw_bookings`** (`FW_Bookings_Store`): ref, bookable_id, kind booking|block, status
  pending|confirmed|declined|cancelled, start_at / end_at (site time), units, guests, name, email, phone, notes,
  total, deposit, currency, source, entry_id, user_id, paid, crm_contact, crm_deal, extras (JSON), reminded_at,
  thanked_at (schema 1.2.0).
- **Availability** (`FW_Bookings_Availability`): `check( $id, $pick )` → span or message; `full_nights()`, `slots()`,
  `quote_nights()`, `quote_slot()`, `when()`, `public_config()`.
- **Service** (`FW_Bookings_Service`): `book( $id, $pick, $guest )` (under a MySQL lock), `block()`, `decide( $id,
  'confirm'|'decline'|'cancel' )`, signed owner links `?fw_booking=&do=&exp=&sig=` (30 days).
- **REST:** `GET /wp-json/fw-bookings/v1/availability?bookable=&from=&to=` → `{ mode:'nights', full:[…] }` or
  `{ mode:'slots', days:{ 'Y-m-d':[ { t, end, left } ] } }`. Public; says when, never who.
- **Forms:** field type `booking` (options `bookable`, `choose`, `months`, `guests_label`), action `bookings_reserve` (on by
  default, idle without the field; option `action_bookings_reserve_emails`), answer tags `{booking_ref}`,
  `{booking_item}`, `{booking_when}`, `{booking_nights}`, `{booking_guests}`, `{booking_total}`, `{booking_deposit}`,
  `{booking_extras}`, starters `bookings_stay` and `bookings_appointment`.
- **Sync (since 1.0.1):** setting `ical_import` (one URL per line), `FW_Bookings_ICal::sync( $id )`, `export_url( $id )`
  (`?fw-bookings-ical=<id>-<token>`); imported events take every unit.
- **Guest page (since 1.0.1):** `FW_Bookings_Manage::url( $booking )` (`?fw_booking_ref=&t=`), settings `guest_cancel`,
  `cancel_hours`; filter `fw_ext_bookings_guest_mail`.
- **Calendar (since 1.0.1):** Bookings → Calendar (`admin.php?page=fw-bookings-calendar&m=YYYY-MM`) with an "Add a
  booking" form; `FW_Bookings_Service::book()` accepts `status` in the guest array.
- **Paying online (since 1.0.2):** settings `pay_online` (no|full|part), `pay_percent`, `confirm_paid`, `pay_hold_minutes`;
  the booking adds a line to the Forms order, so the form needs the **Take payment** action; booking column `paid`;
  `FW_Bookings_Payments::due_now( $settings, $total )`, `release_unpaid()`; filter `fw_ext_bookings_release_unpaid`.
- **CRM (since 1.0.2):** `FW_Bookings_CRM::sync_booking() / sync_status() / sync_all()`; contacts, timeline, deals in a
  "Bookings" pipeline (CRM pipeline module), managed fields `bookings_next`, `bookings_last`, `bookings_count`,
  automation triggers `bookings.requested|confirmed|declined|cancelled|reminder|ended`; filter `fw_ext_bookings_crm`.
- **Rates (since 1.0.4):** settings `weekend_rate` (0 = off), `weekend_nights` (`fri,sat` | `sat` | `fri,sat,sun`),
  `long_stay` (lines `nights | % off`; highest tier reached; nightly part only), `extras` (lines `Name | price | per`,
  per = stay|night|guest|guest-night, or booking|person for slots; key = `sanitize_title( name )`). Rate order:
  season > weekend > base. A pick may carry `extras: [ key ]`; the quote gains `discount`, `discount_label`, `extras`,
  `extras_total`; the booking stores the chosen extras (column `extras`, hydrated to an array). `FW_Bookings_Rates::rows(
  $quote )` formats a quote; answer tag `{booking_extras}`.
- **The page prices nothing itself (since 1.0.4):** `GET /wp-json/fw-bookings/v1/quote?bookable=&start=&end=` (or
  `&date=&time=`) `&guests=&extras=a,b` → `{ ok, quote: { rows, total, raw, deposit }, label }` or `{ ok:false, message }`,
  from `check()`. New price rules go in PHP only.
- **Choice (since 1.0.4):** field option `choose` (checkboxes of bookables). Two or more of the same mode = a choice;
  posted `<sc>[bookable]` must be one offered (`FW_Bookings_Choice::offered( $item )`). `GET
  /wp-json/fw-bookings/v1/choices?ids=1,2&start=&end=&guests=` → `{ choices: [ { id, ok, total } | { id, ok:false,
  message } ] }`. forms-add can set it: `{ type:'booking', bookable:'<id>', choose:{ <id>:true, <id>:true } }`.
- **Reminders (since 1.0.4):** settings `remind_hours` / `remind_note`, `thanks_hours` / `thanks_note` (0 = off).
  Hourly cron `fw_bookings_reminders` → `FW_Bookings_Reminders::run()` (callable directly); confirmed bookings only,
  once each (columns `reminded_at`, `thanked_at`, marked before mailing), thank-yous only within a day of their time.
  Filter `fw_ext_bookings_reminder_mail` ({ to, subject, body }, booking, kind; false = skip); action
  `fw_ext_bookings_reminder( $id, 'reminder'|'thanks' )`; CRM triggers `bookings.reminder`, `bookings.ended`.
- **Export (since 1.0.5):** on the same screen, Bookings → Import / Export. admin-post `fw_bookings_export` (`format`
  csv|json, `bookable` 0|id, `when` ''|upcoming|past). `FW_Bookings_Import::csv_rows( $args )` = the CSV import's
  columns + extras, deposit, paid, currency, created (formula-like cells kept as text); `FW_Bookings_Import::export(
  $args )` = `{ format: 'unysonplus-bookings', version, bookables: [ { key, title, settings } ], bookings: [ … ] }`,
  read back by the `json` import source ("A Bookings file"). Any import skips a booking whose `ref` already exists.
- **Import (since 1.0.4):** Bookings → Import / Export (`manage_options`); `FW_Bookings_Import::import( $source, { bookables:
  [ { key, title, settings } ], bookings: [ { bookable, kind, status, start_at, end_at, guests, name, email, phone, notes,
  total, deposit, paid, currency, ref, created_at } ], calendars: [ { bookable, urls } ] }, $dry )`. Idempotent (option
  `fw_bookings_import_map`); availability not re-checked; nobody emailed. Built-in sources `csv` and `json` (a Bookings file); CSV columns bookable, start,
  end, guests, name, email, phone, status (or `block`), total, notes, ref). Register more on
  `fw_ext_bookings_import_sources` ({ label, description, available(), package(), upload? }). A site's adapter for its
  own old plugin lives on that site only.
- **Admin:** Bookings menu (upcoming / waiting / confirmed / past / blocks / declined / cancelled; Confirm, Decline,
  Cancel, Delete; a "Block dates or times" form).
- **Hooks:** actions `fw_ext_bookings_created`, `fw_ext_bookings_status`, `fw_ext_bookings_deleted`,
  `fw_ext_bookings_booked`; filters `fw_ext_bookings_busy`, `fw_ext_bookings_ref_prefix`,
  `fw_ext_bookings_capability`, `fw_ext_bookings_status_mail`.

## Building a booking form (recipe)

1. Add a bookable (Bookings → Bookables): by the night or by time slot, its prices and limits.
2. Add a Contact Form element and pick **Stay request** or **Appointment** in the form-type picker (or add the
   **Dates and availability** field to any form). In the field's settings choose the bookable.
3. Keep the Reserve action on (it is by default). Optionally switch the form's own notification off — the booking
   emails already tell the owner and the guest.
