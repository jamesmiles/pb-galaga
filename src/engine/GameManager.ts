import type { GameState, GameRenderer, Player } from '../types';
import { GameLoop } from './GameLoop';
import { StateManager, createPlayer } from './StateManager';
import { InputHandler } from './InputHandler';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_INVULNERABILITY_DURATION, PLAYER_FIRE_COOLDOWN } from './constants';

export interface GameManagerOptions {
  renderer?: GameRenderer;
  headless?: boolean;
}

/**
 * Orchestrates the game lifecycle, state transitions, and system updates.
 * Accepts an optional typed GameRenderer — no monkey-patching.
 */
export class GameManager {
  readonly gameLoop: GameLoop;
  readonly stateManager: StateManager;
  readonly inputHandler: InputHandler;
  private renderer: GameRenderer | null;
  private headless: boolean;

  constructor(options: GameManagerOptions = {}) {
    this.headless = options.headless ?? false;
    this.renderer = options.renderer ?? null;
    this.stateManager = new StateManager();
    this.inputHandler = new InputHandler(this.headless);
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );
  }

  start(): void {
    if (this.headless) return;
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }

  /** Run N headless ticks for testing. */
  tickHeadless(steps: number): void {
    this.gameLoop.tickHeadless(steps);
  }

  /** Get current game state (read-only outside of update). */
  getState(): GameState {
    return this.stateManager.currentState;
  }

  /** Get previous game state (for interpolation). */
  getPreviousState(): GameState {
    return this.stateManager.previousState;
  }

  // --- Core Update Loop ---

  private update(dt: number): void {
    // SWAP BEFORE MUTATIONS — this is critical for correct interpolation
    this.stateManager.swapBuffers();

    const state = this.stateManager.currentState;
    const dtSeconds = dt / 1000;

    state.deltaTime = dt;
    state.currentTime += dt;

    switch (state.gameStatus) {
      case 'menu':
        this.updateMenu(state);
        break;
      case 'playing':
        this.updatePlaying(state, dtSeconds);
        break;
      case 'paused':
        this.updatePaused(state);
        break;
      case 'gameover':
        this.updateGameOver(state);
        break;
      case 'levelcomplete':
        break;
    }
  }

  private updateMenu(state: GameState): void {
    const menuInput = this.inputHandler.getMenuInput();
    if (!state.menu) return;

    if (menuInput.down) {
      state.menu = {
        ...state.menu,
        selectedOption: Math.min(state.menu.selectedOption + 1, state.menu.options.length - 1),
      };
    }
    if (menuInput.up) {
      state.menu = {
        ...state.menu,
        selectedOption: Math.max(state.menu.selectedOption - 1, 0),
      };
    }
    if (menuInput.confirm) {
      const selected = state.menu.options[state.menu.selectedOption];
      if (selected === 'Start Game') {
        this.startGame(state);
      }
    }
  }

  private startGame(state: GameState): void {
    state.gameStatus = 'playing';
    state.menu = null;
    state.players = [createPlayer('player1')];
    state.currentLevel = 1;
    state.currentWave = 1;
    state.waveStatus = 'transition';
  }

  private updatePlaying(state: GameState, dtSeconds: number): void {
    // 1. Process input
    for (const player of state.players) {
      if (player.id === 'player1') {
        player.input = this.inputHandler.getPlayerInput();
      }
    }

    // 2. Update players
    for (const player of state.players) {
      if (player.isAlive) {
        this.updatePlayer(player, dtSeconds);
      }
    }

    // 3. Update projectiles (implemented in T-0005)

    // 4. Update enemies (implemented in T-0007)

    // 5. Update background (implemented in T-0011)

    // 6. Update level/waves (implemented in T-0010)

    // 7. Collision detection (implemented in T-0004/T-0006)

    // 8. Check game over
    this.checkGameOver(state);
  }

  private updatePlayer(player: Player, dtSeconds: number): void {
    // Movement
    const speed = PLAYER_SPEED * dtSeconds;
    if (player.input.left) player.velocity.x = -speed;
    else if (player.input.right) player.velocity.x = speed;
    else player.velocity.x = 0;

    if (player.input.up) player.velocity.y = -speed;
    else if (player.input.down) player.velocity.y = speed;
    else player.velocity.y = 0;

    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Boundary clamping
    player.position.x = Math.max(20, Math.min(GAME_WIDTH - 20, player.position.x));
    player.position.y = Math.max(20, Math.min(GAME_HEIGHT - 20, player.position.y));

    player.isThrusting = player.velocity.x !== 0 || player.velocity.y !== 0;

    // Invulnerability timer
    if (player.isInvulnerable) {
      player.invulnerabilityTimer -= dtSeconds * 1000;
      if (player.invulnerabilityTimer <= 0) {
        player.isInvulnerable = false;
        player.invulnerabilityTimer = 0;
      }
    }

    // Fire cooldown
    if (player.fireCooldown > 0) {
      player.fireCooldown -= dtSeconds * 1000;
    }

    // Firing (projectile spawning in T-0005)
    player.isFiring = player.input.fire && player.fireCooldown <= 0;
    if (player.isFiring) {
      player.fireCooldown = PLAYER_FIRE_COOLDOWN;
    }
  }

  private updatePaused(state: GameState): void {
    const menuInput = this.inputHandler.getMenuInput();
    if (menuInput.back) {
      state.gameStatus = 'playing';
      state.menu = null;
    }
  }

  private updateGameOver(state: GameState): void {
    const menuInput = this.inputHandler.getMenuInput();
    if (!state.menu) return;

    if (menuInput.down) {
      state.menu = {
        ...state.menu,
        selectedOption: Math.min(state.menu.selectedOption + 1, state.menu.options.length - 1),
      };
    }
    if (menuInput.up) {
      state.menu = {
        ...state.menu,
        selectedOption: Math.max(state.menu.selectedOption - 1, 0),
      };
    }
    if (menuInput.confirm) {
      const selected = state.menu.options[state.menu.selectedOption];
      if (selected === 'Restart') {
        this.stateManager.reset();
        this.startGame(this.stateManager.currentState);
      } else if (selected === 'Main Menu') {
        this.stateManager.reset();
      }
    }
  }

  private checkGameOver(state: GameState): void {
    const alivePlayers = state.players.filter(p => p.isAlive || p.lives > 0);
    if (state.players.length > 0 && alivePlayers.length === 0) {
      state.gameStatus = 'gameover';
      const finalScore = state.players.reduce((sum, p) => sum + p.score, 0);
      state.menu = {
        type: 'gameover',
        selectedOption: 0,
        options: ['Restart', 'Main Menu'],
        data: { finalScore },
      };
    }
  }

  // --- Render ---

  private render(alpha: number): void {
    if (this.renderer) {
      this.renderer.render(
        this.stateManager.currentState,
        this.stateManager.previousState,
        alpha,
      );
    }
  }

  destroy(): void {
    this.stop();
    this.inputHandler.destroy();
    if (this.renderer) {
      this.renderer.destroy();
    }
  }
}

