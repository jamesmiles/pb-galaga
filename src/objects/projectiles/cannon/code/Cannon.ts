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
export function createCannonShell(
  position: Vector2D,
  turretAngle: number,
  owner: ProjectileOwner,
  overrides?: { damage?: number; range?: number; collisionRadius?: number },
): Projectile {
  const damage = overrides?.damage ?? CANNON_DAMAGE;
  const range = overrides?.range ?? CANNON_RANGE;
  const cr = overrides?.collisionRadius ?? CANNON_COLLISION_RADIUS;

  const vx = Math.cos(turretAngle) * CANNON_SPEED;
  const vy = -Math.sin(turretAngle) * CANNON_SPEED;
  const maxLifetime = (range / CANNON_SPEED) * 1000;

  return {
    id: `cannon-${nextId++}`,
    type: 'cannon-shell',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: vx, y: vy },
    rotation: turretAngle,
    speed: CANNON_SPEED,
    damage,
    isActive: true,
    lifetime: 0,
    maxLifetime,
    collisionRadius: cr,
    hasCollided: false,
  };
}
