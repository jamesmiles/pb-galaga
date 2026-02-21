import type { MapConfig, Player } from '../types';
import { LEVEL6_MAP_WIDTH } from './constants';

/**
 * Manages Episode 2 map objects: cloud drift, dust effects, collision with boulders.
 */
export class MapManager {
  /** Drift clouds right-to-left, wrapping around when off-screen. */
  updateClouds(map: MapConfig, dtSeconds: number): void {
    for (const cloud of map.clouds) {
      cloud.position.x += cloud.speed * dtSeconds;
      // Wrap when fully off-screen left
      if (cloud.position.x + cloud.width < -50) {
        cloud.position.x = LEVEL6_MAP_WIDTH + 50 + Math.random() * 200;
      }
    }
  }

  /** Drift dust effects right-to-left, wrapping around. */
  updateDust(map: MapConfig, dtSeconds: number): void {
    for (const dust of map.dustEffects) {
      dust.position.x += dust.speed * dtSeconds;
      // Wrap when fully off-screen left
      if (dust.position.x + dust.width < -50) {
        dust.position.x = LEVEL6_MAP_WIDTH + 50 + Math.random() * 200;
      }
    }
  }

  /**
   * Check player collision against boulders and destructible rocks.
   * Pushes player out of any overlapping boulder radii.
   */
  checkBoulderCollisions(player: Player, map: MapConfig): void {
    if (!player.isAlive) return;

    for (const obj of map.objects) {
      if (obj.type !== 'boulder' && obj.type !== 'destructible-rock') continue;
      if (!obj.collisionRadius) continue;
      // Skip destroyed destructible rocks
      if (obj.type === 'destructible-rock' && obj.health !== undefined && obj.health <= 0) continue;

      const dx = player.position.x - obj.position.x;
      const dy = player.position.y - obj.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = obj.collisionRadius + 18; // 18 = tank collision radius

      if (dist < minDist && dist > 0) {
        // Push player out along the overlap vector
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        player.position.x += nx * overlap;
        player.position.y += ny * overlap;
      }
    }
  }

  /**
   * Damage a destructible map object. Returns true if destroyed.
   */
  damageMapObject(obj: { health?: number; maxHealth?: number }, damage: number): boolean {
    if (obj.health === undefined) return false;
    obj.health -= damage;
    return obj.health <= 0;
  }
}
