import type { GameState, Enemy, FormationType, FormationState, Vector2D, FlightPathState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

/** Base entry speed for flight path animations. */
const BASE_ENTRY_SPEED = 250;

/** Speed multiplier per enemy type. */
const ENTRY_SPEED_MULTIPLIER: Record<string, number> = {
  A: 1.0,
  B: 0.8,
  C: 1.3,
  D: 1.1,
  E: 0.6,
  F: 0.7,
};

/**
 * Evaluate a cubic bezier curve at parameter t (0..1).
 * Supports 2, 3, or 4 control points (linear, quadratic, cubic).
 */
export function evaluateBezier(points: Vector2D[], t: number): Vector2D {
  if (points.length === 2) {
    // Linear
    return {
      x: points[0].x + (points[1].x - points[0].x) * t,
      y: points[0].y + (points[1].y - points[0].y) * t,
    };
  }
  if (points.length === 3) {
    // Quadratic
    const u = 1 - t;
    return {
      x: u * u * points[0].x + 2 * u * t * points[1].x + t * t * points[2].x,
      y: u * u * points[0].y + 2 * u * t * points[1].y + t * t * points[2].y,
    };
  }
  // Cubic (4 points)
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: u3 * points[0].x + 3 * u2 * t * points[1].x + 3 * u * t2 * points[2].x + t3 * points[3].x,
    y: u3 * points[0].y + 3 * u2 * t * points[1].y + 3 * u * t2 * points[2].y + t3 * points[3].y,
  };
}

/**
 * Get the target formation slot position for an enemy.
 */
function getSlotPosition(enemy: Enemy, formation: FormationState): Vector2D {
  return {
    x: formation.offsetX + (enemy.formationCol + 0.5) * formation.cellWidth,
    y: formation.offsetY + (enemy.formationRow + 0.5) * formation.cellHeight,
  };
}

/**
 * Generate flight paths for enemies based on formation type.
 * Each enemy gets a unique bezier path from an off-screen start to its formation slot.
 * 'grid' formation uses no flight paths (enemies descend from above via FormationManager).
 */
export function generateFlightPaths(
  formation: FormationType,
  enemies: Enemy[],
  formationState: FormationState,
): void {
  if (formation === 'grid') return; // Grid uses existing descent behavior

  const generators: Record<string, (enemies: Enemy[], fs: FormationState) => void> = {
    'w-curve': generateWCurvePaths,
    'chiral': generateChiralPaths,
    'diagonal': generateDiagonalPaths,
    'side-wave': generateSideWavePaths,
    'm-shape': generateMShapePaths,
    'inverted-v': generateInvertedVPaths,
    'x-formation': generateXFormationPaths,
  };

  const gen = generators[formation];
  if (gen) {
    gen(enemies, formationState);
  }
}

/**
 * Update all enemies on flight paths, advancing them along their curves.
 * Enemies that complete their path snap to formation position and clear flightPathState.
 */
export function updateFlightPaths(state: GameState, dtSeconds: number): void {
  for (const enemy of state.enemies) {
    if (!enemy.isAlive || !enemy.flightPathState) continue;

    const fp = enemy.flightPathState;
    const speed = fp.speed;

    // Estimate curve length as distance between start and end * 1.5 for curves
    const start = fp.controlPoints[0];
    const end = fp.controlPoints[fp.controlPoints.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const estimatedLength = Math.sqrt(dx * dx + dy * dy) * 1.5;

    // Advance progress based on speed and estimated curve length
    const progressStep = estimatedLength > 0 ? (speed * dtSeconds) / estimatedLength : 1;
    fp.progress = Math.min(1, fp.progress + progressStep);

    // Set position along the curve
    const pos = evaluateBezier(fp.controlPoints, fp.progress);
    enemy.position.x = pos.x;
    enemy.position.y = pos.y;

    // Settlement: snap to current formation position when complete
    if (fp.progress >= 1) {
      const f = state.formation;
      enemy.position.x = f.offsetX + (enemy.formationCol + 0.5) * f.cellWidth;
      enemy.position.y = f.offsetY + (enemy.formationRow + 0.5) * f.cellHeight;
      enemy.flightPathState = null;
    }
  }
}

/**
 * Check if all alive enemies have settled into formation (no active flight paths).
 */
export function allEnemiesSettled(enemies: Enemy[]): boolean {
  return enemies.every(e => !e.isAlive || !e.flightPathState);
}

// --- Formation-specific curve generators ---

function createFlightPath(
  enemy: Enemy,
  controlPoints: Vector2D[],
  formationState: FormationState,
): void {
  const target = getSlotPosition(enemy, formationState);
  // Replace last control point with exact target position
  const points = [...controlPoints];
  points[points.length - 1] = target;

  enemy.flightPathState = {
    progress: 0,
    controlPoints: points,
    targetSlot: target,
    speed: BASE_ENTRY_SPEED * (ENTRY_SPEED_MULTIPLIER[enemy.type] ?? 1.0),
  };

  // Start enemy at the first control point
  enemy.position.x = points[0].x;
  enemy.position.y = points[0].y;
}

/**
 * W-curve: Enemies enter from just above the screen in groups,
 * curving left and right to form a visible W pattern in the play area.
 */
function generateWCurvePaths(enemies: Enemy[], fs: FormationState): void {
  const cx = GAME_WIDTH / 2;
  const count = enemies.length;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    // Divide into 5 W segments
    const segment = Math.floor((i / count) * 5);
    const goLeft = segment % 2 === 0;
    const spreadX = goLeft ? -150 : 150;

    // Start just above screen, minimal stagger
    const startX = cx + (i - count / 2) * 10;
    const controlPoints: Vector2D[] = [
      { x: startX, y: -20 },
      { x: cx + spreadX, y: 200 + segment * 30 },
      { x: target.x + spreadX * 0.2, y: target.y - 40 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}

/**
 * Chiral: Enemies spiral inward from screen edges in a rotating pattern.
 * All movement visible within the play area.
 */
function generateChiralPaths(enemies: Enemy[], fs: FormationState): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT * 0.4;
  const count = enemies.length;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    const corner = i % 4;

    // Start from 4 edges of the visible screen
    let startX: number, startY: number;
    if (corner === 0) { startX = 20; startY = 20; }         // top-left
    else if (corner === 1) { startX = GAME_WIDTH - 20; startY = 20; }  // top-right
    else if (corner === 2) { startX = GAME_WIDTH - 20; startY = GAME_HEIGHT * 0.5; } // mid-right
    else { startX = 20; startY = GAME_HEIGHT * 0.5; }       // mid-left

    // Spiral toward center of play area
    const spiralAngle = (corner * Math.PI / 2) + Math.PI * 0.6;
    const midRadius = 120;
    const midX = cx + Math.cos(spiralAngle) * midRadius;
    const midY = cy + Math.sin(spiralAngle) * midRadius * 0.5;

    const controlPoints: Vector2D[] = [
      { x: startX, y: startY },
      { x: midX, y: midY },
      { x: target.x + (startX > cx ? 30 : -30), y: target.y - 30 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}

/**
 * Diagonal: Enemies enter from the right edge in a diagonal sweep across the screen.
 */
function generateDiagonalPaths(enemies: Enemy[], fs: FormationState): void {
  const count = enemies.length;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    // Start from right edge, staggered slightly
    const startX = GAME_WIDTH + 20;
    const startY = 30 + i * 15;

    const controlPoints: Vector2D[] = [
      { x: startX, y: startY },
      { x: GAME_WIDTH * 0.65, y: GAME_HEIGHT * 0.25 + i * 5 },
      { x: target.x + 50, y: target.y - 30 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}

/**
 * Side-wave: Enemies enter from alternating left/right sides of the screen.
 */
function generateSideWavePaths(enemies: Enemy[], fs: FormationState): void {
  const count = enemies.length;
  const cx = GAME_WIDTH / 2;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    const fromLeft = i % 2 === 0;
    const startX = fromLeft ? -20 : GAME_WIDTH + 20;
    const startY = 60 + (i % 8) * 40;
    const waveAmplitude = 100;

    const swoopX = fromLeft ? cx + waveAmplitude : cx - waveAmplitude;

    const controlPoints: Vector2D[] = [
      { x: startX, y: startY },
      { x: swoopX, y: GAME_HEIGHT * 0.3 + (i % 5) * 20 },
      { x: target.x + (fromLeft ? -40 : 40), y: target.y - 30 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}

/**
 * M-shape: Enemies enter from the top, spreading into an M pattern
 * with peaks and valleys visible in the play area.
 */
function generateMShapePaths(enemies: Enemy[], fs: FormationState): void {
  const cx = GAME_WIDTH / 2;
  const count = enemies.length;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    // Position along M (0..1)
    const t = count > 1 ? i / (count - 1) : 0.5;
    // M shape: peaks at t=0, t=0.5, t=1; valleys at t=0.25, t=0.75
    const mHeight = Math.abs(Math.sin(t * Math.PI * 2)) * 120;

    const startX = cx + (t - 0.5) * GAME_WIDTH * 0.7;

    const controlPoints: Vector2D[] = [
      { x: startX, y: -15 },
      { x: startX, y: 80 + mHeight },
      { x: target.x, y: target.y - 30 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}

/**
 * Inverted-V: Enemies enter from the left and right edges,
 * converge toward center in a visible chevron, then fan out to formation slots.
 */
function generateInvertedVPaths(enemies: Enemy[], fs: FormationState): void {
  const cx = GAME_WIDTH / 2;
  const count = enemies.length;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    const half = Math.floor(count / 2);
    const isLeftSide = i < half;
    const sideIndex = isLeftSide ? i : i - half;

    // Start from screen edges, staggered vertically
    const startX = isLeftSide ? -15 : GAME_WIDTH + 15;
    const startY = 40 + sideIndex * 20;

    // Converge toward center of play area
    const convergenceY = GAME_HEIGHT * 0.25;
    const convergenceX = cx + (isLeftSide ? -20 : 20);

    const controlPoints: Vector2D[] = [
      { x: startX, y: startY },
      { x: convergenceX, y: convergenceY },
      { x: target.x + (isLeftSide ? -30 : 30), y: target.y - 40 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}

/**
 * X-formation: Enemies enter from top-left and top-right corners,
 * cross through the center forming an X pattern, then curve to formation slots.
 */
function generateXFormationPaths(enemies: Enemy[], fs: FormationState): void {
  const cx = GAME_WIDTH / 2;
  const count = enemies.length;

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const target = getSlotPosition(enemy, fs);
    const fromLeft = i % 2 === 0;
    const stagger = Math.floor(i / 2) * 15;

    // Start from opposite top corners
    const startX = fromLeft ? -20 : GAME_WIDTH + 20;
    const startY = -20 + stagger;

    // Cross through center — each side crosses to the opposite
    const crossX = fromLeft ? GAME_WIDTH * 0.65 : GAME_WIDTH * 0.35;
    const crossY = GAME_HEIGHT * 0.3 + stagger * 0.5;

    const controlPoints: Vector2D[] = [
      { x: startX, y: startY },
      { x: crossX, y: crossY },
      { x: target.x + (fromLeft ? 30 : -30), y: target.y - 40 },
      target,
    ];
    createFlightPath(enemy, controlPoints, fs);
  }
}
