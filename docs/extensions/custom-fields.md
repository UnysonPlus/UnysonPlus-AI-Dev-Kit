# custom-fields extension

An ACF-style custom-fields builder — create Field Groups, target post types, add fields that render as native meta boxes and save to post meta. **Active by default:** yes. Version: 0.1.13.

## Provides

- **Shortcodes:** none.
- **Field types:** text, textarea, WYSIWYG, image, gallery, select, checkbox, color, date and more.
- **Settings/options:** its own admin UI to define **Field Groups** (which post types they show on) and their fields; values save to post meta.
- **Public hooks/filters:** `fw_get_field( $name, $post_id = null, $default = null )` — read a field's value on the front end (the primary integrator API).

## Notes / gotchas

- Values are stored as ordinary **post meta**, so `fw_get_field()` (or a direct `get_post_meta`) reads them; fields render as standard WordPress meta boxes on the edit screen.
- Still pre-1.0 (`0.1.x`) — treat the field-type set and value shapes as evolving.
- Standalone, displayed extension.
