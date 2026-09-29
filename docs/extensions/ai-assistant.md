<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# ai-assistant extension (Beta)

Registers UnysonPlus **abilities** with the WordPress Abilities API so an AI model — an MCP agent,
the (planned) builder panel, or anything calling the REST abilities endpoints — can read the site and
build / edit page-builder pages through **validated, undoable** actions. **Active by default:** no
(ships inactive). Requires WordPress **6.9+** (on older WP it loads but registers nothing) and the
`shortcodes` + `page-builder` extensions. Version: 1.0.31. Human manual:
[AI Assistant](https://unysonplus.github.io/docs/extensions/ai-assistant/).

## Provides

- **Ability categories:** `unysonplus-site` (read), `unysonplus-build` (write), `unysonplus-undo`.
- **Abilities** (all `meta.public`, so REST `wp-abilities/v1` and MCP can list/run them; permissions
  are the CURRENT user's capabilities):

| Ability | Input | Notes |
|---|---|---|
| `unysonplus/site-info` | — | Start here: site, theme, active extensions, builder post types, ≤100 pages |
| `unysonplus/list-elements` | `category?` | Layout types + every builder element (tag, title, category) |
| `unysonplus/describe-element` | `element`, `include_effects?` | Flattened leaf options: id, type, tab, label, choices, default. Effect atts hidden by default |
| `unysonplus/get-page` | `post_id`, `detail?` (`outline`/`full`) | Outline gives every item a `path` (`0.2.1`) + unique_id + text label |
| `unysonplus/list-presets` | `type?` | `theme_colors`, `button_colors`, `button_sizes`, `border_presets`, `section_style_presets`, `typography_presets` |
| `unysonplus/search-content` | `query`, `limit?` | Published, non-password content only — visitor-safe |
| `unysonplus/get-content` | `post_id` or `url` | Plain text ≤20k chars of one published item — visitor-safe |
| `unysonplus/create-page` | `title`, `status?`=draft, `post_type?`, `slug?`, `items?` | New builder page |
| `unysonplus/insert-items` | `post_id`, `items`, `parent_path?`, `position?`, `convert_classic?` | Root or inside a layout item |
| `unysonplus/update-element` | `post_id`, `path`, `atts?`, `width?`, `replace?` | Merge atts; `null` resets one to default |
| `unysonplus/move-element` | `post_id`, `path`, `to_parent?`, `position` | Position counted after removal |
| `unysonplus/remove-element` | `post_id`, `path` | `destructive` annotation |
| `unysonplus/describe-theme-settings` | `id?`, `search?` | Index of every Theme Settings leaf by section (breadcrumb of tab/box titles), or one id's schema (inner options one level deep) + current value |
| `unysonplus/update-theme-settings` | `values{id:value}`, `merge?`=true | Validated vs `fw()->theme->get_settings_options()`; objects merged (lists replaced); snapshot → `upw_ai_settings_revisions` |
| `unysonplus/save-preset` | `type`, `name`, `values` | Upsert one row by name (`name|color_name|preset_name|title|label`) in a preset list; new row = copy of the first row, `id` continues the list's numbering, `slug` = sanitize_title(name) |
| `unysonplus/list-settings-revisions` / `undo-theme-settings` | `revision_id?` | Newest 20; undo snapshots current first |
| `unysonplus/list-templates` | `kind?`, `search?` | `lib:<slug>` (fw_tpl_lib_installer_items: bundled/installed/available) + `saved:<full|section|column>:<md5>` (options `fw:bt:{f,s,c}:page-builder:*`) |
| `unysonplus/apply-template` | `post_id`, `template_id`, `parent_path?`, `position?`, `replace?` | Placement-only check (template atts trusted), fresh unique_ids, sandbox-aware (in the panel's tool set); installs an `available` library template first (admin) and reads it straight from the install dir (fw_tpl_lib_registered_templates caches per request) |
| `unysonplus/convert-url` | `url`, `confirm`, `dry_run` | `fw_ext('site-converter')->run_url_conversion()`; renders via capture service `/capture?single=1&html=1` when `/health` answers (filter `fw_ai_assistant_capture_service_url`, default localhost:8787); refuses without `confirm` unless `dry_run`; `manage_options` + `switch_themes` |
| `unysonplus/render-check` | `post_id` | Renders the (sandboxed) tree element by element → `{ok, summary, stats, headings, issues[{severity,path,element,message}]}` |
| `unysonplus/list-revisions` | `post_id` | Newest 20 kept |
| `unysonplus/undo` | `post_id`, `revision_id?` | Snapshots current first, so undo is undoable |

A path may also be `id:<unique_id>`.

- **MCP server** (`includes/class-fw-ai-mcp.php`): `POST /wp-json/unysonplus-ai/v1/mcp`, Streamable HTTP
  with plain JSON responses (no SSE; `GET` answers 405), stateless. Methods: `initialize`, `ping`,
  `tools/list`, `tools/call` (+ empty `resources/list` / `prompts/list`); notifications get `202` with an
  empty body. Tools = the abilities with the `unysonplus/` prefix dropped and `-` → `_`
  (`create_page`, `insert_items`, …) and MCP `annotations` hints from the ability annotations. A
  `WP_Error` becomes `isError: true` with the validation list appended.
- **Access mode** option `upw_ai_mcp_mode`: `off` (default — route returns 403) | `read` (only
  `readonly`-annotated tools listed/callable) | `write`. Auth = WP REST auth (Application Password as
  HTTP Basic); the tool runs as that user, `edit_posts` required to connect.
- **Admin screen** *Unyson+ → AI Assistant* (`fw-ai-assistant`, `manage_options`): status, access mode,
  "Connect an agent" (creates an Application Password named `UnysonPlus AI Assistant — <label>` and
  shows URL / user / password / Basic header / `mcpServers` JSON ONCE, never stored), connection list
  with revoke, abilities table.

## Notes / gotchas

- **Validation is against the LIVE option schema** (`FW_Shortcode::get_options()` incl. the
  `fw_shortcode_get_options` filter that injects Animation Engine effects). Unknown att ids, out-of-range
  select/radio/switch values and scalars where the default is an object are rejected with a message the
  model can act on; nothing is written. (It caught `text_block` being fed `content` — the att is `text`.)
- **Placement rules:** page root = `section` / `flexbox` / `container`; a `section` holds only
  `column`/`row`; a `column` sits in a `section`/`row`; elements (`type:"simple"`) never at the root.
- **Storage** follows `building-pages.md` → "How the storage works" (delete-first, write both flat keys
  and the `fw_options` aggregate, `$wpdb` row update, no render in the write request). Empty `atts` are
  re-encoded as `{}`.
- **Revisions** are `_upw_ai_revision` post-meta rows (`time`, `user`, `ability`, `note`, `active`,
  `json`, `content`). Restoring a revision taken before a classic page was converted puts the classic
  content back and turns the builder off.
- **Classic content guard:** inserting into a page with non-builder `post_content` fails with
  `upw_ai_classic_content` until retried with `convert_classic: true`.
- **Post lock:** results carry a `warning` when someone has the page open — a save there overwrites AI
  changes.
- **REST / Application Passwords:** external agents authenticate with an Application Password, which
  WordPress only enables over **HTTPS** or when `WP_ENVIRONMENT_TYPE` is `local`. The extension also
  enables them on a plain-HTTP loopback / `*.local` / `*.test` / `*.localhost` host (filter
  `fw_ai_assistant_allow_local_app_passwords`). Cookie + `X-WP-Nonce` works for in-admin callers.
- **Builder panel** (`includes/class-fw-ai-panel.php`, `static/js/panel.js`): enqueued on `post.php` /
  `post-new.php` for builder post types (script in the HEAD — it binds `fw:option-type:builder:init`
  before the builder fires it) and on the Live Page Editor shell (when `fw-live-editor` is enqueued).
  `POST unysonplus-ai/v1/panel/run {post_id, tree, message, history}` runs the tools against
  `FW_AI_Store::sandbox()` of the POSTED tree (nothing written to the DB, no revisions — sandbox
  writes go to `take_log()`), returns `{status, reply, changed, tree, steps}`. The browser applies
  it: builder = `rootItems.reset(tree)` + one `rootItems.trigger('builder:change')` (= one native
  undo step); Live Editor = `recordHistory()` → `model` → `rebuildIndex()` → `markDirty()` →
  `refreshNavigator()` → `renderPageToCanvas()`. Stale guard: not applied if the host tree changed
  since the request. The panel's own Undo compares against the host's post-apply JSON (the builder
  normalises items on load, so it never equals the returned tree byte-for-byte).
- **Panel backends** (`upw_ai_panel_backend` auto|wp|local|off): `wp` = `wp_ai_client_prompt()` loop
  (`using_abilities` + `WP_AI_Client_Ability_Function_Resolver`, ≤16 rounds) — needs a Connectors
  key; `local` = dev hosts only: `upw_ai_local_agent_cmd` template (`{mcp_config}`, `{prompt_file}`)
  spawned in the background (`start /B cmd /S /C` on Windows); a temp dir under `get_temp_dir()`
  holds the MCP config (temporary Application Password + `X-UPW-AI-Session` header) and prompt; the
  panel polls `GET panel/status?session=`, which reads `done.txt` / `out.txt`, then deletes the
  password + files. MCP requests carrying a valid session header are allowed regardless of the MCP
  mode, sandbox the session's tree (persisted in the `upw_ai_ps_<id>` transient) and only see the
  panel's tool set.
- **Chat AI channel** (`includes/class-fw-ai-visitor.php`, `static/js/visitor.js`): via Chat's
  `fw_ext_chat_*` hooks — adds settings `chat_ai_enable|label|greeting|instructions|exclude|daily_cap`
  to the Chat Button tab, an `{ key:'ai', action:'ai' }` channel (first), and a window opened on
  `upw-chat:action`. `POST unysonplus-ai/v1/visitor/ask {message, history, nonce}` (public; nonce
  `upw_ai_visitor`, `fw_rate_limit_exceeded('upw_ai_visitor',10,300)`, daily cap transient
  `upw_ai_vc_<Ymd>`). **No tools for visitors:** `retrieve()` scores published, non-password pages by
  per-keyword WP search (title hit ×2, top 4, minus exclusions, front page as fallback; plain text
  cached per `post_modified`), the system prompt wraps them in `<site-content>` as data. Model markers:
  `[HANDOFF]` → widget offers the other link channels with the question pre-filled (wa `?text=`,
  mailto/sms `body=`); `[SOURCES: title; …]` → cited links (matched against the pages given).
  Backends: AI Client (`generate_text`) or, dev hosts only, `FW_AI_Local` with an EMPTY MCP config
  + `GET visitor/status?session=` polling.
- **`FW_AI_Local`** (`includes/class-fw-ai-local.php`): shared runner for the panel + visitor local
  backend; `spawn()` sweeps run folders and `(temporary)` panel passwords older than 30 minutes.
- **Theme Settings writes do NOT fire `fw_settings_form_saved`** (its identity-sync / Google-Fonts
  listeners re-run storage_save and have corrupted settings from code — the Site Converter avoids it
  too). `FW_AI_Settings::saved()` calls `unysonplus_hf_regenerate_css()` directly, plus
  `_action_theme_process_google_fonts()` when a `*typograph*|*font*` setting changed, then fires
  `fw_ai_assistant_settings_saved( $old, $new )`.
- **A child theme can override Theme Settings** (a converted child theme's style.css hard-codes the
  source fonts/colours): acceptance run on a converted site stored Fraunces / Nunito Sans and the
  generated CSS had them, but the child theme's Playfair Display still won. `site_info` returns a
  `child_theme_note`; render-check (markup only) cannot see it.
- **Site-wide assistant** (1.0.6): `admin_bar_menu` node `upw-ai-assistant` + the panel script in
  host `site` on every non-builder admin screen; `POST unysonplus-ai/v1/site/run {message, history}` with
  EVERY `unysonplus/*` ability, no sandbox (pages as drafts, settings live). Steps come from a
  `wp_after_execute_ability` listener (`FW_AI_Panel::record_activity`, non-readonly unysonplus abilities,
  with an edit link when the result has `post_id`). Local backend: session `mode: 'site'` → the MCP
  handler skips the sandbox and exposes all tools.
- **Extension toolkit** (`includes/class-fw-ai-toolkit.php`): extensions hook
  `fw_ai_assistant_register_abilities` and call `fw_ai_register_ability( $slug, { label, description,
  input, required, permission, execute, readonly, destructive, idempotent, panel } )` → `unysonplus/<slug>`
  with schema, MCP meta and hints. `permission` as a STRING is always a capability (checked per post
  when input.post_id is set) — never treated as a function name (`'edit_post'` is also WP's
  `edit_post()`, which dies). `fw_ai_snapshot( { options, post_meta: {id: keys}, created_posts,
  trashed_posts }, $ability, $note )` → id for `undo-change` (created posts are trashed on undo,
  trashed ones untrashed). `'panel' => true` adds the ability to the builder panel's tool set
  (`FW_AI_Panel::page_tools()`). First users: `seo/includes/ai-abilities.php`,
  `theme-builder/includes/ai-abilities.php`.
- **Manual-edit guard** (1.0.6): `FW_AI_Settings::hand_edited_keys()` compares each key's stored value
  with the fingerprint (md5 of wp_json_encode) of its last automated writer — the AI's
  `upw_ai_settings_fingerprint` or the converter's `fw_sc_settings_fingerprint`; a mismatch = hand edit
  → skipped (`skipped[]`) unless `force`. The AI never writes the converter's fingerprints, so a
  re-conversion treats AI changes as hand edits. Granularity is the top-level settings id.
- **Deep validation** (1.0.6): `FW_AI_Schema::check_deep()` recurses into `inner-options` /
  `popup-options` / `box-options` (addable-popup rows must use exactly the inner keys — e.g. accordion
  `tabs[]` = `tab_title`, `tab_content`, `is_open`), choice types reject objects, and a scalar-default
  option rejects objects. `describe-element` returns `inner_options` + `shape`. A Theme Settings write
  whose CSS regeneration throws is rolled back.
- **Extension abilities (1.0.7)** — each in `<ext>/includes/ai-abilities.php`, required from the
  extension's `_init()`, registered on `fw_ai_assistant_register_abilities`: **megamenu** (`menus-list`,
  `menus-create`, `menus-add-items`, `menus-assign`, `menus-remove-item`, `megamenu-set-item` — writes the
  `mega-menu` meta + `fw_ext_mega_menu_set_db_item_option` directly, since the admin save handler only runs
  on the Menus form POST), **snippets** (`snippets-list`, `snippets-create`; the validator accepts
  `{type:'global_section', atts:{snippet_id}}` and `[snippet]` at the root), **portfolio** (`portfolio-list`,
  `portfolio-describe`, `portfolio-save-project`; fields from `_filter_admin_add_post_options()`, featured /
  hidden meta re-synced), **post-types** (via `save_definitions()`, defaults from the private blueprint
  builders by reflection), **custom-fields** (group validated against `get_page_options()`; values via
  `fw_set_db_post_option`), **forms** (`forms-add` normalises items via the form-builder item classes like
  the starters; no entries ability). Toolkit spec keys: options, post_meta, created_posts, trashed_posts,
  created_menus, post_fields, post_terms. Undo untrashes with `wp_untrash_post_set_previous_status` (WP 5.6+
  untrashes to draft) and `FW_Cache::clear()`s.
- **More extension abilities** — **woocommerce** 1.0.71 (`woo-settings` / `woo-settings-update` validate
  against the settings page options and snapshot option `fw_ext_settings_options:woocommerce`;
  `woo-list-products` / `woo-save-product` use the WC CRUD for SIMPLE products only — SKU uniqueness,
  sale < regular, ribbon meta `_upwc_ribbon`, size guide `_upwc_size_guide`; after undo the
  `fw_ext_woocommerce_ai_after_restore` hook re-saves the product so WC lookup tables / `_price` resync;
  orders and customers are out of reach), **animation-engine** 1.3.90 (`animation-effects`,
  `animation-apply`, `animation-site-modules`; fields = `upw_anim_field_defs()` ∩ the element's
  multi-picker leaves from `FW_AI_Schema::leaves(tag)`; the saved value is `{<picker>: effect, <effect>:
  {settings}}` and the field's off value (usually `none`) removes it; site modules are Theme Settings ids
  switched with `update-theme-settings`), **animated-icons** 1.0.6 (`animated-icons-describe`: enabled
  types from `animated_lottie|rive|svg|raster`, icon value `{type:'lottie'|'rive', src, trigger, speed}`,
  uploaded files from `fw_icon_lottie_dir()` / `fw_icon_rive_dir()`).
- **AI Changes (1.0.18)** — `includes/class-fw-ai-changes.php`, submenu `fw-ai-changes` (edit_pages). `collect()` merges
  page snapshots (`_upw_ai_revision` post meta, newest first per page), `FW_AI_Settings::OPTION_REVISIONS` and
  `FW_AI_Toolkit::OPTION_REVISIONS`; undo records are detected by ability (`unysonplus/undo`, `undo-theme-settings`,
  `undo-change`) and matched to their target through the note ("Before restoring revision N" / "Before undoing change
  N") to show "Undid: …" and mark the target `undone` (unless the undo itself was reversed). Actions POST to the same
  page (nonce `upw_ai_change`) → `FW_AI_Store::restore()` / `FW_AI_Settings::undo()` / `FW_AI_Toolkit::restore()`,
  then PRG with `upw_ai_msg`. Page rows need edit_post, others manage_options.
- **OAuth 2.1 for MCP (1.0.19)** — `includes/class-fw-ai-oauth.php` (`FW_AI_OAuth`). Discovery: `/.well-known/oauth-protected-resource`,
  `/.well-known/oauth-authorization-server`, `/.well-known/openid-configuration` answered in `parse_request` (priority 0,
  home-path aware) + REST copies `unysonplus-ai/v1/oauth/{protected-resource,authorization-server}`; issuer = `home_url()`.
  DCR `POST oauth/register` (public clients only, redirect https or http loopback; option `upw_ai_oauth_clients`, cap 200,
  unused ones pruned). Consent = hidden admin page `admin.php?page=fw-ai-authorize` (edit_posts; parent `fw-ai-hidden`),
  nonce `upw_ai_oauth_consent`, Allow/Deny, access write|read; an admin's Allow turns `upw_ai_mcp_mode` on when Off.
  Codes = transients `upw_ai_oac_<sha256>` (10 min, single use, deleted before checks). `POST oauth/token`
  (authorization_code + PKCE S256 only; refresh_token with rotation), `POST oauth/revoke` (RFC 7009). Tokens stored hashed
  in option `upw_ai_oauth_tokens` (access 1h `upwat_`, refresh 30d `upwrt_`). Bearer is resolved in
  `determine_current_user` (priority 30) ONLY when the URI contains the `unysonplus-ai/v1` namespace.
  `FW_AI_OAuth::read_only()` narrows `FW_AI_MCP::abilities()` + instructions. `FW_AI_MCP::permission()` now returns the
  401 BEFORE the mode-off 403 (so a client can start sign-in), and `rest_post_dispatch` adds
  `WWW-Authenticate: Bearer resource_metadata=…` to the MCP 401. Settings: "Apps signed in with your account" +
  action `revoke_app`. Gotcha: Playwright's `page.route` does not see a redirect target, so an E2E needs a real listener
  on the redirect port (`pw-screens/oauth-e2e.mjs`).
- **Visual check (1.0.21)** — `includes/class-fw-ai-visual.php` (`FW_AI_Visual`), ability `unysonplus/visual-check` (read,
  edit_posts; in `BROWSER_SITE_TOOLS`). Calls the capture service `POST /verify` with `lens: 'both'` (service 1.11.78+:
  `bands` = verifyUrls, `sections` = verifySections, `both` = `{ok, lens, bands, sections}`) at
  `FW_AI_Build::capture_service_url()`; `summarize()` keeps overall drift, heights, the 3 worst strips and up to 12
  sections with findings (8 each, trimmed) + a `how_to_read` string. Drafts: `view_url()` issues a one-post token
  (transient `upw_ai_pv_<sha256>`, 15 min) → `?page_id=N&upw_ai_view=…`; `posts_results` flips that one post to publish on
  the main query, noindex + nocache, no admin bar; no/wrong token = 404. Server cannot reach the service (live site) →
  returns `{ok:false, reason:'service_unreachable', verify_request:{path, body}}`; panel.js `runTool` then POSTs that to the
  kit from the browser and calls the tool again with `measured` (summarize only). The kit's Claude agent path (1.0.30 /
  capture service 1.11.84): `runAssistantAgent` adds a second MCP server `kit` = the service's own `POST /mcp-kit`
  (tool `measure_pages`, runs verifyUrls + verifySections locally and trims to what `summarize()` reads); allowedTools
  `mcp__unysonplus__*,mcp__kit__*`; the unreachable message tells the agent to use it and re-call with `measured`.
  Verified: visual_check → kit measure_pages → visual_check, with the site unable to reach the kit.
  Also: `FW_AI_Panel::clip()` replaces `wp_html_excerpt()` for replies / history / context — the latter collapsed line
  breaks, so every list in a local-AI or agent reply rendered as one paragraph.
- **Find and replace (1.0.22)** — `includes/class-fw-ai-replace.php` (`FW_AI_Replace::run`), ability `unysonplus/replace-text`
  (in `BROWSER_SITE_TOOLS`). Scope: builder JSON of every show_ui post type (+ `nav_menu_item` titles for
  edit_theme_options; WP `revision` posts are never read), post_title / post_excerpt, Theme Settings leaves. Key rules:
  `TECH_GROUP` skips whole sub-arrays (icon/image/css/font/typography/colour/border/spacing …) and `TECH_KEY` skips single
  string values (ids, classes, sizes, align, preset …) — keep them split: a group key like `copyright_columns` holds the
  footer text, and one broad regex over group keys hid it. `LINK_KEY` + URL-looking values need `include_links`; JSON
  strings skipped; HTML split on tags so only text nodes change; the esc_html'd form of `find` is matched too. Preview =
  no `apply` → rows (≤60) + `plan` (transient `upw_ai_rp_<token>`, 30 min, user-bound, deleted on apply) holding the
  options + expected count per place; apply re-scans and skips a place whose count moved. Writes: `FW_AI_Store::save_tree`
  per page, one `FW_AI_Toolkit::snapshot` post_fields for titles/excerpts, `FW_AI_Settings::update(..., merge false)`
  (honours hand-edited fingerprints). `identity_note()` flags blogname / tagline. Panel: `record_activity()` ignores
  results with `preview` or `ok:false`; `md()` now renders pipe tables, `*em*`, ordered lists, `#` headings.
- **Image help (1.0.23)** — `includes/class-fw-ai-media.php` (`FW_AI_Media::register` on `fw_ai_assistant_register_abilities`):
  list-media / view-media / update-media / set-featured-image. view-media returns `_images: [{mime,data}]`;
  `FW_AI_MCP::call()` moves them into MCP `image` content (not text / structuredContent). Encoded ONLY while
  `FW_AI_MCP::is_calling()` — the WP AI Client resolver would serialize base64 into the model's text. Temp file via
  `get_temp_dir()` (wp_tempnam() is admin-only and fatals in REST). Undo via `FW_AI_Toolkit::snapshot` (post_fields +
  `_wp_attachment_image_alt` / `_thumbnail_id` post_meta). `used_on` = builder JSON LIKE `"attachment_id":"<id>"` +
  `_thumbnail_id`. Builder image value = `{attachment_id, url, alt}`.
- **Translate (1.0.24)** — `includes/class-fw-ai-translate.php`: get-page-text keys = `t:title|t:excerpt|t:content` and
  `b:<node path>|<att key path>`; `is_text()` rejects single lowercase tokens, CSS lengths, links, JSON. translate-page
  inserts a draft (all meta except `SKIP_META`, terms except Polylang's), sets texts with `set_in_tree()`, saves via
  `FW_AI_Store::save_tree`, snapshots `created_posts` (undo = trash). Polylang: `pll_set_post_language` +
  `pll_save_post_translations`. Kit (capture service 1.11.80): `runAssistantAgent` now runs `claude -p` with
  `cwd` = its temp dir — a cwd inside `d:\Web Dev` loaded the workspace CLAUDE.md and its developer rules leaked into
  replies ("No project folder files were edited").
- **Sketch → page (1.0.25)** — panel.js: attach button / paste / drop → `POST cfg.mediaUrl` (wp/v2/media, X-WP-Nonce;
  only when the user can upload_files) → message gets "[The person attached an image: Media Library id N … view_media
  size large]". view-media `size: large` = 1568px. `FW_AI_Schema::normalize_icon()` (called from `validate_atts` for
  option type `icon`, whose default is null so the generic shape check never fired): "leaf" / "lucide/leaf" → svg
  library object (`sc_icon_svg_library_markup()` decides existence), font classes → icon-font, 1–2 chars → char, else an
  error with an example; update-element now saves the validator's normalized values. Kit: `POST /local-ai/agent` with
  `async: true` + `request_id` → 202 `{job}`; `GET /local-ai/agent?job=` → running / done (+reply) / error (jobs kept
  30 min); panel `waitAgent()` polls every 2.5 s, tolerates 8 missed polls, 25 min cap. Held-open requests were dropped
  on multi-minute builds and Chrome retried the POST → the agent ran twice (two pages) and the panel reported
  "No AI model is connected".
- **Brand kit (1.0.26)** — ability extract-colors in `FW_AI_Media`: GD `imagecreatefromstring` → 120px wide sample, alpha
  > 90 skipped, 5-bit channel buckets, groups merged when |ΔR|+|ΔG|+|ΔB| < 60; SVG = hex colours counted in the code.
  Returns hex, share_pct, kind (colour / grey / white / black) and WCAG contrast vs white and black. The workflow is
  instructions only (MCP + site panel): view → measure → palette + fonts → show → apply with update_theme_settings /
  save_preset after agreement. Gotcha seen in testing: a converted child theme's style.css can hard-code fonts that beat
  Theme Settings typography. When undoing several settings revisions, undo them BY ID (newest first) — "undo the newest"
  in a loop undoes your own previous undo, since every undo is itself a revision.
- **More ideas (1.0.27)** — panel.js `showStarters()` adds a `.upw-aip__starter--more` button (data-label short,
  data-prompt = l10n `moreIdeasPrompt`); `send( text, image, label )` shows the label. `md()` turns lines starting with
  "→ " into `.upw-aip__starter.upw-aip__idea` buttons (data-prompt = the line) — the existing starter click handler sends them.
- **Access + usage (1.0.28)** — `includes/class-fw-ai-access.php`: `can_use()` (manage_options always; else
  `upw_ai_roles` empty or intersecting the user's roles). `rest_request_before_callbacks` gates every
  `unysonplus-ai/v1/*` route except `oauth/*` (403 `upw_ai_role`) and logs panel/run, site/run, panel/local/start
  (message now sent by the local-model path too) and MCP tools/call WITHOUT an X-UPW-AI-Session header. Log = option
  `upw_ai_usage_log` (500), switch `upw_ai_usage_on`; screen `fw-ai-usage`. Enqueue + admin bar + OAuth
  `check_request()` also call `can_use()`. Settings form action `save_access`; Reset deletes both options.
- **Visitor extras (1.0.29)** — `FW_AI_Visitor`: Chat Button options `chat_ai_hours`, `chat_ai_log`, `chat_ai_price_in`,
  `chat_ai_price_out`. `parse_hours()` (day ranges incl. wrap, HH:MM or am/pm) + `team_available()` (site timezone; null =
  no hours) → system-prompt line + `hours` note on hand-off replies (visitor.js shows it above the channels). `shape()`
  now takes `$meta { message, in_chars }` (ask_local keeps it in the session) and calls `record()`: monthly stats option
  `upw_ai_visitor_stats` (n, in/out tokens ≈ chars/4, handoff; 13 months) and, when the log is on, `upw_ai_visitor_log`
  (30 days / 1000; visitor = hmac of ip|ua|date, 8 chars). `render_usage()` is appended to the AI Usage screen;
  `privacy_text()` adds the policy paragraph on admin_init while the log is on.
- **Settings screen (1.0.16), newcomer first** — `views/page.php`: a status box (`data-backend`; `ready` /
  `checking` / `none` / `off`; for `browser` the page calls `window.upwAiAssistant.findLocal()` from panel.js,
  whose `open()` opens the panel), "Connect an AI" (kit steps + provider key; a `<details>` open unless
  ready), "Where the assistant appears" (its own `save_panel` form with only `panel_position`), and
  everything else under "Advanced" (model choice, "Outside AI programs" = MCP mode + connection
  passwords, abilities, Reset). `save_panel` now updates ONLY posted fields (a form without a field no
  longer resets it). Action `reset`: deletes backend / browser url / browser model / position / local cmd
  options, MCP mode `off`, `clear_chats` deletes user meta `upw_ai_chats`; connection passwords and site
  changes untouched. `get_connections()` hides `(temporary)` passwords and runs `FW_AI_Local::sweep()`.
- **Subscription agent through the kit (1.0.13)** — `findLocal()` reads the kit's `/health` first: `aiBackend ===
  'claude-code'` → `local.claude`, and `runBrowser` skips the JSON-action loop: `panel/local/start` with
  `agent: true` (+ message, history) → `start_browser_agent()` issues a temporary Application Password (name
  "… via the AI Dev Kit (temporary)", so `FW_AI_Local::sweep()` catches leftovers) and returns `{ session, mcp:
  { url, headers }, prompt }` (prompt = `agent_prompt()`, shared with the local agent command; normal tool
  sets, no small-model limits); the kit's `POST /local-ai/agent` → `runAssistantAgent()` writes a temp MCP
  config and runs `claude -p --strict-mcp-config --allowedTools "mcp__unysonplus__*" --output-format json`;
  `panel/local/finish` deletes the password. `cfg.backendLabel` gives the "Connected: …" line for wp /
  local backends. Measured: a draft page on testsite in 36 s.
- **Place awareness + saved chats (1.0.12)** — `FW_AI_Context::for_screen( WP_Screen )` / `for_post( id )` →
  `{ key, label, facts[], suggestions[] }`; `text()` is sent as `context` on every run route (and
  `panel/local/start`) and appended to the instructions via `FW_AI_Panel::$place` (`take_place()`), together
  with the builder's typed `title` (so a new page is never "Auto Draft"). Ideas are RULES over real facts
  (tagline default, pages without an SEO description via `fw_ext_seo_ai_page` cached 10 min, pages in no
  menu, products without a description) — localized as `cfg.ideas` (NOT `suggestions`: that key is the
  queued-jobs list from `FW_AI_Suggestions`, shown first). `FW_AI_History`: user meta `upw_ai_chats`
  `{ post:<id> | screen:<id> => { updated, messages[] } }`, 30 messages / 30 days / 60 places;
  `POST panel/history` appends a finished turn, `panel/history/clear`; `cfg.history.saved` restores on load
  (no Undo button on restored replies). `update-site-identity` (blogname / blogdescription / site_icon,
  toolkit snapshot → `undo-change`); its activity links to options-general, and its result key is `updated`
  (a `changed` key would be read as a Theme Settings change by `record_activity`).
- **Browser backend — free local AI (1.0.9)** — `backend()` returns `browser` when chosen (or as Automatic's
  last resort). The server CANNOT reach the editor's localhost, so panel.js runs the loop: probe
  `upw_ai_browser_url` (default `http://localhost:8787`) — kit `GET /local-ai` (`{up, selected, pulled}`),
  else the local runner's `GET /api/tags` — then `POST panel/local/start` (session `kind: 'browser'`, own `tools` list:
  `BROWSER_PAGE_TOOLS` / `BROWSER_SITE_TOOLS`; FW_AI_MCP::abilities() honours a session `tools` list), MCP
  `tools/list` + `tools/call` with cookie auth (X-WP-Nonce) + `X-UPW-AI-Session`, model turns via kit
  `POST /local-ai/tool-chat` (or the local runner's `/api/chat`), then `POST panel/local/finish` → the usual
  `{check, tree, steps}` (partial changes survive an error). NO native tool calls: each turn is ONE JSON
  action `{tool, arguments}` | `{reply}` constrained by the runner's `format` (tool enum from tools/list), tool
  results go back as a user message — an 8B local model's native tool calls were silently dropped by the runner's
  parser whenever a long nested argument had one stray token (it appended `"parent_path"` inside
  `items`); `tidyArgs()` strips non-object entries from `items` / `_items`. What made an 8B model succeed: the
  instructions carry `browser_recipes()` — FAQ / feature cards / CTA / text sections that pass render_check
  as written (emoji icons `{type:'emoji', char}`), the `/no_think` soft switch for hybrid-reasoning models, `num_predict` 3072, and JS nudges
  (empty reply → "call the next tool"; a write since the last render_check → "finish, then render_check";
  check issues → "fix them"; max 3). Without recipes the 8B model explored schemas, invented atts and passed
  path "/". render_check's empty-icon test now counts `char`.
- **Panel position (1.0.8)** — option `upw_ai_panel_position` (`bottom-right` default | `bottom-left` |
  `beside-sidebar`), passed to panel.js as `cfg.position` → class `.upw-aip--<pos>`. Bottom-left measures
  `#adminmenuwrap` (fixed-position, so test its rect, not `offsetParent`) and re-places on `wp-collapse-menu`;
  beside-sidebar anchors left of `#postbox-container-1` in the backend builder only. The input needs a
  two-class selector: the admin skin's `body.upa textarea` (white) beats a single class. `esc()` must also
  escape quotes — it feeds attribute values.
- **Site-build order in the instructions** — the site-wide assistant and MCP `instructions` follow this
  kit's protocol (colours → typography → container width → presets → header / footer + menus → pages →
  ship check) in condensed form, since sites don't have the kit.
- Abilities carry `meta.mcp.public = true`, so the WordPress MCP adapter plugin exposes them too.
- **render-check** (`includes/class-fw-ai-check.php`): each `simple` item is rendered alone via
  `json_to_shortcodes` + `do_shortcode` inside a bare flexbox wrapper (ob-buffered, Throwable caught).
  Errors: throws / PHP message / raw `[shortcode]` text / no markup at all inside the wrapper / `<img>`
  without src or pointing at a missing uploads file. Warnings: "main visual" empty (an icon/upload/
  svg-code option whose first word is part of the tag — `icon_box.icon`, `image_box.image`,
  `lottie.lottie_file`; filter `fw_ai_assistant_visual_atts`), a Content-tab text default that
  actually appears in the render ("Submit"), `href` `#`/empty, an empty layout item with no styling
  (background/border/height/css/class leaves all empty), >1 h1, skipped heading level. Issues deduped.
  Text-only markup (a styled dot) counts as decoration, not "nothing". The panel runs it after every
  changed reply (`check` in the response); panel + MCP instructions tell the model to run it and fix.
  Acceptance: the Phase-2 failure (icon_box without icons) now ends with icons set + a clean check.
- Class files: `includes/class-fw-ai-schema.php` (catalog + validator), `class-fw-ai-store.php`
  (tree I/O, revisions, paths, outline), `class-fw-ai-abilities.php` (registration + callbacks).
- Hook: `do_action( 'fw_ai_assistant_tree_saved', $post_id, $tree )` after every AI write.

## How another extension offers the user a job (`fw_ai_suggest`)

```php
fw_ai_suggest( array(
    'id'     => 'site_converter_finish',
    'title'  => 'Finish the conversion — 3 things to review',
    'prompt' => '…the findings, pre-filled…',
    'source' => 'site-converter',
) );
```

The suggestion appears as a starter chip at the top of the assistant's panel, and the launcher shows a
count badge. Three decisions in that shape are load-bearing:

**The queue lives in `framework/includes/ai-suggestions.php`, not in this extension.** An extension's code
is not loaded while it is inactive, and this assistant ships inactive — so a helper defined here would be
missing in exactly the case it exists for: a conversion finishing while nothing is listening. Callers
therefore do **not** guard on the assistant being present, and should not; guarding is what loses the
suggestion in the one case that matters. A user who clicks "Enable the AI Assistant" and lands on an empty
panel has done what was asked and got nothing, which is worse than never having been offered.

**An extension can queue a job; it can never make the assistant speak.** A panel that talks first is a
popup, which is the pattern this avoids. A chip in a panel the user opened is an offer.

**`title` and `prompt` are separate fields.** A generic starter uses its own label as the message; a
suggestion's label is short and its prompt is long, so the chip carries `data-prompt` and the click handler
prefers it.

### The launcher: motion announces, the badge informs

The badge is the signal that lasts; the pulse (`upw-aip-attn`, a soft accent ring, three times, ~2.5s) only
points at it, and fires **once per suggestion id**, tracked in user meta. Perpetual motion stops being
information within seconds and becomes a nag on a page left open all day, while a count is still legible an
hour later and survives the user looking away while it played. Under `prefers-reduced-motion` the pulse is
dropped and nothing is lost, because the badge was carrying the information anyway — and the count is in
the accessible name too, since a badge nobody can see is not a notification.

Measured: motion + unseen → pulses; motion + seen → no pulse, badge remains; reduced motion → no pulse,
badge remains.

> **Note on assets:** `panel.min.js` and `panel.min.css` are referenced nowhere — `enqueue_admin()` loads
> the unminified files. Edit `panel.js` / `panel.css`; the `.min` pair is dead weight.
- **One screen, three tabs (1.0.31)** — `FW_Extension_AI_Assistant::current_tab()` / `tab_url()` / `header_html()`: the
  `fw-ai-assistant` page (capability `edit_pages`) renders Settings (views/page.php), Changes (`FW_AI_Changes::render()`)
  or Usage (`FW_AI_Access::render()`); non-admins are forced to Changes. `_handle_post()` routes POSTs by tab. The old
  slugs `fw-ai-changes` / `fw-ai-usage` are hidden pages (parent `fw-ai-hidden`) that redirect with their query args.
