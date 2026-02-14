import { describe, it, expect } from 'vitest';
import { GameManager } from './GameManager';

describe('GameManager', () => {
  describe('construction', () => {
    it('creates in headless mode', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().gameStatus).toBe('menu');
      gm.destroy();
    });

    it('starts on the menu screen', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().menu?.type).toBe('start');
      expect(gm.getState().menu?.options).toContain('Start Game');
      gm.destroy();
    });
  });

  describe('headless ticking', () => {
    it('advances time correctly', () => {
      const gm = new GameManager({ headless: true });
      gm.tickHeadless(60); // 1 second of game time
      const state = gm.getState();
      expect(state.currentTime).toBeGreaterThan(900);
      expect(state.currentTime).toBeLessThan(1100);
      gm.destroy();
    });

    it('swap occurs before mutations (previousState != currentState after tick)', () => {
      const gm = new GameManager({ headless: true });

      gm.tickHeadless(1);
      const current = gm.getState();
      const previous = gm.getPreviousState();

      // currentTime should differ: previous is from before the tick
      expect(current.currentTime).toBeGreaterThan(previous.currentTime);
      gm.destroy();
    });
  });

  describe('state transitions', () => {
    it('transitions from menu to playing on Start Game', () => {
      const gm = new GameManager({ headless: true });

      // Inject "confirm" to select Start Game
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().gameStatus).toBe('playing');
      expect(gm.getState().players).toHaveLength(1);
      expect(gm.getState().players[0].id).toBe('player1');
      gm.destroy();
    });

    it('navigates menu options with up/down', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().menu?.selectedOption).toBe(0);

      gm.inputHandler.injectMenuInput({ down: true });
      gm.tickHeadless(1);
      expect(gm.getState().menu?.selectedOption).toBe(1);

      gm.inputHandler.injectMenuInput({ up: true });
      gm.tickHeadless(1);
      expect(gm.getState().menu?.selectedOption).toBe(0);

      gm.destroy();
    });
  });

  describe('player movement', () => {
    function startGame(gm: GameManager): void {
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
    }

    it('moves player right on ArrowRight input', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const startX = gm.getState().players[0].position.x;
      gm.inputHandler.injectPlayerInput({ right: true });
      gm.tickHeadless(10);
      const endX = gm.getState().players[0].position.x;

      expect(endX).toBeGreaterThan(startX);
      gm.destroy();
    });

    it('moves player left on ArrowLeft input', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const startX = gm.getState().players[0].position.x;
      gm.inputHandler.injectPlayerInput({ left: true });
      gm.tickHeadless(10);
      const endX = gm.getState().players[0].position.x;

      expect(endX).toBeLessThan(startX);
      gm.destroy();
    });

    it('clamps player within game bounds', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Move far right
      gm.inputHandler.injectPlayerInput({ right: true });
      gm.tickHeadless(600);

      const pos = gm.getState().players[0].position;
      expect(pos.x).toBeLessThanOrEqual(784); // GAME_WIDTH - PLAYER_HALF_SIZE (800 - 16)
      expect(pos.x).toBeGreaterThanOrEqual(16); // PLAYER_HALF_SIZE
      gm.destroy();
    });
  });

  describe('invulnerability', () => {
    it('player starts invulnerable then becomes vulnerable', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().players[0].isInvulnerable).toBe(true);

      // Tick past invulnerability duration (2 seconds = ~120 ticks)
      gm.tickHeadless(130);
      expect(gm.getState().players[0].isInvulnerable).toBe(false);
      gm.destroy();
    });
  });

  describe('game over', () => {
    it('triggers game over when player has 0 lives and no active death sequence', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      // Manually set player state to dead with 0 lives (no death sequence)
      const player = gm.getState().players[0];
      player.lives = 0;
      player.isAlive = false;

      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('gameover');
      expect(gm.getState().menu?.type).toBe('gameover');
      gm.destroy();
    });

    it('delays game over during active death sequence', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      const player = gm.getState().players[0];
      player.lives = 0;
      player.isAlive = false;
      player.deathSequence = {
        active: true,
        startTime: gm.getState().currentTime,
        duration: 2000,
        position: { x: 400, y: 840 },
      };

      // Tick a few frames — should NOT be gameover yet
      gm.tickHeadless(10);
      expect(gm.getState().gameStatus).toBe('playing');

      // Tick past the 2-second death sequence (~120 ticks)
      gm.tickHeadless(130);
      expect(gm.getState().gameStatus).toBe('gameover');
      gm.destroy();
    });
  });

  describe('death sequence', () => {
    function startGame(gm: GameManager): void {
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
    }

    it('respawns player after death sequence with lives remaining', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const player = gm.getState().players[0];
      player.lives = 2;
      player.isAlive = false;
      player.health = 0;
      player.deathSequence = {
        active: true,
        startTime: gm.getState().currentTime,
        duration: 2000,
        position: { x: 400, y: 840 },
      };

      // Tick a few frames — should NOT respawn yet
      gm.tickHeadless(10);
      expect(player.isAlive).toBe(false);

      // Tick past 2 seconds
      gm.tickHeadless(130);
      expect(player.isAlive).toBe(true);
      expect(player.isInvulnerable).toBe(true);
      expect(player.deathSequence).toBe(null);
      gm.destroy();
    });

    it('does not process input during death sequence', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const player = gm.getState().players[0];
      const startX = player.position.x;
      player.lives = 2;
      player.isAlive = false;
      player.health = 0;
      player.deathSequence = {
        active: true,
        startTime: gm.getState().currentTime,
        duration: 2000,
        position: { x: startX, y: 840 },
      };

      gm.inputHandler.injectPlayerInput({ right: true });
      gm.tickHeadless(10);

      // Position should not change during death sequence
      // (player is dead so updatePlayerShip is skipped)
      expect(player.position.x).toBe(startX);
      gm.destroy();
    });
  });

  describe('performance', () => {
    it('runs 10,000 ticks in under 500ms (headless)', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      const start = performance.now();
      gm.tickHeadless(10000);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(500);
      gm.destroy();
    });
  });
});
