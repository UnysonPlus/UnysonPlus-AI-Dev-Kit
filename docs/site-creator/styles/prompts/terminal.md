<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Terminal CLI

A design-system brief for an AI agent building or restyling an Unyson+ site in the Terminal preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The mapping table in
[`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/terminal.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Terminal CLI

#### Philosophy

Strip away the "user interface" layer and show the system underneath. Brutally functional,
high-contrast, authentically retro — configuring a server rather than browsing a site.

The register is **a clean, usable shell**, not falling green glyphs. The cliché is the failure mode:
this should look like a well-configured ZSH session, which is far more convincing than a hacker-movie
screen.

**It is not:** soft, rounded, shadowed, proportional, or decorative.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Ground | `#0a0a0a` | Deep black, **not** pure `#000` — the scanlines need something to sit on |
| Phosphor | `#33ff00` | Primary. **14.6:1** |
| Amber | `#ffb000` | Secondary, warnings. **10.8:1** |
| Dim | `#1f521f` | Borders and inactive marks. **2.18:1** |
| Error | `#ff3333` | **5.4:1** |

**The trap, measured.** The dimmed green is listed in the source spec as *"borders / inactive text"*.
As a **border** it is right. As **text** it is **2.18:1** and fails AA outright — an "inactive" menu
item or a disabled label set in it is unreadable. Dim the *meaning*, not the contrast: use the
phosphor at a lower-weight or bracketed form for inactive states, and keep `#1f521f` for rules, pane
edges and separators only.

#### Typography

**Monospace for every single character** — headline to footer link. JetBrains Mono (or Fira Code).
This is the one absolute: a single proportional font anywhere breaks the illusion completely.

**ALL CAPS** for headers; lowercase acceptable for body and "code". Sizes snap to a strict modular
scale — headings should not scale smoothly, they should land on fixed steps, because a terminal has a
character grid rather than fluid type.

#### Shape

`0` radius, absolutely. Borders `1px` solid or dashed. Borders are how "windows" and "panes" are
defined, so they do real work rather than decorating.

#### Effects

- **No drop shadows, ever.**
- **Phosphor glow** on primary text: `text-shadow: 0 0 5px rgba(51,255,0,0.5)`. Subtle — it mimics
  persistence, it is not a neon sign.
- **CRT scanlines**: a fixed `pointer-events: none` overlay of fine horizontal lines at very low
  opacity. Enough to feel; never enough to hurt reading.

#### Components

- **Buttons** — text in brackets, `[ INITIATE ]`, or a solid block with inverted text. Hover fills with
  phosphor and the label goes black (inverted video).
- **Panes** — a black box with a 1px phosphor border and a title bar: either a solid inverted strip or
  an ASCII rule, `+--- SYSTEM STATUS ---+`.
- **Inputs** — no box. A prompt (`user@host:~$`) followed by the field, with a blinking block cursor.
  Focus is the cursor, not a ring.
- **Stats** — not charts. **ASCII progress bars**: `[||||||||||.....]`.

#### Layout

A grid of terminal windows, like tmux or vim splits. Content aligns to a rigid character grid.
Dividers are ASCII: `----------------`, `================`, `//`.

#### Motion

- **Blink** — the cursor, at the standard ~1s cadence. This is the heartbeat of the interface.
- **Typewriter** — the headline appears character by character.
- **Glitch** — occasional small text offsets on hover, used sparingly.

Under `prefers-reduced-motion`, **stop the blink and the typing and show the final text**. A cursor
blinking forever is exactly the kind of persistent motion that rule exists for.

### The defects this style produces

1. **Dim green used as text** — the 2.18:1 failure above. It looks correctly "inactive" and cannot be read.
2. **A proportional font sneaking in** via a heading or a button — one is enough to break it.
3. **Scanlines too strong**, which turns a texture into a readability problem.
4. **Monospace overflow** — mono glyphs are wide, so long strings blow out a narrow screen far more
   readily than proportional text. Wrap, or mark continuation with a trailing `\`.
5. **An element inside an inverted block inheriting that block's colour** — the recurring failure
   across every preset here.

### Non-negotiables

1. Monospace everywhere, with no exception.
2. `0` radius, 1px borders defining panes.
3. Deep black ground, never pure `#000`.
4. A blinking cursor somewhere on the page.
5. Scanline overlay present but faint.
6. Phosphor glow on primary text.
7. Stats as ASCII bars, not charts.
8. ASCII dividers between sections.
9. Dim green for rules only, never for text.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php terminal
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
