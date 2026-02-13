import type { LevelConfig } from '../types';

/** Validate a level configuration. */
export function validateLevelConfig(config: LevelConfig): boolean {
  if (config.levelNumber < 1) return false;
  if (!config.name) return false;
  if (config.waves.length === 0) return false;

  for (const wave of config.waves) {
    if (wave.waveNumber < 1) return false;
    if (wave.enemies.length === 0) return false;
    for (const spawn of wave.enemies) {
      if (spawn.count < 1) return false;
      if (spawn.spawnDelay < 0) return false;
    }
  }

  return true;
}
