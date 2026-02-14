import type { GameState, LevelConfig, WaveConfig } from '../types';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { initFormation } from './FormationManager';

/**
 * Manage level progression and wave spawning.
 */
export class LevelManager {
  private levels: Map<number, LevelConfig> = new Map();

  registerLevel(config: LevelConfig): void {
    this.levels.set(config.levelNumber, config);
  }

  /** Start a level by spawning its first wave. */
  startLevel(state: GameState, levelNumber: number): void {
    const config = this.levels.get(levelNumber);
    if (!config) return;

    state.currentLevel = levelNumber;
    state.currentWave = 1;
    state.waveStatus = 'transition';

    this.spawnWave(state, config.waves[0]);
  }

  /** Update level state — check wave completion, spawn next wave. */
  update(state: GameState): void {
    if (state.waveStatus === 'transition') {
      state.waveStatus = 'active';
      return;
    }

    if (state.waveStatus !== 'active') return;

    // Check if all enemies are destroyed
    const aliveEnemies = state.enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0 && state.enemies.length > 0) {
      state.waveStatus = 'complete';
      // For Sprint 1: single wave per level, so level is complete
      // Multi-wave support comes in Sprint 2
    }
  }

  private spawnWave(state: GameState, wave: WaveConfig): void {
    state.enemies = [];
    state.projectiles = [];

    for (const spawnConfig of wave.enemies) {
      const { rows, cols } = spawnConfig;
      state.formation = initFormation(rows, cols);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          state.enemies.push(createEnemyA(r, c));
        }
      }
    }
  }
}
