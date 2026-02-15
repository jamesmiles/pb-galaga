import type { GameState, BossState } from '../types';
import { createBullet } from '../objects/projectiles/bullet/code/Bullet';
import {
  BOSS_ENTRY_SPEED, BOSS_DEATH_PHASE_DURATION,
  BOSS_TURRET_SCORE_VALUE, BOSS_SCORE_VALUE, GAME_WIDTH,
} from './constants';

/**
 * Manages boss lifecycle: entry, active phase, and death sequence.
 */
export class BossManager {
  /** Update the boss state for one tick. */
  update(state: GameState, dtSeconds: number): void {
    const boss = state.boss;
    if (!boss || !boss.isAlive) {
      // Update death sequence if dying
      if (boss?.deathSequence) {
        this.updateDeathSequence(boss, state, dtSeconds);
      }
      return;
    }

    switch (boss.layer) {
      case 'entering':
        this.updateEntry(boss, dtSeconds);
        break;
      case 'active':
        this.updateActive(boss, state, dtSeconds);
        break;
      case 'dying':
        this.updateDeathSequence(boss, state, dtSeconds);
        break;
    }

    // Update turret absolute positions
    this.updateTurretPositions(boss);
  }

  private updateEntry(boss: BossState, dtSeconds: number): void {
    // Drift down from above screen to y~120
    const targetY = 120;
    boss.position.y += BOSS_ENTRY_SPEED * dtSeconds;

    if (boss.position.y >= targetY) {
      boss.position.y = targetY;
      boss.layer = 'active';
    }
  }

  private updateActive(boss: BossState, state: GameState, dtSeconds: number): void {
    // Sinusoidal horizontal oscillation
    const oscillationSpeed = 0.5; // cycles per second
    const amplitude = 60;
    boss.position.x = GAME_WIDTH / 2 + Math.sin(state.currentTime * 0.001 * oscillationSpeed * Math.PI * 2) * amplitude;

    // Fire from alive turrets
    for (const turret of boss.turrets) {
      if (!turret.isAlive) continue;

      turret.fireCooldown -= dtSeconds * 1000;
      if (turret.fireCooldown <= 0) {
        // Fire bullet downward from turret position
        const owner = { type: 'enemy' as const, id: turret.id };
        const bullet = createBullet(
          { x: turret.position.x, y: turret.position.y + 20 },
          owner,
        );
        state.projectiles = [...state.projectiles, bullet];
        turret.fireCooldown = turret.fireRate;
      }
    }

    // Check if all turrets destroyed — expose bridge
    const aliveTurrets = boss.turrets.filter(t => t.isAlive);
    if (aliveTurrets.length === 0 && boss.health > 0) {
      // Bridge is now vulnerable (handled by CollisionDetector)
    }
  }

  /** Start the death sequence when boss health reaches 0. */
  startDeathSequence(boss: BossState): void {
    boss.layer = 'dying';
    boss.deathSequence = {
      phase: 0,
      timer: 0,
      phaseDuration: BOSS_DEATH_PHASE_DURATION,
    };
  }

  private updateDeathSequence(boss: BossState, state: GameState, dtSeconds: number): void {
    if (!boss.deathSequence) return;

    boss.deathSequence.timer += dtSeconds * 1000;

    if (boss.deathSequence.timer >= boss.deathSequence.phaseDuration) {
      boss.deathSequence.timer = 0;
      boss.deathSequence.phase++;

      // Phases 0-3: turrets explode, phase 4: bridge explodes
      if (boss.deathSequence.phase > 4) {
        // Death sequence complete
        boss.isAlive = false;
        boss.deathSequence = null;

        // Award boss score to all alive players
        for (const player of state.players) {
          if (player.isAlive) {
            player.score += boss.scoreValue;
          }
        }
      }
    }
  }

  private updateTurretPositions(boss: BossState): void {
    for (const turret of boss.turrets) {
      turret.position.x = boss.position.x + turret.offsetX;
      turret.position.y = boss.position.y + turret.offsetY;
    }
  }

  reset(): void {
    // No persistent state to reset
  }
}
