// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Class-Coverage Audit — measures how much of a source site's DESIGN INTENT the deterministic converter
 * carries, at the STRUCTURAL level the score harness doesn't see. For every wrapper (header, footer, each
 * <section> + its direct <div>s) AND every shortcode leaf (headings, buttons), it takes the SOURCE's computed
 * style (the capture's `data-sc-cs`) and checks each MEANINGFUL (non-default) property against the CONVERTED
 * page's matching element. Every checked property is CARRIED or DROPPED. Aggregated across the corpus and
 * ranked by frequency, so we fix the highest-impact drops first.
 *
 *   node class-coverage.mjs                    audit all corpus sites
 *   node class-coverage.mjs --only a,b         audit just these
 *   node class-coverage.mjs --limit 5          first N sites
 *   node class-coverage.mjs --corpus corpus-01  only sites whose capture URL matches this substring
 *   node class-coverage.mjs --keep             don't reconvert (use whatever is already on localhost — single site)
 *
 * Source styles = `rendered.html` data-sc-cs (the live site's computed values). Converted = http://localhost/
 * after import_dir. Both read in real Chrome. Sites are keyed by neutral folder id — never a brand name.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = _require('playwright')); }
catch { ({ chromium } = _require('D:/Web Dev/pw-screens/node_modules/playwright')); }

const HERE = dirname(fileURLToPath(import.meta.url));
const PHP  = process.env.PHP || 'D:/xampp/php/php.exe';
const URL  = process.env.URL || 'http://localhost/';
const BATCH = process.env.OUT || join(HERE, '../../assembled/UnysonPlus-Capture-Service/tools/design-capture/batch');
const CONVERT = join(HERE, 'class-coverage-convert.php');
const args = process.argv.slice(2);
const opt = (k,d='') => { const i=args.indexOf(k); return i>=0 && args[i+1] ? args[i+1] : d; };
const has = k => args.includes(k);
const ONLY = opt('--only','').split(',').map(s=>s.trim()).filter(Boolean);
const LIMIT = parseInt(opt('--limit','0'),10)||0;
const CORPUS = opt('--corpus','').toLowerCase();
const KEEP = has('--keep');

async function launch(){ const a=['--autoplay-policy=no-user-gesture-required'];
  try { return await chromium.launch({channel:'chrome',args:a}); }
  catch { try { return await chromium.launch({channel:'msedge',args:a}); }
    catch { console.error('[class-coverage] no real Chrome/Edge — bundled Chromium.'); return await chromium.launch({args:a}); } } }

// Resolve the capture's rendered.html at EITHER depth — directly under <slug>/ (the service's normal
// batch layout) or one level below it (a corpus whose preview endpoint yields one shared dir name for
// every site). Never hardcode a corpus's dir name.
const renderedPath = slug => { const f=join(BATCH,slug,'rendered.html'); if (existsSync(f)) return f; const p=join(BATCH,slug); if(!existsSync(p)) return ''; return readdirSync(p,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>join(p,d.name,'rendered.html')).find(existsSync)||''; };
function siteList(){
  let all=readdirSync(BATCH,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).filter(s=>renderedPath(s));
  if(ONLY.length) all=ONLY.filter(s=>all.includes(s));
  if(CORPUS) all=all.filter(s=>{ try{ const d=JSON.parse(readFileSync(join(dirname(renderedPath(s)),'design-capture.json'),'utf8')); return String(d.url||'').toLowerCase().includes(CORPUS);}catch{return false;} });
  all.sort(); return LIMIT?all.slice(0,LIMIT):all;
}

// ---- value helpers ----
const norm=s=>String(s||'').trim().toLowerCase();
const toPx=v=>{const m=norm(v).match(/^(-?[0-9.]+)px/);return m?parseFloat(m[1]):null;};
const rgb=v=>{const m=norm(v).match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(x=>parseFloat(x));return p.length>=3?p.slice(0,3):null;};
const tracks=v=>{v=norm(v);if(v.includes('repeat(')){const m=v.match(/repeat\(\s*(\d+)/);return m?+m[1]:0;}if(!v||v==='none')return 0;return v.split('/')[0].trim().split(/\s+/).filter(Boolean).length;};
const KW={'flex-start':'start','left':'start','flex-end':'end','right':'end'};
const kw=v=>{v=norm(v);return KW[v]||v;};
const colorClose=(a,b)=>a&&b&&Math.abs(a[0]-b[0])<=28&&Math.abs(a[1]-b[1])<=28&&Math.abs(a[2]-b[2])<=28;

// Is the SOURCE value MEANINGFUL (non-default, design intent)? Return the canonical target, or null to skip.
function meaningful(prop,val){
  const v=norm(val);
  switch(prop){
    case 'display': return ['grid','flex','inline-flex'].includes(v)?v:null;
    case 'grid-template-columns': return tracks(v)>=2?String(tracks(v)):null;
    case 'flex-direction': return v.startsWith('column')?'column':null;
    case 'justify-content': { const k=kw(v); return ['center','end','space-between','space-around','space-evenly'].includes(k)?k:null; }
    case 'align-items': { const k=kw(v); return ['center','end'].includes(k)?k:null; }
    case 'gap': case 'column-gap': case 'row-gap': { const p=toPx(v); return p>=8?p:null; }
    case 'min-height': { if(/vh|dvh|svh/.test(v)){const m=v.match(/([0-9.]+)/);return m?m[1]+'vh':null;} const p=toPx(v); return p>=200?p:null; }
    case 'max-width': { const p=toPx(v); return p>=200?p:null; }
    case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left': { const p=toPx(v); return p>=8?p:null; }
    case 'margin-top': case 'margin-bottom': { const p=toPx(v); return Math.abs(p)>=8?p:null; }
    case 'position': return ['absolute','fixed','sticky'].includes(v)?v:null;
    case 'z-index': return /^-?\d+$/.test(v)?v:null;
    case 'background-color': { const c=rgb(v); return c && v!=='rgba(0, 0, 0, 0)' && v!=='transparent'?c:null; }
    case 'background-image': return /gradient/.test(v)?'gradient':(/url\(/.test(v)?'image':null);
    case 'border-radius': { const p=toPx(v); return (p>=2)?p:(/%/.test(v)?'pct':null); }
    case 'box-shadow': return v!=='none'&&v!==''?'shadow':null;
    case 'border-top-width': case 'border-bottom-width': case 'border-left-width': case 'border-right-width': { const p=toPx(v); return p>=1?p:null; }
    case 'font-family': return v?v.split(',')[0].replace(/["']/g,'').trim():null;
    case 'font-size': { const p=toPx(v); return p?p:null; }
    case 'font-weight': return /^\d+$/.test(v)&&+v!==400?v:null;
    case 'color': { const c=rgb(v); return c?c:null; }
    case 'text-align': { const k=kw(v); return ['center','end'].includes(k)?k:null; }
    case 'letter-spacing': { const p=toPx(v); return Math.abs(p)>=0.3?p:null; }
    case 'text-transform': return v==='uppercase'?v:null;
    case 'line-height': { const p=toPx(v); return p?p:null; }
    default: return null;
  }
}
// Does CONVERTED value carry the meaningful source target?
function carried(prop,t,val){
  switch(prop){
    case 'display': return ['grid','flex','inline-flex'].includes(norm(val)); // converter emits flexbox for grid
    case 'grid-template-columns': return tracks(val)>=+t;
    case 'flex-direction': return norm(val)==='column'||norm(val)==='column-reverse';
    case 'justify-content': return kw(val)===t;
    case 'align-items': return kw(val)===t;
    case 'gap': case 'column-gap': case 'row-gap': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(6,t*0.25); }
    case 'min-height': { if(String(t).endsWith('vh')) return /vh|dvh|svh/.test(norm(val))||toPx(val)>=500; const p=toPx(val); return p!==null&&p>=t*0.6; }
    case 'max-width': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(24,t*0.12); }
    case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(8,t*0.35); }
    case 'margin-top': case 'margin-bottom': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(8,Math.abs(t)*0.4); }
    case 'position': return norm(val)===t;
    case 'z-index': return /^-?\d+$/.test(norm(val));
    case 'background-color': return colorClose(rgb(val),t);
    case 'background-image': return t==='gradient'?/gradient/.test(norm(val)):/url\(/.test(norm(val));
    case 'border-radius': { if(t==='pct') return /%/.test(norm(val))||toPx(val)>0; const p=toPx(val); return p!==null&&p>=2; }
    case 'box-shadow': return norm(val)!=='none'&&norm(val)!=='';
    case 'border-top-width': case 'border-bottom-width': case 'border-left-width': case 'border-right-width': { const p=toPx(val); return p!==null&&p>=1; }
    case 'font-family': return norm(val).includes(norm(t));
    case 'font-size': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(2,t*0.08); }
    case 'font-weight': return Math.abs((+norm(val)||400)-(+t||400))<=100;
    case 'color': return colorClose(rgb(val),t);
    case 'text-align': return kw(val)===t;
    case 'letter-spacing': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(0.6,Math.abs(t)*0.35); }
    case 'text-transform': return norm(val)===t;
    case 'line-height': { const p=toPx(val); return p!==null&&Math.abs(p-t)<=Math.max(4,t*0.2); }
    default: return false;
  }
}
const WRAP_PROPS=['display','grid-template-columns','flex-direction','justify-content','align-items','gap','min-height','max-width','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-bottom','position','z-index','background-color','background-image','border-radius','box-shadow','border-top-width','border-bottom-width'];
const LEAF_PROPS=['font-family','font-size','font-weight','color','text-align','letter-spacing','text-transform','line-height','background-color','border-radius'];

// In-page: collect {role,key,props} for header/footer/sections/section-divs/leaves. mode: 'attr'|'computed'.
function pageExtract(mode){
  const CS = el => {
    if (mode==='attr'){ const o={}; String(el.getAttribute('data-sc-cs')||'').split(';').forEach(p=>{const i=p.indexOf(':');if(i>0)o[p.slice(0,i).trim()]=p.slice(i+1).trim();}); return o; }
    const s=getComputedStyle(el),o={}; for(const p of ['display','grid-template-columns','flex-direction','justify-content','align-items','gap','column-gap','min-height','max-width','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-bottom','margin-left','margin-right','position','z-index','background-color','background-image','border-radius','box-shadow','border-top-width','border-bottom-width','border-left-width','border-right-width','font-family','font-size','font-weight','color','text-align','letter-spacing','text-transform','line-height']) o[p]=s.getPropertyValue(p); return o;
  };
  const txt = el => (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,50);
  const out=[];
  const add=(role,el)=>{ if(!el) return; out.push({role,key:txt(el),props:CS(el)}); };
  // header / footer / nav (chrome). The source chrome is usually a <nav>/<header> that IS the flex bar
  // (display:flex, justify-content:space-between, align-items:center). The converter rebuilds it as a NATIVE
  // header/footer whose outer element is a block WRAPPER and whose INNER row is the flex bar — so reading the
  // outer element reports a false layout drop for a bar that IS reproduced one level down. For the CONVERTED
  // page, adopt the chrome's LAYOUT props from its first flex/grid descendant (mirrors the section rule).
  const addChrome=(role,el)=>{ if(!el) return; const p=CS(el);
    if(mode==='computed'){ const bar=[...el.querySelectorAll('div,ul,nav')].find(n=>{const d=getComputedStyle(n).display;return d==='flex'||d==='grid';}); if(bar){ const bp=CS(bar); ['display','flex-direction','justify-content','align-items','gap','column-gap'].forEach(k=>{ if(bp[k]) p[k]=bp[k]; }); } }
    out.push({role,key:txt(el),props:p}); };
  addChrome('header', document.querySelector('header') || document.querySelector('nav'));
  addChrome('footer', document.querySelector('footer'));
  // sections + their direct <div> children
  const LAYOUT=['display','grid-template-columns','flex-direction','justify-content','align-items','gap','column-gap'];
  document.querySelectorAll('section').forEach(sec=>{
    const h=sec.querySelector('h1,h2,h3'); const key=h?(h.textContent||'').replace(/\s+/g,' ').trim().slice(0,50):txt(sec);
    const p=CS(sec);
    // the converter moves a section's grid onto an INNER flexbox; for the CONVERTED page, read the section's
    // LAYOUT props from its first .fw-flexbox descendant so "grid carried?" isn't a false drop.
    if (mode==='computed'){ const fx=sec.querySelector('.fw-flexbox'); if(fx){ const fp=CS(fx); LAYOUT.forEach(k=>{ if(fp[k]) p[k]=fp[k]; }); } }
    out.push({role:'section',key,props:p});
    // DEPTH CORRECTION (converted page only): the source carries a card's SKIN (fill/border/rounding) AND its
    // LAYOUT (flex display/align/justify/gap) on the section's DIRECT grid cell, but the converter paints the skin
    // on an INNER card wrapper and moves the grid onto an INNER .fw-flexbox — one level down from the section's
    // direct div. Reading only the direct div reports a FALSE drop for a property that IS reproduced deeper. So for
    // each depth-eligible prop that is DEFAULT on the direct div, adopt the first descendant that carries a real
    // value (mirrors the section-level LAYOUT-from-.fw-flexbox rule at line 148). This measures reality, not depth.
    const DEEP={
      'background-color':v=>v==='rgba(0, 0, 0, 0)'||v==='transparent'||v==='',
      'background-image':v=>v==='none'||v==='',
      'border-radius':v=>parseFloat(v)===0||v==='',
      'box-shadow':v=>v==='none'||v==='',
      'border-top-width':v=>parseFloat(v)===0||v==='', 'border-bottom-width':v=>parseFloat(v)===0||v==='',
      'border-left-width':v=>parseFloat(v)===0||v==='', 'border-right-width':v=>parseFloat(v)===0||v==='',
      'display':v=>!['flex','grid','inline-flex'].includes(v),
      'align-items':v=>['normal','stretch',''].includes(v),
      'justify-content':v=>['normal','flex-start',''].includes(v),
      'flex-direction':v=>v!=='column'&&v!=='column-reverse',
      'gap':v=>parseFloat(v)===0||v==='normal'||v==='', 'column-gap':v=>parseFloat(v)===0||v==='normal'||v==='',
    };
    // Exclude DECORATIVE BACKDROP LAYERS — a section's direct div that is position:absolute/fixed is an
    // overlay/background layer (a full-bleed gradient wash, a `inset-0 -z-10 flex items-center` media backdrop),
    // NOT a content column; the converter reproduces it as a section BACKGROUND, so its align/justify/position
    // never map onto a content div and were pure false drops (same non-content principle as the chrome-button
    // exclusion). Filter on BOTH source and converted so the surviving `#i` indices still line up.
    const posOf=el=> (mode==='attr' ? ((String(el.getAttribute('data-sc-cs')||'').match(/(?:^|;)\s*position:\s*([^;]+)/)||[])[1]||'') : getComputedStyle(el).position).trim();
    [...sec.children].filter(c=>c.tagName==='DIV').filter(c=>{const p=posOf(c);return p!=='absolute'&&p!=='fixed';}).slice(0,4).forEach((d,i)=>{
      const props=CS(d);
      if(mode==='computed'){ const inner=d.querySelectorAll('div'); for(const k in DEEP){ if(!DEEP[k]((props[k]||'').trim()))continue; for(const nd of inner){ const cv=getComputedStyle(nd).getPropertyValue(k); if(!DEEP[k]((cv||'').trim())){ props[k]=cv; break; } } } }
      out.push({role:'section-div',key:key+'#'+i,props});
    });
  });
  // shortcode leaves: headings + buttons
  document.querySelectorAll('h1,h2,h3').forEach(h=>out.push({role:'heading',key:txt(h),props:CS(h)}));
  // CONTENT buttons only. Exclude CHROME buttons — the mobile-menu toggle, a modal close (× / ✕ / ☰), and any
  // button inside <header>/<nav> (the header CTA, measured under the 'header' role). They render in the theme's
  // default font and, being pooled with real CTAs, fuzzy-matched a source content button to the wrong element and
  // reported a false type drop. Keep only buttons with a real word label (drops single-glyph / symbol-only controls).
  document.querySelectorAll('a[class*=btn],button,a[class*=button]').forEach(b=>{
    const t=txt(b);
    if(!t||t.length<2||/^[^\p{L}\p{N}]+$/u.test(t)) return; // no label, or a symbol-only control (×, ☰, →)
    if(b.closest('header,nav')) return;                     // chrome button (toggle / header CTA)
    out.push({role:'button',key:t,props:CS(b)});
  });
  return out;
}

// match a source item to a converted item (same role, closest key)
function matchItem(src, convByRole){
  const pool=convByRole[src.role]||[];
  if(src.role==='header'||src.role==='footer') return pool[0]||null;
  // exact key first, then a normalized-substring match
  let m=pool.find(c=>c.key===src.key);
  if(!m){ const sk=src.key.toLowerCase().replace(/[^a-z0-9]/g,''); m=pool.find(c=>{const ck=c.key.toLowerCase().replace(/[^a-z0-9]/g,'');return sk&&ck&&(sk.includes(ck)||ck.includes(sk));}); }
  return m||null;
}

async function run(){
  const sites=siteList();
  if(!sites.length){ console.error('no sites'); process.exit(1); }
  console.log(`Class-Coverage Audit — ${sites.length} site(s)${KEEP?' (--keep: no reconvert)':''}\n`);
  const browser=await launch();
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  // agg[role][prop] = {carried, dropped, examples:Set}
  const agg={}; const bump=(role,prop,ok,site)=>{ agg[role]=agg[role]||{}; const a=agg[role][prop]=agg[role][prop]||{carried:0,dropped:0,sites:new Set()}; if(ok)a.carried++; else {a.dropped++; a.sites.add(site);} };
  const perSite=[];
  for(const slug of sites){
    const rp=renderedPath(slug); if(!rp) continue;
    if(!KEEP){ try{ execFileSync(PHP,[CONVERT,dirname(rp)],{stdio:['ignore','ignore','ignore'],timeout:180000}); }catch(e){ console.log(`  ${slug}: convert FAILED`); continue; } }
    // source
    let srcItems=[]; try{ await page.goto(pathToFileURL(rp).href,{waitUntil:'domcontentloaded',timeout:60000}); srcItems=await page.evaluate(pageExtract,'attr'); }catch{ }
    // converted
    let convItems=[]; try{ await page.goto(URL,{waitUntil:'load',timeout:60000}); await page.waitForTimeout(1200); convItems=await page.evaluate(pageExtract,'computed'); }catch{ }
    const convByRole={}; convItems.forEach(c=>{(convByRole[c.role]=convByRole[c.role]||[]).push(c);});
    let sc=0,sd=0;
    for(const s of srcItems){
      const props = (s.role==='heading'||s.role==='button')?LEAF_PROPS:WRAP_PROPS;
      const m=matchItem(s,convByRole);
      for(const prop of props){
        const t=meaningful(prop,s.props[prop]); if(t===null) continue;
        const ok = m ? carried(prop,t,m.props[prop]||'') : false;
        bump(s.role,prop,ok,slug); ok?sc++:sd++;
      }
    }
    perSite.push({slug,carried:sc,dropped:sd,pct:sc+sd?Math.round(sc/(sc+sd)*100):100});
    console.log(`  ${slug.padEnd(46)} carried ${sc} / dropped ${sd}  (${perSite[perSite.length-1].pct}%)`);
  }
  await browser.close();

  // ---- report ----
  console.log('\n=== DROPPED design-intent properties (ranked by # sites affected) ===');
  const rows=[];
  for(const role of Object.keys(agg)) for(const prop of Object.keys(agg[role])){ const a=agg[role][prop]; if(a.dropped>0) rows.push({role,prop,dropped:a.dropped,carried:a.carried,sites:a.sites.size}); }
  rows.sort((x,y)=>y.sites-x.sites || y.dropped-x.dropped);
  for(const r of rows.slice(0,40)) console.log(`  ${r.sites.toString().padStart(3)} sites  ${(r.role+' · '+r.prop).padEnd(38)} dropped ${r.dropped}, carried ${r.carried}`);
  const totC=perSite.reduce((s,x)=>s+x.carried,0), totD=perSite.reduce((s,x)=>s+x.dropped,0);
  console.log(`\ncorpus coverage: ${totC}/${totC+totD} = ${totC+totD?Math.round(totC/(totC+totD)*100):100}% of meaningful properties carried`);
  const outFile=join(HERE,'score','_class-coverage.json');
  try{ writeFileSync(outFile, JSON.stringify({at:new Date().toISOString(), sites:perSite, dropped:rows.map(r=>({...r,examples:[...(agg[r.role][r.prop].sites)].slice(0,5)}))}, null, 1)); console.log('saved '+outFile); }catch{}
}
run().catch(e=>{ console.error(e); process.exit(1); });
