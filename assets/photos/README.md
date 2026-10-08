# /assets/photos

Every photo used on duker.me lives here. Images are self-hosted; nothing is hotlinked.

## Expected files

| File | Ratio | Suggested size | Used in | Status |
|---|---|---|---|---|
| `portrait.webp` | 4:5 | 360×450 | Hero (1x) | ✅ present (studio photo, blue-grey backdrop) |
| `portrait@2x.webp` | 4:5 | 720×900 | Hero (2x srcset) | ✅ present |
| `portrait.jpg` | 4:5 | 720×900 | Hero fallback for non-WebP browsers | ✅ present |
| `portrait-sm.webp` / `.jpg` | 1:1 | 192×192 | "Work with me" band in `#help` | ✅ present (cropped from `../emmanuel.png`) |
| `work-01.webp` | 16:10 | 1600×1000 | Featured card — SPD Mechanism Clustering | ⬜ optional (card shows a typographic cover; slot markup removed) |
| `work-04.webp` / `.jpg` | 16:10 | 1080×675 | Featured card — AxiosPay | ✅ present (hero of the live app, mobile screenshot) |
| `work-05.webp` / `.jpg` | 16:10 | 1080×675 | Featured card — Teger AI | ✅ present (hero of tegerai.tech, mobile screenshot) |
| `work-06.webp` / `.jpg` | 16:10 | 976×610 | Featured card — Cropie | ✅ present (hero of cropie.vercel.app, mobile screenshot) |

Each slot also accepts a same-named `.jpg` as the fallback for old browsers (optional; modern browsers only fetch the `.webp`).

Each `work-NN` file belongs to one product (see the comments above the two `.work` grids in `index.html`).
To put a screenshot on a different project, move its `<picture>` block to that card.

## Adding a photo

Only reference files that exist: a `<picture>` pointing at a missing file costs a 404 on every visit.
To add a screenshot to a card, add the files here, then add a `<picture>` block inside that card's `.media`
(copy one from the AxiosPay card) and write `alt` text describing what is actually in the image.
`assets/js/site.js` fades each image in once it loads, and removes the `<picture>` if a file is missing.

Strip metadata before committing: `convert in.jpg -strip …` for JPEG; for WebP re-save without EXIF
(e.g. Pillow `im.save(out, 'WEBP', quality=78, icc_profile=im.info.get('icc_profile'))`).

The social card (`../og/og-default.jpg`) and app icons are generated from `portrait.jpg` and `/favicon.svg`
by `npm run images` (see `scripts/make-images.mjs`). Re-run it after replacing the portrait.

## Exporting

Budget: keep all new photos under ~800 KB in total (about 120 KB each at the sizes above).

```sh
# 3:2 field/talk photo
convert source.jpg -resize 1500x1000^ -gravity center -extent 1500x1000 -quality 78 -define webp:method=6 field-01.webp
convert source.jpg -resize 1500x1000^ -gravity center -extent 1500x1000 -quality 78 -strip field-01.jpg

# 16:10 screenshot
convert shot.png -resize 1600x1000^ -gravity north -extent 1600x1000 -quality 80 -define webp:method=6 work-01.webp
```

`cwebp -q 78 in.jpg -o out.webp` works too.
