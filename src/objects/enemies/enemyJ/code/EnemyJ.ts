import type { Enemy } from '../../../../types';
import { ENEMY_J_HEALTH, ENEMY_J_SCORE_VALUE, ENEMY_J_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyJId = 0;

/** Create a Type J enemy (mobile mech warrior with spread fire) at a formation grid slot. */
export function createEnemyJ(row: number, col: number): Enemy {
  return {
    id: `enemyJ-${nextEnemyJId++}`,
    type: 'J',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_J_HEALTH,
    maxHealth: ENEMY_J_HEALTH,
    fireMode: 'spread',
    fireCooldown: 0,
    fireRate: 4000,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_J_SCORE_VALUE,
    collisionRadius: ENEMY_J_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
