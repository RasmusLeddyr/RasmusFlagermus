const clamp = (pos, min, max) => Math.max(min, Math.min(max, pos));

export function clampPosition(pos, bounds) {
  return {
    x: clamp(pos.x, 0, bounds.maxX),
    y: clamp(pos.y, 0, bounds.maxY),
  };
}
