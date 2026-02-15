import type { GameState, GameRenderer } from '../types';
import { GAME_WIDTH, WAVE_COMPLETE_BONUS } from './constants';
import { GameLoop } from './GameLoop';
import { StateManager, createPlayer } from './StateManager';
import { InputHandler } from './InputHandler';
import { updatePlayerShip, respawnPlayer } from '../objects/player/code/PlayerShip';
import { spawnPlayerProjectiles, updateAllProjectiles } from '../objects/projectiles/laser/code/Laser';
import { updateFormation } from './FormationManager';
import { createBackground, updateBackground } from '../objects/environment/Background';
import { detectCollisions } from './CollisionDetector';
import { LevelManager } from './LevelManager';
import { EnemyFiringManager } from './EnemyFiringManager';
import { DiveManager } from './DiveManager';
import { updateFlightPaths } from './FlightPathManager';
import { SoundManager } from '../audio/SoundManager';
import { MusicManager } from '../audio/MusicManager';
import { AsteroidManager } from './AsteroidManager';
import { updateSecondaryTimer } from './WeaponManager';
import { WeaponPickupManager } from './WeaponPickupManager';
import { BossManager } from './BossManager';
import { LifePickupManager } from './LifePickupManager';
/** Intro text per level number. */
const LEVEL_INTRO_TEXT: Record<number, string> = {
  1: '2029.07.04 // 03:17 UTC\nfirst contact confirmed. space force scrambled to defend earth.',
  2: '// 07:45 UTC\nthe swarm has reached orbit. space force activates planetary defence grid.',
  3: '// 12:08 UTC\nenemy stronghold detected on the far side of the moon. space force moves to intercept.',
  4: '// 18:32 UTC\nhostile signatures in the asteroid belt. space force navigates the debris field.',
  5: '// 23:00 UTC\nenemy command has seized the mars colony. space force begins final assault on the mothership.',
};

/** Milliseconds between each typed character. */
const TYPING_SPEED = 50;
/** Milliseconds to hold after typing completes before transitioning. */
const TYPING_HOLD_DURATION = 1500;

import { level1 } from '../levels/level1';
import { level2 } from '../levels/level2';
import { level3 } from '../levels/level3';
import { level4 } from '../levels/level4';
import { level5 } from '../levels/level5';

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
  private asteroidManager: AsteroidManager;
  private weaponPickupManager: WeaponPickupManager;
  private bossManager: BossManager;
  private lifePickupManager: LifePickupManager;
  private introTimer = 0;

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
    this.levelManager.registerLevel(level2);
    this.levelManager.registerLevel(level3);
    this.levelManager.registerLevel(level4);
    this.levelManager.registerLevel(level5);
    this.enemyFiringManager = new EnemyFiringManager();
    this.diveManager = new DiveManager();
    this.asteroidManager = new AsteroidManager();
    this.weaponPickupManager = new WeaponPickupManager();
    this.bossManager = new BossManager();
    this.lifePickupManager = new LifePickupManager();

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
        this.updateLevelComplete(state);
        break;
      case 'levelintro':
        this.updateLevelIntro(state);
        break;
      case 'gamecomplete':
        this.updateGameComplete(state);
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
      if (menuInput.back) {
        SoundManager.play('menuSelect');
        state.menu = {
          type: 'start',
          selectedOption: 0,
          options: ['1 Player', '2 Players', 'Test Mode'],
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
            options: ['1 Player', '2 Players', 'Test Mode'],
          };
        } else {
          // Extract level number from option (e.g. "Level 1: Invasion" → 1)
          const levelNum = parseInt(selected.split(':')[0].replace('Level ', ''), 10);
          state.gameMode = 'single';
          this.startGame(state, levelNum);
        }
      }
      return;
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
      } else if (selected === 'Test Mode') {
        state.menu = {
          type: 'levelselect',
          selectedOption: 0,
          options: this.getLevelOptions(),
        };
      }
    }
  }

  private startGame(state: GameState, startLevel: number = 1): void {
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
    this.asteroidManager.reset();
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

  /** Build level select menu options from registered levels. */
  private getLevelOptions(): string[] {
    const options: string[] = [];
    for (let i = 1; this.levelManager.hasLevel(i); i++) {
      options.push(`Level ${i}: ${this.levelManager.getLevelName(i)}`);
    }
    options.push('Back');
    return options;
  }

  private updatePlaying(state: GameState, dtSeconds: number): void {
    // Check pause toggle (Escape key only — must not consume Space/arrows)
    if (this.inputHandler.getPauseToggle()) {
      state.gameStatus = 'paused';
      state.menu = {
        type: 'pause',
        selectedOption: 0,
        options: ['Resume', 'Main Menu'],
      };
      return;
    }

    // Check mute toggle
    if (this.inputHandler.getMuteToggle()) {
      const muted = SoundManager.toggleMute();
      MusicManager.onMuteChanged(muted);
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

    // 3. Update weapon timers and spawn projectiles
    for (const player of state.players) {
      if (player.deathSequence?.active) continue;
      updateSecondaryTimer(player, dtSeconds * 1000);
      if (player.secondaryCooldown > 0) {
        player.secondaryCooldown -= dtSeconds * 1000;
      }
    }
    const projCountBefore = state.projectiles.length;
    spawnPlayerProjectiles(state);
    const playerProjAdded = state.projectiles.length - projCountBefore;
    if (playerProjAdded > 0) SoundManager.play('playerFire');
    updateAllProjectiles(state, dtSeconds);

    // 4. Update enemy formation
    if (state.formation && state.enemies.length > 0) {
      updateFormation(state, dtSeconds);
    }

    // 4b. Update flight path entry animations
    updateFlightPaths(state, dtSeconds);

    // 5. Dive attacks
    this.diveManager.update(state, dtSeconds);

    // 6. Enemy firing
    const projCountBeforeEnemy = state.projectiles.length;
    this.enemyFiringManager.update(state, dtSeconds);
    if (state.projectiles.length > projCountBeforeEnemy) SoundManager.play('enemyFire');

    // 6b. Boss update
    this.bossManager.update(state, dtSeconds);

    // Check if boss health reached 0 and start death sequence
    if (state.boss?.isAlive && state.boss.health <= 0 && !state.boss.deathSequence) {
      this.bossManager.startDeathSequence(state.boss);
    }

    // 7. Update background, asteroids, weapon pickups, and life pickups
    if (state.background) {
      updateBackground(state.background, dtSeconds);
    }
    this.asteroidManager.update(state, dtSeconds * 1000);
    this.weaponPickupManager.updatePickups(state, dtSeconds * 1000);
    this.lifePickupManager.update(state, dtSeconds * 1000);

    // 8. Level/wave progression
    const waveStatusBefore = state.waveStatus;
    this.levelManager.update(state);

    // Detect wave completion (active → transition or clearing)
    if (waveStatusBefore === 'active' && state.waveStatus !== 'active') {
      // Award wave bonus to alive players
      for (const player of state.players) {
        if (player.isAlive) {
          player.score += WAVE_COMPLETE_BONUS;
        }
      }
    }

    // Detect clearing phase completing → level complete or game complete
    if (waveStatusBefore === 'clearing' && state.waveStatus === 'complete') {
      MusicManager.stop();
      const totalScore = state.players.reduce((sum, p) => sum + p.score, 0);
      const hasNextLevel = this.levelManager.hasLevel(state.currentLevel + 1);

      if (!hasNextLevel) {
        // Final level complete — game complete sequence
        const playerName = state.players.length > 1 ? 'space force' : 'space force';
        state.gameStatus = 'gamecomplete';
        this.introTimer = 0;
        state.menu = {
          type: 'gamecomplete',
          selectedOption: 0,
          options: ['Main Menu'],
          data: {
            finalScore: totalScore,
            introText: `mission complete // ${new Date().toISOString().slice(0, 10)}\n\nspace force has defeated the mothership.\n\nbut long range sensors detect survivors\nregrouping on the martian surface...\n\n... coming soon`,
            introChars: 0,
          },
        };
      } else {
        state.gameStatus = 'levelcomplete';
        state.menu = {
          type: 'levelcomplete',
          selectedOption: 0,
          options: ['Next Level', 'Main Menu'],
          data: { finalScore: totalScore, wave: state.currentWave, level: state.currentLevel },
        };
      }
      return;
    }

    // 9. Collision detection — track deaths for type-specific sounds
    const enemyAliveMap = new Map(state.enemies.map(e => [e.id, { alive: e.isAlive, type: e.type }]));
    const asteroidHealthMap = new Map(state.asteroids.map(a => [a.id, { alive: a.isAlive, health: a.health }]));
    const bossTurretAliveMap = state.boss ? new Map(state.boss.turrets.map(t => [t.id, t.isAlive])) : new Map<string, boolean>();
    const bossHealthBefore = state.boss?.health ?? 0;
    const lifePickupCountBefore = state.lifePickups.filter(p => p.isActive).length;
    const alivePlayersBefore = state.players.filter(p => p.isAlive).length;
    detectCollisions(state);
    // Life pickup sound
    const lifePickupCountAfter = state.lifePickups.filter(p => p.isActive).length;
    if (lifePickupCountAfter < lifePickupCountBefore) {
      SoundManager.play('lifePickup');
    }
    for (const enemy of state.enemies) {
      const before = enemyAliveMap.get(enemy.id);
      if (before?.alive && !enemy.isAlive) {
        const hitSound = `hit${enemy.type}` as import('../audio/SoundManager').SoundEffect;
        SoundManager.play(hitSound);
        // Maybe spawn a weapon pickup
        this.weaponPickupManager.maybeSpawnPickup(state, enemy.position);
      }
    }
    for (const asteroid of state.asteroids) {
      const before = asteroidHealthMap.get(asteroid.id);
      if (before && before.alive) {
        if (!asteroid.isAlive) {
          SoundManager.play('asteroidExplode');
        } else if (asteroid.health < before.health) {
          SoundManager.play('asteroidHit');
        }
      }
    }
    // Boss turret death sounds
    if (state.boss) {
      for (const turret of state.boss.turrets) {
        const wasBefore = bossTurretAliveMap.get(turret.id);
        if (wasBefore && !turret.isAlive) {
          SoundManager.play('bossExplosion');
        }
      }
      // Boss bridge hit sound
      if (state.boss.health < bossHealthBefore && state.boss.health > 0) {
        SoundManager.play('hitF');
      }
    }
    const alivePlayersAfter = state.players.filter(p => p.isAlive).length;
    if (alivePlayersAfter < alivePlayersBefore) {
      SoundManager.play('playerDeath');
      // Clear weapon powerups on death: reset to defaults, remove active pickups
      for (const player of state.players) {
        if (!player.isAlive && player.collisionState === 'destroyed') {
          player.primaryWeapon = 'laser';
          player.primaryLevel = 1;
          player.secondaryWeapon = null;
          player.secondaryTimer = 0;
          player.secondaryCooldown = 0;
        }
      }
      state.weaponPickups = [];
    }

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
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        this.startGame(this.stateManager.currentState);
      } else if (selected === 'Main Menu') {
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        MusicManager.play('menu');
      }
    }
  }

  private updateLevelComplete(state: GameState): void {
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
      if (selected === 'Next Level') {
        // Advance to next level — keep player scores and lives
        const nextLevel = state.currentLevel + 1;
        state.enemies = [];
        state.projectiles = [];
        state.boss = null;
        state.lifePickups = [];
        this.enemyFiringManager.reset();
        this.diveManager.reset();
        this.lifePickupManager.reset();
        this.startLevelIntro(state, nextLevel);
      } else if (selected === 'Main Menu') {
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        MusicManager.play('menu');
      }
    }
  }

  private updateGameComplete(state: GameState): void {
    if (!state.menu?.data) return;
    const data = state.menu.data;
    const fullText = data.introText ?? '';
    const revealed = data.introChars ?? 0;

    this.introTimer += state.deltaTime;

    if (revealed < fullText.length) {
      // Typing animation — same as level intro
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
      // Typing done — handle menu input
      const menuInput = this.inputHandler.getMenuInput();
      if (menuInput.confirm) {
        SoundManager.play('menuSelect');
        this.stateManager.reset();
        this.stateManager.currentState.background = createBackground();
        MusicManager.play('menu');
      }
    }

    // Update background during sequence
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
      // Type next character(s) based on elapsed time
      const charsToReveal = Math.min(
        Math.floor(this.introTimer / TYPING_SPEED),
        fullText.length,
      );
      if (charsToReveal > revealed) {
        // Play key sound for non-space characters
        if (fullText[charsToReveal - 1] !== ' ') {
          SoundManager.play('typeKey');
        }
        state.menu = {
          ...state.menu,
          data: { ...data, introChars: charsToReveal },
        };
      }
    } else {
      // All chars revealed — hold, then transition to playing
      const holdStart = fullText.length * TYPING_SPEED;
      if (this.introTimer >= holdStart + TYPING_HOLD_DURATION) {
        state.gameStatus = 'playing';
        state.menu = null;
        MusicManager.play(('level' + (data.level ?? 1)) as import('../audio/MusicManager').MusicTrack);
        this.levelManager.startLevel(state, data.level ?? 1);
      }
    }

    // Update background during intro
    if (state.background) {
      updateBackground(state.background, state.deltaTime / 1000);
    }
  }

  private checkGameOver(state: GameState): void {
    // Don't trigger gameover while any death sequence is still active
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

