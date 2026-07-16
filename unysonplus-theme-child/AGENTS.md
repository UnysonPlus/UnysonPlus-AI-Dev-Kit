# Child-theme starter — for AI agents

This is the **starter you copy per site**. Do NOT build a site by editing this folder
in place. Instead:

1. Copy the whole folder → rename to `<site-slug>` under the target install's
   `wp-content/themes/`.
2. Edit `style.css` header: `Theme Name`, `Text Domain`.
3. Generate/replace `design/design.json` from a configured reference (see
   `design/README.md`) so chrome imports on activation.
4. Activate. Then follow the kit `PLAYBOOK.md` (outside-in) and measure.

## Files
- `style.css` — child header only (no design CSS).
- `functions.php` — parent inheritance + chrome enqueue + **one-time design.json import**
  (`after_switch_theme`) + `inc/` loader. Keep it small.
- `inc/post-types.php` — per-site CPTs + legacy-shortcode compatibility.
- `assets/chrome.css` — **last-resort** CSS only. If a look has a Theme-Settings option,
  use the option (`../docs/header-footer-reference.md`), not this file.
- `design/design.json` — polished-chrome baseline (design-only, media-stripped).
- `up-templates/` — bundled page-builder templates that auto-import on activation.

## Rules
- **Options before CSS.** `assets/chrome.css` should stay nearly empty.
- **Measure** with `../tools/measure/measure.mjs` after each phase.
- Anything you had to CSS that should be an option → log as an enhancement candidate.
