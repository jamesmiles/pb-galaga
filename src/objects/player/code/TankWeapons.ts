import type { GameState, Projectile } from '../../../types';
import { createCannonShell } from '../../projectiles/cannon/code/Cannon';
import { createPlasmaBolt } from '../../projectiles/plasmaBolt/code/PlasmaBolt';
import { CANNON_FIRE_COOLDOWN, PLASMA_BOLT_FIRE_COOLDOWN, TANK_TURRET_LENGTH } from '../../../engine/constants';

/**
 * Spawn tank projectiles for any player that is firing.
 * Cannon for 'cannon' primary weapon, plasma bolt for 'plasma-artillery'.
 */
export function spawnTankProjectiles(state: GameState): void {
  if (!state.tankStates) return;

  for (const player of state.players) {
    if (!player.isFiring || !player.isAlive) continue;

    const tank = state.tankStates[player.id];
    if (!tank) continue;

    // Check cooldown
    if (player.fireCooldown > 0) continue;

    const owner = { type: 'player' as const, id: player.id };

    // Turret tip position: offset from player center along turret angle
    const tipX = player.position.x + Math.cos(tank.turretAngle) * TANK_TURRET_LENGTH;
    const tipY = player.position.y - Math.sin(tank.turretAngle) * TANK_TURRET_LENGTH;
    const tipPos = { x: tipX, y: tipY };

    const newProjectiles: Projectile[] = [];

    if (player.primaryWeapon === 'cannon') {
      newProjectiles.push(createCannonShell(tipPos, tank.turretAngle, owner));
      player.fireCooldown = CANNON_FIRE_COOLDOWN;
    } else if (player.primaryWeapon === 'plasma-artillery') {
      newProjectiles.push(createPlasmaBolt(tipPos, tank.turretAngle, owner));
      player.fireCooldown = PLASMA_BOLT_FIRE_COOLDOWN;
    }

    if (newProjectiles.length > 0) {
      // Trigger turret recoil
      tank.turretRecoil = 1.0;
      state.projectiles = [...state.projectiles, ...newProjectiles];
    }
  }
}
