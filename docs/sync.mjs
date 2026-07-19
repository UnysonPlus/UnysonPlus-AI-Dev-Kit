#!/usr/bin/env node
/**
 * sync.mjs — keep the kit docs in sync with the plugin/theme WITHOUT re-reading everything.
 *
 * Each doc maps 1:1 to a source unit (a shortcode's options.php, an option-type class, an AE
 * module's *-settings.php, an extension's manifest.php, the theme options/). This tool records a
 * content HASH of each doc's source in `.doc-manifest.json`, then a `check` re-hashes the source and
 * prints ONLY the docs whose source changed — so you regenerate just those, never the whole set.
 *
 *   node docs/sync.mjs build              # (re)generate the full manifest baseline (hash all source)
 *   node docs/sync.mjs check              # list STALE docs (source changed) + UNRESOLVED/MISSING
 *   node docs/sync.mjs stamp <doc...>     # re-record hashes for the given doc(s) after regenerating
 *
 * Hashing is a shell op — it costs ZERO agent tokens. Runs on a machine that has the source
 * (the working copies as siblings of the kit, or `assemble.ps1 -WithSource`). Override roots with
 * env KIT_SRC_PLUGIN / KIT_SRC_THEME.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const DOCS = dirname(fileURLToPath(import.meta.url));
const KIT = resolve(DOCS, '..');
const pick = (cands) => cands.find(p => p && existsSync(p));
const PLUGIN = pick([process.env.KIT_SRC_PLUGIN, join(KIT, '..', 'unysonplus'), join(KIT, 'unysonplus')]);
const THEME  = pick([process.env.KIT_SRC_THEME,  join(KIT, '..', 'unysonplus-theme'), join(KIT, 'unysonplus-theme')]);
const MANIFEST = join(DOCS, '.doc-manifest.json');

const md5 = (b) => createHash('md5').update(b).digest('hex');
const lsMd = (dir) => existsSync(join(DOCS, dir)) ? readdirSync(join(DOCS, dir)).filter(f => f.endsWith('.md') && f !== 'README.md') : [];
const glob = (dir, re) => existsSync(dir) ? readdirSync(dir).filter(f => re.test(f)).map(f => join(dir, f)) : [];
const themeVer = () => { try { return (/Version:\s*([\d.]+)/.exec(readFileSync(join(THEME, 'style.css'), 'utf8')) || [])[1] || '?'; } catch { return '?'; } };
const pluginVer = () => { try { return (/Version:\s*([\d.]+)/.exec(readFileSync(join(PLUGIN, 'unysonplus.php'), 'utf8')) || [])[1] || '?'; } catch { return '?'; } };

// ---- doc → source file(s) resolver ----
const SC = PLUGIN && join(PLUGIN, 'framework/extensions/shortcodes/shortcodes');
const OT = PLUGIN && join(PLUGIN, 'framework/includes/option-types');
const MOD = PLUGIN && join(PLUGIN, 'framework/extensions/animation-engine/modules');
const EXT = PLUGIN && join(PLUGIN, 'framework/extensions');
const THOPT = THEME && join(THEME, 'framework-customizations/theme/options');
const COMP = PLUGIN && join(PLUGIN, 'framework/extensions/shortcodes/includes/theme-settings'); // preset/component + misc UIs
const PRESETS = PLUGIN && join(PLUGIN, 'framework/includes/presets');                             // preset default scales

// shortcodes whose source dir isn't shortcodes/shortcodes/<name>
const SC_OVERRIDE = {
  image: join(SC || '', 'media-image'),
  'gallery-3d': EXT && join(EXT, 'animation-engine/shortcodes/gallery-3d'),
  'image-sequence': EXT && join(EXT, 'animation-engine/shortcodes/image-sequence'),
  'model-viewer': EXT && join(EXT, 'animation-engine/shortcodes/model-viewer'),
  'svg-draw': EXT && join(EXT, 'animation-engine/shortcodes/svg-draw'),
  'svg-morph': EXT && join(EXT, 'animation-engine/shortcodes/svg-morph'),
  'webgl-object': EXT && join(EXT, 'animation-engine/shortcodes/webgl-object'),
  'contact-form': EXT && join(EXT, 'forms/extensions/contact-forms/shortcodes/contact-form'),
  portfolio: EXT && join(EXT, 'portfolio/shortcodes/portfolio'),
  'project-gallery': EXT && join(EXT, 'portfolio/shortcodes/project-gallery'),
};

function sourcesFor(docRel) {
  const slash = docRel.indexOf('/');
  const folder = slash < 0 ? '' : docRel.slice(0, slash);
  const base = docRel.slice(slash + 1).replace(/\.md$/, '');
  if (docRel.endsWith('README.md')) return { kind: 'index', src: [] };

  if (folder === 'shortcodes') {
    const dir = SC_OVERRIDE[base] || (SC && join(SC, base));
    if (!dir || !existsSync(dir)) return { kind: 'shortcode', src: [] };
    return { kind: 'shortcode', src: glob(dir, /^(options|config)\.php$/) };
  }
  if (folder === 'option-types') {
    const name = base === 'compact-color' ? 'predefined-colors-color-picker-compact' : base;
    const dir = OT && join(OT, name);
    return { kind: 'option-type', src: glob(dir || '', /^class-fw-option-type-.*\.php$/) };
  }
  if (folder === 'animation-engine') {
    const inc = MOD && join(MOD, base, 'includes');
    let src = glob(inc || '', /-settings\.php$/);
    if (!src.length && MOD) src = glob(join(MOD, base), /\.php$/);   // modules with no includes/ dir
    return { kind: 'ae-module', src };
  }
  if (folder === 'extensions') {
    const dir = EXT && join(EXT, base);
    if (!dir) return { kind: 'extension', src: [] };
    const src = [
      join(dir, 'manifest.php'), join(dir, 'config.php'), join(dir, 'settings-options.php'),
      ...glob(join(dir, 'options'), /\.php$/),                 // e.g. megamenu default/row/column/item
    ].filter(existsSync);
    return { kind: 'extension', src };
  }
  if (folder === 'theme-settings') {
    const t = (f) => THOPT && join(THOPT, f);
    const c = (f) => COMP && join(COMP, f);
    const p = (f) => PRESETS && join(PRESETS, f);
    const MAP = {
      colors:       [c('components-color.php'), p('color-presets.php')],
      typography:   [c('components-typography.php'), t('general-typography.php'), t('general-fonts.php')],
      buttons:      [c('components-buttons.php'), p('button-presets.php')],
      boxes:        [c('components-box.php'), c('components-section-styles.php'), c('components-patterns.php'), c('components-table.php')],
      spacing:      [c('components-spacing.php'), p('spacing-presets.php')],
      general:      [t('general-settings.php'), t('general-base.php'), t('general-layout.php'), t('general-sidebar.php')],
      header:       glob(THOPT || '', /^header-.*\.php$/),
      footer:       glob(THOPT || '', /^footer-.*\.php$/),
      blog:         glob(THOPT || '', /^blog-.*\.php$/),
      pages:        [...glob(THOPT || '', /^pages-.*\.php$/), t('page-options.php'), t('post-options.php'), t('general-pages.php')],
      'site-ux':    glob(THOPT || '', /^site-wide-ux-.*\.php$/),
      social:       [t('general-social.php'), t('social-settings.php')],
      misc:         [t('misc.php'), ...glob(COMP || '', /^miscellaneous-.*\.php$/)],
      woocommerce:  [t('woocommerce-settings.php')],
    };
    const src = (MAP[base] || []).filter(Boolean).filter(existsSync);
    return { kind: 'theme-settings', src };
  }
  return { kind: 'unknown', src: [] };
}

const hashOf = (paths) => paths.length ? md5(paths.slice().sort().map(p => md5(readFileSync(p))).join('\n')) : null;
const rel = (p) => p.replace(PLUGIN || '\0', '{plugin}').replace(THEME || '\0', '{theme}').replace(/\\/g, '/');

// ---- enumerate every doc ----
function allDocs() {
  const out = [];
  for (const f of readdirSync(DOCS)) if (f.endsWith('.md')) out.push(f);            // top-level (theme-settings-reference)
  for (const d of ['shortcodes', 'option-types', 'animation-engine', 'extensions', 'theme-settings'])
    for (const f of lsMd(d)) out.push(`${d}/${f}`);
  return out.sort();
}

function build() {
  if (!PLUGIN || !THEME) { console.error('Source not found. Set KIT_SRC_PLUGIN / KIT_SRC_THEME, or place the working copies beside the kit / run assemble.ps1 -WithSource.'); process.exit(1); }
  const today = process.env.SYNC_DATE || new Date().toISOString().slice(0, 10);
  const docs = {};
  let unresolved = 0;
  for (const d of allDocs()) {
    const { kind, src } = sourcesFor(d);
    if (kind === 'index') continue;
    if (!src.length) { unresolved++; docs[d] = { kind, src: [], hash: null, synced: today, note: 'UNRESOLVED — no source found' }; continue; }
    docs[d] = { kind, src: src.map(rel), hash: hashOf(src), synced: today };
  }
  writeFileSync(MANIFEST, JSON.stringify({ generated_against: { unysonplus: pluginVer(), 'unysonplus-theme': themeVer(), synced: today }, docs }, null, 2) + '\n');
  console.log(`built manifest: ${Object.keys(docs).length} docs (${unresolved} unresolved) → .doc-manifest.json`);
}

function loadManifest() { if (!existsSync(MANIFEST)) { console.error('No .doc-manifest.json — run `node docs/sync.mjs build` first.'); process.exit(1); } return JSON.parse(readFileSync(MANIFEST, 'utf8')); }

function check() {
  if (!PLUGIN || !THEME) { console.error('Source not found (need the plugin/theme to hash). Set KIT_SRC_* or assemble -WithSource.'); process.exit(1); }
  const man = loadManifest();
  const stale = [], missingSrc = [], newDocs = [], unresolved = [];
  const known = new Set(Object.keys(man.docs));
  for (const d of allDocs()) {
    if (d.endsWith('README.md')) continue;
    const { src } = sourcesFor(d);
    if (!src.length) { unresolved.push(d); continue; }
    if (!known.has(d)) { newDocs.push(d); continue; }
    const cur = hashOf(src);
    if (cur !== man.docs[d].hash) stale.push(d);
  }
  for (const d of known) { const s = man.docs[d]; if (s.hash && !allDocs().includes(d)) missingSrc.push(d); }
  const p = (t, a) => a.length && console.log(`\n${t} (${a.length}):\n` + a.map(x => '  ' + x).join('\n'));
  console.log(`\nManifest baseline: unysonplus ${man.generated_against.unysonplus} / theme ${man.generated_against['unysonplus-theme']} (synced ${man.generated_against.synced})`);
  console.log(`Now: unysonplus ${pluginVer()} / theme ${themeVer()}`);
  p('STALE — source changed, regenerate these docs', stale);
  p('NEW — doc has no manifest entry, run stamp', newDocs);
  p('UNRESOLVED — no source file matched (check the resolver)', unresolved);
  if (!stale.length && !newDocs.length) console.log('\n✓ all docs in sync with source.');
  else console.log(`\n→ regenerate the STALE/NEW docs, then: node docs/sync.mjs stamp ${[...stale, ...newDocs].join(' ')}`);
}

function stamp(list) {
  const man = loadManifest();
  const today = process.env.SYNC_DATE || new Date().toISOString().slice(0, 10);
  for (const d of list) {
    const { kind, src } = sourcesFor(d);
    if (!src.length) { console.log(`  skip ${d} (no source resolved)`); continue; }
    man.docs[d] = { kind, src: src.map(rel), hash: hashOf(src), synced: today };
    console.log(`  stamped ${d}`);
  }
  writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'build') build();
else if (cmd === 'check') check();
else if (cmd === 'stamp') { if (!args.length) { console.error('usage: node docs/sync.mjs stamp <doc.md> …'); process.exit(1); } stamp(args); }
else { console.log('usage: node docs/sync.mjs <build|check|stamp <doc…>>'); }
