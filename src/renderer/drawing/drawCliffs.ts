import type { CliffStructure, CameraState, CliffTileType } from '../../types';
import { CLIFF_TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';
import { isInViewport } from '../../engine/CameraManager';

// --- Color palette ---
const SURFACE_COLOR = '#6b5040';
const SURFACE_GRID = '#5a4030';
const WALL_COLOR = '#2a1a10';
const WALL_SHADOW = 'rgba(0, 0, 0, 0.3)';
const RAMP_LOW = '#5c3d2e';
const RAMP_HIGH = '#6b5040';
const RAMP_CHEVRON = 'rgba(255, 255, 255, 0.15)';

/**
 * Draw all cliff structures visible in the viewport.
 */
export function drawCliffStructures(
  ctx: CanvasRenderingContext2D,
  cliffs: CliffStructure[],
  camera: CameraState,
): void {
  for (const structure of cliffs) {
    for (const tile of structure.tiles) {
      const worldX = structure.position.x + tile.col * CLIFF_TILE_SIZE;
      const worldY = structure.position.y + tile.row * CLIFF_TILE_SIZE;
      const tileCenterY = worldY + CLIFF_TILE_SIZE / 2;

      // Viewport culling
      if (!isInViewport(tileCenterY, camera, CLIFF_TILE_SIZE)) continue;
      const screenX = worldX - camera.worldX;
      const screenY = worldY - camera.worldY;
      // Also cull horizontally
      if (screenX + CLIFF_TILE_SIZE < 0 || screenX > GAME_WIDTH) continue;

      ctx.save();
      ctx.translate(screenX, screenY);
      drawTile(ctx, tile.type);
      ctx.restore();
    }
  }
}

function drawTile(ctx: CanvasRenderingContext2D, type: CliffTileType): void {
  const S = CLIFF_TILE_SIZE;

  if (type === 'surface') {
    drawSurface(ctx, S);
  } else if (type.startsWith('ramp-')) {
    drawRamp(ctx, S, type);
  } else if (type.startsWith('edge-')) {
    drawEdge(ctx, S, type);
  } else if (type.startsWith('corner-')) {
    drawCorner(ctx, S, type);
  }
}

// --- Surface ---

function drawSurface(ctx: CanvasRenderingContext2D, S: number): void {
  ctx.fillStyle = SURFACE_COLOR;
  ctx.fillRect(0, 0, S, S);

  // Subtle grid line
  ctx.strokeStyle = SURFACE_GRID;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(1, 1, S - 2, S - 2);
}

// --- Edge tiles ---

function drawEdge(ctx: CanvasRenderingContext2D, S: number, type: CliffTileType): void {
  // Surface fill
  ctx.fillStyle = SURFACE_COLOR;
  ctx.fillRect(0, 0, S, S);

  const wallThickness = 12;

  // Wall strip on the low-ground face
  ctx.fillStyle = WALL_COLOR;
  switch (type) {
    case 'edge-north':
      // Low ground is below (south), wall on top edge
      ctx.fillRect(0, 0, S, wallThickness);
      // Drop shadow below wall
      ctx.fillStyle = WALL_SHADOW;
      ctx.fillRect(0, wallThickness, S, 6);
      break;
    case 'edge-south':
      // Low ground is above (north), wall on bottom edge
      ctx.fillRect(0, S - wallThickness, S, wallThickness);
      ctx.fillStyle = WALL_SHADOW;
      ctx.fillRect(0, S - wallThickness - 6, S, 6);
      break;
    case 'edge-east':
      // Low ground is to the left (west), wall on right edge
      ctx.fillRect(S - wallThickness, 0, wallThickness, S);
      ctx.fillStyle = WALL_SHADOW;
      ctx.fillRect(S - wallThickness - 6, 0, 6, S);
      break;
    case 'edge-west':
      // Low ground is to the right (east), wall on left edge
      ctx.fillRect(0, 0, wallThickness, S);
      ctx.fillStyle = WALL_SHADOW;
      ctx.fillRect(wallThickness, 0, 6, S);
      break;
  }
}

// --- Corner tiles ---

function drawCorner(ctx: CanvasRenderingContext2D, S: number, type: CliffTileType): void {
  ctx.fillStyle = SURFACE_COLOR;
  ctx.fillRect(0, 0, S, S);

  const wallThickness = 12;
  ctx.fillStyle = WALL_COLOR;

  const isConvex = type.includes('convex');

  if (isConvex) {
    // Convex = outer corner, two walls meeting at the corner
    if (type === 'corner-ne-convex') {
      ctx.fillRect(0, 0, S, wallThickness);       // north wall
      ctx.fillRect(S - wallThickness, 0, wallThickness, S); // east wall
    } else if (type === 'corner-nw-convex') {
      ctx.fillRect(0, 0, S, wallThickness);       // north wall
      ctx.fillRect(0, 0, wallThickness, S);        // west wall
    } else if (type === 'corner-se-convex') {
      ctx.fillRect(0, S - wallThickness, S, wallThickness); // south wall
      ctx.fillRect(S - wallThickness, 0, wallThickness, S); // east wall
    } else if (type === 'corner-sw-convex') {
      ctx.fillRect(0, S - wallThickness, S, wallThickness); // south wall
      ctx.fillRect(0, 0, wallThickness, S);        // west wall
    }
  } else {
    // Concave = inner corner, small wall notch at one corner
    if (type === 'corner-ne-concave') {
      ctx.fillRect(S - wallThickness, 0, wallThickness, wallThickness);
    } else if (type === 'corner-nw-concave') {
      ctx.fillRect(0, 0, wallThickness, wallThickness);
    } else if (type === 'corner-se-concave') {
      ctx.fillRect(S - wallThickness, S - wallThickness, wallThickness, wallThickness);
    } else if (type === 'corner-sw-concave') {
      ctx.fillRect(0, S - wallThickness, wallThickness, wallThickness);
    }
  }

  // Drop shadow
  ctx.fillStyle = WALL_SHADOW;
  if (isConvex) {
    // Shadow along inner edges of the two walls
    if (type === 'corner-ne-convex') {
      ctx.fillRect(0, wallThickness, S - wallThickness, 6);
      ctx.fillRect(S - wallThickness - 6, wallThickness, 6, S - wallThickness);
    } else if (type === 'corner-nw-convex') {
      ctx.fillRect(wallThickness, wallThickness, S - wallThickness, 6);
      ctx.fillRect(wallThickness, wallThickness, 6, S - wallThickness);
    } else if (type === 'corner-se-convex') {
      ctx.fillRect(0, S - wallThickness - 6, S - wallThickness, 6);
      ctx.fillRect(S - wallThickness - 6, 0, 6, S - wallThickness);
    } else if (type === 'corner-sw-convex') {
      ctx.fillRect(wallThickness, S - wallThickness - 6, S - wallThickness, 6);
      ctx.fillRect(wallThickness, 0, 6, S - wallThickness);
    }
  }
}

// --- Ramp tiles ---

function drawRamp(ctx: CanvasRenderingContext2D, S: number, type: CliffTileType): void {
  let grad: CanvasGradient;

  switch (type) {
    case 'ramp-south-north':
      grad = ctx.createLinearGradient(0, S, 0, 0);
      break;
    case 'ramp-east-west':
      grad = ctx.createLinearGradient(S, 0, 0, 0);
      break;
    case 'ramp-west-east':
      grad = ctx.createLinearGradient(0, 0, S, 0);
      break;
    default:
      return;
  }

  grad.addColorStop(0, RAMP_LOW);
  grad.addColorStop(1, RAMP_HIGH);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Directional chevron marks
  ctx.strokeStyle = RAMP_CHEVRON;
  ctx.lineWidth = 2;

  const chevronCount = 4;
  for (let i = 1; i <= chevronCount; i++) {
    const t = i / (chevronCount + 1);
    ctx.beginPath();

    switch (type) {
      case 'ramp-south-north': {
        const y = S * (1 - t);
        ctx.moveTo(S * 0.2, y + 8);
        ctx.lineTo(S * 0.5, y);
        ctx.lineTo(S * 0.8, y + 8);
        break;
      }
      case 'ramp-east-west': {
        const x = S * (1 - t);
        ctx.moveTo(x + 8, S * 0.2);
        ctx.lineTo(x, S * 0.5);
        ctx.lineTo(x + 8, S * 0.8);
        break;
      }
      case 'ramp-west-east': {
        const x = S * t;
        ctx.moveTo(x - 8, S * 0.2);
        ctx.lineTo(x, S * 0.5);
        ctx.lineTo(x - 8, S * 0.8);
        break;
      }
    }

    ctx.stroke();
  }

  // Border lines
  ctx.strokeStyle = SURFACE_GRID;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(1, 1, S - 2, S - 2);
}
