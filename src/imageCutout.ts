export const DEFAULT_THRESHOLD = 235;
export const DEFAULT_FEATHER = 15;

/**
 * Decides how opaque a pixel should be when cutting a product photo out of a
 * near-white background. A pixel counts as background only when all three
 * channels are bright (min(r,g,b) >= threshold), so colored or dark detail
 * (labels, shelves, the product itself) stays opaque even against a bright
 * pixel neighborhood. `feather` softens the transition band just below
 * `threshold` to avoid a jagged/haloed cutout edge.
 */
export function computeAlpha(
  r: number,
  g: number,
  b: number,
  threshold: number,
  feather: number,
): number {
  const brightness = Math.min(r, g, b);
  if (brightness >= threshold) return 0;

  const featherStart = threshold - feather;
  if (brightness <= featherStart) return 255;

  const t = (brightness - featherStart) / feather;
  return Math.round((1 - t) * 255);
}

/**
 * Draws `image` onto an offscreen canvas and zeroes out the alpha of
 * near-white background pixels (see computeAlpha). Returns the canvas so
 * callers can use it as a CanvasTexture (hero3d.ts) or a data URL (heroFallback.ts).
 */
export function cutoutWhiteBackground(
  image: HTMLImageElement,
  options?: { threshold?: number; feather?: number },
): HTMLCanvasElement {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const feather = options?.feather ?? DEFAULT_FEATHER;

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('imageCutout: 2D canvas context unavailable');
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = computeAlpha(data[i], data[i + 1], data[i + 2], threshold, feather);
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`imageCutout: failed to load ${src}`));
    image.src = src;
  });
}

/** Loads `src` and returns its white-background-cut canvas in one call. */
export async function loadCutoutCanvas(
  src: string,
  options?: { threshold?: number; feather?: number },
): Promise<HTMLCanvasElement> {
  const image = await loadImage(src);
  return cutoutWhiteBackground(image, options);
}
