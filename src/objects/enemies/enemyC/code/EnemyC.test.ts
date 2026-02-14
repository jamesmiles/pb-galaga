import { describe, it, expect } from 'vitest';
import { createEnemyC } from './EnemyC';
import { damageEnemy } from '../../enemyA/code/EnemyA';
import { ENEMY_C_HEALTH, ENEMY_C_SCORE_VALUE, ENEMY_C_COLLISION_RADIUS, LASER_DAMAGE } from '../../../../engine/constants';

describe('EnemyC', () => {
  it('creates a Type C enemy at the given formation slot', () => {
    const enemy = createEnemyC(1, 2);
    expect(enemy.type).toBe('C');
    expect(enemy.formationRow).toBe(1);
    expect(enemy.formationCol).toBe(2);
    expect(enemy.isAlive).toBe(true);
  });

  it('has correct health (1 laser hit)', () => {
    const enemy = createEnemyC(0, 0);
    expect(enemy.health).toBe(ENEMY_C_HEALTH);
    expect(enemy.health).toBe(LASER_DAMAGE);
  });

  it('has fireMode bullet', () => {
    const enemy = createEnemyC(0, 0);
    expect(enemy.fireMode).toBe('bullet');
  });

  it('awards 150 points', () => {
    const enemy = createEnemyC(0, 0);
    expect(enemy.scoreValue).toBe(ENEMY_C_SCORE_VALUE);
    expect(enemy.scoreValue).toBe(150);
  });

  it('has correct collision radius', () => {
    const enemy = createEnemyC(0, 0);
    expect(enemy.collisionRadius).toBe(ENEMY_C_COLLISION_RADIUS);
    expect(enemy.collisionRadius).toBe(12);
  });

  it('dies on one laser hit', () => {
    const enemy = createEnemyC(0, 0);
    const killed = damageEnemy(enemy, LASER_DAMAGE);
    expect(killed).toBe(true);
    expect(enemy.isAlive).toBe(false);
  });

  it('generates unique IDs', () => {
    const a = createEnemyC(0, 0);
    const b = createEnemyC(0, 1);
    expect(a.id).not.toBe(b.id);
  });
});
