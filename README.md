# dukemawex.github.io

Personal site for Emmanuel Effiom Duke (Emmanuel Duke): AI engineer, mechanical engineer, researcher and
founder of Dukers LTD. Live at [duker.me](https://duker.me).

Static site served by GitHub Pages from the default branch. **No build step**: `index.html` (home) and
`about/index.html` (biography) are the pages, sharing `assets/css/site.css` and `assets/js/base.js`.

Sections: Ventures, Projects, About, Experience, Education, Community (leadership), How I help,
Research & publications, Writing, Credentials, Contact.

## Writing (articles)

Articles live in `content/articles/<slug>.html`: a `<!--meta {…} -->` JSON header (headline, description,
date, tags, source repo, optional figure) followed by the body HTML. To add or edit one:

```sh
# 1. write content/articles/my-post.html (copy an existing one); add the slug to ORDER in scripts/build-articles.mjs
npm run articles   # writes articles/…/index.html, articles/index.html, the homepage Writing list, sitemap.xml, llms.txt
npm test           # fails if generated files are stale
```

Commit the generated files: GitHub Pages serves them as-is. Every article must cite the public repository it is
based on (`source`), and the static checks enforce it.

| Path | Purpose |
|---|---|
| `index.html` | Home: content, metadata, JSON-LD, CSP |
| `articles/` | Generated article pages + index (don't edit by hand) |
| `content/articles/` | Article sources (not published) |
| `scripts/build-articles.mjs` | Article generator |
| `about/index.html` | Full biography, with BreadcrumbList JSON-LD. Its Person JSON-LD must stay identical to the homepage's (tests check) |
| `assets/css/site.css` | Shared styles |
| `assets/js/base.js` | Shared: theme toggle, mobile menu, footer year |
| `assets/js/site.js` | Home only: nav highlight, filters, search palette, project popup |
| `assets/photos/` | Portrait and project screenshots — see [its README](assets/photos/README.md) |
| `assets/og/og-default.jpg` | 1200×630 social sharing image |
| `favicon.*`, `apple-touch-icon.png`, `assets/icons/`, `site.webmanifest` | Icons and manifest |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Crawling and discovery |
| `404.html` | Not-found page (noindex) |
| `_config.yml` | Keeps tooling out of the published Pages output |
| `scripts/`, `tests/`, `package.json` | Local tooling only (not published) |
| `docs/SEO-AND-DEPLOYMENT.md` | Audit, search-console setup and deployment checklist |
| `docs/NAME-SEARCH-REPORT.md` | Before/after report for the "Emmanuel Effiom Duke" name search |
| `docs/VISIBILITY-PLAYBOOK.md` | Profile-side steps (LinkedIn, X, GitHub, Scholar) and indexing checklist |
| `docs/reciprocal/` | Prepared founder-link snippets for dukersltd.com, tegerai.tech, transly.software |

## Checks

```sh
npm install
npm test            # static SEO/link checks + HTML validation + Chromium/axe checks
```

`npm run browser` uses Chromium at `/opt/pw-browsers/...`; set `PW_CHROMIUM=/path/to/chrome` elsewhere.

**When you edit the inline `<script>` in `<head>`** (it's the same on both pages), its CSP hash changes.
`npm run check` prints the new `sha256-…` value; paste it into the `Content-Security-Policy` meta tag on both pages.
