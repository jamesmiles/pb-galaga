import type { LevelConfig } from '../types';
import { createSwarmEntryPath } from './flightPaths';

const ENEMY_COUNT = 12;

export const LEVEL_1: LevelConfig = {
  levelNumber: 1,
  name: 'First Contact',
  backgroundTheme: 'default',
  musicTrack: '',
  waves: [
    {
      waveNumber: 1,
      delay: 1000, // 1 second before wave starts (ms)
      enemies: [
        {
          type: 'A',
          count: ENEMY_COUNT,
          formation: 'swarm',
          path: createSwarmEntryPath(0, ENEMY_COUNT), // template path, actual paths vary per enemy
          spawnDelay: 250, // ms between each spawn
        },
      ],
    },
  ],
};
