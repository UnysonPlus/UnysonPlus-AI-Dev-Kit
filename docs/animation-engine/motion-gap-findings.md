<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Reporting a motion gap

When the Animation Engine cannot express a motion you are reproducing, the gap gets **reported**, every
time. Frequency in the ledger is what decides which effects are promoted into the engine, so a gap
nobody filed is a fallback somebody writes again on the next site.

```bash
node send-finding.mjs --url=<source-url> --motion-gap --gap='{
  "fixture":  "fb_01",
  "surface":  "element",
  "motion":   "ribbon unfurls on scroll: clip-path 0->100% + 6deg skew, 700ms, ease-out",
  "tried":    "scroll-reveal (no clip-path), motion-path (wrong axis), scroll-keyframes (no clip)",
  "outcome":  "fallback-written",
  "fallback": "upw-fb-01",
  "region":   "hero",
  "path":     "capture-out/fixture-04",
  "recurs":   "3rd site"
}'
```

**Add `--dry-run` while you are testing.** The configured form is the maintainer's live ledger — a
dry run validates the tuple and prints the payload without sending. (That flag exists because the gates
below were first exercised against the live form and put two test rows in it.)

## Why it is not a converter finding

A converter finding says *the source had X and we produced Y*. A motion gap says *the engine has no
such effect*. The difference is not cosmetic — it is why the finding contract cannot hold one:

| The finding contract wants | A motion gap has |
| --- | --- |
| `twin` (php / js / both) + `twin_shows` | **no twin** — there is no builder to re-run an animation through |
| a `loss` kind (dropped, overridden, …) | **no loss** — nothing was lost; the capability is absent |
| a `data-sc-cs`-stamped DOM fixture | **a motion** — trigger, properties, timing — plus the fallback written |

Bending motion into that tuple would have meant relaxing the stamped-fixture and `twin_shows` gates,
and those gates exist precisely because fixture-less rows were the ones that sat open. So a motion gap
is its own `kind` with its own gates, and the converter contract is untouched.

## The tuple

Six required fields. Each is refused when missing.

| Field | What it carries |
| --- | --- |
| `fixture` | the **neutral id** — `fb_01`, `fixture-04`. Never a site name or domain; a value that looks like one is refused outright |
| `surface` | `element` · `gallery` · `page` · `cursor` · `background` |
| `motion` | what the source does: trigger, properties, timing (`clip-path 0->100% + 6deg skew, 700ms, ease-out`) |
| `tried` | **the native effects you consulted and why none fits.** This is what makes step 1 of the loop auditable — without it a report cannot be told apart from not having looked |
| `outcome` | `fallback-written` · `partial` · `no-fallback` |
| `fallback` | the key of the effect you wrote (`upw-fb-01`), or — with `no-fallback` — why none was |

Optional: `region`, `path` (the capture-out folder), `recurs` (how often you have met this motion — it
feeds the frequency count directly), `note`.

The note is auto-redacted of URLs, emails and quoted copy, and the host is only ever sent as a hash.
That is a backstop, not permission: **the no-brand rule still applies to every field you write.**

## What the gates will stop

- a missing field, an unknown `surface` or `outcome`;
- a `fixture` that looks like a domain (`acme-studio.com`, anything with `https:`);
- an `outcome` other than `no-fallback` that does not name the fallback written.

A `gallery` surface sends with a note pointing at the registration path: since Animation Engine 1.4.26
gallery designs **are** pluggable, through three PHP filters plus `registerDesign` — see
[`child-theme-fallback-effect.md`](child-theme-fallback-effect.md). Report the gap as usual; the
difference is that the fallback is now a registered design rather than a bespoke one.

## Where this sits in the loop

1. **Reach for a native effect first** — the catalogue is [`README.md`](README.md).
2. **Else write a scoped, labelled fallback** — [`child-theme-fallback-effect.md`](child-theme-fallback-effect.md).
3. **Always report** — this file.

The engine-side half of the loop (how reported frequency promotes an effect, and the reusable /
reduced-motion / performant bar it must clear) is on the docs site under the Animation Engine roadmap,
"Growing the engine from demand".
