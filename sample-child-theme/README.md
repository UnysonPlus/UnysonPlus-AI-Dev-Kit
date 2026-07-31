# `sample-child-theme` — the child-theme template

A complete, installable child theme of **`unysonplus-theme`**. Copy this folder, rename it,
fill in the `style.css` header. It works as-is: install it, activate it, and the site runs on
the parent with your (empty) overrides layered last.

A child theme is the right home for **one site's / one brand's** bespoke look and bespoke
elements — CSS that must survive parent-theme updates, and elements that only make sense for
that site (a booking widget, a review card, an interactive configurator). **Reusable-everywhere
code goes in the plugin instead** (see [`docs/extending.md`](../docs/extending.md)).

---

## The two files (that is the whole contract)

```
sample-child-theme/
├── style.css        REQUIRED   the theme header (Template: unysonplus-theme) + your CSS,
│                               which loads LAST in the cascade so plain selectors win
└── functions.php    REQUIRED   a guarded child-style enqueue fallback + reference blocks
                                for fonts, shipped shortcodes, and template overrides
```

The `Template:` line is the identity — it must read **`unysonplus-theme`** (the parent's folder
name). `Text Domain` and the folder name should match your slug.

## When a child theme, when the plugin

| | **Child theme** | **Plugin (shortcodes extension)** |
|---|---|---|
| Bespoke to one site/brand | ✅ | ✗ |
| Reusable across many sites | ✗ | ✅ |
| Must survive parent updates | ✅ (that's the point) | n/a |
| Ships/travels with | the site | every install |

A **generic** element that many sites want is a plugin shortcode. A one-off is a child-theme
shortcode. A downloadable/standalone element that isn't tied to a theme can also live in the
uploads dir (`uploads/unysonplus/shortcodes/`) — the loader scans all three.

## Theme Settings are SHARED with the parent — the switch is safe

Unyson stores settings keyed by the **parent template** (`fw_theme_settings_options:unysonplus`),
not the active stylesheet. So switching a site from `unysonplus-theme` to a child theme of it
**keeps every setting** — colours, typography, buttons, header/footer, Custom CSS. You do **not**
re-configure Theme Settings after activating a child theme. (This is why "prefer Theme Settings
over CSS" still holds inside a child theme.)

## Shipping bespoke elements with the theme

Drop the element folder under the child's `framework-customizations` tree — **no registration
call**, the loaders scan it when the theme is active:

- **Shortcode:** `<child>/framework-customizations/extensions/shortcodes/shortcodes/<name>/`
  (folder name → tag, `-`→`_`). Build it from the kit's [`sample-shortcode/`](../sample-shortcode/).
- **Option type:** `<child>/framework-customizations/includes/option-types/<name>/`.

Everything else is identical to a plugin element — same file contract, same
`sc_build_wrapper_attr()`, same option types, assets auto-enqueued from the theme URI. Guard
plugin-only helpers with `function_exists()`. Full detail: `docs/extending.md` →
*Shipping a shortcode inside a theme or child theme*.

## Where the folder lives (staging)

- **A demos-network child theme** (coastal, volta, felix-mercer, pinky-bites, …) lives directly
  in the demos install: `htdocs/demos/wp-content/themes/<slug>/`, network-enabled and activated on
  its subsite. Keep a tracked source copy under `unysonplus-website/wordpress/demos/demo-themes/<slug>/`.
- **A child theme you are actively building for a standalone site** stages in
  `test-sites/<slug>/` (the installable source + a `<slug>.zip`) and runs in the `testsite`
  install (`htdocs/testsite/wp-content/themes/<slug>/`). Update BOTH copies on every change.

## Creating one — the procedure

1. **Copy** this folder, rename it to your slug.
2. **Fill in `style.css`** header: `Theme Name`, `Template: unysonplus-theme`, `Version`,
   `Author`, `Text Domain`. Confirm it appears under Appearance → Themes with the parent named.
3. **Enqueue brand fonts** (functions.php reference block) if the design needs them, then point
   Theme Settings → Typography at them.
4. **Ship bespoke elements** under `framework-customizations/` as above (optional).
5. **Activate** (network-enable first on multisite), and **verify** below.

## Verify before calling it done

- The theme lists under Appearance → Themes with **Parent: Unyson+ Theme**, and activates with
  no error.
- After activation the site **still renders** — hero, header, footer, colours — because Theme
  Settings carried over. (If anything reset, the settings key assumption is wrong for that
  install — stop and check.)
- Any shipped shortcode is **discovered** (appears in the builder) and **renders** on the front
  end with no PHP notices / JS errors, including **two instances** on one page.
- Bump the child theme's `style.css` `Version:` on every change (that is its version marker).

---

**References:** `docs/extending.md` (child-theme + shortcode shipping), the reference child
themes `coastal` / `volta` in the demos network, and the plugin's shortcodes loader
(`extensions/shortcodes/includes/class-fw-shortcodes-loader.php`) which scans core → uploads →
parent theme → child theme.
