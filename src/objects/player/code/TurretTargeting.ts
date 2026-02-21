import type { Player, TankState, MapEnemy } from '../../../types';
import {
  TURRET_ACQUISITION_CONE,
  TURRET_RETENTION_CONE,
  TURRET_MAX_TARGET_RANGE,
  TURRET_TRACK_SPEED,
  TURRET_ELEVATION_TOLERANCE,
} from '../../../engine/constants';

/**
 * Sticky turret targeting system for Episode 2.
 *
 * When the turret aim direction passes near an enemy, the turret locks on
 * and continues tracking that enemy even as the player turns the tank body.
 * The lock is broken when the target dies, goes out of range, or the player
 * turns far enough that a wider retention cone is exceeded.
 */

/**
 * Main entry point — call once per frame per player, after tank movement.
 */
export function updateTurretTargeting(
  player: Player,
  tank: TankState,
  enemies: MapEnemy[],
  dtSeconds: number,
): void {
  // 1. Compute the heading-derived turret angle (what the turret would be without targeting)
  const headingAngle = getHeadingTurretAngle(tank.heading);

  // 2. Validate current target — clear if invalid
  if (tank.targetEnemyId !== null) {
    const target = enemies.find(e => e.id === tank.targetEnemyId);
    if (!target || !isValidRetention(player, tank, target, headingAngle)) {
      tank.targetEnemyId = null;
    }
  }

  // 3. Try to acquire a new target in the narrow acquisition cone
  const acquired = findBestTarget(player, tank, enemies, headingAngle);
  if (acquired) {
    tank.targetEnemyId = acquired.id;
  }

  // 4. Set target angle
  if (tank.targetEnemyId !== null) {
    const target = enemies.find(e => e.id === tank.targetEnemyId);
    if (target) {
      const angleToTarget = Math.atan2(
        -(target.position.y - player.position.y),
        target.position.x - player.position.x,
      );
      tank.turretTargetAngle = clampToNorthernArc(angleToTarget);
    } else {
      tank.targetEnemyId = null;
      tank.turretTargetAngle = headingAngle;
    }
  } else {
    tank.turretTargetAngle = headingAngle;
  }

  // 5. Smooth rotate turretAngle toward turretTargetAngle
  tank.turretAngle = rotateToward(
    tank.turretAngle,
    tank.turretTargetAngle,
    TURRET_TRACK_SPEED * dtSeconds,
  );
}

/**
 * Compute the heading-derived turret angle (same logic as the old updateTurretAngle).
 * Maps heading to the northern arc [0, PI].
 */
export function getHeadingTurretAngle(heading: number): number {
  const h = normalizeAngle(heading);
  if (h >= 0 && h <= Math.PI) {
    return h;
  }
  // Lower hemisphere: mirror across horizontal axis
  return -h;
}

/**
 * Check if a locked target is still valid for retention.
 */
function isValidRetention(
  player: Player,
  tank: TankState,
  enemy: MapEnemy,
  headingAngle: number,
): boolean {
  // Must be alive
  if (!enemy.isAlive) return false;

  // Must be in range
  const dx = enemy.position.x - player.position.x;
  const dy = enemy.position.y - player.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > TURRET_MAX_TARGET_RANGE) return false;

  // Must be same elevation
  if (Math.abs(tank.elevation - enemy.elevation) > TURRET_ELEVATION_TOLERANCE) return false;

  // Angle to target must be within retention cone of the heading-derived angle
  const angleToTarget = Math.atan2(-dy, dx);
  const targetInNorthernArc = clampToNorthernArc(angleToTarget);

  // Target must be in the northern arc (above horizon)
  if (targetInNorthernArc <= 0 || targetInNorthernArc >= Math.PI) return false;

  // Check retention cone
  const angleDiff = Math.abs(shortestAngleDiff(headingAngle, targetInNorthernArc));
  if (angleDiff > TURRET_RETENTION_CONE) return false;

  return true;
}

/**
 * Scan enemies in the narrow acquisition cone from the heading-derived angle.
 * Returns the closest valid target, or null.
 */
function findBestTarget(
  player: Player,
  tank: TankState,
  enemies: MapEnemy[],
  headingAngle: number,
): MapEnemy | null {
  let best: MapEnemy | null = null;
  let bestDist = Infinity;

  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;

    // Range check
    const dx = enemy.position.x - player.position.x;
    const dy = enemy.position.y - player.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > TURRET_MAX_TARGET_RANGE) continue;

    // Elevation check
    if (Math.abs(tank.elevation - enemy.elevation) > TURRET_ELEVATION_TOLERANCE) continue;

    // Angle check — must be in acquisition cone from heading angle
    const angleToTarget = Math.atan2(-dy, dx);
    const targetInNorthernArc = clampToNorthernArc(angleToTarget);

    // Must be in northern arc (not below horizon)
    if (targetInNorthernArc <= 0 || targetInNorthernArc >= Math.PI) continue;

    const angleDiff = Math.abs(shortestAngleDiff(headingAngle, targetInNorthernArc));
    if (angleDiff > TURRET_ACQUISITION_CONE) continue;

    // Pick closest
    if (dist < bestDist) {
      best = enemy;
      bestDist = dist;
    }
  }

  return best;
}

/**
 * Clamp an angle to the northern arc [0, PI].
 * Angles below the horizon are mirrored up.
 */
export function clampToNorthernArc(angle: number): number {
  const a = normalizeAngle(angle);
  if (a >= 0 && a <= Math.PI) return a;
  return -a; // Mirror
}

/**
 * Normalize an angle to [-PI, PI].
 */
export function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * Shortest signed angular difference between two angles.
 */
export function shortestAngleDiff(from: number, to: number): number {
  let diff = to - from;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

/**
 * Rotate `current` angle toward `target` by at most `maxDelta` radians.
 */
export function rotateToward(current: number, target: number, maxDelta: number): number {
  const diff = shortestAngleDiff(current, target);
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}
