import { describe, it, expect } from 'vitest';
import { interpolatePosition, interpolateRotation, interpolateValue } from '../../src/renderer/InterpolationUtils';

describe('InterpolationUtils', () => {
  describe('interpolatePosition', () => {
    it('returns prev at alpha 0', () => {
      const pos = interpolatePosition({ x: 0, y: 0 }, { x: 100, y: 100 }, 0);
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it('returns curr at alpha 1', () => {
      const pos = interpolatePosition({ x: 0, y: 0 }, { x: 100, y: 100 }, 1);
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });

    it('returns midpoint at alpha 0.5', () => {
      const pos = interpolatePosition({ x: 0, y: 0 }, { x: 100, y: 100 }, 0.5);
      expect(pos.x).toBe(50);
      expect(pos.y).toBe(50);
    });

    it('handles negative coordinates', () => {
      const pos = interpolatePosition({ x: -100, y: -100 }, { x: 100, y: 100 }, 0.5);
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });
  });

  describe('interpolateRotation', () => {
    it('returns prev at alpha 0', () => {
      expect(interpolateRotation(0, Math.PI, 0)).toBe(0);
    });

    it('returns curr at alpha 1', () => {
      expect(interpolateRotation(0, Math.PI, 1)).toBeCloseTo(Math.PI, 5);
    });

    it('interpolates midpoint', () => {
      expect(interpolateRotation(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('handles wrapping around 2PI', () => {
      // From near 2PI to near 0 — should interpolate through 0, not backwards
      const result = interpolateRotation(Math.PI * 1.9, Math.PI * 0.1, 0.5);
      // Should be close to 0 (or 2PI), not PI
      expect(Math.abs(result) < Math.PI / 2 || Math.abs(result - 2 * Math.PI) < Math.PI / 2).toBe(true);
    });
  });

  describe('interpolateValue', () => {
    it('returns prev at alpha 0', () => {
      expect(interpolateValue(10, 20, 0)).toBe(10);
    });

    it('returns curr at alpha 1', () => {
      expect(interpolateValue(10, 20, 1)).toBe(20);
    });

    it('returns midpoint at alpha 0.5', () => {
      expect(interpolateValue(10, 20, 0.5)).toBe(15);
    });
  });
});
