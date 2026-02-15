import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  ROCKET_LAUNCH_SPEED, ROCKET_MAX_SPEED, ROCKET_ACCELERATION,
  ROCKET_DAMAGE, ROCKET_MAX_LIFETIME, ROCKET_COLLISION_RADIUS,
} from '../../../../engine/constants';

let nextRocketId = 0;

/** Create a player rocket that fires upward with slight X offset, then accelerates. */
export function createPlayerRocket(
  position: Vector2D,
  owner: ProjectileOwner,
  side: 'left' | 'right',
): Projectile {
  const xOffset = side === 'left' ? -20 : 20;
  return {
    id: `rocket-${nextRocketId++}`,
    type: 'rocket',
    owner,
    position: { x: position.x + xOffset, y: position.y },
    velocity: { x: 0, y: -ROCKET_LAUNCH_SPEED },
    rotation: 0,
    speed: ROCKET_LAUNCH_SPEED,
    damage: ROCKET_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: ROCKET_MAX_LIFETIME,
    collisionRadius: ROCKET_COLLISION_RADIUS,
    hasCollided: false,
    acceleration: ROCKET_ACCELERATION,
    maxSpeed: ROCKET_MAX_SPEED,
  };
}
