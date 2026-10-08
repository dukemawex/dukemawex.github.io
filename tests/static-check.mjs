// Static checks for the published site: SEO metadata, structured data, CSP hash,
// local references, anchors, headings, images, robots and sitemap. No network.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const meta = (key) => { const m = html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`)); return m && m[1]; };

// Title + description
const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
ok(title.includes('Emmanuel Duke') && title.length <= 90, `title missing name or too long (${title.length})`);
const desc = meta('description') || '';
ok(desc.length >= 70 && desc.length <= 170, `meta description length ${desc.length} (want 70–170)`);
ok(/<link rel="canonical" href="https:\/\/duker\.me\/" \/>/.test(html), 'canonical must be https://duker.me/');
ok(/index, follow/.test(meta('robots') || ''), 'robots meta should allow indexing');
for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'twitter:card', 'twitter:title', 'twitter:image'])
  ok(meta(k), `missing ${k}`);
for (const k of ['og:image', 'twitter:image']) {
  const u = meta(k) || '';
  ok(u.startsWith('https://duker.me/') && existsSync(path.join(root, u.replace('https://duker.me/', ''))), `${k} must be an absolute duker.me URL to an existing file`);
}

// JSON-LD
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
ok(ld.length === 1, 'expected one JSON-LD block');
let graph = [];
try { graph = JSON.parse(ld[0][1])['@graph']; } catch (e) { fails.push('JSON-LD does not parse: ' + e.message); }
const types = graph.map((n) => n['@type']);
for (const t of ['WebSite', 'ProfilePage', 'Person', 'Organization']) ok(types.includes(t), `JSON-LD missing ${t}`);
const ids = new Set(graph.map((n) => n['@id']));
JSON.stringify(graph).replace(/\{"@id":"([^"]+)"\}/g, (_, id) => { ok(ids.has(id), `JSON-LD dangling reference ${id}`); return ''; });
const person = graph.find((n) => n['@type'] === 'Person') || {};
ok(person.name === 'Emmanuel Duke', 'Person.name should be Emmanuel Duke');
ok(Array.isArray(person.sameAs) && person.sameAs.every((u) => u.startsWith('https://')), 'Person.sameAs must be https URLs');
for (const u of person.sameAs || []) ok(html.includes(u.split('?')[0]), `sameAs ${u} is not linked visibly on the page`);

// CSP: every inline executable script must be hash-allowed
const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
ok(csp, 'missing CSP meta');
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const h = createHash('sha256').update(m[1]).digest('base64');
  ok(csp.includes(`'sha256-${h}'`), `inline script hash not in CSP: sha256-${h}`);
}
ok(!/\son[a-z]+="/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), 'inline event handler attributes are blocked by the CSP');

// Local references exist
const refs = [...html.matchAll(/\s(src|href|srcset)="([^"]+)"/g)].flatMap((m) => m[1] === 'srcset' ? m[2].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[2]]);
for (const r of refs) {
  if (/^(https?:|mailto:|data:|#)/.test(r)) continue;
  const f = r.replace(/^\//, '').split('#')[0].split('?')[0];
  ok(existsSync(path.join(root, f)), `missing local file: ${r}`);
}
const jsRefs = read('assets/js/site.js');
ok(!/photoOk|photoMissing/.test(jsRefs), 'stale photo handlers referenced');

// Anchors + ids
const idList = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupes = idList.filter((v, i) => idList.indexOf(v) !== i);
ok(!dupes.length, `duplicate ids: ${dupes}`);
for (const m of html.matchAll(/href="#([^"]+)"/g)) ok(idList.includes(m[1]), `broken in-page anchor #${m[1]}`);
for (const m of read('404.html').matchAll(/href="\/#([^"]+)"/g)) ok(idList.includes(m[1]), `404 links to missing anchor #${m[1]}`);

// Headings: one h1, no skipped levels
const body = html.slice(html.indexOf('<body'));
const hs = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
ok(hs.filter((h) => h === 1).length === 1, 'expected exactly one h1');
hs.forEach((h, i) => { if (i && h > hs[i - 1] + 1) fails.push(`heading level skips from h${hs[i - 1]} to h${h}`); });

// Images: alt + intrinsic size
for (const m of body.matchAll(/<img\b[^>]*>/g)) {
  const t = m[0];
  ok(attr(t, 'alt') !== undefined, `img without alt: ${t.slice(0, 80)}`);
  ok(attr(t, 'width') && attr(t, 'height'), `img without width/height: ${t.slice(0, 80)}`);
}

// External links are https
for (const m of html.matchAll(/href="(http:[^"]+)"/g)) fails.push(`insecure link ${m[1]}`);

// robots + sitemap + manifest + 404
const robots = read('robots.txt');
ok(/User-agent: \*\s+Allow: \//.test(robots) && !/Disallow: \/\s*$/m.test(robots), 'robots.txt must allow crawling');
ok(robots.includes('Sitemap: https://duker.me/sitemap.xml'), 'robots.txt must reference the sitemap');
const sm = read('sitemap.xml');
ok(/^<\?xml/.test(sm) && sm.includes('<loc>https://duker.me/</loc>'), 'sitemap must list https://duker.me/');
const man = JSON.parse(read('site.webmanifest'));
for (const i of man.icons) ok(existsSync(path.join(root, i.src.replace(/^\//, ''))), `manifest icon missing ${i.src}`);
ok(/<meta name="robots" content="noindex/.test(read('404.html')), '404 must be noindex');
ok(read('CNAME').trim() === 'duker.me', 'CNAME must be duker.me');

// No secrets
for (const f of ['index.html', 'assets/js/site.js'])
  ok(!/(api[_-]?key|secret|token|password)\s*[:=]/i.test(read(f)), `possible secret in ${f}`);

if (fails.length) { console.error(fails.map((f) => '✗ ' + f).join('\n')); process.exit(1); }
console.log('✓ static checks passed');
