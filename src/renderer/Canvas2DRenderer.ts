import type { GameState, GameRenderer, EpisodeEngine } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';
import { MenuOverlay } from './MenuOverlay';
import { drawStars } from './drawing/drawStars';
import { drawHUD } from './HUD';
import { ParticleSystem } from './effects/ParticleSystem';
import { WindParticleOverlay } from './effects/WindParticleOverlay';
import { TankTrailEffect } from './effects/TankTrailEffect';
import { LEVEL_BACKGROUNDS } from '../levels/backgrounds';

/**
 * Canvas 2D renderer implementing the GameRenderer interface.
 *
 * Handles shared rendering concerns (clear, backgrounds, particles, HUD, menu overlay)
 * and delegates gameplay layer drawing to the active EpisodeEngine.
 */
export class Canvas2DRenderer implements GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private menuOverlay: MenuOverlay;
  readonly particleSystem: ParticleSystem;
  readonly windOverlay: WindParticleOverlay;
  readonly tankTrailEffect: TankTrailEffect;

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

  // Active episode engine for gameplay rendering
  private activeEngine: EpisodeEngine | null = null;

  // Track camera position for wind overlay world-anchoring
  private lastCameraX = 0;
  private lastCameraY = 0;

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
    this.windOverlay = new WindParticleOverlay();
    this.tankTrailEffect = new TankTrailEffect();

    // Create CSS menu overlay on top of the canvas
    this.menuOverlay = new MenuOverlay(container);
  }

  /** Update FPS counters (called by main.ts from GameLoop stats). */
  setFpsCounters(engineFps: number, renderFps: number): void {
    this.engineFps = engineFps;
    this.renderFps = renderFps;
  }

  /** Set the active episode engine for gameplay rendering delegation. */
  setActiveEngine(engine: EpisodeEngine): void {
    this.activeEngine = engine;
    // Wire tank trail effect into Episode 2 engine
    if ('setTankTrailEffect' in engine) {
      (engine as any).setTankTrailEffect(this.tankTrailEffect);
    }
  }

  render(current: GameState, previous: GameState, alpha: number): void {
    const ctx = this.ctx;
    const now = performance.now();
    const renderDt = this.lastRenderTime > 0 ? now - this.lastRenderTime : 16.667;
    this.lastRenderTime = now;

    // Clear explosion tracking on game (re)start
    if (current.gameStatus === 'playing' && this.lastGameStatus !== 'playing') {
      this.particleSystem.clearTracking();
      this.windOverlay.reset();
      this.tankTrailEffect.reset();
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

    // Update wind overlay (freezes when paused, anchored to world via camera delta)
    if (current.currentLevel >= 6 && current.camera) {
      const cameraDx = current.camera.worldX - this.lastCameraX;
      const cameraDy = current.camera.worldY - this.lastCameraY;
      this.windOverlay.update(bgDt, cameraDx, cameraDy);
      this.lastCameraX = current.camera.worldX;
      this.lastCameraY = current.camera.worldY;
    }

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
      if (this.activeEngine) {
        // Episode engines handle their own paused rendering if they have it
        const ep1 = this.activeEngine as any;
        if (typeof ep1.renderPaused === 'function') {
          ep1.renderPaused(ctx, current, previous);
        } else {
          this.activeEngine.render(ctx, current, previous, 1, 0);
        }
      }
      this.particleSystem.draw(ctx);
      drawHUD(ctx, current, this.engineFps, this.renderFps);
      this.menuOverlay.update(current);
      return;
    }

    // Apply screen shake offset
    ctx.save();
    ctx.translate(this.particleSystem.shakeOffsetX, this.particleSystem.shakeOffsetY);

    // Detect deaths and emit particles
    this.detectDeaths(current);

    // Delegate gameplay rendering to the active episode engine
    if (this.activeEngine) {
      this.activeEngine.render(ctx, current, previous, alpha, renderDt);
    }

    // Wind particle overlay (Episode 2 — drawn over clouds, under explosions)
    if (current.currentLevel >= 6) {
      this.windOverlay.draw(ctx);
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

    // Tank shell impacts — consume pendingImpacts queue (survives multi-update frames)
    for (const impact of current.pendingImpacts) {
      const screenX = current.camera
        ? impact.x - current.camera.worldX
        : impact.x;
      const screenY = current.camera
        ? impact.y - current.camera.worldY
        : impact.y;
      if (screenX >= -50 && screenX <= GAME_WIDTH + 50 &&
          screenY >= -50 && screenY <= GAME_HEIGHT + 50) {
        this.particleSystem.emitGroundImpact(screenX, screenY, impact.id, impact.type);
      }
    }
    // Clear queue after processing
    current.pendingImpacts.length = 0;

    // Other projectile impacts (Episode 1 style) — emit localized flash at collision point
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
   */
  private drawBackgrounds(ctx: CanvasRenderingContext2D, level: number, dt: number): void {
    const configs = LEVEL_BACKGROUNDS[level] ?? [];
    if (configs.length === 0) return;

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const img = this.bgImageCache.get(config.url);
      if (!img || !img.complete) continue;

      this.bgScrollOffsets[i] += config.scrollSpeed * dt / 1000;

      const h = img.height * config.scale;
      const w = img.width * config.scale;
      const drawY = -(h / 2) - config.y + this.bgScrollOffsets[i];
      const drawX = config.x;

      if (drawY - h / 2 > GAME_HEIGHT || drawY + h / 2 < 0) continue;

      ctx.save();
      ctx.globalAlpha = config.alpha;
      ctx.drawImage(img, drawX - w / 2, drawY - h / 2, w, h);
      ctx.restore();
    }
  }

  destroy(): void {
    this.menuOverlay.destroy();
    this.canvas.remove();
  }
}
