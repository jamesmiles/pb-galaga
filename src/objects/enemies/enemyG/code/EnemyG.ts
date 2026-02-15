import type { Enemy } from '../../../../types';
import { ENEMY_G_HEALTH, ENEMY_G_SCORE_VALUE, ENEMY_G_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyGId = 0;

/** Create a Type G enemy (mini-boss: large stealth bomber with double homing missiles). */
export function createEnemyG(row: number, col: number): Enemy {
  return {
    id: `enemyG-${nextEnemyGId++}`,
    type: 'G',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_G_HEALTH,
    maxHealth: ENEMY_G_HEALTH,
    fireMode: 'homing',
    fireCooldown: 0,
    fireRate: 1800, // Aggressive — fires double homing missiles frequently
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_G_SCORE_VALUE,
    collisionRadius: ENEMY_G_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
