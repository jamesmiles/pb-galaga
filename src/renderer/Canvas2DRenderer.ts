import type { GameState, GameRenderer, WeaponPickup, Asteroid } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, SECONDARY_WEAPON_DURATION } from '../engine/constants';
import { MenuOverlay } from './MenuOverlay';
import { drawStars } from './drawing/drawStars';
import { drawPlayers } from './drawing/drawPlayer';
import { drawEnemies } from './drawing/drawEnemies';
import { drawProjectiles } from './drawing/drawProjectiles';
import { drawBossLower, drawBossUpper, drawLifePickups, drawRespawnPickups } from './drawing/drawBoss';
import { drawHUD } from './HUD';
import { ParticleSystem } from './effects/ParticleSystem';
import { LEVEL_BACKGROUNDS, type BackgroundObjectConfig } from '../levels/backgrounds';

/**
 * Canvas 2D renderer implementing the GameRenderer interface.
 *
 * Uses direct Canvas 2D API with per-entity shadowBlur for neon glow effects.
 * Replaces the previous Phaser-based renderer — rendering is driven by our
 * GameLoop's render callback, not by any framework loop.
 */
export class Canvas2DRenderer implements GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private menuOverlay: MenuOverlay;
  private particleSystem: ParticleSystem;

  // FPS counters passed from GameLoop
  engineFps = 0;
  renderFps = 0;

  // Track render frame timing for particle updates
  private lastRenderTime = 0;

  // Track game status for cleanup transitions
  private lastGameStatus = '';

  // Track boss state for death explosion detection
  private lastBossTurretAlive: boolean[] = [];
  private lastBossHealth = 0;

  // Background image system
  private bgImageCache: Map<string, HTMLImageElement> = new Map();
  private bgScrollOffsets: number[] = [];
  private currentBgLevel = -1;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container #${containerId} not found`);

    // Ensure container is positioned for overlay layering
    container.style.position = 'relative';

    this.canvas = document.createElement('canvas');
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.particleSystem = new ParticleSystem();

    // Create CSS menu overlay on top of the canvas
    this.menuOverlay = new MenuOverlay(container);
  }

  /** Update FPS counters (called by main.ts from GameLoop stats). */
  setFpsCounters(engineFps: number, renderFps: number): void {
    this.engineFps = engineFps;
    this.renderFps = renderFps;
  }

  render(current: GameState, previous: GameState, alpha: number): void {
    const ctx = this.ctx;
    const now = performance.now();
    const renderDt = this.lastRenderTime > 0 ? now - this.lastRenderTime : 16.667;
    this.lastRenderTime = now;

    // Clear explosion tracking on game (re)start
    if (current.gameStatus === 'playing' && this.lastGameStatus !== 'playing') {
      this.particleSystem.clearTracking();
    }
    this.lastGameStatus = current.gameStatus;

    // Clear to black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Load backgrounds on level change
    if (current.currentLevel !== this.currentBgLevel) {
      this.loadBackgrounds(current.currentLevel);
    }

    // Draw background celestial bodies (behind everything — freeze when paused)
    const bgDt = current.gameStatus === 'paused' ? 0 : renderDt;
    this.drawBackgrounds(ctx, current.currentLevel, bgDt);

    // Update particles (runs regardless of game status for lingering effects)
    this.particleSystem.update(renderDt);

    if (current.gameStatus === 'menu' || current.gameStatus === 'gameover' || current.gameStatus === 'levelcomplete' || current.gameStatus === 'levelintro') {
      // Menu screens: render stars in background, particles, then overlay
      if (current.background) {
        drawStars(ctx, current.background.stars);
      }
      this.particleSystem.draw(ctx);
      this.menuOverlay.update(current);
      return;
    }

    if (current.gameStatus === 'paused') {
      // Render the frozen game scene behind the pause overlay
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
      this.particleSystem.draw(ctx);
      drawHUD(ctx, current, this.engineFps, this.renderFps);
      this.menuOverlay.update(current);
      return;
    }

    // Apply screen shake offset
    ctx.save();
    ctx.translate(this.particleSystem.shakeOffsetX, this.particleSystem.shakeOffsetY);

    // Build previous-state lookup maps for interpolation
    const prevPlayers = new Map(previous.players.map(p => [p.id, p]));
    const prevEnemies = new Map(previous.enemies.map(e => [e.id, e]));
    const prevProjectiles = new Map(previous.projectiles.map(p => [p.id, p]));

    // Detect deaths and emit particles
    this.detectDeaths(current);

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

    this.particleSystem.draw(ctx);

    ctx.restore();

    // HUD drawn outside shake offset
    drawHUD(ctx, current, this.engineFps, this.renderFps);

    // Update CSS menu overlay
    this.menuOverlay.update(current);
  }

  /**
   * Detect newly dead entities and emit explosion particles.
   * Checks current state for dead entities with 'destroyed' collision state.
   */
  private detectDeaths(current: GameState): void {
    // Enemy deaths
    for (const enemy of current.enemies) {
      if (!enemy.isAlive && enemy.collisionState === 'destroyed') {
        this.particleSystem.emit(
          enemy.position.x,
          enemy.position.y,
          enemy.id,
          enemy.type,
        );
      }
    }

    // Player deaths
    for (const player of current.players) {
      if (!player.isAlive) {
        this.particleSystem.emit(
          player.position.x,
          player.position.y,
          player.id,
          'player',
        );
      }
    }

    // Asteroid deaths — dirt explosion
    for (const asteroid of current.asteroids) {
      if (!asteroid.isAlive) {
        this.particleSystem.emit(
          asteroid.position.x,
          asteroid.position.y,
          asteroid.id,
          'asteroid',
        );
      }
    }

    // Boss turret and bridge death explosions
    if (current.boss) {
      for (let i = 0; i < current.boss.turrets.length; i++) {
        const turret = current.boss.turrets[i];
        const wasBefore = this.lastBossTurretAlive[i] ?? true;
        if (wasBefore && !turret.isAlive) {
          this.particleSystem.emitLargeExplosion(
            turret.position.x, turret.position.y,
            turret.id, 'bossTurret',
          );
        }
      }
      this.lastBossTurretAlive = current.boss.turrets.map(t => t.isAlive);

      // Boss bridge death (boss health goes to 0)
      if (this.lastBossHealth > 0 && current.boss.health <= 0 && current.boss.deathSequence) {
        this.particleSystem.emitLargeExplosion(
          current.boss.position.x, current.boss.position.y,
          'boss-bridge', 'bossBridge',
        );
      }
      this.lastBossHealth = current.boss.health;

      // Death sequence phase explosions
      if (current.boss.deathSequence) {
        const phase = current.boss.deathSequence.phase;
        const turretCount = current.boss.turrets.length;
        if (phase < turretCount) {
          const turret = current.boss.turrets[phase];
          if (turret) {
            this.particleSystem.emitLargeExplosion(
              turret.position.x, turret.position.y,
              `boss-death-phase-${phase}`, 'bossTurret',
            );
          }
        } else if (phase === turretCount) {
          this.particleSystem.emitLargeExplosion(
            current.boss.position.x, current.boss.position.y,
            'boss-death-final', 'bossBridge',
          );
        }
      }
    }

    // Enemy F and G (mini-boss) large explosions
    for (const enemy of current.enemies) {
      if (!enemy.isAlive && enemy.collisionState === 'destroyed' && (enemy.type === 'F' || enemy.type === 'G')) {
        this.particleSystem.emitLargeExplosion(
          enemy.position.x, enemy.position.y,
          `${enemy.id}-large`, 'F',
        );
      }
    }

    // Projectile impacts — emit localized flash at collision point
    for (const proj of current.projectiles) {
      if (proj.hasCollided && !proj.isActive) {
        const color = proj.owner.type === 'player' ? '#00ffff' : '#ff8800';
        this.particleSystem.emitImpactFlash(
          proj.position.x,
          proj.position.y,
          proj.id,
          color,
        );
      }
    }
  }

  /** Load background images for a level. */
  private loadBackgrounds(level: number): void {
    this.currentBgLevel = level;
    const configs = LEVEL_BACKGROUNDS[level] ?? [];
    this.bgScrollOffsets = configs.map(() => 0);

    for (const config of configs) {
      if (!this.bgImageCache.has(config.url)) {
        const img = new Image();
        img.src = config.url;
        this.bgImageCache.set(config.url, img);
      }
    }
  }

  /**
   * Draw background celestial bodies behind starfield.
   * Each object starts above the screen and drifts downward through the viewport.
   * The config `y` value staggers entry timing (higher y = enters later).
   */
  private drawBackgrounds(ctx: CanvasRenderingContext2D, level: number, dt: number): void {
    const configs = LEVEL_BACKGROUNDS[level] ?? [];
    if (configs.length === 0) return;

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const img = this.bgImageCache.get(config.url);
      if (!img || !img.complete) continue;

      // Advance scroll (accumulates downward distance)
      this.bgScrollOffsets[i] += config.scrollSpeed * dt / 1000;

      const h = img.height * config.scale;
      const w = img.width * config.scale;
      // Start above screen; y config acts as stagger (higher = enters later)
      const drawY = -(h / 2) - config.y + this.bgScrollOffsets[i];
      const drawX = config.x;

      // Only draw while visible
      if (drawY - h / 2 > GAME_HEIGHT || drawY + h / 2 < 0) continue;

      ctx.save();
      ctx.globalAlpha = config.alpha;
      ctx.drawImage(img, drawX - w / 2, drawY - h / 2, w, h);
      ctx.restore();
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

      // White center
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

      // Rocky polygon outline
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

      // Darker crater marks
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

  destroy(): void {
    this.menuOverlay.destroy();
    this.canvas.remove();
  }
}
