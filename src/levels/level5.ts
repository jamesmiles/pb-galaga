import type { LevelConfig, WaveSlot } from '../types';

/** Helper to create a batch of slots for one enemy type at given positions. */
function typeSlots(type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', positions: [number, number][]): WaveSlot[] {
  return positions.map(([row, col]) => ({ type, row, col }));
}

export const level5: LevelConfig = {
  levelNumber: 5,
  name: 'Defeat Mars Colony',
  waves: [
    // Wave 1: X-formation warmup — A+B+D
    {
      waveNumber: 1,
      delay: 0,
      enemies: [],
      formation: 'x-formation',
      slots: [
        ...typeSlots('A', [
          [0, 0], [0, 1], [0, 7], [0, 8],
          [1, 1], [1, 7],
        ]),
        ...typeSlots('B', [
          [1, 2], [1, 6],
          [2, 3], [2, 5],
        ]),
        ...typeSlots('D', [
          [2, 4],
          [3, 3], [3, 5],
        ]),
      ],
    },

    // Wave 2: Introduces Enemy F — stealth bombers with homing
    {
      waveNumber: 2,
      delay: 3000,
      enemies: [],
      formation: 'w-curve',
      slots: [
        ...typeSlots('C', [
          [0, 1], [0, 2], [0, 6], [0, 7],
        ]),
        ...typeSlots('D', [
          [1, 2], [1, 6],
          [2, 3], [2, 5],
        ]),
        ...typeSlots('F', [
          [1, 3], [1, 4], [1, 5],
          [2, 4],
        ]),
      ],
    },

    // Wave 3: Heavy F wave — multiple stealth bombers
    {
      waveNumber: 3,
      delay: 3000,
      enemies: [],
      formation: 'chiral',
      slots: [
        ...typeSlots('E', [
          [0, 2], [0, 6],
          [1, 1], [1, 7],
        ]),
        ...typeSlots('F', [
          [0, 3], [0, 4], [0, 5],
          [1, 3], [1, 4], [1, 5],
          [2, 3], [2, 5],
        ]),
      ],
    },

    // Wave 4: All-type assault — every enemy type
    {
      waveNumber: 4,
      delay: 3000,
      enemies: [],
      formation: 'inverted-v',
      slots: [
        ...typeSlots('A', [
          [0, 0], [0, 8],
        ]),
        ...typeSlots('B', [
          [0, 1], [0, 7],
        ]),
        ...typeSlots('C', [
          [1, 2], [1, 6],
        ]),
        ...typeSlots('D', [
          [1, 3], [1, 5],
        ]),
        ...typeSlots('E', [
          [2, 2], [2, 6],
          [3, 3], [3, 5],
        ]),
        ...typeSlots('F', [
          [2, 3], [2, 4], [2, 5],
          [3, 4],
        ]),
      ],
    },

    // Wave 5: Boss fight
    {
      waveNumber: 5,
      delay: 3000,
      enemies: [],
      bossSpawn: true,
    },
  ],
};
