# duker.me — audit, SEO setup and deployment checklist

Last updated 2026-10-08. Hosting: **GitHub Pages** (custom domain via `CNAME` → `duker.me`). No Vercel
project, firewall or server config exists in this repository.

## 1. Audit: before → after

| Area | Before | After |
|---|---|---|
| Positioning | "Researcher, developer & growth leader"; no mention of Dukers LTD, Teger AI branding or Transly | Headline "AI Builder · Mechanical Engineer · Technology Entrepreneur · Researcher"; name in the `<h1>`; new **Ventures** section (Dukers LTD, Teger AI, Transly); founder role in Experience |
| Contact | Personal Gmail | Business address `emmanuel.duke@dukersltd.com` throughout (links, copy button, search palette, JSON-LD) |
| Biography | Two paragraphs, research-first | Evidence-based bio: AI engineering, software and security, engineering research, community; skills list; education stated |
| Research | Publications list only | Research interests (4 areas, all backed by listed projects or papers) + publications |
| Community | "Impact & Leadership" | "Speaking & Community" (same verified entries) |
| robots.txt / sitemap.xml | Missing (404) | Present; robots allows all crawlers and points to the sitemap |
| Canonical / robots meta | Missing | `https://duker.me/`, `index, follow, max-image-preview:large` |
| Open Graph / X card | Partial; image was a 1.4 MB 1024² PNG | Complete OG + `summary_large_image`; 80 KB 1200×630 card generated from the portrait |
| Structured data | None | JSON-LD `@graph`: WebSite, ProfilePage, Person (sameAs, alumniOf, credential, worksFor), Organization (Dukers LTD, founder) |
| Favicon / manifest | Missing (`/favicon.ico` 404) | SVG + ICO favicons, apple-touch icon, 192/512/maskable icons, `site.webmanifest` |
| 404 page | GitHub default | Branded `404.html`, `noindex` |
| Broken requests | 6 image slots pointed at files that don't exist (work-01/02/03, field-01/02, talk-01) → a 404 on every visit; placeholder "field work" photos with alt text describing photos that don't exist | Slots removed; typographic covers kept; no failing requests |
| Dark mode | `--line-hi`, `--glass` and `--scrim` referenced themselves (invalid), so the dark nav, dialogs and borders lost their backgrounds; ignored the OS setting | Real dark values; follows `prefers-color-scheme` until the visitor picks a theme |
| Images without JS | All photos stayed at `opacity:0` if JS failed | Fade-in only applies when JS runs |
| Headings | Publication and credential titles skipped a level | One `h1`, no skipped levels (checked by tests) |
| Accessibility | `aria-label` on non-interactive divs; links distinguished by colour only; low-contrast chip count | Fixed; axe reports 0 WCAG 2.1 AA/best-practice violations in light and dark at 3 widths |
| Security | No CSP; inline `onload`/`onerror` handlers; no referrer policy | CSP meta (`script-src 'self'` + hash of one inline script, `object-src 'none'`, `base-uri 'self'`); script moved to `assets/js/site.js`; `strict-origin-when-cross-origin` |
| Fonts | Inter in 6 static weights + Newsreader | One variable Inter file + variable Newsreader (fewer font files) |
| Motion | Click sparks, auto-popup welcome toast, infinite button shimmer, looping headline gradient | Removed; kept the subtle hero motion, which `prefers-reduced-motion` disables |
| Metadata | Screenshot WebPs carried EXIF | Stripped (colour profile kept); portraits were already clean |

### What was preserved
All verified content: projects and links, experience, education, publications, honours, certifications,
profile links, screenshots and the studio portrait. Also kept: project filters, search palette (⌘K / `/`),
project popup, citation copy and theme toggle.

### Not done / needs your input
- **Founder photograph** — the site uses the studio portrait already in the repo (`assets/photos/portrait.jpg`,
  unaltered). If you meant a different photo, send the file. Then replace `portrait.*`, run `npm run images`,
  and update the `alt` text.
- **Transly and Dukers LTD descriptions** — neither site could be reached from the build environment, and web
  search found nothing authoritative. So the copy only says what you stated: Dukers LTD is the company you
  founded, and Transly is an associated initiative. Send one or two verified sentences per product and they'll go in.
- **Teger AI** copy comes from the screenshot of tegerai.tech already in the repo ("MVP in development ·
  Private beta — coming soon"; "Stop the message before it becomes the breach").
- **Writing section** — no articles exist, so none was created. Add one once there are real posts.
- **Separate pages** (/about, /projects, …) — the site stays a single canonical page, which avoids thin,
  duplicate pages. Splitting it is a sensible later step once each section has enough unique content.
- **"80+ GitHub repos"** stat is carried over from the existing site. Please re-confirm it occasionally.
- **Forms** — there are none (contact is `mailto:`), so there's nothing to abuse. If you add a form, use a
  provider with built-in spam protection (e.g. Formspree + honeypot/Turnstile), and add its host to the CSP
  `form-action` / `connect-src`.

## 2. Hosting limits (GitHub Pages)

- **Response headers can't be set.** HSTS, `X-Content-Type-Options`, `frame-ancestors` and cache lifetimes
  (Pages sends `max-age=600`) need a proxy/CDN. The CSP is delivered as a `<meta>` tag, which covers
  everything except `frame-ancestors`, `report-uri` and `sandbox`. To get full headers, front the site with
  Cloudflare (requires a DNS change, so it needs your approval and isn't done here).
- **Firewall:** GitHub Pages has no bot firewall to configure, and robots.txt allows everything. If a CDN or
  WAF is added later, make sure its "bot fight"/AI-crawler blocking rules don't block Googlebot, Bingbot,
  OAI-SearchBot, GPTBot or ClaudeBot on public pages (unless you choose to).
- All content is server-rendered HTML; nothing important depends on JavaScript to appear.

## 3. Deployment checklist

1. Review and merge the feature branch into the default branch. GitHub Pages deploys automatically.
2. In **GitHub → Settings → Pages**, confirm: Source = default branch / root, Custom domain = `duker.me`,
   **Enforce HTTPS** ticked.
3. DNS (check only — don't change without reason): apex `duker.me` A/AAAA records point to GitHub Pages.
   If `www.duker.me` should work, it needs a CNAME to `dukemawex.github.io` (Pages then redirects it to the apex).
4. After deploying, verify in production:
   - `https://duker.me/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, `/favicon.ico`, `/llms.txt` return 200
   - `https://duker.me/does-not-exist` shows the branded 404 page
   - `http://duker.me/` redirects to `https://duker.me/`
   - `https://dukemawex.github.io/` redirects to `https://duker.me/`
   - DevTools console shows no CSP violations or 404s
   - [Rich Results Test](https://search.google.com/test/rich-results?url=https%3A%2F%2Fduker.me%2F) and
     [Schema validator](https://validator.schema.org/#url=https%3A%2F%2Fduker.me%2F) parse ProfilePage/Person
     without errors
   - Share-card previews: [opengraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Fduker.me%2F) or
     LinkedIn Post Inspector (refreshes LinkedIn's cache)
   - [PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fduker.me%2F) for mobile Core Web Vitals
5. `assets/emmanuel.png` (1.4 MB) is no longer referenced by the page. It's kept as a source image and can be
   deleted if you don't need it.

## 4. Google Search Console

1. Go to <https://search.google.com/search-console> → **Add property** → **Domain** → `duker.me`.
2. Add the TXT record it shows at your DNS provider (it verifies every protocol and subdomain).
   Alternatively choose **URL prefix** `https://duker.me/` and use the HTML-tag method: add the
   `<meta name="google-site-verification" …>` tag to `<head>` in `index.html`.
3. **Sitemaps** → submit `https://duker.me/sitemap.xml`.
4. **URL Inspection** → `https://duker.me/` → **Request indexing**.
5. Check **Page indexing** and **Enhancements** after a few days.

## 5. Bing Webmaster Tools

1. Go to <https://www.bing.com/webmasters> → **Import from Google Search Console** (quickest), or add
   `https://duker.me/` and verify by DNS CNAME or meta tag.
2. **Sitemaps** → submit `https://duker.me/sitemap.xml`.
3. **URL Submission** → submit `https://duker.me/`. (Bing also powers some AI search results; IndexNow can be
   added later.)

Search and AI-answer inclusion is decided by each engine. This setup makes the site crawlable and
understandable, but it can't guarantee rankings or citations.

## 6. Keeping it healthy

- Update `<lastmod>` in `sitemap.xml` and `dateModified` in the JSON-LD when content changes meaningfully.
- Run `npm test` before pushing.
- Only add `sameAs` links for profiles you control. Every `sameAs` URL must also be linked visibly on the page
  (the static check enforces this).
