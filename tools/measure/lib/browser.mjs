// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// browser.mjs — the ONE browser session for every tool in this folder.
//
// Why this exists: each tool used to launch its own browser. That left three different ways of
// resolving chromium, TWO different browsers (playwright-core + system Chrome in probe/shot/
// section-audit, bundled Chromium in container-check/fidelity-check/compare/measure/props) and
// five different "page is settled" policies. Numbers taken by two tools were therefore not
// strictly comparable — different font rasterisation and different UA defaults — and nothing said
// so. One session, one settle policy, one place to change either.
//
//   import { launchBrowser, openPage, closeQuiet } from './lib/browser.mjs';
//   const b = await launchBrowser();
//   const p = await openPage(b, url, { width: 1440 });

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Resolve a chromium driver, preferring playwright-core + the system Chrome channel (no bundled
 * browser download needed), then a bundled playwright, then an explicit PLAYWRIGHT_PATH.
 * @returns {{ chromium: object, channel: string|null, via: string }}
 */
export function resolveChromium() {
  const tries = [
    { name: 'playwright-core', channel: 'chrome' },
    { name: 'playwright', channel: null },
  ];
  if (process.env.PLAYWRIGHT_PATH) tries.push({ name: process.env.PLAYWRIGHT_PATH, channel: null });
  for (const t of tries) {
    try {
      const mod = require(t.name);
      if (mod && mod.chromium) return { chromium: mod.chromium, channel: t.channel, via: t.name };
    } catch { /* try the next one */ }
  }
  console.error('Playwright not found. Run `npm i` in tools/measure, or set PLAYWRIGHT_PATH.');
  process.exit(1);
}

/**
 * Launch the shared browser. `args` is merged with the defaults every tool wanted anyway.
 * @param {{ args?: string[], headless?: boolean }} [opts]
 */
export async function launchBrowser(opts = {}) {
  const { chromium, channel } = resolveChromium();
  const launch = {
    headless: opts.headless !== false,
    args: ['--autoplay-policy=no-user-gesture-required', ...(opts.args || [])],
  };
  if (channel) launch.channel = channel;
  try {
    return await chromium.launch(launch);
  } catch (e) {
    // A machine without the Chrome channel installed still has the bundled build — don't make the
    // caller care which one it got.
    if (channel) { delete launch.channel; return await chromium.launch(launch); }
    throw e;
  }
}

/**
 * Open a page at `url` and wait for it to settle, the SAME way for every tool.
 *
 * `settle` is deliberately one policy: networkidle (a real page finishes its fetches) with a fixed
 * grace period for fonts/web-animations to land, and a hard timeout so a slow source can't hang a
 * run. Tools used to pick their own — 800ms here, 2500ms there — so the same element measured
 * differently depending on which tool asked.
 *
 * @param {object} browser
 * @param {string} url
 * @param {{ width?: number, height?: number, wait?: number, timeout?: number, waitUntil?: string }} [opts]
 */
export async function openPage(browser, url, opts = {}) {
  const width = opts.width || 1440;
  const height = opts.height || 1000;
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: opts.waitUntil || 'networkidle', timeout: opts.timeout || 60000 }).catch(() => {});
  await page.waitForTimeout(opts.wait == null ? 1500 : opts.wait);
  return page;
}

/** Open the SOURCE and the BUILD together — the shape most of these tools actually want. */
export async function openPair(browser, sourceUrl, buildUrl, opts = {}) {
  const [source, build] = await Promise.all([
    openPage(browser, sourceUrl, opts),
    openPage(browser, buildUrl, opts),
  ]);
  return { source, build };
}

/** Close anything closeable without turning a teardown error into a failed run. */
export async function closeQuiet(...items) {
  for (const it of items) { try { if (it && it.close) await it.close(); } catch { /* teardown */ } }
}

/**
 * Evaluate in the page, surviving a late navigation.
 *
 * A source page that hydrates or redirects after `networkidle` can tear down the execution context
 * mid-evaluate ("Execution context was destroyed"). That is a property of real pages, not of the
 * caller, so every tool got it — retry once after letting the new document settle.
 *
 * @param {object} page
 * @param {Function} fn   serialisable page function
 * @param {*} [arg]
 */
export async function evaluateSafe(page, fn, arg) {
  try {
    return await page.evaluate(fn, arg);
  } catch (e) {
    if (!/Execution context was destroyed|Target closed|navigating/i.test(String(e && e.message))) throw e;
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200);
    return await page.evaluate(fn, arg);
  }
}
