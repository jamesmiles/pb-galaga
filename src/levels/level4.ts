import type { LevelConfig, WaveSlot } from '../types';

/** Helper to create a batch of slots for one enemy type at given positions. */
function typeSlots(type: 'A' | 'B' | 'C' | 'D' | 'E', positions: [number, number][]): WaveSlot[] {
  return positions.map(([row, col]) => ({ type, row, col }));
}

export const level4: LevelConfig = {
  levelNumber: 4,
  name: 'Asteroid Belt',
  waves: [
    // Wave 1: V-shape — A+B+D reintroduce from L3
    {
      waveNumber: 1,
      delay: 0,
      enemies: [],
      formation: 'w-curve',
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
          [2, 2], [2, 6],
          [3, 3], [3, 4], [3, 5],
          [4, 4],
        ]),
      ],
    },

    // Wave 2: Diamond — B+C outer, E in center (first E appearance)
    {
      waveNumber: 2,
      delay: 3000,
      enemies: [],
      formation: 'chiral',
      slots: [
        ...typeSlots('B', [
          [0, 3], [0, 4],
          [1, 2], [1, 5],
          [3, 2], [3, 5],
          [4, 3], [4, 4],
        ]),
        ...typeSlots('C', [
          [2, 1], [2, 6],
        ]),
        ...typeSlots('E', [
          [1, 3], [1, 4],
          [2, 2], [2, 3], [2, 4], [2, 5],
          [3, 3], [3, 4],
        ]),
      ],
    },

    // Wave 3: Staircase — C+D+E, plasma + spread
    {
      waveNumber: 3,
      delay: 3000,
      enemies: [],
      formation: 'diagonal',
      slots: [
        ...typeSlots('C', [
          [0, 0], [0, 1], [0, 2],
        ]),
        ...typeSlots('D', [
          [1, 2], [1, 3], [1, 4],
          [2, 4], [2, 5],
        ]),
        ...typeSlots('E', [
          [2, 6],
          [3, 6], [3, 7], [3, 8],
        ]),
      ],
    },

    // Wave 4: Wide formation — all 5 types
    {
      waveNumber: 4,
      delay: 3000,
      enemies: [],
      formation: 'side-wave',
      slots: [
        ...typeSlots('A', [
          [0, 0], [0, 1], [0, 8], [0, 9],
        ]),
        ...typeSlots('B', [
          [1, 0], [1, 1], [1, 8], [1, 9],
        ]),
        ...typeSlots('C', [
          [0, 4], [0, 5],
          [1, 4], [1, 5],
        ]),
        ...typeSlots('D', [
          [2, 2], [2, 3], [2, 6], [2, 7],
        ]),
        ...typeSlots('E', [
          [2, 4], [2, 5],
          [3, 4], [3, 5],
        ]),
      ],
    },

    // Wave 5: Arrow — D+E heavy, plasma + spread boss rush
    {
      waveNumber: 5,
      delay: 3000,
      enemies: [],
      formation: 'm-shape',
      slots: [
        ...typeSlots('D', [
          [0, 3], [0, 4],
          [1, 2], [1, 5],
          [2, 1], [2, 6],
        ]),
        ...typeSlots('E', [
          [1, 3], [1, 4],
          [2, 2], [2, 5],
          [3, 3], [3, 4],
          [4, 3], [4, 4],
        ]),
      ],
    },

    // Wave 6: Ring — all types, grand finale
    {
      waveNumber: 6,
      delay: 3000,
      enemies: [],
      formation: 'inverted-v',
      slots: [
        ...typeSlots('A', [
          [0, 3], [0, 4], [0, 5],
        ]),
        ...typeSlots('B', [
          [0, 2], [0, 6],
          [1, 1], [1, 7],
        ]),
        ...typeSlots('C', [
          [2, 0], [2, 8],
          [3, 1], [3, 7],
        ]),
        ...typeSlots('D', [
          [4, 2], [4, 6],
          [4, 3], [4, 5],
        ]),
        ...typeSlots('E', [
          [1, 2], [1, 6],
          [3, 2], [3, 6],
          [4, 4],
        ]),
      ],
    },
  ],
};
