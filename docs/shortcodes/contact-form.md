<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `contact_form` — Contact Form

A contact form with a drag-and-drop field builder, on-submit actions (store the entry, subscribe to the newsletter) and a notification email. Requires the **`forms`** extension (with its Contact Forms sub-extension, which pulls in `mailer`) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'contact_form', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Form Fields / Settings → Actions · Options · Mailer / Style / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `id` | unique | auto | 32-hex string | Auto-generated unique id for the form instance. |
| `library_form` | select | `''` | `''` or a saved form's post ID (Unyson+ → Forms) | Show a saved form: its fields, settings and actions replace this element's; Style stays. |
| `form` | form-builder | header title item (see Notes) | `{ json: '<field JSON>' }` | The form's fields. |
| `action_store` | switch | `'yes'` | `'yes'` \| `'no'` | **Settings → Actions → Store entry.** Keep each submission under Unyson+ → Form Entries (stored even if the email fails). The site-wide switch under Forms settings can turn storage off for every form. |
| `action_subscribe` | switch | `'no'` | `'yes'` \| `'no'` | **Add to the CRM** (only when the CRM extension is active). Runs **only** if the form has a Consent field with `purpose: newsletter` that the sender ticked, and an email field — an email alone never subscribes anyone. Double opt-in applies when it is on (the default). |
| `action_subscribe_list` | select | `''` | `''` = the newsletter default list, or a list **slug** | List to add the subscriber to. |
| `action_subscribe_tags` | text | `''` | comma-separated, e.g. `booked, event-2026` | Tags to apply. Given by **name or slug** — each is slugged the way the admin does (`Stage: New lead` → `stage-new-lead`), so it matches a tag created in the admin; missing tags are created. |
| `action_subscribe_name` | text | `''` | a field **label**, e.g. `Your name` | Which field holds the name. Empty = the first non-empty text field. |
| `action_payment` · `_method` · `_require` · `_offline_title` · `_offline_instructions` | switch · select · switch · text · textarea | `'no'` · `'offline'` · `'yes'` · `'Bank transfer'` · … | | **Actions → Take payment**: charge the total of Product, Amount and `add_to_total` Calculated fields. Tags `{order_total}`, `{order_summary}`, `{payment_ref}`, `{payment_method}`, `{payment_instructions}`. Pay later = recorded as waiting, marked paid on the entry; `stripe` / `paypal` send the payer to the service's page and back (since 2.0.75). `{payment_link}` = a link to pay by card later. |
| `limit_entries` · `limit_opens` · `limit_closes` · `limit_closed_message` · `limit_seats` | text · text · text · text · textarea | `''` | dates `YYYY-MM-DD` or `YYYY-MM-DD HH:MM`; seats one per line `Choice text \| 20` | **Settings → Limits**: close after N entries / outside the dates (the message replaces the form); places per choice. |
| `partial_enabled` · `partial_notice` | switch · text | `'no'` | | **Options → Keep unfinished entries** (status Unfinished; the notice shows under the form). |
| `views_allowed` · `views_approval` · `views_approvers` | switch · switch · text | `'no'` · `'yes'` · `''` | emails, comma-separated | **On the site**: an Entry View may show this form's entries; new entries wait for approval (email with Approve / Reject links; empty = admin email). |
| `edit_own` · `edit_lock` · `edit_days` | switch · select · text | `'no'` · `'approved'` · `14` | `approved` \| `days` \| `never` | **On the site → Senders can edit their entry** (from an Entry View), until it locks. |
| `email_routes` · `extra_notifications` · `confirmation_routes` | addable-box | `[]` | rows `{ field, op (is\|is_not\|contains\|empty\|not_empty), value, … }` + `to`, `mode` (replace\|add) / `title`, `to`, `subject`, `message` / `type` (message\|url), `message`, `url` | **Settings → Notifications** (since Forms 2.0.84): recipients by answer, more notifications, a different after-sending by answer. Fields are named by LABEL; an unknown label never matches. |
| `retention_days` | text | `''` | days | **Options → Delete this form's entries after** (beats the site-wide period). |
| `drafts_enabled` · `drafts_days` | switch · text | `'no'` · `30` | | **Options → Save and continue later**: emails a link that refills the form. |
| `pdf_notification` · `pdf_autoresponder` · `pdf_title` | switch · switch · text | `'no'` · `'no'` · `''` | answer tags in the title | **Options → PDF copy** attached to the notification / the sender's confirmation. |
| `action_sheets` · `_spreadsheet` · `_tab` | switch · text · text | `'no'` · `''` · `Sheet1` | spreadsheet URL or ID | **Actions → Send to a spreadsheet** (Google Sheets; key in Forms Settings). |
| `quiz_enabled` · `quiz_points` · `quiz_outcomes` | switch · textarea · addable-box `{from, to, title, message, redirect, crm_tag}` | `'no'` | points lines `answer = n` or `field: answer = n` | **Settings → Quiz**. Tags `{quiz_score}`, `{quiz_max}`, `{quiz_percent}`, `{quiz_result}`, `{quiz_message}`. |
| `action_webhook` · `_url` · `_format` · `_secret` | switch · text · select (json\|form) · text | `'no'` | | **Actions → Send to a webhook** (HMAC header with a secret). |
| `action_create_post` · `_type` · `_status` · `_title` · `_content` · `_image` · `_meta` | | `'no'` · `post` · `draft` | `_meta` lines `key = {tag}` | **Actions → Create a post**. |
| `email_notify` | switch | `'yes'` | `'yes'` \| `'no'` | **Send the notification email.** Off: nothing is mailed; the entry is stored and actions run (for a form whose action sends its own alert). Travels with saved forms. |
| `email_to` | text | `''` | email address(es), comma-separated | Where the notification is emailed. Empty = the site admin email. |
| `email_cc` · `email_bcc` | text | `''` | comma-separated addresses | Copies of the notification. |
| `subject_message` | text | `'Contact Form'` | string | Email subject. Dynamic Content tokens (`{{post_title}}`…) resolve against the page the form was sent from; answer tags (`{text_name}`, `{site_name}`…) fill in the visitor's answers. |
| `submit_button_text` | text | `'Send'` | string | Submit button label. |
| `confirmation_type` | select | `'message'` | `message` (keep the form, emptied) · `hide` (message replaces the form) · `page` · `url` | Settings → Options → **After Sending**. |
| `confirmation_page` | select | `''` | page ID | Thank-you page for `page`. |
| `confirmation_url` | text | `''` | absolute URL or `/path`; answer tags allowed | Address for `url` (validated with `wp_validate_redirect`). |
| `action_autoresponder` · `_subject` · `_message` · `_answers` | switch · text · textarea · switch | `'no'` · … · `'no'` | | **Actions → Email the sender**: a confirmation email to the first email field. `_answers` adds a copy of the answers. |
| `success_message` | text | `'Message sent!'` | string (answer tags allowed) | Shown after a successful submit — **also** when the email failed but the entry was stored (see Notes). |
| `failure_message` | text | `'Oops something went wrong.'` | string | Shown when the email fails **and** nothing is stored (the mailer error is appended). |
| `mailer` | mailer | — | mailer option-type value | The **Mailer** tab. It edits the **site-wide** mailer settings (the option type is backed by the `fw_ext_settings_options:mailer` WP option); sending always uses the site-wide settings, never a per-form copy. Omit it in generated JSON. |
| `form_style` | select | first Form Style preset (`formp-standard`) | `''` (None: plain fields) or a `formp-{slug}` from Theme Settings → Components → Form Styles | Style → **Form Style**: the field look. See `../theme-settings/form-styles.md`. |
| `form_layout` | select | `''` | `''` (all fields at once) · `conversational` | Style → **Layout**: one question per screen with a progress bar, Back / Next, Enter moves on (`static/js/conversational.js`). Without JS it is an ordinary form. |
| `form_max_width` | select | `''` | `''` (full) `480px` `600px` `720px` `880px` | Style → Form Width. |
| `form_align` | select | `'left'` | `left` `center` `right` | Placement when a width is set. |
| `field_bg` · `field_text` · `field_border` · `field_focus` · `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Field / label colours (`field_bg` = `kind: bg`, the rest `kind: text`). **This form only:** these and the three field selects below override the Form Style preset; leave empty to use the preset. |
| `field_radius` | select | `''` | `''` `0` `4px` `6px` `8px` `12px` `999px` | Field corner radius. |
| `field_border_width` | select | `''` | `''` `1px` `2px` `3px` | Field border width. |
| `field_padding` | select | `''` | `''` · `.45rem .7rem` · `.65rem .9rem` · `.85rem 1.1rem` | Compact / Comfortable / Roomy. |
| `button_style` | select | first button preset (e.g. `btn-primary`) | `''` (bare `.btn`) or a `btn-{slug}` from Theme Settings → Buttons | Submit button preset. |
| `button_size` | select | `''` | size preset slug (`btn-sm`, `btn-lg`, …) | Submit button size. |
| `button_shape` | select | `''` | `''` `rounded` `pill` `square` | Overrides the size preset's radius. |
| `button_full` | switch | `false` | bool | Full-width button. |
| `button_align` | select | `'left'` | `left` `center` `right` | Ignored when full width. |
| `margin` | spacing | — | spacing-class value | Outer margin. |

## Ready-to-use example (the atts object)
```json
{
  "id": "",
  "form": {
    "json": "[{\"type\":\"form-header-title\",\"shortcode\":\"form_header_title\",\"width\":\"\",\"options\":{\"title\":\"Get in touch\",\"subtitle\":\"\"}},{\"type\":\"text\",\"shortcode\":\"text_name\",\"width\":\"1_2\",\"options\":{\"label\":\"Your name\",\"required\":true}},{\"type\":\"email\",\"shortcode\":\"email_1\",\"width\":\"1_2\",\"options\":{\"label\":\"Email\",\"required\":true}},{\"type\":\"textarea\",\"shortcode\":\"textarea_message\",\"width\":\"1_1\",\"options\":{\"label\":\"Message\",\"required\":true}},{\"type\":\"consent\",\"shortcode\":\"consent_terms\",\"width\":\"1_1\",\"options\":{\"label\":\"I agree to the privacy policy.\",\"required\":true,\"purpose\":\"terms\"}}]"
  },
  "action_store": "yes",
  "action_subscribe": "no",
  "email_to": "you@example.com",
  "subject_message": "New enquiry from {{site_name}}",
  "submit_button_text": "Send",
  "success_message": "Thanks — we'll be in touch.",
  "failure_message": "Oops something went wrong."
}
```

## Field items (the `form.json` array)

**Pre-fill and piping.** A field is pre-filled from the logged-in user, their CRM contact, or a URL parameter named after its `shortcode` (`?name_1=Rosa`); filter `fw_ext_forms_prefill_values`. `{shortcode}` inside a label, legend, section text or help line shows that answer live ("Who is coming with you, {name_1}?").

Each item: `{ "type": "<item type>", "shortcode": "<type>_<slug>", "width": "<w>", "options": { … } }`.

- `shortcode` must be **unique within the form** — it is the submitted field name and the key in `form_values`. Convention: `<type>_<slug>` (`text_name`, `email_1`, `select_service`). If it is empty the builder generates one.
- `width`: `1_1` (full), `1_2`, `1_3`, `2_3`, `1_4`, `3_4`, … (`form-header-title` uses `''`).
- `options`: missing keys take the item's defaults (every item is normalised through its class on save), so a starter-sized item like the ones below is enough. Common to all input items: `label`, `required` (bool), `info` (help text), and the **conditional-visibility** keys `cond_enabled` (`'yes'`/`'no'`), `cond_field` (the controlling field's **label**, exactly), `cond_op` (`is` `is_not` `contains` `not_empty` `empty`), `cond_value`.

| `type` | Type-specific `options` |
|---|---|
| `form-header-title` | `title`, `subtitle` (not an input) |
| `text` · `textarea` | `placeholder`, `default_value`, length constraints |
| `email` · `website` | `placeholder` (`website` also `default_value`) |
| `number` | `placeholder`, `default_value`, min / max / digits constraints |
| `select` · `radio` · `checkboxes` | `choices` = **array of strings** (the label is the value); `randomize`; radio / checkboxes also `layout` |
| `date` | `mode` `date`\|`time`\|`datetime`; `min` / `max` (ISO value or `today`); `blackout_days` (weekday checkboxes, keys `0` = Sun … `6` = Sat — leave `[]` unless you need it) |
| `rating` | `scale` `stars5` (1–5) \| `nps` (0–10) \| `scale10` (1–10); `low_label`, `high_label` |
| `hidden` | `source` `static` \| `url_param` \| `page_url` \| `page_title`; `value` (the fixed value, or the URL parameter name, e.g. `utm_source`) |
| `consent` | `purpose` `terms` \| `newsletter` \| `other`. A `newsletter` consent is forced optional and is what `action_subscribe` checks. |
| `file-upload` | `allowed_ext`, `max_size` |
| `name` | `format` `full`\|`first_last`, `first_label`, `last_label` |
| `phone` | `placeholder` (type tel, 6-20 digits) |
| `address` | `show_line2`, `show_region`, `default_country` (required = street, city, country) |
| `section` · `page-break` | `section`: `label` heading, `text`, `level`; `page-break`: `label` (next step title), `next_label`, `back_label`. Collect nothing. |
| `range` | `min`, `max`, `step`, `default`, `prefix`, `suffix` |
| `image-choice` | `choices` = `[{caption, image}]`, `multiple`, `columns` 2\|3\|4 |
| `ranking` · `likert` | `ranking`: `choices` strings; `likert`: `rows` + `scale` strings |
| `repeater` | `fields` = `[{label, type: text\|email\|phone\|number\|date, required}]`, `item_title` ("Guest"), `min`, `max`, `add_label`. Posts `shortcode[n][<label>]`; stored as `1) Name: Ana, Age: 30; 2) …`. |
| `product` | `mode` single\|choices, `price` (single), `choices` = `[{name, price}]`, `display` radio\|select, `quantity` fixed\|checkbox\|box, `qty_min`, `qty_max`, `billing` ''\|week\|month\|year (a subscription). Posts `[choice]`, `[qty]`, `[buy]`; stored "Full day × 2 = $320" |
| `amount` | `suggested` ("10, 25, 50"), `allow_other` yes\|no, `min`, `max` (empty = none). Posts `[choice]` (an amount or `other`), `[other]` |
| `payment-method` | `methods` `{stripe, paypal, offline: bool}`, `stripe_label`, `paypal_label`, `offline_label`. Only methods with keys show; the Take payment action uses the choice |
| `coupon` | `button` ("Apply"). Posts the code; checked live and on the server; in a formula it is the amount off |
| `signature` | `allow_typed` yes\|no. Posts `[image]` (PNG data URL) and `[typed]`; stored privately like a file |
| `calculation` | `formula` (`{field}` + - * / brackets round ceil floor abs min max), `format` money\|number, `decimals`, `prefix`, `suffix`, `add_to_total` yes\|no, `visible` yes\|no. Worked out on the server; no input |
| `honeypot` · `recaptcha` | spam protection (reCAPTCHA needs keys in Forms settings) |

## Starters (Form Fields → Templates)

The form builder's Templates panel offers these (`FW_Forms_Starters`, filter `fw_ext_forms_starters`; template ids `fw-forms-<id>`). No starter sets Actions; a newsletter opt-in is always a separate, optional `consent` with `purpose: newsletter`, never pre-ticked.

| id | Title | Fields |
|---|---|---|
| `contact` | Contact | name · email · message · terms consent |
| `appointment` | **Appointment request** | name · email · phone · *What is it for?* (select) · preferred date (from today) · preferred time (Morning / Afternoon / Evening / Any time) · *Have you been to us before?* (radio) · terms · newsletter opt-in. No free-text box on purpose — suits clinics, salons and professional services, where a form must not invite health or confidential details. |
| `booking` | **Table booking (restaurant)** (formerly "Booking") | name · email · phone · party size · date · time (09:00–22:00) · notes (allergies, occasion, access needs) · terms · newsletter opt-in |
| `quote` | Quote request | name · company · email · phone · service · budget · deadline · project details · hidden `source` (`utm_source`) · terms |
| `registration` | Event registration | name · email · organisation · job title · attending (in person / online) · sessions (checkboxes) · dietary / access · terms · newsletter opt-in |
| `support` | Support ticket | name · email · order number · category · urgency · issue · screenshot (file upload) · terms |
| `feedback` | Feedback (CSAT) | overall (5 stars) · response speed (5 stars) · comment · optional email · hidden `agent` |
| `nps` | NPS survey | 0–10 score · reason · optional email |
| `signup` | Newsletter signup | first name · email · newsletter consent |

## Notes
- `form` is a **form-builder** value `{ json: '<string>' }` — the string is the JSON array above. New forms seed a single `form-header-title` item (filter `fw:ext:forms:builder:load-item:form-header-title`).
- **Delivery.** The notification goes through the Mailer extension using the **site-wide** settings. With no send method chosen it uses **WordPress mail** (`wpmail`, filter `fw_ext_mailer_default_method`), so a new site's forms send without setup; choose SMTP on a live host (see `../extensions/mailer.md`). The first **required** email field becomes the Reply-To.
- **Email fails, entry stored → the visitor sees success.** If the notification can't be sent but the submission is being kept as an entry (Forms entries on + `action_store` on), the visitor gets `success_message` and the entry records an extra field *Notification email: "Not sent. <mailer error>"*; action `fw:ext:contact-forms:mail-failed` fires. Only when nothing is stored does the visitor see `failure_message`.
- **File uploads are private.** Files from `file-upload` fields are stored in `uploads/unysonplus/form-uploads/` (deny rules + random name prefixes keep them off the web), attached to the notification email, and downloaded by admins from the entry screen (Unyson+ → Form Entries). Deleting the entry deletes the files.
- Actions run after the entry is captured; an action failure is reported through `fw_ext_forms_action_failed`, never shown to the visitor.
- Because the field JSON must round-trip through the form builder, the safest way to author a complex form is a **starter** (or a form built in the UI) and then edit labels / choices.
