import type { GameState } from '../types';
import { GAME_VERSION } from '../engine/constants';

const MENU_STYLES = `
  .menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.85);
    font-family: 'Courier New', monospace;
    color: #fff;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
  }

  .menu-overlay.visible {
    opacity: 1;
  }

  .menu-title {
    font-size: 52px;
    font-weight: bold;
    color: #ffff00;
    margin-bottom: 12px;
  }

  .menu-title.gameover {
    color: #ff4444;
  }

  .menu-title.levelcomplete {
    color: #44ff44;
  }

  .menu-subtitle {
    font-size: 16px;
    color: #88aacc;
    margin-bottom: 30px;
  }

  .menu-controls {
    font-size: 14px;
    color: #888;
    margin-bottom: 8px;
  }

  .menu-controls-group {
    margin-bottom: 24px;
  }

  .menu-score {
    font-size: 24px;
    color: #fff;
    margin-bottom: 8px;
  }

  .menu-p2score {
    font-size: 18px;
    color: #4488ff;
    margin-bottom: 16px;
  }

  .menu-options {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .menu-option {
    font-size: 22px;
    color: #666;
    padding: 6px 0;
    transition: color 0.15s;
  }

  .menu-option.selected {
    color: #ffff00;
  }

  .menu-option.selected::before {
    content: '> ';
  }

  .menu-version {
    position: absolute;
    bottom: 12px;
    font-size: 12px;
    color: #444;
  }
`;

/**
 * HTML/CSS menu overlay rendered on top of the Canvas 2D game.
 * Purely visual — game logic and input still handled by GameManager/InputHandler.
 */
export class MenuOverlay {
  private container: HTMLElement;
  private overlay: HTMLDivElement;
  private styleEl: HTMLStyleElement;
  private lastMenuType: string | null = null;
  private lastSelectedOption = -1;
  private lastMenuDataHash = '';
  private version: string;

  constructor(parentElement: HTMLElement, version: string = GAME_VERSION) {
    this.container = parentElement;
    this.version = version;

    // Inject styles
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = MENU_STYLES;
    document.head.appendChild(this.styleEl);

    // Create overlay div
    this.overlay = document.createElement('div');
    this.overlay.className = 'menu-overlay';
    this.container.appendChild(this.overlay);
  }

  /** Update the overlay based on current game state. Called each render frame. */
  update(state: GameState): void {
    const menu = state.menu;
    const showMenu = state.gameStatus === 'menu' || state.gameStatus === 'gameover' || state.gameStatus === 'levelcomplete';

    if (!showMenu || !menu) {
      this.hide();
      return;
    }

    // Check if we need to rebuild the menu content
    const dataHash = JSON.stringify(menu.data || {});
    if (menu.type !== this.lastMenuType || dataHash !== this.lastMenuDataHash) {
      this.buildMenu(menu.type, menu.options, menu.data);
      this.lastMenuType = menu.type;
      this.lastMenuDataHash = dataHash;
    }

    // Update selected option highlighting
    if (menu.selectedOption !== this.lastSelectedOption) {
      this.updateSelection(menu.selectedOption);
      this.lastSelectedOption = menu.selectedOption;
    }

    this.show();
  }

  private buildMenu(type: string, options: string[], data?: Record<string, unknown>): void {
    this.overlay.innerHTML = '';

    if (type === 'start') {
      this.overlay.innerHTML = `
        <div class="menu-title">PB-GALAGA</div>
        <div class="menu-subtitle">A Space Shooter</div>
        <div class="menu-controls-group">
          <div class="menu-controls">Arrow Keys: Move Ship</div>
          <div class="menu-controls">Spacebar: Fire Laser</div>
        </div>
        ${this.buildOptions(options)}
        <div class="menu-version">v${this.version}</div>
      `;
    } else if (type === 'gameover') {
      let scoreHtml = '';
      if (data?.finalScore !== undefined) {
        scoreHtml += `<div class="menu-score">Final Score: ${data.finalScore}</div>`;
      }
      if (data?.p2Score !== undefined) {
        scoreHtml += `<div class="menu-p2score">P2 Score: ${data.p2Score}</div>`;
      }
      this.overlay.innerHTML = `
        <div class="menu-title gameover">GAME OVER</div>
        ${scoreHtml}
        ${this.buildOptions(options)}
      `;
    } else if (type === 'levelcomplete') {
      let scoreHtml = '';
      if (data?.finalScore !== undefined) {
        scoreHtml += `<div class="menu-score">Total Score: ${data.finalScore}</div>`;
      }
      this.overlay.innerHTML = `
        <div class="menu-title levelcomplete">LEVEL COMPLETE!</div>
        ${scoreHtml}
        ${this.buildOptions(options)}
      `;
    }
  }

  private buildOptions(options: string[]): string {
    const items = options.map((opt, i) =>
      `<li class="menu-option" data-index="${i}">${opt}</li>`
    ).join('');
    return `<ul class="menu-options">${items}</ul>`;
  }

  private updateSelection(index: number): void {
    const items = this.overlay.querySelectorAll('.menu-option');
    items.forEach((el, i) => {
      el.classList.toggle('selected', i === index);
    });
  }

  private show(): void {
    this.overlay.classList.add('visible');
  }

  private hide(): void {
    if (this.overlay.classList.contains('visible')) {
      this.overlay.classList.remove('visible');
      this.lastMenuType = null;
      this.lastSelectedOption = -1;
      this.lastMenuDataHash = '';
    }
  }

  destroy(): void {
    this.overlay.remove();
    this.styleEl.remove();
  }
}
