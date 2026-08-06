<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * static.php — front-end asset enqueues + render helpers. OPTIONAL, but
 * present on almost every element.
 *
 * WHEN IT RUNS: only on pages where this shortcode actually renders. The
 * framework loads it per-instance, so you never need an is_page() guard and
 * you never enqueue globally. An element that is not on the page costs the
 * visitor nothing.
 *
 * WHAT BELONGS HERE: wp_enqueue_style / wp_enqueue_script, plus PHP render
 * helpers the view needs. Helpers go here rather than in view.php because
 * view.php is included once PER INSTANCE — a bare `function` there fatals on
 * the second instance. They are still wrapped in `! function_exists()`,
 * because static.php is only guaranteed to run once per REQUEST.
 *
 * WHAT DOES NOT BELONG HERE: echoing markup, and <link>/<script> tags to
 * third-party CDNs. A ported element must add no external request — see
 * HOW-TO.md.
 */

$ext = fw_ext( 'shortcodes' );

/*
 * URI resolution: ALWAYS via get_declared_URI(). It resolves through the
 * theme/child-theme override chain, so a site can drop a replacement asset at
 * the same relative path and have it win. A hand-built plugins_url() bypasses
 * that and breaks overrides.
 *
 * Version: the extension's manifest version, so a plugin update busts the
 * browser cache. Never hardcode a version string.
 */
$uri     = $ext->get_declared_URI( '/shortcodes/sample-shortcode' );
$version = $ext->manifest->get_version();

wp_enqueue_style(
	'fw-shortcode-sample-shortcode',
	$uri . '/static/css/styles.css',
	array(),          // dependency handles, e.g. array('fw-ext-builder-frontend-grid')
	$version
);

wp_enqueue_script(
	'fw-shortcode-sample-shortcode',
	$uri . '/static/js/scripts.js',
	array(),          // no jQuery unless you genuinely need it
	$version,
	true              // in the footer
);


/* ----------------------------------------------------------------------------
 * HELPER — unit-input value → CSS length string.
 *
 * A unit-input stores array('value' => '600', 'unit' => 'px') — two halves
 * that are useless until joined. Any element exposing dimensions needs this.
 *
 * Returns the fallback for an empty/garbage value so the caller can defer to
 * a stylesheet default rather than emitting `width:px`.
 * ------------------------------------------------------------------------- */
if ( ! function_exists( 'sc_sample_unit_to_css' ) ) {
	function sc_sample_unit_to_css( $value, $fallback = '' ) {
		if ( ! is_array( $value ) ) {
			// Tolerate a legacy plain-string save ('600px'): if the option was
			// ever a plain text field before becoming a unit-input, old rows
			// still hold a string. Cheap to accept, expensive to debug.
			$value = trim( (string) $value );
			return $value !== '' ? $value : $fallback;
		}

		$num  = isset( $value['value'] ) ? trim( (string) $value['value'] ) : '';
		$unit = isset( $value['unit'] ) ? trim( (string) $value['unit'] ) : 'px';

		if ( $num === '' || ! is_numeric( $num ) ) {
			return $fallback;
		}

		return $num . $unit;
	}
}


/* ----------------------------------------------------------------------------
 * HELPER — a link, with the two REQUIRED link conventions baked in.
 *
 * 1. DESCRIPTIVE LINK TEXT. A bare "Read more" / "Click here" / "Learn more"
 *    fails both the SEO link-text audit and screen-reader navigation — ten
 *    identical "Read more" links tell a visitor nothing. The fix is a
 *    VISUALLY-HIDDEN span INSIDE the anchor carrying the item's title. It
 *    lands in textContent (so crawlers and the accessibility tree read
 *    "Read more about <title>") while sighted users still see "Read more".
 *
 *    Use the hidden span, NOT aria-label: an aria-label satisfies screen
 *    readers but the SEO audit reads crawlable text and still fails. The
 *    hidden span satisfies both and becomes the accessible name — which is
 *    why no aria-label is set here. (Icon-only links with no visible text are
 *    the one case that still needs aria-label.)
 *
 * 2. EXTERNAL LINKS OPEN IN A NEW TAB. Detected by comparing the URL's host
 *    to the site host — never hardcoded per call site, so the behaviour is
 *    automatic. Internal and relative links stay in the same tab.
 *    rel="noopener noreferrer" always rides along with target="_blank".
 *
 * Also: it is a real <a>. A <button> that navigates looks right and is wrong
 * — it cannot be opened in a new tab and reports the wrong role to
 * assistive tech.
 * ------------------------------------------------------------------------- */
if ( ! function_exists( 'sc_sample_link_html' ) ) {
	function sc_sample_link_html( $label, $url, $context = '', $class = '' ) {
		$label = trim( (string) $label );
		$url   = trim( (string) $url );

		// No label or no destination = no link. An empty CTA is worse than none.
		if ( $label === '' || $url === '' ) {
			return '';
		}

		$attrs = '';
		$host  = wp_parse_url( $url, PHP_URL_HOST );
		if ( $host && strcasecmp( $host, (string) wp_parse_url( home_url(), PHP_URL_HOST ) ) !== 0 ) {
			$attrs = ' target="_blank" rel="noopener noreferrer"';
		}

		$context = trim( wp_strip_all_tags( (string) $context ) );
		$sr      = '';
		if ( $context !== '' ) {
			$sr = '<span class="sample-shortcode__sr"> '
				/* translators: %s: the title of the linked item. */
				. esc_html( sprintf( __( 'about %s', 'fw' ), $context ) )
				. '</span>';
		}

		return sprintf(
			'<a class="%s" href="%s"%s>%s%s</a>',
			esc_attr( trim( 'sample-shortcode__link ' . $class ) ),
			esc_url( $url ),
			$attrs,
			esc_html( $label ),
			$sr
		);
	}
}


/* ============================================================================
 * REFERENCE BLOCK — commented out. Uncomment what you need.
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * VENDOR LIBRARY, SHARED ACROSS ELEMENTS
 *
 * Reuse a library another element already vendors instead of adding a second
 * copy — enqueue it by the SAME handle and it loads once. (Splide is vendored
 * under the carousel element and reused by testimonials exactly this way.)
 *
 *   wp_enqueue_script(
 *       'splide',
 *       $ext->get_declared_URI( '/shortcodes/carousel/static/vendor/splide.min.js' ),
 *       array(), '4.1.4', true
 *   );
 *   // …then depend on it:
 *   wp_enqueue_script( 'fw-shortcode-sample-shortcode', …, array( 'splide' ), $version, true );
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * PER-INSTANCE ENQUEUE (when assets depend on the SAVED OPTIONS)
 *
 * This file does NOT receive $atts — it runs once for the element type. When
 * the assets to load depend on what the user picked (a design variant, an
 * optional add-on), hook the per-instance action, which does receive them:
 *
 *   add_action( 'fw_ext_shortcodes_enqueue_static:sample_shortcode', function ( $data ) {
 *       $atts = shortcode_parse_atts( $data['atts_string'] );
 *       if ( ! is_array( $atts ) ) { return; }
 *
 *       $post_id = ( isset( $data['post']->ID ) ) ? $data['post']->ID : 0;
 *       $atts    = fw_ext_shortcodes_decode_attr( $atts, 'sample_shortcode', $post_id );
 *       if ( is_wp_error( $atts ) || ! is_array( $atts ) ) { return; }
 *
 *       // e.g. enqueue only the chosen design's CSS/JS:
 *       $design = fw_sc_design_resolve( 'sample_shortcode', $atts, 'default' );
 *       fw_sc_design_enqueue( 'sample_shortcode', $design );
 *   } );
 *
 * Wrap the whole thing in `if ( ! function_exists( … ) )` / a named function so
 * the handler is registered once.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * SAFE INLINE HTML in a textarea field
 *
 * When authors need light formatting (bold / italic / link / break) but a full
 * wp-editor would let them wreck the design, allow an explicit subset instead
 * of esc_html(). Bare newlines become <br>.
 *
 *   function sc_sample_rich_text( $content ) {
 *       $allowed = array(
 *           'strong' => array(), 'b' => array(),
 *           'em'     => array(), 'i' => array(),
 *           'br'     => array(),
 *           'a'      => array( 'href' => true, 'title' => true, 'target' => true, 'rel' => true ),
 *       );
 *       return nl2br( wp_kses( (string) $content, $allowed ), false );
 *   }
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * STRUCTURED DATA (JSON-LD)
 *
 * If the element renders something schema.org describes (reviews, events,
 * FAQs, products), emit JSON-LD — but put it behind an opt-in switch, and say
 * in the help text that it must only be used on genuine data and once per
 * page. Emit it from view.php, after the markup. Reference: the testimonials
 * element's `reviews_schema` option.
 * ------------------------------------------------------------------------- */
