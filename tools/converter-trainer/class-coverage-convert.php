<?php
/**
 * Convert one capture-out bundle into the localhost front page via the real import_dir path
 * (chrome + pages + presets + theme), for the Class-Coverage Audit tool. Prints JSON.
 * Usage: php class-coverage-convert.php <capture-out-dir>
 */
require 'D:/xampp/htdocs/wp-load.php';
$dir = isset( $argv[1] ) ? $argv[1] : '';
if ( '' === $dir || ! is_dir( $dir ) ) { fwrite( STDERR, "no dir: $dir\n" ); exit( 1 ); }
if ( ! class_exists( 'FW_Site_Converter_Bundle' ) ) { fwrite( STDERR, "no bundle class\n" ); exit( 1 ); }
$res = FW_Site_Converter_Bundle::import_dir( $dir );
$up = wp_upload_dir();
foreach ( glob( $up['basedir'] . '/unysonplus/asset-optimizer/combined-*.css' ) as $f ) { @unlink( $f ); }
if ( function_exists( 'wp_cache_flush' ) ) { wp_cache_flush(); }
echo json_encode( array( 'error' => isset( $res['error'] ) ? $res['error'] : '', 'front' => (int) get_option( 'page_on_front' ) ) ) . "\n";
