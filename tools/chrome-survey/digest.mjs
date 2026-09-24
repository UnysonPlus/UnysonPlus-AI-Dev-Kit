#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * digest.mjs — turn survey.mjs JSON into a SMALL report an agent can actually read.
 *
 * Two halves:
 *   1. ANATOMY   — the distributions (tag, position, height, node count, chrome,
 *                  two-state behaviour, mobile, hover) that describe the corpus.
 *   2. COVERAGE  — every detected construct scored against capability-map.json:
 *                  EXACT (a settings field reproduces it) / NEAR (the option exists
 *                  but its value is fixed or quantised) / CSS (no option).
 *
 * Detection lives here; the option ids, file paths, verdicts and gap list live in
 * capability-map.json. Constructs whose verdict depends on the measured value
 * (a 10px blur is EXACT, 40px is NEAR) refine it here, in constructsOf().
 *
 *   node digest.mjs out/corpus-02.json
 *   node digest.mjs out/corpus-02.json out/corpus-01.json      # side-by-side
 *   node digest.mjs out/corpus-02.json --format md > report.md
 *   node digest.mjs out/corpus-02.json --section coverage     # anatomy | coverage | all
 *   node digest.mjs out/corpus-02.json --strict-mobile        # count a source with no
 *                                                          mobile nav as a miss
 * Output is plain text by default, GitHub-flavoured markdown with --format md
 * (paste straight into a doc, or pipe to md2docx).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
/* positional args = input files. Skip the VALUE that follows a value-taking flag,
   otherwise `--format md` would be read as a file named "md". */
const VALUE_FLAGS = new Set(['format', 'section']);
const files = argv.filter((a, i) => {
  if (a.startsWith('--')) return false;
  const prev = argv[i - 1];
  return !(prev && prev.startsWith('--') && VALUE_FLAGS.has(prev.slice(2)));
});
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const has = n => argv.includes('--' + n);

if (!files.length) {
  console.error('usage: node digest.mjs <survey.json> [more.json…] [--format md] [--section anatomy|coverage|all] [--strict-mobile]');
  process.exit(2);
}
const MD = flag('format', 'text') === 'md';
const SECTION = flag('section', 'all');
const STRICT_MOBILE = has('strict-mobile');
const MAP = JSON.parse(fs.readFileSync(path.join(HERE, 'capability-map.json'), 'utf8'));

/* ------------------------------------------------------------------- fmt -- */
const out = [];
const say = s => out.push(s);
const H = (lvl, t) => say(MD ? `\n${'#'.repeat(lvl)} ${t}\n` : `\n${lvl === 1 ? '=== ' : lvl === 2 ? '--- ' : '  '}${t}${lvl === 1 ? ' ===' : ''}`);
const rows = (head, body) => {
  if (!body.length) return;
  if (MD) {
    say(`| ${head.join(' | ')} |`);
    say(`|${head.map(() => '---').join('|')}|`);
    body.forEach(r => say(`| ${r.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |`));
    say('');
  } else {
    const w = head.map((h, i) => Math.max(String(h).length, ...body.map(r => String(r[i]).length)));
    say('  ' + head.map((h, i) => String(h).padEnd(w[i])).join('  '));
    say('  ' + w.map(x => '-'.repeat(x)).join('  '));
    body.forEach(r => say('  ' + r.map((c, i) => String(c).padEnd(w[i])).join('  ')));
  }
};

/* ------------------------------------------------------------- detection -- */
/* One place that decides which constructs a record exhibits. Order is irrelevant;
   each entry is [constructKey, presentBool, refinedVerdictOrNull]. */
function constructsOf(r) {
  const c = [];
  const push = (k, on, v) => { if (on) c.push([k, v || null]); };
  const s = r.slots || {};
  const top = r.state_top, sc = r.state_scrolled, deep = r.state_deep;
  const blurPx = str => { const m = /blur\((\d+(?:\.\d+)?)px\)/.exec(str || ''); return m ? parseFloat(m[1]) : null; };
  /* Blur radius and saturation are both settable since theme 2.5.90, so any blur+saturate combo is
     EXACT. Only an extra filter function the theme cannot emit (contrast, brightness, hue-rotate)
     still lands as NEAR. */
  const plainBlur = str => blurPx(str) !== null && !/contrast|brightness|hue-rotate|grayscale|sepia|invert/.test(str || '');

  push('position', true);
  push('bg_at_rest', true);
  push('header_height', true);
  push('row_padding', true);
  push('container_width', true);
  push('logo', true);
  push('menu_typography', true);
  push('slot_layout', true, (s.kids || []).filter(k => !k.hidden).length > 3 ? 'NEAR' : 'EXACT');

  if (r.backdrop && r.backdrop !== 'none') push('glass_blur', true, plainBlur(r.backdrop) ? 'EXACT' : 'NEAR');
  const bw = parseFloat(r.borderBottom);
  push('bottom_border', bw > 0 && !/rgba\([^)]*,\s*0\)$/.test(r.borderBottom || ''));
  push('shadow', r.boxShadow && r.boxShadow !== 'none');
  push('gradient_bg', s.hdrBgImage && s.hdrBgImage !== 'none');
  push('centred_nav', s.navCentered === true);

  const sn = r.sniff || {};
  push('cta_button', sn.cta_count > 0);
  push('cart', !!sn.has_cart);
  push('search', !!sn.has_search);
  push('social_icons', sn.social_links > 0);
  push('tel_mail', sn.tel_mail_links > 0);
  push('theme_toggle', !!sn.has_theme_toggle);
  push('dropdown_submenu', sn.submenu_nodes > 0);
  push('topbar', !!r.topbar);

  /* hover — classify from the rest/hover pseudo-element diff */
  if (r.link_rest && r.link_hover) {
    const ch = f => r.link_rest[f] !== r.link_hover[f];
    const pseudo = ['afterW', 'afterScale', 'afterTransform', 'beforeW', 'beforeScale', 'beforeTransform'].some(ch);
    if (pseudo) push('hover_underline', true);
    else if (ch('bg')) push('hover_fill', true);
    else if (ch('opacity')) push('hover_opacity', true);
    else if (ch('color')) push('hover_colour', true);
  }

  /* two-state */
  if (top && sc) {
    push('scrolled_bg', top.bg !== sc.bg);
    if (top.backdrop !== sc.backdrop) push('scrolled_glass', true, plainBlur(sc.backdrop) ? 'EXACT' : 'NEAR');
    push('scrolled_border', top.border !== sc.border);
    push('scrolled_shadow', top.shadow !== sc.shadow);
    push('scrolled_height', top.h !== sc.h);
    push('scrolled_padding', top.pad !== sc.pad);
    push('scrolled_link_colour', top.color !== sc.color);
    push('hide_on_scroll', !!(deep && deep.transform !== 'none' && deep.transform !== top.transform));
  }

  /* floating / detached geometry */
  const rad = parseFloat(s.hdrRadius) || parseFloat(s.barRadius) || 0;
  push('floating_radius', rad > 0);
  push('floating_top_offset', s.hdrY > 2);
  push('floating_side_inset', s.hdrX > 2);

  /* mobile */
  if (r.mobile) {
    if (r.mobile.burger_count > 0) push('hamburger_drawer', true);
    else push('no_mobile_nav_in_source', true, STRICT_MOBILE ? 'CSS' : 'EXACT');
  }
  if (r.drawer) push('drawer_fullscreen', r.drawer.fullscreen || r.drawer.w >= 350);


  /* footer — present only on surveys captured with the footer probe (v1.1+) */
  const f = r.footer;
  if (f && f.found) {
    push('footer_rows', f.rowCount > 0, f.rowCount > 4 ? 'NEAR' : 'EXACT');
    if (f.cols) {
      push('footer_columns', true, f.cols.count > 8 ? 'NEAR' : 'EXACT');   // split-slider max is 8
      push('footer_column_ratio', !f.cols.equal);
    }
    push('footer_bg', true);
    push('footer_border_top', !!f.borderTop);
    push('footer_padding', true);
    push('footer_logo', !!f.has_logo);
    push('footer_social', f.social_links > 0);
    push('footer_newsletter', !!f.has_newsletter);
    push('footer_back_to_top', !!f.has_back_to_top);
    push('footer_copyright', !!f.has_copyright);
    push('footer_tel_mail', f.tel_mail > 0);
    push('footer_headings', f.headings > 0);
    if (r.footerLinkHover && f.linkRest) push('footer_link_hover', r.footerLinkHover.color !== f.linkRest.color);
    if (f.cols && f.cols.gap && f.cols.gap !== 'normal') push('footer_col_gap', true);
    if (r.footerMobile) push('footer_mobile_columns', !r.footerMobile.stacked);
  }
  return c;
}

/* ---------------------------------------------------------------- report -- */
for (const file of files) {
  const all = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ok = all.filter(r => r.found);
  const N = ok.length || 1;
  const name = path.basename(file).replace(/\.json$/, '');
  const pct = v => `${v} (${Math.round(100 * v / N)}%)`;

  H(1, `${name} — ${all.length} urls · ${ok.length} headers · ${all.filter(r => !r.found && !r.error).length} no-masthead · ${all.filter(r => r.error).length} errors`);

  const tally = fn => { const m = new Map(); ok.forEach(r => { const k = String(fn(r)); m.set(k, (m.get(k) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); };
  const dist = (title, fn, lim = 8) => rows([title, 'n', '%'], tally(fn).slice(0, lim).map(([k, v]) => [k.length > 58 ? k.slice(0, 57) + '…' : k, v, Math.round(100 * v / N) + '%']));
  const stat = fn => { const a = ok.map(fn).filter(x => typeof x === 'number' && !isNaN(x)).sort((x, y) => x - y); if (!a.length) return 'n/a'; const q = p => a[Math.floor(p * (a.length - 1))]; return `min ${a[0]} · p25 ${q(.25)} · med ${q(.5)} · p75 ${q(.75)} · max ${a[a.length - 1]}`; };

  if (SECTION === 'all' || SECTION === 'anatomy') {
    H(2, 'Anatomy');
    rows(['metric', 'distribution'], [
      ['header height (px)', stat(r => r.rect.h)],
      ['nodes in header', stat(r => r.nodeCount)],
      ['DOM depth', stat(r => r.depth)],
      ['direct children', stat(r => r.childCount)],
      ['nav items', stat(r => r.sniff.nav_item_count)],
    ]);
    dist('masthead tag', r => r.tag, 5);
    dist('position', r => r.position, 5);
    say(MD ? `\n\`<header>\` present ${pct(ok.filter(r => r.doc.hasHeaderTag).length)} · and IS the masthead ${pct(ok.filter(r => r.doc.headerTagIsMasthead).length)} · is something else (hero) ${pct(ok.filter(r => r.doc.hasHeaderTag && !r.doc.headerTagIsMasthead).length)}\n`
                : `\n  <header> present ${pct(ok.filter(r => r.doc.hasHeaderTag).length)} · IS the masthead ${pct(ok.filter(r => r.doc.headerTagIsMasthead).length)} · is the hero ${pct(ok.filter(r => r.doc.hasHeaderTag && !r.doc.headerTagIsMasthead).length)}`);
    dist('inner container max-width', r => r.inner.maxWidth, 6);
    dist('background at rest', r => /rgba\([^)]*,\s*0\)/.test(r.bg) ? 'transparent' : r.bg, 6);
    dist('backdrop-filter', r => r.backdrop, 6);
    dist('font stack', r => r.fontFamily.split(',')[0], 6);
    dist('slot order (L→R)', r => (r.slots && r.slots.slotOrder) || '(none)', 6);

    H(2, 'Two-state behaviour');
    const st = ok.filter(r => r.state_top && r.state_scrolled);
    const ch = f => st.filter(r => r.state_top[f] !== r.state_scrolled[f]).length;
    const anyCh = st.filter(r => ['bg', 'backdrop', 'h', 'shadow', 'border', 'transform', 'pad'].some(f => r.state_top[f] !== r.state_scrolled[f])).length;
    rows(['property', 'changes on scroll'], [
      ['ANY visual change', `${anyCh} (${Math.round(100 * anyCh / (st.length || 1))}%)`],
      ...['bg', 'backdrop', 'h', 'pad', 'border', 'shadow', 'color'].map(f => [f, `${ch(f)} (${Math.round(100 * ch(f) / (st.length || 1))}%)`]),
    ]);
    const shrink = st.filter(r => r.state_scrolled.h < r.state_top.h - 2).map(r => r.state_top.h - r.state_scrolled.h).sort((a, b) => a - b);
    say(`  shrink: ${shrink.length} sites, median drop ${shrink.length ? shrink[Math.floor(shrink.length / 2)] : 0}px`);

    H(2, 'Content slots & mobile');
    const S = f => pct(ok.filter(r => r.sniff[f]).length);
    say(`  CTA ${pct(ok.filter(r => r.sniff.cta_count > 0).length)} · cart ${S('has_cart')} · search ${S('has_search')} · topbar ${pct(ok.filter(r => r.topbar).length)} · submenus ${pct(ok.filter(r => r.sniff.submenu_nodes > 0).length)}`);
    const mb = ok.filter(r => r.mobile);
    say(`  mobile: burger on ${mb.filter(r => r.mobile.burger_count > 0).length}/${mb.length} · median visible links ${(() => { const a = mb.map(r => r.mobile.visible_links).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 'n/a'; })()}`);
    const dr = ok.filter(r => r.drawer);
    if (dr.length) say(`  drawer (${dr.length} opened): fullscreen ${dr.filter(r => r.drawer.fullscreen).length} · full-width sheet ${dr.filter(r => !r.drawer.fullscreen && r.drawer.w >= 350).length} · side ${dr.filter(r => r.drawer.w < 350).length}`);
  }

  if ((SECTION === 'all' || SECTION === 'anatomy') && ok.some(r => r.footer && r.footer.found)) {
    const F = ok.filter(r => r.footer && r.footer.found);
    const fpc = v => `${v} (${Math.round(100 * v / F.length)}%)`;
    H(2, `Footer (${F.length} resolved)`);
    const fstat = fn => { const a = F.map(fn).filter(x => typeof x === 'number' && !isNaN(x)).sort((x, y) => x - y); return a.length ? `min ${a[0]} · med ${a[Math.floor(a.length/2)]} · max ${a[a.length-1]}` : 'n/a'; };
    rows(['metric', 'distribution'], [
      ['footer height (px)', fstat(r => r.footer.rect.h)],
      ['nodes in footer', fstat(r => r.footer.nodeCount)],
      ['stacked rows', fstat(r => r.footer.rowCount)],
      ['links', fstat(r => r.footer.link_count)],
    ]);
    { const m = new Map(); F.forEach(r => { const c = r.footer.cols; const k = c ? `${c.count} cols${c.equal ? ' (equal)' : ' (unequal)'}` : 'no column band'; m.set(k, (m.get(k)||0)+1); });
      rows(['column layout', 'n', '%'], [...m].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v]) => [k, v, Math.round(100*v/F.length)+'%'])); }
    { const m = new Map(); F.forEach(r => { const k = /rgba\([^)]*,\s*0\)/.test(r.footer.bg) ? 'transparent' : r.footer.bg; m.set(k,(m.get(k)||0)+1); });
      rows(['footer background', 'n', '%'], [...m].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v]) => [k, v, Math.round(100*v/F.length)+'%'])); }
    say(`  <footer> tag is the resolved element on ${fpc(F.filter(r => r.footer.doc.footerTagIsResolved).length)}`);
    say(`  top border ${fpc(F.filter(r => r.footer.borderTop).length)} · logo ${fpc(F.filter(r => r.footer.has_logo).length)} · social ${fpc(F.filter(r => r.footer.social_links > 0).length)} · newsletter ${fpc(F.filter(r => r.footer.has_newsletter).length)}`);
    say(`  copyright ${fpc(F.filter(r => r.footer.has_copyright).length)} · back-to-top ${fpc(F.filter(r => r.footer.has_back_to_top).length)} · column headings ${fpc(F.filter(r => r.footer.headings > 0).length)}`);
  }

  if (SECTION === 'all' || SECTION === 'coverage') {
    H(2, 'Theme-settings coverage');
    const agg = new Map();
    const perSite = new Map();
    for (const r of ok) {
      for (const [key, refined] of constructsOf(r)) {
        const def = MAP.constructs[key];
        if (!def) continue;
        const verdict = refined || def.verdict;
        if (!agg.has(key)) agg.set(key, { EXACT: 0, NEAR: 0, CSS: 0, sites: 0, gap: def.gap || '', option: def.option || '—' });
        const a = agg.get(key); a[verdict]++; a.sites++;
        if (!perSite.has(r.url)) perSite.set(r.url, { EXACT: 0, NEAR: 0, CSS: 0 });
        perSite.get(r.url)[verdict]++;
      }
    }
    rows(['construct', 'sites', 'verdict', 'gap', 'option'],
      [...agg].sort((a, b) => b[1].sites - a[1].sites).map(([k, v]) => {
        const t = v.EXACT + v.NEAR + v.CSS;
        const verdict = v.CSS === t ? 'CSS' : v.NEAR === t ? 'NEAR' : v.EXACT === t ? 'EXACT'
          : `E${v.EXACT}/N${v.NEAR}/C${v.CSS}`;
        return [k, v.sites, verdict, v.gap, String(v.option).slice(0, 46)];
      }));

    const tot = { EXACT: 0, NEAR: 0, CSS: 0 };
    perSite.forEach(v => { tot.EXACT += v.EXACT; tot.NEAR += v.NEAR; tot.CSS += v.CSS; });
    const T = tot.EXACT + tot.NEAR + tot.CSS || 1;
    const sites = [...perSite.values()];
    const clean = sites.filter(v => !v.CSS && !v.NEAR).length;
    const nearOnly = sites.filter(v => !v.CSS && v.NEAR).length;
    const needCss = sites.filter(v => v.CSS).length;
    H(3, 'Rollup');
    rows(['measure', 'value'], [
      ['construct instances EXACT', `${tot.EXACT} (${(100 * tot.EXACT / T).toFixed(1)}%)`],
      ['construct instances NEAR', `${tot.NEAR} (${(100 * tot.NEAR / T).toFixed(1)}%)`],
      ['construct instances CSS', `${tot.CSS} (${(100 * tot.CSS / T).toFixed(1)}%)`],
      ['sites reproducible exactly', `${clean} / ${sites.length} (${Math.round(100 * clean / (sites.length || 1))}%)`],
      ['sites settings-only, values quantised', `${nearOnly} / ${sites.length} (${Math.round(100 * nearOnly / (sites.length || 1))}%)`],
      ['sites needing custom CSS', `${needCss} / ${sites.length} (${Math.round(100 * needCss / (sites.length || 1))}%)`],
    ]);
    if (!STRICT_MOBILE && agg.has('no_mobile_nav_in_source'))
      say(`  note: ${agg.get('no_mobile_nav_in_source').sites} sites have NO mobile nav in the source (theme supplies one). Counted as non-defect; re-run with --strict-mobile to count them as misses.`);

    const gapsHit = [...new Set([...agg.values()].map(v => v.gap).filter(Boolean))];
    if (gapsHit.length) {
      H(3, 'Gaps triggered by this corpus');
      rows(['id', 'title', 'fix'], MAP.gaps.filter(g => gapsHit.includes(g.id)).map(g => [g.id, g.title, g.fix.slice(0, 88)]));
    }
  }
}

console.log(out.join('\n'));
