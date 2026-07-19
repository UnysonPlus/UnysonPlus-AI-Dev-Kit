# live-editor extension

Front-end inline editing of page-builder pages — hover sections/columns/elements to select them and edit their options in place. **Active by default:** yes. Version: 0.2.30.

## Provides

- **Shortcodes:** none — it layers a real-time visual editor over the existing Page Builder.
- **Entry point:** the **"Edit Live"** button in the admin bar (front end).
- **Settings/options:** none of its own — it reuses each element's existing option schema, rendered in place.
- **Public hooks/filters:** — (self-contained; drives the page-builder it augments).

## Notes / gotchas

- **Requires `page-builder`** (which pulls in `builder` + `shortcodes`) and framework ≥ 2.1.19 — it only makes sense on top of the builder it augments.
- Editing happens on the live front end (not the wp-admin builder canvas); changes save back to the same builder JSON.
- Still pre-1.0 (`0.2.x`). Standalone, displayed extension with a `thumbnail.svg` icon.
