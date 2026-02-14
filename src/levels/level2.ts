import type { LevelConfig, WaveSlot } from '../types';

/** Helper to create a batch of slots for one enemy type at given positions. */
function typeSlots(type: 'A' | 'B' | 'C', positions: [number, number][]): WaveSlot[] {
  return positions.map(([row, col]) => ({ type, row, col }));
}

export const level2: LevelConfig = {
  levelNumber: 2,
  name: 'Escalation',
  waves: [
    // Wave 1: V/Chevron — A's on the arms, B's at the tip
    // Grid: 5 rows x 9 cols
    {
      waveNumber: 1,
      delay: 0,
      enemies: [],
      formation: 'w-curve',
      slots: [
        ...typeSlots('A', [
          [0, 0], [0, 1], [0, 7], [0, 8],
          [1, 1], [1, 2], [1, 6], [1, 7],
          [2, 2], [2, 3], [2, 5], [2, 6],
        ]),
        ...typeSlots('B', [
          [3, 3], [3, 4], [3, 5],
          [4, 4],
        ]),
      ],
    },

    // Wave 2: Diamond — A's form outer ring, B's fill the center
    // Grid: 5 rows x 8 cols
    {
      waveNumber: 2,
      delay: 3000,
      enemies: [],
      formation: 'chiral',
      slots: [
        ...typeSlots('A', [
          [0, 3], [0, 4],
          [1, 2], [1, 5],
          [2, 1], [2, 6],
          [3, 2], [3, 5],
          [4, 3], [4, 4],
        ]),
        ...typeSlots('B', [
          [1, 3], [1, 4],
          [2, 2], [2, 3], [2, 4], [2, 5],
          [3, 3], [3, 4],
        ]),
      ],
    },

    // Wave 3: Staircase — B's lead, C's trail
    // Grid: 4 rows x 9 cols
    {
      waveNumber: 3,
      delay: 3000,
      enemies: [],
      formation: 'diagonal',
      slots: [
        ...typeSlots('B', [
          [0, 0], [0, 1], [0, 2],
          [1, 2], [1, 3], [1, 4],
          [2, 4], [2, 5], [2, 6],
        ]),
        ...typeSlots('C', [
          [3, 6], [3, 7], [3, 8],
        ]),
      ],
    },

    // Wave 4: Twin clusters with center scouts
    // Grid: 5 rows x 9 cols
    {
      waveNumber: 4,
      delay: 3000,
      enemies: [],
      formation: 'side-wave',
      slots: [
        // Left cluster
        ...typeSlots('A', [
          [0, 0], [0, 1], [0, 2],
          [1, 0], [1, 1], [1, 2],
          [2, 0], [2, 1], [2, 2],
        ]),
        // Right cluster
        ...typeSlots('B', [
          [0, 6], [0, 7], [0, 8],
          [1, 6], [1, 7], [1, 8],
          [2, 6], [2, 7], [2, 8],
        ]),
        // Center scouts
        ...typeSlots('C', [
          [3, 4], [4, 4],
        ]),
      ],
    },

    // Wave 5: Arrow pointing down — B's form the head, C's the shaft
    // Grid: 6 rows x 8 cols
    {
      waveNumber: 5,
      delay: 3000,
      enemies: [],
      formation: 'm-shape',
      slots: [
        ...typeSlots('B', [
          [0, 3], [0, 4],
          [1, 2], [1, 3], [1, 4], [1, 5],
          [2, 1], [2, 6],
        ]),
        ...typeSlots('C', [
          [2, 2], [2, 5],
          [3, 3], [3, 4],
          [4, 3], [4, 4],
          [5, 3], [5, 4],
        ]),
      ],
    },

    // Wave 6: Ring — A's at top/bottom, B's on sides, C's fill the rim
    // Grid: 5 rows x 9 cols
    {
      waveNumber: 6,
      delay: 3000,
      enemies: [],
      formation: 'inverted-v',
      slots: [
        ...typeSlots('A', [
          [0, 3], [0, 4], [0, 5],
          [4, 3], [4, 4], [4, 5],
        ]),
        ...typeSlots('B', [
          [0, 2], [0, 6],
          [1, 1], [1, 7],
          [2, 0], [2, 8],
          [3, 1], [3, 7],
          [4, 2], [4, 6],
        ]),
        ...typeSlots('C', [
          [1, 2], [1, 6],
          [3, 2], [3, 6],
        ]),
      ],
    },
  ],
};
