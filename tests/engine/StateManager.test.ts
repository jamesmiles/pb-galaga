import { describe, it, expect } from 'vitest';
import { StateManager, createInitialState, cloneState } from '../../src/engine/StateManager';

describe('StateManager', () => {
  it('creates valid initial state', () => {
    const sm = new StateManager();
    const state = sm.currentState;

    expect(state.gameStatus).toBe('menu');
    expect(state.gameMode).toBe('single');
    expect(state.players).toHaveLength(1);
    expect(state.players[0].id).toBe('player1');
    expect(state.players[0].lives).toBe(3);
    expect(state.players[0].score).toBe(0);
    expect(state.enemies).toHaveLength(0);
    expect(state.projectiles).toHaveLength(0);
    expect(state.menu).not.toBeNull();
    expect(state.menu?.type).toBe('start');
  });

  it('swapBuffers creates independent copy', () => {
    const sm = new StateManager();
    sm.currentState.players[0].position.x = 100;
    sm.swapBuffers();

    // Now mutate current — previous should not change
    sm.currentState.players[0].position.x = 200;

    expect(sm.previousState.players[0].position.x).toBe(100);
    expect(sm.currentState.players[0].position.x).toBe(200);
  });

  it('swapBuffers preserves arrays independently', () => {
    const sm = new StateManager();
    sm.swapBuffers();

    sm.currentState.enemies.push({
      id: 'e1', type: 'A',
      position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, rotation: 0,
      path: null, pathProgress: 0,
      isAlive: true, health: 50, maxHealth: 50,
      fireMode: 'none', fireCooldown: 0, fireRate: 0,
      isThrusting: false, isFiring: false, collisionState: 'none',
      scoreValue: 100, collisionRadius: 15,
    });

    expect(sm.previousState.enemies).toHaveLength(0);
    expect(sm.currentState.enemies).toHaveLength(1);
  });

  it('reset returns to initial state', () => {
    const sm = new StateManager();
    sm.currentState.gameStatus = 'playing';
    sm.currentState.players[0].score = 500;

    sm.reset();

    expect(sm.currentState.gameStatus).toBe('menu');
    expect(sm.currentState.players[0].score).toBe(0);
  });

  it('interpolateValue computes correctly', () => {
    const sm = new StateManager();
    expect(sm.interpolateValue(0, 100, 0)).toBe(0);
    expect(sm.interpolateValue(0, 100, 1)).toBe(100);
    expect(sm.interpolateValue(0, 100, 0.5)).toBe(50);
    expect(sm.interpolateValue(10, 20, 0.25)).toBe(12.5);
  });

  it('cloneState produces deep independent copy', () => {
    const original = createInitialState();
    const cloned = cloneState(original);

    cloned.players[0].position.x = 999;
    expect(original.players[0].position.x).not.toBe(999);
  });
});
