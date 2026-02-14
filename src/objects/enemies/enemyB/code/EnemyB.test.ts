import { describe, it, expect } from 'vitest';
import { createEnemyB } from './EnemyB';
import { damageEnemy } from '../../enemyA/code/EnemyA';
import { ENEMY_B_HEALTH, ENEMY_B_SCORE_VALUE, ENEMY_B_COLLISION_RADIUS, LASER_DAMAGE } from '../../../../engine/constants';

describe('EnemyB', () => {
  it('creates a Type B enemy at the given formation slot', () => {
    const enemy = createEnemyB(2, 3);
    expect(enemy.type).toBe('B');
    expect(enemy.formationRow).toBe(2);
    expect(enemy.formationCol).toBe(3);
    expect(enemy.isAlive).toBe(true);
  });

  it('has correct health (2 laser hits)', () => {
    const enemy = createEnemyB(0, 0);
    expect(enemy.health).toBe(ENEMY_B_HEALTH);
    expect(enemy.health).toBe(LASER_DAMAGE * 2);
  });

  it('has fireMode laser', () => {
    const enemy = createEnemyB(0, 0);
    expect(enemy.fireMode).toBe('laser');
  });

  it('awards 200 points', () => {
    const enemy = createEnemyB(0, 0);
    expect(enemy.scoreValue).toBe(ENEMY_B_SCORE_VALUE);
    expect(enemy.scoreValue).toBe(200);
  });

  it('has correct collision radius', () => {
    const enemy = createEnemyB(0, 0);
    expect(enemy.collisionRadius).toBe(ENEMY_B_COLLISION_RADIUS);
    expect(enemy.collisionRadius).toBe(16);
  });

  it('survives one laser hit', () => {
    const enemy = createEnemyB(0, 0);
    const killed = damageEnemy(enemy, LASER_DAMAGE);
    expect(killed).toBe(false);
    expect(enemy.isAlive).toBe(true);
    expect(enemy.health).toBe(ENEMY_B_HEALTH - LASER_DAMAGE);
  });

  it('dies on second laser hit', () => {
    const enemy = createEnemyB(0, 0);
    damageEnemy(enemy, LASER_DAMAGE);
    const killed = damageEnemy(enemy, LASER_DAMAGE);
    expect(killed).toBe(true);
    expect(enemy.isAlive).toBe(false);
  });

  it('generates unique IDs', () => {
    const a = createEnemyB(0, 0);
    const b = createEnemyB(0, 1);
    expect(a.id).not.toBe(b.id);
  });
});
