import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import { BULLET_SPEED, BULLET_DAMAGE, BULLET_MAX_LIFETIME, BULLET_COLLISION_RADIUS } from '../../../../engine/constants';

let nextBulletId = 0;

/** Create a bullet projectile fired downward from an enemy position. */
export function createBullet(position: Vector2D, owner: ProjectileOwner): Projectile {
  return {
    id: `bullet-${nextBulletId++}`,
    type: 'bullet',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: BULLET_SPEED }, // Moves downward (toward player)
    rotation: Math.PI,
    speed: BULLET_SPEED,
    damage: BULLET_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: BULLET_MAX_LIFETIME,
    collisionRadius: BULLET_COLLISION_RADIUS,
    hasCollided: false,
  };
}
