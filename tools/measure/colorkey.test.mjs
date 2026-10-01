// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * props.mjs COMPARES COLOURS BY VALUE, NOT BY SPELLING.
 *
 * The lens used a string compare, so a source writing `oklab(0.999994 ... / 0.6)` and a build writing
 * `rgba(255, 255, 255, 0.6)` — the SAME colour — counted as a delta on every element that used it. That
 * inflated the total and, far worse, hid real findings: a converter fix would land and the number would
 * not move, because the deltas it removed were replaced by spelling differences the lens could not see
 * through. On one audit that masked five footer links at once.
 *
 * The check below is the reason this file exists: `rgb(0, 0, 0)` must NOT parse as alpha 0. The obvious
 * regex (`the last number before the paren`) reads opaque black as fully transparent, and that exact bug
 * shipped in the converter's own colour helper for long enough that a golden had pinned its output.
 *
 * Run: node colorkey.test.mjs
 */
import { colorKey } from './color-key.mjs';

let pass = 0, fail = 0;
const ok = (cond, msg, got) => { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ FAIL: ' + msg + (got !== undefined ? '  — got ' + got : '')); } };

console.log('\n=== colours compare by VALUE ===');
ok(colorKey('oklab(0.999994 0.0000455677 0.0000200868 / 0.6)') === colorKey('rgba(255, 255, 255, 0.6)'),
  'oklab slash-alpha white === the same rgba white', colorKey('oklab(0.999994 0.0000455677 0.0000200868 / 0.6)'));
ok(colorKey('#ffffff') === colorKey('rgb(255, 255, 255)'), 'hex white === rgb white');
ok(colorKey('oklch(0.205 0.045 265)') === colorKey(colorKey('oklch(0.205 0.045 265)').split(',').slice(0,3).map(Number).length ? 'rgb(' + colorKey('oklch(0.205 0.045 265)').split(',').slice(0,3).join(', ') + ')' : ''),
  'oklch round-trips through its own rgb form');
ok(colorKey('color(srgb 1 1 1 / 0.5)') === '255,255,255,0.5', 'color(srgb ...) is understood', colorKey('color(srgb 1 1 1 / 0.5)'));

console.log('\n=== an alpha is the fourth component, never just the last number ===');
ok(colorKey('rgb(0, 0, 0)') === '0,0,0,1', 'opaque black is alpha 1', colorKey('rgb(0, 0, 0)'));
ok(colorKey('rgba(0, 0, 0, 0)') === '0,0,0,0', 'transparent black is alpha 0', colorKey('rgba(0, 0, 0, 0)'));
ok(colorKey('transparent') === '0,0,0,0', 'the transparent keyword is alpha 0');

console.log('\n=== NEGATIVES ===');
ok(colorKey('rgb(255, 255, 255)') !== colorKey('rgba(255, 255, 255, 0.6)'), 'opaque and translucent white are NOT equal');
ok(colorKey('oklch(0.73906 0.12063 294.19)') !== colorKey('rgb(255, 255, 255)'), 'a real hue is not white');
ok(colorKey('') === '' && colorKey('inherit') === '', 'an unparseable value yields no key (the caller falls back to a string compare)');

console.log(`\nCOLOR KEY RESULT: ${fail === 0 ? 'PASS' : 'FAIL'}   (${pass} passed, ${fail} failed)`);
process.exit(fail === 0 ? 0 : 1);
