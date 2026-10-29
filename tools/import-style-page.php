<?php
/**
 * Import style-page.json as the front page of a target install, for the style gallery.
 *
 *   WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php import-style-page.php [--force]
 *
 * Carries the house manual-edit guard: it fingerprints the builder JSON it wrote (_upw_import_hash) and
 * SKIPs a page whose current JSON no longer matches, because that means the page was edited in the
 * builder since. --force overwrites, and is only correct once the edit has been folded back into
 * build-style-page.mjs.
 *
 * The fingerprint is taken from the RAW post meta, not from a read-back through fw_get_db_post_option():
 * the read-back fills in each element's option defaults from the CURRENT code, so a plugin update alone
 * would change it and make every page look hand-edited.
 */

error_reporting( E_ERROR | E_PARSE );
$_SERVER['HTTP_HOST']      = 'localhost';
$_SERVER['SERVER_NAME']    = 'localhost';
$_SERVER['REQUEST_URI']    = '/';
$_SERVER['SERVER_PORT']    = '80';
$_SERVER['REQUEST_METHOD'] = 'GET';

$wp_load_path = getenv( 'WP_LOAD' ) ?: 'D:/xampp/htdocs/testsite/wp-load.php';
require $wp_load_path;
wp_set_current_user( 1 );

$force = in_array( '--force', (array) $argv, true ) || '1' === getenv( 'UPW_FORCE' );
$json  = __DIR__ . '/style-page.json';
if ( ! file_exists( $json ) ) {
	fwrite( STDERR, "style-page.json missing — run: node build-style-page.mjs\n" );
	exit( 1 );
}

$ot = fw()->backend->option_type( 'page-builder' );
if ( ! $ot ) {
	fwrite( STDERR, "page-builder option type unavailable — is the plugin active?\n" );
	exit( 1 );
}

$slug     = 'style-demo';
$existing = get_page_by_path( $slug, OBJECT, 'page' );
$raw_json = function ( $pid ) {
	return (string) get_post_meta( $pid, 'fw:opt:ext:pb:page-builder:json', true );
};

if ( $existing && ! $force ) {
	$fp = get_post_meta( $existing->ID, '_upw_import_hash', true );
	if ( $fp && $fp !== md5( $raw_json( $existing->ID ) ) ) {
		echo "SKIP (edited in the builder since the last import) /$slug/ — pass --force to overwrite\n";
		exit( 0 );
	}
}

$args = array(
	'post_type'   => 'page',
	'post_status' => 'publish',
	'post_title'  => 'Style demo',
	'post_name'   => $slug,
);
if ( $existing ) {
	$args['ID'] = $existing->ID;
	$pid        = wp_update_post( $args );
} else {
	$pid = wp_insert_post( $args );
}
if ( is_wp_error( $pid ) || ! $pid ) {
	fwrite( STDERR, "could not create the page\n" );
	exit( 1 );
}

$tree = file_get_contents( $json );
fw_set_db_post_option( $pid, 'page-builder', array( 'json' => $tree, 'builder_active' => true ) );

// The builder renders from the option meta, but post_content is what a feed, a search result and any
// non-builder context read, so it is kept in step rather than left empty.
$html = do_shortcode( $ot->json_to_shortcodes( $tree ) );
wp_update_post( array( 'ID' => $pid, 'post_content' => $html ) );

update_post_meta( $pid, '_upw_import_hash', md5( $raw_json( $pid ) ) );

// Front page, so the gallery snapshot is the site root and the captured URL stays clean.
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $pid );

$decoded  = json_decode( $tree, true );
$sections = is_array( $decoded ) ? count( $decoded ) : 0;
echo 'OK - imported page #' . $pid . ' as the front page (' . $sections . ' sections, '
	. number_format( strlen( $html ) ) . " bytes of rendered HTML)\n";
if ( strlen( $html ) < 2000 ) {
	echo "  WARNING: that is suspiciously little HTML for this tree — check the shortcodes rendered.\n";
}
