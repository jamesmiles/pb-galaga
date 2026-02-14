import { describe, it, expect } from 'vitest';
import { createPlayerMissile } from './Missile';
import {
  MISSILE_LAUNCH_SPEED, MISSILE_MAX_SPEED, MISSILE_ACCELERATION,
  MISSILE_DAMAGE, MISSILE_COLLISION_RADIUS, MISSILE_TURN_RATE,
  MISSILE_HOMING_DELAY,
} from '../../../../engine/constants';

const owner = { type: 'player' as const, id: 'player1' as const };
const pos = { x: 400, y: 700 };

describe('createPlayerMissile', () => {
  it('creates a missile with correct type', () => {
    const m = createPlayerMissile(pos, owner, 0);
    expect(m.type).toBe('missile');
    expect(m.owner).toEqual(owner);
  });

  it('fires upward when angle is 0', () => {
    const m = createPlayerMissile(pos, owner, 0);
    expect(m.velocity.x).toBeCloseTo(0, 5);
    expect(m.velocity.y).toBeCloseTo(-MISSILE_LAUNCH_SPEED, 5);
  });

  it('fans left when angle is negative', () => {
    const angle = -15 * Math.PI / 180;
    const m = createPlayerMissile(pos, owner, angle);
    expect(m.velocity.x).toBeLessThan(0);
    expect(m.velocity.y).toBeLessThan(0);
  });

  it('fans right when angle is positive', () => {
    const angle = 15 * Math.PI / 180;
    const m = createPlayerMissile(pos, owner, angle);
    expect(m.velocity.x).toBeGreaterThan(0);
    expect(m.velocity.y).toBeLessThan(0);
  });

  it('has homing enabled with delay', () => {
    const m = createPlayerMissile(pos, owner, 0);
    expect(m.isHoming).toBe(true);
    expect(m.homingDelay).toBe(MISSILE_HOMING_DELAY);
    expect(m.turnRate).toBe(MISSILE_TURN_RATE);
  });

  it('has acceleration and maxSpeed fields', () => {
    const m = createPlayerMissile(pos, owner, 0);
    expect(m.acceleration).toBe(MISSILE_ACCELERATION);
    expect(m.maxSpeed).toBe(MISSILE_MAX_SPEED);
  });

  it('has correct damage and collision radius', () => {
    const m = createPlayerMissile(pos, owner, 0);
    expect(m.damage).toBe(MISSILE_DAMAGE);
    expect(m.collisionRadius).toBe(MISSILE_COLLISION_RADIUS);
  });

  it('generates unique IDs', () => {
    const m1 = createPlayerMissile(pos, owner, 0);
    const m2 = createPlayerMissile(pos, owner, 0.1);
    expect(m1.id).not.toBe(m2.id);
  });
});
