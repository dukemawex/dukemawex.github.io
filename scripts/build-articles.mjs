// Generates the Writing section from content/articles/*.html:
//   articles/index.html, articles/<slug>/index.html, the homepage "Writing" list,
//   sitemap.xml and the llms.txt article list.
// The output is committed (GitHub Pages serves it as-is), so there is still no deploy-time build.
// Usage: node scripts/build-articles.mjs          write files
//        node scripts/build-articles.mjs --check  exit 1 if any generated file is out of date
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://duker.me';
const FULL = 'Emmanuel Effiom Duke';
const UPDATED = '2026-10-08'; // bump when page content changes meaningfully
// Display order on the homepage and the index (newest/most relevant first)
const ORDER = ['metaculus-forecasting-bot', 'llm-knowledge-cutoff-probe', 'designing-teger-ai', 'secret-loyalties-audit', 'spd-real-transformer', 'spd-mechanism-clustering', 'deception-feature-universality', 'reward-generalization-early-warning'];
const HOME_LIMIT = 3;

const read = (f) => readFileSync(path.join(root, f), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const one = (re, s, what) => { const m = s.match(re); if (!m) throw new Error(`index.html: could not find ${what}`); return m[1] ?? m[0]; };
const fmtDate = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// ---- Shared pieces taken from the homepage so every page stays in sync ----
const home = read('index.html');
const csp = one(/<meta http-equiv="Content-Security-Policy"[^>]*\/>/, home, 'CSP');
const headScript = one(/<script>\n {2}\/\* Runs before paint[\s\S]*?<\/script>/, home, 'head script');
const homeGraph = JSON.parse(one(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, home, 'JSON-LD'))['@graph'];
const shared = homeGraph.filter((n) => ['WebSite', 'Person', 'Organization'].includes(n['@type']) || n['@id'] === `${SITE}/#portrait`);
const PERSON = `${SITE}/#person`, WEBSITE = `${SITE}/#website`;

// ---- Load articles ----
const all = readdirSync(path.join(root, 'content/articles')).filter((f) => f.endsWith('.html')).map((f) => {
  const raw = read(`content/articles/${f}`);
  const m = raw.match(/^<!--meta\n([\s\S]*?)\n-->\n([\s\S]*)$/);
  if (!m) throw new Error(`${f}: missing <!--meta … --> header`);
  const meta = JSON.parse(m[1]);
  if (meta.slug + '.html' !== f) throw new Error(`${f}: slug "${meta.slug}" must match the file name`);
  const required = meta.external ? ['headline', 'description', 'date', 'tags'] : ['headline', 'description', 'date', 'tags', 'source'];
  for (const k of required) if (!meta[k]) throw new Error(`${f}: missing ${k}`);
  if (meta.external && !/^https:\/\//.test(meta.external.url || '')) throw new Error(`${f}: external.url must be https`);
  const body = m[2].trim();
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return { ...meta, body, words, minutes: Math.max(1, Math.round(words / 220)), url: `${SITE}/articles/${meta.slug}/`, path: `/articles/${meta.slug}/` };
});
// External pieces (hosted elsewhere) are listed on the index but get no page, sitemap entry or ItemList entry.
const elsewhere = all.filter((a) => a.external).sort((a, b) => b.date.localeCompare(a.date));
const articles = all.filter((a) => !a.external);
for (const a of articles) if (!ORDER.includes(a.slug)) throw new Error(`add "${a.slug}" to ORDER`);
articles.sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

// ---- Templates ----
const ICON_SUN = '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON = '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
const nav = (current) => {
  const items = [['/', 'Home'], ['/about/', 'About'], ['/articles/', 'Writing'], ['/#ventures', 'Ventures'], ['/#projects', 'Projects'], ['/#publications', 'Research'], ['#contact', 'Contact']];
  return `<nav aria-label="Primary">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${FULL}, home">Emmanuel <span>Duke</span></a>
    <div class="navlinks" id="navlinks">
${items.map(([h, l]) => `      <a href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n')}
    </div>
    <button class="kbtn menu-btn js-only" type="button" id="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="navlinks"><span class="bars"></span></button>
    <button class="kbtn theme-btn js-only" type="button" id="theme-btn" aria-label="Switch to dark theme"><span class="tb-in">${ICON_SUN}${ICON_MOON}</span></button>
  </div>
</nav>`;
};
const footer = `<footer>
  <section class="wrap" id="contact" aria-labelledby="contact-h">
    <p class="kicker">Contact</p>
    <h2 class="h2 contact-h" id="contact-h">Work with Emmanuel.</h2>
    <p class="contact-lede">For partnerships, product work, research collaboration or speaking, email <a href="mailto:emmanuel.duke@dukersltd.com">emmanuel.duke@dukersltd.com</a>.</p>
    <p class="legal">© <span id="yr">2026</span> ${FULL} · <a href="https://duker.me/">duker.me</a> · <a href="https://dukersltd.com/">Dukers LTD</a></p>
  </section>
</footer>`;
const crumbs = (trail) => `<nav class="crumbs" aria-label="Breadcrumb">
    <ol>${trail.map(([href, name], i) => i === trail.length - 1 ? `<li><span aria-current="page">${esc(name)}</span></li>` : `<li><a href="${href}">${esc(name)}</a></li>`).join('')}</ol>
  </nav>`;
const breadcrumbLd = (url, trail) => ({
  '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
  itemListElement: trail.map(([href, name], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + href })),
});
const authorBox = `<aside class="author-box" aria-labelledby="author-h">
      <picture>
        <source type="image/webp" srcset="/assets/photos/headshot-480.webp" />
        <img src="/assets/photos/headshot-960.jpg" width="960" height="1200" loading="lazy" decoding="async" alt="${FULL}, smiling, in a light grey collared shirt" />
      </picture>
      <div>
        <h2 id="author-h">About the author</h2>
        <p><a href="/about/" rel="author">${FULL}</a> is an AI engineer, mechanical engineer (B.Eng., University of Nigeria, Nsukka) and researcher, and the founder of <a href="https://dukersltd.com/">Dukers LTD</a>. Associated initiatives: <a href="https://tegerai.tech/">Teger AI</a> and <a href="https://transly.software/">Transly</a>.</p>
      </div>
    </aside>`;
const externalCard = (a, level = 2) => `<article class="post-card external">
        <p class="tag">${esc(a.tags[0])} · <time datetime="${a.date.slice(0, 4)}">${esc(a.displayDate || fmtDate(a.date))}</time> · ${esc(a.external.site)}</p>
        <h${level}><a href="${a.external.url}">${esc(a.headline)}</a></h${level}>
        <p>${esc(a.description)}</p>
        <span class="go" aria-hidden="true">Read on ${esc(a.external.site)} ↗</span>
      </article>`;
const card = (a, level = 3) => `<article class="post-card">
        <p class="tag">${esc(a.tags[0])} · <time datetime="${a.date}">${fmtDate(a.date)}</time> · ${a.minutes} min read</p>
        <h${level}><a href="${a.path}">${esc(a.headline)}</a></h${level}>
        <p>${esc(a.description)}</p>
        <span class="go" aria-hidden="true">Read →</span>
      </article>`;

const page = ({ url, title, description, ogType, extraMeta = '', graph, body, current }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="author" content="${FULL}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<link rel="canonical" href="${url}" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
${csp}

<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="${FULL}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/assets/og/og-default.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${FULL} — AI Engineer, Researcher and Founder of Dukers LTD" />
<meta property="og:locale" content="en_US" />
${extraMeta}<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@starduke001" />
<meta name="twitter:creator" content="@starduke001" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${SITE}/assets/og/og-default.jpg" />
<meta name="twitter:image:alt" content="${FULL} — AI Engineer, Researcher and Founder of Dukers LTD" />

<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="alternate" type="application/atom+xml" title="Writing by ${FULL}" href="/feed.xml" />
<meta name="theme-color" content="#f6f8fc" />

<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': [...shared, ...graph] }, null, 2)}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..900&amp;family=Newsreader:ital,opsz,wght@0,6..72,400..500;1,6..72,400..500&amp;display=swap" rel="stylesheet" />
${headScript}
<link rel="stylesheet" href="/assets/css/site.css" />
</head>
<body>
<!-- Generated by scripts/build-articles.mjs from content/articles/ — edit the source, then run \`npm run articles\`. -->

${nav(current)}

${body}

${footer}

<script src="/assets/js/base.js" defer></script>
</body>
</html>
`;

// ---- Build ----
const out = new Map(); // path -> contents

for (const a of articles) {
  const trail = [['/', 'Home'], ['/articles/', 'Writing'], [a.path, a.headline]];
  const others = articles.filter((x) => x !== a).slice(0, 3);
  const img = a.image;
  const figure = img ? `
    <figure class="post-figure${img.width / img.height > 2 ? ' wide' : ''}">
      <div class="fig-scroll" tabindex="0" role="region" aria-label="Figure: scrolls sideways on small screens">
        <picture>
          ${img.webp ? `<source type="image/webp" srcset="${img.webp}" />` : ''}
          <img src="${img.src}" width="${img.width}" height="${img.height}" decoding="async" alt="${esc(img.alt)}" />
        </picture>
      </div>
      ${a.figcaption ? `<figcaption>${esc(a.figcaption)}</figcaption>` : ''}
    </figure>` : '';
  const ld = [
    {
      '@type': 'BlogPosting', '@id': `${a.url}#article`, headline: a.headline, description: a.description,
      url: a.url, mainEntityOfPage: a.url, datePublished: a.date, dateModified: a.dateModified || a.date,
      author: { '@id': PERSON }, publisher: { '@id': PERSON }, isPartOf: { '@id': WEBSITE },
      image: SITE + (img ? img.src : '/assets/og/og-default.jpg'), keywords: a.tags.join(', '),
      isBasedOn: a.source.url, wordCount: a.words, inLanguage: 'en',
    },
    breadcrumbLd(a.url, trail),
  ];
  const extraMeta = `<meta property="article:published_time" content="${a.date}" />
<meta property="article:author" content="${SITE}/about/" />
${a.tags.map((t) => `<meta property="article:tag" content="${esc(t)}" />`).join('\n')}
`;
  out.set(`articles/${a.slug}/index.html`, page({
    url: a.url, title: `${a.headline} | ${FULL}`, description: a.description, ogType: 'article', extraMeta, graph: ld, current: '/articles/',
    body: `<main class="wrap bio post">
  ${crumbs(trail)}

  <article class="post-article">
    <header class="post-head">
      <p class="kicker">${a.tags.map(esc).join(' · ')}</p>
      <h1>${esc(a.headline)}</h1>
      <p class="post-dek">${esc(a.description)}</p>
      <p class="byline">By <a href="/about/" rel="author">${FULL}</a> · <time datetime="${a.date}">${fmtDate(a.date)}</time> · ${a.minutes} min read</p>
    </header>
${figure}
    <div class="prose">
${a.body.split('\n').map((l) => (l ? '      ' + l : l)).join('\n')}
    </div>

    <p class="source-box">Code, data and full results: <a href="${a.source.url}">${esc(a.source.label)}</a> on GitHub.</p>

    ${authorBox}
  </article>

  <section class="more-posts" aria-labelledby="more-h">
    <h2 id="more-h">More writing</h2>
    <div class="posts">
      ${others.map((x) => card(x)).join('\n      ')}
    </div>
    <p><a href="/articles/">All articles →</a></p>
  </section>
</main>`,
  }));
}

{
  const url = `${SITE}/articles/`, trail = [['/', 'Home'], ['/articles/', 'Writing']];
  const title = `Writing by ${FULL} | Articles`;
  const description = `Articles by ${FULL} on AI forecasting, AI security, mechanistic interpretability, model evaluation and AI-safety research.`;
  const ld = [
    {
      '@type': 'CollectionPage', '@id': `${url}#page`, url, name: title, description, isPartOf: { '@id': WEBSITE },
      author: { '@id': PERSON }, breadcrumb: { '@id': `${url}#breadcrumb` }, inLanguage: 'en', dateModified: UPDATED,
      mainEntity: { '@type': 'ItemList', itemListElement: articles.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: a.url, name: a.headline })) },
    },
    breadcrumbLd(url, trail),
  ];
  out.set('articles/index.html', page({
    url, title, description, ogType: 'website', graph: ld, current: '/articles/',
    body: `<main class="wrap bio">
  ${crumbs(trail)}

  <header class="bio-head single">
    <div>
      <p class="kicker">Writing</p>
      <h1>Writing by ${FULL}</h1>
      <p class="bio-lede">Technical notes on AI forecasting, AI security, model evaluation, interpretability and AI-safety research, written from my own projects, negative results included. I'm ${FULL}, founder of <a href="https://dukersltd.com/">Dukers LTD</a>; associated initiatives include <a href="https://tegerai.tech/">Teger AI</a> and <a href="https://transly.software/">Transly</a>.</p>
    </div>
  </header>

  <section class="post-index" aria-label="All articles">
    <div class="posts">
      ${articles.map((a) => card(a, 2)).join('\n      ')}
    </div>
  </section>${elsewhere.length ? `

  <section class="post-index elsewhere" aria-labelledby="elsewhere-h">
    <h2 id="elsewhere-h" class="subh">Earlier writing, published elsewhere</h2>
    <div class="posts">
      ${elsewhere.map((a) => externalCard(a, 3)).join('\n      ')}
    </div>
  </section>` : ''}
</main>`,
  }));
}

// Homepage list (between markers)
{
  const block = `<!--ARTICLES:START (generated by scripts/build-articles.mjs)-->
    <div class="posts">
      ${articles.slice(0, HOME_LIMIT).map((a) => card(a)).join('\n      ')}
    </div>
    <!--ARTICLES:END-->`;
  const re = /<!--ARTICLES:START[\s\S]*?<!--ARTICLES:END-->/;
  if (!re.test(home)) throw new Error('index.html: missing <!--ARTICLES:START--> … <!--ARTICLES:END--> markers');
  out.set('index.html', home.replace(re, block));
}

// Sitemap
{
  const entries = [
    { loc: `${SITE}/`, image: `${SITE}/assets/photos/portrait.jpg` },
    { loc: `${SITE}/about/`, image: `${SITE}/assets/photos/headshot-960.jpg` },
    { loc: `${SITE}/articles/` },
    ...articles.map((a) => ({ loc: a.url, lastmod: a.dateModified || a.date, image: a.image && SITE + a.image.src })),
  ];
  out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod || UPDATED}</lastmod>${e.image ? `
    <image:image><image:loc>${e.image}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`);
}

// llms.txt article list (between markers)
{
  const llms = read('llms.txt');
  const re = /<!--ARTICLES:START-->[\s\S]*?<!--ARTICLES:END-->/;
  if (!re.test(llms)) throw new Error('llms.txt: missing article markers');
  const lines = [...articles.map((a) => `- [${a.headline}](${a.url}): ${a.description}`), ...elsewhere.map((a) => `- [${a.headline}](${a.external.url}) (${a.displayDate || a.date}, ${a.external.site}): ${a.description}`)];
  out.set('llms.txt', llms.replace(re, `<!--ARTICLES:START-->\n${lines.join('\n')}\n<!--ARTICLES:END-->`));
}

// Atom feed: full article content, absolute links. Google and Bing accept it as a sitemap (robots.txt lists it).
{
  const abs = (html) => html.replace(/(href|src)="\//g, `$1="${SITE}/`);
  const updated = articles.map((a) => a.dateModified || a.date).sort().pop();
  out.set('feed.xml', `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>Writing by ${FULL}</title>
  <subtitle>Articles on AI forecasting, AI security, model evaluation, interpretability and AI-safety research.</subtitle>
  <id>${SITE}/articles/</id>
  <link rel="self" type="application/atom+xml" href="${SITE}/feed.xml" />
  <link rel="alternate" type="text/html" href="${SITE}/articles/" />
  <updated>${updated}T00:00:00Z</updated>
  <author><name>${FULL}</name><uri>${SITE}/</uri></author>
  <icon>${SITE}/favicon.svg</icon>
${articles.map((a) => `  <entry>
    <title>${esc(a.headline)}</title>
    <id>${a.url}</id>
    <link rel="alternate" type="text/html" href="${a.url}" />
    <published>${a.date}T00:00:00Z</published>
    <updated>${a.dateModified || a.date}T00:00:00Z</updated>
    <author><name>${FULL}</name><uri>${SITE}/about/</uri></author>
${a.tags.map((t) => `    <category term="${esc(t)}" />`).join('\n')}
    <summary>${esc(a.description)}</summary>
    <content type="html">${esc(abs(a.body) + `<p>Source: <a href="${a.source.url}">${a.source.label}</a></p>`)}</content>
  </entry>`).join('\n')}
</feed>
`);
}

// ---- Write or check ----
let stale = [];
for (const [f, content] of out) {
  const p = path.join(root, f);
  const current = existsSync(p) ? readFileSync(p, 'utf8') : null;
  if (current === content) continue;
  if (process.argv.includes('--check')) { stale.push(f); continue; }
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, content);
  console.log('wrote', f);
}
if (stale.length) { console.error('✗ generated files are out of date — run `npm run articles`:\n  ' + stale.join('\n  ')); process.exit(1); }
console.log(`✓ articles: ${articles.length} posts + ${elsewhere.length} external${process.argv.includes('--check') ? ', generated files up to date' : ''}`);
