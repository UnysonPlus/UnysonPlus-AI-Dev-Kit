# Drop shortcode folders HERE

This is the exact directory a child theme's bundled shortcodes live in:

```
<child-theme>/framework-customizations/extensions/shortcodes/shortcodes/
```

Note `shortcodes` appears **twice** — the extension folder, then its elements folder. This is
the real path the loader scans; a level up or a level missing is not scanned.

- **One folder per element**, dropped directly in here.
- **Folder name = the shortcode tag**, with `-` → `_`
  (`product-configurator/` → the tag `[product_configurator]`).
- A same-named **core** tag wins — don't name a folder after a bundled element
  (`button`, `badge`, `icon-box`, …).
- Build each element from the kit's **`sample-shortcode/`** template; guard plugin-only helpers
  (`sc_color_field_compact`, …) with `function_exists()`.

No registration call is needed — the folder is discovered automatically whenever the theme is
active. Delete this marker file in a real theme (it does nothing).

Full guide: the child theme's `README.md` → *Where EXACTLY a shipped shortcode goes*.
