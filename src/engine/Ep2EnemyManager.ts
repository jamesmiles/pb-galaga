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
  EP2_ENEMY_FIRE_RANGE, TANK_COLLISION_RADIUS,
} from './constants';

/**
 * Manages Episode 2 map enemies: AI aiming, firing, popup mine logic,
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
      if (!isInViewport(enemy.position.y, state.camera, 200)) continue;

      if (enemy.type === 'popup-mine') {
        this.updatePopupMine(enemy, alivePlayers, state, dtMs, dtSeconds);
      } else {
        this.updateAimingEnemy(enemy, alivePlayers, state, dtMs, dtSeconds);
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

        // Elevation check
        if (Math.abs((proj.elevation ?? 0) - enemy.elevation) > 0.5) continue;

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

        // Elevation check
        if (Math.abs((proj.elevation ?? 0) - tank.elevation) > 0.5) continue;

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
            player.lives--;
            player.stats.deaths++;
            player.levelStats.deaths++;
          }

          SoundManager.play('shellImpact');
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
