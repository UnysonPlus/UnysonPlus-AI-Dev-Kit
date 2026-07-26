<?php
/**
 * upw-build-pages.php — compose UnysonPlus page-builder pages programmatically (via `wp eval-file`).
 *
 * A small helper library for building ANY UnysonPlus page — a full site page, a demo, or a quick
 * test page — as a page-builder tree, with Animation Engine effects that actually render, and with
 * the page left EDITABLE in the visual builder. You describe sections/columns/elements as a PHP
 * array and call upw_build_page(); it stores the value the way the builder itself does.
 *
 * ── Why a helper (the non-obvious storage detail) ───────────────────────────────────────────────
 * The builder value is a JSON tree kept in post meta `fw:opt:ext:pb:page-builder:json` (with a
 * `..:builder_active` flag). Two traps when writing it by hand:
 *   1. fw_set_db_post_option($id,'page-builder',...) runs the option's input-sanitizer, which — given
 *      a hand-built value — can empty the whole tree. Don't use it; write the meta keys directly.
 *   2. fw_get_db_post_option() reads the `..:json` meta key, NOT the aggregate `fw_options` meta. If
 *      you only write one of them they disagree. upw_build_page() writes both + the active flag.
 * Do those two things and Animation-Engine attributes (scroll_keyframes, gsap_motion, scroll_reveal,
 * parallax, hover, text_effect, …) survive intact — they ARE registered on every shortcode's builder
 * options, so the tree keeps them. Verified: the page renders the effect AND opens cleanly in the
 * visual builder. (The front end re-renders builder content from this value on each request, so the
 * effect's baker + JS/CSS enqueue fire normally.)
 *
 * ── Usage (a page spec is ~15 lines) ────────────────────────────────────────────────────────────
 *   <?php
 *   require __DIR__ . '/upw-build-pages.php';   // spec beside this lib; else an absolute path to your kit clone
 *   $page = array(
 *     upw_section(array( upw_column('1_2', array(
 *       upw_element('special_heading', array('title'=>'Welcome','heading'=>'h1','alignment'=>'left',
 *         'scroll_keyframes'=> upw_skf(array('y'=>60,'opacity'=>0), null, array())) ),
 *       upw_element('text_block', array('content'=>'<p>Intro copy.</p>')),
 *     )), upw_column('1_2', array(
 *       upw_element('image', array()),  // fill via Media Library / attachment id
 *     ))),
 *   );
 *   echo upw_build_page('about', 'About Us', $page);   // slug (created if missing) or numeric ID
 *
 * RUN:  wp --path=/path/to/your/wordpress eval-file spec.php
 * MIRROR: run the same spec against each install that needs the page.
 */

if ( ! function_exists( 'upw_element' ) ) :

/** A leaf element. $shortcode e.g. 'special_heading','text_block','button','image','counter','icon_box'. */
function upw_element( $shortcode, $atts = array() ) {
	if ( ! isset( $atts['unique_id'] ) ) {
		$atts['unique_id'] = substr( md5( $shortcode . wp_json_encode( $atts ) . mt_rand() ), 0, 13 );
	}
	return array( 'type' => 'simple', 'shortcode' => $shortcode, '_items' => array(), 'atts' => $atts );
}

/** A column. $width: '1_1','1_2','1_3','2_3','1_4','3_4','1_5','5_6', etc. $atts optional (inner_class…). */
function upw_column( $width, $items, $atts = array() ) {
	return array( 'type' => 'column', 'width' => $width, '_items' => $items, 'atts' => $atts );
}

/** A section wrapping one or more columns. $atts = section options (background, padding, bg_effect…). */
function upw_section( $columns, $atts = array() ) {
	return array( 'type' => 'section', '_items' => $columns, 'atts' => $atts );
}

/** A tall empty spacer section (vh) — gives scroll-driven effects room to travel. */
function upw_spacer( $vh = 60 ) {
	return upw_section( array( upw_column( '1_1', array(
		upw_element( 'code_block', array( 'code' => '<div style="height:' . intval( $vh ) . 'vh"></div>', 'render_as_code' => 'no' ) ),
	) ) ) );
}

/**
 * Build a `scroll_keyframes` att value (Animation Engine — Scroll Keyframes).
 * Each of $start/$mid.v/$end is a SPARSE array of any of:
 *   x, y, scale, rotation, rotationX, rotationY, opacity, blur   (unset = default: move/rot 0, scale 1, opacity 1, blur 0)
 * $mid = null, or array('at'=>0-100,'ease'=>…,'v'=>array(…state…)). Easing: linear|out|in|inout|back|sine.
 * Progress auto-derives from a Scroll Story scene slice (if the element is inside one) else viewport travel.
 */
function upw_skf( $start, $mid = null, $end = array(), $end_ease = 'out', $run_on_mobile = 'yes' ) {
	$ident = array( 'x' => 0, 'y' => 0, 'scale' => 1, 'rotation' => 0, 'rotationX' => 0, 'rotationY' => 0, 'opacity' => 1, 'blur' => 0 );
	$flat  = function ( $prefix, $vals ) use ( $ident ) {
		$o = array_merge( $ident, (array) $vals ); $r = array();
		foreach ( $o as $k => $v ) { $r[ $prefix . '_' . $k ] = $v; }
		return $r;
	};
	return array( 'mode' => 'keyframes', 'keyframes' => array_merge(
		$flat( 'start', $start ),
		array( 'mid_enable' => $mid ? 'yes' : 'no', 'mid_at' => $mid ? intval( $mid['at'] ) : 50, 'mid_ease' => $mid ? (string) $mid['ease'] : 'out' ),
		$flat( 'mid', $mid ? $mid['v'] : array() ),
		array( 'end_ease' => (string) $end_ease ),
		$flat( 'end', $end ),
		array( 'run_on_mobile' => $run_on_mobile )
	) );
}

/**
 * Dump the DEFAULT value shape of a shortcode's injected effect options — the reliable way to learn
 * the att shape for gsap_motion / scroll_reveal / parallax / hover / text_effect / etc. without
 * guessing. Returns array(option_id => default_value). Set the one or two keys you want, pass it as
 * the element att, and upw_build_page()'s report tells you if it baked.
 *   e.g. $d = upw_effect_defaults('special_heading'); $gsap = $d['gsap_motion']; $gsap['effect']='fade-up';
 */
function upw_effect_defaults( $shortcode = 'special_heading' ) {
	$sc = fw_ext( 'shortcodes' );
	$bd = $sc ? $sc->get_shortcode_builder_data( $shortcode ) : null;
	if ( ! $bd || empty( $bd['options'] ) ) { return array(); }
	$vals = fw_get_options_values_from_input( $bd['options'], array() );
	$fx   = array();
	foreach ( array( 'gsap_motion', 'scroll_keyframes', 'scroll_reveal', 'parallax', 'interaction', 'interaction__2', 'text_effect', 'physics', 'marquee', 'motion_path', 'confetti', 'flip_card', 'scroll_text_highlight', 'animation' ) as $k ) {
		if ( array_key_exists( $k, $vals ) ) { $fx[ $k ] = $vals[ $k ]; }
	}
	return $fx;
}

/**
 * Store a builder tree as a real, EDITABLE builder page and self-verify.
 * $target = numeric post ID or a page slug (page is created if the slug doesn't exist).
 * Returns a status string listing which effects baked. Leaves builder_active = true (visual builder works).
 */
function upw_build_page( $target, $title, $builder, $post_type = 'page' ) {
	if ( is_numeric( $target ) ) {
		$post_id = intval( $target );
	} else {
		$existing = get_page_by_path( $target, OBJECT, $post_type );
		$post_id  = $existing ? $existing->ID : wp_insert_post( array(
			'post_type' => $post_type, 'post_status' => 'publish', 'post_name' => $target, 'post_title' => $title,
		) );
	}

	$json = wp_json_encode( $builder );

	// CLEAN SLATE (the single most important step). The framework reads the builder value from the
	// flat `..:json` meta key; a stale aggregate `fw_options['page-builder']` (or leftover flat value)
	// can disagree with it and make fw_get_db_post_option() return the EMPTY default — the page then
	// renders NOTHING even though the meta looks full. Delete first, then write only the flat keys.
	delete_post_meta( $post_id, 'fw:opt:ext:pb:page-builder:json' );
	delete_post_meta( $post_id, 'fw:opt:ext:pb:page-builder:builder_active' );
	$fw = get_post_meta( $post_id, 'fw_options', true );
	if ( is_array( $fw ) ) { unset( $fw['page-builder'] ); update_post_meta( $post_id, 'fw_options', $fw ); }

	// Store raw shortcode MARKUP as post_content (SEO/fallback). Do NOT render (do_shortcode/the_content)
	// here: rendering loads the builder value into the framework's request cache, which — because we
	// just cleared it above — gets flushed back as EMPTY on shutdown, wiping the value we store below.
	// The front end (builder active) re-renders from the builder value anyway, which also fires each
	// effect's enqueue, so no render is needed at build time.
	$ot         = fw()->backend->option_type( 'page-builder' );
	$shortcodes = str_replace( '\\', '\\\\', $ot->json_to_shortcodes( $json ) );

	// Direct row update — no wp_update_post (its save_post handler would re-sync/overwrite the value).
	global $wpdb;
	$wpdb->update( $wpdb->posts, array( 'post_title' => $title, 'post_content' => $shortcodes ), array( 'ID' => $post_id ) );
	clean_post_cache( $post_id );

	// Write the builder value — LAST, no render after. Both storages must agree: the framework reads
	// the JSON from the flat `..:json` key but the ACTIVE FLAG from the `fw_options` aggregate, so
	// write both (delete-first above guarantees no stale disagreement).
	update_post_meta( $post_id, 'fw:opt:ext:pb:page-builder:json', $json );
	update_post_meta( $post_id, 'fw:opt:ext:pb:page-builder:builder_active', true );
	$fw = get_post_meta( $post_id, 'fw_options', true ); if ( ! is_array( $fw ) ) { $fw = array(); }
	$fw['page-builder'] = array( 'json' => $json, 'builder_active' => true );
	update_post_meta( $post_id, 'fw_options', $fw );
	if ( class_exists( 'FW_Cache' ) ) { try { FW_Cache::del( 'fw:ext:page-builder:json-to-shortcodes/' . $post_id ); } catch ( Exception $e ) {} }

	// Report effects present in the stored tree (front-end verify with curl — see the doc).
	$fx = array();
	foreach ( array( '"mode":"keyframes"' => 'scroll-keyframes', '"effect":"' => 'gsap/entrance', '"mode":"wipe"' => 'scroll-reveal', '"role":"layer"' => 'parallax' ) as $needle => $label ) {
		$c = substr_count( $json, $needle ); if ( $c ) { $fx[] = "$label:$c"; }
	}
	return "OK post #$post_id \"$title\" (builder editable) -> " . get_permalink( $post_id ) . "\n  effects in tree: " . ( $fx ? implode( ', ', $fx ) : '(none)' );
}

endif;
