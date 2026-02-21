import { describe, it, expect } from 'vitest';
import {
  CliffManager,
  aabbCircleOverlap,
  isBlockingTile,
  isWallTile,
  isRampTile,
  isSurfaceTile,
  computeRampElevation,
  getWallStripRects,
} from './CliffManager';
import type { Player, TankState, MapConfig, Projectile, CliffStructure } from '../types';
import { CLIFF_TILE_SIZE, TANK_COLLISION_RADIUS } from './constants';
import { createTankState, createTankPlayer } from './StateManager';

// --- Helpers ---

function makeMap(cliffs: CliffStructure[]): MapConfig {
  return {
    totalHeight: 6400,
    surfaceTexture: 'mars-surface',
    startPosition: { x: 400, y: 6200 },
    finishLineY: 200,
    objects: [],
    clouds: [],
    dustEffects: [],
    cliffs,
  };
}

function makeProjectile(x: number, y: number, elevation?: number): Projectile {
  return {
    id: 'test-proj',
    type: 'cannon-shell',
    owner: { type: 'player', id: 'player1' },
    position: { x, y },
    velocity: { x: 0, y: -400 },
    rotation: 0,
    speed: 400,
    damage: 80,
    isActive: true,
    lifetime: 0,
    maxLifetime: 3000,
    collisionRadius: 6,
    hasCollided: false,
    elevation,
  };
}

// --- Tile classification ---

describe('Tile classification', () => {
  it('identifies wall tiles', () => {
    expect(isWallTile('edge-north')).toBe(true);
    expect(isWallTile('edge-south')).toBe(true);
    expect(isWallTile('edge-east')).toBe(true);
    expect(isWallTile('edge-west')).toBe(true);
    expect(isWallTile('corner-ne-convex')).toBe(true);
    expect(isWallTile('corner-sw-concave')).toBe(true);
    expect(isWallTile('surface')).toBe(false);
    expect(isWallTile('ramp-south-north')).toBe(false);
  });

  it('identifies ramp tiles', () => {
    expect(isRampTile('ramp-south-north')).toBe(true);
    expect(isRampTile('ramp-east-west')).toBe(true);
    expect(isRampTile('ramp-west-east')).toBe(true);
    expect(isRampTile('surface')).toBe(false);
    expect(isRampTile('edge-north')).toBe(false);
  });

  it('identifies surface tiles', () => {
    expect(isSurfaceTile('surface')).toBe(true);
    expect(isSurfaceTile('edge-north')).toBe(false);
    expect(isSurfaceTile('ramp-south-north')).toBe(false);
  });
});

// --- isBlockingTile ---

describe('isBlockingTile', () => {
  it('blocks wall tiles at low elevation', () => {
    expect(isBlockingTile('edge-north', 0)).toBe(true);
    expect(isBlockingTile('corner-ne-convex', 0)).toBe(true);
    expect(isBlockingTile('corner-sw-concave', 0.5)).toBe(true);
  });

  it('does not block wall tiles at full elevation', () => {
    expect(isBlockingTile('edge-north', 1)).toBe(false);
    expect(isBlockingTile('corner-ne-convex', 1)).toBe(false);
  });

  it('never blocks ramp or surface tiles', () => {
    expect(isBlockingTile('surface', 0)).toBe(false);
    expect(isBlockingTile('ramp-south-north', 0)).toBe(false);
    expect(isBlockingTile('ramp-east-west', 0)).toBe(false);
  });
});

// --- AABB-circle overlap ---

describe('aabbCircleOverlap', () => {
  const rect = { x: 100, y: 100, halfW: 64, halfH: 64 };

  it('returns null when no overlap', () => {
    expect(aabbCircleOverlap(200, 200, 10, rect)).toBeNull();
    expect(aabbCircleOverlap(300, 100, 10, rect)).toBeNull();
  });

  it('pushes circle out from right side', () => {
    const result = aabbCircleOverlap(170, 100, 10, rect);
    expect(result).not.toBeNull();
    expect(result!.px).toBeGreaterThan(0);
    expect(Math.abs(result!.py)).toBeLessThan(0.001);
  });

  it('pushes circle out from left side', () => {
    const result = aabbCircleOverlap(30, 100, 10, rect);
    expect(result).not.toBeNull();
    expect(result!.px).toBeLessThan(0);
  });

  it('pushes circle out from top', () => {
    const result = aabbCircleOverlap(100, 30, 10, rect);
    expect(result).not.toBeNull();
    expect(result!.py).toBeLessThan(0);
  });

  it('pushes circle out from bottom', () => {
    const result = aabbCircleOverlap(100, 170, 10, rect);
    expect(result).not.toBeNull();
    expect(result!.py).toBeGreaterThan(0);
  });

  it('handles circle center inside rect', () => {
    const result = aabbCircleOverlap(100, 100, 10, rect);
    expect(result).not.toBeNull();
    // Should push out along some axis
    expect(Math.abs(result!.px) + Math.abs(result!.py)).toBeGreaterThan(0);
  });

  it('handles corner overlap', () => {
    // Just past the corner diagonally
    const result = aabbCircleOverlap(170, 170, 15, rect);
    expect(result).not.toBeNull();
    expect(result!.px).toBeGreaterThan(0);
    expect(result!.py).toBeGreaterThan(0);
  });
});

// --- Ramp elevation computation ---

describe('computeRampElevation', () => {
  const rect = { x: 164, y: 164, halfW: 64, halfH: 64 };

  it('ramp-south-north: bottom = 0, top = 1', () => {
    // Bottom of tile (south end)
    expect(computeRampElevation('ramp-south-north', 164, 228, rect)).toBeCloseTo(0, 1);
    // Top of tile (north end)
    expect(computeRampElevation('ramp-south-north', 164, 100, rect)).toBeCloseTo(1, 1);
    // Middle
    expect(computeRampElevation('ramp-south-north', 164, 164, rect)).toBeCloseTo(0.5, 1);
  });

  it('ramp-east-west: right = 0, left = 1', () => {
    // Right side (east)
    expect(computeRampElevation('ramp-east-west', 228, 164, rect)).toBeCloseTo(0, 1);
    // Left side (west)
    expect(computeRampElevation('ramp-east-west', 100, 164, rect)).toBeCloseTo(1, 1);
  });

  it('ramp-west-east: left = 0, right = 1', () => {
    // Left side (west)
    expect(computeRampElevation('ramp-west-east', 100, 164, rect)).toBeCloseTo(0, 1);
    // Right side (east)
    expect(computeRampElevation('ramp-west-east', 228, 164, rect)).toBeCloseTo(1, 1);
  });

  it('clamps output to 0..1', () => {
    expect(computeRampElevation('ramp-south-north', 164, 300, rect)).toBe(0);
    expect(computeRampElevation('ramp-south-north', 164, 0, rect)).toBe(1);
  });
});

// --- CliffManager.resolveElevationState ---

describe('CliffManager.resolveElevationState', () => {
  const manager = new CliffManager();

  it('snaps to 0 when off all cliff tiles', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 0.5;
    player.position = { x: 50, y: 50 };

    const map = makeMap([{
      id: 'test', position: { x: 1000, y: 1000 },
      tiles: [{ col: 0, row: 0, type: 'surface' }],
    }]);

    manager.resolveElevationState(player, tank, map);
    expect(tank.elevation).toBe(0);
  });

  it('snaps to 1 on surface tile', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 0;

    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'surface' }],
    }]);
    // Place player in center of tile
    player.position = { x: CLIFF_TILE_SIZE / 2, y: CLIFF_TILE_SIZE / 2 };

    manager.resolveElevationState(player, tank, map);
    expect(tank.elevation).toBe(1);
  });

  it('no-ops when no cliffs in map', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 0.7;

    const map = makeMap([]);
    delete (map as any).cliffs; // simulate undefined

    manager.resolveElevationState(player, tank, map);
    expect(tank.elevation).toBe(0.7); // unchanged
  });
});

// --- CliffManager.checkCliffCollisions ---

describe('CliffManager.checkCliffCollisions', () => {
  const manager = new CliffManager();

  it('pushes low-ground player out of wall tile', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 0;

    const map = makeMap([{
      id: 'test', position: { x: 100, y: 100 },
      tiles: [{ col: 0, row: 0, type: 'edge-north' }],
    }]);

    // Position player overlapping the tile
    const tileCenterX = 100 + CLIFF_TILE_SIZE / 2;
    const tileCenterY = 100 + CLIFF_TILE_SIZE / 2;
    player.position = { x: tileCenterX, y: tileCenterY + CLIFF_TILE_SIZE / 2 - 5 };

    const startY = player.position.y;
    manager.checkCliffCollisions(player, tank, map);
    // Player should be pushed out (y should increase)
    expect(player.position.y).toBeGreaterThan(startY);
  });

  it('high-ground player can stand in center of wall tile (away from edge strip)', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 1;

    const map = makeMap([{
      id: 'test', position: { x: 100, y: 100 },
      tiles: [{ col: 0, row: 0, type: 'edge-north' }],
    }]);

    // Center of tile — well away from the 12px north wall strip
    const tileCenterX = 100 + CLIFF_TILE_SIZE / 2;
    const tileCenterY = 100 + CLIFF_TILE_SIZE / 2;
    player.position = { x: tileCenterX, y: tileCenterY };

    const startX = player.position.x;
    const startY = player.position.y;
    manager.checkCliffCollisions(player, tank, map);
    expect(player.position.x).toBe(startX);
    expect(player.position.y).toBe(startY);
  });

  it('high-ground player blocked by edge wall strip (guardrail)', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 1;

    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'edge-north' }],
    }]);

    // Position player overlapping the north wall strip (top 12px of tile)
    // Wall strip center Y = 0 + 6 = 6. Player near top edge of tile.
    player.position = { x: CLIFF_TILE_SIZE / 2, y: 10 };

    const startY = player.position.y;
    manager.checkCliffCollisions(player, tank, map);
    // Should be pushed south (away from the north edge)
    expect(player.position.y).toBeGreaterThan(startY);
  });

  it('updates elevation on ramp tile', () => {
    const player = createTankPlayer('player1');
    const tank = createTankState();
    tank.elevation = 0;

    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'ramp-south-north' }],
    }]);

    // Place player at middle of ramp
    player.position = { x: CLIFF_TILE_SIZE / 2, y: CLIFF_TILE_SIZE / 2 };
    manager.checkCliffCollisions(player, tank, map);
    expect(tank.elevation).toBeCloseTo(0.5, 1);
  });
});

// --- CliffManager.checkProjectileCliffCollision ---

describe('CliffManager.checkProjectileCliffCollision', () => {
  const manager = new CliffManager();

  it('blocks low-ground projectile hitting wall tile', () => {
    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'edge-north' }],
    }]);

    const proj = makeProjectile(CLIFF_TILE_SIZE / 2, CLIFF_TILE_SIZE / 2, 0);
    expect(manager.checkProjectileCliffCollision(proj, map)).toBe(true);
  });

  it('allows high-ground projectile to pass over wall tile', () => {
    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'edge-north' }],
    }]);

    const proj = makeProjectile(CLIFF_TILE_SIZE / 2, CLIFF_TILE_SIZE / 2, 1);
    expect(manager.checkProjectileCliffCollision(proj, map)).toBe(false);
  });

  it('does not block projectile on surface tile', () => {
    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'surface' }],
    }]);

    const proj = makeProjectile(CLIFF_TILE_SIZE / 2, CLIFF_TILE_SIZE / 2, 0);
    expect(manager.checkProjectileCliffCollision(proj, map)).toBe(false);
  });

  it('does not block projectile missing the tile', () => {
    const map = makeMap([{
      id: 'test', position: { x: 0, y: 0 },
      tiles: [{ col: 0, row: 0, type: 'edge-north' }],
    }]);

    const proj = makeProjectile(500, 500, 0);
    expect(manager.checkProjectileCliffCollision(proj, map)).toBe(false);
  });

  it('returns false when no cliffs exist', () => {
    const map = makeMap([]);
    const proj = makeProjectile(50, 50, 0);
    expect(manager.checkProjectileCliffCollision(proj, map)).toBe(false);
  });
});

// --- shouldIgnoreLowGroundObject ---

describe('CliffManager.shouldIgnoreLowGroundObject', () => {
  const manager = new CliffManager();

  it('returns true for high-ground projectiles', () => {
    expect(manager.shouldIgnoreLowGroundObject(1)).toBe(true);
    expect(manager.shouldIgnoreLowGroundObject(1.5)).toBe(true);
  });

  it('returns false for low-ground projectiles', () => {
    expect(manager.shouldIgnoreLowGroundObject(0)).toBe(false);
    expect(manager.shouldIgnoreLowGroundObject(0.5)).toBe(false);
    expect(manager.shouldIgnoreLowGroundObject(undefined)).toBe(false);
  });
});
