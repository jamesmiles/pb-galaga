import { describe, it, expect } from 'vitest';
import { createEnemyH } from './EnemyH';
import { ENEMY_H_HEALTH, ENEMY_H_SCORE_VALUE, ENEMY_H_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyH', () => {
  it('creates with correct type and properties', () => {
    const enemy = createEnemyH(0, 0);
    expect(enemy.type).toBe('H');
    expect(enemy.health).toBe(ENEMY_H_HEALTH);
    expect(enemy.maxHealth).toBe(ENEMY_H_HEALTH);
    expect(enemy.scoreValue).toBe(ENEMY_H_SCORE_VALUE);
    expect(enemy.collisionRadius).toBe(ENEMY_H_COLLISION_RADIUS);
  });

  it('is stationary with bullet fire mode', () => {
    const enemy = createEnemyH(1, 2);
    expect(enemy.isStationary).toBe(true);
    expect(enemy.fireMode).toBe('bullet');
    expect(enemy.fireRate).toBe(2000);
  });

  it('sets correct formation position', () => {
    const enemy = createEnemyH(2, 3);
    expect(enemy.formationRow).toBe(2);
    expect(enemy.formationCol).toBe(3);
  });

  it('starts alive with no dive or flight path', () => {
    const enemy = createEnemyH(0, 0);
    expect(enemy.isAlive).toBe(true);
    expect(enemy.diveState).toBeNull();
    expect(enemy.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const e1 = createEnemyH(0, 0);
    const e2 = createEnemyH(0, 1);
    expect(e1.id).not.toBe(e2.id);
  });
});
