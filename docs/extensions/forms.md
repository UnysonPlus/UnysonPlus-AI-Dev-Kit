# forms extension

A drag-and-drop **contact-form builder** plus the `[contact-form]` shortcode/element to place forms on any page. **Active by default:** yes. Version: 2.0.39.

## Provides

- **Shortcodes:** `[contact-form]` — the form element (also a page-builder item) → see `../shortcodes/`.
- **Option type:** `form-builder` (`includes/option-types/form-builder/`) — the drag-and-drop field builder used to compose a form.
- **Sub-extension:** `contact-forms` (`extensions/contact-forms/`) holds the shortcode + item.
- **Settings/options:** a `settings-options.php` page (spam / reCAPTCHA / default recipient etc.); per-form config lives in the form-builder option on each form.
- **Public hooks/filters:** standard forms hooks (see `hooks.php`) — submission handling, validation, and mail dispatch.

## Notes / gotchas

- **Sends mail through the `mailer` extension** — that's how global email/SMTP options apply to form submissions.
- **Requires the `builder` extension** (the form-builder option type is built on the base builder).
- Standalone, displayed extension; the contact-form is both a shortcode and a native page-builder element.
