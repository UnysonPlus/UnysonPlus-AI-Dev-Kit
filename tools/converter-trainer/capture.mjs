#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Converter Training Harness — BATCH CAPTURE
 * ------------------------------------------
 * Captures a list of demo sites (openhero/wegic/arbitrary URLs) into per-slug
 * output dirs, so the shared capture-service slug (`openhero_art_api_preview`,
 * identical for every openhero URL because it ignores the query string) does NOT
 * collide. Skips sites already captured. Idempotent + background-friendly.
 *
 * Usage:
 *   node capture.mjs <list-file> [--out <dir>] [--limit N] [--force]
 *     <list-file>  a sites/*.txt file. Lines are either:
 *                    category|slug            → https://openhero.art/api/preview?category=..&slug=..
 *                    https://full/url         → captured as-is
 *                  blank lines and #comments ignored.
 *     --out        captures root (default: ../design-capture/batch, resolved to the
 *                  kit's assembled capture-service if present)
 *     --limit N    only the first N uncaptured sites (handy for a quick pass)
 *     --force      re-capture even if pages.json already exists
 *
 * Requires the capture service deps (NODE_PATH to a playwright install) — same as
 * running capture.mjs directly.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
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

const urlFor = (line) => {
  if (/^https?:\/\//i.test(line)) return { slug: line.replace(/^https?:\/\//,'').replace(/[^a-z0-9]+/gi,'_').replace(/_+$/,'').slice(0,60), url: line };
  const [cat, slug] = line.split('|').map(s => s.trim());
  return { slug, url: `https://openhero.art/api/preview?category=${cat}&slug=${slug}` };
};

const lines = readFileSync(listFile,'utf8').split(/\r?\n/).map(l=>l.trim()).filter(l=>l && !l.startsWith('#'));
let done = 0, skipped = 0, failed = 0, n = 0;
for (const line of lines) {
  const { slug, url } = urlFor(line);
  const siteOut = join(OUT, slug);
  const pagesJson = join(siteOut, 'openhero_art_api_preview', 'pages.json');
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
