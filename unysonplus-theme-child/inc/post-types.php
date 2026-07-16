<?php
/**
 * Custom post types + shortcode compatibility for THIS site.
 * Edit per site. Guard functions with function_exists() and register CPTs on init.
 *
 * @package unysonplus-child-starter
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

// Example: register a CPT (delete if the site doesn't need one).
// add_action( 'init', function () {
//     register_post_type( 'review', array( 'public' => true, 'has_archive' => true,
//         'supports' => array( 'title','editor','thumbnail','excerpt','page-attributes' ),
//         'labels' => array( 'name' => 'Reviews', 'singular_name' => 'Review' ) ) );
// } );
