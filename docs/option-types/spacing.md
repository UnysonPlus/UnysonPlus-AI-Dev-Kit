# spacing

Composite Margin + Padding widget (Elementor-style): a Phone/Tablet/Desktop switcher, then one row per section with a link toggle (linked = one "All" value; unlinked = Top/Right/Bottom/Left). Saved value is a nested array of **Bootstrap utility class names** — not raw CSS lengths.

## Stored value shape
```json
{
  "margin":  { "all": "m-3",  "top": "",    "right": "", "bottom": "", "left": "" },
  "padding": { "all": "",     "top": "pt-2","right": "", "bottom": "", "left": "" },
  "advanced": {
    "md": { "margin": { "all": "m-md-4", "top": "", "right": "", "bottom": "", "left": "" },
            "padding": { "all": "", "top": "", "right": "", "bottom": "", "left": "" } },
    "lg": { "margin": { "all": "m-lg-5", "top": "", "right": "", "bottom": "", "left": "" },
            "padding": { "all": "", "top": "", "right": "", "bottom": "", "left": "" } }
  }
}
```
Default: every slot `''` (all five slots, both sections, all three device layers).

## Fields
| key | type | notes |
|---|---|---|
| `margin` / `padding` | object | base (phone) layer. Keys `all`/`top`/`right`/`bottom`/`left`; each = a Bootstrap utility class (`m-3`, `pt-2`, `mb-0`) or `''` for default. `all` is used when the row is linked; the four sides when unlinked. |
| `advanced.md` / `advanced.lg` | object | per-device overrides (`md` ≥768px, `lg` ≥992px). Same `{margin,padding}` shape, but classes carry the responsive infix (`m-md-4`, `pt-lg-2`). |

## Notes / gotchas
- Values are **class names, not lengths**. The CSS that turns `m-3`/`pt-2` into real margin/padding is NOT shipped by this option type — theme/`css-tokens.php` (or Bootstrap) must define them.
- Mobile-first cascade: the base layer applies at all widths; `md`/`lg` override only larger screens. Leave `advanced` empty to inherit base everywhere.
- `mode` option (`both` default | `margin` | `padding`) scopes the widget; the inactive subtree is force-reset to empty defaults on save (a tampered POST can't sneak values into the hidden side).
- To render: flatten every non-empty leaf (base + `advanced.md` + `advanced.lg`) onto the element's `class` attr. The shortcodes extension's `sc_flatten_spacing_value()` does this.
- Choices come from the spacing scale (Bootstrap 5 `$spacers` by default); swap it site-wide via the `fw_option_type_spacing_scale` filter.
- Slots are sanitized to `[A-Za-z0-9_-]` on save. Legacy values saved before the per-device feature (empty `advanced`) still render — base utilities are width-agnostic.
