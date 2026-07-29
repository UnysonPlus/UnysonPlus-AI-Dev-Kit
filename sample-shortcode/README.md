# `sample-shortcode` — the shortcode template

A complete, installable skeleton of a UnysonPlus page-builder element. Copy this folder,
rename it, fill it in.

Every file carries inline documentation of the rule it exists to enforce, and a **reference
block** at the bottom holding commented-out, ready-to-paste code for the things this skeleton
does not do (repeaters, media uploads, dimensions, icons, conditional options, design
variants, autoplay, swipe, structured data).

The skeleton **works as-is**: install it unmodified and a "Sample Shortcode" element appears
in the builder, saves, and renders. Start from something that runs, then change it.

---

## The file map

```
sample-shortcode/                                       ← folder name = the tag, dashes → underscores
│                                                          (`sample-shortcode` → `sample_shortcode`)
├── config.php                       REQUIRED   builder tile: title, tab, modal size, canvas preview
├── options.php                      REQUIRED   the edit-modal fields — THIS IS THE ATTS CONTRACT
├── static.php                       optional   front-end enqueues + PHP render helpers
├── AGENTS.md                        optional   the per-element doc (fill in the template)
│
├── views/
│   ├── view.php                     REQUIRED   the front-end markup
│   └── designs/                     optional   ONLY if the element ships multiple layouts
│       ├── registry.php                        declares the built-in designs
│       └── default.php                         one render partial per design
│
├── static/
│   ├── css/styles.css               optional   front-end styles
│   ├── js/scripts.js                optional   front-end behaviour
│   └── img/page_builder.svg         REQUIRED   the builder icon (auto-detected at this exact path)
│
├── class-fw-shortcode-sample-shortcode.php.example
│                                    optional   SECTION-LIKE elements only. Note the `.example`
│                                               suffix — see the warning below.
└── includes/
    └── page-builder-sample-shortcode-item/
        └── class-page-builder-sample-shortcode-item.php
                                     optional   SECTION-LIKE elements only (inert until wired)
```

> **Why `.example` on the class file.** The loader looks for
> `class-fw-shortcode-{folder-name}.php`. If that file exists but does not define the matching
> class, it emits a PHP warning on **every page load**. The suffix keeps it out of the loader
> until you have actually filled it in. Drop `.example` only then.

---

## Leaf or section-like? Decide this first

|  | **Leaf** (almost always) | **Section-like** (rare) |
|---|---|---|
| What it is | Renders content: heading, button, card, gallery, slider, counter | Lives at page root and **holds rows and columns**, like the built-in `[section]` |
| Files | `config.php` · `options.php` · `views/view.php` (+ `static.php`, `static/`) | All of that **plus** the class file and the page-builder item class |
| Registration | None — the loader auto-discovers the folder | Two hooks in the class file |
| `$content` in the view | Empty | The rendered inner tree — you **must** echo it |

If you are porting a self-contained visual component, it is a leaf. Delete
`class-fw-shortcode-*.php.example` and the whole `includes/` folder and never think about them
again.

---

## Using the template

1. **Copy** this folder into the shortcodes extension's `shortcodes/` directory.
2. **Rename** it to your element's slug, in `kebab-case`. The folder name *is* the identity:
   `hero-banner` becomes the shortcode tag `hero_banner`.
3. **Find and replace** three strings throughout:

   | Replace | With | Appears in |
   |---|---|---|
   | `sample-shortcode` | your kebab-case folder name | CSS classes, asset paths, enqueue handles |
   | `sample_shortcode` | your snake_case tag | the section-like files only |
   | `sc_sample_` | a prefix unique to your element | the helper functions in `static.php` |

   That last one matters: helper names are **global**. Two elements that both define
   `sc_sample_link_html()` will not collide loudly — the `! function_exists()` guard means the
   second one silently gets the first one's behaviour, which is a genuinely unpleasant bug.

4. **Edit** `config.php` (title, tab, description, canvas preview) and `options.php` (your
   fields), then write `views/view.php`.
5. **Replace** `static/img/page_builder.svg` with a glyph that says what your element does.
   The house style is documented inside that file.
6. **Delete** what you did not use — including this README, `HOW-TO.md`, and the reference
   blocks at the bottom of each file. A shipped element should not carry the scaffolding.
7. **Fill in** `AGENTS.md`. Its options table is the contract an AI generator reads to emit
   valid page-builder JSON for your element; a stale one means generated JSON gets rejected.

---

## Verify before calling it done

Hard-refresh the admin page first — the builder's JS and CSS are aggressively cached.

1. The tile appears in the picker, in the right tab, with your icon and title.
2. Dragging it onto the canvas produces a card showing your `title_template` — including the
   **empty state**, before anything is configured. Then type a title containing `<b>x</b>` and
   confirm the card shows the tags literally: if it renders bold, you used `{{= }}` where
   `{{- }}` was needed, and user input is being injected into wp-admin. Keep the browser
   console open — a template exception is swallowed and the card silently falls back to the
   plain title.
3. The edit modal opens, every tab renders, and no option shows a blank `error:`.
4. Values **save and reload**: set something, save the page, reopen the modal.
5. The front end renders, with no PHP notices and no JS console errors.
6. **Two instances on one page** both work independently — this is where `document.querySelector`
   and hardcoded ids get caught.
7. The Animations and Advanced tabs actually do something: set a CSS Class and an entrance
   animation and confirm both land on the wrapper.
8. Only then: bump the extension's version.

---

## When this template is not enough

It is a curated skeleton, not a reference corpus. For depth — how an option type behaves
internally, how an existing element solved a specific problem, what helpers exist — read the
real source.

**The kit already fetches it.** `assemble.ps1` populates the (gitignored) `unysonplus/` and
`unysonplus-theme/` folders:

```bash
pwsh assemble.ps1 -Source github     # latest full plugin release + parent theme
```

Then browse `unysonplus/framework/extensions/shortcodes/shortcodes/` — every shipped element,
each with its own `AGENTS.md`. That directory's own `AGENTS.md` is the section-like recipe this
template's class file is condensed from.

**Or clone directly:**

| Repo | What is in it | Read it for |
|---|---|---|
| `https://github.com/UnysonPlus/UnysonPlus-Shortcodes-Extension.git` | The whole shortcodes extension | Every element's real `options.php` / `view.php`; the shared helpers in `includes/` (styling, animation, icons, backgrounds, pluggable designs) |
| `https://github.com/UnysonPlus/UnysonPlus.git` | The plugin **core** | Option-type and container-type internals under `framework/includes/`; the `FW_Option_Type` base class |
| `https://github.com/UnysonPlus/UnysonPlus-Theme.git` | The parent theme | How Theme Settings define the presets elements consume — colours, typography, buttons, box presets, spacing |

> **Trap worth knowing:** cloning `UnysonPlus.git` gets you **core only** — blog and update.
> It has **no page builder and no shortcodes**. It activates cleanly, which is what makes the
> mistake hard to spot. For a working install use the **release zip** (or `assemble.ps1`,
> which fetches it); for shortcode *source*, use the Shortcodes-Extension repo above.

**Also in this kit:**

- `docs/option-types/` — one file per option type: the stored value shape *and* how to declare
  it. Start at `declaring-options.md`.
- `docs/shortcodes/` — one file per shipped element: its atts, as JSON. Useful both for
  generating pages and for seeing how a comparable element structured its options.
- `docs/conventions.md` — the rules this template enforces, stated once and generally.
- `HOW-TO.md` (beside this file) — the procedure for porting an existing standalone component
  (a CodePen, a demo page, a bought template) into an element.
