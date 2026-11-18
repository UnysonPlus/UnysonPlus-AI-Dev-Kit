<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# chat extension

A floating chat / contact button rendered site-wide, plus (1.0.6) an on-site **live chat** with an inbox in
wp-admin. **Active by default:** no (not in the core-only plugin zip — download + activate it under
Unyson+ → Extensions). Version: 1.0.10.

Public docs: https://docs.unysonplus.com/extensions/chat

## Two modes

- **Channels only** (`chat_live_enable` off): the button links to WhatsApp / Messenger / Telegram / SMS /
  email / a custom link. One active channel → a direct deep-link; several → a chooser (`views/button.php`).
- **Live chat** (`chat_live_enable` on): the button opens a chat window on the site (`views/live.php`,
  `static/js/live-chat.js`). Visitors write; the team answers in **Chat → Inbox**
  (`static/js/inbox.js`). The link channels are listed under the message box ("Or chat through"). With
  live chat on, the button renders even when no channel is active.

## Provides

- **Admin page:** a top-level **Chat** menu item (`add_menu_page`, slug `fw-chat`, position `25.5` right after Comments, `dashicons-format-chat`; the Admin Skin files it under Workspace through `fw_ext_admin_skin_menu_groups`; `FW_Chat_Admin`) — tabs **Inbox** (cap
  `FW_Chat_Admin::capability()` = `edit_pages`, filter `fw_ext_chat_capability`), **Settings** and
  **Import / Export** (`manage_options`). Unread count on the menu item and an admin-bar **Chat** node.
  The Extensions manager's Settings link redirects here.
- **Settings:** stored **site-wide** in the extension's settings (`fw_ext_settings_options:chat`), not in
  Theme Settings. `settings-options.php` → `FW_Extension_Chat::get_settings_tabs()` splits the fields of
  `includes/chat-fields.php` into tabs by key: button look (`chat_enable`, `chat_label`, `chat_position`,
  `chat_bg_color`, `chat_text_color`) → **Button**; `chat_live_*` → **Live chat**; `chat_ai_*` →
  **AI assistant**; everything else → **Channels**.
- **Storage:** tables `{prefix}upw_chat_threads` (one row per conversation: token hash, status
  open|closed, name, email, ip, user_agent, page_url / page_title, unread counters, visitor_seen_at,
  notified_at, times in UTC) and `{prefix}upw_chat_messages` (thread_id, sender visitor|agent|system,
  user_id, body, created_at). `FW_Chat_Store`; created on `init` per `fw_ext_chat_db_version`.
- **REST** (`unysonplus-chat/v1`, `FW_Chat_Rest`): visitor `POST send`, `GET poll`, `POST contact` (no
  login; the browser keeps a 40-char token in localStorage `upwLiveChat.v1`, only its HMAC is stored);
  team `GET admin/threads`, `GET|DELETE admin/thread/<id>`, `POST admin/thread/<id>/reply`,
  `POST admin/thread/<id>/status`.
- **AI abilities** (with the AI Assistant, `includes/ai-abilities.php`): `chat-settings`,
  `chat-settings-update` (snapshotted; `undo_change` reverts), `chat-conversations`, `chat-reply`
  (show the reply to the person before sending — it reaches a real visitor).
- **Import / Export** (`FW_Chat_Transfer`): CSV (one row per message) and JSON (`format:
  "unysonplus-chat"`, `version: 1`, `settings` + `conversations[]`), both importable; duplicates (same
  started time, IP, email and first message) are skipped; settings only from JSON and only when ticked.
- **Privacy:** WordPress personal-data exporter + eraser (by the email the visitor left), a privacy-policy
  paragraph, a daily cron (`fw_ext_chat_cleanup`) deleting conversations older than
  `chat_live_retention` days (0 = keep).

## Settings (ids)

| id | type | default | notes |
| --- | --- | --- | --- |
| `chat_enable` | switch | off | the button at all |
| `chat_label`, `chat_position` (`right`/`left`), `chat_bg_color`, `chat_text_color` | | | colours feed the CSS vars `--upw-chat-accent` / `--upw-chat-on-accent` (button, window header, visitor bubbles) |
| `chat_wa_*`, `chat_fb_*`, `chat_tg_*`, `chat_sms_*`, `chat_email_*`, `chat_custom_*` | | off | channel switch + its detail |
| `chat_live_enable` | switch | off | the chat window |
| `chat_live_title`, `chat_live_subtitle`, `chat_live_greeting`, `chat_live_channels_label` | text | | window copy |
| `chat_live_ask_email` | radio `away` / `always` / `never` | `away` | `away` = after the first message when nobody has the inbox open, or after 2 min without a reply |
| `chat_live_notify` | switch | on | email the team: ≤ 1 per conversation per 15 min, none while the inbox is open |
| `chat_live_notify_email` | text | admin email | also the reply-to of replies emailed to visitors |
| `chat_live_store_ip` | switch | on | |
| `chat_live_retention` | text (days) | `90` | |
| `chat_ai_*` | | | added by the AI Assistant's `FW_AI_Visitor` |

## Public hooks

- `fw_ext_chat_channels( $channels, $ext )` — add / remove / reorder channels. A channel is a link
  `{ key, name, url, external }` or an **action** `{ key, name, action }`; an action renders as a
  `<button data-upw-chat-action>` and fires the DOM event `upw-chat:action` on `document`
  (`detail: { action, trigger }`). The AI Assistant's visitor channel (`ai`) is one.
- `fw_ext_chat_settings_fields( $options, $ext )` — add fields to `$options['chat_button']['inner-options']`;
  name them `chat_live_*` / `chat_ai_*` to land on those tabs (anything else → Channels). Read with
  `fw_ext('chat')->get_option( $key )`.
- `fw_ext_chat_channel_svg( '', $key )` — inline SVG for a custom channel key.
- `fw_ext_chat_capability` — who may read and answer chats (default `edit_pages`).
- `fw_ext_chat_settings_saved( $messages, $values, $ext )` (filter) — after Chat → Settings is saved (the form is
  multipart, so `$_FILES` is there); return extra notice lines. The AI Assistant's knowledge files use it.
- `fw_ext_chat_export_data( $data, $ext )` (filter) / `fw_ext_chat_import_data( $data, $with_settings, $ext )`
  (action) — add data to the JSON export and read it back on import.
- `fw_ext_chat_visitor_ip( $ip )` — the IP to store (e.g. read a trusted proxy header).

## Notes / gotchas

- **Switch values are `true` / `false`** in the store (the switch type's own choices). `get_option()`
  returns `'yes'` / `'no'`; `save_values()` and `chat-settings-update` accept either and normalise.
- **Moved from Theme Settings in 1.0.6.** Before, the values lived in the theme-scoped `chat_button` multi
  under Theme Settings → Site-wide UX → Chat Button (lost on a theme switch). `_maybe_move_settings()`
  copies them once (flag option `fw_ext_chat_settings_moved`); until then `get_values()` falls back to the
  theme bucket. The Theme Settings sub-tab now only links to Chat.
- **Polling, no websockets:** the open window polls every 4 s, a closed one every 30 s (to badge the
  button), a hidden tab every 60 s; the inbox every 5 s. "Team online" = the inbox polled within 120 s
  (transient `fw_ext_chat_agents_online`).
- **Abuse limits:** honeypot field `hp`, first message ≥ 1.5 s after opening, per IP ≤ 10 messages/min and
  ≤ 5 new conversations/hour (transients `fw_chat_rl_*`), 2,000 characters, plain text.
- **System messages** ("Left an email address…") are shown in the inbox only, never to the visitor.
- A reply is **emailed to the visitor** only when they left an email and have not polled for 60 s.
- Visitor requests send no cookies (`credentials: 'omit'`), so cached pages are fine and nothing depends on
  a nonce.
