import { describe, it, expect } from 'vitest';
import { createPlayerRocket } from './Rocket';
import {
  ROCKET_LAUNCH_SPEED, ROCKET_MAX_SPEED, ROCKET_ACCELERATION,
  ROCKET_DAMAGE, ROCKET_COLLISION_RADIUS,
} from '../../../../engine/constants';

const owner = { type: 'player' as const, id: 'player1' as const };
const pos = { x: 400, y: 700 };

describe('createPlayerRocket', () => {
  it('creates a rocket with correct type', () => {
    const r = createPlayerRocket(pos, owner, 'left');
    expect(r.type).toBe('rocket');
    expect(r.owner).toEqual(owner);
  });

  it('fires upward at launch speed', () => {
    const r = createPlayerRocket(pos, owner, 'left');
    expect(r.velocity.y).toBe(-ROCKET_LAUNCH_SPEED);
    expect(r.speed).toBe(ROCKET_LAUNCH_SPEED);
  });

  it('offsets left rocket to the left', () => {
    const r = createPlayerRocket(pos, owner, 'left');
    expect(r.position.x).toBe(380);
    expect(r.position.y).toBe(700);
  });

  it('offsets right rocket to the right', () => {
    const r = createPlayerRocket(pos, owner, 'right');
    expect(r.position.x).toBe(420);
  });

  it('has acceleration and maxSpeed fields', () => {
    const r = createPlayerRocket(pos, owner, 'left');
    expect(r.acceleration).toBe(ROCKET_ACCELERATION);
    expect(r.maxSpeed).toBe(ROCKET_MAX_SPEED);
  });

  it('has correct damage and collision radius', () => {
    const r = createPlayerRocket(pos, owner, 'left');
    expect(r.damage).toBe(ROCKET_DAMAGE);
    expect(r.collisionRadius).toBe(ROCKET_COLLISION_RADIUS);
  });

  it('is not homing', () => {
    const r = createPlayerRocket(pos, owner, 'left');
    expect(r.isHoming).toBeUndefined();
  });

  it('generates unique IDs', () => {
    const r1 = createPlayerRocket(pos, owner, 'left');
    const r2 = createPlayerRocket(pos, owner, 'right');
    expect(r1.id).not.toBe(r2.id);
  });
});
