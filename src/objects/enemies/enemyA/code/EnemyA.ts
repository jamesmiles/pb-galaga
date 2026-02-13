import type { Enemy, FlightPath, Vector2D } from '../../../../types';
import { ENEMY_A_HEALTH, ENEMY_A_SCORE_VALUE, ENEMY_A_COLLISION_RADIUS } from '../../../../engine/constants';

let nextEnemyId = 0;

export function createEnemyA(path: FlightPath | null, startPosition?: Vector2D): Enemy {
  const id = `enemyA-${nextEnemyId++}`;
  const pos = startPosition ?? (path && path.points.length > 0 ? { ...path.points[0] } : { x: 0, y: 0 });

  return {
    id,
    type: 'A',
    position: { x: pos.x, y: pos.y },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    path,
    pathProgress: 0,
    isAlive: true,
    health: ENEMY_A_HEALTH,
    maxHealth: ENEMY_A_HEALTH,
    fireMode: 'none',
    fireCooldown: 0,
    fireRate: 0,
    isThrusting: true,
    isFiring: false,
    collisionState: 'none',
    scoreValue: ENEMY_A_SCORE_VALUE,
    collisionRadius: ENEMY_A_COLLISION_RADIUS,
  };
}

export function updateEnemy(enemy: Enemy, dtSeconds: number): void {
  if (!enemy.isAlive) return;

  if (enemy.path) {
    updatePathFollowing(enemy, dtSeconds);
  }

  // Check destruction
  if (enemy.health <= 0) {
    enemy.isAlive = false;
    enemy.collisionState = 'destroyed';
  }
}

function updatePathFollowing(enemy: Enemy, dtSeconds: number): void {
  const path = enemy.path!;
  if (path.points.length < 2) return;

  // Advance progress based on duration
  enemy.pathProgress += dtSeconds / path.duration;

  if (enemy.pathProgress >= 1.0) {
    if (path.loop) {
      enemy.pathProgress -= 1.0;
    } else {
      enemy.pathProgress = 1.0;
      // Enemy finished path and stays at end
    }
  }

  // Interpolate position along path
  const prevPos = { x: enemy.position.x, y: enemy.position.y };
  enemy.position = interpolatePath(path.points, enemy.pathProgress);

  // Calculate velocity for interpolation purposes
  enemy.velocity.x = (enemy.position.x - prevPos.x) / dtSeconds;
  enemy.velocity.y = (enemy.position.y - prevPos.y) / dtSeconds;

  // Update rotation to face movement direction
  if (enemy.velocity.x !== 0 || enemy.velocity.y !== 0) {
    enemy.rotation = Math.atan2(enemy.velocity.y, enemy.velocity.x) + Math.PI / 2;
  }
}

/** Interpolate position along a path using Catmull-Rom spline. */
export function interpolatePath(points: Vector2D[], progress: number): Vector2D {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };

  const totalSegments = points.length - 1;
  const scaledProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
  const t = scaledProgress - segmentIndex;

  // Get surrounding points for Catmull-Rom
  const p0 = points[Math.max(0, segmentIndex - 1)];
  const p1 = points[segmentIndex];
  const p2 = points[Math.min(points.length - 1, segmentIndex + 1)];
  const p3 = points[Math.min(points.length - 1, segmentIndex + 2)];

  return {
    x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
    y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
  };
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

export function resetEnemyIdCounter(): void {
  nextEnemyId = 0;
}
