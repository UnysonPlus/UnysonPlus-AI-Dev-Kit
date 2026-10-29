<?php
// SPDX-License-Identifier: CC-BY-NC-SA-4.0
/**
 * export-content — read a site's content into a portable folder that push-content.mjs sends to another
 * site over MCP. Run it on the SOURCE install (a local copy, or an imported host archive):
 *
 *   wp eval-file export-content.php <out-dir> [types=review,post] [posts-per-type=0] [category=blog]
 *        [users=login,login] [menus=location:menu-slug,…] [short-links] [files=rel,rel]
 *
 * (Options are plain key=value words: WP-CLI keeps --flags for itself and refuses unknown ones.)
 *
 * Writes <out-dir>/content.json + <out-dir>/files/<uploads-relative path> for every featured image,
 * profile photo and listed file. Every site URL is made root-relative, so the export is domain-free.
 *   types            post types to export (published only)                       default: post
 *   posts-per-type   limit per type, 0 = all                                       default: 0
 *   category         limit the `post` type to one category slug
 *   users            author accounts to carry (with their profile photo)          default: authors of exported posts
 *   menus            theme location → menu slug pairs                             default: every assigned location
 *   short-links      include the Short Links (or Pretty Link) rows with their click totals
 *   files            extra uploads-relative files (images the content embeds)     default: every /wp-content/uploads/ path found in the content
 *
 * Unyson post options (fw_get_db_post_option) are exported whole per post, so a custom type's fields
 * (e.g. a review's `review_options`) travel with it.
 */
if ( ! defined( 'ABSPATH' ) || ! defined( 'WP_CLI' ) ) {
	exit( "Run with: wp eval-file export-content.php <out-dir>\n" );
}

$pos  = array();
$opt  = array();
foreach ( (array) ( $args ?? array() ) as $a ) {
	if ( preg_match( '/^([a-z-]+)(?:=(.*))?$/', $a, $m ) && 0 !== count( $pos ) ) { // key=value after the folder
		$opt[ $m[1] ] = isset( $m[2] ) ? $m[2] : true;
	} else {
		$pos[] = $a;
	}
}
$out = rtrim( $pos[0] ?? '', '/\\' );
if ( '' === $out ) {
	WP_CLI::error( 'Give an output folder.' );
}
$list  = function ( $k, $def = array() ) use ( $opt ) {
	return isset( $opt[ $k ] ) && is_string( $opt[ $k ] ) && '' !== $opt[ $k ] ? array_filter( array_map( 'trim', explode( ',', $opt[ $k ] ) ) ) : $def;
};
$up    = wp_get_upload_dir();
$home  = untrailingslashit( home_url() );
$files = array();
wp_mkdir_p( $out . '/files' );

$rel_url = function ( $s ) use ( $home ) {
	return str_replace( array( $home, str_replace( '/', '\/', $home ) ), '', (string) $s );
};
$file = function ( $rel ) use ( $up, $out, &$files ) {
	$rel = ltrim( (string) $rel, '/' );
	$src = $up['basedir'] . '/' . $rel;
	if ( '' === $rel || ! is_file( $src ) ) {
		return '';
	}
	wp_mkdir_p( dirname( $out . '/files/' . $rel ) );
	copy( $src, $out . '/files/' . $rel );
	$files[ $rel ] = true;
	return $rel;
};
$att = function ( $id ) use ( $file ) {
	$f = $id ? get_post_meta( (int) $id, '_wp_attached_file', true ) : '';
	return $f ? $file( $f ) : '';
};
$embedded = function ( $html ) {
	preg_match_all( '#/wp-content/uploads/([^"\'\s)?]+)#', (string) $html, $m );
	return $m[1];
};

$data    = array( 'format' => 'upw-content', 'version' => 1, 'posts' => array(), 'users' => array(), 'menus' => array(), 'short_links' => array() );
$authors = array();
$inline  = array();

foreach ( $list( 'types', array( 'post' ) ) as $type ) {
	$q = array( 'post_type' => $type, 'post_status' => 'publish', 'numberposts' => (int) ( $opt['posts-per-type'] ?? 0 ) ?: -1 );
	if ( 'post' === $type && ! empty( $opt['category'] ) ) {
		$q['category_name'] = $opt['category'];
	}
	foreach ( get_posts( $q ) as $p ) {
		$author           = get_userdata( $p->post_author );
		$authors[]        = $author ? $author->user_login : '';
		$terms            = array();
		foreach ( get_object_taxonomies( $type ) as $tax ) {
			$t = wp_get_object_terms( $p->ID, $tax, array( 'fields' => 'slugs' ) );
			if ( $t && ! is_wp_error( $t ) ) {
				$terms[ $tax ] = $t;
			}
		}
		$options = function_exists( 'fw_get_db_post_option' ) ? fw_get_db_post_option( $p->ID ) : array();
		unset( $options['page-builder'] );
		$inline = array_merge( $inline, $embedded( $p->post_content ) );
		$data['posts'][] = array(
			'type' => $type, 'slug' => $p->post_name, 'title' => $p->post_title, 'status' => 'publish',
			'date' => $p->post_date, 'menu_order' => $p->menu_order, 'excerpt' => $p->post_excerpt,
			'content' => $rel_url( $p->post_content ), 'author' => $author ? $author->user_login : '',
			'terms' => $terms, 'featured_image' => $att( get_post_thumbnail_id( $p->ID ) ),
			'fw_options' => json_decode( $rel_url( wp_json_encode( $options ) ), true ),
		);
	}
}

foreach ( array_unique( array_filter( $list( 'users', $authors ) ) ) as $login ) {
	$u = get_user_by( 'login', $login );
	if ( ! $u ) {
		continue;
	}
	$meta = array();
	foreach ( array( 'title', 'full_bio', 'description', 'twitter', 'linkedin', 'expertise', 'first_name', 'last_name' ) as $k ) {
		$v = get_user_meta( $u->ID, $k, true );
		if ( '' !== $v ) {
			$meta[ $k ] = $v;
		}
	}
	$data['users'][] = array( 'login' => $login, 'email' => $u->user_email, 'display_name' => $u->display_name,
		'url' => $u->user_url, // Accounts that can manage a site are carried as authors: the site's user tool refuses to grant more.
		'role' => in_array( $u->roles[0] ?? '', array( 'author', 'contributor', 'subscriber' ), true ) ? $u->roles[0] : 'author',
		'meta' => $meta, 'photo' => $att( (int) get_user_meta( $u->ID, 'wp_metronet_image_id', true ) ) );
}

$locations = get_nav_menu_locations();
$pairs     = array();
foreach ( $list( 'menus' ) as $pair ) {
	list( $loc, $slug ) = array_pad( explode( ':', $pair, 2 ), 2, '' );
	$pairs[ $loc ] = $slug;
}
if ( ! $pairs ) {
	foreach ( $locations as $loc => $menu_id ) {
		$m = wp_get_nav_menu_object( $menu_id );
		if ( $m ) {
			$pairs[ $loc ] = $m->slug;
		}
	}
}
foreach ( $pairs as $loc => $slug ) {
	$menu = wp_get_nav_menu_object( $slug );
	if ( ! $menu ) {
		continue;
	}
	$items = array();
	foreach ( (array) wp_get_nav_menu_items( $menu ) as $it ) {
		$items[] = array( 'id' => (int) $it->ID, 'parent' => (int) $it->menu_item_parent, 'title' => $it->title, 'url' => $rel_url( $it->url ) ?: '/' );
	}
	$data['menus'][] = array( 'name' => $menu->name, 'locations' => array( $loc ), 'items' => $items );
}

if ( ! empty( $opt['short-links'] ) && class_exists( 'FW_Short_Links_Transfer' ) ) {
	$rows = FW_Short_Links_Transfer::detect_source() ? FW_Short_Links_Transfer::read_source( false ) : array();
	foreach ( $rows as &$r ) {
		unset( $r['source_id'] );
	}
	unset( $r );
	$data['short_links'] = $rows;
}

foreach ( array_unique( array_merge( $inline, $list( 'files' ) ) ) as $f ) {
	$file( $f );
}
$data['files'] = array_keys( $files );

file_put_contents( $out . '/content.json', wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) );
WP_CLI::success( sprintf( '%d posts, %d users, %d menus, %d short links, %d files → %s',
	count( $data['posts'] ), count( $data['users'] ), count( $data['menus'] ), count( $data['short_links'] ), count( $data['files'] ), $out ) );
