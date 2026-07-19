# mailer extension

Central email/SMTP configuration used by other extensions (Forms, etc.) to send mail. **Active by default:** yes (loads as a dependency; `display => false`, `standalone => false`). Version: 1.2.20.

## Provides

- **Shortcodes:** none.
- **Settings/options:** global email options (from name/address, SMTP host/port/auth/encryption) with a **Test connection** action.
- **Public hooks/filters:**
  - `fw_ext_mailer_send_mail( $to, $subject, $message, $data = array() )` — the send helper other extensions call.
  - `fw_ext_mailer_is_configured()` — whether valid mail settings exist.
  - AJAX `fw_ext_mailer_test_connection` (nonce-gated) — the settings-page test-email button.

## Notes / gotchas

- **Not standalone / hidden** (`standalone => false`, `display => false`): it activates as a dependency of extensions that send mail (e.g. Forms) rather than being toggled directly.
- It's the single choke point for outbound mail — configure SMTP here once and every dependent extension inherits it.
