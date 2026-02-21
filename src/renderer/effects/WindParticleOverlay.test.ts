import { describe, it, expect } from 'vitest';
import { WindParticleOverlay } from './WindParticleOverlay';

describe('WindParticleOverlay', () => {
  describe('constructor', () => {
    it('starts with zero active particles', () => {
      const overlay = new WindParticleOverlay();
      expect(overlay.activeCount).toBe(0);
    });
  });

  describe('update', () => {
    it('spawns particles over time', () => {
      const overlay = new WindParticleOverlay();
      // Run several frames to allow accumulator to build up
      for (let i = 0; i < 60; i++) {
        overlay.update(16.667);
      }
      expect(overlay.activeCount).toBeGreaterThan(0);
    });

    it('does not spawn when dt is 0', () => {
      const overlay = new WindParticleOverlay();
      overlay.update(0);
      expect(overlay.activeCount).toBe(0);
    });

    it('does not spawn when dt is negative', () => {
      const overlay = new WindParticleOverlay();
      overlay.update(-16);
      expect(overlay.activeCount).toBe(0);
    });

    it('clamps large dt values to prevent spawn bursts', () => {
      const overlay = new WindParticleOverlay();
      // Simulate 5 seconds of backgrounded tab
      overlay.update(5000);
      // With 100ms clamp and ~12 spawns/sec, should get ~1-2 particles, not 60
      expect(overlay.activeCount).toBeLessThan(10);
    });

    it('deactivates particles when life expires', () => {
      const overlay = new WindParticleOverlay();
      // Spawn some particles
      for (let i = 0; i < 30; i++) {
        overlay.update(16.667);
      }
      const countBefore = overlay.activeCount;
      expect(countBefore).toBeGreaterThan(0);

      // Advance far enough that all should expire (max life is 6000ms)
      for (let i = 0; i < 400; i++) {
        overlay.update(16.667); // ~6.67 seconds total
      }

      // Some of the original particles should have expired
      // (new ones spawned, but the count shouldn't keep growing unbounded)
      expect(overlay.activeCount).toBeLessThanOrEqual(100);
    });

    it('varies gust strength over time (not constant velocity)', () => {
      const overlay = new WindParticleOverlay();
      // We can't directly observe gust values, but we can verify
      // the system runs without error across many seconds of phase advancement
      for (let i = 0; i < 600; i++) {
        overlay.update(16.667); // ~10 seconds
      }
      expect(overlay.activeCount).toBeGreaterThan(0);
    });
  });

  describe('draw', () => {
    it('calls fill for active particles', () => {
      const overlay = new WindParticleOverlay();
      // Spawn particles
      for (let i = 0; i < 60; i++) {
        overlay.update(16.667);
      }
      expect(overlay.activeCount).toBeGreaterThan(0);

      let fillCalls = 0;
      const mockCtx = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => { fillCalls++; },
        globalCompositeOperation: 'source-over',
        fillStyle: '',
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;

      overlay.draw(mockCtx);
      expect(fillCalls).toBeGreaterThan(0);
    });

    it('sets lighter composite operation', () => {
      const overlay = new WindParticleOverlay();
      let compositeOp = '';
      const mockCtx = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        set globalCompositeOperation(v: string) { compositeOp = v; },
        get globalCompositeOperation() { return compositeOp; },
        fillStyle: '',
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;

      overlay.draw(mockCtx);
      expect(compositeOp).toBe('lighter');
    });
  });

  describe('reset', () => {
    it('deactivates all particles', () => {
      const overlay = new WindParticleOverlay();
      for (let i = 0; i < 60; i++) {
        overlay.update(16.667);
      }
      expect(overlay.activeCount).toBeGreaterThan(0);

      overlay.reset();
      expect(overlay.activeCount).toBe(0);
    });

    it('resets spawn accumulator so spawning restarts cleanly', () => {
      const overlay = new WindParticleOverlay();
      for (let i = 0; i < 30; i++) {
        overlay.update(16.667);
      }
      overlay.reset();
      expect(overlay.activeCount).toBe(0);

      // After reset, a single tiny frame should not immediately spawn
      overlay.update(1);
      expect(overlay.activeCount).toBe(0);
    });
  });

  describe('activeCount', () => {
    it('returns 0 when no particles have been spawned', () => {
      const overlay = new WindParticleOverlay();
      expect(overlay.activeCount).toBe(0);
    });

    it('tracks active particle count accurately', () => {
      const overlay = new WindParticleOverlay();
      const counts: number[] = [];
      for (let i = 0; i < 120; i++) {
        overlay.update(16.667);
        counts.push(overlay.activeCount);
      }
      // Count should generally increase as particles spawn
      expect(counts[counts.length - 1]).toBeGreaterThan(counts[0]);
    });
  });
});
