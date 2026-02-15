import { describe, it, expect } from 'vitest';
import { AsteroidManager } from './AsteroidManager';
import { createInitialState } from './StateManager';
import {
  ASTEROID_SMALL_HEALTH, ASTEROID_LARGE_HEALTH,
  ASTEROID_SMALL_RADIUS, ASTEROID_LARGE_RADIUS,
  ASTEROID_SPAWN_INTERVAL,
} from './constants';

function playingState(level: number) {
  const state = createInitialState();
  state.gameStatus = 'playing';
  state.currentLevel = level;
  return state;
}

describe('AsteroidManager', () => {
  it('does not spawn asteroids on levels other than 4', () => {
    const mgr = new AsteroidManager();
    const state = playingState(1);
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    expect(state.asteroids.length).toBe(0);
  });

  it('does not spawn when not playing', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    state.gameStatus = 'paused';
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    expect(state.asteroids.length).toBe(0);
  });

  it('spawns an asteroid after spawn interval on level 4', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    expect(state.asteroids.length).toBe(1);
  });

  it('spawns multiple asteroids over time', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    // dt exceeds max jitter delay (interval + jitter = 4000ms) to guarantee a spawn each iteration.
    // Reset positions after each update so asteroids don't drift off-screen and get filtered.
    for (let i = 0; i < 10; i++) {
      mgr.update(state, ASTEROID_SPAWN_INTERVAL + 2000);
      for (const a of state.asteroids) {
        a.position.y = 0;
      }
    }
    expect(state.asteroids.length).toBeGreaterThanOrEqual(3);
  });

  it('creates small asteroids with correct HP', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    // Spawn many to get both sizes
    for (let i = 0; i < 20; i++) {
      mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    }
    const small = state.asteroids.filter(a => a.size === 'small');
    if (small.length > 0) {
      expect(small[0].health).toBe(ASTEROID_SMALL_HEALTH);
      expect(small[0].collisionRadius).toBe(ASTEROID_SMALL_RADIUS);
    }
  });

  it('creates large asteroids with correct HP', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    for (let i = 0; i < 20; i++) {
      mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    }
    const large = state.asteroids.filter(a => a.size === 'large');
    if (large.length > 0) {
      expect(large[0].health).toBe(ASTEROID_LARGE_HEALTH);
      expect(large[0].collisionRadius).toBe(ASTEROID_LARGE_RADIUS);
    }
  });

  it('asteroids drift downward', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    const a = state.asteroids[0];
    const startY = a.position.y;
    mgr.update(state, 1000);
    expect(a.position.y).toBeGreaterThan(startY);
  });

  it('removes asteroids that go off screen', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    // Force asteroid far below screen
    state.asteroids[0].position.y = 900;
    mgr.update(state, 16);
    expect(state.asteroids.length).toBe(0);
  });

  it('removes dead asteroids', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    state.asteroids[0].isAlive = false;
    mgr.update(state, 16);
    expect(state.asteroids.length).toBe(0);
  });

  it('reset clears spawn timer', () => {
    const mgr = new AsteroidManager();
    const state = playingState(4);
    mgr.update(state, ASTEROID_SPAWN_INTERVAL - 100);
    expect(state.asteroids.length).toBe(0);
    mgr.reset();
    mgr.update(state, ASTEROID_SPAWN_INTERVAL + 100);
    expect(state.asteroids.length).toBe(1);
  });
});
