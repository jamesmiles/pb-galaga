import type { GameState, FormationState, Enemy } from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, FORMATION_BASE_SPEED, FORMATION_CELL_WIDTH,
  FORMATION_CELL_HEIGHT, FORMATION_STEP_DOWN, FORMATION_SPEED_INCREASE,
  PLAYER_COLLISION_RADIUS,
} from './constants';

/** Minimum Y distance between the bottom-most enemy and the player ship. */
const STANDOFF_DISTANCE = 50;

/**
 * Initialize a formation for a given grid size.
 * The formation starts above the screen and descends into view.
 */
export function initFormation(rows: number, cols: number): FormationState {
  const totalWidth = cols * FORMATION_CELL_WIDTH;
  const startX = (GAME_WIDTH - totalWidth) / 2;

  return {
    rows,
    cols,
    direction: 1,
    speed: FORMATION_BASE_SPEED,
    baseSpeed: FORMATION_BASE_SPEED,
    offsetX: startX,
    offsetY: -rows * FORMATION_CELL_HEIGHT, // Start above screen
    cellWidth: FORMATION_CELL_WIDTH,
    cellHeight: FORMATION_CELL_HEIGHT,
    standoffY: GAME_HEIGHT - STANDOFF_DISTANCE - PLAYER_COLLISION_RADIUS,
  };
}

/**
 * Update formation movement for one tick.
 * Classic left-right-descend pattern:
 * - Move horizontally until an edge enemy hits the screen boundary
 * - Reverse direction and step down
 * - Stop descending when front row reaches standoff distance from player
 */
export function updateFormation(state: GameState, dtSeconds: number): void {
  const formation = state.formation;
  const aliveEnemies = state.enemies.filter(e => e.isAlive);

  if (aliveEnemies.length === 0) return;

  // Speed increases as enemies are destroyed
  const totalSlots = formation.rows * formation.cols;
  const aliveCount = aliveEnemies.length;
  if (totalSlots > 0 && aliveCount > 0) {
    const destroyedRatio = 1 - (aliveCount / totalSlots);
    formation.speed = formation.baseSpeed * (1 + destroyedRatio * FORMATION_SPEED_INCREASE);
  }

  // If formation is still entering (above screen), descend
  if (formation.offsetY < 20) {
    formation.offsetY += formation.speed * dtSeconds * 2; // Enter faster
    updateEnemyPositions(state);
    return;
  }

  // Horizontal movement
  const dx = formation.direction * formation.speed * dtSeconds;
  formation.offsetX += dx;

  // Check if any alive enemy would go off-screen
  const { minCol, maxCol } = getAliveColumnBounds(aliveEnemies);
  const leftEdge = formation.offsetX + minCol * formation.cellWidth;
  const rightEdge = formation.offsetX + (maxCol + 1) * formation.cellWidth;

  if (rightEdge > GAME_WIDTH || leftEdge < 0) {
    // Reverse direction
    formation.direction *= -1;
    // Undo the overshoot
    formation.offsetX -= dx;

    // Step down (unless at standoff distance)
    const bottomRow = getAliveBottomRow(aliveEnemies);
    const bottomY = formation.offsetY + (bottomRow + 1) * formation.cellHeight;
    if (bottomY < formation.standoffY) {
      formation.offsetY += FORMATION_STEP_DOWN;
    }
  }

  updateEnemyPositions(state);
}

/** Set each alive enemy's position from their formation slot. Skip diving enemies. */
export function updateEnemyPositions(state: GameState): void {
  const formation = state.formation;
  for (const enemy of state.enemies) {
    if (!enemy.isAlive) continue;
    if (enemy.diveState) continue; // Diving enemies control their own position
    if (enemy.flightPathState) continue; // Flight path enemies are still entering
    enemy.position.x = formation.offsetX + (enemy.formationCol + 0.5) * formation.cellWidth;
    enemy.position.y = formation.offsetY + (enemy.formationRow + 0.5) * formation.cellHeight;
  }
}

function getAliveColumnBounds(enemies: Enemy[]): { minCol: number; maxCol: number } {
  let minCol = Infinity;
  let maxCol = -Infinity;
  for (const e of enemies) {
    if (e.formationCol < minCol) minCol = e.formationCol;
    if (e.formationCol > maxCol) maxCol = e.formationCol;
  }
  return { minCol, maxCol };
}

function getAliveBottomRow(enemies: Enemy[]): number {
  let maxRow = 0;
  for (const e of enemies) {
    if (e.formationRow > maxRow) maxRow = e.formationRow;
  }
  return maxRow;
}

/** Check if any two alive enemies overlap (they shouldn't in a grid formation). */
export function hasOverlappingEnemies(state: GameState): boolean {
  const alive = state.enemies.filter(e => e.isAlive);
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      if (alive[i].formationRow === alive[j].formationRow &&
          alive[i].formationCol === alive[j].formationCol) {
        return true;
      }
    }
  }
  return false;
}
