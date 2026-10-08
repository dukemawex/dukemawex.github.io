'use strict';
document.getElementById('yr').textContent = new Date().getFullYear();

// Reveal on scroll (opacity + 8px; CSS disables it under prefers-reduced-motion)
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}

// Photo slots: fade each image in once decoded; drop the <picture> if the file is missing
document.querySelectorAll('.media img').forEach(img => {
  const ok = () => img.closest('.media').classList.add('ok');
  const missing = () => (img.closest('picture') || img).remove();
  if (img.complete) { img.naturalWidth ? ok() : missing(); return; }
  img.addEventListener('load', ok, {once: true});
  img.addEventListener('error', missing, {once: true});
});

// Current section in nav
const links = [...document.querySelectorAll('.navlinks a')];
const navBox = document.querySelector('.navlinks');
const byId = Object.fromEntries(links.map(a => [a.getAttribute('href').slice(1), a]));
const setCurrent = (id) => {
  links.forEach(a => a.removeAttribute('aria-current'));
  const a = byId[id];
  if (!a) return;
  a.setAttribute('aria-current', 'true');
  if (navBox.scrollWidth > navBox.clientWidth) {
    const target = a.offsetLeft - (navBox.clientWidth - a.offsetWidth) / 2;
    navBox.scrollTo({left: target, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
};
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) setCurrent(e.target.id); }),
    {rootMargin: '-40% 0px -55% 0px'});
  Object.keys(byId).forEach(id => { const el = document.getElementById(id); el && spy.observe(el); });
  const top = document.getElementById('top');
  new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) setCurrent(null); }), {rootMargin: '-40% 0px -55% 0px'}).observe(top);
}

// "Read more" for clamped timeline descriptions (full text is always in the DOM)
const clamps = [...document.querySelectorAll('.tl-b .clamp')];
clamps.forEach(p => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'more'; b.textContent = 'Read more'; b.setAttribute('aria-expanded', 'false');
  b.addEventListener('click', () => {
    const open = p.classList.toggle('open');
    b.setAttribute('aria-expanded', String(open));
    b.textContent = open ? 'Show less' : 'Read more';
  });
  p.after(b);
});
const checkClamps = () => clamps.forEach(p => {
  if (p.classList.contains('open')) return;
  p.nextElementSibling.classList.toggle('on', p.scrollHeight > p.clientHeight + 1);
});
(document.fonts ? document.fonts.ready : Promise.resolve()).then(checkClamps);
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(checkClamps, 150); });

// ---------- Interactive layer ----------
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const smooth = () => reduceMotion.matches ? 'auto' : 'smooth';

// Toast + clipboard
const toastEl = document.querySelector('.toast');
let toastT;
const toast = (msg) => {
  toastEl.querySelector('span').textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
};
const copy = async (text, msg) => {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = Object.assign(document.createElement('textarea'), {value: text});
    ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); } finally { ta.remove(); }
  }
  toast(msg);
};
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copy(b.dataset.copy, b.dataset.toast || 'Copied')));

// Reading progress + back to top
const navEl = document.querySelector('nav');
const toTop = document.querySelector('.to-top');
let ticking = false;
const onScroll = () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    navEl.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    toTop.classList.toggle('show', scrollY > innerHeight * 1.2);
    ticking = false;
  });
};
addEventListener('scroll', onScroll, {passive: true}); onScroll();
toTop.addEventListener('click', () => { scrollTo({top: 0, behavior: smooth()}); document.querySelector('.brand').focus({preventScroll: true}); });

// Hero stats count up once
if (!reduceMotion.matches) {
  document.querySelectorAll('.stat b').forEach((b, i) => {
    const m = b.textContent.match(/^(\d+)(.*)$/); if (!m) return;
    const end = +m[1], suffix = m[2], final = b.textContent;
    b.setAttribute('aria-label', final);
    const t0 = performance.now() + 150 + i * 110, dur = 1000;
    b.textContent = '0' + suffix;
    const step = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(step); else b.textContent = final;
    };
    requestAnimationFrame(step);
  });
}

// Portrait tilt + card spotlight (fine pointers, motion allowed)
const portraitFrame = document.querySelector('.portrait .frame');
if (portraitFrame) {
  portraitFrame.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const r = portraitFrame.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    portraitFrame.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
    portraitFrame.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
  });
  portraitFrame.addEventListener('pointerleave', () => { portraitFrame.style.removeProperty('--rx'); portraitFrame.style.removeProperty('--ry'); });
}
document.querySelectorAll('.work').forEach(grid => grid.addEventListener('pointermove', (e) => {
  if (!finePointer.matches) return;
  const card = e.target.closest('.pcard'); if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  card.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

// Project filters
const cards = [...document.querySelectorAll('.pcard[data-cat]')];
const chips = [...document.querySelectorAll('.filters .chip')];
const filterStatus = document.getElementById('filter-status');
const inCat = (card, f) => f === 'all' || card.dataset.cat.split(' ').includes(f);
chips.forEach(c => { c.querySelector('.n').textContent = cards.filter(card => inCat(card, c.dataset.f)).length; });
const applyFilter = (f) => {
  chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.f === f)));
  let shown = 0;
  cards.forEach(card => {
    const on = inCat(card, f);
    card.classList.remove('pop');
    card.hidden = !on;
    if (on) { shown++; void card.offsetWidth; card.classList.add('pop'); }
  });
  document.querySelectorAll('.work').forEach(g => g.classList.toggle('is-empty', !g.querySelector('.pcard:not([hidden])')));
  const label = chips.find(c => c.dataset.f === f).firstChild.textContent.trim();
  filterStatus.textContent = f === 'all' ? `Showing all ${shown} projects` : `Showing ${shown} ${label} project${shown === 1 ? '' : 's'}`;
};
chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.f)));

// Copy citation for each publication
const COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
document.querySelectorAll('.pub').forEach(pub => {
  const yr = pub.closest('.pub-year').querySelector('.yr').textContent.trim();
  const year = /^\d{4}$/.test(yr) ? yr : 'n.d.';
  const title = pub.querySelector('h4').textContent.trim();
  const auth = pub.querySelector('.auth').textContent.trim();
  const doi = pub.querySelector('a.doi');
  let venue = pub.querySelector('.meta').textContent.trim().replace(new RegExp('[,\\s]*' + year + '$'), '');
  if (doi) venue = doi.href;
  const cite = `${auth} (${year}). ${title}. ${venue}.`.replace(/\.\.$/, '.');
  const tools = document.createElement('div'); tools.className = 'pub-tools';
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'icon-btn'; b.innerHTML = COPY_ICON + 'Copy citation';
  b.setAttribute('aria-label', 'Copy citation: ' + title);
  b.addEventListener('click', () => copy(cite, 'Citation copied'));
  tools.append(b); pub.append(tools);
});

// Command palette
const pal = document.getElementById('palette');
const palQ = document.getElementById('pal-q');
const palList = document.getElementById('pal-list');
const palOpenBtn = document.getElementById('pal-open');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
document.getElementById('pal-kbd').textContent = isMac ? '⌘K' : 'Ctrl K';
const IC = {
  sec: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  proj: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/></svg>',
  pub: '<svg viewBox="0 0 24 24"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h6"/></svg>',
  act: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>'
};
const goTo = (el) => { el.scrollIntoView({behavior: smooth(), block: 'start'}); };
const items = [];
[['top', 'Home'], ...links.map(a => [a.getAttribute('href').slice(1), a.textContent.trim()]), ['education', 'Education']]
  .forEach(([id, label]) => { const el = document.getElementById(id); el && items.push({g: 'Sections', label, hint: 'Section', ic: IC.sec, run: () => goTo(el)}); });
cards.forEach(card => {
  const a = card.querySelector('h3 a');
  items.push({g: 'Projects', label: a.textContent.trim(), hint: card.querySelector('.tag').textContent.trim(), kw: card.querySelector('p').textContent, ic: IC.proj, run: () => openProject(card)});
});
document.querySelectorAll('.venture').forEach(v => {
  const a = v.querySelector('h3 a');
  items.push({g: 'Ventures', label: a.textContent.trim(), hint: new URL(a.href).hostname, kw: v.querySelector('p').textContent, ic: IC.link, run: () => { location.href = a.href; }});
});
document.querySelectorAll('.pub').forEach(pub => {
  items.push({g: 'Research', label: pub.querySelector('h4').textContent.trim(), hint: pub.closest('.pub-year').querySelector('.yr').textContent.replace('Undated', '').trim(), kw: pub.querySelector('.auth').textContent, ic: IC.pub,
    run: () => { pub.scrollIntoView({behavior: smooth(), block: 'center'}); pub.classList.remove('flash'); void pub.offsetWidth; pub.classList.add('flash'); }});
});
items.push(
  {g: 'Actions', label: 'Copy email address', hint: 'Email', ic: IC.act, run: () => copy('duke.emmanueleffiom@gmail.com', 'Email address copied')},
  {g: 'Actions', label: 'Send an email', hint: 'Email', ic: IC.link, run: () => { location.href = 'mailto:duke.emmanueleffiom@gmail.com'; }},
  ...[...document.querySelectorAll('.links a[href^="http"]')].map(a => ({g: 'Actions', label: 'Open ' + a.textContent.trim(), hint: new URL(a.href).hostname.replace('www.', ''), ic: IC.link, run: () => { location.href = a.href; }}))
);
let results = [], sel = 0;
const render = () => {
  const q = palQ.value.trim().toLowerCase();
  results = !q ? items.filter(i => i.g !== 'Research') : items
    .map(i => { const l = i.label.toLowerCase(), k = (i.kw || '').toLowerCase() + ' ' + (i.hint || '').toLowerCase();
      const score = l.startsWith(q) ? 0 : l.includes(q) ? 1 : k.includes(q) ? 2 : -1; return {i, score}; })
    .filter(x => x.score >= 0).sort((a, b) => a.score - b.score).map(x => x.i);
  sel = Math.min(sel, Math.max(0, results.length - 1));
  if (!results.length) { palList.innerHTML = `<li class="pal-empty" role="presentation">No results for “${palQ.value.replace(/[<&>]/g, '')}”</li>`; palQ.removeAttribute('aria-activedescendant'); return; }
  let html = '', last = '';
  const order = ['Sections', 'Ventures', 'Projects', 'Research', 'Actions'];
  results.sort((a, b) => order.indexOf(a.g) - order.indexOf(b.g));
  results.forEach((r, n) => {
    if (r.g !== last) { html += `<li class="pal-group" role="presentation">${r.g}</li>`; last = r.g; }
    const esc = (t) => t.replace(/[<&>"]/g, c => ({'<': '&lt;', '&': '&amp;', '>': '&gt;', '"': '&quot;'}[c]));
    html += `<li class="pal-item" role="option" id="pal-${n}" data-n="${n}" aria-selected="${n === sel}"><span class="ic" aria-hidden="true">${r.ic}</span><span class="lb">${esc(r.label)}</span><span class="ht">${esc(r.hint || '')}</span></li>`;
  });
  palList.innerHTML = html;
  palQ.setAttribute('aria-activedescendant', 'pal-' + sel);
};
const highlight = (n) => {
  sel = (n + results.length) % results.length;
  palList.querySelectorAll('.pal-item').forEach(li => li.setAttribute('aria-selected', String(+li.dataset.n === sel)));
  palQ.setAttribute('aria-activedescendant', 'pal-' + sel);
  palList.querySelector(`#pal-${sel}`)?.scrollIntoView({block: 'nearest'});
};
const runSel = (n = sel) => { const r = results[n]; if (!r) return; pal.close(); setTimeout(r.run, 30); };
const openPal = () => { if (pal.open) return; palQ.value = ''; sel = 0; render(); pal.showModal(); palQ.focus(); };
palOpenBtn.addEventListener('click', openPal);
palQ.addEventListener('input', () => { sel = 0; render(); });
palQ.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); highlight(sel + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(sel - 1); }
  else if (e.key === 'Enter') { e.preventDefault(); runSel(); }
  else if (e.key === 'Escape') { e.preventDefault(); pal.close(); }
});
palList.addEventListener('click', (e) => { const li = e.target.closest('.pal-item'); li && runSel(+li.dataset.n); });
palList.addEventListener('pointermove', (e) => { const li = e.target.closest('.pal-item'); if (li && +li.dataset.n !== sel) highlight(+li.dataset.n); });
pal.addEventListener('click', (e) => { if (e.target === pal) pal.close(); });
pal.addEventListener('close', () => palOpenBtn.focus({preventScroll: true}));
addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.open ? pal.close() : openPal(); }
  else if (e.key === '/' && !typing && !pal.open) { e.preventDefault(); openPal(); }
});

// ---------- Lively layer ----------
const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeBtn = document.getElementById('theme-btn');
const syncTheme = () => {
  const dark = root.dataset.theme === 'dark';
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeMeta.setAttribute('content', dark ? '#0b0f16' : '#f6f8fc');
};
syncTheme();
themeBtn.addEventListener('click', (e) => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const apply = () => { root.dataset.theme = next; syncTheme(); try { localStorage.setItem('theme', next); } catch {} };
  if (!document.startViewTransition || reduceMotion.matches) { apply(); return; }
  const r = themeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate({clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`]},
      {duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)'});
  });
});

// Staggered 3D rise for items inside each revealed section
[['.ventures', '.venture'], ['.work', '.pcard'], ['.ruled', ':scope > div'], ['.tline', '.tl'], ['.pubs', '.pub']].forEach(([g, item]) => {
  document.querySelectorAll(g).forEach(group => group.querySelectorAll(item).forEach((el, i) => {
    el.classList.add('rise'); el.style.setProperty('--i', Math.min(i, 8));
  }));
});
// Drop the .rise state once a section has finished revealing (no reliance on transitionend)
const settle = (sec) => setTimeout(() => sec.querySelectorAll('.rise').forEach(el => { el.classList.remove('rise'); el.style.removeProperty('--i'); }), 1700);
document.querySelectorAll('.reveal').forEach(sec => {
  if (sec.classList.contains('in')) { settle(sec); return; }
  const mo = new MutationObserver(() => { if (sec.classList.contains('in')) { mo.disconnect(); settle(sec); } });
  mo.observe(sec, {attributes: true, attributeFilter: ['class']});
});

// 3D tilt + shine on project cards (fine pointers)
cards.forEach(card => {
  const shine = document.createElement('span'); shine.className = 'shine'; shine.setAttribute('aria-hidden', 'true'); card.append(shine);
  card.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || reduceMotion.matches || card.classList.contains('rise')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    const max = card.classList.contains('compact') ? 5 : 8;
    card.classList.add('tilt');
    card.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(6px)`;
    card.style.setProperty('--sx', (100 - (x + .5) * 100).toFixed(1) + '%');
  });
  card.addEventListener('pointerleave', () => { card.classList.remove('tilt'); card.style.transform = ''; });
});

// Project popup
const pm = document.getElementById('pmodal');
const pmBox = pm.querySelector('.pm');
const pmMedia = pm.querySelector('.pm-media');
const pmLink = document.getElementById('pm-link');
let pmCard = null, pmReturn = null;
const visibleCards = () => cards.filter(c => !c.hidden);
const fillProject = (card) => {
  pmCard = card;
  const a = card.querySelector('h3 a');
  const media = card.querySelector('.media').cloneNode(true);
  media.querySelectorAll('.dev-hint').forEach(n => n.remove());
  media.removeAttribute('aria-hidden');
  media.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.removeAttribute('onload'); img.removeAttribute('onerror'); });
  pmMedia.replaceChildren(media);
  document.getElementById('pm-tag').textContent = card.querySelector('.tag').textContent;
  document.getElementById('pm-title').textContent = a.textContent;
  document.getElementById('pm-desc').textContent = card.querySelector('p').textContent;
  pmLink.href = a.href;
  pmLink.firstChild.textContent = /github\.com/.test(a.href) ? 'View on GitHub ' : 'Visit site ';
  const list = visibleCards();
  document.getElementById('pm-count').textContent = `${list.indexOf(card) + 1} / ${list.length}`;
};
const openProject = (card) => {
  pmReturn = document.activeElement;
  fillProject(card);
  if (!pm.open) pm.showModal();
  pm.querySelector('.pm-x').focus();
};
const stepProject = (d) => {
  const list = visibleCards(); if (!pmCard || list.length < 2) return;
  fillProject(list[(list.indexOf(pmCard) + d + list.length) % list.length]);
  pmBox.style.setProperty('--dir', (d > 0 ? 14 : -14) + 'deg');
  pmBox.classList.remove('swap'); void pmBox.offsetWidth; pmBox.classList.add('swap');
};
cards.forEach(card => card.querySelector('h3 a').addEventListener('click', (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault(); openProject(card);
}));
pm.querySelector('.pm-x').addEventListener('click', () => pm.close());
document.getElementById('pm-prev').addEventListener('click', () => stepProject(-1));
document.getElementById('pm-next').addEventListener('click', () => stepProject(1));
pm.addEventListener('click', (e) => { if (e.target === pm) pm.close(); });
pm.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); stepProject(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); stepProject(-1); }
});
pm.addEventListener('close', () => { pmReturn && pmReturn.focus && pmReturn.focus({preventScroll: true}); });
let touchX = null;
pmBox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, {passive: true});
pmBox.addEventListener('touchend', (e) => {
  if (touchX === null) return; const dx = e.changedTouches[0].clientX - touchX; touchX = null;
  if (Math.abs(dx) > 60) stepProject(dx < 0 ? 1 : -1);
}, {passive: true});

// Mobile menu sheet
const menuBtn = document.getElementById('menu-btn');
links.forEach((a, i) => a.style.setProperty('--n', i));
const setMenu = (open) => { navBox.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); };
menuBtn.addEventListener('click', () => setMenu(!navBox.classList.contains('open')));
links.forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', (e) => { if (navBox.classList.contains('open') && !e.target.closest('#navlinks, #menu-btn')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && navBox.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
