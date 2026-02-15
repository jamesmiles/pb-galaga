import type { BossState, BossTurret, CollisionZone } from '../../../types';
import {
  BOSS_WIDTH, BOSS_HEIGHT, BOSS_HEALTH,
  BOSS_TURRET_HEALTH, BOSS_TURRET_FIRE_RATE, BOSS_TURRET_COLLISION_RADIUS,
  BOSS_ROCKET_TURRET_HEALTH, BOSS_ROCKET_TURRET_FIRE_RATE,
  BOSS_SCORE_VALUE, GAME_WIDTH,
} from '../../../engine/constants';

/** Create the initial boss state with 6 turrets: 4 front bullet + 2 rear rocket/homing. */
export function createBoss(): BossState {
  const cx = GAME_WIDTH / 2;
  // 4 front turrets: 2 outer pair and 2 inner pair, with a gap in the center for the bridge
  const outerOffset = BOSS_WIDTH * 0.42; // ~302px from center
  const innerOffset = BOSS_WIDTH * 0.2;  // ~144px from center
  const turretOffsets = [-outerOffset, -innerOffset, innerOffset, outerOffset];

  const turrets: BossTurret[] = [];

  // 4 front bullet turrets
  for (let i = 0; i < 4; i++) {
    const offsetX = turretOffsets[i];
    turrets.push({
      id: `boss-turret-${i}`,
      position: { x: cx + offsetX, y: -BOSS_HEIGHT / 2 },
      offsetX,
      offsetY: BOSS_HEIGHT * 0.3, // Forward/upper part of boss
      health: BOSS_TURRET_HEALTH,
      maxHealth: BOSS_TURRET_HEALTH,
      isAlive: true,
      fireCooldown: 1000 + i * 500,
      fireRate: BOSS_TURRET_FIRE_RATE,
      collisionRadius: BOSS_TURRET_COLLISION_RADIUS,
      fireType: 'bullet',
    });
  }

  // Left rear rocket turret
  turrets.push({
    id: 'boss-turret-rocket',
    position: { x: cx - outerOffset * 0.7, y: -BOSS_HEIGHT / 2 },
    offsetX: -outerOffset * 0.7, // ~211px left of center
    offsetY: -BOSS_HEIGHT * 0.15, // Rear (above center — toward top of ship)
    health: BOSS_ROCKET_TURRET_HEALTH,
    maxHealth: BOSS_ROCKET_TURRET_HEALTH,
    isAlive: true,
    fireCooldown: 2000,
    fireRate: BOSS_ROCKET_TURRET_FIRE_RATE,
    collisionRadius: BOSS_TURRET_COLLISION_RADIUS,
    fireType: 'rocket',
  });

  // Right rear homing turret
  turrets.push({
    id: 'boss-turret-homing',
    position: { x: cx + outerOffset * 0.7, y: -BOSS_HEIGHT / 2 },
    offsetX: outerOffset * 0.7, // ~211px right of center
    offsetY: -BOSS_HEIGHT * 0.15, // Rear
    health: BOSS_ROCKET_TURRET_HEALTH,
    maxHealth: BOSS_ROCKET_TURRET_HEALTH,
    isAlive: true,
    fireCooldown: 3000,
    fireRate: BOSS_ROCKET_TURRET_FIRE_RATE,
    collisionRadius: BOSS_TURRET_COLLISION_RADIUS,
    fireType: 'homing',
  });

  // Upper collision zones — bridge only (turrets have their own circle collision)
  const upperCollisionZones: CollisionZone[] = [
    { offsetX: 0, offsetY: BOSS_HEIGHT * 0.3, width: BOSS_WIDTH * 0.18, height: BOSS_HEIGHT * 0.4 },
  ];

  return {
    position: { x: cx, y: -BOSS_HEIGHT / 2 },
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
