import type { GameState, LevelConfig, WaveConfig, Enemy } from '../types';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createEnemyB } from '../objects/enemies/enemyB/code/EnemyB';
import { createEnemyC } from '../objects/enemies/enemyC/code/EnemyC';
import { createEnemyD } from '../objects/enemies/enemyD/code/EnemyD';
import { createEnemyE } from '../objects/enemies/enemyE/code/EnemyE';
import { createEnemyF } from '../objects/enemies/enemyF/code/EnemyF';
import { initFormation } from './FormationManager';
import { generateFlightPaths } from './FlightPathManager';
import { LEVEL_CLEAR_DELAY } from './constants';
import { createBoss } from '../objects/boss/code/Boss';

/** Wave transition duration in ms. */
const WAVE_TRANSITION_DURATION = 3000;

/** Factory map for creating enemies by type. */
const ENEMY_FACTORY: Record<string, (row: number, col: number) => Enemy> = {
  A: createEnemyA,
  B: createEnemyB,
  C: createEnemyC,
  D: createEnemyD,
  E: createEnemyE,
  F: createEnemyF,
};

/**
 * Manage level progression and wave spawning.
 */
export class LevelManager {
  private levels: Map<number, LevelConfig> = new Map();
  private waveTransitionTimer: number = 0;
  private clearingTimer: number = 0;

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
    this.clearingTimer = 0;

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

    // Handle clearing phase countdown
    if (state.waveStatus === 'clearing') {
      this.clearingTimer += state.deltaTime;
      if (this.clearingTimer >= LEVEL_CLEAR_DELAY) {
        state.waveStatus = 'complete';
        this.clearingTimer = 0;
      }
      return;
    }

    if (state.waveStatus !== 'active') return;

    // Check if all enemies are destroyed (standard wave)
    const aliveEnemies = state.enemies.filter(e => e.isAlive);
    const enemiesCleared = aliveEnemies.length === 0 && state.enemies.length > 0;

    // For boss waves, check boss completion
    const config = this.levels.get(state.currentLevel);
    const currentWaveConfig = config?.waves[state.currentWave - 1];
    const isBossWave = currentWaveConfig?.bossSpawn === true;
    const bossCleared = isBossWave && state.boss && !state.boss.isAlive && !state.boss.deathSequence;

    const waveCleared = isBossWave ? bossCleared : enemiesCleared;

    if (waveCleared) {
      // Check if there are more waves
      if (config && state.currentWave < config.waves.length) {
        // Mid-level wave: transition immediately to next wave
        state.currentWave++;
        state.waveStatus = 'transition';
        this.waveTransitionTimer = 0;
        this.spawnWave(state, config.waves[state.currentWave - 1]);
      } else {
        // Final wave: enter clearing phase before level complete
        state.waveStatus = 'clearing';
        this.clearingTimer = 0;
      }
    }
  }

  /** Get total waves for current level (for HUD). */
  getTotalWaves(levelNumber: number): number {
    const config = this.levels.get(levelNumber);
    return config ? config.waves.length : 0;
  }

  /** Check if a level is registered. */
  hasLevel(levelNumber: number): boolean {
    return this.levels.has(levelNumber);
  }

  /** Get the name of a registered level. */
  getLevelName(levelNumber: number): string {
    return this.levels.get(levelNumber)?.name ?? '';
  }

  private spawnWave(state: GameState, wave: WaveConfig): void {
    state.enemies = [];
    state.projectiles = [];

    // Boss wave: spawn boss instead of formation enemies
    if (wave.bossSpawn) {
      state.boss = createBoss();
      return;
    }

    if (wave.slots && wave.slots.length > 0) {
      // Explicit slot placement — derive grid size from max row/col
      let maxRow = 0;
      let maxCol = 0;
      for (const slot of wave.slots) {
        if (slot.row > maxRow) maxRow = slot.row;
        if (slot.col > maxCol) maxCol = slot.col;
      }
      state.formation = initFormation(maxRow + 1, maxCol + 1);

      for (const slot of wave.slots) {
        const factory = ENEMY_FACTORY[slot.type] ?? createEnemyA;
        state.enemies.push(factory(slot.row, slot.col));
      }
    } else {
      // Auto-fill rectangular block (existing behavior)
      let totalRows = 0;
      let maxCols = 0;
      for (const spawnConfig of wave.enemies) {
        totalRows += spawnConfig.rows;
        if (spawnConfig.cols > maxCols) maxCols = spawnConfig.cols;
      }

      state.formation = initFormation(totalRows, maxCols);

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

    // Apply flight path entry animations for non-grid formations
    const waveFormation = wave.formation ?? wave.enemies[0]?.formation ?? 'grid';
    if (waveFormation !== 'grid') {
      // Place formation at its visible resting position so flight paths
      // target on-screen slots (grid formations descend from above instead)
      state.formation.offsetY = 40;
      generateFlightPaths(waveFormation, state.enemies, state.formation);
    }
  }
}
