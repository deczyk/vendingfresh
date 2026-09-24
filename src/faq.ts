function initAccordion(): void {
  const items = document.querySelectorAll<HTMLElement>('.faq-item');
  if (items.length === 0) return;

  items.forEach((item) => {
    const question = item.querySelector<HTMLButtonElement>('.faq-item__question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

document.addEventListener('DOMContentLoaded', initAccordion);
