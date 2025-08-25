// js/site.js
(() => {
  // Mark JS active (lets CSS do `.js .reveal { ... }`)
  document.documentElement.classList.add('js');

  /* ---------- Mobile nav ---------- */
  const btn = document.querySelector('.nav-toggle');
  if (btn){
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('nav-open', !open);
    });
  }

  /* ---------- Header height -> CSS var (for mobile drawer top) ---------- */
  function setHeaderHeightVar(){
    const header = document.querySelector('header');
    if (!header) return;
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-height', `${h}px`);
  }
  window.addEventListener('DOMContentLoaded', setHeaderHeightVar);
  window.addEventListener('load', setHeaderHeightVar);
  window.addEventListener('resize', setHeaderHeightVar);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setHeaderHeightVar).catch(() => {});
  }

  /* ---------- Scroll reveal ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced){
    // Observe any element marked .reveal (works across all pages)
    const revealables = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealables.forEach(el => io.observe(el));
  }

  /* ---------- Page transitions (progressive + fallback) ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;

    // Ignore external/new-tab/download/hash-only navigations
    const sameOrigin = a.origin === location.origin;
    const hashOnly = a.pathname === location.pathname && a.hash && a.hash !== location.hash;
    if (!sameOrigin || a.target === '_blank' || a.hasAttribute('download') || hashOnly) return;

    // Allow opt-out
    if (a.dataset.noTransition === 'true') return;

    // Optional variant (e.g., data-transition="wipe") if you add CSS for it
    const variant = a.dataset.transition;
    if (variant) document.documentElement.classList.add(variant);

    // View Transitions API
    if (document.startViewTransition) {
      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = a.href;
      }).finished.finally(() => {
        if (variant) document.documentElement.classList.remove(variant);
      });
      return;
    }

    // Fallback fade
    e.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(() => { window.location.href = a.href; }, 200);
  });

  // Clean fallback class on bfcache restore
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.documentElement.classList.remove('leaving');
  });
})();
