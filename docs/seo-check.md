<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->

# SEO Check

Audits any website the way a search engine sees it and returns one ranked plan. It only **reads**
public pages; fixes happen in WordPress through the SEO extension's tools.

| | |
|---|---|
| Engine | `assembled/UnysonPlus-Capture-Service/tools/design-capture/seo-check.mjs` |
| Tests | `seo-check.test.mjs` (the rules, no network): `node --test seo-check.test.mjs` |
| Dashboard | **SEO check** view (`#seo`), through `/api/seo-check…` → the capture service's `/seo-check…` |
| Agents | [`skills/seo-check/SKILL.md`](../skills/seo-check/SKILL.md), which runs the engine's CLI |
| History | `capture-out/_seo-checks/<host>/<timestamp>.json`, one file per run |
| Settings | `capture-out/seo-check-settings.json` (`psi_key`), or `PSI_API_KEY` / `GOOGLE_API_KEY` |

## What it checks

**Site:** robots.txt (missing, blocks Google or Bing, names the sitemap, what it does to AI search and AI
training crawlers), XML sitemap, `llms.txt`, http→https redirect, www vs. bare domain, soft 404 (a
made-up address answering 200), broken internal links (a sample of links not already checked as pages),
duplicate titles and descriptions across the checked pages.

**Each page**, fetched twice — the raw HTML (what a crawler gets before JavaScript) and the page rendered
in Chrome: status and redirect chain (a redirect to `?doing_wp_cron=` is reported as its own finding,
`wp_cron_redirect`: WordPress's alternate cron bouncing visitors while a task is due), `noindex` (meta and `X-Robots-Tag`), title and description
(missing, length), canonical (missing, several, pointing elsewhere; compared without the query string, so `?page=2` or a
stray `?doing_wp_cron` pointing at the bare address is not flagged), H1 and heading order, images without
`alt` (`alt=""` counts as decorative), `lang`, viewport, Open Graph title and image, JSON-LD (parses; the
home page has some), thin content (under 250 words, except contact/cart/account pages), text that exists
only after JavaScript (raw words under 30% of rendered), mixed content, hreflang without a self link,
server response over 1.5 s.

**Optional:** Lighthouse (mobile) through PageSpeed Insights for the first page — category scores, the
failed SEO audits and Chrome's real-visitor Core Web Vitals; skipped for local addresses. And an **AI
read** of up to six main pages (the kit's AI backend, `askText`): vague or padded content, missing proof of
experience and trust, whether an AI answer would quote it, titles and descriptions that do not match, plus
suggested titles and descriptions. The answer is cleaned (`cleanAi`): only pages it was shown, bounded
strings, known severities.

## Findings, ranking and score

Every rule has one id and one wording in `RULES` (title, why, fix, how to verify, and `fixWith`, the
Unyson+ tool that fixes it). `group()` merges a rule's pages into one finding and sorts by severity
(critical, high, medium, low, then info) and page count.

**Score** = 100 minus 15 / 7 / 3 / 1 per critical / high / medium / low finding, **once per finding** (not
per page), floored at 0. AI content findings are listed but **not scored**: they are judgement and vary
between runs, so a score that counted them would move on an unchanged site. `info` findings (AI training
crawlers blocked) cost nothing.

An address that does not answer is **not judged as missing**: an unreachable robots.txt or llms.txt is
skipped with a note, and a page that never answers says "No answer within 30 seconds" (tried twice).

`diff(prev, cur)` compares the run with the site's previous one by `id | page`: `changes.fixed` and
`changes.new`. AI findings are left out of the comparison for the same reason they are left out of the
score: they are reworded on every run. Timing findings (`slow_response`, `wp_cron_redirect`) can come and
go between runs on an unchanged site; read them as "seen on this check".

## Interfaces

```
node seo-check.mjs <url> [--full] [--limit N] [--no-ai] [--no-lighthouse] [--md file] [--json file]
```

Service routes (one check at a time; each drives a real browser):

| Route | Does |
|---|---|
| `POST /seo-check` `{ url, mode: quick\|full, limit, ai, lighthouse }` | starts a check → `{ id }` (409 with the running id if one is going) |
| `GET /seo-check/job/<id>` | `{ state, step, elapsed, report? , error? }` |
| `GET /seo-check/sites` | sites checked before, newest first, plus `running` |
| `GET /seo-check/history?host=` | that site's runs |
| `GET /seo-check/report?host=&file=&format=json\|md` | a saved report |
| `GET/POST /seo-check/settings` | `{ psi_key_set, psi_key_from }`; POST `{ psi_key }` (never returned) |

Exports: JSON (the report as saved), Markdown (`toMarkdown`), a print-ready page for Save as PDF, and
**Copy fix request** — the plan as a request for the AI Assistant in WordPress or any agent. There is no
import: a report is a reading, not a set-up to move between sites.

## Limits

- Full mode reads pages from the sitemap (a site in a sub-folder: that folder's own sitemap), up to 100;
  without a sitemap it checks only the address given and says so.
- Lighthouse without a key shares one anonymous daily quota and is often refused; the report says so.
- It checks pages, not rankings, backlinks or search volumes (the SEO extension's Backlinks and Topic
  momentum screens cover those inside WordPress).
- Pages behind a login, and anything a page shows only after a click, are not seen.
