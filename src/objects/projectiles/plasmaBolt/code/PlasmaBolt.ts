import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  PLASMA_BOLT_SPEED,
  PLASMA_BOLT_DAMAGE,
  PLASMA_BOLT_COLLISION_RADIUS,
  PLASMA_BOLT_RANGE,
} from '../../../../engine/constants';

let nextId = 0;

/**
 * Create a plasma bolt fired from a tank turret.
 * Shorter range than cannon, higher damage.
 */
export function createPlasmaBolt(position: Vector2D, turretAngle: number, owner: ProjectileOwner): Projectile {
  const vx = Math.cos(turretAngle) * PLASMA_BOLT_SPEED;
  const vy = -Math.sin(turretAngle) * PLASMA_BOLT_SPEED;

  const maxLifetime = (PLASMA_BOLT_RANGE / PLASMA_BOLT_SPEED) * 1000;

  return {
    id: `plasma-bolt-${nextId++}`,
    type: 'plasma-bolt',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: vx, y: vy },
    rotation: turretAngle,
    speed: PLASMA_BOLT_SPEED,
    damage: PLASMA_BOLT_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime,
    collisionRadius: PLASMA_BOLT_COLLISION_RADIUS,
    hasCollided: false,
  };
}
