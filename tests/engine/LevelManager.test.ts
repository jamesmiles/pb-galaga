import { describe, it, expect } from 'vitest';
import { LevelManager } from '../../src/engine/LevelManager';
import { createInitialState } from '../../src/engine/StateManager';
import { LEVEL_1 } from '../../src/levels/level1';

describe('LevelManager', () => {
  it('loads level and sets state', () => {
    const lm = new LevelManager();
    const state = createInitialState();
    state.gameStatus = 'playing';

    lm.loadLevel(LEVEL_1, state);

    expect(state.currentLevel).toBe(1);
    expect(state.currentWave).toBe(1);
    expect(state.waveStatus).toBe('transition');
  });

  it('transitions to active after wave delay', () => {
    const lm = new LevelManager();
    const state = createInitialState();
    state.gameStatus = 'playing';

    lm.loadLevel(LEVEL_1, state);

    // Wave delay is 1000ms, tick past it
    lm.update(state, 1100);

    expect(state.waveStatus).toBe('active');
  });

  it('spawns enemies during active wave', () => {
    const lm = new LevelManager();
    const state = createInitialState();
    state.gameStatus = 'playing';

    lm.loadLevel(LEVEL_1, state);

    // Advance past delay and through spawning (12 enemies, 250ms apart = 3000ms)
    for (let i = 0; i < 300; i++) {
      lm.update(state, 1000 / 60); // ~16.67ms per tick
    }

    expect(state.enemies.length).toBeGreaterThan(0);
    expect(state.enemies.length).toBeLessThanOrEqual(12);
  });

  it('spawns all 12 enemies after sufficient time', () => {
    const lm = new LevelManager();
    const state = createInitialState();
    state.gameStatus = 'playing';

    lm.loadLevel(LEVEL_1, state);

    // Need 1000ms delay + 12*250ms spawning = 4000ms total
    // Tick ~300 frames at ~16.67ms = ~5000ms
    for (let i = 0; i < 300; i++) {
      lm.update(state, 1000 / 60);
    }

    expect(state.enemies.length).toBe(12);
  });

  it('wave completes when all enemies destroyed', () => {
    const lm = new LevelManager();
    const state = createInitialState();
    state.gameStatus = 'playing';

    lm.loadLevel(LEVEL_1, state);

    // Spawn all enemies
    for (let i = 0; i < 300; i++) {
      lm.update(state, 1000 / 60);
    }

    // Destroy all enemies
    state.enemies = [];

    // One more update to detect completion
    lm.update(state, 1000 / 60);

    expect(state.waveStatus).toBe('complete');
  });
});
