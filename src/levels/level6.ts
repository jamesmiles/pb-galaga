import type { LevelConfig, MapConfig, CliffStructure, MapEnemyPlacement } from '../types';
import { LEVEL6_MAP_HEIGHT, LEVEL6_MAP_WIDTH } from '../engine/constants';

/**
 * Level 6 map data — Mars Landing.
 *
 * The map is 1200px wide × 6400px tall. Players start near the bottom
 * and drive northward (decreasing Y) toward the finish line near the top.
 * The viewport is 800px so the camera scrolls horizontally too.
 *
 * Object types:
 * - boulder: immovable, blocks player movement
 * - destructible-rock: can be destroyed by weapons fire
 * - decoration: visual only, no collision
 */
export const level6Map: MapConfig = {
  totalHeight: LEVEL6_MAP_HEIGHT,
  surfaceTexture: 'mars-surface',
  startPosition: { x: LEVEL6_MAP_WIDTH / 2, y: 6200 },
  finishLineY: 200,
  objects: [
    // --- Starting area (Y 6200-5800): sparse, easy to navigate ---
    // Boulder collisionRadius = ~80% of width/2 (visual shape wobbles 0.78-1.0x of radius)
    { id: 'b-01', type: 'boulder', position: { x: 300, y: 6100 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-1' },
    { id: 'r-01', type: 'destructible-rock', position: { x: 800, y: 6050 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'r-02', type: 'destructible-rock', position: { x: 550, y: 5900 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },
    { id: 'b-02', type: 'boulder', position: { x: 1000, y: 5950 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },

    // --- Section 1 (Y 5800-5200): moderate obstacles ---
    { id: 'b-03', type: 'boulder', position: { x: 200, y: 5700 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'b-04', type: 'boulder', position: { x: 900, y: 5500 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-2' },
    { id: 'r-03', type: 'destructible-rock', position: { x: 400, y: 5600 }, width: 45, height: 45, health: 200, maxHealth: 200, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'r-04', type: 'destructible-rock', position: { x: 650, y: 5300 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b-05', type: 'boulder', position: { x: 1100, y: 5400 }, width: 190, height: 190, collisionRadius: 76, sprite: 'rocks-1' },
    { id: 'r-05', type: 'destructible-rock', position: { x: 100, y: 5450 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },
    { id: 'r-06', type: 'destructible-rock', position: { x: 500, y: 5200 }, width: 50, height: 50, health: 250, maxHealth: 250, collisionRadius: 25, sprite: 'rocks-3' },

    // --- Section 2 (Y 5200-4600): tighter passages ---
    { id: 'b-06', type: 'boulder', position: { x: 150, y: 5100 }, width: 260, height: 260, collisionRadius: 104, sprite: 'rocks-1' },
    { id: 'b-07', type: 'boulder', position: { x: 600, y: 5000 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-2' },
    { id: 'b-08', type: 'boulder', position: { x: 1000, y: 4900 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'r-07', type: 'destructible-rock', position: { x: 350, y: 4950 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'r-08', type: 'destructible-rock', position: { x: 800, y: 4800 }, width: 45, height: 45, health: 200, maxHealth: 200, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b-09', type: 'boulder', position: { x: 400, y: 4700 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },
    { id: 'r-09', type: 'destructible-rock', position: { x: 150, y: 4650 }, width: 30, height: 30, health: 120, maxHealth: 120, collisionRadius: 15, sprite: 'rocks-3' },

    // --- Section 3 (Y 4600-4000): open area with clusters + cliff-01 ---
    { id: 'r-11', type: 'destructible-rock', position: { x: 950, y: 4350 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },
    { id: 'b-12', type: 'boulder', position: { x: 100, y: 4300 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-1' },
    { id: 'r-12', type: 'destructible-rock', position: { x: 750, y: 4100 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },
    { id: 'r-13', type: 'destructible-rock', position: { x: 1100, y: 4200 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },

    // --- Section 4 (Y 4000-3400): canyon walls with chokepoint ---
    { id: 'b-14', type: 'boulder', position: { x: 100, y: 3950 }, width: 260, height: 260, collisionRadius: 104, sprite: 'rocks-1' },
    { id: 'b-15', type: 'boulder', position: { x: 100, y: 3750 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'b-16', type: 'boulder', position: { x: 250, y: 3850 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-2' },
    { id: 'b-17', type: 'boulder', position: { x: 1050, y: 3900 }, width: 250, height: 250, collisionRadius: 100, sprite: 'rocks-2' },
    { id: 'b-18', type: 'boulder', position: { x: 1050, y: 3700 }, width: 230, height: 230, collisionRadius: 92, sprite: 'rocks-2' },
    { id: 'b-19', type: 'boulder', position: { x: 900, y: 3800 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
    { id: 'r-14', type: 'destructible-rock', position: { x: 500, y: 3850 }, width: 45, height: 45, health: 200, maxHealth: 200, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'r-15', type: 'destructible-rock', position: { x: 650, y: 3600 }, width: 50, height: 50, health: 250, maxHealth: 250, collisionRadius: 25, sprite: 'rocks-3' },
    { id: 'r-16', type: 'destructible-rock', position: { x: 400, y: 3500 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },

    // --- Section 5 (Y 3400-2800): scattered field + cliff-02 ---
    { id: 'r-18', type: 'destructible-rock', position: { x: 1000, y: 3150 }, width: 45, height: 45, health: 200, maxHealth: 200, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b-23', type: 'boulder', position: { x: 850, y: 2900 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },
    { id: 'r-20', type: 'destructible-rock', position: { x: 400, y: 2850 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },

    // --- Section 6 (Y 2800-2200): mixed terrain ---
    { id: 'b-24', type: 'boulder', position: { x: 250, y: 2700 }, width: 230, height: 230, collisionRadius: 92, sprite: 'rocks-2' },
    { id: 'b-25', type: 'boulder', position: { x: 1000, y: 2600 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-1' },
    { id: 'r-21', type: 'destructible-rock', position: { x: 550, y: 2650 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'r-22', type: 'destructible-rock', position: { x: 800, y: 2500 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b-26', type: 'boulder', position: { x: 600, y: 2350 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
    { id: 'b-27', type: 'boulder', position: { x: 100, y: 2400 }, width: 190, height: 190, collisionRadius: 76, sprite: 'rocks-2' },
    { id: 'r-23', type: 'destructible-rock', position: { x: 400, y: 2250 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },
    { id: 'r-24', type: 'destructible-rock', position: { x: 900, y: 2300 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },

    // --- Section 7 (Y 2200-1600): narrowing approach + cliff-03 ---
    { id: 'b-28', type: 'boulder', position: { x: 150, y: 2100 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'b-30', type: 'boulder', position: { x: 250, y: 1900 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-1' },
    { id: 'r-25', type: 'destructible-rock', position: { x: 500, y: 2050 }, width: 45, height: 45, health: 200, maxHealth: 200, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b-32', type: 'boulder', position: { x: 400, y: 1700 }, width: 190, height: 190, collisionRadius: 76, sprite: 'rocks-1' },
    { id: 'r-27', type: 'destructible-rock', position: { x: 650, y: 1650 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },

    // --- Final stretch (Y 1600-200): approach to finish ---
    { id: 'b-33', type: 'boulder', position: { x: 300, y: 1500 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-2' },
    { id: 'b-34', type: 'boulder', position: { x: 800, y: 1400 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
    { id: 'r-28', type: 'destructible-rock', position: { x: 550, y: 1300 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'r-29', type: 'destructible-rock', position: { x: 1000, y: 1200 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b-35', type: 'boulder', position: { x: 200, y: 1100 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-2' },
    { id: 'r-30', type: 'destructible-rock', position: { x: 700, y: 900 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },
    { id: 'b-36', type: 'boulder', position: { x: 450, y: 700 }, width: 190, height: 190, collisionRadius: 76, sprite: 'rocks-1' },
    { id: 'r-31', type: 'destructible-rock', position: { x: 900, y: 600 }, width: 35, height: 35, health: 150, maxHealth: 150, collisionRadius: 18, sprite: 'rocks-3' },
    { id: 'b-37', type: 'boulder', position: { x: 600, y: 400 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-1' },
  ],
  clouds: [
    { id: 'cloud-01', position: { x: 100, y: 5500 }, width: 300, height: 150, speed: -30, alpha: 0.25, sprite: 'cloud-1' },
    { id: 'cloud-02', position: { x: 500, y: 4800 }, width: 375, height: 180, speed: -25, alpha: 0.2, sprite: 'cloud-2' },
    { id: 'cloud-03', position: { x: 300, y: 4000 }, width: 330, height: 165, speed: -35, alpha: 0.22, sprite: 'cloud-4' },
    { id: 'cloud-04', position: { x: 600, y: 3200 }, width: 270, height: 135, speed: -28, alpha: 0.18, sprite: 'cloud-1' },
    { id: 'cloud-05', position: { x: 150, y: 2400 }, width: 360, height: 173, speed: -32, alpha: 0.2, sprite: 'cloud-2' },
    { id: 'cloud-06', position: { x: 450, y: 1600 }, width: 300, height: 150, speed: -26, alpha: 0.22, sprite: 'cloud-4' },
    { id: 'cloud-07', position: { x: 700, y: 800 }, width: 285, height: 143, speed: -30, alpha: 0.15, sprite: 'cloud-1' },
  ],
  cliffs: [
    // --- Cliff 1: Small outpost at Y ~4400 (Section 3, open area) ---
    // A 4-wide × 3-tall elevated platform with ramp access from the south
    {
      id: 'cliff-01',
      position: { x: 400, y: 4200 },
      tiles: [
        // Top row: north edge with NW and NE convex corners
        { col: 0, row: 0, type: 'corner-nw-convex' },
        { col: 1, row: 0, type: 'edge-north' },
        { col: 2, row: 0, type: 'edge-north' },
        { col: 3, row: 0, type: 'corner-ne-convex' },
        // Middle row: west edge, surface, surface, east edge
        { col: 0, row: 1, type: 'edge-west' },
        { col: 1, row: 1, type: 'surface' },
        { col: 2, row: 1, type: 'surface' },
        { col: 3, row: 1, type: 'edge-east' },
        // Bottom row: SW convex, ramp, surface, SE convex
        { col: 0, row: 2, type: 'corner-sw-convex' },
        { col: 1, row: 2, type: 'ramp-south-north' },
        { col: 2, row: 2, type: 'edge-south' },
        { col: 3, row: 2, type: 'corner-se-convex' },
      ],
    },
    // --- Cliff 2: L-shaped ridge at Y ~3000 (Section 5) ---
    // 5-wide × 4-tall L-shape with ramp on east side
    {
      id: 'cliff-02',
      position: { x: 100, y: 2900 },
      tiles: [
        // Row 0: full top edge
        { col: 0, row: 0, type: 'corner-nw-convex' },
        { col: 1, row: 0, type: 'edge-north' },
        { col: 2, row: 0, type: 'edge-north' },
        { col: 3, row: 0, type: 'edge-north' },
        { col: 4, row: 0, type: 'corner-ne-convex' },
        // Row 1: west edge, surface fill, east edge
        { col: 0, row: 1, type: 'edge-west' },
        { col: 1, row: 1, type: 'surface' },
        { col: 2, row: 1, type: 'surface' },
        { col: 3, row: 1, type: 'surface' },
        { col: 4, row: 1, type: 'ramp-east-west' },
        // Row 2: L-shape narrows — bottom of upper section
        { col: 0, row: 2, type: 'edge-west' },
        { col: 1, row: 2, type: 'surface' },
        { col: 2, row: 2, type: 'edge-south' },
        { col: 3, row: 2, type: 'edge-south' },
        { col: 4, row: 2, type: 'corner-se-convex' },
        // Row 3: bottom of L
        { col: 0, row: 3, type: 'corner-sw-convex' },
        { col: 1, row: 3, type: 'ramp-south-north' },
      ],
    },
    // --- Cliff 3: Sniper perch at Y ~1800 (Section 7) ---
    // Small 3×2 elevated platform with west-facing ramp
    {
      id: 'cliff-03',
      position: { x: 700, y: 1700 },
      tiles: [
        // Row 0: top edge
        { col: 0, row: 0, type: 'corner-nw-convex' },
        { col: 1, row: 0, type: 'edge-north' },
        { col: 2, row: 0, type: 'corner-ne-convex' },
        // Row 1: ramp on west, surface, east edge
        { col: 0, row: 1, type: 'ramp-west-east' },
        { col: 1, row: 1, type: 'surface' },
        { col: 2, row: 1, type: 'edge-east' },
        // Row 2: bottom edge (no access from south)
        // Intentionally omitted — open bottom so ramp is the only way up
      ],
    },
  ],
  dustEffects: [
    { id: 'dust-01', position: { x: 200, y: 6000 }, width: 100, height: 80, speed: -20, alpha: 0.15, sprite: 'dust-cloud-1' },
    { id: 'dust-02', position: { x: 500, y: 5400 }, width: 120, height: 90, speed: -18, alpha: 0.12, sprite: 'dust-swirl-1' },
    { id: 'dust-03', position: { x: 100, y: 4600 }, width: 110, height: 85, speed: -22, alpha: 0.14, sprite: 'dust-cloud-2' },
    { id: 'dust-04', position: { x: 600, y: 3800 }, width: 90, height: 70, speed: -16, alpha: 0.1, sprite: 'dust-swirl-2' },
    { id: 'dust-05', position: { x: 350, y: 3000 }, width: 130, height: 95, speed: -24, alpha: 0.13, sprite: 'dust-cloud-3' },
    { id: 'dust-06', position: { x: 700, y: 2200 }, width: 100, height: 80, speed: -19, alpha: 0.11, sprite: 'dust-swirl-3' },
    { id: 'dust-07', position: { x: 250, y: 1400 }, width: 115, height: 88, speed: -21, alpha: 0.12, sprite: 'dust-cloud-4' },
    { id: 'dust-08', position: { x: 550, y: 600 }, width: 105, height: 82, speed: -17, alpha: 0.1, sprite: 'dust-swirl-4' },
  ],
  enemyPlacements: [
    // --- Starting area: 1 easy gun nest to introduce combat ---
    { id: 'me-01', type: 'gun-nest', position: { x: 600, y: 5400 }, elevation: 0 },

    // --- Section 2: turret guarding passage + popup mine ---
    { id: 'me-02', type: 'turret', position: { x: 700, y: 5000 }, elevation: 0 },
    { id: 'me-03', type: 'popup-mine', position: { x: 500, y: 4850 }, elevation: 0 },

    // --- Cliff-01 area: gun nest on high ground ---
    { id: 'me-04', type: 'gun-nest', position: { x: 530, y: 4330 }, elevation: 1 },

    // --- Section 4 (canyon chokepoint): flanking gun nests ---
    { id: 'me-05', type: 'gun-nest', position: { x: 400, y: 3750 }, elevation: 0 },
    { id: 'me-06', type: 'gun-nest', position: { x: 800, y: 3700 }, elevation: 0 },

    // --- Cliff-02 area: turret on L-shaped ridge ---
    { id: 'me-07', type: 'turret', position: { x: 350, y: 3000 }, elevation: 1 },

    // --- Section 6: popup mines in open area ---
    { id: 'me-08', type: 'popup-mine', position: { x: 450, y: 2600 }, elevation: 0 },
    { id: 'me-09', type: 'popup-mine', position: { x: 700, y: 2400 }, elevation: 0 },

    // --- Cliff-03 (sniper perch): turret on high ground ---
    { id: 'me-10', type: 'turret', position: { x: 800, y: 1760 }, elevation: 1 },

    // --- Final approach: harder mix ---
    { id: 'me-11', type: 'gun-nest', position: { x: 500, y: 1300 }, elevation: 0 },
    { id: 'me-12', type: 'turret', position: { x: 350, y: 900 }, elevation: 0 },
    { id: 'me-13', type: 'popup-mine', position: { x: 700, y: 700 }, elevation: 0 },
    { id: 'me-14', type: 'gun-nest', position: { x: 900, y: 500 }, elevation: 0 },
  ],
};

/** Level config for level 6 (no wave-based enemies in Sprint 1). */
export const level6: LevelConfig = {
  levelNumber: 6,
  name: 'Mars Landing',
  waves: [],
};
