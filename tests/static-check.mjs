// Static checks for the published site: SEO metadata, structured data, CSP hash,
// local references, anchors, headings, images, robots and sitemap. No network.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(path.join(root, f), 'utf8');
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const FULL = 'Emmanuel Effiom Duke';

// Every indexable page: file, canonical URL, kind, exact title (null = only check it names the person)
const PAGES = [
  { file: 'index.html', url: 'https://duker.me/', kind: 'profile', title: 'Emmanuel Effiom Duke | AI Engineer, Researcher &amp; Founder' },
  { file: 'about/index.html', url: 'https://duker.me/about/', kind: 'profile', title: null },
  { file: 'articles/index.html', url: 'https://duker.me/articles/', kind: 'collection', title: null },
  ...readdirSync(path.join(root, 'articles'), { withFileTypes: true }).filter((d) => d.isDirectory())
    .map((d) => ({ file: `articles/${d.name}/index.html`, url: `https://duker.me/articles/${d.name}/`, kind: 'article', title: null })),
];
ok(PAGES.filter((p) => p.kind === 'article').length >= 1, 'expected at least one article');
const allIds = {};
const persons = [];

for (const pg of PAGES) {
  const html = read(pg.file);
  const at = (m) => `${pg.file}: ${m}`;
  const meta = (key) => { const m = html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`)); return m && m[1]; };
  const local = (r) => path.join(root, r.startsWith('/') ? r.slice(1) : path.join(path.dirname(pg.file), r));

  // Title, description, canonical, robots
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (pg.title) ok(title === pg.title, at(`title is "${title}", want "${pg.title}"`));
  ok(title.includes(FULL) && title.length <= 65, at(`title must contain "${FULL}" and be ≤65 chars (${title.length})`));
  const desc = meta('description') || '';
  ok(desc.length >= 70 && desc.length <= 160, at(`meta description length ${desc.length} (want 70–160)`));
  if (pg.kind !== 'article') ok(desc.includes(FULL), at('meta description should name the person in full'));
  else ok(meta('author') === FULL, at('article must declare the author in full'));
  ok(html.includes(`<link rel="canonical" href="${pg.url}" />`), at(`canonical must be ${pg.url}`));
  ok((html.match(/rel="canonical"/g) || []).length === 1, at('exactly one canonical'));
  ok(/^index, follow/.test(meta('robots') || '') && !/noindex/i.test(html), at('page must be indexable (no noindex)'));
  for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'twitter:card', 'twitter:title', 'twitter:image'])
    ok(meta(k), at(`missing ${k}`));
  ok(meta('og:url') === pg.url, at('og:url must equal the canonical URL'));
  for (const k of ['og:image', 'twitter:image']) {
    const u = meta(k) || '';
    ok(u.startsWith('https://duker.me/') && existsSync(path.join(root, u.replace('https://duker.me/', ''))), at(`${k} must be an absolute duker.me URL to an existing file`));
  }

  // Full name in crawlable HTML: in the h1 and in visible body text (not only metadata)
  const body = html.slice(html.indexOf('<body'));
  const h1 = (body.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '';
  if (pg.kind === 'article') ok(/class="byline">By <a href="\/about\/" rel="author">Emmanuel Effiom Duke<\/a>/.test(body), at('article byline must credit the author in full'));
  else ok(h1.replace(/<[^>]+>/g, ' ').includes(FULL), at(`h1 must contain "${FULL}"`));
  const text = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  ok((text.match(new RegExp(FULL, 'g')) || []).length >= 3, at(`"${FULL}" should appear at least 3 times in visible text`));

  // JSON-LD
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  ok(ld.length === 1, at('expected one JSON-LD block'));
  let graph = [];
  try { graph = JSON.parse(ld[0][1])['@graph']; } catch (e) { fails.push(at('JSON-LD does not parse: ' + e.message)); }
  const types = graph.map((n) => n['@type']);
  const KIND_TYPE = { profile: 'ProfilePage', collection: 'CollectionPage', article: 'BlogPosting' };
  for (const t of ['WebSite', 'Person', KIND_TYPE[pg.kind]]) ok(types.includes(t), at(`JSON-LD missing ${t}`));
  if (pg.file !== 'index.html') ok(types.includes('BreadcrumbList'), at('JSON-LD missing BreadcrumbList'));
  const ids = new Set(graph.map((n) => n['@id']));
  JSON.stringify(graph).replace(/\{"@id":"([^"]+)"\}/g, (_, id) => { ok(ids.has(id), at(`JSON-LD dangling reference ${id}`)); return ''; });
  if (pg.kind === 'profile') {
    const profile = graph.find((n) => n['@type'] === 'ProfilePage') || {};
    ok(profile.url === pg.url && profile.mainEntity?.['@id'] === 'https://duker.me/#person', at('ProfilePage must use the canonical URL and point at the Person'));
  }
  if (pg.kind === 'article') {
    const post = graph.find((n) => n['@type'] === 'BlogPosting') || {};
    ok(post.url === pg.url && post.mainEntityOfPage === pg.url, at('BlogPosting url/mainEntityOfPage must be canonical'));
    ok(post.author?.['@id'] === 'https://duker.me/#person', at('BlogPosting author must be the Person'));
    ok(/^\d{4}-\d{2}-\d{2}$/.test(post.datePublished || ''), at('BlogPosting datePublished'));
    ok(post.headline && post.headline.length <= 110, at('BlogPosting headline missing or too long'));
    ok(/^https:\/\/github\.com\/dukemawex\//.test(post.isBasedOn || ''), at('article must cite its source repository (isBasedOn)'));
    ok(html.includes(`href="${post.isBasedOn}"`), at('source repository must be linked visibly'));
    ok(existsSync(path.join(root, (post.image || '').replace('https://duker.me/', ''))), at('BlogPosting image must exist'));
  }
  if (pg.kind === 'collection') {
    const col = graph.find((n) => n['@type'] === 'CollectionPage') || {};
    const listed = (col.mainEntity?.itemListElement || []).map((i) => i.url);
    const expected = PAGES.filter((p) => p.kind === 'article').map((p) => p.url);
    ok(listed.length === expected.length && expected.every((u) => listed.includes(u)), at('CollectionPage ItemList must list every article'));
    for (const u of expected) ok(html.includes(`href="${u.replace('https://duker.me', '')}"`), at(`articles index must link ${u}`));
  }
  const person = graph.find((n) => n['@type'] === 'Person') || {};
  persons.push(JSON.stringify(person));
  ok(person.name === FULL, at(`Person.name must be "${FULL}"`));
  ok(person.alternateName === 'Emmanuel Duke', at('Person.alternateName must be "Emmanuel Duke"'));
  const site = graph.find((n) => n['@type'] === 'WebSite') || {};
  ok(site.name === FULL && site.url === 'https://duker.me/', at('WebSite name/url'));
  ok(Array.isArray(person.sameAs) && person.sameAs.every((u) => u.startsWith('https://')), at('Person.sameAs must be https URLs'));
  for (const u of person.sameAs || []) ok(html.includes(u.split('?')[0]), at(`sameAs ${u} is not linked visibly on the page`));
  const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList');
  if (crumbs) crumbs.itemListElement.forEach((c, i) => ok(c.position === i + 1 && c.item.startsWith('https://duker.me/'), at('breadcrumb positions/URLs')));

  // Company links
  for (const u of ['https://dukersltd.com/', 'https://tegerai.tech/', 'https://transly.software/'])
    ok(html.includes(`href="${u}"`), at(`missing link to ${u}`));

  // CSP: every inline executable script must be hash-allowed
  const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  ok(csp, at('missing CSP meta'));
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const h = createHash('sha256').update(m[1]).digest('base64');
    ok(csp.includes(`'sha256-${h}'`), at(`inline script hash not in CSP: sha256-${h}`));
  }
  ok(!/\son[a-z]+="/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), at('inline event handler attributes are blocked by the CSP'));

  // Local references exist
  const refs = [...html.matchAll(/\s(src|href|srcset)="([^"]+)"/g)].flatMap((m) => m[1] === 'srcset' ? m[2].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[2]]);
  for (const r of refs) {
    if (/^(https?:|mailto:|data:|#)/.test(r)) continue;
    const clean = r.split('#')[0].split('?')[0];
    const f = clean.endsWith('/') ? clean + 'index.html' : clean;
    ok(existsSync(local(f)), at(`missing local file: ${r}`));
  }

  // ids, headings, images, links
  const idList = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  allIds[pg.url] = idList;
  const dupes = idList.filter((v, i) => idList.indexOf(v) !== i);
  ok(!dupes.length, at(`duplicate ids: ${dupes}`));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) ok(idList.includes(m[1]), at(`broken in-page anchor #${m[1]}`));
  const hs = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  ok(hs.filter((h) => h === 1).length === 1, at('expected exactly one h1'));
  hs.forEach((h, i) => { if (i && h > hs[i - 1] + 1) fails.push(at(`heading level skips from h${hs[i - 1]} to h${h}`)); });
  for (const m of body.matchAll(/<img\b[^>]*>/g)) {
    const t = m[0], alt = attr(t, 'alt');
    ok(alt !== undefined, at(`img without alt: ${t.slice(0, 80)}`));
    ok(attr(t, 'width') && attr(t, 'height'), at(`img without width/height: ${t.slice(0, 80)}`));
    if (/portrait|headshot/.test(t)) ok(alt && alt.includes(FULL), at(`photo alt text should name ${FULL}: ${t.slice(0, 80)}`));
  }
  for (const m of html.matchAll(/href="(http:[^"]+)"/g)) fails.push(at(`insecure link ${m[1]}`));
  ok(!/(api[_-]?key|secret|token|password)\s*[:=]/i.test(html), at('possible secret'));
}

// Cross-page consistency
ok(new Set(persons).size === 1, 'Person JSON-LD must be identical on every page');
for (const pg of PAGES) {
  for (const m of read(pg.file).matchAll(/href="\/(?:about\/)?#([^"]+)"/g)) {
    const target = m[0].includes('/about/#') ? 'https://duker.me/about/' : 'https://duker.me/';
    ok(allIds[target].includes(m[1]), `${pg.file}: link to missing anchor ${m[0]}`);
  }
}
ok(read('index.html').includes('href="/about/"'), 'homepage must link to the About page');
ok(read('index.html').includes('href="/articles/"'), 'homepage must link to the articles index');
for (const m of read('404.html').matchAll(/href="\/#([^"]+)"/g)) ok(allIds['https://duker.me/'].includes(m[1]), `404 links to missing anchor #${m[1]}`);
ok(!/photoOk|photoMissing/.test(read('assets/js/site.js')), 'stale photo handlers referenced');

// robots + sitemap + manifest + 404 + CNAME
const robots = read('robots.txt');
ok(/User-agent: \*\s+Allow: \//.test(robots) && !/^Disallow: \/\s*$/m.test(robots), 'robots.txt must allow crawling');
ok(robots.includes('Sitemap: https://duker.me/sitemap.xml'), 'robots.txt must reference the sitemap');
const sm = read('sitemap.xml');
ok(/^<\?xml version="1.0" encoding="UTF-8"\?>/.test(sm) && sm.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap header/namespace');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(locs.length === PAGES.length && PAGES.every((p) => locs.includes(p.url)), `sitemap URLs must equal the canonical pages (${locs.length} vs ${PAGES.length})`);
for (const m of sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) ok(/^\d{4}-\d{2}-\d{2}$/.test(m[1]), `bad lastmod ${m[1]}`);
for (const m of sm.matchAll(/<image:loc>https:\/\/duker\.me\/([^<]+)<\/image:loc>/g)) ok(existsSync(path.join(root, m[1])), `sitemap image missing ${m[1]}`);
const man = JSON.parse(read('site.webmanifest'));
for (const i of man.icons) ok(existsSync(path.join(root, i.src.replace(/^\//, ''))), `manifest icon missing ${i.src}`);
ok(/<meta name="robots" content="noindex/.test(read('404.html')), '404 must be noindex');
ok(read('CNAME').trim() === 'duker.me', 'CNAME must be duker.me');

// Atom feed: one entry per local article, absolute links, listed in robots.txt and linked from every page
const feed = read('feed.xml');
const articleUrls = PAGES.filter((p) => p.kind === 'article').map((p) => p.url);
const entryIds = [...feed.matchAll(/<entry>[\s\S]*?<id>([^<]+)<\/id>/g)].map((m) => m[1]);
ok(entryIds.length === articleUrls.length && articleUrls.every((u) => entryIds.includes(u)), `feed.xml must have one entry per article (${entryIds.length} vs ${articleUrls.length})`);
ok(!/(href|src)=&quot;\//.test(feed), 'feed.xml content must use absolute links');
ok(robots.includes('Sitemap: https://duker.me/feed.xml'), 'robots.txt must list feed.xml');
for (const pg of PAGES) ok(read(pg.file).includes('<link rel="alternate" type="application/atom+xml"'), `${pg.file}: missing feed link`);

// IndexNow: the key file served at the site root must match the workflow's key
const wf = read('.github/workflows/indexnow.yml');
const key = (wf.match(/KEY: ([0-9a-f]{32})/) || [])[1];
ok(key && existsSync(path.join(root, `${key}.txt`)) && read(`${key}.txt`) === key, 'IndexNow key file must exist at /<key>.txt with the key as its only content');

// rel="me" on visible links to every sameAs profile (home + about)
for (const f of ['index.html', 'about/index.html']) {
  const h = read(f);
  for (const u of JSON.parse(persons[0]).sameAs) ok(new RegExp(`href="${u.split('?')[0].replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[^"]*" rel="me"`).test(h), `${f}: profile link ${u} needs rel="me"`);
}

if (fails.length) { console.error(fails.map((f) => '✗ ' + f).join('\n')); process.exit(1); }
console.log(`✓ static checks passed (${PAGES.length} pages, sitemap, robots, structured data, CSP)`);
