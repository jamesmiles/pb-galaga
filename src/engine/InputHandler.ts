import type { PlayerInput, PlayerId } from '../types';

export interface MenuInput {
  up: boolean;
  down: boolean;
  enter: boolean;
}

export class InputHandler {
  private keyState: Record<string, boolean> = {};
  private headless: boolean;

  // For headless mode: injected inputs
  private injectedPlayerInputs: Map<PlayerId, PlayerInput> = new Map();
  private injectedMenuInput: MenuInput | null = null;

  constructor(headless = false) {
    this.headless = headless;
    if (!headless && typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => this.onKeyDown(e));
      window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keyState[e.code] = true;
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keyState[e.code] = false;
  }

  /** Get player input state from keyboard (or injected state in headless). */
  getPlayerInput(playerId: PlayerId): PlayerInput {
    if (this.headless) {
      return this.injectedPlayerInputs.get(playerId) ?? {
        left: false, right: false, up: false, down: false, fire: false,
      };
    }

    if (playerId === 'player1') {
      return {
        left: !!this.keyState['ArrowLeft'],
        right: !!this.keyState['ArrowRight'],
        up: !!this.keyState['ArrowUp'],
        down: !!this.keyState['ArrowDown'],
        fire: !!this.keyState['Space'],
      };
    }

    // Player 2: WASD + Q (Sprint 2)
    return {
      left: !!this.keyState['KeyA'],
      right: !!this.keyState['KeyD'],
      up: !!this.keyState['KeyW'],
      down: !!this.keyState['KeyS'],
      fire: !!this.keyState['KeyQ'],
    };
  }

  /** Get menu navigation input. */
  getMenuInput(): MenuInput {
    if (this.headless && this.injectedMenuInput) {
      const input = { ...this.injectedMenuInput };
      this.injectedMenuInput = null; // consume once
      return input;
    }

    const input: MenuInput = {
      up: !!this.keyState['ArrowUp'],
      down: !!this.keyState['ArrowDown'],
      enter: !!this.keyState['Enter'],
    };

    // Clear menu keys after reading to prevent repeat
    if (input.up) this.keyState['ArrowUp'] = false;
    if (input.down) this.keyState['ArrowDown'] = false;
    if (input.enter) this.keyState['Enter'] = false;

    return input;
  }

  /** Inject input for headless testing. */
  injectPlayerInput(playerId: PlayerId, input: PlayerInput): void {
    this.injectedPlayerInputs.set(playerId, input);
  }

  /** Inject menu input for headless testing (consumed once). */
  injectMenuInput(input: MenuInput): void {
    this.injectedMenuInput = input;
  }

  /** Clear all input state. */
  clear(): void {
    this.keyState = {};
    this.injectedPlayerInputs.clear();
    this.injectedMenuInput = null;
  }

  destroy(): void {
    if (!this.headless && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    }
  }
}
