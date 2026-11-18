<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# mailer extension

Central email/SMTP configuration used by other extensions (Forms, etc.) to send mail. **How you get it:** not in the core-only plugin zip — it is downloaded as a requirement of the Forms extension's Contact Forms sub-extension (`display => false`, `standalone => false`). Version: 1.2.26.

## Provides

- **Shortcodes:** none.
- **Settings/options:** global email options — send **method** (`wpmail` = WordPress mail, or `smtp` with host / port / auth / encryption), from name / address — with a **Test connection** action. Stored site-wide in the `fw_ext_settings_options:mailer` WP option, flat (`method`, `smtp{host,username,password,secure,port}`, `general{from_name,from_address}`). Edited in two places that share it: the `mailer` option type (the Contact Form element's **Settings → Mailer** tab) and, since 1.2.26, the extension's own settings screen (`settings-options.php` → `FW_Option_Type_Mailer::get_settings_page_options()`, the same fields without the test box; `admin.php?page=fw-extensions&sub-page=extension&extension=mailer`, linked from **CRM → Settings → Sending** because the extension is hidden from the Extensions list).
- **Default method = WordPress mail.** When no send method has been chosen, `send()` and `is_configured()` fall back to `wpmail` (filter **`fw_ext_mailer_default_method`**, default `'wpmail'`), which needs no settings — so a new site's forms send instead of failing with "Invalid send method". **On a live host, configure SMTP** (or an SMTP / transactional-mail plugin that hooks `wp_mail()`): plain PHP mail from a web server is often rejected or filed as spam.
- **Public hooks/filters:**
  - `fw_ext_mailer_send_mail( $to, $subject, $message, $data = array() )` — the send helper other extensions call (`$data`: `reply_to`, `cc`, `bcc`, `attachments`, `from_name` — a sender name for this one email; the address stays the site's). Returns `{ status: 0|1, message }` — on failure `message` is the error.
  - `fw_ext_mailer_default_method` (filter) — the method used when none is chosen; return `'smtp'` to make SMTP the fallback (a method saved in the settings still wins).
  - `fw_ext_mailer_send_methods` (filter) — register another delivery backend; `fw_ext_mailer_before_send` (filter) — the email object just before dispatch.
  - `fw_ext_mailer_is_configured()` — whether valid mail settings exist.
  - AJAX `fw_ext_mailer_test_connection` (nonce-gated) — the settings-page test-email button.

## Settings govern wp_mail() (1.2.26)

With method `smtp` and valid settings, a `phpmailer_init` hook (priority 5) sends every `wp_mail()` through that server, so WordPress's own mail and the CRM (one-to-one email, campaigns, confirmations) use it. `wp_mail_from` / `wp_mail_from_name` (priority 5) swap in `general/from_address` / `from_name` only for WordPress's defaults (`wordpress@…`, "WordPress"), so a CRM sender profile (priority 50) or an SMTP plugin (default priority 10, runs later) still wins. Filter **`fw_ext_mailer_handle_wp_mail`** (return `false`) limits the settings to `send()` again. Before 1.2.26 nothing connected the Mailer to `wp_mail()`, although the CRM assumed it.

## AI ability (1.2.24)

`mailer-sender` reads, and when given sets, `general/from_name` and `general/from_address` (undoable), and reports the send method and whether it is configured. The send method and SMTP credentials are deliberately not settable through AI: a password must never pass through an AI conversation, so the owner enters SMTP details on the Mailer screen.

## Notes / gotchas

- **Not standalone / hidden** (`standalone => false`, `display => false`): it activates as a dependency of extensions that send mail (e.g. Forms) rather than being toggled directly.
- It's the single choke point for outbound mail — configure SMTP here once and every dependent extension inherits it.
