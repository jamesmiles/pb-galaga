import type { Enemy } from '../../../../types';
import { ENEMY_F_HEALTH, ENEMY_F_SCORE_VALUE, ENEMY_F_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyFId = 0;

/** Create a Type F enemy (stealth bomber with homing missiles) at a formation grid slot. */
export function createEnemyF(row: number, col: number): Enemy {
  return {
    id: `enemyF-${nextEnemyFId++}`,
    type: 'F',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_F_HEALTH,
    maxHealth: ENEMY_F_HEALTH,
    fireMode: 'homing',
    fireCooldown: 0,
    fireRate: 3500,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_F_SCORE_VALUE,
    collisionRadius: ENEMY_F_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
