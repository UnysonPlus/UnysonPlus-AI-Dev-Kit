<?php
/**
 * Converter Training Harness — AUDITOR
 * ------------------------------------
 * Runs each captured site through the REAL deterministic converter
 * (FW_Site_Converter_Stitch::html_to_mapping + FW_Site_Converter_Mapper::build_pages)
 * and emits fidelity signals, so a human/agent only has to LOOK at the sites the
 * harness flags — instead of screenshotting every demo. Token-cheap: no browser.
 *
 * WHY two data sources (the lesson baked in): content signals come from the MAPPING
 * (heading/paragraph text lives in each block's `text`), while background/overlay
 * signals come from the BUILT tree (where a section's resolved Background lives).
 * Auditing only the built tree undercounts text (heading titles move into atts).
 *
 * Usage:
 *   php audit.php <captures-root> [out.csv]
 *     <captures-root> = a dir of per-slug capture folders; each rendered.html sits either directly
 *                       under <slug>/ or one level below it (resolved, never hardcoded)
 *                       (the trainer's default: tools/design-capture/batch)
 * Requires a localhost WP with the Site Converter plugin active (loads wp-load.php).
 */

$WP = getenv('WP_LOAD') ?: 'D:/xampp/htdocs/wp-load.php';
if (!file_exists($WP)) { fwrite(STDERR, "wp-load not found: $WP (set WP_LOAD)\n"); exit(2); }
require $WP;
if (!class_exists('FW_Site_Converter_Stitch')) { fwrite(STDERR, "Site Converter not active on this install\n"); exit(2); }

$root = $argv[1] ?? '';
if ($root === '' || !is_dir($root)) { fwrite(STDERR, "usage: php audit.php <captures-root> [out.csv]\n"); exit(2); }
$out_csv = $argv[2] ?? ($root . '/_audit.csv');

/* ---- colour helpers (reuse the converter's own oklch/hsl-aware parser) ---- */
function to_rgb($c) {
    $c = trim((string)$c);
    if ($c === '' || stripos($c,'transparent')!==false) return null;
    // strip alpha for luma; grab first colour token
    if (preg_match('/rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)/', $c, $m)) return [(int)$m[1],(int)$m[2],(int)$m[3]];
    $hex = FW_Site_Converter_Stitch::color_to_hex($c);
    if (preg_match('/^#([0-9a-f]{6})$/i',$hex,$m)) return [hexdec(substr($m[1],0,2)),hexdec(substr($m[1],2,2)),hexdec(substr($m[1],4,2))];
    return null;
}
function luma($rgb){ if(!$rgb) return null; return (0.2126*$rgb[0]+0.7152*$rgb[1]+0.0722*$rgb[2])/255; }
function alpha_of($c){ if(preg_match('#(?:,\s*|/\s*)([01]?\.?\d+)\s*\)#',(string)$c,$m)) return (float)$m[1]; return 1.0; }

/* ---- walk the built tree for the first section's background ---- */
function first_section(&$n){ if(!is_array($n)) return null; if(isset($n['type'])&&$n['type']==='section') return $n; foreach($n as $v){ if(is_array($v)){ $r=first_section($v); if($r) return $r; } } return null; }
function count_type($n,$t){ $c=0; if(!is_array($n)) return 0; if(isset($n['type'])&&$n['type']===$t)$c++; foreach($n as $v){ if(is_array($v))$c+=count_type($v,$t);} return $c; }

/* ---- per-site audit ---- */
function audit_site($dir) {
    $f = $dir.'/rendered.html';
    if (!file_exists($f)) return ['err'=>'no-rendered'];
    $html = file_get_contents($f);
    if (strlen($html) < 1500 && stripos($html,'Not found')!==false) return ['err'=>'error-page'];

    $map = FW_Site_Converter_Stitch::html_to_mapping($html,'x','x',true);
    $secs = $map['pages'][0]['sections'] ?? [];
    $built = FW_Site_Converter_Mapper::build_pages($map);
    $builder = $built[0]['builder'] ?? [];

    $flags = [];
    $nsec = count($secs);
    $verbatim = count_type($builder, 'html'); // code_block fallbacks

    // content per mapping section — RECURSE into row columns (a section's real content often lives inside a
    // `row` block's `cols[].blocks`, not at the top level). Counting only top-level blocks flags a
    // content-rich single-row band as empty (a false EMPTY_SEC). Descend cols + nested blocks.
    // Structured shortcode blocks carry their content in their OWN sub-structure (plans, steps, rows…),
    // not a top-level `text` — a section holding one is NOT empty even if it sums 0 top-level text.
    $STRUCTURED = ['pricing','steps','accordion','timeline','feature_list','counter','card','gallery',
                   'table','testimonials','logo_grid','newsletter','stats','tabs'];
    // Count content on a node whether it is a top-level BLOCK or a grid CELL (a `cols[]` entry). A cell
    // carries its content DIRECTLY — `card` (title/body), `text`, `html` (verbatim markup), `buttons` —
    // not only as nested `blocks`. Missing those made content-rich grid sections read as empty (a false
    // EMPTY_SEC on e.g. colosseum's 4-card band). Recurse blocks, cols, and grid.cells uniformly.
    $walk = function($node, &$tlen, &$media, &$structured) use (&$walk, $STRUCTURED) {
        if (!is_array($node)) return;
        foreach ($node as $b) {
            if (!is_array($b)) continue;
            $role = $b['t'] ?? ($b['role'] ?? '');
            if (isset($b['text']) && is_string($b['text'])) $tlen += strlen(trim(strip_tags($b['text'])));
            if (isset($b['html']) && is_string($b['html'])) $tlen += strlen(trim(strip_tags($b['html'])));
            if (isset($b['card']) && is_array($b['card'])) { $structured++; foreach (['title','text','desc','body'] as $k) if (!empty($b['card'][$k]) && is_string($b['card'][$k])) $tlen += strlen(trim(strip_tags($b['card'][$k]))); }
            if (isset($b['overline']) && is_string($b['overline'])) $tlen += strlen(trim($b['overline']));
            // Cell-level structured content keys (a stat/counter, a button group, a nested grid) — a cell can
            // carry any of these INSTEAD of nested blocks; treat their presence as real content.
            foreach (['buttons','counter','pricing','steps','accordion','timeline','feature_list','stats','grid'] as $sk) if (!empty($b[$sk])) $structured++;
            if ($role==='image' || $role==='video' || $role==='gallery' || !empty($b['src'])) $media++;
            if (in_array($role, $STRUCTURED, true)) $structured++;
            if (!empty($b['blocks'])) $walk($b['blocks'], $tlen, $media, $structured);
            if (!empty($b['cols']))  $walk($b['cols'],  $tlen, $media, $structured);
            if (!empty($b['grid']['cells'])) $walk($b['grid']['cells'], $tlen, $media, $structured);
            if (!empty($b['counter']['items']) && is_array($b['counter']['items'])) foreach ($b['counter']['items'] as $it) foreach ((array)$it as $v) if (is_string($v)) $tlen += strlen(trim(strip_tags($v)));
        }
    };
    $empty = 0; $total_text = 0; $media = 0;
    foreach ($secs as $s) {
        $tlen=0; $m=0; $st=0;
        $walk($s['blocks'] ?? [], $tlen, $m, $st);
        $has_content = $m>0 || $st>0 || !empty($s['sectionBgImage']['src']) || !empty($s['sectionBgVideo']);
        $media += $m;
        $total_text += $tlen;
        if ($tlen < 5 && !$has_content) $empty++;
    }

    // hero background (built) + overlay sanity
    $sec0 = first_section($builder);
    $bg = $sec0['atts']['background'] ?? [];
    $bgcol = $bg['color']['value']['custom'] ?? '';
    $bgvid = ($bg['video']['enabled'] ?? '')==='yes';
    $bgimg = !empty($bg['image']['src']);
    $ovcol = $bg['overlay']['color'] ?? '';
    $hero_kind = $bgvid?'vid':($bgimg?'img':($bgcol!==''?'col':'-'));

    // Source page canvas — a hero with no section bg is BENIGN whenever the page has an intentional
    // canvas (the Theme-Settings site_background, derived from <body>/<html>) of EITHER tone: a dark
    // site shows dark through a transparent hero, a light site shows light. So NO_HERO_BG only means
    // trouble when NO canvas colour is detected at all (the hero would fall to the theme default,
    // indeterminate). Read both <body> and <html> stamps. (`$canvas_dark` still gates LOW_CONTRAST.)
    $canvas_present = false; $canvas_dark = false;
    foreach (['body','html'] as $tag) {
        if (preg_match('/<'.$tag.'[^>]*data-sc-cs="([^"]*)"/i',$html,$bm) && preg_match('/background-color:\s*([^;"]+)/i',$bm[1],$cm)) {
            $cv = to_rgb(trim($cm[1]));
            if ($cv!==null) { $canvas_present = true; $cl = luma($cv); if ($cl!==null && $cl<0.25) $canvas_dark = true; break; }
        }
    }

    // FLAG: a LIGHT, opaque overlay wash (the "cream hero" bug — catch regressions)
    if ($ovcol!=='') { $ol=luma(to_rgb($ovcol)); if($ol!==null && $ol>0.6 && alpha_of($ovcol)>0.5) $flags[]='LIGHT_OVERLAY_WASH'; }
    // FLAG: hero has no background AND no page canvas at all → renders on the indeterminate theme default.
    if ($hero_kind==='-' && !$canvas_present) $flags[]='NO_HERO_BG';
    // FLAG: light section bg with light text = invisible text (dark-canvas miss)
    $scs = $secs[0]['sectionCs'] ?? '';
    if (preg_match('/(?:^|;)\s*color:\s*([^;]+)/i',$scs,$tm)) {
        $tl = luma(to_rgb(trim($tm[1])));
        $bl = $bgcol!=='' ? luma(to_rgb($bgcol)) : ($canvas_dark ? 0.05 : null);
        if ($tl!==null && $tl>0.7 && $bl!==null && $bl>0.7) $flags[]='LOW_CONTRAST_TEXT';
    }
    if ($empty>0) $flags[]="EMPTY_SEC:$empty";
    if ($verbatim>=4) $flags[]="VERBATIM:$verbatim";
    if ($nsec<=1) $flags[]='FEW_SECTIONS';

    return [
        'secs'=>$nsec, 'text'=>$total_text, 'media'=>$media, 'empty'=>$empty,
        'hero'=>$hero_kind, 'bgcol'=>$bgcol, 'overlay'=>$ovcol, 'verbatim'=>$verbatim,
        'flags'=>$flags, 'severity'=>count($flags),
    ];
}

/* ---- run over all captured sites ---- */
// Every capture dir holding a rendered.html, at either depth — no corpus's dir name is hardcoded.
$dirs = array();
foreach ( (array) glob( $root . '/*', GLOB_ONLYDIR ) as $slugDir ) {
	if ( file_exists( $slugDir . '/rendered.html' ) ) { $dirs[] = $slugDir; continue; }
	foreach ( (array) glob( $slugDir . '/*', GLOB_ONLYDIR ) as $sub ) {
		if ( file_exists( $sub . '/rendered.html' ) ) { $dirs[] = $sub; break; }
	}
}
if (!$dirs) { $dirs = glob($root.'/*', GLOB_ONLYDIR); } // fallback: direct site dirs
$rows = [];
foreach ($dirs as $d) {
    $slug = basename(dirname($d))==='' ? basename($d) : basename(dirname($d));
    if (file_exists($d.'/rendered.html') && file_exists(dirname($d).'/rendered.html')===false && basename(dirname($d))!==basename($root)) { $slug = basename(dirname($d)); } else { $slug = basename($d); }
    $r = audit_site($d);
    $r['slug'] = $slug;
    $rows[] = $r;
}
// rank: most severe first
usort($rows, function($a,$b){ return ($b['severity']??-1) <=> ($a['severity']??-1); });

// CSV
$fh = fopen($out_csv,'w');
fputcsv($fh, ['slug','secs','text','media','empty','hero','bgcol','overlay','verbatim','flags']);
foreach ($rows as $r) {
    if (isset($r['err'])) { fputcsv($fh,[$r['slug'],'','','','','ERR:'.$r['err']]); continue; }
    fputcsv($fh,[$r['slug'],$r['secs'],$r['text'],$r['media'],$r['empty'],$r['hero'],$r['bgcol'],$r['overlay'],$r['verbatim'],implode(' ',$r['flags'])]);
}
fclose($fh);

// console summary (ranked; only flagged sites shown loud)
printf("\n%-38s %4s %6s %4s %5s %-4s %s\n",'SITE','secs','text','med','vbat','hero','FLAGS');
echo str_repeat('-',110)."\n";
foreach ($rows as $r) {
    if (isset($r['err'])) { printf("%-38s  ERR %s\n",$r['slug'],$r['err']); continue; }
    printf("%-38s %4d %6d %4d %5d %-4s %s\n",$r['slug'],$r['secs'],$r['text'],$r['media'],$r['verbatim'],$r['hero'],implode(' ',$r['flags']));
}
$flagged = array_filter($rows, fn($r)=>!isset($r['err']) && !empty($r['flags']));
echo "\n".count($flagged)." of ".count($rows)." sites flagged. CSV: $out_csv\n";
