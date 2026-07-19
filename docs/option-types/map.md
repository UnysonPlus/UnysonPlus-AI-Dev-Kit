# map

A geographic location picker — search an address or drop a pin, storing the resolved address parts plus lat/lng coordinates. Uses Google Maps when an API key is set, otherwise a free Leaflet/OpenStreetMap fallback.

## Stored value shape
```json
{
  "location": "Sydney NSW, Australia",
  "venue": "",
  "address": "",
  "city": "",
  "state": "",
  "country": "",
  "zip": "",
  "coordinates": { "lat": -34, "lng": 150 }
}
```

## Fields
| key | type | notes |
|---|---|---|
| `location` | string | the free-text/searched location label (e.g. what the user typed/selected). |
| `venue` | string | optional venue name. |
| `address` | string | street address. |
| `city` | string | city. |
| `state` | string | state / region. |
| `country` | string | country. |
| `zip` | string | postal / zip code. |
| `coordinates` | object | the pin position `{ "lat": <float>, "lng": <float> }`. |

## Notes / gotchas
- **Default value** is only `{ "coordinates": { "lat": -34, "lng": 150 } }` (near Sydney) — the address-part strings default to empty on save via `_get_value_from_input`.
- `coordinates` is an **object `{ lat, lng }`**, not a `[lat, lng]` array. On input it may arrive as a JSON string and is decoded; at render time it is re-encoded to JSON for the JS map.
- All seven text fields (`location`, `venue`, `address`, `city`, `state`, `country`, `zip`) are always present in the saved value (empty string when unset) — only `coordinates` carries the actual pin.
- No `zoom` is stored — the value is address parts + coordinates only.
- The picker degrades gracefully: with no Google Maps API key configured it falls back to Leaflet + Nominatim search, but the stored value shape is identical either way.
