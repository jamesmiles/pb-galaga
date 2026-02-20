import type { Enemy } from '../../../../types';
import { ENEMY_K_HEALTH, ENEMY_K_SCORE_VALUE, ENEMY_K_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyKId = 0;

/** Create a Type K enemy (mobile missile launcher with homing missiles) at a formation grid slot. */
export function createEnemyK(row: number, col: number): Enemy {
  return {
    id: `enemyK-${nextEnemyKId++}`,
    type: 'K',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_K_HEALTH,
    maxHealth: ENEMY_K_HEALTH,
    fireMode: 'homing',
    fireCooldown: 0,
    fireRate: 3500,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_K_SCORE_VALUE,
    collisionRadius: ENEMY_K_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
