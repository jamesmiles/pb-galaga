import { describe, it, expect } from 'vitest';
import { tankExtent } from './Episode2Engine';
import { TANK_BODY_WIDTH, TANK_BODY_HEIGHT } from './constants';

const halfW = TANK_BODY_WIDTH / 2;  // 16
const halfH = TANK_BODY_HEIGHT / 2; // 20

describe('tankExtent', () => {
  it('returns halfH when direction is along forward axis (heading north)', () => {
    // Heading PI/2 = north, forward = (0, -1), direction = (0, -1)
    const extent = tankExtent(Math.PI / 2, 0, -1, halfW, halfH);
    expect(extent).toBeCloseTo(halfH); // 20
  });

  it('returns halfW when direction is perpendicular to forward (heading north)', () => {
    // Heading PI/2 = north, right = (1, 0), direction = (1, 0)
    const extent = tankExtent(Math.PI / 2, 1, 0, halfW, halfH);
    expect(extent).toBeCloseTo(halfW); // 16
  });

  it('returns halfH when direction is along forward axis (heading east)', () => {
    // Heading 0 = east, forward = (1, 0), direction = (1, 0)
    const extent = tankExtent(0, 1, 0, halfW, halfH);
    expect(extent).toBeCloseTo(halfH); // 20
  });

  it('returns halfW when direction is perpendicular (heading east)', () => {
    // Heading 0, right = (0, 1), direction = (0, 1)
    const extent = tankExtent(0, 0, 1, halfW, halfH);
    expect(extent).toBeCloseTo(halfW); // 16
  });

  it('returns diagonal extent at 45 degrees', () => {
    // Heading 0, direction = (1/√2, 1/√2) — diagonal
    const d = 1 / Math.sqrt(2);
    const extent = tankExtent(0, d, d, halfW, halfH);
    // fwdDot = |cos(0)*d + 0*d| = d, rgtDot = |sin(0)*d + cos(0)*d| = d
    // extent = halfH*d + halfW*d = (20+16) * 0.707 ≈ 25.46
    expect(extent).toBeCloseTo((halfH + halfW) * d);
  });
});

describe('tank-to-tank collision scenarios', () => {
  // Helper: simulate collision check between two positioned tanks
  function checkCollision(
    ax: number, ay: number, aHeading: number,
    bx: number, by: number, bHeading: number,
  ): { overlaps: boolean; minDist: number; actualDist: number } {
    const dx = ax - bx;
    const dy = ay - by;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return { overlaps: true, minDist: 0, actualDist: dist };
    const nx = dx / dist;
    const ny = dy / dist;
    const extentA = tankExtent(aHeading, nx, ny, halfW, halfH);
    const extentB = tankExtent(bHeading, nx, ny, halfW, halfH);
    const minDist = extentA + extentB;
    return { overlaps: dist < minDist, minDist, actualDist: dist };
  }

  it('nose-to-tail (both heading north) collides at distance < 40', () => {
    // Both heading north (PI/2), one directly above the other
    const heading = Math.PI / 2;
    // 38px apart vertically — should collide (minDist = 20 + 20 = 40)
    const result = checkCollision(400, 200, heading, 400, 238, heading);
    expect(result.overlaps).toBe(true);
    expect(result.minDist).toBeCloseTo(40);
  });

  it('nose-to-tail does NOT collide at distance >= 40', () => {
    const heading = Math.PI / 2;
    // 41px apart — should not collide
    const result = checkCollision(400, 200, heading, 400, 241, heading);
    expect(result.overlaps).toBe(false);
  });

  it('side-by-side (both heading north) collides at distance < 32', () => {
    const heading = Math.PI / 2;
    // 30px apart horizontally — should collide (minDist = 16 + 16 = 32)
    const result = checkCollision(400, 200, heading, 430, 200, heading);
    expect(result.overlaps).toBe(true);
    expect(result.minDist).toBeCloseTo(32);
  });

  it('side-by-side does NOT collide at distance >= 32', () => {
    const heading = Math.PI / 2;
    // 33px apart — should not collide
    const result = checkCollision(400, 200, heading, 433, 200, heading);
    expect(result.overlaps).toBe(false);
  });

  it('perpendicular tanks have asymmetric collision distance', () => {
    // Tank A heading north (PI/2), Tank B heading east (0)
    // Approaching nose-to-side: A extent = halfH (20), B extent = halfW (16)
    const result = checkCollision(400, 200, Math.PI / 2, 400, 235, 0);
    expect(result.overlaps).toBe(true);
    expect(result.minDist).toBeCloseTo(36); // 20 + 16
  });

  it('tanks far apart do not collide', () => {
    const result = checkCollision(100, 100, 0, 300, 300, Math.PI / 2);
    expect(result.overlaps).toBe(false);
  });
});
