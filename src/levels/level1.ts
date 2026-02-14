import type { LevelConfig } from '../types';

export const level1: LevelConfig = {
  levelNumber: 1,
  name: 'First Contact',
  waves: [
    {
      waveNumber: 1,
      delay: 0,
      enemies: [
        {
          type: 'A',
          count: 40,
          formation: 'grid',
          rows: 5,
          cols: 8,
          spawnDelay: 0,
        },
      ],
    },
  ],
};
