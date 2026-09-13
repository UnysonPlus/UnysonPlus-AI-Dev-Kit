<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# option-reachability — can a conversion actually REACH this theme option?

Adding a theme option does not close a converter gap. The option also has to be **emitted**, and by
**both** twins:

| twin | file | authority |
|---|---|---|
| JS | `UnysonPlus-Capture-Service/tools/design-capture/to-theme-settings.mjs` | the standalone capture bundle |
| PHP | `site-converter/includes/class-fw-site-converter-stitch.php` | **authoritative on a WP bundle import** |

`FW_Site_Converter_Bundle::import_dir()` re-runs `build_from_html()` and **overwrites** the
JS-produced `theme-settings.json`, so pages and design come from one engine. That single fact decides
how serious each drift direction is.

## Run

```
node check.mjs           # summary + the flagged ids
node check.mjs --all     # also list every NEITHER id
node check.mjs --json    # machine-readable
```

Exit **1** only on JS-only drift. See "Why it does not fail on PHP-only" below.

## What it reports

| state | meaning | severity |
|---|---|---|
| **BOTH** | both twins emit it | reachable — fine |
| **JS-only** | only the JS twin emits it | **bug** — silently discarded on every bundle import. Exit 1. |
| **PHP-only** | only the PHP twin emits it | ledger — WP imports are correct (PHP wins); only the standalone JS bundle emits less |
| **NEITHER** | no twin emits it | informational — most theme options are deliberately manual |
| **AMBIGUOUS** | id too generic to attribute by text scan (`mode`, `enabled`, `options`) | not judged, but counted |

### Why it does not fail on PHP-only

27 PHP-only options exist today and none of them breaks a WordPress conversion — PHP is the engine
that runs on import. Failing on them would make the check red by default, and a permanently red gate
is one everybody learns to ignore. Only JS-only drift is a real defect, because that is the direction
where a rule is written and then thrown away.

### Why NEITHER is not a failure either

Most theme options are user preferences no source page can imply. Gating on NEITHER would demand a
converter rule for every one of them. It becomes interesting in exactly one situation: **someone has
just recorded a converter gap as "closed."** That is what this tool caught first — gap **G3** (top
offset for a detached header) was recorded `CLOSED in unysonplus-theme 2.5.90`; the theme options
exist and neither twin has ever emitted one.

## Two traps this tool fell into (both now fixed — do not reintroduce)

1. **Quoted-only matching.** PHP writes `$values['footer_col_gap']`; JS writes `values.footer_col_gap`
   **unquoted**. A quoted-only matcher reported **94** one-sided options, nearly all of them JS rules
   it could not see. Match both forms.
2. **`.mjs` files that generate PHP.** `pen-shortcode.mjs` emits PHP source as a string, so scanning
   it attributes PHP array keys to the JS twin — that is how `group_main` reported as "JS-only", a bug
   that does not exist. Files containing PHP markers are excluded by content, not by name.

Both produced confident, wrong output. If you extend the matcher, **spot-check a flagged id against
the real source before believing the number.**

## After fixing a drift

Add a case to **both** parity fixtures, not just the twin you touched:

- `header-chrome-parity.test.mjs` (capture service) — `node header-chrome-parity.test.mjs`
- `site-converter/tests/chrome-parity-test.php` — `php D:/xampp/wp-cli.phar --path=D:/xampp/htdocs/testsite --allow-root eval-file "<path>"`
