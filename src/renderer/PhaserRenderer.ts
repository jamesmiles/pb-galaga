import Phaser from 'phaser';
import type { GameState } from '../types';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';

export class PhaserRenderer {
  private game: Phaser.Game | null = null;
  private gameScene: GameScene | null = null;
  private menuScene: MenuScene | null = null;
  private headless: boolean;
  private lastStatus: string = '';

  constructor(containerId: string, headless = false) {
    this.headless = headless;

    if (headless) return;

    const gameScene = new GameScene();
    const menuScene = new MenuScene();

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerId,
      backgroundColor: '#000011',
      scene: [menuScene, gameScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      // Disable Phaser's built-in loop — we manage our own
      callbacks: {
        postBoot: (game) => {
          this.menuScene = game.scene.getScene('MenuScene') as MenuScene;
          this.gameScene = game.scene.getScene('GameScene') as GameScene;
          // Start with menu scene active
          game.scene.start('MenuScene');
        },
      },
    });
  }

  /** Render the current game state with interpolation. */
  render(currentState: GameState, previousState: GameState, alpha: number): void {
    if (this.headless) return;

    const status = currentState.gameStatus;

    // Handle scene transitions
    if (status !== this.lastStatus) {
      this.handleSceneTransition(status);
      this.lastStatus = status;
    }

    if (status === 'menu' || status === 'gameover') {
      this.menuScene?.setMenuState(currentState.menu);
    } else if (status === 'playing') {
      this.gameScene?.setRenderData(currentState, previousState, alpha);
    }
  }

  private handleSceneTransition(newStatus: string): void {
    if (!this.game) return;

    if (newStatus === 'playing') {
      this.game.scene.stop('MenuScene');
      this.game.scene.start('GameScene');
    } else if (newStatus === 'menu' || newStatus === 'gameover') {
      this.game.scene.stop('GameScene');
      this.game.scene.start('MenuScene');
    }
  }

  destroy(): void {
    this.game?.destroy(true);
    this.game = null;
  }
}
