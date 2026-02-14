import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyFiringManager } from './EnemyFiringManager';
import { createInitialState } from './StateManager';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createEnemyB } from '../objects/enemies/enemyB/code/EnemyB';
import { createEnemyC } from '../objects/enemies/enemyC/code/EnemyC';
import type { GameState } from '../types';

describe('EnemyFiringManager', () => {
  let manager: EnemyFiringManager;
  let state: GameState;

  beforeEach(() => {
    manager = new EnemyFiringManager();
    state = createInitialState();
    state.projectiles = [];
  });

  describe('front-row detection', () => {
    it('identifies the front-row enemy per column (highest Y)', () => {
      const back = createEnemyA(0, 0);
      back.position = { x: 100, y: 100 };
      const front = createEnemyA(1, 0);
      front.position = { x: 100, y: 200 };

      const ids = manager.getFrontRowEnemyIds([back, front]);
      expect(ids.has(front.id)).toBe(true);
      expect(ids.has(back.id)).toBe(false);
    });

    it('returns one enemy per column', () => {
      const col0 = createEnemyA(0, 0);
      col0.position = { x: 100, y: 100 };
      const col1 = createEnemyA(0, 1);
      col1.position = { x: 200, y: 100 };

      const ids = manager.getFrontRowEnemyIds([col0, col1]);
      expect(ids.size).toBe(2);
      expect(ids.has(col0.id)).toBe(true);
      expect(ids.has(col1.id)).toBe(true);
    });

    it('returns empty set for no enemies', () => {
      const ids = manager.getFrontRowEnemyIds([]);
      expect(ids.size).toBe(0);
    });
  });

  describe('firing behavior', () => {
    it('does not fire enemies with fireMode "none"', () => {
      const enemy = createEnemyA(0, 0); // Type A has fireMode 'none'
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      // Advance enough time to trigger firing
      manager.update(state, 5);

      expect(state.projectiles.length).toBe(0);
    });

    it('fires a laser for Type B enemies', () => {
      const enemy = createEnemyB(0, 0);
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      // Advance enough time to exhaust any cooldown (max ~3500ms)
      manager.update(state, 4);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('laser');
      expect(state.projectiles[0].owner.type).toBe('enemy');
      expect(state.projectiles[0].velocity.y).toBeGreaterThan(0); // Moves downward
    });

    it('fires a bullet for Type C enemies', () => {
      const enemy = createEnemyC(0, 0);
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      // Advance enough time to exhaust any cooldown (max ~2500ms)
      manager.update(state, 3);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('bullet');
      expect(state.projectiles[0].owner.type).toBe('enemy');
    });

    it('only front-row enemies fire', () => {
      const back = createEnemyB(0, 0);
      back.position = { x: 100, y: 100 };
      const front = createEnemyB(1, 0);
      front.position = { x: 100, y: 200 };
      state.enemies = [back, front];

      manager.update(state, 4);

      // Only front enemy should fire
      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].owner.id).toBe(front.id);
    });

    it('spawns projectile at enemy position offset', () => {
      const enemy = createEnemyC(0, 0);
      enemy.position = { x: 150, y: 250 };
      state.enemies = [enemy];

      manager.update(state, 3);

      expect(state.projectiles[0].position.x).toBe(150);
      expect(state.projectiles[0].position.y).toBe(266); // y + 16
    });
  });

  describe('cooldown management', () => {
    it('does not fire immediately — respects initial cooldown', () => {
      const enemy = createEnemyB(0, 0);
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      // Small time step — should not fire yet
      manager.update(state, 0.1);

      expect(state.projectiles.length).toBe(0);
    });

    it('fires multiple projectiles over time', () => {
      const enemy = createEnemyC(0, 0);
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      // Advance 10 seconds in 1-second steps
      for (let i = 0; i < 10; i++) {
        manager.update(state, 1);
      }

      // With ~2s cooldown, should have fired 3-5 times in 10 seconds
      expect(state.projectiles.length).toBeGreaterThanOrEqual(3);
      expect(state.projectiles.length).toBeLessThanOrEqual(6);
    });

    it('cleans up cooldowns for dead enemies', () => {
      const enemy = createEnemyB(0, 0);
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      manager.update(state, 1);

      // Kill the enemy
      enemy.isAlive = false;
      manager.update(state, 1);

      // No new projectiles from dead enemy
      const count = state.projectiles.length;
      manager.update(state, 4);
      expect(state.projectiles.length).toBe(count);
    });
  });

  describe('reset', () => {
    it('clears all cooldowns on reset', () => {
      const enemy = createEnemyB(0, 0);
      enemy.position = { x: 100, y: 200 };
      state.enemies = [enemy];

      // Build up cooldowns
      manager.update(state, 1);

      manager.reset();

      // After reset, new cooldowns are generated
      // (we just verify no errors and it still functions)
      manager.update(state, 4);
      expect(state.projectiles.length).toBeGreaterThanOrEqual(1);
    });
  });
});
