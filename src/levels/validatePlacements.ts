import type { MapConfig, MapEnemyPlacement, CliffTileType } from '../types';
import { CLIFF_TILE_SIZE } from '../engine/constants';

/** Tile types that are NOT safe for placing entities. */
const BLOCKED_TILE_TYPES: Set<CliffTileType> = new Set([
  'edge-north', 'edge-south', 'edge-east', 'edge-west',
  'corner-ne-convex', 'corner-nw-convex', 'corner-se-convex', 'corner-sw-convex',
  'corner-ne-concave', 'corner-nw-concave', 'corner-se-concave', 'corner-sw-concave',
  'ramp-south-north', 'ramp-east-west', 'ramp-west-east',
]);

export interface PlacementIssue {
  enemyId: string;
  reason: string;
}

/**
 * Validate enemy placements against map obstacles.
 * Returns an array of issues (empty = all placements valid).
 *
 * Checks:
 * 1. Overlap with boulders (immovable objects)
 * 2. Position on or too close to cliff ramps/edges
 *
 * @param buffer Extra clearance around obstacles (px). Default 40.
 */
export function validateEnemyPlacements(
  map: MapConfig,
  placements: MapEnemyPlacement[],
  buffer = 40,
): PlacementIssue[] {
  const issues: PlacementIssue[] = [];

  for (const enemy of placements) {
    // 1. Check boulder overlap
    for (const obj of map.objects) {
      if (obj.type !== 'boulder' || !obj.collisionRadius) continue;
      const dx = enemy.position.x - obj.position.x;
      const dy = enemy.position.y - obj.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < obj.collisionRadius + buffer) {
        issues.push({
          enemyId: enemy.id,
          reason: `Overlaps boulder ${obj.id} (dist=${Math.round(dist)}, min=${obj.collisionRadius + buffer})`,
        });
      }
    }

    // 2. Check cliff ramps/edges
    if (map.cliffs) {
      for (const cliff of map.cliffs) {
        for (const tile of cliff.tiles) {
          if (!BLOCKED_TILE_TYPES.has(tile.type)) continue;

          const tileX = cliff.position.x + tile.col * CLIFF_TILE_SIZE;
          const tileY = cliff.position.y + tile.row * CLIFF_TILE_SIZE;

          // Check if enemy is within the tile + buffer
          const ex = enemy.position.x;
          const ey = enemy.position.y;
          if (
            ex >= tileX - buffer &&
            ex <= tileX + CLIFF_TILE_SIZE + buffer &&
            ey >= tileY - buffer &&
            ey <= tileY + CLIFF_TILE_SIZE + buffer
          ) {
            issues.push({
              enemyId: enemy.id,
              reason: `On/near ${tile.type} tile of ${cliff.id} (tile col=${tile.col} row=${tile.row}, world ${tileX}-${tileX + CLIFF_TILE_SIZE}, ${tileY}-${tileY + CLIFF_TILE_SIZE})`,
            });
          }
        }
      }
    }
  }

  return issues;
}
