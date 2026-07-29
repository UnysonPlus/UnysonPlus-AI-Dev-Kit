# viewport-units — Stable Viewport Units (Animation Engine)

Publishes **stable viewport-unit CSS custom properties site-wide** — `--vh` = `innerHeight / 100` (px)
and `--vw` = `innerWidth / 100` (px) — on `document.documentElement`, updated on `resize` +
`orientationchange` (never on scroll). A **page-level utility**, configured in **Theme Settings →
Animations → Viewport Units** (its own tab), NOT a per-element effect. Gives layouts a jump-free
viewport height on mobile (no `100vh` address-bar jump) and a `--vw` for fluid sizing that any custom
CSS (or other module) can consume. Requires the `animation-engine` extension **ACTIVE**.

## Enable

Theme Settings → Animations → **Viewport Units** → enable switch (default **off**). Front end only.

## Settings

| Setting | Key | Default | Notes |
|---|---|---|---|
| Publish stable `--vh` / `--vw` | `animation_viewport_units.enable` | `no` | master on/off (switch, `multi` shape like the other site-wide modules) |

## Usage in CSS

Once enabled, use the vars anywhere instead of `vh`/`vw`:

```css
.hero      { min-height: calc(var(--vh, 1vh) * 100); }  /* jump-free full-height on mobile */
.fluid-pad { padding-inline: calc(var(--vw, 1vw) * 4); }
```

The `var(--vh, 1vh)` fallback keeps CSS working even when the utility is off (or before the script
runs) — it simply falls back to the native unit.

## Notes

- Sets the vars immediately on load and re-computes on `resize` / `orientationchange`, rAF-debounced.
  It does **not** listen to scroll, so it's effectively free.
- Publishes to `document.documentElement` (`:root`), so the vars cascade to the whole page.
- Enqueues its tiny script site-wide only when enabled; no dependencies.
- Distinct from the Scrollytelling Stage, which republishes its own `--vh`/`--vw` locally while pinned —
  this makes the same primitive available page-wide.
