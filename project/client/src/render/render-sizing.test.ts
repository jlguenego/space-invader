import { describe, expect, it } from 'bun:test';

import {
  clampPixelRatio,
  isRenderableSize,
  normalizeRenderSize,
  sizeFromRect,
} from './render-sizing';

describe('clampPixelRatio', () => {
  it('clamps to max and defaults to 1 on invalid values', () => {
    expect(clampPixelRatio(3, 2)).toBe(2);
    expect(clampPixelRatio(2, 2)).toBe(2);
    expect(clampPixelRatio(1, 2)).toBe(1);

    expect(clampPixelRatio(Number.NaN, 2)).toBe(1);
    expect(clampPixelRatio(-1, 2)).toBe(1);
    expect(clampPixelRatio(2, 0)).toBe(1);
  });
});

describe('normalizeRenderSize / sizeFromRect', () => {
  it('floors and clamps to >= 0', () => {
    expect(normalizeRenderSize(10.9, 20.1)).toEqual({ width: 10, height: 20 });
    expect(normalizeRenderSize(-5, 3)).toEqual({ width: 0, height: 3 });
    expect(normalizeRenderSize(Number.POSITIVE_INFINITY, 1)).toEqual({ width: 0, height: 1 });
  });

  it('maps DOMRect-like objects', () => {
    expect(sizeFromRect({ width: 320.4, height: 199.6 })).toEqual({ width: 320, height: 199 });
  });
});

describe('isRenderableSize', () => {
  it('requires strictly positive dimensions', () => {
    expect(isRenderableSize({ width: 1, height: 1 })).toBe(true);
    expect(isRenderableSize({ width: 0, height: 1 })).toBe(false);
    expect(isRenderableSize({ width: 1, height: 0 })).toBe(false);
  });
});
