import Phaser from 'phaser';
import type { GameState, GameRenderer } from '../types';
import { GameScene } from './scenes/GameScene';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';

/**
 * Phaser-based renderer implementing the typed GameRenderer interface.
 *
 * - Phaser's internal game loop is STOPPED after boot
 * - Rendering is driven entirely by our GameLoop's render callback
 * - No arcade physics enabled
 */
export class PhaserRenderer implements GameRenderer {
  private game: Phaser.Game;
  private gameScene: GameScene | null = null;
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
      // Let Phaser run its own render loop — we just update scene state
      // from our GameLoop's render callback
      // Disable Phaser's input — we handle our own
      input: {
        keyboard: false,
        mouse: false,
        touch: false,
        gamepad: false,
      },
      // Don't let Phaser mess with focus/visibility
      banner: false,
    });

    // Wait for scene to be ready
    this.game.events.on('ready', () => {
      this.gameScene = this.game.scene.getScene('GameScene') as GameScene;
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

    // Update scene state — Phaser's own loop handles the actual canvas draw
    this.gameScene.renderState(current, previous, alpha, this.engineFps, this.renderFps);
  }

  destroy(): void {
    this.game.destroy(true);
  }
}
