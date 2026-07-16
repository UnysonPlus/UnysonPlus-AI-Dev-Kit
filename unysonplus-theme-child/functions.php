<?php
/**
 * UnysonPlus child-theme STARTER.
 *
 * Copy this whole folder, rename it to your site slug, edit the style.css header
 * (Theme Name / Text Domain), and activate. It:
 *   - inherits the unysonplus-theme parent styles,
 *   - loads a small chrome stylesheet for the handful of looks with no native
 *     Theme-Settings option (keep this file small — prefer options),
 *   - one-time-imports design/design.json (the polished-chrome baseline) on
 *     activation, so header/footer/container start ~90% right,
 *   - loads inc/ for custom post types + shortcode compatibility.
 *
 * @package unysonplus-child-starter
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* Inherit parent styles. */
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'unysonplus-parent-style', get_template_directory_uri() . '/style.css' );
}, 5 );

/* Child chrome — LAST-RESORT CSS only (things no Theme-Settings option covers). */
add_action( 'wp_enqueue_scripts', function () {
	$css = get_stylesheet_directory() . '/assets/chrome.css';
	if ( file_exists( $css ) ) {
		wp_enqueue_style( 'child-chrome', get_stylesheet_directory_uri() . '/assets/chrome.css',
			array( 'unysonplus-parent-style' ), filemtime( $css ) );
	}
}, 100 );

/* Custom post types / shortcode compatibility (edit inc/post-types.php per site). */
$pt = get_stylesheet_directory() . '/inc/post-types.php';
if ( file_exists( $pt ) ) { require_once $pt; }

/**
 * One-time import of design/design.json (the polished-chrome baseline).
 *
 * The parent theme's export/import lives in inc/includes/settings-export-import.php;
 * we reuse its writer. Runs once on activation (guarded by a theme_mod flag) so a
 * fresh site inherits a good header/footer/container without manual setup. Generate
 * design.json by configuring a reference site's chrome to parity, then Theme Settings
 * → Miscellaneous → Export / Import → Export design.
 */
add_action( 'after_switch_theme', function () {
	if ( get_theme_mod( 'child_design_imported' ) ) { return; }
	$file = get_stylesheet_directory() . '/design/design.json';
	if ( ! file_exists( $file ) ) { return; }
	if ( ! function_exists( 'fw_set_db_settings_option' ) ) { return; } // Unyson+ must be active
	$data = json_decode( file_get_contents( $file ), true );
	if ( empty( $data['values'] ) || ! is_array( $data['values'] ) ) { return; }
	// Design-only overlay: skip operational keys, blank media (see parent export rules).
	$skip = array( 'misc_analytics', 'misc_performance', 'misc_maintenance', 'misc_404', 'misc_custom_scripts' );
	foreach ( $data['values'] as $key => $value ) {
		if ( in_array( $key, $skip, true ) ) { continue; }
		fw_set_db_settings_option( $key, $value );
	}
	set_theme_mod( 'child_design_imported', 1 );
} );
