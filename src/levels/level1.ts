import type { LevelConfig } from '../types';

export const level1: LevelConfig = {
  levelNumber: 1,
  name: 'First Contact',
  waves: [
    {
      waveNumber: 1,
      delay: 0,
      enemies: [
        { type: 'A', count: 20, formation: 'grid', rows: 5, cols: 4, spawnDelay: 0 },
      ],
    },
    {
      waveNumber: 2,
      delay: 3000,
      enemies: [
        { type: 'A', count: 16, formation: 'grid', rows: 4, cols: 4, spawnDelay: 0 },
        { type: 'B', count: 4, formation: 'grid', rows: 1, cols: 4, spawnDelay: 0 },
      ],
    },
    {
      waveNumber: 3,
      delay: 3000,
      enemies: [
        { type: 'A', count: 12, formation: 'grid', rows: 3, cols: 4, spawnDelay: 0 },
        { type: 'B', count: 4, formation: 'grid', rows: 1, cols: 4, spawnDelay: 0 },
        { type: 'C', count: 4, formation: 'grid', rows: 1, cols: 4, spawnDelay: 0 },
      ],
    },
    {
      waveNumber: 4,
      delay: 3000,
      enemies: [
        { type: 'A', count: 8, formation: 'grid', rows: 2, cols: 4, spawnDelay: 0 },
        { type: 'B', count: 8, formation: 'grid', rows: 2, cols: 4, spawnDelay: 0 },
        { type: 'C', count: 4, formation: 'grid', rows: 1, cols: 4, spawnDelay: 0 },
      ],
    },
    {
      waveNumber: 5,
      delay: 3000,
      enemies: [
        { type: 'A', count: 4, formation: 'grid', rows: 1, cols: 4, spawnDelay: 0 },
        { type: 'B', count: 8, formation: 'grid', rows: 2, cols: 4, spawnDelay: 0 },
        { type: 'C', count: 8, formation: 'grid', rows: 2, cols: 4, spawnDelay: 0 },
      ],
    },
  ],
};
