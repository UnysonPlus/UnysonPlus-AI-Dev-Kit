<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `contact_form` — Contact Form

A contact form with a drag-and-drop field builder, on-submit actions (store the entry, subscribe to the newsletter) and a notification email. Requires the **`forms`** extension (with its Contact Forms sub-extension, which pulls in `mailer`) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'contact_form', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Form Fields / Settings → Actions · Options · Mailer / Style / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `id` | unique | auto | 32-hex string | Auto-generated unique id for the form instance. |
| `form` | form-builder | header title item (see Notes) | `{ json: '<field JSON>' }` | The form's fields. |
| `action_store` | switch | `'yes'` | `'yes'` \| `'no'` | **Settings → Actions → Store entry.** Keep each submission under Unyson+ → Form Entries (stored even if the email fails). The site-wide switch under Forms settings can turn storage off for every form. |
| `action_subscribe` | switch | `'no'` | `'yes'` \| `'no'` | **Subscribe to the newsletter** (only when the Newsletter CRM extension is active). Runs **only** if the form has a Consent field with `purpose: newsletter` that the sender ticked, and an email field — an email alone never subscribes anyone. Double opt-in applies when it is on (the default). |
| `action_subscribe_list` | select | `''` | `''` = the newsletter default list, or a list **slug** | List to add the subscriber to. |
| `action_subscribe_tags` | text | `''` | comma-separated, e.g. `booked, event-2026` | Tags to apply. Given by **name or slug** — each is slugged the way the admin does (`Stage: New lead` → `stage-new-lead`), so it matches a tag created in the admin; missing tags are created. |
| `action_subscribe_name` | text | `''` | a field **label**, e.g. `Your name` | Which field holds the name. Empty = the first non-empty text field. |
| `email_to` | text | `''` | email address | Where the notification is emailed. |
| `subject_message` | text | `'Contact Form'` | string | Email subject. Dynamic Content tokens (`{{post_title}}`…) resolve against the page the form was sent from. |
| `submit_button_text` | text | `'Send'` | string | Submit button label. |
| `success_message` | text | `'Message sent!'` | string | Shown after a successful submit — **also** when the email failed but the entry was stored (see Notes). |
| `failure_message` | text | `'Oops something went wrong.'` | string | Shown when the email fails **and** nothing is stored (the mailer error is appended). |
| `mailer` | mailer | — | mailer option-type value | The **Mailer** tab. It edits the **site-wide** mailer settings (the option type is backed by the `fw_ext_settings_options:mailer` WP option); sending always uses the site-wide settings, never a per-form copy. Omit it in generated JSON. |
| `form_max_width` | select | `''` | `''` (full) `480px` `600px` `720px` `880px` | Style → Form Width. |
| `form_align` | select | `'left'` | `left` `center` `right` | Placement when a width is set. |
| `field_bg` · `field_text` · `field_border` · `field_focus` · `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Field / label colours (`field_bg` = `kind: bg`, the rest `kind: text`). |
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
