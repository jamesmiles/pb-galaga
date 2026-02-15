import type { GameState, LifePickup, RespawnPickup } from '../types';
import { LIFE_DROP_CHANCE, LIFE_PICKUP_SPEED, LIFE_PICKUP_LIFETIME, GAME_HEIGHT } from './constants';

let nextLifePickupId = 0;
let nextRespawnPickupId = 0;

/**
 * Manages life drop pickups — 50% chance per level, spawns once randomly during the level.
 * Also manages respawn pickups in co-op: once per level when a player is out of lives.
 */
export class LifePickupManager {
  private spawnedThisLevel = false;
  private spawnCheckDone = false;
  private spawnAtTime = 0;
  private respawnSpawnedThisLevel = false;
  private respawnCheckDone = false;
  private respawnAtTime = 0;

  /** Update life pickups and respawn pickups. */
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

    // Co-op respawn pickup logic
    this.updateRespawnPickups(state, dtMs);
  }

  private updateRespawnPickups(state: GameState, dtMs: number): void {
    if (state.gameMode !== 'co-op' || state.gameStatus !== 'playing') return;

    // Check if a player is permanently dead (0 lives, not alive)
    const deadPlayer = state.players.find(p => !p.isAlive && p.lives <= 0 && !p.deathSequence?.active);
    const alivePlayer = state.players.find(p => p.isAlive || p.lives > 0);

    // Schedule respawn pickup spawn once per level when a player is out
    if (!this.respawnCheckDone && deadPlayer && alivePlayer) {
      this.respawnCheckDone = true;
      this.respawnAtTime = state.currentTime + 8000 + Math.random() * 7000;
    }

    // Spawn respawn pickup
    if (!this.respawnSpawnedThisLevel && this.respawnAtTime > 0 && state.currentTime >= this.respawnAtTime && deadPlayer) {
      this.respawnSpawnedThisLevel = true;
      const pickup: RespawnPickup = {
        id: `respawn-${nextRespawnPickupId++}`,
        targetPlayerId: deadPlayer.id,
        position: { x: 100 + Math.random() * 600, y: -20 },
        velocity: { x: 0, y: LIFE_PICKUP_SPEED * 0.8 },
        isActive: true,
        lifetime: 0,
      };
      state.respawnPickups = [...state.respawnPickups, pickup];
    }

    // Update position and lifetime
    const dtSeconds = dtMs / 1000;
    for (const pickup of state.respawnPickups) {
      if (!pickup.isActive) continue;
      pickup.position.y += pickup.velocity.y * dtSeconds;
      pickup.lifetime += dtMs;

      if (pickup.lifetime >= LIFE_PICKUP_LIFETIME || pickup.position.y > GAME_HEIGHT + 20) {
        pickup.isActive = false;
      }
    }

    state.respawnPickups = state.respawnPickups.filter(p => p.isActive);
  }

  reset(): void {
    this.spawnedThisLevel = false;
    this.spawnCheckDone = false;
    this.spawnAtTime = 0;
    this.respawnSpawnedThisLevel = false;
    this.respawnCheckDone = false;
    this.respawnAtTime = 0;
  }
}
