<?php if ( ! defined( 'ABSPATH' ) ) { die( 'Direct access forbidden.' ); }
/**
 * Sample Child Theme — functions.php
 *
 * The parent theme (unysonplus-theme) already enqueues this child's style.css as
 * the `child-style` handle and orders it dead last in the cascade, so your CSS
 * overrides always win. The guarded fallback below only fires under an OLDER
 * parent that doesn't enqueue `child-style` itself — so the child stylesheet is
 * never loaded twice and never missing.
 *
 * Add your own child-theme PHP (extra enqueues, hooks, template functions) below.
 */

add_action( 'wp_enqueue_scripts', function () {
	if ( wp_style_is( 'child-style', 'enqueued' ) || wp_style_is( 'child-style', 'registered' ) ) {
		return; // Parent theme already handled it (and ordered it last).
	}
	wp_enqueue_style(
		'child-style',
		get_stylesheet_uri(),
		array( 'parent-style' ),
		wp_get_theme()->get( 'Version' ),
		'all'
	);
}, 20 );


/* ============================================================================
 * REFERENCE — commented out. Nothing below runs. Uncomment what you need.
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * WEB FONTS — enqueue the brand fonts (then point Theme Settings → Typography at
 * them, or use them in style.css). Self-host for production; a Google Fonts URL
 * is fine for a demo.
 *
 *   add_action( 'wp_enqueue_scripts', function () {
 *       wp_enqueue_style(
 *           'mybrand-fonts',
 *           'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Nunito:wght@400;600&display=swap',
 *           array(), null
 *       );
 *   }, 5 );
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * BESPOKE SHORTCODES / OPTION TYPES / EXTENSIONS THAT SHIP WITH THIS THEME.
 *
 * NO registration call is needed — the framework's loaders scan the child theme's
 * framework-customizations tree automatically whenever this theme is active:
 *
 *   Shortcode (page-builder element):
 *     <child>/framework-customizations/extensions/shortcodes/shortcodes/<name>/
 *         config.php · options.php · views/view.php · static/{css,js,img/page_builder.svg}
 *     Folder name = the tag (`-` → `_`). A same-named CORE tag wins, so don't
 *     shadow a bundled one. Start from the kit's sample-shortcode/ template.
 *     Guard plugin-only helpers (sc_color_field_compact, …) with function_exists.
 *
 *   Option type:
 *     <child>/framework-customizations/includes/option-types/<name>/
 *
 *   Theme options / extension customizations mirror the same framework-customizations
 *   layout. See the kit's extending.md.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * TEMPLATE OVERRIDES.
 *
 * A child theme can override any parent template by placing a same-named file at
 * the same relative path (header.php, footer.php, single.php, …). Prefer the
 * Header/Footer Builder and Theme Settings first — only drop to PHP templates for
 * structure the builders can't express.
 * ------------------------------------------------------------------------- */
