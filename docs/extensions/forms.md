<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# forms extension

A drag-and-drop **contact-form builder** plus the `[contact-form]` shortcode/element to place forms on any page. **Active by default:** yes.

## Provides

- **Shortcodes:** `[contact-form]` — the form element (also a page-builder item) → see `../shortcodes/`.
- **Option type:** `form-builder` (`includes/option-types/form-builder/`) — the drag-and-drop field builder used to compose a form.
- **Sub-extension:** `contact-forms` (`extensions/contact-forms/`) holds the shortcode + item.
- **Settings/options:** a `settings-options.php` page (spam / reCAPTCHA / default recipient etc.); per-form config lives in the form-builder option on each form.
- **Public hooks/filters:** standard forms hooks (see `hooks.php`) — submission handling, validation, and mail dispatch.
- **Entries (since 2.0.50):** every submission is stored in `{prefix}fw_form_entries` and listed under **Unyson+ → Form Entries** — per-form filter, status views (New / Read / Archived), date window, search (including field values), bulk archive/delete, single-entry view, CSV export of the current view. Settings: `entries_store` (default on), `entries_store_ip` (default off), `entries_retention_days` (0 = keep). Registered with the WordPress Export / Erase Personal Data tools by email.
- **Field types (since 2.0.51):** `date` (native date / time / datetime-local input; `min`/`max` accept ISO or `today`; blackout weekdays; server-validated), `rating` (radio group styled as 1–5 stars or 0–10 / 1–10 pills; integer value; optional end labels), `hidden` (static value, URL parameter, page URL or page title — context, never authority), `consent` (dedicated type with `purpose` = terms / newsletter / other; a newsletter opt-in is forced optional; unticked stored as `''`). `FW_Option_Type_Form_Builder_Item_Consent::newsletter_consent_given( $fields )` is the one test for a newsletter opt-in. The four share `_shared/class-fw-option-type-form-builder-item-simple.php` + `_shared/js/simple-item.js`.
- **Actions (since 2.0.52):** per-form on-submit steps on a **Settings → Actions** tab of the contact-form element, registered via `fw_ext_forms_actions` (`FW_Forms_Action`: id / title / options / run). Forms ships **Store entry** (default on); the Newsletter CRM adds **Subscribe to the newsletter** (default off, consent-gated). Runner at priority 20 on the submit hook, after entry capture; failures reported via `fw_ext_forms_action_failed`, never shown to the visitor. `fw_ext_forms_form_settings` is how a form type hands its saved atts to actions.
- **Conditional visibility (since 2.0.53):** every field has a *Show only when…* rule (controller field by label · is / is not / contains / has any value / is empty · value). Toggled live by `static/js/conditions.js` from rules the form emits as JSON, and **enforced server-side**: a hidden field is neither validated nor collected. An unresolvable rule shows the field rather than hiding it.
- **Starter forms (since 2.0.54):** the form builder has the framework's Templates panel (`template_saving`), with eight starters via `fw_ext_builder:predefined_templates:form-builder:full` — Contact, Booking / Appointment, Quote request, Event registration, Support ticket, Feedback (CSAT), NPS survey, Newsletter signup. Authored as PHP and normalised through each item class; a newsletter opt-in is always a separate optional Consent box, and no starter sets Actions. Extend with `fw_ext_forms_starters`.
- **Entry hooks:** `fw_ext_forms_store_entries` (bool), `fw_ext_forms_entry_before_insert` (filter the entry; return `array()` to skip), `fw_ext_forms_entry_stored( $id, $entry, $payload )`, `fw_ext_forms_entry_form_title` (a form type supplies a human title — the contact form answers with its subject), `fw_ext_forms_entries_capability`.

## Notes / gotchas

- **Sends mail through the `mailer` extension** — that's how global email/SMTP options apply to form submissions.
- **Requires the `builder` extension** (the form-builder option type is built on the base builder).
- Standalone, displayed extension; the contact-form is both a shortcode and a native page-builder element.
- **The submit hook is the one seam.** `fw_ext_forms_frontend_submit` now carries `form_values` (shortcode → value) and `attachments`; before 2.0.50 a listener could see that a form was submitted but not what. Entries, and later the CRM's subscribe action and webhooks, all listen here — nothing is threaded into the pipeline itself.
- **An entry stores `{ id, type, label, value }` per field with the label captured at submit time**, so editing a form never makes old entries unreadable. Fields are JSON; `email`, `form_id`, `status`, `created_at` are real indexed columns.
- **An entry is written whether or not the email sent** — that is the point of storing them.
- **Entries are submissions, not people.** A submission never creates a Newsletter CRM subscriber by itself; that needs an explicit consent field and the CRM's own subscribe action through double opt-in (Forms plan, Phase 3).
- `wp_get_referer()` returns `false` when the referer is the current page — which a form posting to its own page always is — so the entry's `post_id` is resolved from the raw referer / request URI instead.
- CSV export prefixes cells beginning with `= + - @` with `'` (spreadsheet formula injection); the export streams in chunks and never loads the table into memory.
