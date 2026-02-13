import type { GameState, Player, Projectile } from '../types';
import { createLaser } from '../objects/projectiles/laser/code/Laser';
import { updateProjectile } from '../objects/projectiles/laser/code/Laser';
import { LASER_FIRE_COOLDOWN } from './constants';

/** Update all projectiles and remove inactive ones. */
export function updateProjectiles(state: GameState, dtSeconds: number): void {
  for (const proj of state.projectiles) {
    updateProjectile(proj, dtSeconds);
  }
  state.projectiles = state.projectiles.filter((p) => p.isActive && !p.hasCollided);
}

/** Handle player firing logic. */
export function handlePlayerFiring(state: GameState, player: Player): void {
  if (!player.isAlive || !player.input.fire || player.fireCooldown > 0) return;

  const laser = createLaser(
    { type: 'player', id: player.id },
    { x: player.position.x, y: player.position.y - 15 },
  );
  state.projectiles.push(laser);
  player.fireCooldown = LASER_FIRE_COOLDOWN;
}
