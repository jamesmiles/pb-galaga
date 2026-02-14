import type { Vector2D } from '../types';

/** Linearly interpolate between two values. */
export function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha;
}

/** Interpolate between two 2D positions. */
export function lerpPosition(prev: Vector2D, curr: Vector2D, alpha: number): Vector2D {
  return {
    x: lerp(prev.x, curr.x, alpha),
    y: lerp(prev.y, curr.y, alpha),
  };
}

/** Interpolate angle (handles wrapping around 2π). */
export function lerpAngle(a: number, b: number, alpha: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * alpha;
}
