// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// layout-audit.mjs — the SELF-CHECK spacing lens: one page, no source, no mockup.
//
// Why this exists: every other lens in this folder compares a build against something (a source site,
// a mockup). A FRESH build has nothing to compare against, so a heading jammed under a shape divider,
// text touching the phone's edge or two blocks overlapping passed every check and was only found by a
// person looking at the page. This lens looks at the page the way that person would, at desktop AND
// phone width, and reports what a visitor would notice:
//
//   COLLISION  content overlapping, or closer than --clear px to, a section's shape divider, a pattern
//              edge it shouldn't touch, or the sticky header on load.
//   OVERLAP    two pieces of visible content whose boxes intersect (text over text, text over a form).
//   GUTTER     content closer than --gutter px to the left / right edge of the viewport.
//   CRAMPED    a heading or paragraph with less than --tight px to the next block below it.
//   RHYTHM     a section whose top / bottom padding is far from the page's usual section padding (info).
//
//   node layout-audit.mjs <url> [--widths 1440,390] [--clear 40] [--gutter 12] [--tight 8] [--root main]
//
// --clear is a DESIGN threshold, not a technical one: 24px of air under a divider measures as "not
// touching" and still looks cramped (found on a real build). 40px is the default for that reason.
//
// Exit code 1 when any COLLISION / OVERLAP / GUTTER is found, so it can gate a build step.
import { launchBrowser, openPage, closeQuiet, evaluateSafe } from './lib/browser.mjs';

const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith('--'));
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const url = pos[0];
if (!url) {
  console.error('usage: node layout-audit.mjs <url> [--widths 1440,390] [--clear 40] [--gutter 12] [--tight 8] [--root main]');
  process.exit(1);
}
const widths = flag('widths', '1440,390').split(',').map((w) => parseInt(w, 10)).filter(Boolean);
const opts = {
  clear: parseInt(flag('clear', '40'), 10),
  gutter: parseInt(flag('gutter', '12'), 10),
  tight: parseInt(flag('tight', '8'), 10),
  root: flag('root', 'main'),
};

// Runs in the page.
const audit = (o) => {
  const vw = document.documentElement.clientWidth;
  const sy = window.scrollY;
  const R = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + sy, w: r.width, h: r.height, r: r.right, b: r.bottom + sy }; };
  const visible = (el) => {
    const c = getComputedStyle(el);
    if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const label = (el) => {
    const t = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ');
    return (el.tagName.toLowerCase() + (t ? ' "' + t.slice(0, 40) + '"' : '') + (el.id ? '#' + el.id : ''));
  };
  const root = document.querySelector(o.root) || document.body;

  // Decorations: absolutely placed art that content must keep clear of.
  const deco = [...root.querySelectorAll('.sc-shape-divider')].filter(visible);
  // Content leaves: what a visitor reads or uses. Decorative / hidden things are skipped.
  // Markers and icons count too: a step number or card icon jammed under a divider looks just as wrong as text.
  const leafSel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,label,a.btn,button,input,select,textarea,img,.btn,svg,.fw-steps__marker,[class*="__icon"],[class*="badge"]';
  const isDecor = (el) => el.closest('.sc-shape-divider,.pattern-layer,[aria-hidden="true"],[data-upw-scene],.fw-lg__track,.screen-reader-text,script,style');
  const leaves = [...root.querySelectorAll(leafSel)].filter((el) => visible(el) && !isDecor(el))
    // keep only the innermost: drop a leaf that contains another leaf (a <li> holding a <p>)
    .filter((el, _, all) => !all.some((o2) => o2 !== el && el.contains(o2)));

  const findings = [];
  const inter = (a, b) => Math.min(a.r, b.r) - Math.max(a.x, b.x) > 2 && Math.min(a.b, b.b) - Math.max(a.y, b.y) > 2;

  // COLLISION with shape dividers.
  for (const d of deco) {
    const dr = R(d);
    const top = d.classList.contains('sc-shape-divider--top');
    const band = d.parentElement;
    for (const el of leaves) {
      if (!band.contains(el)) continue;
      const er = R(el);
      if (er.r < dr.x || er.x > dr.r) continue;
      const gap = top ? er.y - dr.b : dr.y - er.b;
      if (gap < o.clear) {
        findings.push({ kind: 'COLLISION', where: (band.id ? '#' + band.id : label(band)), what: label(el),
          detail: (gap < 0 ? 'overlaps the ' : 'is ' + Math.round(gap) + 'px from the ') + (top ? 'top' : 'bottom') + ' divider (' + Math.round(dr.h) + 'px tall); want ≥ ' + o.clear + 'px' });
        break; // one per divider is enough to locate it
      }
    }
  }

  // COLLISION with a fixed / sticky header, at the top of the page.
  const hdr = document.querySelector('header.site-header, #masthead, header');
  if (hdr) {
    const hc = getComputedStyle(hdr);
    if (hc.position === 'fixed' || hc.position === 'sticky' || hc.position === 'absolute') {
      const hb = hdr.getBoundingClientRect().bottom;
      const first = leaves.find((el) => el.getBoundingClientRect().top >= 0);
      if (first && first.getBoundingClientRect().top < hb + 8 && !hdr.contains(first)) {
        findings.push({ kind: 'COLLISION', where: 'header', what: label(first), detail: 'starts under the ' + hc.position + ' header (' + Math.round(hb) + 'px)' });
      }
    }
  }

  // OVERLAP between content leaves (skip ancestors / images inside links etc.).
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i], b = leaves[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = R(a), rb = R(b);
      if (inter(ra, rb)) {
        findings.push({ kind: 'OVERLAP', where: '', what: label(a), detail: 'overlaps ' + label(b) });
        if (findings.filter((f) => f.kind === 'OVERLAP').length > 12) { i = leaves.length; break; }
      }
    }
  }

  // GUTTER: content touching the viewport edge.
  for (const el of leaves) {
    const r = el.getBoundingClientRect();
    if (r.width >= vw - 1) continue; // deliberately full-bleed (an image band)
    if (r.left < o.gutter || vw - r.right < o.gutter) {
      findings.push({ kind: 'GUTTER', where: '', what: label(el), detail: 'left ' + Math.round(r.left) + 'px / right ' + Math.round(vw - r.right) + 'px from the edge; want ≥ ' + o.gutter + 'px' });
    }
  }

  // CRAMPED: a text block with almost nothing before the next block below it in the same column.
  const textLeaves = leaves.filter((el) => /^(H[1-6]|P|LI|BLOCKQUOTE|LABEL)$/.test(el.tagName));
  for (const el of textLeaves) {
    const a = R(el);
    let next = null, best = Infinity;
    for (const o2 of leaves) {
      if (o2 === el) continue;
      const b = R(o2);
      if (b.y < a.b - 2 || b.r < a.x || b.x > a.r) continue;
      const g = b.y - a.b;
      if (g < best) { best = g; next = o2; }
    }
    if (next && best >= 0 && best < o.tight && !(el.tagName === 'LI' && next.tagName === 'LI') && !(el.tagName === 'LABEL')) {
      findings.push({ kind: 'CRAMPED', where: '', what: label(el), detail: Math.round(best) + 'px above ' + label(next) });
    }
  }

  // RHYTHM: section padding against the page's median.
  const bands = [...root.querySelectorAll(':scope section, :scope .fw-page-builder-content > *')].filter((b) => visible(b) && b.getBoundingClientRect().height > 80);
  const pads = bands.map((b) => { const c = getComputedStyle(b); return { b, t: parseFloat(c.paddingTop) || 0, bo: parseFloat(c.paddingBottom) || 0 }; });
  const med = (arr) => { const s = [...arr].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const mt = med(pads.map((p) => p.t)), mb = med(pads.map((p) => p.bo));
  const rows = pads.map((p) => ({ id: p.b.id || label(p.b).slice(0, 24), top: Math.round(p.t), bottom: Math.round(p.bo),
    divider: [...p.b.querySelectorAll(':scope > .sc-shape-divider')].map((d) => Math.round(d.getBoundingClientRect().height)).join('/') }));
  for (const p of pads) {
    if (mt && Math.abs(p.t - mt) / mt > 0.4) findings.push({ kind: 'RHYTHM', where: p.b.id ? '#' + p.b.id : '', what: 'padding-top ' + Math.round(p.t) + 'px', detail: 'page median ' + Math.round(mt) + 'px' });
    if (mb && Math.abs(p.bo - mb) / mb > 0.4) findings.push({ kind: 'RHYTHM', where: p.b.id ? '#' + p.b.id : '', what: 'padding-bottom ' + Math.round(p.bo) + 'px', detail: 'page median ' + Math.round(mb) + 'px' });
  }
  return { vw, rows, findings };
};

const b = await launchBrowser();
let failed = 0;
try {
  for (const width of widths) {
    const page = await openPage(b, url, { width, height: width < 600 ? 844 : 1000 });
    // Scroll through once so lazy / on-view content has laid out before measuring, then return to top.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(600);
    const res = await evaluateSafe(page, audit, opts);
    await closeQuiet(page);
    console.log(`\n=== ${width}px — sections (padding top / bottom, divider heights) ===`);
    for (const r of res.rows) console.log(`  ${String(r.id).padEnd(26)} ${String(r.top).padStart(4)} / ${String(r.bottom).padEnd(4)} ${r.divider ? ' divider ' + r.divider : ''}`);
    const order = ['COLLISION', 'OVERLAP', 'GUTTER', 'CRAMPED', 'RHYTHM'];
    const f = res.findings.sort((x, y) => order.indexOf(x.kind) - order.indexOf(y.kind));
    if (!f.length) console.log('  ✓ nothing to report');
    for (const x of f) console.log(`  ${x.kind.padEnd(9)} ${x.where ? x.where + ' ' : ''}${x.what} — ${x.detail}`);
    failed += f.filter((x) => ['COLLISION', 'OVERLAP', 'GUTTER'].includes(x.kind)).length;
  }
} finally { await closeQuiet(b); }
console.log(failed ? `\n✗ ${failed} blocking finding(s)` : '\n✓ no blocking findings');
process.exit(failed ? 1 : 0);
