import type { Vector2D, Player, Enemy, Projectile, GameState } from '../types';
import { PLAYER_COLLISION_RADIUS } from './constants';

export interface CollisionPair {
  entityAId: string;
  entityBId: string;
}

/** Check if two circles overlap. */
export function checkCircleCollision(
  pos1: Vector2D, radius1: number,
  pos2: Vector2D, radius2: number,
): boolean {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distSquared = dx * dx + dy * dy;
  const radiusSum = radius1 + radius2;
  return distSquared <= radiusSum * radiusSum;
}

/** Detect collisions between players and enemies. */
export function detectPlayerEnemyCollisions(
  players: Player[],
  enemies: Enemy[],
): CollisionPair[] {
  const pairs: CollisionPair[] = [];
  for (const player of players) {
    if (!player.isAlive || player.isInvulnerable) continue;
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      if (checkCircleCollision(
        player.position, PLAYER_COLLISION_RADIUS,
        enemy.position, enemy.collisionRadius,
      )) {
        pairs.push({ entityAId: player.id, entityBId: enemy.id });
      }
    }
  }
  return pairs;
}

/** Detect collisions between projectiles and enemies (player projectiles vs enemies). */
export function detectProjectileEnemyCollisions(
  projectiles: Projectile[],
  enemies: Enemy[],
): CollisionPair[] {
  const pairs: CollisionPair[] = [];
  for (const proj of projectiles) {
    if (!proj.isActive || proj.hasCollided || proj.owner.type !== 'player') continue;
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      if (checkCircleCollision(
        proj.position, proj.collisionRadius,
        enemy.position, enemy.collisionRadius,
      )) {
        pairs.push({ entityAId: proj.id, entityBId: enemy.id });
      }
    }
  }
  return pairs;
}

/** Detect collisions between enemy projectiles and players. */
export function detectProjectilePlayerCollisions(
  projectiles: Projectile[],
  players: Player[],
): CollisionPair[] {
  const pairs: CollisionPair[] = [];
  for (const proj of projectiles) {
    if (!proj.isActive || proj.hasCollided || proj.owner.type !== 'enemy') continue;
    for (const player of players) {
      if (!player.isAlive || player.isInvulnerable) continue;
      if (checkCircleCollision(
        proj.position, proj.collisionRadius,
        player.position, PLAYER_COLLISION_RADIUS,
      )) {
        pairs.push({ entityAId: proj.id, entityBId: player.id });
      }
    }
  }
  return pairs;
}

/** Run full collision detection and apply results. */
export function processCollisions(state: GameState): void {
  // Player-enemy collisions
  const playerEnemyHits = detectPlayerEnemyCollisions(state.players, state.enemies);
  for (const pair of playerEnemyHits) {
    const player = state.players.find(p => p.id === pair.entityAId);
    const enemy = state.enemies.find(e => e.id === pair.entityBId);
    if (player && enemy) {
      // Player takes damage equal to enemy's remaining health
      player.health -= enemy.health;
      player.collisionState = 'colliding';
      if (player.health <= 0) {
        player.health = 0;
        player.isAlive = false;
        player.lives--;
        if (player.lives < 0) player.lives = 0;
        player.collisionState = 'destroyed';
      }
      // Enemy destroyed on contact
      enemy.health = 0;
      enemy.isAlive = false;
      enemy.collisionState = 'destroyed';
      // Award score
      player.score += enemy.scoreValue;
    }
  }

  // Projectile-enemy collisions
  const projEnemyHits = detectProjectileEnemyCollisions(state.projectiles, state.enemies);
  for (const pair of projEnemyHits) {
    const proj = state.projectiles.find(p => p.id === pair.entityAId);
    const enemy = state.enemies.find(e => e.id === pair.entityBId);
    if (proj && enemy) {
      enemy.health -= proj.damage;
      proj.hasCollided = true;
      proj.isActive = false;

      if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.isAlive = false;
        enemy.collisionState = 'destroyed';
        // Award score to projectile owner
        if (proj.owner.type === 'player') {
          const player = state.players.find(p => p.id === proj.owner.id);
          if (player) player.score += enemy.scoreValue;
        }
      }
    }
  }

  // Enemy projectile-player collisions
  const projPlayerHits = detectProjectilePlayerCollisions(state.projectiles, state.players);
  for (const pair of projPlayerHits) {
    const proj = state.projectiles.find(p => p.id === pair.entityAId);
    const player = state.players.find(p => p.id === pair.entityBId);
    if (proj && player) {
      player.health -= proj.damage;
      player.collisionState = 'colliding';
      proj.hasCollided = true;
      proj.isActive = false;

      if (player.health <= 0) {
        player.health = 0;
        player.isAlive = false;
        player.lives--;
        if (player.lives < 0) player.lives = 0;
        player.collisionState = 'destroyed';
      }
    }
  }
}
