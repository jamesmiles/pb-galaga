import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Episode2Engine } from './Episode2Engine';
import { InputHandler } from './InputHandler';
import { createInitialState, createTankState, createTankPlayer } from './StateManager';
import type { GameState } from '../types';
import { TANK_MAX_ARMOUR } from './constants';

// Mock SoundManager + MusicManager
vi.mock('../audio/SoundManager', () => ({
  SoundManager: { play: vi.fn(), isMuted: () => false, toggleMute: () => false },
}));
vi.mock('../audio/MusicManager', () => ({
  MusicManager: { play: vi.fn(), stop: vi.fn(), onMuteChanged: vi.fn() },
}));

function makeCoOpState(): GameState {
  const state = createInitialState();
  state.episode = 2;
  state.gameMode = 'co-op';
  state.gameStatus = 'playing';
  state.currentLevel = 6;

  const p1 = createTankPlayer('player1');
  p1.isAlive = true;
  p1.position = { x: 400, y: 300 };

  const p2 = createTankPlayer('player2');
  p2.isAlive = true;
  p2.position = { x: 500, y: 300 };

  state.players = [p1, p2];
  state.tankStates = {
    player1: createTankState(),
    player2: createTankState(),
  };

  return state;
}

describe('Episode2Engine', () => {
  let engine: Episode2Engine;
  let inputHandler: InputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
    engine = new Episode2Engine(inputHandler);
  });

  describe('finish line (co-op)', () => {
    it('does not complete level when only one player reaches finish line', () => {
      const state = makeCoOpState();
      engine.onLevelStart(state, 6);

      // Move p1 past finish line, p2 stays behind
      state.players[0].position.y = state.map!.finishLineY - 10;
      state.players[1].position.y = state.map!.finishLineY + 200;

      engine.update(state, 0.016);

      expect(state.gameStatus).toBe('playing');
    });

    it('completes level when all alive players reach finish line', () => {
      const state = makeCoOpState();
      engine.onLevelStart(state, 6);

      // Move both players past finish line
      state.players[0].position.y = state.map!.finishLineY - 10;
      state.players[1].position.y = state.map!.finishLineY - 5;

      engine.update(state, 0.016);

      expect(state.gameStatus).toBe('levelcomplete');
    });

    it('completes level with one dead player when surviving player reaches finish', () => {
      const state = makeCoOpState();
      engine.onLevelStart(state, 6);

      // p2 is dead, only p1 needs to reach finish
      state.players[1].isAlive = false;
      state.players[0].position.y = state.map!.finishLineY - 10;

      engine.update(state, 0.016);

      expect(state.gameStatus).toBe('levelcomplete');
    });
  });

  describe('heart pickup (armour refill)', () => {
    it('refills player health to max when heart pickup collected', () => {
      const state = makeCoOpState();
      engine.onLevelStart(state, 6);

      // Reduce player health
      state.players[0].health = 100;

      // Create a heart (life pickup) at the player position
      state.lifePickups = [{
        id: 'life-test',
        position: { x: state.players[0].position.x, y: state.players[0].position.y },
        velocity: { x: 0, y: 0 },
        isActive: true,
        lifetime: 0,
      }];

      engine.update(state, 0.016);

      expect(state.players[0].health).toBe(TANK_MAX_ARMOUR);
      expect(state.lifePickups.filter(p => p.isActive).length).toBe(0);
    });

    it('increments powerupsCollected stat on collection', () => {
      const state = makeCoOpState();
      engine.onLevelStart(state, 6);

      state.players[0].health = 100;
      state.lifePickups = [{
        id: 'life-test',
        position: { x: state.players[0].position.x, y: state.players[0].position.y },
        velocity: { x: 0, y: 0 },
        isActive: true,
        lifetime: 0,
      }];

      const before = state.players[0].stats.powerupsCollected;
      engine.update(state, 0.016);

      expect(state.players[0].stats.powerupsCollected).toBe(before + 1);
    });
  });
});
