import type { BossState, BossTurret, CollisionZone } from '../../../types';
import {
  BOSS_WIDTH, BOSS_HEIGHT, BOSS_HEALTH,
  BOSS_TURRET_HEALTH, BOSS_TURRET_FIRE_RATE, BOSS_TURRET_COLLISION_RADIUS,
  BOSS_SCORE_VALUE, GAME_WIDTH,
} from '../../../engine/constants';

/** Create the initial boss state with 4 turrets spanning the width. */
export function createBoss(): BossState {
  const cx = GAME_WIDTH / 2;
  const turretSpacing = BOSS_WIDTH / 5; // 4 turrets evenly distributed

  const turrets: BossTurret[] = [];
  for (let i = 0; i < 4; i++) {
    const offsetX = -BOSS_WIDTH / 2 + turretSpacing * (i + 1);
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

  // Upper collision zones — turrets + bridge
  // Bridge zone sits between the two inner turrets (±144 offset), so keep halfW < 144
  const upperCollisionZones: CollisionZone[] = [
    { offsetX: 0, offsetY: BOSS_HEIGHT * 0.3, width: BOSS_WIDTH * 0.3, height: BOSS_HEIGHT * 0.4 },
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
