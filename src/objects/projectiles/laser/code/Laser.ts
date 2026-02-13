import type { Projectile, ProjectileOwner, Vector2D } from '../../../../types';
import {
  LASER_SPEED, LASER_DAMAGE, LASER_MAX_LIFETIME, LASER_COLLISION_RADIUS,
  GAME_HEIGHT,
} from '../../../../engine/constants';

let nextLaserId = 0;

export function createLaser(owner: ProjectileOwner, position: Vector2D): Projectile {
  const isPlayerOwned = owner.type === 'player';
  return {
    id: `laser-${nextLaserId++}`,
    type: 'laser',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: isPlayerOwned ? -LASER_SPEED : LASER_SPEED },
    rotation: isPlayerOwned ? 0 : Math.PI,
    speed: LASER_SPEED,
    damage: LASER_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: LASER_MAX_LIFETIME,
    collisionRadius: LASER_COLLISION_RADIUS,
    hasCollided: false,
  };
}

export function updateProjectile(proj: Projectile, dtSeconds: number): void {
  if (!proj.isActive) return;

  // Update position
  proj.position.x += proj.velocity.x * dtSeconds;
  proj.position.y += proj.velocity.y * dtSeconds;

  // Update lifetime
  proj.lifetime += dtSeconds * 1000;

  // Deactivate if lifetime exceeded or off-screen
  if (proj.lifetime >= proj.maxLifetime) {
    proj.isActive = false;
  }
  if (proj.position.y < -50 || proj.position.y > GAME_HEIGHT + 50) {
    proj.isActive = false;
  }
}

export function resetLaserIdCounter(): void {
  nextLaserId = 0;
}
