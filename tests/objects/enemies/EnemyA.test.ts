import { describe, it, expect, beforeEach } from 'vitest';
import { createEnemyA, updateEnemy, interpolatePath, resetEnemyIdCounter } from '../../../src/objects/enemies/enemyA/code/EnemyA';
import { STRAIGHT_DOWN } from '../../../src/engine/FlightPathUtils';
import { ENEMY_A_HEALTH, ENEMY_A_SCORE_VALUE } from '../../../src/engine/constants';

describe('EnemyA', () => {
  beforeEach(() => {
    resetEnemyIdCounter();
  });

  it('creates enemy with correct defaults', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);

    expect(enemy.type).toBe('A');
    expect(enemy.health).toBe(ENEMY_A_HEALTH);
    expect(enemy.maxHealth).toBe(ENEMY_A_HEALTH);
    expect(enemy.fireMode).toBe('none');
    expect(enemy.scoreValue).toBe(ENEMY_A_SCORE_VALUE);
    expect(enemy.isAlive).toBe(true);
  });

  it('starts at first path point', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);
    expect(enemy.position.x).toBe(STRAIGHT_DOWN.points[0].x);
    expect(enemy.position.y).toBe(STRAIGHT_DOWN.points[0].y);
  });

  it('follows path downward over time', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);
    const startY = enemy.position.y;

    // Update for some time
    for (let i = 0; i < 60; i++) {
      updateEnemy(enemy, 1/60);
    }

    expect(enemy.position.y).toBeGreaterThan(startY);
  });

  it('pathProgress advances over time', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);

    updateEnemy(enemy, 1.0); // 1 second
    expect(enemy.pathProgress).toBeGreaterThan(0);
  });

  it('does not fire (type A)', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);
    expect(enemy.fireMode).toBe('none');
    expect(enemy.isFiring).toBe(false);
  });

  it('marks destroyed when health reaches 0', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);
    enemy.health = 0;

    updateEnemy(enemy, 1/60);

    expect(enemy.isAlive).toBe(false);
    expect(enemy.collisionState).toBe('destroyed');
  });

  it('does not update dead enemy', () => {
    const enemy = createEnemyA(STRAIGHT_DOWN);
    enemy.isAlive = false;
    const startProgress = enemy.pathProgress;

    updateEnemy(enemy, 1/60);
    expect(enemy.pathProgress).toBe(startProgress);
  });

  it('generates unique IDs', () => {
    const e1 = createEnemyA(STRAIGHT_DOWN);
    const e2 = createEnemyA(STRAIGHT_DOWN);
    expect(e1.id).not.toBe(e2.id);
  });
});

describe('interpolatePath', () => {
  it('returns first point at progress 0', () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const pos = interpolatePath(points, 0);
    expect(pos.x).toBeCloseTo(0, 0);
    expect(pos.y).toBeCloseTo(0, 0);
  });

  it('returns last point at progress 1', () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const pos = interpolatePath(points, 1);
    expect(pos.x).toBeCloseTo(100, 0);
    expect(pos.y).toBeCloseTo(100, 0);
  });

  it('returns midpoint at progress 0.5 for 2 points', () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const pos = interpolatePath(points, 0.5);
    expect(pos.x).toBeCloseTo(50, 0);
    expect(pos.y).toBeCloseTo(50, 0);
  });

  it('handles single point', () => {
    const pos = interpolatePath([{ x: 50, y: 50 }], 0.5);
    expect(pos.x).toBe(50);
    expect(pos.y).toBe(50);
  });

  it('handles empty points', () => {
    const pos = interpolatePath([], 0.5);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
  });
});
