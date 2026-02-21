import type { GameState, EpisodeEngine } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, WAVE_COMPLETE_BONUS, PLAYER_INVULNERABILITY_DURATION } from './constants';
import { updatePlayerShip, respawnPlayer } from '../objects/player/code/PlayerShip';
import { spawnPlayerProjectiles, updateAllProjectiles } from '../objects/projectiles/laser/code/Laser';
import { updateFormation } from './FormationManager';
import { updateBackground } from '../objects/environment/Background';
import { detectCollisions } from './CollisionDetector';
import { LevelManager } from './LevelManager';
import { EnemyFiringManager } from './EnemyFiringManager';
import { DiveManager } from './DiveManager';
import { updateFlightPaths } from './FlightPathManager';
import { SoundManager } from '../audio/SoundManager';
import { MusicManager } from '../audio/MusicManager';
import { AsteroidManager } from './AsteroidManager';
import { updateSecondaryTimer } from './WeaponManager';
import { WeaponPickupManager } from './WeaponPickupManager';
import { BossManager } from './BossManager';
import { LifePickupManager } from './LifePickupManager';
import { InputHandler } from './InputHandler';

import { drawStars } from '../renderer/drawing/drawStars';
import { drawPlayers } from '../renderer/drawing/drawPlayer';
import { drawEnemies } from '../renderer/drawing/drawEnemies';
import { drawProjectiles } from '../renderer/drawing/drawProjectiles';
import { drawBossLower, drawBossUpper, drawLifePickups, drawRespawnPickups } from '../renderer/drawing/drawBoss';
import type { WeaponPickup, Asteroid } from '../types';

import { level1 } from '../levels/level1';
import { level2 } from '../levels/level2';
import { level3 } from '../levels/level3';
import { level4 } from '../levels/level4';
import { level5 } from '../levels/level5';

/**
 * Episode 1 engine — wraps all existing wave-based space shooter gameplay.
 * Manages: LevelManager, FormationManager, DiveManager, EnemyFiringManager,
 * BossManager, AsteroidManager, WeaponPickupManager, LifePickupManager.
 */
export class Episode1Engine implements EpisodeEngine {
  readonly levelManager: LevelManager;
  private enemyFiringManager: EnemyFiringManager;
  private diveManager: DiveManager;
  private asteroidManager: AsteroidManager;
  private weaponPickupManager: WeaponPickupManager;
  readonly bossManager: BossManager;
  private lifePickupManager: LifePickupManager;
  private inputHandler: InputHandler;

  constructor(inputHandler: InputHandler) {
    this.inputHandler = inputHandler;
    this.levelManager = new LevelManager();
    this.levelManager.registerLevel(level1);
    this.levelManager.registerLevel(level2);
    this.levelManager.registerLevel(level3);
    this.levelManager.registerLevel(level4);
    this.levelManager.registerLevel(level5);
    this.enemyFiringManager = new EnemyFiringManager();
    this.diveManager = new DiveManager();
    this.asteroidManager = new AsteroidManager();
    this.weaponPickupManager = new WeaponPickupManager();
    this.bossManager = new BossManager();
    this.lifePickupManager = new LifePickupManager();
  }

  update(state: GameState, dtSeconds: number): void {
    // Check pause toggle
    if (this.inputHandler.getPauseToggle()) {
      state.gameStatus = 'paused';
      state.menu = {
        type: 'pause',
        selectedOption: 0,
        options: ['Resume', 'Main Menu'],
      };
      return;
    }

    // Check mute toggle
    if (this.inputHandler.getMuteToggle()) {
      const muted = SoundManager.toggleMute();
      MusicManager.onMuteChanged(muted);
    }

    // Sync auto-fire state
    state.autoFire = this.inputHandler.getAutoFireState();

    // 1. Process input (skip players in death sequence)
    for (const player of state.players) {
      if (player.deathSequence?.active) continue;
      if (player.id === 'player1') {
        player.input = this.inputHandler.getPlayerInput();
      } else if (player.id === 'player2') {
        player.input = this.inputHandler.getPlayer2Input();
      }
    }

    // 2. Update players (skip players in death sequence)
    for (const player of state.players) {
      if (player.deathSequence?.active) continue;
      updatePlayerShip(player, dtSeconds);
    }

    // 3. Update weapon timers and spawn projectiles
    for (const player of state.players) {
      if (player.deathSequence?.active) continue;
      updateSecondaryTimer(player, dtSeconds * 1000);
      if (player.secondaryCooldown > 0) {
        player.secondaryCooldown -= dtSeconds * 1000;
      }
    }
    const projCountBefore = state.projectiles.length;
    const activeSnakesBefore = state.projectiles.filter(
      p => p.type === 'snake' && p.isActive && p.owner.type === 'player',
    ).length;
    spawnPlayerProjectiles(state);
    const playerProjAdded = state.projectiles.length - projCountBefore;
    if (playerProjAdded > 0) {
      const newProjs = state.projectiles.slice(projCountBefore);
      const hasNewSnake = newProjs.some(p => p.type === 'snake');
      const hasNewNonSnake = newProjs.some(p => p.type !== 'snake');
      if (hasNewSnake && activeSnakesBefore === 0) {
        SoundManager.play('snakeBeam');
      }
      if (hasNewNonSnake) {
        SoundManager.play('playerFire');
      }
    }
    updateAllProjectiles(state, dtSeconds);

    // 4. Update enemy formation
    if (state.formation && state.enemies.length > 0) {
      updateFormation(state, dtSeconds);
    }

    // 4b. Update flight path entry animations
    updateFlightPaths(state, dtSeconds);

    // 5. Dive attacks
    this.diveManager.update(state, dtSeconds);

    // 6. Enemy firing
    const projCountBeforeEnemy = state.projectiles.length;
    this.enemyFiringManager.update(state, dtSeconds);
    if (state.projectiles.length > projCountBeforeEnemy) SoundManager.play('enemyFire');

    // 6b. Boss update
    this.bossManager.update(state, dtSeconds);

    // Check if boss health reached 0 and start death sequence
    if (state.boss?.isAlive && state.boss.health <= 0 && !state.boss.deathSequence) {
      this.bossManager.startDeathSequence(state.boss);
    }

    // 7. Update background, asteroids, weapon pickups, and life pickups
    if (state.background) {
      updateBackground(state.background, dtSeconds);
    }
    this.asteroidManager.update(state, dtSeconds * 1000);
    this.weaponPickupManager.updatePickups(state, dtSeconds * 1000);
    this.lifePickupManager.update(state, dtSeconds * 1000);

    // 8. Level/wave progression
    const waveStatusBefore = state.waveStatus;
    this.levelManager.update(state);

    // Detect wave completion (active → transition or clearing)
    if (waveStatusBefore === 'active' && state.waveStatus !== 'active') {
      for (const player of state.players) {
        if (player.isAlive) {
          player.score += WAVE_COMPLETE_BONUS;
        }
      }
    }

    // Detect clearing phase completing → level complete or game complete
    if (waveStatusBefore === 'clearing' && state.waveStatus === 'complete') {
      MusicManager.stop();
      this.inputHandler.clearAll();
      const totalScore = state.players.reduce((sum, p) => sum + p.score, 0);
      const hasNextLevel = this.levelManager.hasLevel(state.currentLevel + 1);

      if (!hasNextLevel) {
        const p1 = state.players.find(p => p.id === 'player1');
        const p2 = state.players.find(p => p.id === 'player2');
        state.gameStatus = 'gamecomplete';
        state.menu = {
          type: 'gamecomplete',
          selectedOption: 0,
          options: ['Main Menu'],
          data: {
            finalScore: totalScore,
            introText: `mission complete // ${new Date().toISOString().slice(0, 10)}\n\nspace force has defeated the mothership.\n\nbut long range sensors detect survivors\nregrouping on the martian surface...\n\n... coming soon`,
            introChars: 0,
            p1GameStats: p1 ? { ...p1.stats } : undefined,
            p2GameStats: p2 ? { ...p2.stats } : undefined,
          },
        };
      } else {
        state.gameStatus = 'levelcomplete';
        state.menu = {
          type: 'levelcomplete',
          selectedOption: 0,
          options: [],
          data: { finalScore: totalScore, wave: state.currentWave, level: state.currentLevel },
        };
      }
      return;
    }

    // 9. Collision detection
    const enemyAliveMap = new Map(state.enemies.map(e => [e.id, { alive: e.isAlive, type: e.type, health: e.health }]));
    const asteroidHealthMap = new Map(state.asteroids.map(a => [a.id, { alive: a.isAlive, health: a.health }]));
    const bossTurretAliveMap = state.boss ? new Map(state.boss.turrets.map(t => [t.id, t.isAlive])) : new Map<string, boolean>();
    const bossHealthBefore = state.boss?.health ?? 0;
    const lifePickupCountBefore = state.lifePickups.filter(p => p.isActive).length;
    const respawnPickupCountBefore = state.respawnPickups.filter(p => p.isActive).length;
    const alivePlayersBefore = state.players.filter(p => p.isAlive).length;
    detectCollisions(state);
    // Life pickup sound
    const lifePickupCountAfter = state.lifePickups.filter(p => p.isActive).length;
    if (lifePickupCountAfter < lifePickupCountBefore) {
      SoundManager.play('lifePickup');
    }
    // Respawn pickup sound
    const respawnPickupCountAfter = state.respawnPickups.filter(p => p.isActive).length;
    if (respawnPickupCountAfter < respawnPickupCountBefore) {
      SoundManager.play('respawnPickup');
    }
    for (const enemy of state.enemies) {
      const before = enemyAliveMap.get(enemy.id);
      if (before?.alive && !enemy.isAlive) {
        const hitSound = `hit${enemy.type}` as import('../audio/SoundManager').SoundEffect;
        SoundManager.play(hitSound);
        this.weaponPickupManager.maybeSpawnPickup(state, enemy.position);
      } else if (before?.alive && enemy.isAlive && enemy.type === 'G' && enemy.health < before.health) {
        SoundManager.play('hitGClang');
      }
    }
    for (const asteroid of state.asteroids) {
      const before = asteroidHealthMap.get(asteroid.id);
      if (before && before.alive) {
        if (!asteroid.isAlive) {
          SoundManager.play('asteroidExplode');
        } else if (asteroid.health < before.health) {
          SoundManager.play('asteroidHit');
        }
      }
    }
    // Boss turret death sounds
    if (state.boss) {
      for (const turret of state.boss.turrets) {
        const wasBefore = bossTurretAliveMap.get(turret.id);
        if (wasBefore && !turret.isAlive) {
          SoundManager.play('bossExplosion');
        }
      }
      if (state.boss.health < bossHealthBefore && state.boss.health > 0) {
        SoundManager.play('bridgeHit');
      }
    }
    const alivePlayersAfter = state.players.filter(p => p.isAlive).length;
    if (alivePlayersAfter < alivePlayersBefore) {
      SoundManager.play('playerDeath');
      for (const player of state.players) {
        if (!player.isAlive && player.collisionState === 'destroyed') {
          player.primaryWeapon = player.id === 'player1' ? 'bullet' : 'laser';
          player.primaryLevel = 1;
          player.secondaryWeapon = null;
          player.secondaryTimer = 0;
          player.secondaryCooldown = 0;
        }
      }
      state.weaponPickups = [];
    }

    // 10. Handle death sequences and delayed respawn
    for (const player of state.players) {
      if (player.deathSequence?.active) {
        const elapsed = state.currentTime - player.deathSequence.startTime;
        if (elapsed >= player.deathSequence.duration) {
          player.deathSequence.active = false;
          if (player.lives > 0) {
            respawnPlayer(player);
          }
        }
      }
    }

    // 11. Check game over
    this.checkGameOver(state);
  }

  render(
    ctx: CanvasRenderingContext2D,
    current: GameState,
    previous: GameState,
    alpha: number,
    _renderDt: number,
  ): void {
    const prevPlayers = new Map(previous.players.map(p => [p.id, p]));
    const prevEnemies = new Map(previous.enemies.map(e => [e.id, e]));
    const prevProjectiles = new Map(previous.projectiles.map(p => [p.id, p]));

    // Draw layers (back to front)
    if (current.background) {
      drawStars(ctx, current.background.stars);
    }

    // Boss lower hull (behind everything gameplay-related)
    if (current.boss) {
      drawBossLower(ctx, current.boss);
    }

    drawEnemies(ctx, current.enemies, prevEnemies, alpha);
    drawProjectiles(ctx, current.projectiles, prevProjectiles, alpha);
    this.drawAsteroids(ctx, current.asteroids);
    this.drawWeaponPickups(ctx, current.weaponPickups, current.currentTime);
    drawLifePickups(ctx, current.lifePickups, current.currentTime);
    drawRespawnPickups(ctx, current.respawnPickups, current.currentTime);
    drawPlayers(ctx, current.players, prevPlayers, alpha, current.currentTime);

    // Boss upper layer (turrets + bridge, in front of player)
    if (current.boss) {
      drawBossUpper(ctx, current.boss);
    }
  }

  /** Render paused gameplay scene (frozen, no interpolation). */
  renderPaused(
    ctx: CanvasRenderingContext2D,
    current: GameState,
    previous: GameState,
  ): void {
    const prevPlayers = new Map(previous.players.map(p => [p.id, p]));
    const prevEnemies = new Map(previous.enemies.map(e => [e.id, e]));
    const prevProjectiles = new Map(previous.projectiles.map(p => [p.id, p]));

    if (current.background) {
      drawStars(ctx, current.background.stars);
    }
    drawEnemies(ctx, current.enemies, prevEnemies, 1);
    drawProjectiles(ctx, current.projectiles, prevProjectiles, 1);
    this.drawAsteroids(ctx, current.asteroids);
    this.drawWeaponPickups(ctx, current.weaponPickups, current.currentTime);
    drawPlayers(ctx, current.players, prevPlayers, 1, current.currentTime);
  }

  onLevelStart(state: GameState, level: number): void {
    this.enemyFiringManager.reset();
    this.diveManager.reset();
    this.asteroidManager.reset();
    this.levelManager.startLevel(state, level);
  }

  onLevelComplete(_state: GameState): void {
    // Handled inline in update() above
  }

  /** Reset managers for level transition. */
  resetForLevelTransition(): void {
    this.enemyFiringManager.reset();
    this.diveManager.reset();
    this.lifePickupManager.reset();
  }

  private checkGameOver(state: GameState): void {
    const anyDeathSequenceActive = state.players.some(p => p.deathSequence?.active);
    if (anyDeathSequenceActive) return;

    const alivePlayers = state.players.filter(p => p.isAlive || p.lives > 0);
    if (state.players.length > 0 && alivePlayers.length === 0) {
      state.gameStatus = 'gameover';
      MusicManager.play('menu');
      const p1 = state.players.find(p => p.id === 'player1');
      const p2 = state.players.find(p => p.id === 'player2');
      const finalScore = p1?.score ?? 0;
      state.menu = {
        type: 'gameover',
        selectedOption: 0,
        options: ['Restart', 'Main Menu'],
        data: {
          finalScore,
          ...(p2 ? { p2Score: p2.score } : {}),
        },
      };
    }
  }

  /** Draw active weapon pickups as pulsing colored orbs. */
  private drawWeaponPickups(ctx: CanvasRenderingContext2D, pickups: WeaponPickup[], time: number): void {
    for (const pickup of pickups) {
      if (!pickup.isActive) continue;

      const colors: Record<string, string> = {
        laser: '#4488ff',
        bullet: '#ff4444',
        rocket: '#aa44ff',
        missile: '#44ff44',
      };
      const color = colors[pickup.currentWeapon] ?? '#ffffff';
      const pulse = 0.7 + 0.3 * Math.sin(time * 0.005);
      const radius = 10 * pulse;

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pickup.position.x, pickup.position.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(pickup.position.x, pickup.position.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /** Draw asteroids as rocky polygon shapes. */
  private drawAsteroids(ctx: CanvasRenderingContext2D, asteroids: Asteroid[]): void {
    for (const asteroid of asteroids) {
      if (!asteroid.isAlive) continue;

      const r = asteroid.collisionRadius;
      const sides = asteroid.size === 'large' ? 8 : 6;
      const color = asteroid.size === 'large' ? '#887766' : '#998877';

      ctx.save();
      ctx.translate(asteroid.position.x, asteroid.position.y);
      ctx.rotate(asteroid.rotation);

      ctx.shadowBlur = 4;
      ctx.shadowColor = '#665544';
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const wobble = 0.8 + 0.2 * Math.sin(i * 2.5);
        const px = Math.cos(angle) * r * wobble;
        const py = Math.sin(angle) * r * wobble;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#554433';
      ctx.beginPath();
      ctx.arc(r * 0.2, -r * 0.2, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-r * 0.3, r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
