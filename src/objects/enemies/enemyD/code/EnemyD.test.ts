import { describe, it, expect } from 'vitest';
import { createEnemyD } from './EnemyD';
import { ENEMY_D_HEALTH, ENEMY_D_SCORE_VALUE, ENEMY_D_COLLISION_RADIUS } from '../../../../engine/constants';

describe('EnemyD (Curved Fighter)', () => {
  it('creates an enemy with type D', () => {
    const e = createEnemyD(0, 0);
    expect(e.type).toBe('D');
  });

  it('uses correct health and score constants', () => {
    const e = createEnemyD(0, 0);
    expect(e.health).toBe(ENEMY_D_HEALTH);
    expect(e.maxHealth).toBe(ENEMY_D_HEALTH);
    expect(e.scoreValue).toBe(ENEMY_D_SCORE_VALUE);
    expect(e.collisionRadius).toBe(ENEMY_D_COLLISION_RADIUS);
  });

  it('has plasma fire mode with 2500ms fire rate', () => {
    const e = createEnemyD(0, 0);
    expect(e.fireMode).toBe('plasma');
    expect(e.fireRate).toBe(2500);
  });

  it('assigns formation row and col', () => {
    const e = createEnemyD(2, 5);
    expect(e.formationRow).toBe(2);
    expect(e.formationCol).toBe(5);
  });

  it('starts alive with no dive or flight path state', () => {
    const e = createEnemyD(0, 0);
    expect(e.isAlive).toBe(true);
    expect(e.diveState).toBeNull();
    expect(e.flightPathState).toBeNull();
  });

  it('generates unique IDs', () => {
    const a = createEnemyD(0, 0);
    const b = createEnemyD(0, 1);
    expect(a.id).not.toBe(b.id);
  });

  it('starts at position (0,0)', () => {
    const e = createEnemyD(0, 0);
    expect(e.position.x).toBe(0);
    expect(e.position.y).toBe(0);
  });
});
