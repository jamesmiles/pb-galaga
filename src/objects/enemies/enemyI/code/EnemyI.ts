import type { Enemy } from '../../../../types';
import { ENEMY_I_HEALTH, ENEMY_I_SCORE_VALUE, ENEMY_I_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyIId = 0;

/** Create a Type I enemy (stationary artillery with aimed plasma) at a formation grid slot. */
export function createEnemyI(row: number, col: number): Enemy {
  return {
    id: `enemyI-${nextEnemyIId++}`,
    type: 'I',
    isStationary: true,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_I_HEALTH,
    maxHealth: ENEMY_I_HEALTH,
    fireMode: 'plasma',
    fireCooldown: 0,
    fireRate: 2500,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_I_SCORE_VALUE,
    collisionRadius: ENEMY_I_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
