<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Site Migration extension

Moves a **whole** WordPress site to another install over HTTP. Ships **inactive**;
the user activates it in Unyson+ → Extensions.

- **Folder:** `framework/extensions/site-migration/`
- **Repo:** `UnysonPlus-Site-Migration-Extension`
- **Admin page:** Unyson+ → Site Migration (`admin.php?page=fw-site-migration`)
- **Capability:** `export` (single-site); `manage_network_options` on multisite
- **Networks supported** in three shapes — see *Multisite*.

## The product decision

A migration moves the **entire** site. There is no stage selection, no archive
file, and no import-from-zip. Selective, archive-based work belongs to the
**Backups & Demo Content** extension, which already does it — offering it in both
places would leave a user with two half-answers instead of one whole one.

## The flow

1. The **destination** site shows a connection line — its URL plus a secret —
   on the Destination tab.
2. The user pastes it into the **source** site's Source tab and clicks Connect.
   The source handshakes and shows what it is connected to.
3. One button: **Migrate**. The source pushes everything.

Both sites need the plugin and this extension active. The destination is doing
real work (loading SQL, writing files), so it cannot be a passive target.

## Stages

`FW_SM_Stage::all()` — no user selection.

| Constant | Covers |
|---|---|
| `database` | Every prefixed table |
| `uploads` | `wp-content/uploads` |
| `themes` | `wp-content/themes` |
| `plugins` | `wp-content/plugins` |
| `muplugins` | `wp-content/mu-plugins` |
| `other` | The rest of `wp-content` |
| `finalize` | Appended by the runner; asks the destination to swap |

Every stage carries `{ processed_bytes, target_bytes }`, so one progress bar
honestly covers a 400 MB uploads folder and a 12 MB table alike.

## Classes

| Class | Role |
|---|---|
| `FW_SM_Stage` | Stage catalogue; `source_dir()` and `destination_dir()` resolve separately |
| `FW_SM_State` | The single migration record (option `fw_sm_state`, not autoloaded) |
| `FW_SM_Queue` | Job table `{prefix}fw_sm_jobs`; jobs stored as JSON, never serialized PHP |
| `FW_SM_Replacer` | Serialization-aware search and replace |
| `FW_SM_Connection` | Key generation/rotation, HMAC-SHA256 signing, verification |
| `FW_SM_DB_Export` | `build_schema()` / `build_rows()` — returns SQL, writes nothing |
| `FW_SM_File_Scanner` | Resumable recursive scan with a persisted directory stack |
| `FW_SM_Sender` | Source side: signed HTTP client, gzip, retry classification |
| `FW_SM_Receiver` | Destination side: the `nopriv` endpoints |
| `FW_SM_Importer` | Staging tables, the swap, prefix repair (runs on the destination) |
| `FW_SM_Runner` | The background loop |

## Wire protocol

Source POSTs to the destination's `admin-ajax.php`. All `nopriv` — the source has
no session there.

| Action | Does |
|---|---|
| `fw_sm_r_verify` | Handshake; returns URL, name, ABSPATH, prefix, versions |
| `fw_sm_r_begin` | Opens a migration; clears stale staging tables |
| `fw_sm_r_sql` | Loads a gzipped SQL batch into staging tables |
| `fw_sm_r_file` | Writes one file (base64, optional gzip, sha1-checked) |
| `fw_sm_r_finalize` | Swaps staging into place, restores carve-outs, flushes |
| `fw_sm_r_abort` | Drops staging; the live site was never touched |

## The four things that must not be got wrong

**1. Authentication.** HMAC-SHA256 over every field, sorted so both sides build
the same input, compared with `hash_equals()` — a plain `===` leaks the key by
timing. A `timestamp` inside the signed payload bounds replay to 15 minutes.
Booleans are normalised before signing (`true`/`false` strings) or the two sides
disagree. Every handler calls `authenticate()` first; it responds and exits on
failure, so a handler that ignored the return value still cannot proceed.

**2. Nothing is written over live data.** SQL loads into `_fwsm_`-prefixed
staging tables; only `finalize` renames them into place. An abandoned or failed
migration leaves the destination exactly as it was. Rewrite patterns are
**anchored to the start of the statement**, so SQL text inside a post's content
is never rewritten.

**3. Incoming paths are refused, not sanitized.** `FW_SM_Receiver::safe_target()`
rejects absolute paths, `../`, backslash traversal, null bytes, and anything
whose resolved path leaves the stage root — including the subtle
`../plugins-evil/` sibling-prefix escape. A name that needed sanitizing was never
trustworthy.

**4. Replacement must be serialization-aware.** A plain `REPLACE()` breaks every
serialized value, because PHP records string byte lengths:

```
s:19:"https://example.com"   →  s:19:"https://a-longer-domain.test"
                                    ↑ still 19 — unserialize() now fails
```

`FW_SM_Replacer` unserializes, walks, re-serializes; same for JSON, plus a
JSON-escaped variant of every pair (`https:\/\/…`). Serialized **objects** are
refused — and refusing to parse means returning the value *untouched*, never
falling through to a plain replace.

## The destination's own identity

The swap replaces the destination's options table with the source's, so
everything that says *which site this is* has to be carved back out. Two rules,
because the first one alone was not enough:

**Absence is a value.** `capture_preserved()` used `get_option( $name, null )`
and skipped anything null. A destination has no `fw_sm_state` — the receiving
side holds a *session*, not a state — so nothing was captured, nothing was
restored, and the **source's** state survived the swap. The migrated site then
came up believing it was mid-migration to wherever the source had been pointing.
Preserving an option the destination lacks is a no-op that lets the source's
copy through.

**The `fw_sm_` namespace is destination-owned.** Rather than listing options,
`OPTION_NAMESPACE` is captured wholesale before the swap, deleted wholesale
after it, and rebuilt from what was captured — so an option present only on the
source ends up absent, and adding a new option later cannot reintroduce the bug
by being left off a list. `wp_cache_flush()` follows, since the deletes go
straight to SQL under a table WordPress has already cached.

`active_plugins`, `siteurl` and `home` stay an explicit list: they always exist
on both sides, so the null case never arises.

## A site may not migrate to itself

`FW_Extension_Site_Migration::is_same_site()` is checked at connect **and**
again at migrate. The second check is the one that matters: a bad carve-out can
leave a site pointing at its own address without anyone having pressed Connect,
and without the guard it would export itself, send itself to itself, and swap
the result in.

Compared on the normalised address (scheme, `www.`, case and trailing slash
removed) **and** the install's `ABSPATH`, because either alone is fooled — one
install is reachable at several addresses, and several installs can answer at
one address behind a proxy. A destination too old to report `abspath` is refused
on the address alone.

## Carve-outs

`FW_SM_Importer::capture_preserved()` runs **before** the swap — read afterwards
these would be the source's values. Preserved: `active_plugins`, `siteurl`,
`home`, and this extension's own options. `restore_preserved()` then renames the
prefix-dependent usermeta keys and `user_roles`; skipping that locks every user
out when prefixes differ.

## The background runner

- Loopback `POST` to `admin-ajax.php?action=fw_sm_run`, non-blocking.
- Authorised by a per-migration token compared with `hash_equals()`.
- Process lock: transient held 120s, refreshed mid-slice.
- Budget: yields at 60% of `max_execution_time` or 80% of `memory_limit`.
- Healthcheck: one-minute WP-Cron restarts a dead chain; stands down while locked.
- One stage's worth of work per pass, then yield.

## Batch size, and why it is measured rather than assumed

Latency, not bandwidth, is what makes a migration slow: every request costs the
round trip whether it carries a kilobyte or a megabyte, so the only way to go
faster is to carry more per request. The ceiling on that is the destination.

`FW_Extension_Site_Migration::handle_diagnose()` ("Test connection speed") sends
payloads of 0, 64 KB, 512 KB, 2 MB and 8 MB, timing each round trip and
subtracting the destination's self-reported processing time to isolate the wire.
The largest size that came back cleanly is stored as `fw_sm_diagnostic['safe']`,
and `FW_SM_Runner::safe_payload_size()` sizes real batches from it — times four,
because the measurement uses incompressible random bytes while real batches are
gzipped SQL, which compresses by roughly ten times.

### Recommended destination memory

`FW_Extension_Site_Migration::RECOMMENDED_MEMORY` is **256 MB** — a sensible
minimum for a live destination rather than a target, and more is better. It is
not a requirement: batches shrink to fit whatever they find, so 128 MB works,
just slowly. Above it, batch size stops being the constraint and the link is.

The figure came from a real destination that failed repeatedly at 128 MB and ran
cleanly at 256 MB. It is surfaced in three places: the connected-destination
table (shown with a note whenever the destination is below it), the connection
test's advisory, and the support report (flagged inline, since it is the first
thing worth checking when someone reports a slow or failing migration).

### When the destination cannot cope

The connection test measures what the destination can *receive*. Importing a
batch costs several times that — decompress, split, execute — so a payload that
arrives intact can still exhaust `memory_limit` while being applied. That
failure is uncatchable, so it surfaces as a bare 500.

Retrying an identical batch reproduces it exactly, which is why
`maybe_retry_job()` **halves the batch** whenever `is_capacity_error()` matches
(memory exhaustion, `max_allowed_packet`, WordPress's critical-error page, a
bare 500) and resets that job's attempt counter — a smaller batch is a different
request and should not inherit the larger one's failures. `MIN_BATCH_BYTES`
(256 KB) is the floor, and it is what stops the reset from looping forever: once
batches cannot shrink further, attempts accumulate normally and the migration
gives up.

`safe_payload_size()`'s fallback — used when no connection test has been run
against this destination — bounds the batch by the destination's
**`memory_limit` ÷ 32**, not by its `post_max_size`. `post_max_size` describes
what a host will *accept*, which is a poor proxy for what it can *import*: a
host advertising 256 MB yielded a 154 MB batch that no 128 MB limit could
survive. The divisor is set from observation — a 128 MB destination was seen to
fatal at 8 MB, and 128 ÷ 32 gives 4 MB. Roomier hosts still reach
`MAX_BATCH_BYTES`.

## Root-relative URLs and the subdirectory prefix

The URL pair only matches values carrying a scheme and host. Content routinely
stores URLs without one:

```html
<img src="/unysonplus/wp-content/themes/child/images/shot.png">
```

Moving `localhost/unysonplus` to a document root leaves that untouched, so it
resolves to `example.com/unysonplus/...` and 404s. `add_root_relative_pair()`
handles the prefix separately, in both directions.

A plain string pair cannot do this safely either way:

- **Subdirectory to root**, `/sub/wp-content` → `/wp-content`, would also
  rewrite another site's absolute URL that happens to contain that path.
- **Root to subdirectory**, `/wp-content` → `/sub/wp-content`, would hit the
  absolute URLs the URL pair has *already* rewritten — pairs apply in sequence,
  each seeing the last one's output — turning `/sub/wp-content` into
  `/sub/sub/wp-content`.

What separates them is the character in front. A root-relative URL begins right
after a delimiter (`DELIMITERS`: quote, equals, whitespace, comma, `(`, `[`,
`;`, `>`) **or at the very start of the string** — the replacer unserializes and
walks structures, so a meta value that *is* the URL arrives bare. An absolute
URL has the host character there instead. The pair is a regex that captures that
boundary and puts it back.

Matching is anchored on WordPress's own directories (`wp-content`,
`wp-includes`, `wp-admin`, `wp-json`) rather than the path alone: `/blog` → ``
would rewrite any text starting with `/blog`, while `/blog/wp-content` is
unambiguously this site's. Both plain and JSON-escaped slash forms are
registered, for the same reason `add_pair()` registers both.

Verified against the source that produced the bug: **131 references across 72
posts rewritten, zero doubled or re-prefixed.**

## Orphaned files

The file stages are an **overlay**: files are written over the destination, and
anything the destination has that the source does not is left behind. For media
that is harmless. For code it is not — the framework loads whatever PHP it finds,
so a sub-extension deleted upstream but still present downstream is loaded and
calls methods its rewritten parent no longer has. That is a fatal on the front
end of a migration that otherwise succeeded.

Pruning therefore runs at finalize, bounded on three sides:

- **Code stages only** — `FW_SM_Receiver::prunable_stages()` is themes, plugins,
  mu-plugins. Uploads and loose wp-content files are never pruned; extra media
  on a live site is usually deliberate.
- **Below the top level, never at it** — `prune_stage()` descends only into the
  plugin/theme folders the source actually sent files into. A plugin that exists
  *only* on the destination is never entered, let alone deleted.
- **Full migrations only** — a quick migration's received list is a list of
  *changes*, so pruning against it would delete every file that was skipped
  precisely because it was already correct. `prune_all()` returns early.

What survived is decided by a manifest the **destination** records as it writes
(`record_received()` → `uploads/unysonplus/site-migration/<id>/received-<stage>.txt`),
appended per file so a migration spanning thousands of requests never holds the
list in memory. Recording happens *after* the `rename()` succeeds — a file that
failed to land must not be marked a survivor, or the prune leaves the
destination's older copy in place. `finish_session()` deletes the manifests.

`.fwsm-part` files are skipped: an in-flight chunked transfer is not an orphan.
Directories emptied by the prune are removed and reported once, rather than once
per file. The source logs the count with example paths — deleting files on
someone else's live server should never be silent.

### The schema must not be recorded before it lands

The SQL stage sends a table's `CREATE TABLE` in the first batch for that table,
and decides whether to include it from the `db_table` cursor. That cursor is
written **only after a successful send**, alongside `db_key_col`,
`db_last_key` and `db_offset`.

Writing it before the send — the obvious placement, next to the code that builds
the schema — causes a failure mode that looks nothing like its cause: the batch
fails, the `CREATE TABLE` is lost, but the cursor still says the table was
started, so every retry ships `INSERT`s for a table the destination was never
told to create. The migration then dies on **`Table '_fwsm_<name>' doesn't
exist`**, having buried the original error several attempts back.

The learned size lives in the migration's cursor (`batch_ceiling`), not in an
option, so one weak destination does not shrink batches for every later
migration. `FW_SM_Runner::batch_ceiling()` prefers it over the measured value.

Errors a smaller request cannot fix — a bad signature, a stale timestamp, an
unknown endpoint, a missing table, an unreachable host — deliberately do **not**
shrink anything; doing so would only make the migration take longer to fail.

### One batch, several tables

A database batch stops when its table is exhausted. On a single site that costs
nothing — its tables are large enough to fill the byte cap on their own — but a
network is the opposite shape. A 629-table demo network carries **472 tables
under 64 KB**, mostly empty WooCommerce bookkeeping, and each one cost a full
round trip: measured at **58 KB per request against an 8 MB cap, 0.88 s each,
with the destination working 10 s out of 322 s.** The rest was latency.

Once the current table finishes, `process_db()` therefore appends further whole
tables until the cap is reached. `FW_SM_Runner::packable_table()` decides
eligibility and is the whole safety argument:

- **The database stage only**, never the job already being sent.
- **Whole tables only** — a candidate is admitted only if *twice* its recorded
  size fits the remaining budget, since `information_schema` sizes are estimates
  and can be well off. If `build_rows()` then reports the table did not finish,
  it is dropped from the batch and left to a pass of its own.
- Because nothing is ever packed partially, every cursor in that method still
  describes a single table and the retry path is unchanged.

Packed jobs are deleted from the queue **only after the batch lands**, for the
same reason the cursor is. A failed send leaves all of them queued, and
`build_schema()` emits `DROP TABLE IF EXISTS` before its `CREATE`, so re-sending
a batch cannot trip over staging left by the attempt before it.

`PACK_MAX_TABLES` (60) bounds how many queued jobs one pass will consider — a
limit on work per slice, not on batch size, so a network with thousands of empty
tables cannot spend a whole slice building SQL instead of sending it.

**A single site's batching is unchanged**: its first table consumes the cap, the
budget left admits nothing, and the loop never runs.

### Concurrency

Size is only half of it. A single TCP connection can hold no more unacknowledged
data than its window allows, so its ceiling is roughly *window ÷ round-trip
time* — a number that has nothing to do with the link's bandwidth. Over a long
round trip that ceiling arrives while the link is still mostly idle, and no
increase in request size gets past it.

`FW_SM_Sender::ping_parallel()` sends the same payload over 1, 4 and 8
connections and the results are stored in `fw_sm_diagnostic['parallel']`. If
throughput climbs with the connection count, the transfer was latency-bound; if
it stays flat while wall time grows in step, the link genuinely was full.

`FW_SM_Runner::stream_count()` reads that and returns the fastest measured
count, or **1** when there is no measurement, no baseline row, or a gain under
30% (run-to-run variance, not a reason to open connections). The file stage then
packs that many bundles per pass and sends them through
`FW_SM_Sender::send_bundles()` → `post_many()`, which uses
`Requests::request_multiple()` and falls back to sequential sending when the
concurrent transport is unavailable. **The database stage stays sequential** —
it was never the slow part, and batch ordering is not worth risking for a stage
that already runs at full speed.

A failed bundle does not invalidate the ones that succeeded: their queue jobs
are cleared and only the failed bundle is retried, with the retry counter
attached to a job from *that* bundle rather than one already deleted.

**A destination can advertise a large `post_max_size` and still fail well below
it.** What runs out is `memory_limit`, and that failure is uncatchable: PHP dies
mid-request, so the shutdown handler in `FW_SM_Receiver::catch_fatals()` never
reports anything and the source sees a bare 500. Two places therefore refuse to
hold more than one copy of a payload:

- `FW_SM_Connection::sign()` builds the signed string incrementally and commits
  to any field over `HASH_FIELD_OVER` (64 KB) by its SHA-256 rather than by its
  contents. This is not a weakening — the hash commits to the content — and it
  takes signing from roughly 2× the payload to zero.
- `FW_SM_Receiver::authenticate()` releases large fields from `$_POST` and
  `$_REQUEST` after `wp_unslash()`, which would otherwise leave two full copies
  alive for the rest of the request.

Raising `memory_limit` on the destination is still the highest-leverage change
available to a user, because it raises the measured ceiling and so the amount of
work each round trip can amortise.

## Multisite

Four modes, resolved by `FW_SM_Multisite::resolve_mode( $src_is_network, $dst_is_network, $scope )`.
The mode decides three things: which tables travel, what they are **called** on
arrival, and how uploads paths are rewritten.

| Source | Destination | Mode | What travels |
|---|---|---|---|
| single | single | `single` | Everything with the base prefix; stray `wp_<n>_` tables dropped |
| network | network | `network` | **All** tables incl. `wp_blogs`, `wp_site`, `wp_sitemeta`, `wp_signups`, `wp_blogmeta`, `wp_registration_log` |
| network (one site) | single | `subsite_to_single` | That blog's tables **plus** `wp_users`/`wp_usermeta` |
| single, or one site of a network | network | `single_to_subsite` | The site's tables only — **no** users, **no** network tables |

`single_to_subsite` covers two different sources: a standalone install (bare
prefix) and **one site of a network** (`wp_<n>_`). Both the table filter and
`map_table()` must branch on `source_blog_id` for that reason. Getting it wrong
does not raise an error — it migrates the network's main site instead of the one
that was chosen, and the only visible symptom is a size estimate far larger than
the selected site.

When the source is a subsite, `map_table()` strips the source blog segment
before adding the destination's: `wp_7_posts` → `wp_9_posts`, never
`wp_9_7_posts`.

**Refused:** whole network → single site (nowhere to put the other sites), and
anything that would turn a single site into a network or vice versa — that means
rewriting `wp-config.php` on the destination, which can leave it unbootable.

### Table renaming

`FW_SM_Multisite::map_table()` rewrites names **at export time**, so the
destination's staging and swap logic never learns which mode is running.

```
subsite_to_single (blog 7)   wp_7_posts  → wp_posts     wp_users → wp_users
single_to_subsite (blog 9)   wp_posts    → wp_9_posts
network, prefix change       wp_7_posts  → new_7_posts  wp_sitemeta → new_sitemeta
```

Blog 1 is the odd one out — its tables carry the bare prefix, not `wp_1_`.
`table_blog_id()` matches `/^wp_(\d+)_/`, so `wp_2fa_settings` is correctly *not*
treated as a subsite table.

### Uploads

Subsite uploads live in `uploads/sites/<id>/`. Promoting a site rewrites
`/uploads/sites/7/` → `/uploads/` in **content** as well as moving the files
(legacy `/blogs.dir/7/files/` too); folding one in does the reverse. These pairs
go through the same serialization-aware replacer, so attachment URLs buried in
serialized meta follow.

### Users

- **Promoting out:** users travel. A site nobody can log into is not a migration.
- **Folding in:** they do not — merging user rows into a network's shared table
  would collide on IDs. `grant_admin_on_site()` gives the destination's super
  admins a role on the new site instead.

### After the swap

`repair_network_records()` rewrites `wp_blogs.domain`/`path` for every site, the
`wp_site` record, and the network `siteurl`/`home`. Without it the destination
network describes sites at addresses that do not exist.

### UI

Network controls render **only** on a network (`is_network()`), and only the
combinations that make sense: the whole-network option appears only when the
destination is also a network; the destination-slug field only when the
destination is a network.

Capability is still `manage_network_options` on multisite — a migration can move
the whole network, and even a single-site one reads the shared users table.

## Hooks

| Hook | Type | Use |
|---|---|---|
| `fw_ext_site_migration_include_table` | filter | Skip a table (`$include, $name`) |
| `fw_ext_site_migration_excludes` | filter | Per-stage glob excludes (`$excludes, $stage`) |
| `fw_ext_site_migration_preserved_options` | filter | Options that survive |
| `fw_ext_site_migration_sslverify` | filter | TLS verification on outbound calls |
| `fw_ext_site_migration_finished` | action | `$status, $state` |

## Compatibility mu-plugin

Optional, on by default. Trims `option_active_plugins` to a whitelist and swaps
in a stub theme — **for migration requests only**. Normal page loads untouched.

## Known limitations

- **One HTTP request per file.** Deliberate for v1: a failure is attributable to
  one file and a retry costs one file. Slower than bundling on a large uploads
  directory; bundling is the optimisation once this is proven.
- Composite-primary-key tables fall back to `LIMIT/OFFSET`.
- Foreign keys are replayed after the swap, best-effort.
- Symlinks are not followed, by design.
- One migration at a time, each way.
- **Promoting a subsite brings every network theme and plugin**, not just the
  ones that site activates — there is no reliable way to tell which files a
  theme needs. Over-inclusive but safe.
