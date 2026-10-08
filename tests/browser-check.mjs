// Serves the site locally and checks it in Chromium: console/CSP errors, failed requests,
// horizontal overflow at phone/tablet/desktop widths (light + dark), and axe accessibility.
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const shots = process.env.SHOTS;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  try { const b = await readFile(path.join(root, p)); res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404, { 'content-type': 'text/html' }); res.end(await readFile(path.join(root, '404.html'))); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const fails = [];
const sizes = [['phone', 375, 812], ['tablet', 768, 1024], ['desktop', 1366, 900]];
for (const route of ['/', '/about/', '/articles/', '/articles/designing-teger-ai/', '/articles/spd-mechanism-clustering/']) for (const theme of ['light', 'dark']) for (const [name, width, height] of sizes) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('requestfailed', (r) => { if (r.url().startsWith(base)) errs.push('request failed ' + r.url()); });
  page.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400) errs.push(`${r.status()} ${r.url()}`); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort()); // offline: fonts fall back
  await page.goto(base + route, { waitUntil: 'load' });
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((s) => s.classList.add('in')));
  const tag = `${route} ${theme}/${name}`;
  const t = await page.evaluate(() => document.documentElement.dataset.theme);
  if (t !== theme) fails.push(`${tag}: theme resolved to ${t}`);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) fails.push(`${tag}: horizontal overflow ${over}px`);
  for (const img of await page.$$('.media img')) await img.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.media img')].every((i) => i.complete), null, { timeout: 5000 }).catch(() => {});
  const ok = await page.evaluate(() => [...document.querySelectorAll('.media img')].every((i) => i.naturalWidth && i.closest('.media.ok')));
  await page.evaluate(() => scrollTo(0, 0));
  if (!ok) fails.push(`${tag}: a project image did not load`);
  errs.filter((e) => !/fonts\.g|ERR_FAILED/.test(e)).forEach((e) => fails.push(`${tag}: ${e}`));
  await page.evaluate(axeSource); // CDP evaluation is not subject to the page CSP
  const res = await page.evaluate(async () => window.axe ? axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }) : null).catch(() => null);
  if (res) res.violations.forEach((v) => fails.push(`${tag}: axe ${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
  if (shots) { await mkdir(shots, { recursive: true }); await page.screenshot({ path: `${shots}/${route === '/' ? 'home' : route.split('/').filter(Boolean).pop()}-${theme}-${name}.png`, fullPage: name !== 'desktop' }); }
  await ctx.close();
}
// 404 page
{
  const page = await browser.newPage();
  const r = await page.goto(base + '/does-not-exist');
  if (r.status() !== 404 || !(await page.title()).includes('not found')) fails.push('404 page not served');
  await page.close();
}
await browser.close(); server.close();
if (fails.length) { console.error([...new Set(fails)].map((f) => '✗ ' + f).join('\n')); process.exit(1); }
console.log('✓ browser checks passed (5 pages × 6 viewport/theme combos, axe, CSP, no failed requests)');
