# `section` — page band

One per band of the page. Node: `{ type:'section', _items:[…columns], atts:{…} }`. Carries the
shared `common` + `fx` blocks (see `README.md`); its atts below. Section spacing/background are
**options** here — don't reach for CSS for them.

## atts (section-specific)

| key | type | default | notes |
|---|---|---|---|
| `variant` | string | `''` | reserved |
| `is_fullwidth` | bool | `false` | `true` = edge-to-edge; container caps content otherwise |
| `container_width` | multi-picker | `{preset:'inherit'}` | `{preset:'inherit'|'wide'|'narrow'}` or `{preset:'custom',custom:{custom_width:{value,unit}}}` |
| `bg_color` | compact color | `{predefined:'',custom:''}` | quick solid background (prefer `background` for full control) |
| `background` | background-pro | see below | color / gradient / image / **video** layers — see `../option-types/background-pro.md` |
| `padding_top` / `padding_bottom` | spacing-scale | `''` | e.g. `'pt-section'`, `'pb-sectionlarge'`, or responsive `{base,md,lg}` |
| `min_height` | multi-picker | `{preset:'auto',custom:{custom_height:{value:'',unit:'px'}}}` | section min height |
| `content_valign` | select | `'top'` | `top`/`center`/`bottom` |
| `column_halign` | select | `'default'` | horizontal align of columns |
| `gap` / `gap_x` / `gap_y` | string | `''` | column gap overrides |
| `background_color` / `background_image` / `video` / `bleed_illustration` | legacy | `''` / bgImage / `''` | keep present (empty) for validation |
| `bleed_layout` | object | `{bleed_enabled:'no',yes:{}}` | edge-bleed illustration |

`background_image` empty shape: `{type:'custom',custom:'',predefined:'',data:{icon:'',css:[]}}`.

## Ready-to-use example (dark section with a background VIDEO)

```json
{ "type":"section", "_items":[ /* columns */ ], "atts":{
  "variant":"", "is_fullwidth":false, "container_width":{"preset":"inherit"},
  "bg_color":{"predefined":"","custom":""}, "background_color":"",
  "background_image":{"type":"custom","custom":"","predefined":"","data":{"icon":"","css":[]}},
  "video":"", "bleed_illustration":"", "bleed_layout":{"bleed_enabled":"no","yes":{}},
  "padding_top":"", "padding_bottom":"", "gap":"", "gap_x":"", "gap_y":"",
  "min_height":{"preset":"auto","custom":{"custom_height":{"value":"","unit":"px"}}},
  "content_valign":"top", "column_halign":"default",
  "background":{
    "color":{"value":{"predefined":"","custom":"#000000"}},
    "gradient":{"data":{"type":"linear","angle":90,"stops":[]}},
    "image":{"src":[],"position":"center center","size":{"selected":"cover","custom":""},"repeat":"no-repeat","attachment":"scroll"},
    "video":{"enabled":"yes","external_url":"","source_mp4":{"attachment_id":"","url":"<mp4-url>"},"source_webm":[],"poster":{"attachment_id":"","url":"<poster-url>"},"fallback":[],"loop":"yes","autoplay":"yes","mute":"yes","playsinline":"yes","allow_interaction":"no"},
    "advanced":[]
  },
  "animation":{"enable":"no","yes":{"effect":"","speed_preset":"","advanced_tweaks_heading":"","delay":0,"custom_duration":0,"repeat_count":1,"loop_forever":"no","replay_on_scroll":"no","easing":""}},
  "unique_id":"<32-hex>","css_id":"","css_class":"my-hero","custom_css":"","element_position":"","element_overflow":"","responsive_hide":[],"dc_logged":"","dc_roles":[],"dc_start":"","dc_end":"","custom_attrs":[]
}}
```

## Notes / gotchas
- **Background video needs a POSTER.** With `video.enabled:'yes'` you MUST also set `poster` (an
  image) — the formstone bg-video JS builds the `<video>` from `source:{mp4,poster}` and **won't
  inject it if `poster` is missing** (the band renders black). The video also renders via JS on
  load; the section just carries the class + `data-background-options`.
- A section over a bg video is **transparent by default** — don't fill `bg_color`/`background.color`
  with black if you want the video visible (or you'll cover it).
- Section **padding uses the spacing scale**, not px. For exact px matches, that's a case for
  Custom CSS (Misc → Custom CSS), scoped by `css_class`.
- `custom_css` with the `selector` keyword targets the section's `.u{hash}` wrapper (e.g. the
  bg-video overlay tint: `selector .fs-background-container::after{…}`).
