import type { Enemy } from '../../../../types';
import { ENEMY_A_HEALTH, ENEMY_A_SCORE_VALUE } from '../../../../engine/constants';

let nextEnemyId = 0;

/** Create a Type A enemy at a formation grid slot. */
export function createEnemyA(row: number, col: number): Enemy {
  return {
    id: `enemyA-${nextEnemyId++}`,
    type: 'A',
    position: { x: 0, y: 0 }, // Set by formation manager
    velocity: { x: 0, y: 0 },
    rotation: Math.PI, // Facing downward
    isAlive: true,
    health: ENEMY_A_HEALTH,
    maxHealth: ENEMY_A_HEALTH,
    fireMode: 'none',
    fireCooldown: 0,
    fireRate: 0,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_A_SCORE_VALUE,
    formationRow: row,
    formationCol: col,
  };
}

/** Apply damage to an enemy. Returns true if the enemy died. */
export function damageEnemy(enemy: Enemy, damage: number): boolean {
  if (!enemy.isAlive) return false;
  enemy.health -= damage;
  if (enemy.health <= 0) {
    enemy.health = 0;
    enemy.isAlive = false;
    enemy.collisionState = 'destroyed';
    return true;
  }
  enemy.collisionState = 'colliding';
  return false;
}
