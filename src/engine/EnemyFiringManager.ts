import type { GameState, Enemy } from '../types';
import { createEnemyLaser } from '../objects/projectiles/laser/code/Laser';
import { createBullet } from '../objects/projectiles/bullet/code/Bullet';
import { createPlasma } from '../objects/projectiles/plasma/code/Plasma';
import { BULLET_SPEED } from './constants';

/** Fire rate config per enemy fire mode (ms). */
const FIRE_RATE_CONFIG: Record<string, { base: number; jitter: number }> = {
  laser: { base: 3000, jitter: 500 },
  bullet: { base: 2000, jitter: 500 },
  plasma: { base: 2500, jitter: 400 },
  spread: { base: 4000, jitter: 600 },
};

/**
 * Manages enemy firing behavior.
 * Only front-row enemies fire. Each enemy has an independent cooldown with jitter.
 */
export class EnemyFiringManager {
  private cooldowns: Map<string, number> = new Map();

  update(state: GameState, dtSeconds: number): void {
    const aliveEnemies = state.enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0) return;

    const frontRowIds = this.getFrontRowEnemyIds(aliveEnemies);

    for (const enemy of aliveEnemies) {
      if (enemy.fireMode === 'none') continue;
      if (!frontRowIds.has(enemy.id)) continue;

      // Initialize cooldown if not set
      if (!this.cooldowns.has(enemy.id)) {
        this.cooldowns.set(enemy.id, this.randomCooldown(enemy.fireMode));
      }

      // Decrement cooldown
      let cd = this.cooldowns.get(enemy.id)!;
      cd -= dtSeconds * 1000;

      if (cd <= 0) {
        this.fireProjectile(state, enemy);
        cd = this.randomCooldown(enemy.fireMode);
      }

      this.cooldowns.set(enemy.id, cd);
    }

    // Clean up cooldowns for dead enemies
    for (const [id] of this.cooldowns) {
      if (!aliveEnemies.some(e => e.id === id)) {
        this.cooldowns.delete(id);
      }
    }
  }

  /** Get IDs of front-row enemies (no alive enemy in same column has a higher Y). */
  getFrontRowEnemyIds(aliveEnemies: Enemy[]): Set<string> {
    // Group by column, find the one with highest Y (closest to player)
    const colMaxY: Map<number, { id: string; y: number }> = new Map();

    for (const enemy of aliveEnemies) {
      const existing = colMaxY.get(enemy.formationCol);
      if (!existing || enemy.position.y > existing.y) {
        colMaxY.set(enemy.formationCol, { id: enemy.id, y: enemy.position.y });
      }
    }

    return new Set([...colMaxY.values()].map(v => v.id));
  }

  private fireProjectile(state: GameState, enemy: Enemy): void {
    const owner = { type: 'enemy' as const, id: enemy.id };
    const position = { x: enemy.position.x, y: enemy.position.y + 16 };

    if (enemy.fireMode === 'spread') {
      // 4-bullet fan pattern: -12°, -4°, +4°, +12° from vertical
      const angles = [-12, -4, 4, 12];
      const newProjectiles = angles.map(deg => {
        const rad = (deg * Math.PI) / 180;
        const bullet = createBullet(position, owner);
        bullet.velocity.x = Math.sin(rad) * BULLET_SPEED;
        bullet.velocity.y = Math.cos(rad) * BULLET_SPEED;
        return bullet;
      });
      state.projectiles = [...state.projectiles, ...newProjectiles];
      return;
    }

    let projectile;
    if (enemy.fireMode === 'laser') {
      projectile = createEnemyLaser(position, owner);
    } else if (enemy.fireMode === 'plasma') {
      projectile = createPlasma(position, owner);
    } else {
      projectile = createBullet(position, owner);
    }

    state.projectiles = [...state.projectiles, projectile];
  }

  private randomCooldown(fireMode: string): number {
    const config = FIRE_RATE_CONFIG[fireMode];
    if (!config) return 5000;
    return config.base + (Math.random() * 2 - 1) * config.jitter;
  }

  reset(): void {
    this.cooldowns.clear();
  }
}
