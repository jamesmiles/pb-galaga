import type { Projectile, ProjectileOwner, Vector2D, GameState } from '../../../../types';
import { LASER_SPEED, LASER_DAMAGE, LASER_MAX_LIFETIME, LASER_COLLISION_RADIUS, GAME_HEIGHT } from '../../../../engine/constants';

let nextProjectileId = 0;

/** Create a new laser projectile fired from a position. */
export function createLaser(position: Vector2D, owner: ProjectileOwner): Projectile {
  return {
    id: `laser-${nextProjectileId++}`,
    type: 'laser',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: -LASER_SPEED },
    rotation: 0,
    speed: LASER_SPEED,
    damage: LASER_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: LASER_MAX_LIFETIME,
    collisionRadius: LASER_COLLISION_RADIUS,
    hasCollided: false,
  };
}

/** Create a laser projectile fired downward from an enemy position. */
export function createEnemyLaser(position: Vector2D, owner: ProjectileOwner): Projectile {
  return {
    id: `laser-${nextProjectileId++}`,
    type: 'laser',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: LASER_SPEED }, // Moves downward (toward player)
    rotation: Math.PI,
    speed: LASER_SPEED,
    damage: LASER_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: LASER_MAX_LIFETIME,
    collisionRadius: LASER_COLLISION_RADIUS,
    hasCollided: false,
  };
}

/** Update a single projectile for one tick. */
export function updateProjectile(proj: Projectile, dtSeconds: number): void {
  if (!proj.isActive) return;

  // Move
  proj.position.x += proj.velocity.x * dtSeconds;
  proj.position.y += proj.velocity.y * dtSeconds;

  // Lifetime
  proj.lifetime += dtSeconds * 1000;

  // Deactivate if off-screen or expired
  if (proj.position.y < -20 || proj.position.y > GAME_HEIGHT + 20 ||
      proj.lifetime >= proj.maxLifetime || proj.hasCollided) {
    proj.isActive = false;
  }
}

/** Update all projectiles and remove inactive ones. Returns updated array. */
export function updateAllProjectiles(state: GameState, dtSeconds: number): void {
  for (const proj of state.projectiles) {
    updateProjectile(proj, dtSeconds);
  }
  // Remove inactive projectiles (creates new array — required for shared-ref safety)
  state.projectiles = state.projectiles.filter(p => p.isActive);
}

/** Spawn laser projectiles for any player that is firing. */
export function spawnPlayerLasers(state: GameState): void {
  for (const player of state.players) {
    if (player.isFiring && player.isAlive) {
      const laser = createLaser(
        { x: player.position.x, y: player.position.y - 16 },
        { type: 'player', id: player.id },
      );
      state.projectiles = [...state.projectiles, laser];
    }
  }
}
