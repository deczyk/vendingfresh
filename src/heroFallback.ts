import { loadCutoutCanvas } from './imageCutout';
import { HERO_TILT_MAX_DEGREES, HERO_ZOOM_MAX, MACHINE_IMAGE_SRC } from './heroConfig';
import { showHeroErrorPanel } from './heroError';

export function initHeroFallback(container: HTMLElement, getScrollProgress: () => number): void {
  const photo = container.querySelector<HTMLImageElement>('.hero-fallback__photo');
  if (!photo) return;

  function update(): void {
    const progress = getScrollProgress();
    const tiltDegrees = progress * (HERO_TILT_MAX_DEGREES * 2) - HERO_TILT_MAX_DEGREES;
    const scale = 1 + progress * (HERO_ZOOM_MAX - 1);
    photo!.style.transform = `perspective(900px) rotateY(${tiltDegrees}deg) scale(${scale})`;
  }

  loadCutoutCanvas(MACHINE_IMAGE_SRC)
    .then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        photo.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        photo.src = url;
        window.addEventListener('scroll', update, { passive: true });
        update();
      }, 'image/png');
    })
    .catch((error: unknown) => {
      console.warn('heroFallback: nie udało się załadować zdjęcia automatu', error);
      container.hidden = true;
      showHeroErrorPanel();
    });
}
