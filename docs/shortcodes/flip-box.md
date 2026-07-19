# `flip_box` — Flip Box

A two-sided 3D card that flips on hover or click. Front: icon + title + text (or a background image); back: title + text + button. Multiple flip effects and designs. Leaf node: `{ type:'simple', shortcode:'flip_box', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts — Content
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `front_icon` | icon-v2 | none | icon-v2 object | Optional front-face icon. |
| `front_title` | text | `'Hover Me'` | string | Front headline. |
| `front_title_tag` | select | `'h3'` | `h1`–`h6` `span` `p` | Semantic tag for the front title. |
| `front_text` | wp-editor | `''` | HTML string (WYSIWYG) | Optional front body (rich text + links). |
| `front_button_label` | text | `''` | string | Optional front button that flips the card (handy on touch). Empty = none. |
| `back_icon` | icon-v2 | none | icon-v2 object | Optional back-face icon. |
| `back_title` | text | `'More Info'` | string | Back headline. |
| `back_title_tag` | select | `'h3'` | `h1`–`h6` `span` `p` | Semantic tag for the back title. |
| `back_text` | wp-editor | `'Add the detail…'` | HTML string (WYSIWYG) | Detail revealed on flip. |
| `button_label` | text | `''` | string | Back button label. Empty = hidden. |
| `button_url` | text | `''` | URL | Back button href. |
| `button_target` | switch | `'_self'` | `'_blank'` \| `'_self'` | Open the back button link in a new tab. |

## atts — Design
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `design_settings` | multi-picker (popover) | `{skin:'solid'}` | `{skin:'solid'\|'elevated'\|'minimal'\|'outline'\|'gradient'\|'glass'\|'dark'\|'neumorph'}` | The look of the two faces. Legacy scalar `design` is read as a fallback. |
| `flip_direction` | popover image-picker | `'left'` | `left` `right` `up` `down` `diagonal` (3D flips) `fade` `zoom` `slide-up` `slide-down` `slide-left` `slide-right` (2D reveals) | How the back is revealed. |
| `trigger` | select | `'hover'` | `hover` `click` `both` | What flips the card. Click is best for touch. |
| `parallax` | switch | `'no'` | `'yes'` \| `'no'` | Floats content forward in 3D (layered depth). |
| `flip_speed` | slider | `600` | int 150–1500 (step 50) | Flip / reveal duration (ms). |
| `flip_easing` | select | `'smooth'` | `smooth` `ease` `ease-in-out` `spring` `linear` | Flip easing. |
| `height` | slider | `300` | int 160–560 (step 10) | Card height (px). |
| `rounded` | popover image-picker | `'rounded'` | `rounded-0` `rounded-sm` `rounded` `rounded-lg` `rounded-xl` | Corner radius. |

## atts — Styling
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `box_style` | box-style picker | see Notes | box-preset picker object | Card border/shadow/fill preset. |
| `front_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Front background (`kind: bg`). |
| `front_image` | upload | `''` | attachment | Optional front background image (any design; dark overlay). |
| `front_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Front text color. |
| `back_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Back background (`kind: bg`). |
| `back_image` | upload | `''` | attachment | Optional back background image (any design; dark overlay). |
| `back_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Back text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |
| `button_style` | button-style picker | first preset | preset slug | Back button style (Theme Settings → General → Buttons). |
| `button_size` | button-style picker | first preset | size slug | Back button size. |

## Ready-to-use example (the atts object)
```json
{
  "front_icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/shield" },
  "front_title": "Secure by Default",
  "front_title_tag": "h3",
  "front_text": "",
  "front_button_label": "",
  "back_icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "back_title": "How it works",
  "back_title_tag": "h3",
  "back_text": "<p>End-to-end encryption on every request, with zero configuration.</p>",
  "button_label": "Learn more",
  "button_url": "#",
  "button_target": "_self",
  "design_settings": { "skin": "solid" },
  "flip_direction": "left",
  "trigger": "hover",
  "parallax": "no",
  "flip_speed": 600,
  "flip_easing": "smooth",
  "height": 300,
  "rounded": "rounded",
  "front_bg": { "predefined": "", "custom": "" },
  "front_image": "",
  "front_color": { "predefined": "", "custom": "" },
  "back_bg": { "predefined": "", "custom": "" },
  "back_image": "",
  "back_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "button_style": "",
  "button_size": ""
}
```

## Notes
- `front_icon` / `back_icon` use the **icon-v2** shape. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`; none: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`.
- `trigger: click` is the right choice for touch (hover can't flip on touch); it adds keyboard support and the back button still works.
- A background image (`front_image` / `back_image`) shows on ANY design with a dark legibility overlay.
- `button_style` / `button_size` reuse the same Theme Settings → Buttons presets as the `button` shortcode. Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
