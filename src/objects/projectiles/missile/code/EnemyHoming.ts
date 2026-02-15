import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  ENEMY_HOMING_SPEED, ENEMY_HOMING_TURN_RATE,
  ENEMY_HOMING_DAMAGE, ENEMY_HOMING_MAX_LIFETIME,
  ENEMY_HOMING_COLLISION_RADIUS,
} from '../../../../engine/constants';

let nextEnemyHomingId = 0;

/** Create an enemy-fired homing missile that tracks players. */
export function createEnemyHomingMissile(
  position: Vector2D,
  owner: ProjectileOwner,
): Projectile {
  return {
    id: `enemy-homing-${nextEnemyHomingId++}`,
    type: 'missile',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: ENEMY_HOMING_SPEED }, // Fires downward initially
    rotation: Math.PI,
    speed: ENEMY_HOMING_SPEED,
    damage: ENEMY_HOMING_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: ENEMY_HOMING_MAX_LIFETIME,
    collisionRadius: ENEMY_HOMING_COLLISION_RADIUS,
    hasCollided: false,
    turnRate: ENEMY_HOMING_TURN_RATE,
    isHoming: true,
  };
}
