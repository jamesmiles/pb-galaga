import type { Player, PlayerInput, Vector2D } from '../../../types';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_FIRE_COOLDOWN,
  PLAYER_INVULNERABILITY_DURATION, PLAYER_COLLISION_RADIUS,
} from '../../../engine/constants';

/** Player ship half-size for boundary clamping. */
const PLAYER_HALF_SIZE = PLAYER_COLLISION_RADIUS + 2;

/**
 * Update a player's state for one tick.
 * Operates on currentState only (post-swap).
 */
export function updatePlayerShip(player: Player, dtSeconds: number): void {
  if (!player.isAlive) return;

  updateMovement(player, dtSeconds);
  updateInvulnerability(player, dtSeconds);
  updateFireCooldown(player, dtSeconds);
  updateFiring(player);
}

function updateMovement(player: Player, dtSeconds: number): void {
  const input = player.input;
  const speed = PLAYER_SPEED * dtSeconds;

  // Velocity from input
  player.velocity.x = 0;
  player.velocity.y = 0;

  if (input.left) player.velocity.x = -speed;
  if (input.right) player.velocity.x = speed;
  if (input.up) player.velocity.y = -speed;
  if (input.down) player.velocity.y = speed;

  // Diagonal normalization
  if (player.velocity.x !== 0 && player.velocity.y !== 0) {
    const factor = 1 / Math.SQRT2;
    player.velocity.x *= factor;
    player.velocity.y *= factor;
  }

  // Apply velocity
  player.position.x += player.velocity.x;
  player.position.y += player.velocity.y;

  // Boundary clamping
  player.position.x = Math.max(PLAYER_HALF_SIZE, Math.min(GAME_WIDTH - PLAYER_HALF_SIZE, player.position.x));
  player.position.y = Math.max(PLAYER_HALF_SIZE, Math.min(GAME_HEIGHT - PLAYER_HALF_SIZE, player.position.y));

  player.isThrusting = player.velocity.x !== 0 || player.velocity.y !== 0;
}

function updateInvulnerability(player: Player, dtSeconds: number): void {
  if (!player.isInvulnerable) return;
  player.invulnerabilityTimer -= dtSeconds * 1000;
  if (player.invulnerabilityTimer <= 0) {
    player.isInvulnerable = false;
    player.invulnerabilityTimer = 0;
  }
}

function updateFireCooldown(player: Player, dtSeconds: number): void {
  if (player.fireCooldown > 0) {
    player.fireCooldown -= dtSeconds * 1000;
    if (player.fireCooldown < 0) player.fireCooldown = 0;
  }
}

function updateFiring(player: Player): void {
  player.isFiring = player.input.fire && player.fireCooldown <= 0;
  if (player.isFiring) {
    player.fireCooldown = PLAYER_FIRE_COOLDOWN;
  }
}

/** Respawn a dead player if they have lives remaining. */
export function respawnPlayer(player: Player): void {
  if (player.lives <= 0) return;
  player.isAlive = true;
  player.health = player.maxHealth;
  player.position = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 };
  player.velocity = { x: 0, y: 0 };
  player.isInvulnerable = true;
  player.invulnerabilityTimer = PLAYER_INVULNERABILITY_DURATION;
  player.collisionState = 'none';
}

/** Apply damage to a player. Returns true if player died. */
export function damagePlayer(player: Player, damage: number): boolean {
  if (player.isInvulnerable || !player.isAlive) return false;
  player.health -= damage;
  if (player.health <= 0) {
    player.health = 0;
    player.isAlive = false;
    player.lives--;
    player.collisionState = 'destroyed';
    return true;
  }
  player.collisionState = 'colliding';
  player.isInvulnerable = true;
  player.invulnerabilityTimer = PLAYER_INVULNERABILITY_DURATION;
  return false;
}
