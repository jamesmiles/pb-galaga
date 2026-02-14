import { describe, it, expect } from 'vitest';
import { createEnemyE } from './EnemyE';
import { ENEMY_E_HEALTH, ENEMY_E_SCORE_VALUE, ENEMY_E_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyE (Strategic Bomber)', () => {
  it('creates an enemy with type E', () => {
    const e = createEnemyE(0, 0);
    expect(e.type).toBe('E');
  });

  it('uses correct health and score constants', () => {
    const e = createEnemyE(0, 0);
    expect(e.health).toBe(ENEMY_E_HEALTH);
    expect(e.maxHealth).toBe(ENEMY_E_HEALTH);
    expect(e.scoreValue).toBe(ENEMY_E_SCORE_VALUE);
    expect(e.collisionRadius).toBe(ENEMY_E_COLLISION_RADIUS);
  });

  it('has spread fire mode with 4000ms fire rate', () => {
    const e = createEnemyE(0, 0);
    expect(e.fireMode).toBe('spread');
    expect(e.fireRate).toBe(4000);
  });

  it('assigns formation row and col', () => {
    const e = createEnemyE(3, 7);
    expect(e.formationRow).toBe(3);
    expect(e.formationCol).toBe(7);
  });

  it('starts alive with no dive or flight path state', () => {
    const e = createEnemyE(0, 0);
    expect(e.isAlive).toBe(true);
    expect(e.diveState).toBeNull();
    expect(e.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const a = createEnemyE(0, 0);
    const b = createEnemyE(0, 1);
    expect(a.id).not.toBe(b.id);
  });

  it('starts at position (0,0)', () => {
    const e = createEnemyE(0, 0);
    expect(e.position.x).toBe(0);
    expect(e.position.y).toBe(0);
  });
});
