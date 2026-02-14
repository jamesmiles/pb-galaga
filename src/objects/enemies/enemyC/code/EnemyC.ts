import type { Enemy } from '../../../../types';
import { ENEMY_C_HEALTH, ENEMY_C_SCORE_VALUE, ENEMY_C_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyCId = 0;

/** Create a Type C enemy (fast fighter with bullets) at a formation grid slot. */
export function createEnemyC(row: number, col: number): Enemy {
  return {
    id: `enemyC-${nextEnemyCId++}`,
    type: 'C',
    position: { x: 0, y: 0 }, // Set by formation manager
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_C_HEALTH,
    maxHealth: ENEMY_C_HEALTH,
    fireMode: 'bullet',
    fireCooldown: 0,
    fireRate: 2000, // fires every ~2 seconds
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_C_SCORE_VALUE,
    collisionRadius: ENEMY_C_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
  };
}
