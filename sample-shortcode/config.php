<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * config.php — how this element presents itself IN THE BUILDER.
 * REQUIRED. Nothing here affects the front end.
 *
 * Rules:
 *   · Define `$cfg`. Do NOT `return` — the file is included, not required
 *     as a value.
 *   · The icon is NOT set here. The builder auto-detects
 *     `static/img/page_builder.svg` and inlines it.
 */

$cfg = array();

$cfg['page_builder'] = array(

	// Label on the picker tile and the canvas card.
	'title' => __( 'Sample Shortcode', 'fw' ),

	// Tooltip under the tile in the element picker.
	'description' => __( 'Template element — copy this folder to start a new one', 'fw' ),

	/*
	 * Which picker tab the tile lives in. Use an EXISTING tab name — a new
	 * string silently creates a new tab, which reads as a bug.
	 *
	 *   'Layout Elements'   sections, columns, containers (section-like)
	 *   'Content Elements'  headings, text, buttons, lists
	 *   'Media'             images, video, galleries, sliders
	 *   'Components'        cards, tabs, accordions, pricing, testimonials
	 *   'Post Elements'     dynamic post/loop fields
	 *   'Site Elements'     logo, menu, search, widget areas
	 *   'WooCommerce'       shop elements
	 */
	'tab' => __( 'Content Elements', 'fw' ),

	/*
	 * Edit-modal width: 'small' | 'medium' | 'large'.
	 * Anything containing an addable-popup or an image-picker wants 'large'.
	 */
	'popup_size' => 'large',

	/*
	 * The canvas preview — an Underscore.js micro-template.
	 *
	 * ---------------------------------------------------------------------
	 * THE THREE DELIMITERS — GET THIS RIGHT
	 * ---------------------------------------------------------------------
	 *   {{ ...js... }}    EVALUATE — runs JavaScript, prints nothing
	 *   {{- expr }}       ESCAPE   — prints HTML-ESCAPED. Use for ALL user text.
	 *   {{= expr }}       RAW      — prints UNESCAPED. Only for markup you
	 *                               built yourself (inline SVG, an <img> tag).
	 *
	 * `{{= }}` is NOT escaped. It is Underscore's `interpolate`, the exact
	 * equivalent of `<%= %>`. Printing a user-typed value through it injects
	 * whatever they typed into the builder canvas — a title containing
	 * `<script>` executes in wp-admin.
	 *
	 * The rule is simple: **`{{- }}` for anything that came from the user,
	 * `{{= }}` only for markup you constructed.**
	 *
	 * ---------------------------------------------------------------------
	 * VARIABLES IN SCOPE
	 * ---------------------------------------------------------------------
	 *   o       the saved atts object
	 *   title   the element's configured title (from this config)
	 *
	 * Guard EVERY property access: atts are partially populated while the
	 * user is still typing, and this re-runs on each keystroke — so keep it
	 * cheap, and never assume a nested object exists.
	 *
	 * ---------------------------------------------------------------------
	 * FAILURE MODE
	 * ---------------------------------------------------------------------
	 * The whole template runs inside a try/catch. A JS error does NOT break
	 * the builder — the card silently falls back to the plain element title,
	 * and the exception goes to the browser console prefixed
	 * `$cfg["page_builder"]["title_template"]`. So a preview that "just shows
	 * the title" is usually a thrown error, not a template that did nothing.
	 * Open the console.
	 *
	 * ALWAYS render an explicit empty state. An element that draws nothing
	 * when unconfigured looks broken on the canvas.
	 */
	'title_template' => '
		{{ if ( o ) {
			var hasTitle = o["title"] && ( \'\' + o["title"] ).trim().length > 0;
		}}
			{{ if ( hasTitle ) { }}
				<h3><strong>{{- o["title"] }}</strong></h3>
			{{ } else { }}
				<em>Nothing configured yet</em>
			{{ } }}
		{{ } }}
	',

	/* ---------------------------------------------------------------------
	 * OPTIONAL KEYS — uncomment as needed.
	 * ------------------------------------------------------------------ */

	/*
	// Extra buttons in the edit-modal header (rare).
	'popup_header_elements' => array(),
	*/

	/*
	// A LIST preview — for elements whose content is an addable-popup of rows.
	// Note {{- }} on the user's heading, {{= }} on the number this template
	// computed itself.
	'title_template' => '
		{{ if ( o && o["items"] && o["items"].length ) { }}
			<h3><strong>{{- o["items"][0]["heading"] || "Untitled" }}</strong></h3>
			{{ if ( o["items"].length > 1 ) { }}
				<p>+ {{= o["items"].length - 1 }} more</p>
			{{ } }}
		{{ } else { }}
			<em>No items added yet</em>
		{{ } }}
	',
	*/
);


/* ============================================================================
 * REFERENCE — writing a RICH title_template
 *
 * A preview can render actual visuals, not just text: icons, thumbnails,
 * inline SVG, a truncated content excerpt. It is worth the effort on elements
 * whose canvas card is otherwise indistinguishable from its neighbours.
 *
 * All of it is commented out.
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * 1. USE A PROLOGUE BLOCK
 *
 * The first {{ }} can declare `var`s that every later block sees. Compute all
 * the conditions once, then keep the markup section clean and readable —
 * rather than repeating `o["x"] && o["x"].length` in five places.
 *
 *   {{ if ( o ) {
 *       var ic       = o["icon"] || {};
 *       var hasIcon  = ic["type"] === "svg" && ic["markup"];
 *       var hasTitle = o["title"] && (\'\' + o["title"]).trim().length > 0;
 *   }}
 *       ...markup...
 *   {{ } }}
 *
 * Note `o["icon"] || {}` — an att that has never been touched may be absent
 * entirely, and `undefined["type"]` throws. The `|| {}` is not paranoia.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * 2. QUOTE ESCAPING
 *
 * The template is a PHP SINGLE-QUOTED string, so inside the JavaScript:
 *   · a single quote must be written  \'
 *   · a literal backslash must be written  \\   (so a regex \s becomes \\s)
 *
 * Prefer double quotes in the JS to keep the escaping down. Where you cannot
 * — the empty-string idiom (\'\' + value) used to coerce to a string — the
 * escaping is unavoidable.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * 3. RENDERING AN ICON VALUE
 *
 * The `icon` option is a typed object, so branch on its `type`. Each branch
 * needs different markup:
 *
 *   {{ if ( ic["type"] === "svg" && ic["markup"] ) { }}
 *       <span style="display:inline-flex; align-items:center; line-height:1;">{{= svgMarkup }}</span>
 *   {{ } else if ( ic["type"] === "emoji" && ic["char"] ) { }}
 *       <span style="font-size:20px; line-height:1;">{{- ic["char"] }}</span>
 *   {{ } else if ( ic["type"] === "custom-upload" && ic["url"] ) { }}
 *       <img src="{{- ic["url"] }}" style="max-width:24px; max-height:24px;">
 *   {{ } else if ( ic["type"] === "icon-font" && ic["icon-class"] ) { }}
 *       <i class="{{- ic["icon-class"] }}" style="font-size:20px;"></i>
 *   {{ } }}
 *
 * `{{= }}` on svgMarkup because it is markup; `{{- }}` on everything else
 * because those are values.
 *
 * THE SIZING GOTCHA: a viewBox-only <svg> has no intrinsic size and collapses
 * to 0x0 in the preview, because the FRONT-END CSS that sizes it is not
 * loaded in wp-admin. Inject dimensions before printing it:
 *
 *   var svgMarkup = (\'\' + ic["markup"])
 *       .replace(/width="[^"]*"/i,  \'width="22"\')
 *       .replace(/height="[^"]*"/i, \'height="22"\');
 *
 * …and for a raw pasted <svg> that may have no width attribute at all:
 *
 *   var m = /<svg[^>]* width=/i.test( raw )
 *       ? raw
 *       : raw.replace(/<svg\\b/i, \'<svg width="20" height="20"\');
 *
 * The space before `width` in that test matters — without it the pattern also
 * matches `stroke-width`.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * 4. PREVIEWING RICH-TEXT CONTENT
 *
 * A wp-editor att is HTML. Dumping it into the card breaks the canvas layout.
 * Strip tags, collapse whitespace, truncate:
 *
 *   var contentText = "";
 *   if ( o["content"] ) {
 *       contentText = (\'\' + o["content"])
 *           .replace(/<[^>]+>/g, " ")
 *           .replace(/&nbsp;/g, " ")
 *           .replace(/\\s+/g, " ")
 *           .trim();
 *   }
 *   if ( contentText.length > 100 ) {
 *       contentText = contentText.slice(0, 100) + "…";
 *   }
 *
 * Then print it with {{- contentText }}.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * 5. STYLE INLINE, ALWAYS
 *
 * The element's own stylesheet is NOT loaded in wp-admin, so a class name
 * does nothing here. Every visual in a preview needs inline styles:
 *
 *   <div style="margin-top:.5rem; display:flex; flex-direction:column;
 *               align-items:flex-start; gap:6px;">
 *
 * Keep previews small and constrained (max-width/max-height on media,
 * overflow:hidden) — the canvas card is not the front end, and a full-size
 * image in it makes the builder unusable.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * 6. THE EMPTY STATE IS PART OF THE TEMPLATE
 *
 * Compute one combined flag and use it, rather than nesting else-branches:
 *
 *   {{ if ( !hasIcon && !hasTitle && !hasContent ) { }}
 *       <em>No content set</em>
 *   {{ } }}
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * 7. DEBUGGING
 *
 * A thrown error is caught and swallowed: the card falls back to the plain
 * element title and the exception is logged to the browser console, prefixed
 * `$cfg["page_builder"]["title_template"]`. So "my preview shows only the
 * title" almost always means an exception, not an empty condition — open the
 * console before rereading the template.
 *
 * The usual causes, in order: reading a property of an att that does not
 * exist yet (fix with `|| {}` / `|| ""`), and a mangled quote from the PHP
 * single-quoted string (fix the `\'` escaping).
 * ------------------------------------------------------------------------- */
