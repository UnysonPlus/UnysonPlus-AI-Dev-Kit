#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * survey.mjs — CORPUS-SCALE site-chrome survey (header / masthead), one-sided.
 *
 * Where the rest of tools/measure/ compares ONE page against ONE other page
 * (source vs build), this walks a LIST of N sites and records how each one's
 * header is actually built — structure, chrome, both scroll states, the nav
 * hover treatment, and the mobile drawer. It answers "what do these 120 headers
 * DO?", which is the question you have before any conversion work starts.
 *
 * It never touches localhost, WordPress or a database, so it is safe to run
 * while another session holds the converter/score harness.
 *
 * Everything is read from a live Chromium via computed styles and REAL
 * interaction (a genuine pointer hover, a genuine hamburger click) — never by
 * parsing HTML. ONE page visit per URL does all of it.
 *
 *   node survey.mjs --urls ../converter-trainer/sites/corpus-02.txt --out out/corpus-02.json
 *   node survey.mjs --urls https://example.com/ --out out/one.json
 *   node survey.mjs --urls sites.txt --sample 30 --concurrency 8
 *
 * List format (same as converter-trainer/sites/*.txt):
 *   https://full/url          captured as-is
 *   category|slug             expanded to the corpus's base preview URL
 *   # comment / blank         ignored
 *
 * Options
 *   --urls <path|url>   URL list file, or a single URL          (required)
 *   --out  <path>       JSON array output       (default out/<listname>.json)
 *   --concurrency <n>   parallel browser contexts               (default 6)
 *   --limit <n>         only the first N URLs
 *   --sample <n>        evenly spaced N URLs across the list
 *   --viewport WxH      desktop viewport                        (default 1440x900)
 *   --mobile   WxH      mobile viewport                         (default 390x844)
 *   --settle <ms>       wait after domcontentloaded             (default 2600)
 *   --no-interact       skip hover + drawer click (faster, less detail)
 *   --headed            watch it work
 *
 * TOKEN DISCIPLINE (tools/README.md): the JSON is for `digest.mjs`, not for
 * reading into context — it is ~2.5 KB per site. This command prints a short
 * summary; run `node digest.mjs out/<name>.json` for the analysis.
 *
 * Deps: playwright-core + system Chrome (`npm i` in this folder).
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* playwright-core from this folder, the kit's tools/measure install, or KIT_MODS —
   the same resilient resolve compare.mjs uses, so the tool runs before `npm i`. */
const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
let chromium = null;
for (const base of [null, path.join(HERE, 'node_modules'), path.join(HERE, '..', 'measure', 'node_modules'), process.env.KIT_MODS].filter(v => v !== undefined)) {
  try { ({ chromium } = require(base ? require.resolve('playwright-core', { paths: [base] }) : 'playwright-core')); break; } catch {}
}
if (!chromium) { console.error('playwright-core not found. Run `npm i` here or in ../measure, or set KIT_MODS.'); process.exit(1); }

/* ------------------------------------------------------------------ args -- */
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const eq = argv.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const has = name => argv.includes(`--${name}`);
const num = (name, def) => { const v = flag(name); return v === undefined || v === true ? def : Number(v); };

const urlsArg = flag('urls');
if (!urlsArg || urlsArg === true) {
  console.error('usage: node survey.mjs --urls <file|url> [--out out/x.json] [--concurrency 6]');
  console.error('       then: node digest.mjs out/x.json');
  process.exit(2);
}

const expand = line =>
  /^https?:\/\//i.test(line)
    ? line
    : (line.includes('|')
        ? `https://<corpus base endpoint>?category=${line.split('|')[0].trim()}&slug=${line.split('|')[1].trim()}`
        : null);

const isUrl = /^https?:\/\//i.test(urlsArg);
let urls = isUrl
  ? [urlsArg]
  : fs.readFileSync(urlsArg, 'utf8')
      .split(/\r?\n/).map(s => s.trim())
      .filter(s => s && !s.startsWith('#'))
      .map(expand).filter(Boolean);

if (!urls.length) { console.error('no usable URLs in', urlsArg); process.exit(2); }

const sample = num('sample', 0);
if (sample > 0 && sample < urls.length) {
  const step = urls.length / sample;
  urls = Array.from({ length: sample }, (_, i) => urls[Math.floor(i * step)]);
}
const limit = num('limit', 0);
if (limit > 0) urls = urls.slice(0, limit);

const outPath = (() => {
  const o = flag('out');
  if (o && o !== true) return o;
  const base = isUrl ? new URL(urlsArg).hostname : path.basename(String(urlsArg)).replace(/\.[^.]+$/, '');
  return path.join('out', base.replace(/[^\w.-]+/g, '-').toLowerCase() + '.json');
})();

const [vw, vh] = String(flag('viewport', '1440x900')).split('x').map(Number);
const [mw, mh] = String(flag('mobile', '390x844')).split('x').map(Number);
const CONC = num('concurrency', 6);
// Survey-wide guard: a corpus run must survive an unreachable host. Without this a stray rejection
// from a timed-out navigation killed the process AFTER the sites were measured but BEFORE the
// JSON was written — losing the whole run (exit 4).
process.on('unhandledRejection', (e) => { console.error('  [ignored rejection]', String(e && e.message || e).slice(0, 80)); });
const SETTLE = num('settle', 2600);
const INTERACT = !has('no-interact');

/* -------------------------------------------------- browser-side probes -- */
/* Kept as source strings so every probe re-locates the masthead the SAME way
   after a resize or a re-render.

   The SCORED search matters and is the whole reason this file exists: on the
   corpus-01 the masthead is a <nav> on 72% of pages and <header> is the
   HERO band, so `document.querySelector('header')` returns a full-height video
   section on a quarter of them and nothing at all on half. Score on tag, role,
   class, position and link density instead of trusting one tag name. */
const FIND_MASTHEAD = `(function(){
  var cs=function(el){return getComputedStyle(el)};
  var clsOf=function(el){return typeof el.className==='string'?el.className:(el.getAttribute('class')||'')};
  var c=[].slice.call(document.querySelectorAll('body *')).filter(function(el){
    var r=el.getBoundingClientRect();
    return r.height>0 && r.width>=innerWidth*0.5 && r.top<=200 && r.height<=260;
  });
  var score=function(el){
    var s=cs(el), v=0;
    if(/nav|header|masthead|topbar|navbar/i.test(el.tagName+' '+clsOf(el)+' '+(el.id||''))) v+=5;
    if(el.tagName==='HEADER') v+=4;
    if(el.tagName==='NAV') v+=4;
    if(s.position==='fixed'||s.position==='sticky') v+=4;
    if(el.getAttribute('role')==='banner') v+=3;
    v+=Math.min(el.querySelectorAll('a').length,8)*0.5;
    if(el.querySelector('img,svg')) v+=1;
    v-=el.querySelectorAll('*').length/200;
    return v;
  };
  c.sort(function(a,b){return score(b)-score(a)});
  return c[0]||null;
})()`;

const EXTRACT = `(function(){
  var hdr=window.__HDR__;
  var docInfo={
    hasHeaderTag: !!document.querySelector('header'),
    headerTagIsMasthead: document.querySelector('header')===hdr,
    headerTagH: document.querySelector('header')?Math.round(document.querySelector('header').getBoundingClientRect().height):null,
    bodyChildTags: [].slice.call(document.body.children).map(function(e){return e.tagName.toLowerCase()}).slice(0,12),
    title: document.title
  };
  if(!hdr) return { found:false, doc:docInfo };
  var cs=function(el){return getComputedStyle(el)};
  var clsOf=function(el){return (typeof el.className==='string'?el.className:(el.getAttribute('class')||''))};
  var rect=function(el){var r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  var s=cs(hdr);

  var links=[].slice.call(hdr.querySelectorAll('a'));
  var btns=[].slice.call(hdr.querySelectorAll('button,[role=button]'));
  var navEl=hdr.querySelector('nav')||hdr;
  var navLinks=[].slice.call(navEl.querySelectorAll('a')).filter(function(a){var t=(a.textContent||'').trim();return t&&t.length<32});
  var txt=(hdr.textContent||'').toLowerCase();
  var solid=links.concat(btns).filter(function(e){var c=cs(e);return c.backgroundColor!=='rgba(0, 0, 0, 0)'&&c.backgroundColor!=='transparent'&&e.getBoundingClientRect().height>24});

  var sniff={
    link_count:links.length, button_count:btns.length, nav_item_count:navLinks.length,
    nav_labels:navLinks.slice(0,12).map(function(a){return (a.textContent||'').trim().slice(0,24)}),
    has_img_logo:!!hdr.querySelector('img'), has_svg:!!hdr.querySelector('svg'),
    has_icon_font:!!hdr.querySelector('iconify-icon,i[class*=fa-],i[class*=icon]'),
    logo_text:(function(){var a=hdr.querySelector('a');if(!a)return null;if(a.querySelector('img'))return '[img]';return (a.textContent||'').trim().slice(0,40)||null})(),
    cta_count:solid.length,
    cta_labels:solid.slice(0,4).map(function(e){return (e.textContent||'').trim().slice(0,24)}),
    cta_style:solid[0]?{bg:cs(solid[0]).backgroundColor,radius:cs(solid[0]).borderRadius,pad:cs(solid[0]).padding,color:cs(solid[0]).color,fs:cs(solid[0]).fontSize}:null,
    has_cart:/cart|bag/.test(txt)||!!hdr.querySelector('[aria-label*=cart i],[title*=cart i]'),
    has_search:!!hdr.querySelector('[aria-label*=search i],[title*=search i],input[type=search]'),
    has_lang:!!hdr.querySelector('[aria-label*=lang i],select'),
    has_theme_toggle:!!hdr.querySelector('[aria-label*=theme i],[aria-label*=dark i],[data-theme]'),
    has_hamburger:!!hdr.querySelector('[aria-label*=menu i],[class*=hamburger],[class*=burger],[class*=mobile-menu]'),
    submenu_nodes:hdr.querySelectorAll('ul ul,[class*=dropdown],[class*=submenu],[class*=mega]').length,
    has_details:!!hdr.querySelector('details'),
    social_links:links.filter(function(a){return /facebook|twitter|instagram|linkedin|youtube|tiktok|x\\.com/i.test(a.href||'')}).length,
    tel_mail_links:links.filter(function(a){return /^(tel:|mailto:)/i.test(a.getAttribute('href')||'')}).length
  };

  var shape=function(el,depth){
    return { t:el.tagName.toLowerCase(), c:clsOf(el).slice(0,140), r:rect(el), d:cs(el).display,
      children: depth<2 ? [].slice.call(el.children).map(function(k){return shape(k,depth+1)}) : undefined };
  };

  /* announcement / topbar: a short row immediately above, or a tinted first child */
  var topbar=null, prev=hdr.previousElementSibling;
  if(prev){var pr=prev.getBoundingClientRect();
    if(pr.height>0&&pr.height<70&&pr.top<hdr.getBoundingClientRect().top)
      topbar={t:prev.tagName.toLowerCase(),h:Math.round(pr.height),text:(prev.textContent||'').trim().slice(0,80)};}
  if(!topbar&&hdr.children.length>1){var fc=hdr.firstElementChild,fr=fc.getBoundingClientRect();
    if(fr.height>0&&fr.height<60&&cs(fc).backgroundColor!==s.backgroundColor&&cs(fc).backgroundColor!=='rgba(0, 0, 0, 0)')
      topbar={t:'inner:'+fc.tagName.toLowerCase(),h:Math.round(fr.height),text:(fc.textContent||'').trim().slice(0,80)};}

  /* the bar = the single wrapper child when there is one, else the header itself */
  var bar=hdr.children.length===1?hdr.firstElementChild:hdr;
  var bs=cs(bar), br=bar.getBoundingClientRect();
  var kids=[].slice.call(bar.children).map(function(k){
    var r=k.getBoundingClientRect(), ks=cs(k);
    var kl=[].slice.call(k.querySelectorAll('a')).filter(function(a){return (a.textContent||'').trim()});
    var hasLogo=!!(k.querySelector('img')||(kl[0]&&/^\\/?$|home/i.test(kl[0].getAttribute('href')||'')));
    var ksolid=[].slice.call(k.querySelectorAll('a,button')).filter(function(e){var c=cs(e);return c.backgroundColor!=='rgba(0, 0, 0, 0)'&&e.getBoundingClientRect().height>24});
    var role='other';
    if(kl.length>=3) role='nav';
    else if(hasLogo&&kl.length<=1) role='logo';
    else if(ksolid.length) role='cta';
    else if(k.querySelector('button,svg')) role='actions';
    return {t:k.tagName.toLowerCase(),c:clsOf(k).slice(0,80),role:role,links:kl.length,solid:ksolid.length,
      x:Math.round(r.x),w:Math.round(r.width),h:Math.round(r.height),centerX:Math.round(r.x+r.width/2),
      pos:ks.position,display:ks.display,hidden:r.width===0,
      /* APPEARANCE of the zone itself - a segmented masthead (bordered cards rather than one bar)
         is carried entirely by these boxes, and recording only role/x made it invisible to the survey. */
      bg:ks.backgroundColor, border:ks.borderTopWidth+' '+ks.borderTopStyle+' '+ks.borderTopColor,
      radius:ks.borderRadius, pad:ks.paddingTop+' '+ks.paddingRight+' '+ks.paddingBottom+' '+ks.paddingLeft};
  });

  var inner=hdr.children.length===1?hdr.firstElementChild:hdr, ins=cs(inner);
  var depth=(function d(e,l){var m=l;for(var i=0;i<e.children.length;i++)m=Math.max(m,d(e.children[i],l+1));return m})(hdr,0);

  return {
    found:true,
    tag:hdr.tagName.toLowerCase(), cls:clsOf(hdr).slice(0,320), id:hdr.id||null, role:hdr.getAttribute('role')||null,
    position:s.position, top:s.top, zIndex:s.zIndex, rect:rect(hdr),
    bg:s.backgroundColor, bgImage:s.backgroundImage.slice(0,120),
    backdrop:(s.backdropFilter||s.webkitBackdropFilter||'none'),
    borderBottom:s.borderBottomWidth+' '+s.borderBottomStyle+' '+s.borderBottomColor,
    boxShadow:s.boxShadow.slice(0,90),
    padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].join(' '),
    color:s.color, fontFamily:s.fontFamily.slice(0,70), fontSize:s.fontSize,
    letterSpacing:s.letterSpacing, textTransform:s.textTransform, fontWeight:s.fontWeight,
    transition:s.transition.slice(0,110),
    display:s.display, justify:s.justifyContent, align:s.alignItems, gap:s.gap, radius:s.borderRadius,
    inner:{tag:inner.tagName.toLowerCase(),cls:clsOf(inner).slice(0,140),display:ins.display,justify:ins.justifyContent,
      maxWidth:ins.maxWidth,width:Math.round(inner.getBoundingClientRect().width),
      padding:[ins.paddingTop,ins.paddingRight,ins.paddingBottom,ins.paddingLeft].join(' ')},
    topbar:topbar, childCount:hdr.children.length, nodeCount:hdr.querySelectorAll('*').length, depth:depth,
    tree:shape(hdr,0), sniff:sniff,
    slots:{ barTag:bar.tagName.toLowerCase(), barDisplay:bs.display, barJustify:bs.justifyContent, barAlign:bs.alignItems,
      barRadius:bs.borderRadius, barW:Math.round(br.width), barX:Math.round(br.x), barY:Math.round(br.y),
      barMargin:[bs.marginTop,bs.marginRight,bs.marginBottom,bs.marginLeft].join(' '),
      barGap:(bs.columnGap&&bs.columnGap!=='normal')?bs.columnGap:(bs.gap||'0px'),
      hdrRadius:s.borderRadius, hdrX:rect(hdr).x, hdrY:rect(hdr).y, hdrBgImage:s.backgroundImage.slice(0,80),
      viewportW:innerWidth, kids:kids,
      navCentered:(function(){var n=kids.filter(function(k){return k.role==='nav'})[0];return n?Math.abs(n.centerX-innerWidth/2)<60:null})(),
      slotOrder:kids.filter(function(k){return !k.hidden}).map(function(k){return k.role}).join('>') },
    hero_after:(function(){
      var pool=[].slice.call(document.body.children);
      if(document.body.firstElementChild) pool=pool.concat([].slice.call(document.body.firstElementChild.children));
      var h=pool.filter(function(e){return e.getBoundingClientRect().height>300})[0];
      if(!h) return null; var hs=cs(h);
      return {t:h.tagName.toLowerCase(),c:clsOf(h).slice(0,120),h:Math.round(h.getBoundingClientRect().height),
        bg:hs.backgroundColor,minH:hs.minHeight,hasVideo:!!h.querySelector('video'),hasCanvas:!!h.querySelector('canvas'),hasImg:!!h.querySelector('img')};
    })(),
    doc:docInfo
  };
})()`;

const SNAP = `(function(){
  var el=window.__HDR__; if(!el) return null;
  var s=getComputedStyle(el), r=el.getBoundingClientRect();
  return { bg:s.backgroundColor, backdrop:(s.backdropFilter||s.webkitBackdropFilter||'none'),
    h:Math.round(r.height), y:Math.round(r.top), shadow:s.boxShadow.slice(0,70),
    border:s.borderBottomWidth+' '+s.borderBottomColor,
    cls:(typeof el.className==='string'?el.className:'').slice(0,320),
    transform:s.transform, opacity:s.opacity, pad:s.paddingTop+'/'+s.paddingBottom,
    color:s.color, position:s.position, radius:s.borderRadius };
})()`;

/* the nav link we hover, plus its ::before/::after — animated underlines live in
   the pseudo-elements, so a plain computed-style diff would miss them entirely */
const LINK_SNAP = `(function(){
  var h=window.__HDR__; if(!h) return null;
  var links=[].slice.call(h.querySelectorAll('a')).filter(function(a){return (a.textContent||'').trim().length>1&&a.getBoundingClientRect().width>0});
  var t=links[Math.min(2,links.length-1)]; if(!t) return null;
  var s=getComputedStyle(t), b=getComputedStyle(t,'::before'), af=getComputedStyle(t,'::after');
  return { label:(t.textContent||'').trim().slice(0,20),
    color:s.color, bg:s.backgroundColor, td:s.textDecorationLine, tdColor:s.textDecorationColor,
    bbw:s.borderBottomWidth, bbc:s.borderBottomColor, radius:s.borderRadius, transform:s.transform, opacity:s.opacity,
    beforeW:b.width, beforeH:b.height, beforeBg:b.backgroundColor, beforeTransform:b.transform, beforeScale:b.scale,
    afterW:af.width, afterH:af.height, afterBg:af.backgroundColor, afterTransform:af.transform, afterScale:af.scale };
})()`;

const MOBILE = `(function(){
  var el=window.__HDR__; if(!el) return null; var r=el.getBoundingClientRect();
  var vis=[].slice.call(el.querySelectorAll('a')).filter(function(a){return a.getBoundingClientRect().width>0}).length;
  var burger=[].slice.call(el.querySelectorAll('button,[role=button],[class*=burger],[class*=menu],svg')).filter(function(b){var w=b.getBoundingClientRect().width;return w>0&&w<70});
  return { h:Math.round(r.height), visible_links:vis, burger_count:burger.length,
    burger_svg: burger[0]?!!burger[0].querySelector('svg'):null,
    burger_spans: burger[0]?burger[0].querySelectorAll('span').length:null,
    burger_label: burger[0]?(burger[0].getAttribute('aria-label')||burger[0].textContent||'icon').trim().slice(0,20):null };
})()`;

const DRAWER = `(function(){
  var cs=function(el){return getComputedStyle(el)};
  var panels=[].slice.call(document.querySelectorAll('body *')).filter(function(e){
    var r=e.getBoundingClientRect(), s=cs(e);
    return r.height>200&&r.width>120&&(s.position==='fixed'||s.position==='absolute')&&
      e.querySelectorAll('a').length>=2&&s.visibility!=='hidden'&&parseFloat(s.opacity)>0.1;
  });
  var p=panels.sort(function(a,b){return b.getBoundingClientRect().height-a.getBoundingClientRect().height})[0];
  if(!p) return null;
  var r=p.getBoundingClientRect(), s=cs(p);
  return { w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x), y:Math.round(r.y), bg:s.backgroundColor,
    fullscreen:r.width>=innerWidth-4&&r.height>=innerHeight-4,
    side:r.width>=innerWidth-4?'full':(r.x>innerWidth*0.3?'right':'left'),
    radius:s.borderRadius, backdrop:(s.backdropFilter||'none'), align:s.textAlign, links:p.querySelectorAll('a').length };
})()`;

/* The FOOTER, resolved the same way as the masthead: by SCORE, not by tag. Generated sites
   often close with a <div class="footer">, and a <footer> tag sometimes wraps only the
   copyright strip rather than the whole block. */
const FOOTER = `(function(){
  var cs=function(el){return getComputedStyle(el)};
  var clsOf=function(el){return (typeof el.className==='string'?el.className:(el.getAttribute('class')||''))};
  var rect=function(el){var r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  var docH=Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

  var cands=[].slice.call(document.querySelectorAll('body *')).filter(function(el){
    var r=el.getBoundingClientRect();
    if(r.height<40||r.width<innerWidth*0.5) return false;
    return (r.top+window.scrollY) > docH-r.height-80;   // sits at the very bottom of the document
  });
  var score=function(el){
    var s=cs(el), v=0;
    if(/footer|colophon|site-info|bottom/i.test(el.tagName+' '+clsOf(el)+' '+(el.id||''))) v+=5;
    if(el.tagName==='FOOTER') v+=4;
    if(el.getAttribute('role')==='contentinfo') v+=3;
    v+=Math.min(el.querySelectorAll('a').length,12)*0.3;
    v-=el.querySelectorAll('*').length/300;
    return v;
  };
  cands.sort(function(a,b){return score(b)-score(a)});
  var f=cands[0] || document.querySelector('footer');
  if(!f) return { found:false, hasFooterTag:!!document.querySelector('footer') };
  window.__F__=f;

  var s=cs(f), r=rect(f);
  var links=[].slice.call(f.querySelectorAll('a'));
  var txt=(f.textContent||'').trim();

  /* ROWS = the footer's own stacked bands. The theme models these as Pre / Main / Post /
     Copyright, so the count is what decides whether those four rows are enough. */
  var rows=[].slice.call(f.children).map(function(k){
    var kr=k.getBoundingClientRect(), ks=cs(k);
    return { t:k.tagName.toLowerCase(), c:clsOf(k).slice(0,70), h:Math.round(kr.height),
      links:k.querySelectorAll('a').length, display:ks.display, pad:ks.paddingTop+'/'+ks.paddingBottom,
      bg:ks.backgroundColor, borderTop:ks.borderTopWidth+' '+ks.borderTopColor };
  }).filter(function(x){return x.h>0});

  /* COLUMNS = the widest grid/flex band inside the footer. The WIDTH RATIO is what the
     theme's split-slider has to reproduce, so record the normalised ratio, not just a count. */
  var colHost=null, colBest=0;
  [].slice.call(f.querySelectorAll('*')).forEach(function(el){
    var d=cs(el).display; if(d!=='grid'&&d!=='flex') return;
    var kids=[].slice.call(el.children).filter(function(k){return k.getBoundingClientRect().width>0});
    if(kids.length<2) return;
    var w=el.getBoundingClientRect().width;
    if(w>colBest && w>=innerWidth*0.4 && kids.length<=8){ colBest=w; colHost=el; }
  });
  var cols=null;
  if(colHost){
    var kids=[].slice.call(colHost.children).filter(function(k){return k.getBoundingClientRect().width>0});
    var ws=kids.map(function(k){return k.getBoundingClientRect().width});
    var tot=ws.reduce(function(a,b){return a+b},0)||1;
    cols={ count:kids.length, display:cs(colHost).display, gap:cs(colHost).gap,
      ratio:ws.map(function(w){return Math.round(w/tot*100)}),
      equal:ws.every(function(w){return Math.abs(w-ws[0])<=Math.max(8,ws[0]*0.08)}),
      gridTemplate:(cs(colHost).gridTemplateColumns||'').slice(0,80) };
  }

  return {
    found:true,
    tag:f.tagName.toLowerCase(), cls:clsOf(f).slice(0,140), rect:r,
    bg:s.backgroundColor, bgImage:s.backgroundImage.slice(0,80), color:s.color,
    borderTop:(s.borderTopWidth!=='0px'&&s.borderTopStyle!=='none')?(s.borderTopWidth+' '+s.borderTopStyle+' '+s.borderTopColor):'',
    padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].join(' '),
    fontFamily:s.fontFamily.slice(0,60), fontSize:s.fontSize, textAlign:s.textAlign,
    rowCount:rows.length, rows:rows.slice(0,6), cols:cols,
    rowPadsDiffer:(function(){var set={},n=0;rows.forEach(function(r){if(!set[r.pad]){set[r.pad]=1;n++}});return n>1})(),
    linkRest:(function(){
      var ls=[].slice.call(f.querySelectorAll('a')).filter(function(a){return (a.textContent||'').trim().length>1&&a.getBoundingClientRect().width>0});
      var t=ls[Math.min(1,ls.length-1)]; window.__FL__=t||null;
      return t?{label:(t.textContent||'').trim().slice(0,24),color:cs(t).color,td:cs(t).textDecorationLine,opacity:cs(t).opacity}:null;
    })(),
    nodeCount:f.querySelectorAll('*').length,
    link_count:links.length,
    has_logo:!!f.querySelector('img,svg'),
    social_links:links.filter(function(a){return /facebook|twitter|instagram|linkedin|youtube|tiktok/i.test(a.href||'')}).length,
    tel_mail:links.filter(function(a){return /^(tel:|mailto:)/i.test(a.getAttribute('href')||'')}).length,
    has_newsletter:!!f.querySelector('input[type=email]') || !!f.querySelector('form'),
    has_back_to_top:!!f.querySelector('[aria-label*="top" i]') || /back to top/i.test(txt),
    has_copyright:/copyright|all rights reserved/i.test(txt) || txt.indexOf(String.fromCharCode(169))>=0,
    headings:f.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
    doc:{ hasFooterTag:!!document.querySelector('footer'),
          footerTagIsResolved: document.querySelector('footer')===f }
  };
})()`;


const FOOTER_LINK = `(function(){var t=window.__FL__; if(!t) return null; var s=getComputedStyle(t);
  return {color:s.color, td:s.textDecorationLine, opacity:s.opacity};})()`;

const FOOTER_MOBILE = `(function(){
  var f=window.__F__; if(!f) return null; var cs=function(el){return getComputedStyle(el)};
  var host=null,best=0;
  [].slice.call(f.querySelectorAll('*')).forEach(function(el){
    var d=cs(el).display; if(d!=='grid'&&d!=='flex') return;
    var kids=[].slice.call(el.children).filter(function(k){return k.getBoundingClientRect().width>0});
    if(kids.length<2) return; var w=el.getBoundingClientRect().width;
    if(w>best && kids.length<=8){best=w;host=el;}
  });
  if(!host) return null;
  var kids=[].slice.call(host.children).filter(function(k){return k.getBoundingClientRect().width>0});
  var tops=kids.map(function(k){return Math.round(k.getBoundingClientRect().top)});
  var distinct={},n=0; tops.forEach(function(t){if(!distinct[t]){distinct[t]=1;n++}});
  return { cols:kids.length, rows:n, stacked:n===kids.length, perRow:Math.round(kids.length/n*10)/10, gap:cs(host).gap };
})()`;

/* ------------------------------------------------------------------- run -- */
const results = [];
let cursor = 0;
const t0 = Date.now();
const browser = await chromium.launch({ headless: !has('headed'), channel: 'chrome' });

async function worker() {
  const ctx = await browser.newContext({
    viewport: { width: vw, height: vh },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  while (true) {
    const k = cursor++;
    if (k >= urls.length) break;
    const url = urls[k];
    const page = await ctx.newPage();
    const rec = { url, idx: k };
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(SETTLE);
      await page.evaluate(`window.__HDR__ = ${FIND_MASTHEAD};`);
      Object.assign(rec, await page.evaluate(EXTRACT));

      if (rec.found) {
        rec.state_top = await page.evaluate(SNAP);

        if (INTERACT) {
          rec.link_rest = await page.evaluate(LINK_SNAP);
          if (rec.link_rest) {
            try {
              const loc = page.locator('header a, nav a').filter({ hasText: rec.link_rest.label }).first();
              await loc.hover({ timeout: 4000 });
              await page.waitForTimeout(600);
              rec.link_hover = await page.evaluate(LINK_SNAP);
              await page.mouse.move(vw - 5, vh - 5);   // un-hover before the scroll states
              await page.waitForTimeout(250);
            } catch (e) { rec.hoverErr = String(e.message).slice(0, 60); }
          }
        }

        await page.evaluate('window.scrollTo(0,700)');  await page.waitForTimeout(1100);
        rec.state_scrolled = await page.evaluate(SNAP);
        await page.evaluate('window.scrollTo(0,2400)'); await page.waitForTimeout(900);
        rec.state_deep = await page.evaluate(SNAP);

        // Footer: measured at the desktop viewport, after scrolling to the bottom so any
        // reveal-on-scroll content is laid out.
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForTimeout(700);
        rec.footer = await page.evaluate(FOOTER);
        if (INTERACT && rec.footer && rec.footer.found && rec.footer.linkRest) {
          try {
            const fl = page.locator('footer a, [class*=footer] a').filter({ hasText: rec.footer.linkRest.label }).first();
            await fl.hover({ timeout: 3500 });
            await page.waitForTimeout(420);
            rec.footerLinkHover = await page.evaluate(FOOTER_LINK);
            await page.mouse.move(vw - 5, 5);
          } catch (e) { /* hover unavailable on this site */ }
        }

        await page.setViewportSize({ width: mw, height: mh });
        await page.evaluate('window.scrollTo(0,0)');
        await page.waitForTimeout(1000);
        await page.evaluate(`window.__HDR__ = ${FIND_MASTHEAD};`);
        rec.mobile = await page.evaluate(MOBILE);
        // Footer columns at phone width — do they stack, or stay 2-up?
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForTimeout(600);
        await page.evaluate(FOOTER);            // re-resolve __F__ at this viewport
        rec.footerMobile = await page.evaluate(FOOTER_MOBILE);

        if (INTERACT && rec.mobile && rec.mobile.burger_count > 0) {
          const b = await page.$('header button, nav button, [aria-label*="menu" i], [class*=burger]');
          if (b) {
            try {
              await b.click({ timeout: 3000 });
              await page.waitForTimeout(900);
              rec.drawer = await page.evaluate(DRAWER);
            } catch (e) { rec.drawerErr = String(e.message).slice(0, 50); }
          }
        }
      }
    } catch (e) {
      rec.error = String(e.message).slice(0, 140);
    }
    // A dead host (DNS failure) can leave a rejection pending past the try/catch; closing must never
    // take the whole corpus run down — one unreachable site is data, not a crash.
    try { await page.close(); } catch (e) { /* already gone */ }
    results.push(rec);
    const done = results.length;
    if (done % 10 === 0 || done === urls.length) {
      const rate = done / ((Date.now() - t0) / 1000);
      process.stdout.write(`  ${done}/${urls.length}  (${rate.toFixed(1)}/s, eta ${Math.round((urls.length - done) / rate)}s)\n`);
    }
  }
  try { await ctx.close(); } catch (e) { /* already gone */ }
}

console.log(`survey: ${urls.length} urls · concurrency ${CONC} · ${vw}x${vh} -> ${mw}x${mh}${INTERACT ? '' : ' · no-interact'}`);
await Promise.all(Array.from({ length: Math.min(CONC, urls.length) }, () => worker()));
await browser.close();

results.sort((a, b) => a.idx - b.idx);
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(results, null, 1));

const found = results.filter(r => r.found).length;
const errs = results.filter(r => r.error).length;
console.log(`\nDONE  ${results.length} urls · ${found} headers located · ${results.length - found - errs} no-masthead · ${errs} errors · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.log(`      -> ${outPath}`);
console.log(`      next: node digest.mjs ${outPath}`);
if (errs) console.log('errors:', results.filter(r => r.error).slice(0, 5).map(r => `${r.url} :: ${r.error}`).join('\n        '));
