export function circularOffset(index: number, active: number, total: number): number {
  let diff = (index - active) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

export function classifyOffset(offset: number): 'active' | 'side' | 'far' | 'hidden' {
  const abs = Math.abs(offset);
  if (abs === 0) return 'active';
  if (abs === 1) return 'side';
  if (abs === 2) return 'far';
  return 'hidden';
}

function initCarousel(): void {
  const root = document.querySelector<HTMLElement>('.carousel');
  if (!root) return;
  const track = root.querySelector<HTMLElement>('.carousel__track');
  const dotsContainer = root.querySelector<HTMLElement>('.carousel__dots');
  if (!track || !dotsContainer) return;

  const items = Array.from(track.querySelectorAll<HTMLElement>('.carousel__item'));
  const total = items.length;
  if (total === 0) return;
  let active = 0;

  const dots = items.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Pokaż pozycję ${i + 1}`);
    dot.addEventListener('click', () => {
      active = i;
      render();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  function render(): void {
    items.forEach((item, i) => {
      const offset = circularOffset(i, active, total);
      const state = classifyOffset(offset);
      item.classList.remove(
        'carousel__item--active',
        'carousel__item--side',
        'carousel__item--far',
        'carousel__item--hidden',
      );
      item.classList.add(`carousel__item--${state}`);
      item.style.order = String(offset);
    });
    dots.forEach((dot, i) => dot.classList.toggle('carousel__dot--active', i === active));
  }

  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (i !== active) {
        e.preventDefault();
        active = i;
        render();
      }
    });
  });

  root.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      active = (active - 1 + total) % total;
      render();
    }
    if (e.key === 'ArrowRight') {
      active = (active + 1) % total;
      render();
    }
  });

  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCarousel);
}
