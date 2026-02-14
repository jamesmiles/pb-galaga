import type { LevelConfig, WaveSlot } from '../types';

/** Helper to create a batch of slots for one enemy type at given positions. */
function typeSlots(type: 'A' | 'B' | 'C' | 'D', positions: [number, number][]): WaveSlot[] {
  return positions.map(([row, col]) => ({ type, row, col }));
}

export const level3: LevelConfig = {
  levelNumber: 3,
  name: 'Moon Battle',
  waves: [
    // Wave 1: V-shape — A's on arms, B's at tip (warmup with familiar types)
    {
      waveNumber: 1,
      delay: 0,
      enemies: [],
      formation: 'w-curve',
      slots: [
        ...typeSlots('A', [
          [0, 0], [0, 1], [0, 7], [0, 8],
          [1, 1], [1, 2], [1, 6], [1, 7],
        ]),
        ...typeSlots('B', [
          [2, 2], [2, 3], [2, 5], [2, 6],
          [3, 3], [3, 4], [3, 5],
          [4, 4],
        ]),
      ],
    },

    // Wave 2: Diamond — A+C outer, D in center (first D appearance)
    {
      waveNumber: 2,
      delay: 3000,
      enemies: [],
      formation: 'chiral',
      slots: [
        ...typeSlots('A', [
          [0, 3], [0, 4],
          [1, 2], [1, 5],
          [3, 2], [3, 5],
          [4, 3], [4, 4],
        ]),
        ...typeSlots('C', [
          [2, 1], [2, 6],
        ]),
        ...typeSlots('D', [
          [1, 3], [1, 4],
          [2, 2], [2, 3], [2, 4], [2, 5],
          [3, 3], [3, 4],
        ]),
      ],
    },

    // Wave 3: Staircase — B's lead, D's trail (D heavy)
    {
      waveNumber: 3,
      delay: 3000,
      enemies: [],
      formation: 'diagonal',
      slots: [
        ...typeSlots('B', [
          [0, 0], [0, 1], [0, 2],
          [1, 2], [1, 3], [1, 4],
        ]),
        ...typeSlots('D', [
          [2, 4], [2, 5], [2, 6],
          [3, 6], [3, 7], [3, 8],
        ]),
      ],
    },

    // Wave 4: Twin clusters — A+B left, C+D right, all 4 types
    {
      waveNumber: 4,
      delay: 3000,
      enemies: [],
      formation: 'side-wave',
      slots: [
        ...typeSlots('A', [
          [0, 0], [0, 1], [0, 2],
          [1, 0], [1, 1], [1, 2],
        ]),
        ...typeSlots('B', [
          [2, 0], [2, 1], [2, 2],
        ]),
        ...typeSlots('C', [
          [0, 6], [0, 7], [0, 8],
        ]),
        ...typeSlots('D', [
          [1, 6], [1, 7], [1, 8],
          [2, 6], [2, 7], [2, 8],
        ]),
      ],
    },

    // Wave 5: Arrow — C+D mix, fast + plasma
    {
      waveNumber: 5,
      delay: 3000,
      enemies: [],
      formation: 'm-shape',
      slots: [
        ...typeSlots('C', [
          [0, 3], [0, 4],
          [1, 2], [1, 5],
          [2, 1], [2, 6],
        ]),
        ...typeSlots('D', [
          [1, 3], [1, 4],
          [2, 2], [2, 5],
          [3, 3], [3, 4],
          [4, 3], [4, 4],
        ]),
      ],
    },

    // Wave 6: Ring — B+C+D boss wave
    {
      waveNumber: 6,
      delay: 3000,
      enemies: [],
      formation: 'inverted-v',
      slots: [
        ...typeSlots('B', [
          [0, 3], [0, 4], [0, 5],
          [4, 3], [4, 4], [4, 5],
        ]),
        ...typeSlots('C', [
          [0, 2], [0, 6],
          [1, 1], [1, 7],
          [3, 1], [3, 7],
          [4, 2], [4, 6],
        ]),
        ...typeSlots('D', [
          [2, 0], [2, 8],
          [1, 2], [1, 6],
          [3, 2], [3, 6],
        ]),
      ],
    },
  ],
};
