import { initSharedPage } from './pageInit';

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

initSharedPage();
initScrollReveal();
