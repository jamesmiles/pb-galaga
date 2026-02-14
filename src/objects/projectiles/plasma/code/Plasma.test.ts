import { describe, it, expect } from 'vitest';
import { createPlasma } from './Plasma';
import { PLASMA_SPEED, PLASMA_DAMAGE, PLASMA_MAX_LIFETIME, PLASMA_COLLISION_RADIUS } from '../../../../engine/constants';

describe('Plasma Projectile', () => {
  const owner = { type: 'enemy' as const, id: 'enemyD-0' };
  const position = { x: 100, y: 200 };

  it('creates a projectile with type plasma', () => {
    const p = createPlasma(position, owner);
    expect(p.type).toBe('plasma');
  });

  it('fires downward at PLASMA_SPEED', () => {
    const p = createPlasma(position, owner);
    expect(p.velocity.x).toBe(0);
    expect(p.velocity.y).toBe(PLASMA_SPEED);
    expect(p.speed).toBe(PLASMA_SPEED);
  });

  it('uses correct damage and collision radius', () => {
    const p = createPlasma(position, owner);
    expect(p.damage).toBe(PLASMA_DAMAGE);
    expect(p.collisionRadius).toBe(PLASMA_COLLISION_RADIUS);
  });

  it('has correct max lifetime', () => {
    const p = createPlasma(position, owner);
    expect(p.maxLifetime).toBe(PLASMA_MAX_LIFETIME);
  });

  it('starts active and not collided', () => {
    const p = createPlasma(position, owner);
    expect(p.isActive).toBe(true);
    expect(p.hasCollided).toBe(false);
    expect(p.lifetime).toBe(0);
  });

  it('copies position by value', () => {
    const p = createPlasma(position, owner);
    expect(p.position.x).toBe(100);
    expect(p.position.y).toBe(200);
    p.position.x = 999;
    expect(position.x).toBe(100);
  });

  it('generates unique IDs', () => {
    const a = createPlasma(position, owner);
    const b = createPlasma(position, owner);
    expect(a.id).not.toBe(b.id);
  });

  it('assigns owner correctly', () => {
    const p = createPlasma(position, owner);
    expect(p.owner).toEqual(owner);
  });
});
