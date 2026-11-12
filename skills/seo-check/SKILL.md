---
name: seo-check
description: Check a website's SEO from the outside — the HTML a crawler gets, the rendered page, robots.txt, the sitemap, redirects, structured data, Lighthouse and an AI read of the content — and hand back one ranked plan; on a Unyson+ site, fix what the SEO tools can fix after the person agrees. Use when asked to audit, check, review or improve a website's SEO, find why a site does not rank, prepare an SEO report for a client, or check a site before launch.
---

<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->

# SEO check

One engine, two ways in: the dashboard's **SEO Check** view and this skill both run
`assembled/UnysonPlus-Capture-Service/tools/design-capture/seo-check.mjs`. **Never re-implement a check
yourself** (no hand-rolled Playwright or curl audits): if the engine misses something, that is a bug to
fix in the engine, so the dashboard learns it too. Reference: [docs/seo-check.md](../../docs/seo-check.md).

## 1. Run the check

From the design-capture folder:

```
node seo-check.mjs <url>                      # quick: this page + the site-wide checks
node seo-check.mjs <url> --full --limit 25    # the pages in the sitemap
    [--no-ai] [--no-lighthouse] [--md report.md] [--json report.json]
```

- **Quick** for one page or a first look; **full** for an audit. A full check of 25 pages takes a few
  minutes; more than 50 is rarely worth it (the sitemap order is the site's, not importance).
- The AI content review uses the kit's AI (the same backend as the dashboard). In an agent session you
  may skip it (`--no-ai`) and read the pages yourself, but then **say so** and keep your judgement
  apart from the engine's findings.
- Lighthouse needs a public address and, in practice, a PageSpeed Insights key (`PSI_API_KEY`, or saved
  in the dashboard). Without one it often fails on the shared quota: report that, do not guess scores.
- Every run is saved under `capture-out/_seo-checks/<host>/`, and the report's `changes` lists what was
  fixed and what is new since the last run.

Read the JSON (`--json`), not only the Markdown: each finding has `id`, `severity`, `pages[]`, `why`,
`fix`, `verify` and `fixWith` (the Unyson+ tool that fixes it, or empty).

## 2. Read the inside too, when the site runs Unyson+

The report's `site.unysonplus` says whether it does. If you are connected to that site's WordPress
(MCP tools available), call **`seo_audit`** as well. The two views answer different questions:

| | `seo-check.mjs` (outside) | `seo_audit` (inside) |
|---|---|---|
| Sees | what is actually served: robots.txt, redirects, headers, rendered HTML, other plugins' output | the stored SEO values per post, auto vs. written, near-duplicates |
| Misses | drafts, pages not in the sitemap | anything another plugin or the theme adds at render time |

Where they disagree (a title set in WordPress that the page does not serve), report the disagreement:
it means something else is overriding the SEO extension. Anything the outside check finds that
`seo_audit` should have caught is a gap in the extension — note it for the SEO roadmap.

## 3. Hand back one plan

Most important first, as the engine ranked it. For each item: what is wrong, on which pages, why it
matters, the fix, and how to check it worked. Put the AI's content findings in their own part and call
them judgement. Say plainly what was **not** checked (Lighthouse skipped, AI off, pages beyond the limit).

## 4. Fix (Unyson+ sites only, and only after the person agrees)

Ask once, listing what you will change. Then use the site's own tools — each change is saved as a
revision the person can undo (`undo_change`):

| Finding ids | Tool |
|---|---|
| `title_*`, `description_*`, `duplicate_titles`, `duplicate_descriptions`, `noindex`, `canonical_elsewhere`, `og_missing` | `seo_get_page` → `seo_update_page` (fields: `title`, `description`, `canonical`, `noindex`, `og_title`, `og_image`…) |
| `broken_internal_links`, `status_error`, `redirect_chain` | `seo_save_redirect` (point the dead address at the nearest live page) |
| `images_no_alt` | `list_media` (`missing_alt: true`) → `view_media` → `update_media` |
| `robots_*`, `sitemap_*`, `schema_none`, `ai_crawlers_blocked` | `seo_get_settings` → `seo_update_settings` |

Rules:

- **Never invent facts** to fix a content finding. Proof of experience, names, prices, credentials and
  answers to the FAQ come from the person; ask for them. You may rewrite titles and descriptions from the
  page's own content (the report's `ai.suggestions` are a starting point, not final).
- Keep the brand at the end of a title only if the site's titles already carry it.
- Findings with no tool (`js_only_content`, `mixed_content`, `viewport_missing`, server redirects, speed)
  are theme, hosting or server work: explain them, do not attempt them through the SEO tools.
- Never touch a live site the person did not name, and never change robots.txt to block crawling.

## 5. Prove it

Run the check again (same mode and limit) and report the `changes` block: what is fixed, what is new,
and the score before and after. A fix is done when the re-run no longer lists it, not when the tool
call returned OK. Search engines take days to weeks to re-crawl; say that, and do not promise rankings.
