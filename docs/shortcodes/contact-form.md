# `contact_form` — Contact Form

A contact form with a drag-and-drop field builder plus mailer/notification settings. Requires the **`forms`** extension (with the Contact Forms sub-extension) active. Leaf node: `{ type:'simple', shortcode:'contact_form', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `id` | unique | auto | 32-hex string | Auto-generated unique id for the form instance. |
| `form` | form-builder | header title field (see Notes) | `{ json: '<field JSON>' }` | The form's fields, built with the form builder. |
| `email_to` | text | `''` | email address | Where the submission is emailed. |
| `subject_message` | text | `'Contact Form'` | string | Email subject line. |
| `submit_button_text` | text | `'Send'` | string | Submit button label. |
| `success_message` | text | `'Message sent!'` | string | Shown on successful send. |
| `failure_message` | text | `'Oops something went wrong.'` | string | Shown when the send fails. |
| `mailer` | mailer | mailer object | mailer option-type value | Delivery / mailer configuration. |

## Ready-to-use example (the atts object)
```json
{
  "id": "",
  "form": {
    "json": "[{\"type\":\"form-header-title\",\"shortcode\":\"form_header_title\",\"width\":\"\",\"options\":{\"title\":\"\",\"subtitle\":\"\"}}]"
  },
  "email_to": "you@example.com",
  "subject_message": "Contact Form",
  "submit_button_text": "Send",
  "success_message": "Message sent!",
  "failure_message": "Oops something went wrong.",
  "mailer": {}
}
```

## Notes
- `form` is a **form-builder** value `{ json: '<string>' }`, where the string is a JSON array of field nodes. Each node is `{ type, shortcode, width, options:{…} }` (e.g. `form_header_title`, plus text / email / textarea / select fields you add in the builder). New forms seed a single `form-header-title` node.
- The settings values (`email_to`, `subject_message`, `submit_button_text`, `success_message`, `failure_message`) are stored as **flat leaf atts** — the form builder wraps them in Settings → Options groups in the UI, but the group ids are containers only and are not part of the saved shape.
- `mailer` is the framework **mailer** option type; its value shape comes from the `mailer` extension. Leave `{}` to use the site's default mailer.
- Because the field JSON must round-trip through the form builder, prefer building the form in the UI and exporting its `form.json`, rather than hand-authoring complex field arrays.
