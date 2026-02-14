import type { GameState, Enemy, DiveState } from '../types';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';

/** Max simultaneous diving enemies. */
const MAX_DIVERS = 2;

/** Minimum seconds between new dive initiations. */
const DIVE_COOLDOWN = 3.0;

/** Base dive speed in pixels/sec. */
const BASE_DIVE_SPEED = 300;

/** Speed multiplier per enemy type. */
const DIVE_SPEED_MULTIPLIER: Record<string, number> = {
  A: 1.0,
  B: 0.7,
  C: 1.5,
};

/** How far below screen before re-entry. */
const EXIT_MARGIN = 40;

/** Phase durations as fractions of total dive (break, approach, sweep). */
const PHASE_BREAK = 0.2;
const PHASE_APPROACH = 0.5;
// sweep = remaining (0.3)

/**
 * Manages enemy dive attacks — enemies break formation and dive toward the player.
 */
export class DiveManager {
  private activeDivers: Set<string> = new Set();
  private cooldownTimer: number = DIVE_COOLDOWN;

  update(state: GameState, dtSeconds: number): void {
    const aliveEnemies = state.enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0) return;

    // Tick cooldown
    this.cooldownTimer -= dtSeconds;

    // Try to initiate new dives
    if (this.activeDivers.size < MAX_DIVERS && this.cooldownTimer <= 0) {
      this.initiateDive(state, aliveEnemies);
    }

    // Update active divers
    for (const enemy of aliveEnemies) {
      if (!enemy.diveState) continue;
      this.updateDivingEnemy(enemy, state, dtSeconds);
    }

    // Clean up dead divers
    for (const id of this.activeDivers) {
      if (!aliveEnemies.some(e => e.id === id)) {
        this.activeDivers.delete(id);
      }
    }
  }

  private initiateDive(state: GameState, aliveEnemies: Enemy[]): void {
    // Get candidates: alive, not diving
    const candidates = aliveEnemies.filter(e => !e.diveState && !e.flightPathState && !this.activeDivers.has(e.id));
    if (candidates.length === 0) return;

    // Pick a random candidate
    const enemy = candidates[Math.floor(Math.random() * candidates.length)];

    // Find nearest player X for targeting
    const alivePlayers = state.players.filter(p => p.isAlive);
    const targetX = alivePlayers.length > 0
      ? alivePlayers[Math.floor(Math.random() * alivePlayers.length)].position.x
      : GAME_WIDTH / 2;

    enemy.diveState = {
      phase: 'break',
      progress: 0,
      targetX,
      startPos: { x: enemy.position.x, y: enemy.position.y },
    };
    this.activeDivers.add(enemy.id);
    this.cooldownTimer = DIVE_COOLDOWN;
  }

  private updateDivingEnemy(enemy: Enemy, state: GameState, dtSeconds: number): void {
    const dive = enemy.diveState!;
    const speed = BASE_DIVE_SPEED * (DIVE_SPEED_MULTIPLIER[enemy.type] ?? 1.0);
    const progressStep = (speed * dtSeconds) / GAME_HEIGHT;
    dive.progress += progressStep;

    if (dive.progress <= PHASE_BREAK) {
      // Phase: Break — curve away from formation toward target X
      const t = dive.progress / PHASE_BREAK;
      enemy.position.x = dive.startPos.x + (dive.targetX - dive.startPos.x) * t * 0.5;
      enemy.position.y = dive.startPos.y + t * 100;
    } else if (dive.progress <= PHASE_BREAK + PHASE_APPROACH) {
      // Phase: Approach — accelerate downward, track player X slightly
      const t = (dive.progress - PHASE_BREAK) / PHASE_APPROACH;
      const breakEndX = dive.startPos.x + (dive.targetX - dive.startPos.x) * 0.5;
      const breakEndY = dive.startPos.y + 100;
      enemy.position.x = breakEndX + (dive.targetX - breakEndX) * t;
      enemy.position.y = breakEndY + t * (GAME_HEIGHT * 0.6);
    } else {
      // Phase: Sweep — continue past player, exit bottom
      dive.phase = 'sweep';
      const t = (dive.progress - PHASE_BREAK - PHASE_APPROACH) / (1 - PHASE_BREAK - PHASE_APPROACH);
      const approachEndY = dive.startPos.y + 100 + GAME_HEIGHT * 0.6;
      enemy.position.x = dive.targetX;
      enemy.position.y = approachEndY + t * GAME_HEIGHT * 0.4;
    }

    // Check for exit below screen
    if (enemy.position.y > GAME_HEIGHT + EXIT_MARGIN) {
      this.returnToFormation(enemy, state);
    }
  }

  private returnToFormation(enemy: Enemy, state: GameState): void {
    // Reset to formation position (above screen, formation manager will place correctly)
    const formation = state.formation;
    enemy.position.x = formation.offsetX + (enemy.formationCol + 0.5) * formation.cellWidth;
    enemy.position.y = formation.offsetY + (enemy.formationRow + 0.5) * formation.cellHeight;
    enemy.diveState = null;
    this.activeDivers.delete(enemy.id);
  }

  /** Get count of active divers (for testing). */
  getActiveDiverCount(): number {
    return this.activeDivers.size;
  }

  /** Check if an enemy is diving (for testing/formation skip). */
  isDiving(enemyId: string): boolean {
    return this.activeDivers.has(enemyId);
  }

  reset(): void {
    this.activeDivers.clear();
    this.cooldownTimer = DIVE_COOLDOWN;
  }
}
