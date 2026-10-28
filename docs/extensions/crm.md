<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# crm extension (CRM)

> **Renamed in 1.0.38.** This was the *Newsletter / Subscriber CRM* (folder `newsletter-crm`). It is now **CRM**
> (folder `crm`, classes `FW_CRM_*`, functions `fw_ext_crm_*`, hooks `unysonplus_crm_*`, page `fw-crm`, settings
> `fw_ext_settings_options:crm`); the tables were already `fw_crm_*`. It is growing into a full CRM: see the
> roadmap at docs.unysonplus.com/crm/roadmap. The form action's atts (`action_subscribe*`) and the Newsletter
> element's `fw_newsletter_subscribe` hook are unchanged.

Stores and manages the people who sign up through the `[newsletter]` element, and is the base a
full CRM (tags/segments, campaigns, automations, ESP sync) grows onto. **Active by default:** no —
not in the core-only plugin zip; download + activate it under Unyson+ → Extensions.

Without it, a `[newsletter]` signup is only emailed to the site admin and is never stored anywhere.

## Provides

- **Admin screen:** Unyson+ → **CRM** (slug `fw-crm`) — **the CRM app (1.0.40)**: one admin page whose
  `tab` picks the view, drawn inside an app frame (`FW_CRM_App`, `includes/admin/class-fw-crm-app.php`):
  its own sidebar (Home `home`, Contacts `subscribers`, Companies `companies`, Deals / Tasks / Calendar /
  Reports marked **Soon**, Campaigns, Lists & segments `lists`, Import / Export `tools`, Settings), a top
  bar (search across contacts and companies → `tab=search&q=`, "/" focuses it; a **New** menu), the WP
  menu folded on CRM screens (body classes `fw-crm-screen folded`), and per-user focus mode (user meta
  `fw_crm_focus`, admin-ajax `fw_crm_focus`) that hides `#adminmenumain`. Default view is `home`;
  `?page=fw-crm&subscriber=<id>` still opens a contact. Add a view with the `unysonplus_crm_nav` filter
  and render it on `unysonplus_crm_render_view`. Views:
  - **Home** (`FW_CRM_Dashboard`) — status line, counts, contacts by stage, the activity feed across
    records (`FW_CRM_Activity::recent()`), newest contacts, campaigns; a first-run guide when empty.
  - **Contacts** — a `WP_List_Table` (contact with initials + email, stage, company, email status, lists,
    tags, last activity, added; status views, stage/segment/list/tag filters, bulk subscribe /
    unsubscribe / tag / delete). **Save as segment** stores the current filters. `&new=1` is the New
    contact form; `&subscriber=<id>` the profile (`FW_CRM_Admin_Contacts`): stage picker, details +
    custom fields edited in place, notes + timeline, linked companies (link existing or create by name),
    lists and tags, email status, the consent log, delete. The `unysonplus_crm_subscriber_view_after`
    action still renders under the timeline (Forms bridge: the person's entries).
  - **Companies** — list with search, `&new=1` form, `&company=<id>` profile (details, timeline + notes,
    people with link-by-email / unlink, delete). Record actions (`create_contact`, `save_contact`,
    `set_stage`, `add_note`, `link_company`, `unlink_company`, `create_company`, `save_company`,
    `delete_company`, `link_contact`) go through the contact API and PRG back to the record.
  - **Lists, Tags & Segments** — create/delete lists and tags (one panel each, same code — same
    table), with subscriber counts, and manage saved segments with a plain-English description of
    what each matches and a live count.
  - **Campaigns** — compose (name, subject, body in either the **full `wp_editor` visual editor**
    with Add Media, or the **Email Builder** — a drag-drop block canvas), pick an audience
    (list / tag / saved segment), then **Send now** or **Schedule**. Shows a live progress bar per
    campaign, plus test sends, pause/resume and a manual **Run sending now**.
  - **Import / Export** — undoable CSV import batches with a dry run, saved mappings and background
    running (see "Import (1.0.51)"); export of everyone or a segment (the Contacts list's export
    button exports *the current filter*).
  - **Settings** — plus an explicit, opt-in "Remove all data" action.
- **Shortcodes:** none. It is the storage layer under the existing `newsletter` shortcode.
- **Public endpoints** (query args on the home URL — no rewrite rules, nothing to flush):
  `?fw-crm-confirm=<token>` and `?fw-crm-unsubscribe=<token>`. Since 1.0.33 also `?fw-crm-preferences=<token>` — a **preference centre** (per-list opt-in/out, keyed by the never-expiring unsubscribe token; placeholder `{{preferences_url}}`). Saving never unsubscribes: opting out of everything is the separate unsubscribe link. Both render a minimal,
  self-contained, `noindex` page (light/dark aware) that a site can replace via
  `unysonplus_crm_endpoint_page`.
- **Settings** (`fw_get_db_ext_settings_option('crm')`): `default_list`,
  `auto_create_lists`, `admin_notify`, `double_optin`, `confirm_on_visit`, `store_ip`,
  `anonymize_ip`, `confirm_subject`, `confirm_body`, `welcome_email`, `welcome_subject`,
  `welcome_body`.
- **REST (`fw-crm/v1`, 1.0.41; capability-gated, tokens never exposed):**
  - `/contacts` `GET` (search, stage, status, owner, company, list, tag, segment, `trashed`
    exclude|only|include, orderby, order, per_page, page; `X-WP-Total` headers) · `POST` (any contact
    field + `company_id`, `fields`, `lists` / `tags` as slugs; `status` is ignored, see below).
  - `/contacts/{id}` `GET` · `PATCH`/`PUT` · `DELETE` (to the bin; `?force=true` deletes for good);
    `/contacts/{id}/restore` `POST`; `/contacts/{id}/timeline` `GET` / `POST {note}`;
    `/contacts/{id}/consent` `GET`; `/contacts/{id}/companies` `POST {company_id, primary}`;
    `/contacts/{id}/companies/{cid}` `DELETE`.
  - `/companies` and `/companies/{id}` the same way, plus `/companies/{id}/contacts` and `/timeline`.
  - `/fields` `GET` (`?object=`; returns `types` + `fields`) · `POST` a definition;
    `/fields/{object}/{key}` `DELETE`. `/stages` `GET`.
  - `/subscribers` `GET` / `POST` (email/name/list/tags) — the original email-signup routes, kept. This is
    the only REST way to subscribe someone: creating or updating a contact never changes `status`.
- **Bin (1.0.42):** deleting a contact or company sets `deleted_at` (hidden from every list, search,
  segment and audience); restore or delete for good from **CRM → Bin** or the record's banner.
  `FW_CRM_Trash::purge( $before = null )` empties it; the daily cron `fw_crm_empty_bin` removes what is
  older than `FW_CRM_Trash::retention_days()` (30; filter `unysonplus_crm_bin_days`, 0 = never). Both
  moves land on the timeline (`trashed` / `restored`). Query arg `deleted_before` selects by bin date.
- **GDPR:** registers a personal-data exporter and eraser, so WordPress's own
  Tools → Export/Erase Personal Data covers subscribers.

## AI abilities (1.0.37)

With the AI Assistant active, a connected AI app (MCP) can set up the CRM, never read or contact the people in it:

| Ability | Does |
|---|---|
| `crm-describe` | Settings, lists, tags, segments, campaigns, the email sender, with subscriber **counts** only |
| `crm-save-lists` | `{ lists: [{title, slug?, description?}], tags: [...] }`; matched by slug, so a repeat call updates |
| `crm-save-segment` | `{ title, filters: { status?, list?, tag?, search? } }`; list / tag by slug, id or title; same title updates |
| `crm-settings` | `double_optin`, `admin_notify`, `default_list`, `confirm_subject` / `confirm_body` (must contain `{{confirm_url}}`), `welcome_email`, `welcome_subject` / `welcome_body`; undoable |
| `crm-save-campaign` | Saves a **draft** `{ title, subject, body, audience: { list?, tag?, segment?, status? } }`; returns its current reach; nothing schedules or sends |

Pipeline stages are tags titled `Stage: <name>`, each with a saved segment (tag + status `subscribed`). Forms join the CRM through `forms-add`'s `subscribe` input. Lists, segments and campaigns are not covered by undo-change (they live in the CRM tables); the ability messages say what was created so the owner can rename or delete it.

## The contact model (1.0.39, schema 2.0.0)

Use the API classes; never query the tables from outside the CRM.

| Class | What it does |
|---|---|
| `FW_CRM_Contacts` | `get( $id )` (array: core fields, `company_ids`, address, `fields`), `create( $data )` (dedupes on email; staff-created contacts get status `none` = not subscribed), `update( $id, $data )` (stage and owner changes land on the timeline), `add_company()` / `remove_company()`, `trash()` / `restore()` / `purge()`, `stages()` (filter `unysonplus_crm_lifecycle_stages`). Fields: `email` (optional), `first_name`, `last_name`, `phone`, `job_title`, `lifecycle_stage`, `owner_id`, `user_id`, `timezone`, address parts, `score`, `lifetime_value`, plus `company_id` and `fields` |
| `FW_CRM_Companies` | `find`, `find_by_domain` (accepts a URL or email), `query` / `count` (search, owner, trashed), `create` (name required), `update`, `trash` / `restore` / `purge`, `contact_ids()` |
| `FW_CRM_Relations` | `link( $from_type, $from_id, $to_type, $to_id, $label )`, `unlink()`, `related()` and `ids()` read both directions, `delete_for()`. Contact ↔ company uses label `works_at` |
| `FW_CRM_Activity` | The timeline. `log( $object_type, $object_id, $type, $title, { body, meta, actor_id } )` also stamps `last_activity_at`; `for_record()` reads newest first. Fed automatically by signups, resubscribes, confirmations, unsubscribes and Forms entries (logged after the form's actions run, so first-time senders are matched) |
| `FW_CRM_Consent` | Append-only log: `record( $contact_id, $purpose, $text, { granted, source, source_url, ip } )`, `for_contact()`, `has( $contact_id, $purpose )`. Signups record the consent box's exact wording; confirmations and unsubscribes add rows |
| `FW_CRM_Fields` | Custom field definitions (option `fw_crm_fields`) and typed values: `save_definition( { key, label, type, object, group, choices, required, settings } )`, `get_values()`, `set_values()` (all-or-nothing validation), `assign_autonumbers()`. Types: text, textarea, number, money, date, datetime, choice, multichoice, checkbox, url, email, phone, lookup (`settings.target`: contact, company, deal, case, post, user), address, autonumber (`prefix`, `pad`); filter `unysonplus_crm_field_types` |

Storage notes: the contact table keeps its internal name `fw_crm_subscribers` (and `subscriber_id` columns); `email` is NULLable (many NULLs pass the UNIQUE index); `deleted_at` is the bin and every list query excludes it unless `trashed` is `only` or `include`; numbers, money and dates are mirrored into indexed `value_num` / `value_date`. New tables: `companies`, `relations`, `activity`, `consent`, `field_values`. Hooks: `unysonplus_crm_contact_created|updated|trashed|restored|deleted`, `unysonplus_crm_company_created|updated|deleted`, `unysonplus_crm_linked|unlinked`, `unysonplus_crm_activity_logged`, `unysonplus_crm_consent_recorded`, `unysonplus_crm_fields_updated`.

Custom fields screen (1.0.61): **Data → Custom fields** (`tab=fields&object=contact|company|deal&edit=<key>|new`,
`FW_CRM_Admin_Fields`, managers), actions `field_save` / `field_delete` over `save_definition()` / `delete_definition()`
(deleting removes the stored values). A field's type is fixed once it exists; `managed_by` fields are listed and locked.

## Rule-based segments (1.0.44)

`FW_CRM_Segments` is the one filter language. A segment's filters JSON holds `rules`:

```json
{ "match": "all", "rules": [
  { "field": "lifecycle_stage", "op": "in", "value": ["lead", "customer"] },
  { "match": "any", "rules": [
    { "field": "tag", "op": "has_any", "value": ["vip"] },
    { "field": "activity", "op": "happened", "value": { "type": "form", "days": 30 } }
  ] }
] }
```

- **Fields** (`FW_CRM_Segments::fields()`, filter `unysonplus_crm_segment_fields`): first/last name, email, phone,
  job title, `company` (linked company name), city, region, country, `lifecycle_stage`, `owner_id` (`me` = the viewer),
  score, lifetime value, `has_user`, `status` (email), `tag`, `list` (subscribed only), source, `created_at`,
  `last_activity_at`, `activity` (timeline type in the last N days), and every custom contact field as `field:<key>`.
- **Operators by type** (`operators()`): text `is is_not contains not_contains starts_with empty not_empty`; number
  `eq neq gt gte lt lte empty not_empty`; date `in_last_days not_in_last_days in_next_days before after on empty
  not_empty` (dates `Y-m-d`, days an integer); choice `in not_in`; tags `has_any has_all has_none`; boolean
  `is_true is_false`; activity `happened not_happened`. Groups nest one level.
- `sanitize( $tree )` drops unknown fields/operators and bad values; `compile( $tree )` returns one SQL condition on
  contact alias `s`; `FW_CRM_Subscribers::query/count( array( 'rules' => $tree ) )` and `( 'segment' => $id )` both use it,
  so campaign audiences (`{segment: id}` + forced `status = subscribed`) follow automatically.
- `save( $title, $rules, $id = 0 )`, `count( $segment, $fresh = false )` (5-minute transient), `preview_count( $rules )`,
  `contact_matches( $segment_id, $contact_id )` (one query per contact, cached per request), `describe( $tree )`.
- Admin: **Lists & segments → New segment / Edit** (`tab=lists&edit_segment=new|<id>`, `static/js/segments.js`, live count
  via `wp_ajax_fw_crm_segment_preview`). REST: `/segments`, `/segments/{id}`, `/segments/{id}/contacts`,
  `/segments/preview`, `/segments/fields`.

## Merge duplicates (1.0.45)

- `FW_CRM_Merge::duplicates_of( $contact_id, $limit )` — live contacts with the same phone (last nine digits) or
  the same full name (each row carries `why`: `phone` | `name`). `find_groups( $limit )` — every group
  (`why`: `name` | `phone` | `name_phone`, `ids`).
- `FW_CRM_Merge::merge( $keep_id, $other_id, $prefer = array() )` → `true|WP_Error`. `$prefer` is
  `field => 'keep'|'other'` for `CHOICE_FIELDS` (default: keep's value, or the other's where keep's is empty).
  Moves pivot rows, meta, campaign queue rows, relations (both directions), timeline, consent, custom field
  values (keep's win) and the user link, then deletes the other row. Status: the safest of the two
  (`complained > bounced > unsubscribed > subscribed > pending > none`). Stage: the more advanced; lifetime
  value: summed; score: max; created_at: earliest; last_activity_at: latest. Refuses two different linked
  users (`fw_crm_two_users`). Logs `merged`; fires `unysonplus_crm_contacts_merging( $keep_row, $other_row )` and
  `unysonplus_crm_contacts_merged( $kept_id, $removed_row )` — extensions holding their own references to the
  removed id move them there.
- Admin: contact page panel, `tab=subscribers&duplicates=1`, `tab=subscribers&merge=<keep>&with=<other>`.
  REST: `POST /contacts/{id}/merge { with, prefer }`, `GET /contacts/duplicates`.

## Team roles (1.0.46)

`FW_CRM_Capabilities`: capabilities `fw_crm_access` (use the CRM), `fw_crm_view_all` (all records),
`fw_crm_manage` (campaigns, lists and segments, import/export, bin, merge, fields, settings). Roles **CRM Manager**
(`fw_crm_manager`, all three) and **Sales Rep** (`fw_crm_sales_rep`, access only); administrators get all three (role
caps + a `user_has_cap` grant for anyone with `manage_options`). `FW_CRM_Service::capability()` now defaults to
`fw_crm_access`. Users without `manage_options` get the CRM as a top-level menu (the Unyson+ parent is admin-only).

- Helpers: `can_manage()`, `sees_all()`, `scope( $args )` (adds `owner` = current user for a rep), `owner_scope()`,
  `can_edit_contact( $row|$id )`, `can_edit_company()`, `can_link_user( $user_id )` (manage + `edit_user`).
- **Scoping is applied only where a person looks**: the list table, Home, search, companies, record pages and REST.
  The repository, background jobs and other extensions' server-side calls (`has_lists`, `contact_matches`,
  `link_user`) are never scoped and carry no capability checks — check capabilities in your own UI.
- Reps: own what they create, cannot reassign owners, cannot delete for good, subscribe in bulk, export, import, merge
  or touch segments/fields; manager-only admin actions `wp_die` 403; REST answers 403 `fw_crm_forbidden`.
- Nav items accept `cap`; `FW_CRM_App::can_view( $view )` gates a view.

## Audit log (1.0.47, schema 2.2.0)

`FW_CRM_Audit` records what people did to the data (the timeline records what happened with a person). Table
`fw_crm_audit` (actor_id, object_type, object_id, action, details JSON, ip, created_at). Fed only by existing events:
contact created / updated (field `old`/`new` from `unysonplus_crm_contact_updated`'s `$changes`) / trashed / restored /
deleted / merged, `user_linked` / `user_unlinked`, company created / updated / trashed / restored / deleted,
segment saved / deleted, list deleted, campaign started (`sending`), and the new actions `unysonplus_crm_exported( $filters,
$rows )`, `unysonplus_crm_import_started( $info )`, `unysonplus_crm_settings_saved( $changed_keys )`. Each entry keeps a
`_label` (name at the time). Actor 0 = the system. `FW_CRM_Audit::log( $type, $id, $action, $details )` for your own
entries; `query( { actor, object_type, object_id, action, per_page, paged } )` returns `[ rows, total ]`. Retention 365
days (`unysonplus_crm_audit_days`, purged by the daily `fw_crm_empty_bin` job); `unysonplus_crm_audit_record` can veto an
entry. Screen: **Data → Audit log** (`tab=audit`, managers). REST: `GET /audit` (managers).

## Modules (1.0.48; reworked 1.0.67)

The CRM is a **core** that is always on (contacts, notes and the timeline, tags, lists and segments, tasks, files,
import and export, custom fields, the bin, team roles, settings) plus **modules**:

| id | Group | What it gates |
|---|---|---|
| `companies` | sales | Companies nav, New → Company, the contact page's Companies panel, the company select on contact and deal forms, the Companies stat, the contact list's Company column, company search results, company custom fields. **UI only**: the table, `FW_CRM_Companies` and the `/companies` REST routes stay (core data model). |
| `pipeline` | sales | `modules/pipeline/` (deals, pipelines, products, reports, their REST + admin) |
| `calendar` | sales | `modules/calendar/class-fw-crm-calendar.php`, `FW_CRM_Admin_Calendar`, the `/calendar` route |
| `conversations` | sales | `modules/conversations/class-fw-crm-direct-email.php`, `FW_CRM_Admin_Email`, `/contacts/{id}/email` |
| `email` | marketing | `modules/email/` (campaigns, builder, sender, tracking) |
| `audit` | workspace | `FW_CRM_Audit::init()` (recording), Audit log nav, `/audit` |
| `woocommerce` | connect | `modules/integrations/class-fw-crm-woocommerce.php` (available only with WooCommerce) |
| `webhooks` | connect | `modules/webhooks/` |
| `cases` | workspace | `modules/cases/` (`FW_CRM_Cases`, `FW_CRM_Cases_Intake`, `FW_CRM_Admin_Cases`), the Cases nav, the Cases panel on contact/company pages, "A support case" in the form action's Also create. The `fw_crm_cases` table always exists (core schema), so contact delete/merge keep it consistent while the module is off. |
| `automations` | marketing | `modules/automations/` (see Automations below) |
| `scoring` | marketing | `modules/scoring/` (see Events, lead scoring, site activity) |

Incoming mail (`modules/conversations/` `FW_CRM_Mime`, `FW_CRM_Imap`, `FW_CRM_Inbound_Email`, `FW_CRM_Admin_Inbound`,
`FW_CRM_REST_Email`'s `/inbound/{token}`) loads while **conversations OR email** is on: replies need the first,
bounce and complaint reports the second.

`FW_CRM_Modules`:
- `all()` → filter `unysonplus_crm_modules`, each normalised to `{ label, description, icon, group, default, requires[],
  requires_text, available (bool|callable), soon }`. `groups()` → filter `unysonplus_crm_module_groups`
  (`sales`, `marketing`, `workspace`, `connect`).
- `available( $id )` (known, not `soon`, `available` true), `enabled( $id )` (available + saved/default + every
  `requires` module on), `set( $id, $on )` → `true|WP_Error` (filter `unysonplus_crm_module_can_disable`; action
  `unysonplus_crm_module_toggled( $id, $on )`), `save( $on_ids )` → error messages, `requires_text( $m )`.
- **Defaults are off.** A fresh install shows the first-run question on Home (`needs_setup()`: option
  `fw_crm_setup` unset and the viewer is a manager): `uses()` (filter `unysonplus_crm_setup_uses`: people, sell →
  companies+pipeline+calendar, email → email, converse → conversations); `setup( $uses )` saves them and stamps
  `fw_crm_setup`. "Skip" = core only.
- **Upgrade (`migrate()`, once, option `fw_crm_modules_v2`)**: a site with `fw_ext_crm_db_version` set keeps
  `pipeline` + `email` on (they were default-on) and switches on `companies` / `calendar` / `conversations` / `audit`
  when it has companies / dated tasks / direct emails or `email_in` entries or an inbound config / audit rows; a site
  with contacts gets `fw_crm_setup` stamped so it is never asked. Uninstall deletes all three options.
- **Files a module owns live under `modules/<name>/`** and are required only when it is on, guarded with
  `class_exists()`. The framework auto-loads every top-level `includes/*.php`, so a file there loads whatever the
  switch says (1.0.67 moved calendar, direct email, MIME, IMAP and inbound out of `includes/` for this reason; an
  install updated by copying over must delete the old copies, or the class is declared twice).
- Nav items carry `'module' => '<id>'`; a hidden item's URL renders "X is turned off" with an **Open Modules** button.
- UI: `FW_CRM_Admin_Modules` (`tab=modules`, cards per group with a `.fw-crm-toggle[role=switch]` checkbox, actions
  `save_modules` / `setup_modules`). The modules form left Settings. Public guide:
  docs.unysonplus.com/crm/developers/custom-modules.

## Subscription status per list (1.0.49, schema 2.3.0)

The pivot row of a **list** membership carries `status` (`subscribed` | `unsubscribed`), `subscribed_at`,
`unsubscribed_at` and `source`; tags have no status. The contact's own `status` stays the address-level permission —
someone is emailed for a list only while both are `subscribed` (campaign audiences, the `list` filter, `has_lists( …,
'list' )` and the `list` segment rule all enforce it).

- `FW_CRM_List_Membership::status( $contact_id, $list_id )` → `subscribed|unsubscribed|null`; `for_contact()` (every list
  ever joined, with dates and source); `subscribe( $contact_id, $list_id, $source )`; `unsubscribe()`; `left()`.
- `FW_CRM_Subscribers::add_to_list( …, 'list', $source )` / `remove_from_list()` / `set_lists( …, 'list' )` route through
  it: **leaving keeps the row** (`unsubscribed`), rejoining resubscribes and clears `unsubscribed_at`. `get_lists( $id,
  'list', $include_left = false )`. Hard removal happens only on purge/merge/list delete.
- CSV import does not re-add a contact to a list they left unless `overwrite_unsubscribed`; a person's own signup rejoins.
- Timeline type `list` ("Joined/Left the list X"); action `unysonplus_crm_list_status_changed( $contact_id, $list_id,
  $from, $to, $source )`; REST contacts carry `list_status` (slug => { status, subscribed_at, unsubscribed_at, source }).

## Tags API (1.0.50)

`FW_CRM_Tags` — `all()`, `find( $slug|$id )`, `add( $contact_id, $tags, $source )` (slugs or ids, or `slug => title`;
unknown slugs are created), `remove( $contact_id, $tags, $source )`, `for_contact()`, `has( $contact_id, $slugs, any|all|none )`,
`rename( $tag_id, $title, $slug = '' )`, `merge( $from_id, $into_id )` (moves contacts, deletes `$from`, rewrites
segments that used it; returns contacts moved). Managed tags (`managed_by`) cannot be renamed or merged. Every
tag change, whichever path made it, fires `unysonplus_crm_pivot_changed( $contact_id, $object_id, $type, add|remove,
$source )` → timeline type `tag` and `unysonplus_crm_tag_added|removed( $contact_id, $tag_id, $source )`; also
`unysonplus_crm_tag_renamed( $before, $after )`, `unysonplus_crm_tags_merged( $from, $into )`. `set_lists( …, 'tag' )`
only touches what changed. Admin: Lists & segments → **Rename or merge tags**.

## Import (1.0.51, schema 2.4.0)

`FW_CRM_Import` replaces the old transient-based CSV import (FW_CRM_CSV keeps `peek()`, `export()` and the legacy
`import()`). Tables `fw_crm_imports` (file, header, samples, mapping, options, status `mapping|checked|running|done|
cancelled|failed|undone`, `byte_offset`, line, stats, dry_stats) and `fw_crm_import_rows` (per contact: `action`
created|updated, `before_values` JSON, `added` JSON: lists `[id, previous status]`, tags, company, company_created).

- `create( $file, $filename )` → id (guesses the mapping; a mapping saved for the same header layout wins — option
  `fw_crm_import_mappings`); `fields()` (filter `unysonplus_crm_import_fields`: core fields, `name` (split), `company`
  (by name, created if new), `lifecycle_stage` (slug or label), lists, tags, `field:<key>`); `configure( $id, $mapping,
  { match: fill|update|skip, consent, overwrite, lists: ids, tags: slugs } )`; `dry_run( $id )` (no writes; stats incl.
  `skip_reasons`, first 25 errors); `start()`; `run_chunk( $id, $seconds )` (locked per import; reschedules the
  `fw_crm_import_tick` cron until done); `cancel()`; `undo( $id )` → `{ deleted, restored }`; `history()`.
- Matching: email, else phone (last nine digits). Never subscribes without `consent` (recorded per person, source
  `import_<id>`); never re-subscribes an opt-out or re-adds a left list without `overwrite`.
- Actions `unysonplus_crm_import_started`, `unysonplus_crm_import_finished( $import )`, `unysonplus_crm_import_undone(
  $import, $result )`. Admin: `FW_CRM_Admin_Import` on `tab=tools` (`import=<id>&step=map|run|done`), AJAX
  `fw_crm_import_tick`. Export takes `segment` and includes phone, job title, company, stage, owner, address and custom
  fields (filter `unysonplus_crm_csv_fields`); its headers re-import cleanly.

## Sales pipeline, deals and tasks (1.0.52–1.0.53, schema 2.5.0)

The `pipeline` module (on by default; files under `modules/pipeline/`, loaded only while it is enabled). Tables
`fw_crm_pipelines`, `fw_crm_pipeline_stages` (`kind` open|won|lost, `probability`, `rot_days`, `position`),
`fw_crm_deals` and `fw_crm_tasks` (core, not the module: tasks attach to any record).

- **Pipelines** (`FW_CRM_Pipelines`): `all()` seeds a "Sales" pipeline on first read (New lead, Contacted, Proposal sent,
  Negotiating, Won, Lost); `default_pipeline()`, `stages( $id )`, `stage()`, `stage_of_kind( $id, 'won'|'lost' )`.
  `save( { name, currency, stages: [ { id?, name, probability, rot_days } ], won_name, lost_name }, $id )`: open stages
  keep the given order, Won and Lost always sit last; a removed stage's open deals move to the first kept stage.
  `delete()` refuses the last pipeline or one with deals and promotes the next one to default. `currency()`: pipeline →
  CRM setting → WooCommerce → filter `unysonplus_crm_default_currency` (USD). `lost_reasons()`: option
  `fw_crm_lost_reasons` + filter.
- **Deals** (`FW_CRM_Deals`): `create( { title, value, currency, pipeline_id, stage_id, owner_id, contact_id,
  company_id, expected_close, probability } )` (defaults: default pipeline, its first open stage, the current user;
  `value` accepts "12,500"); `update()`, `move( $id, $stage_id, $reason )` (moving to Won/Lost closes, moving back
  reopens), `win()`, `lose( $id, $reason )`, `reorder()`, `add_contact()` / `remove_contact()` (relation
  `deal → contact`, `involved`), `trash()` / `restore()` / `purge()`. `get()` adds `probability` (override, else the
  stage's), `weighted_value`, `stalled` (open longer than the stage's `rot_days`), `contact_ids`. `query()` / `count()`
  take pipeline, stage, status, owner, contact (primary or linked), company, search, trashed, closing_before,
  closed_after; `totals_by_stage( $pipeline_id, $args )`; `money( $amount, $currency )`.
- Every deal change logs to the deal's timeline and mirrors to its contact and company (`deal`, `won`, `lost`
  types; Home's feed shows the deal's entry only). Merges move deals to the kept contact; purging a contact or company
  keeps its deals with the link cleared.
- **Tasks** (`FW_CRM_Tasks`): types todo, call, meeting, email (`types()`); `create( { title, type, object_type,
  object_id, owner_id, due_at, notes } )` (a date-only `due_at` means 09:00), `update()`, `complete( $id, $outcome )`
  (logs "Call done: …" with the outcome on the record), `reopen()`, `delete()`, `query()` / `count()` with status
  open|done|overdue|today|upcoming. Hourly cron `fw_crm_task_reminders` sends each owner one digest of due tasks and
  stamps `reminder_sent_at` (filter `unysonplus_crm_task_reminders` to change or cancel it).
- **Notes** (`FW_CRM_Notes`): activity rows of type `note`; `add()`, `update()`, `delete()` by their author or a
  manager (`can_edit()`), `for_record()`.
- Capabilities: `FW_CRM_Capabilities::can_edit_deal()` / `can_edit_task()`; a sales rep sees and edits their own
  deals and tasks (`scope()`), a manager everything.
- Admin: `FW_CRM_Admin_Deals` on `tab=deals` (board, `&deal=`, `&new=1&contact=&company=`, `&pipelines=1&edit=`),
  AJAX `fw_crm_deal_move`, a Deals panel on contacts and companies. `FW_CRM_Admin_Tasks` on `tab=tasks` and a Tasks
  panel on every record. Home cards "Your tasks" and the pipeline funnel. Action handlers are added through filter
  `unysonplus_crm_handle_action( $result, $action )`, which may return redirect args or `[ '_back' => $url ]`; a
  record page panel through `unysonplus_crm_deal_panels`.
- **REST (1.0.53, `fw-crm/v1`):** `FW_CRM_REST_Deals` (module file `class-fw-crm-rest-deals.php`, registered only
  while the module is on) and `FW_CRM_REST_Tasks` (`includes/rest/`; not directly in `includes/`, which is
  auto-loaded alphabetically before the parent class). Both extend `FW_CRM_REST` for its protected helpers
  (`forbid( $object, $id )`, `exists()`, `body()`, `collection()`, `timeline_route()` — these now know `deal`).
  `/pipelines` GET (everyone) · POST, `/pipelines/{id}` GET (adds `totals` per stage, scoped) · PATCH (leave out
  `stages` to keep them; won/lost rows in `stages` are ignored, rename them with `won_name` / `lost_name`) · DELETE
  (managers; 409 while it has deals). `/deals` GET (pipeline, stage, status, owner, contact, company, search,
  trashed, closing_before, orderby, order; `X-WP-Total`) · POST; `/deals/{id}` GET · PATCH (`stage_id` moves) ·
  DELETE (bin; `?force=true` managers); `/deals/{id}/move { stage_id }` or `{ status: won|lost, lost_reason }`;
  `/deals/{id}/restore`; `/deals/{id}/contacts` POST `{ contact_id }`, `/deals/{id}/contacts/{cid}` DELETE;
  `/deals/{id}/timeline` GET · POST `{ note }`; `/lost-reasons`. `/tasks` GET (status open (default)|done|overdue|
  today|upcoming|'', owner, object_type, object_id) · POST; `/tasks/{id}` GET · PATCH · DELETE; `/tasks/{id}/complete
  { outcome }`; `/tasks/{id}/reopen`; `/task-types`; `/notes/{id}` PATCH `{ note }` · DELETE. A rep: lists scoped to
  their own, `owner_id` ignored on writes, 403 for records they cannot edit (including the contact / company /
  record a deal or task links to), no `force`.

## Calendar, calls and meetings (1.0.54, schema 2.6.0)

- **Calendar** (`FW_CRM_Calendar::events( $from, $to, $owner )` → `date => [ { id, kind task|deal|campaign|…, date,
  time, title, sub, url, icon, done, late } ]`, sorted by time, all-day first). Tasks by `due_at`; open deals on
  `expected_close` (pipeline module); campaigns on `scheduled_at` / `started_at` (email module, managers only).
  `$owner` = user id or `''` for everyone; a sales rep is always scoped to themselves. Filter
  **`unysonplus_crm_calendar_events( $events, $from, $to, $owner )`** lets another extension add its own (a
  membership renewal, a booking): give each one `kind`, `date`, `title`, `url` and an `icon`. Screen: `tab=calendar`
  (`FW_CRM_Admin_Calendar`; `&view=month|week&date=Y-m-d&owner=<id|all>`), `static/js/calendar.js` (the "+" on a
  day opens a new-task `<dialog>`). REST `GET /calendar?from&to` (≤ 62 days; `owner` for managers).
- **Calls and meetings**: tasks gain `duration` (minutes, 0–1440) and `location`; attendees are relations
  `task → contact` labelled `attendee` (`FW_CRM_Tasks::attendees()`, `set_attendees()`,
  `candidate_attendees( $object, $id )` = the contact, a company's people or a deal's contacts; the admin form only
  offers those). `complete( $id, $outcome, $duration )` logs "Meeting done: X (45 min)" on the record **and on every
  attendee's timeline**. `log_call( $object, $id, { title?, type call|meeting, outcome, duration, at, attendee_ids } )`
  (= `create()` with `done: true`) records one that already happened. Deleting a task drops its attendee links;
  merges move them with the contact.
- Admin: every record's Tasks panel has "Add a task" and "Log a call or meeting" (`data-task-form`; fields with
  `data-for-types` show only for those types, toggled in `app.js`). Ticking off a call or meeting opens
  `#fw-crm-task-done` ("How did it go?": outcome + how long); a to-do still completes in one click.
- REST tasks carry `duration`, `location`, `attendee_ids` (each must exist and be reachable: 404 / 403);
  `POST /tasks/{id}/complete { outcome, duration }`; `POST /tasks { …, done: true, outcome }` logs a past call.

## Sales reports (1.0.55)

`FW_CRM_Reports` (pipeline module, `modules/pipeline/class-fw-crm-reports.php`). Every report takes one filter
`{ pipeline (0 = all), owner ('' = everyone), from, to }` (`filter()` normalises it; default = the last six months).
Closed deals count by `closed_at` inside the period; the open pipeline and the forecast are "as of now" and ignore it.
Binned deals are never counted. Amounts are summed as stored (no currency conversion) and shown in the pipeline's
currency.

- `summary()` → open_count/value, weighted, won_count/value, lost_count/value, win_rate (null with nothing closed),
  avg_won, avg_days (created → closed, won deals), currency.
- `by_stage()` (one pipeline: the filter's or the default), `forecast( $f, $months = 6 )` (keys `overdue`, `Y-m` per
  month, `later`, `none`), `won_lost()` (per month of the period, ≤ 36), `lost_reasons()`, `by_owner()`;
  `sales( $f )` = all of them.
- Screen: `tab=reports` (`FW_CRM_Admin_Reports`; `&pipeline&period=this_month|3m|6m|12m|this_year|custom&from&to
  &owner=<id|all>`). The nav item carries `module => pipeline`. A rep is forced to their own numbers; the per-owner
  table shows to managers looking at everyone. Charts are plain HTML/CSS (bars, paired columns with an accessible
  label per month and a "Show the numbers" table). REST `GET /reports/sales` (a rep gets no `by_owner`).

## Files on records (1.0.56)

`FW_CRM_Files` (`includes/class-fw-crm-files.php`): media library attachments linked to a contact, company or deal as
relations `record → attachment` labelled `file` (no table of its own). `attach( $object, $id, $aid )` (an unknown
attachment or record type → `WP_Error`; twice = no-op), `detach()` (the file stays in the library), `upload( $object,
$id, $file )` (one `$_FILES`-shaped entry through `media_handle_sideload()`, so WordPress's allowed types and size
limit apply; the attachment gets meta `_fw_crm_file` = `object:id`), `for_record()` → `[ { id, title, filename, url,
mime, size, added_at, author } ]` newest first, `count()`, `icon( $mime )`. Timeline type `file` ("File added: X" /
"File removed: X"); actions `unysonplus_crm_file_attached` / `_detached( $object, $id, $aid )`. `delete_attachment`
unlinks it everywhere; purging a record unlinks its files but keeps them.

- **Files are public by link** (they live in uploads like any media); the panel says so. Do not promise privacy.
- Roles version 2: CRM Manager and Sales Rep gain `upload_files` (picking from the library needs it too). Adding or
  removing still needs the right to edit the record.
- Admin: `FW_CRM_Admin_Files` adds a `files` panel (side, priority 30) to all three record pages, actions
  `file_attach` (multipart `files[]`, up to 10, and/or `attachments` = comma ids from the media frame) and
  `file_detach`; `static/js/files.js` opens `wp.media` (enqueued on record pages for people who can upload).
- REST: `/{contacts|companies|deals}/{id}/files` GET · POST `{ attachment_id }` or a multipart `file`;
  `/{…}/{id}/files/{aid}` DELETE.

## One-to-one email (1.0.57)

`FW_CRM_Direct_Email::send( $contact_id, { subject, body, cc, deal_id } )` → `true|WP_Error`. Placeholders through
`FW_CRM_Mail::replace()`, the body through `FW_CRM_Mail::render_body()` (kses + the email shell), sent with
`wp_mail()` (the Mailer governs transport and the From address). The writer's address is the `Reply-To` and
"Name at Site" the From name (a `wp_mail_from_name` filter added and removed around the one send). **Personal mail:**
no unsubscribe footer, no tracking, and it goes to contacts who unsubscribed from lists (they opted out of
campaigns). Refused: no email address, empty subject/body, a bad Cc. A failed send returns the `wp_mail_failed`
reason and logs nothing. Logged as timeline type `email` ("Email sent: …") on the contact and, with `deal_id`, on the
deal (meta: subject, to, cc, deal_id, direct). Filter `unysonplus_crm_direct_email( $mail, $contact, $data )`; action
`unysonplus_crm_direct_email_sent( $contact, $mail, $deal_id )`. `deal_recipients( $deal_id )`.

- Admin: `FW_CRM_Admin_Email` prints an Email button + `<dialog id="fw-crm-compose">` through the new header hook
  **`unysonplus_crm_record_actions( $object, $record )`** (contact, company and deal headers, before Edit); the
  recipient list is the contact, a company's people or a deal's contacts (with an address). Action `direct_email`; a
  failed send keeps the draft in a 10-minute transient and reopens the dialog filled in (`data-open-now`). Generic
  `data-open-dialog="<id>"` buttons are handled in `app.js`.
- REST `POST /contacts/{id}/email { subject, body, cc?, deal_id? }` (a rep may write to a contact they do not own
  when it is on a deal they own and `deal_id` says so); 502 when the mail could not be sent.
- Local installs without a mail set-up fail with "Invalid address (From): wordpress@localhost"; that is the
  environment, and the composer shows it.

## Products and line items (1.0.58, schema 2.7.0)

`FW_CRM_Products` (pipeline module). Tables `fw_crm_products` (name, sku, description, price, unit, active, position)
and `fw_crm_deal_items` (deal_id, source `crm|woo|custom`, product_id, **copied** name / sku / unit_price, quantity,
discount %, total, position).

- List: `all( { active, search } )`, `find()`, `save( $data, $id )` (prices accept "1,250.00" and "45,50"), `delete()`
  (deals keep their copied lines), `usage( $id )`.
- `catalogue( $search )` → `[ { key: crm:5 | woo:123, source, id, name, sku, price, unit } ]`: active CRM products, then
  WooCommerce products when `unysonplus_crm_woo_products` (default `function_exists( 'wc_get_products' )`); variable
  parents are skipped (their variations are what is sold). `lookup( $key )`.
- Lines: `items( $deal_id )`, `add_item( $deal_id, { product: key | name, unit_price, quantity, discount } )`,
  `update_item()`, `remove_item()`, `totals( $deal_id )` → `{ count, subtotal, discount, total }`,
  `line_total( price, qty, discount )`. Adding / removing logs on the deal ("Added 2 × X").
- **A deal with lines is worth its total**: `sync_value()` writes it (flag `FW_CRM_Products::$syncing`), and
  `FW_CRM_Deals::update()` ignores any other `value` while lines exist (screen field turns read-only).
- Admin: `FW_CRM_Admin_Products` — list at `tab=deals&products=1&edit=<id|new>` (managers edit), a `products`
  deal panel (main column, now rendered **above** the timeline), actions `product_save|delete`, `item_add|save|remove`.
- REST: `/products` (GET; `?catalogue=1` for the picker) · POST/PATCH/DELETE managers; `/deals/{id}/items` GET · POST,
  `/deals/{id}/items/{iid}` PATCH · DELETE (responses carry `items`, `totals`, `value`).

## Customise Home (1.0.59)

`FW_CRM_Dashboard` builds a card registry: built-ins `stages`, `pipeline`, `feed` (main), `tasks`, `newest`,
`campaigns` (side) plus `unysonplus_crm_dashboard_cards` cards (`id => { title, callback, column, priority }`, ids
sanitized with `sanitize_key`). `layout( $cards )` = the user's saved `fw_crm_home_layout` user meta
`{ main: ids, side: ids, hidden: ids }`, then any card they have not placed yet in its default column by priority.
AJAX `fw_crm_home_layout` (nonce `fw_crm_home_layout`; `reset=1` deletes the meta). `static/js/home.js`: Customise
mode, drag between and within columns, per-card buttons (up, down, other column, hide), hidden tray, reset.

## Replies on the timeline (1.0.60)

`FW_CRM_Inbound_Email` (+ `FW_CRM_Mime`, `FW_CRM_Imap`). Two ways in:

- **Inbound address**: REST `POST /fw-crm/v1/inbound/{token}` (public; the 32-character token is the secret; wrong
  token → 403; a message that matched nobody still answers 200 so services do not retry). `from_request()` accepts a
  raw RFC 822 message (fields `mime`, `body-mime`, `email`, `raw`, `RawEmail`, or the body with content type
  `message/rfc822`) or parsed fields (`sender|from`, `recipient|to`, `cc`, `subject`, `stripped-text|body-plain|text|
  TextBody`, `body-html|html|HtmlBody`, `Message-Id|MessageID`, `In-Reply-To`, `References`, a `Headers` list of
  `{ Name, Value }` or a raw `headers` block, `FromFull { Email, Name }`). `token()`, `inbound_url()`, `new_token()`.
- **IMAP mailbox**: settings option `fw_crm_inbound` (host, port, security `ssl|tls|none`, user, pass encrypted with
  AES-256 over `wp_salt('auth')` — `encrypt()` / `decrypt()`, folder, `create_unknown`), cron `fw_crm_inbound_poll`
  every 5 minutes (`fw_crm_five_minutes`), only while connected. `poll()`: the first check (or a changed
  UIDVALIDITY) only records the newest UID — **old mail is never imported**; then up to 25 messages per run by UID,
  read with `BODY.PEEK[]` (nothing is flagged or deleted). Lock transient `fw_crm_inbound_lock`. `FW_CRM_Imap` is a
  minimal socket client (connect/STARTTLS, LOGIN, SELECT, UID SEARCH, UID FETCH, LOGOUT); PHP's imap extension is not
  used (gone in PHP 8.4).
- `receive( $message, $source )` → `{ status: received|sent|unknown|duplicate|ignored, contacts, deal }`. From a
  contact → timeline type `email_in` "Email received: …" (body = `FW_CRM_Mime::reply_part()`, the text above "On …
  wrote:", "-----Original Message-----", `>` lines and the `-- ` signature), plus "Reply from X: …" on the deal when
  `In-Reply-To` / `References` holds a CRM id `fwcrm-c{contact}-d{deal}-…` for a deal the contact is on (one-to-one
  emails now send that Message-ID, `message_id( $contact, $deal )`). From a WordPress user with CRM access (a team
  member's Bcc or forward) → "Email sent: …" on each contact in To/Cc, by that user. Unknown sender → skipped, or a
  new contact when `create_unknown`. Each Message-ID once (`fw_crm_inbound_seen`, last 1000).
- Fires `unysonplus_crm_email_received( $contact_id, $message, $deal_id )` and the automation event
  `crm.email_replied` (`{ subject, deal_id, dedupe: reply:<message-id> }`).
- Admin: `FW_CRM_Admin_Inbound` on CRM → Settings through the new hook **`unysonplus_crm_settings_sections`**; actions
  `inbound_save`, `inbound_test` (connects before saving; a failed test saves nothing), `inbound_check`,
  `inbound_token`.

## Sending queue (1.0.65, schema 2.8.0)

`FW_CRM_Sender` (email module) runs on the minute cron `fw_crm_send_tick` under the `add_option` lock, and now:

- **Claims** rows atomically: `FW_CRM_Campaigns::claim_batch( $id, $n )` flips `pending → sending` with a random `claim`
  token in one UPDATE, then reads back by token. `unclaim( $token )` hands back rows not reached (time budget).
  `release_stale_claims( 15 )` marks rows claimed > 15 minutes ago as **failed** ("Interrupted while sending. Not
  retried…"): a miss beats a duplicate. `queue_counts()` includes `sending`; a campaign finishes only when nothing is
  pending or sending.
- **Rate**: setting `send_rate` = `shared` (300/h, 2/s) | `vps` (1500/h, 5/s) | `service` (36000/h, 10/s) | `custom`
  (`send_rate_custom` per hour) — `host_presets()` (filter `unysonplus_crm_send_presets`), `rate()` (filter
  `unysonplus_crm_send_rate`), `allowance()` = per_hour − `FW_CRM_Campaigns::sent_last_hour()` (sent + failed with
  `sent_at` in the last hour). A batch is min(batch_size, allowance, the campaign's own `max_per_hour` remainder).
  `pace()` sleeps to stay under per_second and stops after `unysonplus_crm_tick_seconds` (30).
- **Per-campaign speed limit**: campaigns column `max_per_hour` (0 = the site's rate), editable in the campaign editor.
  Campaigns also gain `skipped` and `queue_purged_at`.
- **Retention**: `FW_CRM_Sender::purge_queues()` on the daily `fw_crm_empty_bin` job → `FW_CRM_Campaigns::purge_queues(
  $days )` (setting `queue_retention_days`, 180; 0 = keep) stores the totals on the campaign and deletes its queue rows.
  The CRM never stores per-recipient bodies: the campaign body is compiled once and personalised at send time.

## Opens, clicks, bounces and reports (1.0.66, schema 2.9.0)

`FW_CRM_Tracking` (email module). Tables `fw_crm_email_links` (hash UNIQUE, url) and `fw_crm_email_events`
(campaign_id, subscriber_id, queue_id, type `open|click|bounce|soft_bounce|complaint|unsubscribe`, link_id, `bot`,
user_agent, detail).

- **Sending**: `FW_CRM_Sender::send_one( $campaign, $subscriber, $row )` calls `FW_CRM_Tracking::sending( $row )` (so
  `unysonplus_crm_unsubscribe_url` gets `&fwq=<token>` for the body link and the List-Unsubscribe header), then
  `instrument( $html, $row )`: links → `?fw-crm-c=<queue>.<link>.<hmac12>` (skips non-http, the CRM's own
  unsubscribe / preference / confirm links), and a pixel `?fw-crm-o=<queue>.0.<hmac12>` before `</body>`; header
  `Message-ID: <fwcrm-q{queue}-…@host>`. Test sends (no row) are not tracked. Settings `track_opens`, `track_clicks`.
- **Requests** (`init` priority 0): the pixel answers a GIF; a click 302s to the stored URL (a forged token goes to the
  home page — never an open redirect). `record( $type, $row, $link_id, $ctx )` stores the event; `bot = 1` for HEAD /
  prefetch, scanner user agents, a click within `unysonplus_crm_scanner_seconds` (5) of `sent_at`, or ≥ 2 other links
  clicked by the same row in the last 2 seconds. An open with no user agent counts (image proxies). First open /
  first click per link → timeline `email_open` / `email_click`; `unysonplus_crm_email_event`; automation events
  `crm.email_opened` / `crm.email_clicked`.
- **Bounces / complaints**: `FW_CRM_Inbound_Email::receive()` first calls `FW_CRM_Tracking::handle_report( $m )`.
  `FW_CRM_Mime::parse()` now returns `report_type` and `reports` (`message/delivery-status`, `message/feedback-report`,
  `text/rfc822-headers`, headers of `message/rfc822`). DSN `Action: failed` + `Status: 5.x.x` → `bounce` (contact status
  `bounced`); other failures/delays → `soft_bounce`; ARF → `complaint` (status `complained`); a mailer-daemon /
  postmaster message with a 5.x.x code and an address → `bounce`. The campaign comes from `fwcrm-q{id}` in the
  original headers, else the contact's latest sent row.
- **Unsubscribes**: `fwq` on the unsubscribe URL (carried through the confirmation form) + the
  `unysonplus_crm_subscriber_unsubscribed` action → an `unsubscribe` event for that campaign.
- **Reports**: `stats( $id )` (people, scanners excluded: sent, opened/opens/open_rate, clicked/clicks/click_rate,
  click_to_open, bounced, soft_bounced, complained, unsubscribed, scanner_hits), `top_links()`, `by_hour()` (first
  opens/clicks per hour, 24–72 h), `recent()`. Screen `tab=campaigns&report=<id>` (`FW_CRM_Campaign_Report`); the
  campaign list shows rates. Deleting a campaign deletes its events.

## Forms add the sender to the CRM (1.0.68)

`FW_CRM_Forms_Action_Subscribe` (id stays `subscribe`; `is_enabled()` = either switch) + `FW_CRM_Form_Map`
(`includes/forms/`, required by `FW_CRM_Forms_Bridge`). Form settings (flat contact-form atts):
`action_crm_contact` (yes/no), `action_crm_map` (`html` option; JSON `{ fields: { <field id>: <target> }, deal_title,
date }`), `action_crm_update` (`blank` | `always`), `action_crm_create` (`''` | `deal` | `task`), `action_crm_pipeline`,
`action_crm_task_type`; the newsletter keeps `action_subscribe` (+ `_list`, `_tags`; `_name` is now only a fallback).

- **Targets**: `timeline`, `name` (split first/last), `first_name`, `last_name`, `phone`, `job_title`, `company`
  (Companies module: found by exact name or created, linked, primary if none), `address_line1|2`, `city`, `region`,
  `postcode`, `country` (filter `unysonplus_crm_form_targets`), `cf:<key>`, `new`. Fields of types
  `SKIP_TYPES` (honeypot, recaptcha, hidden, form-header-title, file-upload, passwords) are never mapped; email and
  consent are fixed. `resolve()` = stored choice, else `auto_target()` (an existing custom field with the same label,
  else label rules for text/number fields, else `timeline`) — mirrored in `static/js/form-map.js`.
- **New custom fields**: `ensure_field( $form_id, $field_id, $item )` reuses the field linked in option
  `fw_crm_form_fields` (`"<form id>:<field id>" => key`) or a same-label field, else creates one (type from
  `field_type_for()`: textarea, number/rating → number, select/radio → choice, checkboxes → multichoice, email, website
  → url, date → date/datetime) with the form's choices; later choices are appended. Run on page save
  (`added_post_meta` / `updated_post_meta` for `fw:opt:ext:pb:page-builder:json`, walking `contact_form` atts) and at
  submit.
- **`apply()`**: finds the contact by email (restores one in the bin), fills only empty values unless `always`
  (differences returned as `kept`), creates with `source = form`, status `none`. Newsletter subscription only with
  `newsletter_consent_given()`; otherwise tags go through `FW_CRM_Tags::add`.
- **Timeline**: one `form` entry with `answers_html()` (a `dl.fw-crm-answers`, the kept note, a link to the Forms
  entry, built without `FW_Forms_Entries_Admin`, which loads in the admin only). Forms stores the entry inside the
  same action loop, so the context's `entry_id` is 0: `FW_CRM_Activity::pending_entry_id()` supplies it, and
  `FW_CRM_Activity::$form_logged[ email ]` stops `_after_form()` logging the same submission twice.
- **Also create**: a deal (`deal_title` field, default the first dropdown/single choice; a value matching a catalogue
  product by name, CRM or shop, adds that line; `date` field → `expected_close`) or a task of `action_crm_task_type`
  due on the date field, notes = the answers.
- **Events**: `unysonplus_crm_form_submitted( $contact_id, $ctx, $created )`, automation `crm.form_submitted`, webhook
  `form.submitted` (`contact`, `new_contact`, `form_id`, `form_title`, `entry_id`, `answers[]`).
- **Admin UI**: `form-map.js` + `form-map.css` enqueued in the footer when `fw-builder-form-builder` is enqueued (post
  editor and Live Editor). It reads the modal's `…[form]` JSON, renders the table, writes the `.fw-option-html-value`
  input, hides the CRM rows while the switch (a checkbox: checked = on) is off and the pipeline / task-type rows by
  "Also create".
- Forms rate-limits visitor submissions (`fw_rate_limit_exceeded( 'fw_ext_forms_submit', 10, 600 )`): repeated test
  submissions answer "Too many submissions" — filter `fw_rate_limit` to 0 for that action on a test site.

## Workspace: run the site as a CRM (1.0.78, core 3.0.55)

The CRM registers a **workspace** (`fw_register_workspace( 'crm', … )` on `fw_workspaces_register`, from the
extension class, outside `is_admin()`, because the login redirect runs on `wp-login.php`). Core's
**Unyson+ → Admin Menu** (tabs **Menus** = the editor, default; **Roles** = what each role opens to) (`framework/includes/workspaces/class-fw-workspaces.php`, option `fw_workspaces`)
then lets the owner choose per role (the old "menus to keep" list is gone; the Menus tab does that now):

- **Opens to** the CRM: login (when no specific page was requested) and Dashboard redirect to `admin.php?page=fw-crm`;
  the WordPress menu keeps only the CRM, Profile and the menus ticked for that role; the admin bar loses
  wp-logo / comments / new-content / updates / customize; focus mode is the default (`fw_admin_app_focus_default`)
  until the person chooses.
- **Own menu item**: the CRM gets a top-level item (position 3, class `fw-ws-menu`) for everyone who can use
  it. The page stays registered under Unyson+; that submenu entry is hidden (`fw-ws-moved`) and the top-level
  item links to the same URL, so the hook suffix `unysonplus_page_fw-crm` and the app shell's `attach()` are
  unchanged. Current-item highlighting is set in the page, because WordPress re-derives `$parent_file` from the
  registration after the `parent_file` filter.
- Administrators get **Switch to WordPress / Switch to CRM** in the admin bar (user meta `fw_workspace_off`).

**Menus tab** (core `FW_Admin_Menu_Editor`, `framework/includes/workspaces/class-fw-admin-menu-editor.php`, option
`fw_admin_menu` = role => { order, hidden, labels, icons, sub_hidden, map, group_labels, slugs }): per-role drag order,
rename, dashicon, hide items and sub-items, live preview, copy from role, reset. Applied server-side inside
`FW_Workspaces::_action_shape_menu()` after promotion and `capture()`; the menu is rebuilt with keys 10, 20… and the
same order is returned from `menu_order` (PHP_INT_MAX) in case a plugin turns on `custom_menu_order`. Keys = the
item's `<li>` id; a promoted workspace now uses `toplevel_page_<page>`, the id a real top-level page gets, so one key
fits admins and reps. A workspace role's menu = workspace + Profile + what the layout shows; items the layout never saw
stay hidden for it (other roles get them at the end). Hidden top-level slugs are redirected on `admin_init`. The admin
bar switch shows for a customised role too ("Show the full menu"). **Roles tab extras (CRM 1.0.79, Membership 1.0.27, core 3.0.55):** `fw_register_workspace()` takes optional `roles` (opened to the app), `members` (kept out of wp-admin) and `setup` (button label); **Quick set-up → Apply** (`FW_Workspaces::setup( $id )`, admin-post `fw_workspaces_setup`) applies them and `FW_Admin_Menu_Editor::lift_for_admins()` gives every `manage_options` role the app as a top-level item. The CRM declares roles `fw_crm_manager` + `fw_crm_sales_rep` ("Run the site as a CRM"). **Members:** `fw_workspaces['members'] = { roles[], page }`; `FW_Workspaces::is_kept_out( $user )` = a ticked role, no app role, not `manage_options`. Kept-out users are redirected from any wp-admin request on `admin_init` priority 1 (not admin-ajax / admin-post / async-upload) and from a wp-admin `login_redirect`, to `member_home()` (chosen page → `fw_workspaces_member_home` filter → home; a wp-admin URL is refused), and get `show_admin_bar` false. Membership declares members `subscriber` ("Run a members' site") and answers the filter with its account page. **Sub-item drag** (core 3.0.55): sub-items sort within their own parent (`sub_order` key => slugs; the parent's own first entry is pinned first, because the parent links to it), drag out to a top-level list = lift, a lifted row dropped back into its own parent's list = move back; any other drop is cancelled (jQuery UI `receive` + `cancel`). The old site-wide "own menu item" switches (`fw_workspaces['menu']`) are migrated once on `admin_init` into lifts for every role with `manage_options`, placed after Dashboard (`place_unsaved()`); `promoted()` now only covers the active workspace. A lifted workspace page keeps its app icon and the `fw-ws-menu` class. **Lifted sub-items** (`lifted` = [ { parent, slug } ]): any submenu page (e.g. SEO `fw-seo-settings` under `fw-extensions`, `site-health.php` under `tools.php`) gets a top-level item per role, key/id `fw-lift-<slug>`, href from `sub_url()` (core file as is; plugin page under a core file's menu → `<file>?page=`; else `admin.php?page=`). The submenu entry is only hidden (`fw-ws-moved`), so screen ids, hooks and the access check are unchanged; current-item marking is done in the page (`_action_mark_current`). The parent's own first entry cannot be lifted. It replaces the Admin Skin's skin-only layout
(`fw_admin_skin_menu_layout`, imported once when `fw_admin_menu` does not exist yet).

Pair it with the CRM roles: a workspace hides menus, the roles limit access. Membership registers
`membership` the same way. `FW_WORKSPACES_OFF` in `wp-config.php` disables the feature. The Admin Skin maps
`fw-ws-menu` into its Workspace group.

## AI Assistant tools per module (1.0.77)

Each module that can be set up by an AI app ships `modules/<module>/ai-abilities.php`, required inside that module's
`enabled()` block in the loader and registered on `fw_ai_assistant_register_abilities`. All of them set things up and
never read or contact people (counts only). Option-backed changes call `fw_ai_snapshot()` (undoable); table-backed ones
say what changed.

- `crm-pipelines` / `crm-save-pipeline` (pipeline): matched by name, stages matched by name (renaming = a new stage); a
  stage left out is removed only if it holds no open deals, otherwise kept and reported (`stages_kept`).
- `crm-automations` / `crm-save-automation` (automations): describe + recipes + the trigger/action catalogue; save a
  DRAFT from `recipe` (`FW_CRM_Automations::recipe()`) or `{ trigger_type, trigger_settings, settings, steps }` (ids made
  when missing; an unknown action slug is refused by name). Matched by id or title; never switches an automation on, and
  an automation the owner switched on stays on. Recipes moved from the admin class to `FW_CRM_Automations::recipes()`
  so the abilities (no admin classes loaded) can read them.
- `crm-scoring` (scoring): no input = read; `scores` / `rules` (whole list, validated: an invalid rule changes nothing) /
  `decay`; snapshot of `fw_crm_scoring`. Site activity is reported, never switched.
- `crm-email-templates` / `crm-campaign-from-template` / `crm-sending` (email; `crm-sending` also with conversations):
  the email file requires `class-fw-crm-email-templates.php` itself (normally loaded only by the builder option type);
  `FW_CRM_Email_Templates::to_value( $blocks )` turns starter blocks into the builder value `save_campaign()`'s
  `body_json` takes. Campaign texts replace the template's text blocks in order (extra texts go before the footer),
  `headings` its headings, `button` its button. `crm-sending` matches senders by name, never sets an email service
  (API keys are the owner's), and never changes the digest's `on`; snapshot of the senders and digest options.
- `crm-describe` now returns `modules` (label, on, available) and points the AI to these tools.
- Forms `forms-add` gained `crm { add_contact, create: deal|task|case, pipeline (name or id), task_type, tags }`, mapped
  to the "Add to the CRM" action (`action_crm_contact`, `action_crm_create`, `action_crm_pipeline`, …).
- The Site Creator (create.unysonplus.com, repo `UnysonPlus-Site-Creator`, working copy `d:\Web Dev\crm-generator`)
  prompts use these: a real pipeline with enquiries as deals, a welcome series and a booking follow-up as draft automations.

## Extension API, events catalogue, integrations, commerce, objects, WooCommerce (1.0.76, schema 2.15.0)

- **`fw_crm()`** (`includes/class-fw-crm-api.php`, `FW_CRM_API::VERSION` = `1.0`): the stable surface for other
  extensions. Thin wrappers over the classes below; returns arrays/ids/bools or `WP_Error`; no permission checks.
  `null` while the CRM is inactive. Keep new public methods additive within 1.x; document them in
  `crm/developers/extension-api.md` (docs site).
- **Events catalogue** `FW_CRM_Events` (`includes/class-fw-crm-events.php`): `emit( $event, $contact_id, $object_type,
  $object_id, $data )` → `do_action( 'unysonplus_crm_event', { event, contact_id, object_type, object_id, data,
  occurred_at } )` plus `unysonplus_crm_event_<event with _>`. `init()` bridges the existing specific hooks (they still
  fire). Catalogue filter `unysonplus_crm_events_catalogue`. `FW_CRM_Automations_Plain::plain()` (same file) flattens
  payloads (objects → arrays).
- **Integrations** `FW_CRM_Integrations`: `register( $id, { label, description, icon, active (bool|callable), triggers,
  actions, fields, activity_types, events, widgets, objects } )`; merged into the automation triggers/actions filters
  at priority 8 (`group` defaults to the label; an existing slug wins), activity types, catalogue, dashboard cards,
  `unysonplus_crm_register_objects`; `fields` become managed contact fields on `admin_init`. Listed on the Modules
  screen via the new action `unysonplus_crm_modules_after`. Filter `unysonplus_crm_integrations`.
- **Purchase summaries** `FW_CRM_Commerce` (table `commerce_summaries`, UNIQUE contact+provider): `set()` (partial
  update), `add_order()`, `get()`, `for_contact()`; keeps `subscribers.lifetime_value` = SUM(total); emits
  `commerce.updated`. Segment fields `commerce_orders|commerce_total|commerce_last|commerce_product` (all `sql`
  callbacks), condition fields `commerce_orders|commerce_total`, contact panel `commerce`.
- **Users** `FW_CRM_Users`: `ensure_for_user()` (link by id, else email, else create, then `link_user`),
  `user_can_access( $uid, { tags, lists, segment, match } )`, `in_segment( $cid, $id_or_slug )`, `deleted_user` →
  unlink. **Membership events**: listens to `unysonplus_crm_automation_event` (priority 5) for `membership.*` (the
  Membership extension already fires these) and records summary (provider `membership`: plan from `plan_name`|`plan`,
  status, `total` adds an order), event `membership_<event>` and the catalogue event; it writes a timeline entry only
  when `FW_Membership_CRM_Timeline` does not exist (that extension logs its own). `membership_event()` = fire the
  automation event. Registers fallback `membership.*` triggers at priority 5 (Membership's richer ones overwrite).
- **Custom objects** `FW_CRM_Objects` (table `objects`): `register( $type ≤30 chars, { label, plural, icon, statuses,
  relates: contact|company|deal, capability } )` during `unysonplus_crm_register_objects` (fired on `init` 20);
  `create/update/get/query/delete/link`; fields via `FW_CRM_Fields` with `object` = type; relations via
  `FW_CRM_Relations`; timeline via `FW_CRM_Activity`. Panels on related record pages; filter
  `unysonplus_crm_object_url`. No admin screen yet.
- **Widgets** `FW_CRM_Widgets` (`includes/admin/`, admin only): `add( $id, { title, callback, column, priority, cap } )`
  → `unysonplus_crm_dashboard_cards` (priority 20). Built-in: `warmest` (scoring module), `woo_orders`.
- **WooCommerce** module `woocommerce` (`modules/integrations/class-fw-crm-woocommerce.php`, `available` only with
  WooCommerce): contact by billing email on checkout (`woocommerce_checkout_order_processed` and the Store API hook;
  fills empty fields only; links the customer user; status stays `none`); timeline `order` entries; paid status →
  lifecycle `customer` (setting); `recalculate()` rebuilds the `woocommerce` summary from paid orders net of refunds
  on every status change and refund; refunds → event `refund` + trigger `crm.order_refunded`; carts of known
  visitors (logged in or the site-activity cookie) kept in option `fw_crm_woo_carts`, hourly `fw_crm_woo_carts_tick`
  fires `crm.cart_abandoned` once after `cart_hours`; `sync()` imports past orders 200 at a time (Settings section).
  Its triggers are registered through the integration (so the Modules list counts them).

## Events, lead scoring, site activity (1.0.75, schema 2.14.0)

- **Events store** `FW_CRM_Events_Store` (`includes/`, core, always on): table `contact_events` (contact_id, event slug,
  value ≤255, url, props JSON). Sources: `unysonplus_crm_track( $id_or_email, $event, $args )`, `wp_login` (contact by
  `user_id` then email), WooCommerce completed order (`purchase`, value = total), `unysonplus_crm_form_submitted`
  (`form_submitted`), counted campaign opens/clicks (`email_open`/`email_click`). `record()` fires
  `unysonplus_crm_event_recorded( $row )` and the `crm.event` automation trigger (not for `page_view`). Adds the segment
  field `event` (type `activity`, `sql` callback) and the `crm.event` trigger. Purge deletes events; merge moves them.
- **Segments**: a field from `unysonplus_crm_segment_fields` may carry `'sql' => callable( $op, $value )` (contact alias
  `s`); `FW_CRM_Segments::compile_rule()` checks it first.
- **Scoring** `FW_CRM_Scoring` (module `scoring`): option `fw_crm_scoring` `{ scores: key => label (default implied),
  rules: [ { id, label, score, event, match, points, limit } ], decay: { on, percent, days } }`. Tables `contact_scores`
  (UNIQUE contact+score_key; `default` mirrored into `subscribers.score`) and `score_log` (every change + reason;
  `limit` counts rows per rule). Rule events: page_view (match = URL contains), email_open/click (campaign id),
  form_submitted (form id), purchase (min total), login, tag_added (slug), field (`field = value`, contact column or
  `cf:key`), `event:<name>` (value). `clean_rule( $r, $scores )` must get the scores being saved in the same call, or a
  rule for a brand-new named score falls back to default. Daily `fw_crm_scoring_daily` fades scores whose `updated_at`
  is older than `days` and not faded in that period (`decayed_at`); the fade leaves `updated_at` at the quiet date.
  Adds: segment fields `score:<key>`, condition fields `score:<key>`, triggers `crm.score_changed` (fires on crossing
  the threshold upwards) and `crm.page_visited`, action `crm.add_points`. Deal score = max default score of its contacts.
- **Site activity** `FW_CRM_Site_Activity` (option `fw_crm_site_activity` `{ on, consent: cookie|always,
  consent_cookie, exclude }`; `save_settings()` merges with the current values). Identity = cookie `fw_crm_vid`
  `<id>.<hmac>` (auth salt), set on CRM form submission, campaign click, login, only while on. The footer script
  (printed for everyone, cache-safe) acts only if the cookie exists and DNT/GPC are off; it beacons to
  `POST /fw-crm/v1/activity` (`permission_callback` true; the endpoint verifies the signature, consent, same host).
  `page_view()`: excluded path prefixes, same URL within 5 min ignored, one `visit` timeline entry per 30-min session.
  `[data-crm-event]` clicks are sent as events.
- Admin `FW_CRM_Admin_Scoring` (`tab=scoring`, actions `scoring_*`), contact panel `scoring` (scores, history, adjust,
  recent events), deal panel `scoring`.

## Automations (1.0.74, schema 2.13.0)

Module `automations` (`modules/automations/`). Tables: `automations` (title, status draft|active|paused, `trigger_type`,
`trigger_settings` JSON, `settings` JSON `{ reentry: once|after_finish|always, exit: condition group }`, `version`),
`automation_versions` (steps JSON per version), `automation_runs` (one row per contact per run: `step_id`,
`next_run_at`, `status` active|waiting|completed|exited|failed, `context` JSON, `dedupe`, claim token, `is_test`),
`automation_log` (pruned after 90 days).

- **Steps tree**: `{ id, type: action|wait|condition|split|goal, action?, settings, branches? }`; condition branches
  `yes`/`no`, split `a`/`b`. `FW_CRM_Automations::index()` flattens it to id → { step, next }; the end of a branch
  continues after its parent. `clean_steps()` drops unknown actions and nests at most 8 deep.
- **Versioning**: `save_steps()` rewrites the current version when nobody is inside it, otherwise inserts a new one;
  runs keep their `version`. Never edit `automation_versions` rows that have runs.
- **Entry**: `event( $slug, $contact_id, $context )` (hooked on `unysonplus_crm_automation_event`) → goals first,
  then `start()` for each active automation whose trigger matches (`trigger_matches()`: the trigger's `match`
  callable, else every set field equals the context value). `start()` runs the first steps immediately
  (filter `unysonplus_crm_automation_run_now`); waits are left to the runner.
- **Runner** `FW_CRM_Runner`: cron `fw_crm_automations_tick` every minute (`fw_crm_minute` schedule, defined here too)
  and `fw_crm_automations_daily` (date triggers via `FW_CRM_Trigger::scan_dates()`, log prune). Claims with
  `UPDATE … SET claim_token … LIMIT 50`, releases claims older than 10 min, 20 s budget, max 60 steps per pass,
  saves `step_id` after every step. A paused automation re-defers its runs by 15 min; a deleted one fails them.
- **Action contract**: `callback( $contact_id, $settings, $context )` → true | WP_Error (code `skip*` = skipped) |
  `{ status?, message?, context? }` (context merged into the run, e.g. `deal_id`). Exceptions are caught.
  `$context['test']` in test runs; `crm.send_email` then mails the current user, `crm.notify` too.
- **Conditions** `FW_CRM_Conditions` (if/else, exit rules): fields tag, list, status, lifecycle_stage, segment,
  opened/clicked (during this run, from tracking events), deal_stage (run context), core fields, `cf:<key>`;
  filter `unysonplus_crm_automation_condition_fields` (a `test` callable for custom ones).
- **Goals** `FW_CRM_Goals::on_event()`: a goal step `{ trigger, match }` pulls a run forward only if it is ahead of the
  current step; reached normally it is a no-op. Exit rules are checked before every step.
- **Guard** `FW_CRM_Automation_Guard`: events raised inside actions at depth ≥ 3 start nothing
  (`unysonplus_crm_automation_loop_stopped`); a contact cannot re-enter the same automation within 60 s; `dedupe`
  per automation; re-entry rule. `test_run()` forces entry and skips waits.
- **Built-in triggers** (`crm.*`, bridged from existing hooks in `FW_CRM_Trigger::init()`): contact_created, subscribed,
  form_submitted, tag_added/removed (`unysonplus_crm_pivot_changed`), list_joined/left (`unysonplus_crm_list_status_changed`),
  field_changed (contact columns from `unysonplus_crm_contact_updated` with from/to; custom fields from
  `unysonplus_crm_fields_updated`, "from" unknown), date_reached (daily scan of `field_values.value_date`, `yearly`
  matches month-day, dedupe per field/date/contact), task_completed, deal_created/stage_changed/won/lost (every deal
  contact), email_opened/clicked, email_replied, case_created, purchase_made (`woocommerce_order_status_completed`,
  contact by billing email, created if missing).
- **Built-in actions**: send_email, add/remove_tag, add/remove_list, update_field, create_task, notify, webhook,
  start/end_automation, assign_owner (round robin per automation step, option `fw_crm_round_robin`), create/move_deal.
- **Recipes** `modules/automations/recipes/index.json` (5), filtered by available triggers/actions; filter
  `unysonplus_crm_automation_recipes`. Goals at the END of a recipe are fine; anything after a goal runs for everyone.
- **Health** `FW_CRM_Cron_Check`: heartbeat option `fw_crm_cron_beats`; late after 5 min; gives the wget, WP-CLI and
  `DISABLE_WP_CRON` lines. **CLI** `includes/class-fw-crm-cli.php`: `wp crm automations run|status|list|test|dates`,
  `wp crm queue run`. The class is declared inside `if ( ! class_exists( …, false ) )`: a top-level class is
  hoisted, so a guard before it always saw the class and the command was never registered.
- Admin `FW_CRM_Admin_Automations` (`tab=automations`, actions `auto_*`), editor `static/js/editor.js` (state → hidden
  `automation_json`), contact side panel `automations`.

## Senders, email services, smart links, digest, channels (1.0.73, schema 2.12.0)

- **Sender profiles** `FW_CRM_Senders` (`modules/email/class-fw-crm-senders.php`, option `fw_crm_senders`
  `{ profiles: id => { id, name, from_name, from_email, reply_to, service }, marketing: id, transactional: id }`).
  Loads with the `email` OR `conversations` module. Every CRM send wraps its `wp_mail()` in
  `begin( 'marketing'|'transactional', $profile_id )` / `end()`: campaign sender (`campaigns.sender_id`, new column),
  `FW_CRM_Mail::send` (confirm/welcome), `FW_CRM_Direct_Email::send` (case replies go through it), `FW_CRM_Channels`.
  Only inside that scope do its filters act: `wp_mail_from`/`_name` @50 (Direct_Email's writer name @999 still wins),
  `wp_mail` (adds Reply-To if none), `pre_wp_mail` (hands off to the service). **Never hook these globally**: it would
  reroute WooCommerce receipts and password resets. Decision: `/decisions/crm-senders-wrap-wp-mail`.
- **Email services** `FW_CRM_Mail_Service` (`modules/email/services/`): SendGrid, Mailgun, Postmark, Brevo, Amazon SES
  (SigV4, `sign()` is public and tested against an independent computation). Filter `unysonplus_crm_mail_services`
  (id → class). Settings in option `fw_crm_mail_services`, `password` fields encrypted (`enc:` AES with the auth salt).
  Not configured, or attachments on Mailgun/SES (`supports_attachments()` false) → returns null and the site mail sends it.
  A service error → `wp_mail_failed` with its message and `pre_wp_mail` returns false. Message shape:
  `{ to[], cc[], bcc[], from_email, from_name, reply_to, subject, html, text, headers{}, attachments[], purpose }`.
  Postmark sends `purpose = marketing` on the configured stream.
- **Webhooks**: `POST /wp-json/fw-crm/v1/mail-services/{id}/events?token=` (token option `fw_crm_mail_services_token`).
  `parse_events()` → `{ type: bounce|soft_bounce|complaint|unsubscribe, email, message_id, detail }` →
  `FW_CRM_Tracking::service_report()` (reuses `apply()`; matches the queue row by our `fwcrm-q<id>-` Message-ID when the
  service echoes it) or, without the email module, `FW_CRM_Tracking_Bridge::report()` sets the status directly.
  Mailgun checks the HMAC when a signing key is set; SES confirms the SNS subscription (host must be `sns.*.amazonaws.com`).
- **Smart links** `FW_CRM_Smart_Links`: marker fragment `#crm-tag=a,b` on any link; Button block option
  `tag_on_click`. Listens to the existing `unysonplus_crm_email_event( $type, $row, $link_id, $ctx )`, which fires only
  for counted (non-scanner) events; a click adds the tags (`FW_CRM_Tags::add(…, 'smart_link')`). The marker is stripped before the redirect and from
  untracked emails (`Sender::send_one`).
- **Post digest** `FW_CRM_Digest` (option `fw_crm_digest`, hourly cron `fw_crm_digest_tick` while on): weekly on a weekday
  or monthly on the 1st, after an hour; posts after `last_sent` → `Service::save_campaign()` + `schedule_campaign()`.
  `last_sent` is recorded even when there is nothing new (no re-check that period).
- **Channels** `FW_CRM_Channels` (`includes/`, always loaded): filter `unysonplus_crm_channels`
  `id => { label, icon, address( $contact ), send( $contact, $message ), available }`; `send()` logs a timeline entry
  (`email` or `message` type). Email is the only built-in channel.
- Admin: `FW_CRM_Admin_Sending` renders the **Sending** section on Settings (actions `sending_*`); campaign editor
  has a **From** select when profiles exist. Templates gained a **Follow-up** starter.

## Support cases (1.0.72, schema 2.11.0)

A light support ticket: `fw_crm_cases` (`id`, `title`, `status`, `priority`, `owner_id`, `contact_id`, `company_id`,
`source` manual|form|email, `due_at`, `position`, `status_changed_at`, `solved_at`, `last_activity_at`, `created_by`,
`created_at`, `updated_at`). The case number is its `id`, shown as `#12`.

- **Fixed statuses, not the pipeline.** `FW_CRM_Cases::statuses()` = new, open, waiting (on customer), solved (`done`),
  filter `unysonplus_crm_case_statuses`. Cases do NOT reuse pipelines/stages: those belong to the optional `pipeline`
  module, and a support status has no value or probability. Priorities: low, normal, high, urgent.
- **The conversation is the timeline** (`FW_CRM_Activity`, object_type `case`): `created` (with the first message),
  `stage` (status changes), `owner`, `priority`, `note` (internal), `email` (reply sent), `email_in` (customer reply).
  The contact's timeline gets one `case` entry when a case opens and when it is solved.
- **Threading by subject.** `Cases::reply()` sends through `FW_CRM_Direct_Email` (needs the conversations module)
  with the subject `[Case #12] Title`; `Cases::number_in()` reads it back. `FW_CRM_Cases_Intake::_on_email`
  (on `unysonplus_crm_email_received`) puts a reply from that case's contact on the case and reopens a waiting or
  solved case. Any other customer email opens a case only when the manager setting `from_email` is on, and never
  when it is part of a deal thread or answers a CRM-sent email (`In-Reply-To`/`References` containing `fwcrm-`).
- **Forms:** the "Add to the CRM" action's **Also create → A support case** calls `Cases_Intake::from_form()`:
  title from a subject/topic-like field, else the first dropdown, else the start of the longest textarea; the
  answers become the first timeline entry.
- **Ownership:** new cases go to the contact's owner, else the `default_owner` setting, else unassigned.
  `FW_CRM_Capabilities::can_edit_case()`: managers see all; a rep sees their own cases **and unassigned ones**, so
  a new request is never invisible. "Take it" assigns to the current user.
- Admin: `tab=cases` board (drag between statuses, `wp_ajax_fw_crm_case_move`, nonce `fw_crm_case_move`; solved
  column shows the last 14 days) or `&view=list`; filters `owner` (me|none|id), `priority`, `age` (days), `s`
  (text or `#number`). The board reuses `modules/pipeline/static/css/board.css` (it ships whether or not the
  pipeline is on) plus `modules/cases/static/css/cases.css`.
- Hooks: `unysonplus_crm_case_created`, `unysonplus_crm_case_updated`, `unysonplus_crm_case_status_changed`,
  `unysonplus_crm_case_deleted`; automation event `crm.case_created`.

## Webhooks (1.0.67, schema 2.10.0)

Module `webhooks` (`modules/webhooks/`): `FW_CRM_Webhooks`, `FW_CRM_REST_Webhooks`, `FW_CRM_Admin_Webhooks`. Tables
`fw_crm_webhooks` (name, url, events JSON, secret `whsec_…`, active, failures, last_status, last_delivery_at) and
`fw_crm_webhook_deliveries` (webhook_id, uuid, event, payload JSON, status `pending|sending|sent|failed`, attempts,
response_code, response_body ≤1000, duration_ms, next_attempt_at, created_at, delivered_at; times in **GMT**).

- **Events** (`events()`, filter `unysonplus_crm_webhook_events`, slug => { label, group }; module-dependent ones
  appear only while their module is on): `contact.created|updated|deleted|tagged|untagged|subscribed|unsubscribed`,
  `task.created|completed`, `company.created|updated|deleted`, `deal.created|updated|stage_changed|won|lost|deleted`,
  `email.opened|clicked|bounced|complained|received`, `campaign.sent`, plus `ping` (tests). An endpoint stores
  known slugs, `*`, or any `vendor.event` slug (so a plugin's event can be chosen before the plugin loads).
- **Emit**: `emit( $event, $data )` or `do_action( 'unysonplus_crm_webhook', $event, $data )` → one `pending` row per
  active endpoint subscribed (or `*`), payload `{ id: uuid, event, created_at (ISO 8601 UTC), site, data }`, filter
  `unysonplus_crm_webhook_payload( $payload, $event, $hook )` (null = skip). Nothing is sent inline.
- **Run**: single cron event `fw_crm_webhooks_tick`, scheduled at emit; `run()` reclaims `sending` rows older than
  10 min, claims due rows one by one (`UPDATE … WHERE status = 'pending'`), sends ≤ 25 / 20 s, books the next run at the
  earliest `next_attempt_at`. Backoff `BACKOFF` = 60, 300, 1800, 7200, 21600, 43200 s → 7 tries, then `failed`; an
  endpoint with `DISABLE_AFTER` (20) final failures in a row is switched off (saving it active resets the count).
- **Request** (`post()`): JSON body, headers `X-UnysonPlus-Event`, `X-UnysonPlus-Delivery` (the uuid, same on every
  retry), `X-UnysonPlus-Timestamp`, `X-UnysonPlus-Signature: sha256=<hex hmac_sha256( timestamp . '.' . body, secret )>`
  (`sign()`); 10 s timeout, no redirects; filter `unysonplus_crm_webhook_request_args`. 2xx = delivered.
- **SSRF**: `wp_safe_remote_post` (and `wp_http_validate_url` on save) unless `allow_local()` — true on a `local` /
  `development` environment type or via filter `unysonplus_crm_webhook_allow_local`.
- `test( $id )` sends a `ping` now (never retried), `retry( $delivery_id )` resends now and restarts the retry round
  (refused for `sent`), `rotate_secret()`, `stats( $id )` (7 days by status), `prune()` on `fw_crm_empty_bin`
  (finished rows older than `unysonplus_crm_webhook_log_days`, 30). Action `unysonplus_crm_webhook_delivered( $id,
  $result, $hook )`.
- **REST** (managers): `GET|POST /webhooks`, `GET|PUT|PATCH|DELETE /webhooks/{id}` (secret only on single reads and
  create), `POST /webhooks/{id}/test`, `POST /webhooks/{id}/secret`, `GET /webhooks/{id}/deliveries` (`status`,
  paged, `X-WP-Total`), `POST /webhook-deliveries/{id}/retry`, `GET /webhooks/events`.
- **Admin**: `tab=webhooks` list (7-day delivered/failed, last answer), `&edit=new|<id>` (URL, name, events by group
  or "every event", active switch, secret + rotate, Send a test, Delete, the last 50 deliveries as `<details>` with
  payload, answer and "Send again now").

## Extension integration API (1.0.43, schema 2.1.0)

What another extension (Membership first) builds on. Call it only while `fw_ext('crm')` is active.

| API | Notes |
|---|---|
| `FW_CRM_Contacts::find_by_user( $user_id )` | The linked contact (array, same shape as `get()`) or `null`. A binned contact is not found |
| `FW_CRM_Contacts::id_for_user( $user_id, $include_trashed = false )` | Just the id (0 if none). One indexed query, cached per request |
| `FW_CRM_Contacts::link_user( $contact_id, $user_id )` | `true` or `WP_Error` (`fw_crm_contact_linked`, `fw_crm_user_linked`, `fw_crm_no_user`, `fw_crm_not_found`). One user per contact and one contact per user; relinking the same pair is a no-op. Logs `user` on the timeline; fires `unysonplus_crm_user_linked( $contact_id, $user_id )` |
| `FW_CRM_Contacts::unlink_user( $contact_id )` | Fires `unysonplus_crm_user_unlinked( $contact_id, $old_user_id )`. `create()` / `update()` with `user_id` go through these same checks |
| `FW_CRM_Subscribers::has_lists( $contact_id, array $slugs, $match = 'any', $type = 'tag' )` | `any` / `all` / `none`. One indexed query, cached per request (cleared by every membership write; `flush_has_cache()`). Lists count only while subscribed; a binned contact holds nothing |
| `FW_CRM_Contacts::user_has( $user_id, $slugs, $match, $type )` | The access check: `has_lists()` on the user's contact; a user without one holds nothing |
| `FW_CRM_Lists::get_or_create( $slug, $type, array( 'title' => …, 'managed_by' => 'membership' ) )` | A **managed** tag or list: shown locked on the contact page (and kept when staff save lists and tags), hidden from the bulk tag picker, badged "Managed by …" with a warning before deletion. Claiming an existing slug takes it over. Mirror tags with `add_to_list()` / `remove_from_list()`, not `set_lists()` (that replaces the whole set) |
| `FW_CRM_Fields::save_definition( array( …, 'managed_by' => 'membership' ) )` | A managed custom field: read-only in the CRM's edit form; write it with `set_values()` |
| filter `unysonplus_crm_contact_panels` / `unysonplus_crm_company_panels` | `( $panels, $record )` → `id => { label, callback( $record ), priority = 50, column = 'side' or 'main' }` |
| filter `unysonplus_crm_dashboard_cards` | `id => { title, callback(), priority, column }` on Home |
| filter `unysonplus_crm_activity_types` | `type => { label, icon }` (a dashicons class) for timeline entries you log |
| filter `unysonplus_crm_managed_by_label` | Display name for a `managed_by` slug (defaults to the extension's manifest name) |
| filter `unysonplus_crm_nav` | A sidebar item may carry `url` to link to the extension's own screen |
| action `unysonplus_crm_contact_updated( $contact, $before_row, $changes )` | `$changes` = changed columns as `field => { old, new }` (custom fields not included) |

## Automation registration (the engine is built: see Automations)

Register now; nothing reads these until the Automations module exists, so registering is harmless while it is off.
Decision log: "How do other extensions plug their own triggers and actions into CRM Automations?"

```php
add_filter( 'unysonplus_crm_automation_triggers', function ( $t ) {
	$t['membership.joined'] = array(
		'label'  => __( 'Member joined', 'fw' ),
		'group'  => __( 'Membership', 'fw' ),
		'fields' => array( 'plan_id' => array( 'label' => __( 'Plan', 'fw' ), 'type' => 'select', 'options' => 'my_plans_callback' ) ),
		// 'match' => function ( $settings, $context ) { return …; }  // optional; default = every set field equals $context[ key ] (or is among the chosen values)
	);
	return $t;
} );
add_filter( 'unysonplus_crm_automation_actions', function ( $a ) {
	$a['membership.grant_plan'] = array(
		'label'    => __( 'Grant a plan', 'fw' ),
		'group'    => __( 'Membership', 'fw' ),
		'settings' => array( 'plan_id' => array( 'label' => __( 'Plan', 'fw' ), 'type' => 'select', 'options' => 'my_plans_callback', 'required' => true ) ),
		'callback' => function ( $contact_id, $settings, $context ) { return true; /* or WP_Error */ },
	);
	return $a;
} );
do_action( 'unysonplus_crm_automation_event', 'membership.joined', $contact_id, array( 'plan_id' => 3, 'dedupe' => 'joined:' . $membership_id ) );
```

- Slugs are namespaced `<extension>.<event>`; the CRM's own will be `crm.*`. `group` is the editor heading.
- `$contact_id` is a CRM contact id (find or link it first; 0 = ignored). `$context` is plain values only (it is stored
  with the run). `dedupe` (optional) stops the same event starting an automation twice.
- Action callbacks run from a background job with no current user: do not rely on `get_current_user_id()`. Return
  `true` or `WP_Error`; exceptions are caught and logged as a failed step.
- Expose dates (renewal, expiry) as a **managed date field** on the contact; the engine's generic "date reached"
  trigger then handles before / on / after reminders.

## Tables

Five, prefix `{$wpdb->prefix}fw_crm_`, created by `dbDelta` behind the
`fw_ext_crm_db_version` option (per-site prefix, so each multisite site has its own).

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

**Provider interface** — subclass `FW_CRM_Provider`, register on
`unysonplus_crm_providers`. Designed against Mailchimp / MailerLite / Brevo, which are
all email-keyed upserts, so `subscribe($subscriber, $args)` takes the whole subscriber and the
adapter owns idempotency. Return `true|WP_Error`, never a bare bool. `map_list_id()` translates our
list ID to the provider's audience/group ID — mapped, never guessed.

## Public hooks

| Hook | Type | Fires / does |
|---|---|---|
| `unysonplus_crm_subscriber_added` | action | A new row was created |
| `unysonplus_crm_subscriber_confirmed` | action | Double opt-in completed |
| `unysonplus_crm_subscriber_unsubscribed` | action | Opted out, from any path |
| `unysonplus_crm_subscriber_resubscribed` | action | A previously opted-out address came back |
| `unysonplus_crm_subscriber_opted_in` | action | An existing contact who never subscribed (status `none`) signed up; consent + timeline record it (1.0.40) |
| `unysonplus_crm_nav` | filter | The CRM app sidebar: group → { label, items: view → { label, icon, soon?, url? } } |
| `unysonplus_crm_render_view` | action | Render a view added through `unysonplus_crm_nav` (`$tab`) |
| `unysonplus_crm_subscriber_updated` | action | Fields changed (`$new, $old, $context`) |
| `unysonplus_crm_subscriber_imported` | action | Per CSV row |
| `unysonplus_crm_subscriber_deleted` | action | Hard delete |
| `unysonplus_crm_validate` | filter | Return `WP_Error` to veto a signup |
| `unysonplus_crm_subscriber_data` | filter | Rewrite the record just before write |
| `unysonplus_crm_field_map` | filter | Column ⇄ field mapping (CSV + ESP adapters) |
| `unysonplus_crm_providers` | filter | The provider registry |
| `unysonplus_crm_capability` | filter | Gate the admin screen + REST (default `manage_options`) |
| `unysonplus_crm_deal_created` / `_updated( $deal, $before, $changes )` | action | A deal was added / changed (1.0.52) |
| `unysonplus_crm_deal_stage_changed( $deal, $from, $to )` | action | A deal moved stage; `_won( $deal )` and `_lost( $deal, $reason )` fire on close |
| `unysonplus_crm_deal_trashed` / `_deleted` | action | A deal went to the Bin / was purged |
| `unysonplus_crm_handle_action` | filter | Handle a CRM admin form action (`$result, $action`) |
| `unysonplus_crm_modules` / `_module_groups` / `_setup_uses` | filter | Register a module / a Modules-screen group / a first-run starting point (1.0.67) |
| `unysonplus_crm_module_can_disable` / `unysonplus_crm_module_toggled` | filter / action | Refuse switching a module off / react to a switch |
| `unysonplus_crm_webhook` | action | `( $event, $data )` queue a webhook event (1.0.67) |
| `unysonplus_crm_webhook_events` / `_payload` / `_request_args` / `_allow_local` / `_log_days` | filter | Webhook events, payload, HTTP args, local addresses, log retention |
| `unysonplus_crm_webhook_delivered` | action | After each delivery attempt |

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
- **Double opt-in is ON by default.** The `double_optin` setting defaults to `yes`, and `Service::subscribe()` treats a site that never saved the setting as on (`setting_is_on( 'double_optin', true )`); a caller can still pass `double_optin => false` explicitly. Turn it off only deliberately.
- **Double opt-in is complete.** Signups land as `pending` and are emailed a tokened link. The link
  opens a page with a **button that POSTs** rather than confirming on the GET — mail scanners visit
  every URL in an inbound email and would otherwise opt people in; `confirm_on_visit` disables that
  guard. Confirm tokens are single-use and expire after 48h
  (`unysonplus_crm_confirm_token_ttl`); the **unsubscribe token never expires**, because
  it lives in the footer of every email ever sent. "Resend confirmation" (row action + single view)
  rotates the token, so a forwarded link dies, and refuses to target someone who unsubscribed.
- **Unsubscribe is RFC 8058 one-click.** Every email carries `List-Unsubscribe` and
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (Gmail/Yahoo require this of bulk senders), so
  a bare POST to the endpoint unsubscribes with no confirmation step — a mail client cannot send a
  nonce, which is why the token is the credential. A GET still shows a normal page with a button.
  `FW_CRM_Mail::unsubscribe_headers()` is public so the future campaign sender reuses it.
- **All mail goes through `wp_mail()`**, so the Mailer/SMTP extension governs transport and
  SPF/DKIM alignment. Templates are editable in Settings; placeholders are `{{name}}`,
  `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{site_name}}`, `{{site_url}}`, `{{confirm_url}}`,
  `{{unsubscribe_url}}` (extend via `unysonplus_crm_mail_placeholders`; the whole HTML
  shell is replaceable via `unysonplus_crm_mail_html`).
- **`FW_CRM_Mail` hooks the lifecycle actions** rather than being called from the service
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
- **Forms bridge:** a *Add to the CRM* action for the Forms extension (per-form atts `action_subscribe`, `action_subscribe_list` (list slug, `''` = default list), `action_subscribe_tags` (comma-separated), `action_subscribe_name` (the name field's label) — see `../shortcodes/contact-form.md`), gated strictly on a ticked Consent field with purpose `newsletter` — an email field alone never subscribes anyone. Double opt-in applies. **Tags given by name match admin-created tags:** `resolve_membership()` slugs every non-numeric list / tag value the same way the admin screen does (`sanitize_key( sanitize_title( $name ) )`, so `Stage: New lead` → `stage-new-lead`) and reuses the existing tag instead of creating a look-alike; a missing tag is created with the original text as its title (lists are auto-created only while `auto_create_lists` is on); and a *Form entries* activity panel on the subscriber screen (read by email; the CRM never writes entries).
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
- Bump `FW_CRM_Installer::DB_VERSION` whenever the schema changes, or existing sites
  never receive it.
