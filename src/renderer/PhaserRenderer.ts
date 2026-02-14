import Phaser from 'phaser';
import type { GameState, GameRenderer } from '../types';
import { GameScene } from './scenes/GameScene';
import { MenuOverlay } from './MenuOverlay';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';

/**
 * Phaser-based renderer implementing the typed GameRenderer interface.
 *
 * - Phaser's internal rAF loop is STOPPED after boot
 * - Rendering is driven entirely by our GameLoop's render callback
 *   via game.step() which flushes scene updates to the canvas
 * - No arcade physics enabled
 */
export class PhaserRenderer implements GameRenderer {
  private game: Phaser.Game;
  private gameScene: GameScene | null = null;
  private menuOverlay: MenuOverlay | null = null;
  private ready = false;

  // FPS counters passed from GameLoop
  private engineFps = 0;
  private renderFps = 0;

  constructor(containerId: string) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerId,
      backgroundColor: '#000000',
      // NO physics — all physics handled by our engine
      scene: [GameScene],
      // Pixel art rendering
      render: {
        pixelArt: true,
        antialias: false,
      },
      // Disable Phaser's built-in rAF loop — we drive rendering
      callbacks: {
        postBoot: (game) => {
          game.loop.stop();
        },
      },
      // Disable Phaser's input — we handle our own
      input: {
        keyboard: false,
        mouse: false,
        touch: false,
        gamepad: false,
      },
      banner: false,
    });

    // Wait for scene to be ready
    this.game.events.on('ready', () => {
      this.gameScene = this.game.scene.getScene('GameScene') as GameScene;
      // Create CSS menu overlay on top of the Phaser canvas
      const parent = document.getElementById(containerId);
      if (parent) {
        this.menuOverlay = new MenuOverlay(parent);
      }
      this.ready = true;
    });
  }

  /** Update FPS counters (called by main.ts from GameLoop stats). */
  setFpsCounters(engineFps: number, renderFps: number): void {
    this.engineFps = engineFps;
    this.renderFps = renderFps;
  }

  render(current: GameState, previous: GameState, alpha: number): void {
    if (!this.ready || !this.gameScene) return;

    // Update scene state from game state
    this.gameScene.renderState(current, previous, alpha, this.engineFps, this.renderFps);

    // Update CSS menu overlay
    if (this.menuOverlay) {
      this.menuOverlay.update(current);
    }

    // Flush to canvas — game.step() runs scene update + Phaser renderer
    // without Phaser's own rAF loop (which we stopped)
    const now = performance.now();
    (this.game as any).step(now, 16.667);
  }

  destroy(): void {
    if (this.menuOverlay) {
      this.menuOverlay.destroy();
    }
    this.game.destroy(true);
  }
}
