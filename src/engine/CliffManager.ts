import type { Player, TankState, MapConfig, Projectile, CliffTileType, CliffStructure } from '../types';
import { CLIFF_TILE_SIZE, TANK_COLLISION_RADIUS } from './constants';

/**
 * Manages cliff terrain collision, elevation tracking, and projectile blocking.
 *
 * Cliff structures are grids of 128px tiles placed in world space.
 * Edge/corner tiles act as walls for low-ground entities but are passable
 * at high elevation. Ramps transition elevation 0→1. Surface tiles = flat high ground.
 */

// --- Tile classification helpers ---

const WALL_TILES = new Set<CliffTileType>([
  'edge-north', 'edge-south', 'edge-east', 'edge-west',
  'corner-ne-convex', 'corner-nw-convex', 'corner-se-convex', 'corner-sw-convex',
  'corner-ne-concave', 'corner-nw-concave', 'corner-se-concave', 'corner-sw-concave',
]);

const RAMP_TILES = new Set<CliffTileType>([
  'ramp-south-north', 'ramp-east-west', 'ramp-west-east',
]);

export function isWallTile(type: CliffTileType): boolean {
  return WALL_TILES.has(type);
}

export function isRampTile(type: CliffTileType): boolean {
  return RAMP_TILES.has(type);
}

export function isSurfaceTile(type: CliffTileType): boolean {
  return type === 'surface';
}

/**
 * Returns true if the tile blocks an entity at the given elevation.
 * Wall tiles block at elevation < 1. Ramps and surface never block.
 */
export function isBlockingTile(type: CliffTileType, elevation: number): boolean {
  if (isWallTile(type) && elevation < 1) return true;
  return false;
}

// --- AABB-circle collision ---

interface TileRect {
  x: number;      // center X in world coords
  y: number;      // center Y in world coords
  halfW: number;  // half-width
  halfH: number;  // half-height
}

/**
 * AABB-circle overlap test. Returns the penetration vector (px, py) to push
 * the circle out of the rectangle, or null if no overlap.
 */
export function aabbCircleOverlap(
  circleX: number, circleY: number, radius: number,
  rect: TileRect,
): { px: number; py: number } | null {
  // Find closest point on AABB to circle center
  const closestX = Math.max(rect.x - rect.halfW, Math.min(circleX, rect.x + rect.halfW));
  const closestY = Math.max(rect.y - rect.halfH, Math.min(circleY, rect.y + rect.halfH));

  const dx = circleX - closestX;
  const dy = circleY - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq >= radius * radius) return null;

  // Circle center is inside the AABB
  if (distSq === 0) {
    // Push out along shortest axis
    const overlapX = rect.halfW - Math.abs(circleX - rect.x) + radius;
    const overlapY = rect.halfH - Math.abs(circleY - rect.y) + radius;
    if (overlapX < overlapY) {
      const sign = circleX >= rect.x ? 1 : -1;
      return { px: sign * overlapX, py: 0 };
    } else {
      const sign = circleY >= rect.y ? 1 : -1;
      return { px: 0, py: sign * overlapY };
    }
  }

  const dist = Math.sqrt(distSq);
  const overlap = radius - dist;
  return { px: (dx / dist) * overlap, py: (dy / dist) * overlap };
}

// --- Tile world position ---

function getTileWorldRect(structure: CliffStructure, col: number, row: number): TileRect {
  const tileX = structure.position.x + col * CLIFF_TILE_SIZE + CLIFF_TILE_SIZE / 2;
  const tileY = structure.position.y + row * CLIFF_TILE_SIZE + CLIFF_TILE_SIZE / 2;
  return { x: tileX, y: tileY, halfW: CLIFF_TILE_SIZE / 2, halfH: CLIFF_TILE_SIZE / 2 };
}

// --- Ramp elevation computation ---

/**
 * Compute elevation (0..1) based on position within a ramp tile.
 * - ramp-south-north: elevation increases as Y decreases (moving north)
 * - ramp-east-west: elevation increases as X decreases (moving west)
 * - ramp-west-east: elevation increases as X increases (moving east)
 */
export function computeRampElevation(
  type: CliffTileType,
  worldX: number, worldY: number,
  rect: TileRect,
): number {
  const halfW = rect.halfW;
  const halfH = rect.halfH;

  switch (type) {
    case 'ramp-south-north': {
      // Bottom of tile (south) = 0, top (north) = 1
      const t = 1 - (worldY - (rect.y - halfH)) / (halfH * 2);
      return Math.max(0, Math.min(1, t));
    }
    case 'ramp-east-west': {
      // Right side (east) = 0, left (west) = 1
      const t = 1 - (worldX - (rect.x - halfW)) / (halfW * 2);
      return Math.max(0, Math.min(1, t));
    }
    case 'ramp-west-east': {
      // Left side (west) = 0, right (east) = 1
      const t = (worldX - (rect.x - halfW)) / (halfW * 2);
      return Math.max(0, Math.min(1, t));
    }
    default:
      return 0;
  }
}

// --- Wall strip rects for high-ground guardrails ---

const WALL_STRIP_THICKNESS = 12;

/**
 * Get the thin wall strip rect(s) for a tile — these are the cliff edges
 * that block high-ground players from driving off.
 */
export function getWallStripRects(type: CliffTileType, tileRect: TileRect): TileRect[] {
  const S = CLIFF_TILE_SIZE;
  const W = WALL_STRIP_THICKNESS;
  const halfW = tileRect.halfW;
  const halfH = tileRect.halfH;
  const left = tileRect.x - halfW;
  const top = tileRect.y - halfH;

  const strips: TileRect[] = [];

  const northStrip = (): TileRect => ({ x: tileRect.x, y: top + W / 2, halfW, halfH: W / 2 });
  const southStrip = (): TileRect => ({ x: tileRect.x, y: top + S - W / 2, halfW, halfH: W / 2 });
  const eastStrip = (): TileRect => ({ x: left + S - W / 2, y: tileRect.y, halfW: W / 2, halfH });
  const westStrip = (): TileRect => ({ x: left + W / 2, y: tileRect.y, halfW: W / 2, halfH });

  switch (type) {
    case 'edge-north': strips.push(northStrip()); break;
    case 'edge-south': strips.push(southStrip()); break;
    case 'edge-east': strips.push(eastStrip()); break;
    case 'edge-west': strips.push(westStrip()); break;
    case 'corner-ne-convex': strips.push(northStrip(), eastStrip()); break;
    case 'corner-nw-convex': strips.push(northStrip(), westStrip()); break;
    case 'corner-se-convex': strips.push(southStrip(), eastStrip()); break;
    case 'corner-sw-convex': strips.push(southStrip(), westStrip()); break;
    case 'corner-ne-concave': strips.push({ x: left + S - W / 2, y: top + W / 2, halfW: W / 2, halfH: W / 2 }); break;
    case 'corner-nw-concave': strips.push({ x: left + W / 2, y: top + W / 2, halfW: W / 2, halfH: W / 2 }); break;
    case 'corner-se-concave': strips.push({ x: left + S - W / 2, y: top + S - W / 2, halfW: W / 2, halfH: W / 2 }); break;
    case 'corner-sw-concave': strips.push({ x: left + W / 2, y: top + S - W / 2, halfW: W / 2, halfH: W / 2 }); break;
  }

  return strips;
}

// --- Quick point-in-rect test ---

function pointInRect(px: number, py: number, rect: TileRect): boolean {
  return px >= rect.x - rect.halfW && px <= rect.x + rect.halfW &&
         py >= rect.y - rect.halfH && py <= rect.y + rect.halfH;
}

// --- CliffManager ---

export class CliffManager {
  /**
   * Check player collision against cliff wall tiles. Pushes low-ground players
   * out of blocking tiles via AABB-circle pushout.
   */
  checkCliffCollisions(player: Player, tank: TankState, map: MapConfig): void {
    if (!player.isAlive || !map.cliffs) return;

    const radius = TANK_COLLISION_RADIUS;

    for (const structure of map.cliffs) {
      for (const tile of structure.tiles) {
        const rect = getTileWorldRect(structure, tile.col, tile.row);

        // Quick bounding check — skip tiles far from player
        const dx = Math.abs(player.position.x - rect.x);
        const dy = Math.abs(player.position.y - rect.y);
        if (dx > rect.halfW + radius + 2 || dy > rect.halfH + radius + 2) continue;

        // Ramp tiles: update elevation, no blocking
        if (isRampTile(tile.type)) {
          if (pointInRect(player.position.x, player.position.y, rect)) {
            tank.elevation = computeRampElevation(
              tile.type, player.position.x, player.position.y, rect,
            );
          }
          continue;
        }

        // Surface tiles: snap to 1, no blocking
        if (isSurfaceTile(tile.type)) {
          if (pointInRect(player.position.x, player.position.y, rect)) {
            tank.elevation = 1;
          }
          continue;
        }

        // Wall tiles: low-ground → block with full tile; high-ground → block with wall strips
        if (isWallTile(tile.type)) {
          if (tank.elevation < 1) {
            // Low ground: full tile AABB blocks
            const overlap = aabbCircleOverlap(player.position.x, player.position.y, radius, rect);
            if (overlap) {
              player.position.x += overlap.px;
              player.position.y += overlap.py;
            }
          } else {
            // High ground: only the thin edge strips block (guardrails)
            const strips = getWallStripRects(tile.type, rect);
            for (const strip of strips) {
              const overlap = aabbCircleOverlap(player.position.x, player.position.y, radius, strip);
              if (overlap) {
                player.position.x += overlap.px;
                player.position.y += overlap.py;
              }
            }
          }
        }
      }
    }
  }

  /**
   * After collision pass, resolve elevation state:
   * - On surface tile → 1
   * - On ramp tile → keep fractional (already set in checkCliffCollisions)
   * - Off all cliff tiles → snap to 0
   */
  resolveElevationState(player: Player, tank: TankState, map: MapConfig): void {
    if (!player.isAlive || !map.cliffs) return;

    let onCliffTile = false;

    for (const structure of map.cliffs) {
      for (const tile of structure.tiles) {
        const rect = getTileWorldRect(structure, tile.col, tile.row);
        if (!pointInRect(player.position.x, player.position.y, rect)) continue;

        onCliffTile = true;

        if (isSurfaceTile(tile.type)) {
          tank.elevation = 1;
          return;
        }
        if (isRampTile(tile.type)) {
          // Already computed in checkCliffCollisions
          return;
        }
        // On a wall tile at high ground — keep elevation at 1
        if (isWallTile(tile.type) && tank.elevation >= 1) {
          tank.elevation = 1;
          return;
        }
      }
    }

    if (!onCliffTile) {
      tank.elevation = 0;
    }
  }

  /**
   * Check if a projectile is blocked by cliff walls.
   * Low-ground projectiles (elevation < 1) hitting wall tiles → blocked.
   * High-ground projectiles pass over.
   * Returns true if the projectile should be destroyed.
   */
  checkProjectileCliffCollision(proj: Projectile, map: MapConfig): boolean {
    if (!map.cliffs) return false;

    const projElevation = proj.elevation ?? 0;
    if (projElevation >= 1) return false; // High-ground projectiles pass over

    for (const structure of map.cliffs) {
      for (const tile of structure.tiles) {
        if (!isWallTile(tile.type)) continue;

        const rect = getTileWorldRect(structure, tile.col, tile.row);
        const overlap = aabbCircleOverlap(proj.position.x, proj.position.y, proj.collisionRadius, rect);
        if (overlap) return true;
      }
    }

    return false;
  }

  /**
   * Returns true if a high-ground projectile should skip collision with
   * low-ground objects (boulders, etc.).
   */
  shouldIgnoreLowGroundObject(projElevation: number | undefined): boolean {
    return (projElevation ?? 0) >= 1;
  }
}
