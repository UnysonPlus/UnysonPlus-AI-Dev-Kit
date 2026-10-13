// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// shot.mjs — one general screenshot tool. Replaces the finalshot/heroshot/footshot one-offs an agent keeps
// writing. Full page, viewport, or a single region (by CSS selector or text) — playwright-core + system
// Chrome so it runs anywhere.
//
//   node shot.mjs <url>                              # viewport (1440×900) → ./shot.png
//   node shot.mjs <url> --full --out page.png        # full page
//   node shot.mjs <url> --sel "footer" --out foot.png     # clip to a region (element bounding box)
//   node shot.mjs <url> --text "24/7 Care" --pad 20  # clip around the element containing that text
//   node shot.mjs <url> --width 1440 --height 900
//   node shot.mjs <url> --full --no-settle           # skip the reveal pass (see below)
import { launchBrowser, openPage, closeQuiet } from './lib/browser.mjs';

const argv = process.argv.slice(2);
const url = argv.find((a) => !a.startsWith('--'));
const flag = (n) => { const f = argv.find((a) => a.startsWith('--' + n + '=')); if (f) return f.slice(n.length + 3); const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : ''; };
const has = (n) => argv.includes('--' + n);
if (!url) { console.error('usage: node shot.mjs <url> [--full | --sel "css" | --text "…"] [--out file.png] [--pad 12] [--width 1440] [--height 900] [--no-settle]'); process.exit(1); }

const out = flag('out') || 'shot.png';
const sel = flag('sel');
const text = flag('text');
const pad = parseInt(flag('pad') || '0', 10) || 0;
const width = parseInt(flag('width') || '1440', 10) || 1440;
const height = parseInt(flag('height') || '900', 10) || 900;
const full = has('full');

const b = await launchBrowser();
try {
  const p = await openPage(b, url, { width, height: full ? Math.max(height, 2400) : height });

  // SCROLL-REVEAL CONTENT IS NOT MISSING CONTENT.
  //
  // A converted page carries entrance animations: each band starts at `opacity: 0` and is revealed when it
  // scrolls into view. A full-page screenshot never scrolls, so every band below the fold photographs BLANK
  // -- and a full-page pair then shows five empty regions that are present, correct and merely unrevealed.
  //
  // Measured: a whole-page comparison showed 6 bands as 'completely empty' on the converted side. All 6 were
  // in the DOM, at `opacity: 0`, under `.sc-anim-pending`. The total page HEIGHT matched the source to within
  // 4px, which is the tell -- the bands were reserving their space, so nothing was missing at all.
  //
  // So settle first: walk the page to trigger the reveals, then force anything still pending to its end
  // state (a reveal keyed to an observer that never fires leaves the band invisible forever), and return to
  // the top so a full-page capture starts where it should.
  // Runs for a CLIPPED shot too, not just --full. A region shot scrollIntoView()s its element, which can
  // trigger the reveal -- but only if an observer is watching; a band already settled at opacity 0, or one
  // whose observer never fires, photographs as a blank rectangle of background. Measured: a correct,
  // fully-rendered price list came back as 453x304 of flat navy.
  if (!has('no-settle')) {
    await p.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await sleep(60); }
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(250);
      // Belt and braces: anything still pending is forced visible rather than photographed blank.
      for (const el of document.querySelectorAll('.sc-anim-pending')) {
        el.classList.remove('sc-anim-pending');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
      window.scrollTo(0, 0);
      await sleep(200);
    });
  }
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
} finally { await closeQuiet(b); }
