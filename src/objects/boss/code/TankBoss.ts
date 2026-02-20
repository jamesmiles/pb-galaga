import type { BossState, BossTurret, CollisionZone } from '../../../types';
import {
  TANK_BOSS_WIDTH, TANK_BOSS_HEIGHT, TANK_BOSS_BRIDGE_HEALTH,
  TANK_BOSS_TREAD_HEALTH, TANK_BOSS_TREAD_FIRE_RATE,
  TANK_BOSS_DOME_FIRE_RATE, TANK_BOSS_SCORE_VALUE,
  GAME_WIDTH, BOSS_TURRET_COLLISION_RADIUS,
} from '../../../engine/constants';

/**
 * Create the Tank Boss — "Mars Siege Tank".
 *
 * Phase 1: 4 tread turrets (2 per side) fire bullets. Destroy all 4 to advance.
 * Phase 2: Central dome fires rapid homing missiles. Destroy dome (bridge) to win.
 */
export function createTankBoss(): BossState {
  // Enter from the right side of the screen
  const startX = GAME_WIDTH + TANK_BOSS_WIDTH / 2;
  const startY = 180; // Upper-mid screen

  const turrets: BossTurret[] = [];

  // 4 tread-segment turrets: left-front, left-rear, right-front, right-rear
  const treadPositions = [
    { offsetX: -TANK_BOSS_WIDTH * 0.38, offsetY: TANK_BOSS_HEIGHT * 0.25, label: 'lf' },
    { offsetX: -TANK_BOSS_WIDTH * 0.38, offsetY: -TANK_BOSS_HEIGHT * 0.25, label: 'lr' },
    { offsetX: TANK_BOSS_WIDTH * 0.38, offsetY: TANK_BOSS_HEIGHT * 0.25, label: 'rf' },
    { offsetX: TANK_BOSS_WIDTH * 0.38, offsetY: -TANK_BOSS_HEIGHT * 0.25, label: 'rr' },
  ];

  for (let i = 0; i < treadPositions.length; i++) {
    const pos = treadPositions[i];
    turrets.push({
      id: `tank-tread-${pos.label}`,
      position: { x: startX + pos.offsetX, y: startY + pos.offsetY },
      offsetX: pos.offsetX,
      offsetY: pos.offsetY,
      health: TANK_BOSS_TREAD_HEALTH,
      maxHealth: TANK_BOSS_TREAD_HEALTH,
      isAlive: true,
      fireCooldown: 800 + i * 200,
      fireRate: TANK_BOSS_TREAD_FIRE_RATE,
      collisionRadius: BOSS_TURRET_COLLISION_RADIUS,
      fireType: 'bullet',
    });
  }

  // Central dome turret — becomes targetable after treads destroyed
  // Initially alive but doesn't fire until phase 2 (handled in BossManager)
  turrets.push({
    id: 'tank-dome',
    position: { x: startX, y: startY },
    offsetX: 0,
    offsetY: 0,
    health: 0, // Not a target during phase 1 (damage goes to bridge)
    maxHealth: 0,
    isAlive: false, // Dome uses bridge health, not turret health
    fireCooldown: TANK_BOSS_DOME_FIRE_RATE,
    fireRate: TANK_BOSS_DOME_FIRE_RATE,
    collisionRadius: BOSS_TURRET_COLLISION_RADIUS * 1.5,
    fireType: 'homing',
  });

  // Upper collision zone: central dome area (bridge target)
  const upperCollisionZones: CollisionZone[] = [
    { offsetX: 0, offsetY: 0, width: TANK_BOSS_WIDTH * 0.25, height: TANK_BOSS_HEIGHT * 0.5 },
  ];

  return {
    variant: 'tank',
    position: { x: startX, y: startY },
    velocity: { x: 0, y: 0 },
    width: TANK_BOSS_WIDTH,
    height: TANK_BOSS_HEIGHT,
    isAlive: true,
    health: TANK_BOSS_BRIDGE_HEALTH,
    maxHealth: TANK_BOSS_BRIDGE_HEALTH,
    turrets,
    layer: 'entering',
    deathSequence: null,
    scoreValue: TANK_BOSS_SCORE_VALUE,
    upperCollisionZones,
  };
}
