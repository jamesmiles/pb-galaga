import type { BossState, BossTurret, CollisionZone } from '../../../types';
import {
  BOSS_WIDTH, BOSS_HEIGHT, BOSS_HEALTH,
  BOSS_TURRET_HEALTH, BOSS_TURRET_FIRE_RATE, BOSS_TURRET_COLLISION_RADIUS,
  BOSS_SCORE_VALUE, GAME_WIDTH,
} from '../../../engine/constants';

/** Create the initial boss state with 4 turrets spanning the width. */
export function createBoss(): BossState {
  const cx = GAME_WIDTH / 2;
  // 4 turrets: 2 outer pair and 2 inner pair, with a gap in the center for the bridge
  const outerOffset = BOSS_WIDTH * 0.42; // ~302px from center
  const innerOffset = BOSS_WIDTH * 0.2;  // ~144px from center
  const turretOffsets = [-outerOffset, -innerOffset, innerOffset, outerOffset];

  const turrets: BossTurret[] = [];
  for (let i = 0; i < 4; i++) {
    const offsetX = turretOffsets[i];
    turrets.push({
      id: `boss-turret-${i}`,
      position: { x: cx + offsetX, y: -BOSS_HEIGHT / 2 }, // Updated during entry
      offsetX,
      offsetY: BOSS_HEIGHT * 0.3, // Turrets on the upper/forward part of boss
      health: BOSS_TURRET_HEALTH,
      maxHealth: BOSS_TURRET_HEALTH,
      isAlive: true,
      fireCooldown: 1000 + i * 500, // Stagger initial fire
      fireRate: BOSS_TURRET_FIRE_RATE,
      collisionRadius: BOSS_TURRET_COLLISION_RADIUS,
    });
  }

  // Upper collision zones — bridge only (turrets have their own circle collision)
  // Bridge sits between inner turrets at ±144px, so width must be < 288
  const upperCollisionZones: CollisionZone[] = [
    { offsetX: 0, offsetY: BOSS_HEIGHT * 0.3, width: BOSS_WIDTH * 0.18, height: BOSS_HEIGHT * 0.4 },
  ];

  return {
    position: { x: cx, y: -BOSS_HEIGHT / 2 }, // Start above screen
    velocity: { x: 0, y: 0 },
    width: BOSS_WIDTH,
    height: BOSS_HEIGHT,
    isAlive: true,
    health: BOSS_HEALTH,
    maxHealth: BOSS_HEALTH,
    turrets,
    layer: 'entering',
    deathSequence: null,
    scoreValue: BOSS_SCORE_VALUE,
    upperCollisionZones,
  };
}
