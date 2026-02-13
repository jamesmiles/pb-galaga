import type { GameState, GameStatus } from '../types';
import { GameLoop } from './GameLoop';
import { StateManager } from './StateManager';
import { InputHandler } from './InputHandler';
import { FIXED_TIMESTEP } from './constants';
import { updatePlayer, respawnPlayer } from '../objects/player/code/PlayerShip';
import { updateProjectiles, handlePlayerFiring } from './ProjectileManager';
import { updateEnemies } from './EnemyManager';
import { updateBackground, createBackground } from '../objects/environment/Background';
import { processCollisions } from './CollisionDetector';

export interface GameManagerOptions {
  headless?: boolean;
}

export class GameManager {
  stateManager: StateManager;
  inputHandler: InputHandler;
  gameLoop: GameLoop;
  private headless: boolean;

  constructor(options: GameManagerOptions = {}) {
    this.headless = options.headless ?? false;
    this.stateManager = new StateManager();
    this.inputHandler = new InputHandler(this.headless);
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );
  }

  get state(): GameState {
    return this.stateManager.currentState;
  }

  /** Start the game loop (browser mode). */
  start(): void {
    this.gameLoop.start();
  }

  /** Stop the game loop. */
  stop(): void {
    this.gameLoop.stop();
  }

  /** Advance N fixed steps in headless mode. */
  tickHeadless(steps: number): void {
    this.gameLoop.tickHeadless(steps);
  }

  /** Transition from menu to playing. */
  startGame(): void {
    const state = this.stateManager.currentState;
    if (state.gameStatus !== 'menu') return;

    state.gameStatus = 'playing';
    state.menu = null;

    // Reset player state for new game
    for (const player of state.players) {
      player.isAlive = true;
      player.lives = 3;
      player.score = 0;
      player.health = player.maxHealth;
      player.position = { x: 400, y: 550 };
      player.velocity = { x: 0, y: 0 };
      player.collisionState = 'none';
      player.isInvulnerable = false;
      player.invulnerabilityTimer = 0;
      player.fireCooldown = 0;
    }

    state.enemies = [];
    state.projectiles = [];
    state.powerups = [];
    state.currentLevel = 1;
    state.currentWave = 0;
    state.waveStatus = 'transition';
    state.background = createBackground();
  }

  /** Trigger game over. */
  gameOver(): void {
    const state = this.stateManager.currentState;
    if (state.gameStatus !== 'playing') return;

    state.gameStatus = 'gameover';
    const finalScore = state.players.reduce((sum, p) => sum + p.score, 0);
    state.menu = {
      type: 'gameover',
      selectedOption: 0,
      options: ['Restart', 'Main Menu'],
      data: { finalScore },
    };
  }

  /** Return to main menu. */
  returnToMenu(): void {
    this.stateManager.reset();
  }

  /** Restart game (from game over). */
  restartGame(): void {
    const state = this.stateManager.currentState;
    state.gameStatus = 'menu';
    state.menu = {
      type: 'start',
      selectedOption: 0,
      options: ['Start Game'],
    };
    this.startGame();
  }

  /** Main update called each fixed time step. */
  update(dt: number): void {
    const state = this.stateManager.currentState;
    const dtSeconds = dt / 1000;

    state.currentTime += dt;
    state.deltaTime = dt;

    if (state.gameStatus === 'menu' || state.gameStatus === 'gameover') {
      this.updateMenu();
    } else if (state.gameStatus === 'playing') {
      this.updatePlaying(dtSeconds);
    }

    this.stateManager.swapBuffers();
  }

  private updateMenu(): void {
    const state = this.stateManager.currentState;
    if (!state.menu) return;

    const menuInput = this.inputHandler.getMenuInput();

    if (menuInput.up) {
      state.menu.selectedOption = Math.max(0, state.menu.selectedOption - 1);
    }
    if (menuInput.down) {
      state.menu.selectedOption = Math.min(
        state.menu.options.length - 1,
        state.menu.selectedOption + 1,
      );
    }
    if (menuInput.enter) {
      this.executeMenuOption(state.menu.type, state.menu.options[state.menu.selectedOption]);
    }
  }

  private executeMenuOption(menuType: string, option: string): void {
    if (menuType === 'start' && option === 'Start Game') {
      this.startGame();
    } else if (menuType === 'gameover' && option === 'Restart') {
      this.restartGame();
    } else if (menuType === 'gameover' && option === 'Main Menu') {
      this.returnToMenu();
    }
  }

  private updatePlaying(dtSeconds: number): void {
    const state = this.stateManager.currentState;

    // 1. Process input
    for (const player of state.players) {
      player.input = this.inputHandler.getPlayerInput(player.id);
    }

    // 2. Update players
    for (const player of state.players) {
      if (player.isAlive) {
        updatePlayer(player, player.input, dtSeconds);
        handlePlayerFiring(state, player);
      } else if (player.lives > 0) {
        // Auto-respawn after death
        respawnPlayer(player);
      }
    }

    // 3. Update projectiles
    updateProjectiles(state, dtSeconds);

    // 4. Update enemies
    updateEnemies(state, dtSeconds);

    // 5. Update background
    updateBackground(state.background, dtSeconds);

    // 6. Collision detection
    processCollisions(state);

    // 7. Check game over
    if (this.checkGameOver()) {
      this.gameOver();
    }
  }

  /** Render callback — extended in T-0012. */
  private render(_alpha: number): void {
    // Rendering wired in T-0012
  }

  /** Check if all players are dead. */
  checkGameOver(): boolean {
    const state = this.stateManager.currentState;
    return state.players.every((p) => p.lives <= 0 && !p.isAlive);
  }
}
