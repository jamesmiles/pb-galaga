import { describe, it, expect } from 'vitest';
import { createEnemyJ } from './EnemyJ';
import { ENEMY_J_HEALTH, ENEMY_J_SCORE_VALUE, ENEMY_J_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyJ', () => {
  it('creates with correct type and properties', () => {
    const enemy = createEnemyJ(0, 0);
    expect(enemy.type).toBe('J');
    expect(enemy.health).toBe(ENEMY_J_HEALTH);
    expect(enemy.maxHealth).toBe(ENEMY_J_HEALTH);
    expect(enemy.scoreValue).toBe(ENEMY_J_SCORE_VALUE);
    expect(enemy.collisionRadius).toBe(ENEMY_J_COLLISION_RADIUS);
  });

  it('is mobile with spread fire mode', () => {
    const enemy = createEnemyJ(1, 2);
    expect(enemy.isStationary).toBeUndefined();
    expect(enemy.fireMode).toBe('spread');
    expect(enemy.fireRate).toBe(4000);
  });

  it('sets correct formation position', () => {
    const enemy = createEnemyJ(2, 3);
    expect(enemy.formationRow).toBe(2);
    expect(enemy.formationCol).toBe(3);
  });

  it('starts alive with no dive or flight path', () => {
    const enemy = createEnemyJ(0, 0);
    expect(enemy.isAlive).toBe(true);
    expect(enemy.diveState).toBeNull();
    expect(enemy.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const e1 = createEnemyJ(0, 0);
    const e2 = createEnemyJ(0, 1);
    expect(e1.id).not.toBe(e2.id);
  });
});
