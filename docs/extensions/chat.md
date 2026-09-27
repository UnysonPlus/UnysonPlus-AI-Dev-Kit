<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# chat extension

A floating, multi-channel contact button rendered site-wide — WhatsApp, Messenger, Telegram, SMS, Email or any custom link. **Active by default:** no (ships INACTIVE — activate it under Extensions). Version: 1.0.4.

## Provides

- **Shortcodes:** none — it renders a site-wide floating button (view: `views/button.php`).
- **Settings/options:** configured under **Theme Settings → Site-wide UX → Chat Button** (channels + their targets, position, styling).
- **Public hooks/filters (1.0.4):**
  - `fw_ext_chat_channels( $channels, $ext )` — add / remove / reorder active channels. A channel is a link
    `{ key, name, url, external }` or an **action** `{ key, name, action }`; an action renders as a
    `<button data-upw-chat-action>` and, on click, closes the chooser and fires the DOM event
    `upw-chat:action` on `document` with `detail: { action, trigger }`.
  - `fw_ext_chat_settings_fields( $options, $ext )` — add fields to `$options['chat_button']['inner-options']`;
    read them back with `fw_ext('chat')->get_option( $key )`.
  - `fw_ext_chat_channel_svg( '', $key )` — return an inline SVG for a custom channel key.
  - Used by the `ai-assistant` extension's visitor channel (`ai`), which is how Chat stays free of AI code.

## Notes / gotchas

- **Ships inactive by default** — activate it in Extensions when you want the button to appear.
- **Behavior scales with channel count:** one active channel → the button is a direct deep-link; several → it becomes a launcher the visitor picks from.
- Standalone, displayed extension card with a `thumbnail.svg` icon.
