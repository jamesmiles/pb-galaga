import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import { BULLET_COLLISION_RADIUS, EP2_ENEMY_PROJECTILE_LIFETIME } from '../../../../engine/constants';

let nextId = 0;

/** Create a directional bullet for Episode 2 ground enemies. */
export function createEp2EnemyBullet(
  position: Vector2D,
  angle: number,
  owner: ProjectileOwner,
  speed: number,
  damage: number,
  elevation: number,
): Projectile {
  return {
    id: `ep2-bullet-${nextId++}`,
    type: 'bullet',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
    rotation: angle,
    speed,
    damage,
    isActive: true,
    lifetime: 0,
    maxLifetime: EP2_ENEMY_PROJECTILE_LIFETIME,
    collisionRadius: BULLET_COLLISION_RADIUS,
    hasCollided: false,
    elevation,
  };
}
