import type { Player, TankState } from '../../../types';
import { TANK_TURRET_RECOIL_DECAY } from '../../../engine/constants';

/**
 * Update tank player movement using rotational controls.
 * Left/Right = turn, Up/Down = accelerate/reverse.
 */
export function updateTankPlayer(
  player: Player,
  tank: TankState,
  dtSeconds: number,
  mapHeight: number,
  mapWidth: number = 800,
): void {
  if (!player.isAlive) return;

  updateTankMovement(player, tank, dtSeconds, mapHeight, mapWidth);
  updateTurretAngle(tank);
  updateTurretRecoil(tank, dtSeconds);
  updateInvulnerability(player, dtSeconds);
}

function updateTankMovement(
  player: Player,
  tank: TankState,
  dt: number,
  mapHeight: number,
  mapWidth: number,
): void {
  const input = player.input;

  // Turning: left/right rotate the heading
  if (input.left) {
    tank.heading += tank.turnRate * dt;
  }
  if (input.right) {
    tank.heading -= tank.turnRate * dt;
  }

  // Normalize heading to [-PI, PI]
  tank.heading = normalizeAngle(tank.heading);

  // Acceleration: up = forward, down = reverse
  if (input.up) {
    tank.speed += tank.acceleration * dt;
    if (tank.speed > tank.maxSpeed) tank.speed = tank.maxSpeed;
    player.isThrusting = true;
  } else if (input.down) {
    tank.speed -= tank.acceleration * dt;
    if (tank.speed < -tank.reverseMaxSpeed) tank.speed = -tank.reverseMaxSpeed;
    player.isThrusting = false;
  } else {
    // Friction: decelerate toward 0
    if (tank.speed > 0) {
      tank.speed = Math.max(0, tank.speed - tank.friction * dt);
    } else if (tank.speed < 0) {
      tank.speed = Math.min(0, tank.speed + tank.friction * dt);
    }
    player.isThrusting = false;
  }

  // Update position based on heading and speed
  // Canvas: Y increases downward, heading PI/2 = north = -Y direction
  player.position.x += Math.cos(tank.heading) * tank.speed * dt;
  player.position.y -= Math.sin(tank.heading) * tank.speed * dt;

  // Clamp to map bounds (world coordinates)
  const margin = 20;
  player.position.x = Math.max(margin, Math.min(mapWidth - margin, player.position.x));
  player.position.y = Math.max(margin, Math.min(mapHeight - margin, player.position.y));

  // Update velocity for interpolation
  player.velocity.x = Math.cos(tank.heading) * tank.speed;
  player.velocity.y = -Math.sin(tank.heading) * tank.speed;
}

/**
 * Compute turret angle from tank heading.
 *
 * The turret faces in the direction the tank faces in the northern
 * hemisphere (east through north to west, 0 to PI).
 * When the tank faces south (negative angles), the turret mirrors
 * back to the northern arc:
 *   - East (0): turret 0
 *   - NE (45°): turret 45°
 *   - North (90°): turret 90°
 *   - NW (135°): turret 135°
 *   - West (180°): turret 180°
 *   - SW (-135°): turret 135° (mirrored)
 *   - South (-90°): turret 90° (mirrored)
 *   - SE (-45°): turret 45° (mirrored)
 */
function updateTurretAngle(tank: TankState): void {
  const h = normalizeAngle(tank.heading);

  if (h >= 0 && h <= Math.PI) {
    // Upper hemisphere: turret matches heading directly
    tank.turretAngle = h;
  } else {
    // Lower hemisphere (h < 0): mirror across horizontal axis
    tank.turretAngle = -h;
  }
}

function updateTurretRecoil(tank: TankState, dt: number): void {
  if (tank.turretRecoil > 0) {
    tank.turretRecoil = Math.max(0, tank.turretRecoil - TANK_TURRET_RECOIL_DECAY * dt);
  }
}

function updateInvulnerability(player: Player, dtSeconds: number): void {
  if (player.isInvulnerable) {
    player.invulnerabilityTimer -= dtSeconds * 1000;
    if (player.invulnerabilityTimer <= 0) {
      player.isInvulnerable = false;
      player.invulnerabilityTimer = 0;
    }
  }
}

/** Normalize an angle to the range [-PI, PI]. */
function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
