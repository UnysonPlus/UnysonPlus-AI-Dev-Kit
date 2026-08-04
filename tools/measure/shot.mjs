// shot.mjs — one general screenshot tool. Replaces the finalshot/heroshot/footshot one-offs an agent keeps
// writing. Full page, viewport, or a single region (by CSS selector or text) — playwright-core + system
// Chrome so it runs anywhere.
//
//   node shot.mjs <url>                              # viewport (1440×900) → ./shot.png
//   node shot.mjs <url> --full --out page.png        # full page
//   node shot.mjs <url> --sel "footer" --out foot.png     # clip to a region (element bounding box)
//   node shot.mjs <url> --text "24/7 Care" --pad 20  # clip around the element containing that text
//   node shot.mjs <url> --width 1440 --height 900
import { chromium } from 'playwright-core';

const argv = process.argv.slice(2);
const url = argv.find((a) => !a.startsWith('--'));
const flag = (n) => { const f = argv.find((a) => a.startsWith('--' + n + '=')); if (f) return f.slice(n.length + 3); const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : ''; };
const has = (n) => argv.includes('--' + n);
if (!url) { console.error('usage: node shot.mjs <url> [--full | --sel "css" | --text "…"] [--out file.png] [--pad 12] [--width 1440] [--height 900]'); process.exit(1); }

const out = flag('out') || 'shot.png';
const sel = flag('sel');
const text = flag('text');
const pad = parseInt(flag('pad') || '0', 10) || 0;
const width = parseInt(flag('width') || '1440', 10) || 1440;
const height = parseInt(flag('height') || '900', 10) || 900;
const full = has('full');

const b = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const p = await b.newPage();
  await p.setViewportSize({ width, height: full ? Math.max(height, 2400) : height });
  await p.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1500);
  let clip = null;
  if (sel || text) {
    clip = await p.evaluate(({ sel, text, pad }) => {
      let el;
      if (sel) el = document.querySelector(sel);
      else { const re = String(text).toLowerCase(); el = [...document.querySelectorAll('body *')].filter((e) => (e.textContent || '').toLowerCase().includes(re) && e.offsetParent !== null).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0]; }
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });   // bring below-the-fold regions into the viewport so the clip is valid
      const r = el.getBoundingClientRect();
      return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), width: r.width + pad * 2, height: r.height + pad * 2 };
    }, { sel, text, pad });
    if (!clip) { console.error('shot: no element matched ' + (sel || `text "${text}"`)); process.exit(1); }
  }
  await p.screenshot({ path: out, fullPage: full && !clip, clip: clip || undefined });
  console.log('→ ' + out + (clip ? ` (region ${Math.round(clip.width)}×${Math.round(clip.height)})` : full ? ' (full page)' : ` (viewport ${width}×${height})`));
} finally { await b.close(); }
