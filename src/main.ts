import './style.css';
import { initHero3D } from './hero3d';
import { initHeroFallback } from './heroFallback';

const MOBILE_BREAKPOINT = 768;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function getHeroScrollProgress(heroWrap: HTMLElement): () => number {
  return () => {
    const rect = heroWrap.getBoundingClientRect();
    const scrollableHeight = rect.height - window.innerHeight;
    if (scrollableHeight <= 0) return 0;
    const progress = -rect.top / scrollableHeight;
    return Math.min(Math.max(progress, 0), 1);
  };
}

function initHero(): void {
  const heroWrap = document.getElementById('hero');
  const hero3dContainer = document.getElementById('hero-3d');
  const heroFallbackContainer = document.getElementById('hero-fallback');
  const heroContent = document.querySelector<HTMLElement>('.hero-content');
  if (!heroWrap || !hero3dContainer || !heroFallbackContainer) return;

  const getProgress = getHeroScrollProgress(heroWrap);
  const useFallback = window.innerWidth < MOBILE_BREAKPOINT || !supportsWebGL();

  if (useFallback) {
    hero3dContainer.hidden = true;
    heroFallbackContainer.hidden = false;
    initHeroFallback(heroFallbackContainer, getProgress);
  } else {
    initHero3D(hero3dContainer, getProgress);
  }

  if (heroContent) {
    window.addEventListener(
      'scroll',
      () => {
        const fadeProgress = Math.min(getProgress() / 0.35, 1);
        heroContent.style.opacity = String(1 - fadeProgress);
      },
      { passive: true },
    );
  }
}

function initScrollReveal(): void {
  const targets = document.querySelectorAll('.section__inner, .features');
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

initHero();
initScrollReveal();
