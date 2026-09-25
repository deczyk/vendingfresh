import { describe, it, expect } from 'vitest';
import { circularOffset, classifyOffset } from './carousel';

describe('circularOffset', () => {
  it('returns 0 for the active index itself', () => {
    expect(circularOffset(3, 3, 8)).toBe(0);
  });

  it('returns positive offsets for items ahead of active', () => {
    expect(circularOffset(1, 0, 8)).toBe(1);
    expect(circularOffset(2, 0, 8)).toBe(2);
  });

  it('returns negative offsets for items behind active', () => {
    expect(circularOffset(7, 0, 8)).toBe(-1);
    expect(circularOffset(6, 0, 8)).toBe(-2);
  });

  it('wraps around the far side of the list', () => {
    expect(circularOffset(0, 7, 8)).toBe(1);
    expect(circularOffset(4, 7, 8)).toBe(-3);
  });
});

describe('classifyOffset', () => {
  it('classifies 0 as active', () => {
    expect(classifyOffset(0)).toBe('active');
  });

  it('classifies +/-1 as side', () => {
    expect(classifyOffset(1)).toBe('side');
    expect(classifyOffset(-1)).toBe('side');
  });

  it('classifies +/-2 as far', () => {
    expect(classifyOffset(2)).toBe('far');
    expect(classifyOffset(-2)).toBe('far');
  });

  it('classifies anything beyond +/-2 as hidden', () => {
    expect(classifyOffset(3)).toBe('hidden');
    expect(classifyOffset(-4)).toBe('hidden');
  });
});
