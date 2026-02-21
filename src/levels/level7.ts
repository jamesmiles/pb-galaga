import type { LevelConfig, MapConfig, MapEnemyPlacement } from '../types';
import { LEVEL7_MAP_HEIGHT, LEVEL7_MAP_WIDTH } from '../engine/constants';

/**
 * Level 7 map data — Get to the Chopper.
 *
 * The map is 1200px wide x 8000px tall. Players start near the bottom
 * and drive northward (decreasing Y) toward the extraction point.
 * Introduces aerial enemies (copters, bombers) alongside ground threats.
 */
export const level7Map: MapConfig = {
  totalHeight: LEVEL7_MAP_HEIGHT,
  surfaceTexture: 'mars-surface',
  startPosition: { x: LEVEL7_MAP_WIDTH / 2, y: 7800 },
  finishLineY: 200,
  objects: [
    // --- Starting area (Y 7800-7200): sparse, easy intro ---
    { id: 'b7-01', type: 'boulder', position: { x: 300, y: 7700 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-1' },
    { id: 'r7-01', type: 'destructible-rock', position: { x: 800, y: 7650 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b7-02', type: 'boulder', position: { x: 1000, y: 7500 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },
    { id: 'r7-02', type: 'destructible-rock', position: { x: 500, y: 7350 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },

    // --- Section 2 (Y 7200-6400): first copter territory ---
    { id: 'b7-03', type: 'boulder', position: { x: 200, y: 7100 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'b7-04', type: 'boulder', position: { x: 900, y: 6800 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-2' },
    { id: 'r7-03', type: 'destructible-rock', position: { x: 600, y: 6900 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },
    { id: 'r7-04', type: 'destructible-rock', position: { x: 400, y: 6600 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b7-05', type: 'boulder', position: { x: 700, y: 6500 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },

    // --- Section 3 (Y 6400-5600): rocket copter + cliff area ---
    { id: 'b7-06', type: 'boulder', position: { x: 150, y: 6300 }, width: 230, height: 230, collisionRadius: 92, sprite: 'rocks-2' },
    { id: 'b7-07', type: 'boulder', position: { x: 1050, y: 6100 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-1' },
    { id: 'r7-05', type: 'destructible-rock', position: { x: 500, y: 6000 }, width: 45, height: 45, health: 200, maxHealth: 200, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b7-08', type: 'boulder', position: { x: 350, y: 5800 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
    { id: 'r7-06', type: 'destructible-rock', position: { x: 800, y: 5700 }, width: 50, height: 50, health: 250, maxHealth: 250, collisionRadius: 25, sprite: 'rocks-3' },

    // --- Section 4 (Y 5600-4800): bomber run corridor ---
    { id: 'b7-09', type: 'boulder', position: { x: 100, y: 5500 }, width: 250, height: 250, collisionRadius: 100, sprite: 'rocks-2' },
    { id: 'b7-10', type: 'boulder', position: { x: 1100, y: 5400 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'r7-07', type: 'destructible-rock', position: { x: 450, y: 5200 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'r7-08', type: 'destructible-rock', position: { x: 750, y: 5100 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b7-11', type: 'boulder', position: { x: 600, y: 4900 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },

    // --- Section 5 (Y 4800-4000): hover tank territory ---
    { id: 'b7-12', type: 'boulder', position: { x: 250, y: 4700 }, width: 230, height: 230, collisionRadius: 92, sprite: 'rocks-1' },
    { id: 'b7-13', type: 'boulder', position: { x: 950, y: 4500 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-2' },
    { id: 'r7-09', type: 'destructible-rock', position: { x: 600, y: 4400 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },
    { id: 'r7-10', type: 'destructible-rock', position: { x: 400, y: 4200 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b7-14', type: 'boulder', position: { x: 800, y: 4100 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },

    // --- Section 6 (Y 4000-3200): mixed aerial + ground ---
    { id: 'b7-15', type: 'boulder', position: { x: 150, y: 3900 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-2' },
    { id: 'b7-16', type: 'boulder', position: { x: 1000, y: 3700 }, width: 230, height: 230, collisionRadius: 92, sprite: 'rocks-1' },
    { id: 'r7-11', type: 'destructible-rock', position: { x: 500, y: 3600 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b7-17', type: 'boulder', position: { x: 700, y: 3400 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },
    { id: 'r7-12', type: 'destructible-rock', position: { x: 300, y: 3300 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },

    // --- Section 7 (Y 3200-2400): homing bomber gauntlet ---
    { id: 'b7-18', type: 'boulder', position: { x: 200, y: 3100 }, width: 240, height: 240, collisionRadius: 96, sprite: 'rocks-1' },
    { id: 'b7-19', type: 'boulder', position: { x: 900, y: 2900 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-2' },
    { id: 'r7-13', type: 'destructible-rock', position: { x: 550, y: 2800 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b7-20', type: 'boulder', position: { x: 400, y: 2600 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
    { id: 'r7-14', type: 'destructible-rock', position: { x: 750, y: 2500 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },

    // --- Final approach (Y 2400-200): maximum intensity ---
    { id: 'b7-21', type: 'boulder', position: { x: 300, y: 2300 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-2' },
    { id: 'b7-22', type: 'boulder', position: { x: 800, y: 2100 }, width: 230, height: 230, collisionRadius: 92, sprite: 'rocks-1' },
    { id: 'r7-15', type: 'destructible-rock', position: { x: 500, y: 1900 }, width: 50, height: 50, health: 300, maxHealth: 300, collisionRadius: 25, sprite: 'rocks-3' },
    { id: 'b7-23', type: 'boulder', position: { x: 150, y: 1700 }, width: 210, height: 210, collisionRadius: 84, sprite: 'rocks-1' },
    { id: 'b7-24', type: 'boulder', position: { x: 1000, y: 1500 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },
    { id: 'r7-16', type: 'destructible-rock', position: { x: 600, y: 1300 }, width: 45, height: 45, health: 250, maxHealth: 250, collisionRadius: 22, sprite: 'rocks-3' },
    { id: 'b7-25', type: 'boulder', position: { x: 400, y: 1000 }, width: 220, height: 220, collisionRadius: 88, sprite: 'rocks-1' },
    { id: 'r7-17', type: 'destructible-rock', position: { x: 850, y: 800 }, width: 40, height: 40, health: 200, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
    { id: 'b7-26', type: 'boulder', position: { x: 600, y: 500 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-2' },
  ],
  clouds: [
    { id: 'c7-01', position: { x: 100, y: 7200 }, width: 300, height: 150, speed: -30, alpha: 0.25, sprite: 'cloud-1' },
    { id: 'c7-02', position: { x: 600, y: 6400 }, width: 375, height: 180, speed: -25, alpha: 0.2, sprite: 'cloud-2' },
    { id: 'c7-03', position: { x: 300, y: 5600 }, width: 330, height: 165, speed: -35, alpha: 0.22, sprite: 'cloud-4' },
    { id: 'c7-04', position: { x: 700, y: 4800 }, width: 270, height: 135, speed: -28, alpha: 0.18, sprite: 'cloud-1' },
    { id: 'c7-05', position: { x: 200, y: 4000 }, width: 360, height: 173, speed: -32, alpha: 0.2, sprite: 'cloud-2' },
    { id: 'c7-06', position: { x: 500, y: 3200 }, width: 300, height: 150, speed: -26, alpha: 0.22, sprite: 'cloud-4' },
    { id: 'c7-07', position: { x: 800, y: 2400 }, width: 285, height: 143, speed: -30, alpha: 0.15, sprite: 'cloud-1' },
    { id: 'c7-08', position: { x: 400, y: 1600 }, width: 340, height: 160, speed: -28, alpha: 0.2, sprite: 'cloud-2' },
    { id: 'c7-09', position: { x: 100, y: 800 }, width: 310, height: 155, speed: -33, alpha: 0.18, sprite: 'cloud-4' },
  ],
  dustEffects: [
    { id: 'dust7-01', position: { x: 200, y: 7400 }, width: 100, height: 80, speed: -20, alpha: 0.12, sprite: 'dust-cloud-1' },
    { id: 'dust7-02', position: { x: 600, y: 6600 }, width: 120, height: 90, speed: -18, alpha: 0.12, sprite: 'dust-swirl-1' },
    { id: 'dust7-03', position: { x: 100, y: 5800 }, width: 110, height: 85, speed: -22, alpha: 0.14, sprite: 'dust-cloud-2' },
    { id: 'dust7-04', position: { x: 700, y: 5000 }, width: 90, height: 70, speed: -16, alpha: 0.1, sprite: 'dust-swirl-2' },
    { id: 'dust7-05', position: { x: 350, y: 4200 }, width: 130, height: 95, speed: -24, alpha: 0.13, sprite: 'dust-cloud-3' },
    { id: 'dust7-06', position: { x: 800, y: 3400 }, width: 100, height: 80, speed: -19, alpha: 0.11, sprite: 'dust-swirl-3' },
    { id: 'dust7-07', position: { x: 250, y: 2600 }, width: 115, height: 88, speed: -21, alpha: 0.12, sprite: 'dust-cloud-4' },
    { id: 'dust7-08', position: { x: 650, y: 1800 }, width: 105, height: 82, speed: -17, alpha: 0.1, sprite: 'dust-swirl-4' },
    { id: 'dust7-09', position: { x: 400, y: 1000 }, width: 100, height: 80, speed: -20, alpha: 0.12, sprite: 'dust-cloud-1' },
  ],
  cliffs: [
    // Cliff 1: Elevated outpost at section 3 (Y ~6000)
    {
      id: 'cliff7-01',
      position: { x: 500, y: 5900 },
      tiles: [
        { col: 0, row: 0, type: 'corner-nw-convex' },
        { col: 1, row: 0, type: 'edge-north' },
        { col: 2, row: 0, type: 'edge-north' },
        { col: 3, row: 0, type: 'corner-ne-convex' },
        { col: 0, row: 1, type: 'edge-west' },
        { col: 1, row: 1, type: 'surface' },
        { col: 2, row: 1, type: 'surface' },
        { col: 3, row: 1, type: 'edge-east' },
        { col: 0, row: 2, type: 'corner-sw-convex' },
        { col: 1, row: 2, type: 'ramp-south-north' },
        { col: 2, row: 2, type: 'edge-south' },
        { col: 3, row: 2, type: 'corner-se-convex' },
      ],
    },
    // Cliff 2: Ridge at section 5 (Y ~4400)
    {
      id: 'cliff7-02',
      position: { x: 100, y: 4300 },
      tiles: [
        { col: 0, row: 0, type: 'corner-nw-convex' },
        { col: 1, row: 0, type: 'edge-north' },
        { col: 2, row: 0, type: 'edge-north' },
        { col: 3, row: 0, type: 'edge-north' },
        { col: 4, row: 0, type: 'corner-ne-convex' },
        { col: 0, row: 1, type: 'edge-west' },
        { col: 1, row: 1, type: 'surface' },
        { col: 2, row: 1, type: 'surface' },
        { col: 3, row: 1, type: 'surface' },
        { col: 4, row: 1, type: 'edge-east' },
        { col: 0, row: 2, type: 'corner-sw-convex' },
        { col: 1, row: 2, type: 'edge-south' },
        { col: 2, row: 2, type: 'ramp-south-north' },
        { col: 3, row: 2, type: 'edge-south' },
        { col: 4, row: 2, type: 'corner-se-convex' },
      ],
    },
    // Cliff 3: Sniper perch at section 7 (Y ~2700)
    {
      id: 'cliff7-03',
      position: { x: 700, y: 2600 },
      tiles: [
        { col: 0, row: 0, type: 'corner-nw-convex' },
        { col: 1, row: 0, type: 'edge-north' },
        { col: 2, row: 0, type: 'corner-ne-convex' },
        { col: 0, row: 1, type: 'edge-west' },
        { col: 1, row: 1, type: 'surface' },
        { col: 2, row: 1, type: 'edge-east' },
        { col: 0, row: 2, type: 'corner-sw-convex' },
        { col: 1, row: 2, type: 'ramp-south-north' },
        { col: 2, row: 2, type: 'corner-se-convex' },
      ],
    },
  ],
  enemyPlacements: [
    // --- Starting area (Y 7800-7200): familiar ground threats ---
    { id: 'me7-01', type: 'gun-nest', position: { x: 650, y: 7500 }, elevation: 0 },
    { id: 'me7-02', type: 'popup-mine', position: { x: 400, y: 7300 }, elevation: 0 },
    { id: 'me7-03', type: 'gun-nest', position: { x: 850, y: 7200 }, elevation: 0 },

    // --- Section 2 (Y 7200-6400): introduce laser copters ---
    { id: 'me7-04', type: 'laser-copter', position: { x: 500, y: 7000 }, elevation: 0 },
    { id: 'me7-05', type: 'gun-nest', position: { x: 300, y: 6800 }, elevation: 0 },
    { id: 'me7-06', type: 'laser-copter', position: { x: 800, y: 6600 }, elevation: 0 },
    { id: 'me7-07', type: 'popup-mine', position: { x: 450, y: 6400 }, elevation: 0 },

    // --- Section 3 (Y 6400-5600): rocket copter + cliff turrets ---
    { id: 'me7-08', type: 'rocket-copter', position: { x: 400, y: 6200 }, elevation: 0 },
    { id: 'me7-09', type: 'turret', position: { x: 700, y: 6090 }, elevation: 1 },
    { id: 'me7-10', type: 'gun-nest', position: { x: 400, y: 6300 }, elevation: 0 },
    { id: 'me7-11', type: 'rocket-copter', position: { x: 700, y: 5700 }, elevation: 0 },

    // --- Section 4 (Y 5600-4800): spread bomber fly-throughs ---
    { id: 'me7-12', type: 'spread-bomber', position: { x: 600, y: 5400 }, elevation: 0 },
    { id: 'me7-13', type: 'gun-nest', position: { x: 300, y: 5300 }, elevation: 0 },
    { id: 'me7-14', type: 'gun-nest', position: { x: 900, y: 5200 }, elevation: 0 },
    { id: 'me7-15', type: 'popup-mine', position: { x: 500, y: 5000 }, elevation: 0 },
    { id: 'me7-16', type: 'spread-bomber', position: { x: 400, y: 4900 }, elevation: 0 },

    // --- Section 5 (Y 4800-4000): hover tanks + mines ---
    { id: 'me7-17', type: 'hover-tank', position: { x: 700, y: 4750 }, elevation: 0 },
    { id: 'me7-18', type: 'popup-mine', position: { x: 800, y: 4500 }, elevation: 0 },
    { id: 'me7-19', type: 'turret', position: { x: 350, y: 4480 }, elevation: 1 },
    { id: 'me7-20', type: 'hover-tank', position: { x: 600, y: 4000 }, elevation: 0 },
    { id: 'me7-21', type: 'popup-mine', position: { x: 1000, y: 4150 }, elevation: 0 },

    // --- Section 6 (Y 4000-3200): mixed copters + homing bomber ---
    { id: 'me7-22', type: 'laser-copter', position: { x: 400, y: 3800 }, elevation: 0 },
    { id: 'me7-23', type: 'rocket-copter', position: { x: 800, y: 3600 }, elevation: 0 },
    { id: 'me7-24', type: 'homing-bomber', position: { x: 600, y: 3400 }, elevation: 0 },
    { id: 'me7-25', type: 'gun-nest', position: { x: 500, y: 3300 }, elevation: 0 },

    // --- Section 7 (Y 3200-2400): heavy combined ---
    { id: 'me7-26', type: 'turret', position: { x: 890, y: 2770 }, elevation: 1 },
    { id: 'me7-27', type: 'homing-bomber', position: { x: 500, y: 2800 }, elevation: 0 },
    { id: 'me7-28', type: 'hover-tank', position: { x: 100, y: 2900 }, elevation: 0 },
    { id: 'me7-29', type: 'laser-copter', position: { x: 500, y: 2500 }, elevation: 0 },

    // --- Final approach (Y 2400-200): maximum intensity, all types ---
    { id: 'me7-30', type: 'rocket-copter', position: { x: 400, y: 2200 }, elevation: 0 },
    { id: 'me7-31', type: 'spread-bomber', position: { x: 600, y: 2000 }, elevation: 0 },
    { id: 'me7-32', type: 'hover-tank', position: { x: 700, y: 1800 }, elevation: 0 },
    { id: 'me7-33', type: 'turret', position: { x: 300, y: 1600 }, elevation: 0 },
    { id: 'me7-34', type: 'homing-bomber', position: { x: 500, y: 1400 }, elevation: 0 },
    { id: 'me7-35', type: 'laser-copter', position: { x: 800, y: 1200 }, elevation: 0 },
    { id: 'me7-36', type: 'rocket-copter', position: { x: 600, y: 1000 }, elevation: 0 },
    { id: 'me7-37', type: 'gun-nest', position: { x: 400, y: 800 }, elevation: 0 },
    { id: 'me7-38', type: 'popup-mine', position: { x: 900, y: 600 }, elevation: 0 },
    { id: 'me7-39', type: 'hover-tank', position: { x: 500, y: 400 }, elevation: 0 },
  ],
};

/** Level config for level 7 (no wave-based enemies). */
export const level7: LevelConfig = {
  levelNumber: 7,
  name: 'Get to the Chopper',
  waves: [],
};
