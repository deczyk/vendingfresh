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

const MATS = [
  { name: 'Chlebomat', tagline: 'świeże 24/7', icon: '🥖', color: '#B8742A', color2: '#F2D29B' },
  { name: 'Kwiatomat', tagline: 'bukiety 24/7', icon: '🌷', color: '#C2466B', color2: '#FFD1DC' },
  { name: 'Ciastkomat', tagline: 'słodko 24/7', icon: '🧁', color: '#8E5BA8', color2: '#F6D5FF' },
  { name: 'Jajomat', tagline: 'prosto z fermy', icon: '🥚', color: '#C98A12', color2: '#FFF0C2' },
  { name: 'Seromat', tagline: 'nabiał od rolnika', icon: '🧀', color: '#2F7D4E', color2: '#F3E3A6' },
  { name: 'Wszystkomat', tagline: 'twój produkt 24/7', icon: '✨', color: '#0E5C5C', color2: '#F3E3A6' },
];

function initWrapMock(): void {
  const mock = document.querySelector<HTMLElement>('.wrapmock');
  if (!mock) return;
  const name = mock.querySelector<HTMLElement>('.wrapmock__name');
  const tagline = mock.querySelector<HTMLElement>('.wrapmock__tagline');
  const windowEl = mock.querySelector<HTMLElement>('.wrapmock__window');
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('.mat-chip'));
  if (!name || !tagline || !windowEl) return;

  chips.forEach((chip, i) => chip.style.setProperty('--mat-color', MATS[i]?.color ?? ''));

  let current = 0;
  const show = (i: number): void => {
    const mat = MATS[i];
    current = i;
    mock.style.setProperty('--mat-color', mat.color);
    mock.style.setProperty('--mat-color-2', mat.color2);
    name.textContent = mat.name;
    tagline.textContent = mat.tagline;
    windowEl.querySelectorAll('span').forEach((s) => (s.textContent = mat.icon));
    [name, windowEl].forEach((el) => {
      el.classList.remove('is-swapping');
      void el.offsetWidth;
      el.classList.add('is-swapping');
    });
    chips.forEach((c, j) => c.classList.toggle('is-active', j === i));
  };

  let timer: number | undefined;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = (): void => {
    if (reducedMotion) return;
    window.clearInterval(timer);
    timer = window.setInterval(() => show((current + 1) % MATS.length), 2600);
  };

  chips.forEach((chip, i) =>
    chip.addEventListener('click', () => {
      show(i);
      start();
    }),
  );
  show(0);
  start();
}

document.addEventListener('DOMContentLoaded', () => {
  initWrapMock();
  initNav();
  initFooterYear();
  initHowSteps();
  initCurrentNavLink();
  initScrollEffects();
  initReveal();
});
