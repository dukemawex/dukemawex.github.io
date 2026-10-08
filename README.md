# dukemawex.github.io

Personal site for Emmanuel Duke — AI builder, mechanical engineer, technology entrepreneur and
researcher; founder of Dukers LTD. Live at [duker.me](https://duker.me).

Static site served by GitHub Pages from the default branch. **No build step**: `index.html` is the page,
`assets/js/site.js` is its script.

Sections: Ventures, Projects, About, Experience, Education, Community (leadership), How I help,
Research & publications, Credentials, Contact.

| Path | Purpose |
|---|---|
| `index.html` | The page: content, inline CSS, metadata, JSON-LD, CSP |
| `assets/js/site.js` | Interactions (nav, filters, search palette, project popup, theme) |
| `assets/photos/` | Portrait and project screenshots — see [its README](assets/photos/README.md) |
| `assets/og/og-default.jpg` | 1200×630 social sharing image |
| `favicon.*`, `apple-touch-icon.png`, `assets/icons/`, `site.webmanifest` | Icons and manifest |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Crawling and discovery |
| `404.html` | Not-found page (noindex) |
| `_config.yml` | Keeps tooling out of the published Pages output |
| `scripts/`, `tests/`, `package.json` | Local tooling only (not published) |
| `docs/SEO-AND-DEPLOYMENT.md` | Audit, search-console setup and deployment checklist |

## Checks

```sh
npm install
npm test            # static SEO/link checks + HTML validation + Chromium/axe checks
```

`npm run browser` uses Chromium at `/opt/pw-browsers/...`; set `PW_CHROMIUM=/path/to/chrome` elsewhere.

**When you edit the inline `<script>` in `<head>`**, its CSP hash changes. `npm run check` prints the
new `sha256-…` value; paste it into the `Content-Security-Policy` meta tag.
