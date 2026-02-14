import { GameManager } from '../engine/GameManager';

/**
 * Base class for object test harnesses.
 * Provides a headless GameManager and UI controls for interactive testing.
 */
export class HarnessBase {
  protected gm: GameManager;
  protected container: HTMLElement;
  protected logEl: HTMLElement;

  constructor(containerId: string) {
    this.gm = new GameManager({ headless: true });
    // Start the game
    this.gm.inputHandler.injectMenuInput({ confirm: true });
    this.gm.tickHeadless(1);

    this.container = document.getElementById(containerId) || document.body;

    // Create log element
    this.logEl = document.createElement('pre');
    this.logEl.id = 'harness-log';
    this.logEl.style.cssText = 'color: #0f0; background: #111; padding: 10px; font-size: 12px; max-height: 300px; overflow-y: auto; margin-top: 10px;';
    this.container.appendChild(this.logEl);
  }

  protected log(msg: string): void {
    this.logEl.textContent += msg + '\n';
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  protected addButton(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'margin: 4px; padding: 6px 12px; font-family: monospace; cursor: pointer;';
    btn.addEventListener('click', onClick);
    this.container.insertBefore(btn, this.logEl);
    return btn;
  }

  protected addLabel(text: string): HTMLElement {
    const label = document.createElement('div');
    label.textContent = text;
    label.style.cssText = 'color: #fff; font-family: monospace; margin: 8px 4px 2px;';
    this.container.insertBefore(label, this.logEl);
    return label;
  }

  tick(steps = 1): void {
    this.gm.tickHeadless(steps);
  }
}
