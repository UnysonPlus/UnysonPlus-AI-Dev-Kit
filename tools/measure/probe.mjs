// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// probe.mjs — the GENERAL element probe. Measure an element's computed props on a page, or DIFF the same
// element on two pages (source vs. build). This replaces the endless one-off Playwright scripts an agent
// writes to answer "what's the fontSize / margin / width of X?" — run this instead of hand-rolling a probe.
//
// The browser session and the element-picking rule live in ./lib, shared with every other tool here, so a
// number from probe is directly comparable to one from fidelity-check or container-check.
//
//   node probe.mjs <url> --text "Second Home" --props "fontSize,fontWeight,color,margin"
//   node probe.mjs <url> --sel "footer h3"                       # default prop set
//   node probe.mjs <buildUrl> --text "Reserve a Spot" --vs <srcUrl>   # SOURCE-vs-BUILD diff (only differing props)
//   node probe.mjs <url> --sel ".card" --all                     # every match, not just the first
//   node probe.mjs <build> --text "Get a quote" --vs <src> --hover   # measure the HOVER state on both
//   node probe.mjs <url> --text "24/7 Care" --props "animationName,animationDuration" --width 1440
//
// --text is case-insensitive substring match on trimmed textContent (prefers the SMALLEST matching element,
// so "Second Home" hits the <span>, not <body>). --sel is a CSS selector. Output is JSON.
import { launchBrowser, openPage, closeQuiet, evaluateSafe } from './lib/browser.mjs';
import { DEFAULT_PROPS, collectElements, diffElements } from './lib/elements.mjs';

const argv = process.argv.slice(2);
const url = argv.find((a) => !a.startsWith('--'));
const flag = (n) => { const f = argv.find((a) => a.startsWith('--' + n + '=')); if (f) return f.slice(n.length + 3); const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : ''; };
const has = (n) => argv.includes('--' + n);
const sel = flag('sel');
const text = flag('text');
const vs = flag('vs');
const width = parseInt(flag('width') || '1440', 10) || 1440;
const all = has('all');
const hover = has('hover');
const props = (flag('props') ? flag('props').split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_PROPS);

if (!url || (!sel && !text)) {
  console.error('usage: node probe.mjs <url> (--text "…" | --sel "css") [--props "a,b,c"] [--vs <url2>] [--all] [--width 1440]');
  process.exit(1);
}

const b = await launchBrowser();
try {
  const grab = async (u) => {
    const p = await openPage(b, u, { width });
    if (hover) {
      // Hover state is a real part of a button's design and nothing here could read it. Point the mouse
      // at the element the probe is about to measure, let its transition finish, then read.
      const box = await evaluateSafe(p, ({ sel, text }) => {
        let el;
        if (sel) el = document.querySelector(sel);
        else { const n = String(text).toLowerCase(); el = [...document.querySelectorAll('body *')]
          .filter((e) => (e.textContent || '').toLowerCase().includes(n) && e.offsetParent !== null)
          .sort((a, z) => a.querySelectorAll('*').length - z.querySelectorAll('*').length)[0]; }
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, { sel, text });
      if (box) { await p.mouse.move(box.x, box.y); await p.waitForTimeout(700); }
    }
    const r = await evaluateSafe(p, collectElements, { sel, text, props, all });
    await closeQuiet(p);
    return r;
  };
  if (vs) {
    const [src, dev] = await Promise.all([grab(vs), grab(url)]);   // --vs is the SOURCE; positional url is the BUILD
    const s = src[0]; const d = dev[0];
    if (!s || !d) {
      console.log(JSON.stringify({ match: sel || text, source: s || null, build: d || null, note: 'element missing on one side' }, null, 1));
    } else {
      console.log(JSON.stringify({
        match: sel || text,
        differ: diffElements(s, d, props),
        source: { rect: s.rect, props: s.props },
        build: { rect: d.rect, props: d.props },
      }, null, 1));
    }
  } else {
    console.log(JSON.stringify({ url, match: sel || text, matches: await grab(url) }, null, 1));
  }
} finally { await closeQuiet(b); }
