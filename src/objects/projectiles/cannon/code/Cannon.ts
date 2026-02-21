import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  CANNON_SPEED,
  CANNON_DAMAGE,
  CANNON_COLLISION_RADIUS,
  CANNON_RANGE,
} from '../../../../engine/constants';

let nextId = 0;

/**
 * Create a cannon shell fired from a tank turret.
 * The shell travels straight along the turret angle and deactivates at max range.
 */
export function createCannonShell(position: Vector2D, turretAngle: number, owner: ProjectileOwner): Projectile {
  // turretAngle is in [0, PI] — 0 = east, PI/2 = north, PI = west
  // Velocity: cos(angle) for X, -sin(angle) for Y (canvas Y is inverted)
  const vx = Math.cos(turretAngle) * CANNON_SPEED;
  const vy = -Math.sin(turretAngle) * CANNON_SPEED;

  // maxLifetime derived from range / speed
  const maxLifetime = (CANNON_RANGE / CANNON_SPEED) * 1000;

  return {
    id: `cannon-${nextId++}`,
    type: 'cannon-shell',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: vx, y: vy },
    rotation: turretAngle,
    speed: CANNON_SPEED,
    damage: CANNON_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime,
    collisionRadius: CANNON_COLLISION_RADIUS,
    hasCollided: false,
  };
}
