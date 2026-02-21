import type { GameState, Projectile, ProjectileOwner } from '../../../types';
import { createCannonShell } from '../../projectiles/cannon/code/Cannon';
import { createPlasmaBolt } from '../../projectiles/plasmaBolt/code/PlasmaBolt';
import { createPlayerRocket } from '../../projectiles/rocket/code/Rocket';
import { createPlayerMissile } from '../../projectiles/missile/code/Missile';
import {
  CANNON_FIRE_COOLDOWN, CANNON_DAMAGE, CANNON_RANGE,
  CANNON_L2_FIRE_COOLDOWN,
  CANNON_L3_FIRE_COOLDOWN, CANNON_L3_DAMAGE, CANNON_L3_RANGE, CANNON_L3_SPREAD,
  CANNON_L4_FIRE_COOLDOWN, CANNON_L4_DAMAGE, CANNON_L4_RANGE,
  CANNON_L5_FIRE_COOLDOWN, CANNON_L5_DAMAGE, CANNON_L5_RANGE, CANNON_L5_SPREAD,
  PLASMA_BOLT_FIRE_COOLDOWN, PLASMA_BOLT_DAMAGE, PLASMA_BOLT_RANGE, PLASMA_BOLT_COLLISION_RADIUS,
  PLASMA_BOLT_L2_FIRE_COOLDOWN,
  PLASMA_BOLT_L3_FIRE_COOLDOWN, PLASMA_BOLT_L3_DAMAGE, PLASMA_BOLT_L3_RANGE, PLASMA_BOLT_L3_RADIUS,
  PLASMA_BOLT_L4_FIRE_COOLDOWN, PLASMA_BOLT_L4_DAMAGE, PLASMA_BOLT_L4_RANGE, PLASMA_BOLT_L4_RADIUS,
  PLASMA_BOLT_L5_FIRE_COOLDOWN, PLASMA_BOLT_L5_DAMAGE, PLASMA_BOLT_L5_RANGE, PLASMA_BOLT_L5_RADIUS,
  TANK_TURRET_LENGTH,
  ROCKET_FIRE_COOLDOWN, MISSILE_FIRE_COOLDOWN,
  ROCKET_LAUNCH_SPEED, ROCKET_MAX_SPEED, ROCKET_ACCELERATION,
  ROCKET_DAMAGE, ROCKET_MAX_LIFETIME, ROCKET_COLLISION_RADIUS,
} from '../../../engine/constants';

/**
 * Spawn tank projectiles for any player that is firing.
 * Cannon for 'cannon' primary weapon, plasma bolt for 'plasma-artillery'.
 * Supports primary weapon levels 1–5 and secondary weapons (rockets/missiles).
 */
export function spawnTankProjectiles(state: GameState): void {
  if (!state.tankStates) return;

  for (const player of state.players) {
    if (!player.isFiring || !player.isAlive) continue;

    const tank = state.tankStates[player.id];
    if (!tank) continue;

    // Check cooldown
    if (player.fireCooldown > 0) continue;

    const owner = { type: 'player' as const, id: player.id };

    // Turret tip position: offset from player center along turret angle
    const tipX = player.position.x + Math.cos(tank.turretAngle) * TANK_TURRET_LENGTH;
    const tipY = player.position.y - Math.sin(tank.turretAngle) * TANK_TURRET_LENGTH;
    const tipPos = { x: tipX, y: tipY };

    const newProjectiles: Projectile[] = [];

    // --- Primary weapon ---
    if (player.primaryWeapon === 'cannon') {
      spawnCannonByLevel(newProjectiles, tipPos, tank.turretAngle, owner, player.primaryLevel);
      player.fireCooldown = getCannonCooldown(player.primaryLevel);
    } else if (player.primaryWeapon === 'plasma-artillery') {
      spawnPlasmaByLevel(newProjectiles, tipPos, tank.turretAngle, owner, player.primaryLevel);
      player.fireCooldown = getPlasmaCooldown(player.primaryLevel);
    }

    // --- Secondary weapon ---
    if (player.secondaryWeapon && player.secondaryCooldown <= 0) {
      if (player.secondaryWeapon === 'rocket') {
        spawnTankRockets(newProjectiles, tipPos, tank.turretAngle, owner);
        player.secondaryCooldown = ROCKET_FIRE_COOLDOWN;
      } else if (player.secondaryWeapon === 'missile') {
        spawnTankMissiles(newProjectiles, tipPos, tank.turretAngle, owner);
        player.secondaryCooldown = MISSILE_FIRE_COOLDOWN;
      }
    }

    if (newProjectiles.length > 0) {
      // Trigger turret recoil
      tank.turretRecoil = 1.0;
      state.projectiles = [...state.projectiles, ...newProjectiles];
    }
  }
}

// ── Cannon level branching ──────────────────────────────────────────

function getCannonCooldown(level: number): number {
  switch (level) {
    case 1: return CANNON_FIRE_COOLDOWN;
    case 2: return CANNON_L2_FIRE_COOLDOWN;
    case 3: return CANNON_L3_FIRE_COOLDOWN;
    case 4: return CANNON_L4_FIRE_COOLDOWN;
    default: return CANNON_L5_FIRE_COOLDOWN;
  }
}

function spawnCannonByLevel(
  out: Projectile[],
  pos: { x: number; y: number },
  angle: number,
  owner: ProjectileOwner,
  level: number,
): void {
  switch (level) {
    case 1:
    case 2:
      // Single shell; L2 only gets faster cooldown
      out.push(createCannonShell(pos, angle, owner));
      break;
    case 3:
    case 4: {
      // Double barrel center; L4 only gets faster cooldown
      const dmg = level === 3 ? CANNON_L3_DAMAGE : CANNON_L4_DAMAGE;
      const rng = level === 3 ? CANNON_L3_RANGE : CANNON_L4_RANGE;
      out.push(createCannonShell(pos, angle, owner, { damage: dmg, range: rng }));
      out.push(createCannonShell(pos, angle, owner, { damage: dmg, range: rng }));
      break;
    }
    default: {
      // L5: 3 shells with ±spread
      const spreadRad = CANNON_L5_SPREAD * Math.PI / 180;
      out.push(createCannonShell(pos, angle + spreadRad, owner, { damage: CANNON_L5_DAMAGE, range: CANNON_L5_RANGE }));
      out.push(createCannonShell(pos, angle, owner, { damage: CANNON_L5_DAMAGE, range: CANNON_L5_RANGE }));
      out.push(createCannonShell(pos, angle - spreadRad, owner, { damage: CANNON_L5_DAMAGE, range: CANNON_L5_RANGE }));
      break;
    }
  }
}

// ── Plasma artillery level branching ────────────────────────────────

function getPlasmaCooldown(level: number): number {
  switch (level) {
    case 1: return PLASMA_BOLT_FIRE_COOLDOWN;
    case 2: return PLASMA_BOLT_L2_FIRE_COOLDOWN;
    case 3: return PLASMA_BOLT_L3_FIRE_COOLDOWN;
    case 4: return PLASMA_BOLT_L4_FIRE_COOLDOWN;
    default: return PLASMA_BOLT_L5_FIRE_COOLDOWN;
  }
}

function spawnPlasmaByLevel(
  out: Projectile[],
  pos: { x: number; y: number },
  angle: number,
  owner: ProjectileOwner,
  level: number,
): void {
  switch (level) {
    case 1:
      out.push(createPlasmaBolt(pos, angle, owner));
      break;
    case 2:
      // Faster cooldown only, same stats
      out.push(createPlasmaBolt(pos, angle, owner));
      break;
    case 3:
      out.push(createPlasmaBolt(pos, angle, owner, {
        damage: PLASMA_BOLT_L3_DAMAGE, range: PLASMA_BOLT_L3_RANGE, collisionRadius: PLASMA_BOLT_L3_RADIUS,
      }));
      break;
    case 4:
      out.push(createPlasmaBolt(pos, angle, owner, {
        damage: PLASMA_BOLT_L4_DAMAGE, range: PLASMA_BOLT_L4_RANGE, collisionRadius: PLASMA_BOLT_L4_RADIUS,
      }));
      break;
    default:
      out.push(createPlasmaBolt(pos, angle, owner, {
        damage: PLASMA_BOLT_L5_DAMAGE, range: PLASMA_BOLT_L5_RANGE, collisionRadius: PLASMA_BOLT_L5_RADIUS,
      }));
      break;
  }
}

// ── Secondary weapons (turret-directed) ─────────────────────────────

/** Spawn 2 rockets perpendicular to turret angle (like Ep1 left/right). */
function spawnTankRockets(
  out: Projectile[],
  pos: { x: number; y: number },
  turretAngle: number,
  owner: ProjectileOwner,
): void {
  // Perpendicular offsets (±20px from turret tip)
  const perpX = Math.sin(turretAngle) * 20;
  const perpY = Math.cos(turretAngle) * 20;

  const vx = Math.cos(turretAngle) * ROCKET_LAUNCH_SPEED;
  const vy = -Math.sin(turretAngle) * ROCKET_LAUNCH_SPEED;

  for (const side of [-1, 1]) {
    out.push({
      id: `tank-rocket-${Date.now()}-${side}`,
      type: 'rocket',
      owner,
      position: { x: pos.x + perpX * side, y: pos.y - perpY * side },
      velocity: { x: vx, y: vy },
      rotation: turretAngle,
      speed: ROCKET_LAUNCH_SPEED,
      damage: ROCKET_DAMAGE,
      isActive: true,
      lifetime: 0,
      maxLifetime: ROCKET_MAX_LIFETIME,
      collisionRadius: ROCKET_COLLISION_RADIUS,
      hasCollided: false,
      acceleration: ROCKET_ACCELERATION,
      maxSpeed: ROCKET_MAX_SPEED,
    });
  }
}

/** Spawn 3 missiles in a ±15° fan from turret angle. */
function spawnTankMissiles(
  out: Projectile[],
  pos: { x: number; y: number },
  turretAngle: number,
  owner: ProjectileOwner,
): void {
  // Missile.ts convention: angle=0 = north, vx=sin(a)*speed, vy=-cos(a)*speed
  // Tank turret convention: angle=0 = east, angle=PI/2 = north
  // Convert: missileAngle = PI/2 - turretAngle
  const baseAngle = Math.PI / 2 - turretAngle;
  const fanOffsets = [-15, 0, 15];

  for (const deg of fanOffsets) {
    const missileAngle = baseAngle + deg * Math.PI / 180;
    out.push(createPlayerMissile(pos, owner, missileAngle));
  }
}
