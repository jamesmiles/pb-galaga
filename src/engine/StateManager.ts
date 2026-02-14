import type { GameState, Player, Enemy, Projectile, Powerup, Star, FormationState, MenuState, BackgroundState } from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_START_LIVES, PLAYER_MAX_HEALTH,
  FORMATION_BASE_SPEED, FORMATION_CELL_WIDTH, FORMATION_CELL_HEIGHT,
  STAR_COUNT,
} from './constants';

/**
 * Double-buffered state manager with pre-allocated buffers and pointer swap.
 *
 * Two buffers (A and B) are allocated at construction. On each tick,
 * swapBuffers() swaps the pointers and copies previousState into currentState
 * as a starting point for mutations. This avoids structuredClone/deep copy.
 */
export class StateManager {
  private bufferA: GameState;
  private bufferB: GameState;

  /** The state being mutated this tick (post-swap). */
  currentState: GameState;
  /** The state from the previous tick (read-only during rendering). */
  previousState: GameState;

  constructor() {
    this.bufferA = createInitialState();
    this.bufferB = createInitialState();
    this.currentState = this.bufferA;
    this.previousState = this.bufferB;
  }

  /**
   * Swap buffers: previousState gets the last frame's final state,
   * currentState gets a shallow copy of previousState as a mutation starting point.
   *
   * MUST be called BEFORE mutations in each tick.
   */
  swapBuffers(): void {
    const temp = this.previousState;
    this.previousState = this.currentState;
    this.currentState = temp;
    copyStateInto(this.currentState, this.previousState);
  }

  reset(): void {
    this.bufferA = createInitialState();
    this.bufferB = createInitialState();
    this.currentState = this.bufferA;
    this.previousState = this.bufferB;
  }
}

/** Create a fresh initial game state. */
export function createInitialState(): GameState {
  return {
    currentTime: 0,
    deltaTime: 0,
    gameMode: 'single',
    gameStatus: 'menu',
    currentLevel: 1,
    currentWave: 1,
    waveStatus: 'transition',
    players: [],
    enemies: [],
    projectiles: [],
    powerups: [],
    background: { stars: [], scrollSpeed: 0 },
    formation: createInitialFormation(),
    menu: {
      type: 'start',
      selectedOption: 0,
      options: ['1 Player', '2 Players'],
    },
  };
}

function createInitialFormation(): FormationState {
  return {
    rows: 0,
    cols: 0,
    direction: 1,
    speed: FORMATION_BASE_SPEED,
    baseSpeed: FORMATION_BASE_SPEED,
    offsetX: 0,
    offsetY: 0,
    cellWidth: FORMATION_CELL_WIDTH,
    cellHeight: FORMATION_CELL_HEIGHT,
    standoffY: 0,
  };
}

/**
 * Shallow-copy all fields from source into target.
 * Arrays are copied by reference — the update functions must
 * create new array instances when adding/removing entities.
 *
 * This is O(1) per field, not O(n) per entity.
 */
export function copyStateInto(target: GameState, source: GameState): void {
  target.currentTime = source.currentTime;
  target.deltaTime = source.deltaTime;
  target.gameMode = source.gameMode;
  target.gameStatus = source.gameStatus;
  target.currentLevel = source.currentLevel;
  target.currentWave = source.currentWave;
  target.waveStatus = source.waveStatus;
  target.players = source.players;
  target.enemies = source.enemies;
  target.projectiles = source.projectiles;
  target.powerups = source.powerups;
  target.background = source.background;
  target.formation = source.formation;
  target.menu = source.menu;
}

/** Create a default player state. */
export function createPlayer(id: 'player1' | 'player2'): Player {
  return {
    id,
    shipColor: id === 'player1' ? 'red' : 'blue',
    position: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 60,
    },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    isAlive: true,
    isInvulnerable: true,
    invulnerabilityTimer: 2000,
    lives: PLAYER_START_LIVES,
    score: 0,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    fireMode: 'normal',
    fireCooldown: 0,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    input: { left: false, right: false, up: false, down: false, fire: false },
    deathSequence: null,
  };
}
