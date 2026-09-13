// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * option-reachability/check.mjs — which header/footer theme options can a CONVERSION actually reach?
 *
 * Why this exists
 * ---------------
 * Adding a theme option does not close a converter gap. The option also has to be EMITTED, by BOTH
 * twins: the JS `to-theme-settings.mjs` and the PHP `class-fw-site-converter-stitch.php`. Miss that
 * step and the capability ships, gets recorded as "CLOSED", and never fires on a single conversion.
 *
 * That is not hypothetical. Gap G3 (top offset for a detached pill/card header) was recorded
 * "CLOSED in unysonplus-theme 2.5.90". The theme options exist. Neither converter has ever emitted
 * one of them. And `logo_tagline_show` shipped in the PHP twin only — the same JS/PHP drift class
 * that put a `saturate` rule on one side and a broken `header_shadow_depth` regex on both.
 *
 * This reports three states per option id:
 *
 *   BOTH      - emitted by both twins. Reachable from a conversion. Fine.
 *   ONE-SIDED - emitted by exactly one twin. **This is a bug**: PHP is authoritative for a bundle
 *               import (import_dir re-runs build_from_html and overwrites the JS theme-settings.json),
 *               so a PHP-only rule silently wins and a JS-only rule silently loses. Exit code 1.
 *   NEITHER   - emitted by no twin. Informational ONLY — most theme options are deliberately manual
 *               (a user preference no source page can imply). It becomes interesting when someone
 *               has just recorded a converter gap as closed.
 *
 * It is a LEDGER first (like capture-residue.mjs): it fails ONLY on one-sided drift, never on
 * NEITHER, because gating on NEITHER would demand a converter rule for every user preference.
 *
 * Run: node check.mjs [--json] [--all]
 *   --all   also lists the NEITHER ids (long; default prints only the count + the flagged ones)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/Web Dev';
const THEME_OPTS = join(ROOT, 'unysonplus-theme/framework-customizations/theme/options');
const JS_DIR = join(ROOT, 'UnysonPlus-AI-Dev-Kit/assembled/UnysonPlus-Capture-Service/tools/design-capture');
const PHP_STITCH = join(ROOT, 'unysonplus/framework/extensions/site-converter/includes/class-fw-site-converter-stitch.php');

/**
 * Ids that are legitimately one-sided, with the reason. Keep this SHORT and justified — every entry
 * is a place the two engines disagree on purpose, which is exactly what this tool exists to surface.
 */
const ALLOWED_ONE_SIDED = {
  // (empty — add only with a written reason)
};

const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } };

/** Theme option ids from the header/footer option files. */
function themeOptionIds() {
  if (!existsSync(THEME_OPTS)) throw new Error('theme options dir not found: ' + THEME_OPTS);
  const files = readdirSync(THEME_OPTS).filter((f) => /^(header|footer)-.*\.php$/.test(f));
  const ids = new Map(); // id -> file
  for (const f of files) {
    const src = read(join(THEME_OPTS, f));
    // An option id is an array key whose VALUE is an option definition — `array(` / `[` / a helper
    // call like `$design_len(`. A CHOICE key ('full' => __('Full')) maps to a translation call, so
    // requiring the value to open a definition excludes it.
    const re = /'([a-z][a-z0-9_]{2,})'\s*=>\s*(array\s*\(|\[|\$[a-z_]+\s*\()/gi;
    let m;
    while ((m = re.exec(src))) if (!ids.has(m[1])) ids.set(m[1], f);
  }
  return ids;
}

/**
 * Does a twin emit this id?
 *
 * MUST match both quoting styles or the result is garbage: PHP writes `$values['footer_col_gap']`
 * (quoted) while JS writes `values.footer_col_gap` (bare). An earlier quoted-only version of this
 * matcher reported 94 "one-sided" options, nearly all of them JS rules it simply could not see.
 */
function emits(src, id) {
  const re = new RegExp(`(?:['"\`]${id}['"\`]|\\b${id}\\b)`);
  return src.split('\n').some((line) => {
    const t = line.trim();
    if (t.startsWith('*') || t.startsWith('//') || t.startsWith('#')) return false;
    return re.test(line);
  });
}

/**
 * Ids too generic for a TEXT scan to attribute ('enabled', 'mode', 'options', 'both'). They are real
 * option keys inside nested groups, but the word appears everywhere in both engines for unrelated
 * reasons, so any verdict on them is noise. Reported as AMBIGUOUS rather than silently dropped —
 * hiding them would be the same silent-drop failure this tool exists to expose.
 */
const isAmbiguous = (id) => !id.includes('_') || id.length < 6;

/**
 * Some .mjs files GENERATE PHP source as a string (pen-shortcode.mjs emits a shortcode's PHP). Their
 * contents are PHP, not JS emission, so scanning them attributes PHP rules to the JS twin — that is
 * how `group_main` first reported as "JS-only", a bug that does not exist. Detect them by PHP markers
 * rather than naming the file, so a future generator is excluded automatically.
 */
const isPhpGenerator = (src) => /<\?php|=>\s*array\s*\(/.test(src);

const jsSrc = readdirSync(JS_DIR)
  .filter((f) => f.endsWith('.mjs') && !f.includes('.test.'))
  .map((f) => read(join(JS_DIR, f)))
  .filter((src) => !isPhpGenerator(src))
  .join('\n');
const phpSrc = read(PHP_STITCH);
if (!jsSrc.trim()) throw new Error('no JS converter source read from ' + JS_DIR);
if (!phpSrc.trim()) throw new Error('no PHP stitch source read from ' + PHP_STITCH);

const ids = themeOptionIds();
const both = [], oneSided = [], neither = [], ambiguous = [];
for (const [id, file] of ids) {
  if (isAmbiguous(id)) { ambiguous.push({ id, file }); continue; }
  const j = emits(jsSrc, id), p = emits(phpSrc, id);
  if (j && p) both.push({ id, file });
  else if (j || p) oneSided.push({ id, file, only: j ? 'JS' : 'PHP' });
  else neither.push({ id, file });
}

/**
 * The two drift directions are NOT equally severe, and conflating them makes the tool useless.
 *
 *   JS-only  = a REAL bug. import_dir overwrites theme-settings.json from the PHP engine, so a rule
 *              that exists only in JS is silently DISCARDED on every bundle import. Fail the run.
 *   PHP-only = a ledger entry. PHP wins on import, so the WP path is correct; only a consumer of the
 *              standalone JS bundle sees less. Report it, do NOT fail — 28 of these exist today, and
 *              a gate that is red by default is a gate everyone learns to ignore.
 */
const jsOnly = oneSided.filter((o) => o.only === 'JS' && !ALLOWED_ONE_SIDED[o.id]);
const phpOnly = oneSided.filter((o) => o.only === 'PHP' && !ALLOWED_ONE_SIDED[o.id]);
const flagged = jsOnly;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ both, oneSided, neither, ambiguous, flagged }, null, 2));
  process.exit(flagged.length ? 1 : 0);
}

console.log(`\nHeader/footer theme options: ${ids.size}`);
console.log(`  BOTH twins emit : ${both.length}   (reachable from a conversion)`);
console.log(`  ONE-SIDED       : ${oneSided.length}   <- drift`);
console.log(`  NEITHER         : ${neither.length}   (informational — most are manual-only prefs)`);
console.log(`  AMBIGUOUS       : ${ambiguous.length}   (too generic to attribute by text scan — not judged)`);

if (jsOnly.length) {
  console.log('\n✗ JS-ONLY — DISCARDED on every bundle import (import_dir overwrites from PHP):');
  for (const o of jsOnly) console.log(`    ${o.id.padEnd(30)} ${o.file}`);
}

if (phpOnly.length) {
  console.log(`\n⚠ PHP-only (${phpOnly.length}) — WP imports are correct (PHP wins); the standalone JS bundle emits less:`);
  for (const o of phpOnly) console.log(`    ${o.id.padEnd(30)} ${o.file}`);
}

if (process.argv.includes('--all') && neither.length) {
  console.log('\n  NEITHER (no converter emits these):');
  for (const n of neither) console.log(`    ${n.id.padEnd(28)} ${n.file}`);
}

console.log(jsOnly.length
  ? `\n✗ ${jsOnly.length} JS-only option${jsOnly.length === 1 ? '' : 's'} — add the rule to the PHP twin, then a case to BOTH parity fixtures`
  : '\n✓ no JS-only drift — nothing a bundle import would discard');
process.exit(flagged.length ? 1 : 0);
