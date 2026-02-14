import type { GameState, GameRenderer } from '../types';
import { GAME_WIDTH } from './constants';
import { GameLoop } from './GameLoop';
import { StateManager, createPlayer } from './StateManager';
import { InputHandler } from './InputHandler';
import { updatePlayerShip, respawnPlayer } from '../objects/player/code/PlayerShip';
import { spawnPlayerLasers, updateAllProjectiles } from '../objects/projectiles/laser/code/Laser';
import { updateFormation } from './FormationManager';
import { createBackground, updateBackground } from '../objects/environment/Background';
import { detectCollisions } from './CollisionDetector';
import { LevelManager } from './LevelManager';
import { EnemyFiringManager } from './EnemyFiringManager';
import { DiveManager } from './DiveManager';
import { SoundManager } from '../audio/SoundManager';
import { level1 } from '../levels/level1';

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
  private levelManager: LevelManager;
  private enemyFiringManager: EnemyFiringManager;
  private diveManager: DiveManager;

  constructor(options: GameManagerOptions = {}) {
    this.headless = options.headless ?? false;
    this.renderer = options.renderer ?? null;
    this.stateManager = new StateManager();
    this.inputHandler = new InputHandler(this.headless);
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );
    this.levelManager = new LevelManager();
    this.levelManager.registerLevel(level1);
    this.enemyFiringManager = new EnemyFiringManager();
    this.diveManager = new DiveManager();

    // Initialize background
    this.stateManager.currentState.background = createBackground();
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
      SoundManager.play('menuSelect');
      const selected = state.menu.options[state.menu.selectedOption];
      if (selected === '1 Player') {
        state.gameMode = 'single';
        this.startGame(state);
      } else if (selected === '2 Players') {
        state.gameMode = 'co-op';
        this.startGame(state);
      }
    }
  }

  private startGame(state: GameState): void {
    state.gameStatus = 'playing';
    state.menu = null;
    state.projectiles = [];

    if (state.gameMode === 'co-op') {
      const p1 = createPlayer('player1');
      p1.position.x = GAME_WIDTH * 0.33;
      const p2 = createPlayer('player2');
      p2.position.x = GAME_WIDTH * 0.66;
      state.players = [p1, p2];
    } else {
      state.players = [createPlayer('player1')];
    }

    this.enemyFiringManager.reset();
    this.diveManager.reset();
    this.levelManager.startLevel(state, 1);
  }

  private updatePlaying(state: GameState, dtSeconds: number): void {
    // Check mute toggle
    if (this.inputHandler.getMuteToggle()) {
      SoundManager.toggleMute();
    }

    // 1. Process input (skip players in death sequence)
    for (const player of state.players) {
      if (player.deathSequence?.active) continue;
      if (player.id === 'player1') {
        player.input = this.inputHandler.getPlayerInput();
      } else if (player.id === 'player2') {
        player.input = this.inputHandler.getPlayer2Input();
      }
    }

    // 2. Update players (skip players in death sequence)
    for (const player of state.players) {
      if (player.deathSequence?.active) continue;
      updatePlayerShip(player, dtSeconds);
    }

    // 3. Spawn & update projectiles
    const projCountBefore = state.projectiles.length;
    spawnPlayerLasers(state);
    const playerProjAdded = state.projectiles.length - projCountBefore;
    if (playerProjAdded > 0) SoundManager.play('playerFire');
    updateAllProjectiles(state, dtSeconds);

    // 4. Update enemy formation
    if (state.formation && state.enemies.length > 0) {
      updateFormation(state, dtSeconds);
    }

    // 5. Dive attacks
    this.diveManager.update(state, dtSeconds);

    // 6. Enemy firing
    const projCountBeforeEnemy = state.projectiles.length;
    this.enemyFiringManager.update(state, dtSeconds);
    if (state.projectiles.length > projCountBeforeEnemy) SoundManager.play('enemyFire');

    // 7. Update background
    if (state.background) {
      updateBackground(state.background, dtSeconds);
    }

    // 8. Level/wave progression
    this.levelManager.update(state);

    // 9. Collision detection — track deaths for sound
    const aliveEnemiesBefore = state.enemies.filter(e => e.isAlive).length;
    const alivePlayersBefore = state.players.filter(p => p.isAlive).length;
    detectCollisions(state);
    const aliveEnemiesAfter = state.enemies.filter(e => e.isAlive).length;
    const alivePlayersAfter = state.players.filter(p => p.isAlive).length;
    if (aliveEnemiesAfter < aliveEnemiesBefore) SoundManager.play('explosion');
    if (alivePlayersAfter < alivePlayersBefore) SoundManager.play('playerDeath');

    // 10. Handle death sequences and delayed respawn
    for (const player of state.players) {
      if (player.deathSequence?.active) {
        const elapsed = state.currentTime - player.deathSequence.startTime;
        if (elapsed >= player.deathSequence.duration) {
          player.deathSequence.active = false;
          if (player.lives > 0) {
            respawnPlayer(player);
          }
        }
      }
    }

    // 11. Check game over (only after all death sequences complete)
    this.checkGameOver(state);
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
      SoundManager.play('menuSelect');
      const selected = state.menu.options[state.menu.selectedOption];
      if (selected === 'Restart') {
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        this.startGame(this.stateManager.currentState);
      } else if (selected === 'Main Menu') {
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
      }
    }
  }

  private checkGameOver(state: GameState): void {
    // Don't trigger gameover while any death sequence is still active
    const anyDeathSequenceActive = state.players.some(p => p.deathSequence?.active);
    if (anyDeathSequenceActive) return;

    const alivePlayers = state.players.filter(p => p.isAlive || p.lives > 0);
    if (state.players.length > 0 && alivePlayers.length === 0) {
      state.gameStatus = 'gameover';
      const p1 = state.players.find(p => p.id === 'player1');
      const p2 = state.players.find(p => p.id === 'player2');
      const finalScore = p1?.score ?? 0;
      state.menu = {
        type: 'gameover',
        selectedOption: 0,
        options: ['Restart', 'Main Menu'],
        data: {
          finalScore,
          ...(p2 ? { p2Score: p2.score } : {}),
        },
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

