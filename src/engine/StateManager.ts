import type { GameState, Player, PlayerInput, BackgroundState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_START_LIVES, PLAYER_MAX_HEALTH } from './constants';

function createDefaultInput(): PlayerInput {
  return { left: false, right: false, up: false, down: false, fire: false };
}

function createDefaultPlayer(): Player {
  return {
    id: 'player1',
    shipColor: 'red',
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    isAlive: true,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    lives: PLAYER_START_LIVES,
    score: 0,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    fireMode: 'normal',
    fireCooldown: 0,
    powerupActive: null,
    powerupTimer: 0,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    input: createDefaultInput(),
  };
}

function createDefaultBackground(): BackgroundState {
  return { stars: [], scrollSpeed: 50 };
}

export function createInitialState(): GameState {
  return {
    currentTime: 0,
    deltaTime: 0,
    gameMode: 'single',
    gameStatus: 'menu',
    currentLevel: 1,
    currentWave: 0,
    waveStatus: 'transition',
    players: [createDefaultPlayer()],
    enemies: [],
    projectiles: [],
    powerups: [],
    background: createDefaultBackground(),
    menu: {
      type: 'start',
      selectedOption: 0,
      options: ['Start Game'],
    },
  };
}

/** Deep clone a GameState for buffer swapping. */
export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

export class StateManager {
  currentState: GameState;
  previousState: GameState;

  constructor() {
    this.currentState = createInitialState();
    this.previousState = cloneState(this.currentState);
  }

  /** Copy current into previous (called once per fixed update after all updates). */
  swapBuffers(): void {
    this.previousState = cloneState(this.currentState);
  }

  /** Reset to initial state. */
  reset(): void {
    this.currentState = createInitialState();
    this.previousState = cloneState(this.currentState);
  }

  /** Get interpolated position for rendering. */
  interpolateValue(prev: number, curr: number, alpha: number): number {
    return prev + (curr - prev) * alpha;
  }
}
