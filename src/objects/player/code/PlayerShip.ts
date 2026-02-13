import type { Player, PlayerInput, Vector2D, Bounds, PlayerId } from '../../../types';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_MARGIN,
  PLAYER_SPEED, PLAYER_ACCELERATION, PLAYER_FRICTION,
  PLAYER_START_LIVES, PLAYER_MAX_HEALTH, PLAYER_COLLISION_RADIUS,
  PLAYER_INVULNERABILITY_DURATION,
} from '../../../engine/constants';

export function createPlayer(id: PlayerId = 'player1'): Player {
  return {
    id,
    shipColor: id === 'player1' ? 'red' : 'blue',
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    isAlive: true,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    lives: PLAYER_START_LIVES,
    score: 0,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    fireMode: 'normal',
    fireCooldown: 0,
    powerupActive: null,
    powerupTimer: 0,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    input: { left: false, right: false, up: false, down: false, fire: false },
  };
}

export function getPlayerBounds(): Bounds {
  return {
    minX: PLAYER_MARGIN,
    maxX: GAME_WIDTH - PLAYER_MARGIN,
    minY: PLAYER_MARGIN,
    maxY: GAME_HEIGHT - PLAYER_MARGIN,
  };
}

export function updatePlayer(player: Player, input: PlayerInput, dtSeconds: number): void {
  if (!player.isAlive) return;

  // Update input
  player.input = input;
  player.isFiring = input.fire;

  // Acceleration from input
  let ax = 0;
  let ay = 0;
  if (input.left) ax -= PLAYER_ACCELERATION;
  if (input.right) ax += PLAYER_ACCELERATION;
  if (input.up) ay -= PLAYER_ACCELERATION;
  if (input.down) ay += PLAYER_ACCELERATION;

  player.isThrusting = ax !== 0 || ay !== 0;

  // Apply acceleration
  player.velocity.x += ax * dtSeconds;
  player.velocity.y += ay * dtSeconds;

  // Apply friction when no input on axis
  if (!input.left && !input.right) {
    player.velocity.x = applyFriction(player.velocity.x, PLAYER_FRICTION * dtSeconds);
  }
  if (!input.up && !input.down) {
    player.velocity.y = applyFriction(player.velocity.y, PLAYER_FRICTION * dtSeconds);
  }

  // Clamp velocity to max speed
  player.velocity.x = clamp(player.velocity.x, -PLAYER_SPEED, PLAYER_SPEED);
  player.velocity.y = clamp(player.velocity.y, -PLAYER_SPEED, PLAYER_SPEED);

  // Update position
  player.position.x += player.velocity.x * dtSeconds;
  player.position.y += player.velocity.y * dtSeconds;

  // Clamp position to bounds
  const bounds = getPlayerBounds();
  player.position.x = clamp(player.position.x, bounds.minX, bounds.maxX);
  player.position.y = clamp(player.position.y, bounds.minY, bounds.maxY);

  // Stop velocity if at boundary
  if (player.position.x <= bounds.minX || player.position.x >= bounds.maxX) {
    player.velocity.x = 0;
  }
  if (player.position.y <= bounds.minY || player.position.y >= bounds.maxY) {
    player.velocity.y = 0;
  }

  // Update fire cooldown
  if (player.fireCooldown > 0) {
    player.fireCooldown -= dtSeconds * 1000; // convert to ms
    if (player.fireCooldown < 0) player.fireCooldown = 0;
  }

  // Update invulnerability
  if (player.isInvulnerable) {
    player.invulnerabilityTimer -= dtSeconds * 1000;
    if (player.invulnerabilityTimer <= 0) {
      player.isInvulnerable = false;
      player.invulnerabilityTimer = 0;
    }
  }
}

/** Apply damage to player. Returns true if player died. */
export function applyDamage(player: Player, damage: number): boolean {
  if (!player.isAlive || player.isInvulnerable) return false;

  player.health -= damage;
  player.collisionState = 'colliding';

  if (player.health <= 0) {
    player.health = 0;
    return handleDeath(player);
  }

  return false;
}

/** Handle player death. Returns true if game over (no lives left). */
export function handleDeath(player: Player): boolean {
  player.isAlive = false;
  player.lives--;
  player.collisionState = 'destroyed';

  if (player.lives <= 0) {
    player.lives = 0;
    return true; // game over
  }

  return false;
}

/** Respawn player after death if they have lives remaining. */
export function respawnPlayer(player: Player): void {
  if (player.lives <= 0) return;

  player.isAlive = true;
  player.health = player.maxHealth;
  player.position = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 };
  player.velocity = { x: 0, y: 0 };
  player.isInvulnerable = true;
  player.invulnerabilityTimer = PLAYER_INVULNERABILITY_DURATION;
  player.collisionState = 'none';
  player.fireCooldown = 0;
}

function applyFriction(velocity: number, friction: number): number {
  if (velocity > 0) return Math.max(0, velocity - friction);
  if (velocity < 0) return Math.min(0, velocity + friction);
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
