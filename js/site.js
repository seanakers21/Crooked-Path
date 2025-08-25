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

  /* ---------- Countdown (reusable) ---------- */
  // Usage 1: <div id="countdown-timer"></div>
  // Usage 2: <div data-countdown="October 31, 2025 18:00:00"></div>
  function startCountdown(el, targetDate) {
    const pad = (n) => String(n).padStart(2, '0');

    function render() {
      const now = Date.now();
      const dist = targetDate - now;

      if (dist <= 0) {
        el.textContent = "We're Open!";
        clearInterval(t);
        return;
      }

      const days = Math.floor(dist / (1000 * 60 * 60 * 24));
      const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((dist % (1000 * 60)) / 1000);

      // Prefer your existing markup style (spans)
      el.innerHTML = `
        <span>${days}d</span>
        <span>${pad(hours)}h</span>
        <span>${pad(minutes)}m</span>
        <span>${pad(seconds)}s</span>
      `;
    }

    render();
    const t = setInterval(render, 1000);
  }

  // Find a single #countdown-timer (your main use case)
  const defaultCountdownEl = document.getElementById('countdown-timer');
  if (defaultCountdownEl) {
    // Default target if not provided via data-countdown
    const attr = defaultCountdownEl.getAttribute('data-countdown');
    const target = new Date(attr || 'October 31, 2025 18:00:00').getTime();
    if (!isNaN(target)) startCountdown(defaultCountdownEl, target);
  }

  // Also support any number of elements with data-countdown
  document.querySelectorAll('[data-countdown]').forEach((el) => {
    // Skip if it's the same as the default element we handled above
    if (el === defaultCountdownEl) return;
    const dateStr = el.getAttribute('data-countdown');
    const ts = new Date(dateStr).getTime();
    if (!isNaN(ts)) startCountdown(el, ts);
  });
})();

/* ---------- Countdown (refined) ---------- */
// Looks for #countdown-timer or any [data-countdown]
(function(){
  const defaultEl = document.getElementById('countdown-timer');
  const nodes = [
    ...document.querySelectorAll('[data-countdown]'),
    ...(defaultEl ? [defaultEl] : []),
  ];

  if (!nodes.length) return;

  nodes.forEach((el) => {
    const dateStr = el.getAttribute('data-countdown') || 'October 31, 2025 18:00:00';
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return;

    const pad = (n) => String(n).padStart(2, '0');

    function render() {
      const now = Date.now();
      const dist = target - now;

      if (dist <= 0) {
        el.textContent = "We're Open!";
        el.classList.remove('urgent');
        clearInterval(t);
        return;
      }

      const days = Math.floor(dist / (1000 * 60 * 60 * 24));
      const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((dist % (1000 * 60)) / 1000);

      el.innerHTML = `
        <div class="cd-seg">
          <span class="cd-val">${days}</span>
          <span class="cd-label">days</span>
        </div>
        <div class="cd-seg">
          <span class="cd-val">${pad(hours)}</span>
          <span class="cd-label">hours</span>
        </div>
        <div class="cd-seg">
          <span class="cd-val">${pad(minutes)}</span>
          <span class="cd-label">minutes</span>
        </div>
        <div class="cd-seg">
          <span class="cd-val">${pad(seconds)}</span>
          <span class="cd-label">seconds</span>
        </div>
      `;

      // Add a gentle pulse when under 72 hours
      const seventyTwoHrs = 72 * 60 * 60 * 1000;
      el.classList.toggle('urgent', dist < seventyTwoHrs);
    }

    render();
    const t = setInterval(render, 1000);
  });
})();

// Stick the countdown chip under the header when the banner leaves view
(() => {
  const chip = document.querySelector('.countdown-chip');
  const banner = document.querySelector('.home-banner');
  if (!chip || !banner) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      chip.classList.toggle('is-stuck', !entry.isIntersecting);
    });
  }, { threshold: 0, rootMargin: '-1px 0px 0px 0px' });

  io.observe(banner);
})();
