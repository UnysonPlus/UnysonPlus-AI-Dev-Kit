// probe.mjs — the GENERAL element probe. Measure an element's computed props on a page, or DIFF the same
// element on two pages (source vs. build). This replaces the endless one-off Playwright scripts an agent
// writes to answer "what's the fontSize / margin / width of X?" — run this instead of hand-rolling a probe.
//
// Uses playwright-core + system Chrome (channel:chrome) so it runs anywhere playwright-core is present
// (this folder, or the capture-service) without a bundled-browser install.
//
//   node probe.mjs <url> --text "Second Home" --props "fontSize,fontWeight,color,margin"
//   node probe.mjs <url> --sel "footer h3"                       # default prop set
//   node probe.mjs <buildUrl> --text "Reserve a Spot" --vs <srcUrl>   # SOURCE-vs-BUILD diff (only differing props)
//   node probe.mjs <url> --sel ".card" --all                     # every match, not just the first
//   node probe.mjs <url> --text "24/7 Care" --props "animationName,animationDuration" --width 1440
//
// --text is case-insensitive substring match on trimmed textContent (prefers the SMALLEST matching element,
// so "Second Home" hits the <span>, not <body>). --sel is a CSS selector. Output is JSON.
import { chromium } from 'playwright-core';

const argv = process.argv.slice(2);
const url = argv.find((a) => !a.startsWith('--'));
const flag = (n) => { const f = argv.find((a) => a.startsWith('--' + n + '=')); if (f) return f.slice(n.length + 3); const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : ''; };
const has = (n) => argv.includes('--' + n);
const sel = flag('sel');
const text = flag('text');
const vs = flag('vs');
const width = parseInt(flag('width') || '1440', 10) || 1440;
const all = has('all');
const DEFAULT_PROPS = ['fontSize', 'fontWeight', 'color', 'backgroundColor', 'margin', 'padding', 'textAlign', 'lineHeight', 'letterSpacing', 'display', 'width', 'maxWidth', 'borderRadius', 'boxShadow'];
const props = (flag('props') ? flag('props').split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_PROPS);

if (!url || (!sel && !text)) {
  console.error('usage: node probe.mjs <url> (--text "…" | --sel "css") [--props "a,b,c"] [--vs <url2>] [--all] [--width 1440]');
  process.exit(1);
}

// Runs IN the page. Finds matches by --sel or by smallest-element text match, returns {text,tag,cls,rect,props}.
const collect = ({ sel, text, props, all }) => {
  const pick = () => {
    if (sel) return [...document.querySelectorAll(sel)];
    const re = String(text).toLowerCase();
    const hit = [...document.querySelectorAll('body *')].filter((e) => (e.textContent || '').toLowerCase().includes(re) && e.offsetParent !== null);
    // smallest matching elements first (fewest descendants) so we grab the leaf, not a wrapper
    hit.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    return hit;
  };
  const els = pick().slice(0, all ? 20 : 1);
  return els.map((e) => {
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const o = {};
    for (const p of props) o[p] = cs[p];
    return { text: (e.textContent || '').trim().slice(0, 48), tag: e.tagName.toLowerCase(), cls: (e.className || '').toString().slice(0, 70), rect: { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }, props: o };
  });
};

const b = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const grab = async (u) => {
    const p = await b.newPage(); await p.setViewportSize({ width, height: 900 });
    await p.goto(u, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(1200);
    const r = await p.evaluate(collect, { sel, text, props, all });
    await p.close(); return r;
  };
  if (vs) {
    const [src, dev] = await Promise.all([grab(vs), grab(url)]);   // --vs is the SOURCE; positional url is the BUILD
    const s = src[0]; const d = dev[0];
    if (!s || !d) { console.log(JSON.stringify({ match: sel || text, source: s || null, build: d || null, note: 'element missing on one side' }, null, 1)); }
    else {
      const diff = props.map((p) => ({ prop: p, source: s.props[p], build: d.props[p] })).filter((x) => String(x.source) !== String(x.build));
      const rectDiff = ['x', 'w', 'h'].map((k) => ({ prop: 'rect.' + k, source: s.rect[k], build: d.rect[k] })).filter((x) => x.source !== x.build);
      console.log(JSON.stringify({ match: sel || text, differ: [...rectDiff, ...diff], source: { rect: s.rect, props: s.props }, build: { rect: d.rect, props: d.props } }, null, 1));
    }
  } else {
    console.log(JSON.stringify({ url, match: sel || text, matches: await grab(url) }, null, 1));
  }
} finally { await b.close(); }
