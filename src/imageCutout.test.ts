import { describe, expect, it } from 'vitest';
import { computeAlpha, DEFAULT_FEATHER, DEFAULT_THRESHOLD } from './imageCutout';

describe('computeAlpha', () => {
  it('makes pure white fully transparent', () => {
    expect(computeAlpha(255, 255, 255, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(0);
  });

  it('keeps pure black fully opaque', () => {
    expect(computeAlpha(0, 0, 0, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(255);
  });

  it('keeps a pixel at the feather floor fully opaque', () => {
    // featherStart = threshold - feather = 235 - 15 = 220
    expect(computeAlpha(220, 220, 220, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(255);
  });

  it('partially fades a pixel inside the feather band', () => {
    // brightness 227 is 7/15 of the way from 220 (opaque) to 235 (transparent)
    const alpha = computeAlpha(227, 227, 227, DEFAULT_THRESHOLD, DEFAULT_FEATHER);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(255);
    expect(alpha).toBe(136);
  });

  it('keeps a pixel opaque when only some channels are bright (e.g. a dark label on glass)', () => {
    // min(r,g,b) = 200, which is below the feather floor of 220 -> fully opaque
    expect(computeAlpha(255, 255, 200, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(255);
  });
});
