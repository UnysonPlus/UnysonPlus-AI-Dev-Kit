#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Converter Training Harness — BATCH CAPTURE
 * ------------------------------------------
 * Captures a corpus of source sites into per-slug output dirs. The capture service names its
 * output dir from the URL, so a corpus served from ONE preview endpoint that ignores the query
 * string yields a single shared dir name for every site in it — the per-slug parent here stops
 * those colliding. Skips sites already captured. Idempotent + background-friendly.
 *
 * Usage:
 *   node capture.mjs <list-file> [--out <dir>] [--base <url-template>] [--limit N] [--force]
 *     <list-file>  a corpus list under sites/. Lines are either:
 *                    https://full/url         → captured as-is
 *                    category|slug            → expanded against the corpus BASE endpoint
 *                  The base comes from a `#base=<url-template>` directive in the list itself (or
 *                  --base), never from this file, so the harness stays corpus-agnostic. The
 *                  template may use {category} and {slug}; otherwise they are appended as query
 *                  parameters. Blank lines and #comments ignored.
 *     --out        captures root (default: ../design-capture/batch, resolved to the
 *                  kit's assembled capture-service if present)
 *     --limit N    only the first N uncaptured sites (handy for a quick pass)
 *     --force      re-capture even if pages.json already exists
 *
 * Requires the capture service deps (NODE_PATH to a playwright install) — same as
 * running capture.mjs directly.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const listFile = args.find(a => !a.startsWith('--'));
const getOpt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i+1] : def; };
const FORCE = args.includes('--force');
const LIMIT = parseInt(getOpt('--limit','0'),10) || 0;

if (!listFile || !existsSync(listFile)) { console.error('usage: node capture.mjs <list-file> [--out dir] [--limit N] [--force]'); process.exit(2); }

// the capture-service capture.mjs — prefer the kit's assembled copy (the one start-converter.bat runs)
const CS_KIT = resolve(__dir, '../../assembled/UnysonPlus-Capture-Service/tools/design-capture/capture.mjs');
const CS = existsSync(CS_KIT) ? CS_KIT : resolve(__dir, '../design-capture/capture.mjs');
if (!existsSync(CS)) { console.error('capture-service capture.mjs not found near', CS); process.exit(2); }
const OUT = resolve(getOpt('--out', join(dirname(CS), 'batch')));
mkdirSync(OUT, { recursive: true });

// A `category|slug` line needs a BASE endpoint to expand against. That endpoint belongs to whichever corpus
// the list came from, so the LIST supplies it (a `#base=<url-template>` directive on a comment line) or
// `--base` does — it is never hardcoded here, so the trainer stays corpus-agnostic. The template may use
// {category} and {slug} placeholders; without them the two are appended as query parameters.
const urlFor = (line, base) => {
  if (/^https?:\/\//i.test(line)) return { slug: line.replace(/^https?:\/\//,'').replace(/[^a-z0-9]+/gi,'_').replace(/_+$/,'').slice(0,60), url: line };
  const [cat, slug] = line.split('|').map(s => s.trim());
  if (!base) {
    console.error(`"${line}" is a category|slug line but no base endpoint is set.`
      + ' Add `#base=<url-template>` to the list file (it may use {category} and {slug}), or pass --base.');
    process.exit(2);
  }
  const url = /\{(category|slug)\}/.test(base)
    ? base.replace(/\{category\}/g, encodeURIComponent(cat)).replace(/\{slug\}/g, encodeURIComponent(slug))
    : `${base}${base.includes('?') ? '&' : '?'}category=${encodeURIComponent(cat)}&slug=${encodeURIComponent(slug)}`;
  return { slug, url };
};

const BASE_TMPL = getOpt('--base', '');
const rawLines = readFileSync(listFile,'utf8').split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
const BASE = BASE_TMPL || (rawLines.find(l => /^#\s*base\s*=/i.test(l)) || '').replace(/^#\s*base\s*=/i,'').trim();
const lines = rawLines.filter(l => !l.startsWith('#'));
let done = 0, skipped = 0, failed = 0, n = 0;
for (const line of lines) {
  const { slug, url } = urlFor(line, BASE);
  const siteOut = join(OUT, slug);
  // The capture service names its output dir from the URL, so a preview endpoint that ignores the query
  // string yields ONE shared dir name across a whole corpus — hence the per-slug parent. Find the marker
  // file at either depth rather than hardcoding any particular corpus's dir name.
  const pagesJson = existsSync(join(siteOut,'pages.json')) ? join(siteOut,'pages.json')
    : (existsSync(siteOut) ? (readdirSync(siteOut,{withFileTypes:true}).filter(d=>d.isDirectory())
        .map(d=>join(siteOut,d.name,'pages.json')).find(existsSync) || join(siteOut,'pages.json'))
      : join(siteOut,'pages.json'));
  if (!FORCE && existsSync(pagesJson)) { skipped++; continue; }
  if (LIMIT && n >= LIMIT) break;
  n++;
  process.stdout.write(`[${n}] capturing ${slug} … `);
  const r = spawnSync('node', [CS, url, siteOut + '/'], { encoding: 'utf8', timeout: 180000 });
  const ok = /queue done: 1\/1 ok/.test(r.stdout || '');
  const el = (/(\(\d+ el)/.exec(r.stdout||'')||[])[1] || '';
  if (ok) { done++; console.log(`ok ${el}`); } else { failed++; console.log('FAILED'); }
}
console.log(`\ncaptured=${done} skipped(existing)=${skipped} failed=${failed}  → ${OUT}`);
