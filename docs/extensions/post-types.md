# post-types extension

A no-code creator for **custom post types** and **taxonomies** from the WordPress admin (Unyson+ → Post Types). Each row is registered with plain WordPress `register_post_type()` / `register_taxonomy()` on `init`. **Active by default:** no — the extension ships **inactive**; activate it under Unyson+ → Extensions.

## Choosing an approach (AI: ask / recommend)

There are two ways to create a CPT/taxonomy in a UnysonPlus site. Follow this routing:

- **DEFAULT → the Post Types extension.** For most users, prefer the no-code extension: it is admin-editable, survives theme changes, needs no PHP, and keeps the definitions in one UI. Recommend this unless a reason below applies.
- **HARDCODE in the child theme** when the user is a **developer**, wants the definition **in version control**, is shipping a **distributable / redistributable theme**, or needs the type registered **on theme activation without any admin step**. A hardcoded `register_post_type()` also gives full access to every WP arg (the extension exposes a curated subset).
- **ASK** only when it is genuinely ambiguous (e.g. "add a Books post type" with no signal about audience or delivery). Otherwise apply the default.

Both paths call the same WordPress functions — the extension is just a UI over them — so a type from either can be targeted by the **Custom Fields** extension and rendered by the **`[posts]`** element.

## Create a CPT via the extension

Unyson+ → **Post Types** → in the **Post Types** list click **Add Post Type**, fill the popup, **Save Changes**. Each row (`addable-popup`, sortable) has these options:

| Option (id) | Type | Default | What it does |
|---|---|---|---|
| Singular label (`singular`) | medium-text | — (falls back to a title-cased slug) | Singular name, e.g. "Book". Drives "Add New Book", "Edit Book", … |
| Plural label (`plural`) | medium-text | — (falls back to `singular + "s"`) | Plural name, e.g. "Books". Admin menu item + archive title. |
| Key / slug (`slug`) | medium-text | — | Post type key. `sanitize_key`, **max 20 chars**. Permanent — changing it orphans content. |
| Supports (`supports`) | checkboxes | `title`, `editor`, `thumbnail` on | Editor panels: `title`, `editor`, `thumbnail`, `excerpt`, `author`, `comments`, `revisions`, `page-attributes`, `custom-fields`. (If none selected → `title`+`editor`.) |
| Public (`public`) | checkbox | on | `public` — front-end visible + queryable. |
| Has archive (`has_archive`) | checkbox | on | `has_archive` — enables the post type archive page. |
| Hierarchical (`hierarchical`) | checkbox | off | `hierarchical` — Page-like (parent/child) vs Post-like. |
| Block editor / REST (`show_in_rest`) | checkbox | on | `show_in_rest` — Gutenberg + REST API. |
| Menu icon (`menu_icon`) | multi-picker | Dashicon `dashicons-admin-post` | Icon source: **Dashicon** (icon picker, Dashicons set), **Image** (PNG/JPG upload → URL), **SVG** (raw markup → base64 data URI), or **None**. |
| Menu position (`menu_position`) | short-text | blank (WP default) | Optional numeric admin-menu order, e.g. `25`. |

Fixed (not exposed): `show_ui` and `show_in_menu` are always `true`; `rewrite` slug = the key; full `labels` are auto-built from singular/plural. Override anything via the **`fw_ext_post_types_args`** filter (`$args, $slug, $def`).

## Create a taxonomy via the extension

Same page, the **Taxonomies** list → **Add Taxonomy**. Row options:

| Option (id) | Type | Default | What it does |
|---|---|---|---|
| Singular label (`tax_singular`) | medium-text | — (falls back to title-cased slug) | e.g. "Genre". |
| Plural label (`tax_plural`) | medium-text | — (falls back to `singular + "s"`) | e.g. "Genres". |
| Key / slug (`tax_slug`) | medium-text | — | Taxonomy key. `sanitize_key`, **max 32 chars**. Permanent once terms are assigned. |
| Attach to post types (`object_types`) | multi-select | — | Which post type key(s) the taxonomy binds to (shareable across several). Choices = registered post types + saved-but-not-yet-registered definitions. New CPTs appear here after one Save. |
| Hierarchical (`tax_hierarchical`) | checkbox | on | `hierarchical` — Category-like (parent/child) vs Tag-like. |
| Admin column (`tax_show_admin_column`) | checkbox | on | `show_admin_column` — column on the post list screen. |
| Block editor / REST (`tax_show_in_rest`) | checkbox | on | `show_in_rest`. |

Fixed: `public`, `show_ui`, `query_var` always `true`; `rewrite` slug = the key; labels auto-built. Override via **`fw_ext_post_types_taxonomy_args`** (`$args, $slug, $object_types, $def`).

## Hardcode in the child theme (developer path)

This is plain WordPress — the extension is only a UI over these exact calls. In the child theme `functions.php`, register on `init`:

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
		'rewrite'      => array( 'slug' => 'book' ),
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
} );
```

Notes:
- Flush rewrite rules once after adding/changing (e.g. visit **Settings → Permalinks**, or `flush_rewrite_rules()` on theme activation) so archives/permalinks resolve.
- A hardcoded type is a normal WP post type/taxonomy, so it too can be targeted by the **Custom Fields** extension and displayed with the **`[posts]`** element.

## Storage / notes / gotchas

- **Where it saves:** the two lists persist under option ids **`post_types`** and **`taxonomies`** in the extension settings store — WP option **`fw_ext_settings_options:post-types`**.
- **Registration:** all saved rows register on the **`init`** action (priority 20), post types before taxonomies. A save sets a deferred flag (`fw_ext_post_types_flush_rewrite`) so rewrite rules flush on the **next** request (once the new objects are registered first).
- **Reserved-key blocklist:** rows whose key matches a reserved key are silently skipped (never fatal). Reserved **post types**: `post, page, attachment, revision, nav_menu_item, custom_css, customize_changeset, oembed_cache, user_request, wp_block, wp_template, wp_template_part, wp_global_styles, wp_navigation, action, order, theme, fw-portfolio`. Reserved **taxonomies**: `category, post_tag, nav_menu, link_category, post_format, post_translations, term_translations, language, author`. A key that already exists (`post_type_exists()` / `taxonomy_exists()`) is also skipped, so the extension never clobbers another plugin's type.
- **Submenu ordering:** this extension is the "anchor" that orders the Unyson+ submenu (Extensions → Post Types → Custom Fields → Shortcodes → Component Presets), enforced at `admin_menu` priority 999 and filterable via **`fw_unysonplus_admin_submenu_order`**.
- **Bespoke admin UI:** the page registers its own `add_submenu_page` + `render_page` and saves via a nonce + PRG redirect — but it still renders through the standard Unyson **box → group** metabox-holder layout (one border-less group in a single box), not a hand-rolled postbox.
- **Menu-icon Dashicons:** the extension adds a `dashicons` set to the icon option type (parsed from WP's bundled `dashicons.min.css`, cached one week) so the Dashicon picker shows admin-menu-appropriate glyphs. `resolve_menu_icon()` tolerates both the modern icon-engine array shape and a legacy `"dashicons dashicons-*"` string.
