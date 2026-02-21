import type { GameState, MapEnemy, MapEnemyPlacement, Player, Projectile } from '../types';
import { createEp2EnemyBullet } from '../objects/projectiles/bullet/code/Ep2EnemyBullet';
import { createEp2EnemyPlasma } from '../objects/projectiles/plasma/code/Ep2EnemyPlasma';
import { isInViewport } from './CameraManager';
import { SoundManager } from '../audio/SoundManager';
import {
  GUN_NEST_HEALTH, GUN_NEST_FIRE_RATE, GUN_NEST_DAMAGE, GUN_NEST_BULLET_SPEED,
  GUN_NEST_COLLISION_RADIUS, GUN_NEST_SCORE_VALUE, GUN_NEST_AIM_SPEED,
  TURRET_HEALTH, TURRET_FIRE_RATE, TURRET_DAMAGE, TURRET_PLASMA_SPEED,
  TURRET_COLLISION_RADIUS, TURRET_SCORE_VALUE, TURRET_AIM_SPEED,
  POPUP_MINE_HEALTH, POPUP_MINE_ACTIVATION_RANGE, POPUP_MINE_DORMANT_TIMER,
  POPUP_MINE_BURST_PROJECTILES, POPUP_MINE_BURST_DAMAGE, POPUP_MINE_BURST_SPEED,
  POPUP_MINE_POPUP_DURATION, POPUP_MINE_COOLDOWN, POPUP_MINE_COLLISION_RADIUS,
  POPUP_MINE_SCORE_VALUE,
  ROCKET_COPTER_HEALTH, ROCKET_COPTER_SPEED, ROCKET_COPTER_FIRE_RATE,
  ROCKET_COPTER_DAMAGE, ROCKET_COPTER_PROJECTILE_SPEED,
  ROCKET_COPTER_COLLISION_RADIUS, ROCKET_COPTER_SCORE_VALUE,
  ROCKET_COPTER_ENGAGE_RANGE, ROCKET_COPTER_AIM_SPEED, ROCKET_COPTER_PATROL_RANGE,
  LASER_COPTER_HEALTH, LASER_COPTER_SPEED, LASER_COPTER_FIRE_RATE,
  LASER_COPTER_DAMAGE, LASER_COPTER_PROJECTILE_SPEED,
  LASER_COPTER_COLLISION_RADIUS, LASER_COPTER_SCORE_VALUE,
  LASER_COPTER_ENGAGE_RANGE, LASER_COPTER_AIM_SPEED, LASER_COPTER_PATROL_RANGE,
  SPREAD_BOMBER_HEALTH, SPREAD_BOMBER_SPEED, SPREAD_BOMBER_FIRE_RATE,
  SPREAD_BOMBER_DAMAGE, SPREAD_BOMBER_SPREAD_COUNT, SPREAD_BOMBER_PROJECTILE_SPEED,
  SPREAD_BOMBER_COLLISION_RADIUS, SPREAD_BOMBER_SCORE_VALUE,
  HOMING_BOMBER_HEALTH, HOMING_BOMBER_SPEED, HOMING_BOMBER_FIRE_RATE,
  HOMING_BOMBER_DAMAGE, HOMING_BOMBER_MISSILE_SPEED, HOMING_BOMBER_MISSILE_TURN_RATE,
  HOMING_BOMBER_COLLISION_RADIUS, HOMING_BOMBER_SCORE_VALUE,
  HOVER_TANK_HEALTH, HOVER_TANK_SPEED, HOVER_TANK_FIRE_RATE,
  HOVER_TANK_DAMAGE, HOVER_TANK_PROJECTILE_SPEED,
  HOVER_TANK_COLLISION_RADIUS, HOVER_TANK_SCORE_VALUE,
  HOVER_TANK_AIM_SPEED, HOVER_TANK_PATROL_RANGE,
  EP2_ENEMY_FIRE_RANGE, TANK_COLLISION_RADIUS,
} from './constants';

/**
 * Manages Episode 2 map enemies: AI aiming, firing, popup mine logic,
 * copter patrol/engage, bomber fly-through, hover tank patrol,
 * and collision detection with projectiles and players.
 */
export class Ep2EnemyManager {

  /** Create live MapEnemy[] from placement templates. */
  createFromPlacements(placements: MapEnemyPlacement[]): MapEnemy[] {
    return placements.map(p => this.createEnemy(p));
  }

  private createEnemy(placement: MapEnemyPlacement): MapEnemy {
    const base = {
      id: placement.id,
      type: placement.type,
      position: { x: placement.position.x, y: placement.position.y },
      elevation: placement.elevation,
      isAlive: true,
      aimAngle: Math.PI / 2, // Pointing south (toward approaching players)
      isActivated: false,
      activationRange: 0,
      dormantTimer: 0,
      popupProgress: 0,
      burstFired: false,
      cooldownTimer: 0,
    };

    switch (placement.type) {
      case 'gun-nest':
        return {
          ...base,
          health: GUN_NEST_HEALTH,
          maxHealth: GUN_NEST_HEALTH,
          collisionRadius: GUN_NEST_COLLISION_RADIUS,
          scoreValue: GUN_NEST_SCORE_VALUE,
          fireRate: GUN_NEST_FIRE_RATE,
          fireCooldown: GUN_NEST_FIRE_RATE * Math.random(), // Stagger initial fire
        };
      case 'turret':
        return {
          ...base,
          health: TURRET_HEALTH,
          maxHealth: TURRET_HEALTH,
          collisionRadius: TURRET_COLLISION_RADIUS,
          scoreValue: TURRET_SCORE_VALUE,
          fireRate: TURRET_FIRE_RATE,
          fireCooldown: TURRET_FIRE_RATE * Math.random(),
        };
      case 'popup-mine':
        return {
          ...base,
          health: POPUP_MINE_HEALTH,
          maxHealth: POPUP_MINE_HEALTH,
          collisionRadius: POPUP_MINE_COLLISION_RADIUS,
          scoreValue: POPUP_MINE_SCORE_VALUE,
          fireRate: 0,
          fireCooldown: 0,
          activationRange: POPUP_MINE_ACTIVATION_RANGE,
          dormantTimer: POPUP_MINE_DORMANT_TIMER * (0.5 + Math.random() * 0.5),
        };
      case 'rocket-copter':
        return {
          ...base,
          health: ROCKET_COPTER_HEALTH,
          maxHealth: ROCKET_COPTER_HEALTH,
          collisionRadius: ROCKET_COPTER_COLLISION_RADIUS,
          scoreValue: ROCKET_COPTER_SCORE_VALUE,
          fireRate: ROCKET_COPTER_FIRE_RATE,
          fireCooldown: ROCKET_COPTER_FIRE_RATE * Math.random(),
          isAerial: true,
          behaviorState: 'patrol' as const,
          velocity: { x: ROCKET_COPTER_SPEED, y: 0 },
          moveSpeed: ROCKET_COPTER_SPEED,
          patrolMinX: placement.position.x - ROCKET_COPTER_PATROL_RANGE,
          patrolMaxX: placement.position.x + ROCKET_COPTER_PATROL_RANGE,
        };
      case 'laser-copter':
        return {
          ...base,
          health: LASER_COPTER_HEALTH,
          maxHealth: LASER_COPTER_HEALTH,
          collisionRadius: LASER_COPTER_COLLISION_RADIUS,
          scoreValue: LASER_COPTER_SCORE_VALUE,
          fireRate: LASER_COPTER_FIRE_RATE,
          fireCooldown: LASER_COPTER_FIRE_RATE * Math.random(),
          isAerial: true,
          behaviorState: 'patrol' as const,
          velocity: { x: LASER_COPTER_SPEED, y: 0 },
          moveSpeed: LASER_COPTER_SPEED,
          patrolMinX: placement.position.x - LASER_COPTER_PATROL_RANGE,
          patrolMaxX: placement.position.x + LASER_COPTER_PATROL_RANGE,
        };
      case 'spread-bomber':
        return {
          ...base,
          health: SPREAD_BOMBER_HEALTH,
          maxHealth: SPREAD_BOMBER_HEALTH,
          collisionRadius: SPREAD_BOMBER_COLLISION_RADIUS,
          scoreValue: SPREAD_BOMBER_SCORE_VALUE,
          fireRate: SPREAD_BOMBER_FIRE_RATE,
          fireCooldown: SPREAD_BOMBER_FIRE_RATE * Math.random(),
          isAerial: true,
          behaviorState: 'flythrough' as const,
          velocity: { x: 0, y: SPREAD_BOMBER_SPEED },
          moveSpeed: SPREAD_BOMBER_SPEED,
          spawnY: placement.position.y,
          aimAngle: Math.PI / 2, // Pointing south (toward players below)
        };
      case 'homing-bomber':
        return {
          ...base,
          health: HOMING_BOMBER_HEALTH,
          maxHealth: HOMING_BOMBER_HEALTH,
          collisionRadius: HOMING_BOMBER_COLLISION_RADIUS,
          scoreValue: HOMING_BOMBER_SCORE_VALUE,
          fireRate: HOMING_BOMBER_FIRE_RATE,
          fireCooldown: HOMING_BOMBER_FIRE_RATE * Math.random(),
          isAerial: true,
          behaviorState: 'flythrough' as const,
          velocity: { x: 0, y: HOMING_BOMBER_SPEED },
          moveSpeed: HOMING_BOMBER_SPEED,
          spawnY: placement.position.y,
          aimAngle: Math.PI / 2, // Pointing south
        };
      case 'hover-tank':
        return {
          ...base,
          health: HOVER_TANK_HEALTH,
          maxHealth: HOVER_TANK_HEALTH,
          collisionRadius: HOVER_TANK_COLLISION_RADIUS,
          scoreValue: HOVER_TANK_SCORE_VALUE,
          fireRate: HOVER_TANK_FIRE_RATE,
          fireCooldown: HOVER_TANK_FIRE_RATE * Math.random(),
          isAerial: false,
          behaviorState: 'patrol' as const,
          velocity: { x: HOVER_TANK_SPEED, y: 0 },
          moveSpeed: HOVER_TANK_SPEED,
          patrolMinX: placement.position.x - HOVER_TANK_PATROL_RANGE,
          patrolMaxX: placement.position.x + HOVER_TANK_PATROL_RANGE,
        };
    }
  }

  /** Main update: AI aim, fire cooldowns, popup mine logic, spawn projectiles. */
  update(state: GameState, dtSeconds: number): void {
    if (!state.mapEnemies || !state.camera) return;

    const dtMs = dtSeconds * 1000;
    const alivePlayers = state.players.filter(p => p.isAlive);
    if (alivePlayers.length === 0) return;

    for (const enemy of state.mapEnemies) {
      if (!enemy.isAlive) continue;
      // Only update enemies near the viewport (200px margin)
      // Aerial enemies get bigger margin since they fly through
      const margin = enemy.isAerial ? 600 : 200;
      if (!isInViewport(enemy.position.y, state.camera, margin)) continue;

      switch (enemy.type) {
        case 'popup-mine':
          this.updatePopupMine(enemy, alivePlayers, state, dtMs, dtSeconds);
          break;
        case 'rocket-copter':
        case 'laser-copter':
          this.updateCopter(enemy, alivePlayers, state, dtMs, dtSeconds);
          break;
        case 'spread-bomber':
        case 'homing-bomber':
          this.updateBomber(enemy, alivePlayers, state, dtMs, dtSeconds);
          break;
        case 'hover-tank':
          this.updateHoverTank(enemy, alivePlayers, state, dtMs, dtSeconds);
          break;
        default:
          this.updateAimingEnemy(enemy, alivePlayers, state, dtMs, dtSeconds);
          break;
      }
    }
  }

  private updateAimingEnemy(
    enemy: MapEnemy,
    players: Player[],
    state: GameState,
    dtMs: number,
    dtSeconds: number,
  ): void {
    const nearest = this.findNearestPlayer(enemy, players);
    if (!nearest) return;

    const dx = nearest.position.x - enemy.position.x;
    const dy = nearest.position.y - enemy.position.y;
    const targetAngle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Rotate aim toward target (rate-limited)
    const aimSpeed = enemy.type === 'gun-nest' ? GUN_NEST_AIM_SPEED : TURRET_AIM_SPEED;
    enemy.aimAngle = rotateToward(enemy.aimAngle, targetAngle, aimSpeed * dtSeconds);

    // Fire cooldown
    if (enemy.fireCooldown > 0) {
      enemy.fireCooldown -= dtMs;
      if (enemy.fireCooldown < 0) enemy.fireCooldown = 0;
    }

    // Fire if cooldown ready and player in range
    if (enemy.fireCooldown <= 0 && dist <= EP2_ENEMY_FIRE_RANGE) {
      const owner = { type: 'enemy' as const, id: enemy.id };
      let proj: Projectile;

      if (enemy.type === 'gun-nest') {
        proj = createEp2EnemyBullet(
          enemy.position, enemy.aimAngle, owner,
          GUN_NEST_BULLET_SPEED, GUN_NEST_DAMAGE, enemy.elevation,
        );
        enemy.fireCooldown = GUN_NEST_FIRE_RATE;
      } else {
        proj = createEp2EnemyPlasma(
          enemy.position, enemy.aimAngle, owner,
          TURRET_PLASMA_SPEED, TURRET_DAMAGE, enemy.elevation,
        );
        enemy.fireCooldown = TURRET_FIRE_RATE;
      }

      state.projectiles = [...state.projectiles, proj];
      SoundManager.play('playerFire');
    }
  }

  private updateCopter(
    enemy: MapEnemy,
    players: Player[],
    state: GameState,
    dtMs: number,
    dtSeconds: number,
  ): void {
    const isRocket = enemy.type === 'rocket-copter';
    const engageRange = isRocket ? ROCKET_COPTER_ENGAGE_RANGE : LASER_COPTER_ENGAGE_RANGE;
    const aimSpeed = isRocket ? ROCKET_COPTER_AIM_SPEED : LASER_COPTER_AIM_SPEED;
    const patrolSpeed = enemy.moveSpeed ?? (isRocket ? ROCKET_COPTER_SPEED : LASER_COPTER_SPEED);

    const nearest = this.findNearestPlayer(enemy, players);
    const dist = nearest ? distBetween(enemy, nearest) : Infinity;

    // State transitions
    if (enemy.behaviorState === 'patrol' && dist <= engageRange) {
      enemy.behaviorState = 'engage';
    } else if (enemy.behaviorState === 'engage' && dist > engageRange * 1.3) {
      enemy.behaviorState = 'patrol';
    }

    if (enemy.behaviorState === 'engage' && nearest) {
      // Slow down while engaged
      const engageSpeed = patrolSpeed * 0.4;
      const dx = nearest.position.x - enemy.position.x;
      const dy = nearest.position.y - enemy.position.y;
      const targetAngle = Math.atan2(dy, dx);
      enemy.aimAngle = rotateToward(enemy.aimAngle, targetAngle, aimSpeed * dtSeconds);

      // Strafe horizontally relative to target
      if (enemy.velocity) {
        enemy.velocity.x = Math.cos(enemy.aimAngle + Math.PI / 2) * engageSpeed;
        enemy.velocity.y = Math.sin(enemy.aimAngle + Math.PI / 2) * engageSpeed;
      }
    } else {
      // Patrol: horizontal movement, reverse at bounds
      if (enemy.velocity) {
        if (enemy.patrolMinX !== undefined && enemy.position.x <= enemy.patrolMinX) {
          enemy.velocity.x = Math.abs(enemy.velocity.x || patrolSpeed);
        } else if (enemy.patrolMaxX !== undefined && enemy.position.x >= enemy.patrolMaxX) {
          enemy.velocity.x = -Math.abs(enemy.velocity.x || patrolSpeed);
        }
        enemy.velocity.y = 0;
        // Aim in direction of movement
        enemy.aimAngle = enemy.velocity.x > 0 ? 0 : Math.PI;
      }
    }

    // Move
    if (enemy.velocity) {
      enemy.position.x += enemy.velocity.x * dtSeconds;
      enemy.position.y += enemy.velocity.y * dtSeconds;
    }

    // Fire cooldown
    if (enemy.fireCooldown > 0) {
      enemy.fireCooldown -= dtMs;
      if (enemy.fireCooldown < 0) enemy.fireCooldown = 0;
    }

    // Fire only while engaged
    if (enemy.behaviorState === 'engage' && enemy.fireCooldown <= 0 && nearest) {
      const owner = { type: 'enemy' as const, id: enemy.id };
      if (isRocket) {
        // Slow, high-damage rocket
        const proj = createEp2EnemyBullet(
          enemy.position, enemy.aimAngle, owner,
          ROCKET_COPTER_PROJECTILE_SPEED, ROCKET_COPTER_DAMAGE, 2,
        );
        state.projectiles = [...state.projectiles, proj];
        enemy.fireCooldown = ROCKET_COPTER_FIRE_RATE;
      } else {
        // Rapid laser
        const proj = createEp2EnemyBullet(
          enemy.position, enemy.aimAngle, owner,
          LASER_COPTER_PROJECTILE_SPEED, LASER_COPTER_DAMAGE, 2,
        );
        state.projectiles = [...state.projectiles, proj];
        enemy.fireCooldown = LASER_COPTER_FIRE_RATE;
      }
      SoundManager.play('playerFire');
    }
  }

  private updateBomber(
    enemy: MapEnemy,
    players: Player[],
    state: GameState,
    dtMs: number,
    _dtSeconds: number,
  ): void {
    const isSpreader = enemy.type === 'spread-bomber';
    const speed = enemy.moveSpeed ?? (isSpreader ? SPREAD_BOMBER_SPEED : HOMING_BOMBER_SPEED);

    // Move south (increasing Y)
    enemy.position.y += speed * _dtSeconds;

    // Fire cooldown
    if (enemy.fireCooldown > 0) {
      enemy.fireCooldown -= dtMs;
      if (enemy.fireCooldown < 0) enemy.fireCooldown = 0;
    }

    // Drop ordnance while in viewport area
    if (enemy.fireCooldown <= 0 && state.camera) {
      const owner = { type: 'enemy' as const, id: enemy.id };

      if (isSpreader) {
        // Fan of 5 projectiles downward
        const newProjectiles: Projectile[] = [];
        const spreadAngle = Math.PI / 6; // 30 degree total spread
        for (let i = 0; i < SPREAD_BOMBER_SPREAD_COUNT; i++) {
          const angle = Math.PI / 2 + spreadAngle * (i / (SPREAD_BOMBER_SPREAD_COUNT - 1) - 0.5);
          newProjectiles.push(createEp2EnemyBullet(
            enemy.position, angle, owner,
            SPREAD_BOMBER_PROJECTILE_SPEED, SPREAD_BOMBER_DAMAGE, 2,
          ));
        }
        state.projectiles = [...state.projectiles, ...newProjectiles];
        enemy.fireCooldown = SPREAD_BOMBER_FIRE_RATE;
      } else {
        // Homing missile toward nearest player (renders green)
        const nearest = this.findNearestPlayer(enemy, players);
        if (nearest) {
          const dx = nearest.position.x - enemy.position.x;
          const dy = nearest.position.y - enemy.position.y;
          const angle = Math.atan2(dy, dx);
          const proj = createEp2EnemyBullet(
            enemy.position, angle, owner,
            HOMING_BOMBER_MISSILE_SPEED, HOMING_BOMBER_DAMAGE, 2,
          );
          proj.type = 'missile'; // Render as green homing missile
          proj.isHoming = true;
          proj.turnRate = HOMING_BOMBER_MISSILE_TURN_RATE;
          state.projectiles = [...state.projectiles, proj];
          enemy.fireCooldown = HOMING_BOMBER_FIRE_RATE;
        }
      }
      SoundManager.play('playerFire');
    }

    // Re-enter from above viewport when exiting bottom
    if (state.camera && enemy.position.y > state.camera.worldY + 1200) {
      enemy.position.y = state.camera.worldY - 200;
      // Randomize X slightly for variety
      enemy.position.x = 200 + Math.random() * 800;
    }
  }

  private updateHoverTank(
    enemy: MapEnemy,
    players: Player[],
    state: GameState,
    dtMs: number,
    dtSeconds: number,
  ): void {
    // Patrol horizontally
    if (enemy.velocity) {
      if (enemy.patrolMinX !== undefined && enemy.position.x <= enemy.patrolMinX) {
        enemy.velocity.x = Math.abs(enemy.velocity.x || HOVER_TANK_SPEED);
      } else if (enemy.patrolMaxX !== undefined && enemy.position.x >= enemy.patrolMaxX) {
        enemy.velocity.x = -Math.abs(enemy.velocity.x || HOVER_TANK_SPEED);
      }
      enemy.position.x += enemy.velocity.x * dtSeconds;
    }

    // Boulder collision — push hover tank out of overlapping boulders
    if (state.map) {
      for (const obj of state.map.objects) {
        if (obj.type !== 'boulder' && obj.type !== 'destructible-rock') continue;
        if (!obj.collisionRadius) continue;
        if (obj.type === 'destructible-rock' && obj.health !== undefined && obj.health <= 0) continue;

        const bx = enemy.position.x - obj.position.x;
        const by = enemy.position.y - obj.position.y;
        const bDist = Math.sqrt(bx * bx + by * by);
        const minDist = obj.collisionRadius + enemy.collisionRadius;

        if (bDist < minDist && bDist > 0) {
          const overlap = minDist - bDist;
          enemy.position.x += (bx / bDist) * overlap;
          enemy.position.y += (by / bDist) * overlap;
          // Reverse patrol direction on collision
          if (enemy.velocity) {
            enemy.velocity.x = -enemy.velocity.x;
          }
        }
      }
    }

    // Aim at nearest player
    const nearest = this.findNearestPlayer(enemy, players);
    if (!nearest) return;

    const dx = nearest.position.x - enemy.position.x;
    const dy = nearest.position.y - enemy.position.y;
    const targetAngle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    enemy.aimAngle = rotateToward(enemy.aimAngle, targetAngle, HOVER_TANK_AIM_SPEED * dtSeconds);

    // Fire cooldown
    if (enemy.fireCooldown > 0) {
      enemy.fireCooldown -= dtMs;
      if (enemy.fireCooldown < 0) enemy.fireCooldown = 0;
    }

    // Fire plasma
    if (enemy.fireCooldown <= 0 && dist <= EP2_ENEMY_FIRE_RANGE) {
      const owner = { type: 'enemy' as const, id: enemy.id };
      const proj = createEp2EnemyPlasma(
        enemy.position, enemy.aimAngle, owner,
        HOVER_TANK_PROJECTILE_SPEED, HOVER_TANK_DAMAGE, enemy.elevation,
      );
      state.projectiles = [...state.projectiles, proj];
      enemy.fireCooldown = HOVER_TANK_FIRE_RATE;
      SoundManager.play('playerFire');
    }
  }

  private updatePopupMine(
    enemy: MapEnemy,
    players: Player[],
    state: GameState,
    dtMs: number,
    dtSeconds: number,
  ): void {
    if (!enemy.isActivated) {
      // Check proximity trigger
      let triggered = false;
      for (const player of players) {
        const dx = player.position.x - enemy.position.x;
        const dy = player.position.y - enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= enemy.activationRange) {
          triggered = true;
          break;
        }
      }

      // Decrement dormant timer
      enemy.dormantTimer -= dtMs;

      if (triggered || enemy.dormantTimer <= 0) {
        enemy.isActivated = true;
        enemy.popupProgress = 0;
        enemy.burstFired = false;
      }
      return;
    }

    // Animating popup
    if (enemy.popupProgress < 1) {
      enemy.popupProgress += dtSeconds / (POPUP_MINE_POPUP_DURATION / 1000);
      if (enemy.popupProgress > 1) enemy.popupProgress = 1;
      return;
    }

    // Fire burst
    if (!enemy.burstFired) {
      const owner = { type: 'enemy' as const, id: enemy.id };
      const newProjectiles: Projectile[] = [];

      for (let i = 0; i < POPUP_MINE_BURST_PROJECTILES; i++) {
        const angle = (i / POPUP_MINE_BURST_PROJECTILES) * Math.PI * 2;
        newProjectiles.push(createEp2EnemyBullet(
          enemy.position, angle, owner,
          POPUP_MINE_BURST_SPEED, POPUP_MINE_BURST_DAMAGE, enemy.elevation,
        ));
      }

      state.projectiles = [...state.projectiles, ...newProjectiles];
      enemy.burstFired = true;
      enemy.cooldownTimer = POPUP_MINE_COOLDOWN;
      SoundManager.play('playerFire');
      return;
    }

    // Cooldown after burst
    enemy.cooldownTimer -= dtMs;
    if (enemy.cooldownTimer <= 0) {
      // Return to dormant
      enemy.isActivated = false;
      enemy.popupProgress = 0;
      enemy.burstFired = false;
      enemy.dormantTimer = POPUP_MINE_DORMANT_TIMER * (0.5 + Math.random() * 0.5);
    }
  }

  /** Check player projectile vs map enemy collisions. */
  checkProjectileCollisions(state: GameState): void {
    if (!state.mapEnemies) return;

    for (const proj of state.projectiles) {
      if (!proj.isActive || proj.hasCollided) continue;
      if (proj.owner.type !== 'player') continue;

      for (const enemy of state.mapEnemies) {
        if (!enemy.isAlive) continue;

        // Aerial enemies can be hit regardless of elevation
        if (!enemy.isAerial) {
          // Ground enemy: elevation check
          if (Math.abs((proj.elevation ?? 0) - enemy.elevation) > 0.5) continue;
        }

        const dx = proj.position.x - enemy.position.x;
        const dy = proj.position.y - enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.collisionRadius + proj.collisionRadius) {
          proj.hasCollided = true;
          proj.isActive = false;

          // Damage enemy
          enemy.health -= proj.damage;
          if (enemy.health <= 0) {
            enemy.health = 0;
            enemy.isAlive = false;
            // Award score to firing player
            const playerId = proj.owner.id;
            const player = state.players.find(p => p.id === playerId);
            if (player) {
              player.score += enemy.scoreValue;
              player.stats.kills++;
              player.levelStats.kills++;
            }
          }

          // Impact effect
          state.pendingImpacts.push({
            x: proj.position.x,
            y: proj.position.y,
            id: proj.id,
            type: proj.type as 'cannon-shell' | 'plasma-bolt',
          });
          SoundManager.play('shellImpact');
          break;
        }
      }
    }
  }

  /** Check enemy projectile vs player tank collisions. */
  checkEnemyProjectileVsPlayer(state: GameState): void {
    if (!state.tankStates) return;

    for (const proj of state.projectiles) {
      if (!proj.isActive || proj.hasCollided) continue;
      if (proj.owner.type !== 'enemy') continue;

      for (const player of state.players) {
        if (!player.isAlive || player.isInvulnerable) continue;

        const tank = state.tankStates[player.id];
        if (!tank) continue;

        // Aerial projectiles (elevation=2) hit all ground targets.
        // Ground projectiles: high ground can hit low ground (shooting downhill),
        // but low ground cannot hit high ground players (blocked by cliffs).
        const projElev = proj.elevation ?? 0;
        if (projElev < 2 && projElev < tank.elevation - 0.5) continue;

        const dx = proj.position.x - player.position.x;
        const dy = proj.position.y - player.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < TANK_COLLISION_RADIUS + proj.collisionRadius) {
          proj.hasCollided = true;
          proj.isActive = false;
          player.health -= proj.damage;

          if (player.health <= 0) {
            player.health = 0;
            player.isAlive = false;
            player.stats.deaths++;
            player.levelStats.deaths++;
            SoundManager.play('playerDeath');
          } else {
            SoundManager.play('tankHit');
          }
          break;
        }
      }
    }
  }

  private findNearestPlayer(enemy: MapEnemy, players: Player[]): Player | null {
    let nearest: Player | null = null;
    let minDist = Infinity;
    for (const player of players) {
      const dx = player.position.x - enemy.position.x;
      const dy = player.position.y - enemy.position.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = player;
      }
    }
    return nearest;
  }
}

/** Rotate current angle toward target at a maximum rate. */
function rotateToward(current: number, target: number, maxDelta: number): number {
  let diff = target - current;
  // Normalize to [-PI, PI]
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

/** Distance between two positioned entities. */
function distBetween(a: { position: { x: number; y: number } }, b: { position: { x: number; y: number } }): number {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}
