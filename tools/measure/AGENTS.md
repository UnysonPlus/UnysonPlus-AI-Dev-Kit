# measure.mjs — the parity harness (for AI agents)

Run after EVERY change. It loads the mockup + dev at the same width, extracts a fixed
metric set from each DOM, and prints a pass/fail diff table.

```
node measure.mjs "file:///<abs-path-to>/mockup/index.html" "http://localhost/<site>/" --width 1440
```

- Tune the `METRICS` selector map so each metric resolves on BOTH the mockup and the
  unysonplus-theme DOM (multiple selectors tried in order).
- Tolerances are in `../../design-parity-checklist.md`. Don't advance a phase while its
  metrics FAIL.
- For the logo: measure the **visible glyph**, not the PNG box (transparent padding
  makes a logo read small even at the "right" px).
