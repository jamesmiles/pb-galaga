import type { GameState, LevelConfig, WaveConfig, EnemySpawnConfig } from '../types';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createSwarmEntryPath } from '../levels/flightPaths';

export class LevelManager {
  private levelConfig: LevelConfig | null = null;
  private waveTimer = 0;
  private spawnTimer = 0;
  private currentWaveIndex = -1;
  private currentSpawnIndex = 0;
  private spawningActive = false;
  private currentSpawnConfig: EnemySpawnConfig | null = null;
  private enemiesSpawnedInWave = 0;
  private totalEnemiesToSpawn = 0;

  /** Load a level configuration and prepare for wave spawning. */
  loadLevel(config: LevelConfig, state: GameState): void {
    this.levelConfig = config;
    this.currentWaveIndex = -1;
    this.waveTimer = 0;
    this.spawningActive = false;
    state.currentLevel = config.levelNumber;
    state.currentWave = 0;
    state.waveStatus = 'transition';
    this.advanceToNextWave(state);
  }

  /** Update level state each frame. */
  update(state: GameState, dtMs: number): void {
    if (!this.levelConfig || state.gameStatus !== 'playing') return;

    if (state.waveStatus === 'transition') {
      this.waveTimer += dtMs;
      const currentWave = this.getCurrentWave();
      if (currentWave && this.waveTimer >= currentWave.delay) {
        state.waveStatus = 'active';
        this.startSpawning(currentWave);
      }
    }

    if (this.spawningActive) {
      this.updateSpawning(state, dtMs);
    }

    // Check wave completion
    if (state.waveStatus === 'active' && !this.spawningActive && state.enemies.length === 0) {
      this.onWaveComplete(state);
    }
  }

  private advanceToNextWave(state: GameState): void {
    this.currentWaveIndex++;
    if (!this.levelConfig || this.currentWaveIndex >= this.levelConfig.waves.length) {
      // Level complete
      state.waveStatus = 'complete';
      return;
    }
    state.currentWave = this.currentWaveIndex + 1;
    state.waveStatus = 'transition';
    this.waveTimer = 0;
  }

  private getCurrentWave(): WaveConfig | null {
    if (!this.levelConfig || this.currentWaveIndex < 0 || this.currentWaveIndex >= this.levelConfig.waves.length) {
      return null;
    }
    return this.levelConfig.waves[this.currentWaveIndex];
  }

  private startSpawning(wave: WaveConfig): void {
    this.spawningActive = true;
    this.currentSpawnIndex = 0;
    this.spawnTimer = 0;
    this.enemiesSpawnedInWave = 0;
    this.totalEnemiesToSpawn = wave.enemies.reduce((sum, e) => sum + e.count, 0);
    this.currentSpawnConfig = wave.enemies[0] || null;
  }

  private updateSpawning(state: GameState, dtMs: number): void {
    if (!this.currentSpawnConfig) {
      this.spawningActive = false;
      return;
    }

    this.spawnTimer += dtMs;

    while (this.spawnTimer >= this.currentSpawnConfig.spawnDelay && this.enemiesSpawnedInWave < this.totalEnemiesToSpawn) {
      this.spawnTimer -= this.currentSpawnConfig.spawnDelay;
      this.spawnEnemy(state, this.enemiesSpawnedInWave);
      this.enemiesSpawnedInWave++;
    }

    if (this.enemiesSpawnedInWave >= this.totalEnemiesToSpawn) {
      this.spawningActive = false;
    }
  }

  private spawnEnemy(state: GameState, index: number): void {
    // Each enemy gets a unique path based on its index
    const path = createSwarmEntryPath(index, this.totalEnemiesToSpawn);
    const enemy = createEnemyA(path);
    state.enemies.push(enemy);
  }

  private onWaveComplete(state: GameState): void {
    if (!this.levelConfig) return;

    if (this.currentWaveIndex >= this.levelConfig.waves.length - 1) {
      // All waves complete — level complete
      state.waveStatus = 'complete';
    } else {
      // Advance to next wave
      this.advanceToNextWave(state);
    }
  }

  /** Check if the level is fully complete. */
  isLevelComplete(): boolean {
    if (!this.levelConfig) return false;
    return this.currentWaveIndex >= this.levelConfig.waves.length - 1 && !this.spawningActive;
  }
}
