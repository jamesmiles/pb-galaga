import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  MISSILE_LAUNCH_SPEED, MISSILE_MAX_SPEED, MISSILE_ACCELERATION,
  MISSILE_DAMAGE, MISSILE_MAX_LIFETIME, MISSILE_COLLISION_RADIUS,
  MISSILE_TURN_RATE, MISSILE_HOMING_DELAY,
} from '../../../../engine/constants';

let nextMissileId = 0;

/** Create a player homing missile that fans out then curves toward enemies. */
export function createPlayerMissile(
  position: Vector2D,
  owner: ProjectileOwner,
  angle: number,
): Projectile {
  const vx = Math.sin(angle) * MISSILE_LAUNCH_SPEED;
  const vy = -Math.cos(angle) * MISSILE_LAUNCH_SPEED;
  return {
    id: `missile-${nextMissileId++}`,
    type: 'missile',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: vx, y: vy },
    rotation: angle,
    speed: MISSILE_LAUNCH_SPEED,
    damage: MISSILE_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: MISSILE_MAX_LIFETIME,
    collisionRadius: MISSILE_COLLISION_RADIUS,
    hasCollided: false,
    acceleration: MISSILE_ACCELERATION,
    maxSpeed: MISSILE_MAX_SPEED,
    turnRate: MISSILE_TURN_RATE,
    isHoming: true,
    homingDelay: MISSILE_HOMING_DELAY,
  };
}
