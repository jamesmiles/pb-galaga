import type { GameState, GameRenderer } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';
import { MenuOverlay } from './MenuOverlay';
import { drawStars } from './drawing/drawStars';
import { drawPlayers } from './drawing/drawPlayer';
import { drawEnemies } from './drawing/drawEnemies';
import { drawProjectiles } from './drawing/drawProjectiles';
import { drawHUD } from './HUD';
import { ParticleSystem } from './effects/ParticleSystem';

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

    // Update particles (runs regardless of game status for lingering effects)
    this.particleSystem.update(renderDt);

    if (current.gameStatus === 'menu' || current.gameStatus === 'gameover' || current.gameStatus === 'levelcomplete') {
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
    drawEnemies(ctx, current.enemies, prevEnemies, alpha);
    drawProjectiles(ctx, current.projectiles, prevProjectiles, alpha);
    drawPlayers(ctx, current.players, prevPlayers, alpha, current.currentTime);
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

  destroy(): void {
    this.menuOverlay.destroy();
    this.canvas.remove();
  }
}
