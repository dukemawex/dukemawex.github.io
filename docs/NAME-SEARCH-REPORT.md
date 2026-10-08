# Google visibility for "Emmanuel Effiom Duke": technical SEO report

Date: 2026-10-08 · Branch: `ccr-f4138f97-wf8nc4` (not merged, not deployed)
Goal: make https://duker.me/ the canonical professional website for the exact name **Emmanuel Effiom Duke**.

## How to read the evidence

- **Repo:** checked in this repository. "Before" = `origin/main` (what GitHub Pages serves today).
  "After" = this branch. The commands are below, so every row can be reproduced.
- **Local:** checked by serving the branch locally and loading it in Chromium (`npm test`).
- **Live:** not possible from this environment. The network policy blocks duker.me, www.duker.me,
  dukemawex.github.io, dukersltd.com, tegerai.tech and transly.software (`403` on CONNECT; WebFetch returns
  `EGRESS_BLOCKED`). Every live check is listed in section 5 for you to run after deploying.

Reproduce: `python3 scripts/seo-evidence.py <dir>` (prints the values in the tables below; for "before",
export `origin/main` with `git archive origin/main | tar -x -C /tmp/before`), `npm test`, and `git diff origin/main --stat`.

## 1. Baseline (before)

| Check | Result | Evidence |
|---|---|---|
| Web search for `"Emmanuel Effiom Duke"` (2026-10-08) | duker.me **not returned**. The top results were other people with similar names, none of them Emmanuel Effiom Duke | WebSearch tool (not Google itself). Search Console will give the real Google position after verification |
| robots.txt | **Missing** → 404 | `origin/main` tree has no `robots.txt` |
| sitemap.xml | **Missing** → 404 | no `sitemap.xml` |
| Canonical URL | **None** | no `<link rel="canonical">` |
| Robots meta / noindex | No robots meta; no `noindex` anywhere (indexable by default) | grep of `index.html` |
| Title | `Emmanuel Effiom Duke — Researcher, Developer & Growth Leader` | `<title>` |
| Meta description | Present, but no mention of AI, entrepreneurship or Dukers LTD | `<meta name="description">` |
| H1 | `Researcher, developer & growth leader.`, **without the name** | `<h1>` |
| Full name in visible text | 3 occurrences (eyebrow, about paragraph, footer) | text extraction |
| Structured data | **None** | no `application/ld+json` |
| About page | **None** (single page) | no `about/` |
| Links to dukersltd.com / tegerai.tech / transly.software | ✗ / ✓ / ✗ | grep |
| Favicon / manifest / 404 page | Missing / missing / GitHub default | file listing |
| Broken asset requests | 6 image `src`s pointing at files that don't exist (404 on every visit) | earlier audit, `docs/SEO-AND-DEPLOYMENT.md` |

## 2. Changes and evidence (after)

| # | Requirement | Done | Evidence |
|---|---|---|---|
| 1 | Inspect repo and production config | ✓ (repo); live ✗ blocked | GitHub Pages static site, `CNAME` = `duker.me`, Jekyll on with `_config.yml` excludes; no Vercel/firewall config in repo |
| 2 | Indexing readiness | ✓ | `robots.txt` allows `*` and lists the sitemap; both pages `index, follow`; no `noindex` except `404.html` (intentional); one canonical per page; sitemap lists exactly the canonical URLs (static check enforces it) |
| 3 | Exact homepage title | ✓ | `<title>Emmanuel Effiom Duke \| AI Engineer, Researcher &amp; Founder</title>`, asserted verbatim by `tests/static-check.mjs` (a negative test confirmed the check fails on a wrong title) |
| 4 | Meta description | ✓ | "Emmanuel Effiom Duke is an AI engineer, mechanical engineer, researcher and founder of Dukers LTD, building AI security tools and publishing energy research." (156 chars) |
| 5 | Full name prominent in crawlable HTML | ✓ | Homepage `<h1>` = "**Emmanuel Effiom Duke** AI engineer, researcher & founder."; About `<h1>` = "About Emmanuel Effiom Duke"; name appears 4× in visible text on each page; no JavaScript needed to render it |
| 6 | Person / ProfilePage / WebSite JSON-LD | ✓ | Both pages: `Person.name` "Emmanuel Effiom Duke", `alternateName` "Emmanuel Duke", plus `WebSite`, `ProfilePage` (`mainEntity` → Person) and `Organization` (Dukers LTD, `founder` → Person). About also has `BreadcrumbList`. Both blocks parse; no dangling `@id`s; Person node byte-identical across pages (all enforced by tests) |
| 7 | Verified profiles and affiliations only | ✓ | `sameAs`: GitHub, LinkedIn, X, Google Scholar, SciProfiles, the profiles already published on the site. Every `sameAs` URL must also be linked visibly (test enforces). Affiliations: University of Nigeria, Nsukka (`alumniOf`), Dukers LTD (`worksFor`) |
| 8 | Substantial factual About page | ✓ | `/about/`: 814 words, sections on education, AI engineering and safety, software and cybersecurity, energy research, entrepreneurship, community and profiles. Every fact comes from the existing site or the Teger-ai source code |
| 9 | Founder photograph optimised, descriptive alt | ✓ | About uses the supplied smiling headshot (`assets/emmanuel.png`, 1024², 1.4 MB). Cropped to 4:5 and resized only (no retouching): `headshot-480.webp` 14.7 KB, `headshot-960.webp` 52.9 KB, `headshot-960.jpg` 108.7 KB; 0 EXIF/XMP/GPS entries (`identify -verbose`). Homepage keeps the studio portrait. Both alts start with "Emmanuel Effiom Duke …" (test enforces). Social card regenerated with the full name |
| 10 | Links to dukersltd.com, tegerai.tech, transly.software | ✓ | Present on both pages (test enforces). Teger AI description now verified against `dukemawex/Teger-ai` (README + `extension/manifest.json`). Dukers LTD and Transly copy stays minimal: neither site is reachable, and the Transly repos contain only a title |
| 11 | Reciprocal founder links | Prepared | `docs/reciprocal/README.md` (HTML + JSON-LD snippets for each site) and `docs/reciprocal/teger-ai-readme.patch`. **No other repository was modified or pushed** |
| 12 | Validate sitemap, structured data, mobile, build | ✓ (local) | See section 3 |
| 13 | Search Console instructions | ✓ | Section 4 |
| 14 | Before/after report | ✓ | This file |

### Extracted values (after)

```
--- index.html
title      : Emmanuel Effiom Duke | AI Engineer, Researcher &amp; Founder
canonical  : https://duker.me/
robots meta: index, follow, max-image-preview:large, max-snippet:-1 | noindex anywhere: False
h1         : Emmanuel Effiom Duke AI engineer, researcher & founder.
JSON-LD    : WebSite, ProfilePage, ImageObject, Person, Organization
Person     : name "Emmanuel Effiom Duke" | alternateName "Emmanuel Duke"
--- about/index.html
title      : About Emmanuel Effiom Duke | Biography
canonical  : https://duker.me/about/
h1         : About Emmanuel Effiom Duke
JSON-LD    : WebSite, ImageObject, Person, Organization, ProfilePage, BreadcrumbList, ImageObject
```

## 3. Test results (local)

```
$ npm test
✓ static checks passed (2 pages, sitemap, robots, structured data, CSP)
  html-validate index.html about/index.html 404.html → 0 problems
✓ browser checks passed (2 pages × 6 viewport/theme combos, axe, CSP, no failed requests)

index.html JSON-LD parses · about/index.html JSON-LD parses
sitemap.xml well-formed XML; 2 urls
```

The browser checks cover both pages at 375, 768 and 1366 px in light and dark: no horizontal overflow, no
console or CSP errors, no failed local requests, every project image loads, and axe-core finds 0 WCAG 2.1
AA / best-practice violations. There is **no build step** (plain static HTML), so the "production build" is
the files themselves; html-validate is the build-time gate.

Not yet validated (needs network or a deployed URL): Google Rich Results Test, Schema.org validator by URL,
PageSpeed Insights, and real HTTP status/redirect behaviour.

## 4. Google Search Console: verify and submit

1. Open <https://search.google.com/search-console>, choose **Add property**, then **Domain**, and enter `duker.me`.
2. Google shows a TXT record (`google-site-verification=…`). Add it at your DNS provider as a TXT record on
   the apex (`@`). *This is a DNS change, so make it yourself; I haven't touched DNS.* Then click **Verify**.
   No-DNS alternative: add a **URL-prefix** property `https://duker.me/` and choose **HTML tag**. Send me the
   tag and I'll add it to `<head>` of `index.html`, or paste it there yourself.
3. **Sitemaps** → enter `sitemap.xml` → **Submit**. Expect "Success" and 2 discovered URLs.
4. **URL Inspection** → `https://duker.me/` → **Test live URL**. Confirm "URL is available to Google",
   canonical = `https://duker.me/` and the detected ProfilePage/Breadcrumb items → **Request indexing**.
   Repeat for `https://duker.me/about/`.
5. After a few days, check **Performance → Search results**, filtering Query to contain "effiom", to see
   impressions and position for the exact name.
6. Bing: <https://www.bing.com/webmasters>, **Import from Google Search Console**, then submit the same sitemap.

## 5. Post-deployment live checks (to run after merging)

| Check | Expected |
|---|---|
| `curl -sI https://duker.me/` | `200`, `content-type: text/html` |
| `curl -sI http://duker.me/` | `301` → `https://duker.me/` (requires **Enforce HTTPS** in Settings → Pages) |
| `curl -sI https://www.duker.me/` | `301` → `https://duker.me/` if a `www` CNAME exists, otherwise no DNS answer (fine; only the apex is canonical) |
| `curl -sI https://dukemawex.github.io/` | `301` → `https://duker.me/` |
| `curl -sI https://duker.me/about` | `301` → `https://duker.me/about/` (GitHub Pages adds the slash) |
| `curl -s https://duker.me/robots.txt` | the file from this repo, `200` |
| `curl -s https://duker.me/sitemap.xml` | 2 URLs, `200` |
| `curl -sI https://duker.me/nope` | `404` with the branded page |
| `curl -sI https://duker.me/assets/photos/README.md` | `404` (excluded from Pages by `_config.yml`) |
| Rich Results Test on `/` and `/about/` | ProfilePage detected, plus Breadcrumbs on `/about/`, no errors |
| Search Console URL Inspection | "Indexing allowed: Yes", user-declared canonical = Google-selected canonical |

## 6. Outside the code

- **Ranking for a name takes time and signals beyond the page.** Google decides whether and where duker.me
  ranks, so no position is promised. The strongest levers you control are: (a) verify the domain and submit
  the sitemap; (b) use "Emmanuel Effiom Duke" as the display name on LinkedIn, GitHub, Google Scholar,
  SciProfiles and X, with each linking to https://duker.me/; (c) add the reciprocal founder links from
  `docs/reciprocal/`; (d) put the full name on future papers and talk bios, with a link to duker.me.
- **Needs your confirmation:**
  - The Teger-ai README claims "Supported by the OpenAI Cybersecurity Grant". I didn't add it to duker.me
    because I couldn't verify it independently. Confirm it and it can go in (honours plus JSON-LD `award`).
  - A one-line verified description of **Transly** and of **Dukers LTD**'s business.
  - Whether Teger AI and Transly are Dukers LTD products. The site currently says "associated initiatives".
- **Not changed (no approval):** DNS, email, GitHub Pages settings, any firewall, and any other repository.

## 7. Update: Writing section (articles)

Added after the report above. There are eight articles at `/articles/`, each based strictly on one of Emmanuel's public
repositories, with that repository cited and linked (`BlogPosting.isBasedOn`). Negative and inconclusive
results are reported as the repositories state them. Each article:

- has its own canonical URL, `BlogPosting` + `BreadcrumbList` JSON-LD with `author` → `https://duker.me/#person`,
  and an author box linking duker.me/about, Dukers LTD, Teger AI and Transly
- is listed in `sitemap.xml` (now 11 URLs), the `/articles/` index (`CollectionPage` + `ItemList`), the homepage
  Writing section (latest 3) and `llms.txt`

Transly and Dukers LTD are linked but not described beyond "associated initiatives" and "founder", since there
are still no verified facts. Tests: `npm test` → articles up to date · static checks 11 pages · browser checks
5 pages × 6 viewport/theme combos with axe, all passing.

Articles added in the second batch: *Building a Metaculus forecasting bot* (botduke--update; no tournament scores are
claimed because the repository records none), *Ask the calendar, not the model* (llm-knowledge-cutoff-probe)
and *SPD meets a real grokked transformer* (spd-real-transformer).
