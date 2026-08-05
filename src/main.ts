import './style.css';

document.documentElement.classList.add('js-ready');

function initNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const dropdown = document.getElementById('nav-oferta');
  const dropdownToggle = dropdown?.querySelector<HTMLButtonElement>('.nav__dropdown-toggle');
  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => {
      links?.classList.remove('is-open');
      dropdown?.classList.remove('is-open');
    });
  });
}

function initScrollReveal(): void {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  targets.forEach((target) => observer.observe(target));
}

initNav();
initScrollReveal();
