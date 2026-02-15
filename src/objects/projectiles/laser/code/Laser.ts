import type { Projectile, ProjectileOwner, Vector2D, GameState } from '../../../../types';
import { LASER_SPEED, LASER_DAMAGE, LASER_MAX_LIFETIME, LASER_COLLISION_RADIUS, GAME_WIDTH, GAME_HEIGHT } from '../../../../engine/constants';

let nextProjectileId = 0;

/** Create a new laser projectile fired from a position. */
export function createLaser(position: Vector2D, owner: ProjectileOwner): Projectile {
  return {
    id: `laser-${nextProjectileId++}`,
    type: 'laser',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: -LASER_SPEED },
    rotation: 0,
    speed: LASER_SPEED,
    damage: LASER_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: LASER_MAX_LIFETIME,
    collisionRadius: LASER_COLLISION_RADIUS,
    hasCollided: false,
  };
}

/** Create a laser projectile fired downward from an enemy position. */
export function createEnemyLaser(position: Vector2D, owner: ProjectileOwner): Projectile {
  return {
    id: `laser-${nextProjectileId++}`,
    type: 'laser',
    owner,
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: LASER_SPEED }, // Moves downward (toward player)
    rotation: Math.PI,
    speed: LASER_SPEED,
    damage: LASER_DAMAGE,
    isActive: true,
    lifetime: 0,
    maxLifetime: LASER_MAX_LIFETIME,
    collisionRadius: LASER_COLLISION_RADIUS,
    hasCollided: false,
  };
}

/** Update a single projectile for one tick. */
export function updateProjectile(proj: Projectile, dtSeconds: number, state?: GameState): void {
  if (!proj.isActive) return;

  const dtMs = dtSeconds * 1000;

  // Acceleration: increase speed up to maxSpeed
  if (proj.acceleration && proj.maxSpeed && proj.speed < proj.maxSpeed) {
    proj.speed = Math.min(proj.speed + proj.acceleration * dtSeconds, proj.maxSpeed);
    // Rebuild velocity from current speed and direction
    const angle = Math.atan2(proj.velocity.y, proj.velocity.x);
    proj.velocity.x = Math.cos(angle) * proj.speed;
    proj.velocity.y = Math.sin(angle) * proj.speed;
  }

  // Homing delay countdown
  if (proj.homingDelay !== undefined && proj.homingDelay > 0) {
    proj.homingDelay -= dtMs;
  }

  // Homing: steer toward nearest target
  if (proj.isHoming && proj.turnRate && state &&
      (proj.homingDelay === undefined || proj.homingDelay <= 0)) {
    // Enemy-fired homing targets players; player-fired homing targets enemies
    let targets: { position: { x: number; y: number } }[];
    if (proj.owner.type === 'enemy') {
      targets = state.players.filter(p => p.isAlive);
    } else {
      targets = state.enemies.filter(e => e.isAlive);
    }

    if (targets.length > 0) {
      // Find nearest target
      let nearest = targets[0];
      let nearestDist = Infinity;
      for (const t of targets) {
        const dx = t.position.x - proj.position.x;
        const dy = t.position.y - proj.position.y;
        const dist = dx * dx + dy * dy;
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = t;
        }
      }

      // Calculate desired angle toward target
      const dx = nearest.position.x - proj.position.x;
      const dy = nearest.position.y - proj.position.y;
      const desiredAngle = Math.atan2(dy, dx);
      const currentAngle = Math.atan2(proj.velocity.y, proj.velocity.x);

      // Calculate shortest angle difference
      let angleDiff = desiredAngle - currentAngle;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      // Limit turn rate
      const maxTurn = proj.turnRate * dtSeconds;
      const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
      const newAngle = currentAngle + turn;

      proj.velocity.x = Math.cos(newAngle) * proj.speed;
      proj.velocity.y = Math.sin(newAngle) * proj.speed;
    }
  }

  // Move
  proj.position.x += proj.velocity.x * dtSeconds;
  proj.position.y += proj.velocity.y * dtSeconds;

  // Lifetime
  proj.lifetime += dtMs;

  // Deactivate if off-screen or expired
  if (proj.position.y < -20 || proj.position.y > GAME_HEIGHT + 20 ||
      proj.position.x < -20 || proj.position.x > GAME_WIDTH + 20 ||
      proj.lifetime >= proj.maxLifetime || proj.hasCollided) {
    proj.isActive = false;
  }
}

/** Update all projectiles and remove inactive ones. Returns updated array. */
export function updateAllProjectiles(state: GameState, dtSeconds: number): void {
  for (const proj of state.projectiles) {
    updateProjectile(proj, dtSeconds, state);
  }
  // Remove inactive projectiles (creates new array — required for shared-ref safety)
  state.projectiles = state.projectiles.filter(p => p.isActive);
}

import { createPlayerBullet } from '../../bullet/code/Bullet';
import { createPlayerRocket } from '../../rocket/code/Rocket';
import { createPlayerMissile } from '../../missile/code/Missile';
import { createSnakeLaser } from '../../snake/code/Snake';
import { ROCKET_FIRE_COOLDOWN, MISSILE_FIRE_COOLDOWN } from '../../../../engine/constants';

/** Spawn projectiles for any player that is firing, based on weapon state. */
export function spawnPlayerProjectiles(state: GameState): void {
  for (const player of state.players) {
    if (!player.isFiring || !player.isAlive) continue;

    const owner = { type: 'player' as const, id: player.id };
    const basePos = { x: player.position.x, y: player.position.y - 16 };
    const newProjectiles: import('../../../../types').Projectile[] = [];

    // --- Primary weapon ---
    if (player.primaryWeapon === 'laser') {
      switch (player.primaryLevel) {
        case 1:
          newProjectiles.push(createLaser(basePos, owner));
          break;
        case 2:
          newProjectiles.push(createLaser({ x: basePos.x - 8, y: basePos.y }, owner));
          newProjectiles.push(createLaser({ x: basePos.x + 8, y: basePos.y }, owner));
          break;
        case 3: {
          newProjectiles.push(createLaser(basePos, owner));
          const angleRad = 5 * Math.PI / 180;
          const leftLaser = createLaser({ x: basePos.x - 8, y: basePos.y }, owner);
          leftLaser.velocity.x = -Math.sin(angleRad) * LASER_SPEED;
          leftLaser.velocity.y = -Math.cos(angleRad) * LASER_SPEED;
          const rightLaser = createLaser({ x: basePos.x + 8, y: basePos.y }, owner);
          rightLaser.velocity.x = Math.sin(angleRad) * LASER_SPEED;
          rightLaser.velocity.y = -Math.cos(angleRad) * LASER_SPEED;
          newProjectiles.push(leftLaser, rightLaser);
          break;
        }
        case 4:
          newProjectiles.push(createSnakeLaser(basePos, owner));
          break;
      }
    } else {
      // Bullet primary
      switch (player.primaryLevel) {
        case 1:
          newProjectiles.push(createPlayerBullet(basePos, owner));
          break;
        case 2:
          newProjectiles.push(createPlayerBullet({ x: basePos.x - 8, y: basePos.y }, owner));
          newProjectiles.push(createPlayerBullet({ x: basePos.x + 8, y: basePos.y }, owner));
          break;
        case 3: {
          const angles = [0, -10, 10];
          for (const deg of angles) {
            const rad = deg * Math.PI / 180;
            const b = createPlayerBullet(basePos, owner);
            if (deg !== 0) {
              b.velocity.x = Math.sin(rad) * b.speed;
              b.velocity.y = -Math.cos(rad) * b.speed;
            }
            newProjectiles.push(b);
          }
          break;
        }
        case 4: {
          const angles = [0, -8, 8, -16, 16];
          for (const deg of angles) {
            const rad = deg * Math.PI / 180;
            const b = createPlayerBullet(basePos, owner);
            if (deg !== 0) {
              b.velocity.x = Math.sin(rad) * b.speed;
              b.velocity.y = -Math.cos(rad) * b.speed;
            }
            newProjectiles.push(b);
          }
          break;
        }
      }
    }

    // --- Secondary weapon ---
    if (player.secondaryWeapon && player.secondaryCooldown <= 0) {
      if (player.secondaryWeapon === 'rocket') {
        newProjectiles.push(createPlayerRocket(basePos, owner, 'left'));
        newProjectiles.push(createPlayerRocket(basePos, owner, 'right'));
        player.secondaryCooldown = ROCKET_FIRE_COOLDOWN;
      } else if (player.secondaryWeapon === 'missile') {
        const fanAngles = [-15, 0, 15];
        for (const deg of fanAngles) {
          newProjectiles.push(createPlayerMissile(basePos, owner, deg * Math.PI / 180));
        }
        player.secondaryCooldown = MISSILE_FIRE_COOLDOWN;
      }
    }

    if (newProjectiles.length > 0) {
      state.projectiles = [...state.projectiles, ...newProjectiles];
    }
  }
}

/** @deprecated Use spawnPlayerProjectiles instead */
export const spawnPlayerLasers = spawnPlayerProjectiles;
