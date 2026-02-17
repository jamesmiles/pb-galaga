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

  .menu-title.gamecomplete {
    color: #ffdd00;
    text-shadow: 0 0 12px #ffdd00, 0 0 30px #ff8800;
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
    color: #44ff44;
  }

  .intro-level-label {
    font-size: 18px;
    color: #888;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 4px;
  }

  .intro-typing {
    font-size: 28px;
    color: #00ffff;
    text-shadow: 0 0 8px #00ffff, 0 0 20px #006688;
    min-height: 40px;
  }

  .intro-cursor {
    animation: blink 0.6s step-end infinite;
    color: #00ffff;
  }

  @keyframes blink {
    50% { opacity: 0; }
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
    const showMenu = state.gameStatus === 'menu' || state.gameStatus === 'paused' || state.gameStatus === 'gameover' || state.gameStatus === 'levelcomplete' || state.gameStatus === 'levelintro' || state.gameStatus === 'gamecomplete' || state.gameStatus === 'levelstats';

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
      this.lastSelectedOption = -1; // Force selection update after menu rebuild
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
          <div class="menu-controls" style="color:#aaa;margin-bottom:4px">— P1 CONTROLS —</div>
          <div class="menu-controls">Arrows: Move  |  Space: Fire  |  NumLock: Auto-fire</div>
          <div class="menu-controls" style="color:#4488ff;margin-top:8px;margin-bottom:4px">— P2 CONTROLS —</div>
          <div class="menu-controls">WASD: Move  |  Q: Fire  |  CapsLock: Auto-fire</div>
          <div class="menu-controls" style="margin-top:8px">ESC: Pause  |  M: Mute  |  Enter: Select</div>
        </div>
        ${this.buildOptions(options)}
        <div class="menu-version">v${this.version}</div>
      `;
    } else if (type === 'pause') {
      this.overlay.innerHTML = `
        <div class="menu-title">PAUSED</div>
        <div class="menu-controls-group">
          <div class="menu-controls">Press ESC to resume</div>
        </div>
        ${this.buildOptions(options)}
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
    } else if (type === 'levelintro') {
      const level = data?.level ?? 1;
      const text = (data?.introText as string) ?? '';
      const chars = (data?.introChars as number) ?? 0;
      const revealed = text.slice(0, chars).replace(/\n/g, '<br>');
      const done = chars >= text.length;
      this.overlay.innerHTML = `
        <div class="intro-level-label">Level ${level}</div>
        <div class="intro-typing">${revealed}${done ? '' : '<span class="intro-cursor">_</span>'}</div>
      `;
    } else if (type === 'levelselect') {
      const coopLabel = data?.testCoop ? ' (CO-OP)' : '';
      this.overlay.innerHTML = `
        <div class="menu-title">SELECT LEVEL${coopLabel}</div>
        <div class="menu-controls-group">
          <div class="menu-controls">Press ESC to go back</div>
        </div>
        ${this.buildOptions(options)}
        <div class="menu-version">v${this.version}</div>
      `;
    } else if (type === 'levelcomplete') {
      let scoreHtml = '';
      if (data?.finalScore !== undefined) {
        scoreHtml += `<div class="menu-score">Total Score: ${data.finalScore}</div>`;
      }
      const levelLabel = data?.level ? `LEVEL ${data.level} COMPLETE!` : 'LEVEL COMPLETE!';
      this.overlay.innerHTML = `
        <div class="menu-title levelcomplete">${levelLabel}</div>
        ${scoreHtml}
      `;
    } else if (type === 'difficulty') {
      this.overlay.innerHTML = `
        <div class="menu-title">SELECT DIFFICULTY</div>
        <div class="menu-controls-group">
          <div class="menu-controls">Press ESC to go back</div>
        </div>
        ${this.buildOptions(options)}
      `;
    } else if (type === 'levelstats') {
      const level = data?.level ?? 1;
      let statsHtml = '';
      const p1Stats = data?.p1LevelStats as { kills: number; deaths: number; powerupsCollected: number; respawns: number } | undefined;
      const p2Stats = data?.p2LevelStats as { kills: number; deaths: number; powerupsCollected: number; respawns: number } | undefined;
      if (p1Stats && p2Stats) {
        // Co-op: side by side
        statsHtml = `
          <div style="display:flex;gap:60px;margin-top:16px;font-size:16px">
            <div style="text-align:center">
              <div style="color:#ff4444;margin-bottom:8px">— P1 —</div>
              <div style="color:#ccc">Kills: ${p1Stats.kills}</div>
              <div style="color:#ccc">Deaths: ${p1Stats.deaths}</div>
              <div style="color:#ccc">Pickups: ${p1Stats.powerupsCollected}</div>
              <div style="color:#ccc">Respawns: ${p1Stats.respawns}</div>
            </div>
            <div style="text-align:center">
              <div style="color:#4488ff;margin-bottom:8px">— P2 —</div>
              <div style="color:#ccc">Kills: ${p2Stats.kills}</div>
              <div style="color:#ccc">Deaths: ${p2Stats.deaths}</div>
              <div style="color:#ccc">Pickups: ${p2Stats.powerupsCollected}</div>
              <div style="color:#ccc">Respawns: ${p2Stats.respawns}</div>
            </div>
          </div>`;
      } else if (p1Stats) {
        statsHtml = `
          <div style="margin-top:16px;font-size:16px;text-align:center">
            <div style="color:#ccc">Kills: ${p1Stats.kills}</div>
            <div style="color:#ccc">Deaths: ${p1Stats.deaths}</div>
            <div style="color:#ccc">Pickups: ${p1Stats.powerupsCollected}</div>
            <div style="color:#ccc">Respawns: ${p1Stats.respawns}</div>
          </div>`;
      }
      let scoreHtml = '';
      if (data?.finalScore !== undefined) {
        scoreHtml = `<div class="menu-score">Score: ${data.finalScore}</div>`;
      }
      this.overlay.innerHTML = `
        <div class="menu-title levelcomplete">LEVEL ${level} STATS</div>
        ${scoreHtml}
        ${statsHtml}
        <div class="menu-controls" style="margin-top:24px">Press ENTER to continue</div>
      `;
    } else if (type === 'gamecomplete') {
      const text = (data?.introText as string) ?? '';
      const chars = (data?.introChars as number) ?? 0;
      const revealed = text.slice(0, chars).replace(/\n/g, '<br>');
      const done = chars >= text.length;
      let scoreHtml = '';
      if (data?.finalScore !== undefined) {
        scoreHtml += `<div class="menu-score">Final Score: ${data.finalScore}</div>`;
      }
      // Game stats
      let gameStatsHtml = '';
      const p1GameStats = data?.p1GameStats as { kills: number; deaths: number; powerupsCollected: number; respawns: number } | undefined;
      const p2GameStats = data?.p2GameStats as { kills: number; deaths: number; powerupsCollected: number; respawns: number } | undefined;
      if (done && p1GameStats) {
        if (p2GameStats) {
          gameStatsHtml = `
            <div style="display:flex;gap:60px;margin-top:16px;font-size:14px">
              <div style="text-align:center">
                <div style="color:#ff4444;margin-bottom:4px">— P1 —</div>
                <div style="color:#ccc">Kills: ${p1GameStats.kills} | Deaths: ${p1GameStats.deaths}</div>
                <div style="color:#ccc">Pickups: ${p1GameStats.powerupsCollected} | Respawns: ${p1GameStats.respawns}</div>
              </div>
              <div style="text-align:center">
                <div style="color:#4488ff;margin-bottom:4px">— P2 —</div>
                <div style="color:#ccc">Kills: ${p2GameStats.kills} | Deaths: ${p2GameStats.deaths}</div>
                <div style="color:#ccc">Pickups: ${p2GameStats.powerupsCollected} | Respawns: ${p2GameStats.respawns}</div>
              </div>
            </div>`;
        } else {
          gameStatsHtml = `
            <div style="margin-top:16px;font-size:14px;text-align:center">
              <div style="color:#ccc">Kills: ${p1GameStats.kills} | Deaths: ${p1GameStats.deaths} | Pickups: ${p1GameStats.powerupsCollected} | Respawns: ${p1GameStats.respawns}</div>
            </div>`;
        }
      }
      this.overlay.innerHTML = `
        <div class="menu-title gamecomplete">MISSION COMPLETE</div>
        ${scoreHtml}
        <div class="intro-typing">${revealed}${done ? '' : '<span class="intro-cursor">_</span>'}</div>
        ${gameStatsHtml}
        ${done ? this.buildOptions(options) : ''}
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
