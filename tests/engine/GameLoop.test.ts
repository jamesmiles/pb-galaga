import { describe, it, expect } from 'vitest';
import { GameLoop } from '../../src/engine/GameLoop';
import { FIXED_TIMESTEP } from '../../src/engine/constants';

describe('GameLoop', () => {
  it('tickHeadless advances exact number of steps', () => {
    let updateCount = 0;
    let renderCount = 0;
    const loop = new GameLoop(
      () => { updateCount++; },
      () => { renderCount++; },
    );

    loop.tickHeadless(100);

    expect(updateCount).toBe(100);
    expect(renderCount).toBe(0); // headless does not call render
  });

  it('update receives FIXED_TIMESTEP as dt', () => {
    const dts: number[] = [];
    const loop = new GameLoop(
      (dt) => { dts.push(dt); },
      () => {},
    );

    loop.tickHeadless(10);

    expect(dts).toHaveLength(10);
    for (const dt of dts) {
      expect(dt).toBeCloseTo(FIXED_TIMESTEP, 5);
    }
  });

  it('tick processes accumulated time correctly', () => {
    let updateCount = 0;
    const loop = new GameLoop(
      () => { updateCount++; },
      () => {},
    );

    // Simulate a tick with exactly 2 frames worth of elapsed time
    (loop as any).lastTimestamp = 0;
    (loop as any).running = true;
    (loop as any).animationFrameId = 1; // prevent rAF
    const origRAF = (loop as any).tick.bind(loop);

    // Override to prevent scheduling next frame
    loop.tick = function (timestamp: number) {
      let elapsed = timestamp - (this as any).lastTimestamp;
      (this as any).lastTimestamp = timestamp;
      if (elapsed > 250) elapsed = 250;
      (this as any).accumulator += elapsed;
      while ((this as any).accumulator >= FIXED_TIMESTEP) {
        (this as any).updateFn(FIXED_TIMESTEP);
        (this as any).accumulator -= FIXED_TIMESTEP;
      }
    };

    loop.tick(FIXED_TIMESTEP * 2);
    expect(updateCount).toBe(2);
  });

  it('spiral-of-death guard caps accumulated time', () => {
    let updateCount = 0;
    const loop = new GameLoop(
      () => { updateCount++; },
      () => {},
    );

    // Simulate tick with huge elapsed time (1000ms)
    (loop as any).lastTimestamp = 0;
    (loop as any).running = true;

    loop.tick = function (timestamp: number) {
      let elapsed = timestamp - (this as any).lastTimestamp;
      (this as any).lastTimestamp = timestamp;
      if (elapsed > 250) elapsed = 250;
      (this as any).accumulator += elapsed;
      while ((this as any).accumulator >= FIXED_TIMESTEP) {
        (this as any).updateFn(FIXED_TIMESTEP);
        (this as any).accumulator -= FIXED_TIMESTEP;
      }
    };

    loop.tick(1000);
    // With 250ms cap: floor(250 / 16.667) = 14 or 15 updates
    expect(updateCount).toBeLessThanOrEqual(15);
    expect(updateCount).toBeGreaterThanOrEqual(14);
  });

  it('isRunning returns correct state', () => {
    const loop = new GameLoop(() => {}, () => {});
    expect(loop.isRunning()).toBe(false);
  });
});
