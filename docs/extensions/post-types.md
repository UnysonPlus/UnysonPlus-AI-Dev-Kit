# post-types extension

A no-code creator for **custom post types** and **taxonomies** from the WordPress admin (Unyson+ → Post Types). Each row is registered with plain WordPress `register_post_type()` / `register_taxonomy()` on `init`. **Active by default:** no — the extension ships **inactive**; activate it under Unyson+ → Extensions.

The screen has three tabs: **Post Types** (the two definition lists + a live overview), **Blueprints** (one-click content-type packs), and **Tools** (JSON export/import, PHP code export, key rename).

## Choosing an approach (AI: ask / recommend)

There are three ways to get a CPT/taxonomy into a UnysonPlus site. Follow this routing:

- **FASTEST → a Blueprint.** If the user wants one of the common content types (Testimonials, Team, Case Studies, FAQ, Services, Events, Properties, Jobs, Locations, Recipes, Downloads), install the blueprint — it creates the post type, its taxonomies, and a matching Custom Fields group in one action. Then adjust.
- **DEFAULT → the Post Types extension.** For anything else, prefer the no-code extension: admin-editable, survives theme changes, needs no PHP, and keeps the definitions in one UI.
- **HARDCODE in the child theme** when the user is a **developer**, wants the definition **in version control**, is shipping a **distributable theme**, or needs the type registered **on theme activation without any admin step**. Note that Tools → **Get PHP code** generates exactly this from an existing definition, so "start in the UI, graduate to code later" is a supported path.
- **ASK** only when it is genuinely ambiguous. Otherwise apply the routing above.

All paths call the same WordPress functions, so a type from any of them can be targeted by the **Custom Fields** extension and rendered by the **`[posts]`** element.

## Blueprints

Unyson+ → Post Types → **Blueprints** → **Install**. A blueprint adds a post type, the taxonomies that belong with it, and (when the Custom Fields extension is active) a matching field group. **Blueprints only ever ADD** — a key that already exists, registered by anything, is reported and left untouched. Re-installing is therefore safe and idempotent.

Shipped packs: `testimonials`, `team`, `case-studies`, `faq`, `services`, `events`, `properties`, `jobs`, `locations`, `recipes`, `downloads`. Their field groups use the Custom Fields types added in 0.1.15 — Events carries `datetime` start/end plus an `oembed` video, Recipes uses `list` fields for ingredients and steps, Services an `icon`, Locations and Properties a `map`, Testimonials a `slider` rating, and Team / Jobs a `relation-user` link.

Add your own with the **`fw_ext_post_types_blueprints`** filter (`slug => [ title, desc, icon, post_types[], taxonomies[], fields ]`); the rows use the same definition shape as the lists below.

## Create a CPT via the extension

Unyson+ → **Post Types** → in the **Post Types** list click **Add Post Type**. The popup is split into tabs; leaf option ids are flat (containers are layout only), so every id below is what lands in the saved row.

### General tab

| Option (id) | Type | Default | What it does |
|---|---|---|---|
| Enabled (`enabled`) | checkbox | on | Register this post type. **Turn this off instead of deleting the row** — a removed row stops registering, which makes its content invisible. A missing key means enabled (rows saved before 1.0.14). |
| Singular label (`singular`) | medium-text | — (falls back to a title-cased slug) | Singular name, e.g. "Book". |
| Plural label (`plural`) | medium-text | — (falls back to `singular + "s"`) | Plural name. Admin menu item + archive title. |
| Key / slug (`slug`) | medium-text | — | Post type key. `sanitize_key`, **max 20 chars**, `maxlength` enforced in the UI. Permanent — but see Tools → Rename key. |
| Description (`description`) | textarea | `''` | `description` — REST schema and some plugins. |
| Supports (`supports`) | checkboxes | `title`, `editor`, `thumbnail` on | `title`, `editor`, `thumbnail`, `excerpt`, `author`, `comments`, `revisions`, `page-attributes`, `custom-fields`. (None selected → `title`+`editor`.) |
| Page Builder (`page_builder`) | checkbox | off | Calls `add_post_type_support( $slug, 'fw-page-builder' )` directly. Equivalent to ticking the type on the Page Builder settings page — **do not do both**, support is additive. |
| Hierarchical (`hierarchical`) | checkbox | off | Page-like (parent/child) vs Post-like. |
| Menu icon (`menu_icon`) | multi-picker | Dashicon `dashicons-admin-post` | **Dashicon** (icon picker, Dashicons set), **Image** (upload → URL), **SVG** (raw markup → base64 data URI; script, `on*` handlers and `javascript:` URLs stripped), or **None**. |
| Menu position (`menu_position`) | short-text | blank | Numeric admin-menu order. Non-numeric is ignored and flagged. |

### Visibility tab

| Option (id) | Default | Maps to |
|---|---|---|
| Public (`public`) | on | `public` — the master switch; the next four derive their defaults from it. |
| Publicly queryable (`publicly_queryable`) | = `public` | `publicly_queryable` |
| Exclude from search (`exclude_from_search`) | = `! public` | `exclude_from_search` |
| Available in menus (`show_in_nav_menus`) | = `public` | `show_in_nav_menus` |
| Admin screens (`show_ui`) | on | `show_ui` |
| Admin menu item (`show_in_menu`) | on | `show_in_menu` |
| Admin bar (`show_in_admin_bar`) | on | `show_in_admin_bar` |
| Block editor / REST (`show_in_rest`) | on | `show_in_rest` |
| REST base (`rest_base`) | blank | `rest_base` — omitted when blank. |
| Exportable (`can_export`) | on | `can_export` |

### URLs tab

| Option (id) | Default | Maps to |
|---|---|---|
| URL slug (`rewrite_slug`) | blank → the key | `rewrite['slug']`. Lets key `book` live at `/books/`. Accepts `/` for a nested path. |
| Use permalink prefix (`with_front`) | on | `rewrite['with_front']`. **Turn off** on a site whose permalink structure has a prefix (`/blog/`), otherwise every item inherits it. |
| Has archive (`has_archive`) | on | `has_archive`. Flagged by the validator if the type is not public. |
| Archive slug (`archive_slug`) | blank | When set, `has_archive` becomes that string — a different archive path from the single-item path. |

### Taxonomies tab

| Option (id) | Default | Maps to |
|---|---|---|
| Built-in taxonomies (`builtin_taxonomies`) | none | `taxonomies` — attaches WordPress' own `category` / `post_tag`, sharing terms with posts. |

### Archive tab

Applied to the main post-type-archive query via `pre_get_posts` (front end only). All optional; blank inherits.

| Option (id) | Maps to |
|---|---|
| Items per page (`archive_per_page`) | `posts_per_page` |
| Order by (`archive_orderby`) | `orderby` — `title`, `menu_order`, `modified`, `comment_count`, `rand` |
| Direction (`archive_order`) | `order` — `ASC` / `DESC` |

### Labels tab

Optional overrides; blank keeps the auto-derived label. Stored as **flat prefixed ids**, `label_<wp label key>`: `label_menu_name`, `label_all_items`, `label_add_new_item`, `label_edit_item`, `label_view_item`, `label_search_items`, `label_not_found`, `label_archives`, `label_featured_image`, `label_set_featured_image`.

Fixed (not exposed): `query_var` is always `true`; the remaining labels are auto-built from singular/plural. Override anything via **`fw_ext_post_types_args`** (`$args, $slug, $def`).

## Create a taxonomy via the extension

Same page, the **Taxonomies** list → **Add Taxonomy**.

**General:** `tax_enabled` (checkbox, on), `tax_singular`, `tax_plural`, `tax_slug` (max 32), `object_types` (multi-select — **required**; a taxonomy attached to nothing is not registered), `tax_description`, `tax_hierarchical` (on = Category-like), `tax_default_term` (text → `default_term`, slug derived with `sanitize_title`).

**Editor:** `tax_meta_box` (select: `default` | `radio` | `none` → `meta_box_cb`; `radio` renders a **single-select** term box using core's `tax_input` field names, so saving needs no extra hook), `tax_show_admin_column`, `tax_show_in_quick_edit`, `tax_show_tagcloud`.

**Visibility & URLs:** `tax_public` (on; also sets `publicly_queryable`), `tax_show_in_nav_menus`, `tax_show_in_rest`, `tax_rest_base`, `tax_rewrite_slug`, `tax_with_front`, `tax_rewrite_hierarchical` (nested term URLs — only meaningful on a hierarchical taxonomy).

**Labels:** same pattern, prefix **`tax_label_`** — `menu_name`, `all_items`, `add_new_item`, `edit_item`, `new_item_name`, `parent_item`, `search_items`, `not_found`, `choose_from_most_used`.

Fixed: `show_ui` and `query_var` are always `true`. Override via **`fw_ext_post_types_taxonomy_args`** (`$args, $slug, $object_types, $def`).

## Validation (what the screen tells the user)

Validation runs **at save time** and never blocks the save — definitions are always stored as entered; the notices explain what will not register. Errors reported: empty key, unusable key, key over 20/32 chars, reserved key, duplicate key within a list, a post type and taxonomy sharing a key, a key already registered by another plugin, and a taxonomy with no post types. Warnings: a key adjusted by `sanitize_key`, a URL slug that collides with an existing page/post slug, `has_archive` on a non-public type, Page Builder ticked with the extension inactive, non-numeric menu position or items-per-page, nested term URLs on a flat taxonomy, and object types that do not exist.

## Safe deletion

Removing a row does **not** delete content — it stops registering the type, which makes existing posts/terms invisible (no admin menu, no edit screen, URLs stop resolving). The screen therefore:

- shows a live **overview table** per definition: status (Registered / Disabled / Not registered / No key), content count, and deep links to the type's list, "Add new", and Custom Fields;
- confirms before the `addable-popup` delete control fires (bound in the capture phase so it can cancel core's own handler);
- records every removal in the option **`fw_ext_post_types_removed`** with its content count, surfaced in a **Recently removed** panel with **Restore** / **Dismiss** (last 20 kept).

Prefer the **Enabled** checkbox for switching a type off.

## Tools

- **Export** — downloads `{ "_format": "unysonplus-post-types", "_version": 1, "post_types": [...], "taxonomies": [...] }`.
- **Import** — accepts that format, a bare `{post_types,taxonomies}` object, and a **CPT UI** export (the combined `cpt_custom_post_type` / `cpt_custom_tax` file, or a single section). CPT UI's `"true"`/`"false"` strings, `supports`/`taxonomies` arrays, `has_archive_string`, `rewrite_withfront`, `menu_icon` (Dashicon class or media URL) and `labels` are all mapped. Existing keys are never overwritten. Optional **Replace** mode discards current definitions first.
- **Get PHP code** — emits the equivalent `register_post_type()` / `register_taxonomy()` calls (tab-indented arrays, `labels` strings wrapped in `__()` against a chosen text domain), generated from the *same* arg builder the extension registers with, so it cannot drift.
- **Rename a post type key** — updates `wp_posts.post_type` for every existing item, rewrites the definition, and re-points any taxonomy attached to the old key. Refuses reserved keys, a key already registered elsewhere, and no-op renames. Term relationships and post meta key off the post ID, so they need no migration.

## Hardcode in the child theme (developer path)

This is plain WordPress — the extension is only a UI over these exact calls, and Tools → Get PHP code will write this for you from an existing definition. In the child theme `functions.php`, register on `init`:

```php
add_action( 'init', function () {
	register_post_type( 'book', array(
		'labels'       => array(
			'name'          => __( 'Books', 'your-theme' ),
			'singular_name' => __( 'Book', 'your-theme' ),
		),
		'public'       => true,
		'has_archive'  => true,
		'hierarchical' => false,
		'show_in_rest' => true, // block editor + REST
		'menu_icon'    => 'dashicons-book',
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
		'rewrite'      => array( 'slug' => 'books', 'with_front' => false ),
	) );

	register_taxonomy( 'genre', array( 'book' ), array(
		'labels'            => array(
			'name'          => __( 'Genres', 'your-theme' ),
			'singular_name' => __( 'Genre', 'your-theme' ),
		),
		'public'            => true,
		'hierarchical'      => true,       // Category-like
		'show_admin_column' => true,
		'show_in_rest'      => true,
	) );
}, 20 );
```

Notes:
- Flush rewrite rules once after adding/changing (e.g. visit **Settings → Permalinks**, or `flush_rewrite_rules()` on theme activation) so archives/permalinks resolve.
- A hardcoded type is a normal WP post type/taxonomy, so it too can be targeted by the **Custom Fields** extension and displayed with the **`[posts]`** element.

## Storage / notes / gotchas

- **Where it saves:** the two lists persist under option ids **`post_types`** and **`taxonomies`** in the extension settings store — WP option **`fw_ext_settings_options:post-types`**. Removal records live in **`fw_ext_post_types_removed`**.
- **Registration:** rows register on **`init`** priority 20, post types before taxonomies. A save that changed something sets `fw_ext_post_types_flush_rewrite` (non-autoloaded); the flush itself runs on **`wp_loaded`**, *not* inside the `init` callback — flushing mid-`init` regenerates `rewrite_rules` from whatever has registered so far and silently drops the rules of any plugin registering later.
- **Save hook:** **`fw_ext_post_types_saved`** (`$post_types, $taxonomies, $prev_post_types, $prev_taxonomies`) fires whenever the definitions are written — use it to invalidate anything keyed on the registered post-type set.
- **Archive query filter:** **`fw_ext_post_types_archive_query`** (`$vars, $post_type, $def, $query`).
- **Body classes:** `fw-cpt-archive` + `fw-cpt-archive-{key}` on a post-type archive, `fw-cpt-single` + `fw-cpt-single-{key}` on a single item.
- **Reserved-key blocklist:** reserved rows are skipped (never fatal) *and* reported by the validator. Reserved **post types**: `post, page, attachment, revision, nav_menu_item, custom_css, customize_changeset, oembed_cache, user_request, wp_block, wp_template, wp_template_part, wp_global_styles, wp_navigation, wp_font_family, wp_font_face, action, order, orderby, theme, author, type, date, name, fields, error, terms, title, content, status, tag, cat, fw-portfolio`. Reserved **taxonomies**: `category, post_tag, nav_menu, link_category, post_format, post_translations, term_translations, language, author, type, terms, fields, name, date, title, content, status`. An already-registered key is also skipped, so the extension never clobbers another plugin's type.
- **Submenu ordering:** this extension is the "anchor" that orders the Unyson+ submenu (Extensions → Post Types → Custom Fields → Shortcodes → Component Presets), enforced at `admin_menu` priority 999 and filterable via **`fw_unysonplus_admin_submenu_order`**.
- **Admin UI:** own `add_submenu_page` + `render_page`, saving via nonce + PRG redirect. The definitions tab renders through the standard Unyson **box → group** metabox-holder layout; the tabs are native `nav-tab-wrapper`; the Blueprints grid and Tools panels are bespoke UIs (Tools framed as hand-built postboxes).
- **Shared helper:** the "pick a post type" choice list comes from **`fw_upw_post_type_choices( [ 'public_only' => bool, 'extra' => [slug => label] ] )`** in `framework/includes/post-type-choices.php`, with the internal-type skip list in `fw_upw_internal_post_types()` (filterable). The Custom Fields extension uses the same helper.
- **Menu-icon Dashicons:** a `dashicons` set is added to the icon option type, parsed from WP's bundled `dashicons.min.css` and cached one week **keyed on the WordPress version**, so a core upgrade cannot serve a stale list. `resolve_menu_icon()` tolerates both the modern icon-engine array shape and a legacy `"dashicons dashicons-*"` string.
- **Class layout:** `class-fw-extension-post-types.php` is the orchestrator; the work is in `includes/` — `FW_Post_Types_Registrar` (definitions → WP objects, plus the public `build_post_type_args()` / `build_taxonomy_args()` the PHP export reuses), `FW_Post_Types_Schema`, `FW_Post_Types_Validator`, `FW_Post_Types_Blueprints`, `FW_Post_Types_Porter`, `FW_Post_Types_Admin_Page`, `FW_Post_Types_Dashicons`.
