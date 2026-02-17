import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  SNAKE_SPEED, SNAKE_DAMAGE, SNAKE_MAX_LIFETIME,
  SNAKE_COLLISION_RADIUS, SNAKE_TURN_RATE,
} from '../../../../engine/constants';

let nextSnakeId = 0;

/** Create a snake laser — a homing beam that curves toward the nearest enemy. */
export function createSnakeLaser(
  position: Vector2D,
  owner: ProjectileOwner,
): Projectile {
  return {
    id: `snake-${nextSnakeId++}`,
    type: 'snake',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: -SNAKE_SPEED },
    rotation: 0,
    speed: SNAKE_SPEED,
    damage: SNAKE_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: SNAKE_MAX_LIFETIME,
    collisionRadius: SNAKE_COLLISION_RADIUS,
    hasCollided: false,
    turnRate: SNAKE_TURN_RATE,
    isHoming: true,
  };
}
