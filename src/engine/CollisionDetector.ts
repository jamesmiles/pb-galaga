import type { GameState, Player, Enemy, Projectile, Vector2D } from '../types';
import { PLAYER_COLLISION_RADIUS } from './constants';
import { damagePlayer } from '../objects/player/code/PlayerShip';
import { damageEnemy } from '../objects/enemies/enemyA/code/EnemyA';

function distance(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Run collision detection on currentState.
 * Called AFTER movement updates, within the same tick.
 */
export function detectCollisions(state: GameState): void {
  detectPlayerEnemyCollisions(state);
  detectProjectileEnemyCollisions(state);
  detectEnemyProjectilePlayerCollisions(state);
}

function detectPlayerEnemyCollisions(state: GameState): void {
  for (const player of state.players) {
    if (!player.isAlive || player.isInvulnerable) continue;
    for (const enemy of state.enemies) {
      if (!enemy.isAlive) continue;
      const dist = distance(player.position, enemy.position);
      if (dist < PLAYER_COLLISION_RADIUS + enemy.collisionRadius) {
        // Both take damage
        const playerDied = damagePlayer(player, player.maxHealth); // instant kill
        damageEnemy(enemy, enemy.maxHealth); // instant kill
      }
    }
  }
}

function detectProjectileEnemyCollisions(state: GameState): void {
  for (const proj of state.projectiles) {
    if (!proj.isActive || proj.hasCollided) continue;
    // Player projectiles hit enemies
    if (proj.owner.type === 'player') {
      for (const enemy of state.enemies) {
        if (!enemy.isAlive) continue;
        const dist = distance(proj.position, enemy.position);
        if (dist < proj.collisionRadius + enemy.collisionRadius) {
          proj.hasCollided = true;
          proj.isActive = false;
          const killed = damageEnemy(enemy, proj.damage);
          if (killed) {
            // Award score to the player who fired
            const scoringPlayer = state.players.find(p => p.id === proj.owner.id);
            if (scoringPlayer) {
              scoringPlayer.score += enemy.scoreValue;
            }
          }
          break; // One projectile hits one enemy
        }
      }
    }
  }
}

function detectEnemyProjectilePlayerCollisions(state: GameState): void {
  for (const proj of state.projectiles) {
    if (!proj.isActive || proj.hasCollided) continue;
    if (proj.owner.type !== 'enemy') continue;

    for (const player of state.players) {
      if (!player.isAlive || player.isInvulnerable) continue;
      const dist = distance(proj.position, player.position);
      if (dist < proj.collisionRadius + PLAYER_COLLISION_RADIUS) {
        proj.hasCollided = true;
        proj.isActive = false;
        damagePlayer(player, proj.damage);
        break; // One projectile hits one player
      }
    }
  }
}
