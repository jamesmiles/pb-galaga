import type { Player, WeaponPickup } from '../types';
import { SECONDARY_WEAPON_DURATION } from './constants';

/**
 * Manages player weapon state: upgrades, switches, and secondary timer.
 */

/** Apply a weapon pickup to the player. */
export function upgradeWeapon(player: Player, pickup: WeaponPickup): void {
  if (pickup.category === 'primary') {
    const weapon = pickup.currentWeapon as 'laser' | 'bullet';
    if (weapon === player.primaryWeapon) {
      // Same type: upgrade level (cap at 4)
      if (player.primaryLevel < 4) {
        player.primaryLevel = (player.primaryLevel + 1) as 1 | 2 | 3 | 4;
      }
    } else {
      // Different type: switch and reset to level 1
      player.primaryWeapon = weapon;
      player.primaryLevel = 1;
    }
  } else {
    const weapon = pickup.currentWeapon as 'rocket' | 'missile';
    // Set/replace secondary weapon, reset timer
    player.secondaryWeapon = weapon;
    player.secondaryTimer = SECONDARY_WEAPON_DURATION;
    player.secondaryCooldown = 0;
  }
}

/** Count down the secondary weapon timer; clear when expired. */
export function updateSecondaryTimer(player: Player, dtMs: number): void {
  if (player.secondaryWeapon === null) return;
  player.secondaryTimer -= dtMs;
  if (player.secondaryTimer <= 0) {
    player.secondaryWeapon = null;
    player.secondaryTimer = 0;
    player.secondaryCooldown = 0;
  }
}
