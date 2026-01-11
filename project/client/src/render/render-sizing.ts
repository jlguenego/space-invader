export type RenderSize = {
  width: number;
  height: number;
};

export function clampPixelRatio(devicePixelRatio: number, maxPixelRatio = 2): number {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) return 1;
  if (!Number.isFinite(maxPixelRatio) || maxPixelRatio <= 0) return 1;
  return Math.min(devicePixelRatio, maxPixelRatio);
}

export function normalizeRenderSize(width: number, height: number): RenderSize {
  const safeWidth = Number.isFinite(width) ? Math.max(0, Math.floor(width)) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, Math.floor(height)) : 0;
  return { width: safeWidth, height: safeHeight };
}

export function sizeFromRect(rect: { width: number; height: number }): RenderSize {
  return normalizeRenderSize(rect.width, rect.height);
}

export function isRenderableSize(size: RenderSize): boolean {
  return size.width > 0 && size.height > 0;
}
