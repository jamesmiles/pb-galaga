import type { GameState, LevelConfig, WaveConfig, Enemy } from '../types';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createEnemyB } from '../objects/enemies/enemyB/code/EnemyB';
import { createEnemyC } from '../objects/enemies/enemyC/code/EnemyC';
import { initFormation } from './FormationManager';

/** Wave transition duration in ms. */
const WAVE_TRANSITION_DURATION = 3000;

/** Factory map for creating enemies by type. */
const ENEMY_FACTORY: Record<string, (row: number, col: number) => Enemy> = {
  A: createEnemyA,
  B: createEnemyB,
  C: createEnemyC,
};

/**
 * Manage level progression and wave spawning.
 */
export class LevelManager {
  private levels: Map<number, LevelConfig> = new Map();
  private waveTransitionTimer: number = 0;

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
    this.waveTransitionTimer = 0;

    this.spawnWave(state, config.waves[0]);
  }

  /** Update level state — check wave completion, spawn next wave. */
  update(state: GameState): void {
    if (state.waveStatus === 'transition') {
      this.waveTransitionTimer += state.deltaTime;
      if (this.waveTransitionTimer >= WAVE_TRANSITION_DURATION || state.currentWave === 1) {
        state.waveStatus = 'active';
        this.waveTransitionTimer = 0;
      }
      return;
    }

    if (state.waveStatus !== 'active') return;

    // Check if all enemies are destroyed
    const aliveEnemies = state.enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0 && state.enemies.length > 0) {
      state.waveStatus = 'complete';

      // Check if there are more waves
      const config = this.levels.get(state.currentLevel);
      if (config && state.currentWave < config.waves.length) {
        // Start transition to next wave
        state.currentWave++;
        state.waveStatus = 'transition';
        this.waveTransitionTimer = 0;
        this.spawnWave(state, config.waves[state.currentWave - 1]);
      }
      // If no more waves, status stays 'complete' — T-0024 handles level complete
    }
  }

  /** Get total waves for current level (for HUD). */
  getTotalWaves(levelNumber: number): number {
    const config = this.levels.get(levelNumber);
    return config ? config.waves.length : 0;
  }

  private spawnWave(state: GameState, wave: WaveConfig): void {
    state.enemies = [];
    state.projectiles = [];

    // Calculate total grid dimensions from all spawn configs
    let totalRows = 0;
    let maxCols = 0;
    for (const spawnConfig of wave.enemies) {
      totalRows += spawnConfig.rows;
      if (spawnConfig.cols > maxCols) maxCols = spawnConfig.cols;
    }

    state.formation = initFormation(totalRows, maxCols);

    // Spawn enemies row by row, stacking different types
    let currentRow = 0;
    for (const spawnConfig of wave.enemies) {
      const factory = ENEMY_FACTORY[spawnConfig.type] ?? createEnemyA;
      for (let r = 0; r < spawnConfig.rows; r++) {
        for (let c = 0; c < spawnConfig.cols; c++) {
          state.enemies.push(factory(currentRow + r, c));
        }
      }
      currentRow += spawnConfig.rows;
    }
  }
}
