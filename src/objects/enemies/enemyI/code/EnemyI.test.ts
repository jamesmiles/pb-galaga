import { describe, it, expect } from 'vitest';
import { createEnemyI } from './EnemyI';
import { ENEMY_I_HEALTH, ENEMY_I_SCORE_VALUE, ENEMY_I_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyI', () => {
  it('creates with correct type and properties', () => {
    const enemy = createEnemyI(0, 0);
    expect(enemy.type).toBe('I');
    expect(enemy.health).toBe(ENEMY_I_HEALTH);
    expect(enemy.maxHealth).toBe(ENEMY_I_HEALTH);
    expect(enemy.scoreValue).toBe(ENEMY_I_SCORE_VALUE);
    expect(enemy.collisionRadius).toBe(ENEMY_I_COLLISION_RADIUS);
  });

  it('is stationary with plasma fire mode', () => {
    const enemy = createEnemyI(1, 2);
    expect(enemy.isStationary).toBe(true);
    expect(enemy.fireMode).toBe('plasma');
    expect(enemy.fireRate).toBe(2500);
  });

  it('sets correct formation position', () => {
    const enemy = createEnemyI(2, 3);
    expect(enemy.formationRow).toBe(2);
    expect(enemy.formationCol).toBe(3);
  });

  it('starts alive with no dive or flight path', () => {
    const enemy = createEnemyI(0, 0);
    expect(enemy.isAlive).toBe(true);
    expect(enemy.diveState).toBeNull();
    expect(enemy.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const e1 = createEnemyI(0, 0);
    const e2 = createEnemyI(0, 1);
    expect(e1.id).not.toBe(e2.id);
  });
});
