#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Converter Training Harness — FIDELITY SCORER (Prong B: the golden-regression gate)
 * ---------------------------------------------------------------------------------
 * Imports each captured corpus site into the localhost root install, renders it headless at a monitor
 * viewport, and scores it on the dimensions that keep going wrong — container/flush, section spacing,
 * icon-box padding, bg-media full-bleed, header logo, text contrast, verbatim fallbacks. Produces a
 * per-dimension 0–100 score per site + a corpus average, stores a BASELINE, and on re-run prints the
 * DIFF (improved / regressed / unchanged) so no converter edit ships that regresses the corpus.
 *
 * Usage:
 *   node score.mjs --baseline                 score all captured sites, SAVE as the baseline
 *   node score.mjs                            score all, DIFF against the saved baseline
 *   node score.mjs --only a,b,c               score just these sites (fast iteration), diff if baseline has them
 *   node score.mjs --sample 12                score a fixed representative sample
 *   node score.mjs --viewport 1920            monitor width to test flush at (default 1920)
 *
 * Env: PHP (php binary), WP_LOAD (wp-load.php), NODE_PATH (playwright), URL (default http://localhost/).
 * Requires the localhost root install with the Site Converter plugin + a captured corpus (see train.sh).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// Playwright lives in a shared install (pw-screens); ESM `import` ignores NODE_PATH, so resolve via
// createRequire (which honours NODE_PATH) with an explicit fallback to the known pw-screens location.
const _require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = _require('playwright')); }
catch { ({ chromium } = _require('D:/Web Dev/pw-screens/node_modules/playwright')); }

const HERE = dirname(fileURLToPath(import.meta.url));
const PHP  = process.env.PHP || 'D:/xampp/php/php.exe';
const URL  = process.env.URL || 'http://localhost/';
const BATCH = process.env.OUT || join(HERE, '../../assembled/UnysonPlus-Capture-Service/tools/design-capture/batch');

// SOURCE-FIDELITY signal. The per-dimension metrics below are all INTERNAL proxies of the converted page —
// the scorer never loaded the SOURCE, so a page that renders nothing like its source could still score ~100
// (the-line: overall 98 while every stat is an oval blob and the pillars are white cards on a black theme).
// verify.mjs (capture service) renders the source `rendered.html` AND the converted page, full-page-screenshots
// both, and pixel-diffs the overlap in horizontal bands → an overall drift %. Validated to DISCRIMINATE:
// colosseum 8.4% / lumina 12.1% (both look right) vs the-line 21.6% (looks wrong). Imported by path; verify.mjs's
// own deps (playwright, pixelmatch) resolve from the capture-service node_modules. Off unless FW_SC_FIDELITY=1
// (it ~doubles runtime: a second full-page render per site), so the fast loop can skip it.
const FIDELITY_ON = process.env.FW_SC_FIDELITY === '1';
const VERIFY_PATH = join(HERE, '../../assembled/UnysonPlus-Capture-Service/tools/design-capture/verify.mjs');
let verifyUrls = null;
// Resolve a slug's SOURCE rendered.html (same two layouts import-site.php accepts) as a file:// URL.
function srcRenderedUrl(slug) {
  const nested = join(BATCH, slug, 'openhero_art_api_preview', 'rendered.html');
  const flat   = join(BATCH, slug, 'rendered.html');
  const p = existsSync(nested) ? nested : (existsSync(flat) ? flat : '');
  return p ? 'file:///' + p.replace(/\\/g, '/') : '';
}
const args = process.argv.slice(2);
const opt = (n,d) => { const i = args.indexOf(n); return i>=0 ? args[i+1] : d; };
const IS_BASELINE = args.includes('--baseline');
const VW = parseInt(opt('--viewport','1920'),10) || 1920;
const ONLY = (opt('--only','')||'').split(',').map(s=>s.trim()).filter(Boolean);
const SAMPLE = parseInt(opt('--sample','0'),10) || 0;
// Baseline/scores are namespaced per CORPUS so scoring one corpus never clobbers another's baseline (the
// openhero and Wegic corpora each keep their own). Default '' = the original openhero files, for back-compat;
// `--corpus wegic` writes/reads `_baseline.wegic.json` / `_scores.wegic.json`. (The audit once overwrote the
// openhero baseline by re-running on a different corpus/install — this makes that impossible.)
const CORPUS = (opt('--corpus','')||'').replace(/[^a-z0-9_-]/gi,'').toLowerCase();
const SUFFIX = CORPUS ? `.${CORPUS}` : '';
const BASELINE_FILE = join(HERE, 'score', `_baseline${SUFFIX}.json`);
const SCORES_FILE   = join(HERE, 'score', `_scores${SUFFIX}.json`);

// A fixed, structurally-varied sample for the fast loop (hero-video, cards, light+dark, full-width flex…).
const SAMPLE_SITES = ['regenerative-landscapes','apple-card-titanium-and-intelligence','the-art-of-the-burger',
  'crystal-universe','colosseum-engineering-the-empire','build-products-that-move-money','red-planet-architecture',
  'getty-images','new-era-of-spatial-computing','obsidian-horizon','kinetic-fashion-elements','crafter-station'];

function siteList() {
  if (ONLY.length) return ONLY;
  // A capturable site dir holds a rendered.html, EITHER nested under `openhero_art_api_preview/` (the openhero
  // preview-endpoint captures) OR directly at `<slug>/rendered.html` (the capture service's normal batch layout,
  // e.g. the Wegic corpus). import-site.php resolves both, so accept both here — this is what lets the same
  // harness baseline the Wegic corpus (OUT=<wegic-capture-dir>) as well as openhero.
  const all = readdirSync(BATCH, { withFileTypes:true }).filter(d=>d.isDirectory()).map(d=>d.name)
    .filter(s => existsSync(join(BATCH,s,'openhero_art_api_preview','rendered.html')) || existsSync(join(BATCH,s,'rendered.html')));
  if (SAMPLE) return SAMPLE_SITES.filter(s=>all.includes(s)).slice(0, SAMPLE);
  return all;
}

// ---- the in-browser measurement (raw signals; scoring happens in Node) ----
async function measure(page) {
  return await page.evaluate((vw) => {
    const px = v => parseFloat(v)||0;
    const lumaOf = (c) => { const m=(c||'').match(/(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/); if(!m) return null; if(m[4]!==undefined && parseFloat(m[4])<0.1) return null; return (0.2126*+m[1]+0.7152*+m[2]+0.0722*+m[3])/255; };
    const bgLuma = (el) => { let n=el; for(let i=0;i<8&&n;i++){ const l=lumaOf(getComputedStyle(n).backgroundColor); if(l!==null) return l; n=n.parentElement; } const b=lumaOf(getComputedStyle(document.body).backgroundColor); return b!==null?b:1; };
    const secs = [...document.querySelectorAll('section')].filter(s=>s.getBoundingClientRect().width>0);

    // container/flush + section spacing
    let textSecs=0, flushBad=0, padCollapsed=0;
    for (const s of secs) {
      const texts=[...s.querySelectorAll('h1,h2,h3,p')].filter(e=>e.textContent.trim().length>15 && e.getBoundingClientRect().width>0);
      const cs=getComputedStyle(s); const pad=px(cs.paddingTop)+px(cs.paddingBottom);
      // full-bleed bg media legitimately spans the viewport — don't penalise it
      const media=[...s.querySelectorAll('video,img')].some(m=>{const r=m.getBoundingClientRect(); return r.width>vw*0.9 && r.height>200;});
      // a HERO uses min-height + vertical CENTERING, not padding — a tall section (or one carrying full-bleed
      // bg media) with its content vertically centered legitimately has ~0 CSS padding, so it must not count as
      // a "collapsed" section (autonomous-supply-chain: one 1083px bg-video hero, content centered → false 0).
      const rect=s.getBoundingClientRect();
      const centered=/center/.test(cs.justifyContent)||/center/.test(cs.alignItems);
      const hero=(rect.height>700)&&(media||centered||cs.display==='flex'||cs.minHeight!=='0px');
      // a `section--gap-*` band uses GAP between its children for vertical rhythm, not section padding — so
      // ~0 CSS padding is correct there too (obsidian-horizon's `section--gap-32px` bands).
      const gapM=/section--gap-(\d+)/.exec(s.className); // the gap px is declared in the class (gap may sit on an inner flexbox, so cs.rowGap can read 0)
      const gapSpaced=(gapM&&+gapM[1]>=16)||px(cs.rowGap)>=16;
      if (texts.length){
        textSecs++;
        let L=1e9,R=0; texts.forEach(e=>{const r=e.getBoundingClientRect(); L=Math.min(L,r.left); R=Math.max(R,r.right);});
        // A horizontal MARQUEE/ticker (getty-images' "FORMAT FIDELITY · SPECTRAL PRECISION…" scroller) has text
        // spanning FAR wider than the viewport by design (L≈-80, R≈5900) — that reads as "flush" but is not a
        // container defect. Only count flush when the text band is ~viewport-width (not a wide overflow scroller).
        if (L<32 && R>vw-32 && !media && (R-L) <= vw*1.4) flushBad++;
        if (pad<24 && !hero && !gapSpaced) padCollapsed++;
      }
    }

    // STRUCTURAL FIDELITY (harness hardening) — catch the failures the per-section metrics miss (build-products
    // scored 86 while its hero was buried and its bands were flattened). Two robust, low-overfit signals:
    const contentSecs = secs.filter(s => [...s.querySelectorAll('h1,h2,h3,p')].some(e => e.textContent.trim().length>15 && e.getBoundingClientRect().width>0));
    // (a) HERO PRESENT — the FIRST content section leads with a prominent, VISIBLE heading (not buried under a
    //     pricing/stat fragment, as the broken build-products hero was). A heading >= 28px = a real hero title.
    let heroOk = 1;
    if (contentSecs.length) {
      const heads = [...contentSecs[0].querySelectorAll('h1,h2')].filter(e => e.textContent.trim().length>3 && e.getBoundingClientRect().width>0);
      heroOk = heads.some(h => px(getComputedStyle(h).fontSize) >= 28) ? 1 : 0;
    }
    // (b) FLATTENING — a mega-section that packs many DISTINCT band-headings the converter should have split
    //     into separate sections. Signal: few rendered sections AND one section holds an outsized count of
    //     h2/h3 band-titles. Conservative threshold (calibrated so only genuine mega-sections flag).
    let maxSecHeads = 0;
    for (const s of secs) {
      const n = [...s.querySelectorAll('h2,h3')].filter(e => e.textContent.trim().length>3 && e.getBoundingClientRect().width>0).length;
      if (n > maxSecHeads) maxSecHeads = n;
    }
    const flattened = (contentSecs.length <= 2 && maxSecHeads >= 5) ? 1 : 0;

    // header logo — a valid logo is an <img>, an inline <svg> mark, OR real VISIBLE wordmark text. Measure
    // only VISIBLE text (exclude sr-only / aria-hidden / display:none), so a hidden `rel="home"` accessible
    // label ("Home") beside an icon-only SVG logo doesn't read as the (missing) wordmark.
    const header=document.querySelector('.site-header')||document.querySelector('header');
    let logoText='', logoHasImg=false, logoHasSvg=false;
    if (header){
      // Pick the LOGO element, not the first stray anchor. A bare `header.querySelector('…,a')` grabbed a
      // class-less home/skip `<a>Home</a>` sitting before the real logo — its text "Home" then read as a
      // generic (missing) wordmark → a false logo=0 while the header actually rendered an <img> + wordmark
      // (Wegic serenity_spa and ~others). Prefer a logo/brand-classed element; else the anchor/element that
      // WRAPS the logo img/svg; else any anchor as a last resort.
      let cand=header.querySelector('.site-logo,.fw-logo,.header-logo,[class*="site-title"],[class*="logo"],[class*="brand"]');
      if (!cand){ cand=[...header.querySelectorAll('a,span,div')].find(e=>e.querySelector('img,svg')) || null; }
      if (!cand){ cand=header.querySelector('a'); }
      if (cand){
        logoHasImg=!!cand.querySelector('img'); logoHasSvg=!!cand.querySelector('svg');
        const hidden=(el)=>{ for(let n=el;n&&n!==cand.parentElement;n=n.parentElement){ const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden'||n.getAttribute('aria-hidden')==='true'||/sr-only|screen-reader|visually-hidden|\bhidden\b/.test(n.className||'')) return true; } return false; };
        let vt='';
        for (const w of cand.querySelectorAll('*')){ if(w.children.length===0 && w.textContent.trim() && !hidden(w)) vt+=' '+w.textContent.trim(); }
        if (!vt.trim()){ // no leaf text nodes flagged; fall back to the element's own text if it isn't hidden
          if (!hidden(cand)) vt=cand.textContent;
        }
        logoText=vt.trim();
      }
    }

    // icon-box horizontal padding — only meaningful for a BOX-SKINNED card (a visible background, border, or
    // radius). A FLAT gap-spaced card (transparent, no border/radius — the-seed/the-line/regenerative stack an
    // icon+heading+text with `gap-*` between cells and NO inner padding) legitimately has zero horizontal
    // padding: penalising it demanded padding the SOURCE never had. So skip skinless boxes; a skinned card
    // whose content still sits flush to its edges remains a real defect and is counted.
    const boxes=[...document.querySelectorAll('.fw-icon-box,.icon-box')].filter(e=>!/__inner|__title|__desc/.test(e.className));
    let iconBoxes=0, iconNoPad=0;
    for (const b of boxes){ const cs=getComputedStyle(b);
      // a visual BOX that should carry inner padding = a FILL or a RADIUS. A bare border (esp. a top-only
      // `border-t` RULE — solitary/regenerative stack a thin top line + `pt-8`, no L/R padding by design) is
      // NOT a filled card and legitimately has no horizontal padding, so it must not be penalised.
      const filled=cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&cs.backgroundColor!=='transparent';
      const rounded=px(cs.borderTopLeftRadius)>=4;
      if(!(filled||rounded)) continue;   // flat / top-ruled card — no inner padding is correct
      iconBoxes++; if(px(cs.paddingLeft)+px(cs.paddingRight)<1) iconNoPad++; }

    // text contrast (sample). Judge contrast ONLY where it is actually MEASURABLE headlessly — i.e. text
    // whose visual backdrop IS a CSS background-COLOUR. Skip text whose real backdrop we can't luma-judge,
    // because those produce systematic FALSE low-contrast that swamps the real defects:
    //   • over a bg <video> (headless never paints the video → a light fallback shows through), OR
    //   • over a background-IMAGE / gradient on any ancestor (an <img>/gradient, not a bg-colour), OR
    //   • an absolutely-positioned caption inside a media card (overlays an <img>/<video>).
    // Also restrict to text INSIDE a <section> — the converter's section fidelity is what this scores; site
    // CHROME (a stale/shared footer, skip-to-content a11y links) is separate and polluted the metric.
    // (An earlier blanket over-media exclusion was reverted for skewing dark sites; this is narrower — it
    //  drops a sample only when a real non-colour backdrop is present, never a plain dark colour band.)
    const overUnpaintable = (el, sec) => {
      for (let n=el; n && n!==sec.parentElement; n=n.parentElement){
        const cs=getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage!=='none') return true;      // bg image / gradient
        if ((cs.position==='absolute'||cs.position==='fixed') && (sec.querySelector('img,video'))) return true; // caption over media
      }
      return false;
    };
    const sample=[...document.querySelectorAll('section h1,section h2,section h3,section p,section a,section button,section span')]
      .filter(e=>e.textContent.trim().length>8 && e.getBoundingClientRect().width>0).slice(0,120);
    let contToo=0, contN=0;
    for (const e of sample){ const sec=e.closest('section'); if(!sec) continue;
      if (sec.querySelector('video')) continue;                 // over a bg video → unmeasurable headless
      if (overUnpaintable(e, sec)) continue;                    // over an image / gradient / media caption
      const tl=lumaOf(getComputedStyle(e).color); const bl=bgLuma(e); if(tl!==null&&bl!==null){ contN++; if(Math.abs(tl-bl)<0.22) contToo++; } }

    // bg-media (hero video should be full-bleed): score PER SECTION (dedupe), not per <video> element, and
    // measure the video's LAYOUT HOST width (parent), which is set by CSS regardless of whether the video has
    // loaded — the raw <video> box is flaky at measurement time (load race), which produced false 50↔0 jitter.
    const vidSecs = new Set(), vidTinySecs = new Set();
    for (const v of document.querySelectorAll('video')){
      const s = v.closest('section'); if (!s) continue;
      const sh = s.getBoundingClientRect().height; if (sh < 400) continue;   // only hero-ish/tall bands
      const host = v.parentElement || v; const w = Math.max(v.getBoundingClientRect().width, host.getBoundingClientRect().width);
      vidSecs.add(s);
      if (w < vw*0.6) vidTinySecs.add(s);
    }
    const vids = vidSecs.size, tinyVid = vidTinySecs.size;

    // MEDIA RETENTION numerator — how many REAL CONTENT images the CONVERTED page actually renders inside its
    // body <section>s. Counterpart to import-site.php's srcImages (source body raster <img>). A whole photo grid
    // silently going missing scored 100 on every other dimension (Wegic audit §8.54); this makes it visible.
    // Count DISTINCT visible content images: (a) rendered <img> of real size inside a section (raster only — skip
    // SVG/data-URI glyphs and tiny/icon-scale images), PLUS (b) elements the converter skinned with a
    // background-image url() (the converter routinely promotes a source <img> to a section/box CSS background).
    const convImgHosts = new Set();
    for (const im of document.querySelectorAll('section img')) {
      const r = im.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) continue;                 // icon / tracking-scale
      const src = im.currentSrc || im.getAttribute('src') || '';
      if (/^data:/i.test(src) || /\.svg(\?|#|$)/i.test(src)) continue; // glyph / illustration
      convImgHosts.add(im);
    }
    for (const el of document.querySelectorAll('section, section *')) {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none' || !/url\(/i.test(bg)) continue;
      if (/\.svg[)"']|data:image\/svg/i.test(bg)) continue;        // svg backdrop = decoration, not a photo
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 60) continue;                 // decorative sliver
      convImgHosts.add(el);
    }
    const convImages = convImgHosts.size;

    // RUNAWAY LAYOUT (height sanity) — a section that renders THOUSANDS of px too tall because the converter
    // mis-mapped its structure. The signature that costs the most fidelity and is unambiguous: an ULTRA-NARROW,
    // ULTRA-TALL column — a `flex flex-wrap` wall of fixed-size tiles (a logo / integration / badge cloud) that
    // got forced into fractional 1/12 columns, so dozens of tiles stack into a ~68px-wide, ~8500px-tall strip
    // (ghost.org's integrations wall: one 9,184px section). A LEGIT long section (article, timeline, tall hero
    // image) is WIDE, not a thin ribbon — so "tall AND thin" cleanly separates the break from real content.
    // Also flag an absurd absolute section height as a backstop. This was a scorer BLIND SPOT: ghost scored 99
    // while carrying a 9,184px broken band (the per-dimension metrics all passed on the content it did hold).
    let runawaySecs = 0;
    for (const s of secs) {
      const sh = s.getBoundingClientRect().height;
      let bad = sh > 8000;                                   // absurd absolute height — no real band is this tall
      if (!bad) {
        for (const el of s.querySelectorAll('div,ul,ol,figure')) {
          const r = el.getBoundingClientRect();
          if (r.height > 2500 && r.width > 0 && r.width < 160) { bad = true; break; }  // tall thin ribbon
        }
      }
      if (bad) runawaySecs++;
    }

    return { vw, textSecs, flushBad, padCollapsed, logoText, logoHasImg, logoHasSvg, iconBoxes, iconNoPad, contN, contToo, vids, tinyVid, convImages, runawaySecs, secCount: secs.length, heroOk, flattened, maxSecHeads, contentSecCount: contentSecs.length };
  }, VW);
}

// ---- raw signals → 0..100 per dimension ----
function scoreSite(m, php, drift = null) {
  const pct = (good,total)=> total>0 ? Math.round(100*good/total) : 100;
  const d = {};
  d.container    = pct(m.textSecs - m.flushBad, m.textSecs);        // capped (non-flush) text sections
  d.spacing      = pct(m.textSecs - m.padCollapsed, m.textSecs);    // sections with real vertical padding
  // logo is good if it renders an image, an inline SVG mark, OR real VISIBLE wordmark text that isn't a
  // generic WP fallback (Home / site title). An icon-only SVG logo is a valid logo.
  const genericLogo = /^(home|sample page|my site|untitled|blog|site title)$/i.test((m.logoText||'').trim());
  d.logo         = (m.logoHasImg || m.logoHasSvg || (m.logoText && m.logoText.length>0 && !genericLogo)) ? 100 : 0;
  d.iconbox_pad  = pct(m.iconBoxes - m.iconNoPad, m.iconBoxes);     // icon-boxes with horizontal padding
  // legible text — N/A (100) when too few samples sit over a MEASURABLE (colour) backdrop: a media-heavy
  // page (every band over a video/image) leaves a tiny sample whose score whipsaws 0↔100 run-to-run.
  d.contrast     = m.contN >= 4 ? pct(m.contN - m.contToo, m.contN) : 100;
  // bg_media (DETERMINISTIC — from the builder, not a rendered autoplay video whose size races with load):
  // when the SOURCE hero carries a cover/positioned <video> (a background), did the converter promote it to the
  // section background (video or image)? If the source hero has no bg-ish video, the dimension is N/A → 100.
  d.bg_media     = (php && php.srcHeroVideo) ? ((php.heroBgVideo || php.heroBgImage) ? 100 : 0) : 100;
  d.verbatim     = php && php.sections>0 ? Math.max(0, Math.round(100*(1 - Math.min(1, (php.verbatim||0)/php.sections)))) : (php&&php.verbatim>0?0:100);
  // STRUCTURE (harness hardening) — catch a failure the per-section metrics are blind to: a MISSING / BURIED
  // hero (getty-images rendered a hero band with NO visible headline yet scored 100 everywhere else). HERO
  // PRESENT = the first content section leads with a prominent (>=28px), visible heading. Calibrated across the
  // corpus: heroOk flagged exactly ONE site (getty) and it is a genuine defect — 0 false positives.
  //   Two other signals were prototyped and CUT after calibration: `flattened` (rendered heading-count can't
  //   tell a healthy 5-card features section from a real mega-section — false-flagged nox-liquid/das-wesen) and
  //   `wrongBg` (a rounded wrapper alone doesn't mean a wrong promotion — a legit full-bleed rounded hero video,
  //   financial-infrastructure, renders fine). Both need better signals (source-band comparison; video size) and
  //   are left as REPORTED fields (php.wrongBg, m.flattened) for triage, not scored, so they can't false-regress.
  d.structure = (m.heroOk === 0) ? 55 : 100;
  // MEDIA RETENTION — did the converted page keep the source's body PHOTOS? The scorer was blind to a whole
  // image band vanishing (personal_blog_writer's 3-card article grid, Wegic audit §8.54): seven dimensions read
  // 100 while the photos were gone. srcImages (source body raster <img>, chrome/svg/pixel excluded) is the
  // denominator; convImages (rendered <section> <img> + CSS background-image hosts) is what actually survived.
  //   • N/A → 100 when the source body carries no content images (a text-only page can't lose photos).
  //   • The converter LEGITIMATELY consolidates media (a gallery of N thumbs → one bg-image collage; duplicate
  //     src reused across breakpoints), so retaining MOST photos is full credit, not an exact 1:1 match — a
  //     small shortfall is expected. Only a real drop (a whole band missing) should bite. Hence the ratio is
  //     lenient: >=70% kept = 100, degrading below that. Over-retention (convImages>src, e.g. a bg + its <img>)
  //     is clamped to 100.
  if (php && php.srcImages > 0) {
    const keep = Math.min(1, (m.convImages||0) / php.srcImages);
    d.media_retention = keep >= 0.7 ? 100 : Math.round(100 * (keep / 0.7));
  } else {
    d.media_retention = 100;
  }
  // HEIGHT SANITY — a section that renders thousands of px too tall from a structural mis-map (a wrapping
  // tile-wall forced into 1/12 columns → a ~68px-wide, ~8500px-tall ribbon; ghost.org's integrations band was
  // 9,184px). "Tall AND thin" separates the break from legit long content (which is wide). A single runaway
  // band wrecks a page's proportions, so it bites hard: any runaway section drops the dimension steeply.
  d.height_sanity = (m.secCount > 0 && m.runawaySecs > 0) ? Math.max(0, Math.round(100 * (1 - m.runawaySecs / m.secCount) - 40)) : 100;
  // SOURCE FIDELITY — the honest signal the proxies above miss (see the header note + verify.mjs). `drift` is the
  // pixel-diff % of the converted page vs the source rendered.html. null (no measurement) → N/A → 100 (never a
  // false regression). Curve is CALIBRATION-PENDING: current data (good ~8-12%, bad ~22%) suggests full credit up
  // to a floor, then a steady drop, but the curve + WEIGHT are set only AFTER reading the whole-corpus drift
  // distribution (a heavily-weighted dimension mis-calibrated would tank good sites — exactly the failure mode we
  // are fixing, in reverse). So for now it is REPORTED but WEIGHTED 0 — it moves no score until calibrated.
  d.fidelity = (drift === null) ? 100 : Math.max(0, Math.min(100, Math.round(100 - Math.max(0, drift - 8) * 4)));
  const W = { container:2.0, spacing:1.0, logo:1.0, iconbox_pad:0.8, contrast:1.5, bg_media:1.2, verbatim:1.0, structure:1.3, media_retention:1.2, height_sanity:1.2, fidelity:0 };
  let sw=0, ss=0; for (const k in W){ sw+=W[k]; ss+=W[k]*d[k]; }
  d.overall = Math.round(ss/sw);
  return d;
}

const DIMS = ['overall','container','spacing','logo','iconbox_pad','contrast','bg_media','verbatim','structure','media_retention','height_sanity','fidelity'];

(async () => {
  const sites = siteList();
  if (!sites.length) { console.error('no captured sites found in', BATCH); process.exit(2); }
  if (FIDELITY_ON) {
    try { ({ verifyUrls } = await import('file:///' + VERIFY_PATH.replace(/\\/g, '/'))); }
    catch (e) { console.error('[fidelity] verify.mjs not loadable — fidelity off:', e.message); }
  }
  console.log(`scoring ${sites.length} site(s) @ ${VW}px${FIDELITY_ON&&verifyUrls?'  +FIDELITY':''}${IS_BASELINE?'  (SAVING BASELINE)':''}\n`);
  // Render in REAL Chrome, not Playwright's bundled Chromium: bundled Chromium ships WITHOUT the proprietary
  // H.264 codec, so every `.mp4` hero/background video decodes to a BLACK box (readyState 0). That silently
  // invalidated every screenshot + fidelity comparison — a full-bleed video hero read as a black void on both
  // source and converted, so real defects (a missing background, a mis-placed video) were invisible. Real
  // Chrome (or Edge) decodes H.264 and PLAYS the video. Fall back to bundled Chromium only if no Chrome/Edge
  // is installed (then videos are black again — a logged warning, not a silent lie).
  let browser;
  const _autoplay = { args: ['--autoplay-policy=no-user-gesture-required'] };
  try { browser = await chromium.launch({ channel: 'chrome', ..._autoplay }); }
  catch { try { browser = await chromium.launch({ channel: 'msedge', ..._autoplay }); }
    catch { console.error('[render] WARNING: no real Chrome/Edge — falling back to bundled Chromium; VIDEOS WILL BE BLACK and fidelity is unreliable.'); browser = await chromium.launch(_autoplay); } }
  const page = await browser.newPage({ viewport:{ width:VW, height:1080 } });
  const results = {};
  for (const slug of sites) {
    let php=null;
    // timeout guards a hung import (a broken/partial capture); maxBuffer for large builder JSON.
    // NB import-site.php can emit a leading NUL byte; String.trim() does NOT strip NUL, so JSON.parse would
    // throw → a 100% FALSE IMPORT-FAIL for every site. Strip NULs first. (Wegic audit 08-render-audit §8.55.)
    try { php = JSON.parse(execFileSync(PHP, [join(HERE,'score','import-site.php'), slug, BATCH], { encoding:'utf8', env:{...process.env}, maxBuffer:1<<24, timeout:90000 }).replace(/\0/g,'').trim().split('\n').pop()); }
    catch(e){ console.log(`  ${slug.padEnd(38)} IMPORT-FAIL`); continue; }
    if (!php || !php.ok) { console.log(`  ${slug.padEnd(38)} ${php?php.err:'no-json'}`); continue; }
    // 'domcontentloaded' (NOT networkidle — autoplay-video pages never idle), then wait for the page to
    // actually PAINT its design before measuring. The theme + generated preset CSS + web fonts land AFTER
    // domcontentloaded, so a fixed 1.2s settle sometimes measured an UNSTYLED page — the dark body/section
    // backgrounds hadn't applied yet, so white-on-dark text read as white-on-white (false contrast=0, run to
    // run — burger/payment). Wait for fonts, and poll until the body background is actually painted (a real
    // colour, not the initial transparent), capped so a legitimately-transparent body still proceeds.
    try { await page.goto(URL, { waitUntil:'domcontentloaded', timeout:45000 }); } catch(e){}
    await page.waitForTimeout(600);
    try { await page.evaluate(async () => { try { await document.fonts.ready; } catch {} }); } catch(e){}
    try { await page.waitForFunction(() => { const b = getComputedStyle(document.body).backgroundColor; return b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent'; }, { timeout: 3000 }); } catch(e){}
    await page.waitForTimeout(700);
    // TRIGGER LAZY IMAGES before measuring. Real Chrome (this harness since the H.264 fix) STRICTLY honours
    // `loading="lazy"`, so a below-the-fold lazy <img> never loads without a scroll — `measure()`'s convImages
    // then reads 0 and media_retention false-drops to 0 (contemplative-realms: 4 lazy hero/section imgs, 0 loaded
    // at the 1.3s settle, 3/4 loaded after one scroll pass). The bundled Chromium the baseline was first captured
    // with loaded them eagerly, so this only surfaced after the real-Chrome switch. Scroll through once, then back
    // to the top, and let the in-view images decode, so we measure what a real viewer actually sees.
    try {
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 45)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
    } catch (e) {}
    const m = await measure(page);
    // SOURCE-FIDELITY: pixel-drift of the converted page vs the source rendered.html (see verify.mjs). A robust
    // try/catch — a failed compare (network-less source, a video that won't load) yields drift=null → fidelity
    // N/A (100), so it can never FALSE-regress a site; it only ever bites when a real, measured drift is high.
    let drift = null;
    if (FIDELITY_ON && verifyUrls) {
      const srcUrl = srcRenderedUrl(slug);
      if (srcUrl) {
        try { const v = await verifyUrls({ sourceUrl: srcUrl, convertedUrl: URL, width: VW, bands: 8 }); if (v && typeof v.overall_drift_pct === 'number') drift = v.overall_drift_pct; }
        catch (e) { /* leave drift null — never break scoring on a verify failure */ }
      }
    }
    const d = scoreSite(m, php, drift);
    results[slug] = d;
    const fidStr = (drift !== null) ? `  fid ${d.fidelity}(drift ${drift}%)` : '';
    console.log(`  ${slug.padEnd(38)} overall ${String(d.overall).padStart(3)}  [cont ${d.container} spc ${d.spacing} logo ${d.logo} ibpad ${d.iconbox_pad} contr ${d.contrast} bgv ${d.bg_media} vbat ${d.verbatim} struct ${d.structure} media ${d.media_retention} hgt ${d.height_sanity}]${fidStr}`);
  }
  await browser.close();

  // corpus averages
  const slugs = Object.keys(results);
  const avg = {}; for (const k of DIMS){ avg[k] = Math.round(slugs.reduce((a,s)=>a+results[s][k],0)/Math.max(1,slugs.length)); }
  const out = { at:new Date().toISOString(), viewport:VW, n:slugs.length, avg, sites:results };
  writeFileSync(SCORES_FILE, JSON.stringify(out,null,1));

  console.log('\n=== corpus average ===');
  console.log('  ' + DIMS.map(k=>`${k} ${avg[k]}`).join('   '));

  if (IS_BASELINE) { writeFileSync(BASELINE_FILE, JSON.stringify(out,null,1)); console.log(`\nBASELINE saved → ${BASELINE_FILE}`); return; }

  if (existsSync(BASELINE_FILE)) {
    const base = JSON.parse(readFileSync(BASELINE_FILE,'utf8'));
    // Average the BASELINE over ONLY the sites scored this run (fair for --only / --sample; identical to
    // base.avg for a full run). Comparing a subset's average to the full-corpus baseline average is misleading.
    const scored = slugs.filter(s => base.sites?.[s]);
    const baseAvg = {}; for (const k of DIMS){ baseAvg[k] = scored.length ? Math.round(scored.reduce((a,s)=>a+base.sites[s][k],0)/scored.length) : (base.avg?.[k]??0); }
    console.log(`\n=== diff vs baseline over the ${scored.length} scored site(s) (this run − baseline) ===`);
    for (const k of DIMS){ const dv = avg[k]-baseAvg[k]; console.log(`  ${k.padEnd(12)} ${dv>0?'+':''}${dv}   (${baseAvg[k]} → ${avg[k]})`); }
    // per-site regressions on overall
    const reg=[], imp=[];
    for (const s of slugs){ if(!base.sites?.[s]) continue; const dv=results[s].overall-base.sites[s].overall; if(dv<=-3) reg.push([s,dv]); else if(dv>=3) imp.push([s,dv]); }
    if (reg.length){ console.log('\n  REGRESSED sites (overall −3+):'); reg.sort((a,b)=>a[1]-b[1]).forEach(([s,dv])=>console.log(`    ${s.padEnd(38)} ${dv}`)); }
    if (imp.length){ console.log('\n  IMPROVED sites (overall +3+):'); imp.sort((a,b)=>b[1]-a[1]).forEach(([s,dv])=>console.log(`    ${s.padEnd(38)} +${dv}`)); }
    if (!reg.length && !imp.length) console.log('  (no per-site change ≥3)');
  } else {
    console.log('\n(no baseline yet — run `node score.mjs --baseline` to set one)');
  }
})();
