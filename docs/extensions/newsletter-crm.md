# newsletter-crm extension

Stores and manages the people who sign up through the `[newsletter]` element, and is the base a
full CRM (tags/segments, campaigns, automations, ESP sync) grows onto. **Active by default:** no —
enable it under Unyson+ → Extensions.

Without it, a `[newsletter]` signup is only emailed to the site admin and is never stored anywhere.

## Provides

- **Admin screen:** Unyson+ → **Newsletter** — five native `nav-tab-wrapper` tabs:
  - **Subscribers** — a `WP_List_Table`: search, status views with counts, list filter, sortable
    email/status/created columns, bulk (mark unsubscribed / mark subscribed / delete), row actions
    (view, unsubscribe, delete), an inline "Add subscriber" form, and a single-subscriber view.
    Filter the screen and click **Save as segment** to store the current filters as a named segment.
  - **Lists, Tags & Segments** — create/delete lists and tags (one panel each, same code — same
    table), with subscriber counts, and manage saved segments with a plain-English description of
    what each matches and a live count.
  - **Campaigns** — compose (name, subject, body in either the **full `wp_editor` visual editor**
    with Add Media, or the **Email Builder** — a drag-drop block canvas), pick an audience
    (list / tag / saved segment), then **Send now** or **Schedule**. Shows a live progress bar per
    campaign, plus test sends, pause/resume and a manual **Run sending now**.
  - **Import / Export** — CSV upload → column-mapping step → **chunked, resumable** run with a
    progress bar; and a CSV export (the Subscribers tab's export button exports *the current
    filter*, not everything).
  - **Settings** — plus an explicit, opt-in "Remove all data" action.
- **Shortcodes:** none. It is the storage layer under the existing `newsletter` shortcode.
- **Public endpoints** (query args on the home URL — no rewrite rules, nothing to flush):
  `?fw-crm-confirm=<token>` and `?fw-crm-unsubscribe=<token>`. Both render a minimal,
  self-contained, `noindex` page (light/dark aware) that a site can replace via
  `unysonplus_newsletter_crm_endpoint_page`.
- **Settings** (`fw_get_db_ext_settings_option('newsletter-crm')`): `default_list`,
  `auto_create_lists`, `admin_notify`, `double_optin`, `confirm_on_visit`, `store_ip`,
  `anonymize_ip`, `confirm_subject`, `confirm_body`, `welcome_email`, `welcome_subject`,
  `welcome_body`.
- **REST:** `fw-crm/v1/subscribers` — `GET` (status/list/search/per_page/page, `X-WP-Total` headers)
  and `POST` (email/name/list/tags). Capability-gated; tokens are never exposed.
- **GDPR:** registers a personal-data exporter and eraser, so WordPress's own
  Tools → Export/Erase Personal Data covers subscribers.

## Tables

Five, prefix `{$wpdb->prefix}fw_crm_`, created by `dbDelta` behind the
`fw_ext_newsletter_crm_db_version` option (per-site prefix, so each multisite site has its own).

| Table | Purpose |
|---|---|
| `fw_crm_subscribers` | `id`, `email` (**UNIQUE**, varchar 190, stored lowercased), `first_name`, `last_name`, `status`, `source`, `source_url`, `confirm_token(_at)`, `unsubscribe_token`, `ip`, `consent_at`, `confirmed_at`, `unsubscribed_at`, `meta` (JSON), `created_at`, `updated_at` |
| `fw_crm_lists` | Lists **and** tags in one table, discriminated by `type` (`list`\|`tag`); `UNIQUE (type, slug)` |
| `fw_crm_subscriber_pivot` | Membership for both: `subscriber_id`, `object_id`, `object_type`, per-list `status` |
| `fw_crm_subscriber_meta` | Custom fields + per-provider remote IDs. Adding a field is never an `ALTER TABLE` |
| `fw_crm_segments` | A **saved query** — `filters` JSON in the same arg shape `Subscribers::query()` takes |
| `fw_crm_campaigns` | `title`, `subject`, `body` (compiled HTML), `body_json` (Email Builder block tree), `audience` JSON, `status` (draft/scheduled/sending/paused/sent), `scheduled_at`, `started_at`, `finished_at`, `total`/`sent`/`failed` |
| `fw_crm_campaign_queue` | **One row per recipient** — `campaign_id`, `subscriber_id`, snapshotted `email`, `status` (pending/sent/failed/skipped), `error`, `sent_at`; `UNIQUE (campaign_id, subscriber_id)` |

`status` is varchar, not ENUM: `subscribed`, `unsubscribed`, `pending`, `bounced`, `complained`.

## Architecture (the seams you build on)

```
Installer  -> the only DDL        Repository -> the only SQL (Subscribers / Lists)
Service    -> the only rules      Providers  -> outbound; the local store is just the first
Admin/REST -> presentation, over the same service
```

Nothing above the repository writes SQL; nothing below the service fires a hook.

**Capture** builds on the shortcode's existing hooks rather than replacing its endpoint.
`fw_newsletter_subscribe` is an *action fired before* `fw_newsletter_subscribe_result`, so the
handler stores first and reports a failure through the result filter afterwards.
`fw_newsletter_handled` is returned `true` only when the `admin_notify` setting is off *and* the
row was actually stored.

**Provider interface** — subclass `FW_Newsletter_CRM_Provider`, register on
`unysonplus_newsletter_crm_providers`. Designed against Mailchimp / MailerLite / Brevo, which are
all email-keyed upserts, so `subscribe($subscriber, $args)` takes the whole subscriber and the
adapter owns idempotency. Return `true|WP_Error`, never a bare bool. `map_list_id()` translates our
list ID to the provider's audience/group ID — mapped, never guessed.

## Public hooks

| Hook | Type | Fires / does |
|---|---|---|
| `unysonplus_newsletter_crm_subscriber_added` | action | A new row was created |
| `unysonplus_newsletter_crm_subscriber_confirmed` | action | Double opt-in completed |
| `unysonplus_newsletter_crm_subscriber_unsubscribed` | action | Opted out, from any path |
| `unysonplus_newsletter_crm_subscriber_resubscribed` | action | A previously opted-out address came back |
| `unysonplus_newsletter_crm_subscriber_updated` | action | Fields changed (`$new, $old, $context`) |
| `unysonplus_newsletter_crm_subscriber_imported` | action | Per CSV row |
| `unysonplus_newsletter_crm_subscriber_deleted` | action | Hard delete |
| `unysonplus_newsletter_crm_validate` | filter | Return `WP_Error` to veto a signup |
| `unysonplus_newsletter_crm_subscriber_data` | filter | Rewrite the record just before write |
| `unysonplus_newsletter_crm_field_map` | filter | Column ⇄ field mapping (CSV + ESP adapters) |
| `unysonplus_newsletter_crm_providers` | filter | The provider registry |
| `unysonplus_newsletter_crm_capability` | filter | Gate the admin screen + REST (default `manage_options`) |

## Notes / gotchas

- **Unsubscribing never deletes the row** — a forgotten address is silently re-subscribed by the
  next import. The GDPR eraser anonymises in place for the same reason.
- **A CSV import skips people whose stored status is `unsubscribed`** unless the explicit override
  checkbox is ticked. Imports are idempotent; re-running the same file changes nothing.
- **Export cells beginning `= + - @` are apostrophe-prefixed** (CSV injection into Excel), and the
  export streams from the page's `load-` hook, so it must stay before any output.
- **A segment is re-evaluated on every open**, never denormalised: someone who newly matches is
  simply in it, someone who stops matching drops out. `Service::sanitize_segment_filters()` strips
  paging, ordering and any explicit `ids` before storing, so a segment can never degrade into a
  frozen snapshot, and a filterless segment is refused. Passing `segment` to `query()`/`count()`
  merges its filters with any explicit filter still winning — so you can narrow a segment further.
- **Bulk tagging** goes through `Service::set_membership( $ids, $object_id, 'add'|'remove', 'tag' )`,
  which returns the number of subscribers **actually changed** — `add_to_list()` returns false when
  the membership already existed (the UNIQUE pivot index makes it a no-op).
- **Deleting a list or tag removes its membership rows and nothing else.** Subscribers are never
  touched, and a segment referencing it survives — it just matches nobody.
- **The element's List ID is free text.** An unrecognised ID auto-creates the list when
  `auto_create_lists` is on (the default); otherwise the signup falls back to `default_list`.
- **Double opt-in is complete.** Signups land as `pending` and are emailed a tokened link. The link
  opens a page with a **button that POSTs** rather than confirming on the GET — mail scanners visit
  every URL in an inbound email and would otherwise opt people in; `confirm_on_visit` disables that
  guard. Confirm tokens are single-use and expire after 48h
  (`unysonplus_newsletter_crm_confirm_token_ttl`); the **unsubscribe token never expires**, because
  it lives in the footer of every email ever sent. "Resend confirmation" (row action + single view)
  rotates the token, so a forwarded link dies, and refuses to target someone who unsubscribed.
- **Unsubscribe is RFC 8058 one-click.** Every email carries `List-Unsubscribe` and
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (Gmail/Yahoo require this of bulk senders), so
  a bare POST to the endpoint unsubscribes with no confirmation step — a mail client cannot send a
  nonce, which is why the token is the credential. A GET still shows a normal page with a button.
  `FW_Newsletter_CRM_Mail::unsubscribe_headers()` is public so the future campaign sender reuses it.
- **All mail goes through `wp_mail()`**, so the Mailer/SMTP extension governs transport and
  SPF/DKIM alignment. Templates are editable in Settings; placeholders are `{{name}}`,
  `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{site_name}}`, `{{site_url}}`, `{{confirm_url}}`,
  `{{unsubscribe_url}}` (extend via `unysonplus_newsletter_crm_mail_placeholders`; the whole HTML
  shell is replaceable via `unysonplus_newsletter_crm_mail_html`).
- **`FW_Newsletter_CRM_Mail` hooks the lifecycle actions** rather than being called from the service
  — delete it and the store still works. That is deliberate: it proves the hooks carry enough
  context to build on.
- **Campaign sending** runs on WP-Cron (`fw_crm_send_tick`, every minute) and is designed around
  three WP-Cron facts: it fires on page loads not on a clock, it can fire the same event twice
  concurrently, and a PHP timeout mid-batch is normal. Hence (a) the **per-recipient queue table**,
  which makes a send resumable — a killed request loses at most the row in flight; (b) an
  **`add_option()` lock**, atomic because `option_name` is UNIQUE (a transient is *not* atomic under
  an external object cache), stolen after 10 minutes so a dead worker can't stall the queue; and
  (c) a **settings-driven batch size**, because the ceiling is the mail host's rate limit, not PHP.
  On a quiet site WP-Cron never fires — use **Run sending now**.
- **Only confirmed subscribers are ever mailed**, and eligibility is re-checked **at send time**, so
  someone who unsubscribes between queue-build and their turn is marked `skipped`, not mailed.
  A campaign is **read-only once sending starts**; **pause keeps the queue** so resume continues
  rather than restarting; and a body without `{{unsubscribe_url}}` gets an unsubscribe line
  appended automatically.
- **All email bodies go through one pipeline** — `Mail::render_body()` = `wp_kses_post` →
  `make_clickable` → **`maybe_autop`** → the shared HTML shell. `maybe_autop()` runs `wpautop()`
  **only when the body has no block-level markup of its own**: the plain-text confirmation templates
  need it, but visual-editor HTML is already full of `<p>` and re-wrapping double-paragraphs it.
  Never call `wpautop()` directly on a body. The campaign editor uses `wp_editor()` with the ID
  `fw_crm_body` — that ID may contain only lowercase letters and underscores, and a hyphen silently
  breaks TinyMCE. A campaign that has started sending renders a read-only preview instead of an
  editor.
- **The Email Builder** is the framework's fourth `FW_Option_Type_Builder` subclass (after the Page
  Builder, Form Builder and the Learning extension's Quiz Builder), so the drag-drop canvas, item
  tray, options modal **and the width changer** are inherited. The **14 blocks** — Logo, Heading,
  Text, Image, Button, Divider, Spacer, Menu, Social, Hero, Video, Table, Footer, Raw HTML —
  **compile themselves**
  to nested tables with inline styles — the shortcode render pipeline is unusable for email because
  it emits divs, CSS classes and enqueued stylesheets. The compiler adds an Outlook ghost table,
  the PixelsPerInch fix, a VML button fallback, and a `<style>` block carrying mobile stacking as
  *enhancement only* (Gmail strips it in clipped views).
  `body_json` is the source of truth; it is compiled into `body` **on save**, so the queue,
  batching, test sends and `render_body()` never learn a builder exists, and visual-editor
  campaigns keep working. Switching back to the visual editor clears the tree.
  `Compiler::estimate_size()` reports against Gmail's ~102 KB clipping limit, and
  `to_plain_text()` builds the text alternative from the **blocks**, not by stripping tags off the
  compiled HTML — so **every new block needs a case there**, or it silently vanishes from the text
  part. A block implements `compile()` / `get_type()` / `get_thumbnails()` / `get_preview_keys()`
  and is listed in `Email_Builder::_init()`; the canvas summary is data-driven from
  `get_preview_keys()`, so adding a block needs no JavaScript.
- **Some blocks are shaped by what email cannot do**, not by preference: **Social** ships no icon
  set (Gmail strips SVG; bundling brand rasters means redistributing trademarks) and renders text
  links with an optional uploaded icon; **Video** links a poster image because no client plays
  video; **Hero** carries a VML background fallback for Outlook; **Raw HTML** is filtered by the
  saving user's `unfiltered_html` capability, which only works because compilation happens on save.
- **The email template library is the framework's**, switched on with `'template_saving' => true`
  on the builder option — the Templates panel, save/load/delete and JSON export/import come from
  the builder extension, scoped by builder type so email and page templates never mix. Six
  starters (Announcement, Newsletter digest, Product promotion, Welcome, Event invitation, Plain
  letter) ride `fw_ext_builder:predefined_templates:email-builder:full`. They are authored as PHP
  rather than pasted JSON because a template stores option *values* and rots silently when block
  options change; each ends with a footer block (bulk mail legally needs an opt-out and a postal
  address) and hardcodes almost no colour, so the site's palette shows through.
- **The site title reaches readers as plain text** — `Mail::site_name()` strips tags rather
  than escaping them, and the `{{site_name}}` placeholder, the Logo block's text + alt, and the
  plain-text renderer all go through it. A title may legitimately contain markup (the Site
  Converter emits a two-tone wordmark and the theme prints it raw), so `esc_html()` would mail
  literal escaped tags, and keeping the tag is pointless because an inbox has no stylesheet.
  It also stops a theme setting injecting HTML into every email.
- **Every block has an "Extra styles" field — inline declarations, never a CSS rule.** It writes
  into the block's own `style=""` (last, so the author wins). This is the only honest form of a
  Custom CSS box in email: a rule needs a stylesheet, and Gmail drops everything past ~102 KB
  (taking `<style>` with it) while forwards commonly strip styles — so a rule would work in
  testing and vanish for part of the list. `sanitize_extra_styles()` allow-lists by shape (every
  part must be `property: value`), which rejects selectors, at-rules and braces as a consequence
  of the format, then drops `expression()`, `javascript:`/`vbscript:`, `behavior:`, `@import`,
  `data:text/html`, angle brackets and comments. Quotes survive so `font-family:'Segoe UI'` works.
- **The compiler calls `render()`, not `compile()`** — it stashes the block's values so shared
  helpers can read them and clears them afterwards. Hero and Spacer build their own wrapper and
  merge the extra styles themselves; a new block that skips `wrap_block()` must do the same.
- **Alignment uses the `image-picker` swatch control** (via one shared `align_option()`), so it
  matches the shortcodes' alignment field. The SVGs are copied into the extension rather than
  borrowed from the shortcodes extension, because the CRM works with that inactive and a control
  that degrades to radios depending on what else is active is worse than either one consistently.
  No "Default" swatch: it means "inherit from the theme/parent" and an email has no such cascade.
- **The Logo block has a `text` option** (empty = the site title, which appears as the field's
  placeholder rather than in its description) which doubles as the image's alt. It exists because the block's
  image → Customizer logo → site title fallback was invisible: the name appeared in the email
  with nothing in the panel to explain or change it. If a block resolves something implicitly,
  the panel must say so.
- **A compiled body is stored verbatim** — `Campaigns::sanitize()` skips `wp_kses_post()` when
  `Mail::is_document()` is true, because kses strips `<style>` and escapes the Outlook conditional
  comments, mangling builder campaigns **on save**. Visual-editor bodies still go through kses;
  that is where author markup actually arrives.
- **The campaign previewer renders through the SEND path, not a lookalike.**
  `Service::preview()` takes the same payload shape as `save_campaign()` so the editor can
  preview **unsaved** work without persisting anything, and it calls the same functions
  `Sender::send_one()` calls in the same order — the test asserts the output is
  byte-identical. The stand-in recipient is synthetic with empty tokens, so a preview's
  unsubscribe link can never opt a real person out. The iframe is `sandbox=""` because it
  renders whatever the author put in a Raw HTML block.
- **A body that is already a complete document skips the fragment pipeline**
  (`Mail::is_document()`). The builder compiles a whole `<!doctype html>` document, and
  `wp_kses_post()` strips `<style>` — which dumped the mobile CSS into real sends as
  visible text before the previewer surfaced it. `Sender::with_unsubscribe()` uses the same
  test so its opt-out line lands inside `</body>`, not after `</html>`.
- **Columns come from per-block widths**, not a nested container. Each block carries a `width`
  (`1_4`, `1_3`, `1_2`, `2_3`, `3_4`, `1_1`) set with the framework's own
  `FwBuilderComponents.ItemView.WidthChanger`; the vocabulary is registered via the
  `fw_builder_item_widths:email-builder` filter and is deliberately coarse (the page builder's
  twelfths give a ~50px column in a 600px email). `Compiler::pack_rows()` groups *consecutive*
  blocks while their widths fit — two halves sit side by side, a third half starts a new row, and a
  full-width block always stands alone.
  Rows use the hybrid pattern: an **MSO ghost table** with a real `<td>` per column for Outlook,
  **inline-block `<div class="fw-crm-col">`** for every other client, and a media query that stacks
  them on mobile. This is the one place email needs divs — MJML's output does the same; flex, grid
  and float remain forbidden. The container sets `font-size:0` (whitespace between inline-blocks
  renders as a visible gap) and each column resets it. **Outlook does not stack on mobile** — it
  ignores media queries, which is correct since the Word engine is desktop-only.
  Blocks therefore return a **self-contained table**, never a bare `<tr>`, so they work in both a
  full-width row and a column.
- **CSV import is chunked and resumable.** `CSV::import()` accepts `offset`/`line`/`max_rows`/
  `max_seconds` and returns the byte offset plus `done`; the offset is taken *after a completed
  row*, so resuming neither re-imports nor skips one, and error messages keep true file line
  numbers. Both limits default to 0 (no limit), so a direct call behaves as before.
- **Deactivating never drops a table.** Only the Settings tab's "Remove all data" does — and it
  unschedules the sender first, since a tick against dropped tables would fatal.
- Bump `FW_Newsletter_CRM_Installer::DB_VERSION` whenever the schema changes, or existing sites
  never receive it.
