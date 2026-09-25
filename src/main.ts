function initNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav__dropdown-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement?.classList.toggle('is-open');
    });
  });
}

function initFooterYear(): void {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function initHowSteps(): void {
  const steps = document.querySelectorAll<HTMLButtonElement>('#how-steps .step');
  const details = document.querySelectorAll<HTMLElement>('[data-step-detail]');
  if (steps.length === 0) return;

  steps.forEach((step) => {
    step.addEventListener('click', () => {
      const target = step.dataset.step;
      steps.forEach((s) => s.classList.toggle('is-active', s === step));
      details.forEach((d) => d.classList.toggle('is-active', d.dataset.stepDetail === target));
    });
  });
}

function initCurrentNavLink(): void {
  const path = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('.nav__links > a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '/') return;
    if (path === href || path.startsWith(`${href}/`)) a.classList.add('is-current');
  });
}

function initScrollEffects(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;
  const update = (): void => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

const REVEAL_SELECTORS = [
  'main .section h2',
  'main .section .eyebrow',
  '.split-section__media',
  '.cols-3 > *',
  '.layers-grid > *',
  '.cards-grid > *',
  '.checklist > li',
  '.check-list > li',
  '.faq-item',
  '.calc-sliders',
  '.calc-results',
  '.step-details',
  '.owner-quote blockquote',
  '.stat',
  '.article > *',
  '.problem__punchline',
  '.checklist__punchline',
].join(',');

function initReveal(): void {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS)).filter(
    (el) => !el.closest('.hero') && el.getBoundingClientRect().top > window.innerHeight,
  );

  // Stagger siblings that sit in the same grid so cards cascade in.
  els.forEach((el) => {
    const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
    const index = Math.min(siblings.indexOf(el), 6);
    el.style.setProperty('--reveal-delay', `${Math.max(index, 0) * 0.08}s`);
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.classList.add('is-visible');
        observer.unobserve(el);
        // Hand transform/transition back to the element's own hover styles.
        window.setTimeout(() => {
          el.classList.remove('reveal', 'is-visible');
          el.style.removeProperty('--reveal-delay');
        }, 1400);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooterYear();
  initHowSteps();
  initCurrentNavLink();
  initScrollEffects();
  initReveal();
});
