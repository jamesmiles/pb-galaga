import type { Vector2D } from '../types';

/** Interpolate between two positions. */
export function interpolatePosition(prev: Vector2D, curr: Vector2D, alpha: number): Vector2D {
  return {
    x: prev.x + (curr.x - prev.x) * alpha,
    y: prev.y + (curr.y - prev.y) * alpha,
  };
}

/** Interpolate between two rotation angles. */
export function interpolateRotation(prev: number, curr: number, alpha: number): number {
  // Handle angle wrapping
  let diff = curr - prev;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  return prev + diff * alpha;
}

/** Interpolate a single number. */
export function interpolateValue(prev: number, curr: number, alpha: number): number {
  return prev + (curr - prev) * alpha;
}
