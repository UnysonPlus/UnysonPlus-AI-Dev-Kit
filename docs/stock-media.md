# Free stock media: where an agent may get footage, photos, music and sounds

Checked against each source's own licence page on 2026-10-28 (the list of pages read is at the end). Licences change:
when in doubt, open the source's licence page again before using something in a paid client's video.

## The rules

1. **Free and commercial only.** A client's reel is commercial use. Use only content whose licence allows commercial use;
   never "non-commercial" (NC), "editorial only", "personal use", and never "no derivatives" (ND: a video is a derivative).
2. **Prefer no-credit sources** (below). When a source needs credit, put the exact credit in the video description or
   the end card, and tell the person.
3. **Record every file you use** in the project's notes (`notes "<project>" --add "…" --section Decided`):
   what it is, the source, the page URL, the licence, and the credit if one is needed. Keep the file in `media/`.
4. **Never use what the licence forbids in every case:** recognisable people in a bad or misleading light, implied
   endorsement, trademarks or logos shown in the content (Pixabay forbids commercial use of such content), political
   use (Pixabay), selling or redistributing the raw files (to the client too: they get the finished video), using it as
   a trademark or logo, or AI training.
5. **Paid libraries are off limits** unless the person says they have an account: Motion Array, Artgrid, Filmsupply,
   Epidemic Sound, Envato Elements, AEJuice, Soundsnap, RenderHub.

## Safe defaults for client work (commercial, no credit needed)

| Need | First choice | Also |
|---|---|---|
| Video | **Pexels** (API) | **Pixabay** (API), Coverr (site downloads), Mixkit (free-licence clips only) |
| Photos | **Pexels**, **Pixabay** (APIs) | StockSnap (CC0), Burst, Unsplash (see the API caveat), Kaboompics (Standard licence only) |
| Music | **Pixabay Music** (keep the licence file from the download: some tracks are in YouTube Content ID) | Mixkit Music (online only: not TV, radio, games, CDs/DVDs); Incompetech with credit (CC BY) |
| Sound effects | **Freesound filtered to CC0** (API, already in the kit) | Pixabay sound effects, Mixkit sound effects, Sonniss GDC bundles |
| 3D, HDRIs, textures | **Poly Haven** (CC0, API) | Kenney (CC0) |
| Animations, fonts, icons | LottieFiles free animations (Lottie Simple License), **Google Fonts** (OFL), Lucide (ISC), Tabler (MIT) | Iconify (licence per icon set) |
| Colour looks | the Studio's own grades (`grade`) | no free LUT pack with a confirmed licence was found; make your own |

## Searching from the kit (`stock`, MCP `stock_search`)

The kit searches four of the sources above and downloads into a project, recording the licence for you:

| Source | Gives | Key |
|---|---|---|
| Pexels | video, photos | the person's free key (pexels.com/api) |
| Pixabay | video, photos | the person's free key (pixabay.com/api/docs) |
| NASA | video, photos | none |
| Openverse | photos, sounds; only results whose licence allows commercial use and changes (no NC, no ND) | none (slow: up to a minute) |

```
studio-cli stock                                   # which sources are on, which keys are saved
studio-cli stock ocean waves                       # video (default); --photo, --audio; --orient portrait|landscape
studio-cli stock ocean waves --get 2 --project my-reel   # downloads result 2 into my-reel/media/ and notes it
studio-cli stock --key-pexels <key> --key-pixabay <key>  # saves the person's keys (or PEXELS_API_KEY / PIXABAY_API_KEY)
```

MCP: `stock_search { q, kind?: video|photo|audio, orient?, get?, project? }`; with `get` and `project` it downloads.

- **Every result carries its licence and the credit it needs.** A download goes into the project's `media/` and a
  line into its notes (section Decided): the file, the title and creator, the page, the licence and
  `CREDIT REQUIRED: …` when one is needed. When a credit is required, put it in the video description or end card and
  tell the person.
- **Sources switched off are never searched.** The person picks the sources in the Studio (Insert › Free stock); the
  choice is saved in the kit and applies to `studio-cli`, MCP and the Studio alike. Don't work around it by fetching
  that source yourself.
- Pexels and Pixabay results are cached for 24 hours (Pixabay asks for it); NASA downloads take the "large" file, not
  the original (originals run to hundreds of MB).
- Ask the person for the Pexels and Pixabay keys if they want those sources; never sign up for them yourself.

## Sources with an API (an agent can search and download)

| Source | Media | Licence | Credit | API key | API terms that matter |
|---|---|---|---|---|---|
| Pexels | photo, video | Pexels licence; commercial yes | no | free | 200 requests/hour, 20,000/month; an app showing results must link to Pexels and should credit the photographer |
| Pixabay | photo, video, illustration (music and sound effects are on the site, not in the API) | Pixabay Content License; commercial yes | no | free | 100 requests/60 s; cache results 24 h; download images rather than hotlink them; show where results come from |
| Freesound | sound effects | per sound: CC0, CC BY, CC BY-NC (avoid), Sampling+ (avoid) | CC0 no; BY yes: title, creator, Freesound link, licence | free | 60/min, 2,000/day; previews need only the key, originals need OAuth2 |
| Poly Haven | HDRIs, textures, 3D models | CC0 | no | none | a live integration shows "Powered by Poly Haven" |
| NASA Image and Video Library | photo, video, audio | generally not copyrighted (third-party items are marked) | acknowledge NASA | none | no implied endorsement, no NASA logos, no astronauts or staff in ads |
| Unsplash | photo | Unsplash licence; commercial yes | site: no | free | through the API you must credit Unsplash and the photographer, hotlink the image URLs and report downloads: awkward for video, so download from the site instead |
| Coverr | video, music | Coverr licence; commercial yes | site: no | free (demo) | API videos require Coverr credit; production use needs a paid tier |
| Openverse | images, audio (CC from many sites) | per item | per item | none (rate-limited) or free OAuth | check every result's licence; skip NC and ND |
| Wikimedia Commons | all | per file | usually yes | none | per-file licence and author |

## Download-only sources (the person or the agent downloads by hand)

| Source | Licence | Commercial | Credit | Watch out |
|---|---|---|---|---|
| Mixkit (video, music, sound effects) | Mixkit licences | yes | no | stock video has Free and Restricted licences: use Free; music not for broadcast, games or CD/DVD |
| StockSnap | CC0 | yes | no | no implied endorsement |
| Burst (Shopify) | Burst licence | yes | no | no selling the photos |
| Kaboompics | Standard or Editorial per photo | Standard only | no | no AI training |
| Dareful (4K video) | CC BY 4.0 | yes | **yes**: "Video courtesy of Dareful" | |
| Incompetech (music) | CC BY 4.0 (or a paid licence) | yes | **yes**: the credit text the site gives | |
| Free Music Archive | per track | CC0, BY, BY-SA only | yes, unless CC0 | skip NC and ND |
| Zapsplat (free tier) | Zapsplat Standard License | yes, broadcast too | **yes**: "ZapSplat" | no automated downloading (no scripts) |
| Sonniss GDC bundles | royalty-free | yes | no | no reselling as sound effects |
| SoundBible | per sound | public domain or CC BY only | BY: yes | some are personal use only |
| Kenney | CC0 | yes | no | |
| LottieFiles (free) | Lottie Simple License | yes | no | edits keep the same licence |
| Google Fonts | OFL (some Apache) | yes | no | a modified font may need a new name |

## Not safe, or no longer what the lists say

- **Videvo**, **Mazwai**: now redirect to a paid store. **Life of Vids**: not reachable.
- **Videezy**: its terms say personal, non-commercial use only.
- **BBC Sound Effects (RemArc)**: personal, educational and research use only.
- **Uppbeat (free plan)**: client work, paid ads and commercial projects need its Business plan.
- **Bensound (free plan)**: credit valid for one video, commercial scope unclear.
- **YouTube Audio Library**: use outside YouTube is not stated.
- **ccMixter**, **Chosic**, **Internet Archive**: licence per item, often non-commercial: check every item.

## Licence pages read (2026-10-28)

pexels.com/license, pexels.com/api/documentation, pixabay.com/service/license-summary, pixabay.com/service/terms,
pixabay.com/api/docs, unsplash.com/license, unsplash.com/api-terms, coverr.co/license, coverr.co/developers,
mixkit.co/free-stock-music, videezy.com/terms, nasa.gov/nasa-brand-center/images-and-media,
commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia, help.archive.org/help/rights,
shopify.com/stock-photos/licenses/shopify-some-rights-reserved, stocksnap.io/license,
kaboompics.com/page/license-and-faq, dareful.com, freemusicarchive.org/License_Guide,
incompetech.com/music/royalty-free/licenses, support.google.com/youtube/answer/3376882, chosic.com/free-music/all,
ccmixter.org, freesound.org/help/faq, freesound.org/docs/api/overview.html,
zapsplat.com/license-type/standard-license, sonniss.com/gameaudiogdc, soundbible.com/about.php, polyhaven.com/license,
github.com/Poly-Haven/Public-API, kenney.nl/support, lottiefiles.com/page/license, openfontlicense.org,
lucide.dev/license, github.com/tabler/tabler-icons (LICENSE), iconify.design/docs/api.
Not readable at the time (rows rely on secondary sources): openverse.org/about, uppbeat.io/pricing,
bensound.com/licensing, Mixkit's per-type licence texts, the BBC licence text.
