import type { GameState, Player, Enemy, Projectile, Asteroid, Vector2D, BossState, BossTurret } from '../types';
import { PLAYER_COLLISION_RADIUS, WEAPON_PICKUP_COLLISION_RADIUS, ASTEROID_DAMAGE, LIFE_PICKUP_COLLISION_RADIUS, BOSS_TURRET_SCORE_VALUE } from './constants';
import { damagePlayer } from '../objects/player/code/PlayerShip';
import { damageEnemy } from '../objects/enemies/enemyA/code/EnemyA';
import { upgradeWeapon } from './WeaponManager';

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
  detectPlayerPickupCollisions(state);
  detectPlayerAsteroidCollisions(state);
  detectProjectileAsteroidCollisions(state);
  detectPlayerLifePickupCollisions(state);
  if (state.boss) {
    detectProjectileBossTurretCollisions(state);
    detectProjectileBossBridgeCollisions(state);
    detectPlayerBossCollisions(state);
  }
}

function detectPlayerEnemyCollisions(state: GameState): void {
  for (const player of state.players) {
    if (!player.isAlive || player.isInvulnerable) continue;
    for (const enemy of state.enemies) {
      if (!enemy.isAlive) continue;
      const dist = distance(player.position, enemy.position);
      if (dist < PLAYER_COLLISION_RADIUS + enemy.collisionRadius) {
        // Both take damage
        damagePlayer(player, player.maxHealth, state.currentTime); // instant kill
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
        damagePlayer(player, proj.damage, state.currentTime);
        break; // One projectile hits one player
      }
    }
  }
}

function detectPlayerPickupCollisions(state: GameState): void {
  for (const pickup of state.weaponPickups) {
    if (!pickup.isActive) continue;
    for (const player of state.players) {
      if (!player.isAlive) continue;
      const dist = distance(player.position, pickup.position);
      if (dist < PLAYER_COLLISION_RADIUS + WEAPON_PICKUP_COLLISION_RADIUS) {
        pickup.isActive = false;
        upgradeWeapon(player, pickup);
        break;
      }
    }
  }
}

function detectPlayerAsteroidCollisions(state: GameState): void {
  for (const player of state.players) {
    if (!player.isAlive || player.isInvulnerable) continue;
    for (const asteroid of state.asteroids) {
      if (!asteroid.isAlive) continue;
      const dist = distance(player.position, asteroid.position);
      if (dist < PLAYER_COLLISION_RADIUS + asteroid.collisionRadius) {
        damagePlayer(player, ASTEROID_DAMAGE, state.currentTime);
        asteroid.isAlive = false;
        break;
      }
    }
  }
}

function detectProjectileAsteroidCollisions(state: GameState): void {
  for (const proj of state.projectiles) {
    if (!proj.isActive || proj.hasCollided) continue;
    // Only player projectiles hit asteroids
    if (proj.owner.type !== 'player') continue;

    for (const asteroid of state.asteroids) {
      if (!asteroid.isAlive) continue;
      const dist = distance(proj.position, asteroid.position);
      if (dist < proj.collisionRadius + asteroid.collisionRadius) {
        proj.hasCollided = true;
        proj.isActive = false;
        asteroid.health -= proj.damage;
        if (asteroid.health <= 0) {
          asteroid.isAlive = false;
          // Award score
          const scoringPlayer = state.players.find(p => p.id === proj.owner.id);
          if (scoringPlayer) {
            scoringPlayer.score += asteroid.scoreValue;
          }
        }
        break;
      }
    }
  }
}

function detectPlayerLifePickupCollisions(state: GameState): void {
  for (const pickup of state.lifePickups) {
    if (!pickup.isActive) continue;
    for (const player of state.players) {
      if (!player.isAlive) continue;
      const dist = distance(player.position, pickup.position);
      if (dist < PLAYER_COLLISION_RADIUS + LIFE_PICKUP_COLLISION_RADIUS) {
        pickup.isActive = false;
        player.lives++;
        break;
      }
    }
  }
}

function detectProjectileBossTurretCollisions(state: GameState): void {
  const boss = state.boss;
  if (!boss || !boss.isAlive || boss.layer === 'entering') return;

  for (const proj of state.projectiles) {
    if (!proj.isActive || proj.hasCollided) continue;
    if (proj.owner.type !== 'player') continue;

    for (const turret of boss.turrets) {
      if (!turret.isAlive) continue;
      const dist = distance(proj.position, turret.position);
      if (dist < proj.collisionRadius + turret.collisionRadius) {
        proj.hasCollided = true;
        proj.isActive = false;
        turret.health -= proj.damage;
        if (turret.health <= 0) {
          turret.health = 0;
          turret.isAlive = false;
          // Award turret score
          const scoringPlayer = state.players.find(p => p.id === proj.owner.id);
          if (scoringPlayer) {
            scoringPlayer.score += BOSS_TURRET_SCORE_VALUE;
          }
        }
        break;
      }
    }
  }
}

function detectProjectileBossBridgeCollisions(state: GameState): void {
  const boss = state.boss;
  if (!boss || !boss.isAlive || boss.layer !== 'active') return;

  // Bridge only takes damage when all turrets are destroyed
  const allTurretsDead = boss.turrets.every(t => !t.isAlive);
  if (!allTurretsDead) return;

  // Bridge collision zone: narrow central area between inner turrets
  const bridgeHalfW = boss.width * 0.15;
  const bridgeHalfH = boss.height * 0.2;
  const bridgeX = boss.position.x;
  const bridgeY = boss.position.y;

  for (const proj of state.projectiles) {
    if (!proj.isActive || proj.hasCollided) continue;
    if (proj.owner.type !== 'player') continue;

    // AABB check against bridge zone
    if (proj.position.x >= bridgeX - bridgeHalfW &&
        proj.position.x <= bridgeX + bridgeHalfW &&
        proj.position.y >= bridgeY - bridgeHalfH &&
        proj.position.y <= bridgeY + bridgeHalfH) {
      proj.hasCollided = true;
      proj.isActive = false;
      boss.health -= proj.damage;
      if (boss.health <= 0) {
        boss.health = 0;
        // Don't set isAlive=false here — death sequence handles that
      }
    }
  }
}

function detectPlayerBossCollisions(state: GameState): void {
  const boss = state.boss;
  if (!boss || !boss.isAlive || boss.layer === 'entering') return;

  // Upper collision zones — player crashes into these
  for (const player of state.players) {
    if (!player.isAlive || player.isInvulnerable) continue;

    for (const zone of boss.upperCollisionZones) {
      const zoneX = boss.position.x + zone.offsetX;
      const zoneY = boss.position.y + zone.offsetY;
      const halfW = zone.width / 2;
      const halfH = zone.height / 2;

      // Circle-AABB collision
      const closestX = Math.max(zoneX - halfW, Math.min(player.position.x, zoneX + halfW));
      const closestY = Math.max(zoneY - halfH, Math.min(player.position.y, zoneY + halfH));
      const dist = distance(player.position, { x: closestX, y: closestY });

      if (dist < PLAYER_COLLISION_RADIUS) {
        // Instant kill player on collision with boss upper layer
        damagePlayer(player, player.maxHealth, state.currentTime);
        break;
      }
    }
  }
}
