import type { CameraState, Player, Vector2D } from '../types';
import { CAMERA_SMOOTH_SPEED, CAMERA_PLAYER_ANCHOR_Y, CAMERA_PLAYER_ANCHOR_X, CAMERA_MIN_BACKTRACK_SPEED, GAME_HEIGHT, GAME_WIDTH } from './constants';

/** Create a camera starting at the given world position. */
export function createCamera(startWorldY: number, startWorldX: number = 0): CameraState {
  return {
    worldY: startWorldY,
    targetY: startWorldY,
    worldX: startWorldX,
    targetX: startWorldX,
    smoothSpeed: CAMERA_SMOOTH_SPEED,
  };
}

/**
 * Update the camera to follow players.
 *
 * Vertical: follows lowest alive player northward with smooth lerp, limited backtracking.
 * Horizontal: centers on average X of alive players with smooth lerp in both directions.
 * mapWidth is needed to clamp horizontal range.
 */
export function updateCamera(
  camera: CameraState,
  players: Player[],
  dtSeconds: number,
  mapWidth: number = GAME_WIDTH,
): void {
  const alivePlayers = players.filter(p => p.isAlive);
  if (alivePlayers.length === 0) return;

  // --- Vertical (existing) ---
  const lowestPlayerY = Math.max(...alivePlayers.map(p => p.position.y));
  camera.targetY = lowestPlayerY - CAMERA_PLAYER_ANCHOR_Y;

  if (camera.targetY < camera.worldY) {
    // Northward (advancing) — full smooth lerp
    camera.worldY += (camera.targetY - camera.worldY) * camera.smoothSpeed * dtSeconds;
  } else {
    // Southward (backtracking) — smooth lerp at reduced rate, with minimum speed floor
    const lerpDelta = (camera.targetY - camera.worldY) * camera.smoothSpeed * 0.5 * dtSeconds;
    const minDelta = CAMERA_MIN_BACKTRACK_SPEED * dtSeconds;
    const backtrackDelta = Math.min(
      Math.max(lerpDelta, minDelta),
      camera.targetY - camera.worldY,
    );
    camera.worldY += backtrackDelta;
  }

  if (camera.worldY < 0) camera.worldY = 0;

  // --- Horizontal ---
  const avgX = alivePlayers.reduce((sum, p) => sum + p.position.x, 0) / alivePlayers.length;
  camera.targetX = avgX - CAMERA_PLAYER_ANCHOR_X;

  // Smooth lerp in both directions (no backtrack restriction for X)
  camera.worldX += (camera.targetX - camera.worldX) * camera.smoothSpeed * dtSeconds;

  // Clamp to map bounds
  const maxX = mapWidth - GAME_WIDTH;
  if (camera.worldX < 0) camera.worldX = 0;
  if (camera.worldX > maxX) camera.worldX = maxX;
}

/** Convert a world position to screen position relative to the camera. */
export function worldToScreen(worldPos: Vector2D, camera: CameraState): Vector2D {
  return {
    x: worldPos.x - camera.worldX,
    y: worldPos.y - camera.worldY,
  };
}

/** Check if a world Y position is within the visible viewport (with margin). */
export function isInViewport(worldY: number, camera: CameraState, margin: number = 100): boolean {
  const screenY = worldY - camera.worldY;
  return screenY > -margin && screenY < GAME_HEIGHT + margin;
}
