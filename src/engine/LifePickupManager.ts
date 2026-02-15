import type { GameState, LifePickup } from '../types';
import { LIFE_DROP_CHANCE, LIFE_PICKUP_SPEED, LIFE_PICKUP_LIFETIME, GAME_HEIGHT } from './constants';

let nextLifePickupId = 0;

/**
 * Manages life drop pickups — 50% chance per level, spawns once randomly during the level.
 * Drops as a heart icon drifting downward.
 */
export class LifePickupManager {
  private spawnedThisLevel = false;
  private spawnCheckDone = false;
  private spawnAtTime = 0;

  /** Update life pickups: spawn check and movement. */
  update(state: GameState, dtMs: number): void {
    // Determine spawn timing at start of level
    if (!this.spawnCheckDone && state.gameStatus === 'playing') {
      this.spawnCheckDone = true;
      if (Math.random() < LIFE_DROP_CHANCE) {
        // Schedule spawn 5-15 seconds into the level
        this.spawnAtTime = state.currentTime + 5000 + Math.random() * 10000;
      }
    }

    // Spawn if scheduled
    if (!this.spawnedThisLevel && this.spawnAtTime > 0 && state.currentTime >= this.spawnAtTime) {
      this.spawnedThisLevel = true;
      const pickup: LifePickup = {
        id: `life-${nextLifePickupId++}`,
        position: { x: 100 + Math.random() * 600, y: -20 },
        velocity: { x: 0, y: LIFE_PICKUP_SPEED },
        isActive: true,
        lifetime: 0,
      };
      state.lifePickups = [...state.lifePickups, pickup];
    }

    // Update position and lifetime
    const dtSeconds = dtMs / 1000;
    for (const pickup of state.lifePickups) {
      if (!pickup.isActive) continue;
      pickup.position.y += pickup.velocity.y * dtSeconds;
      pickup.lifetime += dtMs;

      if (pickup.lifetime >= LIFE_PICKUP_LIFETIME || pickup.position.y > GAME_HEIGHT + 20) {
        pickup.isActive = false;
      }
    }

    // Remove inactive
    state.lifePickups = state.lifePickups.filter(p => p.isActive);
  }

  reset(): void {
    this.spawnedThisLevel = false;
    this.spawnCheckDone = false;
    this.spawnAtTime = 0;
  }
}
