<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# ai-assistant extension (Beta)

Registers UnysonPlus **abilities** with the WordPress Abilities API so an AI model — an MCP agent,
the (planned) builder panel, or anything calling the REST abilities endpoints — can read the site and
build / edit page-builder pages through **validated, undoable** actions. **Active by default:** no
(ships inactive). Requires WordPress **6.9+** (on older WP it loads but registers nothing) and the
`shortcodes` + `page-builder` extensions. Version: 1.0.6. Human manual:
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
