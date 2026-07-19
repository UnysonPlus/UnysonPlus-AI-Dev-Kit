# chat extension

A floating, multi-channel contact button rendered site-wide — WhatsApp, Messenger, Telegram, SMS, Email or any custom link. **Active by default:** no (ships INACTIVE — activate it under Extensions). Version: 1.0.3.

## Provides

- **Shortcodes:** none — it renders a site-wide floating button (view: `views/button.php`).
- **Settings/options:** configured under **Theme Settings → Site-wide UX → Chat Button** (channels + their targets, position, styling).
- **Public hooks/filters:** — (self-contained).

## Notes / gotchas

- **Ships inactive by default** — activate it in Extensions when you want the button to appear.
- **Behavior scales with channel count:** one active channel → the button is a direct deep-link; several → it becomes a launcher the visitor picks from.
- Standalone, displayed extension card with a `thumbnail.svg` icon.
