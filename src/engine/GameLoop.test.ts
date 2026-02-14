import { describe, it, expect } from 'vitest';
import { GameLoop } from './GameLoop';
import { FIXED_TIMESTEP } from './constants';

describe('GameLoop', () => {
  describe('tickHeadless', () => {
    it('calls updateFn the correct number of times', () => {
      let updateCount = 0;
      let renderCount = 0;
      const loop = new GameLoop(
        () => { updateCount++; },
        () => { renderCount++; },
      );

      loop.tickHeadless(10);
      expect(updateCount).toBe(10);
      // render is not called in headless mode
      expect(renderCount).toBe(0);
    });

    it('passes FIXED_TIMESTEP to updateFn', () => {
      const dts: number[] = [];
      const loop = new GameLoop(
        (dt) => { dts.push(dt); },
        () => {},
      );

      loop.tickHeadless(5);
      expect(dts).toHaveLength(5);
      for (const dt of dts) {
        expect(dt).toBeCloseTo(FIXED_TIMESTEP, 5);
      }
    });

    it('handles large step counts efficiently', () => {
      let count = 0;
      const loop = new GameLoop(
        () => { count++; },
        () => {},
      );

      const start = performance.now();
      loop.tickHeadless(10000);
      const elapsed = performance.now() - start;

      expect(count).toBe(10000);
      // 10,000 no-op ticks should be very fast (< 100ms)
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('FPS tracking', () => {
    it('initializes FPS counters to 0', () => {
      const loop = new GameLoop(() => {}, () => {});
      expect(loop.engineFps).toBe(0);
      expect(loop.renderFps).toBe(0);
    });
  });
});
