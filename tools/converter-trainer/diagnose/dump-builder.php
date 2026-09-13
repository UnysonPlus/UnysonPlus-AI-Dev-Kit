<?php
/**
 * dump-builder.php — dump the BUILDER JSON tree behind a converted page (the reusable form of the dozens of
 * one-off `dump*` / `dbg-*` / `sec-atts` scripts). Shows what the converter actually PRODUCED — the section →
 * row/column → block structure with widths and block types — which is the ground truth behind what probe.mjs
 * measures in the rendered DOM. Use it to see WHY a section rendered wrong (e.g. a card became an icon_box, a
 * grid got the wrong column count, an image block is missing).
 *
 * The page builder renders from the `fw:opt:ext:pb:page-builder:json` POST META, not post_content — this reads
 * that meta.
 *
 * Usage (run with the XAMPP php):
 *   php dump-builder.php                         dump the current front page's builder tree
 *   php dump-builder.php --front 28              dump a specific post id
 *   php dump-builder.php --import <capture-dir>  reconvert that capture dir first (full bundle), then dump
 *   php dump-builder.php --grep "Pricing"        only sections whose JSON contains this string
 *   php dump-builder.php --atts 3                also print the raw atts of section #3 (background, etc.)
 *
 * Env: WP_LOAD (default D:/xampp/htdocs/wp-load.php).
 */
$opt = function ($n, $d = null) { global $argv; $i = array_search($n, $argv, true); return ($i !== false && isset($argv[$i + 1])) ? $argv[$i + 1] : $d; };

require getenv('WP_LOAD') ?: 'D:/xampp/htdocs/wp-load.php';

$import = $opt('--import');
if ($import) {
    if (!class_exists('FW_Site_Converter_Bundle')) { fwrite(STDERR, "no converter plugin active\n"); exit(2); }
    $prev = error_reporting(0);
    FW_Site_Converter_Bundle::import_dir($import);
    error_reporting($prev);
    foreach (glob(WP_CONTENT_DIR . '/uploads/unysonplus/asset-optimizer/combined-*.css') as $f) { @unlink($f); }
    if (function_exists('wp_cache_flush')) wp_cache_flush();
    echo "imported: $import\n";
}

$front = (int) ($opt('--front') ?: get_option('page_on_front'));
if (!$front) { fwrite(STDERR, "no front page set (and no --front given)\n"); exit(2); }
$json = get_post_meta($front, 'fw:opt:ext:pb:page-builder:json', true);
$data = is_string($json) ? json_decode($json, true) : $json;
if (!is_array($data)) { fwrite(STDERR, "post $front has no builder JSON\n"); exit(2); }

$grep     = (string) $opt('--grep', '');
$attsFor  = $opt('--atts');
$attsFor  = ($attsFor === null) ? -1 : (int) $attsFor;

// Compact width read from a builder node's atts (the shapes the mapper emits).
$width = function ($n) {
    $a = $n['atts'] ?? [];
    foreach (['width', 'fw_options_width'] as $k) {
        if (isset($a[$k])) { $w = $a[$k]; return is_array($w) ? json_encode($w) : (string) $w; }
    }
    return '';
};

$secIdx = -1;
$print = function ($n, $depth) use (&$print, $width, $grep, $attsFor, &$secIdx) {
    if (!is_array($n)) return;
    $t  = $n['type'] ?? ''; $sc = $n['shortcode'] ?? '';
    $label = $t ?: $sc;
    $isSection = ($t === 'section');
    if ($isSection) $secIdx++;
    // grep filter: only descend/print sections matching the string
    if ($isSection && $grep !== '' && strpos(json_encode($n), $grep) === false) return;
    if ($label) {
        $w = $width($n);
        $tag = $isSection ? "§$secIdx " : '';
        echo str_repeat('  ', $depth) . $tag . $label . ($w && $w !== '""' && $w !== 'false' ? "  w=$w" : '') . "\n";
        if ($isSection && $attsFor === $secIdx) {
            echo str_repeat('  ', $depth + 1) . 'atts: ' . substr(json_encode($n['atts'] ?? [], JSON_UNESCAPED_SLASHES), 0, 600) . "\n";
        }
    }
    foreach (($n['_items'] ?? $n['_children'] ?? []) as $c) $print($c, $depth + ($label ? 1 : 0));
};

echo "front page: post $front  ·  builder tree (type / shortcode + width)\n\n";
$nodes = isset($data[0]) ? $data : array($data);   // top level is a LIST of section nodes
foreach ($nodes as $node) $print($node, 0);
