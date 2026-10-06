<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# short-links extension

Branded short URLs on the site's own domain (`yoursite.com/deal` → any URL) with click tracking. **Active by default:** no (activate under **Unyson+ → Extensions → Short Links**). Admin screen: **Unyson+ → Short Links** (tabs: Links · Add New · Edit Link · Reports · Import / Export · API & Webhooks · Settings). It is the ONLY settings screen: the Extensions card's Settings link points at its Settings tab (`fw_ext_manager_settings_url`), and the manager's generic form for this extension redirects there.

## Provides

- **Tables** (`$wpdb->prefix`, created and versioned by `FW_Short_Links_Installer::maybe_install()` on every load; option `fw_ext_short_links_db_version`):
  - `fw_short_links`: the link record — `slug` (**UNIQUE**, case-insensitive through the collation), `target_url`, `title`, `notes`, `redirect_type` (301/302/307/308), `status` (`enabled`/`disabled`), `fallback_url`, `nofollow`, `sponsored`, `new_window`, `param_forwarding`, `track`, `owner_id`, `clicks`, `uniques`, `version`, `created_at`/`updated_at` (UTC), `deleted_at` (trash).
  - `fw_short_link_meta`: per-link key/value storage for later features.
  - `fw_short_link_daily` (since 1.0.1): `link_id` + site-local `day` → `clicks`, `uniques`. Written with the click, in every tracking mode. Charts and stats read it, and it survives the retention trim. A site upgrading from schema 1.0.0 backfills it from its raw clicks.
  - `fw_short_link_keys`: API keys, storing only `prefix` (first 12 characters) + `key_hash` (HMAC-SHA256 with the `auth` salt), `scopes`, `user_id`, `last_used_at`, `revoked_at`.
  - `fw_short_link_webhooks` + `fw_short_link_webhook_queue`: subscriptions, and pending deliveries with `attempts` / `next_attempt_at`.
  - `fw_short_link_clicks`: one row per click in full tracking — `ip` (varbinary(16), anonymised by default), `visitor`, `is_unique`, `referrer`, `country`, `device`, `browser`, `os`, `query`, `user_id`.
- **Categories** (since 1.0.1): the taxonomy `fw_short_link_cat`, registered on the object type `fw_short_link`, with link ids as the object ids. It uses `_update_generic_term_count`, terms are managed on core's edit-tags screen, and the term capabilities are `manage_short_links` (manage) and `edit_short_links` (assign). Helpers: `FW_Short_Links_Categories::set( $id, $ids_or_names, $create )`, `::of()`, `::names_for( $ids )`. Links pick categories via the `categories` input (ids or names) on create/update, and the list has a column and a filter.
- **Capabilities:** `edit_short_links` lets a user make and edit their own links (administrator, editor, author). `manage_short_links` lets them edit anyone's links (administrator, editor). Settings require `manage_options`.
- **Shortcode:** `[short_link id="12"]` or `[short_link slug="deal" text="Get the deal" class="btn" target="_blank"]`. It outputs `<a class="short-link">` with `rel` built from the link's nofollow and sponsored flags (plus `noopener` for `_blank`). If `text` is empty it falls back to the link title, then the URL.
- **Helpers** (`helpers.php`, public contract):
  - `fw_ext_short_links_get( $id_or_slug )` returns the row object or null; trashed links are included, so check `->deleted_at`.
  - `fw_ext_short_links_url( $id|$slug|$row )` returns the public short URL, or `''` for a trashed or missing link.
  - `fw_ext_short_links_create( array $data )` creates a link with the same rules as the admin screen and returns the row or a `WP_Error`.
- **REST `fw-short-links/v1`** (cookie+nonce or an Application Password; authors are limited to their own links):
  - `GET /links` (`search`, `view` = all|enabled|disabled|trash, `orderby`, `order`, `per_page` ≤ 100, `page`; the total is in `X-WP-Total`) and `POST /links`.
  - `GET` / `PATCH` / `DELETE /links/{id}`. `DELETE` trashes the link; add `?force=1` to delete it permanently.
  - `POST /links/{id}/restore`.
  - `GET /slug` returns a fresh free slug; `GET /slug?check=x` reports `{available, problem}`.
  - A link's JSON shape comes from `FW_Short_Links_Service::to_array()`.
  - **Optimistic locking:** send `version` (or an `If-Match: <version>` header) on PATCH, and a stale write gets 409 `version_conflict`. Single-link responses carry `ETag: "<version>"`.
  - **Added in 1.0.1:**
    - `POST /links/batch` — `{operations:[{op:create|update|delete|restore, id?, version?, force?, data?}]}`, up to 100, with a result per operation. It is not a transaction.
    - `GET /links/{id}/stats` and `GET /stats` — `from`/`to` are site-local Y-m-d (default: the last 30 days). They return `clicks`, `uniques`, `links` and a gap-free daily `series`. `breakdown[]` accepts referrer|country|device|browser|os (raw clicks, so only what retention kept), and `top` returns the top links.
    - `GET /categories`.
    - `GET /openapi.json` — public, OpenAPI 3.1, generated from the registered routes.
    - On `GET /links`: `category`, `view=any` (trashed included) and `modified_since` (ISO 8601), for sync clients.
  - **API keys:** `Authorization: Bearer fwsl_<40 alnum>`.
    - A key acts as the user who made it, narrowed by scopes `read` / `write` / `stats`; a missing scope returns 403 `fw_short_links_scope`.
    - Keys authenticate only on this namespace. Elsewhere they are ignored, so `wp/v2` sees an anonymous request.
    - Rate limit: 120 requests a minute per key (filter `fw_ext_short_links_api_rate_limit`); over the limit returns 429.
    - A bad or revoked key returns 401 `fw_short_links_invalid_key`.
    - The filter runs on `determine_current_user` at priority **30**. It must stay after core's cookie (10) and application-password (20) filters, because `wp_validate_auth_cookie()` treats any value it is handed as a cookie string and returns false, which discards a user id set earlier.
- **Import / export** (`FW_Short_Links_Transfer`, since 1.0.1):
  - Export streams CSV (columns: `slug, target_url, title, notes, redirect_type, status, fallback_url, nofollow, sponsored, new_window, param_forwarding, track, categories` (pipe-separated), `clicks, uniques, created_at`, formula-guarded) or JSON (`{format:"fw-short-links",version:1,links:[…]}` including `meta`).
  - Import is a JOB:
    1. The source is normalised to rows and stored under `uploads/unysonplus/short-links/imports/` (deny-all `.htaccess`).
    2. A dry run classifies every row (create / update / rename / skip / error).
    3. The browser drives `step()` over AJAX (`fw_short_links_import_step`), 200 rows per chunk.
    4. Optionally, a `clicks` phase copies click history.
  - Rows are matched by slug only, case-insensitive. A slug repeated within a file is skipped (the first occurrence wins), tracked across chunks.
  - Policies: `skip` / `overwrite` (also restores a trashed match) / `rename` (`slug-2` …).
  - CSV headers accept the aliases `url`, `destination`, `name`, `description`, `type`, `category`. Cells are parsed with `fgetcsv`, so multi-line cells survive.
  - Per-link webhooks are held back during an import, and one `links.imported` event is sent instead.
- **Migration from another link plugin:**
  - `detect_source()` looks for `{prefix}prli_links`; `read_source()` maps it.
  - Kept as-is: 301/302/307. Other redirect kinds become 307, with meta `_imported_redirect_type`.
  - Left out: payment links and links without a URL. Trashed links only on request.
  - Totals are taken from the columns, or from the `static-*` metas in counts-only mode. `category` terms are joined to `wp_terms`.
  - The source id is saved as meta `_import_source_id`, which keeps re-runs idempotent under `skip`.
  - Click rows are mapped: IP packed (and anonymised per the setting), raw user agent → families, `first_click` → `is_unique`. The rollup is rebuilt for the imported links. The source tables are never modified.
  - The UI label stays generic ("Import from another link plugin") under the naming rule.
- **Webhooks** (`FW_Short_Links_Webhooks`):
  - Events: `link.created|updated|trashed|restored|deleted`, `links.imported`, `clicks`. Click events are batched from a cursor, at most 500 every 5 minutes.
  - Deliveries are queued, never sent inline. A cron worker posts them through `wp_safe_remote_post`, so localhost and private hosts are refused. Backoff is 1 min, 5 min, 30 min, 2 h, 12 h, then the delivery is dropped. After 20 consecutive failures the webhook switches itself off.
  - Headers: `X-Webhook-Event`, `X-Webhook-Id`, `X-Webhook-Signature: t=<unix>,v1=<hex HMAC-SHA256(secret, "t.body")>`.
  - Body: `{id, event, created_at, site, data}`.
  - Crons exist only while an active webhook needs them. The admin "Send test" button sends a `ping` event directly, bypassing the queue.
- **Reports tab:** 7 days / 30 days / 90 days / 12 months. Shows KPIs, an inline-SVG clicks-per-day chart (axis steps of 1, 2, 2.5 or 5 × 10ⁿ, whole numbers only), top links, and breakdowns.
- **Privacy:** registered with WordPress's personal-data exporter and eraser, matching clicks by `user_id` (only logged-in visitors are identifiable). Erasing anonymises the clicks (user, IP and visitor are cleared) and keeps the totals. Suggested policy text is added to the Privacy Policy Guide.
- **Admin:**
  - The links list is a WP_List_Table: All / Enabled / Disabled / Trash views, search, sort, a copy button.
  - Row actions: Edit & stats / Test / Duplicate / Reset clicks / Trash, plus Restore / Delete permanently in the Trash view.
  - Bulk actions: enable, disable, nofollow on/off, tracking on/off, reset, trash, restore, delete.
  - The add/edit form generates slugs and checks availability live (REST). If the title is left empty it is fetched from the destination page's `<title>`.
  - Per-link stats: totals, then top referrers / countries / devices / browsers, then a paginated click log.
  - Quick Add: an admin-bar "+ New → Short Link" item and a dashboard widget.
- **Settings** (`settings-options.php`, defaults mirrored in `FW_Short_Links_Service::settings()`):
  - Link defaults:
    - `default_redirect` (`307`)
    - `link_prefix` (`''` — e.g. `go` gives `/go/slug`; changing it moves every link)
    - `slug_length` (5; generated slugs skip look-alike characters)
    - `default_nofollow` (on), `default_sponsored` (off), `default_track` (on)
    - `reserved_patterns` (fnmatch wildcards)
  - Tracking:
    - `tracking_mode`: `full` (default), `counts` or `off`.
    - `track_editors` (off), so testing your own links doesn't count.
    - `use_cookies` (on), `anonymize_ip` (on).
    - `retention_days` (`0` = keep forever; otherwise a daily cron trims rows and keeps the totals).
  - Filtering: `bot_filter` (on), `bot_patterns`, `excluded_ips` (exact or CIDR, v4/v6), `trusted_proxies`.
  - "Remove all data" (type DELETE) drops the tables and capabilities. Deactivating never does this.
- **Hooks:**
  - Filters:
    - `fw_ext_short_links_prepare( $data, $input, $existing )` filters validated data before a write; return a WP_Error to reject it.
    - `fw_ext_short_links_reserved_slugs`, `fw_ext_short_links_bot_regex`.
    - `fw_ext_short_links_resolve( $link, $slug )`.
    - `fw_ext_short_links_target_url( $url, $link )`: return `''` to let WordPress handle the request.
    - `fw_ext_short_links_should_track( $bool, $link )`.
  - Actions:
    - `fw_ext_short_links_saved( $link, $is_new )`, `fw_ext_short_links_deleted( $ids, $permanent )`, `fw_ext_short_links_restored( $ids )`.
    - `fw_ext_short_links_before_redirect( $link, $target )`.
    - `fw_ext_short_links_click( $link_id, $click, $unique )`.

## Notes / gotchas

- **The redirect runs on `init` priority 0**, before WordPress routes the request. It skips admin, AJAX, cron, REST, XML-RPC and CLI requests, and handles GET and HEAD only. A POST to a short-link path falls through to WordPress.
- **A page view that is not a short link costs no query.** The autoloaded option `fw_ext_short_links_index` holds an 8-character hash of every live slug and is checked first. Past 5,000 links the index is switched off (`'off'`), and every path falls back to one indexed lookup, cached in the object cache group `fw_short_links` with a negative entry. The repository rebuilds the index and clears the cache on every write. Writing SQL against the table directly bypasses both, so go through the repository or service.
- **Slugs** may contain letters, digits, `- _ . ~ /` (so `deals/summer` works), are case-insensitive, and are at most 191 characters. A slug is rejected when it is:
  - taken, including by a trashed link (a trashed link keeps its slug);
  - reserved (WordPress paths, feeds, sitemaps, `*.php`, plus the `reserved_patterns` setting);
  - the address of an existing post, page or term (checked through `url_to_postid` and `get_page_by_path`);
  - on a subdirectory multisite's main site, a subsite's address (WordPress routes that path to the subsite first, so the link could never fire; since 1.0.2);
  - a link pointing at itself.
- **Destinations** must be absolute http(s) URLs; `mailto:`, `tel:` and `sms:` also work and are sent as a raw 302 `Location`. `javascript:` and relative URLs are rejected.
- **Query forwarding appends the raw `QUERY_STRING`** before any `#fragment`, so percent-encoding is preserved. Duplicate keys are not merged; the destination sees both.
- **Disabled links:** with a `fallback_url` the link sends a 302 there. With no fallback it falls through to WordPress, which shows its normal 404. Trashed links never redirect.
- **Every redirect sends `Cache-Control: no-store`**, permanent types included, because a browser that caches a 301 never asks again, so later edits and click counts would be lost. It also sends `X-Robots-Tag: noindex[, nofollow]` and no branding or version header.
- **Click writes happen after the response** (a shutdown function calls `fastcgi_finish_request()`/`litespeed_finish_request()` first). Counters update atomically in SQL.
- **Visitor IP:** only `REMOTE_ADDR` is trusted, unless it is listed in `trusted_proxies`. In that case the IP comes from `CF-Connecting-IP`, or else the rightmost `X-Forwarded-For` hop that is not itself a proxy, or else `X-Real-IP`. Forwarded headers sent by anyone else are ignored, so they cannot be used to dodge exclusions.
- **Uniques:**
  - The visitor ID is an HMAC of IP and user agent with a daily-rotating salt; it cannot be reversed to an IP. With cookies on it is persisted in `fwsl_v` (1 year), and `fwsl_{id}` (30 days) marks "seen this link".
  - In full mode the click history (same visitor and link within 30 days) is checked as well. So a browser that refuses cookies is not counted as a new unique on every click.
- **Not counted:** bots (empty user agent or `Accept` header, a built-in regex covering crawlers, unfurlers, monitors, HTTP libraries, headless browsers and AI fetchers, plus `bot_patterns`), excluded IPs, HEAD requests, and logged-in users who can edit links (unless `track_editors` is on). They are all still redirected.
- **Country** comes only from headers a CDN or host already set (`CF-IPCountry`, `X-Vercel-IP-Country`, `CloudFront-Viewer-Country`, …). There is never a remote lookup, and the raw user agent is never stored, only device / browser / OS families.
- **Retention** deletes click rows in batches of 5,000 (up to 20 batches per run). Link `clicks` / `uniques` are lifetime totals and are not recounted.
- **Permanent delete** removes the link's meta and clicks too, so no orphaned rows are left behind.
- Planned (not built yet): QR codes, UTM builder, targeting (geo / device / language), rotation and A/B tests, expiry and click caps, wildcard links, link health checks, editor link pickers, a page-builder element, keyword auto-linking, link-in-bio, local GeoIP. Don't document or generate these as available.
