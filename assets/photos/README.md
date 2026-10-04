# /assets/photos

Every photo used on duker.me lives here. Images are self-hosted; nothing is hotlinked.

## Expected files

| File | Ratio | Suggested size | Used in | Status |
|---|---|---|---|---|
| `portrait.webp` | 4:5 | 360×450 | Hero (1x) | ✅ present (studio photo, blue-grey backdrop) |
| `portrait@2x.webp` | 4:5 | 720×900 | Hero (2x srcset) | ✅ present |
| `portrait.jpg` | 4:5 | 720×900 | Hero fallback for non-WebP browsers | ✅ present |
| `portrait-sm.webp` / `.jpg` | 1:1 | 192×192 | "Work with me" band in `#help` | ✅ present (cropped from `../emmanuel.png`) |
| `field-01.webp` | 3:2 | 1500×1000 | Field band between `#about` and `#experience` (left) | ⬜ needed |
| `field-02.webp` | 3:2 | 1500×1000 | Field band between `#about` and `#experience` (right) | ⬜ needed |
| `work-01.webp` | 16:10 | 1600×1000 | Featured card — SPD Mechanism Clustering | ⬜ needed |
| `work-02.webp` | 16:10 | 1600×1000 | Compact card thumbnail — Reward-Generalization Early Warning | ⬜ needed |
| `work-03.webp` | 16:10 | 1600×1000 | Compact card thumbnail — Deception Feature Universality | ⬜ needed |
| `work-04.webp` / `.jpg` | 16:10 | 1080×675 | Featured card — AxiosPay | ✅ present (hero of the live app, mobile screenshot) |
| `work-05.webp` / `.jpg` | 16:10 | 1080×675 | Featured card — Teger-ai | ✅ present (hero of tegerai.tech, mobile screenshot) |
| `work-06.webp` / `.jpg` | 16:10 | 976×610 | Featured card — Cropie | ✅ present (hero of cropie.vercel.app, mobile screenshot) |
| `talk-01.webp` | 3:2 | 1500×1000 | Beside the `#leadership` timeline | ◻️ optional |

Each slot also accepts a same-named `.jpg` as the fallback for old browsers (optional; modern browsers only fetch the `.webp`).

Each `work-NN` file belongs to one product (see the comments above the two `.work` grids in `index.html`).
To put a screenshot on a different project, move its `<picture>` block to that card.

## How slots behave

- **File present:** it fades in over the placeholder. Width/height and `aspect-ratio` are fixed, so there is no layout shift.
- **File missing:** the `<picture>` is removed and a labelled gradient placeholder stays (work cards show a typographic cover instead). There is never a broken-image icon.
- **On localhost / `file://`** each slot also shows its expected filename so you can see what goes where. That hint is hidden on duker.me.
- **`talk-01` is opt-in:** remove the `hidden` attribute from `<figure class="talk" hidden>` in `index.html` once the file exists.

When you add a photo, update its `alt` text and `<figcaption>` in `index.html` so they describe what is actually in the picture.

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
