# `map` — Map

An embedded interactive map (OpenStreetMap/Leaflet or Google Maps) with manually placed or event-driven pins. Leaf node: `{ type:'simple', shortcode:'map', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `data_provider` | multi-picker | `{population_method:…}` | `{ population_method, <method>:{…} }` | How pins are populated (Custom pins vs. Events); reveals method-specific fields. |
| `map_engine` | multi-picker | `{engine:'osm'}` | `{ engine, osm:{…} }` \| `{ engine, google:{…} }` | Map provider + its settings (see Notes). |
| `map_height` | unit-input | `{value:'',unit:'px'}` | units `px vh % rem em` | Map height (width always fills the container). |
| `disable_scrolling` | switch | `false` | `true` \| `false` | Prevent scroll-zoom until the map is clicked. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |

## Ready-to-use example (the atts object)
```json
{
  "data_provider": { "population_method": "custom" },
  "map_engine": {
    "engine": "osm",
    "osm": {
      "osm_style": { "provider": "osm" }
    }
  },
  "map_height": { "value": "400", "unit": "px" },
  "disable_scrolling": true,
  "bg_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `map_engine` is a nested multi-picker. `engine: 'osm'` reveals `osm.osm_style` — itself a multi-picker `{ provider, … }` where `provider` is one of `osm` `carto` `opentopomap` `cyclosm` `hot` `esri` `stadia` `thunderforest` `maptiler`. Keyless providers (`osm`, `opentopomap`, `cyclosm`, `hot`, `esri`) reveal nothing extra; `carto` reveals `carto_variant`; `stadia`/`thunderforest`/`maptiler` reveal a `*_variant` select plus a site-wide API-key field. `engine: 'google'` reveals `{ gmap-key, map_type }` (`map_type`: `roadmap` `terrain` `satellite` `hybrid`).
- API keys are stored **site-wide** (a WP option), so they are entered once and shared across all Map instances.
- `data_provider.population_method` values come from the shortcode's registered choices (e.g. `custom` for manual pins, `events` to auto-plot event locations); the chosen method reveals its own fields.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
