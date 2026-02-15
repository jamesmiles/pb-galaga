import { describe, it, expect } from 'vitest';
import { createEnemyHomingMissile } from './EnemyHoming';
import { ENEMY_HOMING_SPEED, ENEMY_HOMING_DAMAGE, ENEMY_HOMING_TURN_RATE, ENEMY_HOMING_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyHomingMissile', () => {
  it('creates with correct properties', () => {
    const pos = { x: 100, y: 200 };
    const owner = { type: 'enemy' as const, id: 'enemyF-0' };
    const missile = createEnemyHomingMissile(pos, owner);

    expect(missile.type).toBe('missile');
    expect(missile.speed).toBe(ENEMY_HOMING_SPEED);
    expect(missile.damage).toBe(ENEMY_HOMING_DAMAGE);
    expect(missile.collisionRadius).toBe(ENEMY_HOMING_COLLISION_RADIUS);
    expect(missile.isHoming).toBe(true);
    expect(missile.turnRate).toBe(ENEMY_HOMING_TURN_RATE);
  });

  it('fires downward initially', () => {
    const missile = createEnemyHomingMissile(
      { x: 100, y: 200 },
      { type: 'enemy', id: 'e1' },
    );
    expect(missile.velocity.y).toBeGreaterThan(0); // Downward
    expect(missile.velocity.x).toBe(0);
  });

  it('is owned by enemy', () => {
    const missile = createEnemyHomingMissile(
      { x: 100, y: 200 },
      { type: 'enemy', id: 'enemyF-5' },
    );
    expect(missile.owner.type).toBe('enemy');
    expect(missile.owner.id).toBe('enemyF-5');
  });

  it('generates unique IDs', () => {
    const m1 = createEnemyHomingMissile({ x: 0, y: 0 }, { type: 'enemy', id: 'e1' });
    const m2 = createEnemyHomingMissile({ x: 0, y: 0 }, { type: 'enemy', id: 'e2' });
    expect(m1.id).not.toBe(m2.id);
  });

  it('has no homing delay', () => {
    const missile = createEnemyHomingMissile(
      { x: 0, y: 0 },
      { type: 'enemy', id: 'e1' },
    );
    expect(missile.homingDelay).toBeUndefined();
  });
});
