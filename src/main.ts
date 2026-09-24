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

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooterYear();
  initHowSteps();
});
