import type { Enemy } from '../../../../types';
import { ENEMY_B_HEALTH, ENEMY_B_SCORE_VALUE, ENEMY_B_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyBId = 0;

/** Create a Type B enemy (slow fighter with laser) at a formation grid slot. */
export function createEnemyB(row: number, col: number): Enemy {
  return {
    id: `enemyB-${nextEnemyBId++}`,
    type: 'B',
    position: { x: 0, y: 0 }, // Set by formation manager
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_B_HEALTH,
    maxHealth: ENEMY_B_HEALTH,
    fireMode: 'laser',
    fireCooldown: 0,
    fireRate: 3000, // fires every ~3 seconds
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_B_SCORE_VALUE,
    collisionRadius: ENEMY_B_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
  };
}
