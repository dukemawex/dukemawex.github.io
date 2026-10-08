// Regenerates the social card and app icons from the portrait and favicon.svg.
// Usage: node scripts/make-images.mjs  (needs playwright-core; Chromium at /opt/pw-browsers or PW_CHROMIUM)
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (f) => readFileSync(path.join(root, f)).toString('base64');
const portrait = `data:image/jpeg;base64,${b64('assets/photos/portrait.jpg')}`;
const svg = readFileSync(path.join(root, 'favicon.svg'), 'utf8');

const og = `<!doctype html><html><head><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:Inter,sans-serif;color:#eaf0f7;overflow:hidden;
    background:radial-gradient(60% 80% at 15% 10%,rgba(94,179,246,.28),transparent 60%),radial-gradient(50% 70% at 70% 100%,rgba(183,156,255,.22),transparent 60%),#0b0f16;
    display:grid;grid-template-columns:1fr 420px;align-items:center;padding:0 0 0 72px}
  .k{font-family:'DejaVu Serif',Georgia,serif;font-style:italic;color:#7ee0c0;font-size:30px;margin-bottom:14px}
  h1{font-size:84px;font-weight:850;letter-spacing:-3px;line-height:1}
  ul{list-style:none;padding:0;margin:30px 0 0;display:flex;flex-wrap:wrap;gap:12px;max-width:640px}
  li{font-size:24px;font-weight:600;padding:9px 18px;border:1.5px solid rgba(234,240,247,.22);border-radius:999px;color:#cfd9e6}
  .u{margin-top:40px;font-size:26px;font-weight:700;color:#5eb3f6;letter-spacing:-.3px}
  .p{height:630px;position:relative}
  .p img{width:100%;height:100%;object-fit:cover;object-position:50% 25%}
  .p::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0b0f16 0,rgba(11,15,22,0) 30%)}
</style></head><body>
  <div><p class="k">duker.me</p><h1>Emmanuel Duke</h1>
  <ul><li>AI Builder</li><li>Mechanical Engineer</li><li>Technology Entrepreneur</li><li>Researcher</li></ul>
  <p class="u">Founder, Dukers LTD</p></div>
  <div class="p"><img src="${portrait}" alt=""></div>
</body></html>`;

const icon = (size, pad = 0) => `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:${pad ? '#0b0f16' : 'transparent'};display:grid;place-items:center}
  svg{width:${size - pad * 2}px;height:${size - pad * 2}px}</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const shot = async (html, w, h, out, type = 'png', omitBackground = false) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type, quality: type === 'jpeg' ? 86 : undefined, omitBackground });
  writeFileSync(path.join(root, out), buf);
  await page.close();
};
await shot(og, 1200, 630, 'assets/og/og-default.jpg', 'jpeg');
await shot(icon(180, 0), 180, 180, 'apple-touch-icon.png', 'png', true);
await shot(icon(192, 0), 192, 192, 'assets/icons/icon-192.png', 'png', true);
await shot(icon(512, 0), 512, 512, 'assets/icons/icon-512.png', 'png', true);
await shot(icon(512, 52), 512, 512, 'assets/icons/icon-maskable-512.png');
await shot(icon(32, 0), 32, 32, 'assets/icons/favicon-32.png', 'png', true);
await browser.close();
console.log('images written');
