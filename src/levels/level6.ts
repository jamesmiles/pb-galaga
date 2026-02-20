import type { LevelConfig, WaveSlot } from '../types';
import { GAME_WIDTH } from '../engine/constants';

/** Helper to create a batch of slots for one enemy type at given positions. */
function typeSlots(
  type: 'H' | 'I' | 'J' | 'K',
  positions: [number, number][],
  fixedPosition?: { x: number; y: number },
): WaveSlot[] {
  return positions.map(([row, col]) => ({
    type,
    row,
    col,
    ...(fixedPosition ? { fixedPosition: { ...fixedPosition } } : {}),
  }));
}

/** Helper for stationary enemies at specific screen positions. */
function stationarySlots(
  type: 'H' | 'I',
  screenPositions: { row: number; col: number; x: number; y: number }[],
): WaveSlot[] {
  return screenPositions.map(({ row, col, x, y }) => ({
    type,
    row,
    col,
    fixedPosition: { x, y },
  }));
}

export const level6: LevelConfig = {
  levelNumber: 6,
  name: 'Mars Landing',
  waves: [
    // Wave 1: 4x Turret (H) stationary — tutorial, introduce ground combat
    {
      waveNumber: 1,
      delay: 0,
      enemies: [],
      slots: stationarySlots('H', [
        { row: 0, col: 1, x: 150, y: 200 },
        { row: 0, col: 3, x: 350, y: 180 },
        { row: 0, col: 5, x: 500, y: 200 },
        { row: 0, col: 7, x: 680, y: 180 },
      ]),
    },

    // Wave 2: 2x Turret (H) + 2x Artillery (I) stationary — mixed stationary
    {
      waveNumber: 2,
      delay: 3000,
      enemies: [],
      slots: [
        ...stationarySlots('H', [
          { row: 0, col: 1, x: 150, y: 160 },
          { row: 0, col: 7, x: 680, y: 160 },
        ]),
        ...stationarySlots('I', [
          { row: 1, col: 3, x: 320, y: 220 },
          { row: 1, col: 5, x: 520, y: 220 },
        ]),
      ],
    },

    // Wave 3: 7x Mech (J) + 1x Launcher (K) in v-formation — introduce mobile enemies
    {
      waveNumber: 3,
      delay: 3000,
      enemies: [],
      formation: 'inverted-v',
      slots: [
        ...typeSlots('K', [[0, 4]]),
        ...typeSlots('J', [
          [1, 3], [1, 5],
          [2, 2], [2, 6],
          [3, 1], [3, 3], [3, 5],
        ]),
      ],
    },

    // Wave 4: 3x stationary (H+I) flanks + 5x mobile (J+K) center — hybrid wave
    {
      waveNumber: 4,
      delay: 3000,
      enemies: [],
      formation: 'inverted-v',
      slots: [
        // Stationary flanks
        ...stationarySlots('H', [
          { row: 0, col: 0, x: 80, y: 150 },
          { row: 0, col: 8, x: 720, y: 150 },
        ]),
        ...stationarySlots('I', [
          { row: 1, col: 0, x: 80, y: 250 },
        ]),
        // Mobile center
        ...typeSlots('J', [
          [1, 3], [1, 5],
          [2, 4],
        ]),
        ...typeSlots('K', [
          [0, 3], [0, 5],
        ]),
      ],
    },

    // Wave 5: 4x stationary (H+I) + 6x mobile (J+K) w-curve — heavy assault
    {
      waveNumber: 5,
      delay: 3000,
      enemies: [],
      formation: 'w-curve',
      slots: [
        // Stationary positions
        ...stationarySlots('H', [
          { row: 0, col: 0, x: 100, y: 140 },
          { row: 0, col: 8, x: 700, y: 140 },
        ]),
        ...stationarySlots('I', [
          { row: 1, col: 0, x: 100, y: 260 },
          { row: 1, col: 8, x: 700, y: 260 },
        ]),
        // Mobile enemies
        ...typeSlots('J', [
          [1, 2], [1, 4], [1, 6],
        ]),
        ...typeSlots('K', [
          [0, 3], [0, 5], [2, 4],
        ]),
      ],
    },

    // Wave 6: Tank Boss
    {
      waveNumber: 6,
      delay: 3000,
      enemies: [],
      bossSpawn: true,
      bossVariant: 'tank',
    },
  ],
};
