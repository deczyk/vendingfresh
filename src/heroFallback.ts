export function initHeroFallback(container: HTMLElement, getScrollProgress: () => number): void {
  const shape = container.querySelector<HTMLElement>('.hero-fallback__shape');
  if (!shape) return;

  function update(): void {
    const progress = getScrollProgress();
    const rotation = progress * 45 - 12;
    const lift = progress * -16;
    shape!.style.transform = `translateY(${lift}px) rotate(${rotation}deg)`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}
