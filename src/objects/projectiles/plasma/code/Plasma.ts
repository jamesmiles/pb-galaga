import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import { PLASMA_SPEED, PLASMA_DAMAGE, PLASMA_MAX_LIFETIME, PLASMA_COLLISION_RADIUS } from '../../../../engine/constants';

let nextPlasmaId = 0;

/** Create a plasma projectile fired downward from an enemy position. */
export function createPlasma(position: Vector2D, owner: ProjectileOwner): Projectile {
  return {
    id: `plasma-${nextPlasmaId++}`,
    type: 'plasma',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: PLASMA_SPEED },
    rotation: Math.PI,
    speed: PLASMA_SPEED,
    damage: PLASMA_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: PLASMA_MAX_LIFETIME,
    collisionRadius: PLASMA_COLLISION_RADIUS,
    hasCollided: false,
  };
}
