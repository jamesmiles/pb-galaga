import type { GameState, WeaponPickup, Vector2D } from '../types';
import {
  WEAPON_PICKUP_DROP_CHANCE, WEAPON_PICKUP_CYCLE_INTERVAL,
  WEAPON_PICKUP_SPEED, WEAPON_PICKUP_LIFETIME,
} from './constants';

let nextPickupId = 0;

/**
 * Manages weapon pickup spawning, cycling, and despawning.
 */
export class WeaponPickupManager {

  /** Roll for a weapon pickup drop at the given position. */
  maybeSpawnPickup(state: GameState, position: Vector2D): void {
    if (Math.random() >= WEAPON_PICKUP_DROP_CHANCE) return;

    const isPrimary = Math.random() < 0.7;
    const category = isPrimary ? 'primary' : 'secondary';
    const currentWeapon = isPrimary
      ? (Math.random() < 0.5 ? 'laser' : 'bullet') as WeaponPickup['currentWeapon']
      : (Math.random() < 0.5 ? 'rocket' : 'missile') as WeaponPickup['currentWeapon'];

    const pickup: WeaponPickup = {
      id: `wp-${nextPickupId++}`,
      category,
      currentWeapon,
      position: { x: position.x, y: position.y },
      velocity: { x: 0, y: WEAPON_PICKUP_SPEED },
      isActive: true,
      cycleTimer: WEAPON_PICKUP_CYCLE_INTERVAL,
      lifetime: 0,
    };

    state.weaponPickups = [...state.weaponPickups, pickup];
  }

  /** Update all active pickups: movement, cycling, despawn. */
  updatePickups(state: GameState, dtMs: number): void {
    const dtSec = dtMs / 1000;

    for (const pickup of state.weaponPickups) {
      if (!pickup.isActive) continue;

      // Movement
      pickup.position.x += pickup.velocity.x * dtSec;
      pickup.position.y += pickup.velocity.y * dtSec;

      // Lifetime
      pickup.lifetime += dtMs;
      if (pickup.lifetime >= WEAPON_PICKUP_LIFETIME) {
        pickup.isActive = false;
        continue;
      }

      // Cycle weapon type
      pickup.cycleTimer -= dtMs;
      if (pickup.cycleTimer <= 0) {
        pickup.cycleTimer = WEAPON_PICKUP_CYCLE_INTERVAL;
        if (pickup.category === 'primary') {
          pickup.currentWeapon = pickup.currentWeapon === 'laser' ? 'bullet' : 'laser';
        } else {
          pickup.currentWeapon = pickup.currentWeapon === 'rocket' ? 'missile' : 'rocket';
        }
      }
    }

    // Remove inactive pickups
    state.weaponPickups = state.weaponPickups.filter(p => p.isActive);
  }
}
