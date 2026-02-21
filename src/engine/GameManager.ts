import type { GameState, GameRenderer, EpisodeEngine } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_INVULNERABILITY_DURATION, LEVEL_STATS_MIN_INPUT_DELAY, LEVEL_STATS_TIMEOUT } from './constants';
import { GameLoop } from './GameLoop';
import { StateManager, createPlayer, createTankPlayer, resetLevelStats } from './StateManager';
import { InputHandler } from './InputHandler';
import { respawnPlayer } from '../objects/player/code/PlayerShip';
import { createBackground, updateBackground } from '../objects/environment/Background';
import { SoundManager } from '../audio/SoundManager';
import { MusicManager } from '../audio/MusicManager';
import { Episode1Engine } from './Episode1Engine';
import { Episode2Engine } from './Episode2Engine';

/** Intro text per level number. */
const LEVEL_INTRO_TEXT: Record<number, string> = {
  1: '2029.07.04 // 03:17 UTC\nfirst contact confirmed. space force scrambled to defend earth.',
  2: '// 07:45 UTC\nthe swarm has reached orbit. space force activates planetary defence grid.',
  3: '// 12:08 UTC\nenemy stronghold detected on the far side of the moon. space force moves to intercept.',
  4: '// 18:32 UTC\nhostile signatures in the asteroid belt. space force navigates the debris field.',
  5: '// 23:00 UTC\nenemy command has seized the mars colony. space force begins final assault on the mothership.',
  6: '2029.07.05 // 06:00 UTC\nspace force touches down on mars. ground assault begins.',
};

/** Milliseconds between each typed character. */
const TYPING_SPEED = 50;
/** Milliseconds to hold after typing completes before transitioning. */
const TYPING_HOLD_DURATION = 1500;

export interface GameManagerOptions {
  renderer?: GameRenderer;
  headless?: boolean;
}

/**
 * Orchestrates the game lifecycle, state transitions, and system updates.
 * Delegates gameplay logic to episode-specific engines.
 */
export class GameManager {
  readonly gameLoop: GameLoop;
  readonly stateManager: StateManager;
  readonly inputHandler: InputHandler;
  private renderer: GameRenderer | null;
  private headless: boolean;

  // Episode engines
  private episode1Engine: Episode1Engine;
  private episode2Engine: Episode2Engine;
  private activeEngine: EpisodeEngine;

  private introTimer = 0;
  private levelCompleteTimer = 0;
  private levelStatsTimer = 0;

  constructor(options: GameManagerOptions = {}) {
    this.headless = options.headless ?? false;
    this.renderer = options.renderer ?? null;
    this.stateManager = new StateManager();
    this.inputHandler = new InputHandler(this.headless);
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );

    // Create episode engines
    this.episode1Engine = new Episode1Engine(this.inputHandler);
    this.episode2Engine = new Episode2Engine(this.inputHandler);
    this.activeEngine = this.episode1Engine;

    // Tell renderer about the active engine
    if (this.renderer?.setActiveEngine) {
      this.renderer.setActiveEngine(this.activeEngine);
    }

    // Initialize background
    this.stateManager.currentState.background = createBackground();

    // Start menu music
    MusicManager.play('menu');
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

  /** Get the active episode engine (for renderer access). */
  getActiveEngine(): EpisodeEngine {
    return this.activeEngine;
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
        this.activeEngine.update(state, dtSeconds);
        break;
      case 'paused':
        this.updatePaused(state);
        break;
      case 'gameover':
        this.updateGameOver(state);
        break;
      case 'levelcomplete':
        this.updateLevelComplete(state);
        break;
      case 'levelintro':
        this.updateLevelIntro(state);
        break;
      case 'gamecomplete':
        this.updateGameComplete(state);
        break;
      case 'levelstats':
        this.updateLevelStats(state);
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

    // Level select submenu
    if (state.menu.type === 'levelselect') {
      const testCoop = state.menu.data?.testCoop === true;
      if (menuInput.back) {
        SoundManager.play('menuSelect');
        state.menu = {
          type: 'start',
          selectedOption: 0,
          options: this.getMainMenuOptions(),
        };
        return;
      }
      if (menuInput.confirm) {
        SoundManager.play('menuSelect');
        const selected = state.menu.options[state.menu.selectedOption];
        if (selected === 'Back') {
          state.menu = {
            type: 'start',
            selectedOption: 0,
            options: this.getMainMenuOptions(),
          };
        } else {
          // Extract level number from option (e.g. "Level 1: Invasion" → 1)
          const levelNum = parseInt(selected.split(':')[0].replace('Level ', ''), 10);
          state.gameMode = testCoop ? 'co-op' : 'single';
          // Determine episode from level number
          const episode = levelNum >= 6 ? 2 : 1;
          this.startGame(state, levelNum, episode);
        }
      }
      return;
    }

    // Player count selection submenu (Episode 1 / Episode 2)
    if (state.menu.type === 'playercount') {
      if (menuInput.back) {
        SoundManager.play('menuSelect');
        state.menu = {
          type: 'start',
          selectedOption: 0,
          options: this.getMainMenuOptions(),
        };
        return;
      }
      if (menuInput.confirm) {
        SoundManager.play('menuSelect');
        const selected = state.menu.options[state.menu.selectedOption];
        const pendingEpisode = state.menu.data?.pendingEpisode ?? 1;
        const startLevel = pendingEpisode === 2 ? 6 : 1;

        if (selected === '1 Player') {
          state.gameMode = 'single';
          this.startGame(state, startLevel, pendingEpisode);
        } else if (selected === '2 Players') {
          state.gameMode = 'co-op';
          this.startGame(state, startLevel, pendingEpisode);
        }
      }
      return;
    }

    // Difficulty selection submenu (only for test mode now)
    if (state.menu.type === 'difficulty') {
      if (menuInput.back) {
        SoundManager.play('menuSelect');
        state.menu = {
          type: 'start',
          selectedOption: 0,
          options: this.getMainMenuOptions(),
        };
        return;
      }
      if (menuInput.confirm) {
        SoundManager.play('menuSelect');
        const selected = state.menu.options[state.menu.selectedOption];
        state.difficulty = selected === 'Chaos' ? 'chaos' : 'normal';
        const pendingMode = state.menu.data?.pendingMode;
        if (pendingMode === 'test') {
          state.menu = {
            type: 'levelselect',
            selectedOption: 0,
            options: this.getLevelOptions(),
          };
        } else if (pendingMode === 'test-coop') {
          state.menu = {
            type: 'levelselect',
            selectedOption: 0,
            options: this.getLevelOptions(),
            data: { testCoop: true },
          };
        } else {
          this.startGame(state);
        }
      }
      return;
    }

    // Main menu
    if (menuInput.confirm) {
      SoundManager.play('menuSelect');
      const selected = state.menu.options[state.menu.selectedOption];
      if (selected === 'Episode 1 - The Invasion Begins') {
        state.menu = {
          type: 'playercount',
          selectedOption: 0,
          options: ['1 Player', '2 Players'],
          data: { pendingEpisode: 1 },
        };
      } else if (selected === 'Episode 2 - Martian Revolt') {
        state.menu = {
          type: 'playercount',
          selectedOption: 0,
          options: ['1 Player', '2 Players'],
          data: { pendingEpisode: 2 },
        };
      } else if (selected === 'Test Mode') {
        state.menu = {
          type: 'difficulty',
          selectedOption: 0,
          options: ['Normal', 'Chaos'],
          data: { pendingMode: 'test' },
        };
      } else if (selected === '2P Test Mode') {
        state.menu = {
          type: 'difficulty',
          selectedOption: 0,
          options: ['Normal', 'Chaos'],
          data: { pendingMode: 'test-coop' },
        };
      }
    }
  }

  private startGame(state: GameState, startLevel: number = 1, episode: 1 | 2 = 1): void {
    state.projectiles = [];
    state.episode = episode;

    // Select episode engine
    if (episode === 2) {
      this.activeEngine = this.episode2Engine;
    } else {
      this.activeEngine = this.episode1Engine;
    }

    // Notify renderer of engine change
    if (this.renderer?.setActiveEngine) {
      this.renderer.setActiveEngine(this.activeEngine);
    }

    if (episode === 2) {
      // Episode 2: create tank players
      if (state.gameMode === 'co-op') {
        state.players = [createTankPlayer('player1'), createTankPlayer('player2')];
      } else {
        state.players = [createTankPlayer('player1')];
      }
    } else {
      // Episode 1: create ship players
      if (state.gameMode === 'co-op') {
        const p1 = createPlayer('player1');
        p1.position.x = GAME_WIDTH * 0.33;
        const p2 = createPlayer('player2');
        p2.position.x = GAME_WIDTH * 0.66;
        state.players = [p1, p2];
      } else {
        state.players = [createPlayer('player1')];
      }
      this.episode1Engine.resetForLevelTransition();
    }

    this.startLevelIntro(state, startLevel);
  }

  /** Begin the level intro typing sequence, then transition to playing. */
  private startLevelIntro(state: GameState, level: number): void {
    const introText = LEVEL_INTRO_TEXT[level] ?? `level ${level}`;
    state.currentLevel = level;
    state.gameStatus = 'levelintro';
    state.menu = {
      type: 'levelintro',
      selectedOption: 0,
      options: [],
      data: {
        level,
        introText,
        introChars: 0,
      },
    };
    this.introTimer = 0;
  }

  /** Get main menu options. */
  private getMainMenuOptions(): string[] {
    return ['Episode 1 - The Invasion Begins', 'Episode 2 - Martian Revolt', 'Test Mode', '2P Test Mode'];
  }

  /** Build level select menu options from registered levels. */
  private getLevelOptions(): string[] {
    const options: string[] = [];
    for (let i = 1; this.episode1Engine.levelManager.hasLevel(i); i++) {
      options.push(`Level ${i}: ${this.episode1Engine.levelManager.getLevelName(i)}`);
    }
    // Episode 2 levels
    options.push('Level 6: Mars Landing');
    options.push('Back');
    return options;
  }

  private updatePaused(state: GameState): void {
    const menuInput = this.inputHandler.getMenuInput();
    if (!state.menu) return;

    // Escape resumes
    if (menuInput.back) {
      state.gameStatus = 'playing';
      state.menu = null;
      return;
    }

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
      if (selected === 'Resume') {
        state.gameStatus = 'playing';
        state.menu = null;
      } else if (selected === 'Main Menu') {
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        MusicManager.play('menu');
      }
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
        const episode = state.episode;
        const startLevel = episode === 2 ? 6 : 1;
        const mode = state.gameMode;
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        this.stateManager.currentState.gameMode = mode;
        this.startGame(this.stateManager.currentState, startLevel, episode);
      } else if (selected === 'Main Menu') {
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        MusicManager.play('menu');
      }
    }
  }

  private updateLevelComplete(state: GameState): void {
    // Handle any lingering death sequences
    for (const player of state.players) {
      if (player.deathSequence?.active) {
        const elapsed = state.currentTime - player.deathSequence.startTime;
        if (elapsed >= player.deathSequence.duration) {
          player.deathSequence.active = false;
        }
      }
    }

    // Check game over (player died during clearing phase or level complete)
    const anyDeathActive = state.players.some(p => p.deathSequence?.active);
    if (!anyDeathActive) {
      const alivePlayers = state.players.filter(p => p.isAlive || p.lives > 0);
      if (state.players.length > 0 && alivePlayers.length === 0) {
        this.checkGameOver(state);
        return;
      }
    }

    // Auto-advance to stats screen after 3 seconds
    this.levelCompleteTimer += state.deltaTime;
    if (this.levelCompleteTimer >= 3000) {
      const p1 = state.players.find(p => p.id === 'player1');
      const p2 = state.players.find(p => p.id === 'player2');
      state.gameStatus = 'levelstats';
      this.levelStatsTimer = 0;
      state.menu = {
        type: 'levelstats',
        selectedOption: 0,
        options: [],
        data: {
          level: state.currentLevel,
          finalScore: state.players.reduce((sum, p) => sum + p.score, 0),
          p1LevelStats: p1 ? { ...p1.levelStats } : undefined,
          p2LevelStats: p2 ? { ...p2.levelStats } : undefined,
        },
      };
    }

    // Update background during transition
    if (state.background) {
      updateBackground(state.background, state.deltaTime / 1000);
    }
  }

  private updateLevelStats(state: GameState): void {
    const menuInput = this.inputHandler.getMenuInput();
    this.levelStatsTimer += state.deltaTime;

    // Advance on confirm (after min delay) or timeout
    if ((menuInput.confirm && this.levelStatsTimer >= LEVEL_STATS_MIN_INPUT_DELAY) || this.levelStatsTimer >= LEVEL_STATS_TIMEOUT) {
      const nextLevel = state.currentLevel + 1;
      resetLevelStats(state.players);

      // Auto-respawn dead co-op players as reward for completing the level
      if (state.gameMode === 'co-op') {
        for (const player of state.players) {
          if (!player.isAlive && player.lives <= 0 && !player.deathSequence?.active) {
            player.lives = 1;
            respawnPlayer(player);
            SoundManager.play('respawnPickup');
          }
        }
      }

      // Return all alive players to starting positions for the new level
      if (state.episode !== 2) {
        for (const player of state.players) {
          if (!player.isAlive) continue;
          if (state.gameMode === 'co-op') {
            player.position = {
              x: player.id === 'player1' ? GAME_WIDTH * 0.33 : GAME_WIDTH * 0.66,
              y: GAME_HEIGHT - 60,
            };
          } else {
            player.position = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 };
          }
          player.velocity = { x: 0, y: 0 };
          player.isInvulnerable = true;
          player.invulnerabilityTimer = PLAYER_INVULNERABILITY_DURATION;
        }
      }
      // Episode 2 positions are set by onLevelStart

      state.enemies = [];
      state.projectiles = [];
      state.boss = null;
      state.lifePickups = [];
      state.respawnPickups = [];
      if (state.episode !== 2) {
        this.episode1Engine.resetForLevelTransition();
      }
      this.startLevelIntro(state, nextLevel);
    }

    // Update background during stats screen
    if (state.background) {
      updateBackground(state.background, state.deltaTime / 1000);
    }
  }

  private updateGameComplete(state: GameState): void {
    if (!state.menu?.data) return;
    const data = state.menu.data;
    const fullText = data.introText ?? '';
    const revealed = data.introChars ?? 0;

    this.introTimer += state.deltaTime;

    if (revealed < fullText.length) {
      const charsToReveal = Math.min(
        Math.floor(this.introTimer / TYPING_SPEED),
        fullText.length,
      );
      if (charsToReveal > revealed) {
        if (fullText[charsToReveal - 1] !== ' ') {
          SoundManager.play('typeKey');
        }
        state.menu = {
          ...state.menu,
          data: { ...data, introChars: charsToReveal },
        };
      }
    } else {
      const menuInput = this.inputHandler.getMenuInput();
      if (menuInput.confirm) {
        SoundManager.play('menuSelect');
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        MusicManager.play('menu');
      }
    }

    if (state.background) {
      updateBackground(state.background, state.deltaTime / 1000);
    }
  }

  private updateLevelIntro(state: GameState): void {
    if (!state.menu?.data) return;
    const data = state.menu.data;
    const fullText = data.introText ?? '';
    const revealed = data.introChars ?? 0;

    this.introTimer += state.deltaTime;

    if (revealed < fullText.length) {
      const charsToReveal = Math.min(
        Math.floor(this.introTimer / TYPING_SPEED),
        fullText.length,
      );
      if (charsToReveal > revealed) {
        if (fullText[charsToReveal - 1] !== ' ') {
          SoundManager.play('typeKey');
        }
        state.menu = {
          ...state.menu,
          data: { ...data, introChars: charsToReveal },
        };
      }
    } else {
      const holdStart = fullText.length * TYPING_SPEED;
      if (this.introTimer >= holdStart + TYPING_HOLD_DURATION) {
        state.gameStatus = 'playing';
        state.menu = null;
        MusicManager.play(('level' + (data.level ?? 1)) as import('../audio/MusicManager').MusicTrack);
        this.activeEngine.onLevelStart(state, data.level ?? 1);
      }
    }

    if (state.background) {
      updateBackground(state.background, state.deltaTime / 1000);
    }
  }

  private checkGameOver(state: GameState): void {
    const anyDeathSequenceActive = state.players.some(p => p.deathSequence?.active);
    if (anyDeathSequenceActive) return;

    const alivePlayers = state.players.filter(p => p.isAlive || p.lives > 0);
    if (state.players.length > 0 && alivePlayers.length === 0) {
      state.gameStatus = 'gameover';
      MusicManager.play('menu');
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
    MusicManager.stop();
    this.inputHandler.destroy();
    if (this.renderer) {
      this.renderer.destroy();
    }
  }
}
