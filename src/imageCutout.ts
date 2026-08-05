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
