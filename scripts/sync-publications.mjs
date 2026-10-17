// Syncs content/publications.json with the public ORCID record (Google Scholar has no API and forbids scraping;
// ORCID carries the same works and has an open API). Fills blank fields and appends new works; never overwrites
// a non-empty field, so manual edits win. DOIs without an ORCID entry are left alone.
// Usage: node scripts/sync-publications.mjs   (exit 0; prints what changed)
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'content/publications.json');
const data = JSON.parse(readFileSync(file, 'utf8'));
const norm = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const getJson = async (url, headers = {}) => {
  const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'duker.me publication sync (mailto:emmanuel.duke@dukersltd.com)', ...headers } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
};

// Author list from the DOI's registry (DataCite for Zenodo/figshare, Crossref otherwise), as "M. N. Eke, E. E. Duke"
const initials = (given = '') => given.split(/[\s.-]+/).filter(Boolean).map((p) => p[0].toUpperCase() + '.').join(' ');
async function authorsForDoi(doi) {
  try {
    const a = (await getJson(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`)).data.attributes;
    return a.creators.map((c) => (c.familyName ? `${initials(c.givenName)} ${c.familyName}`.trim() : c.name)).join(', ');
  } catch {}
  try {
    const m = (await getJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)).message;
    return (m.author || []).map((a) => `${initials(a.given)} ${a.family}`.trim()).join(', ');
  } catch {}
  return '';
}

const works = (await getJson(`https://pub.orcid.org/v3.0/${data.orcid}/works`)).group.map((g) => {
  const w = g['work-summary'][0];
  const dois = (w['external-ids']?.['external-id'] || []).filter((x) => x['external-id-type'] === 'doi').map((x) => x['external-id-value'].toLowerCase());
  return { title: w.title.title.value, year: w['publication-date']?.year?.value || '', venue: w['journal-title']?.value || '', doi: dois[0] || '' };
});

const changes = [];
for (const w of works) {
  let p = data.publications.find((x) => norm(x.title) === norm(w.title));
  if (!p) {
    p = { title: w.title, year: w.year, venue: w.venue, authors: w.doi ? await authorsForDoi(w.doi) : '', doi: w.doi, topic: '' };
    data.publications.push(p);
    changes.push(`added "${w.title}"`);
    continue;
  }
  for (const k of ['doi', 'venue', 'year']) {
    if (!p[k] && w[k]) { p[k] = w[k]; changes.push(`${k} for "${p.title.slice(0, 50)}…" → ${w[k]}`); }
  }
  if (!p.authors && p.doi) { const a = await authorsForDoi(p.doi); if (a) { p.authors = a; changes.push(`authors for "${p.title.slice(0, 50)}…"`); } }
}

if (changes.length) {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`publications.json updated from ORCID ${data.orcid}:\n  ` + changes.join('\n  '));
} else {
  console.log(`publications.json already in sync with ORCID ${data.orcid} (${works.length} works)`);
}
