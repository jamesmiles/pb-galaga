import type { GameState, GameRenderer } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';
import { MenuOverlay } from './MenuOverlay';

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

  // FPS counters passed from GameLoop
  engineFps = 0;
  renderFps = 0;

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

    // Clear to black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Update CSS menu overlay
    this.menuOverlay.update(current);
  }

  destroy(): void {
    this.menuOverlay.destroy();
    this.canvas.remove();
  }
}
