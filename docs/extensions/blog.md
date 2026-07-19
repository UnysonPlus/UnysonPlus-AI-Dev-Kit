# blog extension

Adds Blog Posts functionality (post listing / blog page plumbing) to the framework. **Active by default:** yes (bundled with core; `display => false` so it is hidden from the Extensions UI). Version: 1.0.3.

## Provides

- **Shortcodes:** none.
- **Settings/options:** none of its own admin page — it wires blog behavior into the theme/framework.
- **Public hooks/filters:** — (no notable integrator-facing API).

## Notes / gotchas

- **Hidden extension** (`display => false`): it does not appear as a togglable card under Extensions; it loads as core blog support.
- One of the small always-on core extensions — nothing user-facing to configure.
- Repo: `UnysonPlus-Blog-Extension` (its own extension repo, but bundled `blog`/`update` ride inside the core `UnysonPlus` release).
