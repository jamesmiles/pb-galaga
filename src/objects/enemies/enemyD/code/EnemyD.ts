import type { Enemy } from '../../../../types';
import { ENEMY_D_HEALTH, ENEMY_D_SCORE_VALUE, ENEMY_D_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyDId = 0;

/** Create a Type D enemy (curved fighter with plasma cannon) at a formation grid slot. */
export function createEnemyD(row: number, col: number): Enemy {
  return {
    id: `enemyD-${nextEnemyDId++}`,
    type: 'D',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_D_HEALTH,
    maxHealth: ENEMY_D_HEALTH,
    fireMode: 'plasma',
    fireCooldown: 0,
    fireRate: 2500,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_D_SCORE_VALUE,
    collisionRadius: ENEMY_D_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
