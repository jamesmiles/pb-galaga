import { describe, it, expect } from 'vitest';
import { createSnakeLaser } from './Snake';
import { updateProjectile } from '../../laser/code/Laser';
import {
  SNAKE_SPEED, SNAKE_DAMAGE, SNAKE_COLLISION_RADIUS, SNAKE_TURN_RATE,
  SNAKE_L5_DAMAGE, SNAKE_POSITION_HISTORY_MAX,
} from '../../../../engine/constants';

const owner = { type: 'player' as const, id: 'player1' as const };
const pos = { x: 400, y: 700 };

describe('createSnakeLaser', () => {
  it('creates a snake with correct type', () => {
    const s = createSnakeLaser(pos, owner);
    expect(s.type).toBe('snake');
    expect(s.owner).toEqual(owner);
  });

  it('fires upward at snake speed', () => {
    const s = createSnakeLaser(pos, owner);
    expect(s.velocity.x).toBe(0);
    expect(s.velocity.y).toBe(-SNAKE_SPEED);
    expect(s.speed).toBe(SNAKE_SPEED);
  });

  it('has homing enabled with no delay', () => {
    const s = createSnakeLaser(pos, owner);
    expect(s.isHoming).toBe(true);
    expect(s.homingDelay).toBeUndefined();
    expect(s.turnRate).toBe(SNAKE_TURN_RATE);
  });

  it('has correct damage and collision radius', () => {
    const s = createSnakeLaser(pos, owner);
    expect(s.damage).toBe(SNAKE_DAMAGE);
    expect(s.collisionRadius).toBe(SNAKE_COLLISION_RADIUS);
  });

  it('does not have acceleration', () => {
    const s = createSnakeLaser(pos, owner);
    expect(s.acceleration).toBeUndefined();
  });

  it('generates unique IDs', () => {
    const s1 = createSnakeLaser(pos, owner);
    const s2 = createSnakeLaser(pos, owner);
    expect(s1.id).not.toBe(s2.id);
  });

  it('initializes with empty positionHistory', () => {
    const s = createSnakeLaser(pos, owner);
    expect(s.positionHistory).toBeDefined();
    expect(s.positionHistory).toHaveLength(0);
  });
});

describe('snake position history', () => {
  it('L5 snake accumulates position history on update', () => {
    const s = createSnakeLaser(pos, owner);
    s.damage = SNAKE_L5_DAMAGE;
    for (let i = 0; i < 5; i++) {
      updateProjectile(s, 1 / 60);
    }
    expect(s.positionHistory!.length).toBe(5);
  });

  it('position history is capped at max entries', () => {
    const s = createSnakeLaser(pos, owner);
    s.damage = SNAKE_L5_DAMAGE;
    for (let i = 0; i < 40; i++) {
      updateProjectile(s, 1 / 60);
    }
    expect(s.positionHistory!.length).toBeLessThanOrEqual(SNAKE_POSITION_HISTORY_MAX);
  });

  it('non-L5 snake does NOT accumulate position history', () => {
    const s = createSnakeLaser(pos, owner);
    // Default snake damage is SNAKE_DAMAGE (75), not SNAKE_L5_DAMAGE (94)
    for (let i = 0; i < 5; i++) {
      updateProjectile(s, 1 / 60);
    }
    expect(s.positionHistory!.length).toBe(0);
  });
});
