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

  const go = (index: number): void => {
    active = (index + total) % total;
    render();
  };

  const dots = items.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Pokaż pozycję ${i + 1}`);
    dot.addEventListener('click', () => {
      go(i);
      restartAutoplay();
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

  // Prev/next arrows.
  const makeArrow = (dir: -1 | 1): HTMLButtonElement => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `carousel__arrow carousel__arrow--${dir < 0 ? 'prev' : 'next'}`;
    btn.setAttribute('aria-label', dir < 0 ? 'Poprzednie' : 'Następne');
    btn.textContent = dir < 0 ? '‹' : '›';
    btn.addEventListener('click', () => {
      go(active + dir);
      restartAutoplay();
    });
    root.appendChild(btn);
    return btn;
  };
  makeArrow(-1);
  makeArrow(1);

  // Swipe (touch and mouse drag). A swipe must not also follow the link.
  let startX = 0;
  let startY = 0;
  let swiping = false;
  let suppressClick = false;
  track.addEventListener('pointerdown', (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;
    swiping = true;
    suppressClick = false;
  });
  track.addEventListener('pointerup', (e: PointerEvent) => {
    if (!swiping) return;
    swiping = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true;
      go(active + (dx < 0 ? 1 : -1));
      restartAutoplay();
    }
  });
  track.addEventListener('pointercancel', () => {
    swiping = false;
  });
  // Stop the browser's native link/image drag from hijacking a mouse swipe.
  track.addEventListener('dragstart', (e) => e.preventDefault());

  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (suppressClick) {
        e.preventDefault();
        suppressClick = false;
        return;
      }
      if (i !== active) {
        e.preventDefault();
        go(i);
        restartAutoplay();
      }
    });
  });

  root.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  });

  // Autoplay, paused while hovered/focused and when the user prefers reduced motion.
  let timer: number | undefined;
  let paused = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function restartAutoplay(): void {
    window.clearInterval(timer);
    if (reducedMotion) return;
    timer = window.setInterval(() => {
      if (!paused && !document.hidden) go(active + 1);
    }, 4500);
  }
  root.addEventListener('mouseenter', () => (paused = true));
  root.addEventListener('mouseleave', () => (paused = false));
  root.addEventListener('focusin', () => (paused = true));
  root.addEventListener('focusout', () => (paused = false));

  render();
  restartAutoplay();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCarousel);
}
