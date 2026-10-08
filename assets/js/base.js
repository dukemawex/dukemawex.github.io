'use strict';
// Shared by every page: footer year, theme toggle, mobile menu sheet.
(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Theme toggle (circular reveal where View Transitions are supported)
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeBtn = document.getElementById('theme-btn');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeMeta.setAttribute('content', dark ? '#0b0f16' : '#f6f8fc');
  };
  if (themeBtn) {
    syncTheme();
    themeBtn.addEventListener('click', () => {
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
  }

  // Mobile menu sheet
  const navBox = document.getElementById('navlinks');
  const menuBtn = document.getElementById('menu-btn');
  if (!navBox || !menuBtn) return;
  const links = [...navBox.querySelectorAll('a')];
  links.forEach((a, i) => a.style.setProperty('--n', i));
  const setMenu = (open) => { navBox.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', () => setMenu(!navBox.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (e) => { if (navBox.classList.contains('open') && !e.target.closest('#navlinks, #menu-btn')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && navBox.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
})();
