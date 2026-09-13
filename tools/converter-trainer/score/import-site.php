<?php
/**
 * Score harness — per-site importer.
 * Runs the REAL bundle import (FW_Site_Converter_Bundle::import_dir → build_from_html) for ONE captured
 * site into the localhost root install, sets it as the front page, purges the combined-CSS cache, and
 * prints builder-level signals as JSON on stdout (section count, verbatim/code-block count) so the
 * Node scorer can combine them with its rendered measurements. Rendering happens in score.mjs afterward.
 *
 * Usage:  php import-site.php <slug> [<batch-root>]
 *   <slug>       a captured site folder name under the batch root
 *   <batch-root> default: the kit's assembled capture-service batch dir
 */
// A full bundle import of a large site (many sections + media + presets) can exceed PHP's default 512M —
// a fatal in wpdb mid-import, which the scorer sees as IMPORT-FAIL. Give it headroom.
@ini_set('memory_limit', '3072M');
$slug  = $argv[1] ?? '';
$batch = $argv[2] ?? 'D:/Web Dev/UnysonPlus-AI-Dev-Kit/assembled/UnysonPlus-Capture-Service/tools/design-capture/batch';
if ($slug === '') { fwrite(STDERR, "usage: php import-site.php <slug> [batch-root]\n"); echo json_encode(['ok'=>false,'err'=>'no-slug']); exit(2); }

$dir = "$batch/$slug/openhero_art_api_preview";
if (!is_dir($dir)) { $dir = "$batch/$slug"; }
if (!file_exists("$dir/rendered.html")) { echo json_encode(['ok'=>false,'err'=>'no-rendered','slug'=>$slug]); exit(0); }

$WP = getenv('WP_LOAD') ?: 'D:/xampp/htdocs/wp-load.php';
require $WP;
if (!class_exists('FW_Site_Converter_Bundle')) { echo json_encode(['ok'=>false,'err'=>'no-plugin']); exit(0); }

// silence converter notices so stdout stays pure JSON
$prev = error_reporting(0);
$r = FW_Site_Converter_Bundle::import_dir($dir);
error_reporting($prev);

foreach (glob(WP_CONTENT_DIR.'/uploads/unysonplus/asset-optimizer/combined-*.css') as $f) { @unlink($f); }
if (function_exists('wp_cache_flush')) wp_cache_flush();

$front = (int) get_option('page_on_front');
// builder-level signals from the stored page-builder JSON
$sections = 0; $verbatim = 0; $heroBgVideo = false; $heroBgImage = false;
if ($front) {
    $json = get_post_meta($front, 'fw:opt:ext:pb:page-builder:json', true);
    $data = is_string($json) ? json_decode($json, true) : $json;
    $walk = function ($n) use (&$walk, &$sections, &$verbatim) {
        if (!is_array($n)) return;
        if (($n['type'] ?? '') === 'section') $sections++;
        if (($n['type'] ?? '') === 'html') $verbatim++;
        foreach ($n as $v) if (is_array($v)) $walk($v);
    };
    $walk($data);
    // Hero (FIRST section) background media, read from the BUILDER — deterministic, unlike measuring a rendered
    // autoplay video whose size races with load. This drives the bg_media score.
    $firstSec = null;
    $find = function ($n) use (&$find, &$firstSec) { if ($firstSec !== null || !is_array($n)) return; if (($n['type'] ?? '') === 'section') { $firstSec = $n; return; } foreach ($n as $v) if (is_array($v)) $find($v); };
    $find($data);
    if (is_array($firstSec)) {
        $bg = $firstSec['atts']['background'] ?? [];
        $heroBgVideo = (($bg['video']['enabled'] ?? '') === 'yes');
        $heroBgImage = !empty($bg['image']['src']) || !empty($bg['image']['attachment_id']);
        // Effect-wrapped hero videos are now rendered as a `media_video` in Section-Background mode
        // (as_background = yes) INSIDE the section, not as a Background-Pro `background.video` — so the
        // hero backdrop is present, just structured differently. Recognise that too, or a MORE faithful
        // conversion (the video PLUS its dropped mask/filter effect) would falsely read as bg_media = 0.
        if (!$heroBgVideo) {
            $findBgVideo = function ($n) use (&$findBgVideo) {
                if (!is_array($n)) return false;
                if (($n['shortcode'] ?? '') === 'media_video' && (($n['atts']['as_background'] ?? 'no') === 'yes')) return true;
                foreach ($n as $v) { if (is_array($v) && $findBgVideo($v)) return true; }
                return false;
            };
            if ($findBgVideo($firstSec)) { $heroBgVideo = true; }
        }
    }
}
// Does the SOURCE hero carry a genuine FULL-BLEED backdrop <video> that SHOULD become the section
// background? This must match the converter's detect_section_bg_video promotion criteria, else a SHAPED
// content video (a `video-portal` / `squircle-mask` / `arch-portal` / `organic-shell` clip framed inside the
// hero — nox-liquid, the-line, national-geographic, terraform, reactive-forest, kinetic-fashion, human-centric,
// build-products) is FALSELY scored as a missed backdrop (bg_media=0) when leaving it as CONTENT is correct.
// A real backdrop: an autoplay+muted video whose wrapper is inset-0 / w-full h-full / a fullscreen|video-bg
// container — and is NOT a shaped/portal/masked window, NOT in a grid COLUMN, NOT a rounded card.
$srcHeroVideo = false;
$rh = @file_get_contents("$dir/rendered.html");
if ($rh !== false && preg_match('/<section\b.*?<\/section>/is', substr($rh, strpos($rh, '<body') ?: 0), $sm)) {
    $seg = $sm[0];
    // A MULTI-COLUMN GRID hero (grid-cols-2+, colosseum / orbital-horizon) lays media out as CONTENT in one
    // column, not a full-bleed backdrop — matching the converter's section_is_multicol_grid gate. Never expect
    // a section-background video for these, or the (correct) 2-column content treatment reads as bg_media=0.
    $is_grid2 = (bool) preg_match('/<section\b[^>]*class="[^"]*\b(?:(?:sm|md|lg|xl|2xl):)?grid-cols-[2-9]\b/i', $seg);
    // scan each <video> in the first section; look at the ~600 chars of wrapper markup preceding it
    if (!$is_grid2 && preg_match_all('/<video\b[^>]*>/i', $seg, $vm, PREG_OFFSET_CAPTURE)) {
        foreach ($vm[0] as $v) {
            $vtag = $v[0]; $at = $v[1];
            if (!preg_match('/\bautoplay\b/i', $vtag) || !preg_match('/\bmuted\b/i', $vtag)) { continue; } // bg hallmarks
            $ctx = substr($seg, max(0, $at - 600), 600 + strlen($vtag));
            // shaped / framed / column content video → NOT a backdrop
            if (preg_match('/portal|squircle|arch-|organic|-mask\b|-shell\b|data-sc-col|border-radius:\s*(?:[2-9]\d|\d{3})/i', $ctx)) { continue; }
            // genuine full-bleed signal
            if (preg_match('/\binset-0\b|\bw-full\b[^"\']*\bh-full\b|fullscreen|video-bg|bg-video|video-background|video-cover|object-cover|position:\s*(?:absolute|fixed)/i', $ctx)) {
                $srcHeroVideo = true; break;
            }
        }
    }
}
// STRUCTURAL HARDENING: did the converter promote a video to the hero BACKGROUND that is actually a ROUNDED
// content panel in the source (a portal/PIP reel)? That's the build-products-class defect the scorer was blind
// to (bg_media only ever flagged a MISSING backdrop, never a wrongly-ADDED one). Uses structure_summary so the
// judgment matches the converter's own DOM view. `wrongBg` = builder set a hero bg video, but the source's
// first-section video is rounded (framed) → a wrong promotion.
$wrongBg = false;
if ($heroBgVideo && $rh !== false && class_exists('FW_Site_Converter_Stitch') && method_exists('FW_Site_Converter_Stitch', 'structure_summary')) {
    $summ = FW_Site_Converter_Stitch::structure_summary($rh);
    $first = $summ['sections'][0] ?? null;
    if (is_array($first) && !empty($first['videos'])) {
        foreach ($first['videos'] as $vv) { if (!empty($vv['rounded'])) { $wrongBg = true; break; } }
    }
}
// MEDIA RETENTION denominator — how many REAL CONTENT images the source page carries in its BODY. The kit's
// scorer was blind to whole photo grids going missing (it scored 100 on seven dimensions while a band of
// photos was absent — Wegic audit §8.54). Count raster <img> in the body, EXCLUDING: site chrome regions
// (<header>/<footer>/<nav> — the converter maps those to the theme's chrome builder, not the page body), SVG /
// data-URI glyphs (legitimately icons), and 1x1 tracking pixels. score.mjs compares this to the converted
// page's rendered content images (incl. images the converter promoted to a section BACKGROUND).
$srcImages = 0;
if ($rh !== false) {
    $body = substr($rh, strpos($rh, '<body') ?: 0);
    $b = preg_replace('#<(header|footer|nav)\b.*?</\1>#is', '', $body); // drop chrome regions
    if (preg_match_all('/<img\b[^>]*>/i', (string) $b, $im)) {
        foreach ($im[0] as $tag) {
            if (!preg_match('/\bsrc\s*=\s*("|\')(.*?)\1/i', $tag, $sm2)) continue;
            $src = trim($sm2[2]);
            if ($src === '' || stripos($src, 'data:') === 0) continue;      // data-URI icon
            if (preg_match('/\.svg(\?|#|$)/i', $src)) continue;             // svg = icon/illustration
            if (preg_match('/\b(?:width|height)\s*=\s*("|\')?1\1?/i', $tag)) continue; // 1x1 tracking pixel
            $srcImages++;
        }
    }
}
$theme = (is_array($r) && isset($r['theme']['slug'])) ? $r['theme']['slug'] : '';
echo json_encode(['ok'=>true, 'slug'=>$slug, 'front'=>$front, 'sections'=>$sections, 'verbatim'=>$verbatim,
    'heroBgVideo'=>$heroBgVideo, 'heroBgImage'=>$heroBgImage, 'srcHeroVideo'=>$srcHeroVideo, 'wrongBg'=>$wrongBg,
    'srcImages'=>$srcImages, 'theme'=>$theme]);
