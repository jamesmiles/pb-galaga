import Phaser from 'phaser';
import type { MenuState } from '../../types';
import { StartMenu } from '../../engine/menus/StartMenu';
import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private controlsTexts: Phaser.GameObjects.Text[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  private currentMenuState: MenuState | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Title
    this.titleText = this.add.text(GAME_WIDTH / 2, 100, 'PB-GALAGA', {
      fontSize: '48px',
      color: '#ffff33',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.titleText.setOrigin(0.5);

    // Game Over text (hidden by default)
    this.gameOverText = this.add.text(GAME_WIDTH / 2, 80, 'GAME OVER', {
      fontSize: '40px',
      color: '#ff3333',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // Score text (hidden by default)
    this.scoreText = this.add.text(GAME_WIDTH / 2, 140, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setVisible(false);

    // Controls info
    const controlsY = 300;
    for (let i = 0; i < StartMenu.CONTROLS_INFO.length; i++) {
      const text = this.add.text(GAME_WIDTH / 2, controlsY + i * 30, StartMenu.CONTROLS_INFO[i], {
        fontSize: '16px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      });
      text.setOrigin(0.5);
      this.controlsTexts.push(text);
    }
  }

  /** Update menu display from game state. */
  setMenuState(menuState: MenuState | null): void {
    this.currentMenuState = menuState;
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    // Clear old option texts
    for (const text of this.optionTexts) {
      text.destroy();
    }
    this.optionTexts = [];

    if (!this.currentMenuState) return;

    const isGameOver = this.currentMenuState.type === 'gameover';

    // Show/hide title vs game over
    this.titleText.setVisible(!isGameOver);
    this.gameOverText.setVisible(isGameOver);

    // Show score on game over
    if (isGameOver && this.currentMenuState.data?.finalScore !== undefined) {
      this.scoreText.setText(`Final Score: ${this.currentMenuState.data.finalScore}`);
      this.scoreText.setVisible(true);
    } else {
      this.scoreText.setVisible(false);
    }

    // Show/hide controls info (only on start menu)
    for (const text of this.controlsTexts) {
      text.setVisible(!isGameOver);
    }

    // Render options
    const optionsY = isGameOver ? 250 : 450;
    for (let i = 0; i < this.currentMenuState.options.length; i++) {
      const isSelected = i === this.currentMenuState.selectedOption;
      const prefix = isSelected ? '> ' : '  ';
      const color = isSelected ? '#ffff33' : '#ffffff';

      const text = this.add.text(GAME_WIDTH / 2, optionsY + i * 40, `${prefix}${this.currentMenuState.options[i]}`, {
        fontSize: '24px',
        color,
        fontFamily: 'monospace',
      });
      text.setOrigin(0.5);
      this.optionTexts.push(text);
    }
  }

  shutdown(): void {
    for (const text of this.optionTexts) text.destroy();
    for (const text of this.controlsTexts) text.destroy();
    this.optionTexts = [];
    this.controlsTexts = [];
  }
}
