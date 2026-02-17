import type { PlayerInput, MenuInput } from '../types';

const GAME_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Space', 'Enter', 'Escape',
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ',
  'KeyM', 'NumLock', 'CapsLock',
]);

/**
 * Keyboard input handler with pollable interface.
 *
 * Uses class property arrow functions for stable listener references
 * so removeEventListener works correctly.
 */
export class InputHandler {
  private keyState: Record<string, boolean> = {};
  private headless: boolean;
  private p1AutoFire = false;
  private p2AutoFire = false;

  // Bound listeners (arrow functions for stable references)
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
    }
    // Auto-fire toggles — flip on keydown, don't store in keyState
    if (e.code === 'NumLock') {
      this.p1AutoFire = !this.p1AutoFire;
      return;
    }
    if (e.code === 'CapsLock') {
      this.p2AutoFire = !this.p2AutoFire;
      return;
    }
    this.keyState[e.code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
    }
    // Don't track toggle keys in keyState
    if (e.code === 'NumLock' || e.code === 'CapsLock') return;
    this.keyState[e.code] = false;
  };

  constructor(headless: boolean = false) {
    this.headless = headless;
    if (!headless && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  /** Poll current input state for player 1 (arrow keys + space). */
  getPlayerInput(): PlayerInput {
    return {
      left: !!this.keyState['ArrowLeft'],
      right: !!this.keyState['ArrowRight'],
      up: !!this.keyState['ArrowUp'],
      down: !!this.keyState['ArrowDown'],
      fire: this.p1AutoFire || !!this.keyState['Space'],
    };
  }

  /** Poll current input state for player 2 (WASD + Q). */
  getPlayer2Input(): PlayerInput {
    return {
      left: !!this.keyState['KeyA'],
      right: !!this.keyState['KeyD'],
      up: !!this.keyState['KeyW'],
      down: !!this.keyState['KeyS'],
      fire: this.p2AutoFire || !!this.keyState['KeyQ'],
    };
  }

  /** Get auto-fire toggle state for HUD display. */
  getAutoFireState(): { p1: boolean; p2: boolean } {
    return { p1: this.p1AutoFire, p2: this.p2AutoFire };
  }

  /** Inject auto-fire state programmatically (for headless testing). */
  injectAutoFire(player: 'p1' | 'p2', enabled: boolean): void {
    if (player === 'p1') this.p1AutoFire = enabled;
    else this.p2AutoFire = enabled;
  }

  /** Poll menu input (consumed on read to prevent repeat). */
  getMenuInput(): MenuInput {
    const input: MenuInput = {
      up: !!this.keyState['ArrowUp'],
      down: !!this.keyState['ArrowDown'],
      confirm: !!this.keyState['Enter'] || !!this.keyState['Space'],
      back: !!this.keyState['Escape'],
    };
    // Consume menu keys on read
    if (input.up) this.keyState['ArrowUp'] = false;
    if (input.down) this.keyState['ArrowDown'] = false;
    if (input.confirm) {
      this.keyState['Enter'] = false;
      this.keyState['Space'] = false;
    }
    if (input.back) this.keyState['Escape'] = false;
    return input;
  }

  /** Poll pause toggle — only checks Escape (consumed on read). */
  getPauseToggle(): boolean {
    const pressed = !!this.keyState['Escape'];
    if (pressed) this.keyState['Escape'] = false;
    return pressed;
  }

  /** Poll mute toggle (consumed on read to prevent repeat). */
  getMuteToggle(): boolean {
    const pressed = !!this.keyState['KeyM'];
    if (pressed) this.keyState['KeyM'] = false;
    return pressed;
  }

  /** Inject player input programmatically (for headless testing). */
  injectPlayerInput(input: Partial<PlayerInput>): void {
    if (input.left !== undefined) this.keyState['ArrowLeft'] = input.left;
    if (input.right !== undefined) this.keyState['ArrowRight'] = input.right;
    if (input.up !== undefined) this.keyState['ArrowUp'] = input.up;
    if (input.down !== undefined) this.keyState['ArrowDown'] = input.down;
    if (input.fire !== undefined) this.keyState['Space'] = input.fire;
  }

  /** Inject menu input programmatically (for headless testing). */
  injectMenuInput(input: Partial<MenuInput>): void {
    if (input.up) this.keyState['ArrowUp'] = true;
    if (input.down) this.keyState['ArrowDown'] = true;
    if (input.confirm) this.keyState['Enter'] = true;
    if (input.back) this.keyState['Escape'] = true;
  }

  /** Clear all transient key state (preserves auto-fire toggles). */
  clearAll(): void {
    this.keyState = {};
  }

  destroy(): void {
    if (!this.headless && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }
}
