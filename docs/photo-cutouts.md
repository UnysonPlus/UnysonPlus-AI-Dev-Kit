# Photo cut-outs: give a photo's subject its own layer

Most small businesses have **photos, not footage**: a dish, a drink, a bouquet, a product, a pet after its groom. A scene
that moves those photos as rectangles reads as a **slideshow**, however good the motion is. Cutting the subject out of
its photo makes it a layer of its own, so the scene can put a new background behind it, words behind it, drop it in
with a shadow, or lift it off the photo it came from. That separation is what makes motion design look designed.

The kit does it on this computer (nothing is uploaded): `studio-cli cutout`, the MCP tool `image_cutout`, and the
Studio's **Split into layers** on a picture.

## When to use it (the decision)

**Use a cut-out when:**

- The scene is built from **photos only** (no footage), and at least one shot has **one clear subject**: a dish on a
  plate, a cup, a cake, a bottle, a product, a bouquet, a person, a pet. This is most outreach and client reels: run
  it on every photo you plan to use and pick from the `good` ones.
- The shot is the **hero** of a beat: the dish the voice is naming, the product being sold, the "after" of a groom.
- You want **words behind the subject**, the subject **on brand colour**, or a subject that **arrives** (drops, pops,
  slides) instead of a photo that fades in.
- A **website** needs a product or dish on a plain or brand-coloured background (a hero, a menu card, a product grid):
  use `--shadow` for a ready image with a soft shadow.

**Do not use a cut-out when:**

- The photo is a **place or a mood**: a room, a street, a shop front, a crowd, a landscape, a busy bar. The tool
  answers `poor` ("No single subject" or "fills most of the photo"). Use these photos whole, as backgrounds, with a
  slow `drift`, or split into depth (below).
- The subject is **cut off by the photo's edge** where the scene would show it floating (a plate half out of frame):
  the report's `edges` says which side. Keep that side against the stage edge, or choose another photo.
- The edges are mostly **see-through**: steam, smoke, glass, sheer fabric, fine fur against a busy background
  (`sure` under 0.6, and the check image shows a halo). Use them small, or not at all.
- **Faces in close-up** for a client who did not ask for it: cutting a real person out and placing them elsewhere can
  feel off. Prefer their products and food; cut out people only when the person is the point (a barber at work).
- The scene's look is the **photo itself** (a photographer's portfolio): do not take their framing apart.

A good reel mixes both: two or three cut-out heroes, the rest as framed photos and backgrounds. Not every shot needs
it, and a reel of only cut-outs on flat colour can look like clip art.

## Run it

```bash
studio-cli cutout photos/dish.jpg photos/cake.jpg photos/latte.jpg --out "<project>/media"
studio-cli cutout photos/table.jpg --region 0.45,0.5,1,1 --name pasta --out "<project>/media"   # one of several things
studio-cli cutout photos/dish.jpg --shadow        # also dish-shadow.png (thumbnails, website images)
studio-cli cutout photos/dish.jpg --fill          # also dish-plate.jpg: the photo with the dish painted out
```

MCP: `image_cutout { files: [...], out?, region?, shadow?, fill?, name? }`. Put the files straight into the project's
`media/` folder when they are for a scene.

**What each file is:**

| File | What it is |
|---|---|
| `<name>-cutout.png` | The subject, see-through around it, trimmed to its own box. The layer you use. |
| `<name>-check.png` | The cut-out on dark, on white and on a checkerboard. **Look at it before using the cut-out.** |
| `<name>-shadow.png` | (`--shadow`) The cut-out with a soft drop shadow baked in, on a canvas padded so the shadow is never clipped. For thumbnails and website images. In a scene, use the layer's own shadow instead (below). |
| `<name>-plate.jpg` | (`--fill`) The photo with the subject painted out. Soft where the subject was (the painting works at 512 px): use it dimmed, blurred or mostly covered by the cut-out, never as a sharp shot of its own. |

**What the report says (per photo):**

| Field | Meaning | What to do |
|---|---|---|
| `verdict` | `good`, `check` or `poor` | `good`: use it. `check`: read the notes and look at the check image. `poor`: use the photo whole. |
| `box` | Where the subject sat in the photo, as fractions (`x`, `y`, `w`, `h`) | Line the cut-out up with its photo (below). |
| `cover` | How much of the photo the subject fills | Under 1%: too small, use a closer photo or a region. |
| `density` | How much of its own box the subject fills | Under 0.2 means scattered pieces, not a subject (the verdict is `poor`). |
| `things` | Separate things cut out together | 2 or more: two dishes, or a dish and a hand. Give a `region` round the one you want. |
| `edges` | Photo edges that cut the subject off | Keep those sides against the stage edge, never floating. |
| `sure` | The share of the edge that is fully in (not half see-through) | Under 0.6: look closely at the check image. |

**Look at every check image** and write one line about each (clean edge, halo, missing piece, extra piece). The
numbers catch most problems, not all: a dish can come out with half its plate, or a hand that belongs to the photo.

## Use it in a scene

Add the cut-out as an `image` layer (`fit: "contain"`), with its `box` sized to its own shape (`ratio` = its width /
height). Then one of these recipes. Times are a guide; keep one idea per beat.

1. **Subject on brand colour.** A shape layer (the client's colour, or a gradient) below, the cut-out above it with
   `lift` (`scale: 1`, `shadow: true`) so it sits on a soft shadow, and `float` (gentle, 1-2 cycles) while it holds.
   The cleanest way to make a phone photo look like an ad.
2. **Words behind the subject.** Background, then a big text layer (the dish's name, "BRUNCH"), then the cut-out on
   top: the subject overlaps the letters. Bring the word in first (`text-rise` or `gravity-drop`), the subject a
   beat later (`stack-in` or `pop`).
3. **It arrives.** The subject drops in (`stack-in` with a bigger `lift`) or slides in fast (`slide` with
   `motionBlur`) onto a colour or a blurred plate, lands on its shadow, holds with `float`. Good for "new on the menu".
4. **Lift off the photo.** The full photo as a layer, the cut-out exactly over it (lined up, below), so at first
   nothing seems to change. Then the cut-out `lift`s (`scale` 1.1-1.2, shadow) while the photo behind dims or blurs
   (`grade`, `rack-focus`). With `--fill`, use the plate as the photo, so no second copy shows behind the lifted one.
5. **Sticker.** A cut-out with `sticker` (a white outline and a soft shadow) on a bright background: playful,
   paper-cut look; suits cafes, bakeries, pet groomers. Stack two or three at small angles for a menu.
6. **Depth parallax.** The photo (or plate) with `depth: -0.6`, the cut-out with `depth: 0.4`, and a slow
   `camera-push` or pan: the subject moves against its own background, a 2.5D shot from one photo.

Keep the shadow soft and below the subject (light from above), the same direction for every cut-out in a scene.
Don't spin or bounce food hard: it should look appetising, not thrown.

### Lining a cut-out up with its photo

The photo layer: `box: { x: X, y: Y, w: Wp, ratio: W / H, anchor: "top-left" }`, `fit: "contain"` (the report's
`photo` is `[W, H]`). With the stage's width / height `A` (16:9 = 1.778, 9:16 = 0.5625), the photo's height in % of
the stage is `Hp = Wp × A ÷ (W / H)`, and the cut-out goes at

```
box: { x: X + box.x × Wp,  y: Y + box.y × Hp,  w: box.w × Wp,  ratio: size[0] / size[1],  anchor: "top-left" }
```

A photo cropped by `fit: "cover"` does not line up this way: give the photo its own ratio instead.

## Websites

For a product grid, a menu or a hero: `--shadow` gives a finished image (PNG with transparency and a soft shadow) to
put on any background colour; `-cutout.png` alone when the page's own CSS draws the shadow
(`filter: drop-shadow(...)` follows the outline). Use the same light direction across a page.

## The Studio

**Split into layers** on a picture (Inspector) gives the same two layers in place: the background (the plate) and the
subject. It uses these models once they are downloaded (run any `studio-cli cutout --fill` once), else a small,
rougher model; with a fal.ai key it uses fal.ai instead (paid by the person).

## Setup, speed and limits

- **First use downloads** the cut-out model (BiRefNet lite, MIT licence, 224 MB) and ONNX Runtime for Node (shared
  with voice and music separation); `--fill` adds the painting model (LaMa, Apache-2.0, 208 MB). Into the kit's
  `assembled/models/cutout/`.
- **Speed:** a few seconds a photo on a graphics card; 5-15 s on the processor. A batch loads the model once.
- **Memory:** about 3 GB free. On a small graphics card it moves to the processor by itself; if the computer is short
  of memory it stops with a message (close heavy programs, or restart if memory stays full).
  `UPW_CUTOUT_EP=cpu` forces the processor.
- **One subject per call.** For several things in one photo, one call per thing, each with its own `region`.
- The subject is what the model sees as **the main thing in the photo** (or in the region). It cannot be told "the
  cup, not the saucer"; crop with a region instead.
- The plate is soft where the subject was. Fine behind the cut-out, not on its own.
