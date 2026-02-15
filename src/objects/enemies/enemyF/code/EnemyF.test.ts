import { describe, it, expect } from 'vitest';
import { createEnemyF } from './EnemyF';
import { ENEMY_F_HEALTH, ENEMY_F_SCORE_VALUE, ENEMY_F_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyF', () => {
  it('creates with correct type and properties', () => {
    const enemy = createEnemyF(0, 0);
    expect(enemy.type).toBe('F');
    expect(enemy.health).toBe(ENEMY_F_HEALTH);
    expect(enemy.maxHealth).toBe(ENEMY_F_HEALTH);
    expect(enemy.scoreValue).toBe(ENEMY_F_SCORE_VALUE);
    expect(enemy.collisionRadius).toBe(ENEMY_F_COLLISION_RADIUS);
  });

  it('has homing fire mode', () => {
    const enemy = createEnemyF(1, 2);
    expect(enemy.fireMode).toBe('homing');
    expect(enemy.fireRate).toBe(3500);
  });

  it('sets correct formation position', () => {
    const enemy = createEnemyF(2, 3);
    expect(enemy.formationRow).toBe(2);
    expect(enemy.formationCol).toBe(3);
  });

  it('starts alive with no dive or flight path', () => {
    const enemy = createEnemyF(0, 0);
    expect(enemy.isAlive).toBe(true);
    expect(enemy.diveState).toBeNull();
    expect(enemy.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const e1 = createEnemyF(0, 0);
    const e2 = createEnemyF(0, 1);
    expect(e1.id).not.toBe(e2.id);
  });
});
