# scroll-var — Scroll Variable (Animation Engine)

Publishes an element's **in-view scroll progress (0→1) to a CSS custom property you name**, so you can
drive ANY custom CSS with it — the general "attribute-driven progress" primitive. **Per-element**:
attaches from every element's **Animations** tab via `sc_animation_fields` (key **`scroll_var`**).
Emits data-attributes on the element wrapper; a tiny runtime writes the variable as the element crosses
the viewport. Requires the `animation-engine` extension **ACTIVE**.

## Field (Animations tab → `scroll_var`, a `group`, category "Scroll")

| Param | Default | Notes |
|---|---|---|
| `enable` | `no` | master on/off (switch) |
| `var_name` | `--progress` | the CSS custom property to write; sanitized to an ident-safe name, a leading `--` is forced |
| `axis` | `y` | `y` (vertical) or `x` (horizontal) travel |
| `range` | `cover` | when 0 and 1 hit: `cover` (enters bottom → exits top), `enter` (until fully in view), `center` (element center crosses viewport center) |

## Value shape

```json
"scroll_var": { "enable": "yes", "var_name": "--progress", "axis": "y", "range": "cover" }
```

## What it emits / how it runs

- When enabled, the element wrapper carries `data-upw-svar="1"` plus `data-upw-svar-name`,
  `data-upw-svar-axis`, `data-upw-svar-range` (and forces a wrapper to exist via `sc_needs_wrapper`
  when `scroll_var` is the only animation setting).
- Runtime (`upw-scroll-var.js`) enqueues **only on pages that render at least one** such element
  (flagged in `wp_footer`). For each, an `IntersectionObserver` activates it, then an rAF-throttled
  scroll handler computes progress `0..1` from `getBoundingClientRect()` per the chosen range/axis and
  does `el.style.setProperty(varName, progress.toFixed(4))`. Clamped to `0..1`. No GSAP dependency.
- Because it reads `getBoundingClientRect()`, it follows the smooth-scroll (Lenis) position
  automatically when that module is active.

## Usage in CSS

```css
/* an element with scroll_var enabled, var_name --progress */
.reveal { opacity: var(--progress); transform: translateY(calc((1 - var(--progress)) * 40px)); }
```

## Notes

- Purely a data primitive — it sets a variable; what the variable drives is your CSS. Pair it with the
  element's Custom CSS / a class to bind opacity, transform, color, `clip-path`, etc.
- Distinct from Scroll Motion (ready-made scrubbed effects) and the scroll-progress **indicator**
  (a visible page-progress bar/ring): `scroll-var` just exposes the raw number for bespoke CSS.
