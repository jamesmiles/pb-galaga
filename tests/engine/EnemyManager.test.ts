import { describe, it, expect } from 'vitest';
import { updateEnemies, handleEnemyDestruction, isWaveComplete } from '../../src/engine/EnemyManager';
import { createInitialState } from '../../src/engine/StateManager';
import { createEnemyA } from '../../src/objects/enemies/enemyA/code/EnemyA';
import { STRAIGHT_DOWN } from '../../src/engine/FlightPathUtils';

describe('EnemyManager', () => {
  it('removes destroyed enemies after update', () => {
    const state = createInitialState();
    const enemy = createEnemyA(STRAIGHT_DOWN);
    enemy.health = 0;
    state.enemies.push(enemy);

    updateEnemies(state, 1/60);

    expect(state.enemies).toHaveLength(0);
  });

  it('keeps alive enemies after update', () => {
    const state = createInitialState();
    state.enemies.push(createEnemyA(STRAIGHT_DOWN));

    updateEnemies(state, 1/60);

    expect(state.enemies).toHaveLength(1);
  });

  it('handleEnemyDestruction awards score to killer', () => {
    const state = createInitialState();
    state.gameStatus = 'playing';
    state.players[0].score = 0;

    const enemy = createEnemyA(STRAIGHT_DOWN);
    state.enemies.push(enemy);

    handleEnemyDestruction(enemy, 'player1', state);

    expect(state.players[0].score).toBe(100);
    expect(enemy.isAlive).toBe(false);
    expect(enemy.collisionState).toBe('destroyed');
  });

  it('isWaveComplete returns true when no enemies during active wave', () => {
    const state = createInitialState();
    state.waveStatus = 'active';
    state.enemies = [];

    expect(isWaveComplete(state)).toBe(true);
  });

  it('isWaveComplete returns false when enemies remain', () => {
    const state = createInitialState();
    state.waveStatus = 'active';
    state.enemies.push(createEnemyA(STRAIGHT_DOWN));

    expect(isWaveComplete(state)).toBe(false);
  });

  it('isWaveComplete returns false when wave not active', () => {
    const state = createInitialState();
    state.waveStatus = 'transition';
    state.enemies = [];

    expect(isWaveComplete(state)).toBe(false);
  });
});
