import type { Enemy } from '../../../../types';
import { ENEMY_H_HEALTH, ENEMY_H_SCORE_VALUE, ENEMY_H_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyHId = 0;

/** Create a Type H enemy (stationary turret cannon with aimed bullets) at a formation grid slot. */
export function createEnemyH(row: number, col: number): Enemy {
  return {
    id: `enemyH-${nextEnemyHId++}`,
    type: 'H',
    isStationary: true,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: Math.PI,
    isAlive: true,
    health: ENEMY_H_HEALTH,
    maxHealth: ENEMY_H_HEALTH,
    fireMode: 'bullet',
    fireCooldown: 0,
    fireRate: 2000,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_H_SCORE_VALUE,
    collisionRadius: ENEMY_H_COLLISION_RADIUS,
    formationRow: row,
    formationCol: col,
    diveState: null,
    flightPathState: null,
  };
}
