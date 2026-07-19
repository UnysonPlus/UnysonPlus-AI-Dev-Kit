# `newsletter` — Newsletter

An AJAX email-signup form wired to the site mailer and a hook for list integrations (Mailchimp, etc.). Leaf node: `{ type:'simple', shortcode:'newsletter', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `title` | text | `'Subscribe to our newsletter'` | string | Heading above the form. Blank to hide. |
| `description` | textarea | `'Get the latest updates straight to your inbox.'` | string | Sub-text under the heading. |
| `show_name` | switch | `'no'` | `'yes'` \| `'no'` | Add a Name field before the email. |
| `name_placeholder` | text | `'Your name'` | string | Placeholder for the Name field. |
| `email_placeholder` | text | `'Your email address'` | string | Placeholder for the Email field. |
| `button_label` | text | `'Subscribe'` | string | Submit button text. |
| `consent_text` | textarea | `''` | HTML string | Optional fine print under the form (basic HTML / links). |
| `success_message` | text | `'Thanks for subscribing!'` | string | Shown after a successful submit. |
| `error_message` | text | `'Something went wrong. Please try again.'` | string | Shown on failure. |
| `list_id` | text | `''` | string | Passed to the `fw_newsletter_subscribe` hook for list integrations. |
| `design` | image-picker | `'inline'` | `inline` `stacked` `boxed` | Form layout design. |
| `align` | alignment | `'left'` | `left` `center` `right` | Content alignment. |
| `rounded` | select | `'rounded'` | `rounded-0` (square) `rounded` `pill` | Field / button corner roundness. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Button color (`kind: bg`). |
| `field_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Input field background (`kind: bg`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Box background for the `boxed` design (`kind: bg`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "title": "Join the newsletter",
  "description": "One email a week. No spam, unsubscribe anytime.",
  "show_name": "no",
  "name_placeholder": "Your name",
  "email_placeholder": "you@example.com",
  "button_label": "Subscribe",
  "consent_text": "",
  "success_message": "You're in — check your inbox.",
  "error_message": "Something went wrong. Please try again.",
  "list_id": "",
  "design": "inline",
  "align": "center",
  "rounded": "pill",
  "accent_color": { "predefined": "", "custom": "" },
  "field_bg": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
- The form submits via AJAX to `admin-ajax`. The admin notification always goes to `admin_email` (never a client address); a nonce + honeypot guard the endpoint.
- Integrations hook `fw_newsletter_subscribe` (receiving `list_id`); return a `WP_Error` from `fw_newsletter_subscribe_result` to surface a failure.
- `consent_text` allows basic HTML — keep it minimal and semantic.
