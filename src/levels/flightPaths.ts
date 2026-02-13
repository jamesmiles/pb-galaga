import type { FlightPath } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';

/** Swarm entry path: enters from top at a horizontal position, arcs down. */
export function createSwarmEntryPath(index: number, total: number): FlightPath {
  const spread = GAME_WIDTH * 0.7;
  const startX = (GAME_WIDTH - spread) / 2 + (index / Math.max(1, total - 1)) * spread;

  // Alternate between left-curving and right-curving paths
  const curveDir = index % 2 === 0 ? 1 : -1;
  const midOffset = curveDir * (50 + Math.random() * 80);

  return {
    points: [
      { x: startX, y: -30 },
      { x: startX + midOffset, y: GAME_HEIGHT * 0.2 },
      { x: startX - midOffset * 0.5, y: GAME_HEIGHT * 0.4 },
      { x: startX + midOffset * 0.3, y: GAME_HEIGHT * 0.6 },
      { x: startX, y: GAME_HEIGHT + 30 },
    ],
    duration: 7 + (index % 3),
    loop: false,
  };
}

/** Looping patrol path for enemies that stay on screen. */
export function createPatrolPath(x: number, yCenter: number): FlightPath {
  return {
    points: [
      { x: x - 80, y: yCenter - 40 },
      { x: x + 80, y: yCenter - 20 },
      { x: x + 80, y: yCenter + 20 },
      { x: x - 80, y: yCenter + 40 },
    ],
    duration: 4,
    loop: true,
  };
}
