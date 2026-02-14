import type { Enemy } from '../../../../types';
import { ENEMY_E_HEALTH, ENEMY_E_SCORE_VALUE, ENEMY_E_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyEId = 0;

/** Create a Type E enemy (strategic bomber with spread shot) at a formation grid slot. */
export function createEnemyE(row: number, col: number): Enemy {
  return {
    id: `enemyE-${nextEnemyEId++}`,
    type: 'E',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_E_HEALTH,
    maxHealth: ENEMY_E_HEALTH,
    fireMode: 'spread',
    fireCooldown: 0,
    fireRate: 4000,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_E_SCORE_VALUE,
    collisionRadius: ENEMY_E_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
