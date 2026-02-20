import { describe, it, expect } from 'vitest';
import { createEnemyK } from './EnemyK';
import { ENEMY_K_HEALTH, ENEMY_K_SCORE_VALUE, ENEMY_K_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyK', () => {
  it('creates with correct type and properties', () => {
    const enemy = createEnemyK(0, 0);
    expect(enemy.type).toBe('K');
    expect(enemy.health).toBe(ENEMY_K_HEALTH);
    expect(enemy.maxHealth).toBe(ENEMY_K_HEALTH);
    expect(enemy.scoreValue).toBe(ENEMY_K_SCORE_VALUE);
    expect(enemy.collisionRadius).toBe(ENEMY_K_COLLISION_RADIUS);
  });

  it('is mobile with homing fire mode', () => {
    const enemy = createEnemyK(1, 2);
    expect(enemy.isStationary).toBeUndefined();
    expect(enemy.fireMode).toBe('homing');
    expect(enemy.fireRate).toBe(3500);
  });

  it('sets correct formation position', () => {
    const enemy = createEnemyK(2, 3);
    expect(enemy.formationRow).toBe(2);
    expect(enemy.formationCol).toBe(3);
  });

  it('starts alive with no dive or flight path', () => {
    const enemy = createEnemyK(0, 0);
    expect(enemy.isAlive).toBe(true);
    expect(enemy.diveState).toBeNull();
    expect(enemy.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const e1 = createEnemyK(0, 0);
    const e2 = createEnemyK(0, 1);
    expect(e1.id).not.toBe(e2.id);
  });
});
