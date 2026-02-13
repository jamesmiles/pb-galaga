import type { FlightPath } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

/** Straight path from top to bottom of screen. */
export const STRAIGHT_DOWN: FlightPath = {
  points: [
    { x: GAME_WIDTH / 2, y: -30 },
    { x: GAME_WIDTH / 2, y: GAME_HEIGHT + 30 },
  ],
  duration: 5,
  loop: false,
};

/** Arc path entering from top-left, sweeping right, then exiting bottom. */
export const ARC_LEFT: FlightPath = {
  points: [
    { x: -30, y: -30 },
    { x: 200, y: 150 },
    { x: 500, y: 250 },
    { x: 600, y: 400 },
    { x: 400, y: GAME_HEIGHT + 30 },
  ],
  duration: 6,
  loop: false,
};

/** Arc path entering from top-right, sweeping left, then exiting bottom. */
export const ARC_RIGHT: FlightPath = {
  points: [
    { x: GAME_WIDTH + 30, y: -30 },
    { x: 600, y: 150 },
    { x: 300, y: 250 },
    { x: 200, y: 400 },
    { x: 400, y: GAME_HEIGHT + 30 },
  ],
  duration: 6,
  loop: false,
};

/** Swoop path: enters top, dives down toward player area, then swoops back up. */
export const SWOOP: FlightPath = {
  points: [
    { x: GAME_WIDTH / 2, y: -30 },
    { x: 350, y: 200 },
    { x: 250, y: 450 },
    { x: 400, y: 500 },
    { x: 550, y: 450 },
    { x: 450, y: 200 },
    { x: GAME_WIDTH / 2, y: -30 },
  ],
  duration: 8,
  loop: false,
};

/** Create a varied path for swarm formations with offset. */
export function createSwarmPath(index: number, total: number): FlightPath {
  const spread = GAME_WIDTH * 0.6;
  const startX = (GAME_WIDTH - spread) / 2 + (index / Math.max(1, total - 1)) * spread;
  const midX = startX + (Math.random() - 0.5) * 200;

  return {
    points: [
      { x: startX, y: -30 },
      { x: midX, y: 150 },
      { x: startX + (Math.random() - 0.5) * 100, y: 300 },
      { x: midX, y: 450 },
      { x: startX, y: GAME_HEIGHT + 30 },
    ],
    duration: 6 + Math.random() * 2,
    loop: false,
  };
}

export const ALL_PATHS = [STRAIGHT_DOWN, ARC_LEFT, ARC_RIGHT, SWOOP];
